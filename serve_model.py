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
                prompt = f"""You are an educational AI coach. Answer directly and concisely without introductory phrases.

Student question: "{question}"

Difficulty level: {difficulty} (confidence: {confidence:.1%})

Instructions:
- Answer the question directly, start immediately with the explanation
- Do NOT use phrases like "Hello", "Welcome", "Let me help you", or similar greetings
- Be clear, educational, and match the {difficulty} difficulty level
- Provide practical examples and learning guidance
- Keep the response focused and helpful

Response:"""

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
                    raw_response = result.get("response", "")
                    
                    # Clean up common unwanted phrases
                    cleaned_response = raw_response
                    
                    # Remove common Qwen introduction phrases
                    unwanted_phrases = [
                        "Hello! Welcome to our Qwen, where we help you learn and grow.",
                        "Hello! Welcome to our Qwen",
                        "Welcome to our Qwen",
                        "Hello! Welcome",
                        "Welcome!",
                    ]
                    
                    for phrase in unwanted_phrases:
                        if phrase in cleaned_response:
                            cleaned_response = cleaned_response.replace(phrase, "").strip()
                            # Remove "The question" if it starts the response now
                            if cleaned_response.startswith("The question"):
                                cleaned_response = cleaned_response.replace("The question", "", 1).strip()
                            # Remove leading punctuation and capitalize first letter
                            if cleaned_response:
                                cleaned_response = cleaned_response.lstrip(".,;:!? ")
                                if cleaned_response:
                                    cleaned_response = cleaned_response[0].upper() + cleaned_response[1:]
                    
                    return cleaned_response if cleaned_response else "Je suis là pour vous aider avec votre question éducative."
                else:
                    logger.warning(f"Ollama API error: {response.status_code}")
                    # Don't retry client errors (4xx), only server errors (5xx)
                    if response.status_code < 500:
                         return f"I'd rate this as {difficulty} difficulty. Let me help you understand this topic better..."
                    
        except Exception as e:
            logger.warning(f"Attempt {attempt+1}/{max_retries} failed to call Ollama: {str(e)}")
            if attempt == max_retries - 1:
                logger.exception("All attempts to call Ollama failed")
                # Generate a more helpful fallback response
                fallback_responses = {
                    "beginner": f"Pour répondre à votre question '{question}', commençons par les bases. C'est une question de niveau débutant, parfaite pour bien comprendre les fondamentaux. Je vous recommande de commencer par les concepts de base et de pratiquer régulièrement. N'hésitez pas à me poser d'autres questions si vous avez besoin d'aide !",
                    "intermediate": f"Excellente question ! '{question}' est une question de niveau intermédiaire. Pour bien comprendre ce sujet, je vous suggère de revoir les concepts fondamentaux et de les appliquer dans des exercices pratiques. Continuez à pratiquer et vous progresserez rapidement !",
                    "advanced": f"Question intéressante ! '{question}' est une question de niveau avancé. Pour maîtriser ce sujet, je vous recommande d'approfondir les concepts complexes et de travailler sur des projets pratiques. N'hésitez pas à explorer différentes approches et à expérimenter !"
                }
                difficulty_lower = difficulty.lower()
                if difficulty_lower in fallback_responses:
                    return fallback_responses[difficulty_lower]
                return f"Basé sur mon analyse, c'est une question de niveau {difficulty}. Je suis là pour vous guider ! Pour répondre à '{question}', je vous recommande d'étudier les concepts fondamentaux, de pratiquer régulièrement et de ne pas hésiter à poser des questions. Bonne continuation dans votre apprentissage !"
    
    # Final fallback
    return f"Basé sur mon analyse, c'est une question de niveau {difficulty}. Je suis là pour vous guider ! Pour répondre à '{question}', je vous recommande d'étudier les concepts fondamentaux, de pratiquer régulièrement et de ne pas hésiter à poser des questions. Bonne continuation dans votre apprentissage !"


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



# ==================== MODÈLE DE NIVEAU D'ÉTUDIANT ====================

# Charger le modèle de niveau d'étudiant si disponible
STUDENT_LEVEL_MODEL_PATH = None
STUDENT_LEVEL_METADATA_PATH = None
STUDENT_LEVEL_ARTIFACTS_PATH = None
student_level_model = None
student_level_scaler = None
student_level_feature_names = None

try:
    STUDENT_LEVEL_MODEL_PATH = _latest_file(MODEL_DIR, "student_level_model_*.joblib")
    STUDENT_LEVEL_METADATA_PATH = _latest_file(MODEL_DIR, "student_level_metadata_*.json")
    STUDENT_LEVEL_ARTIFACTS_PATH = _latest_file(PROCESSED_DIR, "student_level_preprocessing_*.joblib")
    
    logger.info("Loading student level model from %s", STUDENT_LEVEL_MODEL_PATH.name)
    student_level_model = joblib.load(STUDENT_LEVEL_MODEL_PATH)
    
    with open(STUDENT_LEVEL_METADATA_PATH, 'r', encoding='utf-8') as f:
        student_level_metadata = json.loads(f.read())
    student_level_feature_names = student_level_metadata.get("feature_names", [])
    
    logger.info("Loading student level preprocessing artifacts from %s", STUDENT_LEVEL_ARTIFACTS_PATH.name)
    student_level_artifacts = joblib.load(STUDENT_LEVEL_ARTIFACTS_PATH)
    student_level_scaler = student_level_artifacts.get("scaler")
    
    logger.info("Student level model loaded successfully")
except FileNotFoundError:
    logger.warning("Student level model not found. Run train_student_level_model.py first.")


class StudentLevelRequest(BaseModel):
    total_conversations: float = Field(0, ge=0)
    total_messages: float = Field(0, ge=0)
    avg_messages_per_conversation: float = Field(0, ge=0)
    conversation_frequency: float = Field(0, ge=0)
    avg_message_length: float = Field(0, ge=0)
    avg_question_complexity: float = Field(0, ge=0)
    unique_topics_count: float = Field(0, ge=0)
    quiz_average_score: float = Field(0, ge=0, le=100)
    exercise_completion_rate: float = Field(0, ge=0, le=1)
    total_quizzes_taken: float = Field(0, ge=0)
    total_exercises_completed: float = Field(0, ge=0)
    days_active: float = Field(0, ge=0)
    avg_time_between_sessions: float = Field(0, ge=0)
    last_activity_days_ago: float = Field(0, ge=0)
    response_time_avg: float = Field(0, ge=0)
    follow_up_questions_rate: float = Field(0, ge=0, le=1)
    content_consumption_rate: float = Field(0, ge=0, le=1)


class StudentLevelResponse(BaseModel):
    predicted_level: str
    confidence: float
    probabilities: dict
    level_score: float


def _preprocess_student_features(request: StudentLevelRequest) -> List[float]:
    """Préprocesse les features d'un étudiant pour la prédiction"""
    if student_level_scaler is None or student_level_feature_names is None:
        raise RuntimeError("Student level model not loaded")
    
    # Créer un DataFrame avec les features
    features_dict = {
        'total_conversations': request.total_conversations,
        'total_messages': request.total_messages,
        'avg_messages_per_conversation': request.avg_messages_per_conversation,
        'conversation_frequency': request.conversation_frequency,
        'avg_message_length': request.avg_message_length,
        'avg_question_complexity': request.avg_question_complexity,
        'unique_topics_count': request.unique_topics_count,
        'quiz_average_score': request.quiz_average_score,
        'exercise_completion_rate': request.exercise_completion_rate,
        'total_quizzes_taken': request.total_quizzes_taken,
        'total_exercises_completed': request.total_exercises_completed,
        'days_active': request.days_active,
        'avg_time_between_sessions': request.avg_time_between_sessions,
        'last_activity_days_ago': request.last_activity_days_ago,
        'response_time_avg': request.response_time_avg,
        'follow_up_questions_rate': request.follow_up_questions_rate,
        'content_consumption_rate': request.content_consumption_rate
    }
    
    df = pd.DataFrame([features_dict])
    
    # Normaliser avec le scaler
    df_scaled = pd.DataFrame(
        student_level_scaler.transform(df),
        columns=df.columns
    )
    
    # Créer le vecteur de features dans le bon ordre
    feature_vector = [float(df_scaled.at[0, name]) for name in student_level_feature_names]
    
    return feature_vector


@app.post("/student/level/predict", response_model=StudentLevelResponse)
def predict_student_level(request: StudentLevelRequest):
    """Prédit le niveau d'un étudiant en utilisant le modèle Gradient Boosting"""
    if student_level_model is None:
        raise HTTPException(
            status_code=503,
            detail="Student level model not available. Please train the model first."
        )
    
    try:
        feature_vector = _preprocess_student_features(request)
    except Exception as exc:
        logger.exception("Failed to preprocess student features")
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    
    # Prédiction
    prediction = student_level_model.predict([feature_vector])[0]
    probabilities = student_level_model.predict_proba([feature_vector])[0]
    labels = student_level_model.classes_.tolist()
    
    confidence = float(
        probabilities[labels.index(prediction)] if prediction in labels else max(probabilities)
    )
    
    # Calculer un score de niveau (0-300)
    level_scores = {
        'DEBUTANT': 25,
        'INTERMEDIAIRE': 100,
        'AVANCE': 225,
        'EXPERT': 300
    }
    level_score = level_scores.get(prediction, 0)
    
    # Créer un dictionnaire de probabilités
    prob_dict = {label: float(prob) for label, prob in zip(labels, probabilities)}
    
    return StudentLevelResponse(
        predicted_level=str(prediction),
        confidence=round(confidence, 4),
        probabilities=prob_dict,
        level_score=level_score
    )


# ==================== DÉTECTION DE TOPICS ====================

class TopicDetectionRequest(BaseModel):
    messages: List[str] = Field(..., description="List of user messages to analyze")


class TopicDetectionResponse(BaseModel):
    topics: dict = Field(..., description="Detected topics with their frequencies")
    dominant_topic: str = Field(..., description="Most frequently mentioned topic")
    specialty: str = Field(..., description="Detected specialty")


@app.post("/topics/detect", response_model=TopicDetectionResponse)
def detect_topics(request: TopicDetectionRequest):
    """Détecte les topics et spécialités dans les messages de l'utilisateur en analysant le contexte réel"""
    # Topics spécifiques avec leurs mots-clés (ordre important : plus spécifique en premier)
    topic_keywords = {
        "React": ["react", "jsx", "component", "hooks", "useState", "useEffect", "props", "state", "redux", "next.js"],
        "Vue": ["vue", "vue.js", "vuex", "nuxt", "composition api", "v-if", "v-for"],
        "Angular": ["angular", "typescript", "ng", "component", "service", "dependency injection", "rxjs"],
        "Java": ["java", "jvm", "spring", "hibernate", "maven", "gradle", "jdk", "jre", "servlet", "jsp", "jpa"],
        "Python": ["python", "django", "flask", "numpy", "pandas", "pytest", "pip", "virtualenv", "anaconda", "fastapi"],
        "JavaScript": ["javascript", "js", "node", "node.js", "npm", "express", "es6", "async", "await", "promise"],
        "TypeScript": ["typescript", "ts", "interface", "type", "generic", "decorator"],
        "Développement Web": ["html", "css", "web", "frontend", "backend", "api", "rest", "http", "https", "dom"],
        "Base de données": ["sql", "database", "mysql", "postgresql", "mongodb", "nosql", "oracle", "redis", "query"],
        "Algorithmes": ["algorithme", "algorithm", "structure", "complexité", "tri", "recherche", "graphe", "arbre", "bubble sort", "quick sort"],
        "OOP": ["oop", "object-oriented", "class", "inheritance", "polymorphism", "encapsulation", "abstraction", "interface"],
        "Machine Learning": ["machine learning", "ml", "neural network", "deep learning", "tensorflow", "keras", "pytorch", "scikit-learn"],
        "DevOps": ["docker", "kubernetes", "ci/cd", "jenkins", "git", "github", "gitlab", "deployment"]
    }
    
    topic_counts = {}
    topic_contexts = {}  # Stocker des extraits de contexte pour chaque topic
    
    # Analyser tous les messages
    for message in request.messages:
        message_lower = message.lower()
        message_original = message
        
        # Détecter chaque topic (ordre de priorité : plus spécifique d'abord)
        for topic, keywords in topic_keywords.items():
            for keyword in keywords:
                keyword_lower = keyword.lower()
                if keyword_lower in message_lower:
                    # Extraire un contexte autour du mot-clé (50 caractères avant et après)
                    keyword_pos = message_lower.find(keyword_lower)
                    start = max(0, keyword_pos - 50)
                    end = min(len(message), keyword_pos + len(keyword) + 50)
                    context = message_original[start:end].strip()
                    
                    if topic not in topic_contexts:
                        topic_contexts[topic] = []
                    topic_contexts[topic].append(context)
                    
                    topic_counts[topic] = topic_counts.get(topic, 0) + 1
                    break  # Compter une seule fois par message
    
    # Trouver le topic dominant (celui avec le plus de mentions)
    dominant_topic = max(topic_counts.items(), key=lambda x: x[1])[0] if topic_counts else "Général"
    
    # Mapper le topic à une spécialité de formation
    specialty_mapping = {
        "React": "React",
        "Vue": "Vue.js",
        "Angular": "Angular",
        "Java": "Java",
        "Python": "Python",
        "JavaScript": "JavaScript",
        "TypeScript": "TypeScript",
        "Développement Web": "Développement Web",
        "Base de données": "Bases de données",
        "Algorithmes": "Algorithmes et Structures de Données",
        "OOP": "Programmation Orientée Objet",
        "Machine Learning": "Machine Learning et Intelligence Artificielle",
        "DevOps": "DevOps et Déploiement",
        "Frontend": "Développement Frontend",
        "Backend": "Développement Backend"
    }
    
    specialty = specialty_mapping.get(dominant_topic, dominant_topic)
    
    # Ajouter les contextes au résultat pour référence
    response_data = {
        "topics": topic_counts,
        "dominant_topic": dominant_topic,
        "specialty": specialty
    }
    
    # Inclure les contextes si disponibles (limité à 3 par topic)
    if topic_contexts:
        response_data["contexts"] = {
            topic: contexts[:3] 
            for topic, contexts in topic_contexts.items() 
            if topic in topic_counts
        }
    
    return TopicDetectionResponse(
        topics=topic_counts,
        dominant_topic=dominant_topic,
        specialty=specialty
    )


if __name__ == "__main__":  # pragma: no cover
    import uvicorn

    uvicorn.run("serve_model:app", host="0.0.0.0", port=8000)
