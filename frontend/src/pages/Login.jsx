import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Shield size={28} color="white" />
          </div>
          <h1 className="text-2xl font-bold text-white">KYCAssist</h1>
          <p className="text-slate-400 text-sm mt-1">eSewa · Smart KYC Onboarding</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700
                  text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500
                  focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2.5 pr-10 rounded-xl bg-slate-800 border border-slate-700
                    text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500
                    focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-700
                text-white font-semibold rounded-xl text-sm transition-colors flex items-center
                justify-center gap-2"
            >
              {loading ? <><Loader size={16} className="animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-400 hover:text-teal-300 font-medium">
              Register
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-4 p-3 bg-slate-800 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-400 font-medium mb-1">🧪 Demo credentials:</p>
            <p className="text-xs text-slate-300">Email: demo@esewa.com.np</p>
            <p className="text-xs text-slate-300">Password: demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
