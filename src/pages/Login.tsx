import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const normalizedRole = (userData.role || 'new user').toLowerCase();
        setUser({
          id: userCredential.user.uid,
          email: email,
          role: normalizedRole,
          name: userData.name || ''
        });
        navigate('/');
      } else {
        setError("User profile not found.");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDocRef = doc(db, "users", user.uid);
      let userDoc = await getDoc(userDocRef);

      // If user doc doesn't exist, create it with Google displayName
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName || "",
          email: user.email,
          role: "new user"
        });
      } else {
        // If user doc exists but has no name, update it
        const userData = userDoc.data();
        if (!userData.name && user.displayName) {
          await setDoc(userDocRef, { ...userData, name: user.displayName }, { merge: true });
        }
      }
      // Always fetch the latest user doc for name/role
      userDoc = await getDoc(userDocRef);
      const userProfile = userDoc.data();
      const normalizedRole = (userProfile?.role || 'new user').toLowerCase();
      setUser({
        id: user.uid,
        email: user.email || '',
        role: normalizedRole,
        name: userProfile?.name || user.displayName || ''
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-2 sm:p-6 md:p-10">
      {/* Top Title */}
      <div className="mb-4 sm:mb-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">CRM</h1>
        <p className="text-gray-500 mt-1">Sign in to your account</p>
      </div>
      {/* Card */}
      <form onSubmit={handleLogin} className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow w-full max-w-xs sm:max-w-sm md:max-w-md space-y-4 mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-1">Welcome back</h2>
        <p className="text-gray-500 text-center text-sm mb-4">Enter your credentials to access your dashboard</p>
        {/* Google Sign-In Button */}
        <Button
          type="button"
          className="w-full bg-black hover:bg-black-600 text-white font-semibold py-2 rounded text-base mb-2 flex items-center justify-center gap-2"
          onClick={handleGoogleSignIn}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_17_40)">
              <path d="M47.5 24.5C47.5 22.6 47.3 21 47 19.4H24V28.7H37.6C37.1 31.2 35.5 33.3 33.1 34.8V40.1H41C45.1 36.3 47.5 30.9 47.5 24.5Z" fill="#4285F4"/>
              <path d="M24 48C30.5 48 35.9 45.9 41 40.1L33.1 34.8C30.5 36.5 27.5 37.5 24 37.5C17.7 37.5 12.2 33.4 10.3 27.9H2.1V33.3C7.2 41.1 15.1 48 24 48Z" fill="#34A853"/>
              <path d="M10.3 27.9C9.8 26.2 9.5 24.5 9.5 22.7C9.5 20.9 9.8 19.2 10.3 17.5V12.1H2.1C0.7 15 0 18.2 0 22.7C0 27.2 0.7 30.4 2.1 33.3L10.3 27.9Z" fill="#FBBC05"/>
              <path d="M24 9.5C27.2 9.5 29.9 10.6 31.9 12.5L39.1 5.3C35.9 2.3 30.5 0 24 0C15.1 0 7.2 6.9 2.1 12.1L10.3 17.5C12.2 12.1 17.7 9.5 24 9.5Z" fill="#EA4335"/>
            </g>
            <defs>
              <clipPath id="clip0_17_40">
                <rect width="48" height="48" fill="white"/>
              </clipPath>
            </defs>
          </svg>
          Sign in with Google
        </Button>
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-.876 1.797l-7.5 5.625a2.25 2.25 0 01-2.648 0l-7.5-5.625A2.25 2.25 0 012.25 6.993V6.75" /></svg>
            </span>
            <input
              id="email"
              type="email"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="admin@crmpro.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.5a4.5 4.5 0 10-9 0v3m12 0A2.25 2.25 0 0119.5 12.75v6A2.25 2.25 0 0117.25 21H6.75A2.25 2.25 0 014.5 18.75v-6A2.25 2.25 0 016.75 10.5h10.5zm-6 3.75h.008v.008H12.5v-.008z" /></svg>
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="admin123"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 focus:outline-none">
              {/* Eye/Eye-off icon */}
              {showPassword ? (
                // Eye icon
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12C3.5 7.5 7.5 4.5 12 4.5c4.5 0 8.5 3 9.75 7.5-1.25 4.5-5.25 7.5-9.75 7.5-4.5 0-8.5-3-9.75-7.5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ) : (
                // Eye-off icon
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A9.956 9.956 0 002.25 12c1.25 4.5 5.25 7.5 9.75 7.5 2.04 0 3.95-.61 5.54-1.66M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.36-4.36A9.956 9.956 0 0121.75 12c-.27.86-.67 1.66-1.18 2.4M9.88 9.88a3 3 0 104.24 4.24" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {/* Remember me and Forgot password */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
          <label className="flex items-center text-sm">
            <input type="checkbox" className="form-checkbox rounded text-blue-600 mr-2" checked={remember} onChange={e => setRemember(e.target.checked)} />
            Remember me
          </label>
          <a href="#" className="text-blue-600 text-sm hover:underline">Forgot password?</a>
        </div>
        {/* Error */}
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {/* Sign in button */}
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded text-base">Sign in</Button>
      </form>
    </div>
  );
} 