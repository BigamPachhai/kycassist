import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Send, Save, Loader, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import SmartInput from '../components/SmartInput';
import OCRUpload from '../components/OCRUpload';
import { useKYC } from '../context/KYCContext';

const NEPAL_DISTRICTS = [
  'Achham','Arghakhanchi','Baglung','Baitadi','Bajhang','Bajura','Banke','Bara',
  'Bardiya','Bhaktapur','Bhojpur','Chitwan','Dadeldhura','Dailekh','Dang','Darchula',
  'Dhading','Dhankuta','Dhanusa','Dolakha','Dolpa','Doti','Gorkha','Gulmi','Humla',
  'Ilam','Jajarkot','Jhapa','Jumla','Kailali','Kalikot','Kanchanpur','Kapilvastu',
  'Kaski','Kathmandu','Kavrepalanchok','Khotang','Lalitpur','Lamjung','Mahottari',
  'Makwanpur','Manang','Morang','Mugu','Mustang','Myagdi','Nawalparasi East',
  'Nawalparasi West','Nuwakot','Okhaldhunga','Palpa','Panchthar','Parbat','Parsa',
  'Pyuthan','Ramechhap','Rasuwa','Rautahat','Rolpa','Rupandehi','Salyan',
  'Sankhuwasabha','Saptari','Sarlahi','Sindhuli','Sindhupalchok','Siraha',
  'Solukhumbu','Sunsari','Surkhet','Syangja','Tanahu','Taplejung','Terhathum',
  'Udayapur','Western Rukum',
];

const STEPS = [
  { id: 'document', title: 'Upload Document', subtitle: 'Auto-fill with OCR' },
  { id: 'personal', title: 'Personal Info', subtitle: 'Basic details' },
  { id: 'address', title: 'Address', subtitle: 'Permanent address' },
  { id: 'document_details', title: 'Document Details', subtitle: 'ID information' },
  { id: 'review', title: 'Review & Submit', subtitle: 'Final check' },
];

const KYCForm = () => {
  const { saveProgress, submitKYC, kycData, fetchStatus } = useKYC();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: '', dateOfBirth: '', gender: '',
    fatherName: '', grandfatherName: '', spouseName: '',
    permanentDistrict: '', permanentMunicipality: '', permanentWardNo: '', temporaryAddress: '',
    documentType: 'citizenship', documentNumber: '', documentIssuedDistrict: '', documentIssuedDate: '',
    occupation: '', sourceOfIncome: '', annualIncome: '',
  });

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Pre-fill from existing KYC draft
  useEffect(() => {
    if (kycData && kycData.status === 'draft') {
      setForm(prev => ({ ...prev, ...kycData }));
    }
  }, [kycData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleOCRExtracted = useCallback((extracted) => {
    setForm(prev => ({ ...prev, ...extracted }));
    toast.success(`${Object.keys(extracted).length} fields auto-filled from document!`);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveProgress(form);
      toast.success('Progress saved');
    } catch {
      toast.error('Failed to save progress');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    await handleSave();
    setStep(s => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitKYC(form);
      toast.success('KYC submitted successfully! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  if (kycData && ['submitted', 'under_review', 'verified'].includes(kycData.status)) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-3">Application Submitted!</h2>
        <p className="text-slate-500 mb-8 text-lg">
          Your KYC application has been successfully submitted and is currently <span className="font-bold text-teal-600 capitalize">{kycData.status.replace('_', ' ')}</span>.
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">KYC Verification</h1>
        <p className="text-slate-500 text-sm mt-1">Complete all steps to verify your identity</p>
      </div>

      {kycData?.status === 'action_required' && kycData?.actionRequired && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5 mb-6">
          <h3 className="font-bold text-orange-800 flex items-center gap-2 mb-1">
            <span className="text-xl">⚠️</span> Action Required
          </h3>
          <p className="text-sm text-orange-700">{kycData.actionRequired}</p>
        </div>
      )}

      {/* Step progress */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => i < step && setStep(i)}
              className={`flex flex-col items-center text-center flex-1 transition-colors
                ${i <= step ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 transition-colors
                ${i < step ? 'bg-teal-500 text-white'
                  : i === step ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-400'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i === step ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>
                {s.title}
              </span>
            </button>
          ))}
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5">
          <div className="bg-teal-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-slate-500 mt-1.5 text-right">
          Step {step + 1} of {STEPS.length} — {STEPS[step].title}
        </p>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-800">{STEPS[step].title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{STEPS[step].subtitle}</p>
        </div>

        <div className="p-6 space-y-5">
          {/* ── STEP 0: Document Upload ── */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                <p className="text-sm font-medium text-teal-800">🔍 Smart OCR Auto-Fill</p>
                <p className="text-xs text-teal-600 mt-1">
                  Upload your citizenship certificate or passport and we'll automatically extract your details — saving you time and reducing errors.
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Document Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { value: 'citizenship', label: '🪪 Citizenship' },
                    { value: 'passport', label: '📘 Passport' },
                    { value: 'driving_license', label: '🚗 Driving License' },
                    { value: 'voter_id', label: '🗳️ Voter ID' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, documentType: opt.value }))}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all
                        ${form.documentType === opt.value
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <OCRUpload onExtracted={handleOCRExtracted} documentType={form.documentType} />
              <p className="text-xs text-slate-400 text-center">
                Don't have your document handy? <button onClick={() => setStep(1)} className="text-teal-600 underline">Fill manually →</button>
              </p>
            </div>
          )}

          {/* ── STEP 1: Personal Info ── */}
          {step === 1 && (
            <>
              <SmartInput label="Full Name" name="fullName" value={form.fullName} onChange={handleChange}
                placeholder="As per citizenship certificate" required documentType={form.documentType} />
              <div className="grid grid-cols-2 gap-4">
                <SmartInput label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth}
                  onChange={handleChange} required documentType={form.documentType} />
                <SmartInput label="Gender" name="gender" as="select" value={form.gender} onChange={handleChange} required
                  options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} />
              </div>
              <SmartInput label="Father's Name" name="fatherName" value={form.fatherName} onChange={handleChange}
                placeholder="As per citizenship" documentType={form.documentType} />
              <SmartInput label="Grandfather's Name" name="grandfatherName" value={form.grandfatherName}
                onChange={handleChange} placeholder="Optional" />
              <SmartInput label="Spouse's Name" name="spouseName" value={form.spouseName}
                onChange={handleChange} placeholder="If applicable" />
            </>
          )}

          {/* ── STEP 2: Address ── */}
          {step === 2 && (
            <>
              <SmartInput label="Permanent District" name="permanentDistrict" as="select"
                value={form.permanentDistrict} onChange={handleChange} required
                options={NEPAL_DISTRICTS.map(d => ({ value: d, label: d }))} />
              <SmartInput label="Municipality / VDC" name="permanentMunicipality" value={form.permanentMunicipality}
                onChange={handleChange} placeholder="e.g. Butwal Sub-Metropolitan City" required
                documentType={form.documentType} />
              <SmartInput label="Ward No." name="permanentWardNo" value={form.permanentWardNo}
                onChange={handleChange} placeholder="e.g. 11" />
              <SmartInput label="Temporary Address" name="temporaryAddress" as="textarea"
                value={form.temporaryAddress} onChange={handleChange}
                placeholder="Current living address (if different from permanent)" />
            </>
          )}

          {/* ── STEP 3: Document Details ── */}
          {step === 3 && (
            <>
              <SmartInput label="Document Number" name="documentNumber" value={form.documentNumber}
                onChange={handleChange} required documentType={form.documentType}
                placeholder={form.documentType === 'passport' ? 'e.g. PA1234567' : 'e.g. 12-34-56-78901'} />
              <SmartInput label="Issued District" name="documentIssuedDistrict" as="select"
                value={form.documentIssuedDistrict} onChange={handleChange}
                options={NEPAL_DISTRICTS.map(d => ({ value: d, label: d }))} />
              <SmartInput label="Date of Issue" name="documentIssuedDate" type="date"
                value={form.documentIssuedDate} onChange={handleChange}
                documentType={form.documentType} />
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Occupation (Optional)</p>
                <SmartInput label="Occupation" name="occupation" value={form.occupation}
                  onChange={handleChange} placeholder="e.g. Software Engineer, Student" />
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <SmartInput label="Source of Income" name="sourceOfIncome" value={form.sourceOfIncome}
                    onChange={handleChange} placeholder="e.g. Salary, Business" />
                  <SmartInput label="Annual Income (NPR)" name="annualIncome" value={form.annualIncome}
                    onChange={handleChange} placeholder="e.g. 500000" />
                </div>
              </div>
            </>
          )}

          {/* ── STEP 4: Review & Submit ── */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-amber-800">⚠️ Please review before submitting</p>
                <p className="text-xs text-amber-700 mt-1">Once submitted, you cannot edit your KYC until reviewed.</p>
              </div>

              {[
                {
                  title: 'Personal Information',
                  fields: [
                    ['Full Name', form.fullName],
                    ['Date of Birth', form.dateOfBirth],
                    ['Gender', form.gender],
                    ["Father's Name", form.fatherName],
                  ],
                },
                {
                  title: 'Address',
                  fields: [
                    ['District', form.permanentDistrict],
                    ['Municipality', form.permanentMunicipality],
                    ['Ward No.', form.permanentWardNo],
                  ],
                },
                {
                  title: 'Document Details',
                  fields: [
                    ['Document Type', form.documentType],
                    ['Document Number', form.documentNumber],
                    ['Issued District', form.documentIssuedDistrict],
                    ['Issue Date', form.documentIssuedDate],
                  ],
                },
              ].map(section => (
                <div key={section.title} className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{section.title}</p>
                  {section.fields.map(([label, value]) => value ? (
                    <div key={label} className="flex items-start justify-between text-sm">
                      <span className="text-slate-400 w-32 flex-shrink-0">{label}</span>
                      <span className="text-slate-800 font-medium text-right capitalize">{value}</span>
                    </div>
                  ) : null)}
                </div>
              ))}

              {/* Missing required fields warning */}
              {(!form.fullName || !form.dateOfBirth || !form.documentNumber || !form.permanentDistrict) && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-sm text-red-700 font-medium">⚠️ Missing required fields:</p>
                  <ul className="text-xs text-red-600 mt-1 space-y-0.5">
                    {!form.fullName && <li>• Full Name</li>}
                    {!form.dateOfBirth && <li>• Date of Birth</li>}
                    {!form.permanentDistrict && <li>• Permanent District</li>}
                    {!form.permanentMunicipality && <li>• Municipality</li>}
                    {!form.documentNumber && <li>• Document Number</li>}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                <ChevronLeft size={16} /> Back
              </button>
            )}
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
              {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
              Save
            </button>
          </div>

          {step < STEPS.length - 1 ? (
            <button onClick={handleNext} disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-60">
              {saving ? <Loader size={15} className="animate-spin" /> : null}
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !form.fullName || !form.dateOfBirth || !form.documentNumber}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-green-600 hover:bg-green-700
                disabled:bg-slate-300 text-white font-semibold text-sm rounded-xl transition-colors"
            >
              {submitting ? <Loader size={15} className="animate-spin" /> : <Send size={15} />}
              {submitting ? 'Submitting...' : 'Submit KYC'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default KYCForm;
