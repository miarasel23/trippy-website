'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  fetchPolicyAndSupport,
  toBengaliDigits,
  ParsedSupportInfo,
  PolicyResponseData,
} from '@/features/legal/services/policyService';

export function usePolicySupport() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [support, setSupport] = useState<ParsedSupportInfo>({
    phone: '01997709990',
    email: 'help@tripyservic.com',
    emergency: '999',
  });
  const [policyData, setPolicyData] = useState<PolicyResponseData | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPolicyAndSupport(language);
      if (res.support) {
        setSupport(res.support);
      }
      if (res.data) {
        setPolicyData(res.data);
      }
    } catch {
      // Keep default fallback on network error
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const hotlinePhone = support.phone || '01997709990';
  const hotlineDisplay = isBn ? toBengaliDigits(hotlinePhone) : hotlinePhone;

  // Emergency is strictly always 999
  const emergencyNumber = '999';
  const emergencyDisplay = isBn ? '৯৯৯' : '999';

  return {
    support,
    hotlinePhone,
    hotlineDisplay,
    emergencyNumber,
    emergencyDisplay,
    policyData,
    loading,
    refetch: loadData,
    isBn,
  };
}
