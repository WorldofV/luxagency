"use client";

import type { ChangeEvent, DragEvent, FormEvent, TouchEvent as ReactTouchEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { ModelRecord } from "@/lib/modelStore";
import type { SubmissionRecord } from "@/lib/submissionStore";
import {
  eyeOptions,
  hairOptions,
  heightOptions,
  measurementOptions,
  shoeOptions,
} from "@/lib/modelOptions";

const divisionOptions = ["Women", "Men", "Girls", "Boys", "Non Binary"];

const FEMALE_KEYWORDS = ["women", "woman", "female", "girls", "girl"];
const MALE_KEYWORDS = ["men", "man", "male", "boys", "boy"];

type PreviewImage = {
  url: string;
  alt: string;
};

type ImagePreviewState = {
  images: PreviewImage[];
  index: number;
};

const normalizeDescriptor = (value?: string) => value?.toLowerCase().trim() ?? "";

const isFemaleDescriptor = (value?: string) => {
  const normalized = normalizeDescriptor(value);
  if (!normalized) return false;
  return FEMALE_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

const isMaleDescriptor = (value?: string) => {
  const normalized = normalizeDescriptor(value);
  if (!normalized) return false;
  if (isFemaleDescriptor(value)) return false;
  return MALE_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

const parseHeightCm = (value?: string) => {
  if (!value) return null;
  const cmMatch = value.match(/(\d+(?:\.\d+)?)(?=\s*cm)/i);
  if (cmMatch) {
    return Number(cmMatch[1]);
  }
  const digitsMatch = value.match(/\d+/);
  return digitsMatch ? Number(digitsMatch[0]) : null;
};

const shouldFlagShortTalent = (descriptor?: string, height?: string) => {
  const heightValue = parseHeightCm(height);
  if (heightValue == null) return false;
  if (isMaleDescriptor(descriptor)) return heightValue < 180;
  if (isFemaleDescriptor(descriptor)) return heightValue < 170;
  return false;
};

const shortHeightLabel = (descriptor?: string) => {
  if (isMaleDescriptor(descriptor)) return "Male talent under 180 cm";
  if (isFemaleDescriptor(descriptor)) return "Female talent under 170 cm";
  return "Below preferred height";
};

export default function AdminPage() {
  const [models, setModels] = useState<ModelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"models" | "submissions" | "stats">("models");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    division: "Women",
    city: "",
  });
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState("Order saved");
  const [confirmationMessage, setConfirmationMessage] = useState("Book sequence updated successfully.");
  const [deletePrompt, setDeletePrompt] = useState<{
    visible: boolean;
    message: string;
    action: string;
    onConfirm: (() => void) | null;
  }>({
    visible: false,
    message: "",
    action: "",
    onConfirm: null,
  });
  const [imagePreview, setImagePreview] = useState<ImagePreviewState | null>(null);
  const touchStartX = useRef<number | null>(null);

  const openImagePreview = (images: PreviewImage[], index: number) => {
    setImagePreview({ images, index });
  };

  const closeImagePreview = () => setImagePreview(null);

  const showNextImage = () => {
    setImagePreview((prev) => {
      if (!prev) return prev;
      const nextIndex = Math.min(prev.images.length - 1, prev.index + 1);
      if (nextIndex === prev.index) return prev;
      return { ...prev, index: nextIndex };
    });
  };

  const showPrevImage = () => {
    setImagePreview((prev) => {
      if (!prev) return prev;
      const nextIndex = Math.max(0, prev.index - 1);
      if (nextIndex === prev.index) return prev;
      return { ...prev, index: nextIndex };
    });
  };

  const currentPreviewImage = imagePreview
    ? imagePreview.images[imagePreview.index]
    : null;
  const previewHasPrev = imagePreview ? imagePreview.index > 0 : false;
  const previewHasNext = imagePreview
    ? imagePreview.index < imagePreview.images.length - 1
    : false;

  const handlePreviewTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchStartX.current = touch?.clientX ?? null;
  };

  const handlePreviewTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const touch = event.changedTouches[0];
    const endX = touch?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      if (delta < 0) {
        showNextImage();
      } else {
        showPrevImage();
      }
    }
    touchStartX.current = null;
  };

  useEffect(() => {
    if (!imagePreview) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeImagePreview();
      } else if (event.key === "ArrowRight") {
        showNextImage();
      } else if (event.key === "ArrowLeft") {
        showPrevImage();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [imagePreview]);

  const [formCollapsed, setFormCollapsed] = useState(true);
  const [instagramClicks, setInstagramClicks] = useState<number | null>(null);

  const refreshModels = async () => {
    setLoading(true);
    const response = await fetch("/api/models");
    if (response.ok) {
      const data = await response.json();
      setModels(data.models);
      setError(null);
    } else {
      setError("Failed to load models");
    }
    setLoading(false);
  };

  const refreshSubmissions = async () => {
    setSubmissionsLoading(true);
    const response = await fetch("/api/submissions");
    if (response.ok) {
      const data = await response.json();
      setSubmissions(data.submissions);
    }
    setSubmissionsLoading(false);
  };

  const refreshMetrics = async () => {
    const response = await fetch("/api/metrics/instagram");
    if (response.ok) {
      const data = await response.json();
      setInstagramClicks(data.count);
    }
  };

  useEffect(() => {
    refreshModels();
    refreshSubmissions();
    refreshMetrics();
  }, []);

  useEffect(() => {
    if (!confirmationVisible) return;
    const timer = setTimeout(() => setConfirmationVisible(false), 2000);
    return () => clearTimeout(timer);
  }, [confirmationVisible]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setCreating(true);
    const response = await fetch("/api/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      setError("Unable to create model");
    } else {
      setForm({
        name: "",
        division: form.division,
        city: "",
      });
      await refreshModels();
    }
    setCreating(false);
  };

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <div>
          <p className="section-title">Admin</p>
          <h1 className="text-3xl font-light tracking-[0.1em]">
            3MMODELS Control Panel
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Upload new models, manage their books, reorder or delete images.
            This area is not authenticated yet—add protection before deploying
            to production.
          </p>
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <nav className="flex flex-wrap gap-4 border-b border-[var(--border-color)] pb-2 text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          <button
            className={`pb-1 ${
              activeTab === "models"
                ? "border-b border-black text-black"
                : "hover:text-black"
            }`}
            onClick={() => setActiveTab("models")}
          >
            Models
          </button>
          <button
            className={`pb-1 ${
              activeTab === "submissions"
                ? "border-b border-black text-black"
                : "hover:text-black"
            }`}
            onClick={() => setActiveTab("submissions")}
          >
            Submissions
          </button>
          <button
            className={`pb-1 ${
              activeTab === "stats"
                ? "border-b border-black text-black"
                : "hover:text-black"
            }`}
            onClick={() => setActiveTab("stats")}
          >
            Stats
          </button>
        </nav>
      </header>

      <section className="rounded-[24px] border border-[var(--border-color)] bg-white/90 shadow-[0_25px_60px_-25px_rgba(0,0,0,0.2)]">
        <button
          type="button"
          onClick={() => setFormCollapsed((value) => !value)}
          className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
        >
          <div>
            <p className="section-title">Quick add</p>
            <h2 className="text-lg font-medium tracking-[0.1em]">
              Add a new model
            </h2>
          </div>
          <span className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
            {formCollapsed ? "Expand" : "Collapse"}
          </span>
        </button>
        {!formCollapsed ? (
          <form
            className="grid gap-4 border-t border-[var(--border-color)] px-6 py-6 sm:grid-cols-2"
            onSubmit={handleCreate}
          >
            <label className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">
              Name
              <input
                required
                className="mt-1 w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-base text-[var(--foreground)]"
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </label>
            <label className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">
              Division
              <select
                className="mt-1 w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-base text-[var(--foreground)]"
                value={form.division}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, division: event.target.value }))
                }
              >
                {divisionOptions.map((division) => (
                  <option key={division} value={division}>
                    {division}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">
              City
              <input
                className="mt-1 w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-base text-[var(--foreground)]"
                value={form.city}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, city: event.target.value }))
                }
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center rounded-full bg-black px-6 py-2 text-sm uppercase tracking-[0.4em] text-white disabled:opacity-60"
              >
                {creating ? "Creating…" : "Add model"}
              </button>
            </div>
          </form>
        ) : null}
      </section>

      {activeTab === "models" ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-medium tracking-[0.1em]">
                Existing models
              </h2>
              <p className="text-sm text-[var(--muted)]">
                Search by name or location, then manage each profile.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="search"
                placeholder="Search name or city"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
              />
              <button
                onClick={refreshModels}
                className="text-sm uppercase tracking-[0.3em] text-[var(--muted)] underline-offset-4 hover:underline"
              >
                Refresh
              </button>
            </div>
          </div>
          {loading ? (
            <p className="text-sm text-[var(--muted)]">Loading…</p>
          ) : (
            <div className="space-y-6">
            {models
                .filter((model) => {
                  if (!search.trim()) return true;
                  const query = search.toLowerCase();
                  return (
                    model.name.toLowerCase().includes(query) ||
                    (model.city?.toLowerCase().includes(query) ?? false)
                  );
                })
                .map((model) => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    onChange={refreshModels}
                    onShowConfirmation={(message = "Book sequence updated successfully.", action = "Order saved") => {
                      setConfirmationMessage(message);
                      setConfirmationAction(action);
                      setConfirmationVisible(true);
                    }}
                    onShowDeleteConfirmation={(message, action, fn) =>
                      setDeletePrompt({
                        visible: true,
                        message,
                        action,
                        onConfirm: fn,
                      })
                    }
                  />
                ))}
              {models.length === 0 ? (
                <p className="rounded-[16px] border border-[var(--border-color)] bg-white/70 p-4 text-sm text-[var(--muted)]">
                  No models yet—use the form above to add your first entry.
                </p>
              ) : null}
            </div>
          )}
        </section>
      ) : activeTab === "submissions" ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-medium tracking-[0.1em]">Become a model submissions</h2>
              <p className="text-sm text-[var(--muted)]">
                Review new applicants and approve them to the board.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="search"
                placeholder="Search name or city"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="rounded-full border border-[var(--border-color)] px-4 py-2 text-sm"
              />
              <button
                onClick={refreshSubmissions}
                className="text-sm uppercase tracking-[0.3em] text-[var(--muted)] underline-offset-4 hover:underline"
              >
                Refresh
              </button>
            </div>
          </div>
          {submissionsLoading ? (
            <p className="text-sm text-[var(--muted)]">Loading…</p>
          ) : (
            <div className="space-y-4">
              {submissions
                .filter((submission) => submission.status === "pending")
                .filter((submission) => {
                  if (!search.trim()) return true;
                  const query = search.toLowerCase();
                  return (
                    submission.firstName.toLowerCase().includes(query) ||
                    submission.lastName.toLowerCase().includes(query) ||
                    (submission.currentCity?.toLowerCase().includes(query) ?? false)
                  );
                })
                .map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              onApprove={async () => {
                await fetch(`/api/submissions/${submission.id}/approve`, { method: "POST" });
                await refreshModels();
                await refreshSubmissions();
                setConfirmationMessage("New model added to the board.");
                setConfirmationAction("Model added");
                setConfirmationVisible(true);
              }}
              onDelete={() =>
                setDeletePrompt({
                  visible: true,
                  message: "Delete this application?",
                  action: "Delete submission",
                  onConfirm: async () => {
                    await fetch(`/api/submissions/${submission.id}`, { method: "DELETE" });
                    await refreshSubmissions();
                  },
                })
              }
              onPreview={openImagePreview}
            />
                ))}
              {submissions.filter((submission) => submission.status === "pending").length === 0 ? (
                <p className="rounded-[16px] border border-[var(--border-color)] bg-white/70 p-4 text-sm text-[var(--muted)]">
                  No pending submissions.
                </p>
              ) : (
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  {submissions.filter((submission) => submission.status === "pending").length} pending submissions
                </p>
              )}
            </div>
          )}
        </section>
      ) : activeTab === "stats" ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-medium tracking-[0.1em]">Stats</h2>
              <p className="text-sm text-[var(--muted)]">
                Monitor marketing touch points across the site.
              </p>
            </div>
            <button
              onClick={refreshMetrics}
              className="text-sm uppercase tracking-[0.3em] text-[var(--muted)] underline-offset-4 hover:underline"
            >
              Refresh
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-[var(--border-color)] bg-white/90 p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                Instagram clicks
              </p>
              <p className="mt-2 text-4xl font-light tracking-[0.1em]">
                {instagramClicks ?? "—"}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Tracked from the footer CTA.
              </p>
            </div>
          </div>
        </section>
      ) : null}
      <ConfirmationPopup
        visible={confirmationVisible}
        message={confirmationMessage}
        action={confirmationAction}
      />
      <ConfirmationPopup
        visible={deletePrompt.visible}
        variant="danger"
        message={deletePrompt.message}
        action={deletePrompt.action || "Confirm action"}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          deletePrompt.onConfirm?.();
          setDeletePrompt({
            visible: false,
            message: "",
            action: "",
            onConfirm: null,
          });
        }}
        onCancel={() =>
          setDeletePrompt({
            visible: false,
            message: "",
            action: "",
            onConfirm: null,
          })
        }
      />
      {imagePreview && currentPreviewImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          onClick={closeImagePreview}
        >
          <div
            className="max-h-[90vh] max-w-[90vw] overflow-auto rounded-3xl border border-white/30 bg-black/30 p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-4">
              <div
                className="flex w-full items-center gap-4"
                onTouchStart={handlePreviewTouchStart}
                onTouchEnd={handlePreviewTouchEnd}
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    showPrevImage();
                  }}
                  disabled={!previewHasPrev}
                  className="hidden rounded-full border border-white/50 px-3 py-2 text-xs uppercase tracking-[0.4em] text-white transition disabled:opacity-30 sm:block"
                >
                  Prev
                </button>
                <img
                  src={currentPreviewImage.url}
                  alt={currentPreviewImage.alt}
                  className="max-h-[75vh] w-full rounded-2xl object-contain"
                />
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    showNextImage();
                  }}
                  disabled={!previewHasNext}
                  className="hidden rounded-full border border-white/50 px-3 py-2 text-xs uppercase tracking-[0.4em] text-white transition disabled:opacity-30 sm:block"
                >
                  Next
                </button>
              </div>
              {imagePreview.images.length > 1 ? (
                <p className="text-xs uppercase tracking-[0.4em] text-white/80">
                  {imagePreview.index + 1} / {imagePreview.images.length}
                </p>
              ) : null}
              <div className="flex w-full flex-wrap gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    showPrevImage();
                  }}
                  disabled={!previewHasPrev}
                  className="flex-1 rounded-full border border-white/50 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white transition disabled:opacity-30 sm:hidden"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    showNextImage();
                  }}
                  disabled={!previewHasNext}
                  className="flex-1 rounded-full border border-white/50 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white transition disabled:opacity-30 sm:hidden"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    closeImagePreview();
                  }}
                  className="w-full rounded-full border border-white/60 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type ConfirmationPopupProps = {
  visible: boolean;
  message: string;
  action: string;
  variant?: "success" | "danger";
  onClose?(): void;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?(): void;
  onCancel?(): void;
};

function ConfirmationPopup({
  visible,
  message,
  action,
  variant = "success",
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmationPopupProps) {
  if (!visible) return null;

  const color =
    variant === "danger"
      ? "text-red-600 border-red-500"
      : "text-green-700 border-[var(--border-color)]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className={`flex w-full max-w-md flex-col gap-3 rounded-2xl border bg-white/98 px-6 py-5 text-center shadow-2xl ${color}`}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-color)] bg-white">
          <img
            src="https://3mmodels.com/web/svg/logo_square.svg"
            alt="3MMODELS"
            className="h-10 w-10"
          />
        </div>
        <p className="text-base font-medium tracking-[0.3em] uppercase">{action}</p>
        <p className="text-sm text-[var(--muted)]">{message}</p>
        {confirmLabel && cancelLabel ? (
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
            <button
              onClick={onConfirm}
              className="rounded-full border border-black px-4 py-2 text-xs uppercase tracking-[0.4em]"
            >
              {confirmLabel}
            </button>
            <button
              onClick={onCancel}
              className="rounded-full border border-[var(--border-color)] px-4 py-2 text-xs uppercase tracking-[0.4em]"
            >
              {cancelLabel}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

type ModelCardProps = {
  model: ModelRecord;
  onChange(): Promise<void> | void;
  onShowConfirmation(message?: string, action?: string): void;
  onShowDeleteConfirmation(message: string, action: string, onConfirm: () => void): void;
};

function ModelCard({ model, onChange, onShowConfirmation, onShowDeleteConfirmation }: ModelCardProps) {
  const [pending, setPending] = useState(false);
  const [localModel, setLocalModel] = useState(model);
  const [orders, setOrders] = useState<Record<string, number>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const shortHeightModel = shouldFlagShortTalent(localModel.division, localModel.height);
  const shortHeightModelLabel = shortHeightLabel(localModel.division);
  const modelAge = localModel.birthday
    ? Math.floor(
        (Date.now() - new Date(localModel.birthday).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25)
      )
    : null;

  useEffect(() => {
    setLocalModel(model);
    const initialOrders: Record<string, number> = {};
    model.images.forEach((image) => {
      initialOrders[image.id] = image.order;
    });
    setOrders(initialOrders);
  }, [model]);

  const sortedImages = useMemo(
    () => [...localModel.images].sort((a, b) => a.order - b.order),
    [localModel.images]
  );

  const handleFieldChange = (
    field: keyof ModelRecord,
    value: string | undefined
  ) => {
    setLocalModel((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const saveModel = async () => {
    setPending(true);
    const response = await fetch(`/api/models/${localModel.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city: localModel.city,
        division: localModel.division,
        citizenship: localModel.citizenship,
        instagram: localModel.instagram,
        modelsComUrl: localModel.modelsComUrl,
        email: localModel.email,
        phone: localModel.phone,
        whatsapp: localModel.whatsapp,
        birthday: localModel.birthday,
        height: localModel.height,
        bust: localModel.bust,
        waist: localModel.waist,
        hips: localModel.hips,
        shoes: localModel.shoes,
        eyes: localModel.eyes,
        hair: localModel.hair,
      }),
    });
    setPending(false);
    if (!response.ok) {
      alert("Unable to update model");
      return;
    }
    setDirty(false);
    await onChange();
    onShowConfirmation("Model info saved", "Fields updated");
  };

  const deleteModel = async () => {
    onShowDeleteConfirmation(`Delete ${localModel.name}?`, "Delete model", async () => {
      setPending(true);
      await fetch(`/api/models/${localModel.id}`, { method: "DELETE" });
      setPending(false);
      await onChange();
    });
  };

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setPending(true);
    await fetch(`/api/models/${localModel.id}/images`, {
      method: "POST",
      body: formData,
    });
    setPending(false);
    event.target.value = "";
    await onChange();
  };

  const saveOrder = async () => {
    setPending(true);
    await fetch(`/api/models/${localModel.id}/images`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        images: Object.entries(orders).map(([id, order]) => ({
          id,
          order: Number(order),
        })),
      }),
    });
    setPending(false);
    await onChange();
  };

  const removeImage = async (imageId: string) => {
    onShowDeleteConfirmation("Remove this image from the book?", "Remove image", async () => {
      setPending(true);
      await fetch(`/api/images/${imageId}`, { method: "DELETE" });
      setPending(false);
      await onChange();
    });
  };

  const handleDragStart = (imageId: string, event?: DragEvent<HTMLDivElement>) => {
    const dataTransfer = event?.dataTransfer;
    if (dataTransfer) {
      dataTransfer.setData("text/plain", imageId);
      dataTransfer.effectAllowed = "move";
    }
    setDraggingId(imageId);
  };

  const handleDrop = (targetId: string, event?: DragEvent<HTMLDivElement>) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      return;
    }
    setLocalModel((prev) => {
      const images = [...prev.images];
      const fromIndex = images.findIndex((image) => image.id === draggingId);
      const toIndex = images.findIndex((image) => image.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const [moved] = images.splice(fromIndex, 1);
      images.splice(toIndex, 0, moved);
      const newOrders: Record<string, number> = {};
      images.forEach((image, index) => {
        newOrders[image.id] = index * 10;
      });
      const updatedImages = images.map((image) => ({
        ...image,
        order: newOrders[image.id],
      }));
      setOrders((prevOrders) => ({ ...prevOrders, ...newOrders }));
      setDirty(true);
      return { ...prev, images: updatedImages };
    });
    setDraggingId(null);
  };

  return (
    <div className="rounded-[24px] border border-[var(--border-color)] bg-white/80 p-4">
      <div className="flex flex-col gap-2 border-b border-[var(--border-color)] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.6em] text-[var(--muted)]">
            {localModel.division}
          </p>
          <h3 className="text-2xl font-light tracking-[0.1em]">
            {localModel.name}
            {shortHeightModel ? (
              <span
                className="ml-3 inline-flex h-2.5 w-2.5 align-middle rounded-full bg-red-500"
                title={shortHeightModelLabel}
                aria-label={shortHeightModelLabel}
              />
            ) : null}
            {modelAge !== null ? (
              <span className="ml-3 text-sm uppercase tracking-[0.4em] text-[var(--muted)]">
                {modelAge} yrs
              </span>
            ) : null}
          </h3>
          {localModel.email ? (
            <p className="text-sm text-[var(--muted)] lowercase">
              {localModel.email}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={saveModel}
            disabled={pending}
            className={`rounded-full px-4 py-1 text-xs uppercase tracking-[0.4em] disabled:opacity-60 ${
              dirty
                ? "border-green-600 text-green-700"
                : "border-black text-black"
            }`}
          >
            Save info
          </button>
          <button
            onClick={deleteModel}
            disabled={pending}
            className="rounded-full border border-red-500 px-4 py-1 text-xs uppercase tracking-[0.4em] text-red-600 disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          City
          <input
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.city ?? ""}
            onChange={(event) => handleFieldChange("city", event.target.value)}
          />
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Citizenship
          <input
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.citizenship ?? ""}
            onChange={(event) =>
              handleFieldChange("citizenship", event.target.value)
            }
          />
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Instagram
          <input
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.instagram ?? ""}
            onChange={(event) =>
              handleFieldChange("instagram", event.target.value)
            }
          />
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Models.com
          <input
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.modelsComUrl ?? ""}
            onChange={(event) =>
              handleFieldChange("modelsComUrl", event.target.value)
            }
            placeholder="https://models.com/people/..."
          />
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Email
          <input
            type="email"
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.email ?? ""}
            onChange={(event) => handleFieldChange("email", event.target.value)}
          />
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Phone
          <input
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.phone ?? ""}
            onChange={(event) => handleFieldChange("phone", event.target.value)}
          />
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          WhatsApp
          <input
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.whatsapp ?? ""}
            onChange={(event) =>
              handleFieldChange("whatsapp", event.target.value)
            }
          />
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Birthday
          <input
            type="date"
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.birthday ?? ""}
            onChange={(event) =>
              handleFieldChange("birthday", event.target.value)
            }
          />
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Height
          <select
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.height ?? ""}
            onChange={(event) => handleFieldChange("height", event.target.value)}
          >
            <option value="">Select height</option>
            {heightOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Bust
          <select
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.bust ?? ""}
            onChange={(event) => handleFieldChange("bust", event.target.value)}
          >
            <option value="">Select bust</option>
            {measurementOptions.map((option) => (
              <option key={`bust-${option}`} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Waist
          <select
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.waist ?? ""}
            onChange={(event) => handleFieldChange("waist", event.target.value)}
          >
            <option value="">Select waist</option>
            {measurementOptions.map((option) => (
              <option key={`waist-${option}`} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Hips
          <select
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.hips ?? ""}
            onChange={(event) => handleFieldChange("hips", event.target.value)}
          >
            <option value="">Select hips</option>
            {measurementOptions.map((option) => (
              <option key={`hips-${option}`} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Shoes
          <select
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.shoes ?? ""}
            onChange={(event) => handleFieldChange("shoes", event.target.value)}
          >
            <option value="">Select shoes</option>
            {shoeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Eyes
          <select
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.eyes ?? ""}
            onChange={(event) => handleFieldChange("eyes", event.target.value)}
          >
            <option value="">Select eyes</option>
            {eyeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Hair
          <select
            className="mt-1 w-full rounded-lg border border-[var(--border-color)] px-3 py-2"
            value={localModel.hair ?? ""}
            onChange={(event) => handleFieldChange("hair", event.target.value)}
          >
            <option value="">Select hair</option>
            {hairOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 border-t border-[var(--border-color)] pt-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
              Book images
            </p>
            <p className="text-sm text-[var(--muted)]">
              Upload JPG/PNG files. They will appear immediately on the public
              board.
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={uploadImage}
            disabled={pending}
          />
        </div>

        {sortedImages.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">
            No images yet—upload to start the book.
          </p>
        ) : (
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedImages.map((image) => (
              <div
                key={image.id}
                draggable
                onDragStart={(event) => handleDragStart(image.id, event)}
                onDragEnter={(event) => {
                  event.preventDefault();
                  event.currentTarget.classList.add("outline", "outline-2", "outline-black");
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={(event) => {
                  event.currentTarget.classList.remove("outline", "outline-2", "outline-black");
                }}
                onDrop={(event) => {
                  event.currentTarget.classList.remove("outline", "outline-2", "outline-black");
                  handleDrop(image.id, event);
                }}
                className={`flex flex-col items-center gap-3 rounded-2xl border border-[var(--border-color)] bg-white/70 p-4 transition ${
                  draggingId === image.id
                    ? "scale-[1.02] border-black shadow-lg"
                    : "hover:border-black/60"
                }`}
              >
                <span className="rounded-full border border-[var(--border-color)] px-3 py-1 text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                  #{Math.floor((orders[image.id] ?? image.order ?? 0) / 10) + 1}
                </span>
                <img
                  src={image.url}
                  alt={localModel.name}
                  className="h-48 w-36 rounded-2xl object-cover"
                />
                  <button
                    className="text-sm uppercase tracking-[0.3em] text-red-500 underline-offset-4 hover:underline"
                    onClick={() => removeImage(image.id)}
                    disabled={pending}
                  >
                    Delete
                  </button>
              </div>
            ))}
            <button
              onClick={async () => {
                await saveOrder();
                setDirty(false);
                onShowConfirmation("Model info saved", "Fields updated");
              }}
              disabled={pending}
              className={`rounded-full border px-4 py-1 text-xs uppercase tracking-[0.4em] disabled:opacity-60 ${
                dirty ? "border-green-600 text-green-700" : "border-black"
              }`}
            >
              Save order
            </button>
          </div>
        )}
      </div>
      {(localModel.email || localModel.phone || localModel.whatsapp || localModel.birthday) ? (
        <div className="mt-6 rounded-[20px] border border-[var(--border-color)] bg-white/70 px-4 py-3 text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--muted)]">
            Private contact
          </p>
          <dl className="mt-3 space-y-1 text-[var(--foreground)]">
            {localModel.email ? (
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[var(--muted)]">Email</dt>
                <dd className="text-right text-[11px] normal-case">{localModel.email}</dd>
              </div>
            ) : null}
            {localModel.phone ? (
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[var(--muted)]">Phone</dt>
                <dd className="text-right text-[11px] normal-case">{localModel.phone}</dd>
              </div>
            ) : null}
            {localModel.whatsapp ? (
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[var(--muted)]">WhatsApp</dt>
                <dd className="text-right text-[11px] normal-case">{localModel.whatsapp}</dd>
              </div>
            ) : null}
            {localModel.birthday ? (
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[var(--muted)]">Birthday</dt>
                <dd className="text-right text-[11px] normal-case">{localModel.birthday}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}
    </div>
  );
}

type SubmissionCardProps = {
  submission: SubmissionRecord;
  onApprove(): Promise<void> | void;
  onDelete(): void;
  onPreview(images: PreviewImage[], index: number): void;
};

function SubmissionCard({ submission, onApprove, onDelete, onPreview }: SubmissionCardProps) {
  const statusBadge =
    submission.status === "approved"
      ? "text-green-700 border-green-600"
      : "text-[var(--muted)] border-[var(--border-color)]";

  const age = submission.birthday
    ? Math.floor(
        (Date.now() - new Date(submission.birthday).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      )
    : null;
  const shortHeightSubmission = shouldFlagShortTalent(submission.gender, submission.height);
  const shortHeightSubmissionLabel = shortHeightLabel(submission.gender);
  const previewImages = submission.images.map((image) => ({
    url: image.url,
    alt: `${submission.firstName} ${submission.lastName}`,
  }));

  return (
    <article className="rounded-[24px] border border-[var(--border-color)] bg-white/85 p-4">
      <header className="flex flex-col gap-2 border-b border-[var(--border-color)] pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
            {submission.gender ?? "Unspecified"}
          </p>
          <h3 className="text-2xl font-light tracking-[0.1em]">
            {submission.firstName} {submission.lastName}
            {age ? (
              <span className="ml-3 text-sm uppercase tracking-[0.4em] text-[var(--muted)]">{age} yrs</span>
            ) : null}
            {shortHeightSubmission ? (
              <span
                className="ml-3 inline-flex h-2.5 w-2.5 align-middle rounded-full bg-red-500"
                title={shortHeightSubmissionLabel}
                aria-label={shortHeightSubmissionLabel}
              />
            ) : null}
          </h3>
          <p className="text-sm text-[var(--muted)]">{submission.email}</p>
        </div>
        <div className="flex flex-col items-end text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
          <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.4em] ${statusBadge}`}>
            {submission.status}
          </span>
          <span className="mt-2 text-[10px]">
            {submission.status === "pending" ? "Submitted" : "Updated"} ·{" "}
            {new Date(submission.updatedAt).toLocaleDateString()}{" "}
            {new Date(submission.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </header>

      <div className="mt-4 grid gap-4 text-sm text-[var(--muted)] sm:grid-cols-2">
        <div>
          <p className="section-title">Location</p>
          <p>{submission.currentCity || "—"}</p>
        </div>
        <div>
          <p className="section-title">Measurements</p>
          <p>
            H: {submission.height || "—"} · C: {submission.chest || "—"} · W: {submission.waist || "—"} · H:{" "}
            {submission.hips || "—"}
          </p>
        </div>
        <div>
          <p className="section-title">Contact</p>
          <p>
            {submission.phone || "—"}
            <br />
            {submission.instagram || "No Instagram"}
          </p>
        </div>
        <div>
          <p className="section-title">Experience</p>
          <p>{submission.experience || "No experience info"}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        {submission.images.map((image: SubmissionRecord["images"][number], index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => onPreview(previewImages, index)}
            className="group"
          >
            <img
              src={image.url}
              alt={`${submission.firstName} ${submission.lastName}`}
              className="h-40 w-32 rounded-2xl object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={onApprove}
          disabled={submission.status === "approved"}
          className="rounded-full border border-black px-4 py-1 text-xs uppercase tracking-[0.4em] disabled:opacity-50"
        >
          Approve & add to board
        </button>
        <button
          onClick={onDelete}
          className="rounded-full border border-red-500 px-4 py-1 text-xs uppercase tracking-[0.4em] text-red-600"
        >
          Delete
        </button>
      </div>
    </article>
  );
}


