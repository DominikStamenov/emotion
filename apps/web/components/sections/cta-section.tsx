export function CtaSection() {
    return (
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="border border-white/10 px-8 py-16 md:px-12 md:py-20">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/50">
              START A PROJECT
            </p>
  
            <div className="mt-6 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <h2 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
                  Let&apos;s build something people remember.
                </h2>
  
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
                  Tell us what you are building, where you want to go and what is
                  currently standing in the way.
                </p>
              </div>
  
              <a
                href="/contact"
                className="inline-flex w-fit items-center gap-3 border border-white px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black"
              >
                Start a conversation
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }