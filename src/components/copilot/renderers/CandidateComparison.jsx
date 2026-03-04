import React from 'react';
import { User, CheckCircle2, XCircle, Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CandidateComparison({ data }) {
    if (!data || !data.candidates) return null;

    const { candidates, summary } = data;

    return (
        <div className="space-y-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-400">
            {/* Summary Label */}
            {summary && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-tight">Phân tích AI</span>
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                        {summary}
                    </p>
                </div>
            )}

            {/* Candidates Grid */}
            <div className="flex flex-col gap-3">
                {candidates.map((c, idx) => (
                    <div
                        key={idx}
                        className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden hover:border-emerald-200 transition-colors"
                    >
                        <div className="bg-gray-50/50 p-2.5 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                                    <User className="w-4 h-4 text-indigo-600" />
                                </div>
                                <span className="font-semibold text-[13px] text-gray-800">{c.name}</span>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-lg">
                                <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                                <span className="text-[11px] font-bold">{c.matchScore}%</span>
                            </div>
                        </div>

                        <div className="p-3 space-y-2.5">
                            {/* Strengths */}
                            <div className="space-y-1.5">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Điểm mạnh
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {c.strengths?.map((s, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md text-[11px]">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Weaknesses */}
                            {c.weaknesses?.length > 0 && (
                                <div className="space-y-1.5">
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                        <XCircle className="w-3 h-3 text-red-400" /> Hạn chế
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {c.weaknesses.map((w, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-md text-[11px]">
                                                {w}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
