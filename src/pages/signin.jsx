'use client';
import { useState } from 'react';
import { auth } from '@/app/db.js'; // Check the path
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      // Sign in with email and password
      await signInWithEmailAndPassword(auth, email, password); // Pass `auth` as first parameter
      
      // If sign-in is successful, set localstorage variables and redirect to the homepage
      localStorage.setItem('isLoggedIn', true);
      localStorage.setItem('email', email);
      router.push('/');
    } catch (error) {
      // Display an error message if sign-in fails
      console.error('Sign-in error:', error.message);
      // You can set a state variable here to display the error message to the user
    }
  };

  const handleSignUp = () => {
    // Redirect to sign-in page using Next.js router
    window.location.href = '/signup';
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
        <h1 className="text-white text-2xl mb-5">Sign In</h1>
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
      </div>
    </div>
  );
};

export default SignIn;