const connectDB = require("../../database/dbconnection");
const Notification = require("../../models/NotificationModel");
const express = require("express");

const router = express.Router();

// ✅ تحديد إشعار كمقروء
router.put("/:notificationId", async (req, res) => {
  try {
    await connectDB();
    const { notificationId } = req.params;
    
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("💥 Mark as Read Error:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ✅ تحديد كل الإشعارات كمقروءة
router.put("/mark-all/:userId", async (req, res) => {
  try {
    await connectDB();
    const { userId } = req.params;
    
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("💥 Mark All as Read Error:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;