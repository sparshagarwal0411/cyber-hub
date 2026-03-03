import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Shield } from "lucide-react";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background cyber-grid">
                <div className="text-center">
                    <Shield className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
                    <p className="text-sm font-mono text-muted-foreground">DECRYPTING SESSION...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};
