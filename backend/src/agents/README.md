# LeBo Agents

Three independent, specialized agents for comprehensive compliance and policy management.

## 🤖 Agent Architecture

### 1. Chatbot Agent
**Purpose:** Conversational legal guidance
- Endpoints: `/api/chat/*`
- Handles: Q&A, chat history, provider status
- Input: User question + chat history
- Output: Structured legal response with risks and actions

### 2. Compliance Agent
**Purpose:** Role-based compliance evaluation
- Endpoints: `/api/compliance/*`
- Handles: Developer/Startup/Company mode assessment
- Input: Role, compliance form (optional), control answers
- Output: Score, violations, fixes, policy recommendations

### 3. Policy Agent
**Purpose:** Policy analysis and improvement
- Endpoints: `/api/policy/*`
- Handles: Policy text scoring, rewriting, gap detection
- Input: Policy document text
- Output: Score, missing sections, rewritten policy

## 🏗️ Agent Structure

Each agent is self-contained:
```
agents/
├── chatbot-agent/
│   ├── index.js
│   ├── routes.js
│   └── README.md
├── compliance-agent/
│   ├── index.js
│   ├── routes.js
│   └── README.md
└── policy-agent/
    ├── index.js
    ├── routes.js
    └── README.md
```

## 📡 Shared Services

All agents access shared services:
- `aiService.js` - AI provider orchestration
- `reportStore.js` - Persistence layer
- `scoringService.js` - Compliance scoring
- `policyService.js` - Policy analysis logic

## 🚀 Usage

Agents are registered in `app.js`:
```javascript
import chatbotAgent from "./agents/chatbot-agent/index.js";
import complianceAgent from "./agents/compliance-agent/index.js";
import policyAgent from "./agents/policy-agent/index.js";

app.use("/api/chat", chatbotAgent.router);
app.use("/api/compliance", complianceAgent.router);
app.use("/api/policy", policyAgent.router);
```

## 📋 Benefits

- **Modularity:** Each agent is independent and testable
- **Scalability:** Agents can be deployed separately if needed
- **Maintainability:** Clear boundaries and single responsibility
- **Extensibility:** Easy to add new agents without affecting existing ones
