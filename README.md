# Sentinel AI: Aptos Transaction Auditor & Insurance Vault

**Sentinel AI** is a full-stack Aptos dApp designed to protect users from malicious transactions and secure their assets. It combines an AI-powered transaction auditor with an on-chain insurance vault.

## 🚀 Features

### 1. AI Transaction Auditor (Python Agent)
*   **Real-time Analysis**: Uses Gemini 1.5 Pro (via Python SDK) to analyze Move bytecode and transaction payloads.
*   **simulation-First**: Simulates transactions using the Aptos Simulation API before execution to detect anomalies.
*   **Security Checks**: Scans for rug-pull patterns, infinite loops, and unauthorized withdrawals.
*   **Cyberpunk UI**: A "90s Hacker" terminal interface for interacting with the auditor.

### 2. On-Chain Insurance Vault (Move Smart Contract)
*   **Fair Payouts**: Utilizes `aptos_framework::randomness` to determine claim validity on-chain, ensuring tamper-proof fairness.
*   **Staking**: Users stake `AptosCoin` to purchase insurance coverage.
*   **Automated Claims**: Smart contract logic handles payouts instantly upon valid random outcomes.

### 3. Aptos Keyless Integration
*   **Seamless Onboarding**: Users login using their Google Account (Aptos Keyless), eliminating the need for extension wallets for first-time users.

## 🛠️ Tech Stack

*   **Frontend**: React, Vite, TailwindCSS (Cyberpunk Theme)
*   **Backend**: Python, FastAPI, Aptos Python SDK, Google Gemini AI
*   **Smart Contract**: Move Language, Aptos Framework (Randomness)
*   **Network**: Aptos Devnet

## 📦 Installation & Setup

### Prerequisites
*   Node.js & npm
*   Python 3.11+
*   Aptos CLI

### 1. Clone & Install Frontend
```bash
cd sentinel-ai/frontend
npm install
npm run dev
```

### 2. Setup Backend Agent
```bash
cd sentinel-ai/backend
python -m venv venv
transaction\Scripts\activate # Windows
pip install -r requirements.txt
# Set GEMINI_API_KEY in .env
uvicorn main:app --reload
```

### 3. Deploy Smart Contract
```bash
cd sentinel-ai/move
aptos move compile
aptos move publish --named-addresses sentinel_ai=default
```

## 🛡️ Security Architecture

1.  **User initiates Audit**: Frontend sends target TX/Address to Python Backend.
2.  **Simulation**: Backend runs `aptos_sdk.client.simulate_transaction` to get expected state changes.
3.  **AI Analysis**: State changes and Bytecode are fed into Gemini LLM.
4.  **Risk Score**: User receives a "Safe" or "Risky" verdict before signing.

## 🎨 Theme
The UI follows a **Retro-Tech / Cyberpunk** aesthetic:
*   Primary Color: Neon Green `#39FF14`
*   Background: Deep Black `#0d0d0d`
*   Font: VT323 (Terminal Style)
