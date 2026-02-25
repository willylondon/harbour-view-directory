"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { MoreHorizontal, ArrowUpRight, ArrowDownRight, ChevronDown, AlertCircle } from "lucide-react";
import { use } from "react";

export default function Dashboard({ searchParams }) {
  const resolvedParams = searchParams ? use(searchParams) : {};
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tiktokData, setTiktokData] = useState(null);

  const [siteFilter, setSiteFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("30D");

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics").then((res) => res.json()),
      fetch("/api/tiktok").then((res) => res.json())
    ]).then(([analyticsJson, tiktokJson]) => {
      setData(analyticsJson.data);
      setTiktokData(tiktokJson);
      setLoading(false);
    });
  }, []);

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

  const availableSites = ["All", ...data.map(d => d.name)];

  let filteredData = data;
  if (siteFilter !== "All") {
    filteredData = data.filter(d => d.name === siteFilter);
  }

  let scaledData = filteredData;
  if (dateFilter === "7D") {
    scaledData = filteredData.map(site => ({
      ...site,
      traffic: {
        visitors: Math.floor(site.traffic.visitors * 0.25),
        pageViews: Math.floor(site.traffic.pageViews * 0.25)
      }
    }));
  } else if (dateFilter === "24H") {
    scaledData = filteredData.map(site => ({
      ...site,
      traffic: {
        visitors: Math.floor(site.traffic.visitors * 0.03),
        pageViews: Math.floor(site.traffic.pageViews * 0.03)
      }
    }));
  }

  const totalVisitors = scaledData.reduce((acc, site) => acc + site.traffic.visitors, 0);
  const totalPageViews = scaledData.reduce((acc, site) => acc + site.traffic.pageViews, 0);

  // Aggregate daily data across all sites for the main chart
  const aggregateDaily = [];
  if (filteredData.length > 0 && filteredData[0].dailyTraffic) {
    filteredData[0].dailyTraffic.forEach((_, index) => {
      let dayVisitors = 0;
      let dayViews = 0;
      let date = "";
      filteredData.forEach(site => {
        if (site.dailyTraffic && site.dailyTraffic[index]) {
          dayVisitors += site.dailyTraffic[index].visitors;
          dayViews += site.dailyTraffic[index].pageViews;
          date = site.dailyTraffic[index].date;
        }
      });
      aggregateDaily.push({ date, visitors: dayVisitors, pageViews: dayViews });
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">

      {resolvedParams.error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <span className="font-semibold text-sm">OAuth Error: {resolvedParams.error}</span>
        </div>
      )}

      {tiktokData?.errors && tiktokData.errors.map((err, i) => (
        <div key={i} className="bg-orange-500/10 border border-orange-500/20 text-orange-500 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <span className="font-semibold text-sm">TikTok API Error: {typeof err === 'object' ? JSON.stringify(err) : err}</span>
        </div>
      ))}

      {/* Page Title & Controls */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">Overview</h1>

        {/* Date / Filter Pills matching reference */}
        <div className="flex gap-3">
          <div className="pill-btn bg-[#18181b] border-[#ffffff05] relative overflow-hidden flex items-center pr-8 cursor-pointer group">
            <span className="text-[#8b8b8b] mr-2">Date:</span>
            <select
              className="bg-transparent text-white outline-none appearance-none cursor-pointer font-bold w-full"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="30D" className="bg-[#18181b]">30 Days</option>
              <option value="7D" className="bg-[#18181b]">7 Days</option>
              <option value="24H" className="bg-[#18181b]">24 Hours</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 pointer-events-none text-[#8b8b8b] group-hover:text-white transition-colors" />
          </div>
          <div className="pill-btn bg-[#18181b] border-[#ffffff05] relative overflow-hidden flex items-center pr-8 cursor-pointer group">
            <span className="text-[#8b8b8b] mr-2">Site:</span>
            <select
              className="bg-transparent text-white outline-none appearance-none cursor-pointer font-bold w-full"
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
            >
              {availableSites.map(site => (
                <option key={site} value={site} className="bg-[#18181b]">{site}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-4 pointer-events-none text-[#8b8b8b] group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: KPI Cards based on Reference "CUSTOMER" and "PRODUCT" */}
        <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-6 h-fit">

          {/* Visitors Card */}
          <div className="matte-card flex flex-col justify-between h-64 relative overflow-hidden group">
            <div className="flex justify-between items-start z-10">
              <h3 className="text-sm font-bold text-[#8b8b8b] tracking-wider uppercase">Visitors</h3>
              <MoreHorizontal size={18} className="text-[#8b8b8b] cursor-pointer hover:text-white" />
            </div>

            <div className="flex justify-between items-end mb-4 z-10 w-full mt-auto">
              <div>
                <div className="flex items-center gap-1 text-[#9bee4e] mb-1">
                  <ArrowUpRight size={14} strokeWidth={3} />
                </div>
                <div className="text-4xl font-black text-white">{totalVisitors.toLocaleString()}</div>
                <div className="text-xs text-[#8b8b8b] mt-1 font-medium">Unique Sessions</div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-24 opacity-60 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={aggregateDaily}>
                  <Line type="monotone" dataKey="visitors" stroke="#9bee4e" strokeWidth={2} dot={false} isAnimationActive={true} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Page Views Card */}
          <div className="matte-card flex flex-col justify-between h-64 relative overflow-hidden group">
            <div className="flex justify-between items-start z-10">
              <h3 className="text-sm font-bold text-[#8b8b8b] tracking-wider uppercase">Page Views</h3>
              <MoreHorizontal size={18} className="text-[#8b8b8b] cursor-pointer hover:text-white" />
            </div>

            <div className="flex justify-between items-end mb-4 z-10 w-full mt-auto">
              <div>
                <div className="flex items-center gap-1 text-[#f59e0b] mb-1">
                  <ArrowDownRight size={14} strokeWidth={3} />
                </div>
                <div className="text-4xl font-black text-white">{totalPageViews.toLocaleString()}</div>
                <div className="text-xs text-[#8b8b8b] mt-1 font-medium">Total Impressions</div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-24 opacity-60 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={aggregateDaily}>
                  <Line type="monotone" dataKey="pageViews" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={true} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Site Comparison Bar Chart (Pill Style) */}
          <div className="col-span-1 md:col-span-2 matte-card relative h-80 flex flex-col mt-2">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-sm font-bold text-[#8b8b8b] tracking-wider uppercase">Traffic Breakdown</h3>
              <MoreHorizontal size={18} className="text-[#8b8b8b] cursor-pointer hover:text-white" />
            </div>

            <div className="flex-1 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scaledData} barSize={32} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#555', fontSize: 10 }} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={false} />

                  {/* Pill Shaped Bars */}
                  <Bar dataKey="traffic.pageViews" name="Page Views" radius={[100, 100, 100, 100]} fill="#3b82f6">
                    {scaledData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-4 border-t border-[#ffffff05] pt-4">
              <div className="flex gap-4">
                {scaledData.map(site => (
                  <div key={site.id} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border border-black" style={{ backgroundColor: site.color }}></div>
                    <span className="text-xs font-semibold text-white">{site.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-[#8b8b8b] font-medium">Total: {totalVisitors.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Right Column: Site Detail List (Matching "PROJECTS TIMELINE") */}
        <div className="lg:col-span-7 matte-card h-full flex flex-col relative">
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-sm font-bold text-[#8b8b8b] tracking-wider uppercase">Monitored Properties</h3>
            <MoreHorizontal size={18} className="text-[#8b8b8b] cursor-pointer hover:text-white" />
          </div>

          <div className="flex-1 space-y-4">
            {scaledData.map((site) => (
              <Link href={`/site/${site.id}`} key={site.id} className="block group">
                <div className="p-4 rounded-2xl bg-[#1c1c1c] border border-transparent hover:border-[#ffffff10] transition-all flex flex-col md:flex-row items-center justify-between gap-4">

                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-black" style={{ backgroundColor: site.color }}>
                      {site.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-white font-bold group-hover:text-blue-400 transition-colors">{site.name}</h4>
                      <p className="text-xs text-[#8b8b8b]">{site.url}</p>
                    </div>
                  </div>

                  <div className="flex gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <p className="text-[10px] text-[#8b8b8b] uppercase tracking-wider mb-1">Visitors</p>
                      <p className="text-lg font-bold text-white leading-none">{site.traffic.visitors.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[#8b8b8b] uppercase tracking-wider mb-1">Page Views</p>
                      <p className="text-lg font-bold text-white leading-none">{site.traffic.pageViews.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center justify-center w-8">
                      <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-white group-hover:bg-[#333] transition-colors">
                        →
                      </div>
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Social Media Integration */}
      <div className="matte-card relative flex flex-col mt-6">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-sm font-bold text-[#8b8b8b] tracking-wider uppercase">Social Intelligence</h3>
          <MoreHorizontal size={18} className="text-[#8b8b8b] cursor-pointer hover:text-white" />
        </div>

        {tiktokData?.connected && tiktokData?.data?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tiktokData.data.map((account, index) => (
              <div key={account.open_id || index} className="flex flex-col xl:flex-row items-center justify-between p-4 bg-[#1c1c1c] rounded-2xl border border-transparent hover:border-[#ffffff10] transition-all gap-4">
                <div className="flex items-center gap-4 w-full xl:w-auto">
                  {account.avatar_url ? (
                    <img src={account.avatar_url} alt="TikTok Avatar" className="w-12 h-12 rounded-full border-2 border-[#ff0050]" />
                  ) : (
                    <div className="w-12 h-12 rounded-full border-2 border-[#ff0050] bg-[#2a2a2a]"></div>
                  )}
                  <div>
                    <h4 className="text-white font-bold">{account.display_name}</h4>
                    <p className="text-xs text-[#8b8b8b]">TikTok</p>
                  </div>
                </div>
                <div className="flex gap-6 w-full xl:w-auto justify-between xl:justify-end">
                  <div className="text-right">
                    <p className="text-[10px] text-[#8b8b8b] uppercase tracking-wider mb-1">Followers</p>
                    <p className="text-lg font-bold text-white leading-none">{account.follower_count?.toLocaleString() || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#8b8b8b] uppercase tracking-wider mb-1">Likes</p>
                    <p className="text-lg font-bold text-white leading-none">{account.likes_count?.toLocaleString() || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#8b8b8b] uppercase tracking-wider mb-1">Following</p>
                    <p className="text-lg font-bold text-white leading-none">{account.following_count?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Button to add another account */}
            <div className="p-4 bg-[#1c1c1c] rounded-2xl border border-dashed border-[#ffffff10] flex items-center justify-center hover:bg-[#222] transition-colors cursor-pointer" onClick={() => window.location.href = '/api/auth/tiktok'}>
              <div className="flex items-center gap-3 text-[#ff0050]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                <span className="font-bold">Add Another TikTok Account</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-[#1c1c1c] rounded-2xl border border-dashed border-[#ffffff10] flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-[#2a2a2a] rounded-full flex items-center justify-center mb-4 text-[#ff0050]">
              {/* TikTok SVG Icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.34 2.88 2.88 0 0 1 2.31-4.63 2.93 2.93 0 0 1 .88.13V8.94a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.11a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
            </div>
            <h4 className="text-white font-bold mb-2">Connect TikTok</h4>
            <p className="text-sm text-[#8b8b8b] mb-4 max-w-sm">Bring your TikTok analytics (followers, engagement, likes) directly into your centralized dashboard.</p>
            <a href="/api/auth/tiktok" className="px-6 py-2 rounded-full bg-[#ff0050] text-white text-sm font-bold hover:bg-[#d80045] transition-colors shadow-[0_0_15px_rgba(255,0,80,0.3)]">
              Connect TikTok Account
            </a>
          </div>
        )}
      </div>

    </div>
  );
}
