from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from . import AIFunctions
from . import models
from .database import SessionLocal, engine
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel
from typing import Annotated
from passlib.context import CryptContext
from PIL import Image
from datetime import datetime
import os, json

# variable for incryption and decryption of password
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# fastapi server
app = FastAPI()
# binding sql database to server
models.Base.metadata.create_all(bind=engine)

# model for user data param in api routes
class UserBase(BaseModel):
    username: str
    password: str
    secret: str

# function to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# database variable for database operations
db_dependency = Annotated[Session, Depends(get_db)]
# middleware for handling cors policy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
# get route, to check server is running
@app.get("/")
def read_root():
    return {"Hello": "World"}

# route to get user based on user_id
@app.get("/users/{user_id}", status_code=status.HTTP_200_OK)
def getUser(user_id: int, db: db_dependency):
    # getting data from database users table if (id is equal to user_id)
    user = db.query(models.User).filter(models.User.id == user_id).first()
    # if user is not found, raising Exception
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    # return user if user is found
    return user

# function to hash password
def get_password_hash(password):
    return pwd_context.hash(password)

# route to add new user in database
@app.post("/users/add", status_code=status.HTTP_201_CREATED)
def addNewUser(user: UserBase, db: db_dependency):
    # getting hased password
    hashed_password = get_password_hash(user.password)
    # creating new user
    db_user = models.User(username=user.username, password=hashed_password, secret=user.secret)
    
    try:
        # adding new user in database
        db.add(db_user)
        db.commit()
        # response after user created
        return {"detail": "User Created"}
    except IntegrityError:
        # Exception if user is already exists in database
        raise HTTPException(status_code=400, detail="Username already exists")
    except Exception:
        # handing errors
        raise HTTPException(status_code=500, detail="An unexpected error occurred")

# function to verify that hashed password and plain password is same
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# route to get user based on username and password,
# this route is used for login.
@app.post("/users/getUser", status_code=status.HTTP_200_OK)
def getUserAuth(data: dict, db: db_dependency):
    # getting username from data param
    username = data["username"]
    # getting password from data param
    password = data["password"]
    try:
        # getting user data from database based on username
        user = db.query(models.User).filter(models.User.username == username).first()

        # if user is not found, return response that user not found
        if user is None:
            return {"detail": "User Not Found", "passwordWrong": False, "userFound": False}
        
        # verifing password
        verify = verify_password(password, user.password)
        # if password is verified
        if (verify):
            # response that this user is authentic
            return {"detail": "User found", "passwordWrong": False, "userFound": True}
        else:
            # response that password is wrong, if passowrd is not verified
            return {"detail": "Password is wrong", "passwordWrong": True, "userFound": False}
        
    except Exception as e:
        # handling errors
        print(e)
        raise HTTPException(status_code=500, detail="An unexpected error occurred")

# route to get change password
@app.post("/users/changePassword", status_code=status.HTTP_200_OK)
def changePassword(user: UserBase, db: db_dependency):
    try:
        # getting user data from database based on username
        dbUser = db.query(models.User).filter(models.User.username == user.username).first()
        # if user is not found, return response that user not found
        if dbUser is None:
            return {"incorrectUsername": "OK"}
        # if user secrete text is not same as database user text then, return response that user not found
        if user.secret != dbUser.secret:
            return {"incorrectSecret": "OK"}
        # hashing new password to save in database
        hashed_password = get_password_hash(user.password)

        # updating new password in database
        db.query(models.User).filter(models.User.username == user.username).update({"password": hashed_password})
        db.commit()
        # telling user that password has been changed
        return {"detail": "Password Changes", "done": "OK"}

    except Exception as e:
        # handling errors
        print(e)
        raise HTTPException(status_code=500, detail="An unexpected error occurred")

# route to scan image using AI models
@app.post("/checkImage/{username}", status_code=status.HTTP_201_CREATED)
async def predictionRoute(username: str, db: db_dependency, image: UploadFile = File(...)):
    try:
        # getting results from AI model
        result = AIFunctions.prediction(image)
        # importing image in grayscale mode
        img = Image.open(image.file).convert("L")
        # getting time
        time = datetime.now()
        # setting image name using time value with userame
        imageName = f"./images/{time.strftime('%H_%M_%S')}_{username}.jpeg" 
        # saving image in server
        img.save(imageName)
        # creating new record with results and image path
        db_record = models.Record(username=username, result=json.dumps(result), imageurl=imageName, saved=False)
        # saving new record on database
        db.add(db_record)
        db.commit()
        # telling user the result
        return {"message": result, "detail": "Record Created", "imagePath": imageName}
    except Exception as e:
        # handling error
        print(str(e))
        return {"error": "An error occurred while processing the image"}
    
# route to save record
# marking record as save and setting record_name, img_name
@app.get("/saveImage/", status_code=status.HTTP_200_OK)
def markImageSave(imagePath: str, username: str, name: str, recordName: str, db: db_dependency):
    try:
        # if name is not provided then getting name from imagePath
        if (name == ''):
            name = imagePath.split('/')[2]

        # setting record name, image name and marking image save in database
        db.query(models.Record).filter(models.Record.username == username, models.Record.imageurl == imagePath).update({"imgname": name, "recordname": recordName, "saved": True})
        db.commit()
        # telling user that record has been saved
        return {"saved": "true"}
    except Exception as e:
        # handling errors
        print(str(e))
        return {"error": "An error occurred while processing the image"}
    
# route to check if data is present of a perticular user.
@app.get("/checkData/{username}", status_code=status.HTTP_200_OK)
def checkDataAvailability(username: str, db: db_dependency):
    try:
        # getting records of user which are marked as saved
        db_records = db.query(models.Record).filter(models.Record.username == username, models.Record.saved == True)
        # if there is no records, telling user that there is no data
        if (db_records is None):
            return {"details": "NoData"}
        
        # if there is records, telling user that there is data present
        if(db_records.count() > 0):
            return {"details": "Data"}
        else:
            # else telling user there is no data
            return {"details": "NoData"}
        
    except Exception as e:
        # handling errors
        print(e)
        return {"error": "An error occurred."}
    
# model for delete record param in api routes
class deleteRecordData(BaseModel):
    username: str
    imgname: str
    recordname: str

# route to mark data as unsaved in database
@app.post("/deleteDataForUser", status_code=status.HTTP_200_OK)
def unSaveRecord(data: deleteRecordData, db: db_dependency):
    try:
        # deleting recordName, imagename and marking record as unsaved in database
        db.query(models.Record).filter(models.Record.username == data.username, models.Record.imgname == data.imgname, models.Record.recordname == data.recordname, models.Record.saved == True).update({"imgname": '', "recordname": '', "saved": False})
        db.commit()
        # telling user that record has been deleted
        return {"deleted": "true"}
    except Exception as e:
        # handling errors
        print(e)
        return {"error": "An error occurred while deleting data."}

# route for get records for particular user
@app.get("/downloadData/{username}", status_code=status.HTTP_200_OK)
def downloadData(username: str, db: db_dependency):
    try:
        ### first authenticating user ###
        # getting user from database
        user = db.query(models.User).filter(models.User.username == username).first()
        # if user is not present, telling user that username is incorrect
        if user is None:
            return {"Msg": "Username is incorrect"}
        
        ### after authenticating user ###
        # getting saved records from database
        records = db.query(models.Record).filter(models.Record.username == username, models.Record.saved == True)
        # if no records are saved, then telling user there are no records.
        if records is None:
            return {"Msg": "No Records are available"}
        
        # variable to save records after formating records
        newData = []
        # iterating each record in records
        for record in records:
            # adding records in specific format
            newData.append({
                "recordName": record.recordname,
                "username": username,
			    "result": record.result,
			    "imageName": record.imgname,
            })
        # sending records to the user
        return newData
    except Exception as e:
        # handling errors
        print(e)
        return {"error": "An error occurred"}
    
# route to download image
@app.get("/downloadImage",status_code=status.HTTP_200_OK)
def downloadImage(username: str, imageName: str, recordName: str, db: db_dependency):
    try:
        # getting record which contain image path/url
        record = db.query(models.Record).filter(models.Record.username == username, models.Record.imgname == imageName, models.Record.recordname == recordName).first()
        # if there is no record, then telling user image not found
        if record is None:
            return {"details": "No Image Found"}
        
        # getting image path/url from reocord
        image_path = record.imageurl

        # if image is not present on server, then raising error that image not found
        if not os.path.exists(image_path):
            raise HTTPException(status_code=404, detail="Image not found")

        # if image is present, then send image to user
        return FileResponse(image_path)

    except Exception as e:
        # handling error
        print(e)
        return {"details": "An error occurred."}

# route to change image name in database
@app.get("/changeImageName",status_code=status.HTTP_200_OK)
def changeImageName(username: str, recordName: str, oldImageName: str, newImageName: str, db: db_dependency):
    try:
        # getting image, and updating image name
        db.query(models.Record).filter(models.Record.username == username, models.Record.imgname == oldImageName, models.Record.recordname == recordName).update({"imgname": newImageName})
        db.commit()
        # telling user that image name has been changed
        return {"details": "Image Name Updated"}
    except Exception as e:
        # handling error
        print(e)
        return {"details": "Error occured while changing Image Name."}