import Image from "next/image";
import Link from "next/link";
import { listModels } from "@/lib/modelStore";

export const dynamic = "force-dynamic";

const normalizeDivision = (value: string | undefined) => {
  if (!value) return null;
  const normalized = value.replace(/[\s+_-]+/g, " ").toLowerCase();
  return normalized.trim() || null;
};

const formatDivisionLabel = (value: string | null) => {
  if (!value) return "All divisions";
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

type ModelsPageProps = {
  searchParams?:
    | {
        division?: string | string[];
      }
    | Promise<{
        division?: string | string[];
      }>;
};

const resolveSearchParams = async (
  searchParams: ModelsPageProps["searchParams"]
) => {
  if (!searchParams) return {};
  if (typeof (searchParams as Promise<unknown>).then === "function") {
    return ((await searchParams) ?? {}) as Record<string, unknown>;
  }
  return searchParams as Record<string, unknown>;
};

export default async function ModelsPage({ searchParams }: ModelsPageProps) {
  const allModels = await listModels(false);
  const resolvedParams = await resolveSearchParams(searchParams);
  const rawDivisionValue = resolvedParams.division;
  const rawDivision = Array.isArray(rawDivisionValue)
    ? rawDivisionValue[0]
    : (rawDivisionValue as string | undefined) ?? null;

  const normalizedDivision = normalizeDivision(rawDivision);
  const filteredModels = normalizedDivision
    ? allModels.filter((model) => model.division.toLowerCase() === normalizedDivision)
    : allModels;
  const total = filteredModels.length;
  const activeLabel = formatDivisionLabel(normalizedDivision);

  return (
    <section className="space-y-10">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-[12px] uppercase tracking-[0.6em] text-[var(--muted)] border-t border-[var(--border-color)] pt-6 w-full">
        {["All", "Women", "Men", "Girls", "Boys", "Non Binary"].map((division) => {
          const value = division.toLowerCase();
          const href = division === "All" ? "/models" : `/models?division=${encodeURIComponent(value)}`;
          const isActive = division === "All" ? !normalizedDivision : normalizedDivision === value;
          return (
            <Link
              key={division}
              href={href}
              className={`block text-center rounded-full border px-4 py-2 transition-colors hover:text-black hover:border-black ${
                isActive ? "text-black border-black bg-white" : "border-[var(--border-color)] bg-white/70"
              }`}
            >
              {division}
            </Link>
          );
        })}
      </div>

      {total === 0 ? (
        <div className="rounded-[24px] border border-[var(--border-color)] bg-white/80 p-8 text-center text-sm text-[var(--muted)]">
          No models found in this division yet. Please choose another board.
        </div>
      ) : (
        <div className="grid gap-6 border-t border-[var(--border-color)] pt-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredModels.map((model) => (
            <article
              key={model.id}
              className="group space-y-3 rounded-[28px] border border-[var(--border-color)] bg-white/80 p-4 pb-5 transition duration-200 hover:-translate-y-1 hover:border-black/40"
            >
              <Link
                href={`/models/${model.slug}`}
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


