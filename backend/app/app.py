from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from . import AIFunctions
from pydantic import BaseModel
from typing import Annotated
from . import models
from .database import SessionLocal, engine
from sqlalchemy.orm import Session

app = FastAPI()

models.Base.metadata.create_all(bind=engine)

class UserBase(BaseModel):
    username: str
    password: str
    screat: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

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

@app.get("/users/{user_id}", status_code=status.HTTP_200_OK)
def getUser(user_id: int, db: db_dependency):
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@app.post("/checkImage")
async def predictionRoute(image: UploadFile = File(...)):
    try:
        result = AIFunctions.prediction(image)

        return {"message": result}
    except Exception as e:
        print(str(e))
        return {"error": "An error occurred while processing the image"}