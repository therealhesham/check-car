import type { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { plate } = await req.json();
    if (!plate || typeof plate !== 'string') {
      return Response.json({ error: 'Plate is required and must be a string' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'lib', 'License.tsx');
    const newPlate = `'${plate}'`;
    const content = fs.readFileSync(filePath, 'utf-8');
    const updatedContent = content.replace(
      'export const licenseList = [',
      `export const licenseList = [\n    ${newPlate},`
    );
    fs.writeFileSync(filePath, updatedContent);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error adding plate:', error);
    return Response.json({ error: 'Failed to add plate' }, { status: 500 });
  }
}