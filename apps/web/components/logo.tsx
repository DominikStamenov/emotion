import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="brand">
      <Image
        src="/logo.png"
        alt="eMotion"
        width={42}
        height={42}
        priority
        className="brandMark"
      />

      <span className="brandCopy">
        <strong>eMotion</strong>
        <small>Digital Studio</small>
      </span>
    </Link>
  );
}