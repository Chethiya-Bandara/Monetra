import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import supabase
from schemas import TransactionCreate, Transaction, TransactionBase, RecurringTransactionBase
from auth import get_current_user
from typing import List
from pydantic import BaseModel
from supabase import create_client, Client
import google.generativeai as genai

app = FastAPI()

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
    os.environ.get("SUPABASE_KEY") # service_role key
)

@app.get("/transactions")
async def get_transactions(user_id: str = Depends(get_current_user)):
    response = supabase.table("transactions").select("*").eq("user_id", user_id).execute()
    return response.data

@app.post("/transactions")
async def create_transaction(transaction: TransactionBase, user_id: str = Depends(get_current_user)):
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
async def register(user_data: dict):
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
        # Return the access token so the frontend can log them in immediately
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
async def login(credentials: LoginRequest):
    try:
        # Sign in with Supabase
        response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        
        # If successful, Supabase returns a session with a JWT
        return {
            "access_token": response.session.access_token,
            "token_type": "bearer",
            "user": response.user
        }
    except Exception as e:
        # Supabase throws an exception if credentials are wrong
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
# Configure Gemini for chatbot
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')
try:
    print("--- Available Models ---")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"Model: {m.name}")
    print("------------------------")
except Exception as e:
    print(f"Could not list models: {e}")

class ChatRequest(BaseModel):
    message: str


@app.post("/chat")
async def chat_with_ai(
    request: ChatRequest,
    user_id: str = Depends(get_current_user)
):
    try:
        # 1. Fetch user's transactions
        response = (
            supabase
            .table("transactions")
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )

        transactions = response.data

        # 2. Check if the user has transactions
        if not transactions:
            return {
                "reply": "I don't see any transactions in your account yet. Add some expenses or income so I can analyze your finances!"
            }

        # 3. Keep only relevant transaction data
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

        # 4. Build AI prompt
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
            f"User Question: {request.message}"
        )

        # 5. Ask Gemini
        ai_response = model.generate_content(full_prompt)

        # 6. Return response
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)