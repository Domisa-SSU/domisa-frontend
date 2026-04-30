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
    notification: {
      notificationId: 1,
      userId: 1,
      type: "LIKE",
      title: "새로운 호감이 도착했어요",
      content: "누군가 나에게 호감을 보냈어요!",
      isRead: false,
      createdAt: "2026-04-30T12:00:00",
    },
  },
};

export const Match: Story = {
  args: {
    notification: {
      notificationId: 2,
      userId: 1,
      type: "MATCH",
      title: "쌍방 매칭이 됐어요",
      content: "쌍방 매칭이 이뤄졌어요!",
      isRead: false,
      createdAt: "2026-04-30T12:00:00",
    },
  },
};

export const Cookie: Story = {
  args: {
    notification: {
      notificationId: 3,
      userId: 1,
      type: "COOKIE",
      title: "쿠키 지급",
      content: "친구가 추천인 코드로 가입했어요! 쿠키 20개 지급 완료",
      isRead: false,
      createdAt: "2026-04-30T12:00:00",
    },
  },
};