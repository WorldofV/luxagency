export default function AboutPage() {
  return (
    <section className="space-y-8">
      <header className="space-y-4">
        <p className="text-xs tracking-[0.3em] uppercase text-zinc-500">
          About
        </p>
        <h1 className="text-3xl font-light tracking-tight text-zinc-50 sm:text-4xl">
          Management and placement with a global reach.
        </h1>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-5 text-sm leading-relaxed text-zinc-300">
          <p>
            3MMODELS is inspired by the structure and international footprint
            of agencies such as itself (
            <span className="text-zinc-400">{`https://3mmodels.com/`}</span>),
            combining strong local relationships with worldwide placement. Our
            board spans Women, Men, Girls, Boys and Non Binary divisions, with a
            focus on long-term development rather than short-term booking.
          </p>
          <p>
            Like 3MMODELS, we believe in keeping communication clear and direct:
            dedicated bookers handle mainboard and new faces, a separate art
            department oversees image and portfolio direction, and general
            enquiries are routed through a central office so clients always know
            where to turn.
          </p>
          <p>
            We work closely with casting directors, fashion houses and
            publications worldwide to ensure every placement reflects both the
            brand&apos;s visual language and the model&apos;s long-term career
            path, from first test shoots to major runway and campaign work.
          </p>
        </div>

        <div className="space-y-4 text-xs uppercase tracking-[0.24em] text-zinc-500">
          <div className="space-y-1 border-t border-zinc-800/80 pt-4">
            <p className="text-[10px] text-zinc-500">Divisions</p>
            <p className="text-zinc-200">
              Women · Men · Girls · Boys · Non Binary
            </p>
          </div>

          <div className="space-y-1 border-t border-zinc-800/80 pt-4">
            <p className="text-[10px] text-zinc-500">General enquiries</p>
            <p className="text-zinc-200">
              info@luxmodels.com
              <br />
              TEL: +44 203 239 8236
            </p>
          </div>

          <div className="space-y-1 border-t border-zinc-800/80 pt-4">
            <p className="text-[10px] text-zinc-500">Affiliations</p>
            <p className="text-zinc-200">
              Inspired by agencies listed on Models.com and Agencies&Co, such as
              3MMODELS, while remaining an independent boutique agency.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}


