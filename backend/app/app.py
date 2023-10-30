from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

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
        # Log or debug here
        # print(image.filename, image.content_type)
        image = Image.open(image.file).convert("L")

        print(image)
        # Your image processing logic here
        return {"message": "Image received successfully"}
    except Exception as e:
        print(str(e))
        return {"error": "An error occurred while processing the image"}