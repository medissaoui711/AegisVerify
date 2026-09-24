# 🤝 Contributing to AegisVerify

We welcome contributions to improve AegisVerify! As a security-focused project, all pull requests must uphold strict security invariants.

---

## 🔒 Security Principles for Contributors

1. **Zero Secret Leakage**: Never commit API keys, tokens, or environment credentials.
2. **SSRF Boundary Preservation**: Any new network dispatch must route through the `validateSsrfAndAbuse` gatekeeper.
3. **Deterministic Score Integrity**: New risk indicators must specify category, severity, and deterministic weights.
4. **Advisory AI Isolation**: Never allow AI-generated output to override deterministic security scores or decisions.

---

## 🛠️ Local Development & Testing Workflow

```bash
# 1. Clone repository
git clone https://github.com/medissaoui711/AegisVerify.git
cd AegisVerify

# 2. Install dependencies
npm install

# 3. Run typecheck & linter
npm run lint

# 4. Run automated unit & security test suite
npm run test

# 5. Start dev server
npm run dev
```

---

## 📋 Pull Request Checklist

Before submitting a PR, verify that:
- [ ] `npm run lint` passes with 0 errors.
- [ ] `npm run test` executes all test suites with 100% pass rate.
- [ ] No regression in the 18/18 security audit matrix.
- [ ] Added unit tests for any new threat detection logic in `tests/`.
