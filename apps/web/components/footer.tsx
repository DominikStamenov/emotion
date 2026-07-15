import Link from "next/link";
import { Logo } from "./logo";

const footerLinks = [
  {
    title: "Studio",
    links: [
      { label: "About", href: "/about" },
      { label: "Work", href: "/work" },
      { label: "Services", href: "/services" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Social",
    links: [
      { label: "Instagram", href: "#" },
      { label: "LinkedIn", href: "#" },
      { label: "Behance", href: "#" },
      { label: "Dribbble", href: "#" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo />

            <p className="mt-6 max-w-sm leading-7 text-white/60">
              Strategy, design, technology and motion for brands that want to
              create meaningful digital experiences.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/40">
                {group.title}
              </p>

              <ul className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/70 transition-opacity hover:opacity-50"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} eMotion. All rights reserved.</p>

          <div className="flex gap-6">
            <Link href="/privacy" className="transition-opacity hover:opacity-50">
              Privacy
            </Link>

            <Link href="/terms" className="transition-opacity hover:opacity-50">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}