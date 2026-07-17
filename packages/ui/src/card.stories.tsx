import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "./badge";
import { Button } from "./button";
import { Card } from "./card";

const meta: Meta<typeof Card> = {
  title: "eMotion UI/Card",
  component: Card,
  args: {
    eyebrow: "eMotion OS",
    title: "Northline redesign",
    description:
      "A live opportunity with a clear next action, ownership and complete activity history.",
    accent: "violet",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "min(92vw, 560px)" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Opportunity: Story = {
  args: {
    children: (
      <Badge tone="success" dot>
        Qualified
      </Badge>
    ),
    footer: (
      <>
        <span style={{ color: "rgba(247,245,251,.5)", fontSize: 12 }}>
          Updated 12 min ago
        </span>
        <Button size="small">Open</Button>
      </>
    ),
  },
};

export const Editorial: Story = {
  args: {
    eyebrow: "eMotion CMS",
    title: "The future of living brands",
    description: "Draft insight ready for editorial review and SEO approval.",
    accent: "pink",
    children: (
      <Badge tone="warning" dot>
        In review
      </Badge>
    ),
  },
};
