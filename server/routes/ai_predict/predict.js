const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/', upload.single('image'), async (req, res) => {
    console.log('Received file:', req.file);
    
    if (!req.file) {
        return res.status(400).json({ 
            error: 'No image file uploaded',
            hint: 'Make sure the field name is "image" and type is "File" in Postman form-data'
        });
    }

    const imagePath = req.file.path;
    const modelPath = path.join(__dirname, './dermnet.keras');
    
    try {
        const python = spawn('python', [
            path.join(__dirname, './predict_model.py'),
            imagePath,
            modelPath
        ]);

        let dataString = '';
        let errorString = '';

        python.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        python.stderr.on('data', (data) => {
            errorString += data.toString();
            console.error('Python stderr:', data.toString());
        });

        python.on('close', (code) => {
            try {
                fs.unlinkSync(imagePath);
            } catch (e) {
                console.error('Failed to delete temp file:', e.message);
            }

            if (code !== 0) {
                console.error('Python exited with code:', code);
                console.error('Python Error:', errorString);
                return res.status(500).json({ 
                    error: 'Prediction failed',
                    details: errorString || 'Python process exited with error'
                });
            }

            try {
                const result = JSON.parse(dataString);
                
                if (!result.success) {
                    return res.status(500).json(result);
                }
                
                res.json(result);
            } catch (e) {
                console.error('JSON parse error:', e.message);
                console.error('Raw output:', dataString);
                res.status(500).json({ 
                    error: 'Failed to parse prediction result',
                    details: e.message,
                    raw: dataString.substring(0, 500) // First 500 chars for debugging
                });
            }
        });

    } catch (error) {
        console.error('Server error:', error);
        if (fs.existsSync(imagePath)) {
            try {
                fs.unlinkSync(imagePath);
            } catch (e) {
                console.error('Failed to delete temp file:', e.message);
            }
        }
        res.status(500).json({ 
            error: 'Server error',
            details: error.message 
        });
    }
});

module.exports = router;