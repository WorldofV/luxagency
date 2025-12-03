export default function Home() {
  return (
    <section className="space-y-12">
      <div className="space-y-6 text-center">
        <p className="section-title">3mmodels</p>
        <h1 className="text-4xl font-light tracking-[0.1em] text-[var(--foreground)] sm:text-5xl">
          Management & placement for international fashion clients.
        </h1>
        <p className="mx-auto max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
          Headquartered in Milan with satellite teams across Paris, London, New York and Asia,
          3MMODELS curates mainboard, development and special bookings for runway, editorial and campaign work.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6 rounded-[32px] border border-[var(--border-color)] bg-white/80 p-8">
          <div className="flex items-center justify-between text-[12px] uppercase tracking-[0.5em] text-[var(--muted)]">
            <span>Board update</span>
            <span>Week 36</span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted)]">
                Women / Men
              </p>
              <p className="text-3xl font-light text-[var(--foreground)]">Mainboard</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted)]">
                Girls / Boys / Non Binary
              </p>
              <p className="text-3xl font-light text-[var(--foreground)]">Development</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            New composite packages delivered daily. For full digitals or live casting, contact bookings@3mmodels.com.
          </p>
        </div>

        <div className="rounded-[32px] border border-[var(--border-color)] bg-white/90 p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="section-title">Cities</p>
              <p className="mt-2 text-lg">Milan · Paris · London · New York · Barcelona</p>
            </div>
            <div>
              <p className="section-title">Selected Clients</p>
              <p className="mt-2 text-lg">
                Valentino, Dior, Versace, Prada, Emporio Armani, Dolce &amp; Gabbana, Zegna.
              </p>
            </div>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="section-title">Divisions</p>
              <p className="mt-2 text-lg">Women · Men · Girls · Boys · Non Binary · Artists</p>
            </div>
            <div>
              <p className="section-title">Contacts</p>
              <p className="mt-2 text-lg">
                info@3mmodels.com
                <br />
                +44 203 239 8236
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
