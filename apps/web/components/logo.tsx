import Image from "next/image";
import Link from "next/link";

import styles from "./logo.module.css";

export function Logo() {
  return (
    <Link href="/" className={styles.brand} aria-label="eMotion homepage">
      <Image
        src="/brand/emotion-mark.svg"
        alt=""
        width={46}
        height={46}
        priority
        className={styles.brandMark}
      />

      <span className={styles.brandCopy}>
        <strong>eMotion</strong>
      </span>
    </Link>
  );
}