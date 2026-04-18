import type { Meta, StoryObj } from '@storybook/react-vite';
import BottomActionBar from './BottomActionBar';

const meta: Meta<typeof BottomActionBar> = {
  title: 'Components/BottomActionBar',
  component: BottomActionBar,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof BottomActionBar>;

export const Able: Story = {
  args: { label: '다음', disabled: false },
};

export const Disable: Story = {
  args: { label: '다음', disabled: true },
};

export const WithTopContent: Story = {
  args: {
    label: '다음',
    disabled: false,
    topContent: <p className="typo-button-text text-primary-500">저는 알파카상👀이에요</p>,
  },
};
