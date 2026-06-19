const connectDB = require("../../database/dbconnection");
const Consultation = require("../../models/ConsultationModel");
const express = require("express");

const router = express.Router();

// ✅ PUT: تحديث حالة استشارة معينة
router.put("/:id", async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { status } = req.body;

    // التحقق من أن الحالة المرسلة صحيحة
    const validStatuses = ['Pending', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status value" 
      });
    }

    const updatedConsultation = await Consultation.findByIdAndUpdate(
      id, 
      { status: status }, 
      { new: true } // إرجاع البيانات المحدثة
    );

    if (!updatedConsultation) {
      return res.status(404).json({ 
        success: false, 
        message: "Consultation not found" 
      });
    }

    res.json({ 
      success: true, 
      message: "Status updated successfully",
      data: updatedConsultation 
    });

  } catch (error) {
    console.error("💥 Update Status Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server Error", 
      error: error.message 
    });
  }
});

module.exports = router;
