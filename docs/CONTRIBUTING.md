# Contributing Guidelines — ReliefTrack

Thank you for contributing to ReliefTrack! We welcome contributions that improve security, donor privacy, and Web3 performance.

---

## Code Quality Standards

1. **Strict TypeScript Mode**: All TypeScript files must use strict typing (`tsconfig.json`). Do not use `any` unless absolutely unavoidable.
2. **Financial Safety Rules**: Never perform direct floating point math for financial accounting. Always round to cents or use integer representation (`src/lib/utils/currency.ts`).
3. **Privacy Integrity**: Never log raw Aadhaar numbers, medical certificates, or personal phone numbers to public logs, audit entries, or smart contracts.
4. **Testing Requirements**: Run unit tests (`npm run test`) and contract tests (`npm run contract:test`) before submitting pull requests.

---

## Pull Request Checklist

- [ ] Ran `npm run lint` with 0 warnings.
- [ ] Ran `npm run typecheck` with 0 type errors.
- [ ] Added or updated unit tests for modified utilities.
- [ ] Verified that no secrets or private keys are present in code or commit history.
