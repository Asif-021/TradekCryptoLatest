import styles from "../styles/wallet.css";
import  { useState, useEffect } from "react";
import Popup from '../components/walletpopup.jsx';
import {firestore} from "../app/db.js";
import { collection, getDocs, query, where } from 'firebase/firestore';


export default function Wallet(props) {

    

    return(
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
                {/* <div className="convert-container">
                    <Popup option="convert" data={props.data} setData={props.setData}/>
                </div> */}
            </div>
        </div>
        

    )


}