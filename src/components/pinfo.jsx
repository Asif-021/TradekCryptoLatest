import styles from "../styles/pinfo.css";
import { useEffect, useState } from "react";
import Popup from "./pinfopopup";
import UploadFile from "./uploadFile";




export default function Pinfo(props){

    const [uploaded, setUploaded] = useState(null);
    
    

    return(
        
        <>
            <div className="name">Name: {props.data.firstName} {props.data.lastName}</div>
            <div className="phoneNumber">
                <p>Phone number: {props.data.phoneNumber}</p>
            </div>
            <div className="email">
                <p>Email: {props.data.email}</p> 
                {/* <button onClick={() => handleChangeInfo("changeEmail")}>Change email</button> */}
                {/* <Popup option="email" data={props.data} setData={props.setData}/> */}
            </div>
            
            <div className="username">
                <p>Username: {props.data.username} </p>
                {/* <button>Change Username</button> */}
                <Popup option="username" data={props.data} setData={props.setData}/>
            </div>

            <div className="password">
                {/* <p>Password: {props.data.password}</p> */}
                {/* <button>Change Password</button> */}
                <Popup option="password" data={props.data} setData={props.setData} />
            </div>

            
            {props.data.idURL == "" ?   <UploadFile data={props.data} uploaded={uploaded} setUploaded={setUploaded}/>
                                        : ""}
            {props.data.rejected && <>
                                        <UploadFile data={props.data} uploaded={uploaded} setUploaded={setUploaded}/>
                                        <div className="rejected"> Your submission was rejected, please submit it again </div>
                                    </>}
            {((props.data.idURL !=="") && props.data.approved) && <div className="approved"> Your account is already approved &#x2713;</div>}
            {((props.data.idURL!=="") && !props.data.approved && !props.data.rejected) && <div className="awaiting">Your account is awaiting approval</div>}
                

            
            

        
        </>
    )
}