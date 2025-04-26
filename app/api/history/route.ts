

// import { NextResponse } from 'next/server';
// import Airtable, { Records } from 'airtable';

// // واجهة لسجلات Airtable
// interface AirtableRecord {
//   id: string;
//   fields: Record<string, any>;
//   getId(): string;
// }

// // إعدادات Airtable
// const airtableApiKey = 'patH4avQdGYSC0oz4.b2bc135c01c9c5c44cfa2d8595850d75189ea9b050661b9a1efb4e243bd44156';
// const airtableBaseId = 'app7Hc09WF8xul5T9';
// const airtableTableName = 'cheakcar';
// const base = new Airtable({ apiKey: airtableApiKey }).base(airtableBaseId);

// // قائمة حقول الصور
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

// // فحص الوصول إلى الجدول
// async function verifyTableAccess(): Promise<boolean> {
//   try {
//     console.log(`Verifying access to Airtable table: ${airtableTableName}`);
//     const records = await base(airtableTableName)
//       .select({
//         maxRecords: 1,
//       })
//       .firstPage();
//     console.log('Table access verified:', records.length, 'records retrieved');
//     return true;
//   } catch (error: any) {
//     console.error('Error verifying table access:', {
//       message: error.message,
//       status: error.status,
//       errorCode: error.error,
//       details: error.response?.data || error,
//     });
//     return false;
//   }
// }

// // الحصول على العدد الإجمالي الفعلي للسجلات
// async function getTotalRecords(contractNumber?: string, plateFilter?: string): Promise<number> {
//   try {
//     console.log('Fetching total records from Airtable...');
//     let filterFormula = '';
//     if (contractNumber && plateFilter) {
//       filterFormula = `AND({العقد} = ${contractNumber}, {اللوحة} = "${plateFilter}")`;
//     } else if (contractNumber) {
//       filterFormula = `{العقد} = ${contractNumber}`;
//     } else if (plateFilter) {
//       filterFormula = `{اللوحة} = "${plateFilter}"`;
//     }

//     if (filterFormula) {
//       const records = await base(airtableTableName)
//         .select({
//           filterByFormula: filterFormula,
//         })
//         .all();
//       return records.length;
//     }
//     const records = await base(airtableTableName).select({}).all();
//     console.log(`Total records found: ${records.length}`);
//     return records.length;
//   } catch (error: any) {
//     console.error('Error fetching total records:', {
//       message: error.message,
//       status: error.status,
//       errorCode: error.error,
//       details: error.response?.data || error,
//     });
//     throw new Error(`Failed to fetch total records: ${error.message}`);
//   }
// }

// export async function GET(req: Request) {
//   try {
//     console.log('Starting fetch records from Airtable for history...');

//     // التحقق من الوصول إلى الجدول
//     const hasAccess = await verifyTableAccess();
//     if (!hasAccess) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'لا يمكن الوصول إلى جدول Airtable. تحقق من إعدادات الجدول أو الصلاحيات.',
//           error: 'TABLE_ACCESS_DENIED',
//         },
//         { status: 403 }
//       );
//     }

//     // استخراج معلمات الاستعلام
//     const url = new URL(req.url);
//     const page = parseInt(url.searchParams.get('page') || '1', 10);
//     const pageSize = parseInt(url.searchParams.get('pageSize') || '50', 10); // تغيير إلى 50
//     const contractNumber = url.searchParams.get('contractNumber')?.trim();
//     const plateFilter = url.searchParams.get('plateFilter')?.trim();

//     let records: AirtableRecord[] = [];

//     if (contractNumber || plateFilter) {
//       // التحقق من أن رقم العقد صالح (رقم صحيح) إذا تم تمريره
//       if (contractNumber && !/^\d+$/.test(contractNumber)) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: 'رقم العقد يجب أن يكون رقمًا صحيحًا.',
//             error: 'INVALID_CONTRACT_NUMBER',
//           },
//           { status: 400 }
//         );
//       }

//       // بناء صيغة الفلتر
//       let filterFormula = '';
//       if (contractNumber && plateFilter) {
//         filterFormula = `AND({العقد} = ${contractNumber}, {اللوحة} = "${plateFilter}")`;
//       } else if (contractNumber) {
//         filterFormula = `{العقد} = ${contractNumber}`;
//       } else if (plateFilter) {
//         filterFormula = `{اللوحة} = "${plateFilter}"`;
//       }

//       console.log(`Searching with filter: ${filterFormula}`);
//       const airtableRecords: Records<any> = await base(airtableTableName)
//         .select({
//           filterByFormula: filterFormula,
//           sort: [{ field: 'createdTime', direction: 'desc' }], // ترتيب تنازلي حسب تاريخ الإنشاء
//           maxRecords: pageSize * page, // جلب عدد كافٍ لتغطية الصفحات
//         })
//         .all();

//       const offset = (page - 1) * pageSize;
//       records = airtableRecords.slice(offset, offset + pageSize).map(record => ({
//         id: record.id,
//         fields: record.fields,
//         getId: () => record.id,
//       }));
//     } else {
//       // جلب السجلات بناءً على التصفح
//       const offset = (page - 1) * pageSize;
//       const airtableRecords: Records<any> = await base(airtableTableName)
//         .select({
//           sort: [{ field: 'createdTime', direction: 'desc' }], // ترتيب تنازلي حسب تاريخ الإنشاء
//           maxRecords: pageSize + offset,
//         })
//         .all();
//       records = airtableRecords.slice(offset, offset + pageSize).map(record => ({
//         id: record.id,
//         fields: record.fields,
//         getId: () => record.id,
//       }));
//     }

//     console.log(`Retrieved ${records.length} records for page ${page}`);

//     const results = records.map((record: AirtableRecord) => ({
//       id: record.id,
//       fields: {
//         العقد: record.fields['العقد'] || null,
//         السيارة: record.fields['السيارة'] || null,
//         اللوحة: record.fields['اللوحة'] || null,
//         'نوع العملية': record.fields['نوع العملية'] || null,
//         ...Object.fromEntries(
//           fieldTitles.map((title) => [
//             title,
//             record.fields[title]
//               ? Array.isArray(record.fields[title])
//                 ? record.fields[title].map((img: any) => img.url)
//                 : record.fields[title].url
//                   ? [record.fields[title].url]
//                   : []
//               : [],
//           ])
//         ),
//       },
//     }));

//     const total = await getTotalRecords(contractNumber, plateFilter);

//     return NextResponse.json({
//       success: true,
//       message: 'تم استرجاع السجلات بنجاح',
//       results,
//       total,
//       page,
//       pageSize,
//     });
//   } catch (error: any) {
//     console.error('Error fetching records from Airtable:', {
//       message: error.message,
//       status: error.status,
//       errorCode: error.error,
//       details: error.response?.data || error,
//     });
//     return NextResponse.json(
//       {
//         success: false,
//         message: 'حدث خطأ أثناء استرجاع السجلات.',
//         error: error.message || 'خطأ غير معروف',
//         details: error.response?.data || null,
//       },
//       { status: error.status || 500 }
//     );
//   }
// }

import { NextResponse } from 'next/server';
import Airtable, { Records } from 'airtable';

// واجهة لسجلات Airtable
interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  getId(): string;
}

// إعدادات Airtable
const airtableApiKey = 'patH4avQdGYSC0oz4.b2bc135c01c9c5c44cfa2d8595850d75189ea9b050661b9a1efb4e243bd44156';
const airtableBaseId = 'app7Hc09WF8xul5T9';
const airtableTableName = 'cheakcar';
const base = new Airtable({ apiKey: airtableApiKey }).base(airtableBaseId);

// قائمة حقول الصور
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

// فحص الوصول إلى الجدول
async function verifyTableAccess(): Promise<boolean> {
  try {
    console.log(`Verifying access to Airtable table: ${airtableTableName}`);
    const records = await base(airtableTableName)
      .select({
        maxRecords: 1,
      })
      .firstPage();
    console.log('Table access verified:', records.length, 'records retrieved');
    return true;
  } catch (error: any) {
    console.error('Error verifying table access:', {
      message: error.message,
      status: error.status,
      errorCode: error.error,
      details: error.response?.data || error,
    });
    return false;
  }
}

// الحصول على العدد الإجمالي الفعلي للسجلات
async function getTotalRecords(
  contractNumber?: string,
  plateFilter?: string,
  branchFilter?: string,
  operationType?: string
): Promise<number> {
  try {
    console.log('Fetching total records from Airtable...');
    let filterFormula = '';
    const conditions: string[] = [];
    if (contractNumber) {
      conditions.push(`{العقد} = ${contractNumber}`);
    }
    if (plateFilter) {
      conditions.push(`{اللوحة} = "${plateFilter}"`);
    }
    if (branchFilter) {
      conditions.push(`{الفرع} = "${branchFilter}"`);
    }
    if (operationType) {
      conditions.push(`{نوع العملية} = "${operationType}"`);
    }
    if (conditions.length > 0) {
      filterFormula = `AND(${conditions.join(', ')})`;
    }

    if (filterFormula) {
      const records = await base(airtableTableName)
        .select({
          filterByFormula: filterFormula,
        })
        .all();
      return records.length;
    }
    const records = await base(airtableTableName).select({}).all();
    console.log(`Total records found: ${records.length}`);
    return records.length;
  } catch (error: any) {
    console.error('Error fetching total records:', {
      message: error.message,
      status: error.status,
      errorCode: error.error,
      details: error.response?.data || error,
    });
    throw new Error(`Failed to fetch total records: ${error.message}`);
  }
}

export async function GET(req: Request) {
  try {
    console.log('Starting fetch records from Airtable for history...');

    // التحقق من الوصول إلى الجدول
    const hasAccess = await verifyTableAccess();
    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          message: 'لا يمكن الوصول إلى جدول Airtable. تحقق من إعدادات الجدول أو الصلاحيات.',
          error: 'TABLE_ACCESS_DENIED',
        },
        { status: 403 }
      );
    }

    // استخراج معلمات الاستعلام
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50', 10);
    const contractNumber = url.searchParams.get('contractNumber')?.trim();
    const plateFilter = url.searchParams.get('plateFilter')?.trim();
    const branchFilter = url.searchParams.get('branchFilter')?.trim();
    const operationType = url.searchParams.get('operationType')?.trim();

    // التحقق من أن رقم العقد صالح (رقم صحيح) إذا تم تمريره
    if (contractNumber && !/^\d+$/.test(contractNumber)) {
      return NextResponse.json(
        {
          success: false,
          message: 'رقم العقد يجب أن يكون رقمًا صحيحًا.',
          error: 'INVALID_CONTRACT_NUMBER',
        },
        { status: 400 }
      );
    }

    // التحقق من صحة operationType إذا تم تمريره
    if (operationType && !['دخول', 'خروج'].includes(operationType)) {
      return NextResponse.json(
        {
          success: false,
          message: 'نوع العملية غير صالح. يجب أن يكون "دخول" أو "خروج".',
          error: 'INVALID_OPERATION_TYPE',
        },
        { status: 400 }
      );
    }

    // بناء صيغة الفلتر
    let filterFormula = '';
    const conditions: string[] = [];
    if (contractNumber) {
      conditions.push(`{العقد} = ${contractNumber}`);
    }
    if (plateFilter) {
      conditions.push(`{اللوحة} = "${plateFilter}"`);
    }
    if (branchFilter) {
      conditions.push(`{الفرع} = "${branchFilter}"`);
    }
    if (operationType) {
      conditions.push(`{نوع العملية} = "${operationType}"`);
    }
    if (conditions.length > 0) {
      filterFormula = `AND(${conditions.join(', ')})`;
    }

    let records: AirtableRecord[] = [];

    // جلب السجلات بناءً على الفلتر أو التصفح
    console.log(`Searching with filter: ${filterFormula || 'No filter'}`);
    const airtableRecords: Records<any> = await base(airtableTableName)
      .select({
        filterByFormula: filterFormula,
        sort: [{ field: 'createdTime', direction: 'desc' }],
        maxRecords: filterFormula ? pageSize : pageSize * page, // تحسين الأداء عند استخدام فلتر
      })
      .all();

    const offset = filterFormula ? 0 : (page - 1) * pageSize;
    records = airtableRecords.slice(offset, offset + pageSize).map((record) => ({
      id: record.id,
      fields: record.fields,
      getId: () => record.id,
    }));

    console.log(`Retrieved ${records.length} records for page ${page}`);

    // تنسيق السجلات للاستجابة
    const results = records.map((record: AirtableRecord) => ({
      id: record.id,
      fields: {
        العقد: record.fields['العقد'] || null,
        السيارة: record.fields['السيارة'] || null,
        اللوحة: record.fields['اللوحة'] || null,
        'نوع العملية': record.fields['نوع العملية'] || null,
        الموظف: record.fields['الموظف'] || null,
        الفرع: record.fields['الفرع'] || null,
        ...Object.fromEntries(
          fieldTitles.map((title) => [
            title,
            record.fields[title]
              ? Array.isArray(record.fields[title])
                ? record.fields[title].map((img: any) => img.url)
                : record.fields[title].url
                  ? [record.fields[title].url]
                  : []
              : [],
          ])
        ),
      },
    }));

    // جلب العدد الإجمالي للسجلات
    const total = await getTotalRecords(contractNumber, plateFilter, branchFilter, operationType);

    return NextResponse.json({
      success: true,
      message: 'تم استرجاع السجلات بنجاح',
      results,
      total,
      page,
      pageSize,
    });
  } catch (error: any) {
    console.error('Error fetching records from Airtable:', {
      message: error.message,
      status: error.status,
      errorCode: error.error,
      details: error.response?.data || error,
    });
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ أثناء استرجاع السجلات.',
        error: error.message || 'خطأ غير معروف',
        details: error.response?.data || null,
      },
      { status: error.status || 500 }
    );
  }
}