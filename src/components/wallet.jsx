import styles from "../styles/wallet.css";
import  { useState, useEffect } from "react";
import Popup from '../components/walletpopup.jsx';
import {firestore} from "../app/db.js";
import { collection, getDocs, query, where } from 'firebase/firestore';


export default function Wallet(props) {

    const [currentHoldings, setCurrentHoldings] = useState();

    useEffect( () => {
        const fetchData = async () => {
            const q = query(collection(firestore,"cryptoHoldings"),where("userID", "==", props.data.docID));
            const qSnapshot = await getDocs(q);
            const result = qSnapshot.docs[0].data();
            setCurrentHoldings(result);
            console.log(result);
        }
        fetchData();
    },[]);

    return(
        <>
        {props.data.approved &&
        <>
        <div className="balance">
            <p>Balance: ${Math.floor(props.data.balance * 100) / 100}</p>
            <div className="wallet-actions">
                <div className="deposit-container">
                    <Popup option="deposit" data={props.data} setData={props.setData}/>
                </div>
                <div className="withdraw-container">
                    <Popup option="withdraw" data={props.data} setData={props.setData}/>
                </div>
                <div className="transfer-container">
                    <Popup option="transfer" data={props.data} setData={props.setData}/>
                </div>
            </div>
        </div>
        {currentHoldings && Object.keys(currentHoldings.holdings).length > 0 && (
                    <>
                        <div className="holdings">You are currently holding:</div>
                        <ul>
                            {Object.keys(currentHoldings.holdings).map((key) => (
                                <li key={key}>
                                    <p>{key}: {currentHoldings.holdings[key].toFixed(10)}</p>
                                    
                                </li>
                            ))}
                        </ul>
                    </>
                )}
        </>
        }
        {!props.data.approved && <div>Your account must be approved before you can access wallet.</div>}
        </>

    )


}