"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Upload,
  Sparkles,
  Download,
  Share2,
  ZoomOut,
  ZoomIn,
  Maximize2,
  RotateCcw,
  History,
  Plus,
  ShoppingBag,
  ExternalLink,
  Cpu,
  Circle,
  ChevronUp,
  ChevronDown,
  Zap,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Home,
  Sofa,
  UtensilsCrossed,
  BedDouble,
  Bath,
  Trees,
  BookOpen,
  Dumbbell,
  Wine,
  Monitor,
  ChevronRight,
  Wand2,
  Search,
  ImageIcon,
  FlipHorizontal,
  ShoppingCart,
  Check,
  Sparkles as SparklesIcon,
  LogIn,
  User,
  LayoutGrid,
  Clock,
  ChevronDown as ChevronDownIcon,
  Moon,
  Sun,
  Bookmark,
  BookmarkCheck,
  Palette,
  Star,
} from "lucide-react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const PRIMARY_STYLES = [
  { id: "minimalist", label: "Minimalist", icon: "—", desc: "Clean & simple" },
  {
    id: "scandinavian",
    label: "Scandinavian",
    icon: "⬡",
    desc: "Nordic warmth",
  },
  { id: "industrial", label: "Industrial", icon: "⚙", desc: "Raw materials" },
  { id: "japandi", label: "Japandi", icon: "⛩", desc: "Zen harmony" },
];
const MORE_STYLES = [
  { id: "bohemian", label: "Bohemian", icon: "✦", desc: "Eclectic soul" },
  { id: "midcentury", label: "Mid-Century", icon: "◈", desc: "Retro modern" },
  { id: "coastal", label: "Coastal", icon: "≋", desc: "Beach vibes" },
  { id: "french", label: "French Country", icon: "❧", desc: "Rustic elegance" },
  { id: "artdeco", label: "Art Déco", icon: "◆", desc: "Bold geometry" },
  { id: "wabi", label: "Wabi-Sabi", icon: "○", desc: "Imperfect beauty" },
  {
    id: "contemporary",
    label: "Contemporary",
    icon: "▣",
    desc: "Current trends",
  },
  {
    id: "mediterranean",
    label: "Mediterranean",
    icon: "☀",
    desc: "Sun & terra",
  },
];
const ALL_STYLES = [...PRIMARY_STYLES, ...MORE_STYLES];

const PRESET_COLORS = [
  { id: "white", hex: "#FFFFFF", label: "White" },
  { id: "charcoal", hex: "#3D3D3D", label: "Charcoal" },
  { id: "lavender", hex: "#C4B5E0", label: "Lavender" },
  { id: "blush", hex: "#E8B4A0", label: "Blush" },
  { id: "mint", hex: "#96D5B8", label: "Mint" },
  { id: "sand", hex: "#D4B896", label: "Sand" },
  { id: "slate", hex: "#8FA3B1", label: "Slate Blue" },
  { id: "terracotta", hex: "#C1694F", label: "Terracotta" },
];

const CURATED_PALETTES = [
  {
    id: "nordic",
    name: "Nordic",
    colors: ["#F5F0EB", "#D4CFC9", "#8FA3B1", "#3D4A5C"],
    desc: "Cool Scandinavian neutrals",
  },
  {
    id: "japandi",
    name: "Japandi",
    colors: ["#F2EDE4", "#C8B8A2", "#7D6B5D", "#2C2416"],
    desc: "Warm wabi-sabi tones",
  },
  {
    id: "terracotta",
    name: "Terracota",
    colors: ["#F5ECD7", "#E8C49A", "#C1694F", "#6B3A2A"],
    desc: "Earthy mediterranean",
  },
  {
    id: "monochrome",
    name: "Monochrome",
    colors: ["#FFFFFF", "#B0B0B0", "#6B6B6B", "#1A1A1A"],
    desc: "Classic black & white",
  },
  {
    id: "forest",
    name: "Forest",
    colors: ["#F0EDE4", "#C5D5C0", "#6B8F71", "#2D4A35"],
    desc: "Natural greens",
  },
  {
    id: "dusty-rose",
    name: "Dusty Rose",
    colors: ["#FDF4F0", "#E8C4B8", "#C98B7D", "#7A4A42"],
    desc: "Soft feminine warmth",
  },
  {
    id: "coastal",
    name: "Coastal",
    colors: ["#F0F7FA", "#B8D4E8", "#5B9BB5", "#1A3D52"],
    desc: "Ocean-inspired blues",
  },
  {
    id: "desert",
    name: "Desert",
    colors: ["#FAF3E0", "#E8D5A3", "#C4A882", "#7D5A3C"],
    desc: "Warm sandy dunes",
  },
  {
    id: "midnight",
    name: "Midnight",
    colors: ["#1A1A2E", "#16213E", "#0F3460", "#E94560"],
    desc: "Bold dark drama",
  },
  {
    id: "sage",
    name: "Sage & Cream",
    colors: ["#F7F3EE", "#D4DDD0", "#8FA88A", "#4A5E47"],
    desc: "Muted botanical",
  },
];

const ROOM_TYPES = [
  { value: "living", label: "Living Room", Icon: Sofa },
  { value: "kitchen", label: "Kitchen", Icon: UtensilsCrossed },
  { value: "bedroom", label: "Bedroom", Icon: BedDouble },
  { value: "bathroom", label: "Bathroom", Icon: Bath },
  { value: "garden", label: "Garden / Patio", Icon: Trees },
  { value: "office", label: "Home Office", Icon: Monitor },
  { value: "library", label: "Library / Study", Icon: BookOpen },
  { value: "gym", label: "Home Gym", Icon: Dumbbell },
  { value: "cellar", label: "Wine Cellar", Icon: Wine },
  { value: "entry", label: "Entryway / Hall", Icon: Home },
];


interface Transform {
  scale: number;
  rotate: number;
  translateX: number;
  translateY: number;
}

interface Product {
  id: string;
  name: string;
  price: string;
  priceRaw: number;
  img: string;
  url: string;
  condition: string;
  category: string;
  categoryLabel: string;
  overBudget: boolean;
}
const DEFAULT_TRANSFORM: Transform = {
  scale: 1,
  rotate: 0,
  translateX: 0,
  translateY: 0,
};
const ZOOM_STEP = 0.15;

// ─── SKELETON CARD ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="aspect-[4/3] bg-muted animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-muted animate-pulse rounded w-4/5" />
        <div className="h-2.5 bg-muted animate-pulse rounded w-3/5" />
        <div className="h-4 bg-muted animate-pulse rounded w-2/5 mt-1" />
        <div className="flex gap-1.5 mt-3">
          <div className="h-7 bg-muted animate-pulse rounded flex-1" />
          <div className="h-7 bg-muted animate-pulse rounded flex-1" />
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function RoomRedesignPage() {
  const [activeStyle, setActiveStyle] = useState("minimalist");
  const [showMoreStyles, setShowMoreStyles] = useState(false);
  const [priorityProcessing, setPriorityProcessing] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [roomQuery, setRoomQuery] = useState("");
  const [roomFocused, setRoomFocused] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<
    (typeof ROOM_TYPES)[0] | null
  >(null);
  const roomRef = useRef<HTMLDivElement>(null);

  const [palette, setPalette] = useState<string[]>(["#FFFFFF"]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pickerColor, setPickerColor] = useState("#94a3b8");
  const [prompt, setPrompt] = useState("");
  const [maxPrice, setMaxPrice] = useState(500000);
  const [transformLevel, setTransformLevel] = useState<"simple" | "medium" | "complete">("medium");

  // Products state — reemplaza PRODUCTS hardcodeado
  const [withinBudget, setWithinBudget] = useState<Product[]>([]);
  const [overBudget, setOverBudget] = useState<Product[]>([]);
  const [budgetUsed, setBudgetUsed] = useState(0);
  const [budgetRemaining, setBudgetRemaining] = useState<number | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Cart — ahora usa string IDs de ML
  const [cart, setCart] = useState<string[]>([]);
  const toggleCart = (id: string) =>
    setCart((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  // Generate state
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!uploadedImage || !selectedRoom || !activeStyle) return;
    setIsGenerating(true);
    setHasGenerated(false);
    setWithinBudget([]);
    setOverBudget([]);
    setProductsError(null);

    try {
      const res = await fetch(`${window.location.origin}/api/search-products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style: activeStyle,
          roomType: selectedRoom.value,
          palette,
          prompt,
          maxPrice,
          transformLevel,
        }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);

      const data = await res.json();
      setWithinBudget(data.withinBudget ?? []);
      setOverBudget(data.overBudget ?? []);
      setBudgetUsed(data.budgetUsed ?? 0);
      setBudgetRemaining(data.budgetRemaining ?? null);
      setHasGenerated(true);
      setSliderX(50);
    } catch (err) {
      console.error("[handleGenerate] error:", err);
      setProductsError("No se pudieron cargar los productos. Intentá de nuevo.");
      setHasGenerated(true); // igual mostramos el estado generado
    } finally {
      setIsGenerating(false);
    }
  };

  // Canvas
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [transform, setTransform] = useState<Transform>(DEFAULT_TRANSFORM);

  // Slider — 0 = full original, 100 = full AI vision
  const [sliderX, setSliderX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });

  // Outside click for room dropdown
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (roomRef.current && !roomRef.current.contains(e.target as Node))
        setRoomFocused(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filteredRooms = ROOM_TYPES.filter((r) =>
    r.label.toLowerCase().includes(roomQuery.toLowerCase()),
  );
  const selectRoom = (room: (typeof ROOM_TYPES)[0]) => {
    setSelectedRoom(room);
    setRoomQuery(room.label);
    setRoomFocused(false);
  };

  const addCustomColor = () => {
    if (!palette.includes(pickerColor) && palette.length < 8)
      setPalette([...palette, pickerColor]);
    setShowColorPicker(false);
  };
  const addPresetColor = (hex: string) => {
    if (!palette.includes(hex) && palette.length < 8)
      setPalette([...palette, hex]);
    setShowColorPicker(false);
  };
  const removeColor = (c: string) => {
    if (palette.length > 1) setPalette(palette.filter((x) => x !== c));
  };

  // File
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setUploadedImage(base64);
      setTransform(DEFAULT_TRANSFORM);
      setHasGenerated(false);
      setIsGenerating(false);
      setSliderX(0);
    };
    reader.readAsDataURL(file);
  }, []);
  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };
  const triggerUpload = () => fileInputRef.current?.click();

  // Transforms
  const zoomIn = () =>
    setTransform((t) => ({
      ...t,
      scale: Math.min(5, +(t.scale + ZOOM_STEP).toFixed(2)),
    }));
  const zoomOut = () =>
    setTransform((t) => ({
      ...t,
      scale: Math.max(0.2, +(t.scale - ZOOM_STEP).toFixed(2)),
    }));
  const rotate = () =>
    setTransform((t) => ({ ...t, rotate: (t.rotate + 90) % 360 }));
  const fitView = () =>
    setTransform({ scale: 1, rotate: 0, translateX: 0, translateY: 0 });
  const resetView = () => setTransform(DEFAULT_TRANSFORM);
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.deltaY < 0 ? zoomIn() : zoomOut();
  };

  const onCanvasMouseDown = (e: React.MouseEvent) => {
    if (!uploadedImage) return;
    if ((e.target as HTMLElement).closest("[data-slider]")) return;
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
    panOrigin.current = { x: transform.translateX, y: transform.translateY };
  };
  const onCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDragging && sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setSliderX(x * 100);
    }
    if (isPanning.current) {
      setTransform((t) => ({
        ...t,
        translateX: panOrigin.current.x + (e.clientX - panStart.current.x),
        translateY: panOrigin.current.y + (e.clientY - panStart.current.y),
      }));
    }
  };
  const onCanvasMouseUp = () => {
    isPanning.current = false;
    setIsDragging(false);
  };
  const onSliderMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
  };

  // ── TAB BUTTONS now move slider to extremes ──────────────────────────────
  const handleTabClick = (tab: "original" | "rendered") => {
    if (tab === "original") {
      // Animate slider to 0 (show full original)
      setSliderX(0);
    } else {
      // Animate slider to 100 (show full AI)
      setSliderX(100);
    }
  };

  // Derived: which "tab" label is active based on slider position
  const activeTab =
    sliderX <= 10 ? "original" : sliderX >= 90 ? "rendered" : "split";

  // Dark mode — uses next-themes (class set on <html> by ThemeProvider)
  const { theme, setTheme } = useTheme();

  // Saved palettes
  const [savedPalettes, setSavedPalettes] = useState<
    { id: string; name: string; colors: string[] }[]
  >([]);
  const [showPalettePanel, setShowPalettePanel] = useState(false);
  const [paletteTab, setPaletteTab] = useState<"curated" | "saved">("curated");
  const [savePaletteName, setSavePaletteName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  const savePalette = () => {
    const name =
      savePaletteName.trim() || `Palette ${savedPalettes.length + 1}`;
    setSavedPalettes((prev) => [
      ...prev,
      { id: Date.now().toString(), name, colors: [...palette] },
    ]);
    setSavePaletteName("");
    setShowSaveInput(false);
  };
  const deleteSavedPalette = (id: string) =>
    setSavedPalettes((prev) => prev.filter((p) => p.id !== id));
  const applyPalette = (colors: string[]) => {
    setPalette(colors);
    setShowPalettePanel(false);
  };

  // Mock auth state (replace with real auth later)
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const mockUser = {
    name: "Lautaro",
    plan: "Free",
    rendersUsed: 1,
    rendersTotal: 2,
  };

  // History modal
  const [showHistory, setShowHistory] = useState(false);
  const mockHistory = [
    {
      id: 1,
      date: "2 hours ago",
      style: "Minimalist",
      room: "Living Room",
      thumb:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&q=60",
    },
    {
      id: 2,
      date: "Yesterday",
      style: "Japandi",
      room: "Bedroom",
      thumb:
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=200&q=60",
    },
    {
      id: 3,
      date: "3 days ago",
      style: "Industrial",
      room: "Kitchen",
      thumb:
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&q=60",
    },
  ];

  const visibleStyles = showMoreStyles ? ALL_STYLES : PRIMARY_STYLES;
  const activeStyleData = ALL_STYLES.find((s) => s.id === activeStyle);

  const transformStyle = {
    transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale}) rotate(${transform.rotate}deg)`,
    transition: isPanning.current ? "none" : "transform 0.15s ease",
    cursor: uploadedImage
      ? isPanning.current
        ? "grabbing"
        : "grab"
      : "default",
  };

  return (
    <TooltipProvider>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileInput}
      />

      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
        {/* ── TOP NAV ── */}
        <header className="flex items-center justify-between px-5 h-14 border-b border-border shrink-0 gap-4">
          {/* Left: brand + nav */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center rotate-45">
                <div className="w-3 h-3 bg-primary-foreground" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-sm tracking-tight">
                  DesignRefactor
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Optimize your space, shop the reality.
                </span>
              </div>
            </div>
            <Separator orientation="vertical" className="h-5" />
            {/* Nav links */}
            <nav className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1.5"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Gallery
              </Button>
              <Badge
                variant="secondary"
                className="text-[9px] h-4 px-1.5 ml-0.5 font-medium"
              >
                Editor
              </Badge>
            </nav>
          </div>

          {/* Center: render counter (only when logged in) */}
          {isLoggedIn && (
            <div className="flex items-center gap-2 bg-muted/60 border border-border rounded-lg px-3 py-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
              <div className="flex flex-col leading-none">
                <span className="text-[10px] text-muted-foreground">
                  Free renders
                </span>
                <span className="text-xs font-bold">
                  {mockUser.rendersUsed}/{mockUser.rendersTotal}
                  <span className="text-muted-foreground font-normal ml-1">
                    this month
                  </span>
                </span>
              </div>
              <div className="flex gap-0.5 ml-1">
                {Array.from({ length: mockUser.rendersTotal }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${i < mockUser.rendersUsed ? "bg-primary" : "bg-muted-foreground/30"}`}
                  />
                ))}
              </div>
              <Separator orientation="vertical" className="h-4 mx-1" />
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-[10px] px-1.5 text-primary font-semibold hover:bg-primary/10"
              >
                Upgrade ↗
              </Button>
            </div>
          )}

          {/* Right: actions + auth */}
          <div className="flex items-center gap-2 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  {sidebarOpen ? (
                    <PanelLeftClose className="w-4 h-4" />
                  ) : (
                    <PanelLeftOpen className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {sidebarOpen ? "Hide panel" : "Show panel"}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download result</TooltipContent>
            </Tooltip>

            {/* Dark mode toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                  <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </TooltipContent>
            </Tooltip>

            {/* Cart indicator */}
            {cart.length > 0 && (
              <div className="relative">
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <ShoppingCart className="w-4 h-4" />
                </Button>
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {cart.length}
                </span>
              </div>
            )}

            <Separator orientation="vertical" className="h-5 mx-1" />

            {/* Auth */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2 cursor-pointer group">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[11px] font-bold">
                  {mockUser.name[0]}
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-xs font-semibold">{mockUser.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {mockUser.plan} Plan
                  </span>
                </div>
                <ChevronDownIcon className="w-3 h-3 text-muted-foreground" />
              </div>
            ) : (
              <Button
                size="sm"
                className="gap-1.5 text-xs h-8"
                onClick={() => setIsLoggedIn(true)}
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign in
              </Button>
            )}
          </div>
        </header>

        {/* ── BODY ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* ── LEFT SIDEBAR ── */}
          <aside
            className={`shrink-0 border-r border-border flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${sidebarOpen ? "w-64 opacity-100" : "w-0 opacity-0 pointer-events-none border-r-0"}`}
          >
            <div className="flex flex-col gap-5 p-4 overflow-y-auto h-full w-64">
              {/* Upload */}
              <section>
                <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-2">
                  Input
                </p>
                <div
                  onClick={triggerUpload}
                  className="rounded-lg border border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 py-6 group"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Upload className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs text-center text-muted-foreground leading-snug px-3">
                    {uploadedImage
                      ? "Replace photo"
                      : "Drag and drop or click to upload room photo"}
                  </p>
                </div>
              </section>

              {/* Room Type */}
              <section>
                <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-2">
                  Room Type <span className="text-destructive">*</span>
                </p>
                <div ref={roomRef} className="relative">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                      className="pl-8 h-9 text-xs"
                      placeholder="e.g. Kitchen, Bedroom…"
                      value={roomQuery}
                      onChange={(e) => {
                        setRoomQuery(e.target.value);
                        setSelectedRoom(null);
                        setRoomFocused(true);
                      }}
                      onFocus={() => setRoomFocused(true)}
                    />
                    {roomQuery && (
                      <button
                        onClick={() => {
                          setRoomQuery("");
                          setSelectedRoom(null);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {roomFocused && filteredRooms.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                      {filteredRooms.map(({ value, label, Icon }) => (
                        <button
                          key={value}
                          onMouseDown={() => selectRoom({ value, label, Icon })}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-accent transition-colors text-left ${selectedRoom?.value === value ? "bg-accent" : ""}`}
                        >
                          <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {roomFocused && filteredRooms.length === 0 && roomQuery && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-xl z-50 p-3 text-xs text-muted-foreground">
                      No results for "{roomQuery}"
                    </div>
                  )}
                </div>
              </section>

              {/* Styles */}
              <section>
                <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-2">
                  Select Style
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {visibleStyles.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveStyle(s.id)}
                      className={`flex flex-col items-start gap-0.5 rounded-lg border px-2.5 py-2 text-left transition-all ${activeStyle === s.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent text-foreground"}`}
                    >
                      <span className="text-sm leading-none mb-0.5">
                        {s.icon}
                      </span>
                      <span className="text-[11px] font-semibold leading-none">
                        {s.label}
                      </span>
                      <span
                        className={`text-[9px] leading-none mt-0.5 ${activeStyle === s.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                      >
                        {s.desc}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowMoreStyles(!showMoreStyles)}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors py-1.5 rounded-md hover:bg-muted/50"
                >
                  {showMoreStyles ? (
                    <>
                      Show less <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      More styles <ChevronRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              </section>

              {/* Palette */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                    Color Palette
                  </p>
                  <button
                    onClick={() => setShowPalettePanel(!showPalettePanel)}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Palette className="w-3 h-3" />
                    Browse palettes
                  </button>
                </div>

                {/* Palette browser panel */}
                {showPalettePanel && (
                  <div className="mb-3 rounded-xl border border-border bg-card overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-border">
                      <button
                        onClick={() => setPaletteTab("curated")}
                        className={`flex-1 py-2 text-[11px] font-medium transition-colors ${paletteTab === "curated" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <Star className="w-3 h-3 inline mr-1" />
                        Curated
                      </button>
                      <button
                        onClick={() => setPaletteTab("saved")}
                        className={`flex-1 py-2 text-[11px] font-medium transition-colors ${paletteTab === "saved" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <Bookmark className="w-3 h-3 inline mr-1" />
                        Saved{" "}
                        {savedPalettes.length > 0 && (
                          <span className="ml-0.5 text-[10px] bg-primary/20 text-primary px-1 rounded">
                            {savedPalettes.length}
                          </span>
                        )}
                      </button>
                    </div>

                    <div className="p-2 max-h-52 overflow-y-auto flex flex-col gap-1.5">
                      {paletteTab === "curated" &&
                        CURATED_PALETTES.map((cp) => (
                          <button
                            key={cp.id}
                            onClick={() => applyPalette(cp.colors)}
                            className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-muted transition-colors text-left w-full group"
                          >
                            {/* Color strip */}
                            <div className="flex rounded overflow-hidden shrink-0 w-16 h-5 border border-border/50">
                              {cp.colors.map((c, i) => (
                                <div
                                  key={i}
                                  className="flex-1"
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-semibold text-foreground leading-none">
                                {cp.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                                {cp.desc}
                              </p>
                            </div>
                            <span className="text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              Apply
                            </span>
                          </button>
                        ))}

                      {paletteTab === "saved" && savedPalettes.length === 0 && (
                        <div className="py-4 text-center">
                          <BookmarkCheck className="w-6 h-6 text-muted-foreground/40 mx-auto mb-1.5" />
                          <p className="text-[11px] text-muted-foreground">
                            No saved palettes yet
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                            Build a palette and save it below
                          </p>
                        </div>
                      )}

                      {paletteTab === "saved" &&
                        savedPalettes.map((sp) => (
                          <div
                            key={sp.id}
                            className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-muted transition-colors group"
                          >
                            <div className="flex rounded overflow-hidden shrink-0 w-16 h-5 border border-border/50">
                              {sp.colors.map((c, i) => (
                                <div
                                  key={i}
                                  className="flex-1"
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                            <p className="text-[11px] font-semibold text-foreground flex-1 truncate">
                              {sp.name}
                            </p>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => applyPalette(sp.colors)}
                                className="text-[10px] text-primary hover:underline"
                              >
                                Apply
                              </button>
                              <span className="text-muted-foreground">·</span>
                              <button
                                onClick={() => deleteSavedPalette(sp.id)}
                                className="text-[10px] text-destructive hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Current palette dots */}
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  {palette.map((color) => (
                    <div key={color} className="relative group/dot">
                      <div
                        className="w-8 h-8 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-background cursor-default transition-transform hover:scale-105"
                        style={{
                          backgroundColor: color,
                          border:
                            color === "#FFFFFF"
                              ? "1px solid hsl(var(--border))"
                              : "none",
                        }}
                      />
                      {palette.length > 1 && (
                        <button
                          onClick={() => removeColor(color)}
                          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-destructive text-white hidden group-hover/dot:flex items-center justify-center"
                        >
                          <X className="w-2 h-2" />
                        </button>
                      )}
                    </div>
                  ))}
                  {/* Add single color */}
                  <div className="relative">
                    <button
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="w-8 h-8 rounded-full border-2 border-dashed border-border flex items-center justify-center hover:border-primary transition-colors text-muted-foreground hover:text-primary"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    {showColorPicker && (
                      <div className="absolute left-0 top-10 z-50 bg-popover border border-border rounded-xl shadow-2xl p-3 w-52">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                            Add Color
                          </p>
                          <button
                            onClick={() => setShowColorPicker(false)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1.5">
                          Quick picks
                        </p>
                        <div className="flex gap-1.5 flex-wrap mb-3">
                          {PRESET_COLORS.map((p) => (
                            <Tooltip key={p.id}>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => addPresetColor(p.hex)}
                                  className={`w-7 h-7 rounded-full transition-transform hover:scale-110 active:scale-95 ${palette.includes(p.hex) ? "ring-2 ring-primary ring-offset-1 ring-offset-popover" : ""}`}
                                  style={{
                                    backgroundColor: p.hex,
                                    border:
                                      p.hex === "#FFFFFF"
                                        ? "1px solid hsl(var(--border))"
                                        : "none",
                                  }}
                                />
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                {p.label}
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1.5">
                          Custom
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={pickerColor}
                            onChange={(e) => setPickerColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer p-0 border-0 bg-transparent"
                          />
                          <span className="text-xs font-mono text-muted-foreground flex-1 uppercase">
                            {pickerColor}
                          </span>
                          <Button
                            size="sm"
                            className="h-7 text-xs px-2.5"
                            onClick={addCustomColor}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview bar + save button */}
                {palette.length > 0 && (
                  <div>
                    <div className="flex rounded-t-md overflow-hidden h-4 border border-b-0 border-border/50">
                      {palette.map((color, i) => (
                        <div
                          key={i}
                          className="flex-1"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    {/* Save palette row */}
                    {!showSaveInput ? (
                      <button
                        onClick={() => setShowSaveInput(true)}
                        className="w-full flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground hover:text-primary transition-colors py-1.5 rounded-b-md border border-border/50 border-t-0 hover:bg-muted/40"
                      >
                        <Bookmark className="w-3 h-3" />
                        Save this palette
                      </button>
                    ) : (
                      <div className="flex gap-1 border border-border/50 border-t-0 rounded-b-md p-1.5">
                        <input
                          autoFocus
                          value={savePaletteName}
                          onChange={(e) => setSavePaletteName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") savePalette();
                            if (e.key === "Escape") setShowSaveInput(false);
                          }}
                          placeholder="Palette name…"
                          className="flex-1 text-[11px] bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/60 px-1"
                        />
                        <Button
                          size="sm"
                          className="h-6 text-[10px] px-2"
                          onClick={savePalette}
                        >
                          Save
                        </Button>
                        <button
                          onClick={() => setShowSaveInput(false)}
                          className="text-muted-foreground hover:text-foreground px-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Prompt */}
              <section>
                <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-2">
                  Prompt
                </p>
                <div className="relative">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the vibe… warm lighting, exposed wood beams, large plants, cozy reading nook"
                    className="text-xs resize-none min-h-[88px] pr-9 leading-relaxed placeholder:text-muted-foreground/60"
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="absolute bottom-2.5 right-2.5 text-muted-foreground hover:text-primary transition-colors">
                        <Wand2 className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Enhance with AI</TooltipContent>
                  </Tooltip>
                </div>
                {prompt && (
                  <p className="text-[10px] text-muted-foreground mt-1 text-right">
                    {prompt.length} chars
                  </p>
                )}

                {/* Max Price Input */}
                <div className="mt-4">
                  <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-2">
                    Precio Máximo
                  </p>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none">
                      ARS $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={
                        maxPrice === 0 ? "" : maxPrice.toLocaleString("es-AR")
                      }
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        setMaxPrice(raw === "" ? 0 : Number(raw));
                      }}
                      placeholder="ej: 2.500.000"
                      className="w-full h-9 rounded-md border border-input bg-background pl-12 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                    />
                  </div>
                  {/* Quick picks */}
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {[
                      { label: "500k", value: 500000 },
                      { label: "1M", value: 1000000 },
                      { label: "3M", value: 3000000 },
                      { label: "Sin límite", value: 0 },
                    ].map((tier) => (
                      <button
                        key={tier.label}
                        onClick={() => setMaxPrice(tier.value)}
                        className={`px-2 py-0.5 rounded-full border text-[10px] font-medium transition-all ${
                          maxPrice === tier.value
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        {tier.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transformation Level */}
                <div className="mt-4">
                  <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-2">
                    Nivel de transformación
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {[
                      {
                        id: "simple" as const,
                        label: "Simple",
                        icon: "◎",
                        desc: "Solo accesorios y decoración",
                        detail: "Plantas, textiles, cuadros, objetos",
                      },
                      {
                        id: "medium" as const,
                        label: "Mediana",
                        icon: "◑",
                        desc: "Muebles medianos + accesorios",
                        detail: "Lámparas, sillas, alfombras, pintura",
                      },
                      {
                        id: "complete" as const,
                        label: "Completa",
                        icon: "●",
                        desc: "Todo, incluso lo fijo",
                        detail: "Electrodomésticos, muebles grandes, obra",
                      },
                    ].map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setTransformLevel(level.id)}
                        className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all ${
                          transformLevel === level.id
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border bg-card hover:bg-accent text-foreground"
                        }`}
                      >
                        <span className={`text-base leading-none mt-0.5 shrink-0 ${transformLevel === level.id ? "text-primary" : "text-muted-foreground"}`}>
                          {level.icon}
                        </span>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-[11px] font-semibold leading-none">
                            {level.label}
                          </span>
                          <span className={`text-[10px] leading-snug ${transformLevel === level.id ? "text-foreground/70" : "text-muted-foreground"}`}>
                            {level.desc}
                          </span>
                          <span className={`text-[9px] leading-snug mt-0.5 ${transformLevel === level.id ? "text-primary/80" : "text-muted-foreground/60"}`}>
                            {level.detail}
                          </span>
                        </div>
                        {transformLevel === level.id && (
                          <div className="ml-auto shrink-0 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center mt-0.5">
                            <Check className="w-2 h-2 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate button with validation */}
                {(() => {
                  const hasImage = !!uploadedImage;
                  const hasStyle = !!activeStyle;
                  const hasColor = palette.length > 0;
                  const hasRoom = !!selectedRoom;
                  const canGen = hasImage && hasStyle && hasColor && hasRoom;
                  const missing = [
                    !hasImage && "image",
                    !hasRoom && "room type",
                    !hasStyle && "style",
                    !hasColor && "color",
                  ]
                    .filter(Boolean)
                    .join(", ");
                  return (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="mt-3">
                          <Button
                            className="w-full gap-2 font-semibold"
                            disabled={!canGen || isGenerating}
                            onClick={canGen ? handleGenerate : undefined}
                          >
                            {isGenerating ? (
                              <>
                                <svg
                                  className="w-4 h-4 animate-spin"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"
                                  />
                                </svg>
                                Generating…
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                {hasGenerated
                                  ? "Re-generate"
                                  : "Generate Redesign"}
                              </>
                            )}
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {!canGen && !isGenerating && (
                        <TooltipContent
                          side="right"
                          className="max-w-[180px] text-center"
                        >
                          <p className="text-xs">
                            Missing:{" "}
                            <span className="font-semibold text-destructive">
                              {missing}
                            </span>
                          </p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })()}
              </section>

              <div className="mt-auto flex flex-col gap-3">
                <Separator />

                {/* Transform level */}
                <section>
                  <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-2">Nivel de transformación</p>
                  <div className="grid grid-cols-3 gap-1">
                    {(["simple", "medium", "complete"] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setTransformLevel(lvl)}
                        className={`py-1.5 rounded-md text-[11px] font-medium border transition-all ${transformLevel === lvl ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
                      >
                        {lvl === "simple" ? "Simple" : lvl === "medium" ? "Medio" : "Total"}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    {transformLevel === "simple" && "Solo decoración y textiles"}
                    {transformLevel === "medium" && "Muebles + iluminación + deco"}
                    {transformLevel === "complete" && "Renovación completa del ambiente"}
                  </p>
                </section>

                {/* Max budget */}
                <section>
                  <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-2">Presupuesto máximo</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground shrink-0">ARS $</span>
                    <input
                      type="number"
                      value={maxPrice === 0 ? "" : maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value) || 0)}
                      placeholder="Sin límite"
                      className="flex-1 text-xs bg-muted/30 border border-border rounded-md px-2 py-1.5 outline-none focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground/60"
                    />
                  </div>
                  {maxPrice > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Límite: ARS ${maxPrice.toLocaleString("es-AR")}
                    </p>
                  )}
                </section>

                <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                    <Label htmlFor="priority" className="text-xs font-medium cursor-pointer">
                      Priority Processing
                    </Label>
                  </div>
                  <Switch id="priority" checked={priorityProcessing} onCheckedChange={setPriorityProcessing} />
                </div>
              </div>
            </div>
          </aside>

          {/* ── CENTER CANVAS ── */}
          <main className="flex-1 flex flex-col overflow-hidden bg-muted/20 min-w-0">
            {/* Canvas toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background/80 backdrop-blur-sm shrink-0">
              {/* Tab switcher — controls slider position */}
              <div className="flex gap-1 bg-muted rounded-lg p-0.5">
                <button
                  onClick={() => handleTabClick("original")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === "original" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Original
                </button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => hasGenerated && setSliderX(50)}
                      disabled={!hasGenerated}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${!hasGenerated ? "opacity-30 cursor-not-allowed" : activeTab === "split" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Split
                    </button>
                  </TooltipTrigger>
                  {!hasGenerated && (
                    <TooltipContent>Generate first to compare</TooltipContent>
                  )}
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => hasGenerated && handleTabClick("rendered")}
                      disabled={!hasGenerated}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${!hasGenerated ? "opacity-30 cursor-not-allowed" : activeTab === "rendered" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      AI Rendered
                    </button>
                  </TooltipTrigger>
                  {!hasGenerated && (
                    <TooltipContent>
                      Generate first to see AI result
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>

              <div className="flex items-center gap-2">
                {activeStyleData && (
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <span>{activeStyleData.icon}</span>
                    {activeStyleData.label}
                  </Badge>
                )}
                {selectedRoom && (
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <selectedRoom.Icon className="w-3 h-3" />
                    {selectedRoom.label}
                  </Badge>
                )}
                {uploadedImage && (
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {Math.round(transform.scale * 100)}%
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs h-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowHistory(true)}
                >
                  <History className="w-3.5 h-3.5" />
                  History{" "}
                  {mockHistory.length > 0 && (
                    <span className="ml-0.5 text-[10px] bg-muted px-1 rounded">
                      {mockHistory.length}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* ── CANVAS AREA ── */}
            <div
              ref={sliderRef}
              className={`relative flex-1 overflow-hidden select-none ${isDragOver ? "border-2 border-dashed border-primary/50" : ""} ${!uploadedImage ? "flex items-center justify-center" : ""}`}
              onWheel={uploadedImage ? onWheel : undefined}
              onMouseDown={onCanvasMouseDown}
              onMouseMove={onCanvasMouseMove}
              onMouseUp={onCanvasMouseUp}
              onMouseLeave={onCanvasMouseUp}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={onDrop}
            >
              {/* Empty state */}
              {!uploadedImage && (
                <div className="flex flex-col items-center justify-center gap-5 p-8 text-center pointer-events-none">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                      <Upload className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">
                      No image uploaded
                    </p>
                    <p className="text-xs text-muted-foreground max-w-[260px] leading-relaxed">
                      Drag and drop a room photo here, or use the upload area on
                      the left panel
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 pointer-events-auto"
                    onClick={triggerUpload}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Choose photo
                  </Button>
                  <p className="text-[10px] text-muted-foreground/60">
                    Supports JPG, PNG, WEBP
                  </p>
                </div>
              )}

              {/* Image with compare slider */}
              {uploadedImage && (
                <>
                  {/* Background = original (right side / grayscale) */}
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[repeating-conic-gradient(hsl(var(--muted))_0%_25%,transparent_0%_50%)] bg-[length:20px_20px]">
                    <img
                      src={uploadedImage}
                      alt="Original"
                      draggable={false}
                      style={transformStyle}
                      className="max-w-none grayscale"
                    />
                  </div>
                  {/* Badge right */}
                  <div className="absolute top-3 right-3 pointer-events-none z-10">
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-bold tracking-widest uppercase"
                    >
                      Original
                    </Badge>
                  </div>

                  {/* Foreground = AI rendered (left side, clipped by sliderX) */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{
                      width: `${sliderX}%`,
                      transition: isDragging
                        ? "none"
                        : "width 0.35s cubic-bezier(0.4,0,0.2,1)",
                    }}
                  >
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-[repeating-conic-gradient(hsl(var(--muted))_0%_25%,transparent_0%_50%)] bg-[length:20px_20px]"
                      style={{
                        width: sliderX > 0 ? `${10000 / sliderX}%` : "100%",
                      }}
                    >
                      <img
                        src={uploadedImage}
                        alt="AI Rendered"
                        draggable={false}
                        style={transformStyle}
                        className="max-w-none"
                      />
                    </div>
                    {sliderX > 15 && (
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <Badge className="text-[10px] font-bold tracking-widest uppercase bg-primary text-primary-foreground">
                          AI Vision
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Slider line + handle — only visible when between extremes */}
                  {sliderX > 2 && sliderX < 98 && (
                    <div
                      data-slider
                      className="absolute top-0 bottom-0 w-0.5 bg-white/90 z-20"
                      style={{
                        left: `${sliderX}%`,
                        transition: isDragging
                          ? "none"
                          : "left 0.35s cubic-bezier(0.4,0,0.2,1)",
                      }}
                      onMouseDown={onSliderMouseDown}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex flex-col items-center justify-center border border-border/30 cursor-col-resize">
                        <ChevronUp className="w-3 h-3 text-gray-600 -mb-1" />
                        <ChevronDown className="w-3 h-3 text-gray-600" />
                      </div>
                    </div>
                  )}

                  {/* Replace image button */}
                  <button
                    onClick={triggerUpload}
                    className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm border border-border rounded-lg px-2.5 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-background transition-all shadow-sm"
                  >
                    <Upload className="w-3 h-3" />
                    Replace image
                  </button>
                </>
              )}

              {/* Generating overlay on canvas */}
              {isGenerating && uploadedImage && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/60 backdrop-blur-sm pointer-events-none">
                  <div className="flex flex-col items-center gap-3 bg-background/90 border border-border rounded-2xl px-8 py-6 shadow-2xl">
                    <svg
                      className="w-8 h-8 text-primary animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-foreground">
                        Generating redesign…
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        AI is transforming your room
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Drag overlay */}
              {isDragOver && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary pointer-events-none">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-primary" />
                    <p className="text-sm font-semibold text-primary">
                      Drop to upload
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── BOTTOM TOOLBAR ── */}
            <div className="flex items-center justify-center px-4 py-2.5 border-t border-border bg-background/80 shrink-0 gap-4">
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={zoomOut}
                      disabled={!uploadedImage}
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom Out</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={zoomIn}
                      disabled={!uploadedImage}
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom In</TooltipContent>
                </Tooltip>
                <Separator orientation="vertical" className="h-4 mx-0.5" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={rotate}
                      disabled={!uploadedImage}
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Rotate 90°</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={fitView}
                      disabled={!uploadedImage}
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Fit to screen</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={resetView}
                      disabled={!uploadedImage}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reset view</TooltipContent>
                </Tooltip>
              </div>
              {uploadedImage && (
                <div className="flex items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {Math.round(transform.scale * 100)}%
                    {transform.rotate !== 0 && (
                      <span className="ml-1 text-primary">
                        {transform.rotate}°
                      </span>
                    )}
                  </span>
                  <button
                    onClick={resetView}
                    className="text-[10px] text-muted-foreground hover:text-foreground border-l border-border pl-1.5 transition-colors"
                  >
                    reset
                  </button>
                </div>
              )}
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between px-4 py-1.5 border-t border-border bg-background shrink-0">
              <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                  System Ready
                </span>
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3 h-3" />
                  GPU: A100 Cloud Compute
                </span>
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3 h-3" />
                  Resolution: 4K UHD Optimized
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                © 2024 DesignRefactor
              </span>
            </div>
          </main>

          <aside className="w-72 shrink-0 border-l border-border flex flex-col min-h-0">
            <div className="px-4 pt-4 pb-3 border-b border-border shrink-0">
              <div className="flex items-center gap-2 mb-0.5">
                <ShoppingBag className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-sm">Shop the Look</h2>
                {cart.length > 0 && (
                  <Badge className="ml-auto text-[10px] h-5 px-1.5">
                    {cart.length} in cart
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {hasGenerated
                  ? `${withinBudget.length + overBudget.length} productos encontrados en Mercado Libre`
                  : "Upload a photo to discover matching products"}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 min-h-0">
              {/* State: no image uploaded */}
              {!uploadedImage && (
                <>
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 flex flex-col items-center gap-2.5 text-center mb-1">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <SparklesIcon className="w-5 h-5 text-primary/60" />
                    </div>
                    <p className="text-xs font-semibold text-foreground leading-snug">
                      Products for your redesign
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Upload a room photo and we'll match furniture & decor to
                      complete your redesign
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs mt-1 h-7"
                      onClick={triggerUpload}
                    >
                      <Upload className="w-3 h-3" />
                      Upload photo
                    </Button>
                  </div>
                  {[1, 2, 3].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </>
              )}

              {/* State: image uploaded but not yet generated */}
              {uploadedImage && !hasGenerated && !isGenerating && (
                <>
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 flex flex-col items-center gap-2.5 text-center mb-1">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <SparklesIcon className="w-5 h-5 text-primary/60" />
                    </div>
                    <p className="text-xs font-semibold text-foreground leading-snug">
                      Ready to redesign
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Press{" "}
                      <span className="font-semibold text-foreground">
                        Generate Redesign
                      </span>{" "}
                      to discover matching furniture & decor for your room
                    </p>
                  </div>
                  {[1, 2, 3].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </>
              )}

              {/* State: currently generating */}
              {isGenerating && (
                <>
                  <div className="rounded-xl border border-border bg-muted/20 p-4 flex flex-col items-center gap-2.5 text-center mb-1">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-primary animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-foreground">
                      Analyzing your room…
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Matching products to your style
                    </p>
                  </div>
                  {[1, 2, 3].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </>
              )}

              {/* Error state */}
              {hasGenerated && productsError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center">
                  <p className="text-xs text-destructive">{productsError}</p>
                </div>
              )}

              {/* Productos dentro del presupuesto */}
              {hasGenerated && withinBudget.map((product) => {
                const inCart = cart.includes(product.id);
                return (
                  <div
                    key={product.id}
                    className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all group flex flex-col"
                  >
                    {/* Category badge */}
                    <div className="px-3 pt-2.5">
                      <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {product.categoryLabel}
                      </span>
                    </div>
                    <div className="relative w-full h-36 overflow-hidden bg-muted mx-0">
                      <img
                        src={product.img}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {inCart && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 p-3 pb-4 gap-0 bg-card">
                      <div>
                        <p className="text-xs font-semibold text-card-foreground leading-snug line-clamp-2">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 mb-1.5 capitalize">
                          {product.condition === "new" ? "Nuevo" : "Usado"}
                        </p>
                        <p className="text-sm font-bold text-card-foreground mb-3">
                          {product.price}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-auto">
                        <Button
                          size="sm"
                          variant={inCart ? "default" : "outline"}
                          className="h-9 text-xs gap-1 w-full"
                          onClick={() => toggleCart(product.id)}
                        >
                          {inCart ? (
                            <><Check className="w-3 h-3" /> Added</>
                          ) : (
                            <><ShoppingCart className="w-3 h-3" /> Add cart</>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          className="h-9 text-xs gap-1 w-full bg-yellow-400 hover:bg-yellow-300 text-yellow-950 font-semibold"
                          onClick={() => window.open(product.url, "_blank")}
                        >
                          <ExternalLink className="w-3 h-3" />
                          Ver en ML
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Separador overBudget */}
              {hasGenerated && overBudget.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex-1 h-px bg-destructive/20" />
                  <span className="text-[10px] font-semibold text-destructive uppercase tracking-widest whitespace-nowrap">
                    Supera el presupuesto
                  </span>
                  <div className="flex-1 h-px bg-destructive/20" />
                </div>
              )}

              {/* Productos fuera del presupuesto */}
              {hasGenerated && overBudget.map((product) => {
                const inCart = cart.includes(product.id);
                return (
                  <div
                    key={product.id}
                    className="rounded-xl border border-destructive/30 bg-card overflow-hidden transition-all group flex flex-col opacity-80"
                  >
                    <div className="px-3 pt-2.5 flex items-center justify-between">
                      <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {product.categoryLabel}
                      </span>
                      <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-full">
                        Fuera de presupuesto
                      </span>
                    </div>
                    <div className="relative w-full h-36 overflow-hidden bg-muted">
                      <img
                        src={product.img}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale-[30%]"
                      />
                    </div>
                    <div className="flex flex-col flex-1 p-3 pb-4 bg-card">
                      <p className="text-xs font-semibold text-card-foreground leading-snug line-clamp-2">
                        {product.name}
                      </p>
                      <p className="text-sm font-bold text-destructive mt-1 mb-3">
                        {product.price}
                      </p>
                      <Button
                        size="sm"
                        className="h-9 text-xs gap-1 w-full bg-yellow-400 hover:bg-yellow-300 text-yellow-950 font-semibold"
                        onClick={() => window.open(product.url, "_blank")}
                      >
                        <ExternalLink className="w-3 h-3" />
                        Ver en ML
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Budget footer */}
            {uploadedImage && hasGenerated && (
              <div className="shrink-0 border-t border-border p-3 bg-background">
                {/* Budget used */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Total dentro del presupuesto</span>
                  <span className="text-sm font-bold text-foreground">
                    ARS ${budgetUsed.toLocaleString("es-AR")}
                  </span>
                </div>
                {budgetRemaining !== null && (
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] text-muted-foreground">Presupuesto restante</span>
                    <span className={`text-xs font-semibold ${budgetRemaining > 0 ? "text-emerald-500" : "text-destructive"}`}>
                      ARS ${budgetRemaining.toLocaleString("es-AR")}
                    </span>
                  </div>
                )}
                {/* Cart total */}
                {cart.length > 0 && (
                  <div className="flex items-center justify-between mb-2.5 py-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      {cart.length} item{cart.length > 1 ? "s" : ""} en carrito
                    </span>
                    <span className="text-sm font-bold text-primary">
                      ARS $
                      {[...withinBudget, ...overBudget]
                        .filter((p) => cart.includes(p.id))
                        .reduce((sum, p) => sum + p.priceRaw, 0)
                        .toLocaleString("es-AR")}
                    </span>
                  </div>
                )}
                <Button
                  className="w-full gap-2 font-semibold"
                  onClick={() =>
                    withinBudget.forEach((p) => !cart.includes(p.id) && toggleCart(p.id))
                  }
                  disabled={withinBudget.every((p) => cart.includes(p.id))}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {withinBudget.every((p) => cart.includes(p.id))
                    ? "Todo en el carrito ✓"
                    : "Guardar todo en carrito"}
                </Button>
                <p className="text-[10px] text-muted-foreground text-center mt-2">
                  Los precios son referenciales y pueden variar en ML
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* ── VERSION HISTORY MODAL ── */}
      {showHistory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={() => setShowHistory(false)}
        >
          <div
            className="bg-background border border-border rounded-2xl shadow-2xl w-[520px] max-h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-sm">Design History</h2>
                <Badge variant="secondary" className="text-[10px]">
                  {mockHistory.length} renders
                </Badge>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* History grid */}
            <div className="overflow-y-auto p-4 flex flex-col gap-3">
              {mockHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors p-3 cursor-pointer group"
                >
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                    <img
                      src={item.thumb}
                      alt={item.style}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">
                      {item.style} · {item.room}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {item.date}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs px-2.5"
                    >
                      Load
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal footer */}
            <div className="px-5 py-3 border-t border-border flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">
                Free plan: history kept for 7 days
              </p>
              <Button size="sm" className="gap-1.5 text-xs h-7">
                <Sparkles className="w-3 h-3" />
                Upgrade for unlimited
              </Button>
            </div>
          </div>
        </div>
      )}
    </TooltipProvider>
  );
}