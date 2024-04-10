import React, { useState } from 'react';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth, firestore } from '@/app/db.js';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import styles from "../styles/signUp.css"; 

async function usernameExists(username) {
  const q = query(collection(firestore, 'User Info'), where('username', '==', username));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

async function emailExists(email) {
  const q = query(collection(firestore, 'User Info'), where('email', '==', email));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

async function addDataToFireStore(name, surname, username, email, password, phoneNumber, dob) {
  try {
    const dateJoined = new Date(); // Get current date/time

    // Add user data to 'User Info' collection
    const userDocRef = await addDoc(collection(firestore, "User Info"), {
      firstName: name,
      lastName: surname,
      username: username,
      email: email,
      password: password,
      admin: false,
      approved: false,
      approvedBy: "",
      balance: 0,
      dateJoined: dateJoined,
      phoneNumber: phoneNumber,
      idURL: "",
      dob: dob,
      rejected: false,
      blocked: false
    });

    // Add user data to 'cryptoHoldings' collection
    const cryptoDocRef = await addDoc(collection(firestore, "cryptoHoldings"), {
      userID: userDocRef.id,
      holdings: {} // Empty holdings map
    });

    console.log("User document written with ID: ", userDocRef.id);
    console.log("Crypto holdings document written with ID: ", cryptoDocRef.id);
    return true;
  } catch (error) {
    console.error("Error adding document: ", error);
    return false;
  }
}

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dob, setDob] = useState('');
  const [termsChecked, setTermsChecked] = useState(false); // New state for checkbox
  const [createUserWithEmailAndPassword, createUserLoading, createUserError] =
    useCreateUserWithEmailAndPassword(auth);
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [dobError, setDobError] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Reset error messages
    setUsernameError('');
    setEmailError('');
    setDobError('');

    // Check if terms are not checked
    if (!termsChecked) {
      alert('Please accept the terms and conditions to sign up.');
      return;
    }

    // Check if any of the fields are empty
    if (!name || !surname || !username || !email || !password || !phoneNumber || !dob) {
      alert('Please fill out all fields.');
      return;
    }

    // Check if username already exists
    const usernameExistsResult = await usernameExists(username);
    if (usernameExistsResult) {
      setUsernameError('Username already exists. Please choose a different username.');
      return;
    }

    // Check if email already exists
    const emailExistsResult = await emailExists(email);
    if (emailExistsResult) {
      setEmailError('Email already exists. Please use a different email address.');
      return;
    }

    // Calculate age based on the provided date of birth
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Check if user is over 18 years old
    if (age < 18) {
      setDobError('You must be at least 18 years old to sign up.');
      return;
    }

    try {
      if (createUserLoading) {
        // Show a loading indicator while creating user
        return;
      }
      if (createUserError) {
        // Handle sign-up errors
        console.error(createUserError);
        return;
      }

      const res = await createUserWithEmailAndPassword(email, password);
      console.log({ res });
      sessionStorage.setItem('user', true);
      setEmail('');
      setPassword('');

      const added = await addDataToFireStore(name, surname, username, email, password, phoneNumber, dob);
      if (added) {
        setName('');
        setSurname('');
        setUsername('');
        setEmail('');
        setPassword('');

        // Redirect to the homepage after successful signup
        window.location.href = '/'; // Change '/' to the actual homepage URL
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignIn = () => {
    // Redirect to sign-in page using Next.js router
    window.location.href = '/signin';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
        <form onSubmit={handleSignUp}> {/* Add onSubmit handler */}
          <legend className="text-white text-2xl mb-5">Sign Up</legend>
          <input
            type="text"
            placeholder="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
            required 
          />
          <input
            type="text"
            placeholder="surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
            required 
          />
          {usernameError && <p className="text-red-500">{usernameError}</p>}
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
            required  
          />
          {emailError && <p className="text-red-500">{emailError}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
            required 
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
            required
          />
          {dobError && <p className="text-red-500">{dobError}</p>}
          <input
            type="date"
            placeholder="Date of Birth"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
            required
          />
          

          {/* Checkbox for terms and conditions */}
          <label className="flex items-center text-white mb-4">
            <input
              type="checkbox"
              checked={termsChecked}
              onChange={() => setTermsChecked(!termsChecked)}
              className="mr-2"
            />
            I agree to the terms and conditions
          </label>

          <button type="submit" className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500">
            Sign Up
          </button>
          <button onClick={handleSignIn} className="w-full p-3 mt-2 bg-gray-600 rounded text-white hover:bg-gray-700">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;

