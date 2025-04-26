import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

// واجهة لبيانات الطلب
interface LoginRequestData {
  EmID: string; // يتم إرساله كنص من العميل، سنحوله إلى رقم
  password: string;
}

// واجهة لسجل Airtable
interface AirtableRecord {
  id: string;
  fields: {
    Name: string; // تغيير من name إلى Name
    EmID: number;
    password: string;
    role: string;
    branch: string;
  };
}

// إعدادات Airtable
const airtableApiKey = 'patH4avQdGYSC0oz4.b2bc135c01c9c5c44cfa2d8595850d75189ea9b050661b9a1efb4e243bd44156';
const airtableBaseId = 'app7Hc09WF8xul5T9';
const airtableTableName = 'user';
const base = new Airtable({ apiKey: airtableApiKey }).base(airtableBaseId);

// دالة للتحقق من الوصول إلى الجدول
async function verifyTableAccess(): Promise<boolean> {
  try {
    console.log(`Attempting to verify access to table: ${airtableTableName}`);
    const records = await base(airtableTableName)
      .select({
        maxRecords: 1,
      })
      .firstPage();
    console.log('Airtable table access verified successfully:', records.length, 'records retrieved');
    return true;
  } catch (error: any) {
    console.error('Error verifying Airtable table access:', {
      message: error.message,
      status: error.status,
      errorCode: error.error,
      details: error.response?.data || error,
    });
    return false;
  }
}

// دالة للتحقق من بيانات تسجيل الدخول
async function verifyUser(EmID: string, password: string): Promise<AirtableRecord | null> {
  try {
    // تحويل EmID إلى رقم
    const EmIDNumber = parseInt(EmID, 10);
    if (isNaN(EmIDNumber)) {
      throw new Error('معرف الموظف يجب أن يكون رقمًا صالحًا');
    }

    console.log(`Verifying user with EmID: ${EmIDNumber}`);
    const records = await base(airtableTableName)
      .select({
        filterByFormula: `AND({EmID}=${EmIDNumber},{password}='${encodeURIComponent(password)}')`,
        maxRecords: 1,
      })
      .firstPage();

    if (records.length > 0) {
      // تسجيل الحقول المسترجعة للتصحيح
      const record = records[0] as unknown as { id: string; fields: Record<string, any> };
      console.log('Retrieved record fields:', JSON.stringify(record.fields, null, 2));

      const fields = record.fields;

      // التحقق من وجود الحقول
      const requiredFields = ['Name', 'EmID', 'password', 'role', 'branch']; // تغيير name إلى Name
      const missingFields = requiredFields.filter((field) => !fields.hasOwnProperty(field) || fields[field] == null);
      if (missingFields.length > 0) {
        throw new Error(`الحقول مفقودة: ${missingFields.join(', ')}`);
      }

      // تحويل القيم والتحقق من الأنواع
      const validatedFields = {
        Name: String(fields.Name), // استخدام Name بدلاً من name
        EmID: Number(fields.EmID),
        password: String(fields.password),
        role: String(fields.role),
        branch: String(fields.branch),
      };

      // التحقق من أن الحقول النصية ليست فارغة
      const stringFields = ['Name', 'password', 'role', 'branch'];
      const emptyFields = stringFields.filter((field) => validatedFields[field as keyof typeof validatedFields] === '');
      if (emptyFields.length > 0) {
        throw new Error(`الحقول فارغة: ${emptyFields.join(', ')}`);
      }

      // التحقق من أن EmID رقم صالح
      if (isNaN(validatedFields.EmID)) {
        throw new Error('حقل معرف الموظف غير صالح');
      }

      return {
        id: record.id,
        fields: validatedFields,
      } as AirtableRecord;
    }
    return null;
  } catch (error: any) {
    console.error('Error verifying user:', error);
    throw new Error(`فشل في التحقق من المستخدم: ${error.message}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = (await req.json()) as LoginRequestData;
    console.log('Processing login request for EmID:', data.EmID);

    // التحقق من وجود EmID وpassword
    if (!data.EmID || !data.password) {
      return NextResponse.json(
        {
          success: false,
          message: 'معرف الموظف وكلمة المرور مطلوبان.',
          error: 'MISSING_FIELDS',
        },
        { status: 400 }
      );
    }

    // التحقق من الوصول إلى الجدول
    const hasAccess = await verifyTableAccess();
    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          message: 'لا يمكن الوصول إلى قاعدة البيانات.',
          error: 'INVALID_PERMISSIONS_OR_TABLE_NOT_FOUND',
        },
        { status: 403 }
      );
    }

    // التحقق من بيانات المستخدم
    const userRecord = await verifyUser(data.EmID, data.password);
    if (!userRecord) {
      return NextResponse.json(
        {
          success: false,
          message: 'معرف الموظف أو كلمة المرور غير صحيحة.',
          error: 'INVALID_CREDENTIALS',
        },
        { status: 401 }
      );
    }

    // إرجاع بيانات المستخدم
    return NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح!',
      user: {
        id: userRecord.id,
        name: userRecord.fields.Name, // تغيير إلى Name
        EmID: userRecord.fields.EmID,
        role: userRecord.fields.role,
        branch: userRecord.fields.branch,
      },
    });
  } catch (error: any) {
    console.error('Error processing login:', error);
    const errorMessage = error.message || String(error);
    const statusCode =
      errorMessage.includes('INVALID_PERMISSIONS_OR_TABLE_NOT_FOUND') ? 403 : error.status || 500;
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.',
        error: errorMessage,
      },
      { status: statusCode }
    );
  }
}