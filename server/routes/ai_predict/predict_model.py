import sys
import json
import os

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import tensorflow as tf
tf.get_logger().setLevel('ERROR')
tf.keras.mixed_precision.set_global_policy('float32')

from tensorflow import keras
from PIL import Image
import numpy as np

CLASS_NAMES = [
    "Acne and Rosacea Photos",
    "Actinic Keratosis Basal Cell Carcinoma and other Malignant Lesions",
    "Atopic Dermatitis Photos",
    "Bullous Disease Photos",
    "Cellulitis Impetigo and other Bacterial Infections",
    "Eczema Photos",
    "Exanthems and Drug Eruptions",
    "Hair Loss Photos Alopecia and other Hair Diseases",
    "Herpes HPV and other STDs Photos",
    "Light Diseases and Disorders of Pigmentation",
    "Lupus and other Connective Tissue diseases",
    "Melanoma Skin Cancer Nevi and Moles",
    "Nail Fungus and other Nail Disease",
    "Poison Ivy Photos and other Contact Dermatitis",
    "Psoriasis pictures Lichen Planus and related diseases",
    "Scabies Lyme Disease and other Infestations and Bites",
    "Seborrheic Keratoses and other Benign Tumors",
    "Systemic Disease",
    "Tinea Ringworm Candidiasis and other Fungal Infections",
    "Urticaria Hives",
    "Vascular Tumors",
    "Vasculitis Photos",
    "Warts Molluscum and other Viral Infections"
]

def predict_image(image_path, model_path='dermnet.keras'):
    try:
        # 1. تحميل الموديل
        model = keras.models.load_model(model_path, compile=False)
        
        # 2. معالجة الصورة (الحجم 380x380 كما هو مطلوب)
        img = Image.open(image_path)
        img = img.convert('RGB')
        img = img.resize((380, 380), Image.BILINEAR)
        
        img_array = np.array(img, dtype=np.float32)
        img_array = np.expand_dims(img_array, axis=0)
        
        # 3. التوقع
        predictions = model.predict(img_array, verbose=0)
        
        # 4. استخراج النتيجة والنسبة المئوية ✅
        predicted_idx = int(np.argmax(predictions[0]))
        confidence_score = float(np.max(predictions[0]) * 100) # تحويل لنسبة مئوية
        
        result = {
            'success': True,
            'predicted_class_index': predicted_idx,
            'predicted_class_name': CLASS_NAMES[predicted_idx],
            'confidence': round(confidence_score, 2) # إضافة نسبة الدقة
        }
        
        print(json.dumps(result)) # طباعة النتيجة بصيغة JSON
        
    except Exception as e:
        error_result = {
            'success': False,
            'error': 'Prediction failed',
            'details': str(e)
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No image path provided'}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    model_path = sys.argv[2] if len(sys.argv) > 2 else 'dermnet.keras'
    
    predict_image(image_path, model_path)