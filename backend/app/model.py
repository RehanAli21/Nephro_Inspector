import tensorflow as tf
import numpy as np
import os
from PIL import Image
import math
from tensorflow.keras.preprocessing import image

binaryModelPath = os.getcwd() + '/app/models/BinaryModel.h5'

binaryModel = tf.keras.models.load_model(binaryModelPath)

multiclassModelPath = os.getcwd() + '/app/models/multiclassModel.h5'

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

def experimentMulti(preprocessed_image):
    multiclassResult = multiclassModel.predict(preprocessed_image)
    print("---multiClassnet---\n")
    multiclassPredict = multiclassResult[0]

    for num in multiclassPredict:
        value = format(num, '.2f')
        
        print(f"Integer part: {value}")

    if (multiclassPredict[0] > multiclassPredict[1] and multiclassPredict[0] > multiclassPredict[2]):
        print("0")
    elif (multiclassPredict[1] > multiclassPredict[0] and multiclassPredict[1] > multiclassPredict[2]):
        print("1")
    elif (multiclassPredict[2] > multiclassPredict[0] and multiclassPredict[2] > multiclassPredict[1]):
        print("2")

    result = multiClasses[np.argmax(multiclassPredict)]

    return result

def prediction(inputImg):
    img = Image.open(inputImg.file).convert("L")
    
    preprocessed_image = load_and_preprocess_image(img)

    predictions = binaryModel.predict(preprocessed_image)

    print("\n\n\n---binary Decision---\n")
    print(f"Normal Value: {format(predictions[0][0], '.2f')}")
    print(f"Not Normal Value: {format(1 - predictions[0][0], '.2f')}")

    if predictions[0] > 0.5:
        return experimentMulti(preprocessed_image)
    else:
        return "Normal"
