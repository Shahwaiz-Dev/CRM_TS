import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple auth: check localStorage for user
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // Demo credentials
    const testEmail = 'admin@crmpro.com';
    const testPassword = 'admin123';
    if (user.email === email && user.password === password) {
      localStorage.setItem('auth', 'true');
      navigate('/');
    } else if (email === testEmail && password === testPassword) {
      localStorage.setItem('auth', 'true');
      navigate('/');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 md:p-10">
      {/* Top Title */}
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-gray-900">CRM</h1>
        <p className="text-gray-500 mt-1">Sign in to your account</p>
      </div>
      {/* Card */}
      <form onSubmit={handleLogin} className="bg-white p-6 sm:p-8 rounded-xl shadow w-full max-w-xs sm:max-w-sm md:max-w-md space-y-4 mx-auto">
        <h2 className="text-2xl font-bold text-center mb-1">Welcome back</h2>
        <p className="text-gray-500 text-center text-sm mb-4">Enter your credentials to access your dashboard</p>
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
        <div className="flex items-center justify-between">
          <label className="flex items-center text-sm">
            <input type="checkbox" className="form-checkbox rounded text-blue-600 mr-2" checked={remember} onChange={e => setRemember(e.target.checked)} />
            Remember me
          </label>
          <Link to="#" className="text-blue-600 text-sm hover:underline">Forgot password?</Link>
        </div>
        {/* Error */}
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {/* Sign in button */}
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded text-base">Sign in</Button>
        {/* Demo credentials */}
        <div className="mt-4">
          <div className="text-center text-gray-500 text-sm mb-1">Demo Credentials:</div>
          <div className="bg-gray-100 rounded px-4 py-2 text-center text-sm font-mono">
            Email: admin@crmpro.com<br />
            Password: admin123
          </div>
        </div>
      </form>
    </div>
  );
} 