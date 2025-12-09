import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPackageBySlug, markPackageAsOpenedBySlug } from "@/lib/packageStore";
import { getModelById } from "@/lib/modelStore";

interface PackageViewPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?:
    | {
        preview?: string | string[];
      }
    | Promise<{
        preview?: string | string[];
      }>;
}

export const dynamic = "force-dynamic";

const resolveSearchParams = async (
  searchParams: PackageViewPageProps["searchParams"]
) => {
  if (!searchParams) return {};
  if (typeof (searchParams as Promise<unknown>).then === "function") {
    return ((await searchParams) ?? {}) as Record<string, unknown>;
  }
  return searchParams as Record<string, unknown>;
};

export default async function PackageViewPage({ params, searchParams }: PackageViewPageProps) {
  const resolvedParams = await params;
  const slugParam = resolvedParams.slug || "";
  const resolvedSearchParams = await resolveSearchParams(searchParams);
  const isPreview = Array.isArray(resolvedSearchParams.preview)
    ? resolvedSearchParams.preview[0] === "true"
    : resolvedSearchParams.preview === "true";

  const packageRecord = await getPackageBySlug(slugParam);

  if (!packageRecord) {
    return notFound();
  }

  // Mark package as opened only if not in preview mode
  if (!isPreview) {
    await markPackageAsOpenedBySlug(slugParam);
  }

  // Fetch full model details for each model in the package
  const models = [];
  for (const modelId of packageRecord.modelIds) {
    const model = await getModelById(modelId);
    if (model) {
      models.push(model);
    }
  }

  return (
    <section className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-4xl font-light tracking-[0.1em] text-[var(--foreground)] sm:text-5xl">
          3mmodels package
        </h1>
      </header>

      {models.length === 0 ? (
        <div className="rounded-[16px] border border-[var(--border-color)] bg-white/70 p-8 text-center">
          <p className="text-[var(--muted)]">No models found in this package.</p>
        </div>
      ) : (
        <div className="grid gap-6 border-t border-[var(--border-color)] pt-8 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((model) => (
            <article
              key={model.id}
              className="group space-y-3 rounded-[28px] border border-[var(--border-color)] bg-white/80 p-4 pb-5 transition duration-200 hover:-translate-y-1 hover:border-black/40"
            >
              <Link
                href={`/models/${model.slug}?package=${slugParam}`}
                className="block aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#f4eee4]"
              >
                {model.images && model.images.length > 0 ? (
                  <Image
                    src={model.images[0].url}
                    alt={model.name}
                    width={600}
                    height={800}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[11px] uppercase tracking-[0.4em] text-[var(--muted)]">
                    No imagery yet
                  </div>
                )}
              </Link>
              <div className="space-y-1">
                <h2 className="text-base font-medium tracking-[0.1em] text-[var(--foreground)]">
                  {model.name}
                </h2>
                <p className="text-[10px] uppercase tracking-[0.6em] text-[var(--muted)]">
                  {model.division}
                </p>
                {model.city ? (
                  <p className="text-[11px] text-[var(--muted)]">{model.city}</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
