import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useKYC } from '../context/KYCContext';
import KYCProgressTracker from '../components/KYCProgressTracker';

const ctaConfig = {
  not_started:    { label: 'Start KYC Now', color: 'bg-teal-600 hover:bg-teal-700', icon: FileText },
  in_progress:    { label: 'Continue KYC', color: 'bg-blue-600 hover:bg-blue-700', icon: ArrowRight },
  submitted:      { label: 'View Status', color: 'bg-amber-500 hover:bg-amber-600', icon: Clock },
  under_review:   { label: 'View Status', color: 'bg-amber-500 hover:bg-amber-600', icon: Clock },
  verified:       { label: 'KYC Verified ✓', color: 'bg-green-600 hover:bg-green-700', icon: CheckCircle },
  rejected:       { label: 'Resubmit KYC', color: 'bg-red-600 hover:bg-red-700', icon: AlertCircle },
  action_required:{ label: 'Take Action', color: 'bg-orange-500 hover:bg-orange-600', icon: AlertCircle },
};

const Dashboard = () => {
  const { user } = useAuth();
  const { kycData, kycStatus, loading, fetchStatus } = useKYC();

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const cta = ctaConfig[kycStatus] || ctaConfig.not_started;
  const CTAIcon = cta.icon;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome banner */}
      <div className="bg-slate-900 rounded-2xl p-6 mb-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome, {user?.fullName?.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {kycStatus === 'verified'
                ? 'Your eSewa account is fully verified and activated.'
                : 'Complete your KYC to unlock full eSewa features.'}
            </p>
          </div>
          <Link
            to="/kyc"
            className={`${cta.color} text-white px-5 py-2.5 rounded-xl font-semibold text-sm
              flex items-center gap-2 transition-colors whitespace-nowrap`}
          >
            <CTAIcon size={16} />
            {cta.label}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress tracker — takes 2 cols */}
        <div className="lg:col-span-2 space-y-5">
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto" />
              <p className="text-slate-400 text-sm mt-3">Loading KYC status...</p>
            </div>
          ) : (
            <KYCProgressTracker
              status={kycStatus}
              kycData={kycData}
              statusHistory={kycData?.statusHistory || []}
            />
          )}

          {/* Quick tips */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-3 text-sm">💡 Tips for smooth KYC</h3>
            <ul className="space-y-2">
              {[
                'Upload a clear, well-lit photo of your citizenship certificate',
                'Ensure all document text is clearly readable — no blurring or shadows',
                'Use OCR auto-fill to reduce manual entry errors',
                'Double-check your citizenship number format: XX-XX-XX-XXXXX',
                'Use the AI chat if you have any questions',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-teal-500 font-bold flex-shrink-0">→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right column — stats */}
        <div className="space-y-4">
          {/* Completion card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Form Completion</h3>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold text-teal-600">
                {kycStatus === 'verified' || kycStatus === 'under_review' || kycStatus === 'submitted'
                  ? 100
                  : kycData?.completionPercentage || 0}%
              </span>
              <span className="text-slate-400 text-sm mb-1">complete</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div
                className="bg-teal-500 h-2.5 rounded-full transition-all duration-700"
                style={{
                  width: `${kycStatus === 'verified' || kycStatus === 'under_review' || kycStatus === 'submitted'
                    ? 100
                    : kycData?.completionPercentage || 0}%`
                }}
              />
            </div>
          </div>

          {/* Status card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Account Status</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Email', value: user?.email, done: true },
                { label: 'Phone', value: user?.phone || 'Not provided', done: !!user?.phone },
                { label: 'KYC', value: kycStatus?.replace(/_/g, ' '), done: kycStatus === 'verified' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{item.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-700 capitalize">{item.value}</span>
                    {item.done
                      ? <CheckCircle size={13} className="text-green-500" />
                      : <AlertCircle size={13} className="text-amber-400" />
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/kyc" className="flex items-center justify-between text-sm text-teal-600 hover:text-teal-700 font-medium p-2 rounded-lg hover:bg-teal-50 transition-colors">
                <span>KYC Form</span><ArrowRight size={14} />
              </Link>
              <Link to="/notifications" className="flex items-center justify-between text-sm text-slate-600 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <span>Notifications</span><ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
