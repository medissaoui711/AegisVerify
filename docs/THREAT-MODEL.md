# 🛡️ AegisVerify Threat Model (STRIDE Analysis)

This document provides a formal STRIDE threat modeling analysis for AegisVerify, detailing evaluated threats, attacker incentives, and verified counter-measures.

---

## 🎯 STRIDE Threat Assessment

| Category | Threat Scenario | Impact | AegisVerify Counter-Measure |
| :--- | :--- | :--- | :--- |
| **Spoofing** | Attacker impersonates trusted domains using homoglyph or zero-width unicode chars (`pay\u200Bpal.com`). | High | Sanitization layer strips all zero-width characters and detects homoglyph/impersonation markers. |
| **Tampering** | Attacker injects null bytes (`\0`) to bypass extension or URI filters. | Medium | Sanitizer strips all null bytes and sanitizes URI path segments before evaluation. |
| **Repudiation** | Client disputes rate limiting or verification report timing. | Low | Every request generates a cryptographically random `X-Request-ID` and logs ISO timestamps. |
| **Information Disclosure** | SSRF to AWS/GCP IMDS (`169.254.169.254`) to exfiltrate IAM credentials / tokens. | **Critical** | SSRF engine rejects link-local metadata, loopbacks, and private RFC 1918 IPs before network dispatch. |
| **Denial of Service** | Flooding backend with verification requests to exhaust API quotas or CPU memory. | High | Sliding-window rate limiting (15 req/min per IP) returning HTTP 429 with `Retry-After` headers. |
| **Elevation of Privilege** | Prompt injection attacks against Gemini AI SOC to alter risk verdict to "Safe". | High | AI model is advisory-only. Deterministic risk engine computes the final verdict independently. |

---

## 🛑 Evaluated SSRF Bypass Vectors

AegisVerify's SSRF engine was verified against the following attack patterns:

1. **Standard Loopback**: `http://127.0.0.1/`, `http://localhost:8080/`
2. **Cloud Metadata IMDS**: `http://169.254.169.254/latest/meta-data/`
3. **Decimal DWORD Obfuscation**: `http://2130706433/` (`127.0.0.1` as integer)
4. **Hex / Octal Representation**: `http://0x7f.0x0.0x0.0x1/`, `http://0177.0.0.1/`
5. **Wildcard DNS Rebinding Reflectors**: `http://127.0.0.1.nip.io/`, `http://192.168.1.1.sslip.io/`
6. **IPv6 Mapped Addresses**: `http://[::ffff:127.0.0.1]/`, `http://[::1]/`
7. **RFC 1918 Subnets**:
   - Class A: `10.0.0.0/8`
   - Class B: `172.16.0.0/12`
   - Class C: `192.168.0.0/16`

---

## 🔍 Residual Risks & Documented Limitations

1. **Zero-Day Phishing Domains**: Newly registered domains (< 1 hour) without passive DNS reputation may return safe baselines.
2. **Single-Node Rate Limiter**: The in-memory sliding-window rate limiter is node-local; horizontally scaled multi-node clusters should employ a shared Redis or Cloudflare KV store.
