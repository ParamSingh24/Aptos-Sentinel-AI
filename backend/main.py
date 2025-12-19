import os
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock setup removed. We enforce Real SDK.
try:
    from aptos_sdk.async_client import RestClient
    from aptos_sdk.transactions import EntryFunction, TransactionArgument
    NODE_URL = "https://fullnode.devnet.aptoslabs.com/v1"
    # client initialized in startup
except ImportError:
    # This should now crash if dependencies are missing, which is good for "Real" mode.
    raise ImportError("aptos_sdk not found. Please install requirements.txt")

client = None # Global placeholder

# Gemini Setup
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("WARNING: GEMINI_API_KEY not found. AI Audit will return mock data.")

class AuditRequest(BaseModel):
    target: str # Address or Transaction Hash
    type: str # "address" or "transaction"

class SimulationRequest(BaseModel):
    sender: str
    function_id: str
    type_args: list[str]
    args: list[str]

@app.on_event("startup")
async def startup_event():
    global client
    client = RestClient(NODE_URL)

@app.on_event("shutdown")
async def shutdown_event():
    if client:
        await client.close()

@app.get("/")
def read_root():
    return {"message": "Sentinel AI Auditor Online", "status": "active"}

@app.post("/api/audit")
async def audit_target(request: AuditRequest):
    """
    Audits a given target (Address or Transaction) using Gemini.
    """
    try:
        bytecode_context = ""
        
        if request.type == "address":
            # Fetch modules from address
            modules = await client.account_modules(request.target)
            extracts = []
            for module in modules:
                if 'abi' in module:
                    extracts.append(str(module['abi']))
            bytecode_context = "\n".join(extracts)
            
        elif request.type == "transaction":
            # Fetch transaction details
            tx = await client.transaction_by_hash(request.target)
            bytecode_context = str(tx)
        
        else:
            raise HTTPException(status_code=400, detail="Invalid audit type")

        if not bytecode_context:
            return {"status": "Safe", "reason": "No executable code found to analyze.", "risk_score": 0}

        # AI Analysis
        if GEMINI_API_KEY:
            model = genai.GenerativeModel('gemini-1.5-pro')
            prompt = f"""
            You are a Smart Contract Auditor for the Aptos Blockchain.
            Analyze the following Move Language context (ABI/Transaction) for security risks.
            Look specifically for:
            1. Rug-pull mechanisms (unauthorized withdrawals).
            2. Infinite mint loops.
            3. Suspicious logic.

            Context:
            {bytecode_context[:10000]} # Truncate to avoid limits

            Response Format (JSON):
            {{
                "status": "Safe" | "Risky",
                "risk_score": 0-100,
                "reason": "Brief explanation..."
            }}
            """
            response = model.generate_content(prompt)
            # Clean up response text to ensure JSON
            text = response.text.replace("```json", "").replace("```", "").strip()
            # Attempt to parse or return raw if failed? simpler to just return raw text if we rely on frontend parsing, but let's try to be clean.
            # actually our frontend expects JSON object, so we should rely on Gemini returning valid JSON or handle it.
            # sending text for now, frontend displays JSON.
            import json
            try:
                return json.loads(text)
            except:
                return {"status": "Unknown", "reason": text, "risk_score": 50}
        else:
            # Fallback if Key Missing logic - but we want Real.
             return {
                "status": "Safe", 
                "risk_score": 5, 
                "reason": "DEMO MODE: Gemini Key Missing. No real analysis performed."
            }

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/simulate")
async def simulate_transaction(request: SimulationRequest):
    """
    Simulates a transaction using AI prediction since we don't have user keys on backend.
    """
    try:
        # Fetch the module code to understand what the function does
        module_addr = request.function_id.split("::")[0]
        # function_name = request.function_id.split("::")[2] 
        
        modules = await client.account_modules(module_addr)
        # Find the specific module ABI
        abi_context = "Module not found"
        for module in modules:
            # Crude match
            if module['abi']['name'] == request.function_id.split("::")[1]:
                abi_context = str(module['abi'])
                break
        
        if GEMINI_API_KEY:
             model = genai.GenerativeModel('gemini-1.5-pro')
             prompt = f"""
             Predict the outcome of this Aptos Transaction Simulation.
             Function: {request.function_id}
             Args: {request.args}
             Type Args: {request.type_args}
             Sender: {request.sender}
             
             Module ABI:
             {abi_context}
             
             Predict:
             1. Will it succeed?
             2. What state changes might occur?
             3. Any security warnings?
             
             Response Format (JSON):
             {{
                 "simulation_result": "Success" | "Failure",
                 "gas_used": "Estimate (e.g. 2000)",
                 "status": "Predicted Status",
                 "changes": ["List of likely changes"],
                 "analysis": "Brief explanation"
             }}
             """
             response = model.generate_content(prompt)
             text = response.text.replace("```json", "").replace("```", "").strip()
             import json
             try:
                 return json.loads(text)
             except:
                  return {
                    "simulation_result": "Unknown", 
                    "status": "AI Parsing Failed",
                    "changes": ["Unknown"],
                    "analysis": text
                }
        else:
             return {
                "simulation_result": "Success", 
                "gas_used": 1500, 
                "status": "Executed successfully (Mock)",
                "changes": ["CoinStore modified", "Vault updated"]
            }

    except Exception as e:
        print(f"Simulate Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
