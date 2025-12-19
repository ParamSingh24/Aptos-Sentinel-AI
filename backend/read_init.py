import aptos_sdk
print(f"File: {aptos_sdk.__file__}")
with open(aptos_sdk.__file__, 'r') as f:
    print(f.read())
