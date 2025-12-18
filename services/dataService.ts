
import { TaxRecord } from '../types';

const PUBLISHED_ID = '2PACX-1vS4Glk-fDP3vCXezi1JOG5LUFWCjpLFvvYzG55I-t6G346SlyAdCSj-qJ3DuhBl1w';
const GID = '1515609245';
const CSV_URL = `https://docs.google.com/spreadsheets/d/e/${PUBLISHED_ID}/pub?gid=${GID}&single=true&output=csv`;

export const fetchTaxData = async (): Promise<TaxRecord[]> => {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error('ไม่สามารถเข้าถึงข้อมูล Google Sheet ได้');
    const csvText = await response.text();
    
    const lines = csvText.split(/\r?\n/);
    const rows: string[][] = [];

    // ระบบแกะ CSV ที่รองรับ Comma ภายในเครื่องหมายคำพูด
    for (const line of lines) {
      if (!line.trim()) continue;
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else current += char;
      }
      result.push(current.trim());
      rows.push(result);
    }

    // แถวแรกเป็น Header ให้ข้ามไป
    const dataRows = rows.slice(1); 
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return dataRows
      .filter(row => row.length >= 8 && (row[1] !== '' || row[2] !== '' || row[3] !== '')) // กรองเฉพาะแถวที่มีข้อมูลสำคัญ
      .map((row, idx) => {
        // คำนวณ Aging จาก คอลัมน์ H (วันที่ชำระเงิน - Index 7)
        const dateH = row[7] || ''; 
        let agingDays = 0;
        
        if (dateH) {
          const parts = dateH.split(/[/.-]/);
          if (parts.length === 3) {
            let d = parseInt(parts[0]);
            let m = parseInt(parts[1]) - 1;
            let y = parseInt(parts[2]);
            if (y > 2400) y -= 543; // แปลงปี พ.ศ.
            if (y < 100) y += 2000;
            const targetDate = new Date(y, m, d);
            if (!isNaN(targetDate.getTime())) {
              const diffTime = today.getTime() - targetDate.getTime();
              agingDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            }
          }
        }

        let urgency: TaxRecord['urgency'] = 'low';
        if (agingDays > 60) urgency = 'critical';
        else if (agingDays > 30) urgency = 'high';
        else if (agingDays > 15) urgency = 'medium';

        return {
          id: `row-${idx}-${Date.now()}`,
          colA: row[0] || '', // ประเภทธุรกิจ
          colB: row[1] || '', // กฟฟ.
          colC: row[2] || '', // วันที่เอกสาร
          colD: row[3] || '', // วันที่ผ่านรายการ
          colE: row[4] || '', // เลขที่เอกสารตั้งหนี้
          colF: row[5] || '', // ปี/เดือน
          colG: row[6] || '', // เลขที่เอกสารชำระเงิน
          colH: row[7] || '', // วันที่ชำระเงิน
          colI: row[8] || '', // เลขที่ใบกำกับภาษี
          colJ: row[9] || '', // ชื่อผู้ขาย/ผู้ให้บริการ
          colK: row[10] || '', // เลขประจำตัว
          colL: parseFloat((row[11] || '0').replace(/,/g, '')) || 0, // มูลค่าฐานภาษี
          colM: parseFloat((row[12] || '0').replace(/,/g, '')) || 0, // มูลค่าภาษีซื้อ
          colN: parseFloat((row[13] || '0').replace(/,/g, '')) || 0, // มูลค่าสินค้า
          colO: row[14] || '', // สถานะรายการ
          agingDays: agingDays < 0 ? 0 : agingDays,
          urgency
        };
      });
  } catch (error) {
    console.error('Fetch Error:', error);
    return [];
  }
};
