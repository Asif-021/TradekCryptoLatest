// SignIn.jsx
import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useRouter } from 'next/router';
import { auth, firestore } from '@/app/db.js';
import Link from 'next/link';
import React from 'react';
import styles from "../styles/signIn.css"; 

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // State to hold error message
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/homePage');
    } catch (error) {
      console.error('Sign-in error:', error.message);
      setErrorMessage('Invalid email or password. Please try again.'); // Set error message
    }
  };



  const handleSignUp = () => {
    router.push('/signup');
  };

  const toggleResetPasswordModal = () => {
    setIsResetPasswordModalOpen(!isResetPasswordModalOpen);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
        <h1 className="text-white text-2xl mb-5">Sign In</h1>
        {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>} {/* Display error message */}
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />
        <button 
          onClick={handleSignIn}
          className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
        >
          Sign In
        </button>
        <button onClick={handleSignUp} className="w-full p-3 mt-2 bg-gray-600 rounded text-white hover:bg-gray-700">
          Sign Up
        </button>
        <div>
          <a href="/ResetPassword">Forgot Password?</a>
        </div>
      </div>
    </div>
  );
};

export default SignIn;

