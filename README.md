# LeBo - Legal Compliance & Data Protection Platform

An AI-powered compliance platform that helps teams interpret and implement DPDP Act 2023, GDPR, and IT Act privacy requirements through measurable reports and actionable fixes.

## What This Project Includes

- Conversational legal assistant with structured outputs.
- Rule-based compliance checker with a score and risk level.
- Policy analyzer that detects missing legal sections.
- AI-powered auto-fix and rewrite suggestions.
- Report persistence support via MongoDB (optional).

## Stack

- Frontend: React + Vite + Tailwind CSS + React Router + Axios
- Backend: Node.js + Express + Mongoose + Axios
- AI: OpenAI Chat Completions API or Google Gemini API
- Database: MongoDB (optional for demo mode)

## Project Structure

- `frontend` - React UI and feature pages
- `backend` - REST API, scoring logic, policy analyzer, AI helpers
- `.github/copilot-instructions.md` - setup checklist tracking

## Setup

1. Install root dependencies:
   ```bash
   npm install
   ```
2. Configure backend environment:
   - Copy `backend/.env.example` to `backend/.env`
   - Set `LLM_PROVIDER` to `openai` or `gemini`
   - Set provider key: `OPENAI_API_KEY` or `GEMINI_API_KEY`
   - Set `MONGODB_URI` (optional for report history)
3. Configure frontend environment:
   - Copy `frontend/.env.example` to `frontend/.env`

## Run in Development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Build

```bash
npm run build
```

## API Endpoints

- `GET /api/health`
- `GET /api/chat/status`
- `POST /api/chat`
- `POST /api/compliance/check`
- `POST /api/policy/analyze`
- `GET /api/reports`

## API Key Integration

1. Choose a provider in `backend/.env`.

   OpenAI:
   ```env
   LLM_PROVIDER=openai
   OPENAI_API_KEY=sk-your-real-key
   OPENAI_BASE_URL=https://api.openai.com/v1
   LLM_MODEL=gpt-4o-mini
   ```

   Gemini:
   ```env
   LLM_PROVIDER=gemini
   GEMINI_API_KEY=your-gemini-key
   GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
   LLM_MODEL=gemini-2.5-flash
   ```
2. Restart backend after changing env values.
3. Verify backend key wiring with:
   ```bash
   curl http://localhost:5000/api/chat/status
   ```
   Expected shape:
   ```json
   {
   "provider": "openai or gemini",
     "apiKeyConfigured": true
   }
   ```
4. Keep keys only in backend env. Do not add provider secrets to frontend `VITE_*` variables.

If `apiKeyConfigured` is `true` but chat still returns fallback content, check backend logs for TLS errors like `SELF_SIGNED_CERT_IN_CHAIN`.

- Preferred fix: set `LLM_CA_CERT_PATH` in `backend/.env` to your organization CA certificate file path.
- Dev-only fallback: set `LLM_ALLOW_SELF_SIGNED=true` (not recommended for production).

## Notes

- If no provider key is set, AI responses use deterministic fallback content.
- If no `MONGODB_URI` is set, the app still runs but report history is disabled.
