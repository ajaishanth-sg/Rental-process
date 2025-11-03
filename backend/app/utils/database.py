from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.database import Database
import os

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/rigit-control-hub")

client: AsyncIOMotorClient = None
database: Database = None

# Mock database for testing when MongoDB is not available
mock_database = {
    "rentals": [
        {
            "_id": "demo-rental-1",
            "contract_number": "RC-2025-056",
            "project_name": "Downtown Tower Construction",
            "project_type": "commercial",
            "equipment_category": "scaffolding",
            "equipment_type": "frame-scaffolding",
            "quantity": 100,
            "unit": "piece",
            "start_date": "2025-10-01",
            "end_date": "2025-10-31",
            "delivery_address": "123 Main St, Downtown City, NY 10001",
            "contact_person": "John Doe",
            "contact_phone": "+1-555-123-4567",
            "contact_email": "john.doe@construction.com",
            "special_requirements": "Urgent delivery required for site preparation",
            "customer_id": "demo-customer",
            "customer_name": "Demo Customer",
            "customer_email": "customer@demo.com",
            "status": "active",
            "total_amount": 12500,
            "created_at": "2025-10-01T00:00:00Z",
            "updated_at": "2025-10-01T00:00:00Z"
        },
        {
            "_id": "demo-rental-2",
            "contract_number": "RC-2025-068",
            "project_name": "Residential Complex Renovation",
            "project_type": "residential",
            "equipment_category": "formwork",
            "equipment_type": "wall-formwork",
            "quantity": 50,
            "unit": "set",
            "start_date": "2025-10-10",
            "end_date": "2025-11-10",
            "delivery_address": "456 Elm St, Suburb, CA 90210",
            "contact_person": "Jane Smith",
            "contact_phone": "+1-555-987-6543",
            "contact_email": "jane.smith@homeowner.com",
            "special_requirements": "Weekend delivery preferred, noise restrictions apply",
            "customer_id": "demo-customer",
            "customer_name": "Demo Customer",
            "customer_email": "customer@demo.com",
            "status": "active",
            "total_amount": 8900,
            "created_at": "2025-10-10T00:00:00Z",
            "updated_at": "2025-10-10T00:00:00Z"
        }
    ],
    "users": [
        {
            "_id": "demo-admin",
            "email": "admin@yourcompany.com",
            "full_name": "System Administrator",
            "role": "admin",
            "hashed_password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6fEtTT2/D2",  # admin123
            "created_at": "2025-01-01T00:00:00Z",
            "updated_at": "2025-01-01T00:00:00Z"
        }
    ]
}

async def connect_to_mongo():
    global client, database
    try:
        client = AsyncIOMotorClient(MONGODB_URL)
        database = client.get_database("rigit_control_hub")
        # Test connection
        await client.admin.command('ping')
        print("Connected to MongoDB")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        print("Using mock database for testing")
        # Use mock database
        database = MockDatabase()
        # Also set client to None to avoid issues
        client = None

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("Disconnected from MongoDB")

def get_database() -> Database:
    return database

class MockDatabase:
    """Mock database for testing when MongoDB is not available"""

    def __init__(self):
        self.data = mock_database.copy()

    def __getattr__(self, name):
        if name.startswith('_'):
            raise AttributeError(f"'{self.__class__.__name__}' object has no attribute '{name}'")
        return MockCollection(self.data.get(name, []))

class MockCollection:
    def __init__(self, data):
        self.data = data

    async def find(self, query=None):
        if query is None:
            return MockCursor(self.data)
        # Simple query matching
        results = []
        for item in self.data:
            if self._matches_query(item, query):
                results.append(item)
        return MockCursor(results)

    async def find_one(self, query=None):
        if query is None:
            return self.data[0] if self.data else None
        # Simple query matching
        for item in self.data:
            if self._matches_query(item, query):
                return item
        return None

    async def insert_one(self, document):
        document["_id"] = f"mock-{len(self.data)}"
        self.data.append(document)
        return MockInsertResult(document["_id"])

    async def update_one(self, query, update):
        for i, item in enumerate(self.data):
            if self._matches_query(item, query):
                if "$set" in update:
                    item.update(update["$set"])
                if "$push" in update:
                    for key, value in update["$push"].items():
                        if key not in item or not isinstance(item[key], list):
                            item[key] = []
                        item[key].append(value)
                return MockUpdateResult(1)
        return MockUpdateResult(0)

    async def count_documents(self, query=None):
        if query is None:
            return len(self.data)
        results = []
        for item in self.data:
            if self._matches_query(item, query):
                results.append(item)
        return len(results)

    def _matches_query(self, item, query):
        for key, value in query.items():
            if key == "_id":
                # Handle ObjectId matching
                if isinstance(value, str) and value.startswith("mock-"):
                    item_id = item.get("_id", "")
                    if item_id != value:
                        return False
                else:
                    return False
            elif key not in item or item[key] != value:
                return False
        return True

class MockCursor:
    def __init__(self, data):
        self.data = data
        self.index = 0

    async def to_list(self, length=None):
        return self.data[:length] if length else self.data

    def __aiter__(self):
        """Support async iteration"""
        self.index = 0
        return self

    async def __anext__(self):
        """Support async iteration"""
        if self.index >= len(self.data):
            raise StopAsyncIteration
        result = self.data[self.index]
        self.index += 1
        return result

class MockInsertResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id

class MockUpdateResult:
    def __init__(self, modified_count):
        self.modified_count = modified_count
