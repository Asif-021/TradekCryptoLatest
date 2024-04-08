import { useState, useEffect } from "react";
import {firestore} from "../app/db";
import { getDocs, query, where, collection, updateDoc, doc} from 'firebase/firestore';
import "../styles/searchAccount.css";
function searchAccount(){

    const [searchTerm, setSearchTerm] = useState("");  // Will hold search input
    const [user, setUser] = useState(null);  // Will hold search result
    const [errors, setErrors] = useState({})


    const handleSearchChange = (e) =>{
        setSearchTerm(e.target.value);

    }


    const handleSearch = async () =>{
        
        // fetch the data from the db
        const q = query(collection(firestore, 'User Info'), where( 'username', '==', searchTerm));
        const result = await getDocs(q);
        if (result.empty){
            setErrors(p => ({...p, empty: true}));
            return
        }
        else {
            setUser(result.docs[0].data());
            setErrors(p=>({...p, empty: false}));

        }
    }

    const handleBlock = async () => {
        const q = query(collection(firestore, 'User Info'), where( 'username', '==', searchTerm));
        const result = await getDocs(q);
        const userRef = result.docs[0].id;
        const userDoc = doc(firestore, 'User Info', userRef)


        try {

            const newBlockedStatus = !user.blocked;

            console.log(userRef);

            // Update the 'blocked' field in Firestore
            await updateDoc(userDoc, {blocked: newBlockedStatus, approved: false});

            // Update the user state to reflect the change
            setUser(prevUser => ({ ...prevUser, blocked: newBlockedStatus }));

            console.log(user.blocked)
        }
        catch(e){console.error(e);}

    }
    return(

        <>
            <div className="search-container">
                
                <div className="search-form">
                    <input type="text" value={searchTerm} onChange={handleSearchChange} placeholder="Username" />
                    <button id="search-btn"onClick={handleSearch} >Search</button>
                </div>
                {errors.empty && <div className="error">No User found with that username</div>}
                <div className="searchResult">

                {user && <> 
                            <h1>User found</h1>
                            <div className="resultUsername">Username: {user.username}</div>
                            <div className="resultEmail">Email: {user.email}</div>
                            </>}
                        </div>
                        <div className="block-btn-container">
                            {(user && !user.blocked) && <button id="block-btn" onClick={handleBlock}>Block Account</button>}
                            {(user && user.blocked) && <button id="block-btn" onClick={handleBlock}>Unblock Account</button>}
                        </div>
            </div>
            
        </>
    )
}

export default searchAccount;