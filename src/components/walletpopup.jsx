import React, {useEffect, useState} from "react";
import { doc, updateDoc} from 'firebase/firestore';
import {firestore} from "../app/db.js";
import { collection, getDocs, getDoc, query, where, addDoc } from 'firebase/firestore';
import '../styles/pinfopopup.css';
import '../styles/wpopup.css';



async function changeSubmit(option, dbData, amount, recipient, setData, setAmount, setErrors, togglePopup, setRecipient){
    try{
        const dbDoc = doc(firestore, 'User Info', dbData.docID)
        const dummy = {...dbData}
        
        let newbalance = 0;

        // Checks for error cases
        if (amount === "" || amount === "0") {
            setErrors(p => ({ ...p, amountError0: true }));
        } else {
            setErrors(p => ({ ...p, amountError0: false }));
        }
            switch (option.toLowerCase()){
                case "deposit":   
                    // Update user balance in the database
                    newbalance = parseFloat(dummy.balance) + parseFloat(amount);
                    dummy.balance = newbalance;
                    await updateDoc(dbDoc, {"balance": newbalance});  
                    setData(dummy);
                    console.log("New balance:", newbalance);

                    // Creates a transaction document to record this deposit
                    await addDoc(collection(firestore, "transaction history"), {
                        Date: new Date(),
                        currency: "USD",
                        cryptoAmount: "",
                        monetaryAmount: parseFloat(amount),
                        type: "deposit",
                        userID: dbData.docID,
                        recipient: ""
                    
                    });
                    togglePopup();
                    break;
                case "withdraw":
                    // Updates user balance in the database
                    newbalance = parseFloat(dummy.balance) - parseFloat(amount);
                    if (newbalance < 0) {
                        setErrors(p => ({...p, amountError: true}));
                    }
                    else {
                        dummy.balance = newbalance;
                        await updateDoc(dbDoc, {"balance": newbalance});  
                        setData(dummy);
                        console.log("New balance:", newbalance);

                        // Creates a transaction document to record this withdrawal
                        await addDoc(collection(firestore, "transaction history"), {
                            Date: new Date(),
                            currency: "USD",
                            cryptoAmount: "",
                            monetaryAmount: parseFloat(amount),
                            type: "withdraw",
                            userID: dbData.docID,
                            recipient: ""
                        });
                        togglePopup();
                    }
                    break;
                case "transfer":

                    // Checks for cases that are not valid
                    newbalance = parseFloat(dummy.balance) - parseFloat(amount);
                    if (newbalance < 0) {
                        setErrors(p => ({...p, amountError: true}));
                        return;
                    }
                    if (recipient===null || recipient===""){
                        setErrors(p => ({...p, usernameError: true}));
                        return;
                    }
                    if (dummy.username === recipient){
                        setErrors(p => ({...p, selfTransferError:true}))
                        return;
                    }
                    
                    // Update senders details
                    dummy.balance = newbalance;
                    await updateDoc(dbDoc, {"balance": newbalance});  
                    setData(dummy);
                    console.log("New balance:", newbalance);

                    // Update recipient details
                    const q = query(collection(firestore, 'User Info'), where ('username','==',recipient));
                    const result = await getDocs(q);
                    if (result.empty){
                        setErrors(p => ({...p, usernameError: true}));
                        return;
                    }
;
                    const recipientDBRef = result.docs[0].ref;
                    const recipientDoc = await getDoc(recipientDBRef);
                    const recipientData = recipientDoc.data();
                    newbalance = parseFloat(recipientData.balance) + parseFloat(amount);
                    await updateDoc(recipientDBRef, {balance: newbalance});

                    // Create a transaction document to record this transfer
                    await addDoc(collection(firestore, "transaction history"), {
                        Date: new Date(),
                        currency: "USD",
                        cryptoAmount: "",
                        monetaryAmount: parseFloat(amount),
                        type: "transfer",
                        userID: dbData.docID,
                        recipient: recipientDoc.id
                    
                    });
                    console.log(`Successfully transferred ${amount} from ${dummy.username} to ${recipientData.username}`);
                    togglePopup();
                    
                    break;
                case "convert":
                    break;
                default:
                    return null;
                }
                setAmount("");
                setRecipient("");
            

    } catch(e){console.error(e)}
}


export default function Popup(props){

    const [pop, setPopup] = useState(false);
    const [option, setOption] = useState('null');
    const [placeholder, setPlaceholder] = useState('0');
    const [inputType, setInputType] = useState('number');
    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState('');
    const [errors, setErrors] = useState(null);


    // Hangles change of amount input
    const handleChange = (e) => {
        setAmount(e.target.value);
    }

    // Handles change of recipient input
    const handleRChange = (e) => {
        setRecipient(e.target.value);
    }

    // Toggles popup and resets states so when reopened, old information does not persist
    const togglePopup = () =>{
        setPopup(p => !p);
        setErrors({});
        setAmount("");
        setRecipient("");

    }

    
    // On mount or change in the option, makes sure to update the state
    useEffect(() =>{
        switch (props.option){
            case "deposit":
                setOption('Deposit');
                break;
            case "withdraw":
                setOption('Withdraw');
            
                break;
            case "transfer":
                setOption("Transfer");
                break;
            case "convert":
                setOption("Convert");
                
                break;
            default:
                return null;
            }
        }, [props.option]);
    



    return(
        <>
            <button className={`pop-btn-${option.toLowerCase()}`} onClick={togglePopup}>{option}</button>

            {pop && (
                <div className="popup">
                    
                    <div className="overlay" onClick={togglePopup}></div>
                    <div className="pop-container">
                        <div className="form">
                            <h1>{option}</h1>
                            <div className={`new-input`}>
                                <div className={`input-container ${option.toLowerCase()=='transfer' ? `-transfer` : ""} ${(errors.amountError || errors.amountError0) ? '-error' : ""}`}>
                                    <label>Please enter an amount to {option.toLowerCase()}: </label>
                                    $<input type={inputType} value={amount} onChange={handleChange} placeholder={placeholder} min="0"/>
                                    
                                </div>
                                {errors.amountError && <div className="error">You cannot withdraw/transfer more than you have in your account</div>}
                                {errors.amountError0 && <div className="error">You cannot withdraw/transfer $0</div>}
                                {option.toLowerCase() == 'transfer' && (
                                        <>
                                        
                                            <div className={`input-recipient ${option.toLowerCase()=='transfer' ? `-transfer` : ""} ${(errors.usernameError || errors.selfTransferError) ? '-error' : ""}`}>
                                                <label>Please enter the username of the recipient:</label>
                                                <input type='text' value={recipient} onChange={handleRChange} placeholder='Recipient Username'/>
                                            </div>
                                            {errors.usernameError && <div className="error">User does not exist</div>}
                                            {errors.selfTransferError && <div className="error">You cannot transfer money to yourself</div>}
                                        </>
                                    )}
                                <div className="submitbtn-container">
                                    <button id="submit" onClick={() => {changeSubmit(option, props.data, amount, recipient, props.setData, setAmount, setErrors, togglePopup, setRecipient)}}>Submit</button>
                                </div>
                            </div>
                        </div>     


                        <button className="close-btn" onClick={togglePopup}>&times;</button>
                    </div>
                    
                </div>
                )}
                
        </>
    )
}