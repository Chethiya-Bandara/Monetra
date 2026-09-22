import os
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client, ClientOptions, create_client

security = HTTPBearer()
load_dotenv()

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


def get_authenticated_supabase_client(
    token: HTTPAuthorizationCredentials = Security(security),
    _user_id: str = Depends(get_current_user),
) -> Client:
    """Create an isolated PostgREST client bound to the current request JWT."""
    return create_client(
        os.environ.get("SUPABASE_URL"),
        os.environ.get("SUPABASE_KEY"),
        options=ClientOptions(
            headers={"Authorization": f"Bearer {token.credentials}"},
            auto_refresh_token=False,
            persist_session=False,
        ),
    )
