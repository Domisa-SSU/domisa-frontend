import { ButtonSize, ButtonVariant } from './ButtonEnums';

interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  [ButtonVariant.Main]: 'bg-primary-500 text-grey-100',
  [ButtonVariant.Muted]: 'bg-grey-200 text-grey-700',
};

const sizeStyles: Record<ButtonSize, string> = {
  [ButtonSize.Default]: 'w-full h-[3.125rem] rounded-[0.875rem] typo-button-text-b',
  [ButtonSize.Small]: 'w-full h-[2.8125rem] rounded-[0.625rem] typo-button-text',
};

const Button = ({
  label,
  variant = ButtonVariant.Main,
  size = ButtonSize.Default,
  disabled = false,
  onClick,
  className,
}: ButtonProps) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const classes = [
    'flex items-center justify-center transition duration-200',
    sizeStyles[size],
    disabled ? 'bg-grey-400 text-grey-100 cursor-not-allowed' : variantStyles[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={classes}
    >
      {label}
    </button>
  );
};

export default Button;
