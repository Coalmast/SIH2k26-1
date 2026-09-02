import requests
import uuid

BASE_URL = "http://localhost:8000"

def test_all():
    try:
        schema = requests.get(f"{BASE_URL}/openapi.json").json()
    except Exception as e:
        print(f"Could not connect to {BASE_URL}. Make sure the server is running.")
        return

    paths = schema.get("paths", {})
    print(f"Found {len(paths)} unique paths in OpenAPI schema.\n")
    
    for path, methods in paths.items():
        for method, details in methods.items():
            # Replace common path parameters with a random UUID
            test_path = path.replace("{id}", str(uuid.uuid4()))
            test_path = test_path.replace("{role_id}", str(uuid.uuid4()))
            test_path = test_path.replace("{task_id}", str(uuid.uuid4()))
            test_path = test_path.replace("{report_id}", str(uuid.uuid4()))
            
            url = f"{BASE_URL}{test_path}"
            headers = {"Authorization": "Bearer mock_system_admin"}
            print(f"Testing {method.upper():<6} {test_path:<45} ...", end=" ")
            try:
                if method.lower() == "get":
                    response = requests.get(url, headers=headers)
                elif method.lower() == "post":
                    # provide empty dict for json payload to avoid some 415s, though might trigger 422s
                    response = requests.post(url, json={}, headers=headers)
                elif method.lower() == "put":
                    response = requests.put(url, json={}, headers=headers)
                elif method.lower() == "patch":
                    response = requests.patch(url, json={}, headers=headers)
                elif method.lower() == "delete":
                    response = requests.delete(url, headers=headers)
                else:
                    print(f"Skipped {method}")
                    continue
                
                # Check for 500 Server Errors (these are actual crashes we want to catch)
                # 4xx errors are mostly expected (Auth, missing validation fields, missing UUIDs in DB)
                color = "\033[92m" if response.status_code < 400 else ("\033[91m" if response.status_code >= 500 else "\033[93m")
                reset = "\033[0m"
                
                print(f"{color}Status: {response.status_code}{reset}")
                
                if response.status_code >= 500:
                    print(f"       -> \033[91mERROR DETAILS:\033[0m {response.text[:300]}")
            except Exception as e:
                print(f"\033[91mException:\033[0m {e}")

if __name__ == "__main__":
    test_all()
