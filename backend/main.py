import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import supabase
from schemas import TransactionCreate, Transaction, TransactionBase
from auth import get_current_user
from typing import List
from pydantic import BaseModel
from supabase import create_client, Client

app = FastAPI()

# ✅ FIX: Allow Frontend to talk to Backend
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
    # ✅ FIX: Map 'text' from frontend to 'description' in Supabase
    transaction_data = {
        "user_id": user_id,
        "amount": transaction.amount,
        "type": transaction.type,
        "description": transaction.text,
        "date": transaction.date
    }
    
    try:
        response = supabase.table("transactions").insert(transaction_data).execute()
        return response.data[0]
    except Exception as e:
        print(f"❌ DB ERROR: {e}")
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)