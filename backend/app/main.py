from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, rentals, invoices, customers, returns, support, reports, equipment, admin, events, uom, rates, currencies, vat, contracts, warehouse, finance, sales, crm
from .utils.database import connect_to_mongo, close_mongo_connection
from .utils.seed_data import seed_demo_data

app = FastAPI(
    title="Rigit Control Hub API",
    description="Backend API for the Rigit Control Hub application",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3005"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(equipment.router, prefix="/api/equipment", tags=["Equipment"])
app.include_router(rentals.router, prefix="/api/rentals", tags=["Rentals"])
app.include_router(invoices.router, prefix="/api/invoices", tags=["Invoices"])
app.include_router(customers.router, prefix="/api/customers", tags=["Customers"])
app.include_router(returns.router, prefix="/api/returns", tags=["Return Requests"])
app.include_router(support.router, prefix="/api/support", tags=["Support"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(events.router, prefix="/api/events", tags=["Events"])
app.include_router(uom.router, prefix="/api/master-data/uom", tags=["Master Data - UOM"])
app.include_router(rates.router, prefix="/api/master-data/rates", tags=["Master Data - Rates"])
app.include_router(currencies.router, prefix="/api/master-data/currencies", tags=["Master Data - Currencies"])
app.include_router(vat.router, prefix="/api/master-data/vat", tags=["Master Data - VAT"])
app.include_router(contracts.router, prefix="/api/contracts", tags=["Contracts"])
app.include_router(warehouse.router, prefix="/api/warehouse", tags=["Warehouse"])
app.include_router(finance.router, prefix="/api/finance", tags=["Finance"])
app.include_router(sales.router, prefix="/api/sales", tags=["Sales"])
app.include_router(crm.router, prefix="/api/crm", tags=["CRM"])

@app.on_event("startup")
async def startup_event():
    """Initialize database connection and seed demo data"""
    await connect_to_mongo()
    await seed_demo_data()

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection"""
    await close_mongo_connection()

@app.get("/")
async def root():
    return {"message": "Rigit Control Hub API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
