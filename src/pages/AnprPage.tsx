import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getANPRRecords, searchANPRRecords } from '../api/anpr';
import { ANPRRecord } from '../types/itms';
import { ANPRPipeline } from '../components/ANPRPipeline';
import { ANPRTable } from '../components/ANPRTable';
import { Scan, Search, ShieldCheck, CheckCircle2, AlertOctagon } from 'lucide-react';

export const AnprPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('search') || '';
  const [records, setRecords] = useState<ANPRRecord[]>([]);

  useEffect(() => {
    if (initialQuery) {
      searchANPRRecords(initialQuery).then(data => setRecords(data));
    } else {
      getANPRRecords().then(data => setRecords(data));
    }
  }, [initialQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 glass-panel">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-mono tracking-wide flex items-center gap-2">
            <Scan className="w-5 h-5 text-amber-400" />
            Automatic Number Plate Recognition (ANPR) & Vehicle Registry
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Real-time license plate extraction, OCR confidence scoring, and stolen/blacklisted vehicle verification.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-slate-300">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>OCR Accuracy: <strong className="text-emerald-400">96.2%</strong></span>
          </div>
        </div>
      </div>

      {/* ANPR Interactive 5-Stage Inference Pipeline Flow */}
      <ANPRPipeline latestRecord={records[0]} />

      {/* Historical ANPR Log Table with CSV export & filters */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-100 font-mono text-base tracking-wide flex items-center gap-2">
          <Scan className="w-5 h-5 text-cyan-400" />
          Vehicle Plate Search & Historical Audit Records
        </h3>
        <ANPRTable records={records} />
      </div>
    </div>
  );
};
