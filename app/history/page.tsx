// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import Navbar from '@/public/components/navbar';
// import { FaHistory, FaSearch } from 'react-icons/fa';
// import Image from 'next/image';
// import { carList } from '@/lib/car';
// import { licenseList } from '@/lib/License';
// import { useRouter } from 'next/navigation';

// interface Record {
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
//   results: Record[];
//   total: number;
//   page: number;
//   pageSize: number;
//   error?: string;
//   details?: any;
// }

// const fieldTitles = [
//   'العداد',
//   'الابواب اليمين مع توضيح السمكة',
//   'الرفرف الامامي يمين',
//   'الرفرف الخلفي يمين',
//   'الصدام الخلفي مع الانوار',
//   'سطح الشنطة مع الزجاج الخلفي',
//   'التندة',
//   'الرفرف الخلفي يسار',
//   'الابواب اليسار مع توضيح السمكة',
//   'الرفرف الامامي يسار',
//   'الصدام الامامي مع الشنب',
//   'الكبوت مع الشبك',
//   'الزجاج الامامي',
//   'محتويات الشنطة مع الاستبنة',
//   'طفاية الحريق',
//   'المقعد الامامي يمين',
//   'المقعد الامامي يسار',
//   'المقعد الخلفي مع خلفية المقاعد الامامية',
//   'صور اخرى',
// ];

// export default function HistoryPage() {
//   const [records, setRecords] = useState<Record[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedImage, setSelectedImage] = useState<string | null>(null);
//   const [pageSearch, setPageSearch] = useState('');
//   const [contractSearch, setContractSearch] = useState('');
//   const [operationTypeFilter, setOperationTypeFilter] = useState('');
//   const [operationTypeSearch, setOperationTypeSearch] = useState('');
//   const [showOperationTypeList, setShowOperationTypeList] = useState(false);
//   const [carFilter, setCarFilter] = useState('');
//   const [carSearch, setCarSearch] = useState('');
//   const [showCarList, setShowCarList] = useState(false);
//   const [plateFilter, setPlateFilter] = useState('');
//   const [plateSearch, setPlateSearch] = useState('');
//   const [showPlateList, setShowPlateList] = useState(false);
//   const [page, setPage] = useState(1);
//   const [totalRecords, setTotalRecords] = useState(0);
//   const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
//   const pageSize = 50;

//   const operationTypeRef = useRef<HTMLDivElement>(null);
//   const carFilterRef = useRef<HTMLDivElement>(null);
//   const plateFilterRef = useRef<HTMLDivElement>(null);
//   const router = useRouter();

//   const operationTypes = ['دخول', 'خروج'];

//   // التحقق من تسجيل الدخول ودور المستخدم
//   useEffect(() => {
//     const storedUser = localStorage.getItem('user');
//     if (!storedUser) {
//       router.push('/login');
//     }
//     // إزالة التحقق من user.role !== 'admin'
//   }, [router]);

//   // الكشف عن الوضع (فاتح/داكن)
//   useEffect(() => {
//     const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
//     setIsDarkMode(mediaQuery.matches);

//     const handleChange = (e: MediaQueryListEvent) => {
//       setIsDarkMode(e.matches);
//     };

//     mediaQuery.addEventListener('change', handleChange);
//     return () => mediaQuery.removeEventListener('change', handleChange);
//   }, []);

//   // التعامل مع النقر خارج القوائم
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (operationTypeRef.current && !operationTypeRef.current.contains(event.target as Node)) {
//         setShowOperationTypeList(false);
//       }
//       if (carFilterRef.current && !carFilterRef.current.contains(event.target as Node)) {
//         setShowCarList(false);
//       }
//       if (plateFilterRef.current && !plateFilterRef.current.contains(event.target as Node)) {
//         setShowPlateList(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // جلب السجلات
//   useEffect(() => {
//     const fetchRecords = async () => {
//       try {
//         setIsLoading(true);
//         setError(null);
//         let url = `/api/history?page=${page}&pageSize=${pageSize}`;
//         if (contractSearch) {
//           url += `&contractNumber=${encodeURIComponent(contractSearch)}`;
//         }
//         if (plateFilter) {
//           url += `&plateFilter=${encodeURIComponent(plateFilter)}`;
//         }
//         console.log(`Fetching records from ${url}...`);
//         const response = await fetch(url, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });

//         console.log('Response status:', response.status);
//         if (!response.ok) {
//           const errorData = await response.json().catch(() => ({}));
//           console.error('Fetch error:', errorData);
//           throw new Error(
//             errorData.message || errorData.error || `فشل في استرجاع السجلات (حالة: ${response.status})`
//           );
//         }

//         const data: ApiResponse = await response.json();
//         console.log('Received data:', data);
//         if (data.success) {
//           setRecords(data.results);
//           setTotalRecords(data.total);
//         } else {
//           throw new Error(data.message || 'حدث خطأ أثناء استرجاع البيانات');
//         }
//       } catch (err: any) {
//         console.error('Error in fetchRecords:', {
//           message: err.message,
//           stack: err.stack,
//         });
//         setError(err.message || 'حدث خطأ غير معروف أثناء استرجاع السجلات');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchRecords();
//   }, [page, contractSearch, plateFilter]);

//   const filteredRecords = records.filter((record) => {
//     const matchesPageSearch = pageSearch
//       ? String(record.fields['العقد'] ?? '').includes(pageSearch) ||
//         (record.fields['السيارة'] ?? '').toLowerCase().includes(pageSearch.toLowerCase()) ||
//         (record.fields['اللوحة'] ?? '').toLowerCase().includes(pageSearch.toLowerCase()) ||
//         (record.fields['نوع العملية'] ?? '').toLowerCase().includes(pageSearch.toLowerCase())
//       : true;

//     const matchesOperationType = operationTypeFilter
//       ? record.fields['نوع العملية'] === operationTypeFilter
//       : true;

//     const matchesCar = carFilter ? record.fields['السيارة'] === carFilter : true;

//     const matchesPlate = plateFilter ? record.fields['اللوحة'] === plateFilter : true;

//     return matchesPageSearch && matchesOperationType && matchesCar && matchesPlate;
//   });

//   const filteredOperationTypes = operationTypes.filter((type) =>
//     type.toLowerCase().includes(operationTypeSearch.toLowerCase())
//   );

//   const filteredCars = carList.filter((car) =>
//     car.toLowerCase().includes(carSearch.toLowerCase())
//   );

//   const filteredPlates = licenseList.filter((plate) =>
//     plate.toLowerCase().includes(plateSearch.toLowerCase())
//   );

//   const handleOperationTypeSelect = (type: string) => {
//     setOperationTypeFilter(type);
//     setOperationTypeSearch(type);
//     setShowOperationTypeList(false);
//   };

//   const handleCarSelect = (car: string) => {
//     setCarFilter(car);
//     setCarSearch(car);
//     setShowCarList(false);
//   };

//   const handlePlateSelect = (plate: string) => {
//     setPlateFilter(plate);
//     setPlateSearch(plate);
//     setShowPlateList(false);
//     setPage(1);
//   };

//   const clearOperationTypeFilter = () => {
//     setOperationTypeFilter('');
//     setOperationTypeSearch('');
//     setShowOperationTypeList(false);
//   };

//   const clearCarFilter = () => {
//     setCarFilter('');
//     setCarSearch('');
//     setShowCarList(false);
//   };

//   const clearPlateFilter = () => {
//     setPlateFilter('');
//     setPlateSearch('');
//     setShowPlateList(false);
//     setPage(1);
//   };

//   const closeImageModal = () => {
//     setSelectedImage(null);
//   };

//   return (
//     <div dir="rtl" className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
//       <Navbar />
//       <div className="container mx-auto px-4 py-8 bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
//         <h1 className="text-2xl md:text-3xl font-semibold text-center text-gray-900 dark:text-gray-100 mb-8 flex items-center justify-center">
//           <FaHistory className="mr-2 text-blue-600" />
//           سجل تشييك السيارات
//         </h1>

//         <div className="mb-6 flex flex-col sm:flex-row gap-4">
//           <div className="relative flex-1">
//             <input
//               type="text"
//               value={pageSearch}
//               onChange={(e) => setPageSearch(e.target.value)}
//               placeholder="ابحث في الصفحة (العقد، السيارة، اللوحة، نوع العملية)"
//               className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//             />
//             <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
//           </div>

//           <div className="relative flex-1">
//             <input
//               type="text"
//               value={contractSearch}
//               onChange={(e) => {
//                 setContractSearch(e.target.value);
//                 setPage(1);
//               }}
//               placeholder="ابحث برقم العقد (بحث عام)"
//               className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//             />
//             <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
//           </div>

//           <div ref={operationTypeRef} className="relative flex-1">
//             <input
//               type="text"
//               value={operationTypeSearch}
//               onChange={(e) => {
//                 setOperationTypeSearch(e.target.value);
//                 setShowOperationTypeList(true);
//               }}
//               onFocus={() => setShowOperationTypeList(true)}
//               placeholder="فلتر حسب نوع العملية"
//               className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//             />
//             {operationTypeFilter && (
//               <button
//                 type="button"
//                 onClick={clearOperationTypeFilter}
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
//               >
//                 ×
//               </button>
//             )}
//             {showOperationTypeList && (
//               <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
//                 {filteredOperationTypes.length > 0 ? (
//                   filteredOperationTypes.map((type) => (
//                     <li
//                       key={type}
//                       onClick={() => handleOperationTypeSelect(type)}
//                       className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
//                     >
//                       {type}
//                     </li>
//                   ))
//                 ) : (
//                   <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
//                     لا توجد خيارات مطابقة
//                   </li>
//                 )}
//               </ul>
//             )}
//           </div>

//           <div ref={carFilterRef} className="relative flex-1">
//             <input
//               type="text"
//               value={carSearch}
//               onChange={(e) => {
//                 setCarSearch(e.target.value);
//                 setShowCarList(true);
//               }}
//               onFocus={() => setShowCarList(true)}
//               placeholder="فلتر حسب السيارة"
//               className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//             />
//             {carFilter && (
//               <button
//                 type="button"
//                 onClick={clearCarFilter}
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
//               >
//                 ×
//               </button>
//             )}
//             {showCarList && (
//               <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
//                 {filteredCars.length > 0 ? (
//                   filteredCars.map((car) => (
//                     <li
//                       key={car}
//                       onClick={() => handleCarSelect(car)}
//                       className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
//                     >
//                       {car}
//                     </li>
//                   ))
//                 ) : (
//                   <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
//                     لا توجد سيارات مطابقة
//                   </li>
//                 )}
//               </ul>
//             )}
//           </div>

//           <div ref={plateFilterRef} className="relative flex-1">
//             <input
//               type="text"
//               value={plateSearch}
//               onChange={(e) => {
//                 setPlateSearch(e.target.value);
//                 setShowPlateList(true);
//               }}
//               onFocus={() => setShowPlateList(true)}
//               placeholder="فلتر حسب اللوحة"
//               className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//             />
//             {plateFilter && (
//               <button
//                 type="button"
//                 onClick={clearPlateFilter}
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
//               >
//                 ×
//               </button>
//             )}
//             {showPlateList && (
//               <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
//                 {filteredPlates.length > 0 ? (
//                   filteredPlates.map((plate) => (
//                     <li
//                       key={plate}
//                       onClick={() => handlePlateSelect(plate)}
//                       className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
//                     >
//                       {plate}
//                     </li>
//                   ))
//                 ) : (
//                   <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
//                     لا توجد لوحات مطابقة
//                   </li>
//                 )}
//               </ul>
//             )}
//           </div>
//         </div>

//         {isLoading && (
//           <div className="flex justify-center items-center">
//             <p className="text-lg text-gray-600 dark:text-gray-300">جاري التحميل...</p>
//           </div>
//         )}

//         {error && (
//           <div className="text-center text-sm text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-900 p-4 rounded-md mb-6">
//             {error}
//           </div>
//         )}

//         {!isLoading && !error && filteredRecords.length === 0 && (
//           <div className="text-center text-gray-600 dark:text-gray-300">
//             <p>لا توجد سجلات مطابقة لمعايير البحث أو الفلتر.</p>
//           </div>
//         )}

//         {!isLoading && !error && filteredRecords.length > 0 && (
//           <div className="overflow-x-auto">
//             <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
//               <thead>
//                 <tr className="bg-blue-600 text-white">
//                   <th className="py-3 px-4 text-right">رقم العقد</th>
//                   <th className="py-3 px-4 text-right">السيارة</th>
//                   <th className="py-3 px-4 text-right">اللوحة</th>
//                   <th className="py-3 px-4 text-right">نوع العملية</th>
//                   <th className="py-3 px-4 text-right">الصور</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredRecords.map((record) => (
//                   <tr
//                     key={record.id}
//                     className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
//                   >
//                     <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
//                       {record.fields['العقد'] ?? '-'}
//                     </td>
//                     <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
//                       {record.fields['السيارة'] ?? '-'}
//                     </td>
//                     <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
//                       {record.fields['اللوحة'] ?? '-'}
//                     </td>
//                     <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
//                       {record.fields['نوع العملية'] ?? '-'}
//                     </td>
//                     <td className="py-3 px-4 text-right">
//                       <div className="flex flex-wrap gap-2">
//                         {fieldTitles.map((title) =>
//                           record.fields[title]?.length > 0 ? (
//                             record.fields[title].map((url: string, index: number) => (
//                               <button
//                                 key={`${title}-${index}`}
//                                 onClick={() => setSelectedImage(url)}
//                                 className="relative w-12 h-12"
//                               >
//                                 <Image
//                                   src={url}
//                                   alt={`${title}-${index}`}
//                                   fill
//                                   className="object-cover rounded"
//                                   sizes="48px"
//                                 />
//                               </button>
//                             ))
//                           ) : null
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {!isLoading && !error && totalRecords > 0 && !contractSearch && !plateFilter && (
//           <div className="mt-6 flex justify-center gap-4 items-center">
//             <button
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               disabled={page === 1}
//               className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
//             >
//               السابق
//             </button>
//             <span className="text-gray-800 dark:text-gray-200">
//               صفحة {page} من {Math.ceil(totalRecords / pageSize)}
//             </span>
//             <button
//               onClick={() => setPage((p) => p + 1)}
//               disabled={page >= Math.ceil(totalRecords / pageSize)}
//               className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
//             >
//               التالي
//             </button>
//           </div>
//         )}

//         {selectedImage && (
//           <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
//             <div className="relative max-w-3xl w-full">
//               <button
//                 onClick={closeImageModal}
//                 className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
//               >
//                 <span className="text-xl">×</span>
//               </button>
//               <Image
//                 src={selectedImage}
//                 alt="معاينة الصورة"
//                 width={800}
//                 height={600}
//                 className="w-full h-auto rounded-lg"
//                 priority
//               />
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/public/components/navbar';
import { FaHistory, FaSearch, FaChevronDown } from 'react-icons/fa';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Record {
  id: string;
  fields: {
    العقد?: number | null;
    السيارة?: string | null;
    اللوحة?: string | null;
    'نوع العملية'?: string | null;
    الموظف?: string | null;
    الفرع?: string | null;
    [key: string]: any;
  };
}

interface ApiResponse {
  success: boolean;
  message: string;
  results: Record[];
  total: number;
  page: number;
  pageSize: number;
  error?: string;
  details?: any;
  filters?: {
    cars: string[];
    plates: string[];
    branches: string[];
  };
}

const fieldTitles = [
  'العداد',
  'الابواب اليمين مع توضيح السمكة',
  'الرفرف الامامي يمين',
  'الرفرف الخلفي يمين',
  'الصدام الخلفي مع الانوار',
  'سطح الشنطة مع الزجاج الخلفي',
  'التندة',
  'الرفرف الخلفي يسار',
  'الابواب اليسار مع توضيح السمكة',
  'الرفرف الامامي يسار',
  'الصدام الامامي مع الشنب',
  'الكبوت مع الشبك',
  'الزجاج الامامي',
  'محتويات الشنطة مع الاستبنة',
  'طفاية الحريق',
  'المقعد الامامي يمين',
  'المقعد الامامي يسار',
  'المقعد الخلفي مع خلفية المقاعد الامامية',
  'صور اخرى',
];

export default function HistoryPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [pageSearch, setPageSearch] = useState('');
  const [contractSearch, setContractSearch] = useState('');
  const [operationTypeFilter, setOperationTypeFilter] = useState('');
  const [operationTypeSearch, setOperationTypeSearch] = useState('');
  const [showOperationTypeList, setShowOperationTypeList] = useState(false);
  const [carFilter, setCarFilter] = useState('');
  const [carSearch, setCarSearch] = useState('');
  const [showCarList, setShowCarList] = useState(false);
  const [plateFilter, setPlateFilter] = useState('');
  const [plateSearch, setPlateSearch] = useState('');
  const [showPlateList, setShowPlateList] = useState(false);
  const [branchFilter, setBranchFilter] = useState('');
  const [branchSearch, setBranchSearch] = useState('');
  const [showBranchList, setShowBranchList] = useState(false);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [expandedRecords, setExpandedRecords] = useState<{ [key: string]: boolean }>({});
  const [cars, setCars] = useState<string[]>([]); // حالة لقائمة السيارات
  const [plates, setPlates] = useState<string[]>([]); // حالة لقائمة اللوحات
  const [branches, setBranches] = useState<string[]>([]); // حالة لقائمة الفروع
  const pageSize = 50;

  const operationTypeRef = useRef<HTMLDivElement>(null);
  const carFilterRef = useRef<HTMLDivElement>(null);
  const plateFilterRef = useRef<HTMLDivElement>(null);
  const branchFilterRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const operationTypes = ['دخول', 'خروج'];

  // التحقق من تسجيل الدخول
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
    }
  }, [router]);

  // الكشف عن الوضع (فاتح/داكن)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // التعامل مع النقر خارج القوائم
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (operationTypeRef.current && !operationTypeRef.current.contains(event.target as Node)) {
        setShowOperationTypeList(false);
      }
      if (carFilterRef.current && !carFilterRef.current.contains(event.target as Node)) {
        setShowCarList(false);
      }
      if (plateFilterRef.current && !plateFilterRef.current.contains(event.target as Node)) {
        setShowPlateList(false);
      }
      if (branchFilterRef.current && !branchFilterRef.current.contains(event.target as Node)) {
        setShowBranchList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // جلب قوائم الفلاتر عند تحميل الصفحة
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        console.log('Fetching filter lists from API...');
        const response = await fetch('/api/history?fetchFilters=true', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch filters');
        }

        const data: ApiResponse = await response.json();
        if (data.success && data.filters) {
          setCars(data.filters.cars);
          setPlates(data.filters.plates);
          setBranches(data.filters.branches);
        } else {
          throw new Error(data.message || 'Failed to fetch filters');
        }
      } catch (err: any) {
        console.error('Error fetching filters:', err);
        setError('حدث خطأ أثناء جلب قوائم الفلاتر');
      }
    };

    fetchFilters();
  }, []);

  // جلب السجلات
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setIsLoading(true);
        setError(null);
        let url = `/api/history?page=${page}&pageSize=${pageSize}`;
        if (contractSearch) {
          url += `&contractNumber=${encodeURIComponent(contractSearch)}`;
        }
        console.log(`Fetching records from ${url}...`);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Fetch error:', errorData);
          throw new Error(
            errorData.message || errorData.error || `فشل في استرجاع السجلات (حالة: ${response.status})`
          );
        }

        const data: ApiResponse = await response.json();
        console.log('Received data:', data);
        if (data.success) {
          setRecords(data.results);
          setTotalRecords(data.total);
        } else {
          throw new Error(data.message || 'حدث خطأ أثناء استرجاع البيانات');
        }
      } catch (err: any) {
        console.error('Error in fetchRecords:', {
          message: err.message,
          stack: err.stack,
        });
        setError(err.message || 'حدث خطأ غير معروف أثناء استرجاع السجلات');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();
  }, [page, contractSearch]);

  const filteredRecords = records.filter((record) => {
    const matchesPageSearch = pageSearch
      ? String(record.fields['العقد'] ?? '').includes(pageSearch) ||
        (record.fields['السيارة'] ?? '').toLowerCase().includes(pageSearch.toLowerCase()) ||
        (record.fields['اللوحة'] ?? '').toLowerCase().includes(pageSearch.toLowerCase()) ||
        (record.fields['نوع العملية'] ?? '').toLowerCase().includes(pageSearch.toLowerCase()) ||
        (record.fields['الموظف'] ?? '').toLowerCase().includes(pageSearch.toLowerCase()) ||
        (record.fields['الفرع'] ?? '').toLowerCase().includes(pageSearch.toLowerCase())
      : true;

    const matchesOperationType = operationTypeFilter
      ? record.fields['نوع العملية'] === operationTypeFilter
      : true;

    const matchesCar = carFilter ? record.fields['السيارة'] === carFilter : true;

    const matchesPlate = plateFilter ? record.fields['اللوحة'] === plateFilter : true;

    const matchesBranch = branchFilter ? record.fields['الفرع'] === branchFilter : true;

    return matchesPageSearch && matchesOperationType && matchesCar && matchesPlate && matchesBranch;
  });

  const filteredOperationTypes = operationTypes.filter((type) =>
    type.toLowerCase().includes(operationTypeSearch.toLowerCase())
  );

  const filteredCars = cars.filter((car) =>
    car.toLowerCase().includes(carSearch.toLowerCase())
  );

  const filteredPlates = plates.filter((plate) =>
    plate.toLowerCase().includes(plateSearch.toLowerCase())
  );

  const filteredBranches = branches.filter((branch) =>
    branch.toLowerCase().includes(branchSearch.toLowerCase())
  );

  const handleOperationTypeSelect = (type: string) => {
    setOperationTypeFilter(type);
    setOperationTypeSearch(type);
    setShowOperationTypeList(false);
  };

  const handleCarSelect = (car: string) => {
    setCarFilter(car);
    setCarSearch(car);
    setShowCarList(false);
  };

  const handlePlateSelect = (plate: string) => {
    setPlateFilter(plate);
    setPlateSearch(plate);
    setShowPlateList(false);
  };

  const handleBranchSelect = (branch: string) => {
    setBranchFilter(branch);
    setBranchSearch(branch);
    setShowBranchList(false);
  };

  const clearOperationTypeFilter = () => {
    setOperationTypeFilter('');
    setOperationTypeSearch('');
    setShowOperationTypeList(false);
  };

  const clearCarFilter = () => {
    setCarFilter('');
    setCarSearch('');
    setShowCarList(false);
  };

  const clearPlateFilter = () => {
    setPlateFilter('');
    setPlateSearch('');
    setShowPlateList(false);
  };

  const clearBranchFilter = () => {
    setBranchFilter('');
    setBranchSearch('');
    setShowBranchList(false);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const toggleImages = (recordId: string) => {
    setExpandedRecords((prev) => ({
      ...prev,
      [recordId]: !prev[recordId],
    }));
  };

  const getAllImages = (record: Record) => {
    const images: { url: string; title: string; index: number }[] = [];
    fieldTitles.forEach((title) => {
      if (record.fields[title]?.length > 0) {
        record.fields[title].forEach((url: string, index: number) => {
          images.push({ url, title, index });
        });
      }
    });
    return images;
  };

  return (
    <div dir="rtl" className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <Navbar />
      <div className="container mx-auto px-4 py-8 bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <h1 className="text-2xl md:text-3xl font-semibold text-center text-gray-900 dark:text-gray-100 mb-8 flex items-center justify-center">
          <FaHistory className="mr-2 text-blue-600" />
          سجل تشييك السيارات
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={pageSearch}
              onChange={(e) => setPageSearch(e.target.value)}
              placeholder="ابحث في الصفحة (العقد، السيارة، اللوحة، الموظف، الفرع...)"
              className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={contractSearch}
              onChange={(e) => {
                setContractSearch(e.target.value);
                setPage(1);
              }}
              placeholder="ابحث برقم العقد (بحث عام)"
              className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>

          <div ref={operationTypeRef} className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={operationTypeSearch}
              onChange={(e) => {
                setOperationTypeSearch(e.target.value);
                setShowOperationTypeList(true);
              }}
              onFocus={() => setShowOperationTypeList(true)}
              placeholder="فلتر حسب نوع العملية"
              className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            {operationTypeFilter && (
              <button
                type="button"
                onClick={clearOperationTypeFilter}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              >
                ×
              </button>
            )}
            {showOperationTypeList && (
              <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                {filteredOperationTypes.length > 0 ? (
                  filteredOperationTypes.map((type) => (
                    <li
                      key={type}
                      onClick={() => handleOperationTypeSelect(type)}
                      className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
                    >
                      {type}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    لا توجد خيارات مطابقة
                  </li>
                )}
              </ul>
            )}
          </div>

          <div ref={carFilterRef} className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={carSearch}
              onChange={(e) => {
                setCarSearch(e.target.value);
                setShowCarList(true);
              }}
              onFocus={() => setShowCarList(true)}
              placeholder="فلتر حسب السيارة"
              className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            {carFilter && (
              <button
                type="button"
                onClick={clearCarFilter}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              >
                ×
              </button>
            )}
            {showCarList && (
              <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                {filteredCars.length > 0 ? (
                  filteredCars.map((car) => (
                    <li
                      key={car}
                      onClick={() => handleCarSelect(car)}
                      className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
                    >
                      {car}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    لا توجد سيارات مطابقة
                  </li>
                )}
              </ul>
            )}
          </div>

          <div ref={plateFilterRef} className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={plateSearch}
              onChange={(e) => {
                setPlateSearch(e.target.value);
                setShowPlateList(true);
              }}
              onFocus={() => setShowPlateList(true)}
              placeholder="فلتر حسب اللوحة"
              className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            {plateFilter && (
              <button
                type="button"
                onClick={clearPlateFilter}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              >
                ×
              </button>
            )}
            {showPlateList && (
              <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                {filteredPlates.length > 0 ? (
                  filteredPlates.map((plate) => (
                    <li
                      key={plate}
                      onClick={() => handlePlateSelect(plate)}
                      className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
                    >
                      {plate}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    لا توجد لوحات مطابقة
                  </li>
                )}
              </ul>
            )}
          </div>

          <div ref={branchFilterRef} className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={branchSearch}
              onChange={(e) => {
                setBranchSearch(e.target.value);
                setShowBranchList(true);
              }}
              onFocus={() => setShowBranchList(true)}
              placeholder="فلتر حسب الفرع"
              className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            {branchFilter && (
              <button
                type="button"
                onClick={clearBranchFilter}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              >
                ×
              </button>
            )}
            {showBranchList && (
              <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                {filteredBranches.length > 0 ? (
                  filteredBranches.map((branch) => (
                    <li
                      key={branch}
                      onClick={() => handleBranchSelect(branch)}
                      className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
                    >
                      {branch}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    لا توجد فروع مطابقة
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center">
            <p className="text-lg text-gray-600 dark:text-gray-300">جاري التحميل...</p>
          </div>
        )}

        {error && (
          <div className="text-center text-sm text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-900 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {!isLoading && !error && filteredRecords.length === 0 && (
          <div className="text-center text-gray-600 dark:text-gray-300">
            <p>لا توجد سجلات مطابقة لمعايير البحث أو الفلتر.</p>
          </div>
        )}

        {!isLoading && !error && filteredRecords.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="py-3 px-4 text-right">رقم العقد</th>
                  <th className="py-3 px-4 text-right">السيارة</th>
                  <th className="py-3 px-4 text-right">اللوحة</th>
                  <th className="py-3 px-4 text-right">نوع العملية</th>
                  <th className="py-3 px-4 text-right">الموظف</th>
                  <th className="py-3 px-4 text-right">الفرع</th>
                  <th className="py-3 px-4 text-right">الصور</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => {
                  const allImages = getAllImages(record);
                  const isExpanded = expandedRecords[record.id] || false;

                  return (
                    <tr
                      key={record.id}
                      className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
                        {record.fields['العقد'] ?? '-'}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
                        {record.fields['السيارة'] ?? '-'}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
                        {record.fields['اللوحة'] ?? '-'}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
                        {record.fields['نوع العملية'] ?? '-'}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
                        {record.fields['الموظف'] ?? '-'}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
                        {record.fields['الفرع'] ?? '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {allImages.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedImage(allImages[0].url)}
                                className="relative w-12 h-12"
                              >
                                <img
                                
                                  src={allImages[0].url}
                                  alt={`${allImages[0].title}-${allImages[0].index}`}
                                  className="object-cover rounded"
                                  sizes="48px"
                                />
                              </button>
                              {allImages.length > 1 && (
                                <button
                                  onClick={() => toggleImages(record.id)}
                                  className="sm:hidden text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 flex items-center"
                                  title="عرض/إخفاء الصور"
                                >
                                  <FaChevronDown
                                    className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''} text-2xl`}
                                  />
                                </button>
                              )}
                            </div>
                            <div
                              className={`flex flex-wrap gap-2 ${isExpanded ? 'block' : 'hidden'} sm:flex`}
                            >
                              {allImages.slice(1).map((image) => (
                                <button
                                  key={`${image.title}-${image.index}`}
                                  onClick={() => setSelectedImage(image.url)}
                                  className="relative w-12 h-12"
                                >
                                  <img
                                    src={image.url}
                                    alt={`${image.title}-${image.index}`}
                                    
                                    className="object-cover rounded"
                                    sizes="48px"
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">لا توجد صور</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !error && totalRecords > 0 && !contractSearch && (
          <div className="mt-6 flex justify-center gap-4 items-center">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              السابق
            </button>
            <span className="text-gray-800 dark:text-gray-200">
              صفحة {page} من {Math.ceil(totalRecords / pageSize)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(totalRecords / pageSize)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              التالي
            </button>
          </div>
        )}

        {selectedImage && (
          <div
            ref={modalRef}
            className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-start z-50 overflow-y-auto"
          >
            <div className="relative max-w-3xl w-full mt-16 mb-16">
              <button
                onClick={closeImageModal}
                className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
              >
                <span className="text-xl">×</span>
              </button>
              <img
                src={selectedImage}
                alt="معاينة الصورة"
                width={800}
                height={600}
                className="w-full h-auto rounded-lg"
                
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
