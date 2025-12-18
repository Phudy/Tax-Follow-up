
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TaxRecord } from '../types';

interface Props {
  data: TaxRecord[];
}

const BusinessTypeChart: React.FC<Props> = ({ data }) => {
  const counts = data.reduce((acc, item) => {
    const type = item.colA || 'ไม่ระบุ';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = (Object.entries(counts) as [string, number][])
    .map(([name, count]): { name: string; count: number } => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); 

  // Palette: Purple & Pink shades
  const COLORS = ['#6b21a8', '#9333ea', '#c084fc', '#db2777', '#f472b6', '#7c3aed', '#be185d', '#4c1d95'];

  return (
    <div className="bg-[#fdf2f8] p-8 rounded-3xl shadow-sm border border-pink-100 h-[400px]">
      <h3 className="text-lg font-bold mb-6 text-slate-800">สัดส่วนตามประเภทธุรกิจ (Top 8)</h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#fce7f3" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              width={120}
              tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}}
            />
            <Tooltip 
              cursor={{fill: '#fce7f3'}}
              contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: '14px', fontWeight: 'bold'}}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={25}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BusinessTypeChart;
