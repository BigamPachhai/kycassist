import React from 'react';
import { CheckCircle, Clock, XCircle, AlertTriangle, Circle, Loader } from 'lucide-react';

const STEPS = [
  { key: 'not_started',    label: 'Not Started',   desc: 'Begin your KYC journey' },
  { key: 'in_progress',    label: 'In Progress',   desc: 'Form partially filled' },
  { key: 'submitted',      label: 'Submitted',     desc: 'Awaiting review' },
  { key: 'under_review',   label: 'Under Review',  desc: 'Team is reviewing your documents' },
  { key: 'verified',       label: 'Verified ✓',    desc: 'Account fully activated' },
];

const statusOrder = ['not_started','in_progress','submitted','under_review','verified'];

const StepIcon = ({ status, isCurrent, isDone }) => {
  if (status === 'verified' && isDone) return <CheckCircle className="text-green-500" size={22} />;
  if (status === 'rejected') return <XCircle className="text-red-500" size={22} />;
  if (status === 'action_required') return <AlertTriangle className="text-amber-500" size={22} />;
  if (isDone) return <CheckCircle className="text-teal-500" size={22} />;
  if (isCurrent) return <Loader className="text-teal-500 animate-spin" size={22} />;
  return <Circle className="text-slate-300" size={22} />;
};

const statusMessage = {
  not_started:    { text: 'You have not started KYC yet.', color: 'text-slate-500', bg: 'bg-slate-50' },
  in_progress:    { text: 'Your form is partially filled. Complete it to submit.', color: 'text-blue-600', bg: 'bg-blue-50' },
  submitted:      { text: 'KYC submitted! Under review soon.', color: 'text-teal-600', bg: 'bg-teal-50' },
  under_review:   { text: 'Your KYC is under review. Expected: 1–2 business days.', color: 'text-teal-700', bg: 'bg-teal-50' },
  verified:       { text: '🎉 Your KYC is verified! Account fully activated.', color: 'text-green-700', bg: 'bg-green-50' },
  rejected:       { text: 'Your KYC was rejected. Please check rejection reason and resubmit.', color: 'text-red-700', bg: 'bg-red-50' },
  action_required:{ text: 'Action required! Please provide additional information.', color: 'text-amber-700', bg: 'bg-amber-50' },
};

const KYCProgressTracker = ({ status, kycData, statusHistory = [] }) => {
  const currentIdx = statusOrder.indexOf(status);

  const msg = statusMessage[status] || statusMessage.not_started;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 px-5 py-4">
        <h3 className="text-white font-semibold text-base">KYC Verification Progress</h3>
        {kycData?.submittedAt && (
          <p className="text-slate-400 text-xs mt-0.5">
            Submitted: {new Date(kycData.submittedAt).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Status banner */}
        <div className={`rounded-xl px-4 py-3 ${msg.bg}`}>
          <p className={`text-sm font-medium ${msg.color}`}>{msg.text}</p>
          {kycData?.rejectionReason && (
            <p className="text-red-600 text-xs mt-1">Reason: {kycData.rejectionReason}</p>
          )}
          {kycData?.actionRequired && (
            <p className="text-amber-700 text-xs mt-1">Required: {kycData.actionRequired}</p>
          )}
        </div>

        {/* Steps */}
        {(status !== 'rejected' && status !== 'action_required') ? (
          <div className="space-y-0">
            {STEPS.map((step, i) => {
              const isDone = i < currentIdx || (status === 'verified' && step.key === 'verified');
              const isCurrent = step.key === status || (i === currentIdx);
              return (
                <div key={step.key} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <StepIcon status={step.key} isCurrent={isCurrent} isDone={isDone} />
                    {i < STEPS.length - 1 && (
                      <div className={`w-0.5 h-8 mt-1 ${isDone ? 'bg-teal-400' : 'bg-slate-200'}`} />
                    )}
                  </div>
                  <div className="pt-0.5 pb-8">
                    <p className={`text-sm font-semibold ${isCurrent ? 'text-teal-700' : isDone ? 'text-slate-700' : 'text-slate-400'}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-slate-400">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`rounded-xl p-4 ${status === 'rejected' ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              {status === 'rejected'
                ? <XCircle className="text-red-500" size={20} />
                : <AlertTriangle className="text-amber-500" size={20} />}
              <span className={`font-semibold text-sm ${status === 'rejected' ? 'text-red-700' : 'text-amber-700'}`}>
                {status === 'rejected' ? 'KYC Rejected' : 'Action Required'}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {status === 'rejected'
                ? 'Please correct the issues and resubmit your KYC. Use the AI Assistant for guidance.'
                : 'Please provide the requested information to proceed.'}
            </p>
          </div>
        )}

        {/* Completion bar (for in_progress) */}
        {status === 'in_progress' && kycData?.completionPercentage !== undefined && (
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Form completion</span>
              <span>{kycData.completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${kycData.completionPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Status history */}
        {statusHistory.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Activity Log</p>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {[...statusHistory].reverse().map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-500">
                  <Clock size={11} className="mt-0.5 flex-shrink-0 text-teal-400" />
                  <span>
                    <span className="font-medium capitalize">{h.status.replace('_', ' ')}</span>
                    {h.note && ` — ${h.note}`}
                    <span className="text-slate-400 ml-1">
                      {new Date(h.changedAt).toLocaleDateString()}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KYCProgressTracker;
