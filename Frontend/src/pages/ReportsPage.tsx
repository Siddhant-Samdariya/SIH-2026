import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Printer, 
  X, 
  CheckCircle2, 
  Calendar,
  FileCheck,
  Inbox
} from 'lucide-react';

interface ReportDoc {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'Ready' | 'Processing';
  size: string;
  summary: string;
  author: string;
}

export const ReportsPage: React.FC = () => {
  const reportsList: ReportDoc[] = [];

  const [activeReport, setActiveReport] = useState<ReportDoc | null>(null);

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
          Document & Report Center
        </h2>
        <p className="text-sm text-slate-600 font-normal">
          Official municipal reports generated from MARGANETRA (मार्गनेत्र) bus fleet computer vision and GIS telemetry.
        </p>
      </div>

      {/* Reports List or Clean Empty State */}
      {reportsList.length === 0 ? (
        <div className="urbansense-card p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Inbox className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-base">No reports available</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Generated municipal intelligence summaries and daily digests will appear here when ready.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reportsList.map((rep) => (
            <div key={rep.id} className="urbansense-card p-6 flex flex-wrap items-center justify-between gap-4 hover:border-slate-300 transition-all">
              <div className="flex items-start gap-4 flex-1 min-w-[280px]">
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-[#1b365d] flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-900 text-base">{rep.title}</h3>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-mono font-bold text-[10px]">
                      ● {rep.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">{rep.description}</p>
                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                    <span>Date: {rep.date}</span>
                    <span>Size: {rep.size}</span>
                    <span>ID: {rep.id}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveReport(rep)}
                  className="btn-secondary text-xs"
                >
                  <Eye className="w-4 h-4" /> View
                </button>
                <button
                  onClick={() => alert(`Generating fresh PDF export for: ${rep.title}`)}
                  className="btn-primary text-xs"
                >
                  <Download className="w-4 h-4" /> Generate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Modal Preview */}
      {activeReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden space-y-6 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">{activeReport.id}</span>
                <h3 className="text-2xl font-bold text-slate-900">{activeReport.title}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Published {activeReport.date} • {activeReport.author}</p>
              </div>
              <button
                onClick={() => setActiveReport(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 font-sans text-xs text-slate-700 leading-relaxed">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 font-mono uppercase text-xs">Executive Summary</h4>
                <p>{activeReport.summary}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
