import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Flame, Lock, Clock, Copy, Trash2, CheckCircle, Shield, Key, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { deepDropService } from "@/lib/deepDropService";
import { toast } from "sonner";

export function DeepDrop() {
    const [content, setContent] = useState("");
    const [expiry, setExpiry] = useState(15);
    const [creating, setCreating] = useState(false);
    const [dropLink, setDropLink] = useState<string | null>(null);
    const [isMelting, setIsMelting] = useState(false);

    const handleCreate = async () => {
        if (!content.trim()) {
            toast.error("Please enter content to secure");
            return;
        }

        setCreating(true);
        try {
            const compositePath = await deepDropService.createDrop(content, expiry);
            const url = `${window.location.origin}/drop/${compositePath}`;
            setDropLink(url);

            // Effect: Melting the input buffer
            setIsMelting(true);
            setTimeout(() => {
                setContent("");
                setIsMelting(false);
            }, 1000);

            toast.success("Stealth Drop deployed with E2E Encryption.");
        } catch (error: any) {
            toast.error(error.message || "Failed to create Stealth Drop");
        } finally {
            setCreating(false);
        }
    };

    const copyLink = () => {
        if (!dropLink) return;
        navigator.clipboard.writeText(dropLink);
        toast.success("Stealth link (E2E) copied to clipboard.");
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between pt-4 px-1">
                <div className="flex flex-col">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Stealth Drop Canal</label>
                    <span className="text-[10px] text-primary/60 font-mono">MIL-SPEC E2E AES-GCM</span>
                </div>
                <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-black text-primary uppercase">Lockdown Active</span>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {!dropLink ? (
                    <motion.div
                        key="create"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                    >
                        <div className="relative group">
                            <motion.div
                                animate={isMelting ? { filter: "blur(20px)", opacity: 0, scale: 0.95 } : { filter: "blur(0px)", opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, ease: "circIn" }}
                            >
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Paste sensitive data, passwords, or secret links here..."
                                    className="w-full min-h-[200px] rounded-2xl border-2 border-border/50 bg-secondary/20 p-6 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all resize-none shadow-inner font-mono"
                                />
                                <div className="absolute bottom-4 right-4 text-[10px] font-mono text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity">
                                    {content.length} BYTES | VOLATILE BUFFER
                                </div>
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-secondary/30 rounded-2xl p-4 border border-border flex flex-col gap-3">
                                <div className="flex items-center gap-2 px-1">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Stealth Duration</span>
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
                                    <span className="text-[10px] font-bold uppercase">Nuclear Purge</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-tight px-1 font-medium">
                                    Decryption triggers an immediate wipe. The key exists only in the link hash.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleCreate}
                            disabled={creating || !content}
                            className="w-full py-5 rounded-2xl bg-primary text-sm font-black text-primary-foreground hover:glow-primary transition-all disabled:opacity-50 active:scale-95 shadow-2xl flex items-center justify-center gap-3 group"
                        >
                            {creating ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <Lock className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                    GENERATE STEALTH LINK
                                </>
                            )}
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
                            <h3 className="text-2xl font-black text-foreground uppercase tracking-widest italic">Secret Encrypted</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                The decryption key is embedded in the hash below. It will never touch the server.
                                Purge in: <span className="text-primary font-bold">{expiry} minutes</span>.
                            </p>
                        </div>

                        <div className="w-full max-w-md p-2 bg-secondary/30 rounded-2xl border border-primary/30 flex items-center gap-2 shadow-xl backdrop-blur-xl">
                            <div className="flex-1 px-4 py-3 font-mono text-[10px] text-primary truncate">
                                {dropLink}
                            </div>
                            <button
                                onClick={copyLink}
                                className="p-3 rounded-xl bg-primary text-primary-foreground hover:glow-primary transition-all shadow-lg active:scale-95"
                            >
                                <Copy className="h-4 w-4" />
                            </button>
                        </div>

                        <button
                            onClick={() => { setDropLink(null); setContent(""); }}
                            className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest mt-4"
                        >
                            <Trash2 className="h-3.5 w-3.5" /> Wipe Local Buffer & Reset
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer Alert */}
            <div className="bg-neon-red/5 border border-neon-red/10 rounded-xl p-4 mt-auto">
                <div className="flex items-center gap-3 text-neon-red mb-1">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase">Stealth Protocol Notice</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug">
                    This link uses **Client-Side Encryption**. If you lose the hash part of the link, the data is permanently lost.
                    The server has zero access to the plain-text content.
                </p>
            </div>
        </div>
    );
}
