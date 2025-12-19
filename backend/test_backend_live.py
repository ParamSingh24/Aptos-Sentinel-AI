import requests
import time
import sys
import json

BASE_URL = "http://127.0.0.1:8000"

def wait_for_server():
    print("Waiting for server to start...")
    for _ in range(10):
        try:
            r = requests.get(f"{BASE_URL}/")
            if r.status_code == 200:
                print("Server is UP!")
                return True
        except requests.exceptions.ConnectionError:
            pass
        time.sleep(1)
    print("Server failed to start.")
    return False

def test_audit_endpoint():
    print("\n[TEST] Testing /api/audit endpoint...")
    # Using a known Aptos framework address (0x1) which should definitely exist on Devnet
    payload = {
        "target": "0x1",
        "type": "address"
    }
    try:
        r = requests.post(f"{BASE_URL}/api/audit", json=payload)
        print(f"Status Code: {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            print("Response Data (Truncated):", str(data)[:200])
            if "status" in data or "analysis" in data:
                 print("SUCCESS: Valid audit response received.")
            else:
                 print("WARNING: Unexpected response structure.")
        else:
            print(f"FAILED: Backend returned error: {r.text}")
    except Exception as e:
        print(f"FAILED: Exception during request: {e}")

def test_simulate_endpoint():
    print("\n[TEST] Testing /api/simulate endpoint...")
    # Mock simulation data
    payload = {
        "sender": "0x1",
        "function_id": "0x1::coin::transfer",
        "type_args": ["0x1::aptos_coin::AptosCoin"],
        "args": ["0x123", "100"]
    }
    try:
        r = requests.post(f"{BASE_URL}/api/simulate", json=payload)
        print(f"Status Code: {r.status_code}")
        if r.status_code == 200:
            print("Response:", r.json())
            print("SUCCESS: Simulation endpoint works.")
        else:
             print(f"FAILED: Backend returned error: {r.text}")
    except Exception as e:
         print(f"FAILED: Exception during request: {e}")

if __name__ == "__main__":
    if wait_for_server():
        test_audit_endpoint()
        test_simulate_endpoint()
        print("\n[SUMMARY] Backend verification complete.")
    else:
        sys.exit(1)
