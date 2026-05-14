const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

export class GeminiQuotaError extends Error {
  constructor(message = 'Gemini API rate limit reached. Please wait and try again.') {
    super(message);
    this.name = 'GeminiQuotaError';
  }
}

async function callGemini(systemInstruction, prompt, isJson = false) {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing Gemini API key in .env')
  }

  const body = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  }

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }]
    }
  }

  if (isJson) {
    body.generationConfig = {
      responseMimeType: 'application/json'
    }
  }

  let response
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
      }
    )
  } catch (error) {
    console.error('Fetch request failed:', error)
    throw new Error('Failed to generate AI response')
  }

  if (!response.ok) {
    console.log('Response status:', response.status)
    let errorJson
    try {
      errorJson = await response.json()
      console.log('Gemini error JSON:', errorJson)
    } catch (e) {
      const errorText = await response.text()
      console.log('Gemini error text:', errorText)
    }

    if (response.status === 429) {
      throw new GeminiQuotaError()
    }
    
    throw new Error('Failed to generate AI response')
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    throw new Error('Failed to generate AI response')
  }

  return isJson ? JSON.parse(text) : text
}

export async function generateNoteIntel(content) {
  if (!content || content.trim().length < 10) {
    throw new Error('Note content is too short to analyze.')
  }

  const systemInstruction = `You are an expert study assistant. Analyze the provided study notes and generate three things:
1. A concise, engaging summary paragraph.
2. A quiz with exactly 3 multiple-choice questions.
3. 5 flashcards with front and back.

Respond ONLY with a valid JSON object strictly matching this schema:
{
  "summary": "String paragraph",
  "quizQuestions": [
    {
      "id": "q1",
      "question": "String",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "Exact string of the correct option"
    }
  ],
  "flashcards": [
    {
      "id": "f1",
      "front": "String concept",
      "back": "String explanation"
    }
  ]
}`

  const prompt = `Here are the study notes:\n\n${content}`

  return await callGemini(systemInstruction, prompt, true)
}

export async function explainConcept(concept, context) {
  if (!concept) return ''
  const systemInstruction = `You are a friendly, encouraging tutor. Explain the following concept as simply as possible (ELI5), using an analogy if helpful.`
  const prompt = `Concept to explain: "${concept}"\nContext from my notes:\n"${context || 'None provided'}"\n\nPlease provide a short, clear, and easy-to-understand explanation in 2-3 paragraphs max.`

  return await callGemini(systemInstruction, prompt, false)
}

export async function generateStudyPlan(tasks) {
  if (!tasks || tasks.length === 0) {
    throw new Error('No open tasks available to generate a study plan.')
  }

  const systemInstruction = `You are a productivity expert. Given a list of a student's tasks, generate a highly effective daily study plan.
Group and order the tasks logically, breaking them into focused time blocks (durationMinutes).
Prioritize high-priority tasks and tasks with upcoming deadlines.

Respond ONLY with a valid JSON array strictly matching this schema:
[
  {
    "subject": "String (derive from task)",
    "topic": "String (specific task action)",
    "durationMinutes": Number (e.g. 25, 50, 90)
  }
]
`

  const prompt = `Here are my current open tasks:\n\n${JSON.stringify(tasks.map(t => ({ title: t.title, subject: t.subject, priority: t.priority, dueDate: t.dueDate })), null, 2)}`

  return await callGemini(systemInstruction, prompt, true)
}
