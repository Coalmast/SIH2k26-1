import hashlib
import json

def generate_record_hash(data: dict) -> str:
    """Generate a SHA-256 hash of a dictionary record for tamper-evidence."""
    # Ensure stable JSON encoding
    serialized = json.dumps(data, sort_keys=True).encode("utf-8")
    return hashlib.sha256(serialized).hexdigest()

# Example usage before saving to DB:
# record_hash = generate_record_hash(compliance_data.model_dump())
# store_hash_in_blockchain_network(record_hash) # External API call to Hyperledger/Ethereum