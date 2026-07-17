import type { Json } from "@repo/database";

import styles from "./cms-content.module.css";

type ContentBlock = {
  body?: string;
  items?: string[];
  title?: string;
  type?: string;
};

function parseBlocks(content: Json): ContentBlock[] {
  const source =
    content && typeof content === "object" && !Array.isArray(content)
      ? content.sections
      : content;

  if (!Array.isArray(source)) {
    return [];
  }

  return source.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return [];
    }

    const items = Array.isArray(item.items)
      ? item.items.filter((value): value is string => typeof value === "string")
      : undefined;

    return [
      {
        body: typeof item.body === "string" ? item.body : undefined,
        items,
        title: typeof item.title === "string" ? item.title : undefined,
        type: typeof item.type === "string" ? item.type : undefined,
      },
    ];
  });
}

export function CmsContent({
  content,
  fallback,
}: {
  content: Json;
  fallback?: string | null;
}) {
  const blocks = parseBlocks(content);

  if (!blocks.length) {
    return fallback ? <p className={styles.lead}>{fallback}</p> : null;
  }

  return (
    <div className={styles.content}>
      {blocks.map((block, index) => {
        if (block.type === "quote" && block.body) {
          return <blockquote key={index}>{block.body}</blockquote>;
        }

        return (
          <section key={index}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              {block.title ? <h2>{block.title}</h2> : null}
              {block.body ? <p>{block.body}</p> : null}
              {block.items?.length ? (
                <ul>
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
