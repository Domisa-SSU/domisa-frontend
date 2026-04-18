import type { ReactNode } from "react";
import Button from "./Button/Button";

type BottomActionBarProps = {
    label: string;
    disabled?: boolean;
    onClick?: () => void;
    topContent?: ReactNode;
};

function BottomActionBar({
    label,
    disabled = false,
    onClick,
    topContent,
}: BottomActionBarProps) {
    return (
        <div className="fixed inset-x-0 bottom-0 bg-grey-100 px-5 pt-[0.62rem] pb-[2.94rem]">
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
}

export default BottomActionBar;
