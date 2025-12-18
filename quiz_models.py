from typing import List
from pydantic import BaseModel, Field

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: str
    explanation: str
    difficulty: str

class Exercise(BaseModel):
    title: str
    description: str
    tasks: List[str]
    difficulty: str
    estimated_time: int

class GenerateQuizRequest(BaseModel):
    topic: str = Field(..., description="Topic for quiz/exercise generation")
    difficulty: str = Field(..., description="Desired difficulty level: FACILE, MOYEN, or DIFFICILE")
    count: int = Field(3, ge=1, le=10, description="Number of questions/exercises to generate")
    type: str = Field("quiz", description="Type: 'quiz' or 'exercise'")

class QuizResponse(BaseModel):
    questions: List[QuizQuestion]
    topic: str
    difficulty: str

class ExerciseResponse(BaseModel):
    exercises: List[Exercise]
    topic: str
    difficulty: str
