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
  const allModels = await listModels();
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
      <header className="space-y-4">
        <p className="section-title">Models</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-3xl font-light tracking-[0.1em] text-[var(--foreground)] sm:text-4xl">
            {activeLabel === "All divisions" ? "Mainboard & development boards." : `${activeLabel} board.`}
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-[var(--muted)]">
            Real-time feed synced from 3MMODELS ({`https://3mmodels.com/`}).
            Click any profile to view the complete book, measurements and campaign work.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-2 border-t border-[var(--border-color)] pt-6 text-[11px] uppercase tracking-[0.4em] text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
        <span>
          {total} {total === 1 ? "model" : "models"} on {activeLabel.toLowerCase()}
        </span>
        <span>Women · Men · Girls · Boys · Non Binary</span>
      </div>

      {total === 0 ? (
        <div className="rounded-[24px] border border-[var(--border-color)] bg-white/80 p-8 text-center text-sm text-[var(--muted)]">
          No models found in this division yet. Please choose another board.
        </div>
      ) : null}

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
              {model.polaroids && model.polaroids.length > 0 ? (
                <Image
                  src={model.polaroids[0]}
                  alt={model.name}
                  width={600}
                  height={800}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : null}
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
    </section>
  );
}


