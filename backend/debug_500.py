import asyncio
from aptos_sdk.async_client import RestClient

# The hash from the user's logs/demo
TARGET = "0x369367adebe9f71689859387ad3391e961fe2a43120"

async def main():
    client = RestClient("https://fullnode.devnet.aptoslabs.com/v1")
    print(f"Target: {TARGET}")
    print(f"Length: {len(TARGET)}")
    
    print("\n--- Attempting Transaction Fetch ---")
    try:
        tx = await client.transaction_by_hash(TARGET)
        print("Success! It is a transaction.")
    except Exception as e:
        print(f"Transaction Fetch Failed: {e}")

    print("\n--- Attempting Account Modules Fetch ---")
    try:
        modules = await client.account_modules(TARGET)
        print("Success! It is an account.")
    except Exception as e:
        print(f"Account Modules Fetch Failed: {e}")
        
    await client.close()

if __name__ == "__main__":
    asyncio.run(main())
