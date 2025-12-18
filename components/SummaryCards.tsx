
import React from 'react';
import { SummaryStats } from '../types';
import { TrendingUp, Clock, AlertCircle, CheckCircle, Calculator, ShoppingBag } from 'lucide-react';

interface Props {
  stats: SummaryStats;
}

const SummaryCards: React.FC<Props> = ({ stats }) => {
  const cards = [
    {
      title: 'รายการทั้งหมด',
      value: stats.totalRecords,
      suffix: 'รายการ',
      icon: <CheckCircle className="text-purple-600 w-5 h-5" />,
      color: 'from-purple-50 to-purple-100',
      border: 'border-purple-200',
      textColor: 'text-purple-900'
    },
    {
      title: 'รวมมูลค่าฐานภาษี',
      value: stats.totalBaseValue.toLocaleString(undefined, { maximumFractionDigits: 0 }),
      suffix: 'บาท',
      icon: <Calculator className="text-pink-600 w-5 h-5" />,
      color: 'from-pink-50 to-pink-100',
      border: 'border-pink-200',
      textColor: 'text-pink-900'
    },
    {
      title: 'ยอดรวมภาษีซื้อ',
      value: stats.totalVat.toLocaleString(undefined, { maximumFractionDigits: 0 }),
      suffix: 'บาท',
      icon: <TrendingUp className="text-purple-700 w-5 h-5" />,
      color: 'from-purple-100 to-purple-200',
      border: 'border-purple-300',
      textColor: 'text-purple-950'
    },
    {
      title: 'รวมมูลค่าสินค้า',
      value: stats.totalProductValue.toLocaleString(undefined, { maximumFractionDigits: 0 }),
      suffix: 'บาท',
      icon: <ShoppingBag className="text-slate-600 w-5 h-5" />,
      color: 'from-slate-50 to-slate-100',
      border: 'border-slate-200',
      textColor: 'text-slate-900'
    },
    {
      title: 'เฉลี่ยวันคงค้าง',
      value: stats.averageAging.toFixed(1),
      suffix: 'วัน',
      icon: <Clock className="text-purple-500 w-5 h-5" />,
      color: 'from-indigo-50 to-indigo-100',
      border: 'border-indigo-200',
      textColor: 'text-indigo-900'
    },
    {
      title: 'เกิน 30 วัน',
      value: stats.overdueCount,
      suffix: 'รายการ',
      icon: <AlertCircle className="text-pink-700 w-5 h-5" />,
      color: 'from-rose-50 to-rose-100',
      border: 'border-rose-200',
      textColor: 'text-rose-900'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {cards.map((card, i) => (
        <div key={i} className={`bg-gradient-to-br ${card.color} border ${card.border} p-5 rounded-2xl shadow-sm transition-all hover:translate-y-[-4px] hover:shadow-lg`}>
          <div className="flex justify-between items-start mb-3">
            <span className="p-2 bg-white/95 backdrop-blur rounded-xl shadow-sm border border-white/60">{card.icon}</span>
          </div>
          <h3 className={`${card.textColor} text-[10px] font-black uppercase tracking-wider leading-tight h-8 flex items-center`}>{card.title}</h3>
          <div className="flex flex-col mt-1">
            <span className="text-2xl font-black text-slate-900 leading-none tracking-tight truncate" title={card.value.toString()}>
              {card.value}
            </span>
            <span className={`${card.textColor} text-[10px] font-bold mt-1 uppercase tracking-widest opacity-70`}>{card.suffix}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
