import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials, setLoading as setAuthLoading } from '@/store/slices/authSlice';
import { setLanguage, selectTranslation, useTranslation } from '@/store/slices/languageSlice';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');


  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const language = useAppSelector((state) => state.language.language);
  const isEmailLoading = useAppSelector((state) => state.auth.loading);
  const { t } = useTranslation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    dispatch(setAuthLoading(true));
    try {
      const response = await api.post('/users/login', {
        email,
        password
      });

      const { user, token } = response.data;
      localStorage.setItem('token', token);
      dispatch(setCredentials(user));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.msg || err.message);
    } finally {
      dispatch(setAuthLoading(false));
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
      {/* Top Title */}
      <div className="mb-4 sm:mb-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground transition-colors">CRM</h1>
        <p className="text-muted-foreground mt-1 transition-colors">{t('sign_in_to_account')}</p>
      </div>
      {/* Card */}
      <form onSubmit={handleLogin} className="bg-card p-4 sm:p-6 md:p-8 rounded-xl shadow border border-border w-full max-w-xs sm:max-w-sm md:max-w-md space-y-4 mx-auto transition-colors">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-1 text-foreground">{t('welcome_back')}</h2>
        <p className="text-muted-foreground text-center text-sm mb-4">{t('enter_credentials')}</p>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="email">{t('email')}</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-.876 1.797l-7.5 5.625a2.25 2.25 0 01-2.648 0l-7.5-5.625A2.25 2.25 0 012.25 6.993V6.75" /></svg>
            </span>
            <input
              id="email"
              type="email"
              className="block w-full pl-10 pr-3 py-2 border border-input bg-background text-foreground rounded focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              placeholder={t('email_placeholder')}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={isEmailLoading}
            />
          </div>
        </div>
        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="password">{t('password')}</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.5a4.5 4.5 0 10-9 0v3m12 0A2.25 2.25 0 0119.5 12.75v6A2.25 2.25 0 0117.25 21H6.75A2.25 2.25 0 014.5 18.75v-6A2.25 2.25 0 016.75 10.5h10.5zm-6 3.75h.008v.008H12.5v-.008z" /></svg>
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="block w-full pl-10 pr-10 py-2 border border-input bg-background text-foreground rounded focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              placeholder={t('password_placeholder')}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={isEmailLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 focus:outline-none"
              disabled={isEmailLoading}
            >
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
          <label className="flex items-center text-sm text-foreground">
            <input
              type="checkbox"
              className="form-checkbox rounded text-primary border-input bg-background mr-2"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              disabled={isEmailLoading}
            />
            {t('remember_me')}
          </label>
          <a href="#" className="text-primary text-sm hover:underline">{t('forgot_password')}</a>
        </div>
        {/* Error */}
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {/* Sign in button */}
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded text-base flex items-center justify-center gap-2"
          disabled={isEmailLoading}
        >
          {isEmailLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('signing_in')}
            </>
          ) : (
            t('sign_in')
          )}
        </Button>

        {/* Sign up link */}
        <div className="text-center text-sm text-muted-foreground mt-4">
          {t('dont_have_account')}{' '}
          <Link to="/signup" className="text-primary hover:underline font-semibold transition-colors duration-200">
            {t('sign_up')}
          </Link>
        </div>
      </form>
    </div>
  );
} 