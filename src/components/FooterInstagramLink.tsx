"use client";

type FooterInstagramLinkProps = {
  href: string;
  label: string;
  handle: string;
};

export function FooterInstagramLink({
  href,
  label,
  handle,
}: FooterInstagramLinkProps) {
  const handleClick = async () => {
    try {
      await fetch("/api/metrics/instagram", { method: "POST" });
    } catch {
      // ignore failures, don't block navigation
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.5em] text-[var(--muted)] hover:text-black transition-colors"
    >
      <span>{label}</span>
      <span className="text-[var(--foreground)]">{handle}</span>
    </a>
  );
}

