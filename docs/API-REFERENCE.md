# 📖 AegisVerify API Reference

Complete OpenAPI-compliant documentation for AegisVerify's RESTful API endpoints.

---

## 1. Run Security Verification

Evaluate an email address, phone number, or URL against security indicators.

- **Method**: `POST`
- **Path**: `/api/verify`
- **Content-Type**: `application/json`

### Request Body Schema:
```json
{
  "input": "string (Required, max 2048 chars)",
  "type": "auto | email | phone | url (Optional, defaults to 'auto')",
  "bypassCache": "boolean (Optional, defaults to false)",
  "simulateRateLimit": "boolean (Optional, defaults to false)",
  "includeAiAnalysis": "boolean (Optional, defaults to true)"
}
```

### Success Response (`200 OK`):
```json
{
  "success": true,
  "requestId": "req_1727214560_a1b2c3",
  "report": {
    "id": "sec_1727214560_a1b2c3",
    "targetType": "email",
    "rawInput": "burner@mailinator.com",
    "normalizedValue": "burner@mailinator.com",
    "threatScore": 75,
    "threatLevel": "high",
    "status": "suspicious",
    "threatIndicators": [
      {
        "id": "ind-1",
        "category": "DISPOSABLE_MAIL",
        "severity": "high",
        "description": "Known temporary/burner email provider",
        "confidence": 0.95
      }
    ],
    "technicalDetails": {
      "formatValid": true,
      "disposable": true,
      "domain": "mailinator.com"
    },
    "recommendations": [
      {
        "id": "rec-1",
        "action": "Require Phone 2FA",
        "priority": "critical",
        "rationale": "Disposable addresses are frequently abused for fraudulent account registration."
      }
    ],
    "aiAnalysis": {
      "summary": "Disposable burner email detected from Mailinator domain.",
      "socVerdict": "Enforce strict email verification or block registration.",
      "threatCategory": "Burner/Abuse",
      "recommendedActions": ["Reject account creation or demand SMS verification."]
    },
    "telemetry": {
      "cacheHit": false,
      "latencyMs": 85,
      "evaluatedAt": "2026-09-24T21:16:00.000Z",
      "requestId": "req_1727214560_a1b2c3"
    }
  }
}
```

### Rate Limited Response (`429 Too Many Requests`):
```json
{
  "success": false,
  "statusCode": 429,
  "error": "Rate limit exceeded. Maximum 15 requests per minute allowed.",
  "errorAr": "تم تجاوز حد الطلبات المسموح به. يُرجى الانتظار والمحاولة لاحقاً.",
  "retryAfter": 42,
  "requestId": "req_1727214560_x89y7z"
}
```

---

## 2. Execute Security Audit Suite

Run the full 18-test automated security and SSRF verification harness.

- **Method**: `GET`
- **Path**: `/api/audit/run`

### Response (`200 OK`):
```json
{
  "success": true,
  "requestId": "req_1727214560_audit",
  "audit": {
    "totalTests": 18,
    "passedTests": 18,
    "failedTests": 0,
    "successRatePercent": 100,
    "totalDurationMs": 240,
    "executedAt": "2026-09-24T21:16:00.000Z",
    "results": [...]
  }
}
```

---

## 3. Cache Telemetry & Stats

Inspect the state of the in-memory 24-hour LRU cache.

- **Method**: `GET`
- **Path**: `/api/cache/stats`

### Response (`200 OK`):
```json
{
  "success": true,
  "requestId": "req_1727214560_cache",
  "stats": {
    "size": 42,
    "maxSize": 1000,
    "hits": 18,
    "misses": 54,
    "hitRatio": 0.25,
    "ttlSeconds": 86400
  }
}
```

---

## 4. Clear Cache

Purge all entries from the in-memory cache.

- **Method**: `POST`
- **Path**: `/api/cache/clear`

### Response (`200 OK`):
```json
{
  "success": true,
  "requestId": "req_1727214560_clear",
  "message": "Cache cleared successfully"
}
```

---

## 5. Health Check

Service liveness and readiness probe.

- **Method**: `GET`
- **Path**: `/api/health`

### Response (`200 OK`):
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptimeSeconds": 3600,
  "timestamp": "2026-09-24T21:16:00.000Z"
}
```
