export default function AboutPage() {
  return (
    <section className="space-y-8">
      <header className="space-y-4">
        <p className="section-title">
          About
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-5 text-sm leading-relaxed text-[var(--foreground)]">
          <div className="space-y-4">
            <h2 className="text-base font-medium text-[var(--foreground)]">MANAGEMENT</h2>
            <p>
              3mmodels was founded in 2010 from former model himself, Americo Cacciapuoti with the passion for creating a mother agency that discovers and manages top notch models. Having the big desire to bring to the table models that make a difference in the fashion business, 3mmodels has quickly made a name for themselves discovering various top models such as Alessio Pozzi, Jing Wen, Jia Li, Janaye Furman.
            </p>
            <p>
              What makes us unique is that we work on a worldwide basis even though we have a legal office in London. We discover and manage models from all over the world and with first-hand experience and knowledge of many fashion markets the 3M team is able to advise it&apos;s talent of what to expect in the fashion industry and lead them towards the right direction of their careers as models.
            </p>
            <p>
              We&apos;re young, eager and a dynamic team always in the search of the next top models.
            </p>
            <p>
              For more information please check out our{" "}
              <a
                href="https://models.com/agency/3mmodels"
                target="_blank"
                rel="noreferrer"
                className="underline-offset-4 hover:underline"
              >
                models.com
              </a> 
              profile or{" "}
              <a
                href="https://www.instagram.com/3mmodels_official/"
                target="_blank"
                rel="noreferrer"
                className="underline-offset-4 hover:underline"
              >
                Instagram
              </a>
              .
            </p>
          </div>

          <div className="space-y-4 border-t border-[var(--border-color)] pt-6">
            <h2 className="text-base font-medium text-[var(--foreground)]">PARTNERSHIP</h2>
            <p>
              3mmodels is also available for partnership with smaller Agencies and Mother Agencies for placements abroad. We work extensively with agencies in Asia, as well as Europe, the US, South America, South Africa, Australia, etc. Please feel free to contact us directly for further information.
            </p>
          </div>

          <div className="space-y-4 border-t border-[var(--border-color)] pt-6">
            <h2 className="text-base font-medium text-[var(--foreground)]">SCOUTS / SCOUTING</h2>
            <p>
              At 3mmodels we are always looking for new scouts who share our passion for discovering future talent. Whether you already have experience or are simply well-connected in your community, you can become part of our scouting network.
            </p>
            <p>
              We offer compensation for every model successfully referred to us and signed to the agency. If you know someone who has the potential to become a model, we’d be happy to review their profile and guide them through the next steps.
            </p>
            <p>
              For more information or to become a scout, please contact Americo directly.
            </p>
          </div>

          <div className="space-y-4 border-t border-[var(--border-color)] pt-6">
            <h2 className="text-base font-medium text-[var(--foreground)]">OPEN CALLS</h2>
            <p>
              We do not do open calls, the legal office is only used for legal purposes. If you want to be part of 3mmodels{}
              <a
                href="/become-a-model"
                className="underline-offset-4 hover:underline"
              >
                go here
              </a>{}or contact the Scout.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
          <div className="space-y-1 border-t border-[var(--border-color)] pt-4">
            <p className="text-[10px] text-[var(--muted)]">Legal Office Address</p>
            <p className="text-[var(--foreground)] normal-case">
              International House,<br />
              36-38 Cornhill, London, EC3V 3NG
            </p>
          </div>

          <div className="space-y-1 border-t border-[var(--border-color)] pt-4">
            <p className="text-[10px] text-[var(--muted)]">Director</p>
            <p className="text-[var(--foreground)] normal-case">
              Americo Cacciapuoti<br />
              <a href="mailto:americo@3mmodels.com" className="underline-offset-4 hover:underline">
                americo@3mmodels.com
              </a>
            </p>
          </div>

          <div className="space-y-1 border-t border-[var(--border-color)] pt-4">
            <p className="text-[10px] text-[var(--muted)]">Bookers</p>
            <p className="text-[var(--foreground)] normal-case">
              Americo Cacciapuoti - <a href="mailto:americo@3mmodels.com" className="underline-offset-4 hover:underline">americo@3mmodels.com</a><br />
              Irsida Aliu - <a href="mailto:irsida@3mmodels.com" className="underline-offset-4 hover:underline">irsida@3mmodels.com</a><br />
              Kateryna Miasoid - <a href="mailto:kateryna@3mmodels.com" className="underline-offset-4 hover:underline">kateryna@3mmodels.com</a>
            </p>
          </div>

          <div className="space-y-1 border-t border-[var(--border-color)] pt-4">
            <p className="text-[10px] text-[var(--muted)]">International Scout</p>
            <p className="text-[var(--foreground)] normal-case">
              Irsida Aliu - <a href="mailto:irsida@3mmodels.com" className="underline-offset-4 hover:underline">irsida@3mmodels.com</a>
            </p>
          </div>

          <div className="space-y-1 border-t border-[var(--border-color)] pt-4">
            <p className="text-[10px] text-[var(--muted)]">Art Department</p>
            <p className="text-[var(--foreground)] normal-case">
              Daria Hubanova - <a href="mailto:daria@3mmodels.com" className="underline-offset-4 hover:underline">daria@3mmodels.com</a>
            </p>
          </div>

          <div className="space-y-1 border-t border-[var(--border-color)] pt-4">
            <p className="text-[10px] text-[var(--muted)]">General Enquiries</p>
            <p className="text-[var(--foreground)] normal-case">
              <a href="mailto:info@3mmodels.com" className="underline-offset-4 hover:underline">info@3mmodels.com</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
