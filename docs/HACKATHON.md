# ReliefTrack — Hackathon Demo Guide & Pitch Summary

## Problem Statement
Traditional disaster and emergency relief platforms lack end-to-end financial transparency. Donors cannot verify whether their funds actually reached beneficiaries or were absorbed by administrative overhead.

## The ReliefTrack Solution
ReliefTrack provides state-driven, receipt-based tracking (`DR-YYYY-XXXXXX`) for emergency relief donations:
1. **End-to-End Tracking**: Every donor receives a tracking receipt showing a 10-step progress timeline from donation to aid delivery.
2. **High-Trust Evidence Capture**: NGO field officers capture proof of aid delivery directly using in-app camera hardware, Web Crypto SHA-256 hashing, and GPS position tagging.
3. **Confidentiality & Compliance**: Beneficiary PII and medical identity are protected in an encrypted Manager Vault, presenting anonymized verification badges publicly.
4. **Rule-Based Fraud Detection**: Automatic detection of duplicate document hashes, over-allocation attempts, and unverified NGO transactions.
5. **Multi-Chain Smart Contract**: Immutable on-chain anchoring on Ethereum Sepolia and Polygon Amoy testnets.

## Core Demo Workflow
1. Visit `http://localhost:3000/track/DR-2026-8F72K9` to view a live, state-driven donation tracking timeline.
2. Sign in as NGO (`/login` -> Demo NGO) to register beneficiaries, submit expenses, and capture in-app camera evidence.
3. Sign in as Manager (`/login` -> Demo Manager) to review verification queues, approve fund allocations, resolve fraud flags, and inspect the encrypted Verification Vault.
