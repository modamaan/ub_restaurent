"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MenuCategory, MenuItem } from "@/lib/menu-data";
import { RESTAURANT_CONFIG } from "@/lib/config";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type ModalMode = "add-item" | "edit-item" | "add-category" | null;

const EMPTY_ITEM: Omit<MenuItem, "id"> = {
    name: "",
    description: "",
    price: 0,
    image: "",
    available: true,
    isVeg: true,
};

export default function AdminDashboard() {
    const router = useRouter();
    const [menu, setMenu] = useState<MenuCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [editCatId, setEditCatId] = useState("");
    const [editItemId, setEditItemId] = useState("");
    const [itemForm, setItemForm] = useState<Omit<MenuItem, "id">>(EMPTY_ITEM);
    const [priceStr, setPriceStr] = useState("0");
    const [newCatName, setNewCatName] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isNavOpen, setIsNavOpen] = useState(false);
    const [bannerMode, setBannerMode] = useState(false);
    const [banners, setBanners] = useState<(string | null)[]>([null, null, null, null]);
    const [bannerUploadingMap, setBannerUploadingMap] = useState<Record<number, boolean>>({});

    // ── Video State ──
    const [videoMode, setVideoMode] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string>("");
    const [videoUploading, setVideoUploading] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && sessionStorage.getItem("admin_auth") !== "true") {
            router.push("/admin"); return;
        }
        fetch("/api/admin/menu")
            .then((r) => r.json())
            .then((d) => { setMenu(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [router]);

    async function persist(updated: MenuCategory[]) {
        setSaving(true);
        await fetch("/api/admin/menu", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated),
        });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    }

    const genId = () => Math.random().toString(36).slice(2, 8);

    function openAdd(catId: string) {
        setEditCatId(catId);
        setItemForm({ ...EMPTY_ITEM });
        setPriceStr("");
        setUploadError("");
        setModalMode("add-item");
    }

    function openEdit(catId: string, item: MenuItem) {
        setEditCatId(catId);
        setEditItemId(item.id);
        setUploadError("");
        setItemForm({
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image,
            available: item.available,
            isVeg: item.isVeg,
        });
        setPriceStr(String(item.price));
        setModalMode("edit-item");
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadError("");
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? "Upload failed");
            setItemForm((prev) => ({ ...prev, image: json.url }));
        } catch (err: unknown) {
            setUploadError(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    function submitItem() {
        if (!itemForm.name.trim()) return;
        const finalForm = { ...itemForm, price: parseFloat(priceStr) || 0 };
        const updated =
            modalMode === "add-item"
                ? menu.map((c) =>
                    c.id === editCatId
                        ? { ...c, items: [...c.items, { ...finalForm, id: genId() }] }
                        : c
                )
                : menu.map((c) =>
                    c.id === editCatId
                        ? {
                            ...c,
                            items: c.items.map((it) =>
                                it.id === editItemId ? { ...finalForm, id: editItemId } : it
                            ),
                        }
                        : c
                );
        setMenu(updated);
        persist(updated);
        setModalMode(null);
    }

    function delItem(catId: string, itemId: string) {
        if (!confirm("Delete this item?")) return;
        const updated = menu.map((c) =>
            c.id === catId ? { ...c, items: c.items.filter((it) => it.id !== itemId) } : c
        );
        setMenu(updated);
        persist(updated);
    }

    function setAvail(catId: string, itemId: string, avail: boolean) {
        const updated = menu.map((c) =>
            c.id === catId
                ? { ...c, items: c.items.map((it) => (it.id === itemId ? { ...it, available: avail } : it)) }
                : c
        );
        setMenu(updated);
        persist(updated);
    }

    function submitCat() {
        if (!newCatName.trim()) return;
        const updated = [...menu, { id: genId(), name: newCatName.trim(), items: [] }];
        setMenu(updated);
        persist(updated);
        setNewCatName("");
        setModalMode(null);
    }

    function delCat(catId: string) {
        if (!confirm("Delete this category and all items?")) return;
        const updated = menu.filter((c) => c.id !== catId);
        setMenu(updated);
        persist(updated);
    }

    // ── Banners ───────────────────────────────────────────────
    async function openBannerModal() {
        setBannerMode(true);
        try {
            const res = await fetch("/api/admin/banners");
            const data = await res.json();
            if (Array.isArray(data)) setBanners(data);
        } catch {
            console.error("Failed to fetch banners");
        }
    }

    async function handleBannerUpload(slot: number, e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setBannerUploadingMap(prev => ({ ...prev, [slot]: true }));
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
            const json = await res.json();
            if (!res.ok) throw new Error("Upload failed");
            setBanners(prev => prev.map((b, i) => i === slot ? json.url : b));
        } catch {
            alert("Failed to upload image");
        } finally {
            setBannerUploadingMap(prev => ({ ...prev, [slot]: false }));
            e.target.value = "";
        }
    }

    async function saveBanners() {
        setSaving(true);
        try {
            await fetch("/api/admin/banners", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ images: banners }),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
            setBannerMode(false);
        } catch {
            alert("Failed to save banners");
        }
        setSaving(false);
    }

    // ── Banner Video ──────────────────────────────────────────────
    async function openVideoModal() {
        setVideoMode(true);
        try {
            const res = await fetch("/api/admin/settings?key=hero_video_url");
            const data = await res.json();
            if (data.value) setVideoUrl(data.value);
        } catch {
            console.error("Failed to fetch banner video url");
        }
    }

    async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setVideoUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
            const json = await res.json();
            if (!res.ok) throw new Error("Upload failed");
            setVideoUrl(json.url);
        } catch {
            alert("Failed to upload video");
        } finally {
            setVideoUploading(false);
            e.target.value = "";
        }
    }

    async function saveVideoUrl() {
        setSaving(true);
        try {
            await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: "hero_video_url", value: videoUrl }),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
            setVideoMode(false);
        } catch {
            alert("Failed to save banner video");
        }
        setSaving(false);
    }

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400 text-lg">
                Loading…
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Saved toast */}
            {saved && (
                <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg">
                    ✅ Menu saved!
                </div>
            )}

            {/* Topbar */}
            <div
                className="text-white px-6 py-4 flex items-center justify-between gap-3 relative"
                style={{ background: "linear-gradient(135deg, #1a0a00, #3d1200)" }}
            >
                <div>
                    <h1 className="text-lg font-extrabold">Admin Dashboard</h1>
                    <p className="text-xs" style={{ color: "#fecba8" }}>
                        {RESTAURANT_CONFIG.fullName}
                    </p>
                </div>

                {/* Desktop Nav */}
                <div className="hidden sm:flex gap-2 items-center flex-wrap">
                    <Button variant="outline" size="sm" asChild
                        className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">
                        <Link href="/" target="_blank">👁 Preview Menu</Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={openBannerModal}
                        className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">
                        🖼 Banner Image
                    </Button>
                    <Button variant="outline" size="sm" onClick={openVideoModal}
                        className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">
                        🎥 Banner Video
                    </Button>
                    <Button size="sm" onClick={() => setModalMode("add-category")}
                        className="rounded-full text-white" style={{ background: "#e8500a" }}>
                        + Add Category
                    </Button>
                    <Button variant="outline" size="sm"
                        className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                        onClick={() => { sessionStorage.removeItem("admin_auth"); router.push("/admin"); }}>
                        Logout
                    </Button>
                </div>

                {/* Mobile Toggle */}
                <div className="sm:hidden">
                    <button
                        onClick={() => setIsNavOpen(!isNavOpen)}
                        className="text-white p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <span className="text-xl leading-none">☰</span>
                    </button>
                </div>

                {/* Mobile Dropdown */}
                {isNavOpen && (
                    <div className="absolute top-full right-4 mt-2 w-48 bg-white rounded-xl shadow-xl overflow-hidden z-50 border border-gray-100 flex flex-col sm:hidden">
                        <Link href="/" target="_blank" className="px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 font-medium border-b border-gray-50 flex items-center gap-2">
                            👁 Preview Menu
                        </Link>
                        <button onClick={() => { setIsNavOpen(false); openBannerModal(); }} className="px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 font-medium border-b border-gray-50 flex items-center gap-2 text-left w-full">
                            🖼 Banner Image
                        </button>
                        <button onClick={() => { setIsNavOpen(false); openVideoModal(); }} className="px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 font-medium border-b border-gray-50 flex items-center gap-2 text-left w-full">
                            🎥 Banner Video
                        </button>
                        <button onClick={() => { setIsNavOpen(false); setModalMode("add-category"); }} className="px-4 py-3 text-sm hover:bg-orange-50 font-medium border-b border-gray-50 flex items-center gap-2 text-left w-full" style={{ color: "#e8500a" }}>
                            + Add Category
                        </button>
                        <button onClick={() => { sessionStorage.removeItem("admin_auth"); router.push("/admin"); }} className="px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 text-left w-full">
                            Logout
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800">📋 Menu Items</h2>
                    {saving && <span className="text-sm text-gray-400">Saving…</span>}
                </div>

                {menu.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-4xl mb-3">📂</p>
                        <p>No categories yet. Click <strong>+ Add Category</strong> to start.</p>
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    {menu.map((cat) => (
                        <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            {/* Category header */}
                            <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50 border-b border-gray-100">
                                <span className="font-bold text-gray-800">{cat.name}</span>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => openAdd(cat.id)}
                                        className="text-white rounded-lg" style={{ background: "#e8500a" }}>
                                        + Add Item
                                    </Button>
                                    <Button size="sm" variant="outline"
                                        className="rounded-lg text-red-500 border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-600"
                                        onClick={() => delCat(cat.id)}>
                                        Delete
                                    </Button>
                                </div>
                            </div>

                            {cat.items.length === 0 && (
                                <p className="px-5 py-4 text-sm text-gray-400">No items yet.</p>
                            )}

                            {cat.items.map((item) => (
                                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                                    {/* Image + Info */}
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-orange-50 flex items-center justify-center relative">
                                            {item.image
                                                ? <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} />
                                                : <span className="text-2xl">🍽️</span>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                                                <span className={`veg-indicator ${item.isVeg ? "veg" : "nonveg"}`} />
                                                {item.name}
                                            </p>
                                            <p className="font-bold text-sm" style={{ color: "#e8500a" }}>₹{item.price}</p>
                                            <p className="text-gray-400 text-xs truncate">{item.description}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:flex-col sm:items-end shrink-0">
                                        <Select
                                            value={item.available ? "available" : "not-available"}
                                            onValueChange={(v) => setAvail(cat.id, item.id, v === "available")}
                                        >
                                            <SelectTrigger className={`h-7 text-xs font-semibold w-36 rounded-lg border ${item.available
                                                ? "text-green-600 border-green-200 bg-green-50"
                                                : "text-red-500 border-red-200 bg-red-50"
                                                }`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="available">✅ Available</SelectItem>
                                                <SelectItem value="not-available">❌ Not Available</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <div className="flex gap-1.5">
                                            <Button size="sm" variant="secondary"
                                                className="text-xs rounded-lg h-7 px-3"
                                                onClick={() => openEdit(cat.id, item)}>
                                                Edit
                                            </Button>
                                            <Button size="sm" variant="outline"
                                                className="text-xs rounded-lg h-7 px-3 text-red-500 border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-600"
                                                onClick={() => delItem(cat.id, item.id)}>
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Add / Edit Item Dialog ── */}
            <Dialog open={modalMode === "add-item" || modalMode === "edit-item"} onOpenChange={(open) => !open && setModalMode(null)}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{modalMode === "add-item" ? "➕ Add New Item" : "✏️ Edit Item"}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <div className="space-y-1">
                            <Label>Item Name *</Label>
                            <Input
                                placeholder="e.g. Alfaham Chicken"
                                value={itemForm.name}
                                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                                autoFocus
                            />
                        </div>

                        <div className="space-y-1">
                            <Label>Description</Label>
                            <Input
                                placeholder="Short description…"
                                value={itemForm.description}
                                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-3">
                            <div className="flex-1 space-y-1">
                                <Label>Price (₹) *</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    value={priceStr}
                                    onChange={(e) => setPriceStr(e.target.value)}
                                />
                            </div>
                            <div className="flex-1 space-y-1">
                                <Label>Type</Label>
                                <Select
                                    value={itemForm.isVeg ? "veg" : "nonveg"}
                                    onValueChange={(v) => setItemForm({ ...itemForm, isVeg: v === "veg" })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="veg">🟢 Veg</SelectItem>
                                        <SelectItem value="nonveg">🔴 Non-Veg</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label>Food Image</Label>

                            {itemForm.image && (
                                <div className="relative w-full h-40 rounded-xl overflow-hidden bg-orange-50">
                                    <Image src={itemForm.image} alt="Preview" fill style={{ objectFit: "cover" }} />
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => setItemForm({ ...itemForm, image: "" })}
                                        className="absolute top-2 right-2 w-6 h-6 rounded-full p-0 text-xs"
                                        style={{ zIndex: 10 }}>
                                        ✕
                                    </Button>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-6 flex flex-col items-center gap-2 text-gray-400 text-sm cursor-pointer hover:border-orange-300 hover:text-orange-400 transition-all disabled:opacity-50"
                            >
                                {uploading ? (
                                    <><span className="text-2xl animate-spin">⏳</span><span>Uploading…</span></>
                                ) : (
                                    <>
                                        <span className="text-3xl">📷</span>
                                        <span className="font-semibold">{itemForm.image ? "Change Photo" : "Upload Photo from Device"}</span>
                                        <span className="text-xs">JPG, PNG, WEBP supported</span>
                                    </>
                                )}
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            {uploadError && <p className="text-red-500 text-xs">{uploadError}</p>}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => setModalMode(null)}>
                            Cancel
                        </Button>
                        <Button className="flex-1 text-white" style={{ background: "#e8500a" }} onClick={submitItem}>
                            {modalMode === "add-item" ? "Add Item" : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Add Category Dialog ── */}
            <Dialog open={modalMode === "add-category"} onOpenChange={(open) => !open && setModalMode(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>📂 Add New Category</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-1 py-2">
                        <Label>Category Name *</Label>
                        <Input
                            placeholder="e.g. Grills, Biryani, Snacks…"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && submitCat()}
                            autoFocus
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => setModalMode(null)}>
                            Cancel
                        </Button>
                        <Button className="flex-1 text-white" style={{ background: "#e8500a" }} onClick={submitCat}>
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Banner Modal */}
            <Dialog open={bannerMode} onOpenChange={setBannerMode}>
                <DialogContent className="sm:max-w-md rounded-[20px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">Manage Homepage Banners</DialogTitle>
                        <p className="text-sm text-gray-500">Upload up to 4 images for the sliding hero banner.</p>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                        {[0, 1, 2, 3].map((slot) => (
                            <div key={slot} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-2 group">
                                {banners[slot] ? (
                                    <>
                                        <Image src={banners[slot]!} alt={`Banner ${slot + 1}`} fill className="object-cover" />
                                        <button
                                            onClick={() => setBanners(prev => prev.map((b, i) => i === slot ? null : b))}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Clear slot"
                                        >
                                            ✕
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-gray-400 text-sm">Slot {slot + 1}</span>
                                )}

                                {bannerUploadingMap[slot] && (
                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center font-bold text-sm text-brand z-20">
                                        Uploading...
                                    </div>
                                )}

                                <input
                                    type="file" accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-0"
                                    onChange={(e) => handleBannerUpload(slot, e)}
                                />
                            </div>
                        ))}
                    </div>

                    <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => setBannerMode(false)} className="rounded-full">
                            Cancel
                        </Button>
                        <Button onClick={saveBanners} className="text-white rounded-full bg-brand hover:bg-brand-dark" disabled={saving}>
                            {saving ? "Saving..." : "Save Banners"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Banner Video Modal */}
            <Dialog open={videoMode} onOpenChange={setVideoMode}>
                <DialogContent className="sm:max-w-md rounded-[20px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">Manage Banner Video</DialogTitle>
                        <p className="text-sm text-gray-500">Upload an MP4 video to show on the homepage.</p>
                    </DialogHeader>

                    <div className="mt-4">
                        {videoUrl ? (
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border-2 border-gray-200">
                                <video src={videoUrl} controls className="w-full h-full object-cover" />
                                <button
                                    onClick={() => setVideoUrl("")}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full z-10 hover:bg-red-600 transition-colors shadow-lg"
                                    title="Remove video"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <div className="relative aspect-video rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-4">
                                {videoUploading ? (
                                    <div className="font-bold text-sm text-brand flex flex-col items-center gap-2">
                                        <span className="text-2xl animate-spin">⏳</span>
                                        Uploading Video...
                                    </div>
                                ) : (
                                    <>
                                        <span className="text-4xl mb-2">🎥</span>
                                        <span className="text-gray-600 font-medium">Click to upload video</span>
                                        <span className="text-gray-400 text-xs mt-1">MP4, WEBM supported</span>
                                    </>
                                )}
                                <input
                                    type="file" accept="video/mp4,video/webm"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-0"
                                    onChange={handleVideoUpload}
                                    disabled={videoUploading}
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => setVideoMode(false)} className="rounded-full">
                            Cancel
                        </Button>
                        <Button onClick={saveVideoUrl} className="text-white rounded-full bg-brand hover:bg-brand-dark" disabled={saving || videoUploading}>
                            {saving ? "Saving..." : "Save Video"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
