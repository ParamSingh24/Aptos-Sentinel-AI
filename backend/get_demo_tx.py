import asyncio
from aptos_sdk.async_client import RestClient

async def main():
    client = RestClient("https://fullnode.devnet.aptoslabs.com/v1")
    try:
        # Get recent transactions
        txs = await client.get_transactions(limit=2)
        if txs:
            # Print the hash of the first one
            print(f"LATEST_TX_HASH: {txs[0]['hash']}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await client.close()

if __name__ == "__main__":
    asyncio.run(main())
