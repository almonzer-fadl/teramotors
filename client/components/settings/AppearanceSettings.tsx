"use client";

import { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle } from 'lucide-react';
import { ThemeContext } from '@/app/(dashboard)/ThemeContext';
import toast from 'react-hot-toast';

const themes = [
    { id: 'default', name: 'Default (Orange)', primaryColorVar: 'oklch(0.7 0.2 45)' },
    { id: 'ocean', name: 'Ocean (Blue)', primaryColorVar: 'oklch(0.6 0.15 250)' },
    { id: 'forest', name: 'Forest (Green)', primaryColorVar: 'oklch(0.6 0.18 150)' },
    { id: 'ruby', name: 'Ruby (Red)', primaryColorVar: 'oklch(0.6 0.2 15)' },
    { id: 'amethyst', name: 'Amethyst (Purple)', primaryColorVar: 'oklch(0.6 0.18 290)' },
    { id: 'midnight', name: 'Midnight (Charcoal)', primaryColorVar: 'oklch(0.4 0.01 250)' },
    { id: 'cobalt', name: 'Cobalt (Deep Blue)', primaryColorVar: 'oklch(0.5 0.15 260)' },
];

export default function AppearanceSettings() {
    const { t } = useTranslation('common');
    const { colorTheme, setColorTheme } = useContext(ThemeContext);
    const [saving, setSaving] = useState(false);

    const handleThemeSelect = async (themeId: string) => {
        if (themeId === colorTheme) return; // No change
        
        // Immediately update the UI using context and localStorage
        setColorTheme(themeId); 
        
        setSaving(true);
        try {
            const response = await fetch('/api/settings/appearance', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme: themeId }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save theme');
            }
            toast.success('Theme updated successfully!');
        } catch (error) {
            console.error("Error saving theme:", error);
            toast.error(`Failed to save theme: ${(error as Error).message}`);
            // Revert theme on error
            setColorTheme(colorTheme); 
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Choose Your Theme</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
                Select a color theme that best suits your brand. Your choice will apply across the entire application for all users in your organization.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {themes.map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => handleThemeSelect(theme.id)}
                        className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                            colorTheme === theme.id
                                ? 'border-[var(--primary)] ring-4 ring-[var(--primary)]/20 shadow-lg'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        } ${saving && colorTheme !== theme.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={saving}
                    >
                        <div 
                            className="w-16 h-16 rounded-full flex items-center justify-center mb-3 text-white" 
                            style={{ backgroundColor: theme.primaryColorVar }}
                        >
                            {colorTheme === theme.id && <CheckCircle className="w-8 h-8" />}
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-200 text-center">{theme.name}</span>
                        {colorTheme === theme.id && (
                            <div className="absolute top-2 right-2 p-1 bg-[var(--primary)] rounded-full">
                                <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
            {saving && (
                <div className="mt-6 flex items-center text-gray-600 dark:text-gray-400">
                    <Loader2 className="animate-spin mr-2" /> Saving theme...
                </div>
            )}
        </div>
    );
}