# 🛡️ Production Security Hardening & Edge Policies

This document outlines the security headers, Content Security Policy (CSP), transport security (HSTS), and edge configurations enforced across AegisVerify.

---

## 🔐 HTTP Security Headers Breakdown

| Header | Production Value | Purpose & Rationale |
| :--- | :--- | :--- |
| **Strict-Transport-Security** | `max-age=63072000; includeSubDomains; preload` | Enforces 2-year HTTPS connections across all subdomains. |
| **X-Content-Type-Options** | `nosniff` | Prevents MIME-sniffing attacks. |
| **X-Frame-Options** | `SAMEORIGIN` | Mitigates clickjacking attacks. |
| **Referrer-Policy** | `strict-origin-when-cross-origin` | Strips path and query string parameters when navigating cross-origin. |
| **Permissions-Policy** | `camera=(), microphone=(), geolocation=(), payment=()` | Disables unnecessary browser capabilities. |

---

## 🛡️ Content Security Policy (CSP)

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'self' https:;
```

---

## 🚦 Sliding-Window Rate Limiting

- **Algorithm**: Sliding time-window algorithm.
- **Window Size**: 60,000 ms (1 minute).
- **Quota**: 15 requests per minute per IP address.
- **Header Response on Exhaustion**:
  - HTTP `429 Too Many Requests`
  - `Retry-After: <seconds>`
  - `X-RateLimit-Limit: 15`
  - `X-RateLimit-Remaining: 0`

---

## 🧪 Security Verification Evidence & Audit Runner

- **Live Production Endpoint:** [`GET /api/audit/run`](https://aegisverify.pages.dev/api/audit/run)
- **Verified Test Suite Execution:** [View High-Res Test Screenshot (Google Drive)](https://drive.google.com/file/d/1242nB7ynsNO_dzLOQWUBGR_jw66FgsZi/view?usp=drivesdk)

<div align="center">
  <img src="https://lh3.googleusercontent.com/d/1242nB7ynsNO_dzLOQWUBGR_jw66FgsZi" alt="AegisVerify Security Audit Verification Evidence" width="100%" />
</div>
