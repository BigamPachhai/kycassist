import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/client';

const KYCContext = createContext(null);

export const KYCProvider = ({ children }) => {
  const [kycData, setKycData] = useState(null);
  const [kycStatus, setKycStatus] = useState('not_started');
  const [loading, setLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/kyc/status');
      setKycData(res.data.kyc);
      setKycStatus(res.data.status);
    } catch (err) {
      console.error('KYC fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProgress = useCallback(async (formData) => {
    const res = await api.post('/kyc/save', formData);
    setKycData(res.data.kyc);
    return res.data;
  }, []);

  const submitKYC = useCallback(async (formData) => {
    const res = await api.post('/kyc/submit', formData);
    setKycData(res.data.kyc);
    setKycStatus('submitted');
    return res.data;
  }, []);

  const validateField = useCallback(async (field, value, documentType) => {
    const res = await api.post('/kyc/validate-field', { field, value, documentType });
    return res.data;
  }, []);

  const getFieldHint = useCallback(async (field) => {
    const res = await api.get(`/ai/hints/${field}`);
    return res.data;
  }, []);

  return (
    <KYCContext.Provider value={{
      kycData, kycStatus, loading,
      fetchStatus, saveProgress, submitKYC, validateField, getFieldHint,
    }}>
      {children}
    </KYCContext.Provider>
  );
};

export const useKYC = () => useContext(KYCContext);
