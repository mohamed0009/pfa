# Quiz & Exercise Generation by Difficulty Level

## Overview
Your Coach AI system can now **automatically generate quizzes and exercises** at specific difficulty levels (FACILE, MOYEN, DIFFICILE) using the Ollama LLM.

## Architecture

```
User Request → Backend → AI Engine (serve_model.py) → Ollama (Qwen 2.5) → Generated Content
                                ↑
                        Difficulty Level (FACILE/MOYEN/DIFFICILE)
```

## New API Endpoints

### 1. Generate Quiz Questions
**Endpoint:** `POST /generate/quiz`

**Parameters:**
- `topic` (required): Topic for the quiz (e.g., "Python", "Machine Learning", "Mathematics")
- `difficulty` (optional): FACILE, MOYEN, or DIFFICILE (default: MOYEN)
- `count` (optional): Number of questions (1-10, default: 3)

**Example Request:**
```bash
POST http://localhost:8000/generate/quiz?topic=Python&difficulty=FACILE&count=3
```

**Example Response:**
```json
{
  "topic": "Python",
  "difficulty": "FACILE",
  "quiz_content": "Q1: What is Python?\nA) A snake\nB) A programming language\nC) A database\nD) An operating system\nANSWER: B\n\n...",
  "status": "success"
}
```

### 2. Generate Exercises
**Endpoint:** `POST /generate/exercise`

**Parameters:**
- `topic` (required): Topic for exercises
- `difficulty` (optional): FACILE, MOYEN, or DIFFICILE (default: MOYEN)
- `count` (optional): Number of exercises (1-10, default: 2)

**Example Request:**
```bash
POST http://localhost:8000/generate/exercise?topic=JavaScript&difficulty=MOYEN&count=2
```

**Example Response:**
```json
{
  "topic": "JavaScript",
  "difficulty": "MOYEN",
  "exercise_content": "EXERCISE 1:\nTITLE: Create a Todo List App\nTASKS:\n1. Create HTML structure...\n\n...",
  "status": "success"
}
```

## Difficulty Levels Explained

### FACILE (Easy)
- Basic concepts
- Straightforward questions
- Simple tasks
- Clear instructions
- For beginners

### MOYEN (Medium)
- Intermediate concepts
- Requires understanding
- Moderate complexity
- Some problem-solving
- For intermediate learners

### DIFFICILE (Hard)
- Advanced concepts
- Complex scenarios
- Deep understanding required
- Creative solutions needed
- For advanced learners

## How It Works

1. **User specifies topic + difficulty**: E.g., "Python basics at FACILE level"
2. **AI Engine creates smart prompt**: Tailored to the difficulty level
3. **Ollama generates content**: Using Qwen 2.5 LLM
4. **Structured output returned**: Ready to display in frontend

## Integration with Frontend

To integrate in your Angular app:

```typescript
// In your service (e.g., ai-chat.service.ts)
generateQuiz(topic: string, difficulty: string = 'MOYEN', count: number = 3): Observable<any> {
  return this.http.post(`http://localhost:8000/generate/quiz`, null, {
    params: { topic, difficulty, count: count.toString() }
  });
}

generateExercise(topic: string, difficulty: string = 'MOYEN', count: number = 2): Observable<any> {
  return this.http.post(`http://localhost:8000/generate/exercise`, null, {
    params: { topic, difficulty, count: count.toString() }  
  });
}
```

## Benefits

✅ **Personalized Learning**: Content matches student's level
✅ **Scalable**: Generate unlimited quizzes/exercises on any topic
✅ **AI-Powered**: Uses advanced LLM for quality content
✅ **Adaptive**: Can adjust difficulty based on student performance
✅ **Time-Saving**: No manual quiz creation needed

## Next Steps

1. **Create Backend Endpoints**: Add Spring Boot controllers to call the AI engine
2. **Frontend UI**: Build quiz/exercise generation interface
3. **Student Assessment**: Use generated quizzes to evaluate students
4. **Adaptive Learning**: Automatically adjust difficulty based on performance

## Example Use Cases

- **Student Dashboard**: "Generate a quiz on Java at my current level"
- **Trainer Tools**: "Create 5 exercises for my class on Data Structures (DIFFICILE)"
- **Self-Study**: "Give me practice problems on React (MOYEN)"
- **Assessment**: Generate tests with mixed difficulty levels
