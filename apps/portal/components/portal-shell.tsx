import Link from "next/link";
import type { ReactNode } from "react";

import { signOut } from "../app/actions/auth";
import styles from "./portal-shell.module.css";

const navigation = [
  { href: "/", label: "Overview", icon: "◉" },
  { href: "/projects", label: "Projects", icon: "◇" },
  { href: "/files", label: "Files", icon: "□" },
  { href: "/messages", label: "Feedback", icon: "↗" },
];

export function PortalShell({
  children,
  clientName,
  demo,
}: {
  children: ReactNode;
  clientName: string;
  demo: boolean;
}) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand}>
          <span aria-hidden="true" />
          <strong>eMotion</strong>
        </Link>

        <nav className={styles.navigation} aria-label="Client portal">
          {navigation.map((item) => (
            <Link href={item.href} key={item.href}>
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.account}>
          <span className={styles.avatar}>{clientName.slice(0, 1)}</span>
          <div>
            <strong>{clientName}</strong>
            <small>{demo ? "Demo client" : "Client account"}</small>
          </div>
          {demo ? null : (
            <form action={signOut}>
              <button type="submit" aria-label="Sign out">
                ↗
              </button>
            </form>
          )}
        </div>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.mobileHeader}>
          <Link href="/" className={styles.brand}>
            <span aria-hidden="true" />
            <strong>eMotion</strong>
          </Link>
          <small>Client Portal</small>
        </header>
        <nav
          className={styles.mobileNavigation}
          aria-label="Mobile client portal"
        >
          {navigation.map((item) => (
            <Link href={item.href} key={item.href}>
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}
