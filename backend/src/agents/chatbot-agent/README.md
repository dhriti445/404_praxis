# Chatbot Agent

Handles conversational legal assistance and Q&A for DPDP, GDPR, and IT Act compliance.

## Endpoints

- `GET /api/chat/status` - Check AI provider status and API key configuration
- `GET /api/chat/history` - Retrieve latest saved chat conversation
- `POST /api/chat` - Send a message and get legal guidance response

## Responsibilities

- Conversational Q&A using configured AI provider (OpenAI/Gemini)
- Simple explanation generation for legal/compliance topics
- Risk/action identification from user questions
- Chat history persistence via reportStore

## Input

```json
{
  "message": "How do I handle user data deletion requests?",
  "history": []
}
```

## Output

```json
{
  "reply": {
    "directAnswer": "Allow users to delete their data within 30 days.",
    "simpleExplanation": "Users have the right to erasure under DPDP...",
    "potentialRisks": ["Non-compliance penalty"],
    "actionChecklist": ["Implement deletion workflow"]
  }
}
```
