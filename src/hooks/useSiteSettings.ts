import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SiteSettings } from '../types';

export const useSiteSettings = () => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSiteSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('id');

      if (error) throw error;

      const getValue = (key: string) => {
        const setting = data.find(s => s.id === key);
        return setting?.value ?? null;
      };

      // SERVICE CHARGE ENABLED
      const serviceChargeEnabled =
        getValue('service_charge_enabled') === 'true';

      // SERVICE CHARGE PERCENTAGE
      const rawPercentage = getValue('service_charge_percentage');
      const parsedPercentage = rawPercentage !== null
        ? Number(rawPercentage)
        : 0;

      const serviceChargePercentage = Number.isFinite(parsedPercentage)
        ? parsedPercentage
        : 0;

      // SERVICE FEE AMOUNT
      const rawFeeAmount = getValue('service_fee_amount');
      const parsedFeeAmount = rawFeeAmount !== null
        ? Number(rawFeeAmount)
        : 0;

      const serviceFeeAmount = Number.isFinite(parsedFeeAmount)
        ? parsedFeeAmount
        : 0;

      // SERVICE CHARGE APPLICABLE TO
      let serviceChargeApplicableTo: string[] = [];

      try {
        const raw = getValue('service_charge_applicable_to');
        serviceChargeApplicableTo = raw ? JSON.parse(raw) : [];
      } catch {
        serviceChargeApplicableTo = [];
      }

      const settings: SiteSettings = {
        site_name: getValue('site_name') || 'CAFERO',
        site_logo: getValue('site_logo') || '',
        site_description: getValue('site_description') || '',
        currency: getValue('currency') || '₱',
        currency_code: getValue('currency_code') || 'PHP',

        service_charge_enabled: serviceChargeEnabled,
        service_charge_percentage: serviceChargePercentage,
        service_fee_amount: serviceFeeAmount,
        service_charge_applicable_to: serviceChargeApplicableTo
      };

      setSiteSettings(settings);
    } catch (err) {
      console.error('Error fetching site settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch site settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSiteSetting = async (id: string, value: string) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('site_settings')
        .update({ value })
        .eq('id', id);

      if (error) throw error;

      await fetchSiteSettings();
    } catch (err) {
      console.error('Error updating site setting:', err);
      setError(err instanceof Error ? err.message : 'Failed to update site setting');
      throw err;
    }
  };

  const updateSiteSettings = async (updates: Partial<SiteSettings>) => {
    try {
      setError(null);

      const updatePromises = Object.entries(updates).map(([key, value]) => {

        let stringValue: string;

        if (key === 'service_charge_enabled') {
          stringValue = value ? 'true' : 'false';
        }

        else if (key === 'service_charge_percentage') {
          const pct = Number(value);
          const safe = Math.min(100, Math.max(0, pct));
          stringValue = String(safe);
        }

        else if (key === 'service_fee_amount') {
          const amount = Number(value);
          const safe = Math.max(0, amount);
          stringValue = String(safe);
        }

        else if (key === 'service_charge_applicable_to') {
          stringValue = JSON.stringify(value || []);
        }

        else {
          stringValue = String(value ?? '');
        }

        return supabase
          .from('site_settings')
          .update({ value: stringValue })
          .eq('id', key);
      });

      const results = await Promise.all(updatePromises);

      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        throw new Error('Some updates failed');
      }

      await fetchSiteSettings();

    } catch (err) {
      console.error('Error updating site settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update site settings');
      throw err;
    }
  };

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  return {
    siteSettings,
    loading,
    error,
    updateSiteSetting,
    updateSiteSettings,
    refetch: fetchSiteSettings
  };
};