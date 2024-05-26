# Nephro_Inspector

---

Full Stack mobile application for kidney diseases (Stone, Cyst, and Tumor) classification.

<br><br>

## How to run project

---

Follow the steps below.

-   Step-1: Install Node.JS version 20 or higher on machine.
-   Step-2: Install Python 3.11 on machine.
-   Step-3: open mobile_app directory in terminal and write command "npm i" to install all the dependesies.
-   Step-4: open backend directory in termial and create python virtual enviroment, then install all the dependensies using requirement.txt.
-   Step-5: download all the AI models using this link (https://drive.google.com/drive/folders/1H_F3VVsOqEu114yR4YrETt3NHCSliO6p?usp=sharing). And put models inside in AI_models directory, then rename them according to text file present in download.
-   Step-6: Install xampp or any other application to run MysQL database on machine.
-   Step-7: config/modify the URL_DATABASE variable inside database.py file to make it run with you databases.
-   Step-8: becuase this application is running locally so to connect mobile_app to backend, the ip address in "url" have to change to match machine ip addess (Note: can get ipv4 address in windows using "ipconfig" command in teminal)
-   Step-9: To run backend, open project directory in terminal write command "backendscript" (in windows).
-   Step-10: To run mobile_app, open project directory in terminal write command "mobilescript" (in windows).

<br><br>

## Technologies used in project

---

### For Mobile Application:

-   Javascript
-   Node.JS
-   React Native with Expo

### For Backend

-   Python
-   FastAPI
-   Tensorflow
-   MySQL
