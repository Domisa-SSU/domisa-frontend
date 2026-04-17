import type { Meta, StoryObj } from '@storybook/react-vite';
import Toast from './Toast';

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  tags: ['autodocs'],
  argTypes: {
    message: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Default: Story = {
  args: { message: '카카오 로그인이 완료되었어요!' },
};

export const LongMessage: Story = {
  args: { message: '입력하신 정보가 저장되었어요. 다음 단계로 진행해주세요.' },
};
