#!/usr/bin/env python3
"""
Test script for the Rentals API
Tests the end-to-end flow of creating a rental order
"""

import requests
import json
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api"

# Test user credentials (demo user)
TEST_EMAIL = "customer@demo.com"
TEST_PASSWORD = "password123"

def get_auth_token():
    """Get authentication token"""
    print("\n1. Testing authentication...")
    auth_url = f"{API_URL}/auth/login"
    
    payload = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    
    response = requests.post(auth_url, json=payload)
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        token = data.get("access_token")
        print(f"   ✓ Authentication successful")
        print(f"   Token: {token[:20]}...")
        return token
    else:
        print(f"   ✗ Authentication failed: {response.text}")
        return None

def test_get_rentals(token):
    """Test fetching rentals"""
    print("\n2. Testing GET /api/rentals/...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(f"{API_URL}/rentals/", headers=headers)
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Successfully fetched {len(data)} rentals")
        return True
    else:
        print(f"   ✗ Failed to fetch rentals: {response.text}")
        return False

def test_create_rental(token):
    """Test creating a rental"""
    print("\n3. Testing POST /api/rentals/...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Create test rental data
    start_date = datetime.now().date()
    end_date = start_date + timedelta(days=30)
    
    payload = {
        "project_name": "Test Project - Automated Test",
        "project_type": "commercial",
        "equipment_category": "scaffolding",
        "equipment_type": "frame-scaffolding",
        "quantity": 50,
        "unit": "piece",
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "delivery_address": "123 Test Street, Test City, TC 12345",
        "contact_person": "Test Contact",
        "contact_phone": "+1-555-000-0000",
        "contact_email": "test@example.com",
        "special_requirements": "Test rental - automated test"
    }
    
    print(f"   Payload: {json.dumps(payload, indent=2)}")
    
    response = requests.post(f"{API_URL}/rentals/", headers=headers, json=payload)
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 201:
        data = response.json()
        print(f"   ✓ Rental created successfully!")
        print(f"   Rental ID: {data.get('id')}")
        print(f"   Contract Number: {data.get('contract_number')}")
        print(f"   Status: {data.get('status')}")
        return True, data
    else:
        print(f"   ✗ Failed to create rental: {response.text}")
        return False, None

def test_cors_headers(token):
    """Test CORS headers"""
    print("\n4. Testing CORS headers...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Origin": "http://localhost:3001"
    }
    
    response = requests.options(f"{API_URL}/rentals/", headers=headers)
    
    cors_origin = response.headers.get("Access-Control-Allow-Origin")
    cors_methods = response.headers.get("Access-Control-Allow-Methods")
    cors_headers = response.headers.get("Access-Control-Allow-Headers")
    
    print(f"   Access-Control-Allow-Origin: {cors_origin}")
    print(f"   Access-Control-Allow-Methods: {cors_methods}")
    print(f"   Access-Control-Allow-Headers: {cors_headers}")
    
    if cors_origin == "http://localhost:3001" or cors_origin == "*":
        print(f"   ✓ CORS headers are correct")
        return True
    else:
        print(f"   ✗ CORS headers are missing or incorrect")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("Rigit Control Hub - Rentals API Test Suite")
    print("=" * 60)
    
    # Test 1: Authentication
    token = get_auth_token()
    if not token:
        print("\n✗ Cannot proceed without authentication token")
        return False
    
    # Test 2: Get rentals
    if not test_get_rentals(token):
        print("\n✗ Failed to fetch rentals")
        return False
    
    # Test 3: Create rental
    success, rental_data = test_create_rental(token)
    if not success:
        print("\n✗ Failed to create rental")
        return False
    
    # Test 4: CORS headers
    if not test_cors_headers(token):
        print("\n✗ CORS headers are not configured correctly")
        return False
    
    print("\n" + "=" * 60)
    print("✓ All tests passed!")
    print("=" * 60)
    return True

if __name__ == "__main__":
    main()

