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
async def chat_with_ai(request: ChatRequest, user_id: str = Depends(get_current_user)):
    # 1. Fetch user data
    response = supabase.table("transactions").select("*").eq("user_id", user_id).execute()
    transactions = response.data

    # 2. Guard rail: Check if data exists
    if not transactions:
        return {"reply": "I don't see any transactions in your account yet. Add some expenses or income so I can analyze your finances!"}

    # 3. Clean the data (Removes sensitive/redundant fields to save tokens)
    # We only keep what's relevant for financial logic
    essential_data = [
        {
            "amount": t["amount"],
            "category": t["category"],
            "type": t["type"],
            "description": t["description"],
            "date": t["date"]
        } for t in transactions
    ]

    # 4. Refined System Context
    system_context = (
        "You are Monetra AI, a professional financial assistant. "
        "Analyze the user's spending patterns based on the JSON data provided below. "
        "Focus on identifying trends, highlighting overspending in specific categories, "
        "and suggesting ways to save. Be encouraging but direct. "
    )

    # Change the prompt to ask for JSON
    full_prompt = (
        f"{system_context}\n"
        "Respond in JSON format: { 'reply': '...', 'health_score': 0-100, 'alert_category': '...' }\n"
        f"Data: {essential_data}\nQuestion: {request.message}"
    )

    # And use the generation config
    ai_response = model.generate_content(
        full_prompt, 
        generation_config={"response_mime_type": "application/json"}
    )

    # 5. Get response from Gemini
    try:
        full_prompt = f"{system_context}\n\nUser Transactions: {essential_data}\n\nUser Question: {request.message}"
        ai_response = model.generate_content(full_prompt)
        return {"reply": ai_response.text}
    except Exception as e:
        print(f"Gemini Error: {e}")
        raise HTTPException(status_code=500, detail="AI service is currently unavailable.")
    
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)