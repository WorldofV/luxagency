import Link from "next/link";
import { notFound } from "next/navigation";

import { getModelBySlug, listModels } from "@/lib/modelStore";
import { ModelGallery } from "./Gallery";

interface ModelsDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?:
    | {
        package?: string | string[];
      }
    | Promise<{
        package?: string | string[];
      }>;
}

export const dynamic = "force-dynamic";

const resolveSearchParams = async (
  searchParams: ModelsDetailPageProps["searchParams"]
) => {
  if (!searchParams) return {};
  if (typeof (searchParams as Promise<unknown>).then === "function") {
    return ((await searchParams) ?? {}) as Record<string, unknown>;
  }
  return searchParams as Record<string, unknown>;
};

export async function generateStaticParams() {
  const models = await listModels(false);
  return models.map((model) => ({
    slug: model.slug,
  }));
}

export default async function ModelDetailPage({ params, searchParams }: ModelsDetailPageProps) {
  const resolvedParams = await params;
  const slugParam = (resolvedParams.slug || "").toLowerCase();
  const resolvedSearchParams = await resolveSearchParams(searchParams);
  const packageSlug = Array.isArray(resolvedSearchParams.package)
    ? resolvedSearchParams.package[0]
    : (resolvedSearchParams.package as string | undefined);

  const model = await getModelBySlug(slugParam);

  if (!model) {
    return notFound();
  }

  const measurementItems = [
    { label: "Height", value: model.height },
    { label: "Bust", value: model.bust },
    { label: "Waist", value: model.waist },
    { label: "Hips", value: model.hips },
    { label: "Shoes", value: model.shoes },
    { label: "Eye", value: model.eyes },
    { label: "Hair", value: model.hair },
  ].filter((item) => Boolean(item.value));

  const modelAge = model.birthday
    ? Math.floor(
        (Date.now() - new Date(model.birthday).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25)
      )
    : null;

  const profileItems = [
    { label: "Located", value: model.city },
    { label: "Nationality", value: model.nationality },
    { label: "Citizenship", value: model.citizenship },
    {
      label: "Instagram",
      value: model.instagram,
      isLink: true,
      linkPrefix: "https://instagram.com/",
    },
    {
      label: "Models.com",
      value: model.modelsComUrl,
      isLink: true,
    },
    {
      label: "TikTok",
      value: model.tiktok,
      isLink: true,
      linkPrefix: "https://tiktok.com/@",
      // Strip @ from value for URL if present
      getLinkValue: (val: string | null | undefined) => (val as string)?.startsWith("@") ? (val as string).slice(1) : val,
    },
    { label: "Age", value: modelAge ? `${modelAge} yrs` : null },
  ].filter((item) => Boolean(item.value));

  const hasGalleryImages = model.images && model.images.length > 0;

  return (
    <section className="space-y-12">
      <header className="space-y-3">
        <Link
          href={`/models?division=${encodeURIComponent(model.division)}`}
          className="section-title hover:underline underline-offset-4"
        >
          {model.division}
        </Link>
        <div className="flex flex-col justify-between gap-3 sm:gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-light tracking-[0.1em] text-[var(--foreground)] sm:text-5xl">
              {model.name}
            </h1>
            <Link
              href="/models"
              className="inline-flex items-center text-[11px] text-[var(--foreground)] underline-offset-4 hover:underline uppercase tracking-[0.4em]"
            >
              ← Back to board
            </Link>
          </div>
        </div>
      </header>

      <div className="space-y-12">
        {/* Main image + info side-by-side */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <ModelGallery images={model.images} name={model.name} showThumbnails={false} />

          {/* Stats / measurements */}
          <aside className="space-y-6 text-xs uppercase tracking-[0.4em] text-[var(--muted)] w-full">
            {measurementItems.length ? (
              <div className="space-y-3 border-t border-[var(--border-color)] pt-4">
                <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--muted)]">Measurements</p>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-[var(--foreground)]">
                  {measurementItems.map((item) => (
                    <div key={item.label} className="contents">
                      <dt className="text-[var(--muted)]">{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            {profileItems.length ? (
              <div className="space-y-3 border-t border-[var(--border-color)] pt-4">
                <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--muted)]">Profile</p>
                <dl className="space-y-2 text-[var(--foreground)]">
                  {profileItems.map((item) => (
                    <div key={item.label} className="flex items-baseline justify-between gap-4">
                      <dt className="text-[var(--muted)]">{item.label}</dt>
                      <dd className="text-right">
                        {item.isLink ? (
                          <Link
                            href=
                              {(item.value as string).startsWith("http")
                                ? (item.value as string)
                                : `${item.linkPrefix ?? ""}${(item as any).getLinkValue ? (item as any).getLinkValue(item.value) : item.value}`}
                            target="_blank"
                            rel="noreferrer"
                            className="underline-offset-4 hover:underline"
                          >
                            {item.value}
                          </Link>
                        ) : (
                          item.value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            {model.agencyPlacements && model.agencyPlacements.length > 0 ? (
              <div className="space-y-3 border-t border-[var(--border-color)] pt-4">
                <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--muted)]">Placements</p>
                <dl className="space-y-2 text-[var(--foreground)]">
                  {model.agencyPlacements.map((placement) => (
                    <div key={placement.id} className="flex items-baseline justify-between gap-4">
                      <dt className="text-[var(--muted)]">{placement.agencyName}</dt>
                      <dd className="text-right text-[11px]">{placement.city}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          <div className="border-t border-[var(--border-color)]"></div>

            </aside>
        </div>

        {/* Full-width thumbnails below */}
        {hasGalleryImages ? (
          <ModelGallery images={model.images.slice(1)} name={model.name} showMain={false} showThumbnails />
        ) : null}
      </div>
    </section>
  );
}

