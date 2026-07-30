import Link from "next/link";
import { Container } from "./container";
import { Logo } from "./logo";
import { publicContactEmail } from "../lib/site";
import styles from "./footer.module.css";

const footerLinks = [
  {
    title: "Explore",
    links: [
      { label: "Services", href: "/services" },
      { label: "Work", href: "/work" },
      { label: "Studio", href: "/studio" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Capabilities",
    links: [
      { label: "Brand strategy", href: "/services/brand-strategy" },
      { label: "Web design", href: "/services/web-design" },
      { label: "Development", href: "/services/development" },
      { label: "Applied AI", href: "/services/ai-solutions" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Cookies", href: "/cookies" },
      { label: "Terms", href: "/terms" },
    ],
  },
] as const;

export function Footer() {
  const links = footerLinks.map((group) =>
    group.title === "Legal" && publicContactEmail
      ? {
          ...group,
          links: [
            ...group.links,
            {
              href: "mailto:" + publicContactEmail,
              label: publicContactEmail,
            },
          ],
        }
      : group,
  );

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.top}>
          <div className={styles.intro}>
            <Logo />
            <p>
              Strategy, design, technology and motion for brands that want to
              create meaningful digital experiences.
            </p>
          </div>

          {links.map((group) => (
            <div key={group.title}>
              <p className={styles.groupTitle}>{group.title}</p>

              <ul className={styles.linkList}>
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={styles.link}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} eMotion. All rights reserved.</p>
          <p className={styles.status}>Available for selected projects</p>
        </div>
      </Container>
    </footer>
  );
}
