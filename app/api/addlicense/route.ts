import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Airtable from 'airtable';

// إعدادات Airtable
const airtableApiKey = 'patH4avQdGYSC0oz4.b2bc135c01c9c5c44cfa2d8595850d75189ea9b050661b9a1efb4e243bd44156';
const airtableBaseId = 'app7Hc09WF8xul5T9';
const airtableTableName = 'license';
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

// دالة للتحقق من وجود اللوحة مسبقًا
async function checkPlateExists(plate: string, excludeId?: string): Promise<boolean> {
  try {
    const records = await base(airtableTableName)
      .select({
        filterByFormula: `{Name} = '${encodeURIComponent(plate)}'`,
        maxRecords: 1,
      })
      .firstPage();
    if (excludeId) {
      return records.length > 0 && records[0].id !== excludeId;
    }
    return records.length > 0;
  } catch (error: any) {
    console.error('Error checking plate existence:', error);
    throw new Error(`Failed to check plate existence: ${error.message}`);
  }
}

// جلب قائمة اللوحات
export async function GET(req: NextRequest) {
  try {
    const hasAccess = await verifyTableAccess();
    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cannot access the database.',
          error: 'INVALID_PERMISSIONS_OR_TABLE_NOT_FOUND',
        },
        { status: 403 }
      );
    }

    const records = await base(airtableTableName)
      .select({
        view: 'Grid view',
      })
      .all();

    const plates = records.map((record) => ({
      id: record.id,
      fields: {
        Name: String(record.fields.Name),
      },
    }));

    return NextResponse.json({
      success: true,
      message: 'Plates fetched successfully!',
      results: plates,
    });
  } catch (error: any) {
    console.error('Error fetching plates:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch plates. Please try again.',
        error: error.message || String(error),
      },
      { status: 500 }
    );
  }
}

// إضافة لوحة جديدة
export async function POST(req: NextRequest) {
  try {
    const { letters, numbers } = await req.json();
    if (!letters || typeof letters !== 'string' || !numbers || typeof numbers !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Letters and numbers are required and must be strings' },
        { status: 400 }
      );
    }

    // التحقق من صحة الإدخال
    const lettersRegex = /^[ء-ي\s]+$/; // حروف عربية ومسافات فقط
    const numbersRegex = /^\d{1,4}$/; // من 1 إلى 4 أرقام
    if (!lettersRegex.test(letters.trim())) {
      return NextResponse.json(
        { success: false, error: 'Letters must contain only Arabic letters and spaces' },
        { status: 400 }
      );
    }
    if (!numbersRegex.test(numbers.trim())) {
      return NextResponse.json(
        { success: false, error: 'Numbers must contain 1 to 4 digits only' },
        { status: 400 }
      );
    }

    const plate = `${letters.trim()} ${numbers.trim()}`;

    // التحقق من الوصول إلى الجدول
    const hasAccess = await verifyTableAccess();
    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot access the database.',
          errorCode: 'INVALID_PERMISSIONS_OR_TABLE_NOT_FOUND',
        },
        { status: 403 }
      );
    }

    // التحقق من عدم وجود اللوحة مسبقًا
    const plateExists = await checkPlateExists(plate);
    if (plateExists) {
      return NextResponse.json(
        { success: false, error: 'Plate already exists' },
        { status: 400 }
      );
    }

    // إضافة اللوحة إلى Airtable
    const createdRecords = await base(airtableTableName).create([
      {
        fields: {
          Name: plate,
        },
      },
    ]);

    const recordId = createdRecords[0].id;
    console.log('Created plate record with ID:', recordId);

    return NextResponse.json({
      success: true,
      message: 'Plate added successfully!',
      result: {
        id: recordId,
        fields: createdRecords[0].fields,
      },
    });
  } catch (error: any) {
    console.error('Error adding plate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add plate' },
      { status: 500 }
    );
  }
}

// تعديل لوحة موجودة
export async function PUT(req: NextRequest) {
  try {
    const { id, letters, numbers } = await req.json();
    if (!id || typeof id !== 'string' || !letters || typeof letters !== 'string' || !numbers || typeof numbers !== 'string') {
      return NextResponse.json(
        { success: false, error: 'ID, letters, and numbers are required and must be strings' },
        { status: 400 }
      );
    }

    // التحقق من صحة الإدخال
    const lettersRegex = /^[ء-ي\s]+$/; // حروف عربية ومسافات فقط
    const numbersRegex = /^\d{1,4}$/; // من 1 إلى 4 أرقام
    if (!lettersRegex.test(letters.trim())) {
      return NextResponse.json(
        { success: false, error: 'Letters must contain only Arabic letters and spaces' },
        { status: 400 }
      );
    }
    if (!numbersRegex.test(numbers.trim())) {
      return NextResponse.json(
        { success: false, error: 'Numbers must contain 1 to 4 digits only' },
        { status: 400 }
      );
    }

    const plate = `${letters.trim()} ${numbers.trim()}`;

    // التحقق من الوصول إلى الجدول
    const hasAccess = await verifyTableAccess();
    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot access the database.',
          errorCode: 'INVALID_PERMISSIONS_OR_TABLE_NOT_FOUND',
        },
        { status: 403 }
      );
    }

    // التحقق من عدم وجود اللوحة مسبقًا (باستثناء السجل الحالي)
    const plateExists = await checkPlateExists(plate, id);
    if (plateExists) {
      return NextResponse.json(
        { success: false, error: 'Plate already exists' },
        { status: 400 }
      );
    }

    // تعديل اللوحة في Airtable
    const updatedRecords = await base(airtableTableName).update([
      {
        id,
        fields: {
          Name: plate,
        },
      },
    ]);

    console.log('Updated plate record with ID:', id);

    return NextResponse.json({
      success: true,
      message: 'Plate updated successfully!',
      result: {
        id: updatedRecords[0].id,
        fields: updatedRecords[0].fields,
      },
    });
  } catch (error: any) {
    console.error('Error updating plate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update plate' },
      { status: 500 }
    );
  }
}

// حذف لوحة
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Plate ID is required and must be a string' },
        { status: 400 }
      );
    }

    // التحقق من الوصول إلى الجدول
    const hasAccess = await verifyTableAccess();
    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot access the database.',
          errorCode: 'INVALID_PERMISSIONS_OR_TABLE_NOT_FOUND',
        },
        { status: 403 }
      );
    }

    // حذف اللوحة من Airtable
    await base(airtableTableName).destroy([id]);
    console.log('Deleted plate record with ID:', id);

    return NextResponse.json({
      success: true,
      message: 'Plate deleted successfully!',
    });
  } catch (error: any) {
    console.error('Error deleting plate:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete plate. Please try again.',
        error: error.message || String(error),
      },
      { status: 500 }
    );
  }
}