import gstyles from "../app/globals.css";
import styles from '../styles/header.css';
import Link from "next/link";



const Header = () => {
    return(
        <header>
            <div className="header-container">
                <Link href="./homePage">
                    <p id="tradek">Tradek</p>
                </Link>
                <Link href="./signin">
                    <button id="sign-btn">Sign in</button>
                </Link>
            </div>
        </header>
    )
}

export default Header;