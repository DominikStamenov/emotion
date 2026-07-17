import type { Meta, StoryObj } from "@storybook/react-vite";

import { Field, Input, Textarea } from "./field";

const meta: Meta<typeof Field> = {
  title: "eMotion UI/Field",
  component: Field,
  decorators: [
    (Story) => (
      <div style={{ width: "min(88vw, 440px)" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TextInput: Story = {
  args: {
    label: "Project name",
    htmlFor: "project-name",
    hint: "Visible to your eMotion team and client.",
    children: <Input id="project-name" placeholder="Northline platform" />,
  },
};

export const LongForm: Story = {
  args: {
    label: "Project brief",
    htmlFor: "project-brief",
    optional: true,
    children: (
      <Textarea
        id="project-brief"
        placeholder="What are we building together?"
      />
    ),
  },
};

export const Error: Story = {
  args: {
    label: "Email address",
    htmlFor: "email",
    error: "Enter a valid business email address.",
    children: (
      <Input
        id="email"
        type="email"
        value="not-an-email"
        readOnly
        aria-invalid="true"
      />
    ),
  },
};
