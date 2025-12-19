import aptos_sdk
import os
try:
    print(f"File: {aptos_sdk.__file__}")
except:
    print("No __file__")

print(f"Dir: {dir(aptos_sdk)}")

try:
    import aptos_sdk.client
    print("aptos_sdk.client exists")
except ImportError as e:
    print(f"aptos_sdk.client failed: {e}")

try:
    import aptos_sdk.rest_client
    print("aptos_sdk.rest_client exists")
except ImportError:
    print("aptos_sdk.rest_client failed")
