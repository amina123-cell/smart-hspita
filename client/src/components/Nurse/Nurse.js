import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify'; // تأكد من تثبيت المكتبة
import './Nurse.css';

const Nurse = () => {
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ دالة جلب البيانات (مستقلة باش نقدر نعاود نعيطو ليها)
  const fetchNurses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/nurses');
      if (!res.ok) throw new Error('فشل في الاتصال بالسيرفر');
      
      const data = await res.json();
      setNurses(data);
    } catch (err) {
      setError(err.message);
      toast.error("تأكد من أن السيرفر شغال!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ استدعاء الدالة عند فتح الصفحة
  useEffect(() => {
    fetchNurses();
  }, []);

  // ✅ حذف ممرضة (مع تأكيد واتصال بالسيرفر)
  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه الممرضة؟')) return;

    try {
      const res = await fetch(`http://localhost:5000/nurses/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('فشل في عملية الحذف');

      setNurses((prev) => prev.filter((n) => n._id !== id));
      toast.success("تم حذف الممرضة بنجاح");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ✅ فلترة البحث (الاسم، الهاتف، القسم)
  const filteredNurses = nurses.filter((nurse) =>
    nurse.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nurse.familyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nurse.phoneNumber?.includes(searchTerm) ||
    nurse.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="nurse-container">
      <div className="page-header">
        <h2>👩‍⚕️ إدارة الممرضين</h2>
        <button onClick={fetchNurses} className="refresh-btn" disabled={loading}>
          {loading ? 'جاري التحميل...' : '🔄 تحديث القائمة'}
        </button>
      </div>
      
      {/* 🔍 شريط البحث */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 ابحث بالاسم، رقم الهاتف أو القسم..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 📊 عرض النتائج */}
      {loading && nurses.length === 0 ? (
        <div className="loading-state">⏳ جاري تحميل بيانات الممرضين...</div>
      ) : error ? (
        <div className="error-state">❌ خطأ: {error}</div>
      ) : filteredNurses.length === 0 ? (
        <div className="no-data">😕 لا توجد نتائج مطابقة للبحث</div>
      ) : (
        <div className="table-wrapper">
          <table className="patient-table">
            <thead>
              <tr>
                <th>الاسم الكامل</th>
                <th>القسم</th>
                <th>نوبة العمل</th>
                <th>رقم الهاتف</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredNurses.map((nurse) => (
                <tr key={nurse._id} className="patient-row">
                  <td>{nurse.firstName} {nurse.familyName}</td>
                  <td><span className="dept-badge">{nurse.department}</span></td>
                  <td>{nurse.shiftPreference || 'غير محدد'}</td>
                  <td dir="ltr">{nurse.phoneNumber}</td>
                  <td>
                    <span className={`status-badge ${nurse.isActive ? 'active' : 'inactive'}`}>
                      {nurse.isActive ? '✔ نشط' : '✖ غير نشط'}
                    </span>
                  </td>
                  <td className="action-cell">
                    <button className="delete-btn" onClick={() => handleDelete(nurse._id)}>
                      🗑️ حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Nurse;