#!/usr/bin/env python3
"""
Test script to verify rental display fix
Tests that newly created rentals appear in the GET endpoint
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api"

# Test user credentials
TEST_EMAIL = "customer@demo.com"
TEST_PASSWORD = "password123"

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def get_auth_token():
    """Get authentication token"""
    print_section("Step 1: Authenticate")
    
    auth_url = f"{API_URL}/auth/login"
    payload = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    
    response = requests.post(auth_url, json=payload)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        token = data.get("access_token")
        print(f"✓ Authentication successful")
        print(f"  Token: {token[:30]}...")
        return token
    else:
        print(f"✗ Authentication failed: {response.text}")
        return None

def get_initial_rentals(token):
    """Get initial rentals count"""
    print_section("Step 2: Get Initial Rentals")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(f"{API_URL}/rentals/", headers=headers)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Successfully fetched {len(data)} initial rentals")
        for i, rental in enumerate(data, 1):
            print(f"  {i}. {rental.get('contract_number')} - {rental.get('project_name')}")
        return len(data), data
    else:
        print(f"✗ Failed to fetch rentals: {response.text}")
        return 0, []

def create_test_rental(token):
    """Create a test rental"""
    print_section("Step 3: Create New Rental")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    start_date = datetime.now().date()
    end_date = start_date + timedelta(days=30)
    
    payload = {
        "project_name": f"Test Rental - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "project_type": "commercial",
        "equipment_category": "scaffolding",
        "equipment_type": "frame-scaffolding",
        "quantity": 25,
        "unit": "piece",
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "delivery_address": "123 Test Street, Test City, TC 12345",
        "contact_person": "Test Contact",
        "contact_phone": "+1-555-000-0000",
        "contact_email": "test@example.com",
        "special_requirements": "Test rental for display verification"
    }
    
    response = requests.post(f"{API_URL}/rentals/", headers=headers, json=payload)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 201:
        data = response.json()
        print(f"✓ Rental created successfully!")
        print(f"  Rental ID: {data.get('id')}")
        print(f"  Contract Number: {data.get('contract_number')}")
        print(f"  Project: {data.get('project_name')}")
        print(f"  Status: {data.get('status')}")
        return True, data
    else:
        print(f"✗ Failed to create rental: {response.text}")
        return False, None

def get_updated_rentals(token):
    """Get updated rentals list"""
    print_section("Step 4: Get Updated Rentals")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(f"{API_URL}/rentals/", headers=headers)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Successfully fetched {len(data)} rentals")
        for i, rental in enumerate(data, 1):
            print(f"  {i}. {rental.get('contract_number')} - {rental.get('project_name')}")
        return len(data), data
    else:
        print(f"✗ Failed to fetch rentals: {response.text}")
        return 0, []

def verify_rental_in_list(new_rental, updated_rentals):
    """Verify the new rental appears in the list"""
    print_section("Step 5: Verify New Rental in List")
    
    new_rental_id = new_rental.get('id')
    found = False
    
    for rental in updated_rentals:
        if rental.get('id') == new_rental_id:
            found = True
            print(f"✓ New rental found in list!")
            print(f"  ID: {rental.get('id')}")
            print(f"  Contract: {rental.get('contract_number')}")
            print(f"  Project: {rental.get('project_name')}")
            print(f"  Status: {rental.get('status')}")
            print(f"  Amount: ${rental.get('total_amount')}")
            break
    
    if not found:
        print(f"✗ New rental NOT found in list!")
        print(f"  Expected ID: {new_rental_id}")
        print(f"  Available IDs: {[r.get('id') for r in updated_rentals]}")
    
    return found

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("  Rental Display Fix - Verification Test")
    print("="*60)
    
    # Step 1: Authenticate
    token = get_auth_token()
    if not token:
        print("\n✗ Cannot proceed without authentication token")
        return False
    
    # Step 2: Get initial rentals
    initial_count, initial_rentals = get_initial_rentals(token)
    
    # Step 3: Create new rental
    success, new_rental = create_test_rental(token)
    if not success:
        print("\n✗ Failed to create rental")
        return False
    
    # Step 4: Get updated rentals
    updated_count, updated_rentals = get_updated_rentals(token)
    
    # Step 5: Verify new rental appears
    found = verify_rental_in_list(new_rental, updated_rentals)
    
    # Summary
    print_section("Test Summary")
    print(f"Initial rentals: {initial_count}")
    print(f"Updated rentals: {updated_count}")
    print(f"New rental created: {'✓' if success else '✗'}")
    print(f"New rental visible: {'✓' if found else '✗'}")
    
    if found and updated_count > initial_count:
        print("\n" + "="*60)
        print("  ✓ ALL TESTS PASSED!")
        print("  Rental display fix is working correctly!")
        print("="*60)
        return True
    else:
        print("\n" + "="*60)
        print("  ✗ TESTS FAILED!")
        print("  Rental display issue still exists")
        print("="*60)
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

