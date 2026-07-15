import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="brand" aria-label="eMotion homepage">
      <Image
        src="/logo.png"
        alt=""
        width={46}
        height={46}
        priority
        className="brandMark"
      />

      <span className="brandCopy">
        <strong>eMotion</strong>
      </span>
    </Link>
  );
}