import sys
import json
import os
import numpy as np

# ✅ تحسينات الأداء وتقليل رسائل التحذير
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import tensorflow as tf
tf.get_logger().setLevel('ERROR')

from tensorflow import keras
from PIL import Image

# ✅ قائمة الأمراض (نفس القائمة اللي عندك)
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

def predict_image(image_path, model_path):
    try:
        # ✅ 1. تحميل الموديل
        model = keras.models.load_model(model_path, compile=False)
        
        # ✅ 2. معالجة الصورة
        img = Image.open(image_path)
        img = img.convert('RGB')
        # تأكد أن الحجم 380 يطابق الحجم اللي درتي فيه Train للموديل
        img = img.resize((380, 380), Image.BILINEAR) 
        
        img_array = np.array(img, dtype=np.float32)
        
        # ✅ تطبيع القيم (Normalization) إذا كان الموديل يحتاجها (غالباً بين 0 و 1)
        img_array = img_array / 255.0 
        
        img_array = np.expand_dims(img_array, axis=0)
        
        # ✅ 3. التوقع
        predictions = model.predict(img_array, verbose=0)
        predicted_idx = int(np.argmax(predictions[0]))
        confidence = float(np.max(predictions[0]) * 100) # تحويل النسبة لمئوية
        
        # ✅ 4. تجهيز النتيجة بصيغة JSON مفهومة للواجهة
        result = {
            'success': True,
            'disease': CLASS_NAMES[predicted_idx], # الاسم اللي غادي يبان للمستخدم
            'prediction': CLASS_NAMES[predicted_idx],
            'confidence': round(confidence, 2),     # نسبة الدقة
            'class_index': predicted_idx
        }
        
        # ✅ طباعة النتيجة فقط (بدون أي نصوص إضافية)
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            'success': False,
            'error': 'Prediction failed',
            'details': str(e)
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(json.dumps({'success': False, 'error': 'Missing arguments'}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    model_path = sys.argv[2]
    
    predict_image(image_path, model_path)