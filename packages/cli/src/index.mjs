#!/usr/bin/env node

import {
  access,
  appendFile,
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const colors = {
  cyan: "\u001b[36m",
  dim: "\u001b[2m",
  green: "\u001b[32m",
  pink: "\u001b[35m",
  red: "\u001b[31m",
  reset: "\u001b[0m",
};

const SURFACES = new Set(["studio", "portal", "product"]);
const COMPONENT_PACKAGES = new Set(["ui", "motion"]);

export function normalizeName(value) {
  const normalized = String(value ?? "")
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  if (!normalized || normalized === "." || normalized === "..") {
    throw new Error("Provide a valid name containing letters or numbers.");
  }

  return normalized;
}

export function toPascalCase(value) {
  return normalizeName(value)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export function parseArguments(argv) {
  const [command = "help", rawName, ...rest] = argv;
  const options = {};

  for (const argument of rest) {
    if (argument === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (argument === "--force") {
      options.force = true;
      continue;
    }

    if (argument.startsWith("--") && argument.includes("=")) {
      const [rawKey, ...rawValue] = argument.slice(2).split("=");

      if (rawKey) {
        options[rawKey] = rawValue.join("=");
      }
    }
  }

  return { command, name: rawName, options };
}

async function exists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function findWorkspaceRoot(startDirectory = process.cwd()) {
  let directory = path.resolve(startDirectory);

  while (true) {
    if (
      (await exists(path.join(directory, "pnpm-workspace.yaml"))) &&
      (await exists(path.join(directory, "turbo.json")))
    ) {
      return directory;
    }

    const parent = path.dirname(directory);

    if (parent === directory) {
      throw new Error("Run eMotion CLI from inside the eMotion monorepo.");
    }

    directory = parent;
  }
}

function appTemplates(name, surface) {
  const displayName = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    "package.json": `${JSON.stringify(
      {
        name: `@emotion/${name}`,
        version: "0.1.0",
        private: true,
        type: "module",
        scripts: {
          dev: "next dev",
          build: "next build",
          start: "next start",
          lint: "eslint --max-warnings 0",
          "check-types": "next typegen && tsc --noEmit",
        },
        dependencies: {
          "@repo/motion": "workspace:^",
          "@repo/ui": "workspace:^",
          next: "16.2.0",
          react: "^19.2.0",
          "react-dom": "^19.2.0",
        },
        devDependencies: {
          "@repo/eslint-config": "workspace:*",
          "@repo/typescript-config": "workspace:*",
          "@types/node": "^22.15.3",
          "@types/react": "19.2.2",
          "@types/react-dom": "19.2.2",
          eslint: "^9.39.1",
          typescript: "5.9.2",
        },
      },
      null,
      2,
    )}\n`,
    "tsconfig.json": `${JSON.stringify(
      {
        extends: "@repo/typescript-config/nextjs.json",
        compilerOptions: {
          plugins: [{ name: "next" }],
        },
        include: [
          "next-env.d.ts",
          ".next/types/**/*.ts",
          "**/*.ts",
          "**/*.tsx",
        ],
        exclude: ["node_modules"],
      },
      null,
      2,
    )}\n`,
    "next-env.d.ts": `/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n`,
    "next.config.mjs": `/** @type {import("next").NextConfig} */\nconst config = { transpilePackages: ["@repo/ui", "@repo/motion"] };\n\nexport default config;\n`,
    "eslint.config.mjs": `import { nextJsConfig } from "@repo/eslint-config/next-js";\n\nexport default nextJsConfig;\n`,
    "app/layout.tsx": `import type { Metadata } from "next";\nimport { MotionProvider } from "@repo/motion";\nimport "@repo/ui/tokens.css";\nimport "./globals.css";\n\nexport const metadata: Metadata = { title: "${displayName} · eMotion" };\n\nexport default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {\n  return <html lang="en"><body><MotionProvider>{children}</MotionProvider></body></html>;\n}\n`,
    "app/page.tsx": `import { Badge, Card } from "@repo/ui";\n\nexport default function Page() {\n  return <main><Card eyebrow="eMotion ${surface}" title="${displayName}" description="Your new eMotion product surface is ready."><Badge tone="cyan" dot>Generated</Badge></Card></main>;\n}\n`,
    "app/globals.css": `@import "@repo/ui/tokens.css";\n\n* { box-sizing: border-box; }\nbody { min-height: 100vh; margin: 0; padding: clamp(24px, 6vw, 80px); color: var(--emotion-color-text); background: var(--emotion-color-background); font-family: var(--emotion-font-sans); }\nmain { width: min(100%, 760px); margin-inline: auto; }\n`,
  };
}

export function createAppPlan(name, surface = "product") {
  const normalizedName = normalizeName(name);

  if (!SURFACES.has(surface)) {
    throw new Error(
      `Unknown surface "${surface}". Use studio, portal or product.`,
    );
  }

  const templates = appTemplates(normalizedName, surface);

  return Object.entries(templates).map(([relativePath, content]) => ({
    relativePath: path.join("apps", normalizedName, relativePath),
    content,
  }));
}

function componentTemplates(name, packageName) {
  const fileName = normalizeName(name);
  const componentName = toPascalCase(name);

  if (packageName === "ui") {
    return {
      [`${fileName}.tsx`]: `import type { HTMLAttributes, ReactNode } from "react";\n\nimport styles from "./${fileName}.module.css";\n\nexport type ${componentName}Props = HTMLAttributes<HTMLDivElement> & { children: ReactNode };\n\nexport function ${componentName}({ children, className, ...props }: ${componentName}Props) {\n  return <div {...props} className={[styles.root, className].filter(Boolean).join(" ")}>{children}</div>;\n}\n`,
      [`${fileName}.module.css`]: `.root {\n  color: var(--emotion-color-text);\n}\n`,
      [`${fileName}.stories.tsx`]: `import type { Meta, StoryObj } from "@storybook/react-vite";\n\nimport { ${componentName}, type ${componentName}Props } from "./${fileName}";\n\nconst meta: Meta<${componentName}Props> = { title: "eMotion UI/${componentName}", component: ${componentName} };\nexport default meta;\ntype Story = StoryObj<${componentName}Props>;\nexport const Default: Story = { args: { children: "${componentName}" } };\n`,
    };
  }

  return {
    [`${fileName}.tsx`]: `"use client";\n\nimport type { HTMLAttributes, ReactNode } from "react";\n\nexport type ${componentName}Props = HTMLAttributes<HTMLDivElement> & { children: ReactNode };\n\nexport function ${componentName}({ children, ...props }: ${componentName}Props) {\n  return <div {...props}>{children}</div>;\n}\n`,
  };
}

export function createComponentPlan(name, packageName = "ui") {
  if (!COMPONENT_PACKAGES.has(packageName)) {
    throw new Error(`Unknown package "${packageName}". Use ui or motion.`);
  }

  const fileName = normalizeName(name);
  const componentName = toPascalCase(name);
  const templates = componentTemplates(fileName, packageName);

  return {
    files: Object.entries(templates).map(([relativePath, content]) => ({
      relativePath: path.join("packages", packageName, "src", relativePath),
      content,
    })),
    indexPath: path.join("packages", packageName, "src", "index.ts"),
    exportLine: `export { ${componentName}, type ${componentName}Props } from "./${fileName}";\n`,
  };
}

async function writePlan(root, files, { dryRun = false, force = false } = {}) {
  for (const file of files) {
    const target = path.resolve(root, file.relativePath);
    const safeRoot = `${path.resolve(root)}${path.sep}`;

    if (!target.startsWith(safeRoot)) {
      throw new Error(`Refusing to write outside the workspace: ${target}`);
    }

    if ((await exists(target)) && !force) {
      throw new Error(
        `${file.relativePath} already exists. Nothing was overwritten.`,
      );
    }

    console.log(
      `${dryRun ? colors.dim : colors.green}${dryRun ? "plan" : "create"}${colors.reset} ${file.relativePath}`,
    );

    if (!dryRun) {
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, file.content, "utf8");
    }
  }
}

async function appendExport(root, indexPath, exportLine, dryRun) {
  const target = path.resolve(root, indexPath);
  const current = (await exists(target)) ? await readFile(target, "utf8") : "";

  if (current.includes(exportLine.trim())) {
    return;
  }

  console.log(`${dryRun ? "plan" : "update"} ${indexPath}`);

  if (!dryRun) {
    await appendFile(target, `\n${exportLine}`, "utf8");
  }
}

const doctorChecks = [
  ["eMotion Studio", "apps/web"],
  ["eMotion CMS + OS", "apps/admin"],
  ["eMotion Client Portal", "apps/portal"],
  ["eMotion UI", "packages/ui"],
  ["eMotion Motion", "packages/motion"],
  ["eMotion CLI", "packages/cli"],
  ["Storybook", "packages/ui/.storybook/main.ts"],
  ["CI", ".github/workflows/quality.yml"],
];

async function runDoctor(root) {
  let healthy = true;

  console.log(`${colors.pink}eMotion platform doctor${colors.reset}\n`);

  for (const [label, relativePath] of doctorChecks) {
    const available = await exists(path.join(root, relativePath));
    healthy &&= available;
    console.log(
      `${available ? colors.green + "✓" : colors.red + "×"}${colors.reset} ${label.padEnd(24)} ${colors.dim}${relativePath}${colors.reset}`,
    );
  }

  return healthy;
}

function printHelp() {
  console.log(`${colors.pink}eMotion CLI${colors.reset} — product platform generator

${colors.cyan}Commands${colors.reset}
  emotion doctor
  emotion create <name> --surface=studio|portal|product [--dry-run]
  emotion generate <name> --package=ui|motion [--dry-run]

Existing files are never overwritten unless --force is explicitly provided.`);
}

export async function run(argv = process.argv.slice(2), startDirectory) {
  const { command, name, options } = parseArguments(argv);

  if (command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return 0;
  }

  const root = await findWorkspaceRoot(startDirectory);

  if (command === "doctor") {
    return (await runDoctor(root)) ? 0 : 1;
  }

  if (!name) {
    throw new Error(`The ${command} command requires a name.`);
  }

  if (command === "create") {
    const files = createAppPlan(name, options.surface ?? "product");
    await writePlan(root, files, options);
    console.log(`\n${colors.cyan}Next:${colors.reset} pnpm install`);
    return 0;
  }

  if (command === "generate") {
    const plan = createComponentPlan(name, options.package ?? "ui");
    await writePlan(root, plan.files, options);
    await appendExport(root, plan.indexPath, plan.exportLine, options.dryRun);
    return 0;
  }

  throw new Error(`Unknown command "${command}". Run emotion help.`);
}

const executedFile = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : "";

if (import.meta.url === executedFile) {
  run()
    .then((exitCode) => {
      process.exitCode = exitCode;
    })
    .catch((error) => {
      console.error(
        `${colors.red}eMotion CLI:${colors.reset}`,
        error instanceof Error ? error.message : error,
      );
      process.exitCode = 1;
    });
}
