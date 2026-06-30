const express = require('express');
const router = express.Router();
const Consultation = require('../../models/ConsultationModel');

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    
    // بناء الفلتر حسب الحالة إذا كانت موجودة
    const filter = status ? { status } : {};
    
    const consultations = await Consultation.find(filter)
      .populate('patientId', 'firstName familyName phoneNumber')
      .populate('doctorId', 'firstName familyName')
      .sort({ createdAt: -1 }); // الأحدث أولاً

    res.json({ success: true, data: consultations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;