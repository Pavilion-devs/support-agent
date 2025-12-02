# 🤖 Twisky - Autonomous Customer Support Orchestrator

> AI-powered customer support agent that fully automates support workflows using OpenAI and Letta Memory. Built for the Verisense Network hackathon.

[![Deployed on Render](https://img.shields.io/badge/Deployed-Render-46E3B7?style=flat-square)](https://support-agent-kn2n.onrender.com)
[![MCP Compatible](https://img.shields.io/badge/MCP-Verisense-FF6B6B?style=flat-square)](https://dashboard.verisense.network)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

## 🌟 Overview

Twisky is an autonomous AI agent that processes customer support tickets end-to-end without human intervention. It intelligently classifies messages, searches product knowledge bases, retrieves customer history, and generates personalized responses using OpenAI and Letta Memory.

### Key Features

- 🧠 **Intelligent Classification** - Automatically categorizes support messages by type, urgency, and sentiment
- 📚 **Knowledge Base Integration** - Searches product documentation using Letta Memory for accurate responses
- 👤 **Customer Context** - Retrieves customer history and preferences for personalized interactions
- 🚀 **Stateless MCP Design** - Fully compatible with Verisense Network for A2A (Agent-to-Agent) communication
- 📊 **Real-time Processing** - Complete ticket processing pipeline with detailed logging
- 🎯 **Zero Human Intervention** - Fully autonomous support ticket resolution

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Twisky MCP Server                     │
│              (Verisense Network Compatible)              │
└─────────────────────────────────────────────────────────┘
           │              │              │
           ▼              ▼              ▼
    [OpenAI API]   [Letta Memory]   [SQLite DB]
    Classification  Knowledge Base   Local Storage
    + Responses     + Customer       + Tickets
                    History
```

## 🛠️ Tech Stack

### Backend
- **Node.js** + **TypeScript** - Runtime and type safety
- **Express** - HTTP server and API endpoints
- **OpenAI API** - Message classification and response generation
- **Letta Memory** - Knowledge base and customer context storage
- **SQLite** - Local ticket storage and analytics
- **MCP SDK** - Model Context Protocol for Verisense integration

### Frontend
- **React** + **TypeScript** - UI framework
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key
- Letta API key

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Add your API keys to .env
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 🔧 Configuration

Create a `.env` file in the `backend` directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-...

# Letta Memory Configuration
LETTA_API_KEY=sk-let-...
LETTA_BASE_URL=https://api.letta.com

# Server Configuration
PORT=3001
NODE_ENV=development
```

## 🚀 Usage

### MCP Tools (Verisense Network)

Twisky exposes the following MCP tools:

#### 1. `process_support_ticket`
Full AI pipeline: classify → search knowledge → generate response

```json
{
  "message": "I forgot my password",
  "customer_email": "user@example.com",
  "subject": "Password Reset"
}
```

#### 2. `classify_message`
Classify a message without generating a response

```json
{
  "message": "I need help with billing"
}
```

#### 3. `get_customer_insights`
Get customer history from Letta Memory

```json
{
  "email": "user@example.com"
}
```

#### 4. `add_knowledge`
Add product documentation to knowledge base

```json
{
  "title": "Pricing Plans",
  "content": "Our Pro plan costs $99/month...",
  "category": "pricing",
  "tags": ["pricing", "plans"]
}
```

#### 5. `search_knowledge`
Search product knowledge base

```json
{
  "query": "password reset",
  "limit": 5
}
```

### REST API Endpoints

#### Create and Process Ticket
```bash
POST /api/tickets
Content-Type: application/json

{
  "message": "I need help with my account",
  "customer_email": "user@example.com",
  "subject": "Account Help"
}
```

#### List Tickets
```bash
GET /api/tickets
```

#### Get Ticket Details
```bash
GET /api/tickets/:id
```

#### Classify Message
```bash
POST /api/classify
Content-Type: application/json

{
  "message": "I forgot my password"
}
```

#### Knowledge Base Operations
```bash
# List knowledge documents
GET /api/knowledge

# Add knowledge document
POST /api/knowledge

# Search knowledge
POST /api/knowledge/search

# Install templates
POST /api/knowledge/templates/install
```

## 🌐 Deployment

### Render Deployment

1. Connect your GitHub repository to Render
2. Create a new **Web Service**
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Add environment variables
5. Deploy!

See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed instructions.

### Verisense Network Registration

1. Deploy to Render (or your preferred platform)
2. Go to [Verisense Dashboard](https://dashboard.verisense.network/)
3. Register your MCP with endpoint: `https://your-app.onrender.com/mcp`
4. Get your Verisense MCP link!

## 📊 Processing Pipeline

When a ticket is processed, Twisky follows this pipeline:

1. **Ticket Creation** - Initialize ticket record
2. **Memory Retrieval** - Search Letta Memory for customer history
3. **Knowledge Search** - Query product knowledge base
4. **Message Classification** - Analyze with OpenAI (category, urgency, sentiment)
5. **Response Generation** - Create personalized response using context
6. **Memory Storage** - Save interaction to Letta for future reference
7. **Local Storage** - Update SQLite database with ticket details

## 🎯 Use Cases

- **24/7 Customer Support** - Automated ticket processing
- **Knowledge Base Q&A** - Product documentation search
- **Customer Insights** - Historical interaction tracking
- **Multi-Agent Systems** - A2A compatible for agent orchestration
- **Support Analytics** - Ticket classification and sentiment analysis

## 📁 Project Structure

```
twisky/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── agent.ts           # Main processing pipeline
│   │   │   ├── agent-stateless.ts # Stateless MCP version
│   │   │   ├── openai.ts          # OpenAI integration
│   │   │   ├── letta.ts           # Letta Memory integration
│   │   │   └── knowledge.ts        # Knowledge base operations
│   │   ├── routes/
│   │   │   └── api.ts             # REST API endpoints
│   │   ├── db.ts                  # SQLite database
│   │   ├── index.ts               # Express server + MCP endpoints
│   │   └── mcp-server.ts          # MCP stdio server
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── DashboardCreate.tsx
│   │   │   ├── DashboardInbox.tsx
│   │   │   ├── DashboardTicket.tsx
│   │   │   ├── DashboardAnalytics.tsx
│   │   │   └── DashboardKnowledge.tsx
│   │   └── components/
│   └── package.json
└── README.md
```

## 🤝 Contributing

This project was built for the Verisense Network hackathon. Contributions and improvements are welcome!

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- **Verisense Network** - MCP platform and hackathon host
- **OpenAI** - GPT models for classification and generation
- **Letta** - Memory and knowledge base infrastructure
- **Render** - Deployment platform

## 🔗 Links

- **Live API:** https://support-agent-kn2n.onrender.com
- **GitHub:** https://github.com/Pavilion-devs/support-agent
- **Verisense Dashboard:** https://dashboard.verisense.network

## 📧 Contact

Built by **Pavilion** for the Verisense Network Hackathon

---

**Made with ❤️ for autonomous AI agents**

