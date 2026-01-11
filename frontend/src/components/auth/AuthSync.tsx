"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { storeUserData } from "@/lib/firebase";

export function AuthSync() {
    const { user, isLoaded, isSignedIn } = useUser();
    const hasSynced = useRef(false);

    useEffect(() => {
        if (!isLoaded || !isSignedIn || !user || hasSynced.current) {
            return;
        }

        const syncUserData = async () => {
            try {
                await storeUserData({
                    clerkId: user.id,
                    email: user.primaryEmailAddress?.emailAddress || null,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    fullName: user.fullName,
                    imageUrl: user.imageUrl,
                    createdAt: user.createdAt ? new Date(user.createdAt) : null,
                    lastSignInAt: null as never, // Will be set by serverTimestamp in Firebase
                });
                hasSynced.current = true;
            } catch (error) {
                console.error("Failed to sync user data:", error);
            }
        };

        syncUserData();
    }, [isLoaded, isSignedIn, user]);

    return null;
}
