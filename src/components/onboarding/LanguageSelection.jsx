import React, { useState } from 'react';
import { Check, ArrowRight, SkipForward, ArrowLeft, Globe } from 'lucide-react';

const LanguageSelection = ({ onContinue, onSkip, onBack }) => {
   const [selectedLanguages, setSelectedLanguages] = useState([]);

   const languages = [
      // Major World Languages
      { id: 1, name: 'English', countryCode: 'gb', code: 'en' },
      { id: 2, name: 'Spanish', countryCode: 'es', code: 'es' },
      { id: 3, name: 'French', countryCode: 'fr', code: 'fr' },
      { id: 4, name: 'German', countryCode: 'de', code: 'de' },
      { id: 5, name: 'Italian', countryCode: 'it', code: 'it' },
      { id: 6, name: 'Portuguese', countryCode: 'br', code: 'pt' },
      { id: 7, name: 'Russian', countryCode: 'ru', code: 'ru' },
      { id: 8, name: 'Mandarin', countryCode: 'cn', code: 'zh' },
      { id: 9, name: 'Japanese', countryCode: 'jp', code: 'ja' },
      { id: 10, name: 'Korean', countryCode: 'kr', code: 'ko' },

      // Middle Eastern
      { id: 11, name: 'Arabic', countryCode: 'sa', code: 'ar' },
      { id: 12, name: 'Hebrew', countryCode: 'il', code: 'he' },
      { id: 13, name: 'Turkish', countryCode: 'tr', code: 'tr' },
      { id: 14, name: 'Persian', countryCode: 'ir', code: 'fa' },

      // South Asian
      { id: 15, name: 'Hindi', countryCode: 'in', code: 'hi' },
      { id: 16, name: 'Punjabi', countryCode: 'in', code: 'pa' },
      { id: 17, name: 'Urdu', countryCode: 'pk', code: 'ur' },
      { id: 18, name: 'Bengali', countryCode: 'bd', code: 'bn' },
      { id: 19, name: 'Tamil', countryCode: 'in', code: 'ta' },

      // Southeast Asian
      { id: 20, name: 'Thai', countryCode: 'th', code: 'th' },
      { id: 21, name: 'Vietnamese', countryCode: 'vn', code: 'vi' },
      { id: 22, name: 'Indonesian', countryCode: 'id', code: 'id' },
      { id: 23, name: 'Filipino', countryCode: 'ph', code: 'tl' },
      { id: 24, name: 'Malay', countryCode: 'my', code: 'ms' },

      // European
      { id: 25, name: 'Dutch', countryCode: 'nl', code: 'nl' },
      { id: 26, name: 'Swedish', countryCode: 'se', code: 'sv' },
      { id: 27, name: 'Norwegian', countryCode: 'no', code: 'no' },
      { id: 28, name: 'Danish', countryCode: 'dk', code: 'da' },
      { id: 29, name: 'Finnish', countryCode: 'fi', code: 'fi' },
      { id: 30, name: 'Polish', countryCode: 'pl', code: 'pl' },
      { id: 31, name: 'Czech', countryCode: 'cz', code: 'cs' },
      { id: 32, name: 'Romanian', countryCode: 'ro', code: 'ro' },
      { id: 33, name: 'Greek', countryCode: 'gr', code: 'el' },
      { id: 34, name: 'Hungarian', countryCode: 'hu', code: 'hu' },
      { id: 35, name: 'Ukrainian', countryCode: 'ua', code: 'uk' },

      // African
      { id: 36, name: 'Swahili', countryCode: 'ke', code: 'sw' },
      { id: 37, name: 'Amharic', countryCode: 'et', code: 'am' },
      { id: 38, name: 'Zulu', countryCode: 'za', code: 'zu' },
      { id: 39, name: 'Afrikaans', countryCode: 'za', code: 'af' },

      // Americas
      { id: 40, name: 'Portuguese (BR)', countryCode: 'br', code: 'pt-br' },
      { id: 41, name: 'Spanish (MX)', countryCode: 'mx', code: 'es-mx' },
      { id: 42, name: 'French (CA)', countryCode: 'ca', code: 'fr-ca' },

      // Other Popular
      { id: 43, name: 'Catalan', countryCode: 'es', code: 'ca' },
      { id: 44, name: 'Basque', countryCode: 'es', code: 'eu' },
      { id: 45, name: 'Galician', countryCode: 'es', code: 'gl' },
      { id: 46, name: 'Serbian', countryCode: 'rs', code: 'sr' },
      { id: 47, name: 'Croatian', countryCode: 'hr', code: 'hr' },
      { id: 48, name: 'Bulgarian', countryCode: 'bg', code: 'bg' },
      { id: 49, name: 'Slovak', countryCode: 'sk', code: 'sk' },
      { id: 50, name: 'Lithuanian', countryCode: 'lt', code: 'lt' },
   ];

   const toggleLanguage = (langId) => {
      setSelectedLanguages(prev =>
         prev.includes(langId)
            ? prev.filter(id => id !== langId)
            : [...prev, langId]
      );
   };

   const canContinue = selectedLanguages.length >= 1;

   return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-6">
         <div className="max-w-7xl mx-auto py-12">
            {/* Progress Indicator */}
            <div className="mb-8">
               <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                     <Check className="w-6 h-6" />
                  </div>
                  <div className="w-12 h-1 bg-white/20"></div>
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold">
                     2
                  </div>
                  <div className="w-12 h-1 bg-white/10"></div>
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white/50 font-bold">
                     3
                  </div>
                  <div className="w-12 h-1 bg-white/10"></div>
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white/50 font-bold">
                     4
                  </div>
               </div>
               <p className="text-center text-white/60 text-sm">Step 2 of 4</p>
            </div>

            {/* Header */}
            <div className="text-center mb-12 space-y-4">
               <Globe className="w-16 h-16 text-white mx-auto" />
               <h2 className="text-5xl font-bold text-white">
                  What languages do you listen to?
               </h2>
               <p className="text-xl text-white/80">
                  Select at least one language • 50 languages available
               </p>
               <div className="flex items-center justify-center gap-4">
                  <p className="text-white/60">Selected: {selectedLanguages.length}</p>
                  {selectedLanguages.length >= 1 && (
                     <p className="text-green-300 text-sm">✓ Good to go!</p>
                  )}
               </div>
            </div>

            {/* Language Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-12 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
               {languages.map(lang => (
                  <button
                     key={lang.id}
                     onClick={() => toggleLanguage(lang.id)}
                     className={`relative group overflow-hidden rounded-2xl p-4 transition-all duration-300 ${selectedLanguages.includes(lang.id)
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500 scale-105 shadow-2xl'
                        : 'bg-white/10 backdrop-blur-lg hover:bg-white/20 hover:scale-105'
                        }`}
                  >
                     <div className="flex flex-col items-center gap-3">
                        <img
                           src={`https://flagcdn.com/w80/${lang.countryCode}.png`}
                           alt={`${lang.name} flag`}
                           className="w-12 h-8 object-cover rounded shadow-md"
                           loading="lazy"
                        />
                        <div className="text-white font-bold text-sm leading-tight">{lang.name}</div>
                     </div>

                     {selectedLanguages.includes(lang.id) && (
                        <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                           <Check className="w-4 h-4 text-blue-600" />
                        </div>
                     )}
                  </button>
               ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 max-w-2xl mx-auto">
               {onBack && (
                  <button
                     onClick={onBack}
                     className="bg-white/10 backdrop-blur-lg text-white px-6 py-4 rounded-2xl font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                  >
                     <ArrowLeft className="w-5 h-5" />
                     <span>Back</span>
                  </button>
               )}

               <button
                  onClick={() => onSkip(selectedLanguages)}
                  className="flex-1 bg-white/10 backdrop-blur-lg text-white py-4 rounded-2xl font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2"
               >
                  <SkipForward className="w-5 h-5" />
                  <span>Save & Skip</span>
               </button>
               <button
                  onClick={() => onContinue(selectedLanguages)}
                  disabled={!canContinue}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${canContinue
                     ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105'
                     : 'bg-white/10 text-white/50 cursor-not-allowed'
                     }`}
               >
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
               </button>
            </div>

            {!canContinue && selectedLanguages.length === 0 && (
               <p className="text-center text-white/60 text-sm mt-4">
                  Select at least 1 language to continue
               </p>
            )}
         </div>
      </div>
   );
};

export default LanguageSelection;