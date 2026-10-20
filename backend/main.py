import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

print("ENV PATH:", os.path.join(os.path.dirname(__file__), ".env"))
print("URL FOUND:", bool(os.getenv("SUPABASE_URL")))
print("KEY FOUND:", bool(os.getenv("SUPABASE_SERVICE_ROLE_KEY")))


app = FastAPI(
    title="CallFlow API",
    description="Cold-call assistant backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client | None = None

if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


@app.get("/")
def home():
    return {
        "message": "CallFlow API is running!",
        "status": "success",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CallFlow API"
    }


@app.get("/health/database")
def database_health_check():
    if supabase is None:
        return {"status": "not_configured"}

    try:
        supabase.table("calls").select("*").limit(1).execute()

        return {
            "status": "connected",
            "message": "Supabase database connection successful."
        }

    except Exception as e:
        print("DATABASE ERROR:", repr(e))
        print(
            "SUPABASE HOST:",
            SUPABASE_URL.split("/")[2] if SUPABASE_URL else "missing"
        )

        return {
            "status": "error",
            "message": str(e)
        }
    


@app.get("/health/database")
def database_health_check():
    if supabase is None:
        return {
            "status": "not_configured",
            "message": "Supabase credentials are missing.",
        }

    try:
        result = supabase.table("calls").select("id").limit(1).execute()

        return {
            "status": "connected",
            "message": "Supabase database connection successful.",
        }

    except Exception as e:
        print("DATABASE ERROR:", repr(e))   
        return {"status": "error", "message": str(e)
        }

# Save a new call
@app.post("/calls")
def create_call(call_data: dict):
    if supabase is None:
        return {"status": "error", "message": "Database not connected"}

    try:
        result = supabase.table("calls").insert(call_data).execute()

        return {
            "status": "success",
            "message": "Call saved successfully",
            "data": result.data
        }

    except Exception as e:
        print("SAVE CALL ERROR:", repr(e))
        return {"status": "error", "message": "Could not save call"}


# Get call history
@app.get("/calls")
def get_calls():
    if supabase is None:
        return {"status": "error", "message": "Database not connected"}

    try:
        result = (
            supabase.table("calls")
            .select("*")
            .order("id", desc=True)
            .execute()
        )

        return {
            "status": "success",
            "data": result.data
        }

    except Exception as e:
        print("FETCH CALLS ERROR:", repr(e))
        return {"status": "error", "message": "Could not fetch calls"}