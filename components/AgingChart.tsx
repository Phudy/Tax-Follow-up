
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TaxRecord } from '../types';

interface Props {
  data: TaxRecord[];
}

const AgingChart: React.FC<Props> = ({ data }) => {
  const bins = [
    { name: '0-15 วัน', count: 0, color: '#94a3b8' }, // สีเทา (Slate 400)
    { name: '16-30 วัน', count: 0, color: '#f59e0b' }, // สีเหลือง (Amber 500)
    { name: '31-60 วัน', count: 0, color: '#ef4444' }, // สีแดงสด (Red 500)
    { name: '60+ วัน', count: 0, color: '#991b1b' }  // สีแดงเข้ม (Red 800)
  ];

  data.forEach(item => {
    if (item.agingDays <= 15) bins[0].count++;
    else if (item.agingDays <= 30) bins[1].count++;
    else if (item.agingDays <= 60) bins[2].count++;
    else bins[3].count++;
  });

  return (
    <div className="bg-[#fdf2f8] p-8 rounded-3xl shadow-sm border border-pink-100 h-[400px]">
      <h3 className="text-lg font-bold mb-8 text-slate-800">ช่วงเวลาคงค้าง (ไม่โอนภาษีนับจากวันที่ชำระเงิน) (Aging Analysis)</h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bins}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fce7f3" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
            <Tooltip 
              cursor={{fill: '#fce7f3'}}
              contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: '14px', fontWeight: 'bold'}}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={50}>
              {bins.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AgingChart;
