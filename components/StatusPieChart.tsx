
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TaxRecord } from '../types';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  data: TaxRecord[];
}

const StatusPieChart: React.FC<Props> = ({ data }) => {
  const statusCounts = data.reduce((acc, item) => {
    const status = item.colO || 'ไม่ระบุ';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(statusCounts).map(key => ({
    name: key,
    value: statusCounts[key]
  }));

  // Palette: Purple, Pink, Slate Grey, Rose
  const COLORS = ['#7e22ce', '#db2777', '#64748b', '#e11d48', '#a855f7'];

  const hasPaid = data.some(item => item.colO?.includes('จ่ายชำระเงินแล้ว'));
  const hasUnpaid = data.some(item => item.colO?.includes('ยังไม่จ่ายชำระเงิน'));

  return (
    <div className="bg-[#fdf2f8] p-8 rounded-3xl shadow-sm border border-pink-100 flex flex-col h-[400px]">
      <h3 className="text-lg font-bold mb-6 text-slate-800">สัดส่วนสถานะรายการ</h3>
      
      <div className="flex-grow min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: '14px', fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '5px' }} verticalAlign="bottom" height={30}/>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-3">
        {hasPaid && (
          <div className="flex items-start gap-4 p-4 bg-white/60 backdrop-blur-sm border border-purple-100 rounded-2xl shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-purple-600 mt-1 shrink-0" />
            <p className="text-lg font-bold text-purple-900 leading-snug">
              รายการที่ชำระแล้ว: <span className="text-pink-600 underline decoration-2 underline-offset-4">ให้เร่งโอนภาษีซื้อรอโอน (D7)</span>
            </p>
          </div>
        )}
        {hasUnpaid && (
          <div className="flex items-start gap-4 p-4 bg-white/60 backdrop-blur-sm border border-pink-100 rounded-2xl shadow-sm">
            <AlertTriangle className="w-6 h-6 text-pink-600 mt-1 shrink-0" />
            <p className="text-lg font-bold text-pink-900 leading-snug">
              ยังไม่ชำระเงิน: <span className="text-purple-600 underline decoration-2 underline-offset-4">ให้เร่งประสานงานจ่ายชำระ</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusPieChart;
