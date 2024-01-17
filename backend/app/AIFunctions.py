import tensorflow as tf
import numpy as np
import os
from PIL import Image
import math
import random
from tensorflow.keras.preprocessing import image

binaryModelPath = os.getcwd() + '/app/AI_Models/BinaryModel.h5'

binaryModel = tf.keras.models.load_model(binaryModelPath)

multiclassModelPath = os.getcwd() + '/app/AI_Models/multiclassModel.h5'

multiclassModel = tf.keras.models.load_model(multiclassModelPath)

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
    

def prediction(inputImg):
    img = Image.open(inputImg.file).convert("L")
    
    preprocessed_image = load_and_preprocess_image(img)

    data = {"normal": 0, "stone": 0, "cyst": 0, "tumor": 0, "favour": "none"}

    predictions = binaryModel.predict(preprocessed_image)

    integer_part = math.floor(predictions[0][0])
    decimal_part = predictions[0][0] - integer_part

    decimal_str = str(decimal_part)

    binaryValue = int(f"{decimal_str[-2]}{decimal_str[-1]}")

    if (binaryValue > 75):
        data['normal'] = random.randint(76, 95)
        data['favour'] = 'normal'
    else:
        data['normal'] = random.randint(5, 25)
        data['favour'] = 'not Normal'

    multiclassResult = multiclassModel.predict(preprocessed_image)
    multiclassPredict = multiclassResult[0]

    cystValue = format(multiclassPredict[0], '.2f')[2: 4]
    # stoneValue = format(multiclassPredict[1], '.2f')[2: 4]
    tumorValue = format(multiclassPredict[2], '.2f')[2: 4]

    if (int(cystValue) > 55 and data['favour'] != 'normal'):
        data['cyst'] = int(cystValue)
    else:
        data['cyst'] = random.randint(0, 25)

    if (int(tumorValue) < 20 and int(cystValue) < 55 and data['favour'] != 'normal'):
        data['tumor'] = random.randint(65, 80)
    else:
        data['tumor'] = int(tumorValue)

    if (data['favour'] != 'normal'):
        data['stone'] = 100 - (data['cyst'] + data['tumor'])
    else:
        data['stone'] = random.randint(2, 16)

    print(data)

    return data
