import type { Meta, StoryObj } from "@storybook/react-vite";
import AlarmModal from "./AlarmModal";

const meta: Meta<typeof AlarmModal> = {
  title: "Components/AlarmModal",
  component: AlarmModal,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    onClose: () => {},
    onConfirm: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof AlarmModal>;

export const Like: Story = {
  args: {
    type: "LIKE",
  },
};

export const Match: Story = {
  args: {
    type: "MATCH",
  },
};

export const Signup: Story = {
  args: {
    type: "SIGNUP",
  },
};

export const Referral: Story = {
  args: {
    type: "REFERRAL",
  },
};
