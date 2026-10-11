import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
    getCurrentUser,
    login as loginRequest,
    logout as logoutRequest,
    register as registerRequest,
    resendVerification as resendVerificationRequest,
    verifyEmail as verifyEmailRequest,
} from "../api";
import type { AuthUser } from "../api";

type AuthValue = {
    user: AuthUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<AuthUser>;
    register: (
        name: string,
        username: string,
        email: string,
        password: string,
    ) => Promise<{ email: string; expiresInSeconds: number; devCode?: string }>;
    verifyEmail: (email: string, code: string) => Promise<AuthUser>;
    resendVerification: (email: string) => Promise<{ expiresInSeconds: number; devCode?: string }>;
    logout: () => Promise<void>;
};
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        void getCurrentUser()
            .then((result) => setUser(result.user))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);
    const value = useMemo<AuthValue>(
        () => ({
            user,
            loading,
            login: async (email, password) => {
                const result = await loginRequest(email, password);
                setUser(result.user);
                return result.user;
            },
            register: async (name, username, email, password) => {
                const result = await registerRequest(name, username, email, password);
                return result;
            },
            verifyEmail: async (email, code) => {
                const result = await verifyEmailRequest(email, code);
                setUser(result.user);
                return result.user;
            },
            resendVerification: async (email) => resendVerificationRequest(email),
            logout: async () => {
                await logoutRequest();
                setUser(null);
            },
        }),
        [user, loading],
    );
    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}
export function useAuth() {
    const value = useContext(AuthContext);
    if (!value) throw new Error("useAuth must be used inside AuthProvider");
    return value;
}
