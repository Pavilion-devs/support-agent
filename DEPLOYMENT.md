# 🚀 Deployment Guide - Support Orchestrator MCP

## Quick Answer: What to Push?

**Push EVERYTHING** (backend + website) to GitHub:
- ✅ Backend code (needed for deployment)
- ✅ Website code (for demo/showcase)
- ✅ README.md, docs.md
- ❌ `.env` files (NEVER push these - use environment variables in deployment platform)
- ❌ `node_modules/` (already in .gitignore)
- ❌ `*.db` files (SQLite databases)

---

## 📋 Pre-Deployment Checklist

- [x] Backend tested and working locally
- [x] Knowledge base integration working
- [x] Letta API key updated and working
- [ ] GitHub repository created
- [ ] `.gitignore` configured
- [ ] Environment variables documented

---

## Step 1: Prepare GitHub Repository

### 1.1 Create `.gitignore` (if missing)

```bash
# Create .gitignore in project root
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.*.local
backend/.env
website/.env

# Build outputs
dist/
build/
*.tsbuildinfo

# Database files
*.db
*.sqlite
*.sqlite3
backend/support.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/
server.log

# Test files
test-letta.ts
EOF
```

### 1.2 Push to GitHub

```bash
# Initialize git if not already done
cd /Users/favourolaboye/ambient
git init

# Add all files (gitignore will exclude sensitive files)
git add .

# Commit
git commit -m "Initial commit: Support Orchestrator MCP with Letta integration"

# Add remote (replace with your GitHub repo URL)
git remote add origin https://github.com/YOUR_USERNAME/support-orchestrator.git

# Push
git branch -M main
git push -u origin main
```

---

## Step 2: Choose Deployment Platform

**Recommended: Railway** (easiest) or **Render** (free tier)

### Option A: Railway (Recommended) ⭐

**Why Railway:**
- ✅ Free tier available
- ✅ Auto-deploys from GitHub
- ✅ Easy environment variable setup
- ✅ Automatic HTTPS
- ✅ Built-in PostgreSQL (if needed later)

### Option B: Render

**Why Render:**
- ✅ Free tier
- ✅ Auto-deploys from GitHub
- ✅ Good documentation

### Option C: Fly.io

**Why Fly.io:**
- ✅ Global edge deployment
- ✅ Good for MCP servers
- ⚠️ Slightly more complex setup

---

## Step 3: Deploy Backend to Railway

### 3.1 Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository

### 3.2 Configure Project

**Root Directory:** `backend`

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

**Port:** Railway auto-assigns `PORT` environment variable

### 3.3 Set Environment Variables

In Railway dashboard → Variables tab, add:

```
LETTA_API_KEY=sk-let-... (your key)
LETTA_BASE_URL=https://api.letta.com
OPENAI_API_KEY=sk-proj-... (your key)
PORT=3001
NODE_ENV=production
```

### 3.4 Deploy

Railway will:
1. Clone your repo
2. Install dependencies
3. Build TypeScript
4. Start the server
5. Give you a URL like: `https://your-app.railway.app`

**✅ Your API will be live at:** `https://your-app.railway.app/api`

---

## Step 4: Create HTTP MCP Endpoint

The current `mcp-server.ts` uses stdio (local only). We need an HTTP endpoint for Verisense.

### 4.1 Create HTTP MCP Wrapper

Create `backend/src/mcp-http.ts`:

```typescript
/**
 * HTTP MCP Server for Verisense Network
 * Exposes MCP tools via HTTP/HTTPS for remote access
 */

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import * as agent from './services/agent-stateless.js';
import * as knowledge from './services/knowledge.js';
import * as letta from './services/letta.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS - Allow Verisense network
app.use(cors({
  origin: '*', // In production, restrict to Verisense domains
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'support-orchestrator-mcp' });
});

// MCP Tools Endpoint
app.post('/mcp/tools', async (req, res) => {
  try {
    const { tool, arguments: args } = req.body;

    let result;

    switch (tool) {
      case 'process_support_ticket':
        result = await agent.processTicket(
          args.message,
          args.customer_email,
          args.subject
        );
        break;

      case 'classify_message':
        result = await agent.classifyOnly(args.message);
        break;

      case 'get_customer_insights':
        result = await letta.getCustomerContext(args.email);
        break;

      case 'add_knowledge':
        result = await knowledge.storeKnowledge({
          title: args.title,
          content: args.content,
          category: args.category,
          tags: args.tags || [],
        });
        break;

      case 'search_knowledge':
        result = await knowledge.searchKnowledge(args.query, args.limit || 5);
        break;

      default:
        return res.status(400).json({
          error: 'Unknown tool',
          available_tools: [
            'process_support_ticket',
            'classify_message',
            'get_customer_insights',
            'add_knowledge',
            'search_knowledge',
          ],
        });
    }

    res.json({
      success: true,
      tool,
      result,
    });
  } catch (error) {
    console.error('MCP tool error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// List available tools
app.get('/mcp/tools', (req, res) => {
  res.json({
    tools: [
      {
        name: 'process_support_ticket',
        description: 'Full AI pipeline: classify message, search knowledge, generate response',
        parameters: {
          message: 'string (required)',
          customer_email: 'string (required)',
          subject: 'string (optional)',
        },
      },
      {
        name: 'classify_message',
        description: 'Classify a support message without generating response',
        parameters: {
          message: 'string (required)',
        },
      },
      {
        name: 'get_customer_insights',
        description: 'Get customer history and context from Letta Memory',
        parameters: {
          email: 'string (required)',
        },
      },
      {
        name: 'add_knowledge',
        description: 'Add product documentation to knowledge base',
        parameters: {
          title: 'string (required)',
          content: 'string (required)',
          category: 'faq|pricing|features|policies|troubleshooting|general',
          tags: 'string[] (optional)',
        },
      },
      {
        name: 'search_knowledge',
        description: 'Search product knowledge base',
        parameters: {
          query: 'string (required)',
          limit: 'number (optional, default: 5)',
        },
      },
    ],
  });
});

app.listen(PORT, () => {
  console.log(`🚀 MCP HTTP Server running on port ${PORT}`);
  console.log(`📡 MCP Endpoint: http://localhost:${PORT}/mcp/tools`);
  console.log(`📋 Tools List: http://localhost:${PORT}/mcp/tools`);
});
```

### 4.2 Update package.json

Add script:
```json
"mcp-http": "tsx src/mcp-http.ts"
```

### 4.3 Test Locally

```bash
cd backend
npm run mcp-http
```

Test:
```bash
curl -X POST http://localhost:3001/mcp/tools \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "classify_message",
    "arguments": {
      "message": "I need help with billing"
    }
  }'
```

### 4.4 Update Railway Start Command

Change Railway start command to:
```bash
npm run mcp-http
```

Or keep using `npm start` if you update `index.ts` to include MCP routes.

---

## Step 5: Register on Verisense Network

### 5.1 Go to Verisense Dashboard

1. Visit: https://dashboard.verisense.network/
2. Sign up / Login
3. Navigate to "Register MCP" or "My MCPs"

### 5.2 Fill Registration Form

**MCP Name:** `Support Orchestrator`

**Description:**
```
Autonomous AI-powered customer support agent that classifies messages, searches knowledge base, and generates personalized responses using OpenAI and Letta Memory.
```

**Endpoint URL:**
```
https://your-app.railway.app/mcp/tools
```

**Tools Available:**
- `process_support_ticket` - Full AI pipeline
- `classify_message` - Message classification
- `get_customer_insights` - Customer history lookup
- `add_knowledge` - Add to knowledge base
- `search_knowledge` - Search knowledge base

**Category:** `Customer Support` / `AI Agent`

**Tags:** `openai`, `letta`, `rag`, `customer-support`, `autonomous-agent`

### 5.3 Submit & Get Link

After submission, Verisense will:
1. Verify your endpoint
2. Generate a unique MCP link
3. Make it discoverable on the network

**✅ Your Verisense MCP Link:** `https://dashboard.verisense.network/mcp/YOUR_ID`

---

## Step 6: Verify Deployment

### 6.1 Test Health Endpoint

```bash
curl https://your-app.railway.app/health
```

Expected: `{"status":"healthy","service":"support-orchestrator-mcp"}`

### 6.2 Test MCP Tools Endpoint

```bash
curl -X POST https://your-app.railway.app/mcp/tools \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "classify_message",
    "arguments": {
      "message": "I forgot my password"
    }
  }'
```

### 6.3 Test from Verisense Dashboard

Use Verisense's test interface to verify all tools work.

---

## 🔧 Troubleshooting

### Issue: Environment Variables Not Loading

**Fix:** Ensure Railway has all env vars set, and restart the service.

### Issue: MCP Endpoint Returns 404

**Fix:** Check that `mcp-http.ts` is deployed and the route is `/mcp/tools`.

### Issue: Letta API Errors

**Fix:** Verify `LETTA_API_KEY` is correct and has proper permissions.

### Issue: Build Fails

**Fix:** Check Railway logs, ensure `tsconfig.json` is correct, and all dependencies are in `package.json`.

---

## 📝 Final Checklist

- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] Environment variables set
- [ ] Backend deployed and accessible
- [ ] HTTP MCP endpoint working
- [ ] Verisense registration completed
- [ ] MCP link received
- [ ] All tools tested via Verisense

---

## 🎯 Next Steps After Deployment

1. **Update README.md** with:
   - Deployment link
   - Verisense MCP link
   - Demo video link

2. **Create Demo Video** (2 minutes):
   - Show knowledge base upload
   - Create a ticket
   - Show AI processing
   - Show Verisense integration

3. **Submit to Hackathon:**
   - GitHub repo link
   - Demo video
   - Verisense MCP link

---

## 🆘 Need Help?

- Railway Docs: https://docs.railway.app
- Verisense Docs: https://docs.verisense.network
- MCP Spec: https://modelcontextprotocol.io

