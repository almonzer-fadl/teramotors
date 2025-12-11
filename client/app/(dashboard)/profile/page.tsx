'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, type Variants } from 'framer-motion';
import { useSession } from '@/lib/hooks/useSession';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Lock, Save, Loader2, Edit, X } from 'lucide-react';
import toast from 'react-hot-toast';

const profileSchema = (isArabic: boolean) => z.object({
  firstName: z.string().min(2, { message: isArabic ? 'الاسم الأول مطلوب' : 'First name is required' }),
  lastName: z.string().min(2, { message: isArabic ? 'اسم العائلة مطلوب' : 'Last name is required' }),
  phone: z.string().min(10, { message: isArabic ? 'رقم هاتف غير صحيح' : 'Invalid phone number' }),
});

type ProfileFormData = z.infer<ReturnType<typeof profileSchema>>;

const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const GlassmorphicCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 ${className}`}>
    {children}
  </div>
);

const InputField = ({ name, label, icon: Icon, register, errors, isEditing }: any) => {
    return (
        <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    {...register(name)}
                    disabled={!isEditing}
                    className="w-full pl-10 p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#F97402] focus:border-[#F97402] transition disabled:bg-gray-200 dark:disabled:bg-gray-700"
                />
            </div>
            {errors[name] && <p className="mt-1 text-sm text-red-600">{errors[name].message}</p>}
        </div>
    )
}

export default function ProfilePage() {
  const { user, isLoading: isSessionLoading } = useSession();
  const { t, i18n } = useTranslation(['common', 'dashboard']);
  const isArabic = i18n.language === 'ar';
  
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema(isArabic)),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        reset({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
        });
      }
    }
    fetchProfile();
  }, [reset]);


  const onSubmit = async (data: ProfileFormData) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(t('dashboard:profile.update_error'));
      }

      const updatedUser = await response.json();
      setProfile(updatedUser);
      reset({
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || '',
        phone: updatedUser.phone || '',
      });
      toast.success(t('dashboard:profile.update_success'));
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isSessionLoading || !profile) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin h-10 w-10 text-[#F97402]" /></div>;
  }

  return (
    <motion.div
      key="profile-page"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="max-w-4xl mx-auto py-12 px-4"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          {t('dashboard:profile.title')}
        </h1>
        <motion.button 
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
        >
            {isEditing ? <X /> : <Edit />}
        </motion.button>
      </div>
      
      <GlassmorphicCard className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <motion.div variants={itemVariants}>
                <InputField name="firstName" label={t('dashboard:profile.first_name')} icon={User} register={register} errors={errors} isEditing={isEditing} />
            </motion.div>
            <motion.div variants={itemVariants}>
                <InputField name="lastName" label={t('dashboard:profile.last_name')} icon={User} register={register} errors={errors} isEditing={isEditing} />
            </motion.div>
            <motion.div variants={itemVariants}>
                <InputField name="phone" label={t('dashboard:profile.phone')} icon={Phone} register={register} errors={errors} isEditing={isEditing} />
            </motion.div>

             <motion.div variants={itemVariants}>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('dashboard:profile.email')}</label>
                <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        value={profile?.email || ''}
                        disabled
                        className="w-full pl-10 p-3 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                </div>
            </motion.div>
          
            {isEditing && (
                <motion.div variants={itemVariants} className="flex justify-end pt-4">
                    <motion.button
                    type="submit"
                    disabled={!isDirty || isSubmitting}
                    className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white rounded-lg shadow-lg disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
                    <span className="ms-2">{t('common:save_changes')}</span>
                    </motion.button>
                </motion.div>
            )}
        </form>
      </GlassmorphicCard>
    </motion.div>
  );
}
