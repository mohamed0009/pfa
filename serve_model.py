"""FastAPI service that serves the trained educational coach model."""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import List, Optional
import httpx

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"
PROCESSED_DIR = BASE_DIR / "processed_datasets"

logger = logging.getLogger("coach_api")
logging.basicConfig(level=logging.INFO)


def _latest_file(folder: Path, pattern: str) -> Path:
    files = sorted(folder.glob(pattern), key=lambda f: f.stat().st_mtime, reverse=True)
    if not files:
        raise FileNotFoundError(f"No files matching {pattern} found in {folder}")
    return files[0]


MODEL_PATH = _latest_file(MODEL_DIR, "*_model_*.joblib")
METADATA_PATH = _latest_file(MODEL_DIR, "*_metadata_*.json")
ARTIFACTS_PATH = _latest_file(PROCESSED_DIR, "preprocessing_artifacts_*.joblib")

logger.info("Loading model from %s", MODEL_PATH.name)
model = joblib.load(MODEL_PATH)
feature_metadata = json.loads(METADATA_PATH.read_text(encoding="utf-8"))
feature_names: List[str] = feature_metadata.get("feature_names", [])

logger.info("Loading preprocessing artifacts from %s", ARTIFACTS_PATH.name)
artifacts = joblib.load(ARTIFACTS_PATH)
label_encoders = artifacts["label_encoders"]
scalers = artifacts["scalers"]
vectorizer = artifacts["vectorizer"]

if vectorizer is None:
    raise RuntimeError("TF-IDF vectorizer missing from preprocessing artifacts.")


class PredictionRequest(BaseModel):
    question: str = Field(..., min_length=1, description="Learner question text")
    answer: Optional[str] = Field("", description="Reference answer or explanation")
    subject: Optional[str] = Field("unknown")
    topic: Optional[str] = Field("unknown")
    source: Optional[str] = Field("stack_exchange")
    difficulty_hint: Optional[str] = Field("unknown", description="Optional prior difficulty label")
    rating: Optional[float] = Field(4.0, ge=0, le=5)
    views: Optional[float] = Field(100.0, ge=0)
    votes: Optional[float] = Field(0.0)
    answers_count: Optional[float] = Field(0.0, ge=0)
    reputation: Optional[float] = Field(0.0, ge=0)
    year: Optional[float] = Field(2024.0)
    enrollment: Optional[float] = Field(0.0, ge=0)


class HybridResponse(BaseModel):
    response: str = Field(..., description="Combined AI coach response")
    predicted_difficulty: str = Field(..., description="Difficulty level from our model")
    confidence: float = Field(..., description="Confidence score from our model")
    source: str = Field(..., description="Response source attribution")


class PredictionResponse(BaseModel):
    predicted_difficulty: str
    confidence: float
    probabilities: List[float]
    labels: List[str]


app = FastAPI(
    title="Educational Coach Inference API",
    description="Serves the trained Gradient Boosting model for content difficulty recommendations.",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _encode_value(encoder, value: str) -> float:
    value = value or "unknown"
    if value not in encoder.classes_:
        encoder.classes_ = np.append(encoder.classes_, value)
    return float(encoder.transform([value])[0])


def _scale_value(scaler, value: float) -> float:
    return float(scaler.transform(np.array([[value]]))[0][0])


def _text_features(question: str, answer: str) -> dict:
    question = question or ""
    answer = answer or ""
    question_words = question.split()
    answer_words = answer.split()
    avg_q_word_len = (
        float(np.mean([len(w) for w in question_words])) if question_words else 0.0
    )
    return {
        "question_length": len(question),
        "question_word_count": len(question_words),
        "answer_length": len(answer),
        "answer_word_count": len(answer_words),
        "question_avg_word_length": avg_q_word_len,
    }


def _vectorize_text(question: str, answer: str) -> dict:
    text_blob = f"{question or ''} {answer or ''}".strip()
    tfidf_array = vectorizer.transform([text_blob]).toarray().ravel()
    return {f"tfidf_{idx}": float(value) for idx, value in enumerate(tfidf_array)}


def _preprocess_payload(payload: PredictionRequest) -> List[float]:
    base = {
        "question": payload.question.strip(),
        "answer": (payload.answer or "").strip(),
        "subject": payload.subject or "unknown",
        "topic": payload.topic or "unknown",
        "source": payload.source or "unknown",
        "difficulty": payload.difficulty_hint or "unknown",
        "rating": float(payload.rating or 0.0),
        "views": float(payload.views or 0.0),
        "votes": float(payload.votes or 0.0),
        "answers_count": float(payload.answers_count or 0.0),
        "reputation": float(payload.reputation or 0.0),
        "year": float(payload.year or 0.0),
        "enrollment": float(payload.enrollment or 0.0),
    }

    df = pd.DataFrame([base])
    df = df.assign(**_text_features(base["question"], base["answer"]))

    for col, encoder in label_encoders.items():
        if col in df.columns:
            df[f"{col}_encoded"] = _encode_value(encoder, df.at[0, col])

    for col, scaler in scalers.items():
        if col in df.columns:
            df[f"{col}_scaled"] = _scale_value(scaler, df.at[0, col])

    tfidf_features = _vectorize_text(base["question"], base["answer"])
    for key, value in tfidf_features.items():
        df[key] = value

    numeric_features = {
        column: float(df.at[0, column])
        for column in df.columns
        if isinstance(df.at[0, column], (int, float, np.floating, np.integer))
    }

    vector = [float(numeric_features.get(name, 0.0)) for name in feature_names]
    return vector


@app.get("/health")
def read_health():
    return {
        "status": "ok",
        "model": MODEL_PATH.name,
        "features": len(feature_names),
    }


@app.post("/coach/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    try:
        feature_vector = _preprocess_payload(request)
    except Exception as exc:  # pragma: no cover - defensive
        logger.exception("Failed to preprocess payload")
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    prediction = model.predict([feature_vector])[0]
    probabilities = model.predict_proba([feature_vector])[0].tolist()
    labels = model.classes_.tolist()

    confidence = float(
        probabilities[labels.index(prediction)] if prediction in labels else max(probabilities)
    )

    return PredictionResponse(
        predicted_difficulty=str(prediction),
        confidence=round(confidence, 4),
        probabilities=[round(p, 4) for p in probabilities],
        labels=labels,
    )


async def call_ollama(question: str, difficulty: str, confidence: float) -> str:
    """Call Ollama API for educational response with context."""
    max_retries = 2
    
    for attempt in range(max_retries):
        try:
            # Increased timeout for cold starts (60s)
            async with httpx.AsyncClient(timeout=60.0) as client:
                prompt = f"""You are an educational AI coach. A student asked: "{question}"

Based on analysis, this question is assessed as {difficulty} difficulty with {confidence:.1%} confidence.

Provide a helpful, educational response that:
1. Answers the question clearly
2. Matches the {difficulty} difficulty level
3. Is encouraging and supportive
4. Offers learning guidance appropriate for this level"""

                response = await client.post(
                    "http://localhost:11434/api/generate",
                    json={
                        "model": "qwen2.5:0.5b",
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.7,
                            "top_p": 0.9,
                            "max_tokens": 500
                        }
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result.get("response", "I'm here to help with your educational journey!")
                else:
                    logger.warning(f"Ollama API error: {response.status_code}")
                    # Don't retry client errors (4xx), only server errors (5xx)
                    if response.status_code < 500:
                         return f"I'd rate this as {difficulty} difficulty. Let me help you understand this topic better..."
                    
        except Exception as e:
            logger.warning(f"Attempt {attempt+1}/{max_retries} failed to call Ollama: {str(e)}")
            if attempt == max_retries - 1:
                logger.exception("All attempts to call Ollama failed")
                return f"Based on my analysis, this is a {difficulty} level question. I'm here to guide you through it!"
    
    return f"Based on my analysis, this is a {difficulty} level question. I'm here to guide you through it!"


@app.post("/coach/hybrid", response_model=HybridResponse)
async def hybrid_coach(request: PredictionRequest):
    """Combined endpoint: our model for difficulty + Ollama for response."""
    try:
        # Get difficulty prediction from our trained model
        feature_vector = _preprocess_payload(request)
        prediction = model.predict([feature_vector])[0]
        probabilities = model.predict_proba([feature_vector])[0].tolist()
        labels = model.classes_.tolist()
        confidence = float(
            probabilities[labels.index(prediction)] if prediction in labels else max(probabilities)
        )
        
        # Get educational response from Ollama
        ollama_response = await call_ollama(request.question, str(prediction), confidence)
        
        return HybridResponse(
            response=ollama_response,
            predicted_difficulty=str(prediction),
            confidence=round(confidence, 4),
            source="hybrid_ai_coach"
        )
        
        
    except Exception as exc:
        logger.exception("Failed to generate hybrid response")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/generate/quiz")
async def generate_quiz(topic: str, difficulty: str = "MOYEN", count: int = 3):
    """Generate quiz questions at a specific difficulty level using Ollama."""
    try:
        valid_difficulties = ["FACILE", "MOYEN", "DIFFICILE"]
        if difficulty.upper() not in valid_difficulties:
            difficulty = "MOYEN"
        
        difficulty = difficulty.upper()
        
        prompt = f"""Generate {count} multiple-choice quiz questions about {topic} at {difficulty} difficulty level.

Format each question as:
Q1: [Question]  
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
ANSWER: [A/B/C/D]

Generate all {count} questions:"""

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={"model": "qwen2.5:0.5b", "prompt": prompt, "stream": False}
            )
            
            if response.status_code == 200:
                return {
                    "topic": topic,
                    "difficulty": difficulty,
                    "quiz_content": response.json().get("response", ""),
                    "status": "success"
                }
            raise HTTPException(status_code=500, detail="Failed to generate quiz")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate/exercise")
async def generate_exercise(topic: str, difficulty: str = "MOYEN", count: int = 2):
    """Generate practical exercises at a specific difficulty level."""
    try:
        valid_difficulties = ["FACILE", "MOYEN", "DIFFICILE"]
        if difficulty.upper() not in valid_difficulties:
            difficulty = "MOYEN"
        
        difficulty = difficulty.upper()
        
        prompt = f"""Generate {count} programming exercises about {topic} at {difficulty} difficulty.

Format:
EXERCISE 1:
TITLE: [Title]
TASKS:
1. [Task 1]
2. [Task 2]""" 

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={"model": "qwen2.5:0.5b", "prompt": prompt, "stream": False}
            )
            
            if response.status_code == 200:
                return {
                    "topic": topic,
                    "difficulty": difficulty,
                    "exercise_content": response.json().get("response", ""),
                    "status": "success"
                }
            raise HTTPException(status_code=500, detail="Failed to generate exercises")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



if __name__ == "__main__":  # pragma: no cover
    import uvicorn

    uvicorn.run("serve_model:app", host="0.0.0.0", port=8000)
