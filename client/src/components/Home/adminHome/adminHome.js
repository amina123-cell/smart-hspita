import React, { useState, useEffect } from "react";
import "./adminHome.css";

export default function AdminHome({ userId, onNavigate }) {
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({ patients: 0, doctors: 0, nurses: 0, consultations: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!userId) {
      setError("⚠️ لم يتم تحديد معرف المسؤول");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // 1. جلب بيانات الأدمن (مع معالجة الخطأ بشكل مستقل)
        try {
          const adminRes = await fetch(`http://localhost:5000/admins/${userId}`);
          if (adminRes.ok) {
            const adminData = await adminRes.json();
            setAdmin(adminData.data || adminData);
          } else {
            console.warn("فشل في جلب بيانات الأدمن، سيتم استخدام بيانات افتراضية");
            setAdmin({ firstName: 'مسؤول', familyName: 'النظام', phoneNumber: '-' });
          }
        } catch (err) {
          console.error("خطأ في جلب الأدمن:", err);
          setAdmin({ firstName: 'مسؤول', familyName: 'النظام', phoneNumber: '-' });
        }

        // 2. جلب الإحصائيات (✅ نفس روابط لوحة التحكم الناجحة)
        const statsPromises = [
          fetch('http://localhost:5000/stats/patients').then(r => r.ok ? r.json() : { count: 0 }),
          fetch('http://localhost:5000/stats/doctors').then(r => r.ok ? r.json() : { count: 0 }),
          fetch('http://localhost:5000/stats/nurses').then(r => r.ok ? r.json() : { count: 0 }),
          fetch('http://localhost:5000/stats/consultations').then(r => r.ok ? r.json() : { count: 0 })
        ];

        const [p, d, n, c] = await Promise.all(statsPromises);
        
        setStats({
          patients: p.count || p.totalPatients || 0,
          doctors: d.count || d.totalDoctors || 0,
          nurses: n.count || n.totalNurses || 0,
          consultations: c.count || c.totalConsultations || 0
        });

        // 3. جلب المستخدمين (✅ نفس روابط لوحة التحكم)
        const usersPromises = [
          fetch('http://localhost:5000/patients'),
          fetch('http://localhost:5000/doctors'),
          fetch('http://localhost:5000/nurses')
        ];

        const [patRes, docRes, nurRes] = await Promise.all(usersPromises);

        const extractArr = (res) => res.ok ? res.json().then(d => Array.isArray(d) ? d : (d.data || [])) : [];

        const [patients, doctors, nurses] = await Promise.all([
          extractArr(patRes),
          extractArr(docRes),
          extractArr(nurRes)
        ]);

        const allUsers = [
          ...patients.map(p => ({ ...p, role: 'patient', roleLabel: 'مريض' })),
          ...doctors.map(d => ({ ...d, role: 'doctor', roleLabel: 'طبيب' })),
          ...nurses.map(n => ({ ...n, role: 'nurse', roleLabel: 'ممرض' }))
        ];
        setUsers(allUsers);

      } catch (err) {
        console.error("Fetch Error in Home:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userId]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.familyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.includes(searchTerm);
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) return <div className="admin-loading">⏳ جاري تحميل لوحة التحكم...</div>;
  
  return (
    <div className="admin-home-container">
      {/* 👤 رأس الصفحة */}
      <div className="admin-header-card">
        <div className="admin-avatar">
          {admin?.profilePicture ? <img src={admin.profilePicture} alt="Admin" /> : <span>⚙️</span>}
        </div>
        <div className="admin-info">
          <h2>مرحباً، {admin?.firstName} {admin?.familyName}</h2>
          <span className="admin-role">مسؤول النظام</span>
          <p className="admin-email">{admin?.phoneNumber}</p>
        </div>
        <div className="admin-actions-header">
          <button className="btn btn-primary" onClick={() => onNavigate?.("addConsultationAdmin")}>➕ استشارة جديدة</button>
          <button className="btn btn-outline" onClick={() => onNavigate?.("login")}>🚪 خروج</button>
        </div>
      </div>

      {/* 📊 بطاقات الإحصائيات */}
      <div className="stats-grid">
        <StatCard icon="👥" label="إجمالي المرضى" value={stats.patients} color="blue" onClick={() => { setFilterRole('patient'); setActiveTab('users'); }} />
        <StatCard icon="👨‍️" label="الأطباء" value={stats.doctors} color="indigo" onClick={() => { setFilterRole('doctor'); setActiveTab('users'); }} />
        <StatCard icon="👩‍⚕️" label="الممرضين" value={stats.nurses} color="cyan" onClick={() => { setFilterRole('nurse'); setActiveTab('users'); }} />
        <StatCard icon="📋" label="الاستشارات" value={stats.consultations} color="emerald" onClick={() => onNavigate?.("addConsultationAdmin")} />
      </div>

      {/* 🗂️ التبويبات */}
      <div className="admin-tabs">
        <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 نظرة عامة</button>
        <button className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>👥 إدارة المستخدمين</button>
        <button className={`tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>⚙️ الإعدادات</button>
      </div>

      {/* 📋 المحتوى */}
      {activeTab === 'overview' && (
        <div className="overview-content">
          <h3>📈 ملخص النظام</h3>
          <div className="overview-grid">
            <div className="overview-card">
              <h4>🆕 آخر المرضى المسجلين</h4>
              <ul className="recent-list">
                {users.filter(u => u.role === 'patient').slice(0, 5).map(u => (
                  <li key={u._id}>{u.firstName} {u.familyName} <span className="date">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('ar-DZ') : ''}</span></li>
                ))}
              </ul>
            </div>
            <div className="overview-card">
              <h4>⚡ إجراءات سريعة</h4>
              <div className="quick-actions">
                 <button className="btn btn-sm" onClick={() => onNavigate?.("addConsultationAdmin")}>➕ تسجيل استشارة</button>
                 <button className="btn btn-sm" onClick={() => onNavigate?.("addDoctor")}>👨‍️ إضافة طبيب</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="users-table-container">
          <div className="table-controls">
            <input type="text" placeholder="🔍 بحث بالاسم أو الهاتف..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <select className="filter-select" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
              <option value="all">📋 الكل</option>
              <option value="patient">👥 مرضى</option>
              <option value="doctor">👨‍⚕️ أطباء</option>
              <option value="nurse">👩‍️ ممرضين</option>
            </select>
            <button className="btn btn-primary" onClick={() => onNavigate?.("addPatient")}>➕ إضافة مستخدم</button>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>المستخدم</th><th>الدور</th><th>الهاتف</th><th>القسم/التخصص</th><th>الحالة</th><th>تاريخ التسجيل</th><th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan="7" className="no-results">لا توجد نتائج مطابقة للبحث</td></tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user._id}>
                      <td className="user-cell">
                        <div className="user-avatar-small">{user.firstName?.[0]}{user.familyName?.[0]}</div>
                        <div className="user-name">{user.firstName} {user.familyName}</div>
                      </td>
                      <td><span className={`role-badge ${user.role}`}>{user.roleLabel}</span></td>
                      <td>{user.phoneNumber || '-'}</td>
                      <td>{user.department || user.specialization || '-'}</td>
                      <td><span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>{user.isActive ? '✔ نشط' : '✖ غير نشط'}</span></td>
                      <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-DZ') : '-'}</td>
                      <td className="actions-cell">
                        <button className="action-btn view" title="عرض">👁️</button>
                        <button className="action-btn edit" title="تعديل">✏️</button>
                        <button className="action-btn delete" title="حذف">🗑️</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="table-footer"><span>عرض {filteredUsers.length} من {users.length} مستخدم</span></div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="settings-content">
          <h3>⚙️ إعدادات النظام</h3>
          <div className="settings-grid">
            <div className="setting-card"><h4>🔐 الأمان</h4><p>تغيير كلمة المرور، تفعيل المصادقة الثنائية</p><button className="btn btn-outline">إدارة</button></div>
            <div className="setting-card"><h4>📧 الإشعارات</h4><p>إعدادات البريد الإلكتروني، التنبيهات الفورية</p><button className="btn btn-outline">إدارة</button></div>
            <div className="setting-card"><h4>🗄️ النسخ الاحتياطي</h4><p>جدولة النسخ، استعادة البيانات</p><button className="btn btn-outline">إدارة</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, onClick }) {
  return (
    <div className={`stat-card ${color}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <span className="stat-value">{value.toLocaleString()}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}