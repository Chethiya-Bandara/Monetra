import os
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import create_client, Client

security = HTTPBearer()

supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_KEY")
)


def get_current_user(
    token: HTTPAuthorizationCredentials = Security(security)
):
    try:
        response = supabase.auth.get_user(token.credentials)

        if not response.user:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token"
            )

        return response.user.id

    except HTTPException:
        raise

    except Exception as e:
        print(f"AUTH ERROR: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail="Authentication failed"
        )