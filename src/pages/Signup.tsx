import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { setLanguage, selectTranslation, useTranslation } from '@/store/slices/languageSlice';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const language = useAppSelector((state) => state.language.language);
  const { t } = useTranslation();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
      setError(t('name_email_password_required'));
      return;
    }
    try {
      const response = await api.post('/users/signup', {
        name,
        email,
        password
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      dispatch(setCredentials(user));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.msg || err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-2 sm:p-6 md:p-10 transition-colors duration-300">
      {/* Language Switcher */}
      <div className="flex gap-2 mb-4 self-center">
        <button
          onClick={() => dispatch(setLanguage('en'))}
          className={`px-2 py-1 rounded text-sm font-medium border transition-colors ${language === 'en' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground hover:bg-muted border-input'}`}
          aria-label="Switch to English"
        >
          EN
        </button>
        <button
          onClick={() => dispatch(setLanguage('el'))}
          className={`px-2 py-1 rounded text-sm font-medium border transition-colors ${language === 'el' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground hover:bg-muted border-input'}`}
          aria-label="Switch to Greek"
        >
          ΕΛ
        </button>
      </div>
      <form onSubmit={handleSignup} className="bg-card p-4 sm:p-8 rounded shadow border w-full max-w-xs sm:max-w-sm space-y-4 transition-colors">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">{t('sign_up')}</h2>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Input type="text" placeholder={t('name')} value={name} onChange={e => setName(e.target.value)} required className="w-full" />
        <Input type="email" placeholder={t('email')} value={email} onChange={e => setEmail(e.target.value)} required className="w-full" />
        <Input type="password" placeholder={t('password')} value={password} onChange={e => setPassword(e.target.value)} required className="w-full" />
        <Button type="submit" className="w-full">{t('sign_up')}</Button>
        <div className="text-sm text-center text-muted-foreground">{t('already_have_account')} <a href="/login" className="text-primary hover:underline">{t('login')}</a></div>
      </form>
    </div>
  );
} 