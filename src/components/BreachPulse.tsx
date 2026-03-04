import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShieldAlert, CheckCircle, AlertTriangle, Calendar, Globe, Database, Loader2, ArrowRight } from "lucide-react";
import { breachService, BreachResult } from "@/lib/breachService";
import { toast } from "sonner";

export function BreachPulse() {
    const [email, setEmail] = useState("");
    const [searching, setSearching] = useState(false);
    const [result, setResult] = useState<BreachResult | null>(null);

    const handleSearch = async () => {
        if (!email || !email.includes('@')) {
            toast.error("Please enter a valid email address");
            return;
        }

        setSearching(true);
        setResult(null);

        try {
            const data = await breachService.checkEmail(email);
            setResult(data);
            if (data.found) {
                toast.warning(`Compromise detected: ${data.count} breaches found`);
            } else {
                toast.success("No known compromises detected for this identity.");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to search breach database");
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 h-full min-h-[400px]">
            <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Identity Breach Auditor</label>
                    <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-neon-green animate-pulse" />
                        <span className="text-[10px] font-black text-neon-green uppercase">Live Core Connected</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            placeholder="Enter email to audit (e.g., operator@cyberhub.io)..."
                            className="w-full rounded-xl border border-border bg-secondary/30 pl-11 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={searching}
                        className="rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground hover:glow-primary transition-all disabled:opacity-50 active:scale-95 shadow-lg flex items-center gap-2"
                    >
                        {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "AUDIT"}
                    </button>
                </div>
                <p className="text-[10px] text-muted-foreground italic px-1">
                    We cross-reference your identity against billions of leaked records across the clear and deep web.
                </p>
            </div>

            <AnimatePresence mode="wait">
                {searching && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col items-center justify-center space-y-4 py-12"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                            <Loader2 className="h-12 w-12 text-primary animate-spin relative z-10" />
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-black uppercase tracking-widest text-foreground animate-pulse">Scanning Byte-Streams</p>
                            <p className="text-[10px] text-muted-foreground font-mono mt-1">Cross-referencing: {email}</p>
                        </div>
                    </motion.div>
                )}

                {result && !searching && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {result.found ? (
                            <div className="rounded-2xl border border-neon-red/30 bg-neon-red/5 p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <ShieldAlert className="h-24 w-24 text-neon-red" />
                                </div>

                                <div className="flex items-center gap-4 mb-6 relative z-10">
                                    <div className="p-3 rounded-xl bg-neon-red/10">
                                        <AlertTriangle className="h-8 w-8 text-neon-red shadow-glow-red" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-neon-red uppercase tracking-tighter">Security Compromise!</h4>
                                        <p className="text-sm text-foreground/80">Found in <span className="font-black text-neon-red">{result.count}</span> data breaches.</p>
                                    </div>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Leaked In:</p>
                                    <div className="grid gap-3">
                                        {result.breaches.map((breach, i) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                key={breach.name}
                                                className="bg-background/40 border border-border/50 rounded-xl p-4 hover:border-neon-red/30 transition-all group"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="h-3.5 w-3.5 text-primary" />
                                                        <span className="text-sm font-bold text-foreground">{breach.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                                                        <Calendar className="h-3 w-3" /> {breach.date}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed group-hover:line-clamp-none transition-all">
                                                    {breach.description}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {breach.dataClasses.map(cls => (
                                                        <span key={cls} className="px-2 py-0.5 rounded-md bg-secondary text-[9px] font-bold text-muted-foreground uppercase tracking-tight">
                                                            {cls}
                                                        </span>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-neon-green/30 bg-neon-green/5 p-8 text-center space-y-4">
                                <div className="bg-neon-green/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <CheckCircle className="h-8 w-8 text-neon-green" />
                                </div>
                                <h4 className="text-xl font-black text-neon-green uppercase tracking-tighter italic">Identity Secured</h4>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                    Your email was not found in any known public data breaches in our database. Stay vigilant!
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {!result && !searching && (
                <div className="mt-auto flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-xl opacity-50">
                    <Database className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest text-center px-6">
                        Enter your credentials above to start the deep-web audit
                    </p>
                </div>
            )}
        </div>
    );
}
