"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedLoginButton } from "./AnimatedLoginButton";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-indigo-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                <Bot className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-slate-900">EduDiff Lite</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-4">
                            <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</Link>
                            <Link href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">How it Works</Link>
                            <Link href="/chat">
                                <Button className="rounded-full px-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 shadow-lg">
                                    Try Demo
                                </Button>
                            </Link>
                            <AnimatedLoginButton />
                        </div>

                        {/* Animated Mobile Hamburger/Close Button */}
                        <button
                            onClick={toggleMobileMenu}
                            className="md:hidden relative w-10 h-10 rounded-xl bg-slate-100 hover:bg-indigo-100 transition-colors flex items-center justify-center group"
                            aria-label="Toggle mobile menu"
                        >
                            <div className="w-5 h-4 flex flex-col justify-between items-center">
                                {/* Top bar */}
                                <motion.span
                                    className="block w-5 h-0.5 bg-slate-600 group-hover:bg-indigo-600 rounded-full origin-center"
                                    animate={{
                                        rotate: isMobileMenuOpen ? 45 : 0,
                                        y: isMobileMenuOpen ? 7 : 0,
                                    }}
                                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                />
                                {/* Middle bar */}
                                <motion.span
                                    className="block w-5 h-0.5 bg-slate-600 group-hover:bg-indigo-600 rounded-full"
                                    animate={{
                                        opacity: isMobileMenuOpen ? 0 : 1,
                                        scaleX: isMobileMenuOpen ? 0 : 1,
                                    }}
                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                />
                                {/* Bottom bar */}
                                <motion.span
                                    className="block w-5 h-0.5 bg-slate-600 group-hover:bg-indigo-600 rounded-full origin-center"
                                    animate={{
                                        rotate: isMobileMenuOpen ? -45 : 0,
                                        y: isMobileMenuOpen ? -7 : 0,
                                    }}
                                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                />
                            </div>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: 0.15,
                                ease: [0.25, 0.46, 0.45, 0.94]
                            }}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden gpu-accelerated"
                            style={{
                                willChange: 'opacity',
                                transform: 'translateZ(0)'
                            }}
                            onClick={closeMobileMenu}
                        />

                        {/* Mobile Menu Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={{
                                duration: 0.18,
                                ease: [0.25, 0.46, 0.45, 0.94],
                                opacity: { duration: 0.12 }
                            }}
                            className="fixed top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-xl z-50 md:hidden gpu-accelerated"
                            style={{
                                willChange: 'transform, opacity',
                                transform: 'translateZ(0)',
                                backfaceVisibility: 'hidden'
                            }}
                        >
                            <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
                                {/* Navigation Links */}
                                <div className="space-y-2">
                                    <Link
                                        href="#features"
                                        onClick={closeMobileMenu}
                                        className="block px-4 py-3 rounded-xl text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                    >
                                        Features
                                    </Link>
                                    <Link
                                        href="#how-it-works"
                                        onClick={closeMobileMenu}
                                        className="block px-4 py-3 rounded-xl text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                    >
                                        How it Works
                                    </Link>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-slate-100" />

                                {/* Action Buttons */}
                                <div className="space-y-3 pt-2">
                                    <Link href="/chat" onClick={closeMobileMenu} className="block">
                                        <Button className="w-full rounded-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg text-base">
                                            Try Demo
                                        </Button>
                                    </Link>
                                    <AnimatedLoginButton
                                        fullWidth
                                        onClickCallback={closeMobileMenu}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
