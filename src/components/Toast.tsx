import toastCheckIcon from "../assets/toastCheckIcon.svg";

function Toast({ message }: { message: string }) {
    return (
        <div className="pointer-events-none fixed inset-x-5 bottom-[7.25rem] z-50">
            <div className="animate-toast-fade-out mx-auto flex w-full max-w-[22.5625rem] items-center justify-between rounded-[0.3125rem] bg-[rgba(0,0,0,0.7)] px-5 py-2.5">
                <p className="text-[1rem] leading-[1.1875rem] font-semibold text-grey-100">
                    {message}
                </p>
                <img
                    src={toastCheckIcon}
                    alt=""
                    className="h-[1.5947rem] w-[1.5947rem] shrink-0"
                />
            </div>
        </div>
    );
}

export default Toast;
