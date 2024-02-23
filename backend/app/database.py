from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# database url
URL_DATABASE = 'mysql+pymysql://root@localhost:3308/nephro'
# database engine for server
engine = create_engine(URL_DATABASE)
# session for connection of server and database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# this runs and makes sure the tables are present and if tables are nor present it create them.
Base = declarative_base()