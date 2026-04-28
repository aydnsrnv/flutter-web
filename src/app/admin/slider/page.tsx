"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSliderItems, createSliderItem, updateSliderItem, deleteSliderItem } from "../actions";
import { ConfirmDialog } from "../components/confirm-dialog";

export default function SliderPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ photo_url: "", url: "", about: "", type: "" });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    getSliderItems().then((res) => {
      setItems(res.data);
      setLoading(false);
    });
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ photo_url: "", url: "", about: "", type: "" });
    setModalOpen(true);
  }

  function openEdit(item: any) {
    setEditing(item);
    setForm({
      photo_url: item.photo_url ?? "",
      url: item.url ?? "",
      about: item.about ?? "",
      type: item.type ?? "",
    });
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.photo_url.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        photo_url: form.photo_url.trim(),
        url: form.url.trim() || undefined,
        about: form.about.trim() || undefined,
        type: form.type.trim() || undefined,
      };
      if (editing) {
        await updateSliderItem(editing.id, payload);
      } else {
        await createSliderItem(payload);
      }
      setModalOpen(false);
      const res = await getSliderItems();
      setItems(res.data);
      startTransition(() => router.refresh());
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-40 rounded-lg bg-muted animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Slider
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {items.length} slides
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="h-10 px-4 rounded-xl text-sm font-semibold text-white shrink-0"
          style={{ backgroundColor: "var(--jobly-main)" }}
        >
          + Add Slide
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="aspect-[16/9] bg-muted relative">
              {item.photo_url ? (
                <img src={item.photo_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid place-items-center h-full text-sm" style={{ color: "var(--muted-foreground)" }}>
                  No image
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                {item.about || "Untitled"}
              </p>
              {item.url && (
                <p className="text-xs mt-1 truncate" style={{ color: "var(--jobly-main)" }}>
                  {item.url}
                </p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-[rgba(36,91,235,0.12)] text-[#245beb]"
                >
                  Edit
                </button>
                <ConfirmDialog
                  trigger={
                    <button
                      type="button"
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-[rgba(239,68,68,0.12)] text-[#dc2626]"
                    >
                      Delete
                    </button>
                  }
                  title="Delete Slide"
                  description="Are you sure you want to delete this slide?"
                  onConfirm={async () => {
                    await deleteSliderItem(item.id);
                    const res = await getSliderItems();
                    setItems(res.data);
                    startTransition(() => router.refresh());
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="p-8 text-center text-sm rounded-2xl border border-border bg-card" style={{ color: "var(--muted-foreground)" }}>
          No slides found. Add your first slide!
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-xl">
            <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
              {editing ? "Edit Slide" : "Add Slide"}
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Photo URL *</label>
                <input
                  type="text" value={form.photo_url}
                  onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                  style={{ color: "var(--foreground)" }}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Link URL</label>
                <input
                  type="text" value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                  style={{ color: "var(--foreground)" }}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Title / About</label>
                <input
                  type="text" value={form.about}
                  onChange={(e) => setForm({ ...form, about: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                  style={{ color: "var(--foreground)" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Type</label>
                <input
                  type="text" value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                  style={{ color: "var(--foreground)" }}
                  placeholder="e.g. banner"
                />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="h-10 flex-1 rounded-xl border border-border text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting || !form.photo_url.trim()}
                onClick={handleSubmit}
                className="h-10 flex-1 rounded-xl text-sm font-semibold text-white"
                style={{
                  backgroundColor: "var(--jobly-main)",
                  opacity: submitting || !form.photo_url.trim() ? 0.5 : 1,
                }}
              >
                {submitting ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
