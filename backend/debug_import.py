try:
    from aptos_sdk.client import RestClient
    print("Import Successful")
    with open("success.txt", "w") as f: f.write("True")
except Exception as e:
    import traceback
    with open("error_log.txt", "w") as f:
        traceback.print_exc(file=f)
    print("Import Failed")
