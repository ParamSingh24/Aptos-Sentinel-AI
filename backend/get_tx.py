import asyncio
from aptos_sdk.async_client import RestClient

async def main():
    client = RestClient("https://fullnode.devnet.aptoslabs.com/v1")
    try:
        txs = await client.get_transactions(limit=1)
        if txs:
            print(f"TX_HASH:{txs[0]['hash']}")
    finally:
        await client.close()

if __name__ == "__main__":
    asyncio.run(main())
