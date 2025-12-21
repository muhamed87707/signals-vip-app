'use client';

/**
 * Gold & Forex Market Intelligence Dashboard
 * Main Page - Bento Grid Layout
 * 
 * A Bloomberg Terminal-inspired professional trading dashboard
 * featuring real-time market data, AI analysis, and institutional insights.
 */

import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FundamentalDrivers from './components/FundamentalDrivers';
import AIAnalysisHub from './components/AIAnalysisHub';
import InstitutionalData from './components/InstitutionalData';
import BottomSection from './components/BottomSection';

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                {/* Gradient Orbs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px'
                    }}
                />
            </div>

            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="relative z-10 p-4 lg:p-6">
                {/* Bento Grid Layout */}
                <div className="max-w-[1920px] mx-auto space-y-4 lg:space-y-6">

                    {/* Row 1: Hero Section (Full Width) */}
                    <section>
                        <HeroSection />
                    </section>

                    {/* Row 2: Three Column Layout - Left Panel | Center (AI Hub) | Right Panel */}
                    <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6">
                        {/* Left Panel - Fundamental Drivers (3 cols) */}
                        <div className="xl:col-span-3 space-y-4">
                            <FundamentalDrivers />
                        </div>

                        {/* Center Panel - AI Analysis Hub (6 cols) */}
                        <div className="xl:col-span-6">
                            <AIAnalysisHub />
                        </div>

                        {/* Right Panel - Institutional Data (3 cols) */}
                        <div className="xl:col-span-3 space-y-4">
                            <InstitutionalData />
                        </div>
                    </section>

                    {/* Row 3: Bottom Section (Full Width) */}
                    <section>
                        <BottomSection />
                    </section>

                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-slate-800/50 mt-8">
                <div className="max-w-[1920px] mx-auto px-6 py-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <span className="text-slate-500 text-xs">
                                © 2024 Gold Intel Market Intelligence
                            </span>
                            <span className="text-slate-700">|</span>
                            <span className="text-slate-600 text-xs">
                                Data provided for informational purposes only
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                All Systems Operational
                            </span>
                            <span className="text-slate-700">|</span>
                            <span className="text-slate-600 text-xs">
                                Powered by Gemini AI
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
