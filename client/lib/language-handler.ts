// Language handler for PDF generation
// This handles translation and text processing for different languages

export interface LanguageHandlerOptions {
  targetLanguage: 'ar' | 'en';
  sourceLanguage?: 'ar' | 'en';
}

export class LanguageHandler {
  private static translations = {
    // Common words that might appear in data
    status: {
      ar: { pending: 'معلق', paid: 'مدفوع', cancelled: 'ملغي' },
      en: { pending: 'Pending', paid: 'Paid', cancelled: 'Cancelled' }
    },
    // Vehicle makes/models that might need translation
    vehicleMakes: {
      ar: {
        'Toyota': 'تويوتا',
        'Honda': 'هوندا',
        'Nissan': 'نيسان',
        'Hyundai': 'هيونداي',
        'Kia': 'كيا',
        'Ford': 'فورد',
        'Chevrolet': 'شيفروليه',
        'BMW': 'بي إم دبليو',
        'Mercedes': 'مرسيدس',
        'Audi': 'أودي',
        'Volkswagen': 'فولكس فاجن',
        'Mazda': 'مازدا',
        'Subaru': 'سوبارو',
        'Lexus': 'لكزس',
        'Infiniti': 'إنفينيتي',
        'Acura': 'أكورا',
        'Genesis': 'جينيسيس',
        'Lincoln': 'لينكولن',
        'Cadillac': 'كاديلاك',
        'Jaguar': 'جاغوار',
        'Land Rover': 'لاند روفر',
        'Porsche': 'بورش',
        'Ferrari': 'فيراري',
        'Lamborghini': 'لامبورغيني',
        'Maserati': 'مازيراتي',
        'Bentley': 'بنتلي',
        'Rolls Royce': 'رولز رويس',
        'Aston Martin': 'أستون مارتن',
        'McLaren': 'ماكلارين',
        'Bugatti': 'بوجاتي',
        'Koenigsegg': 'كويغسيغ'
      },
      en: {
        'تويوتا': 'Toyota',
        'هوندا': 'Honda',
        'نيسان': 'Nissan',
        'هيونداي': 'Hyundai',
        'كيا': 'Kia',
        'فورد': 'Ford',
        'شيفروليه': 'Chevrolet',
        'بي إم دبليو': 'BMW',
        'مرسيدس': 'Mercedes',
        'أودي': 'Audi',
        'فولكس فاجن': 'Volkswagen',
        'مازدا': 'Mazda',
        'سوبارو': 'Subaru',
        'لكزس': 'Lexus',
        'إنفينيتي': 'Infiniti',
        'أكورا': 'Acura',
        'جينيسيس': 'Genesis',
        'لينكولن': 'Lincoln',
        'كاديلاك': 'Cadillac',
        'جاغوار': 'Jaguar',
        'لاند روفر': 'Land Rover',
        'بورش': 'Porsche',
        'فيراري': 'Ferrari',
        'لامبورغيني': 'Lamborghini',
        'مازيراتي': 'Maserati',
        'بنتلي': 'Bentley',
        'رولز رويس': 'Rolls Royce',
        'أستون مارتن': 'Aston Martin',
        'ماكلارين': 'McLaren',
        'بوجاتي': 'Bugatti',
        'كويغسيغ': 'Koenigsegg'
      }
    },
    // Common service names
    services: {
      ar: {
        'Oil Change': 'تغيير الزيت',
        'Brake Service': 'خدمة الفرامل',
        'Engine Repair': 'إصلاح المحرك',
        'Transmission Service': 'خدمة ناقل الحركة',
        'Tire Replacement': 'استبدال الإطارات',
        'Battery Replacement': 'استبدال البطارية',
        'Air Filter Change': 'تغيير فلتر الهواء',
        'Spark Plug Replacement': 'استبدال شمعات الإشعال',
        'Timing Belt Replacement': 'استبدال حزام التوقيت',
        'Clutch Repair': 'إصلاح القابض',
        'Suspension Repair': 'إصلاح التعليق',
        'Exhaust System Repair': 'إصلاح نظام العادم',
        'AC Service': 'خدمة التكييف',
        'Electrical Repair': 'إصلاح كهربائي',
        'Diagnostic Service': 'خدمة التشخيص',
        'General Maintenance': 'صيانة عامة',
        'Body Repair': 'إصلاح الهيكل',
        'Paint Job': 'دهان',
        'Glass Replacement': 'استبدال الزجاج',
        'Interior Repair': 'إصلاح المقصورة'
      },
      en: {
        'تغيير الزيت': 'Oil Change',
        'خدمة الفرامل': 'Brake Service',
        'إصلاح المحرك': 'Engine Repair',
        'خدمة ناقل الحركة': 'Transmission Service',
        'استبدال الإطارات': 'Tire Replacement',
        'استبدال البطارية': 'Battery Replacement',
        'تغيير فلتر الهواء': 'Air Filter Change',
        'استبدال شمعات الإشعال': 'Spark Plug Replacement',
        'استبدال حزام التوقيت': 'Timing Belt Replacement',
        'إصلاح القابض': 'Clutch Repair',
        'إصلاح التعليق': 'Suspension Repair',
        'إصلاح نظام العادم': 'Exhaust System Repair',
        'خدمة التكييف': 'AC Service',
        'إصلاح كهربائي': 'Electrical Repair',
        'خدمة التشخيص': 'Diagnostic Service',
        'صيانة عامة': 'General Maintenance',
        'إصلاح الهيكل': 'Body Repair',
        'دهان': 'Paint Job',
        'استبدال الزجاج': 'Glass Replacement',
        'إصلاح المقصورة': 'Interior Repair'
      }
    },
    // Common part names
    parts: {
      ar: {
        'Oil Filter': 'فلتر الزيت',
        'Air Filter': 'فلتر الهواء',
        'Brake Pads': 'وسائد الفرامل',
        'Brake Discs': 'أقراص الفرامل',
        'Spark Plugs': 'شمعات الإشعال',
        'Timing Belt': 'حزام التوقيت',
        'Battery': 'بطارية',
        'Tire': 'إطار',
        'Wheel': 'عجلة',
        'Headlight': 'مصباح أمامي',
        'Taillight': 'مصباح خلفي',
        'Windshield': 'زجاج أمامي',
        'Side Mirror': 'مرآة جانبية',
        'Bumper': 'مصد',
        'Fender': 'رفرف',
        'Door Handle': 'مقبض الباب',
        'Window Motor': 'محرك النافذة',
        'AC Compressor': 'كمبرسور التكييف',
        'Alternator': 'مولد كهربائي',
        'Starter': 'محرك بدء التشغيل'
      },
      en: {
        'فلتر الزيت': 'Oil Filter',
        'فلتر الهواء': 'Air Filter',
        'وسائد الفرامل': 'Brake Pads',
        'أقراص الفرامل': 'Brake Discs',
        'شمعات الإشعال': 'Spark Plugs',
        'حزام التوقيت': 'Timing Belt',
        'بطارية': 'Battery',
        'إطار': 'Tire',
        'عجلة': 'Wheel',
        'مصباح أمامي': 'Headlight',
        'مصباح خلفي': 'Taillight',
        'زجاج أمامي': 'Windshield',
        'مرآة جانبية': 'Side Mirror',
        'مصد': 'Bumper',
        'رفرف': 'Fender',
        'مقبض الباب': 'Door Handle',
        'محرك النافذة': 'Window Motor',
        'كمبرسور التكييف': 'AC Compressor',
        'مولد كهربائي': 'Alternator',
        'محرك بدء التشغيل': 'Starter'
      }
    }
  };

  static translateText(text: string | undefined | null, options: LanguageHandlerOptions): string {
    if (!text) return '';
    
    // Clean and normalize the text
    const cleanedText = String(text)
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
      .replace(/[\u00A0]/g, ' ') // Replace non-breaking spaces
      .replace(/[\u2018\u2019]/g, "'") // Replace smart quotes
      .replace(/[\u201C\u201D]/g, '"') // Replace smart double quotes
      .replace(/[\u2013\u2014]/g, '-') // Replace en/em dashes
      .normalize('NFC') // Unicode normalization
      .trim();
    
    if (!cleanedText) return '';

    const { targetLanguage, sourceLanguage } = options;
    
    // If source language is specified and different from target, try to translate
    if (sourceLanguage && sourceLanguage !== targetLanguage) {
      return this.translateFromSource(cleanedText, sourceLanguage, targetLanguage);
    }
    
    // Try to detect language and translate if needed
    return this.autoTranslate(cleanedText, targetLanguage);
  }

  private static translateFromSource(text: string, sourceLang: 'ar' | 'en', targetLang: 'ar' | 'en'): string {
    // Try different translation categories
    const categories = ['vehicleMakes', 'services', 'parts', 'status'];
    
    for (const category of categories) {
      const translations = this.translations[category as keyof typeof this.translations];
      if (translations[sourceLang] && translations[sourceLang][text as keyof typeof translations[typeof sourceLang]]) {
        return translations[sourceLang][text as keyof typeof translations[typeof sourceLang]] as string;
      }
    }
    
    // If no translation found, return original text
    return text;
  }

  private static autoTranslate(text: string, targetLang: 'ar' | 'en'): string {
    // Check if text contains Arabic characters
    const hasArabic = /[\u0600-\u06FF]/.test(text);
    const hasEnglish = /[a-zA-Z]/.test(text);
    
    // If target is Arabic and text is in English, try to translate
    if (targetLang === 'ar' && hasEnglish && !hasArabic) {
      return this.translateFromSource(text, 'en', 'ar');
    }
    
    // If target is English and text is in Arabic, try to translate
    if (targetLang === 'en' && hasArabic && !hasEnglish) {
      return this.translateFromSource(text, 'ar', 'en');
    }
    
    // If text is mixed or no clear language, return as is
    return text;
  }

  static translateStatus(status: string, targetLanguage: 'ar' | 'en'): string {
    const statusMap = this.translations.status[targetLanguage];
    return statusMap[status as keyof typeof statusMap] || status;
  }

  static translateVehicleMake(make: string, targetLanguage: 'ar' | 'en'): string {
    return this.translateText(make, { targetLanguage });
  }

  static translateServiceName(serviceName: string, targetLanguage: 'ar' | 'en'): string {
    return this.translateText(serviceName, { targetLanguage });
  }

  static translatePartName(partName: string, targetLanguage: 'ar' | 'en'): string {
    return this.translateText(partName, { targetLanguage });
  }

  static translateCustomerName(firstName: string, lastName: string, targetLanguage: 'ar' | 'en'): string {
    // Clean and normalize names
    const cleanFirst = this.cleanText(String(firstName || ''));
    const cleanLast = this.cleanText(String(lastName || ''));
    
    if (!cleanFirst && !cleanLast) return '';
    if (!cleanFirst) return cleanLast;
    if (!cleanLast) return cleanFirst;
    
    return `${cleanFirst} ${cleanLast}`;
  }

  private static cleanText(text: string): string {
    return String(text)
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
      .replace(/[\u00A0]/g, ' ') // Replace non-breaking spaces
      .replace(/[\u2018\u2019]/g, "'") // Replace smart quotes
      .replace(/[\u201C\u201D]/g, '"') // Replace smart double quotes
      .replace(/[\u2013\u2014]/g, '-') // Replace en/em dashes
      .normalize('NFC') // Unicode normalization
      .trim();
  }

  static translateEmail(email: string, targetLanguage: 'ar' | 'en'): string {
    // Emails are usually kept as is but clean them
    return this.cleanText(String(email || ''));
  }

  static translatePhone(phone: string, targetLanguage: 'ar' | 'en'): string {
    // Phone numbers are usually kept as is but clean them
    return this.cleanText(String(phone || ''));
  }

  static translateLicensePlate(plate: string, targetLanguage: 'ar' | 'en'): string {
    // License plates are usually kept as is but clean them
    return this.cleanText(String(plate || ''));
  }
}
