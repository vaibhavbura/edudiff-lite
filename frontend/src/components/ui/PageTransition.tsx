"use client";

import { usePathname } from "next/navigation";

interface PageTransitionProps {
    children: React.ReactNode;
}

// Simplified - no animation wrapper to avoid double animation
// The login button handles the transition animation
export function PageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname();

    return (
        <div key={pathname}>
            {children}
        </div>
    );
}
