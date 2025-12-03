export default function ContactPage() {
  return (
    <section className="space-y-8">
      <header className="space-y-4">
        <p className="text-xs tracking-[0.3em] uppercase text-zinc-500">
          Contact
        </p>
        <h1 className="text-3xl font-light tracking-tight text-zinc-50 sm:text-4xl">
          Booking & submissions.
        </h1>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="space-y-6 text-sm leading-relaxed text-zinc-300">
          <p>
            For casting requests, show packages or campaign options, contact our
            bookings team using the details below. We respond to all professional
            inquiries within one business day.
          </p>

          <div className="space-y-4 text-xs uppercase tracking-[0.24em] text-zinc-500">
            <div className="space-y-1 border-t border-zinc-800/80 pt-4">
              <p className="text-[10px] text-zinc-500">Bookings</p>
              <p className="text-zinc-200">
                booking@luxmodels.com
                <br />
                +39 000 000 000
              </p>
            </div>
            <div className="space-y-1 border-t border-zinc-800/80 pt-4">
              <p className="text-[10px] text-zinc-500">New faces</p>
              <p className="text-zinc-200">
                scouting@luxmodels.com
                <br />
                Online submissions only
              </p>
            </div>
            <div className="space-y-1 border-t border-zinc-800/80 pt-4">
              <p className="text-[10px] text-zinc-500">Office</p>
              <p className="text-zinc-200">
                Via Example 12
                <br />
                20100 · Milan · Italy
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
            Online submission
          </p>
          <form className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Full name</label>
                <input
                  className="w-full rounded-lg border border-zinc-800/80 bg-black/20 px-3 py-2 text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-zinc-100"
                  placeholder="Name and surname"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Email</label>
                <input
                  className="w-full rounded-lg border border-zinc-800/80 bg-black/20 px-3 py-2 text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-zinc-100"
                  placeholder="example@domain.com"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">City</label>
                <input
                  className="w-full rounded-lg border border-zinc-800/80 bg-black/20 px-3 py-2 text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-zinc-100"
                  placeholder="Milan"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Instagram</label>
                <input
                  className="w-full rounded-lg border border-zinc-800/80 bg-black/20 px-3 py-2 text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-zinc-100"
                  placeholder="@handle"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Division</label>
                <input
                  className="w-full rounded-lg border border-zinc-800/80 bg-black/20 px-3 py-2 text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-zinc-100"
                  placeholder="Women / Men / New faces"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Message</label>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-zinc-800/80 bg-black/20 px-3 py-2 text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-zinc-100"
                placeholder="Include age, height and languages spoken."
              />
            </div>
            <button
              type="button"
              className="mt-2 inline-flex items-center justify-center rounded-full border border-zinc-700/80 bg-zinc-100/5 px-6 py-2 text-xs font-medium uppercase tracking-[0.24em] text-zinc-100 transition-colors hover:border-zinc-100 hover:bg-zinc-100/10"
            >
              Submit request
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}


