import { forwardRef, type ReactNode } from "react";
import Button from "./Button/Button";

type BottomActionBarProps = {
    label: string;
    disabled?: boolean;
    onClick?: () => void;
    topContent?: ReactNode;
};

const BottomActionBar = forwardRef<HTMLDivElement, BottomActionBarProps>(function BottomActionBar({
    label,
    disabled = false,
    onClick,
    topContent,
}, ref) {
    return (
        <div ref={ref} className="fixed bottom-0 left-1/2 w-full frame-max-w -translate-x-1/2 bg-grey-100 px-5 pt-[0.62rem] pb-[2.94rem]">
            <div className="mx-auto flex w-full max-w-[22.625rem] flex-col items-center gap-2.5">
                {topContent}
                <Button
                    label={label}
                    disabled={disabled}
                    onClick={onClick}
                />
            </div>
        </div>
    );
});

export default BottomActionBar;
