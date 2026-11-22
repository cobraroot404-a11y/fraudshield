import requests
import random
from datetime import datetime, timedelta

# API Configuration
BASE_URL = "http://localhost:8000"

# Test user credentials
TEST_USER = {
    "email": "testuser@example.com",
    "password": "Test@123",
    "name": "Test User"
}

# Sample data
SENDERS = [
    "user1@example.com",
    "user2@example.com",
    "user3@example.com",
]

RECEIVERS = [
    "merchant1@example.com",
    "merchant2@example.com",
    "merchant3@example.com",
    "suspicious@example.com",
]

LOCATIONS = ["New York", "Los Angeles", "Chicago", "Miami", "Seattle"]
IP_ADDRESSES = [
    "192.168.1.10",
    "192.168.1.20",
    "10.0.0.5",
    "172.16.0.100",
    "203.0.113.50"
]

DEVICES = ["device_001", "device_002", "device_003", "device_suspicious"]

def register_and_login():
    """Register and login test user"""
    # Try to register
    try:
        requests.post(f"{BASE_URL}/auth/register", json=TEST_USER)
        print("✅ User registered")
    except:
        print("ℹ️ User already exists")

    # Login
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": TEST_USER["email"],
        "password": TEST_USER["password"]
    })

    if response.status_code == 200:
        token = response.json()["access_token"]
        print("✅ Login successful")
        return token
    else:
        print("❌ Login failed:", response.text)
        return None

def create_transaction(token, transaction_data):
    """Create a single transaction"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/transactions/",
        json=transaction_data,
        headers=headers
    )

    if response.status_code == 200:
        return True
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")
        return False

def generate_normal_transactions(token, count=20):
    """Generate normal-looking transactions"""
    print(f"\n📊 Creating {count} normal transactions...")

    for i in range(count):
        transaction = {
            "sender": random.choice(SENDERS),
            "receiver": random.choice(RECEIVERS[:3]),
            "amount": round(random.uniform(10, 500), 2),
            "location": random.choice(LOCATIONS),
            "ip_address": random.choice(IP_ADDRESSES[:4]),
            "device_id": random.choice(DEVICES[:3])
        }

        if create_transaction(token, transaction):
            print(f"✅ Transaction {i+1} created: ${transaction['amount']} from {transaction['sender']}")

def generate_suspicious_transactions(token, count=5):
    """Generate suspicious transactions"""
    print(f"\n🚨 Creating {count} suspicious transactions...")

    for i in range(count):
        transaction = {
            "sender": random.choice(SENDERS),
            "receiver": "suspicious@example.com",
            "amount": round(random.uniform(5000, 15000), 2),  # Large amounts
            "location": random.choice(LOCATIONS),
            "ip_address": "203.0.113.50",  # Suspicious IP
            "device_id": "device_suspicious"
        }

        if create_transaction(token, transaction):
            print(f"✅ Suspicious transaction {i+1} created: ${transaction['amount']}")

def main():
    print("🚀 Starting test data population...\n")

    # Step 1: Login
    token = register_and_login()
    if not token:
        print("❌ Cannot proceed without authentication")
        return

    # Step 2: Create normal transactions
    generate_normal_transactions(token, count=20)

    # Step 3: Create suspicious transactions
    generate_suspicious_transactions(token, count=5)

    print("\n✅ Test data population complete!")
    print("📊 Now check your dashboard at: http://localhost:5173")
    print("🔍 The ML model is analyzing transactions in real-time!")

if __name__ == "__main__":
    main()
