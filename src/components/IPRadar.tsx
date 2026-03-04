import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Shield, Activity, Globe, Info, Loader2, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import { ipService, IPInfo } from "@/lib/ipService";
import { toast } from "sonner";

export function IPRadar() {
    const [ip, setIp] = useState("");
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<IPInfo | null>(null);

    const handleScan = async () => {
        if (!ip) {
            toast.error("Please enter an IP address");
            return;
        }

        setScanning(true);
        setResult(null);

        try {
            const data = await ipService.scanIP(ip);
            setResult(data);
            toast.success("Endpoint resolved successfully.");
        } catch (error: any) {
            toast.error(error.message || "Failed to scan IP");
        } finally {
            setScanning(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="space-y-4 pt-4">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Network Endpoint Radar</label>
                <div className="flex gap-2">
                    <div className="relative flex-1 group">
                        <Activity className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            value={ip}
                            onChange={(e) => setIp(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleScan()}
                            placeholder="Enter IPv4 or IPv6 address..."
                            className="w-full rounded-xl border border-border bg-secondary/30 pl-11 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                    </div>
                    <button
                        onClick={handleScan}
                        disabled={scanning}
                        className="rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground hover:glow-primary transition-all disabled:opacity-50 active:scale-95 shadow-lg"
                    >
                        {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : "SCAN"}
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {scanning && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-20">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                            <Globe className="h-16 w-16 text-primary animate-spin-slow relative z-10" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-foreground animate-pulse">Relaying through Global Node Network...</p>
                    </div>
                )}

                {result && !scanning && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {/* Geolocation Card */}
                        <div className="rounded-2xl border border-border bg-secondary/20 p-6 space-y-6 shadow-2xl relative overflow-hidden">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <h4 className="text-lg font-black uppercase tracking-tighter">Identity Core</h4>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Location</p>
                                        <p className="text-sm font-bold">{result.city}, {result.country_name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Organization</p>
                                        <p className="text-sm font-bold truncate" title={result.org}>{result.org}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">ASN</p>
                                        <p className="text-sm font-mono text-primary font-bold">{result.asn}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Coordinates</p>
                                        <p className="text-sm font-mono">{result.latitude}, {result.longitude}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border/50">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-3 px-1">Visual Telemetry</p>
                                    <div className="aspect-video w-full rounded-xl bg-background/50 border border-border flex items-center justify-center relative group overflow-hidden">
                                        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                                        <div className="text-center relative z-10">
                                            <Globe className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                                            <p className="text-[10px] font-mono text-muted-foreground px-4">LAT: {result.latitude} | LON: {result.longitude}</p>
                                        </div>
                                        {/* Mock map overlay */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_#8b5cf6]" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Report Card */}
                        <div className="rounded-2xl border border-border bg-secondary/20 p-6 space-y-6 shadow-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    <h4 className="text-lg font-black uppercase tracking-tighter">Threat Intel</h4>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${result.risk_score > 70 ? "bg-neon-red text-white" : result.risk_score > 40 ? "bg-yellow-500 text-black" : "bg-neon-green text-black"
                                    }`}>
                                    SCORE: {result.risk_score}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Risk Evaluation</span>
                                        <span className={`text-xs font-black uppercase ${result.risk_score > 70 ? "text-neon-red" : result.risk_score > 40 ? "text-yellow-500" : "text-neon-green"
                                            }`}>
                                            {result.risk_score > 70 ? "Critical" : result.risk_score > 40 ? "Suspicious" : "Trusted"}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${result.risk_score}%` }}
                                            className={`h-full ${result.risk_score > 70 ? "bg-neon-red shadow-glow-red" : result.risk_score > 40 ? "bg-yellow-500 shadow-glow-yellow" : "bg-neon-green shadow-glow-green"
                                                }`}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Active Alerts</p>
                                    <div className="grid gap-2">
                                        {result.threats.length > 0 ? result.threats.map((threat, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-background/50 p-3 rounded-xl border border-border/50">
                                                <div className={`h-1.5 w-1.5 rounded-full ${result.risk_score > 40 ? 'bg-neon-red' : 'bg-neon-green'}`} />
                                                <span className="text-xs font-bold text-foreground/80">{threat}</span>
                                            </div>
                                        )) : (
                                            <div className="flex items-center gap-3 bg-background/50 p-3 rounded-xl border border-border/50">
                                                <CheckCircle className="h-4 w-4 text-neon-green" />
                                                <span className="text-xs font-bold text-neon-green">Clean Identification</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button className="w-full py-4 rounded-xl border border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-all flex items-center justify-center gap-2">
                                    Detailed Reputation Scan <ExternalLink className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!result && !scanning && (
                <div className="mt-auto flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl opacity-50">
                    <Info className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest text-center px-6">
                        Enter a network endpoint (IP) to resolve identity and risk profile
                    </p>
                </div>
            )}
        </div>
    );
}
