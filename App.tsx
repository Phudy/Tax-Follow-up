import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { 
  Search, Download, RefreshCw, 
  ArrowUpDown, Sparkles, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';
import { TaxRecord, SummaryStats } from './types';
import { fetchTaxData } from './services/dataService';
import SummaryCards from './components/SummaryCards';
import AgingChart from './components/AgingChart';
import StatusPieChart from './components/StatusPieChart';
import BusinessTypeChart from './components/BusinessTypeChart';
import DeadlineReminder from './components/DeadlineReminder';

type SortConfig = {
  key: keyof TaxRecord | null;
  direction: 'asc' | 'desc';
};

type ColumnFilters = {
  [key in keyof TaxRecord]?: string;
};

const App: React.FC = () => {
  const [data, setData] = useState<TaxRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'agingDays', direction: 'desc' });
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const columns = [
    { key: 'colO', label: 'สถานะรายการ' },
    { key: 'agingDays', label: 'Aging (วัน)' },
    { key: 'colA', label: 'ประเภทธุรกิจ' },
    { key: 'colB', label: 'กฟฟ.' },
    { key: 'colC', label: 'วันที่เอกสาร' },
    { key: 'colD', label: 'วันที่ผ่านรายการ' },
    { key: 'colE', label: 'เลขที่เอกสารตั้งหนี้' },
    { key: 'colF', label: 'ปี/เดือน' },
    { key: 'colG', label: 'เลขที่เอกสารชำระเงิน' },
    { key: 'colH', label: 'วันที่ชำระเงิน' },
    { key: 'colI', label: 'เลขที่ใบกำกับภาษี' },
    { key: 'colJ', label: 'ชื่อผู้ขาย/ผู้ให้บริการ' },
    { key: 'colK', label: 'เลขประจำตัว' },
    { key: 'colL', label: 'มูลค่าฐานภาษี', align: 'right' },
    { key: 'colM', label: 'มูลค่าภาษีซื้อ', align: 'right' },
    { key: 'colN', label: 'มูลค่าสินค้า', align: 'right' }
  ];

  const loadData = async () => {
    setLoading(true);
    const result = await fetchTaxData();
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSort = (key: keyof TaxRecord) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleColumnFilterChange = (key: keyof TaxRecord, value: string) => {
    setColumnFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredAndSortedData = useMemo(() => {
    let processed = data.filter(item => {
      const globalSearch = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || 
        Object.values(item).some(val => val?.toString().toLowerCase().includes(globalSearch));
      
      const matchesColumnFilters = (Object.entries(columnFilters) as [keyof TaxRecord, string][]).every(([key, value]) => {
        if (!value) return true;
        return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
      });
      return matchesSearch && matchesColumnFilters;
    });

    if (sortConfig.key) {
      processed.sort((a, b) => {
        const aVal = a[sortConfig.key!];
        const bVal = b[sortConfig.key!];
        if (aVal === bVal) return 0;
        const comparison = aVal < bVal ? -1 : 1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }
    return processed;
  }, [data, searchTerm, columnFilters, sortConfig]);

  const stats: SummaryStats = useMemo(() => {
    if (data.length === 0) return { totalRecords: 0, totalBaseValue: 0, totalVat: 0, totalProductValue: 0, averageAging: 0, overdueCount: 0 };
    const totalBaseValue = data.reduce((sum, item) => sum + item.colL, 0);
    const totalVat = data.reduce((sum, item) => sum + item.colM, 0); 
    const totalProductValue = data.reduce((sum, item) => sum + item.colN, 0);
    const totalAging = data.reduce((sum, item) => sum + item.agingDays, 0);
    const overdueCount = data.filter(item => item.agingDays > 30).length;
    return {
      totalRecords: data.length,
      totalBaseValue,
      totalVat,
      totalProductValue,
      averageAging: totalAging / data.length,
      overdueCount
    };
  }, [data]);

  const footerTotals = useMemo(() => {
    return filteredAndSortedData.reduce((acc, item) => ({
      l: acc.l + item.colL,
      m: acc.m + item.colM,
      n: acc.n + item.colN
    }), { l: 0, m: 0, n: 0 });
  }, [filteredAndSortedData]);

  const analyzeWithAI = async () => {
    if (data.length === 0) return;
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const summaryText = `รายการทั้งหมด ${data.length} รายการ, รวมมูลค่าฐานภาษี ${stats.totalBaseValue.toLocaleString()} บาท, ภาษีซื้อรวม ${stats.totalVat.toLocaleString()} บาท, รวมมูลค่าสินค้า ${stats.totalProductValue.toLocaleString()} บาท, วันคงค้างเฉลี่ย ${stats.averageAging.toFixed(0)} วัน, รายการเกินกำหนด ${stats.overdueCount} รายการ`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `วิเคราะห์สถานะภาษีคงค้างนี้และให้คำแนะนำ 3 ข้อเชิงรุกสำหรับผู้บริหาร: ${summaryText}`,
        config: { systemInstruction: "คุณคือผู้เชี่ยวชาญบัญชีและการเงินของการไฟฟ้าส่วนภูมิภาคเขต 3 ภาคกลาง ที่มีบุคลิกน่าเชื่อถือ สุขุม และเก่งวิเคราะห์ข้อมูลภาษี" }
      });
      setAiAnalysis(response.text || 'ไม่สามารถวิเคราะห์ได้');
    } catch (err) {
      console.error(err);
      setAiAnalysis('ระบบวิเคราะห์ขัดข้อง');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF1F2]">
      {/* Dynamic Accent Line */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-900 via-pink-600 to-purple-800 z-[60]"></div>
      
      <header className="bg-[#4a044e] sticky top-0 z-50 shadow-xl border-b border-purple-900">
        <div className="container mx-auto px-4 py-6 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center font-bold text-[#4a044e] shadow-lg text-2xl border border-pink-200">TAX</div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
                Tax Follow-up : <span className="text-pink-300">ระบบติดตามสถานะภาษีซื้อรอโอนคงค้าง (D7)</span>
              </h1>
              <p className="text-lg text-pink-100/80 font-bold mt-1">
                แผนกประมวลผลและวิเคราะห์บัญชี • กฟก.3 นครปฐม
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={loadData} 
              title="รีเฟรชข้อมูล" 
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all shadow-sm backdrop-blur-md"
            >
              <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button className="flex items-center gap-3 bg-pink-600 text-white px-8 py-3 rounded-xl text-lg font-bold shadow-lg hover:bg-pink-500 transition-all transform hover:scale-105 active:scale-95 border border-pink-400">
              <Download className="w-5 h-5" />
              รายงาน
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <SummaryCards stats={stats} />
        
        <DeadlineReminder />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <div className="lg:col-span-4">
            <AgingChart data={data} />
          </div>
          <div className="lg:col-span-4">
            <BusinessTypeChart data={data} />
          </div>
          <div className="lg:col-span-4">
            <StatusPieChart data={data} />
          </div>
        </div>

        <div className="mb-10">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-pink-100 flex flex-col md:flex-row items-center gap-8">
            <div className="shrink-0 flex flex-col items-center gap-3">
              <div className="p-4 bg-pink-50 rounded-2xl text-pink-600 shadow-inner border border-pink-100">
                <Sparkles className="w-8 h-8" />
              </div>
              <button 
                onClick={analyzeWithAI} 
                disabled={isAnalyzing} 
                className="text-xs font-black text-pink-600 hover:underline uppercase tracking-wider"
              >
                {isAnalyzing ? 'กำลังวิเคราะห์...' : 'เริ่มการวิเคราะห์ AI'}
              </button>
            </div>
            <div className="flex-grow">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-3">AI EXECUTIVE INSIGHTS</h4>
              <div className="text-slate-700 text-lg leading-relaxed font-medium">
                {aiAnalysis || "คลิก 'เริ่มการวิเคราะห์ AI' เพื่อรับข้อมูลเชิงลึกและคำแนะนำเชิงกลยุทธ์จากระบบอัจฉริยะ"}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-pink-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-pink-600 transition-colors" />
                <input 
                  type="text"
                  placeholder="ค้นหาข้อมูลในตาราง..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-pink-500 transition-all shadow-sm font-medium"
                />
              </div>
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-700 rounded-xl font-bold text-sm">
                <Filter className="w-4 h-4" />
                <span>{filteredAndSortedData.length} รายการ</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="p-3 text-slate-400 hover:text-pink-600 transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button className="p-3 text-slate-400 hover:text-pink-600 transition-colors">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar table-container">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80">
                  {columns.map((col) => (
                    <th key={col.key} className="p-5 border-b border-slate-100">
                      <div className="flex flex-col gap-3">
                        <button 
                          onClick={() => handleSort(col.key as keyof TaxRecord)}
                          className={`flex items-center gap-2 text-xs font-black uppercase tracking-wider ${sortConfig.key === col.key ? 'text-pink-600' : 'text-slate-500'} hover:text-pink-600 transition-colors whitespace-nowrap`}
                        >
                          {col.label}
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                        <input 
                          type="text"
                          placeholder="กรอง..."
                          value={columnFilters[col.key as keyof TaxRecord] || ''}
                          onChange={(e) => handleColumnFilterChange(col.key as keyof TaxRecord, e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-pink-400 bg-white/50"
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAndSortedData.map((item) => (
                  <tr key={item.id} className="hover:bg-pink-50/30 transition-colors group">
                    <td className="p-5">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wide shadow-sm ${
                        item.colO?.includes('จ่ายชำระเงินแล้ว') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                        item.colO?.includes('ยังไม่จ่ายชำระเงิน') ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-slate-50 text-slate-600'
                      }`}>
                        {item.colO}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full shadow-inner ${
                          item.urgency === 'critical' ? 'bg-rose-500 animate-pulse' :
                          item.urgency === 'high' ? 'bg-orange-500' :
                          item.urgency === 'medium' ? 'bg-amber-400' : 'bg-slate-300'
                        }`} />
                        <span className="font-black text-slate-700">{item.agingDays}</span>
                      </div>
                    </td>
                    <td className="p-5 text-sm font-bold text-slate-600 whitespace-nowrap">{item.colA}</td>
                    <td className="p-5 text-sm font-bold text-slate-600">{item.colB}</td>
                    <td className="p-5 text-sm text-slate-500">{item.colC}</td>
                    <td className="p-5 text-sm text-slate-500">{item.colD}</td>
                    <td className="p-5 text-sm font-mono text-slate-600 font-bold">{item.colE}</td>
                    <td className="p-5 text-sm text-slate-500">{item.colF}</td>
                    <td className="p-5 text-sm font-mono text-slate-600">{item.colG}</td>
                    <td className="p-5 text-sm font-bold text-slate-700">{item.colH}</td>
                    <td className="p-5 text-sm font-mono text-slate-600">{item.colI}</td>
                    <td className="p-5 text-sm font-bold text-slate-800 whitespace-nowrap">{item.colJ}</td>
                    <td className="p-5 text-sm font-mono text-slate-500">{item.colK}</td>
                    <td className="p-5 text-right text-sm font-bold text-slate-700">{item.colL.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-5 text-right text-sm font-black text-pink-600">{item.colM.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-5 text-right text-sm font-bold text-slate-700">{item.colN.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-900 text-white sticky bottom-0">
                <tr>
                  <td colSpan={13} className="p-6 font-black text-right uppercase tracking-[0.2em] text-pink-400">Total Sum:</td>
                  <td className="p-6 text-right font-black">{footerTotals.l.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="p-6 text-right font-black text-pink-300">{footerTotals.m.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="p-6 text-right font-black">{footerTotals.n.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </main>

      <footer className="bg-slate-950 text-white py-12 mt-12 border-t-4 border-pink-600">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-slate-950">TAX</div>
            <h3 className="text-xl font-black tracking-widest uppercase">TAX AI PLATFORM</h3>
          </div>
          <p className="text-slate-400 font-medium mb-2">ระบบติดตามภาษีซื้อรอโอนคงค้าง (D7)</p>
          <p className="text-slate-500 text-sm">
            แผนกประมวลผลและวิเคราะห์บัญชี • การไฟฟ้าส่วนภูมิภาคเขต 3 ภาคกลาง จังหวัดนครปฐม
          </p>
          <div className="mt-8 pt-8 border-t border-slate-900 text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">
            &copy; 2025 Provincial Electricity Authority Region 3 Central. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;