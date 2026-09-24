# 🏛️ AegisVerify Architecture & System Design

This document details the architectural principles, component interactions, trust boundaries, and data flow pipelines of AegisVerify v1.0.0.

---

## 📐 High-Level Overview

AegisVerify is designed as a **Stateless Security Verification Gateway & Threat Intelligence Micro-Tool**. Its primary objective is to evaluate untrusted identifiers (emails, phone numbers, and URLs) against multiple security indicators without exposing private API keys, risking Server-Side Request Forgery (SSRF), or allowing denial-of-service abuse.

```
+-----------------------------------------------------------------------------+
|                             UNTRUSTED CLIENT                                |
|             (Web UI / Mobile Client / Third-Party Integration)              |
+-------------------------------------+---------------------------------------+
                                      |
                                      | HTTPS POST /api/verify
                                      v
+-----------------------------------------------------------------------------+
|                     10-TIER HARDENED SECURITY GATEWAY                       |
|                                                                             |
|  [1. Schema & Length Guard]  -->  [2. Sanitization & Zero-Byte Stripping]  |
|               |                                      |                      |
|               v                                      v                      |
|  [3. SSRF & Abuse Gatekeeper] --> [4. Sliding-Window Rate Limiter]          |
|               |                                      |                      |
|               v                                      v                      |
|  [5. 24h In-Memory LRU Cache]                                               |
|               |                                                             |
|       +-------+-------+ (On Cache Miss)                                     |
|       |               |                                                     |
|       v               v                                                     |
|  [6. Email Adapter] [7. Phone Adapter] [8. URL Adapter]                     |
|       |               |                      |                              |
|       +---------------+----------------------+                              |
|                               |                                             |
|                               v                                             |
|             [9. Deterministic Risk Engine (0-100 Score)]                    |
|                               |                                             |
|                               v                                             |
|             [10. Isolated Advisory Gemini AI SOC]                           |
+-------------------------------+---------------------------------------------+
                                |
                                v
                Canonical SecurityReport (JSON Response)
```

---

## 🔒 Defense-in-Depth Trust Boundaries

AegisVerify establishes three distinct trust boundaries:

1. **Untrusted Boundary (Input Ingestion)**:
   - All client data is treated as malicious by default.
   - Enforced by Zod parsing, null-byte stripping (`\0`), zero-width character stripping (`\u200B`), and payload length guards (`<=2048` characters).

2. **Network Boundary (SSRF & Provider Protection)**:
   - Private networks (RFC 1918), loopback interfaces (`127.0.0.1`, `::1`), Cloud Metadata services (`169.254.169.254`), and Wildcard DNS rebinding domains (`*.nip.io`, `*.sslip.io`) are rejected **before** outbound network calls occur.
   - API keys and internal IPs are strictly isolated to the server runtime and never returned in error traces or client bundles.

3. **Decision Boundary (Deterministic vs. Advisory AI)**:
   - The security decision (Threat Score, Severity Level, Threat Indicators, and Sanitized Target) is computed **deterministically** via mathematical rules.
   - The AI layer (Gemini SOC) operates strictly as an **advisory overlay**. A model hallucination or prompt injection cannot override the underlying deterministic security decision.

---

## ⚡ Caching Strategy (Sub-5ms Latency)

- **Algorithm**: In-memory Least Recently Used (LRU) cache with 24-hour TTL and a maximum capacity of 1,000 entries.
- **Cache Key**: Deterministic SHA-256 hash derived from the canonical lowercase representation: `sha256(type + ":" + normalized_value)`.
- **Cache Bypass**: Clients can send `bypassCache: true` for live verification while observing sliding-window rate limits.

---

## 📊 Canonical Schema Output (`SecurityReport`)

Every verification response adheres to a strict canonical structure:

```json
{
  "id": "sec_1727214560000_a1b2c3",
  "targetType": "url",
  "rawInput": "https://example.com",
  "normalizedValue": "https://example.com/",
  "threatScore": 0,
  "threatLevel": "safe",
  "status": "valid",
  "threatIndicators": [],
  "technicalDetails": {},
  "recommendations": [],
  "aiAnalysis": {
    "summary": "...",
    "socVerdict": "...",
    "threatCategory": "None",
    "recommendedActions": []
  },
  "telemetry": {
    "cacheHit": false,
    "latencyMs": 142,
    "evaluatedAt": "2026-09-24T21:16:00.000Z",
    "requestId": "req_1727214560_x89y7z"
  }
}
```
