import Link from "next/link";
import { notFound } from "next/navigation";

import { getModelBySlug, listModels } from "@/lib/modelStore";
import { ModelGallery } from "./Gallery";

interface ModelsDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const models = await listModels();
  return models.map((model) => ({
    slug: model.slug,
  }));
}

export default async function ModelDetailPage({ params }: ModelsDetailPageProps) {
  const resolvedParams = await params;
  const slugParam = (resolvedParams.slug || "").toLowerCase();

  const model = await getModelBySlug(slugParam);

  if (!model) {
    return notFound();
  }

  const hasStats =
    model.height ||
    model.bust ||
    model.waist ||
    model.hips ||
    model.shoes ||
    model.eyes ||
    model.hair;

  return (
    <section className="space-y-12">
      <header className="space-y-3">
        <p className="section-title">
          {model.division}
        </p>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <h1 className="text-4xl font-light tracking-[0.1em] text-[var(--foreground)] sm:text-5xl">
            {model.name}
          </h1>
          {model.city ? (
            <div className="text-[11px] uppercase tracking-[0.4em] text-[var(--muted)] sm:text-right">
              <span className="uppercase tracking-[0.24em]">
                Based in {model.city}
              </span>
            </div>
          ) : null}
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <ModelGallery images={model.images} name={model.name} />

        {/* Stats / measurements */}
        <aside className="space-y-6 text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          {hasStats ? (
            <div className="space-y-3 border-t border-[var(--border-color)] pt-4">
              <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--muted)]">Measurements</p>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-[var(--foreground)]">
                {model.height && (
                  <>
                    <dt className="text-[var(--muted)]">Height</dt>
                    <dd>{model.height}</dd>
                  </>
                )}
                {model.bust && (
                  <>
                    <dt className="text-zinc-500">Bust</dt>
                    <dd>{model.bust}</dd>
                  </>
                )}
                {model.waist && (
                  <>
                    <dt className="text-zinc-500">Waist</dt>
                    <dd>{model.waist}</dd>
                  </>
                )}
                {model.hips && (
                  <>
                    <dt className="text-zinc-500">Hips</dt>
                    <dd>{model.hips}</dd>
                  </>
                )}
                {model.shoes && (
                  <>
                    <dt className="text-zinc-500">Shoes</dt>
                    <dd>{model.shoes}</dd>
                  </>
                )}
                {model.eyes && (
                  <>
                    <dt className="text-zinc-500">Eyes</dt>
                    <dd>{model.eyes}</dd>
                  </>
                )}
                {model.hair && (
                  <>
                    <dt className="text-zinc-500">Hair</dt>
                    <dd>{model.hair}</dd>
                  </>
                )}
              </dl>
            </div>
          ) : null}

          <div className="space-y-2 border-t border-[var(--border-color)] pt-4">
            <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--muted)]">Navigation</p>
            <Link
              href="/models"
              className="inline-flex items-center text-[11px] text-[var(--foreground)] underline-offset-4 hover:underline"
            >
              ← Back to board
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}


