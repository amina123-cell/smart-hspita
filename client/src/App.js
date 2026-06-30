import React, { useState, useEffect } from "react";
import "./App.css";

// ✅ Components
import Login from "./components/Login/Login";
import Admin from "./components/Admin/Admin";
import Doctor from "./components/Doctor/Doctor";
import Nurse from "./components/Nurse/Nurse";
import Patient from "./components/Patient/Patient";

// ✅ Home Components
import AdminHome from "./components/Home/adminHome/adminHome";
import DoctorHome from "./components/Home/doctorHome/doctorHome";
import NurseHome from "./components/Home/nurseHome/nurseHome";
import PatientHome from "./components/Home/patientHome/patientHome";

// ✅ Form Components
import AddPatientForm from "./components/Patient/AddPatientForm";
import AddNurseForm from "./components/Nurse/AddNurseForm";
import AddAdminForm from "./components/Admin/AddAdminForm";
import AddDoctorForm from "./components/Doctor/AddDoctorForm";

// ✅ Consultation Components
import AddConsultation from "./components/Consultation/AddConsultation"; // عام (احتياطي)
import AddConsultationPatient from "./components/Consultation/addConsultationPatient"; // للمريض
import AddConsultationNurse from "./components/Consultation/AddConsultationNurse"; // للممرضة
import AddConsultationAdmin from "./components/Consultation/AddConsultationAdmin"; // للأدمن
import AddConsultationDoctor from "./components/Consultation/AddConsultationDoctor"; // ✅ جديد: خاص بالطبيب

// ✅ AI Component
import SkinAnalysis from "./components/AI/SKinAnalysis";

// ✅ Notification Components (مخصصة لكل دور)
import DoctorNotificationBell from "./components/Notifications/DoctorNotificationBell";
import AdminNotificationBell from "./components/Notifications/AdminNotificationBell";
import NurseNotificationBell from "./components/Notifications/NurseNotificationBell";
import PatientNotificationBell from "./components/Notifications/PatientNotificationBell";

function App() {
  const [activeView, setActiveView] = useState("login");
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(null);

  // ✅ تسجيل الدخول
  const handleLogin = (role, id, extra = {}) => {
    try {
      if (!id) { console.warn("⚠️ لم يتم استلام معرف المستخدم"); return; }
      setUserRole(role); 
      setUserId(id); 
      setUserName(extra.name || null); 
      setIsLoggedIn(true);
      
      localStorage.setItem("userRole", role);
      localStorage.setItem("userId", id);
      if (extra.name) localStorage.setItem("userName", extra.name);
      if (extra.token) localStorage.setItem("token", extra.token);
      
      setActiveView(`${role}Home`);
      console.log("✅ Login successful:", { role, id });
    } catch (err) {
      console.error("💥 Login Error:", err);
    }
  };

  // ✅ تسجيل الخروج
  const handleLogout = () => {
    setUserRole(null); setUserId(null); setUserName(null); setIsLoggedIn(false);
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("token");
    setActiveView("login");
  };

  // ✅ استرجاع الجلسة
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem("userRole");
      const savedId = localStorage.getItem("userId");
      const savedName = localStorage.getItem("userName");
      
      if (savedRole && savedId) {
        setUserRole(savedRole);
        setUserId(savedId);
        setUserName(savedName);
        setIsLoggedIn(true);
        setActiveView(`${savedRole}Home`);
      }
    } catch (err) {
      console.error("💥 Session Restore Error:", err);
    }
  }, []);

  // ✅ عناصر التنقل حسب الدور
  const navItems = React.useMemo(() => {
    if (!isLoggedIn) return [{ id: "login", label: "تسجيل الدخول", icon: "🔐" }];
    const commonItems = [{ id: "logout", label: "تسجيل الخروج", icon: "🚪" }];
    
    const roleMap = {
      admin: [
        { id: "adminHome", label: "الرئيسية", icon: "🏠" },
        { id: "admin", label: "لوحة التحكم", icon: "⚙️" },
        { id: "addAdmin", label: "إضافة مسؤول", icon: "👤" },
        { id: "addDoctor", label: "إضافة طبيب", icon: "🩺" },
        { id: "addNurse", label: "إضافة ممرض", icon: "💉" },
        { id: "addPatient", label: "إضافة مريض", icon: "➕" },
        { id: "addConsultationAdmin", label: "إضافة استشارة", icon: "📋" }
      ],
      doctor: [
        { id: "doctorHome", label: "الرئيسية", icon: "🏠" },
        { id: "skinAnalysis", label: "تحليل AI", icon: "🤖" }, // ✅ متاح للطبيب
        { id: "doctor", label: "المرضى", icon: "👥" },
        { id: "addPatient", label: "تسجيل مريض", icon: "➕" },
        { id: "addConsultationDoctor", label: "إضافة استشارة", icon: "📋" }
      ],
      nurse: [
        { id: "nurseHome", label: "الرئيسية", icon: "🏠" },
        { id: "skinAnalysis", label: "تحليل AI", icon: "🤖" }, // ✅ متاح للممرض
        { id: "nurse", label: "المهام", icon: "📋" },
        { id: "addPatient", label: "تسجيل مريض", icon: "➕" },
        { id: "addConsultationNurse", label: "تسجيل استشارة", icon: "📋" }
      ],
      patient: [
        { id: "patientHome", label: "الرئيسية", icon: "🏠" },
        { id: "skinAnalysis", label: "تحليل AI", icon: "🤖" }, // ✅ متاح للمريض
        { id: "addConsultationPatient", label: "طلب استشارة", icon: "📅" },
        { id: "patient", label: "ملفي الطبي", icon: "📄" }
      ]
    };
    return [...(roleMap[userRole] || []), ...commonItems];
  }, [isLoggedIn, userRole]);

  // ✅ ربط الصفحات بالمكونات
  const views = React.useMemo(() => ({
    login: <Login onLogin={handleLogin} />,
    
    // Homes
    adminHome: <AdminHome userId={userId} onNavigate={setActiveView} />,
    doctorHome: <DoctorHome userId={userId} onNavigate={setActiveView} />,
    nurseHome: <NurseHome userId={userId} onNavigate={setActiveView} />,
    patientHome: <PatientHome userId={userId} onNavigate={setActiveView} />,
    
    // Special Features
    skinAnalysis: <SkinAnalysis />,
    
    // Management Views
    admin: <Admin />,
    doctor: <Doctor />,
    nurse: <Nurse />,
    patient: <Patient />,
    
    // Forms
    addPatient: <AddPatientForm />,
    addNurse: <AddNurseForm />,
    addDoctor: <AddDoctorForm />,
    addAdmin: <AddAdminForm />,
    
    // Consultations
    addConsultation: <AddConsultation onNavigate={setActiveView} />, // عام
    addConsultationPatient: <AddConsultationPatient patientId={userId} onNavigate={setActiveView} />, // مريض
    addConsultationNurse: <AddConsultationNurse nurseId={userId} onNavigate={setActiveView} />, // ممرضة
    addConsultationAdmin: <AddConsultationAdmin onNavigate={setActiveView} />, // أدمن
    addConsultationDoctor: <AddConsultationDoctor doctorId={userId} onNavigate={setActiveView} />, // ✅ طبيب
    
  }), [userId]);

  const handleNavClick = (itemId) => {
    if (itemId === "logout") handleLogout();
    else setActiveView(itemId);
  };

  const handleNotificationClick = (notification) => {
    if (notification?.type === 'consultation' && notification.data?.consultationId) {
      const targetView = { doctor: 'doctor', nurse: 'nurse', admin: 'admin' }[userRole];
      if (targetView) setActiveView(targetView);
    }
  };

  // ✅ حماية الصفحات
  const isProtectedView = [
    "adminHome", "doctorHome", "nurseHome", "patientHome", 
    "admin", "doctor", "nurse", "patient", 
    "addConsultation", "addConsultationPatient", "addConsultationNurse", 
    "addConsultationAdmin", "addConsultationDoctor", "skinAnalysis"
  ].includes(activeView);

  if (isProtectedView && !isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-wrapper">
            <span className="logo-icon">🏥</span>
            <div className="logo-text">
              <h1 className="app-title">
                <span className="title-main">Medi</span>
                <span className="title-highlight">Care</span>
                <span className="title-sub">Pro</span>
              </h1>
              <p className="app-subtitle">Advanced Medical Management System</p>
            </div>
          </div>
          
          {isLoggedIn && userRole && (
            <div className="user-info">
              {/* ✅ استخدام أجراس إشعارات مخصصة لكل دور */}
              {userRole === 'doctor' && <DoctorNotificationBell userId={userId} onNavigate={setActiveView} />}
              {userRole === 'admin' && <AdminNotificationBell userId={userId} onNavigate={setActiveView} />}
              {userRole === 'nurse' && <NurseNotificationBell userId={userId} onNavigate={setActiveView} />}
              {userRole === 'patient' && <PatientNotificationBell userId={userId} onNavigate={setActiveView} />}
              
              <span className="user-role-badge">
                {userRole === 'admin' && '⚙️'}
                {userRole === 'doctor' && '👨‍⚕️'}
                {userRole === 'nurse' && '👩‍⚕️'}
                {userRole === 'patient' && '👤'}
                {' '}{userName || userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </span>
            </div>
          )}
        </div>
      </header>

      {isLoggedIn && (
        <nav className="navigation">
          <div className="nav-wrapper">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-btn ${activeView === item.id ? "active" : ""}`}
                onClick={() => handleNavClick(item.id)}
                type="button"
              >
                <span className="btn-icon">{item.icon}</span>
                <span className="btn-label">{item.label}</span>
                {activeView === item.id && <div className="btn-glow"></div>}
              </button>
            ))}
          </div>
        </nav>
      )}

      <main className="main-content">
        {views[activeView] || <div className="empty-state">📭 صفحة غير موجودة</div>}
      </main>
    </div>
  );
}

export default App;