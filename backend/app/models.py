from sqlalchemy import Column, Integer, String, Boolean
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(20), unique=True, nullable=False)
    password = Column(String(150), nullable=False)
    secret = Column(String(20), nullable=False)

class Record(Base):
    __tablename__ = "records"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(20), nullable=False)
    recordname = Column(String(50))
    imgnamebyuser = Column(String(20)) # name provided by user gor image
    imageurl = Column(String(150), nullable=False, unique=True)
    result = Column(String(100)) # this is for saving results
    saved = Column(Boolean) # this is for checking wheather this is available for user or not

