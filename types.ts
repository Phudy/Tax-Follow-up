
export interface TaxRecord {
  id: string;
  colA: string; // ประเภทธุรกิจ
  colB: string; // กฟฟ.
  colC: string; // วันที่เอกสาร
  colD: string; // วันที่ผ่านรายการ (ใช้คำนวณ Aging)
  colE: string; // เลขที่เอกสารตั้งหนี้
  colF: string; // ปี/เดือน
  colG: string; // เลขที่เอกสารชำระเงิน
  colH: string; // วันที่ชำระเงิน
  colI: string; // เลขที่ใบกำกับภาษี
  colJ: string; // ชื่อผู้ขาย/ผู้ให้บริการ
  colK: string; // เลขประจำตัว
  colL: number; // มูลค่าฐานภาษี
  colM: number; // มูลค่าภาษีซื้อ
  colN: number; // มูลค่าสินค้า
  colO: string; // สถานะรายการ
  agingDays: number; // คำนวณจาก colD
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface SummaryStats {
  totalRecords: number;
  totalBaseValue: number;
  totalVat: number;
  totalProductValue: number;
  averageAging: number;
  overdueCount: number;
}
