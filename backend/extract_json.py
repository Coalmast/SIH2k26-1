import json
from main import app  # Import your FastAPI instance

# Force FastAPI to generate the OpenAPI schema
openapi_schema = app.openapi()

# Write the schema to a local file
with open("openapi.json", "w") as f:
    json.dump(openapi_schema, f, indent=2)

print("API schema successfully extracted to openapi.json!")