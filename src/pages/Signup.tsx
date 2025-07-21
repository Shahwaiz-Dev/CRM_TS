import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useLanguage } from '@/contexts/LanguageContext';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
      setError(t('name_email_password_required'));
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-2 sm:p-6 md:p-10">
      {/* Language Switcher */}
      <div className="flex gap-2 mb-4 self-center">
        <button
          onClick={() => setLanguage('en')}
          className={`px-2 py-1 rounded text-sm font-medium border ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          aria-label="Switch to English"
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('el')}
          className={`px-2 py-1 rounded text-sm font-medium border ${language === 'el' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          aria-label="Switch to Greek"
        >
          ΕΛ
        </button>
      </div>
      <form onSubmit={handleSignup} className="bg-white p-4 sm:p-8 rounded shadow w-full max-w-xs sm:max-w-sm space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">{t('sign_up')}</h2>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Input type="text" placeholder={t('name')} value={name} onChange={e => setName(e.target.value)} required className="w-full" />
        <Input type="email" placeholder={t('email')} value={email} onChange={e => setEmail(e.target.value)} required className="w-full" />
        <Input type="password" placeholder={t('password')} value={password} onChange={e => setPassword(e.target.value)} required className="w-full" />
        <Button type="submit" className="w-full">{t('sign_up')}</Button>
        <div className="text-sm text-center">{t('already_have_account')} <a href="/login" className="text-blue-600 hover:underline">{t('login')}</a></div>
      </form>
    </div>
  );
} 