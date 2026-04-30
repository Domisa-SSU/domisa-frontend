import logo from "../assets/domisaLogo.svg";

type HeaderTopProps = {
  rightLabel?: string;
  onRightClick?: () => void;
};

function Header({ rightLabel, onRightClick }: HeaderTopProps) {
  return (
    <div className="relative flex justify-center py-2.5">
      <img src={logo} alt="" className="h-[1.971rem] w-[3.35rem]" />
      {rightLabel && (
        <button
          type="button"
          onClick={onRightClick}
          className="absolute right-5 top-1/2 -translate-y-1/2 typo-comment-1 text-grey-700"
        >
          {rightLabel}
        </button>
      )}
    </div>
  );
}

export default Header;
