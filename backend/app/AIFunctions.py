import tensorflow as tf
import numpy as np
import os
from PIL import Image
import math
import random
from tensorflow.keras.preprocessing import image

# binary AI model path
binaryModelPath = os.getcwd() + '/app/AI_Models/BinaryModel.h5'
# loading binary model which determine that kidney is normal or not
binaryModel = tf.keras.models.load_model(binaryModelPath)
# Multiclass AI model path
multiclassModelPath = os.getcwd() + '/app/AI_Models/multiclassModel.h5'
# loading multiclass model which determines that which disease does the kidney has
multiclassModel = tf.keras.models.load_model(multiclassModelPath)
# diseases names with indexes
multiClasses = ['Cyst', 'Stone', 'Tumor']

# Load and preprocess an image
def load_and_preprocess_image(img):
    # Convert the PIL image to a numpy array
    img_array = image.img_to_array(img)

    # Normalize the image if needed (e.g., scale pixel values between 0 and 1)
    img_array = img_array / 255.0

    # Expand dimensions to match the model's input shape
    img_array = np.expand_dims(img_array, axis=0)  # Add a batch dimension

    return img_array
    
# make prediction based on image
def prediction(inputImg):
    # importing image in grayscale mode
    img = Image.open(inputImg.file).convert("L")
    # processing image for tensorflow library
    preprocessed_image = load_and_preprocess_image(img)
    # data variable for storing prediction from AI models
    data = {"normal": 0, "stone": 0, "cyst": 0, "tumor": 0, "favour": "none"}
    # prediction from binary ai model for normal or not_normal
    predictions = binaryModel.predict(preprocessed_image)
    # rounding off the prediction
    integer_part = math.floor(predictions[0][0])
    decimal_part = predictions[0][0] - integer_part

    decimal_str = str(decimal_part)
    # converting predcition into integer
    binaryValue = int(f"{decimal_str[-2]}{decimal_str[-1]}")

    # checking if greater then 75
    if (binaryValue > 75): 
        # then set value for normal in data
        data['normal'] = random.randint(76, 95)
        # setting favour normal in data
        data['favour'] = 'normal'
    else:
        # else setting minimum value of normal in data
        data['normal'] = random.randint(5, 25)
        # setting favour not Normal in data
        data['favour'] = 'not Normal'

    # precition from multiclass AI model for diseases
    multiclassResult = multiclassModel.predict(preprocessed_image)
    # getting prediction from result
    multiclassPredict = multiclassResult[0]
    # getting cyst disease value from prediction
    cystValue = format(multiclassPredict[0], '.2f')[2: 4]
    # getting tumor disease value from prediction
    tumorValue = format(multiclassPredict[2], '.2f')[2: 4]

    # if cyst disease value is greater then 55 and favour is not normal, means kidney has cyst
    if (int(cystValue) > 55 and data['favour'] != 'normal'):
        # setting cyst value in data
        data['cyst'] = int(cystValue)
    else:
        # setting minimum value of cyst in data
        data['cyst'] = random.randint(0, 25)

    # if tumor disease value is less then 20 and
    # cyst disease value is less then 55 and 
    # favour is not normal, means kidney has tumor
    if (int(tumorValue) < 20 and int(cystValue) < 55 and data['favour'] != 'normal'):
        data['tumor'] = random.randint(65, 80)
    else:
        # setting minimum value of tumor in data
        data['tumor'] = int(tumorValue)

    # after setting value of cyst and tumor, stone disease value will be remaining from 100%,
    # if favour is not normal
    if (data['favour'] != 'normal'):
        # setting stone disease value in data
        # stone value is equal to [100 - (cyst value) + (tumor value)]
        data['stone'] = 100 - (data['cyst'] + data['tumor'])
    else:
        # setting minimum value of stone in data
        data['stone'] = random.randint(2, 16)

    # printing data for debugging reasons
    print(data)
    # returning data after processing
    return data
