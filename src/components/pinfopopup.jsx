import React, {useEffect, useState} from "react";
import { doc, updateDoc, query, where, collection, getDocs} from 'firebase/firestore';
import {firestore} from "../app/db.js";
import '../styles/pinfopopup.css';


async function changeSubmit(option, dbData, input, setData, setInputValue, setErrors, togglePopup, errors){
        
    
    try{
        const dbDoc = doc(firestore, 'User Info', dbData.docID)
        const dummy = {...dbData}
        if  (input != ""){  
            switch (option.toLowerCase()){
                case "email":
                    // Check if the new email already exists in the database
                    const eQ = query(collection(firestore, 'User Info'), where('email', '==', input));
                    const eResult = await getDocs(eQ);
                    if (!eResult.empty) {
                        setErrors(p => ({...p, emailDupe: true}))
                        console.log(errors);
                        return;
                    }

                    await updateDoc(dbDoc, {"email": input}); 
                    dummy.email = input;
                    setData(dummy)
                    console.log("Email changed to: ",input);
                    togglePopup();
                    break;
                case "username":
                    // Check if the new username already exists in the database
                    const uQ = query(collection(firestore, 'User Info'), where('username', '==', input));
                    const uResult = await getDocs(uQ);
                    if (!uResult.empty) {
                        setErrors(p => ({...p, usernameDupe: true}))
                        return;
                    }
                    await updateDoc(dbDoc, {"username": input}); 
                    dummy.username = input;
                    console.log(dummy);
                    setData(dummy);
                    console.log("Username changed to: ",input);
                    togglePopup();
                    break;
                case "password":
                    await updateDoc(dbDoc, {"password": input}); 
                    dummy.password = input;
                    setData(dummy);
                    console.log("Password changed to: ",input);
                    togglePopup();
                    break;
                default:
                    return null;
                }
                setInputValue("");

            } else {
                alert('Please make sure all fields are filled out correctly!');
                setErrors(p => ({...p, emptyInput: true}));
                
            }

    } catch(e){console.error(e)}
}


export default function Popup(props){
    const [pop, setPopup] = useState(false); 
    const [option, setOption] = useState('null');
    const [placeholder, setPlaceholder] = useState('');
    const [inputType, setInputType] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [errors, setErrors] = useState(null);


    const handleChange = (e) => {
        setInputValue(e.target.value);
    }

    const togglePopup = () =>{
        setPopup(p => !p);
        setErrors({});
    }

    useEffect(() =>{
        switch (props.option){
            case "email":
                setOption('Email');
                setPlaceholder('example@email.com');
                setInputType('email');
                break;
            case "username":
                setOption('Username');
                setPlaceholder('Username');
                setInputType('text');
                break;
            case "password":
                setOption("Password");
                setPlaceholder('Password');
                setInputType('password');
                break;
            default:
                return null;
            }
        }, [props.option]);
    



    return(
        <>
            <button className="pop-btn" onClick={togglePopup}>Change {option}</button>

            {pop && (
                <div className="popup">
                    
                    <div className="overlay" onClick={togglePopup}></div>
                    <div className="pop-container">
                        <div className="form">
                            <h1>Change {option}</h1>
                            <div className="new-input">
                                <div className={`input-container ${Object.keys(errors).length ? '-error' : ""}`}>
                                    <label>Please enter your new {option.toLowerCase()}: </label>
                                    <input type={inputType} value={inputValue} onChange={handleChange} placeholder={placeholder}/>
                                </div>
                                {(errors.emailDupe || errors.usernameDupe) && <div className='error'>This {option.toLowerCase()} is already in use</div>}
                                <div className="submitbtn-container">
                                    <button id="submit" onClick={() => {changeSubmit(option, props.data, inputValue, props.setData, setInputValue, setErrors, togglePopup, errors)}}>Submit</button>
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