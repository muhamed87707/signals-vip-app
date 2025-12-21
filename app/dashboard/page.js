'use client';

import { useState, useEffect } from 'react';

/**
 * Gold & Forex Market Intelligence Dashboard
 * Main Page - Bento Grid Layout
 *
 * Phase 2: Market Data Visualization Integration
 * - TradingView Lightweight Charts for Gold price
 * - Macro Watch with inverse correlation visualizer
 * - Cross-Asset Matrix heatmap
 *
 * Phase 3: Institutional Intelligence Modules
 * - Bank Forecasts with consensus price
 * - COT Report Analyzer with overcrowded warnings
 */

import Header from './components/Header';
import HeroSection from './components/HeroSection';
import MacroWatch from './components/MacroWatch';
import AIAnalysisHub from './components/AIAnalysisHub';
import CrossAssetMatrix from './components/CrossAssetMatrix';
import InstitutionalData from './components/InstitutionalData';
import BottomSection from './components/BottomSection';
import BankForecasts from './components/BankForecasts';
import CotAnalysis from './components/CotAnalysis';

// Loading skeleton for SSR
const DashboardSkeleton = () => (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading Dashboard...</p>
        </div>
    </div>
);

export default function DashboardPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Show loading skeleton during SSR to prevent hydration mismatch
    if (!mounted) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="min-h-screen bg-slate-950" suppressHydrationWarning>
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                {/* Gradient Orbs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
                <div className="absolute top-1/2 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />

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

                    {/* Row 1: Hero Section (Full Width) - Gold Chart + Sentiment */}
                    <section>
                        <HeroSection />
                    </section>

                    {/* Row 2: Three Column Layout */}
                    <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6">
                        {/* Left Panel - Macro Watch (3 cols) */}
                        <div className="xl:col-span-3">
                            <MacroWatch />
                        </div>

                        {/* Center Panel - AI Analysis Hub (6 cols) */}
                        <div className="xl:col-span-6">
                            <AIAnalysisHub />
                        </div>

                        {/* Right Panel - Cross-Asset Matrix + Institutional (3 cols) */}
                        <div className="xl:col-span-3 space-y-4">
                            <CrossAssetMatrix />
                        </div>
                    </section>

                    {/* Row 3: Institutional Data (Full Width) */}
                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                        <InstitutionalData />
                    </section>

                    {/* Row 4: Institutional Intelligence - Bank Forecasts & COT Analysis */}
                    <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
                        {/* Bank Forecasts Panel */}
                        <div>
                            <BankForecasts />
                        </div>

                        {/* COT Report Analyzer Panel */}
                        <div>
                            <CotAnalysis />
                        </div>
                    </section>

                    {/* Row 5: Bottom Section (Full Width) - News & Correlations */}
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
