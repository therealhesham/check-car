'use client';

import AWS from 'aws-sdk';
import imageCompression from 'browser-image-compression'; // Import browser-image-compression

import { v4 as uuidv4 } from 'uuid';


import Navbar from '@/public/components/navbar';
import { useState, useRef, useEffect, RefCallback } from 'react';
import { carList } from '@/lib/car';
import { licenseList } from '@/lib/License';
import { FaSearch, FaCheckCircle } from 'react-icons/fa';

// دالة لتنظيف العناوين مع دعم الأحرف العربية وضمان التفرد
const sanitizeTitle = (title: string, index: number) => {
  const cleanTitle = title.replace(/\s+/g, '-').replace(/[^\u0600-\u06FF\w-]/g, '');
  return `${cleanTitle}-${index}`;
};

interface FileSection {
  id: string; // تغيير من number إلى string
  imageUrls: string | string[] | null;
  title: string;
  multiple: boolean;
  previewUrls: string[];
  isUploading: boolean;
}

interface AirtableRecord {
  id: string;
  fields: {
    العقد?: number | null;
    السيارة?: string | null;
    اللوحة?: string | null;
    'نوع العملية'?: string | null;
    [key: string]: any;
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

interface User {
  id: string;
  name: string;
  EmID: number;
  role: string;
  branch: string;
}

export default function CheckInPage() {
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
  const [showCarList, setShowCarList] = useState<boolean>(false);
  const [plate, setPlate] = useState<string>('');
  const [plateSearch, setPlateSearch] = useState<string>('');
  const [showPlateList, setShowPlateList] = useState<boolean>(false);
  const [contract, setContract] = useState<string>('');
  const [operationType] = useState<string>('دخول');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [previousRecord, setPreviousRecord] = useState<AirtableRecord | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

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
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
        setUploadMessage('');
        setIsSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

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
      setPreviousRecord(null);
      setUploadMessage('');
      setShowToast(false);
    }
  }, [contract]);

  const restrictToNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const charCode = e.charCode;
    if (charCode < 48 || charCode > 57) {
      e.preventDefault();
    }
  };

  const fetchPreviousRecord = async () => {
    if (!contract.trim()) {
      setPreviousRecord(null);
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
      const entryResponse = await fetch(
        `/api/history?contractNumber=${encodeURIComponent(contract)}&operationType=دخول`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: abortControllerRef.current.signal,
        }
      );

      if (!entryResponse.ok) {
        const errorData = await entryResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `فشل في التحقق من سجل الدخول (حالة: ${entryResponse.status})`);
      }

      const entryData: ApiResponse = await entryResponse.json();
      if (entryData.success && entryData.results.length > 0) {
        setPreviousRecord(null);
        setUploadMessage('تم تسجيل عملية دخول لهذا العقد من قبل.');
        setShowToast(true);
        setCar('');
        setCarSearch('');
        setPlate('');
        setPlateSearch('');
        return;
      }

      const exitResponse = await fetch(
        `/api/history?contractNumber=${encodeURIComponent(contract)}&operationType=خروج`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: abortControllerRef.current.signal,
        }
      );

      if (!exitResponse.ok) {
        const errorData = await exitResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `فشل في جلب السجل السابق (حالة: ${exitResponse.status})`);
      }

      const exitData: ApiResponse = await exitResponse.json();
      if (exitData.success && exitData.results.length > 0) {
        const exitRecord = exitData.results[0];
        setPreviousRecord(exitRecord);
        if (!car && exitRecord.fields['السيارة']) {
          setCar(exitRecord.fields['السيارة']);
          setCarSearch(exitRecord.fields['السيارة']);
        }
        if (!plate && exitRecord.fields['اللوحة']) {
          setPlate(exitRecord.fields['اللوحة']);
          setPlateSearch(exitRecord.fields['اللوحة']);
        }
        setUploadMessage('تم العثور على سجل خروج سابق.');
        setShowToast(true);
      } else {
        setPreviousRecord(null);
        setUploadMessage('لا يوجد سجل خروج لهذا العقد.');
        setShowToast(true);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
      setUploadMessage(err.message || 'حدث خطأ أثناء جلب السجل السابق.');
      setShowToast(true);
      setPreviousRecord(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    fetchPreviousRecord();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchPreviousRecord();
    }
  };

  const filteredCars = carList.filter((carItem) =>
    carItem.toLowerCase().includes(carSearch.toLowerCase())
  );

  const filteredPlates = licenseList.filter((plateItem) =>
    plateItem.toLowerCase().includes(plateSearch.toLowerCase())
  );

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

   const compressImage = async (file: File): Promise<File> => {
      const options = {
        maxSizeMB: 4, // الحد الأقصى لحجم الملف (1 ميغابايت)
        maxWidthOrHeight: 1920, // الحد الأقصى للعرض أو الارتفاع
        useWebWorker: true, // استخدام Web Worker لتحسين الأداء
      };
  
      try {
        const compressedFile = await imageCompression(file, options);
        // إنشاء ملف جديد باسم فريد ونوع JPEG
        return new File([compressedFile], `${uuidv4()}.jpg`, { type: 'image/jpeg' });
      } catch (error) {
        throw new Error('فشل في ضغط الصورة.');
      }
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

      // const response = await fetch('/api/upload-image', {
      //   method: 'POST',
      //   body: formData,
      // });

      // const result = await response.json();

const result =  await    s3.upload(params).promise();
      return result.Location; // URL للصورة المرفوعة
   
    } catch (error: any) {
      throw error;
    }
  };


  const handleFileChange = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const localPreviewUrl = URL.createObjectURL(file);


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
        const compressedFile = await compressImage(file);


        const imageUrl = await uploadImageToBackend(compressedFile);
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
      } catch (error: any) {
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
        }
      }
    });
  };

  const handleMultipleFileChange = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const selectedFiles = Array.from(e.target.files);
    const localPreviewUrls = selectedFiles.map((file) => URL.createObjectURL(file));


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
      } catch (error: any) {
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
        }
      }
    });
  };

 
  const deleteFile = (fileKey: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const params = {
        Bucket: 'uploadcarimages',
        Key: fileKey,
      };
  
      s3.deleteObject(params, (err, data) => {
        if (err) {
          console.error('Error deleting:', err);
          reject(new Error(`فشل في حذف الملف: ${fileKey}`));
        } else {
          console.log('File deleted successfully:', fileKey);
          resolve();
        }
      });
    });
  };
  const removePreviewImage = async (fileId: string, previewIndex: number) => {
    setFiles((prevFiles) =>
      prevFiles.map((fileSection) => {
        if (fileSection.id === fileId) {
          const updatedPreviews = [...fileSection.previewUrls];
          const deletedPreviewUrl = updatedPreviews.splice(previewIndex, 1)[0]; // الحصول على URL المحذوف
          let updatedImageUrls = fileSection.imageUrls;
  
          // استخراج fileKey من deletedPreviewUrl
          let fileKey: string | null = null;
          if (deletedPreviewUrl) {
            try {
              const urlParts = deletedPreviewUrl.split('/');
              fileKey = urlParts[urlParts.length - 1]; // اسم الملف هو الجزء الأخير من URL
            } catch (error) {
              console.error('Error parsing URL:', error);
            }
          }
  
          if (Array.isArray(updatedImageUrls)) {
            updatedImageUrls = [...updatedImageUrls];
            updatedImageUrls.splice(previewIndex, 1);
          } else if (previewIndex === 0) {
            updatedImageUrls = null;
          }
  
          // حذف الصورة من السيرفر إذا كان fileKey موجودًا
          if (fileKey) {
            deleteFile(fileKey)
              .then(() => {
                setUploadMessage(`تم حذف الصورة  بنجاح من السيرفر.`);
                setShowToast(true);
              })
              .catch((error) => {
                setUploadMessage(error.message);
                setShowToast(true);
              });
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
    }
  };


  const setInputRef = (index: number): RefCallback<HTMLInputElement> => {
    return (element: HTMLInputElement | null) => {
      fileInputRefs.current[index] = element;
      if (element) {
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
    setUploadMessage('');
    setIsSuccess(false);

    try {
      const airtableData = {
        fields: {} as Record<string, string | string[]>,
      };

      airtableData.fields['السيارة'] = car.trim();
      airtableData.fields['اللوحة'] = plate.trim();
      airtableData.fields['العقد'] = contractNum.toString();
      airtableData.fields['نوع العملية'] = operationType;
      airtableData.fields['الموظف'] = user.name;
      airtableData.fields['الفرع'] = user.branch;

      files.forEach((fileSection) => {
        if (fileSection.imageUrls) {
          airtableData.fields[fileSection.title] = fileSection.imageUrls;
        }
      });


      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      try {
        const response = await fetch('/api/cheakin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(airtableData),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const result = await response.json();
        if (result.success) {
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
          setPreviousRecord(null);
          fileInputRefs.current.forEach((ref, index) => {
            if (ref) {
              ref.value = '';
            }
          });
        } else {
          throw new Error(result.error || result.message || 'حدث خطأ أثناء رفع البيانات');
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          setUploadMessage('انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.');
        } else {
          setUploadMessage(
            `فشلت عملية الرفع: ${fetchError.message || 'يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.'}`
          );
        }
        setShowToast(true);
      }
    } catch (error: any) {
      setUploadMessage(error.message || 'حدث خطأ أثناء تجهيز البيانات للرفع.');
      setShowToast(true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCarSelect = (selectedCar: string) => {
    setCar(selectedCar);
    setCarSearch(selectedCar);
    setShowCarList(false);
  };

  const handlePlateSelect = (selectedPlate: string) => {
    setPlate(selectedPlate);
    setPlateSearch(selectedPlate);
    setShowPlateList(false);
  };

  const openPreview = (images: string[], initialIndex: number) => {
    setPreviewImages(images);
    setCurrentImageIndex(initialIndex);
    setPreviewImage(images[initialIndex]);
  };

  const closePreview = () => {
    setPreviewImage(null);
    setPreviewImages([]);
    setCurrentImageIndex(0);
  };

  const goToPreviousImage = () => {
    if (currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1;
      setCurrentImageIndex(newIndex);
      setPreviewImage(previewImages[newIndex]);
    }
  };

  const goToNextImage = () => {
    if (currentImageIndex < previewImages.length - 1) {
      const newIndex = currentImageIndex + 1;
      setCurrentImageIndex(newIndex);
      setPreviewImage(previewImages[newIndex]);
    }
  };

  return (
    <div dir="rtl" className={`relative ${isDarkMode ? 'dark' : ''}`}>
      <Navbar />
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 p-2 transition-colors duration-200">
        <div className="w-full max-w-4xl p-3 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h1 className="text-xl sm:text-2xl font-semibold text-center text-gray-900 dark:text-gray-100 mb-4">
            رفع بيانات تشييك الدخول
          </h1>
          <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-300">
            ملاحظة: الصور الكبيرة قد تستغرق وقتًا أطول للرفع. الحد الأقصى لكل صورة هو 32 ميغابايت.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                رقم العقد *
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={contract}
                  onChange={(e) => setContract(e.target.value)}
                  onKeyPress={(e) => {
                    restrictToNumbers(e);
                    handleKeyPress(e);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="أدخل رقم العقد"
                  required
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={isSearching || !contract.trim()}
                  className={`ml-2 p-2 bg-blue-600 text-white rounded-full flex items-center justify-center sm:hidden ${
                    isSearching || !contract.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                  }`}
                  aria-label="بحث برقم العقد"
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <FaSearch className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div ref={carInputRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  السيارة *
                </label>
                <input
                  type="text"
                  value={carSearch}
                  onChange={(e) => {
                    setCarSearch(e.target.value);
                    setShowCarList(true);
                  }}
                  onFocus={() => setShowCarList(true)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="ابحث عن السيارة"
                  required
                />
                {showCarList && filteredCars.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                    {filteredCars.map((carItem) => (
                      <li
                        key={carItem}
                        onClick={() => handleCarSelect(carItem)}
                        className="px-3 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
                      >
                        {carItem}
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
                <input
                  type="text"
                  value={plateSearch}
                  onChange={(e) => {
                    setPlateSearch(e.target.value);
                    setShowPlateList(true);
                  }}
                  onFocus={() => setShowPlateList(true)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="ابحث عن اللوحة"
                  required
                />
                {showPlateList && filteredPlates.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                    {filteredPlates.map((plateItem) => (
                      <li
                        key={plateItem}
                        onClick={() => handlePlateSelect(plateItem)}
                        className="px-3 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
                      >
                        {plateItem}
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
                  <div className="grid grid-cols-1 gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        الصورة الجديدة:
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
                                    className="h-full w-full object-cover rounded cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openPreview(fileSection.previewUrls, previewIndex);
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => removePreviewImage(fileSection.id, previewIndex, e)}
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
                                className="max-h-full max-w-full object-contain rounded cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openPreview([fileSection.previewUrls[0]], 0);
                                }}
                              />
                              <button
                                type="button"
                                onClick={(e) => removePreviewImage(fileSection.id, 0, e)}
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
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        الصورة القديمة (تشييك الخروج):
                      </div>
                      {previousRecord && previousRecord.fields[fileSection.title] ? (
                        previousRecord.fields[fileSection.title].length > 0 ? (
                          <div
                            className={`relative border-2 border-gray-200 dark:border-gray-600 rounded-md p-2 ${
                              fileSection.multiple ? 'h-auto' : 'h-28 sm:h-32'
                            } bg-gray-50 dark:bg-gray-700`}
                          >
                            {fileSection.multiple ? (
                              <div className="grid grid-cols-2 gap-2">
                                {previousRecord.fields[fileSection.title].map((url: string, prevIndex: number) => (
                                  <div key={prevIndex} className="relative h-20 sm:h-24">
                                    <img
                                      src={url}
                                      alt={`صورة سابقة ${prevIndex + 1}`}
                                      className="h-full w-full object-cover rounded cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openPreview(previousRecord.fields[fileSection.title], prevIndex);
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="relative h-full w-full flex items-center justify-center">
                                <img
                                  src={previousRecord.fields[fileSection.title][0]}
                                  alt={`${fileSection.title} - سابق`}
                                  className="max-h-full max-w-full object-contain rounded cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openPreview([previousRecord.fields[fileSection.title][0]], 0);
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-28 sm:h-32 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
                            لا توجد صورة قديمة
                          </div>
                        )
                      ) : (
                        <div className="h-28 sm:h-32 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
                          لا توجد صورة قديمة
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-4 text-center mt-4">
              <button
                type="submit"
                disabled={isUploading}
                className={`w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none text-lg font-medium ${
                  isUploading ? 'bg-gray-400' : ''
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

      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg p-4 max-w-3xl w-full">
            <button
              onClick={closePreview}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md"
              aria-label="إغلاق المعاينة"
            >
              <span className="text-lg font-bold">×</span>
            </button>
            <div className="flex items-center justify-center">
              {previewImages.length > 1 && (
                <button
                  onClick={goToPreviousImage}
                  disabled={currentImageIndex === 0}
                  className={`absolute left-4 p-2 bg-gray-200 dark:bg-gray-600 rounded-full ${
                    currentImageIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                  aria-label="الصورة السابقة"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-800 dark:text-gray-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <img src={previewImage} alt="معاينة الصورة" className="max-h-[70vh] max-w-full object-contain rounded" />
              {previewImages.length > 1 && (
                <button
                  onClick={goToNextImage}
                  disabled={currentImageIndex === previewImages.length - 1}
                  className={`absolute right-4 p-2 bg-gray-200 dark:bg-gray-600 rounded-full ${
                    currentImageIndex === previewImages.length - 1
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                  aria-label="الصورة التالية"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-800 dark:text-gray-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
            {previewImages.length > 1 && (
              <div className="text-center mt-2 text-sm text-gray-600 dark:text-gray-300">
                صورة {currentImageIndex + 1} من {previewImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}