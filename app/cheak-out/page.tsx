'use client';

import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

// 'use client';

// import Navbar from '@/public/components/navbar';
// import { useState, useRef, useEffect, RefCallback } from 'react';
// import { carList } from '@/lib/car';
// import { licenseList } from '@/lib/License';
// import { FaCheckCircle } from 'react-icons/fa';

// // دالة لإنشاء معرف فريد
// const generateUniqueId = () => {
//   return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
// };

// // دالة لإضافة تأخير بين طلبات الرفع
// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// interface FileSection {
//   id: string;
//   imageUrls: string | string[] | null;
//   title: string;
//   multiple: boolean;
//   previewUrls: string[];
//   isUploading: boolean;
// }

// interface User {
//   id: string;
//   name: string;
//   EmID: number;
//   role: string;
//   branch: string;
// }

// interface AirtableRecord {
//   id: string;
//   fields: {
//     العقد?: number | null;
//     السيارة?: string | null;
//     اللوحة?: string | null;
//     'نوع العملية'?: string | null;
//     [key: string]: any;
//   };
// }

// interface ApiResponse {
//   success: boolean;
//   message: string;
//   results: AirtableRecord[];
//   total: number;
//   page: number;
//   pageSize: number;
//   error?: string;
//   details?: any;
// }

// export default function UploadPage() {
//   const fieldTitles = [
//     'الصدام الخلفي مع الانوار',
//     'سطح الشنطة مع الزجاج الخلفي',
//     'محتويات الشنطة مع الاستبنة',
//     'التندة',
//     'الرفرف الخلفي يمين',
//     'الابواب اليمين مع توضيح السمكة',
//     'الرفرف الامامي يمين',
//     'الصدام الامامي مع الشنب',
//     'الكبوت مع الشبك',
//     'الزجاج الامامي',
//     'الرفرف الامامي يسار',
//     'الابواب اليسار مع توضيح السمكة',
//     'الرفرف الخلفي يسار',
//     'المقعد الامامي يسار',
//     'المقعد الامامي يمين',
//     'المقعد الخلفي مع خلفية المقاعد الامامية',
//     'طفاية الحريق',
//     'العداد',
//     'صور اخرى',
//   ];

//   const initialFiles: FileSection[] = fieldTitles.map((title, index) => ({
//     id: generateUniqueId(),
//     imageUrls: null,
//     title: title,
//     multiple: index === fieldTitles.length - 1,
//     previewUrls: [],
//     isUploading: false,
//   }));

//   const [files, setFiles] = useState<FileSection[]>(initialFiles);
//   const [car, setCar] = useState<string>('');
//   const [carSearch, setCarSearch] = useState<string>('');
//   const [showCarList, setShowCarList] = useState<boolean>(false);
//   const [plate, setPlate] = useState<string>('');
//   const [plateSearch, setPlateSearch] = useState<string>('');
//   const [showPlateList, setShowPlateList] = useState<boolean>(false);
//   const [contract, setContract] = useState<string>('');
//   const [operationType] = useState<string>('خروج');
//   const [isUploading, setIsUploading] = useState<boolean>(false);
//   const [uploadMessage, setUploadMessage] = useState<string>('');
//   const [uploadProgress, setUploadProgress] = useState<number>(0);
//   const [showToast, setShowToast] = useState<boolean>(false);
//   const [isSuccess, setIsSuccess] = useState<boolean>(false);
//   const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
//   const [user, setUser] = useState<User | null>(null);
//   const [hasExitRecord, setHasExitRecord] = useState<boolean>(false);
//   const [isSearching, setIsSearching] = useState<boolean>(false);

//   const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
//   const carInputRef = useRef<HTMLDivElement>(null);
//   const plateInputRef = useRef<HTMLDivElement>(null);
//   const abortControllerRef = useRef<AbortController | null>(null);
//   const uploadQueue = useRef<Promise<void>>(Promise.resolve()); // لإدارة تسلسل الرفع

//   // التحقق من تسجيل الدخول وجلب بيانات الموظف
//   useEffect(() => {
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//   }, []);

//   // مراقبة تغيير الوضع المظلم
//   useEffect(() => {
//     const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
//     setIsDarkMode(mediaQuery.matches);

//     const handleChange = (e: MediaQueryListEvent) => {
//       setIsDarkMode(e.matches);
//     };

//     mediaQuery.addEventListener('change', handleChange);
//     return () => mediaQuery.removeEventListener('change', handleChange);
//   }, []);

//   // إنشاء مراجع لمدخلات الملفات
//   useEffect(() => {
//     fileInputRefs.current = Array(files.length).fill(null);
//   }, [files.length]);

//   // إغلاق قوائم السيارات واللوحات عند النقر خارجها
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (carInputRef.current && !carInputRef.current.contains(event.target as Node)) {
//         setShowCarList(false);
//       }
//       if (plateInputRef.current && !plateInputRef.current.contains(event.target as Node)) {
//         setShowPlateList(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // إغلاق الـ Toast تلقائيًا
//   useEffect(() => {
//     if (showToast && !hasExitRecord) {
//       const timer = setTimeout(() => {
//         setShowToast(false);
//         setUploadMessage('');
//         setIsSuccess(false);
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [showToast, hasExitRecord]);

//   // إغلاق موديل "تم الرفع بنجاح" تلقائيًا
//   useEffect(() => {
//     if (isSuccess) {
//       const timer = setTimeout(() => {
//         setIsSuccess(false);
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [isSuccess]);

//   // جلب السجل السابق عند تغيير رقم العقد
//   useEffect(() => {
//     if (contract.trim()) {
//       fetchPreviousRecord();
//     } else {
//       setHasExitRecord(false);
//       setUploadMessage('');
//       setShowToast(false);
//     }
//   }, [contract]);

//   const fetchPreviousRecord = async () => {
//     if (!contract.trim()) {
//       setHasExitRecord(false);
//       setUploadMessage('رقم العقد مطلوب للبحث.');
//       setShowToast(true);
//       return;
//     }

//     setIsSearching(true);
//     setUploadMessage('');

//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//     }
//     abortControllerRef.current = new AbortController();

//     try {
//       const response = await fetch(`/api/history?contractNumber=${encodeURIComponent(contract)}`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         signal: abortControllerRef.current.signal,
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || `فشل في جلب السجل السابق (حالة: ${response.status})`);
//       }

//       const data: ApiResponse = await response.json();
//       if (data.success && data.results.length > 0) {
//         const exitRecord = data.results.find((record) => record.fields['نوع العملية'] === 'خروج');
//         if (exitRecord) {
//           setHasExitRecord(true);
//           setUploadMessage('لا يمكن إضافة هذا التشييك لأنه تم تسجيل خروج لهذه السيارة لهذا العقد.');
//           setShowToast(true);
//         } else {
//           setHasExitRecord(false);
//           setUploadMessage('لا يوجد سجل خروج سابق لهذا العقد.');
//           setShowToast(true);
//         }
//       } else {
//         setHasExitRecord(false);
//         setUploadMessage('لا يوجد سجل سابق لهذا العقد.');
//         setShowToast(true);
//       }
//     } catch (err: any) {
//       if (err.name === 'AbortError') {
//         return;
//       }
//       console.error('Error fetching previous record:', err);
//       setUploadMessage(err.message || 'حدث خطأ أثناء جلب السجل السابق.');
//       setShowToast(true);
//       setHasExitRecord(false);
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   const filteredCars = carList.filter((carItem) =>
//     carItem.toLowerCase().includes(carSearch.toLowerCase())
//   );

//   const filteredPlates = licenseList.filter((plateItem) =>
//     plateItem.toLowerCase().includes(plateSearch.toLowerCase())
//   );

//   // دالة لرفع الصورة إلى ImgBB
//   const uploadImageToImgBB = async (file: File): Promise<string> => {
//     try {
//       if (!file.type.startsWith('image/')) {
//         throw new Error('الملف ليس صورة صالحة. يرجى رفع ملف بصيغة JPEG أو PNG.');
//       }
//       if (file.size > 32 * 1024 * 1024) {
//         throw new Error('حجم الصورة كبير جدًا (الحد الأقصى 32 ميغابايت).');
//       }

//       const formData = new FormData();
//       formData.append('image', file);

//       console.log(`Uploading ${file.name} to ImgBB...`);
//       const response = await fetch(`https://api.imgbb.com/1/upload?key=960012ec48fff9b7d8bf3fe19f460320`, {
//         method: 'POST',
//         body: formData,
//       });

//       const result = await response.json();
//       if (!result.success) {
//         throw new Error(result.error?.message || 'فشل رفع الصورة إلى ImgBB.');
//       }

//       console.log(`ImgBB URL for ${file.name}: ${result.data.url}`);
//       return result.data.url;
//     } catch (error: any) {
//       console.error('Error uploading to ImgBB:', error);
//       throw error;
//     }
//   };

//   const handleFileChange = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files || e.target.files.length === 0) return;

//     const file = e.target.files[0];
//     const localPreviewUrl = URL.createObjectURL(file);

//     console.log(`Handling file change for section ID: ${id}, Title: ${files.find(f => f.id === id)?.title}`);

//     // تحديث الحالة فورًا لعرض المعاينة
//     setFiles((prevFiles) =>
//       prevFiles.map((fileSection) =>
//         fileSection.id === id
//           ? {
//               ...fileSection,
//               previewUrls: [localPreviewUrl],
//               imageUrls: null,
//               isUploading: true,
//             }
//           : fileSection
//       )
//     );

//     // إضافة الرفع إلى قائمة الانتظار مع تأخير
//     uploadQueue.current = uploadQueue.current.then(async () => {
//       try {
//         await delay(1500); // تأخير 1.5 ثانية بين الطلبات
//         const imageUrl = await uploadImageToImgBB(file);
//         setFiles((prevFiles) =>
//           prevFiles.map((fileSection) =>
//             fileSection.id === id
//               ? {
//                   ...fileSection,
//                   imageUrls: imageUrl,
//                   previewUrls: [imageUrl],
//                   isUploading: false,
//                 }
//               : fileSection
//           )
//         );
//         URL.revokeObjectURL(localPreviewUrl);
//         console.log(`Successfully updated section ID: ${id} with ImgBB URL: ${imageUrl}`);
//       } catch (error: any) {
//         console.error(`Error uploading file for section ID: ${id}:`, error);
//         let errorMessage = 'حدث خطأ أثناء رفع الصورة. يرجى المحاولة مرة أخرى.';
//         if (error.message.includes('Rate limit reached')) {
//           errorMessage = 'تم تجاوز حد رفع الصور. يرجى المحاولة مجددًا بعد ساعة.';
//         }
//         setUploadMessage(errorMessage);
//         setShowToast(true);
//         setFiles((prevFiles) =>
//           prevFiles.map((fileSection) =>
//             fileSection.id === id
//               ? {
//                   ...fileSection,
//                   imageUrls: null,
//                   previewUrls: [],
//                   isUploading: false,
//                 }
//               : fileSection
//           )
//         );
//         URL.revokeObjectURL(localPreviewUrl);
//         // إعادة تعيين إدخال الملف
//         const index = files.findIndex((fileSection) => fileSection.id === id);
//         if (fileInputRefs.current[index]) {
//           fileInputRefs.current[index]!.value = '';
//           console.log(`Reset input after upload failure for section ID: ${id}`);
//         }
//       }
//     });
//   };

//   const handleMultipleFileChange = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files || e.target.files.length === 0) return;

//     const selectedFiles = Array.from(e.target.files);
//     const localPreviewUrls = selectedFiles.map((file) => URL.createObjectURL(file));

//     console.log(`Handling multiple file change for section ID: ${id}, Title: ${files.find(f => f.id === id)?.title}`);

//     setFiles((prevFiles) =>
//       prevFiles.map((fileSection) =>
//         fileSection.id === id
//           ? {
//               ...fileSection,
//               previewUrls: [...(fileSection.previewUrls || []), ...localPreviewUrls],
//               isUploading: true,
//             }
//           : fileSection
//       )
//     );

//     // إضافة الرفع إلى قائمة الانتظار مع تأخير لكل صورة
//     uploadQueue.current = uploadQueue.current.then(async () => {
//       try {
//         const imageUrls: string[] = [];
//         for (const file of selectedFiles) {
//           await delay(1500); // تأخير 1.5 ثانية بين كل صورة
//           const imageUrl = await uploadImageToImgBB(file);
//           imageUrls.push(imageUrl);
//         }
//         setFiles((prevFiles) =>
//           prevFiles.map((fileSection) =>
//             fileSection.id === id
//               ? {
//                   ...fileSection,
//                   imageUrls: [...(Array.isArray(fileSection.imageUrls) ? fileSection.imageUrls : []), ...imageUrls],
//                   previewUrls: [...(Array.isArray(fileSection.imageUrls) ? fileSection.imageUrls : []), ...imageUrls],
//                   isUploading: false,
//                 }
//               : fileSection
//           )
//         );
//         localPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
//         console.log(`Successfully updated section ID: ${id} with ImgBB URLs: ${imageUrls.join(', ')}`);
//       } catch (error: any) {
//         console.error(`Error uploading files for section ID: ${id}:`, error);
//         let errorMessage = 'حدث خطأ أثناء رفع الصور. يرجى المحاولة مرة أخرى.';
//         if (error.message.includes('Rate limit reached')) {
//           errorMessage = 'تم تجاوز حد رفع الصور. يرجى المحاولة مجددًا بعد ساعة.';
//         }
//         setUploadMessage(errorMessage);
//         setShowToast(true);
//         setFiles((prevFiles) =>
//           prevFiles.map((fileSection) =>
//             fileSection.id === id
//               ? {
//                   ...fileSection,
//                   imageUrls: null,
//                   previewUrls: [],
//                   isUploading: false,
//                 }
//               : fileSection
//           )
//         );
//         localPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
//         // إعادة تعيين إدخال الملف
//         const index = files.findIndex((fileSection) => fileSection.id === id);
//         if (fileInputRefs.current[index]) {
//           fileInputRefs.current[index]!.value = '';
//           console.log(`Reset input after upload failure for section ID: ${id}`);
//         }
//       }
//     });
//   };

//   const removePreviewImage = (fileId: string, previewIndex: number) => {
//     console.log(`Removing image at index ${previewIndex} for section ID: ${fileId}, Title: ${files.find(f => f.id === fileId)?.title}`);
//     setFiles((prevFiles) =>
//       prevFiles.map((fileSection) => {
//         if (fileSection.id === fileId) {
//           const updatedPreviews = [...fileSection.previewUrls];
//           updatedPreviews.splice(previewIndex, 1);
//           let updatedImageUrls = fileSection.imageUrls;
//           if (Array.isArray(updatedImageUrls)) {
//             updatedImageUrls = [...updatedImageUrls];
//             updatedImageUrls.splice(previewIndex, 1);
//           } else if (previewIndex === 0) {
//             updatedImageUrls = null;
//           }
//           return {
//             ...fileSection,
//             previewUrls: updatedPreviews,
//             imageUrls: updatedImageUrls,
//             isUploading: false,
//           };
//         }
//         return fileSection;
//       })
//     );

//     const index = files.findIndex((fileSection) => fileSection.id === fileId);
//     if (fileInputRefs.current[index]) {
//       fileInputRefs.current[index]!.value = '';
//       console.log(`Reset input for section ID: ${fileId}`);
//     }
//   };

//   const setInputRef = (index: number): RefCallback<HTMLInputElement> => {
//     return (element: HTMLInputElement | null) => {
//       fileInputRefs.current[index] = element;
//       if (element) {
//         console.log(`Input ref set for index: ${index}, Title: ${files[index]?.title}`);
//       }
//     };
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     const cleanInput = (input: string) => input.replace(/[^\w\s]/gi, '').trim();

//     if (!contract.trim() || !car.trim() || !plate.trim()) {
//       setUploadMessage('يرجى ملء جميع الحقول المطلوبة.');
//       setShowToast(true);
//       return;
//     }

//     if (!/^\d+$/.test(contract.trim())) {
//       setUploadMessage('رقم العقد يجب أن يحتوي على أرقام فقط.');
//       setShowToast(true);
//       return;
//     }

//     const contractNum = parseFloat(contract);
//     if (isNaN(contractNum)) {
//       setUploadMessage('رقم العقد يجب أن يكون رقمًا صالحًا.');
//       setShowToast(true);
//       return;
//     }

//     if (hasExitRecord) {
//       setUploadMessage('لا يمكن إضافة هذا التشييك لأنه تم تسجيل خروج لهذه السيارة لهذا العقد.');
//       setShowToast(true);
//       return;
//     }

//     const requiredImages = files.filter((fileSection) => fileSection.title !== 'صور اخرى');
//     const hasAnyRequiredImage = requiredImages.some((fileSection) => {
//       if (fileSection.imageUrls === null) return false;
//       if (Array.isArray(fileSection.imageUrls)) return fileSection.imageUrls.length > 0;
//       return fileSection.imageUrls !== '';
//     });
//     if (!hasAnyRequiredImage) {
//       setUploadMessage('يرجى رفع الصور المطلوبة.');
//       setShowToast(true);
//       return;
//     }

//     const missingImages = requiredImages.filter((fileSection) => {
//       if (fileSection.imageUrls === null) return true;
//       if (Array.isArray(fileSection.imageUrls)) return fileSection.imageUrls.length === 0;
//       return fileSection.imageUrls === '';
//     });
//     if (missingImages.length > 0) {
//       setUploadMessage(
//         `يجب رفع صورة واحدة على الأقل لكل من: ${missingImages.map((f) => f.title).join(', ')}.`
//       );
//       setShowToast(true);
//       return;
//     }

//     const isAnyUploading = files.some((fileSection) => fileSection.isUploading);
//     if (isAnyUploading) {
//       setUploadMessage('يرجى الانتظار حتى يكتمل رفع جميع الصور.');
//       setShowToast(true);
//       return;
//     }

//     if (!user || !user.name || !user.branch) {
//       setUploadMessage('بيانات الموظف غير متوفرة. يرجى تسجيل الدخول مرة أخرى.');
//       setShowToast(true);
//       return;
//     }

//     setIsUploading(true);
//     setUploadProgress(10);
//     setIsSuccess(false);

//     try {
//       const airtableData = {
//         fields: {} as Record<string, string | string[]>,
//       };

//       airtableData.fields['السيارة'] = cleanInput(car);
//       airtableData.fields['اللوحة'] = cleanInput(plate);
//       airtableData.fields['العقد'] = contractNum.toString();
//       airtableData.fields['نوع العملية'] = operationType;
//       airtableData.fields['الموظف'] = user.name;
//       airtableData.fields['الفرع'] = user.branch;

//       files.forEach((fileSection) => {
//         if (fileSection.imageUrls) {
//           airtableData.fields[fileSection.title] = fileSection.imageUrls;
//         }
//       });

//       console.log('Data to be sent to API:', JSON.stringify(airtableData, null, 2));

//       setUploadProgress(30);

//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 120000);

//       try {
//         const response = await fetch('/api/cheakout', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(airtableData),
//           signal: controller.signal,
//         });

//         clearTimeout(timeoutId);
//         setUploadProgress(90);

//         const result = await response.json();
//         console.log('API response:', result);

//         if (result.success) {
//           setUploadProgress(100);
//           setIsSuccess(true);
//           setShowToast(true);
//           setUploadMessage('تم بنجاح رفع التشييك');
//           setFiles(
//             fieldTitles.map((title, index) => ({
//               id: generateUniqueId(),
//               imageUrls: null,
//               title: title,
//               multiple: index === fieldTitles.length - 1,
//               previewUrls: [],
//               isUploading: false,
//             }))
//           );
//           setCar('');
//           setCarSearch('');
//           setPlate('');
//           setPlateSearch('');
//           setContract('');
//           setHasExitRecord(false);
//           fileInputRefs.current.forEach((ref, index) => {
//             if (ref) {
//               ref.value = '';
//               console.log(`Reset input after submit for index: ${index}, Title: ${files[index]?.title}`);
//             }
//           });
//         } else {
//           throw new Error(result.error || result.message || 'حدث خطأ أثناء رفع البيانات');
//         }
//       } catch (fetchError: any) {
//         clearTimeout(timeoutId);
//         console.error('Error during upload:', fetchError);
//         if (fetchError.name === 'AbortError') {
//           setUploadMessage('انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.');
//         } else {
//           setUploadMessage(
//             `فشلت عملية الرفع: ${fetchError.message || 'يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.'}`
//           );
//         }
//         setShowToast(true);
//         setUploadProgress(0);
//       }
//     } catch (error: any) {
//       console.error('Error preparing upload:', error);
//       setUploadMessage(error.message || 'حدث خطأ أثناء تجهيز البيانات للرفع.');
//       setShowToast(true);
//       setUploadProgress(0);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleCarSelect = (selectedCar: string) => {
//     setCar(selectedCar);
//     setCarSearch(selectedCar);
//     setShowCarList(false);
//   };

//   const handlePlateSelect = (selectedPlate: string) => {
//     setPlate(selectedPlate);
//     setPlateSearch(selectedPlate);
//     setShowPlateList(false);
//   };

//   return (
//     <div dir="rtl" className={`relative ${isDarkMode ? 'dark' : ''}`}>
//       <Navbar />
//       <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-2 transition-colors duration-200">
//         <div className="flex justify-center items-center">
//           <div className="w-full max-w-4xl p-3 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
//             <h1 className="text-xl sm:text-2xl font-semibold text-center text-gray-900 dark:text-gray-100 mb-4">
//               رفع بيانات تشييك الخروج
//             </h1>
//             <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-300">
//               ملاحظة: الصور الكبيرة قد تستغرق وقتًا أطول للرفع. الحد الأقصى لكل صورة هو 32 ميغابايت.
//             </p>
//             <form onSubmit={handleSubmit}>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
//                 <div ref={carInputRef} className="relative">
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
//                     السيارة *
//                   </label>
//                   <input
//                     type="text"
//                     value={carSearch}
//                     onChange={(e) => {
//                       setCarSearch(e.target.value);
//                       setShowCarList(true);
//                     }}
//                     onFocus={() => setShowCarList(true)}
//                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//                     placeholder="ابحث عن السيارة"
//                     required
//                   />
//                   {showCarList && filteredCars.length > 0 && (
//                     <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
//                       {filteredCars.map((carItem) => (
//                         <li
//                           key={carItem}
//                           onClick={() => handleCarSelect(carItem)}
//                           className="px-3 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
//                         >
//                           {carItem}
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                   {showCarList && carSearch && filteredCars.length === 0 && (
//                     <div className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg p-3 text-sm text-gray-500 dark:text-gray-400">
//                       لا توجد سيارات مطابقة
//                     </div>
//                   )}
//                 </div>
//                 <div ref={plateInputRef} className="relative">
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
//                     اللوحة *
//                   </label>
//                   <input
//                     type="text"
//                     value={plateSearch}
//                     onChange={(e) => {
//                       setPlateSearch(e.target.value);
//                       setShowPlateList(true);
//                     }}
//                     onFocus={() => setShowPlateList(true)}
//                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//                     placeholder="ابحث عن اللوحة"
//                     required
//                   />
//                   {showPlateList && filteredPlates.length > 0 && (
//                     <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
//                       {filteredPlates.map((plateItem) => (
//                         <li
//                           key={plateItem}
//                           onClick={() => handlePlateSelect(plateItem)}
//                           className="px-3 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
//                         >
//                           {plateItem}
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                   {showPlateList && plateSearch && filteredPlates.length === 0 && (
//                     <div className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg p-3 text-sm text-gray-500 dark:text-gray-400">
//                       لا توجد لوحات مطابقة
//                     </div>
//                   )}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
//                     العقد *
//                   </label>
//                   <input
//                     type="text"
//                     inputMode="numeric"
//                     value={contract}
//                     onChange={(e) => setContract(e.target.value)}
//                     className={`w-full px-3 py-2 border ${
//                       hasExitRecord ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
//                     } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
//                     placeholder="أدخل رقم العقد"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
//                     نوع العملية
//                   </label>
//                   <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
//                     {operationType}
//                   </div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
//                 {files.map((fileSection, index) => (
//                   <div key={fileSection.id} className="mb-3">
//                     <div className="font-semibold text-gray-800 dark:text-gray-100 text-base mb-1">
//                       {fileSection.title} {fileSection.title === 'صور اخرى' ? '' : '*'}
//                     </div>
//                     {fileSection.previewUrls && fileSection.previewUrls.length > 0 ? (
//                       <div
//                         className={`relative border-2 border-gray-300 dark:border-gray-600 rounded-md p-2 ${
//                           fileSection.multiple ? 'h-auto' : 'h-28 sm:h-32'
//                         }`}
//                       >
//                         {fileSection.multiple ? (
//                           <div className="grid grid-cols-2 gap-2">
//                             {fileSection.previewUrls.map((previewUrl, previewIndex) => (
//                               <div key={previewIndex} className="relative h-20 sm:h-24">
//                                 <img
//                                   src={previewUrl}
//                                   alt={`صورة ${previewIndex + 1}`}
//                                   className="h-full w-full object-cover rounded"
//                                 />
//                                 <button
//                                   type="button"
//                                   onClick={() => removePreviewImage(fileSection.id, previewIndex)}
//                                   className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md"
//                                   aria-label="حذف الصورة"
//                                 >
//                                   <span className="text-lg font-bold">×</span>
//                                 </button>
//                               </div>
//                             ))}
//                             <label
//                               htmlFor={`file-input-${fileSection.id}`}
//                               className="h-20 sm:h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded flex items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400"
//                             >
//                               <span className="text-gray-500 dark:text-gray-400 text-xl font-bold">+</span>
//                             </label>
//                           </div>
//                         ) : (
//                           <div className="relative h-full w-full flex items-center justify-center">
//                             <img
//                               src={fileSection.previewUrls[0]}
//                               alt={fileSection.title}
//                               className="max-h-full max-w-full object-contain rounded"
//                             />
//                             <button
//                               type="button"
//                               onClick={() => removePreviewImage(fileSection.id, 0)}
//                               className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md z-10"
//                               aria-label="حذف الصورة"
//                             >
//                               <span className="text-lg font-bold">×</span>
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     ) : (
//                       <label
//                         htmlFor={`file-input-${fileSection.id}`}
//                         className="cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-2 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors flex flex-col items-center justify-center h-28 sm:h-32"
//                       >
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           className="h-7 w-7 text-gray-400 dark:text-gray-500 mb-1"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
//                           />
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
//                           />
//                         </svg>
//                         <span className="text-sm text-gray-500 dark:text-gray-400">
//                           {fileSection.multiple ? 'انقر لاختيار عدة صور' : 'انقر لالتقاط صورة'}
//                         </span>
//                       </label>
//                     )}
//                     <input
//                       id={`file-input-${fileSection.id}`}
//                       ref={setInputRef(index)}
//                       type="file"
//                       accept="image/*"
//                       capture={fileSection.multiple ? undefined : 'environment'}
//                       multiple={fileSection.multiple}
//                       onChange={(e) =>
//                         fileSection.multiple
//                           ? handleMultipleFileChange(fileSection.id, e)
//                           : handleFileChange(fileSection.id, e)
//                       }
//                       className="hidden"
//                     />
//                   </div>
//                 ))}
//               </div>

//               <div className="mb-4 text-center mt-4">
//                 <button
//                   type="submit"
//                   disabled={isUploading || hasExitRecord}
//                   className={`w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none text-lg font-medium ${
//                     isUploading || hasExitRecord ? 'bg-gray-400' : ''
//                   }`}
//                 >
//                   {isUploading ? 'جاري الرفع...' : 'رفع البيانات'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>

//         {(isUploading || isSuccess) && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center">
//               {isUploading ? (
//                 <>
//                   <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
//                   <span className="text-gray-600 dark:text-gray-300 text-lg">جاري الرفع...</span>
//                 </>
//               ) : isSuccess ? (
//                 <>
//                   <FaCheckCircle className="text-green-500 text-5xl mb-4" />
//                   <span className="text-gray-600 dark:text-gray-300 text-lg">تم الرفع بنجاح</span>
//                 </>
//               ) : null}
//             </div>
//           </div>
//         )}

//         {showToast && (
//           <div
//             className={`fixed top-5 right-5 px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in-out ${
//               uploadMessage.includes('بنجاح') ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
//             }`}
//           >
//             {uploadMessage}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



import Navbar from '@/public/components/navbar';
import { useState, useRef, useEffect, RefCallback } from 'react';
import { FaCheckCircle } from 'react-icons/fa';

// دالة لتنظيف العناوين مع دعم الأحرف العربية وضمان التفرد
const sanitizeTitle = (title: string, index: number) => {
  const cleanTitle = title.replace(/\s+/g, '-').replace(/[^\u0600-\u06FF\w-]/g, '');
  return `${cleanTitle}-${index}`;
};

interface FileSection {
  id: string;
  imageUrls: string | string[] | null;
  title: string;
  multiple: boolean;
  previewUrls: string[];
  isUploading: boolean;
}

interface User {
  id: string;
  name: string;
  EmID: number;
  role: string;
  branch: string;
}

interface AirtableRecord {
  id: string;
  fields: {
    العقد?: number | null;
    السيارة?: string | null;
    اللوحة?: string | null;
    'نوع العملية'?: string | null;
    [key: string]: any; // السماح بحقول إضافية
  };
}

interface ApiResponse {
  success: boolean;
  message: string;
  results: AirtableRecord[];
  total: number;
  page: number;
  pageSize: number;
  error?: string;
  details?: any;
}

interface Car {
  id: string;
  name: string;
}

interface Plate {
  id: string;
  name: string;
}

export default function UploadPage() {
  const fieldTitles = [
    'الصدام الخلفي مع الانوار',
    'سطح الشنطة مع الزجاج الخلفي',
    'محتويات الشنطة مع الاستبنة',
    'التندة',
    'الرفرف الخلفي يمين',
    'الابواب اليمين مع توضيح السمكة',
    'الرفرف الامامي يمين',
    'الصدام الامامي مع الشنب',
    'الكبوت مع الشبك',
    'الزجاج الامامي',
    'الرفرف الامامي يسار',
    'الابواب اليسار مع توضيح السمكة',
    'الرفرف الخلفي يسار',
    'المقعد الامامي يسار',
    'المقعد الامامي يمين',
    'المقعد الخلفي مع خلفية المقاعد الامامية',
    'طفاية الحريق',
    'العداد',
    'صور اخرى',
  ];

  const initialFiles: FileSection[] = fieldTitles.map((title, index) => ({
    id: `file-section-${sanitizeTitle(title, index)}`,
    imageUrls: null,
    title: title,
    multiple: index === fieldTitles.length - 1,
    previewUrls: [],
    isUploading: false,
  }));

  const [files, setFiles] = useState<FileSection[]>(initialFiles);
  const [car, setCar] = useState<string>('');
  const [carSearch, setCarSearch] = useState<string>('');
  const [cars, setCars] = useState<Car[]>([]);
  const [showCarList, setShowCarList] = useState<boolean>(false);
  const [plate, setPlate] = useState<string>('');
  const [plateSearch, setPlateSearch] = useState<string>('');
  const [plates, setPlates] = useState<Plate[]>([]);
  const [showPlateList, setShowPlateList] = useState<boolean>(false);
  const [contract, setContract] = useState<string>('');
  const [operationType] = useState<string>('خروج');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [hasExitRecord, setHasExitRecord] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoadingCars, setIsLoadingCars] = useState<boolean>(true);
  const [isLoadingPlates, setIsLoadingPlates] = useState<boolean>(true);

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const carInputRef = useRef<HTMLDivElement>(null);
  const plateInputRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const uploadQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    fileInputRefs.current = Array(files.length).fill(null);
  }, [files.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (carInputRef.current && !carInputRef.current.contains(event.target as Node)) {
        setShowCarList(false);
      }
      if (plateInputRef.current && !plateInputRef.current.contains(event.target as Node)) {
        setShowPlateList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showToast && !hasExitRecord) {
      const timer = setTimeout(() => {
        setShowToast(false);
        setUploadMessage('');
        setIsSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast, hasExitRecord]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (contract.trim()) {
      fetchPreviousRecord();
    } else {
      setHasExitRecord(false);
      setUploadMessage('');
      setShowToast(false);
    }
  }, [contract]);

  // جلب قائمة السيارات من Airtable عبر /api/addcars
  useEffect(() => {
    const fetchCars = async () => {
      setIsLoadingCars(true);
      try {
        const response = await fetch('/api/addcars', { method: 'GET' });
        const data = await response.json();
        if (data.success) {
          const fetchedCars = data.results.map((record: any) => ({
            id: record.id,
            name: record.fields.Name,
          }));
          setCars(fetchedCars);
          console.log('Fetched cars:', fetchedCars);
        } else {
          setUploadMessage('فشل في جلب قائمة السيارات.');
          setShowToast(true);
        }
      } catch (error: any) {
        console.error('Error fetching cars:', error);
        setUploadMessage('حدث خطأ أثناء جلب قائمة السيارات.');
        setShowToast(true);
      } finally {
        setIsLoadingCars(false);
      }
    };

    fetchCars();
  }, []);

  // جلب قائمة اللوحات من Airtable عبر /api/addlicense
  useEffect(() => {
    const fetchPlates = async () => {
      setIsLoadingPlates(true);
      try {
        const response = await fetch('/api/addlicense', { method: 'GET' });
        const data = await response.json();
        if (data.success) {
          const fetchedPlates = data.results.map((record: any) => ({
            id: record.id,
            name: record.fields.Name,
          }));
          setPlates(fetchedPlates);
          console.log('Fetched plates:', fetchedPlates);
        } else {
          setUploadMessage('فشل في جلب قائمة اللوحات.');
          setShowToast(true);
        }
      } catch (error: any) {
        console.error('Error fetching plates:', error);
        setUploadMessage('حدث خطأ أثناء جلب قائمة اللوحات.');
        setShowToast(true);
      } finally {
        setIsLoadingPlates(false);
      }
    };

    fetchPlates();
  }, []);

  const restrictToNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const charCode = e.charCode;
    // السماح فقط بالأرقام (charCode بين 48 و57)
    if (charCode < 48 || charCode > 57) {
      e.preventDefault();
    }
  };


  const fetchPreviousRecord = async () => {
    if (!contract.trim()) {
      setHasExitRecord(false);
      setUploadMessage('رقم العقد مطلوب للبحث.');
      setShowToast(true);
      return;
    }
  
    setIsSearching(true);
    setUploadMessage('');
  
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
  
    try {
      const response = await fetch(`/api/history?contractNumber=${encodeURIComponent(contract)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortControllerRef.current.signal,
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `فشل في جلب السجل السابق (حالة: ${response.status})`);
      }
  
      const data: ApiResponse = await response.json();
      if (data.success && data.results.length > 0) {
        const exitRecord = data.results.find((record) => record.fields['نوع العملية'] === 'خروج');
        if (exitRecord) {
          setHasExitRecord(true);
          setUploadMessage('لا يمكن إضافة هذا التشييك لأنه تم تسجيل خروج لهذه السيارة لهذا العقد.');
          setShowToast(true);
        } else {
          setHasExitRecord(false);
          // لا يتم إظهار toast هنا لأن عدم وجود سجل خروج هو الحالة الطبيعية
        }
      } else {
        setHasExitRecord(false);
        // لا يتم إظهار toast هنا لأن عدم وجود سجل سابق هو الحالة الطبيعية
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
      console.error('Error fetching previous record:', err);
      setUploadMessage(err.message || 'حدث خطأ أثناء جلب السجل السابق.');
      setShowToast(true);
      setHasExitRecord(false);
    } finally {
      setIsSearching(false);
    }
  };

  // تحسين التصفية لدعم الأحرف العربية
  const normalizeArabic = (text: string) => {
    return text
      .replace(/[\u0617-\u061A\u064B-\u065F]/g, '') // إزالة التشكيل
      .replace(/\s+/g, ' ') // تقليل المسافات
      .trim();
  };

  const filteredCars = cars.filter((carItem) => {
    const normalizedCar = normalizeArabic(carItem.name).toLowerCase();
    const normalizedSearch = normalizeArabic(carSearch).toLowerCase();
    const matches = normalizedCar.includes(normalizedSearch);
    console.log('Filtering cars:', { car: carItem.name, search: carSearch, matches });
    return matches;
  });

  const filteredPlates = plates.filter((plateItem) => {
    const normalizedPlate = normalizeArabic(plateItem.name).toLowerCase();
    const normalizedSearch = normalizeArabic(plateSearch).toLowerCase();
    const matches = normalizedPlate.includes(normalizedSearch);
    console.log('Filtering plates:', { plate: plateItem.name, search: plateSearch, matches });
    return matches;
  });


  const DO_ACCESS_KEY = process.env.DO_ACCESS_KEY || 'DO80192ACFDRB9F6LGW8'; // استخدام متغيرات البيئة
  const DO_SECRET_KEY = process.env.DO_SECRET_KEY || 'd4DkpWlzchg7gBFxIoBjqFk0R2WXZZOY4lzV/ZOO7yM'; // استخدام متغيرات البيئة
  const DO_SPACE_NAME = 'uploadcarimages';
  const DO_REGION = 'sgp1';
  const DO_ENDPOINT = `https://uploadcarimages.sgp1.digitaloceanspaces.com`;
  
  // إعداد AWS SDK لـ DigitalOcean Spaces
  const s3 = new AWS.S3({
    accessKeyId: DO_ACCESS_KEY,
    secretAccessKey: DO_SECRET_KEY,
    endpoint: DO_ENDPOINT,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
  });
  
   const config = {
    api: {
      bodyParser: {
        sizeLimit: '100mb', // دعم ملفات تصل إلى 100 ميغابايت
      },
    },
  };
  
  const uploadImageToBackend = async (file: File): Promise<string> => {
    const fileName = `${uuidv4()}-${file.name}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const params = {
      Bucket: DO_SPACE_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read', // جعل الصورة عامة للوصول إليها
    };


    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('الملف ليس صورة صالحة. يرجى رفع ملف بصيغة JPEG أو PNG.');
      }
      if (file.size > 32 * 1024 * 1024) {
        throw new Error('حجم الصورة كبير جدًا (الحد الأقصى 32 ميغابايت).');
      }

      const formData = new FormData();
      formData.append('image', file);

      console.log(`Uploading ${file.name} to backend...`);
      // const response = await fetch('/api/upload-image', {
      //   method: 'POST',
      //   body: formData,
      // });

      // const result = await response.json();

const result =  await    s3.upload(params).promise();
      return result.Location; // URL للصورة المرفوعة
   
    } catch (error: any) {
      console.error('Error uploading to backend:', error);
      throw error;
    }
  };

  const handleFileChange = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const localPreviewUrl = URL.createObjectURL(file);

    console.log(`Handling file change for section ID: ${id}, Title: ${files.find((f) => f.id === id)?.title}`);

    setFiles((prevFiles) =>
      prevFiles.map((fileSection) =>
        fileSection.id === id
          ? {
              ...fileSection,
              previewUrls: [localPreviewUrl],
              imageUrls: null,
              isUploading: true,
            }
          : fileSection
      )
    );

    uploadQueue.current = uploadQueue.current.then(async () => {
      try {
        const imageUrl = await uploadImageToBackend(file);
        setFiles((prevFiles) =>
          prevFiles.map((fileSection) =>
            fileSection.id === id
              ? {
                  ...fileSection,
                  imageUrls: imageUrl,
                  previewUrls: [imageUrl],
                  isUploading: false,
                }
              : fileSection
          )
        );
        URL.revokeObjectURL(localPreviewUrl);
        console.log(`Successfully updated section ID: ${id} with backend URL: ${imageUrl}`);
      } catch (error: any) {
        console.error(`Error uploading file for section ID: ${id}:`, error);
        let errorMessage = 'حدث خطأ أثناء رفع الصورة. يرجى المحاولة مرة أخرى.';
        if (error.message.includes('Rate limit')) {
          errorMessage = 'تم تجاوز حد رفع الصور. يرجى المحاولة مجددًا لاحقًا.';
        }
        setUploadMessage(errorMessage);
        setShowToast(true);
        setFiles((prevFiles) =>
          prevFiles.map((fileSection) =>
            fileSection.id === id
              ? {
                  ...fileSection,
                  imageUrls: null,
                  previewUrls: [],
                  isUploading: false,
                }
              : fileSection
          )
        );
        URL.revokeObjectURL(localPreviewUrl);
        const index = files.findIndex((fileSection) => fileSection.id === id);
        if (fileInputRefs.current[index]) {
          fileInputRefs.current[index]!.value = '';
          console.log(`Reset input after upload failure for section ID: ${id}`);
        }
      }
    });
  };

  const handleMultipleFileChange = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const selectedFiles = Array.from(e.target.files);
    const localPreviewUrls = selectedFiles.map((file) => URL.createObjectURL(file));

    console.log(`Handling multiple file change for section ID: ${id}, Title: ${files.find((f) => f.id === id)?.title}`);

    setFiles((prevFiles) =>
      prevFiles.map((fileSection) =>
        fileSection.id === id
          ? {
              ...fileSection,
              previewUrls: [...(fileSection.previewUrls || []), ...localPreviewUrls],
              isUploading: true,
            }
          : fileSection
      )
    );

    uploadQueue.current = uploadQueue.current.then(async () => {
      try {
        const imageUrls: string[] = [];
        for (const file of selectedFiles) {
          const imageUrl = await uploadImageToBackend(file);
          imageUrls.push(imageUrl);
        }
        setFiles((prevFiles) =>
          prevFiles.map((fileSection) =>
            fileSection.id === id
              ? {
                  ...fileSection,
                  imageUrls: [...(Array.isArray(fileSection.imageUrls) ? fileSection.imageUrls : []), ...imageUrls],
                  previewUrls: [...(Array.isArray(fileSection.imageUrls) ? fileSection.imageUrls : []), ...imageUrls],
                  isUploading: false,
                }
              : fileSection
          )
        );
        localPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
        console.log(`Successfully updated section ID: ${id} with backend URLs: ${imageUrls.join(', ')}`);
      } catch (error: any) {
        console.error(`Error uploading files for section ID: ${id}:`, error);
        let errorMessage = 'حدث خطأ أثناء رفع الصور. يرجى المحاولة مرة أخرى.';
        if (error.message.includes('Rate limit')) {
          errorMessage = 'تم تجاوز حد رفع الصور. يرجى المحاولة مجددًا لاحقًا.';
        }
        setUploadMessage(errorMessage);
        setShowToast(true);
        setFiles((prevFiles) =>
          prevFiles.map((fileSection) =>
            fileSection.id === id
              ? {
                  ...fileSection,
                  imageUrls: null,
                  previewUrls: [],
                  isUploading: false,
                }
              : fileSection
          )
        );
        localPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
        const index = files.findIndex((fileSection) => fileSection.id === id);
        if (fileInputRefs.current[index]) {
          fileInputRefs.current[index]!.value = '';
          console.log(`Reset input after upload failure for section ID: ${id}`);
        }
      }
    });
  };

  const removePreviewImage = (fileId: string, previewIndex: number) => {
    console.log(`Removing image at index ${previewIndex} for section ID: ${fileId}, Title: ${files.find((f) => f.id === fileId)?.title}`);
    setFiles((prevFiles) =>
      prevFiles.map((fileSection) => {
        if (fileSection.id === fileId) {
          const updatedPreviews = [...fileSection.previewUrls];
          updatedPreviews.splice(previewIndex, 1);
          let updatedImageUrls = fileSection.imageUrls;
          if (Array.isArray(updatedImageUrls)) {
            updatedImageUrls = [...updatedImageUrls];
            updatedImageUrls.splice(previewIndex, 1);
          } else if (previewIndex === 0) {
            updatedImageUrls = null;
          }
          return {
            ...fileSection,
            previewUrls: updatedPreviews,
            imageUrls: updatedImageUrls,
            isUploading: false,
          };
        }
        return fileSection;
      })
    );

    const index = files.findIndex((fileSection) => fileSection.id === fileId);
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = '';
      console.log(`Reset input for section ID: ${fileId}`);
    }
  };

  const setInputRef = (index: number): RefCallback<HTMLInputElement> => {
    return (element: HTMLInputElement | null) => {
      fileInputRefs.current[index] = element;
      if (element) {
        console.log(`Input ref set for index: ${index}, Title: ${files[index]?.title}`);
      }
    };
  };

  const handleCarSelect = (selectedCar: string) => {
    console.log('Selected car:', selectedCar);
    setCar(selectedCar);
    setCarSearch(selectedCar);
    setShowCarList(false);
  };

  const handlePlateSelect = (selectedPlate: string) => {
    console.log('Selected plate:', selectedPlate);
    setPlate(selectedPlate);
    setPlateSearch(selectedPlate);
    setShowPlateList(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log('Submitting form with:', { car, plate, contract });

    if (!contract.trim() || !car.trim() || !plate.trim()) {
      setUploadMessage('يرجى ملء جميع الحقول المطلوبة.');
      setShowToast(true);
      return;
    }

    if (!/^\d+$/.test(contract.trim())) {
      setUploadMessage('رقم العقد يجب أن يحتوي على أرقام فقط.');
      setShowToast(true);
      return;
    }

    const contractNum = parseFloat(contract);
    if (isNaN(contractNum)) {
      setUploadMessage('رقم العقد يجب أن يكون رقمًا صالحًا.');
      setShowToast(true);
      return;
    }

    if (hasExitRecord) {
      setUploadMessage('لا يمكن إضافة هذا التشييك لأنه تم تسجيل خروج لهذه السيارة لهذا العقد.');
      setShowToast(true);
      return;
    }

    const requiredImages = files.filter((fileSection) => fileSection.title !== 'صور اخرى');
    const hasAnyRequiredImage = requiredImages.some((fileSection) => {
      if (fileSection.imageUrls === null) return false;
      if (Array.isArray(fileSection.imageUrls)) return fileSection.imageUrls.length > 0;
      return fileSection.imageUrls !== '';
    });
    if (!hasAnyRequiredImage) {
      setUploadMessage('يرجى رفع الصور المطلوبة.');
      setShowToast(true);
      return;
    }

    const missingImages = requiredImages.filter((fileSection) => {
      if (fileSection.imageUrls === null) return true;
      if (Array.isArray(fileSection.imageUrls)) return fileSection.imageUrls.length === 0;
      return fileSection.imageUrls === '';
    });
    if (missingImages.length > 0) {
      setUploadMessage(
        `يجب رفع صورة واحدة على الأقل لكل من: ${missingImages.map((f) => f.title).join(', ')}.`
      );
      setShowToast(true);
      return;
    }

    const isAnyUploading = files.some((fileSection) => fileSection.isUploading);
    if (isAnyUploading) {
      setUploadMessage('يرجى الانتظار حتى يكتمل رفع جميع الصور.');
      setShowToast(true);
      return;
    }

    if (!user || !user.name || !user.branch) {
      setUploadMessage('بيانات الموظف غير متوفرة. يرجى تسجيل الدخول مرة أخرى.');
      setShowToast(true);
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setIsSuccess(false);

    try {
      const airtableData = {
        fields: {} as Record<string, string | string[]>,
      };

      airtableData.fields['السيارة'] = car; // استخدام القيمة الخام
      airtableData.fields['اللوحة'] = plate; // استخدام القيمة الخام
      airtableData.fields['العقد'] = contractNum.toString();
      airtableData.fields['نوع العملية'] = operationType;
      airtableData.fields['الموظف'] = user.name;
      airtableData.fields['الفرع'] = user.branch;

      files.forEach((fileSection) => {
        if (fileSection.imageUrls) {
          airtableData.fields[fileSection.title] = fileSection.imageUrls;
        }
      });

      console.log('Data to be sent to API:', JSON.stringify(airtableData, null, 2));

      setUploadProgress(30);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      try {
        const response = await fetch('/api/cheakout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(airtableData),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        setUploadProgress(90);

        const result = await response.json();
        console.log('API response:', result);

        if (result.success) {
          setUploadProgress(100);
          setIsSuccess(true);
          setShowToast(true);
          setUploadMessage('تم بنجاح رفع التشييك');
          setFiles(
            fieldTitles.map((title, index) => ({
              id: `file-section-${sanitizeTitle(title, index)}`,
              imageUrls: null,
              title: title,
              multiple: index === fieldTitles.length - 1,
              previewUrls: [],
              isUploading: false,
            }))
          );
          setCar('');
          setCarSearch('');
          setPlate('');
          setPlateSearch('');
          setContract('');
          setHasExitRecord(false);
          fileInputRefs.current.forEach((ref, index) => {
            if (ref) {
              ref.value = '';
              console.log(`Reset input after submit for index: ${index}, Title: ${files[index]?.title}`);
            }
          });
        } else {
          throw new Error(result.error || result.message || 'حدث خطأ أثناء رفع البيانات');
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        console.error('Error during upload:', fetchError);
        if (fetchError.name === 'AbortError') {
          setUploadMessage('انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.');
        } else {
          setUploadMessage(
            `فشلت عملية الرفع: ${fetchError.message || 'يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.'}`
          );
        }
        setUploadProgress(0);
        setShowToast(true);
      }
    } catch (error: any) {
      console.error('Error preparing upload:', error);
      setUploadMessage(error.message || 'حدث خطأ أثناء تجهيز البيانات للرفع.');
      setShowToast(true);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div dir="rtl" className={`relative ${isDarkMode ? 'dark' : ''}`}>
      <Navbar />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-2 transition-colors duration-200">
        <div className="flex justify-center items-center">
          <div className="w-full max-w-4xl p-3 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h1 className="text-xl sm:text-2xl font-semibold text-center text-gray-900 dark:text-gray-100 mb-4">
              رفع بيانات تشييك الخروج
            </h1>
            <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-300">
              ملاحظة: الصور الكبيرة قد تستغرق وقتًا أطول للرفع. الحد الأقصى لكل صورة هو 32 ميغابايت.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div ref={carInputRef} className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    السيارة *
                  </label>
                  {isLoadingCars ? (
                    <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                      جاري تحميل قائمة السيارات...
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={carSearch}
                      onChange={(e) => {
                        setCarSearch(e.target.value);
                        setShowCarList(true);
                        console.log('Car search input:', e.target.value);
                      }}
                      onFocus={() => setShowCarList(true)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="ابحث عن السيارة"
                      required
                    />
                  )}
                  {showCarList && filteredCars.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                      {filteredCars.map((carItem) => (
                        <li
                          key={carItem.id}
                          onClick={() => handleCarSelect(carItem.name)}
                          className="px-3 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
                        >
                          {carItem.name}
                        </li>
                      ))}
                    </ul>
                  )}
                  {showCarList && carSearch && filteredCars.length === 0 && (
                    <div className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg p-3 text-sm text-gray-500 dark:text-gray-400">
                      لا توجد سيارات مطابقة
                    </div>
                  )}
                </div>
                <div ref={plateInputRef} className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    اللوحة *
                  </label>
                  {isLoadingPlates ? (
                    <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                      جاري تحميل قائمة اللوحات...
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={plateSearch}
                      onChange={(e) => {
                        setPlateSearch(e.target.value);
                        setShowPlateList(true);
                        console.log('Plate search input:', e.target.value);
                      }}
                      onFocus={() => setShowPlateList(true)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="ابحث عن اللوحة"
                      required
                    />
                  )}
                  {showPlateList && filteredPlates.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                      {filteredPlates.map((plateItem) => (
                        <li
                          key={plateItem.id}
                          onClick={() => handlePlateSelect(plateItem.name)}
                          className="px-3 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
                        >
                          {plateItem.name}
                        </li>
                      ))}
                    </ul>
                  )}
                  {showPlateList && plateSearch && filteredPlates.length === 0 && (
                    <div className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg p-3 text-sm text-gray-500 dark:text-gray-400">
                      لا توجد لوحات مطابقة
                    </div>
                  )}
                </div>
                <div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
    العقد *
  </label>
  <input
    type="text"
    inputMode="numeric"
    value={contract}
    onChange={(e) => setContract(e.target.value)}
    onKeyPress={restrictToNumbers} // إضافة الحدث لمنع الحروف والرموز
    className={`w-full px-3 py-2 border ${
      hasExitRecord ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
    placeholder="أدخل رقم العقد"
    required
  />
</div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    نوع العملية
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    {operationType}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                {files.map((fileSection, index) => (
                  <div key={fileSection.id} className="mb-3">
                    <div className="font-semibold text-gray-800 dark:text-gray-100 text-base mb-1">
                      {fileSection.title} {fileSection.title === 'صور اخرى' ? '' : '*'}
                    </div>
                    {fileSection.previewUrls && fileSection.previewUrls.length > 0 ? (
                      <div
                        className={`relative border-2 border-gray-300 dark:border-gray-600 rounded-md p-2 ${
                          fileSection.multiple ? 'h-auto' : 'h-28 sm:h-32'
                        }`}
                      >
                        {fileSection.multiple ? (
                          <div className="grid grid-cols-2 gap-2">
                            {fileSection.previewUrls.map((previewUrl, previewIndex) => (
                              <div key={previewIndex} className="relative h-20 sm:h-24">
                                <img
                                  src={previewUrl}
                                  alt={`صورة ${previewIndex + 1}`}
                                  className="h-full w-full object-cover rounded"
                                />
                                <button
                                  type="button"
                                  onClick={() => removePreviewImage(fileSection.id, previewIndex)}
                                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md"
                                  aria-label="حذف الصورة"
                                >
                                  <span className="text-lg font-bold">×</span>
                                </button>
                              </div>
                            ))}
                            <label
                              htmlFor={`file-input-${fileSection.id}`}
                              className="h-20 sm:h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded flex items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400"
                            >
                              <span className="text-gray-500 dark:text-gray-400 text-xl font-bold">+</span>
                            </label>
                          </div>
                        ) : (
                          <div className="relative h-full w-full flex items-center justify-center">
                            <img
                              src={fileSection.previewUrls[0]}
                              alt={fileSection.title}
                              className="max-h-full max-w-full object-contain rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removePreviewImage(fileSection.id, 0)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md z-10"
                              aria-label="حذف الصورة"
                            >
                              <span className="text-lg font-bold">×</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <label
                        htmlFor={`file-input-${fileSection.id}`}
                        className="cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-2 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors flex flex-col items-center justify-center h-28 sm:h-32"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-7 w-7 text-gray-400 dark:text-gray-500 mb-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {fileSection.multiple ? 'انقر لاختيار عدة صور' : 'انقر لالتقاط صورة'}
                        </span>
                      </label>
                    )}
                    <input
                      id={`file-input-${fileSection.id}`}
                      ref={setInputRef(index)}
                      type="file"
                      accept="image/*"
                      capture={fileSection.multiple ? undefined : 'environment'}
                      multiple={fileSection.multiple}
                      onChange={(e) =>
                        fileSection.multiple
                          ? handleMultipleFileChange(fileSection.id, e)
                          : handleFileChange(fileSection.id, e)
                      }
                      className="hidden"
                    />
                  </div>
                ))}
              </div>

              <div className="mb-4 text-center mt-4">
                <button
                  type="submit"
                  disabled={isUploading || hasExitRecord || isLoadingCars || isLoadingPlates}
                  className={`w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none text-lg font-medium ${
                    isUploading || hasExitRecord || isLoadingCars || isLoadingPlates ? 'bg-gray-400' : ''
                  }`}
                >
                  {isUploading ? 'جاري الرفع...' : 'رفع البيانات'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {(isUploading || isSuccess) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center">
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                  <span className="text-gray-600 dark:text-gray-300 text-lg">جاري الرفع...</span>
                </>
              ) : isSuccess ? (
                <>
                  <FaCheckCircle className="text-green-500 text-5xl mb-4" />
                  <span className="text-gray-600 dark:text-gray-300 text-lg">تم الرفع بنجاح</span>
                </>
              ) : null}
            </div>
          </div>
        )}

        {showToast && (
          <div
            className={`fixed top-5 right-5 px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in-out ${
              uploadMessage.includes('بنجاح') ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {uploadMessage}
          </div>
        )}
      </div>
    </div>
  );
}