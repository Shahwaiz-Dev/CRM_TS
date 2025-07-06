import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
      setError('Name, email and password are required');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Create user profile in Firestore with name, email, and default role 'user'
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        role: "new user"
      });
      localStorage.setItem('name', name);
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-2 sm:p-6 md:p-10">
      <form onSubmit={handleSignup} className="bg-white p-4 sm:p-8 rounded shadow w-full max-w-xs sm:max-w-sm space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Sign Up</h2>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required className="w-full" />
        <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full" />
        <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full" />
        <Button type="submit" className="w-full">Sign Up</Button>
        <div className="text-sm text-center">Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a></div>
      </form>
    </div>
  );
} 