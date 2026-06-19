const mongoose = require("mongoose");
require("dotenv").config();

const connect = async () => {
  try {
    // ✅ تأكد أن المتغير DBURL معرف فـ ملف .env
    await mongoose.connect(process.env.DBURL);
    console.log("✅ Connected to the hospital database");
  } catch (error) {
    console.error("❌ Database Connection Error:", error.message);
    // ⚠️ مهم: إذا فشل الاتصال، الأفضل نوقفو السيرفر حيت التطبيق ما غادي يخدمش بدونه
    process.exit(1); 
  }
};

module.exports = connect;