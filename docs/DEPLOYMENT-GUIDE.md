# 🚀 Production Deployment Guide

Comprehensive instructions for deploying AegisVerify across multiple cloud providers and serverless environments.

---

## ☁️ 1. Cloudflare Pages & Functions (Recommended)

> 🌐 **Official Production Instance:** [https://aegisverify.pages.dev/](https://aegisverify.pages.dev/)

AegisVerify includes out-of-the-box configurations for Cloudflare Pages (`wrangler.toml`, `public/_headers`, `functions/api/[[route]].ts`).

### Via GitHub Integration:
1. Connect your repository to **Cloudflare Pages**.
2. Set Build Command: `npm run build`
3. Set Output Directory: `dist`
4. Set Node.js Version: `20+`
5. *(Optional)* Add `GEMINI_API_KEY` in Environment Variables.

### Via Wrangler CLI:
```bash
npm run build
npx wrangler pages deploy dist --project-name aegis-verify
```

---

## 🐳 2. Docker Container Deployment

Create a containerized deployment using the multi-stage build pattern:

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/server.ts ./server.ts

EXPOSE 3000
CMD ["npm", "run", "start"]
```

Build and run:
```bash
docker build -t aegis-verify:1.0.0 .
docker run -p 3000:3000 -e PORT=3000 aegis-verify:1.0.0
```

---

## ☁️ 3. Google Cloud Run

Deploy directly from source with automated scaling:

```bash
gcloud run deploy aegis-verify \
  --source . \
  --platform managed \
  --region europe-west2 \
  --allow-unauthenticated \
  --port 3000
```
