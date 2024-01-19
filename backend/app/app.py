from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from . import AIFunctions
from pydantic import BaseModel
from typing import Annotated
from . import models
from .database import SessionLocal, engine
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import bcrypt

app = FastAPI()

models.Base.metadata.create_all(bind=engine)

class UserBase(BaseModel):
    username: str
    password: str
    secret: str

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

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bytes(bcrypt.gensalt()))

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password, hashed_password)

@app.post("/users/add", status_code=status.HTTP_201_CREATED)
def addNewUser(user: UserBase, db: db_dependency):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(username=user.username, password=hashed_password, secret=user.secret)
    
    try:
        db.add(db_user)
        db.commit()

        return {"detail": "User Created"}
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Username already exists")
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred")

@app.post("/checkImage")
async def predictionRoute(image: UploadFile = File(...)):
    try:
        result = AIFunctions.prediction(image)

        return {"message": result}
    except Exception as e:
        print(str(e))
        return {"error": "An error occurred while processing the image"}