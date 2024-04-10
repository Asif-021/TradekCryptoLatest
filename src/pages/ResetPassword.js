// ResetPassword.js
import { useState } from 'react';
import { auth } from '@/app/db.js'; 
import { sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'next/router';
import React from 'react';
import styles from "../styles/resetPassword.module.css"; 


const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false); // State to track password reset success
  const [error, setError] = useState(false); // State to track error
  const router = useRouter();

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Please check your inbox. Redirecting you to homepage...');
      setResetSuccess(true); 
      setError(false); 
    } catch (error) {
      setMessage('Error resetting password: ' + error.message);
      setError(true); 
    }
  };

  // Redirect to homepage if reset was successful
  if (resetSuccess) {
    setTimeout(() => {
      router.push('/');
    }, 3000);
  }

  return (
    <div className={styles.container}> 
      <div className={styles.main}> 
        <h1 className={styles.title}>Reset Password</h1> 
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className={styles.input} 
        />
        <button onClick={handleResetPassword} className={styles.button}>Reset Password</button> 
        {error && <div className={styles.errorBox}>Error: {message}</div>} 
        {resetSuccess && <div className={styles.successBox}>Success: {message}</div>}
      </div>
    </div>
  );
};

export default ResetPassword;





