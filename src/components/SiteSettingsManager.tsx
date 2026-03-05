import React, { useState } from 'react';
import { Save, Upload, X } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useImageUpload } from '../hooks/useImageUpload';

const SiteSettingsManager: React.FC = () => {
  const { siteSettings, loading, updateSiteSettings } = useSiteSettings();
  const { uploadImage, uploading } = useImageUpload();
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({
    site_name: '',
    site_description: '',
    currency: '',
    currency_code: '',
    service_charge_enabled: false,
    service_charge_percentage: 60,
    service_fee_amount: 60,
    service_charge_applicable_to: [] as string[]
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  React.useEffect(() => {
    if (!siteSettings) return;

    setFormData({
      site_name: siteSettings.site_name || '',
      site_description: siteSettings.site_description || '',
      currency: siteSettings.currency || '',
      currency_code: siteSettings.currency_code || '',

      service_charge_enabled:
        siteSettings.service_charge_enabled === true,

      service_charge_percentage: (() => {
        const pct = Number(siteSettings.service_charge_percentage);
        return Number.isFinite(pct) ? pct : 60;
      })(),

      service_fee_amount: (() => {
        const amt = Number(siteSettings.service_fee_amount);
        return Number.isFinite(amt) ? amt : 60;
      })(),

      service_charge_applicable_to: Array.isArray(
        siteSettings.service_charge_applicable_to
      )
        ? siteSettings.service_charge_applicable_to
        : []
    });

    setLogoPreview(siteSettings.site_logo || '');
  }, [siteSettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      let logoUrl = logoPreview;

      // Upload logo if changed
      if (logoFile) {
        const uploadedUrl = await uploadImage(logoFile, 'site_logo');
        logoUrl = uploadedUrl;
      }

      // Ensure percentage is a valid number
      const percentage = Number(formData.service_charge_percentage);
      const feeAmount = Number(formData.service_fee_amount);

      await updateSiteSettings({
        site_name: formData.site_name,
        site_description: formData.site_description,
        currency: formData.currency,
        currency_code: formData.currency_code,
        site_logo: logoUrl || '',
        service_charge_enabled: Boolean(formData.service_charge_enabled),
        service_charge_percentage: isNaN(percentage) ? 0 : percentage,
        service_fee_amount: isNaN(feeAmount) ? 0 : feeAmount,
        service_charge_applicable_to: formData.service_charge_applicable_to || []
      });

      setIsEditing(false);
      setLogoFile(null);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

    } catch (error) {
      console.error('Error saving site settings:', error);
      alert('Failed to save settings.');
    }
  };

  const handleCancel = () => {
    if (siteSettings) {
      setFormData({
        site_name: siteSettings.site_name || '',
        site_description: siteSettings.site_description || '',
        currency: siteSettings.currency || '',
        currency_code: siteSettings.currency_code || '',

        service_charge_enabled:
          siteSettings.service_charge_enabled === true,

        service_charge_percentage:
          Number(siteSettings.service_charge_percentage) || 60,

        service_fee_amount:
          Number(siteSettings.service_fee_amount) || 60,

        service_charge_applicable_to: Array.isArray(
          siteSettings.service_charge_applicable_to
        )
          ? siteSettings.service_charge_applicable_to
          : []
      });

      setLogoPreview(siteSettings.site_logo || '');
    }

    setIsEditing(false);
    setLogoFile(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {saveSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">✓ Settings saved successfully! Delivery fee is now set to ₱{formData.service_fee_amount} and will apply to all delivery orders.</p>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-noto font-semibold text-black">Site Settings</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Edit Settings</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              disabled={uploading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{uploading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Site Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Logo
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Site Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-2xl text-gray-400">☕</div>
              )}
            </div>
            {isEditing && (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Logo</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Site Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Name
          </label>
          {isEditing ? (
            <input
              type="text"
              name="site_name"
              value={formData.site_name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Enter site name"
            />
          ) : (
            <p className="text-lg font-medium text-black">{siteSettings?.site_name}</p>
          )}
        </div>

        {/* Site Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Description
          </label>
          {isEditing ? (
            <textarea
              name="site_description"
              value={formData.site_description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Enter site description"
            />
          ) : (
            <p className="text-gray-600">{siteSettings?.site_description}</p>
          )}
        </div>

        {/* Currency Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency Symbol
            </label>
            {isEditing ? (
              <input
                type="text"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g., ₱, $, €"
              />
            ) : (
              <p className="text-lg font-medium text-black">{siteSettings?.currency}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency Code
            </label>
            {isEditing ? (
              <input
                type="text"
                name="currency_code"
                value={formData.currency_code}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g., PHP, USD, EUR"
              />
            ) : (
              <p className="text-lg font-medium text-black">{siteSettings?.currency_code}</p>
            )}
          </div>
        </div>

        {/* Service Charge Settings */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-black mb-4">Service Charge Settings</h3>

          {/* Service Charge Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Fee (₱)
            </label>

            {isEditing ? (
              <input
                type="number"
                step="1"
                min="0"
                value={formData.service_fee_amount}
                onChange={(e) => {
                  const value = parseFloat(e.target.value)

                  setFormData(prev => ({
                    ...prev,
                    service_fee_amount:
                      isNaN(value) ? 0 : Math.max(0, value)
                  }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            ) : (
              <p className="text-lg font-medium text-black">
                ₱{Number(formData.service_fee_amount || 60).toFixed(2)}
              </p>
            )}

            <p className="text-xs text-gray-500 mt-1">
              Automatically applied when customers select Delivery
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteSettingsManager;
