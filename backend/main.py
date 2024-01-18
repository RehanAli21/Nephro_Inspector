import uvicorn
from app.app import app

if __name__ == "__main__":
    # Below line is for running on host 0.0.0.0, which helps simulator to access Backend.
    uvicorn.run(app, host="0.0.0.0", port=8000)
    # uvicorn.run(app, port=8000)