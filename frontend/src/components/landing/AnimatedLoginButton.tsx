"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, LogIn } from "lucide-react";
import { useState, useRef } from "react";
import { createPortal } from "react-dom";

interface AnimatedLoginButtonProps {
    fullWidth?: boolean;
    variant?: "default" | "outline";
    onClickCallback?: () => void;
}

export function AnimatedLoginButton({ fullWidth = false, variant = "default", onClickCallback }: AnimatedLoginButtonProps) {
    const router = useRouter();
    const [isClicked, setIsClicked] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
    const [showOverlay, setShowOverlay] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleClick = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setClickPosition({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
            });
        }

        setIsClicked(true);
        setShowOverlay(true);

        // DON'T close the mobile menu - keep component mounted so overlay stays visible
        // The navigation will handle the cleanup

        // Navigate after the slow animation is visible
        setTimeout(() => {
            router.push("/sign-in");
        }, 1200);
    };

    // Render the overlay using portal - with loading spinner in center of viewport
    const overlay = showOverlay && typeof window !== 'undefined' ? createPortal(
        <motion.div
            className="fixed overflow-hidden"
            style={{
                zIndex: 99999,
                pointerEvents: 'none',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
            }}
        >
            {/* Expanding circle - positioned at click location */}
            <motion.div
                style={{
                    position: "fixed",
                    left: clickPosition.x,
                    top: clickPosition.y,
                    transform: "translate(-50%, -50%)",
                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
                    borderRadius: "50%",
                }}
                initial={{ width: 0, height: 0, opacity: 1 }}
                animate={{
                    width: "500vmax",
                    height: "500vmax",
                    opacity: 1
                }}
                transition={{
                    duration: 2,
                    ease: "easeOut"
                }}
            />

            {/* Loading spinner and text at VIEWPORT center */}
            <motion.div
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{
                    duration: 1.2,
                    times: [0, 0.15, 0.7, 1],
                    ease: "easeInOut"
                }}
            >
                {/* Spinning loader */}
                <motion.div
                    className="relative"
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    {/* Outer ring */}
                    <div className="w-12 h-12 rounded-full border-4 border-white/20" />
                    {/* Spinning arc */}
                    <div
                        className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-t-white"
                        style={{
                            borderTopColor: 'white',
                        }}
                    />
                </motion.div>

                {/* Loading text */}
                <motion.span
                    className="text-white font-medium text-lg tracking-wide"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                >
                    Loading...
                </motion.span>
            </motion.div>
        </motion.div>,
        document.body
    ) : null;

    const isOutline = variant === "outline";

    return (
        <>
            {overlay}

            <motion.button
                ref={buttonRef}
                onClick={handleClick}
                disabled={isClicked}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`group relative flex items-center justify-center gap-2 rounded-full font-semibold cursor-pointer overflow-hidden disabled:cursor-wait ${fullWidth ? "w-full py-4 text-base" : "px-5 py-2.5 text-sm"
                    } ${isOutline
                        ? "border-2 border-indigo-300 text-indigo-600 bg-white hover:bg-indigo-50"
                        : "text-white"
                    }`}
                style={isOutline ? {} : {
                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
                    backgroundSize: "200% 200%",
                    willChange: "transform",
                }}
                animate={isOutline ? {} : {
                    backgroundPosition: isHovered ? "100% 50%" : "0% 50%",
                    boxShadow: isHovered
                        ? "0 8px 30px -8px rgba(99, 102, 241, 0.6)"
                        : "0 4px 15px -5px rgba(99, 102, 241, 0.4)",
                }}
                whileHover={{ scale: fullWidth ? 1.01 : 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                {/* Glass highlight - only for non-outline */}
                {!isOutline && (
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent rounded-full" />
                )}

                {/* Shimmer effect - only for non-outline */}
                {!isOutline && (
                    <motion.div
                        className="absolute inset-0"
                        style={{
                            background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)",
                        }}
                        animate={{
                            x: isHovered ? ["calc(-100%)", "calc(100%)"] : "calc(-100%)",
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                )}

                {/* Button content */}
                <span className="relative z-10 flex items-center justify-center gap-2">
                    {/* Login icon with animation */}
                    <motion.span
                        animate={{
                            x: isHovered ? -2 : 0,
                            rotate: isHovered ? -10 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                    >
                        <LogIn className={fullWidth ? "w-5 h-5" : "w-4 h-4"} />
                    </motion.span>

                    <span>Login</span>

                    {/* Arrow that slides in */}
                    <motion.span
                        animate={{
                            x: isHovered ? 0 : -8,
                            opacity: isHovered ? 1 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                    >
                        <ArrowRight className={fullWidth ? "w-5 h-5" : "w-4 h-4"} />
                    </motion.span>
                </span>
            </motion.button>
        </>
    );
}
