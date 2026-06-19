import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Admin.css';

function Admin() {
  const [allUsers, setAllUsers] = useState([]);
  const [stats, setStats] = useState({ doctors: 0, nurses: 0, patients: 0, admins: 0 });
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('users');

  const [form, setForm] = useState({ 
    firstName: '', familyName: '', role: 'Doctor', phoneNumber: '', password: '', department: '' 
  });

  // ✅ جلب البيانات باستخدام الروابط القديمة المطابقة لسيرفرك
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. جلب الإحصائيات (✅ الروابط القديمة)
      const [docRes, nurseRes, patRes, adminRes] = await Promise.all([
        axios.get('http://localhost:5000/stats/doctors'),
        axios.get('http://localhost:5000/stats/nurses'),
        axios.get('http://localhost:5000/stats/patients'),
        axios.get('http://localhost:5000/stats/admins')
      ]);

      // ✅ قراءة القيمة الصحيحة سواء كانت count أو totalDoctors...
      setStats({
        doctors: docRes.data.count || docRes.data.totalDoctors || 0,
        nurses: nurseRes.data.count || nurseRes.data.totalNurses || 0,
        patients: patRes.data.count || patRes.data.totalPatients || 0,
        admins: adminRes.data.count || adminRes.data.totalAdmins || 0
      });

      // 2. جلب قائمة المستخدمين (✅ الروابط القديمة)
      const [doctorsList, nursesList, adminsList] = await Promise.all([
        axios.get('http://localhost:5000/doctors'), 
        axios.get('http://localhost:5000/nurses'),  
        axios.get('http://localhost:5000/admins')   
      ]);

      // ✅ استخراج المصفوفة بأمان
      const getArray = (res) => Array.isArray(res.data) ? res.data : (res.data.data || []);

      const combinedUsers = [
        ...getArray(doctorsList).map(u => ({ ...u, role: 'Doctor', fullName: `${u.firstName} ${u.familyName}` })),
        ...getArray(nursesList).map(u => ({ ...u, role: 'Nurse', fullName: `${u.firstName} ${u.familyName}` })),
        ...getArray(adminsList).map(u => ({ ...u, role: 'Admin', fullName: `${u.firstName} ${u.familyName}` }))
      ];

      setAllUsers(combinedUsers);

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("فشل في جلب البيانات، تأكد من تشغيل السيرفر");
    } finally {
      setLoading(false);
    }
  };

  // ✅ فلترة المستخدمين
  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role.toLowerCase() === filterRole;
    return matchesSearch && matchesRole;
  });

  // ✅ إضافة مستخدم (✅ الروابط القديمة)
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.phoneNumber) {
      toast.warning('يرجى ملء البيانات الأساسية');
      return;
    }

    try {
      let endpoint = '';
      if (form.role === 'Doctor') endpoint = 'http://localhost:5000/doctors';
      else if (form.role === 'Nurse') endpoint = 'http://localhost:5000/nurses';
      else if (form.role === 'Admin') endpoint = 'http://localhost:5000/admins';

      await axios.post(endpoint, form);
      
      toast.success('✅ تمت الإضافة بنجاح');
      setForm({ firstName: '', familyName: '', role: 'Doctor', phoneNumber: '', password: '', department: '' });
      fetchData(); 
      
    } catch (error) {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الإضافة");
    }
  };

  // ✅ حذف مستخدم (✅ الروابط القديمة)
  const handleDelete = async (id, role) => {
    if (!window.confirm('هل أنت متأكد من الحذف نهائياً؟')) return;

    try {
      let endpoint = '';
      if (role === 'Doctor') endpoint = `http://localhost:5000/doctors/${id}`;
      else if (role === 'Nurse') endpoint = `http://localhost:5000/nurses/${id}`;
      else if (role === 'Admin') endpoint = `http://localhost:5000/admins/${id}`;

      await axios.delete(endpoint);
      
      toast.info('🗑️ تم الحذف بنجاح');
      fetchData(); 
      
    } catch (error) {
      toast.error("فشل في عملية الحذف");
    }
  };

  const roleConfig = {
    Doctor: { color: '#3b82f6', icon: '👨‍️', label: 'طبيب' },
    Nurse: { color: '#06b6d4', icon: '👩‍⚕️', label: 'ممرض' },
    Admin: { color: '#6366f1', icon: '⚙️', label: 'مسؤول' }
  };

  return (
    <div className="admin-dashboard">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>⚙️ MediCare</h2>
          <p>لوحة التحكم الحقيقية</p>
        </div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeSection === 'users' ? 'active' : ''}`} onClick={() => setActiveSection('users')}>👥 المستخدمين</button>
          <button className={`nav-item ${activeSection === 'add' ? 'active' : ''}`} onClick={() => setActiveSection('add')}>➕ إضافة جديد</button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <h1>لوحة تحكم المسؤول</h1>
          <button className="btn btn-outline" onClick={fetchData}>🔄 تحديث البيانات</button>
        </header>

        <div className="stats-grid">
          <StatCard icon="👨‍️" label="الأطباء" value={stats.doctors} color="#3b82f6" />
          <StatCard icon="👩‍⚕️" label="الممرضين" value={stats.nurses} color="#06b6d4" />
          <StatCard icon="🤒" label="المرضى" value={stats.patients} color="#10b981" />
          <StatCard icon="👑" label="المسؤولون" value={stats.admins} color="#6366f1" />
        </div>

        {activeSection === 'users' && (
          <section className="card-section">
            <div className="section-header">
              <h3>قائمة الفريق الطبي</h3>
              <input type="text" placeholder="🔍 بحث..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            {loading ? <p>جاري تحميل البيانات...</p> : (
              <div className="table-wrapper">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>الاسم</th>
                      <th>الدور</th>
                      <th>القسم</th>
                      <th>الهاتف</th>
                      <th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan="5" className="no-data">لا توجد بيانات مسجلة بعد</td></tr>
                    ) : (
                      filteredUsers.map(user => (
                        <tr key={user._id}>
                          <td>{user.fullName}</td>
                          <td><span className="role-badge" style={{color: roleConfig[user.role]?.color}}>{roleConfig[user.role]?.label}</span></td>
                          <td>{user.department || '-'}</td>
                          <td>{user.phoneNumber}</td>
                          <td>
                            <button className="action-btn delete" onClick={() => handleDelete(user._id, user.role)}>🗑️</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeSection === 'add' && (
          <section className="card-section">
            <h3>إضافة عضو جديد للنظام</h3>
            <form onSubmit={handleAdd} className="add-form-grid">
              <input className="form-input" placeholder="الاسم الأول" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} required />
              <input className="form-input" placeholder="اسم العائلة" value={form.familyName} onChange={e => setForm({...form, familyName: e.target.value})} required />
              <input className="form-input" placeholder="رقم الهاتف" value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} required />
              <input className="form-input" type="password" placeholder="كلمة السر" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              <select className="form-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="Doctor">طبيب</option>
                <option value="Nurse">ممرض</option>
                <option value="Admin">مسؤول</option>
              </select>
              <input className="form-input" placeholder="القسم (اختياري)" value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
              <button type="submit" className="btn btn-primary">💾 حفظ في قاعدة البيانات</button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card" style={{ borderRightColor: color }}>
      <div className="stat-icon" style={{ background: `${color}15`, color }}>{icon}</div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export default Admin;