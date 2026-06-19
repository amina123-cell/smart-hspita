const connectDB = require("../../database/dbconnection");
const Notification = require("../../models/NotificationModel");
const express = require("express");

const router = express.Router();

// ✅ جلب إشعارات المستخدم
router.get("/:userId", async (req, res) => {
  try {
    await connectDB();
    const { userId } = req.params;
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50); // آخر 50 إشعار
    
    const unreadCount = await Notification.countDocuments({ 
      userId, 
      isRead: false 
    });
    
    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("💥 Get Notifications Error:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;