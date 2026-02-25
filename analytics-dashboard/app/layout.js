import "@/app/globals.css";
import { LayoutDashboard, Calendar, Diamond, Settings, Plus, User, Search, Play, Pause } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Analytics | Dashboard",
  description: "Advanced Matte Dark Analytics Dashboard.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex bg-[#080808]">
        {/* Left Sidebar */}
        <aside className="w-24 fixed inset-y-0 left-0 flex flex-col items-center py-6 border-r border-[#ffffff05] bg-[#0e0e0e] z-50">
          {/* Logo */}
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-10 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <span className="font-black text-black text-xl tracking-tighter">I\I</span>
          </div>

          {/* Navigation Area */}
          <nav className="flex flex-col gap-4 flex-1">
            <Link href="/" className="nav-icon-btn active" title="Dashboard">
              <LayoutDashboard size={20} />
            </Link>
            <div className="nav-icon-btn" title="Calendar">
              <Calendar size={20} />
            </div>
            <div className="nav-icon-btn" title="Premium">
              <Diamond size={20} />
            </div>
            <div className="nav-icon-btn" title="Settings">
              <Settings size={20} />
            </div>
          </nav>

          {/* Bottom Action Area */}
          <div className="nav-icon-btn mt-auto" title="Add New">
            <Plus size={24} />
          </div>
        </aside>

        {/* Main Content App Context */}
        <div className="ml-24 flex-1 flex flex-col min-h-screen">

          {/* Top Header */}
          <header className="h-24 px-8 flex items-center justify-between sticky top-0 z-40 bg-[#080808]/90 backdrop-blur-md">

            {/* Left Header Tabs */}
            <div className="flex gap-4 items-center">
              <div className="bg-[#151515] rounded-full flex p-1 border border-[#ffffff05]">
                <button className="px-6 py-2 rounded-full bg-[#2a2a2a] text-white text-sm font-medium flex items-center gap-2">
                  <div className="w-3 h-3 border border-white rounded-[3px]"></div>
                  Check Box
                </button>
                <button className="px-6 py-2 rounded-full text-[#8b8b8b] hover:text-white transition-colors text-sm font-medium flex items-center gap-2">
                  <div className="flex gap-[2px] items-end h-3">
                    <div className="w-[2px] h-2 bg-current rounded-full"></div>
                    <div className="w-[2px] h-3 bg-current rounded-full"></div>
                    <div className="w-[2px] h-[6px] bg-current rounded-full"></div>
                  </div>
                  Monitoring
                </button>
              </div>

              <a href="mailto:willylondon@example.com" className="pill-btn ml-2 hover:bg-[#1a1a1a] transition-colors border border-transparent hover:border-[#ffffff10]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                Support
              </a>

              <div className="w-10 h-10 rounded-full bg-[#151515] flex items-center justify-center text-[#8b8b8b] hover:text-white cursor-pointer ml-2 border border-[#ffffff05] transition-colors" title="Search (Coming Soon)">
                <Search size={18} />
              </div>
            </div>

            {/* Right Header User & Actions */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-right flex flex-col justify-center">
                  <span className="text-sm font-semibold text-white leading-tight">Willard Wells</span>
                  <span className="text-xs text-[#8b8b8b] leading-tight">@willardw</span>
                </div>
                <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full flex items-center justify-center relative shadow-lg">
                  <User size={20} className="text-white relative z-10" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#080808] flex items-center justify-center text-[8px] font-bold">2</div>
                </div>
              </div>
            </div>

          </header>

          {/* Page Content */}
          <main className="flex-1 p-8 pt-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
