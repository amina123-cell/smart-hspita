import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify'; // اختياري للإشعارات الجميلة
import './Patient.css';

const Patient = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ دالة جلب البيانات (مستقلة باش نقدر نعاود نعيطو ليها)
  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/patients');
      if (!res.ok) throw new Error('فشل في جلب البيانات من السيرفر');
      
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      setError(err.message);
      toast.error("تأكد من أن السيرفر شغال!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // ✅ دالة الحذف المتطورة
  const handleDelete = async (id) => {
    if (!window.confirm('⚠️ هل أنت متأكد من حذف هذا المريض نهائياً؟')) return;

    try {
      const res = await fetch(`http://localhost:5000/patients/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'فشل في عملية الحذف');
      }

      setPatients(prev => prev.filter(p => p._id !== id));
      toast.success('✅ تم حذف المريض بنجاح');
      
    } catch (err) {
      toast.error('❌ خطأ: ' + err.message);
    }
  };

  // ✅ حساب العمر بدقة
  const calculateAge = (dob) => {
    if (!dob) return '-';
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  // ✅ فلترة البحث الشاملة
  const filtered = patients.filter(p =>
    p.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.familyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phoneNumber?.includes(searchTerm) ||
    p.bloodGroup?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="patient-container">
      <div className="page-header">
        <h2>👥 سجل المرضى الإلكتروني</h2>
        <button onClick={fetchPatients} className="refresh-btn" disabled={loading}>
          {loading ? 'جاري التحميل...' : '🔄 تحديث'}
        </button>
      </div>
      
      {/* 🔍 شريط البحث */}
      <input
        type="text"
        placeholder="🔍 ابحث بالاسم، الهاتف أو زمرة الدم..."
        className="search-input"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />

      {error && <div className="error-msg">❌ {error}</div>}

      <div className="table-wrapper">
        <table className="patient-table">
          <thead>
            <tr>
              <th>الاسم الكامل</th>
              <th>العمر</th>
              <th>الهاتف</th>
              <th>زمرة الدم</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="6" className="no-data">لا توجد نتائج مطابقة للبحث</td></tr>
            ) : (
              filtered.map(patient => (
                <tr key={patient._id}>
                  <td><strong>{patient.firstName} {patient.familyName}</strong></td>
                  <td>{calculateAge(patient.dateOfBirth)} سنة</td>
                  <td dir="ltr">{patient.phoneNumber}</td>
                  <td><span className="blood-badge">{patient.bloodGroup || '-'}</span></td>
                  <td>
                    <span className={`status ${patient.isActive ? 'active' : 'inactive'}`}>
                      {patient.isActive ? '✔ نشط' : '✖ غير نشط'}
                    </span>
                  </td>
                  
                  <td className="action-cell">
                    <button className="btn-delete" onClick={() => handleDelete(patient._id)}>
                      🗑️ حذف
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Patient;