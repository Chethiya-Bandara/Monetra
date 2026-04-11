from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import transactions

app = FastAPI(title="Finance Tracker API")

# CORS (connect frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router, prefix="/transactions")

@app.get("/")
def root():
    return {"message": "Finance Tracker API running 💸"}