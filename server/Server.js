const express = require("express");
const cors = require("cors");
const path = require("path"); // ✅ ضروري لخدمة ملفات الواجهة
require("dotenv").config();

// ✅ استيراد دالة الاتصال بقاعدة البيانات
const connectDB = require("./database/dbconnection.js");

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// 🔧 Middleware (الإعدادات الوسيطة)
// ============================================

// ✅ تحسين CORS ليقبل الطلبات من Render و Localhost
const allowedOrigins = [
  "http://localhost:3000", 
  "https://medicare-pro.onrender.com" // بدل هاد الرابط بالرابط ديالك فـ Render
];

app.use(cors({ 
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ============================================
// 📂 استيراد الـ Routes (المسارات)
// ============================================
// AI & Predictions
const predict = require("./routes/ai_predict/predict.js");

// Auth Routes
const adminLogin = require('./routes/Admin/adminLogin.js');
const doctorLogin = require('./routes/doctor/doctorLogin.js');
const nurseLogin = require('./routes/Nurse/nurseLogin.js');
const patientLogin = require('./routes/patientRoutes/patientLogin.js');

// Patients
const addPatient = require("./routes/patientRoutes/addpatients.js");
const deletePatient = require("./routes/patientRoutes/deletePationt.js");
const updatepatient = require("./routes/patientRoutes/updatePatientInformation.js");
const getpatients = require("./routes/patientRoutes/getAllpatients.js");
const getSinglePatient = require("./routes/patientRoutes/getSinglePatientInfo.js");

// Hospitals
const addhospital = require("./routes/hospitalRoutes/addHospital.js");
const deletehospital = require("./routes/hospitalRoutes/deleteHospital.js");
const getAllhospital = require("./routes/hospitalRoutes/getAllHospital.js");
const getsingleHospital = require("./routes/hospitalRoutes/getSingleHospital.js");
const updateHospital = require("./routes/hospitalRoutes/updateHospitalInformation.js");

// Doctors
const adddoctor = require("./routes/doctor/addDoctor.js");
const deleteDoctor = require("./routes/doctor/deleteDoctor.js");
const getAllDoctors = require("./routes/doctor/getAllDoctors.js");
const getDoctor = require("./routes/doctor/getDoctor.js");
const updateDoctor = require("./routes/doctor/updateDoctor.js");

// Nurses
const addNurse = require("./routes/Nurse/addNurse.js");
const deleteNurse = require("./routes/Nurse/deleteNurse.js");
const getAllNurse = require("./routes/Nurse/getAllNurse.js");
const getSingleNurse = require("./routes/Nurse/getSingleNurse.js");
const updateNurse = require("./routes/Nurse/updateNurse.js");

// Admins
const addAdmin = require("./routes/Admin/addAdmin.js");
const deleteAdmin = require("./routes/Admin/deleteAdmin.js");
const getAllAdmins = require("./routes/Admin/getAllAdmin.js");
const getAdmin = require("./routes/Admin/getAdmin.js");
const updateAdmin = require("./routes/Admin/updateAdmin.js");

// Homes
const addHome = require("./routes/Home/addHome.js");
const deleteHome = require("./routes/Home/deleteHome.js");
const getAllHome = require("./routes/Home/getAllHome.js");
const getHome = require("./routes/Home/getHome.js");
const updateHome = require("./routes/Home/updateHome.js");

// Stats
const countPatient = require('./routes/stats/countPatient.js');
const nurseCountRoute = require('./routes/stats/countNurse.js');
const hospitalCountRoute = require('./routes/stats/countHospital.js');
const doctorCountRoute = require('./routes/stats/countDoctor.js');
const adminCountRoute = require('./routes/stats/countAdmin.js');
const countConsultation = require('./routes/stats/countConsultation.js'); 

// Notifications
const getNotification = require('./routes/notificationRoutes/getNotification.js');
const updateNotifications = require('./routes/notificationRoutes/markAsRead.js'); 

// Consultations
const addConsultation = require('./routes/consultationRoutes/addConsultation.js');
const getPatientConsultations = require('./routes/consultationRoutes/getPatientConsultations.js'); 
const getDoctorConsultations = require('./routes/consultationRoutes/getDoctorConsultations.js');
const updateConsultationStatus = require('./routes/consultationRoutes/updateConsultationStatus.js');
const updateTriage = require('./routes/consultationRoutes/updateTriage.js');
const getCritical = require('./routes/consultationRoutes/getCritical.js');
const getTriageLogs = require('./routes/triageLogRoutes/getLogs.js');
const getAllConsultations = require('./routes/consultationRoutes/getAllConsultations.js');

// ============================================
// 🛣️ تسجيل المسارات (Registering Routes)
// ============================================
app.use("/predict", predict);
app.use('/auth/admin', adminLogin);
app.use('/auth/doctor', doctorLogin);
app.use('/auth/nurse', nurseLogin);
app.use('/auth/patient', patientLogin);

app.use("/patients", addPatient);       
app.use("/patients", deletePatient);    
app.use("/patients", updatepatient);    
app.use("/patients", getpatients);      
app.use("/patients", getSinglePatient); 

app.use("/hospitals", addhospital);
app.use("/hospitals", deletehospital);
app.use("/hospitals", updateHospital);
app.use("/hospitals", getAllhospital);
app.use("/hospitals", getsingleHospital);

app.use("/doctors", adddoctor);
app.use("/doctors", deleteDoctor);
app.use("/doctors", updateDoctor);
app.use("/doctors", getAllDoctors);
app.use("/doctors", getDoctor);

app.use("/nurses", addNurse);
app.use("/nurses", deleteNurse);
app.use("/nurses", updateNurse);
app.use("/nurses", getAllNurse);
app.use("/nurses", getSingleNurse);

app.use("/admins", addAdmin);
app.use("/admins", deleteAdmin);
app.use("/admins", updateAdmin);
app.use("/admins", getAllAdmins);
app.use("/admins", getAdmin);

app.use("/homes", addHome);
app.use("/homes", deleteHome);
app.use("/homes", updateHome);
app.use("/homes", getAllHome);
app.use("/homes", getHome);

app.use("/notifications", getNotification);
app.use("/notifications", updateNotifications);

app.use("/consultations", addConsultation);
app.use("/consultations", getPatientConsultations);
app.use("/consultations", getDoctorConsultations);
app.use("/consultations", updateConsultationStatus);
app.use('/consultations', updateTriage); 
app.use('/consultations/critical', getCritical); 
app.use('/triage-logs', getTriageLogs); 
app.use("/consultations", getAllConsultations);

app.use("/stats/patients", countPatient);
app.use("/stats/nurses", nurseCountRoute);
app.use("/stats/hospitals", hospitalCountRoute);
app.use("/stats/doctors", doctorCountRoute);
app.use("/stats/admins", adminCountRoute);
app.use("/stats/consultations", countConsultation); 

// ============================================
// 🌐 خدمة واجهة React في الإنتاج (Production)
// ============================================
if (process.env.NODE_ENV === 'production') {
  // تحديد مسار مجلد build اللي كيصاوبو React
  app.use(express.static(path.join(__dirname, '../client/build')));

  // أي طلب ما هوش API (مثل /, /login, /dashboard) يرجع لملف index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// ============================================
// 🎯 Handlers (معالجات الأخطاء)
// ============================================
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString(), port: PORT });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error("💥 Server Error:", err.message);
  res.status(err.status || 500).json({ success: false, message: "Internal Server Error" });
});

// ============================================
// 🚀 Start Server
// ============================================
connectDB();
app.listen(PORT, () => {
  console.log(`✅ Server listening at port ${PORT}`);
  console.log(`🔗 Routes: /patients, /doctors, /nurses, /admins, /consultations ...`);
});

module.exports = app;