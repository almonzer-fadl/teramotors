"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Loader2, Save, Building, Phone, Mail, Globe, Palette } from 'lucide-react';

const FormInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200" />
);
const FormLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{children}</label>
);

export default function CompanyProfileSettings() {
    const { t } = useTranslation('common');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        companyInfo: {
            name: '',
            nameAr: '',
            vatNumber: '',
            crNumber: '',
            address: {
                street: '',
                city: '',
                district: '',
                postalCode: '',
                country: '',
            },
            phone: '',
            email: '',
            website: '',
        },
        branding: {
            logoUrl: '',
        }
    });

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/settings/company-profile');
                if (response.ok) {
                    const data = await response.json();
                    setFormData(prev => ({
                        companyInfo: { ...prev.companyInfo, ...data.companyInfo },
                        branding: { ...prev.branding, ...data.branding }
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch company profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            companyInfo: { ...prev.companyInfo, [name]: value }
        }));
    };
    
    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            companyInfo: { 
                ...prev.companyInfo, 
                address: { ...prev.companyInfo.address, [name]: value }
            }
        }));
    };

    const handleBrandingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            branding: { ...prev.branding, [name]: value }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await fetch('/api/settings/company-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                 const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save settings');
            }
            // Add a success toast/message here
        } catch (error) {
            console.error("Error saving company profile", error);
            // Add an error toast/message here
        } finally {
            setSaving(false);
        }
    };
    
    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Business Details */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center"><Building className="w-6 h-6 mr-3 text-[#F97402]" /> Business Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <FormLabel>Company Name (English)</FormLabel>
                        <FormInput name="name" value={formData.companyInfo.name} onChange={handleInfoChange} />
                    </div>
                    <div>
                        <FormLabel>Company Name (Arabic)</FormLabel>
                        <FormInput name="nameAr" value={formData.companyInfo.nameAr} onChange={handleInfoChange} dir="rtl" />
                    </div>
                     <div>
                        <FormLabel>VAT Number</FormLabel>
                        <FormInput name="vatNumber" value={formData.companyInfo.vatNumber} onChange={handleInfoChange} />
                    </div>
                     <div>
                        <FormLabel>Commercial Registration No.</FormLabel>
                        <FormInput name="crNumber" value={formData.companyInfo.crNumber} onChange={handleInfoChange} />
                    </div>
                </div>
            </div>

             {/* Address Details */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center"><Mail className="w-6 h-6 mr-3 text-[#F97402]" /> Address Details</h2>
                 <div className="space-y-6">
                     <div>
                        <FormLabel>Street Address</FormLabel>
                        <FormInput name="street" value={formData.companyInfo.address.street} onChange={handleAddressChange} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <FormLabel>City</FormLabel>
                            <FormInput name="city" value={formData.companyInfo.address.city} onChange={handleAddressChange} />
                        </div>
                        <div>
                            <FormLabel>District</FormLabel>
                            <FormInput name="district" value={formData.companyInfo.address.district} onChange={handleAddressChange} />
                        </div>
                         <div>
                            <FormLabel>Postal Code</FormLabel>
                            <FormInput name="postalCode" value={formData.companyInfo.address.postalCode} onChange={handleAddressChange} />
                        </div>
                    </div>
                 </div>
            </div>

             {/* Contact & Branding */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center"><Palette className="w-6 h-6 mr-3 text-[#F97402]" /> Contact & Branding</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <FormLabel>Phone Number</FormLabel>
                        <FormInput name="phone" value={formData.companyInfo.phone} onChange={handleInfoChange} />
                    </div>
                    <div>
                        <FormLabel>Email Address</FormLabel>
                        <FormInput name="email" type="email" value={formData.companyInfo.email} onChange={handleInfoChange} />
                    </div>
                    <div>
                        <FormLabel>Website</FormLabel>
                        <FormInput name="website" type="url" value={formData.companyInfo.website} onChange={handleInfoChange} placeholder="https://example.com" />
                    </div>
                     <div>
                        <FormLabel>Logo URL</FormLabel>
                        <FormInput name="logoUrl" value={formData.branding.logoUrl} onChange={handleBrandingChange} placeholder="https://path/to/logo.png" />
                        {/* TODO: Add file upload component */}
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                 <button type="submit" disabled={saving} className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-200">
                    {saving ? <><Loader2 className="me-2 h-5 w-5 animate-spin" />{t("forms.saving")}</> : <><Save className="me-2 h-5 w-5" /> Save Changes</>}
                </button>
            </div>
        </form>
    );
}
