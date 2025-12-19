import aptos_sdk
import os
try:
    path = os.path.dirname(aptos_sdk.__file__)
    print(f"Path: {path}")
    for f in os.listdir(path):
        print(f)
except Exception as e:
    print(e)
