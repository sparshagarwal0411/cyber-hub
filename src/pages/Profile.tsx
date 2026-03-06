import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Activity, FileText, Link2, Eye, Calendar, User as UserIcon, AlertTriangle, CheckCircle, Clock, Pencil, Loader2, Lock, Unlock, Trash2, Copy, Database, Key, Check, Bot } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { profileService, UserStats, ScanHistory, UserProfile, VaultEntry } from "@/lib/profileService";
import { toast } from "sonner";
import { useRef } from "react";

export default function Profile() {
    const { user } = useAuth();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [history, setHistory] = useState<ScanHistory[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [vaultEntries, setVaultEntries] = useState<VaultEntry[]>([]);
    const [vaultCode, setVaultCode] = useState("");
    const [vaultUnlocked, setVaultUnlocked] = useState(false);
    const [unlocking, setUnlocking] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const vaultHealth = (() => {
        if (!vaultUnlocked || vaultEntries.length === 0) return null;

        let weak = 0;
        let hardened = 0;
        const passwords = vaultEntries.map(e => e.password);
        const uniquePasswords = new Set(passwords);
        const reused = passwords.length - uniquePasswords.size;

        vaultEntries.forEach(entry => {
            let charset = 0;
            const p = entry.password;
            if (/[a-z]/.test(p)) charset += 26;
            if (/[A-Z]/.test(p)) charset += 26;
            if (/[0-9]/.test(p)) charset += 10;
            if (/[^a-zA-Z0-9]/.test(p)) charset += 32;
            const entropy = Math.round(p.length * Math.log2(charset || 1));

            if (entropy < 55) weak++;
            else if (entropy >= 75) hardened++;
        });

        const healthFactor = (hardened / vaultEntries.length) * 100;
        const penaltyFactor = ((weak + reused) / vaultEntries.length) * 50;
        const score = Math.max(0, Math.min(100, Math.round(healthFactor - penaltyFactor + 50)));

        return { score, weak, hardened, reused };
    })();

    useEffect(() => {
        async function fetchData() {
            try {
                const [s, h, p] = await Promise.all([
                    profileService.getStats(),
                    profileService.getHistory(),
                    profileService.getProfile()
                ]);
                setStats(s);
                setHistory(h);
                setProfile(p);
            } catch (error) {
                console.error("Error fetching profile data:", error);
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            fetchData();
        }
    }, [user]);

    const statCards = [
        { label: "Total Investigations", value: stats?.total_scans || 0, icon: Activity, color: "text-primary" },
        { label: "PDF Armor Scans", value: stats?.pdf_scans || 0, icon: FileText, color: "text-neon-cyan" },
        { label: "URL Radar Scans", value: stats?.url_scans || 0, icon: Link2, color: "text-neon-green" },
        { label: "Visual Guard Scans", value: stats?.visual_scans || 0, icon: Eye, color: "text-neon-purple" },
    ];

    return (
        <div className="min-h-screen bg-background cyber-grid pt-24 px-4 pb-12">
            <div className="container mx-auto max-w-6xl">
                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-[2rem] border-2 border-border/50 p-8 mb-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                        <Shield className="h-32 w-32 text-primary" />
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                        <div className="relative group">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setUploading(true);
                                        try {
                                            const url = await profileService.uploadAvatar(file);
                                            setProfile({ avatar_url: url });
                                            window.dispatchEvent(new Event("avatar-updated"));
                                            toast.success("Profile picture updated!");
                                        } catch (error: any) {
                                            console.error("Upload error:", error);
                                            if (error.message?.includes('Bucket not found')) {
                                                toast.error("Avatar storage not setup. Please create 'avatars' bucket in Supabase.");
                                            } else {
                                                toast.error("Failed to upload image");
                                            }
                                        } finally {
                                            setUploading(false);
                                        }
                                    }
                                }}
                            />
                            <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/30 overflow-hidden relative">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="h-12 w-12 text-primary" />
                                )}
                                {uploading && (
                                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground h-8 w-8 rounded-full border-4 border-background flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        <div className="text-center md:text-left space-y-1">
                            <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase italic">
                                Operator: <span className="text-primary not-italic">{user?.email?.split('@')[0] || "CyberGuardian"}</span>
                            </h1>
                            <p className="text-muted-foreground font-mono text-xs">{user?.email}</p>
                            <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    <Calendar className="h-3 w-3" /> Joined {new Date(user?.created_at || Date.now()).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-neon-green uppercase tracking-widest">
                                    <CheckCircle className="h-3 w-3" /> System Verified
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {statCards.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="glass rounded-2xl border border-border/50 p-6 relative group hover:border-primary/40 transition-all hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.1)] overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-2 rounded-lg bg-secondary ${stat.color} group-hover:glow-primary transition-all duration-500`}>
                                        <stat.icon className="h-5 w-5" />
                                    </div>
                                    <div className="text-[10px] font-mono text-muted-foreground opacity-50">LIVE</div>
                                </div>
                            </div>
                            <div className="text-3xl font-black text-foreground">{loading ? "..." : stat.value}</div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* History Feed */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass rounded-[2rem] border-2 border-border/50 p-8 shadow-2xl overflow-hidden"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <Clock className="h-6 w-6 text-primary" />
                        <h2 className="text-xl font-bold text-foreground uppercase italic pb-1 border-b-2 border-primary/30">Investigation Log</h2>
                    </div>

                    <div className="overflow-x-auto scrollbar-hide max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border/50">
                                    <th className="text-left py-4 px-2 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Asset Type</th>
                                    <th className="text-left py-4 px-2 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Target Identification</th>
                                    <th className="text-left py-4 px-2 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Threat Level</th>
                                    <th className="text-right py-4 px-2 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {loading ? (
                                    [1, 2, 3].map((i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={4} className="py-6 bg-secondary/10 rounded-lg my-2" />
                                        </tr>
                                    ))
                                ) : history.length > 0 ? (
                                    history.map((item) => (
                                        <tr key={item.id} className="group hover:bg-primary/5 transition-colors">
                                            <td className="py-4 px-2">
                                                <div className="flex items-center gap-2">
                                                    {item.type === 'PDF' && <FileText className="h-4 w-4 text-neon-cyan" />}
                                                    {item.type === 'URL' && <Link2 className="h-4 w-4 text-neon-green" />}
                                                    {item.type === 'Visual' && <Eye className="h-4 w-4 text-neon-purple" />}
                                                    {item.type === 'AI' && <Bot className="h-4 w-4 text-primary" />}
                                                    <span className="font-bold text-foreground/80">{item.type}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-2">
                                                <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px] block" title={item.target}>
                                                    {item.target}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase ${item.risk === 'HIGH' || item.risk === 'CRITICAL'
                                                    ? 'bg-neon-red/10 text-neon-red border border-neon-red/20'
                                                    : item.risk === 'MEDIUM'
                                                        ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                                        : 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                                                    }`}>
                                                    {item.risk === 'HIGH' || item.risk === 'CRITICAL' ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                                                    {item.risk}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2 text-right">
                                                <span className="text-[10px] font-mono text-muted-foreground">
                                                    {new Date(item.created_at).toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                                <Shield className="h-12 w-12 opacity-10" />
                                                <p className="text-xs uppercase font-bold tracking-widest">No investigations recorded in terminal history.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Cyber Vault Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass rounded-[2rem] border-2 border-primary/20 p-8 shadow-2xl relative overflow-hidden mt-12"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                        <Lock className="h-32 w-32 text-primary" />
                    </div>

                    {vaultUnlocked && vaultHealth && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 relative z-10">
                            <div className="lg:col-span-1 glass bg-primary/5 rounded-2xl border border-primary/20 p-6 flex flex-col items-center justify-center text-center">
                                <div className="relative mb-4">
                                    <svg className="w-32 h-32 transform -rotate-90">
                                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-secondary" />
                                        <motion.circle
                                            cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent"
                                            className={vaultHealth.score > 70 ? "text-neon-green" : vaultHealth.score > 40 ? "text-yellow-500" : "text-neon-red"}
                                            strokeDasharray={364.4}
                                            initial={{ strokeDashoffset: 364.4 }}
                                            animate={{ strokeDashoffset: 364.4 - (364.4 * vaultHealth.score) / 100 }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-black text-foreground">{vaultHealth.score}%</span>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Health</span>
                                    </div>
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest italic">Vault Integrity</h3>
                            </div>

                            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                                <div className="glass bg-neon-green/5 border border-neon-green/20 rounded-2xl p-4 flex flex-col justify-center">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-muted-foreground uppercase">Hardened</span>
                                        <CheckCircle className="h-4 w-4 text-neon-green" />
                                    </div>
                                    <div className="text-2xl font-black text-neon-green">{vaultHealth.hardened} Assets</div>
                                </div>
                                <div className="glass bg-neon-red/5 border border-neon-red/20 rounded-2xl p-4 flex flex-col justify-center">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-muted-foreground uppercase">At Risk</span>
                                        <AlertTriangle className="h-4 w-4 text-neon-red" />
                                    </div>
                                    <div className="text-2xl font-black text-neon-red">{vaultHealth.weak} Weak</div>
                                </div>
                                <div className="glass bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4 flex flex-col justify-center col-span-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-muted-foreground uppercase">Redundancy Check</span>
                                        <Database className="h-4 w-4 text-yellow-500" />
                                    </div>
                                    <div className="text-xl font-black text-yellow-500">{vaultHealth.reused} Duplicated Passwords Detected</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-3">
                            <Database className="h-6 w-6 text-primary" />
                            <h2 className="text-xl font-bold text-foreground uppercase italic pb-1 border-b-2 border-primary/30">Cyber Vault Locker</h2>
                        </div>
                        {vaultUnlocked && (
                            <button
                                onClick={() => { setVaultUnlocked(false); setVaultEntries([]); setVaultCode(""); }}
                                className="text-[10px] font-black text-neon-red uppercase tracking-widest border border-neon-red/30 px-3 py-1.5 rounded-lg hover:bg-neon-red/10 transition-all"
                            >
                                Lock Vault
                            </button>
                        )}
                    </div>

                    {!vaultUnlocked ? (
                        <div className="flex flex-col items-center justify-center py-12 max-w-sm mx-auto text-center space-y-6 relative z-10">
                            <div className="p-4 rounded-full bg-primary/10 text-primary mb-2">
                                <Lock className="h-10 w-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-foreground uppercase tracking-widest italic">Vault Is Encrypted</h3>
                                <p className="text-sm text-muted-foreground">Enter your Secret Access Code to synchronize and decrypt your saved assets.</p>
                            </div>
                            <div className="w-full flex gap-2">
                                <input
                                    type="password"
                                    value={vaultCode}
                                    onChange={(e) => setVaultCode(e.target.value)}
                                    placeholder="Secret Code..."
                                    className="flex-1 rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm text-foreground focus:border-primary outline-none transition-all font-mono"
                                />
                                <button
                                    onClick={async () => {
                                        if (!vaultCode) return;
                                        setUnlocking(true);
                                        try {
                                            const entries = await profileService.getVaultEntries(vaultCode);
                                            if (entries.length === 0) {
                                                toast.error("Incorrect code or no entries found");
                                            } else {
                                                setVaultEntries(entries);
                                                setVaultUnlocked(true);
                                                toast.success("Vault synchronization complete");
                                            }
                                        } catch (error) {
                                            toast.error("Failed to sync vault");
                                        } finally {
                                            setUnlocking(false);
                                        }
                                    }}
                                    disabled={unlocking}
                                    className="bg-primary text-primary-foreground px-6 rounded-xl font-bold text-sm tracking-tighter hover:glow-primary transition-all disabled:opacity-50"
                                >
                                    {unlocking ? <Loader2 className="h-4 w-4 animate-spin" /> : "UNLOCK"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                            {vaultEntries.map((entry) => (
                                <VaultCard
                                    key={entry.id}
                                    entry={entry}
                                    onDelete={async () => {
                                        try {
                                            await profileService.deleteVaultEntry(entry.id);
                                            setVaultEntries(prev => prev.filter(e => e.id !== entry.id));
                                            toast.success("Asset purged from vault");
                                        } catch (error) {
                                            toast.error("Failed to purge asset");
                                        }
                                    }}
                                    onUpdate={(id, newPass) => {
                                        setVaultEntries(prev => prev.map(e => e.id === id ? { ...e, password: newPass } : e));
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

function VaultCard({ entry, onDelete, onUpdate }: { entry: VaultEntry; onDelete: () => void; onUpdate: (id: string, newPass: string) => void }) {
    const [revealed, setRevealed] = useState(false);
    const [editing, setEditing] = useState(false);
    const [newPassword, setNewPassword] = useState(entry.password);
    const [updating, setUpdating] = useState(false);

    const handleSave = async () => {
        setUpdating(true);
        try {
            await profileService.updateVaultEntry(entry.id, newPassword);
            onUpdate(entry.id, newPassword);
            setEditing(false);
            toast.success("Credential updated");
        } catch (error) {
            toast.error("Failed to update credential");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass rounded-2xl border border-border/50 p-5 group hover:border-primary/30 transition-all flex flex-col justify-between h-full hover-scale hover:shadow-xl hover:shadow-primary/5"
        >
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-lg bg-secondary text-primary">
                        <Key className="h-4 w-4" />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setEditing(!editing);
                                if (!editing) setNewPassword(entry.password);
                            }}
                            className={`p-1.5 transition-colors rounded-md ${editing ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(entry.password);
                                toast.success("Password copied");
                            }}
                            className="p-1.5 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/10 rounded-md"
                        >
                            <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-1.5 text-muted-foreground hover:text-neon-red transition-colors hover:bg-neon-red/10 rounded-md"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{entry.service_name}</h4>

                {editing ? (
                    <div className="flex gap-2">
                        <input
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="flex-1 bg-background/50 p-3 rounded-xl border border-primary/50 font-mono text-sm outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button
                            onClick={handleSave}
                            disabled={updating}
                            className="bg-primary text-primary-foreground p-3 rounded-xl hover:glow-primary transition-all disabled:opacity-50"
                        >
                            {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 bg-background/50 p-3 rounded-xl border border-border/50 group/pass">
                        <div className="font-mono text-sm tracking-tighter flex-1 truncate">
                            {revealed ? entry.password : "••••••••••••••••"}
                        </div>
                        <button
                            onClick={() => setRevealed(!revealed)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {revealed ? <Eye className="h-4 w-4" /> : <Eye className="h-4 w-4 opacity-30" />}
                        </button>
                    </div>
                )}
            </div>
            <div className="mt-4 pt-4 border-t border-border/30 text-[10px] font-mono text-muted-foreground">
                SAVED: {new Date(entry.created_at).toLocaleDateString()}
            </div>
        </motion.div>
    );
}
