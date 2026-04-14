import type { ReactNode } from "react";

type BottomActionBarProps = {
    children: ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    topContent?: ReactNode;
};

function BottomActionBar({
    children,
    disabled = false,
    onClick,
    topContent,
}: BottomActionBarProps) {
    return (
        <div className="fixed inset-x-0 bottom-0 bg-grey-100 px-5 pt-[0.62rem] pb-[2.94rem]">
            <div className="mx-auto flex w-full max-w-[22.625rem] flex-col items-center gap-2.5">
                {topContent}
                <button
                    type="button"
                    disabled={disabled}
                    onClick={onClick}
                    className={`flex h-[3.125rem] w-full items-center justify-center rounded-[0.875rem] typo-button-text-b ${
                        disabled
                            ? "bg-grey-400 text-grey-100"
                            : "bg-primary-500 text-grey-100"
                    }`}
                >
                    {children}
                </button>
            </div>
        </div>
    );
}

export default BottomActionBar;
