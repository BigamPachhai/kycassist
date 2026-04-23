import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import toast from 'react-hot-toast';
import { 
  CheckCircle, XCircle, AlertCircle, Eye, Search, Clock, 
  Shield, UserCheck, FileText, ChevronRight, Activity, Zap
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [kycList, setKycList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [actionReason, setActionReason] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'history', 'all'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchKYCs();
  }, []);

  const fetchKYCs = async () => {
    try {
      const { data } = await api.get('/admin/kyc');
      if (data.success) {
        setKycList(data.kycs);
      }
    } catch (error) {
      toast.error('Failed to load KYC applications');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, actionStatus) => {
    if ((actionStatus === 'rejected' || actionStatus === 'action_required') && !actionReason.trim()) {
      toast.error(`Please provide a reason for ${actionStatus === 'rejected' ? 'rejection' : 'action required'}`);
      return;
    }

    try {
      const payload = { status: actionStatus };
      if (actionStatus === 'rejected') payload.rejectionReason = actionReason;
      if (actionStatus === 'action_required') payload.actionRequired = actionReason;

      const { data } = await api.put(`/admin/kyc/${id}/status`, payload);
      if (data.success) {
        toast.success(`KYC status updated to ${actionStatus}`);
        setKycList(kycList.map(kyc => kyc._id === id ? data.kyc : kyc));
        setSelectedKyc(data.kyc);
        setActionReason('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const kycStatusColor = {
    not_started: 'bg-slate-100 text-slate-600 border-slate-200',
    in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
    submitted: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    under_review: 'bg-amber-50 text-amber-700 border-amber-200',
    verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    action_required: 'bg-orange-50 text-orange-700 border-orange-200',
  };

  const filteredList = kycList.filter(kyc => {
    const matchesSearch = (kyc.fullName || kyc.user?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    
    if (activeTab === 'pending') {
      return ['submitted', 'under_review'].includes(kyc.status);
    } else if (activeTab === 'history') {
      return ['verified', 'rejected', 'action_required'].includes(kyc.status);
    }
    return !['not_started', 'in_progress'].includes(kyc.status);
  });

  const pendingCount = kycList.filter(k => ['submitted', 'under_review'].includes(k.status)).length;
  const verifiedCount = kycList.filter(k => k.status === 'verified').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Shield className="text-teal-600" size={32} />
              Admin Control Center
            </h1>
            <p className="text-slate-500 mt-1 ml-11 text-sm font-medium">Manage and review KYC applications securely.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-200/60 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                <Activity className="text-indigo-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Pending</p>
                <p className="text-xl font-bold text-slate-900">{pendingCount}</p>
              </div>
            </div>
            <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-200/60 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <UserCheck className="text-emerald-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Verified</p>
                <p className="text-xl font-bold text-slate-900">{verifiedCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Left Column: KYC List */}
          <div className="xl:col-span-4 flex flex-col h-[calc(100vh-220px)] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-white z-10">
              <div className="bg-slate-100/80 p-1 rounded-xl flex mb-5">
                <button 
                  onClick={() => { setActiveTab('pending'); setSelectedKyc(null); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${activeTab === 'pending' ? 'bg-white text-teal-700 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Action Needed
                </button>
                <button 
                  onClick={() => { setActiveTab('history'); setSelectedKyc(null); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${activeTab === 'history' ? 'bg-white text-teal-700 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  History
                </button>
                <button 
                  onClick={() => { setActiveTab('all'); setSelectedKyc(null); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${activeTab === 'all' ? 'bg-white text-teal-700 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  All
                </button>
              </div>
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search applicants..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-slate-50/30 p-3 space-y-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                  <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
                  <span className="text-sm font-medium">Syncing records...</span>
                </div>
              ) : filteredList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                  <FileText size={32} className="opacity-20" />
                  <span className="text-sm font-medium">No applications found.</span>
                </div>
              ) : (
                filteredList.map(kyc => (
                  <div 
                    key={kyc._id}
                    onClick={() => setSelectedKyc(kyc)}
                    className={`group p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${selectedKyc?._id === kyc._id ? 'bg-white border-teal-500 shadow-md shadow-teal-500/10 scale-[1.02]' : 'bg-white border-slate-200/60 hover:border-teal-300 hover:shadow-sm'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${selectedKyc?._id === kyc._id ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors'}`}>
                          {(kyc.fullName || kyc.user?.fullName || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{kyc.fullName || kyc.user?.fullName}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock size={10} /> {new Date(kyc.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} className={`transition-transform duration-300 ${selectedKyc?._id === kyc._id ? 'text-teal-500 translate-x-1' : 'text-slate-300 group-hover:text-teal-400'}`} />
                    </div>
                    <div className="mt-3 flex justify-end">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${kycStatusColor[kyc.status] || kycStatusColor.not_started}`}>
                        {kyc.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: KYC Details */}
          <div className="xl:col-span-8 flex flex-col h-[calc(100vh-220px)] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden relative">
            {selectedKyc ? (
              <div className="flex flex-col h-full">
                {/* Header Profile */}
                <div className="px-8 py-6 border-b border-slate-100 bg-white flex justify-between items-start shrink-0">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-teal-500/30">
                      {(selectedKyc.fullName || selectedKyc.user?.fullName || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{selectedKyc.fullName || selectedKyc.user?.fullName}</h2>
                      <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mt-1">
                        {selectedKyc.user?.email} <span className="w-1 h-1 rounded-full bg-slate-300"></span> {selectedKyc.user?.phone}
                      </p>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest border shadow-sm ${kycStatusColor[selectedKyc.status] || kycStatusColor.not_started}`}>
                    {selectedKyc.status.replace(/_/g, ' ')}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 lg:p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                    
                    {/* Left Column: Documents */}
                    <div className="flex flex-col h-full">
                      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 flex-1 flex flex-col">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <FileText size={16} className="text-indigo-500" /> Attached Document
                        </h3>
                        {selectedKyc.documentFrontImage ? (
                          <div className="flex-1 min-h-0 bg-slate-100/50 rounded-xl border border-slate-200 overflow-hidden relative group flex items-center justify-center p-2">
                            <a href={selectedKyc.documentFrontImage} target="_blank" rel="noreferrer" className="block w-full h-full relative">
                              <img 
                                src={selectedKyc.documentFrontImage} 
                                alt="Document Front" 
                                className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500" 
                              />
                              <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center rounded-lg">
                                <Eye size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                              </div>
                            </a>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <FileText size={32} className="mb-2 opacity-50" />
                            <span className="text-sm">No document attached</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Data Grid */}
                    <div className="flex flex-col">
                      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 flex-1">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-5 flex items-center gap-2">
                          <Zap size={16} className="text-amber-500" /> Extracted Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                          {[
                            { label: 'Document Type', value: selectedKyc.documentType, capitalize: true },
                            { label: 'Document Number', value: selectedKyc.documentNumber },
                            { label: 'Date of Birth', value: selectedKyc.dateOfBirth },
                            { label: 'Gender', value: selectedKyc.gender, capitalize: true },
                            { label: 'Permanent District', value: selectedKyc.permanentDistrict },
                            { label: 'Occupation', value: selectedKyc.occupation },
                            { label: 'Father\'s Name', value: selectedKyc.fatherName },
                            { label: 'Municipality', value: selectedKyc.permanentMunicipality },
                          ].map((item, idx) => (
                            <div key={idx} className="group">
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 group-hover:text-teal-500 transition-colors">{item.label}</p>
                              <p className={`font-semibold text-slate-800 text-[14px] ${item.capitalize ? 'capitalize' : ''}`}>
                                {item.value || <span className="text-slate-300 italic">N/A</span>}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Bar Fixed Bottom */}
                {['submitted', 'under_review'].includes(selectedKyc.status) && (
                  <div className="bg-white border-t border-slate-200 p-6 shrink-0 z-10 shadow-[0_-10px_30px_rgb(0,0,0,0.03)]">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      <input 
                        type="text" 
                        value={actionReason}
                        onChange={(e) => setActionReason(e.target.value)}
                        placeholder="Leave a comment or reason for rejection..."
                        className="flex-1 w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all placeholder:text-slate-400"
                      />
                      <div className="flex gap-3 w-full md:w-auto">
                        <button 
                          onClick={() => handleAction(selectedKyc._id, 'action_required')}
                          className="flex-1 md:flex-none px-6 py-3.5 bg-white border-2 border-orange-200 hover:border-orange-400 text-orange-700 hover:bg-orange-50 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                          <AlertCircle size={18} /> Ask Fix
                        </button>
                        <button 
                          onClick={() => handleAction(selectedKyc._id, 'rejected')}
                          className="flex-1 md:flex-none px-6 py-3.5 bg-white border-2 border-rose-200 hover:border-rose-400 text-rose-700 hover:bg-rose-50 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                          <XCircle size={18} /> Reject
                        </button>
                        <button 
                          onClick={() => handleAction(selectedKyc._id, 'verified')}
                          className="flex-1 md:flex-none px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40"
                        >
                          <CheckCircle size={18} /> Approve
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Shield size={40} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Select an Application</h3>
                <p className="text-sm font-medium">Choose an applicant from the list to review their details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
