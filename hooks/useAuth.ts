import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken, signOut, User } from 'firebase/auth';
import { auth, isFirebaseInitialized } from '../services/firebase';
import type { Role, UseAuthReturn } from '../types';

declare const __initial_auth_token: string;

export const useAuth = (): UseAuthReturn => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<Role | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isFirebaseInitialized || !auth) {
            setLoading(false);
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (!role) { // Only stop loading if we aren't in the middle of a login process
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [role]);

    const login = async (selectedRole: Role) => {
        setLoading(true);
        try {
            if (selectedRole !== 'simulator') {
                 if (!isFirebaseInitialized || !auth) {
                    console.error("Firebase is not initialized. Cannot log in to online modes.");
                    throw new Error("Firebase not initialized");
                }
                const initialToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
                if (!auth.currentUser) {
                    if (initialToken) {
                        await signInWithCustomToken(auth, initialToken);
                    } else {
                        await signInAnonymously(auth);
                    }
                }
            }
            setRole(selectedRole);
        } catch (error) {
            console.error("Login Error:", (error as Error).message);
            setRole(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        if (isFirebaseInitialized && auth?.currentUser) {
            await signOut(auth);
        }
        setUser(null);
        setRole(null);
    };

    return { user, role, loading, login, logout };
};
