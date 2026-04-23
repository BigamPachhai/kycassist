import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.fullName, form.email, form.password, form.phone);
      toast.success('Account created! Let\'s start your KYC.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Bigam Pachhai', required: true },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', required: true },
    { name: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '98XXXXXXXX', required: false },
    { name: 'password', label: 'Password', type: 'password', placeholder: 'Min. 6 characters', required: true },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Shield size={28} color="white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 text-sm mt-1">KYCAssist · eSewa</p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(f => (
              <div key={f.name}>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">
                  {f.label} {f.required && <span className="text-red-400">*</span>}
                </label>
                <input
                  type={f.type}
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  required={f.required}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700
                    text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500
                    focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-700
                text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <><Loader size={16} className="animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
