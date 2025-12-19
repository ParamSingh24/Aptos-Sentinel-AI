import asyncio
from aptos_sdk.async_client import RestClient

async def main():
    client = RestClient("https://fullnode.devnet.aptoslabs.com/v1")
    try:
        print("Fetching modules...")
        modules = await client.account_modules("0x1")
        print(f"Success. Modules count: {len(modules)}")
    except Exception as e:
        import traceback
        traceback.print_exc()
    finally:
        await client.close()

if __name__ == "__main__":
    asyncio.run(main())
