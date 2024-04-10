"use client"
import gstyles from "../app/globals.css";
import styles from '../styles/header.css';
import { useState, useEffect } from "react";
import Link from "next/link";
import {auth} from "../app/db.js"




// const NavBar = () => {
//     const [isLoggedIn, setIsLoggedIn] = useState("")

//     useEffect(() => {
//         // Check if localStorage is available
//         const isLocalStorageAvailable = typeof window !== "undefined" && window.localStorage;
//         if (isLocalStorageAvailable) {
//             // Check if user is logged in when component mounts
//             const loggedIn = localStorage.getItem("isLoggedIn") === "true";
//             setIsLoggedIn(loggedIn);
//         }
//     }, []);

//     const handleLogout = () => {
//         localStorage.removeItem('isLoggedIn');
//         localStorage.removeItem('email');
//         setIsLoggedIn(false);
//     };


//     return(
//         <header>
//             <div className="header-container">
//                 <Link href="./homePage">
//                     <p id="tradek">Tradek</p>
//                 </Link>
//                 {isLoggedIn ? (
//                     <>
//                     <div className="button-img">
//                         <button id="logout-btn" onClick={handleLogout}>Logout</button>
//                         <Link href="./account" id="profile-img-container">
//                             <img src="/profile.png" alt="profile picture" />
//                         </Link>
//                     </div>
//                     </>
//                 ) : (
//                     <Link href="./signin">
//                         <button id="sign-btn">Sign in</button>
//                     </Link>
//                 )}
//             </div>
//         </header>
//     )
// }

// export default NavBar;



const Header = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                // User is signed in.
                setUser(user);
            } else {
                // No user is signed in.
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <header>
            <div className="header-container">
                <Link href="/">
                    <p id="tradek">Tradek</p>
                </Link>
                {user ? (
                    <div className="button-img">
                        <button id="logout-btn" onClick={handleLogout}>Logout</button>
                        <Link href="/account" id="profile-img-container">
                            <img src="/profile.png" alt="profile picture" />
                        </Link>
                    </div>
                ) : (
                    <div className="button-img">
                        <Link href="/signin" id="sign-btn-link">
                            <button id="sign-btn">Sign in</button>
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
