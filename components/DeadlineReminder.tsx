
import React from 'react';
import { AlertCircle, Megaphone } from 'lucide-react';

const DeadlineReminder: React.FC = () => {
  return (
    <div className="mb-10 overflow-hidden rounded-[2rem] bg-gradient-to-r from-pink-600 to-purple-800 p-1 shadow-xl">
      <div className="flex flex-col items-center gap-6 rounded-[1.8rem] bg-white p-6 md:flex-row md:p-8">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-pink-600 shadow-inner">
          <Megaphone className="h-10 w-10 animate-pulse" />
        </div>
        <div className="flex-grow text-center md:text-left">
          <h2 className="mb-2 text-2xl font-black text-purple-900 tracking-tight">
            6 เดือนคือ Deadline ถ้าไม่อยากเสียดาย ต้องรีบเคลม! ช้ากว่านี้ระวังโดนเบี้ยปรับ 2 เท่านะคะ
          </h2>
          <p className="text-lg font-bold text-slate-700 leading-relaxed">
            โปรดระวัง!! ภาษีซื้อสามารถนำมาหักออกในการคำนวณภาษีได้ <span className="text-pink-600 underline decoration-2 underline-offset-4">ไม่เกิน 6 เดือน</span> นับแต่วันที่ถัดจากเดือนที่ออกใบกำกับภาษี
          </p>
        </div>
        <div className="hidden lg:block shrink-0">
          <div className="flex items-center gap-2 rounded-xl bg-purple-100 px-6 py-3 font-black text-purple-900 shadow-sm border border-purple-200">
            <AlertCircle className="h-5 w-5" />
            <span>IMPORTANT RULE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeadlineReminder;
