# 🚀 Render Deployment Guide - Support Orchestrator MCP

## What to Create on Render?

**Create a Web Service** (not Private Service)
- ✅ **Web Service** = Public HTTP endpoint (needed for Verisense)
- ❌ Private Service = Internal only (can't be accessed by Verisense)

---

## 📋 Prerequisites

- [x] Code pushed to GitHub: `https://github.com/Pavilion-devs/support-agent`
- [x] GitHub account connected to Render
- [ ] Render account (free tier works!)

---

## Step 1: Create Render Account

1. Go to **https://render.com**
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (recommended - easier deployment)
4. Authorize Render to access your GitHub repositories

---

## Step 2: Create New Web Service

### 2.1 Start New Service

1. In Render dashboard, click **"New +"** button (top right)
2. Select **"Web Service"**
3. You'll see: "Create a new web service from a Git repository"

### 2.2 Connect Repository

1. Click **"Connect account"** or **"Connect GitHub"** if not already connected
2. Authorize Render to access your repositories
3. Search for: `Pavilion-devs/support-agent`
4. Click **"Connect"** next to your repository

---

## Step 3: Configure Web Service

### 3.1 Basic Settings

**Name:**
```
support-orchestrator-mcp
```

**Region:**
```
Oregon (US West)  # or closest to you
```

**Branch:**
```
main
```

**Root Directory:**
```
backend
```
⚠️ **IMPORTANT:** This tells Render where your `package.json` is located.

**Runtime:**
```
Node
```

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

### 3.2 Instance Type

**Free Tier:**
- ✅ **Free** (512 MB RAM) - Perfect for MVP/demo
- Auto-sleeps after 15 min inactivity (wakes on request)

**Paid Tier (if needed):**
- Starter ($7/month) - Always on, 512 MB RAM
- Standard ($25/month) - Better performance

**For Hackathon Demo:** Free tier is fine! ✅

---

## Step 4: Environment Variables

Click **"Environment"** tab in Render dashboard, then add these:

### Required Variables

| Key | Value | Description |
|-----|-------|-------------|
| `LETTA_API_KEY` | `sk-let-...` | Your Letta API key |
| `LETTA_BASE_URL` | `https://api.letta.com` | Letta API base URL |
| `OPENAI_API_KEY` | `sk-proj-...` | Your OpenAI API key |
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `10000` | Port (Render auto-assigns, but set this) |

### How to Add:

1. Click **"Add Environment Variable"**
2. Enter **Key** and **Value**
3. Click **"Save Changes"**
4. Repeat for each variable

**⚠️ Security Note:** Never commit `.env` files to GitHub. Render environment variables are encrypted.

---

## Step 5: Deploy

### 5.1 Initial Deployment

1. Review all settings
2. Click **"Create Web Service"** at the bottom
3. Render will:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Build TypeScript (`npm run build`)
   - Start the server (`npm start`)
   - Assign a public URL

### 5.2 Watch Deployment Logs

You'll see real-time logs:
```
==> Cloning from https://github.com/Pavilion-devs/support-agent.git
==> Building...
==> Installing dependencies...
==> Building application...
==> Starting...
```

**Wait for:** `Your service is live at https://your-app.onrender.com`

---

## Step 6: Get Your Service URL

After deployment, Render gives you:

**Service URL:**
```
https://support-orchestrator-mcp.onrender.com
```

**Or custom domain** (if you set one up)

**✅ This is your MCP endpoint base URL!**

---

## Step 7: Verify Deployment

### 7.1 Health Check

```bash
curl https://support-orchestrator-mcp.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "support-orchestrator-mcp"
}
```

### 7.2 Test MCP Tools List

```bash
curl https://support-orchestrator-mcp.onrender.com/mcp/tools
```

**Expected Response:**
```json
{
  "success": true,
  "tools": [
    {
      "name": "process_support_ticket",
      "description": "Full AI pipeline...",
      ...
    }
  ]
}
```

### 7.3 Test MCP Tool Execution

```bash
curl -X POST https://support-orchestrator-mcp.onrender.com/mcp/tools \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "classify_message",
    "arguments": {
      "message": "I need help with billing"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "tool": "classify_message",
  "result": {
    "category": "billing",
    "urgency": "low",
    "sentiment": "neutral",
    ...
  }
}
```

---

## Step 8: Register on Verisense Network

### 8.1 Go to Verisense Dashboard

1. Visit: **https://dashboard.verisense.network/**
2. Sign up / Login
3. Navigate to **"Register MCP"** or **"My MCPs"** → **"Add New"**

### 8.2 Fill Registration Form

**MCP Name:**
```
Support Orchestrator
```

**Description:**
```
Autonomous AI-powered customer support agent that classifies messages, searches knowledge base using Letta Memory, and generates personalized responses using OpenAI. Fully stateless MCP for A2A compatibility.
```

**Endpoint URL:**
```
https://support-orchestrator-mcp.onrender.com/mcp/tools
```
⚠️ Use your actual Render URL from Step 6!

**Category:**
```
Customer Support
```

**Tags:**
```
openai, letta, rag, customer-support, autonomous-agent, mcp, a2a
```

**Tools Available:**
- `process_support_ticket` - Full AI pipeline (classify → knowledge → respond)
- `classify_message` - Message classification only
- `get_customer_insights` - Customer history from Letta Memory
- `add_knowledge` - Add to knowledge base
- `search_knowledge` - Search knowledge base

### 8.3 Submit & Verify

1. Click **"Submit"** or **"Register MCP"**
2. Verisense will verify your endpoint is accessible
3. If successful, you'll get a **Verisense MCP Link**

**✅ Your Verisense Link:**
```
https://dashboard.verisense.network/mcp/YOUR_UNIQUE_ID
```

---

## Step 9: Auto-Deploy Settings (Optional)

Render automatically redeploys when you push to GitHub!

### Enable Auto-Deploy:

1. Go to Render dashboard → Your service
2. Click **"Settings"** tab
3. Under **"Auto-Deploy"**, ensure:
   - ✅ **"Auto-Deploy"** is enabled
   - Branch: `main`

**Now:** Every `git push` → Auto-deploys to Render! 🚀

---

## 🔧 Troubleshooting

### Issue: Build Fails

**Error:** `npm run build` fails

**Fix:**
1. Check Render logs for specific error
2. Verify `tsconfig.json` is correct
3. Ensure all dependencies are in `package.json`
4. Check that `backend/` directory structure is correct

**Common Fix:**
```bash
# In Render logs, you might see:
# "Cannot find module './db.js'"

# Solution: Ensure all imports use .js extension
# Example: import * as db from './db.js';
```

### Issue: Service Crashes on Start

**Error:** Service starts then immediately stops

**Fix:**
1. Check **"Logs"** tab in Render
2. Look for error messages
3. Common issues:
   - Missing environment variables
   - Port binding error
   - Database initialization error

**Solution:**
- Verify all environment variables are set
- Check that `PORT` is set (Render uses `PORT` env var)
- Ensure `better-sqlite3` builds correctly (may need buildpack)

### Issue: 502 Bad Gateway

**Error:** Service returns 502 after deployment

**Fix:**
1. Service might be sleeping (free tier)
2. Wait 30 seconds for cold start
3. Check **"Events"** tab for service status
4. Verify service is **"Live"** (green status)

**Solution:**
- First request after sleep takes ~30 seconds
- Subsequent requests are fast
- Consider upgrading to Starter plan if needed for demo

### Issue: Environment Variables Not Loading

**Error:** `LETTA_API_KEY is undefined`

**Fix:**
1. Go to **"Environment"** tab
2. Verify all variables are set
3. Click **"Save Changes"** if you just added them
4. **Redeploy** service (Render → Manual Deploy)

### Issue: MCP Endpoint Returns 404

**Error:** `POST /mcp/tools` returns 404

**Fix:**
1. Verify route is in `backend/src/index.ts`
2. Check that code was pushed to GitHub
3. Check Render logs for startup errors
4. Ensure service is using latest code

**Verify Route:**
```bash
# Should see in logs:
# POST /mcp/tools
```

### Issue: Letta API Errors

**Error:** `Letta API error: 401`

**Fix:**
1. Verify `LETTA_API_KEY` is correct in Render environment
2. Check key hasn't expired
3. Ensure key has proper permissions
4. Test key locally first:
   ```bash
   curl -H "Authorization: Bearer YOUR_KEY" https://api.letta.com/v1/agents
   ```

---

## 📊 Render Dashboard Overview

### Key Tabs:

1. **"Logs"** - Real-time application logs
2. **"Metrics"** - CPU, Memory, Request metrics
3. **"Events"** - Deployment history
4. **"Settings"** - Configuration
5. **"Environment"** - Environment variables

### Useful Commands:

**Manual Deploy:**
- Settings → Manual Deploy → Deploy latest commit

**View Logs:**
- Logs tab → Real-time streaming

**Restart Service:**
- Settings → Restart

---

## 🎯 Quick Reference

### Your URLs:

**Render Service:**
```
https://support-orchestrator-mcp.onrender.com
```

**MCP Endpoint:**
```
https://support-orchestrator-mcp.onrender.com/mcp/tools
```

**Health Check:**
```
https://support-orchestrator-mcp.onrender.com/health
```

**API Endpoints:**
```
https://support-orchestrator-mcp.onrender.com/api/tickets
https://support-orchestrator-mcp.onrender.com/api/knowledge
```

### Test Commands:

```bash
# Health
curl https://support-orchestrator-mcp.onrender.com/health

# List MCP tools
curl https://support-orchestrator-mcp.onrender.com/mcp/tools

# Test classification
curl -X POST https://support-orchestrator-mcp.onrender.com/mcp/tools \
  -H "Content-Type: application/json" \
  -d '{"tool":"classify_message","arguments":{"message":"Help with billing"}}'
```

---

## ✅ Final Checklist

- [ ] Render account created
- [ ] Web Service created and configured
- [ ] Environment variables set
- [ ] Service deployed successfully
- [ ] Health endpoint working
- [ ] MCP tools endpoint working
- [ ] Tested tool execution
- [ ] Registered on Verisense
- [ ] Got Verisense MCP link
- [ ] Added link to README/submission

---

## 🚀 Next Steps After Deployment

1. **Update README.md** with:
   - Render deployment URL
   - Verisense MCP link
   - Demo video link

2. **Create Demo Video** (2 minutes):
   - Show knowledge base upload
   - Create ticket via UI
   - Show AI processing
   - Show Verisense integration

3. **Submit to Hackathon:**
   - GitHub repo: `https://github.com/Pavilion-devs/support-agent`
   - Demo video
   - Verisense MCP link

---

## 🆘 Need Help?

- **Render Docs:** https://render.com/docs
- **Render Status:** https://status.render.com
- **Verisense Docs:** https://docs.verisense.network
- **Support:** Check Render logs first, then contact support

---

## 💡 Pro Tips

1. **Free Tier Sleep:** First request after 15 min sleep takes ~30 seconds. For demo, keep service active by pinging `/health` every 10 minutes.

2. **Custom Domain:** Render allows custom domains (free). Use for professional demo.

3. **Environment Groups:** Create environment variable groups for dev/staging/prod.

4. **Monitoring:** Set up alerts in Render for service downtime.

5. **Logs Retention:** Free tier keeps logs for 7 days. Upgrade for longer retention.

---

**🎉 You're all set! Your MCP is now live and ready for Verisense registration!**

