import React, { useState } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { firestore} from "../app/db.js";
import {getStorage, ref, uploadBytes, getDownloadURL} from "firebase/storage";


// Checks only allowed file types (images) are uploaded
const isFileAllowed = (filename) => {
    // Array of allowed file types
    const allowedFileTypes = ["jpeg", "png", "jpg"];

    console.log(allowedFileTypes);
    // Isolates extension
    const extension = filename.split(".").pop().toLowerCase();

    console.log(extension);

    // Returns boolean if filetype is permitted
    return allowedFileTypes.includes(extension);
}

function UploadFile(props) {

    const [selectedFile, setSelectedFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState({});

  
    const handleFileChange = (e) => {
      const file = e.target.files[0];

      // Checks if file type is allowed
        if(!isFileAllowed(file.name)) {
            setErrors(p => ({...p, typeError: true}));
            setSuccess(false);
            return;
        }
        else{
            setErrors(p => ({...p, typeError: false}));
        }


        // When a new file is selected, checks it meets size requirements
        const maxFileSize = 10 * 1024 * 1024;

        if (file.size > maxFileSize){
            setErrors(p => ({...p, sizeError: true}));
            setSuccess(false);
            return;
        }
        else{
            setErrors(p => ({...p, sizeError: false}));
        }

        setSelectedFile(file);
        setSuccess(p => ({...p, validType: true}));
      
    };
  
    const handleUpload = async () => {
      if (selectedFile) {
        // Creates a unique filename to make sure there are no clashes with existing files in the database
        const uniqueFilename = `${Date.now()}_${selectedFile.name}`;

        // Creates a reference to the storage 

        const storage = getStorage();
        const fileRef = ref(storage, `Identification Documents/${uniqueFilename}`);
  
        try {
          // Upload the file to Firebase Storage
          await uploadBytes(fileRef, selectedFile).then((snapshot) => {
            console.log("File uploaded")
          });
  
          // Get the download URL of the uploaded file
          const downloadURL = await getDownloadURL(ref(storage, `Identification Documents/${uniqueFilename}`));
          
          console.log("retrieved url");
          console.log(downloadURL);

          // Update the db with the download URL
          const userDoc = doc(firestore, 'User Info', props.data.docID);
          console.log(userDoc)
          await updateDoc(userDoc, {"idURL": downloadURL} );
          console.log("Upload and Update complete");
  
          // Reset the state
          setSelectedFile(null);
          setErrors({});
          setSuccess(() => ({uploaded: true}));
          props.setUploaded(true);

  
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      }
    };
  
    return (
      <div className="upload-container">
        {!success.uploaded && (
          <div className="upload-submission">
              <input type="file" onChange={handleFileChange} />
              <button onClick={handleUpload}>Upload Identification</button>
          </div>
          )}
        {errors.typeError && <div className="error">Invalid File Type! Please select an image file (.jpg/.jpeg/.png)</div>}
        {errors.sizeError && <div className="error">Invalid File Size! Please select an image file below 10MB</div>}
        {success.validType && <div className="success">Valid File Size and Type! Ready to upload.</div>}
        {success.uploaded && <div className="success">Upload successful, awaiting approval</div>}
      </div>
    );
  }
  
  export default UploadFile;
