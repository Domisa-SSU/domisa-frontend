
import logo from "../assets/domisaLogo.svg"

function Header() {
    return (
        <div className="py-2.5 flex justify-center">
            <img src={logo} alt="" className="w-[3.35rem] h-[1.971rem]"/>
        </div>
    );
}

export default Header;