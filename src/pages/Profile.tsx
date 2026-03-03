import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Activity, FileText, Link2, Eye, Calendar, User as UserIcon, AlertTriangle, CheckCircle, Clock, Pencil, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { profileService, UserStats, ScanHistory, UserProfile } from "@/lib/profileService";
import { toast } from "sonner";
import { useRef } from "react";

export default function Profile() {
    const { user } = useAuth();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [history, setHistory] = useState<ScanHistory[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                                            toast.success("Profile picture updated!");
                                        } catch (error) {
                                            console.error("Upload error:", error);
                                            toast.error("Failed to upload image");
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
                                Operative: <span className="text-primary not-italic">{user?.email?.split('@')[0] || "CyberGuardian"}</span>
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
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass rounded-2xl border border-border/50 p-6 relative group hover:border-primary/30 transition-all"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <div className="text-[10px] font-mono text-muted-foreground">LIVE</div>
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

                    <div className="overflow-x-auto scrollbar-hide">
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
            </div>
        </div>
    );
}
