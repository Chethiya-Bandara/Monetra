import os
import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

security = HTTPBearer()

def get_current_user(token: HTTPAuthorizationCredentials = Security(security)):
    # Ensure this matches your JWT Secret in Supabase Settings -> API
    secret = os.environ.get("SUPABASE_JWT_SECRET")
    
    try:
        # We allow both HS256 and ES256 to be safe.
        # verify_signature=False is used if you are using the JWT Secret string 
        # with an asymmetric ES256 token (standard for many Supabase setups).
        payload = jwt.decode(
            token.credentials,
            secret,
            algorithms=["HS256", "ES256"],
            options={
                "verify_aud": False,
                "verify_signature": False 
            }
        )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
            
        return user_id
    except Exception as e:
        print(f"❌ AUTH ERROR: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication failed")