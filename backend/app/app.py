from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from . import model

app = FastAPI()

# uvicorn main:app --host 0.0.0.0 --port 8000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/checkImage")
async def predictionRoute(image: UploadFile = File(...)):
    try:
        result = model.prediction(image)

        return {"message": result}
    except Exception as e:
        print(str(e))
        return {"error": "An error occurred while processing the image"}