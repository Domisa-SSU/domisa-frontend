import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import NotLoginHeader from './NotLoginHeader';

const meta: Meta<typeof NotLoginHeader> = {
  title: 'Components/NotLoginHeader',
  component: NotLoginHeader,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    title: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof NotLoginHeader>;

export const Default: Story = {
  args: { title: '내정보' },
};

export const IntroduceFriend: Story = {
  name: '친구 소개하기',
  args: { title: '친구 소개하기' },
};

export const EditProfile: Story = {
  name: '정보 수정',
  args: { title: '정보 수정' },
};