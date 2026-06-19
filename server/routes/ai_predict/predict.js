const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// ✅ 1. إعداد التخزين والتأكد من وجود مجلد uploads
const uploadDir = path.join(__dirname, '../../uploads'); 
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/', upload.single('image'), async (req, res) => {
    console.log('📥 Received file request:', req.file ? req.file.filename : 'No file');
    
    if (!req.file) {
        return res.status(400).json({ 
            success: false,
            error: 'No image file uploaded',
            hint: 'Make sure the field name is "image" and type is "File"'
        });
    }

    const imagePath = req.file.path;
    
    // ✅ المسارات: تأكد أن dermnet.keras و predict_model.py موجودين فـ نفس المجلد مع هاد الملف
    const modelPath = path.join(__dirname, './dermnet.keras');
    const pythonScriptPath = path.join(__dirname, './predict_model.py');

    // التحقق من وجود الملفات الحيوية
    if (!fs.existsSync(modelPath)) {
        fs.unlink(imagePath, () => {}); 
        return res.status(500).json({ success: false, error: 'Model file (dermnet.keras) not found on server' });
    }
    if (!fs.existsSync(pythonScriptPath)) {
        fs.unlink(imagePath, () => {});
        return res.status(500).json({ success: false, error: 'Python script (predict_model.py) not found on server' });
    }

    try {
        // ✅✅✅ التعديل الجذري: استخدام المسار الكامل لـ Python داخل Conda Environment
        const PYTHON_PATH = "C:\\Users\\cc\\miniconda\\envs\\prj\\python.exe";

        console.log('🚀 Starting Python prediction...');
        
        const pythonProcess = spawn(PYTHON_PATH, [
            pythonScriptPath,
            imagePath,
            modelPath
        ]);

        let dataString = '';
        let errorString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
            console.error('🐍 Python Stderr:', data.toString());
        });

        pythonProcess.on('close', (code) => {
            // ✅ حذف الصورة المؤقتة بعد المعالجة سواء نجحت أو فشلت
            fs.unlink(imagePath, (err) => {
                if (err) console.error('Failed to delete temp file:', err);
            });

            if (code !== 0) {
                console.error('❌ Python process exited with code:', code);
                return res.status(500).json({ 
                    success: false,
                    error: 'Prediction failed',
                    details: errorString || 'Check Python environment (TensorFlow might be missing)'
                });
            }

            try {
                // محاولة قراءة النتيجة كـ JSON
                const result = JSON.parse(dataString);
                console.log('✅ Prediction Result:', result);
                res.json(result);
            } catch (e) {
                console.error('💥 JSON Parse Error:', e.message);
                console.error('Raw Output:', dataString);
                res.status(500).json({ 
                    success: false,
                    error: 'Failed to parse prediction result from Python',
                    rawOutput: dataString
                });
            }
        });

    } catch (error) {
        console.error('💥 Server Spawn Error:', error);
        // تنظيف الصورة في حالة حدوث خطأ مفاجئ
        fs.unlink(imagePath, () => {});
        res.status(500).json({ 
            success: false,
            error: 'Server internal error',
            details: error.message 
        });
    }
});

module.exports = router;