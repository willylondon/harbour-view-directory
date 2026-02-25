"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from "recharts";
import { ArrowLeft, MoreHorizontal, Download, Users } from "lucide-react";

export default function SiteDetail({ params }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;

    const [siteData, setSiteData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/analytics")
            .then((res) => res.json())
            .then((json) => {
                const found = json.data.find((s) => s.id === id);
                setSiteData(found);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[50vh]">
                <div className="flex gap-2">
                    <div className="w-3 h-3 bg-[#9bee4e] rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-[#f59e0b] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-[#3b82f6] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        );
    }

    if (!siteData) {
        return (
            <div className="text-center py-20 matte-card">
                <h2 className="text-2xl font-bold text-red-500 mb-4">Site Not Found</h2>
                <Link href="/" className="pill-btn inline-flex bg-[#1c1c1c]">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
            </div>
        );
    }

    const COLORS = [siteData.color, "#3b82f6", "#f59e0b", "#8b5cf6"];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12 print:pb-0">
            {/* Top Action Bar */}
            <div className="flex justify-between items-center mb-4 print:hidden">
                <Link href="/" className="pill-btn hover:px-6 transition-all">
                    <ArrowLeft size={16} /> Overview
                </Link>
                <div className="flex gap-3">
                    <button
                        className="pill-btn text-[#8b8b8b] hover:text-white group"
                        onClick={() => window.print()}
                    >
                        <Download size={14} className="group-hover:-translate-y-0.5 transition-transform" /> Export PDF
                    </button>
                </div>
            </div>

            {/* Header Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl font-black text-black" style={{ backgroundColor: siteData.color }}>
                        {siteData.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight uppercase">{siteData.name}</h1>
                        <a href={`https://${siteData.url}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-[#8b8b8b] hover:text-white transition-colors">
                            {siteData.url} ↗
                        </a>
                    </div>
                </div>

                {/* Simulated Live Counter */}
                <div className="matte-card py-2 px-4 rounded-full flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#9bee4e] animate-pulse shadow-[0_0_10px_#9bee4e]"></div>
                    <span className="text-xs font-bold text-[#8b8b8b] tracking-wider uppercase">Active Now</span>
                    <span className="text-lg font-black text-white ml-2 flex items-center gap-1"><Users size={16} /> {Math.floor(Math.random() * 5) + 1}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Custom Metrics Top Row */}
                <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="matte-card flex flex-col justify-center">
                        <p className="text-[10px] text-[#8b8b8b] uppercase tracking-wider mb-1">Total Visitors</p>
                        <p className="text-3xl font-black text-white">{siteData.traffic.visitors.toLocaleString()}</p>
                    </div>
                    <div className="matte-card flex flex-col justify-center">
                        <p className="text-[10px] text-[#8b8b8b] uppercase tracking-wider mb-1">Total Page Views</p>
                        <p className="text-3xl font-black text-white">{siteData.traffic.pageViews.toLocaleString()}</p>
                    </div>
                    {Object.entries(siteData.customMetrics).map(([key, value]) => (
                        <div key={key} className="matte-card flex flex-col justify-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <DiamondIcon />
                            </div>
                            <p className="text-[10px] text-[#8b8b8b] uppercase tracking-wider mb-1 z-10">{key}</p>
                            <p className="text-3xl font-black z-10" style={{ color: siteData.color }}>{value.toLocaleString()}</p>
                        </div>
                    ))}
                </div>

                {/* Main Traffic Chart */}
                <div className="matte-card lg:col-span-2 min-h-[400px] flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6 z-10">
                        <h3 className="text-sm font-bold text-[#8b8b8b] tracking-wider uppercase">Daily Traffic Velocity</h3>
                        <MoreHorizontal size={18} className="text-[#8b8b8b] cursor-pointer hover:text-white" />
                    </div>
                    <div className="h-[300px] w-full flex-1 z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={siteData.dailyTraffic} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={siteData.color} stopOpacity={0.6} />
                                        <stop offset="95%" stopColor={siteData.color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#333" tick={{ fill: '#8b8b8b', fontSize: 10 }} tickLine={false} axisLine={false} />
                                <YAxis stroke="#333" tick={{ fill: '#8b8b8b', fontSize: 10 }} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: '#18181b' }} />
                                <Area type="monotone" dataKey="visitors" stroke={siteData.color} strokeWidth={3} fillOpacity={1} fill="url(#colorVis)" isAnimationActive={true} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Traffic Sources Chart */}
                <div className="matte-card min-h-[400px] flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-sm font-bold text-[#8b8b8b] tracking-wider uppercase">Acquisition</h3>
                        <MoreHorizontal size={18} className="text-[#8b8b8b] cursor-pointer hover:text-white" />
                    </div>
                    <div className="h-[250px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={siteData.sources}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                    isAnimationActive={true}
                                >
                                    {siteData.sources.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Center Absolute Total */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-white">{siteData.traffic.visitors.toLocaleString()}</span>
                            <span className="text-[10px] text-[#8b8b8b] uppercase tracking-wider">Total</span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-[#ffffff05]">
                        {siteData.sources.map((entry, index) => (
                            <div key={entry.name} className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full border border-black shadow" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-xs font-semibold text-white">{entry.name}</span>
                                </div>
                                <span className="text-sm font-bold" style={{ color: COLORS[index % COLORS.length] }}>{entry.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Simple diamond icon for decoration
function DiamondIcon() {
    return (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z" />
        </svg>
    )
}
