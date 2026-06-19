import React, { useState, useEffect } from "react";
import "./Home.css";

export default function Home({ onNavigate, userRole, userName }) {
  // ✅ نبدأوا بـ 0 ونخليو loading true
  const [stats, setStats] = useState({
    patients: 0,
    nurses: 0,
    doctors: 0,
    admins: 0,
    hospitals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // نجربو نجيبو البيانات من السيرفر
        const endpoints = [
          { key: 'patients', url: 'http://localhost:5000/stats/patients' },
          { key: 'nurses', url: 'http://localhost:5000/stats/nurses' },
          { key: 'doctors', url: 'http://localhost:5000/stats/doctors' },
          { key: 'admins', url: 'http://localhost:5000/stats/admins' },
          { key: 'hospitals', url: 'http://localhost:5000/stats/hospitals' }
        ];

        const results = await Promise.all(
          endpoints.map(async (item) => {
            try {
              const res = await fetch(item.url);
              if (!res.ok) throw new Error();
              const data = await res.json();
              // ✅ نأخذ الرقم مهما كان اسم الحقل فالرد
              return { 
                key: item.key, 
                value: data.count || data.totalPatients || data.totalNurses || 
                       data.totalDoctors || data.totalAdmins || data.totalHospitals || 0 
              };
            } catch {
              return { key: item.key, value: 0 };
            }
          })
        );

        // ✅ نحدثو الحالة بالأرقام الحقيقية
        const newStats = {};
        results.forEach(r => newStats[r.key] = r.value);
        setStats(newStats);

      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // ✅ تصفية البطاقات حسب صلاحية المستخدم
  const cards = [
    { title: "المرضى", count: stats.patients, icon: "👥", color: "#3b82f6", bg: "#eff6ff", view: "patient", allowed: ["admin", "doctor", "nurse"] },
    { title: "الأطباء", count: stats.doctors, icon: "⚕️", color: "#10b981", bg: "#ecfdf5", view: "doctor", allowed: ["admin"] },
    { title: "الممرضين", count: stats.nurses, icon: "‍⚕️", color: "#8b5cf6", bg: "#f5f3ff", view: "nurse", allowed: ["admin", "doctor"] },
    { title: "المستشفيات", count: stats.hospitals, icon: "🏥", color: "#f59e0b", bg: "#fffbeb", view: "hospital", allowed: ["admin"] }
  ].filter(card => card.allowed.includes(userRole));

  return (
    <div className="premium-home">
      <header className="welcome-header">
        <div>
          <h1>مرحباً بك، {userName || "المسؤول"} </h1>
          <p>نظرة عامة على إحصائيات المستشفى اليوم</p>
        </div>
        <div className="current-date">
          {new Date().toLocaleDateString('ar-MA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      <section className="stats-grid">
        {cards.map((card, idx) => (
          <div key={idx} className="stat-card-premium" onClick={() => onNavigate && onNavigate(card.view)}>
            <div className="card-top">
              <div className="icon-box" style={{ backgroundColor: card.bg, color: card.color }}>{card.icon}</div>
              <span className="trend-indicator">+2.5%</span>
            </div>
            <div className="card-bottom">
              <h3>{card.title}</h3>
              <div className="count-number">
                {loading ? <span className="pulse">...</span> : card.count.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="quick-actions-section">
        <h2>⚡ إجراءات سريعة</h2>
        <div className="actions-container">
          {(userRole === "admin" || userRole === "doctor") && (
            <button className="action-btn" onClick={() => onNavigate("addPatient")}> تسجيل مريض جديد</button>
          )}
          {userRole === "admin" && (
            <>
              <button className="action-btn" onClick={() => onNavigate("addDoctor")}> إضافة طبيب</button>
              <button className="action-btn" onClick={() => onNavigate("addNurse")}>💉 إضافة ممرض</button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}