
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { type Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        let mounted = true;

        // Safety timeout to prevent infinite loading
        const timeout = setTimeout(() => {
            if (mounted && loading) {
                console.error("Auth check timed out, forcing login redirect.");
                setLoading(false);
                setSession(null);
            }
        }, 5000);

        // 1. Check initial session
        supabase.auth.getSession().then(({ data, error }) => {
            if (mounted) {
                if (error) {
                    console.error("Auth session check failed:", error);
                    setSession(null);
                } else if (data?.session) {
                    setSession(data.session);
                }
                setLoading(false);
                clearTimeout(timeout);
            }
        }).catch(err => {
            console.error("Auth unexpected error:", err);
            if (mounted) {
                setLoading(false);
                setSession(null);
            }
        });

        // 2. Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                setSession(session);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            clearTimeout(timeout);
            subscription.unsubscribe();
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!session) {
        // ONLY redirect if we are sure loading is done and there is no session
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
