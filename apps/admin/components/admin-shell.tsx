import type { Tables } from "@repo/database";
import Link from "next/link";
import type { ReactNode } from "react";

import { signOut } from "../app/actions/auth";
import styles from "./admin-shell.module.css";

const navigation = [
  { href: "/", label: "Pregled", mark: "OV" },
  { href: "/inbox", label: "Inbox", mark: "IN" },
  { href: "/content", label: "Sadržaj", mark: "CM" },
  { href: "/media", label: "Mediji", mark: "ME" },
  { href: "/crm", label: "CRM", mark: "CR" },
  { href: "/operations", label: "Operacije", mark: "OP" },
  { href: "/clients", label: "Client Portal", mark: "CP" },
  { href: "/analytics", label: "Analytics", mark: "AN" },
  { href: "/ai", label: "AI centar", mark: "AI" },
  { href: "/settings", label: "Postavke", mark: "SE" },
] as const;

export function AdminShell({
  children,
  profile,
}: {
  children: ReactNode;
  profile: Tables<"profiles">;
}) {
  const name = profile.display_name || "eMotion operator";

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand} aria-label="eMotion admin">
          <span className={styles.brandMark}>e</span>
          <span>
            <strong>eMotion</strong>
            <small>agency OS</small>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Glavna navigacija">
          {navigation.map((item) => (
            <Link href={item.href} key={item.href}>
              <span>{item.mark}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.account}>
          <span className={styles.avatar}>
            {name.slice(0, 1).toUpperCase()}
          </span>
          <span className={styles.accountText}>
            <strong>{name}</strong>
            <small>{profile.role}</small>
          </span>
          <form action={signOut}>
            <button type="submit" aria-label="Odjava">
              ↗
            </button>
          </form>
        </div>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.mobileHeader}>
          <Link
            href="/"
            className={styles.mobileBrand}
            aria-label="eMotion admin"
          >
            <span className={styles.brandMark}>e</span>
            <span>
              <strong>eMotion</strong>
              <small>agency OS</small>
            </span>
          </Link>
          <form action={signOut}>
            <button type="submit">Odjava</button>
          </form>
        </header>

        <main className={styles.main}>{children}</main>

        <nav className={styles.mobileNav} aria-label="Mobilna navigacija">
          {navigation.map((item) => (
            <Link href={item.href} key={item.href}>
              <span>{item.mark}</span>
              <small>{item.label}</small>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
