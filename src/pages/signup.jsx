'use client'
import { useState } from 'react';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth, firestore } from '@/app/db.js';
import { collection, addDoc } from 'firebase/firestore';
import React from 'react';

async function addDataToFireStore(name, surname, username, email, password) {
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
      idURL: "",
      rejected: false
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
  const [createUserWithEmailAndPassword, createUserLoading, createUserError] =
    useCreateUserWithEmailAndPassword(auth);

    const handleSignUp = async (e) => {
      e.preventDefault(); // Prevent default form submission behavior
    
      // Check if any of the fields are empty
      if (!name || !surname || !username || !email || !password) {
        alert('Please fill out all fields.');
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
    
        const added = await addDataToFireStore(name, surname, username, email, password);
        if (added) {
          setName('');
          setSurname('');
          setUsername('');
          setEmail('');
          setPassword('');
    
          alert('added successfully');
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
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
            required  
          />
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