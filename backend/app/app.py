from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from . import AIFunctions
from pydantic import BaseModel
from typing import Annotated
from . import models
from .database import SessionLocal, engine
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext
from PIL import Image
from datetime import datetime
import json

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
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
    return pwd_context.hash(password)

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


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

@app.post("/users/getUser", status_code=status.HTTP_200_OK)
def getUserAuth(data: dict, db: db_dependency):
    username = data["username"]
    password = data["password"]
    try:
        user = db.query(models.User).filter(models.User.username == username).first()

        if user is None:
            return {"detail": "User Not Found", "passwordWrong": False, "userFound": False}
        
        verify = verify_password(password, user.password)
        if (verify):
            return {"detail": "User found", "passwordWrong": False, "userFound": True}
        else:
            return {"detail": "Password is wrong", "passwordWrong": True, "userFound": False}
        
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="An unexpected error occurred")

@app.post("/users/changePassword", status_code=status.HTTP_200_OK)
def changePassword(user: UserBase, db: db_dependency):
    try:
        dbUser = db.query(models.User).filter(models.User.username == user.username).first()

        if dbUser is None:
            return {"incorrectUsername": "OK"}
        
        if user.secret != dbUser.secret:
            return {"incorrectSecret": "OK"}
        
        hashed_password = get_password_hash(user.password)
        
        db.query(models.User).filter(models.User.username == user.username).update({"password": hashed_password})

        db.commit()

        return {"detail": "Password Changes", "done": "OK"}

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@app.post("/checkImage/{username}", status_code=status.HTTP_201_CREATED)
async def predictionRoute(username: str, db: db_dependency, image: UploadFile = File(...)):
    try:
        result = AIFunctions.prediction(image)

        img = Image.open(image.file).convert("L")

        time = datetime.now()
        imageName = f"./images/{time.strftime('%H_%M_%S')}_username.png" 
        img.save(imageName)
        db_record = models.Record(username=username, result=json.dumps(result), imageurl=imageName, saved=False)

        db.add(db_record)
        db.commit()
        
        return {"message": result, "detail": "Record Created"}
    except Exception as e:
        print(str(e))
        return {"error": "An error occurred while processing the image"}