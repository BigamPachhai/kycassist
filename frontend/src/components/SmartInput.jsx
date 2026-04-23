import React, { useState, useCallback } from 'react';
import { HelpCircle, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import api from '../api/client';

const SmartInput = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  documentType,
  hint: staticHint,
  className = '',
  as = 'input',
  options = [],
}) => {
  const [validation, setValidation] = useState(null); // { valid, error, suggestion }
  const [hint, setHint] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [validating, setValidating] = useState(false);

  const validate = useCallback(async (val) => {
    if (!val) { setValidation(null); return; }
    setValidating(true);
    try {
      const res = await api.post('/kyc/validate-field', { field: name, value: val, documentType });
      setValidation(res.data);
    } catch {
      // silent — offline fallback
    } finally {
      setValidating(false);
    }
  }, [name, documentType]);

  const fetchHint = useCallback(async () => {
    if (hint) { setShowHint(h => !h); return; }
    try {
      const res = await api.get(`/ai/hints/${name}`);
      setHint(res.data);
      setShowHint(true);
    } catch {
      setHint({ hint: staticHint || 'Fill this field as per your official documents.', example: '', common_mistakes: [] });
      setShowHint(true);
    }
  }, [name, hint, staticHint]);

  const handleBlur = (e) => validate(e.target.value);

  const borderColor = !validation
    ? 'border-slate-300 focus:border-teal-500'
    : validation.valid
    ? 'border-green-400 focus:border-green-500'
    : 'border-red-400 focus:border-red-500';

  const inputClass = `w-full px-3 py-2.5 rounded-lg border ${borderColor} bg-white text-slate-800 text-sm
    focus:outline-none focus:ring-2 ${validation?.valid === false ? 'focus:ring-red-100' : 'focus:ring-teal-100'}
    transition-all duration-200 ${className}`;

  return (
    <div className="space-y-1">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={fetchHint}
          className="text-slate-400 hover:text-teal-600 transition-colors"
          title="Show hint"
        >
          <HelpCircle size={15} />
        </button>
      </div>

      {/* Input */}
      <div className="relative">
        {as === 'select' ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            onBlur={handleBlur}
            className={inputClass}
          >
            <option value="">Select {label}</option>
            {options.map(opt => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        ) : as === 'textarea' ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            rows={3}
            className={inputClass}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={inputClass + ' pr-8'}
          />
        )}

        {/* Inline status icon */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
          {validating && <Loader size={14} className="animate-spin text-slate-400" />}
          {!validating && validation?.valid === true && <CheckCircle size={14} className="text-green-500" />}
          {!validating && validation?.valid === false && <AlertCircle size={14} className="text-red-500" />}
        </div>
      </div>

      {/* Validation message */}
      {validation?.valid === false && (
        <div className="flex items-start gap-1.5 text-xs text-red-600">
          <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
          <div>
            <span>{validation.error}</span>
            {validation.suggestion && (
              <span className="block text-slate-500 mt-0.5">💡 {validation.suggestion}</span>
            )}
          </div>
        </div>
      )}

      {/* Hint panel */}
      {showHint && hint && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-xs space-y-1">
          <p className="text-teal-800 font-medium">ℹ️ {hint.hint}</p>
          {hint.example && <p className="text-slate-600">{hint.example}</p>}
          {hint.common_mistakes?.length > 0 && (
            <div>
              <p className="text-slate-500 font-medium mt-1">Common mistakes:</p>
              <ul className="list-disc list-inside text-slate-500 space-y-0.5">
                {hint.common_mistakes.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartInput;
