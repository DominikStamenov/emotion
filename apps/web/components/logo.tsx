import Image from "next/image";
import Link from "next/link";

import styles from "./logo.module.css";

export function Logo() {
  return (
    <Link href="/" className={styles.brand} aria-label="eMotion homepage">
      <Image
        src="/brand/emotion-mark-transparent-1024.png"
        alt=""
        width={1024}
        height={1024}
        sizes="46px"
        priority
        unoptimized
        className={styles.brandMark}
      />

      <span className={styles.brandCopy}>
        <strong>eMotion</strong>
      </span>
    </Link>
  );
}
