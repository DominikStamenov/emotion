import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button, type ButtonProps } from "./button";

const meta: Meta<ButtonProps> = {
  title: "eMotion UI/Button",
  component: Button,
  parameters: { layout: "centered" },
  args: {
    children: "Start a project",
    trailingIcon: <span>↗</span>,
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "danger"],
    },
    size: {
      control: "select",
      options: ["small", "medium", "large"],
    },
  },
};

export default meta;
type Story = StoryObj<ButtonProps>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: "secondary", children: "View our work" },
};

export const Loading: Story = {
  args: { loading: true, children: "Creating project" },
};

export const Danger: Story = {
  args: { variant: "danger", children: "Delete draft", trailingIcon: null },
};
