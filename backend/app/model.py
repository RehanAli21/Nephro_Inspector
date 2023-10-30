import tensorflow as tf
import numpy as np
import os
from PIL import Image
from tensorflow.keras.preprocessing import image

binaryModelPath = os.getcwd() + '/app/models/BinaryModel.h5'

binaryModel = tf.keras.models.load_model(binaryModelPath)

multiModelPath = os.getcwd() + '/app/models/MultiClassModel.h5'

multiModel = tf.keras.models.load_model(multiModelPath)

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

    predictions = binaryModel.predict(preprocessed_image)

    if predictions[0] > 0.5:
        multiPredict = multiModel.predict(preprocessed_image)

        result = multiClasses[np.argmax(multiPredict)]

        return result
    else:
        return "Normal"

