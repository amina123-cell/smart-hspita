const express = require('express');
const router = express.Router();
const Consultation = require('../../models/consultationModel');

// جلب الحالات الحرجة فقط (LEVEL_1 & LEVEL_2)
router.get('/', async (req, res) => {
  try {
    const criticalCases = await Consultation.find({
      status: 'Pending',
      triageLevel: { $in: ['LEVEL_1', 'LEVEL_2'] }
    })
    .populate('patientId', 'firstName familyName')
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({ success: true, data: criticalCases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;