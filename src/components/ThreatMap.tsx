import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Stars, Float, PerspectiveCamera, Html } from "@react-three/drei";
import * as THREE from "three";
import { Activity, Shield, AlertCircle, Globe as GlobeIcon, Zap, Terminal } from "lucide-react";

// --- Sub-component: Attack Arcs ---
function AttackArc({ start, end, color = "#ff4d4d" }: { start: THREE.Vector3, end: THREE.Vector3, color?: string }) {
    const curve = useMemo(() => {
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const distance = start.distanceTo(end);
        mid.normalize().multiplyScalar(2 + distance * 0.5); // Arc height
        return new THREE.QuadraticBezierCurve3(start, mid, end);
    }, [start, end]);

    const points = useMemo(() => curve.getPoints(50), [curve]);
    const lineRef = useRef<THREE.Line>(null);

    useFrame(({ clock }) => {
        if (lineRef.current) {
            const time = (clock.getElapsedTime() * 0.5) % 1;
            lineRef.current.geometry.setDrawRange(0, Math.floor(time * 50));
        }
    });

    return (
        <line ref={lineRef as any}>
            <bufferGeometry attach="geometry">
                <bufferAttribute
                    attach="attributes-position"
                    count={points.length}
                    array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
                    itemSize={3}
                />
            </bufferGeometry>
            <lineBasicMaterial attach="material" color={color} linewidth={2} transparent opacity={0.6} />
        </line>
    );
}

// --- Sub-component: Pulse Point ---
function PulsePoint({ position, color = "#ff4d4d" }: { position: THREE.Vector3, color?: string }) {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame(({ clock }) => {
        if (meshRef.current) {
            const scale = 1 + Math.sin(clock.getElapsedTime() * 5) * 0.5;
            meshRef.current.scale.set(scale, scale, scale);
            (meshRef.current.material as THREE.MeshBasicMaterial).opacity = 1 - (scale - 0.5) / 1.5;
        }
    });

    return (
        <mesh position={position} ref={meshRef}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
    );
}

// --- Core Globe Component ---
function ThreatGlobe() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = clock.getElapsedTime() * 0.05;
        }
    });

    const attacks = useMemo(() => {
        const items = [];
        const generatePoint = () => {
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            const r = 2;
            return new THREE.Vector3(
                r * Math.sin(theta) * Math.cos(phi),
                r * Math.sin(theta) * Math.sin(phi),
                r * Math.cos(theta)
            );
        };
        for (let i = 0; i < 8; i++) {
            items.push({ start: generatePoint(), end: generatePoint(), id: i });
        }
        return items;
    }, []);

    return (
        <group ref={groupRef}>
            {/* Base Globe */}
            <Sphere args={[2, 64, 64]}>
                <meshStandardMaterial
                    color="#0a192f"
                    wireframe
                    transparent
                    opacity={0.15}
                    emissive="#00d4ff"
                    emissiveIntensity={0.2}
                />
            </Sphere>
            <Sphere args={[1.98, 64, 64]}>
                <meshPhongMaterial
                    color="#020617"
                    transparent
                    opacity={0.8}
                />
            </Sphere>

            {/* Atmosphere Glow */}
            <Sphere args={[2.2, 32, 32]}>
                <meshPhongMaterial
                    color="#00d4ff"
                    transparent
                    opacity={0.03}
                    side={THREE.BackSide}
                />
            </Sphere>

            {/* Attacks */}
            {attacks.map(attack => (
                <group key={attack.id}>
                    <AttackArc start={attack.start} end={attack.end} />
                    <PulsePoint position={attack.start} />
                    <PulsePoint position={attack.end} />
                </group>
            ))}
        </group>
    );
}

// --- Main ThreatMap Component ---
export function ThreatMap() {
    const [events, setEvents] = useState<string[]>([]);
    const [stats, setStats] = useState({ blocked: 12402, active: 8 });

    useEffect(() => {
        const types = ["Mitigating SQLi", "DDoS Deflected", "Phishing Sinkholed", "Exploit Blocked", "Botnet Routed"];
        const cities = ["New York", "London", "Tokyo", "Berlin", "Sydney", "Moscow", "Mumbai"];

        const interval = setInterval(() => {
            const newEvent = `[${new Date().toLocaleTimeString()}] ${types[Math.floor(Math.random() * types.length)]} -> Core ${cities[Math.floor(Math.random() * cities.length)]}`;
            setEvents(prev => [newEvent, ...prev].slice(0, 10));
            setStats(prev => ({
                blocked: prev.blocked + Math.floor(Math.random() * 5),
                active: Math.floor(Math.random() * 12) + 4
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_300px] gap-6 h-full min-h-[500px] relative">
            {/* Map Canvas */}
            <div className="relative rounded-2xl bg-black/40 border border-border/50 overflow-hidden min-h-[400px]">
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-neon-red animate-ping" />
                    <span className="text-[10px] font-black text-neon-red uppercase tracking-widest">Global Attack Surface: Active</span>
                </div>

                <Canvas shadows dpr={[1, 2]}>
                    <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={45} />
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} color="#00d4ff" />
                    <ThreatGlobe />
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                </Canvas>

                <div className="absolute top-12 left-4 z-10 flex flex-col gap-2 max-w-[180px]">
                    <div className="glass bg-background/40 border border-white/5 rounded-lg p-3 backdrop-blur-md">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="h-3 w-3 text-primary" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-foreground">Vector Breakdown</span>
                        </div>
                        <div className="space-y-1.5">
                            {[
                                { label: "SQL Injection", val: 42, color: "bg-neon-red" },
                                { label: "DDoS Protocol", val: 28, color: "bg-primary" },
                                { label: "Phishing/XSS", val: 30, color: "bg-neon-cyan" }
                            ].map(v => (
                                <div key={v.label} className="space-y-1">
                                    <div className="flex justify-between text-[8px] font-bold text-muted-foreground uppercase">
                                        <span>{v.label}</span>
                                        <span>{v.val}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${v.val}%` }}
                                            className={`h-full ${v.color}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass bg-background/40 border border-white/5 rounded-lg p-3 backdrop-blur-md">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-3 w-3 text-neon-green" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-foreground">System Integrity</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                                <div className="text-[7px] font-bold text-muted-foreground uppercase">Grid Load</div>
                                <div className="text-[10px] font-black text-neon-green">OPTIMAL</div>
                            </div>
                            <div className="space-y-0.5 text-right">
                                <div className="text-[7px] font-bold text-muted-foreground uppercase">Latency</div>
                                <div className="text-[10px] font-black text-primary">12ms</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Legend Overlay */}
                <div className="absolute bottom-4 left-4 z-10 grid gap-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                        <div className="h-2 w-2 rounded-full bg-neon-red shadow-[0_0_8px_rgba(244,63,94,0.5)]" /> Inbound Attack
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                        <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" /> MITM Intercept
                    </div>
                </div>

                <div className="absolute bottom-4 right-4 z-10 text-right hidden sm:block">
                    <p className="text-[8px] font-bold text-muted-foreground/50 uppercase leading-relaxed max-w-[150px]">
                        Global Sensor Network v2.5 Online<br />
                        Mapping 1.2M active endpoints<br />
                        Zero-day heuristic engine: active
                    </p>
                </div>
            </div>

            {/* Telemetry Sidebar */}
            <div className="flex flex-col gap-4">
                {/* IQ Overview Card */}
                <div className="glass bg-primary/5 border border-primary/20 rounded-xl p-4 hidden lg:block">
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-xs font-black uppercase tracking-tighter italic text-foreground">Grid Intelligence</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                        Our distributed honey-pot network captures over 50TB of threat telemetry daily. This map visualizes high-confidence incursions redirected through our scrubbers.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                    <div className="glass bg-neon-red/5 border border-neon-red/20 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Threats Neutralized</span>
                            <Shield className="h-3.5 w-3.5 text-neon-red" />
                        </div>
                        <div className="text-2xl font-black text-foreground tabular-nums">
                            {stats.blocked.toLocaleString()}
                        </div>
                    </div>
                    <div className="glass bg-primary/5 border border-primary/20 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Active Interceptions</span>
                            <Zap className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="text-2xl font-black text-foreground tabular-nums">
                            {stats.active}
                        </div>
                    </div>
                </div>

                {/* Event Feed */}
                <div className="flex-1 glass bg-secondary/20 border border-border/50 rounded-xl p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <Terminal className="h-4 w-4 text-primary" />
                        <span className="text-xs font-black uppercase tracking-widest italic">Live Telemetry</span>
                    </div>
                    <div className="flex-1 overflow-hidden relative">
                        <div className="space-y-3 font-mono text-[9px] text-muted-foreground">
                            <AnimatePresence initial={false}>
                                {events.map((event, i) => (
                                    <motion.div
                                        key={event}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1 - i * 0.1, x: 0 }}
                                        className="border-l-2 border-primary/30 pl-3 py-0.5"
                                    >
                                        {event}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute -inset-1 bg-gradient-to-tr from-primary/5 via-transparent to-neon-red/5 blur-3xl -z-10 pointer-events-none" />
        </div>
    );
}
