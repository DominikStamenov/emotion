import type { Preview } from "@storybook/react-vite";

import "../src/tailwind.css";
import "./storybook.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "eMotion black",
      values: [
        { name: "eMotion black", value: "#08080a" },
        { name: "Surface", value: "#17171d" },
        { name: "Light", value: "#f7f5fb" },
      ],
    },
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default preview;
