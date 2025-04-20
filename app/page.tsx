'use client';

import Link from 'next/link';
import Navbar from '@/public/components/navbar';
import { FaCar, FaHistory, FaArrowRight, FaArrowLeft, FaPlus } from 'react-icons/fa';
import { useState } from 'react';
import { licenseList } from '@/lib/License';

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [plateLetters, setPlateLetters] = useState('');
  const [plateNumbers, setPlateNumbers] = useState('');
  const [plates, setPlates] = useState<string[]>(licenseList);
  const [error, setError] = useState<string | null>(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setPlateLetters('');
    setPlateNumbers('');
    setError(null);
  };

  const handleAddPlate = async () => {
    setError(null);

    // التحقق من صحة الإدخال
    const lettersRegex = /^[ء-ي\s]+$/; // حروف عربية ومسافات فقط
    const numbersRegex = /^\d{1,4}$/; // من 1 إلى 4 أرقام

    if (!plateLetters.trim() || !plateNumbers.trim()) {
      setError('الرجاء إدخال الأحرف والأرقام.');
      return;
    }

    if (!lettersRegex.test(plateLetters.trim())) {
      setError('حقل الأحرف يجب أن يحتوي على حروف عربية ومسافات فقط.');
      return;
    }

    if (!numbersRegex.test(plateNumbers.trim())) {
      setError('حقل الأرقام يجب أن يحتوي على 1 إلى 4 أرقام فقط.');
      return;
    }

    // تنسيق اللوحة
    const formattedPlate = `${plateLetters.trim().toUpperCase()} ${plateNumbers.trim()}`;

    // التحقق من عدم وجود اللوحة مسبقًا
    if (plates.includes(formattedPlate)) {
      setError('هذه اللوحة موجودة بالفعل.');
      return;
    }

    try {
      // إرسال اللوحة إلى الـ API
      const response = await fetch('/api/addlicense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plate: formattedPlate }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'فشل في إضافة اللوحة.');
      }

      // تحديث الحالة المحلية
      setPlates([...plates, formattedPlate]);
      closeModal();
    } catch (err: any) {
      console.error('Error adding plate:', err);
      setError(err.message || 'حدث خطأ أثناء إضافة اللوحة.');
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-center text-gray-800 mb-8">
          نظام إدارة تشييك السيارات
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* تشييك دخول السيارة */}
          <Link href="/cheak-in">
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-blue-600 mb-4">
                <FaCar className="inline-block text-4xl" />
                <FaArrowRight className="inline-block text-2xl ml-2" />
              </div>
              <h2 className="text-xl font-medium text-gray-800 mb-2">تشييك دخول السيارة</h2>
              <p className="text-sm text-gray-600">تسجيل بيانات دخول السيارة مع الصور</p>
            </div>
          </Link>

          {/* السجل */}
          <Link href="/history">
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-blue-600 mb-4">
                <FaHistory className="inline-block text-4xl" />
              </div>
              <h2 className="text-xl font-medium text-gray-800 mb-2">السجل</h2>
              <p className="text-sm text-gray-600">عرض سجلات تشييك السيارات</p>
            </div>
          </Link>

          {/* تشييك خروج السيارة */}
          <Link href="/cheak-out">
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-blue-600 mb-4">
                <FaCar className="inline-block text-4xl" />
                <FaArrowLeft className="inline-block text-2xl ml-2" />
              </div>
              <h2 className="text-xl font-medium text-gray-800 mb-2">تشييك خروج السيارة</h2>
              <p className="text-sm text-gray-600">تسجيل بيانات خروج السيارة مع الصور</p>
            </div>
          </Link>

          {/* إضافة لوحة جديدة */}
          <div
            onClick={openModal}
            className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer"
          >
            <div className="text-blue-600 mb-4">
              <FaPlus className="inline-block text-4xl" />
            </div>
            <h2 className="text-xl font-medium text-gray-800 mb-2">إضافة لوحة جديدة</h2>
            <p className="text-sm text-gray-600">إضافة لوحة سيارة جديدة إلى القائمة</p>
          </div>
        </div>
      </div>

      {/* نافذة المودال لإضافة لوحة */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">إضافة لوحة جديدة</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الأحرف</label>
                <input
                  type="text"
                  value={plateLetters}
                  onChange={(e) => setPlateLetters(e.target.value)}
                  placeholder="مثال: ب ر ا"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الأرقام</label>
                <input
                  type="text"
                  value={plateNumbers}
                  onChange={(e) => setPlateNumbers(e.target.value)}
                  placeholder="مثال: 2792"
                  maxLength={4} // الحد الأقصى 4 أرقام
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
            <div className="flex justify-end gap-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddPlate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                إضافة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}