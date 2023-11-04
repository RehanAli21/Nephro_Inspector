import tensorflow as tf
import numpy as np
import os
from PIL import Image
import math
from tensorflow.keras.preprocessing import image

binaryModelPath = os.getcwd() + '/app/models/BinaryModel.h5'

binaryModel = tf.keras.models.load_model(binaryModelPath)

effiModelPath = os.getcwd() + '/app/models/effimodel.h5'

effiModel = tf.keras.models.load_model(effiModelPath)

resModelPath = os.getcwd() + '/app/models/resmodel.h5'

resModel = tf.keras.models.load_model(resModelPath)

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
    resResult = resModel.predict(preprocessed_image)
    print("---resnet---\n",resResult)
    resPredict = resResult[0]

    print(resPredict)

    for num in resPredict:
        integer_part = math.floor(num)
        decimal_part = num - integer_part

        decimal_str = str(decimal_part)[2:6]

        # Print the result
        print(f"Integer part: {integer_part}")
        print(f"Decimal part: {decimal_str}")

    if (resPredict[0] > resPredict[1] and resPredict[0] > resPredict[2]):
        print("0")
    elif (resPredict[1] > resPredict[0] and resPredict[1] > resPredict[2]):
        print("1")
    elif (resPredict[2] > resPredict[0] and resPredict[2] > resPredict[1]):
        print("2")


    effiResult = effiModel.predict(preprocessed_image)
    print("---effinet---\n",effiResult)
    effiPredict = effiResult[0]

    print(effiPredict)

    for num in effiPredict:
        integer_part = math.floor(num)
        decimal_part = num - integer_part

        decimal_str = str(decimal_part)[2:6]

        # Print the result
        print(f"Integer part: {integer_part}")
        print(f"Decimal part: {decimal_str}")

    if (effiPredict[0] > effiPredict[1] and effiPredict[0] > effiPredict[2]):
        print("0")
    elif (effiPredict[1] > effiPredict[0] and effiPredict[1] > effiPredict[2]):
        print("1")
    elif (effiPredict[2] > effiPredict[0] and effiPredict[2] > effiPredict[1]):
        print("2")

    result = multiClasses[np.argmax(effiPredict)]

    return result

def prediction(inputImg):
    img = Image.open(inputImg.file).convert("L")
    
    preprocessed_image = load_and_preprocess_image(img)

    predictions = binaryModel.predict(preprocessed_image)

    if predictions[0] > 0.5:
        return experimentMulti(preprocessed_image)
    else:
        return "Normal"
