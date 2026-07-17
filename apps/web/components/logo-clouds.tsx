import styles from "./logo-clouds.module.css";

const capabilities = [
  "Strategy",
  "Brand systems",
  "Digital products",
  "Web development",
  "Motion",
  "Applied AI",
  "Growth",
  "Experience",
];

export function LogoCloud() {
  return (
    <section
      className={styles.cloud}
      aria-label="Integrated studio capabilities"
    >
      <div className={styles.track}>
        {[...capabilities, ...capabilities].map((capability, index) => (
          <span className={styles.item} key={`${capability}-${index}`}>
            {capability}
          </span>
        ))}
      </div>
    </section>
  );
}
