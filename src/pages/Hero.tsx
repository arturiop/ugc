import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Sparkles, Play, ArrowRight, Check, Plus, Image, ArrowUp, Zap } from "lucide-react";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { useCreateProject } from "@/api/projects/hooks";

const Index = () => {
    const navigate = useNavigate();
    const createProject = useCreateProject();

    async function handleCreateProject() {
        try {
            const data = await createProject.mutateAsync();
            const id = data?.short_id || data?.uuid;

            if (id) {
                navigate(`/projects/${id}`);
            } else {
                console.error("Project created but id missing", data);
            }
        } catch (err) {
            console.error("Failed to create project", err);
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Nav */}
            <nav className="flex items-center justify-between px-6 md:px-16 py-5">
                <span className="text-xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Watchable
                </span>
                <div className="flex items-center gap-3">
                    <Button size="small" onClick={() => navigate("/login")}>
                        Log in
                    </Button>
                </div>
            </nav>

            {/* Hero */}
            <section className="px-6 md:px-16 pt-22 md:pt-24 pb-16">
                <div className="max-w-7xl mx-auto">
                    {/* Mobile: stacked layout */}
                    <div className="flex flex-col gap-8 lg:hidden">
                        <div>
                            <p className="uppercase tracking-[0.25em] text-[11px] font-semibold text-accent mb-6">AI-Powered Production</p>
                            <h1 className="text-4xl sm:text-5xl font-bold leading-[1.08] tracking-tight text-foreground mb-6">
                                The easiest way to make <span className="inline-block bg-accent/15 text-accent px-3 py-0.5 rounded-lg">video ads</span> people{" "}
                                <span className="font-black italic">actually watch</span>
                                <span className="text-accent font-black text-5xl leading-none">.</span>
                            </h1>
                            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-sm">
                                Upload your product · Project with AI · Choose your storyboard · Get polished UGC video ads —{" "}
                                <span className="text-foreground font-medium">no production hassle</span>.
                            </p>
                        </div>
                    </div>

                    {/* Desktop: overlapping layout */}
                    <div className="hidden lg:block relative">
                        <div className="w-[70%] ml-auto">
                            <div className="relative">
                                <div className="absolute -inset-4 rounded-3xl bg-accent/10 blur-2xl" />

                                <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-border shadow-2xl bg-black">
                                    <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                                        <source src="./assets/demo.mp4" type="video/mp4" />
                                    </video>
                                </div>
                            </div>
                        </div>

                        <div className="absolute top-1/2 -translate-y-1/2 left-0 z-10 w-[26rem]">
                            <div
                                className="rounded-2xl p-8 py-16 border border-white/30 border-r-0 shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.4)]"
                                style={{
                                    background: "linear-gradient(to right, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 60%, transparent 100%)",
                                    backdropFilter: "blur(24px)",
                                    WebkitBackdropFilter: "blur(24px)",
                                }}>
                                <p className="uppercase tracking-[0.25em] text-[11px] font-semibold text-accent mb-6">AI-Powered Production</p>
                                <h1 className="text-5xl xl:text-6xl font-bold leading-[1.08] tracking-tight text-foreground mb-8">
                                    The easiest way to make
                                    <br />
                                    <span className="inline-block bg-accent/15 text-accent px-3 py-0.5 rounded-lg mt-1">video ads</span> people
                                    <br />
                                    <span className="font-black italic">actually watch</span>
                                    <span className="text-accent font-black text-7xl leading-none">.</span>
                                </h1>
                                <p className="text-lg text-muted-foreground leading-relaxed max-w-sm">
                                    Upload your product · Clip with AI Choose your storyboard · Get polished UGC video ads —{" "}
                                    <span className="text-foreground font-medium">no production hassle</span>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <ProductJourney />
        </div>
    );
};

export default Index;

const builderSteps = ["Idea", "Script", "Storyboard", "Ready"] as const;

const scenes = [
    { number: "01", title: "Opening hook", description: "Close-up product reveal with text overlay" },
    { number: "02", title: "Problem setup", description: "Relatable moment your audience knows" },
    { number: "03", title: "Product in action", description: "Natural, authentic usage footage" },
    { number: "04", title: "Social proof + CTA", description: "Reaction shot with clear next step" },
];

const stages = [
    {
        id: "product",
        label: "Your Product",
        sublabel: "Drop a photo or link",
        icon: MessageSquare,
    },
    {
        id: "storyboard",
        label: "AI Storyboard",
        sublabel: "Clip to refine the script",
        icon: Sparkles,
    },
    {
        id: "video",
        label: "Ready to Post",
        sublabel: "Scroll-stopping UGC ad",
        icon: Play,
    },
];

const ProductJourney = () => {
    const [activeStage, setActiveStage] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAutoPlaying) return;
        const interval = setInterval(() => {
            setActiveStage((prev) => (prev + 1) % 3);
        }, 3000);
        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const handleStageClick = (index: number) => {
        setActiveStage(index);
        setIsAutoPlaying(false);
        // Resume auto-play after 8s of inactivity
        setTimeout(() => setIsAutoPlaying(true), 8000);
    };

    return (
        <section className="pt-8 md:pt-24 pb-20 md:pb-24 px-6 md:px-16 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14 lg:mb-20">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                        Just clip, and your{" "}
                        <span className="relative inline-block">
                            <span className="relative z-10 bg-accent/15 text-accent px-4 py-1 rounded-xl">ad</span>
                            <motion.span
                                className="absolute -inset-1 rounded-xl bg-accent/10 blur-md"
                                animate={{ opacity: [0.4, 0.7, 0.4] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />
                        </span>
                    </h2>
                    <p
                        className="text-3xl sm:text-4xl md:text-5xl tracking-tight text-muted-foreground leading-[1.1] mt-1 italic"
                        style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
                        creates itself
                    </p>
                </motion.div>
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    <div className="lg:w-[380px] flex-shrink-0">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="rounded-3xl border border-border/60 bg-gradient-to-b from-card to-card/80 shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl">
                            <div className="px-5 pt-6 pb-3 space-y-3 flex-1 flex flex-col">
                                {/* AI thinking indicator */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4, duration: 0.3 }}
                                    className="self-start">
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
                                            <Sparkles className="w-3 h-3 text-accent-foreground" />
                                        </div>
                                        <motion.div className="flex gap-1" initial={{ opacity: 0.5 }}>
                                            {[0, 1, 2].map((i) => (
                                                <motion.span
                                                    key={i}
                                                    className="w-1.5 h-1.5 rounded-full bg-accent/50"
                                                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                                                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                                />
                                            ))}
                                        </motion.div>
                                    </div>
                                </motion.div>

                                {/* AI response — script card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 15, scale: 0.97 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.6, duration: 0.5 }}
                                    className="self-start w-full">
                                    <div className="rounded-2xl border border-border bg-gradient-to-br from-muted/80 to-muted/30 p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-md bg-accent/15 flex items-center justify-center">
                                                    <Play className="w-3 h-3 text-accent fill-accent" />
                                                </div>
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-foreground/80">Your Ad Script</p>
                                            </div>
                                            <span className="text-[10px] text-accent font-semibold bg-accent/10 px-2 py-0.5 rounded-full">4 scenes</span>
                                        </div>

                                        <div className="space-y-2">
                                            {[
                                                { label: "Hook", text: '"POV: You finally got THE cup"', color: "from-accent/20 to-accent/5" },
                                                { label: "Problem", text: '"Still drinking lukewarm water?"', color: "from-purple-500/15 to-purple-500/5" },
                                                { label: "Demo", text: "Ice test + color reveal moment", color: "from-blue-500/15 to-blue-500/5" },
                                                { label: "CTA", text: '"Link in bio — trust me on this"', color: "from-emerald-500/15 to-emerald-500/5" },
                                            ].map((scene, i) => (
                                                <motion.div
                                                    key={scene.label}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: 0.7 + i * 0.08, duration: 0.3 }}
                                                    className={`flex items-start gap-2.5 px-3 py-2 rounded-xl bg-gradient-to-r ${scene.color}`}>
                                                    <span className="text-[10px] font-bold text-accent mt-0.5 w-10 flex-shrink-0">{scene.label}</span>
                                                    <p className="text-[12px] text-foreground/80 leading-snug">{scene.text}</p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* AI follow-up */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 1, duration: 0.4 }}
                                    className="self-start max-w-[85%]">
                                    <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-2.5">
                                        <p className="text-[12px] text-foreground/70 leading-relaxed">
                                            Want me to tweak the tone? I can make it more <span className="text-accent font-semibold">chaotic</span>,{" "}
                                            <span className="text-accent font-semibold">aesthetic</span>, or <span className="text-accent font-semibold">minimal</span> ✨
                                        </p>
                                    </div>
                                </motion.div>

                                <div className="flex-1 min-h-2" />
                            </div>

                            {/* Input + CTA */}
                            <div className="px-5 pb-5 pt-2 space-y-3">
                                <div className="rounded-2xl border border-border/80 bg-background/80 p-3 space-y-2.5 focus-within:border-accent/40 focus-within:shadow-md focus-within:shadow-accent/10 transition-all backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0">
                                            <p className="text-[8px] uppercase tracking-widest text-muted-foreground/40 font-medium mb-0.5">Start Frame</p>
                                            <div className="w-11 h-11 rounded-xl border-2 border-dashed border-muted-foreground/15 flex items-center justify-center hover:border-accent/40 hover:bg-accent/5 cursor-pointer transition-all group">
                                                <Plus className="w-3.5 h-3.5 text-muted-foreground/25 group-hover:text-accent transition-colors" />
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Make it more chaotic..."
                                            className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground/35"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between pt-0.5">
                                        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/30 hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer">
                                            <Image className="w-4 h-4" />
                                        </button>
                                        <motion.button
                                            className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground shadow-md shadow-accent/25 hover:shadow-lg hover:shadow-accent/30 transition-all cursor-pointer"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}>
                                            <ArrowUp className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                </div>
                                <Button onClick={() => navigate("/login")} sx={{ color: "white" }} className="w-full rounded-xl h-12 tracking-wide bg-black">
                                    Get started
                                </Button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right side — Journey card */}
                    <div className="lg:w-[800px]">
                        <div className="relative mx-auto">
                            {/* Glow backdrop */}
                            <motion.div
                                className="absolute -inset-8 rounded-3xl blur-3xl opacity-30"
                                animate={{
                                    background:
                                        activeStage === 0
                                            ? "radial-gradient(circle, hsl(var(--accent) / 0.3), transparent)"
                                            : activeStage === 1
                                            ? "radial-gradient(circle, hsl(280 70% 50% / 0.3), transparent)"
                                            : "radial-gradient(circle, hsl(150 60% 40% / 0.3), transparent)",
                                }}
                                transition={{ duration: 0.8 }}
                            />

                            <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-2xl">
                                {/* Stage indicators - inside the block */}
                                <div className="flex items-center justify-center gap-4 sm:gap-6 px-6 py-4">
                                    {stages.map((stage, i) => {
                                        const Icon = stage.icon;
                                        const isActive = activeStage === i;
                                        const isPast = activeStage > i;
                                        return (
                                            <div key={stage.id} className="flex items-center gap-2 sm:gap-4">
                                                <button
                                                    onClick={() => handleStageClick(i)}
                                                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full transition-all duration-500 cursor-pointer ${
                                                        isActive
                                                            ? "bg-accent text-accent-foreground shadow-lg shadow-accent/25 scale-105"
                                                            : isPast
                                                            ? "bg-accent/15 text-accent"
                                                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                                                    }`}>
                                                    <Icon className="w-4 h-4" />
                                                    <span className="text-sm font-medium hidden sm:inline">{stage.label}</span>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Content area */}
                                <div className="relative h-[500px] overflow-hidden">
                                    <AnimatePresence mode="wait">
                                        {activeStage === 0 && (
                                            <motion.div
                                                key="product"
                                                initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                                exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                                                transition={{ duration: 0.5 }}
                                                className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/50 to-background p-8">
                                                <div className="flex flex-col items-center gap-4">
                                                    <motion.div
                                                        initial={{ y: 20, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{ delay: 0.3, duration: 0.4 }}
                                                        className="bg-accent/10 border border-accent/20 rounded-2xl rounded-bl-sm px-5 py-3 max-w-xs">
                                                        <p className="text-sm text-foreground">"Make a UGC ad for my Stanley cup — fun, relatable, Gen Z vibe"</p>
                                                    </motion.div>
                                                    <motion.img
                                                        src={"./assets/st.webp"}
                                                        alt="Stanley Cup product"
                                                        className="w-48 sm:w-56 object-contain drop-shadow-2xl"
                                                        initial={{ y: 30, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{ delay: 0.5, duration: 0.5 }}
                                                    />
                                                </div>
                                            </motion.div>
                                        )}

                                        {activeStage === 1 && (
                                            <motion.div
                                                key="storyboard"
                                                initial={{ opacity: 0, x: 60, filter: "blur(10px)" }}
                                                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                                exit={{ opacity: 0, x: -60, filter: "blur(10px)" }}
                                                transition={{ duration: 0.5 }}
                                                className="absolute inset-0 flex items-center justify-center p-4">
                                                <motion.img
                                                    src={"./assets/s_s.png"}
                                                    alt="AI-generated storyboard"
                                                    className="w-full h-full object-contain rounded-lg"
                                                    initial={{ scale: 0.95 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.2, duration: 0.4 }}
                                                />
                                            </motion.div>
                                        )}

                                        {activeStage === 2 && (
                                            <motion.div
                                                key="video"
                                                initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                                exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                                                transition={{ duration: 0.5 }}
                                                className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-500/5 to-background">
                                                {/* Video placeholder with phone frame */}
                                                <div className="relative">
                                                    <div className="w-44 sm:w-52 aspect-[9/16] rounded-[1.5rem] border-2 border-border bg-card overflow-hidden shadow-xl">
                                                        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-emerald-500/10" />
                                                        {/* Fake video UI */}
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                                                    className="relative h-full aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-black">
                                                                    <motion.video
                                                                        autoPlay
                                                                        muted
                                                                        loop
                                                                        playsInline
                                                                        initial={{ scale: 1.05 }}
                                                                        animate={{ scale: 1 }}
                                                                        transition={{ duration: 1.2, ease: "easeOut" }}
                                                                        className="w-full h-full object-cover">
                                                                        <source src="./assets/demo_s.mp4" type="video/mp4" />
                                                                    </motion.video>
                                                                </motion.div>
                                                            </div>
                                                        </div>
                                                        {/* Bottom text */}
                                                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                                                            <p className="text-white text-xs font-medium">Your UGC ad is ready 🎉</p>
                                                            <p className="text-white/60 text-[10px] mt-0.5">Tap to preview</p>
                                                        </div>
                                                    </div>

                                                    {/* Floating badges */}
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.4, duration: 0.4 }}
                                                        className="absolute -left-16 sm:-left-24 top-8 bg-card border border-border rounded-xl px-3 py-2 shadow-lg">
                                                        <p className="text-[10px] text-muted-foreground">Format</p>
                                                        <p className="text-xs font-semibold text-foreground">9:16 Reel</p>
                                                    </motion.div>
                                                    <motion.div
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.6, duration: 0.4 }}
                                                        className="absolute -right-16 sm:-right-24 bottom-12 bg-card border border-border rounded-xl px-3 py-2 shadow-lg">
                                                        <p className="text-[10px] text-muted-foreground">Ready for</p>
                                                        <p className="text-xs font-semibold text-foreground">TikTok · IG · YT</p>
                                                    </motion.div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Bottom label */}
                                <div className="px-6 py-4 border-t border-border bg-muted/30">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeStage}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.3 }}
                                            className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">{stages[activeStage].label}</p>
                                                <p className="text-xs text-muted-foreground">{stages[activeStage].sublabel}</p>
                                            </div>
                                            <div className="flex gap-1.5">
                                                {stages.map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                                            i === activeStage ? "bg-accent w-6" : "bg-muted-foreground/20"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
