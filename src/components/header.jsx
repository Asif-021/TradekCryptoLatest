"use client"
import gstyles from "../app/globals.css";
import styles from '../styles/header.css';
import { useState, useEffect } from "react";
import Link from "next/link";



const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState("")

    useEffect(() => {
        // Check if localStorage is available
        const isLocalStorageAvailable = typeof window !== "undefined" && window.localStorage;
        if (isLocalStorageAvailable) {
            // Check if user is logged in when component mounts
            const loggedIn = localStorage.getItem("isLoggedIn") === "true";
            setIsLoggedIn(loggedIn);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('email');
        setIsLoggedIn(false);
    };


    return(
        <header>
            <div className="header-container">
                <Link href="./homePage">
                    <p id="tradek">Tradek</p>
                </Link>
                {isLoggedIn ? (
                    <button id="logout-btn" onClick={handleLogout}>Logout</button>
                ) : (
                    <Link href="./signin">
                        <button id="sign-btn">Sign in</button>
                    </Link>
                )}
            </div>
        </header>
    )
}

export default Header;