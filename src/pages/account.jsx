// import styles from "../app/page.module.css";
import gstyles from "../app/globals.css";
import aStyles from "../styles/account.module.css";
import Header from "../components/navbar.jsx";
import Pinfo from "../components/pinfo";
import Wallet from "../components/wallet";
import Management from "../components/management.jsx";
import SearchAccount from "@/components/searchAccount";
import TransHistory from "@/components/transactionHistory";
import Portfolio from "../components/portfolio";
import { useState, useEffect } from "react";
import {firestore, auth} from "../app/db.js";
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useRouter } from 'next/router';




// const email = "admin@email";
// const email = "user@email";
// const email = "idtest@gmail";
// const email = localStorage.getItem("email");
// const email = "reject@gmail.com";
// const email = "user@gmail.com";

export default function Account() {

    const router = useRouter();
    const [activeSetting, setActiveSetting] = useState("pinfo");
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false); 
    const [data, setData] = useState("");
    
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                // User is signed in.
                setUser(user);
                // Fetch user data
                fetchData(user);
            } else {
                // No user is signed in.
                setUser(null);
                // Redirect to login page
                router.push("/homePage");
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchData = async (user) => {
        try {
            const email = user.email;
            const q = query(collection(firestore, "User Info"), where('email', '==', email));
            const result = await getDocs(q);
            if (!result.empty) {
                const docID = result.docs[0].id;
                const userData = result.docs[0].data();
                const fullSet = {...userData, docID: docID };
                setData(fullSet);
            }
        } catch (error) {
            console.error("Error getting documents: ", error);
        }
    };

    // useEffect(() => {
    //     // Check if user is logged in
    //     const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    //     setIsLoggedIn(isLoggedIn);

    //     // If user is not logged in, redirect to login page
    //     if (!isLoggedIn) {
    //         router.push("/signin")
    //     } 
    //     else{
    //         // Fetch data asynchronously
    //         async function getData() {
    //             try {
    //                 const email = localStorage.getItem("email");
    //                 if (email){
    //                     const q = query(collection(firestore, "User Info"), where('email', '==', email));
    //                     const result = await getDocs(q);
    //                     if (result.empty) {
    //                         console.log("No results");
    //                         setData(null); // Update data state
    //                     } else {
    //                         const docID = result.docs[0].id;
    //                         const userData = result.docs[0].data();
    //                         const fullSet = {...userData, docID:docID };  
    //                         setData(fullSet); // Update data state
    //                     }
    //                 }
    //             } catch (error) {
    //                     console.error("Error getting documents: ", error);
    //             }
    //         }
    //         getData(); // Call getData when component mounts
    //     }
       
    // }, []); // Empty dependency array ensures useEffect runs once on component mount
    
    const renderSetting = () => {

        switch(activeSetting){
            case "pinfo":
                return <Pinfo data={data} setData={setData}/>;
            case "wallet":
                return <Wallet data={data} setData={setData}/>;
            case "transHistory":
                    return  <TransHistory data={data} setData={setData}/>;
            case "portfolio":
                return <Portfolio data={data} setData={setData}/>;;
            case "management":
                return <Management data={data} setData={setData}/>;
            case "searchAccount":
                return <SearchAccount data={data} setData={setData} />;
            
            default:
                return null

        }
    }
    
    return (
        <>
        <Header />
        <main className={aStyles.main}>
            <div className={aStyles['options-settings-container']}>
                <div className={aStyles['account-options']}>
                    <ul>
                        <li onClick={() => setActiveSetting("pinfo")}>Personal Information</li>
                        {/* <li onClick={() => setActiveSetting("wallet")}>Wallet</li>
                        <li onClick={() => setActiveSetting("transHistory")}>Transaction History</li>
                        <li onClick={() => setActiveSetting("portfolio")}>Portfolio</li> */}
                        {!data.admin && <>
                                            <li onClick={() => setActiveSetting("wallet")}>Wallet</li>
                                            <li onClick={() => setActiveSetting("transHistory")}>Transaction History</li>
                                            <li onClick={() => setActiveSetting("portfolio")}>Portfolio</li>
                                        </>}
                        {data.admin && <li onClick={() => setActiveSetting("management")}>Management</li>}
                        {data.admin && <li onClick={() => setActiveSetting("searchAccount")}>Search Account</li>}
                    </ul>
                </div>
                <div className={aStyles.settings}>
                    {renderSetting()}
                </div>
            </div>
        </main>
        </>
    );
}
