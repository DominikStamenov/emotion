import Link from "next/link";

import { Container } from "./container";
import { Logo } from "./logo";

const navigation = [
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Studio", href: "#studio" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  return (
    <header className="siteHeader">
      <Container className="siteHeaderContainer">
        <Link href="/" aria-label="eMotion homepage">
          <Logo />
        </Link>

        <nav className="siteNavigation" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link className="headerAction" href="#contact">
          Start a project
          <span aria-hidden="true">↗</span>
        </Link>
      </Container>
    </header>
  );
}