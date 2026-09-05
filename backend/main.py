import os
from fastapi import FastAPI, Depends, HTTPException, Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.middleware.cors import CORSMiddleware
from database import supabase
from schemas import TransactionCreate, Transaction, TransactionBase, RecurringTransactionBase
from auth import get_current_user
from typing import List
from pydantic import BaseModel
from supabase import create_client, Client
import google.generativeai as genai

limiter = Limiter(key_func=get_remote_address)

app = FastAPI()

app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler
)

# Allow Frontend to talk to Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_KEY")
)

@app.get("/transactions")
@limiter.limit("60/minute")
async def get_transactions(request: Request, user_id: str = Depends(get_current_user)):
    response = supabase.table("transactions").select("*").eq("user_id", user_id).execute()
    return response.data

@app.post("/transactions")
@limiter.limit("30/minute")
async def create_transaction(request: Request, transaction: TransactionBase, user_id: str = Depends(get_current_user)):
    transaction_data = {
        "user_id": user_id,
        "amount": transaction.amount,
        "type": transaction.type,
        "description": transaction.text,
        "date": transaction.date,
        "category": transaction.category
    }
    
    try:
        response = supabase.table("transactions").insert(transaction_data).execute()
        return response.data[0]
    except Exception as e:
        print(f"DB ERROR: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/transactions/{id}")
async def delete_transaction(id: str, user_id: str = Depends(get_current_user)):
    supabase.table("transactions").delete().eq("id", id).eq("user_id", user_id).execute()
    return {"status": "success"}

@app.post("/register")
@limiter.limit("3/minute")
async def register(request: Request, user_data: dict):
    # Supabase Auth registration
    response = supabase.auth.sign_up({
        "email": user_data["email"],
        "password": user_data["password"],
        "options": {
            "data": {
                "full_name": user_data["fullName"]
            }
        }
    })
    
    if response.user:
        return {
            "access_token": response.session.access_token,
            "user": response.user
        }
    else:
        raise HTTPException(status_code=400, detail="Registration failed")
    

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, credentials: LoginRequest):
    try:
        # Sign in with Supabase
        response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        
        return {
            "access_token": response.session.access_token,
            "token_type": "bearer",
            "user": response.user
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
# Configure Gemini for chatbot
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

class ChatRequest(BaseModel):
    message: str


@app.post("/chat")
@limiter.limit("10/minute")
async def chat_with_ai(
    request: Request,
    chat_request: ChatRequest,
    user_id: str = Depends(get_current_user)
):
    try:
        response = (
            supabase
            .table("transactions")
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )

        transactions = response.data

        if not transactions:
            return {
                "reply": "I don't see any transactions in your account yet. Add some expenses or income so I can analyze your finances!"
            }

        essential_data = [
            {
                "amount": t["amount"],
                "category": t["category"],
                "type": t["type"],
                "description": t["description"],
                "date": t["date"]
            }
            for t in transactions
        ]

        system_context = (
            "You are Monetra AI, a professional financial assistant. "
            "Analyze the user's spending patterns based on the transaction data. "
            "Identify spending trends, highlight potentially high spending "
            "categories, and suggest practical ways to manage money. "
            "Be encouraging, clear, and concise. "
            "Do not make assumptions about information that is not provided."
        )

        full_prompt = (
            f"{system_context}\n\n"
            f"User Transactions: {essential_data}\n\n"
            f"User Question: {chat_request.message}"
        )

        ai_response = model.generate_content(full_prompt)

        return {
            "reply": ai_response.text
        }

    except Exception as e:
        print(f"CHAT ERROR: {repr(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
@app.post("/recurring-transactions")
async def create_recurring(transaction: RecurringTransactionBase, user_id: str = Depends(get_current_user)):
    data = {
        "user_id": user_id,
        "amount": transaction.amount,
        "type": transaction.type,
        "frequency": transaction.frequency,
        "category": transaction.category,
        "description": transaction.description,
        "start_date": transaction.start_date,
        "end_date": transaction.end_date
    }
    
    try:
        response = supabase.table("recurring_transactions").insert(data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/recurring-transactions")
async def get_recurring_transactions(
    user_id: str = Depends(get_current_user)
):
    try:
        response = (
            supabase
            .table("recurring_transactions")
            .select("*")
            .eq("user_id", user_id)
            .order("start_date", desc=False)
            .execute()
        )

        return response.data

    except Exception as e:
        print(f"Recurring transactions error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unable to load recurring transactions."
        )

@app.put("/recurring-transactions/{id}")
async def update_recurring_transaction(
    id: str,
    transaction: RecurringTransactionBase,
    user_id: str = Depends(get_current_user)
):
    data = {
        "amount": transaction.amount,
        "type": transaction.type,
        "frequency": transaction.frequency,
        "category": transaction.category,
        "description": transaction.description,
        "start_date": transaction.start_date,
        "end_date": transaction.end_date
    }

    try:
        response = (
            supabase
            .table("recurring_transactions")
            .update(data)
            .eq("id", id)
            .eq("user_id", user_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Recurring transaction not found."
            )

        return response.data[0]

    except HTTPException:
        raise

    except Exception as e:
        print(f"Update recurring transaction error: {e}")
        raise HTTPException(
            status_code=400,
            detail="Unable to update recurring transaction."
        )


@app.delete("/recurring-transactions/{id}")
async def delete_recurring_transaction(
    id: str,
    user_id: str = Depends(get_current_user)
):
    try:
        response = (
            supabase
            .table("recurring_transactions")
            .delete()
            .eq("id", id)
            .eq("user_id", user_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Recurring transaction not found."
            )

        return {"status": "success"}

    except HTTPException:
        raise

    except Exception as e:
        print(f"Delete recurring transaction error: {e}")
        raise HTTPException(
            status_code=400,
            detail="Unable to delete recurring transaction."
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)