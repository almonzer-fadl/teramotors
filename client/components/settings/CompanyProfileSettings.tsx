"use client";

import { useState, useEffect, useRef } from 'react'; // ADDED useRef
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Loader2, Save, Building, Phone, Mail, Globe, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

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
    
    // State for the logo uploader
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null); // ADDED useRef
    
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
                        ...prev,
                        companyInfo: { ...prev.companyInfo, ...data.companyInfo },
                        branding: { ...prev.branding, ...data.branding }
                    }));
                    // Set initial preview URL if logo exists
                    if (data.branding?.logoUrl) {
                        setPreviewUrl(data.branding.logoUrl);
                    }
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

    // Handler for file input change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setSelectedFile(null);
            setPreviewUrl(formData.branding.logoUrl || null); // Revert to current saved logo or null
        }
    };

    // Handler for uploading the selected logo file
    const handleUploadLogo = async () => {
        if (!selectedFile) return;

        setUploadingLogo(true);
        try {
            const data = new FormData();
            data.append('logo', selectedFile);

            const response = await fetch('/api/upload/logo', {
                method: 'POST',
                body: data,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload logo.');
            }

            const result = await response.json();
            const newLogoUrl = result.url;

            // Update local form data with new logo URL
            setFormData(prev => ({
                ...prev,
                branding: { ...prev.branding, logoUrl: newLogoUrl }
            }));
            setSelectedFile(null); // Clear selected file after successful upload
            
            toast.success('Logo uploaded! Click "Save Changes" to apply it to your profile.');

        } catch (error) {
            console.error("Error uploading logo", error);
            toast.error(`Logo upload failed: ${(error as Error).message}`);
        } finally {
            setUploadingLogo(false);
        }
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
            toast.success('Profile saved successfully!');
        } catch (error) {
            console.error("Error saving company profile", error);
            toast.error(`Failed to save profile: ${(error as Error).message}`);
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
                        <FormLabel>Company Logo</FormLabel>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        <div className="flex items-center space-x-4">
                            {previewUrl && (
                                <img src={previewUrl} alt="Logo Preview" className="h-20 w-20 object-contain rounded-xl border border-gray-200 dark:border-gray-700" />
                            )}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                                disabled={uploadingLogo}
                            >
                                {selectedFile ? 'Change File' : 'Select Logo'}
                            </button>
                            {selectedFile && (
                                <button
                                    type="button"
                                    onClick={handleUploadLogo}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                                    disabled={uploadingLogo}
                                >
                                    {uploadingLogo ? <Loader2 className="me-2 h-5 w-5 animate-spin" /> : 'Upload'}
                                </button>
                            )}
                            {!selectedFile && formData.branding.logoUrl && (
                                <a href={formData.branding.logoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">View Current</a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                 <button type="submit" disabled={saving || uploadingLogo} className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-200">
                    {saving ? <><Loader2 className="me-2 h-5 w-5 animate-spin" />{t("forms.saving")}</> : <><Save className="me-2 h-5 w-5" /> Save Changes</>}
                </button>
            </div>
        </form>
    );
}
