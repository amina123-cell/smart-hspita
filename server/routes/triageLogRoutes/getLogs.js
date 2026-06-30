const express = require('express');
const router = express.Router();
const TriageLog = require('../../models/triageLogModel');

router.get('/:consultationId', async (req, res) => {
  try {
    const logs = await TriageLog.find({ consultationId: req.params.consultationId })
      .populate('changedBy', 'firstName familyName') // جلب اسم المستخدم
      .sort({ createdAt: -1 }); // الأحدث أولاً

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;