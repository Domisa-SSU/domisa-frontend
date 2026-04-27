import type { Meta, StoryObj } from '@storybook/react-vite';
import Button from './Button';
import { ButtonSize, ButtonVariant } from './ButtonEnums';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: Object.values(ButtonVariant),
    },
    size: {
      control: { type: 'select' },
      options: Object.values(ButtonSize),
    },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const MainAble: Story = {
  name: 'Main / Able',
  args: { label: '다음', variant: ButtonVariant.Main, disabled: false },
};

export const MainDisable: Story = {
  name: 'Main / Disable',
  args: { label: '다음', variant: ButtonVariant.Main, disabled: true },
};

export const Muted: Story = {
  args: { label: '수정하기', variant: ButtonVariant.Muted, disabled: false },
};

export const SmallAble: Story = {
  name: 'Small / Able',
  args: { label: '친구 소개하기', variant: ButtonVariant.Main, size: ButtonSize.Small, disabled: false },
};

export const SmallDisable: Story = {
  name: 'Small / Disable',
  args: { label: '친구 소개하기', variant: ButtonVariant.Main, size: ButtonSize.Small, disabled: true },
};
