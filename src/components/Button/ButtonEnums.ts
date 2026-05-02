export const ButtonVariant = {
  Main: 'main',
  Muted: 'muted',
} as const;
export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant];

export const ButtonSize = {
  Default: 'default',
  Small: 'small',
} as const;
export type ButtonSize = (typeof ButtonSize)[keyof typeof ButtonSize];
