"use client";

import { SignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Bot, CheckCircle2, Brain, Video, Sparkles, BookOpen, Zap } from "lucide-react";
import Link from "next/link";

// Floating icon with label - positioned to not overlap text
function FloatingElement({
    icon: Icon,
    label,
    x,
    y,
    delay = 0,
    duration = 4
}: {
    icon: React.ElementType;
    label: string;
    x: string;
    y: string;
    delay?: number;
    duration?: number;
}) {
    return (
        <motion.div
            className="absolute flex flex-col items-center gap-1"
            style={{ right: x, top: y }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
                opacity: 1,
                scale: 1,
                y: [0, -8, 0],
            }}
            transition={{
                opacity: { delay, duration: 0.5 },
                scale: { delay, duration: 0.5 },
                y: { delay: delay + 0.5, duration, repeat: Infinity, ease: "easeInOut" },
            }}
        >
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
                <Icon className="w-6 h-6 text-white/90" />
            </div>
            <span className="text-[10px] font-medium text-white/70 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
                {label}
            </span>
        </motion.div>
    );
}

// Animated connecting line component
function ConnectingLine({
    x1, y1, x2, y2, delay
}: {
    x1: string; y1: string; x2: string; y2: string; delay: number
}) {
    return (
        <motion.line
            x1={x1} y1={y1}
            x2={x2} y2={y2}
            stroke="url(#lineGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ delay, duration: 0.8, ease: "easeOut" }}
        />
    );
}

export default function SignInPage() {
    // Box positions (right %, top %) - matching FloatingElement positions
    // Box 1: AI Learning - right: 15%, top: 12%
    // Box 2: Videos - right: 55%, top: 28%
    // Box 3: Smart - right: 20%, top: 48%
    // Box 4: Study - right: 50%, top: 65%
    // Box 5: Fast - right: 25%, top: 82%

    // Convert to line coordinates (inverted right to left for SVG)
    // right: 15% means left: 85%, right: 55% means left: 45%, etc.

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 to-indigo-50/50">
            {/* Gradient overlay - smooth scale + fade transition */}
            <motion.div
                className="fixed inset-0 z-50 pointer-events-none"
                style={{
                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
                    transformOrigin: "center center",
                }}
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 1.1 }}
                transition={{
                    duration: 0.4,
                    delay: 0.1,
                    ease: [0.4, 0, 0.2, 1]
                }}
            />

            {/* Main content container */}
            {/* Mobile: scales out from center */}
            {/* Desktop: stretches from top-right to bottom-left */}
            <motion.div
                className="relative z-10 min-h-screen flex gpu-accelerated"
                style={{
                    willChange: "transform, opacity",
                    transformOrigin: "top right",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                }}
                initial={{
                    opacity: 0,
                    scale: 0.8,
                    x: 50,
                    y: -50,
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    x: 0,
                    y: 0,
                }}
                transition={{
                    duration: 0.8,
                    delay: 0.3,
                    ease: [0.16, 1, 0.3, 1],
                }}
            >
                {/* Left side - Desktop branding */}
                <motion.div
                    className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700"
                    initial={{ opacity: 0, x: -80, skewX: 5 }}
                    animate={{ opacity: 1, x: 0, skewX: 0 }}
                    transition={{
                        duration: 0.9,
                        delay: 0.45,
                        ease: [0.16, 1, 0.3, 1]
                    }}
                >
                    {/* Animated background effects */}
                    <div className="absolute inset-0 overflow-hidden">
                        {/* Animated gradient overlay */}
                        <motion.div
                            className="absolute inset-0"
                            style={{
                                background: "linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.4) 50%, rgba(168,85,247,0.3) 100%)",
                                backgroundSize: "200% 200%",
                            }}
                            animate={{
                                backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        />

                        {/* Radial glow effects */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.2)_0%,_transparent_50%)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(139,92,246,0.35)_0%,_transparent_50%)]" />

                        {/* Pulsing orb 1 - top left */}
                        <motion.div
                            className="absolute w-64 h-64 rounded-full bg-white/10 blur-3xl"
                            style={{ top: "-10%", left: "-10%" }}
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.3, 0.5, 0.3],
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />

                        {/* Pulsing orb 2 - bottom right */}
                        <motion.div
                            className="absolute w-48 h-48 rounded-full bg-purple-400/20 blur-3xl"
                            style={{ bottom: "10%", right: "-5%" }}
                            animate={{
                                scale: [1.2, 1, 1.2],
                                opacity: [0.4, 0.6, 0.4],
                            }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        />

                        {/* Pulsing orb 3 - center */}
                        <motion.div
                            className="absolute w-32 h-32 rounded-full bg-indigo-300/20 blur-2xl"
                            style={{ top: "40%", left: "30%" }}
                            animate={{
                                scale: [1, 1.5, 1],
                                x: [0, 30, 0],
                                y: [0, -20, 0],
                            }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        />

                        {/* Shimmer effect */}
                        <motion.div
                            className="absolute inset-0"
                            style={{
                                background: "linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
                            }}
                            animate={{
                                x: ["-100%", "100%"],
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
                        />

                        {/* Animated grid */}
                        <motion.div
                            className="absolute inset-0 opacity-[0.04]"
                            style={{
                                backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
                                            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
                                backgroundSize: "60px 60px",
                            }}
                            animate={{ backgroundPosition: ["0px 0px", "60px 60px"] }}
                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        />
                    </div>

                    {/* Connecting lines SVG - properly connecting boxes */}
                    <svg className="absolute right-0 top-0 w-2/5 h-full pointer-events-none" style={{ zIndex: 1 }}>
                        <defs>
                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
                                <stop offset="100%" stopColor="rgba(167,139,250,0.6)" />
                            </linearGradient>
                        </defs>

                        {/* Line 1: AI Learning (85%, 15%) -> Videos (45%, 31%) */}
                        <ConnectingLine x1="77%" y1="15%" x2="45%" y2="31%" delay={0.8} />

                        {/* Line 2: Videos (45%, 31%) -> Smart (80%, 51%) */}
                        <ConnectingLine x1="45%" y1="31%" x2="80%" y2="51%" delay={1.0} />

                        {/* Line 3: Smart (80%, 51%) -> Study (50%, 68%) */}
                        <ConnectingLine x1="80%" y1="51%" x2="50%" y2="68%" delay={1.2} />

                        {/* Line 4: Study (50%, 68%) -> Fast (75%, 85%) */}
                        <ConnectingLine x1="50%" y1="68%" x2="75%" y2="85%" delay={1.4} />
                    </svg>

                    {/* Floating elements - RIGHT SIDE ONLY to not overlap text */}
                    <div className="absolute right-0 top-0 w-2/5 h-full" style={{ zIndex: 2 }}>
                        <FloatingElement icon={Brain} label="AI Learning" x="5%" y="10%" delay={0.2} />
                        <FloatingElement icon={Video} label="Videos" x="55%" y="28%" delay={0.3} duration={5} />
                        <FloatingElement icon={Sparkles} label="Smart" x="4%" y="48%" delay={0.4} duration={4.5} />
                        <FloatingElement icon={BookOpen} label="Study" x="50%" y="65%" delay={0.5} duration={3.5} />
                        <FloatingElement icon={Zap} label="Fast" x="10%" y="85%" delay={0.6} duration={4} />
                    </div>

                    {/* Decorative shapes */}
                    <motion.div
                        className="absolute w-64 h-64 rounded-full border border-white/5"
                        style={{ right: "-5%", top: "20%" }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                        className="absolute w-40 h-40 rounded-full border border-white/5"
                        style={{ right: "10%", bottom: "10%" }}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Main content - LEFT aligned with clear space */}
                    <div className="relative z-10 flex flex-col justify-center pl-16 pr-8 max-w-md">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            {/* Logo */}
                            <Link href="/" className="inline-flex items-center gap-3 mb-10">
                                <motion.div
                                    className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                >
                                    <Bot className="w-7 h-7 text-white" />
                                </motion.div>
                                <span className="font-bold text-2xl text-white">EduDiff Lite</span>
                            </Link>

                            {/* Heading */}
                            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                                Welcome back
                            </h1>
                            <p className="text-white/75 text-lg mb-10 leading-relaxed">
                                Sign in to continue learning with AI-powered
                                video explanations tailored just for you.
                            </p>

                            {/* Feature list */}
                            <div className="space-y-4">
                                {[
                                    "Personalized learning experience",
                                    "AI-generated video responses"
                                ].map((feature, i) => (
                                    <motion.div
                                        key={i}
                                        className="flex items-center gap-3"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                                    >
                                        <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                                        <span className="text-white/85 font-medium">{feature}</span>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Trust badge */}
                            {/* <motion.div
                                className="mt-12 pt-8 border-t border-white/10"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-2">
                                        {[...Array(4)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-8 h-8 rounded-full bg-gradient-to-br from-white/30 to-white/10 border-2 border-violet-600 flex items-center justify-center"
                                            >
                                                <span className="text-xs text-white font-semibold">
                                                    {String.fromCharCode(65 + i)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-white/60 text-sm">
                                        Trusted by <span className="text-white font-semibold">10,000+</span> learners
                                    </p>
                                </div>
                            </motion.div> */}
                        </motion.div>
                    </div>
                </motion.div>

                {/* Right side - Sign in form */}
                <motion.div
                    className="flex-1 flex flex-col lg:justify-center p-0 lg:p-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    {/* Mobile gradient banner - Full width at top */}
                    <div className="lg:hidden w-full">
                        <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-5 py-8 pb-10">
                            <Link href="/" className="inline-flex items-center gap-2 mb-5">
                                <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                    <Bot className="w-6 h-6 text-white" />
                                </div>
                                <span className="font-bold text-2xl text-white">EduDiff Lite</span>
                            </Link>
                            <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
                            <p className="text-white/80 text-base mb-5">AI-powered video explanations await</p>
                            <div className="flex items-center gap-5">
                                {[
                                    { icon: Brain, label: "AI Learning" },
                                    { icon: Video, label: "Videos" },
                                    { icon: Zap, label: "Fast" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-white/90 text-sm">
                                        <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                                            <item.icon className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Form container */}
                    <motion.div
                        className="w-full max-w-md mx-auto px-4 sm:px-6 py-6 lg:py-0"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
                    >
                        {/* Form header - Desktop only */}
                        <div className="text-center mb-6 sm:mb-8 hidden lg:block">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in to your account</h2>
                            <p className="text-slate-500">Enter your credentials to continue</p>
                        </div>

                        {/* Form header - Mobile only */}
                        <div className="text-center mb-6 lg:hidden">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">Sign in to your account</h2>
                            <p className="text-slate-500 text-sm">Enter your credentials to continue</p>
                        </div>

                        {/* Clerk SignIn */}
                        <SignIn
                            appearance={{
                                elements: {
                                    rootBox: "w-full",
                                    card: "shadow-none bg-transparent p-0",
                                    headerTitle: "hidden",
                                    headerSubtitle: "hidden",
                                    socialButtonsBlockButton: "bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 shadow-sm",
                                    socialButtonsBlockButtonText: "font-medium text-slate-700",
                                    dividerLine: "bg-slate-200",
                                    dividerText: "text-slate-400 text-sm",
                                    formFieldLabel: "text-slate-700 font-medium text-sm",
                                    formFieldInput: "rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-150 bg-white",
                                    formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-sm transition-all duration-150",
                                    footerActionLink: "text-indigo-600 hover:text-indigo-700 font-medium",
                                    identityPreviewEditButton: "text-indigo-600",
                                },
                                layout: {
                                    socialButtonsPlacement: "top",
                                    showOptionalFields: false,
                                },
                            }}
                        />

                        {/* Footer */}
                        {/* <p className="text-center text-sm text-slate-500 mt-8">
                            Don&apos;t have an account?{" "}
                            <Link href="/sign-up" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                                Sign up free
                            </Link>
                        </p> */}
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
}
