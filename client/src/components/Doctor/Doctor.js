import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify'; // تأكد من تثبيتها npm install react-toastify
import './Doctor.css';

const Doctor = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ جلب البيانات الحقيقية من السيرفر عند تحميل الصفحة
  useEffect(() => {
    fetchAllPatients();
  }, []);

  const fetchAllPatients = async () => {
    try {
      setLoading(true);
      // ✅ الاتصال بالسيرفر لجلب جميع المرضى
      const res = await fetch('http://localhost:5000/patients');
      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
        setPatients(data);
      } else {
        toast.error("فشل في جلب بيانات المرضى");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("تأكد من أن السيرفر شغال");
    } finally {
      setLoading(false);
    }
  };

  // ✅ حذف مريض من السيرفر والواجهة معاً
  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المريض؟')) return;

    try {
      const res = await fetch(`http://localhost:5000/patients/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setPatients((prev) => prev.filter((p) => p._id !== id));
        toast.success("تم حذف المريض بنجاح");
      } else {
        toast.error("فشل في الحذف من السيرفر");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("حدث خطأ أثناء الاتصال");
    }
  };

  return (
    <div className="patient-container">
      <div className="header-section">
        <h2>👨‍⚕️ لوحة تحكم الطبيب</h2>
        <button onClick={fetchAllPatients} className="refresh-btn">🔄 تحديث</button>
      </div>
      
      {loading ? (
        <div className="loading-spinner">جاري تحميل البيانات...</div>
      ) : patients.length === 0 ? (
        <div className="empty-state">لا يوجد مرضى مسجلين حالياً</div>
      ) : (
        <div className="table-wrapper">
          <table className="patient-table">
            <thead>
              <tr>
                <th>الاسم الكامل</th>
                <th>رقم الهاتف</th>
                <th>العنوان</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p._id} className="patient-row">
                  <td>{p.firstName} {p.familyName}</td>
                  <td>{p.phoneNumber}</td>
                  <td>{p.address || 'غير محدد'}</td>
                  <td className="action-cell">
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDelete(p._id)}
                    >
                      🗑️ حذف
                    </button>
                    <button className="view-btn">👁️ عرض الملف</button>
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

export default Doctor;