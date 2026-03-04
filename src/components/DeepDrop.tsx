import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Flame, Lock, Clock, Copy, Trash2, CheckCircle, Shield, Key, Loader2, AlertCircle } from "lucide-react";
import { deepDropService } from "@/lib/deepDropService";
import { toast } from "sonner";

export function DeepDrop() {
    const [content, setContent] = useState("");
    const [expiry, setExpiry] = useState(15);
    const [creating, setCreating] = useState(false);
    const [dropId, setDropId] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!content.trim()) {
            toast.error("Please enter content to secure");
            return;
        }

        setCreating(true);
        try {
            const id = await deepDropService.createDrop(content, expiry);
            setDropId(id);
            toast.success("Secure Drop deployed to canal.");
        } catch (error: any) {
            toast.error(error.message || "Failed to create Secure Drop");
        } finally {
            setCreating(false);
        }
    };

    const copyLink = () => {
        const url = `${window.location.origin}/drop/${dropId}`;
        navigator.clipboard.writeText(url);
        toast.success("Secure link copied to clipboard.");
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between pt-4 px-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Secure Drop Canal</label>
                <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-black text-primary uppercase">E2E Encrypted</span>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {!dropId ? (
                    <motion.div
                        key="create"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                    >
                        <div className="relative group">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Paste sensitive data, passwords, or secret links here..."
                                className="w-full min-h-[200px] rounded-2xl border-2 border-border/50 bg-secondary/20 p-6 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all resize-none shadow-inner"
                            />
                            <div className="absolute bottom-4 right-4 text-[10px] font-mono text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity">
                                {content.length} CHARS | SECURE BUFFER
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-secondary/30 rounded-2xl p-4 border border-border flex flex-col gap-3">
                                <div className="flex items-center gap-2 px-1">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Self-Destruction Timer</span>
                                </div>
                                <div className="flex gap-2">
                                    {[5, 15, 30, 60].map(mins => (
                                        <button
                                            key={mins}
                                            onClick={() => setExpiry(mins)}
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border-2 ${expiry === mins ? 'bg-primary/10 border-primary text-primary shadow-glow-primary' : 'bg-background/50 border-transparent text-muted-foreground hover:bg-secondary'
                                                }`}
                                        >
                                            {mins}M
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-secondary/30 rounded-2xl p-4 border border-border flex flex-col justify-center gap-2">
                                <div className="flex items-center gap-2 px-1 text-neon-red">
                                    <Flame className="h-4 w-4" />
                                    <span className="text-[10px] font-bold uppercase">Burn After Reading</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-tight px-1 font-medium">
                                    The payload is permanently deleted from our servers the instant it is accessed.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleCreate}
                            disabled={creating || !content}
                            className="w-full py-5 rounded-2xl bg-primary text-sm font-black text-primary-foreground hover:glow-primary transition-all disabled:opacity-50 active:scale-95 shadow-2xl flex items-center justify-center gap-3"
                        >
                            {creating ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Lock className="h-5 w-5" /> DEPLOY SECURE DROP</>}
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col items-center justify-center space-y-8 py-10"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                            <div className="h-24 w-24 rounded-full border-4 border-primary flex items-center justify-center bg-background relative z-10 shadow-glow-primary">
                                <CheckCircle className="h-12 w-12 text-primary" />
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-black text-foreground uppercase tracking-widest italic">Drop Deployed</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                The secure canal is open. Copy this link and share it. It will self-destruct in <span className="text-primary font-bold">{expiry} minutes</span> or after first access.
                            </p>
                        </div>

                        <div className="w-full max-w-md p-2 bg-secondary/30 rounded-2xl border border-primary/30 flex items-center gap-2 shadow-xl backdrop-blur-xl">
                            <div className="flex-1 px-4 py-3 font-mono text-xs text-primary truncate">
                                {window.location.origin}/drop/{dropId}
                            </div>
                            <button
                                onClick={copyLink}
                                className="p-3 rounded-xl bg-primary text-primary-foreground hover:glow-primary transition-all shadow-lg active:scale-95"
                            >
                                <Copy className="h-4 w-4" />
                            </button>
                        </div>

                        <button
                            onClick={() => { setDropId(null); setContent(""); }}
                            className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
                        >
                            <Trash2 className="h-3.5 w-3.5" /> Purge Buffer & Create New
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer Alert */}
            <div className="bg-neon-red/5 border border-neon-red/10 rounded-xl p-4 mt-auto">
                <div className="flex items-center gap-3 text-neon-red mb-1">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase">Operation Notice</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug">
                    Dropped content is stored in volatile memory buffers. Once a drop is 'burned' or the timer expires, the data is unrecoverable via any technological means.
                </p>
            </div>
        </div>
    );
}
