import React, { useState, useRef, useEffect } from 'react';
import { Music, ArrowRight, User, Mail, Calendar, MapPin, Lock, Eye, EyeOff, ChevronDown } from 'lucide-react';

const USER_DRAFT_KEY = 'pplay_user_draft';

const loadInitialUserData = () => {
   if (typeof window === 'undefined') return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      birthDate: '',
      country: ''
   };

   try {
      const raw = localStorage.getItem(USER_DRAFT_KEY);
      if (!raw) {
         return {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            birthDate: '',
            country: ''
         };
      }
      const parsed = JSON.parse(raw);
      return {
         firstName: parsed.firstName || '',
         lastName: parsed.lastName || '',
         email: parsed.email || '',
         password: parsed.password || '',
         birthDate: parsed.birthDate || '',
         country: parsed.country || ''
      };
   } catch {
      return {
         firstName: '',
         lastName: '',
         email: '',
         password: '',
         birthDate: '',
         country: ''
      };
   }
};


const RegistrationScreen = ({ onComplete }) => {
   const [userData, setUserData] = useState(loadInitialUserData);


   const [errors, setErrors] = useState({});
   const [showPassword, setShowPassword] = useState(false);

   const [isCountryOpen, setIsCountryOpen] = useState(false);
   const dropdownRef = useRef(null);

   // This is Rotem's fix: Define "today" to block future dates
   const today = new Date().toISOString().split('T')[0];

   // Close dropdown when clicking outside
   useEffect(() => {
      const handleClickOutside = (event) => {
         if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsCountryOpen(false);
         }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   const countries = [
      { code: 'AF', name: 'Afghanistan' },
      { code: 'AL', name: 'Albania' },
      { code: 'DZ', name: 'Algeria' },
      { code: 'AR', name: 'Argentina' },
      { code: 'AM', name: 'Armenia' },
      { code: 'AU', name: 'Australia' },
      { code: 'AT', name: 'Austria' },
      { code: 'AZ', name: 'Azerbaijan' },
      { code: 'BH', name: 'Bahrain' },
      { code: 'BD', name: 'Bangladesh' },
      { code: 'BY', name: 'Belarus' },
      { code: 'BE', name: 'Belgium' },
      { code: 'BR', name: 'Brazil' },
      { code: 'BG', name: 'Bulgaria' },
      { code: 'CA', name: 'Canada' },
      { code: 'CL', name: 'Chile' },
      { code: 'CN', name: 'China' },
      { code: 'CO', name: 'Colombia' },
      { code: 'CR', name: 'Costa Rica' },
      { code: 'HR', name: 'Croatia' },
      { code: 'CY', name: 'Cyprus' },
      { code: 'CZ', name: 'Czech Republic' },
      { code: 'DK', name: 'Denmark' },
      { code: 'DO', name: 'Dominican Republic' },
      { code: 'EC', name: 'Ecuador' },
      { code: 'EG', name: 'Egypt' },
      { code: 'SV', name: 'El Salvador' },
      { code: 'EE', name: 'Estonia' },
      { code: 'ET', name: 'Ethiopia' },
      { code: 'FI', name: 'Finland' },
      { code: 'FR', name: 'France' },
      { code: 'GE', name: 'Georgia' },
      { code: 'DE', name: 'Germany' },
      { code: 'GH', name: 'Ghana' },
      { code: 'GR', name: 'Greece' },
      { code: 'GT', name: 'Guatemala' },
      { code: 'HN', name: 'Honduras' },
      { code: 'HK', name: 'Hong Kong' },
      { code: 'HU', name: 'Hungary' },
      { code: 'IS', name: 'Iceland' },
      { code: 'IN', name: 'India' },
      { code: 'ID', name: 'Indonesia' },
      { code: 'IR', name: 'Iran' },
      { code: 'IQ', name: 'Iraq' },
      { code: 'IE', name: 'Ireland' },
      { code: 'IL', name: 'Israel' },
      { code: 'IT', name: 'Italy' },
      { code: 'JM', name: 'Jamaica' },
      { code: 'JP', name: 'Japan' },
      { code: 'JO', name: 'Jordan' },
      { code: 'KZ', name: 'Kazakhstan' },
      { code: 'KE', name: 'Kenya' },
      { code: 'KW', name: 'Kuwait' },
      { code: 'LV', name: 'Latvia' },
      { code: 'LB', name: 'Lebanon' },
      { code: 'LT', name: 'Lithuania' },
      { code: 'LU', name: 'Luxembourg' },
      { code: 'MY', name: 'Malaysia' },
      { code: 'MX', name: 'Mexico' },
      { code: 'MA', name: 'Morocco' },
      { code: 'NL', name: 'Netherlands' },
      { code: 'NZ', name: 'New Zealand' },
      { code: 'NG', name: 'Nigeria' },
      { code: 'NO', name: 'Norway' },
      { code: 'OM', name: 'Oman' },
      { code: 'PK', name: 'Pakistan' },
      { code: 'PA', name: 'Panama' },
      { code: 'PY', name: 'Paraguay' },
      { code: 'PE', name: 'Peru' },
      { code: 'PH', name: 'Philippines' },
      { code: 'PL', name: 'Poland' },
      { code: 'PT', name: 'Portugal' },
      { code: 'QA', name: 'Qatar' },
      { code: 'RO', name: 'Romania' },
      { code: 'RU', name: 'Russia' },
      { code: 'SA', name: 'Saudi Arabia' },
      { code: 'RS', name: 'Serbia' },
      { code: 'SG', name: 'Singapore' },
      { code: 'SK', name: 'Slovakia' },
      { code: 'SI', name: 'Slovenia' },
      { code: 'ZA', name: 'South Africa' },
      { code: 'KR', name: 'South Korea' },
      { code: 'ES', name: 'Spain' },
      { code: 'LK', name: 'Sri Lanka' },
      { code: 'SE', name: 'Sweden' },
      { code: 'CH', name: 'Switzerland' },
      { code: 'TW', name: 'Taiwan' },
      { code: 'TH', name: 'Thailand' },
      { code: 'TN', name: 'Tunisia' },
      { code: 'TR', name: 'Turkey' },
      { code: 'UA', name: 'Ukraine' },
      { code: 'AE', name: 'United Arab Emirates' },
      { code: 'GB', name: 'United Kingdom' },
      { code: 'US', name: 'United States' },
      { code: 'UY', name: 'Uruguay' },
      { code: 'VE', name: 'Venezuela' },
      { code: 'VN', name: 'Vietnam' },
      { code: 'YE', name: 'Yemen' }
   ];

   const validatePassword = (password) => {
      const errors = [];
      if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(password) && password.length > 0) {
         return ['Password must contain only English letters'];
      }
      if (password.length < 8) errors.push('At least 8 characters');
      if (!/[A-Z]/.test(password)) errors.push('At least 1 uppercase letter');
      if (!/[0-9]/.test(password)) errors.push('At least 1 number');
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('At least 1 special character');
      return errors;
   };

   const validateForm = () => {
      const newErrors = {};
      if (!userData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!userData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!userData.email.trim()) {
         newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
         newErrors.email = 'Email is invalid';
      }
      if (!userData.password) {
         newErrors.password = 'Password is required';
      } else {
         const passwordErrors = validatePassword(userData.password);
         if (passwordErrors.length > 0) newErrors.password = passwordErrors.join(', ');
      }

      // ROTEM'S FIX: Date Validation Logic
      if (!userData.birthDate) {
         newErrors.birthDate = 'Birth date is required';
      } else {
         const selectedDate = new Date(userData.birthDate);
         const now = new Date();
         const minAllowedDate = new Date();
         minAllowedDate.setFullYear(now.getFullYear() - 120);

         if (selectedDate > now) {
            newErrors.birthDate = 'Date cannot be in the future';
         } else if (selectedDate < minAllowedDate) {
            newErrors.birthDate = 'Please enter a realistic birth date';
         }
      }

      if (!userData.country) newErrors.country = 'Country is required';

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleSubmit = () => {
      if (validateForm()) {
         try {
            localStorage.removeItem(USER_DRAFT_KEY);
         } catch (e) {
            console.warn('Failed to clear draft user data', e);
         }
         onComplete(userData);
      }
   };


   const handleChange = (field, value) => {
      setUserData(prev => {
         const updated = { ...prev, [field]: value };

         try {
            localStorage.setItem(USER_DRAFT_KEY, JSON.stringify(updated));
         } catch (e) {
            console.warn('Failed to save draft user data', e);
         }

         return updated;
      });

      if (errors[field]) {
         setErrors(prev => ({ ...prev, [field]: '' }));
      }
   };


   const getPasswordStrength = () => {
      if (!userData.password) return { strength: 0, label: '', color: '' };
      if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(userData.password)) {
         return { strength: 0, label: 'Invalid', color: 'bg-red-500' };
      }
      const passwordErrors = validatePassword(userData.password);
      const totalRequirements = 4;
      const metRequirements = totalRequirements - passwordErrors.length;
      if (metRequirements === 0) return { strength: 0, label: '', color: '' };
      if (metRequirements === 1) return { strength: 25, label: 'Weak', color: 'bg-red-500' };
      if (metRequirements === 2) return { strength: 50, label: 'Fair', color: 'bg-yellow-500' };
      if (metRequirements === 3) return { strength: 75, label: 'Good', color: 'bg-blue-500' };
      return { strength: 100, label: 'Strong', color: 'bg-green-500' };
   };

   const passwordStrength = getPasswordStrength();
   const selectedCountry = countries.find(c => c.code === userData.country);

   return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
         <div className="max-w-md w-full">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 space-y-6">
               {/* Header */}
               <div className="text-center space-y-4 mb-8">
                  <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 inline-block">
                     <Music className="w-16 h-16 text-white" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-4xl font-bold text-white">Create Your Account</h2>
                  <p className="text-white/80">Join us and discover your perfect playlist</p>
               </div>

               {/* Form Fields */}
               <div className="space-y-4">
                  {/* First Name */}
                  <div>
                     <label className="block text-white font-medium mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        First Name
                     </label>
                     <input
                        type="text"
                        value={userData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 border ${errors.firstName ? 'border-red-500' : 'border-white/30'
                           } focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50`}
                        placeholder="John"
                     />
                     {errors.firstName && <p className="text-red-300 text-sm mt-1">{errors.firstName}</p>}
                  </div>

                  {/* Last Name */}
                  <div>
                     <label className="block text-white font-medium mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Last Name
                     </label>
                     <input
                        type="text"
                        value={userData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 border ${errors.lastName ? 'border-red-500' : 'border-white/30'
                           } focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50`}
                        placeholder="Doe"
                     />
                     {errors.lastName && <p className="text-red-300 text-sm mt-1">{errors.lastName}</p>}
                  </div>

                  {/* Email */}
                  <div>
                     <label className="block text-white font-medium mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                     </label>
                     <input
                        type="email"
                        value={userData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 border ${errors.email ? 'border-red-500' : 'border-white/30'
                           } focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50`}
                        placeholder="john.doe@example.com"
                     />
                     {errors.email && <p className="text-red-300 text-sm mt-1">{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div>
                     <label className="block text-white font-medium mb-2 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Password
                     </label>
                     <div className="relative">
                        <input
                           type={showPassword ? 'text' : 'password'}
                           value={userData.password}
                           onChange={(e) => handleChange('password', e.target.value)}
                           className={`w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 border ${errors.password ? 'border-red-500' : 'border-white/30'
                              } focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 pr-12`}
                           placeholder="Enter your password"
                        />
                        <button
                           type="button"
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                        >
                           {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                     </div>

                     {/* FIX: Restored the Password Strength UI that was accidentally deleted */}
                     {userData.password && (
                        <div className="mt-2 space-y-2">
                           <div className="flex items-center gap-2">
                              <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden">
                                 <div
                                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                    style={{ width: `${passwordStrength.strength}%` }}
                                 ></div>
                              </div>
                              {passwordStrength.label && (
                                 <span className={`text-sm font-medium ${passwordStrength.strength === 100 ? 'text-green-300' :
                                    passwordStrength.strength >= 75 ? 'text-blue-300' :
                                       passwordStrength.strength >= 50 ? 'text-yellow-300' :
                                          'text-red-300'
                                    }`}>
                                    {passwordStrength.label}
                                 </span>
                              )}
                           </div>
                           <div className="space-y-1">
                              {!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(userData.password) && userData.password.length > 0 ? (
                                 <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                                    <p className="text-red-300 text-sm font-medium flex items-center gap-2">
                                       <span>⚠️</span>
                                       <span>Password must contain only English letters!</span>
                                    </p>
                                    <p className="text-red-200/80 text-xs mt-1">Please use only: a-z, A-Z, 0-9, and special characters</p>
                                 </div>
                              ) : (
                                 <>
                                    <p className="text-white/60 text-xs font-medium">Password must contain:</p>
                                    <div className="grid grid-cols-2 gap-1">
                                       <div className={`text-xs flex items-center gap-1 ${userData.password.length >= 8 ? 'text-green-300' : 'text-white/60'}`}>
                                          <span>{userData.password.length >= 8 ? '✓' : '○'}</span><span>8+ characters</span>
                                       </div>
                                       <div className={`text-xs flex items-center gap-1 ${/[A-Z]/.test(userData.password) ? 'text-green-300' : 'text-white/60'}`}>
                                          <span>{/[A-Z]/.test(userData.password) ? '✓' : '○'}</span><span>1 uppercase</span>
                                       </div>
                                       <div className={`text-xs flex items-center gap-1 ${/[0-9]/.test(userData.password) ? 'text-green-300' : 'text-white/60'}`}>
                                          <span>{/[0-9]/.test(userData.password) ? '✓' : '○'}</span><span>1 number</span>
                                       </div>
                                       <div className={`text-xs flex items-center gap-1 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(userData.password) ? 'text-green-300' : 'text-white/60'}`}>
                                          <span>{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(userData.password) ? '✓' : '○'}</span><span>1 special char</span>
                                       </div>
                                    </div>
                                 </>
                              )}
                           </div>
                        </div>
                     )}
                     {errors.password && <p className="text-red-300 text-sm mt-1">{errors.password}</p>}
                  </div>

                  {/* Birth Date (With Rotem's Logic) */}
                  <div>
                     <label className="block text-white font-medium mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Birth Date
                     </label>
                     <input
                        type="date"
                        max={today}
                        value={userData.birthDate}
                        onChange={(e) => handleChange('birthDate', e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 border ${errors.birthDate ? 'border-red-500' : 'border-white/30'
                           } focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50`}
                     />
                     {errors.birthDate && <p className="text-red-300 text-sm mt-1">{errors.birthDate}</p>}
                  </div>

                  {/* Country (Custom Dropdown for Flags) */}
                  <div className="relative" ref={dropdownRef}>
                     <label className="block text-white font-medium mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Country
                     </label>

                     <button
                        type="button"
                        onClick={() => setIsCountryOpen(!isCountryOpen)}
                        className={`w-full px-4 py-3 rounded-xl bg-white/20 text-white text-left border flex items-center justify-between ${errors.country ? 'border-red-500' : 'border-white/30'
                           } focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50`}
                     >
                        {selectedCountry ? (
                           <div className="flex items-center gap-3">
                              <img
                                 src={`https://flagcdn.com/w20/${selectedCountry.code.toLowerCase()}.png`}
                                 srcSet={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png 2x`}
                                 width="20"
                                 alt={selectedCountry.name}
                                 className="rounded-sm"
                              />
                              <span>{selectedCountry.name}</span>
                           </div>
                        ) : (
                           <span className="text-white/50">Select your country</span>
                        )}
                        <ChevronDown className={`w-5 h-5 text-white/50 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} />
                     </button>

                     {isCountryOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-gray-900 border border-white/20 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                           {countries.map((country) => (
                              <button
                                 key={country.code}
                                 type="button"
                                 onClick={() => {
                                    handleChange('country', country.code);
                                    setIsCountryOpen(false);
                                 }}
                                 className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 text-white transition-colors text-left"
                              >
                                 <img
                                    src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`}
                                    srcSet={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png 2x`}
                                    width="20"
                                    alt={country.name}
                                    className="rounded-sm"
                                 />
                                 <span>{country.name}</span>
                                 {userData.country === country.code && (
                                    <div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>
                                 )}
                              </button>
                           ))}
                        </div>
                     )}

                     {errors.country && <p className="text-red-300 text-sm mt-1">{errors.country}</p>}
                  </div>
               </div>

               {/* Submit Button */}
               <button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-pink-500/50 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
               >
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
               </button>

               {/* Privacy Note */}
               <p className="text-white/60 text-sm text-center">
                  By continuing, you agree to our Terms & Privacy Policy
               </p>
            </div>
         </div>
      </div>
   );
};

export default RegistrationScreen;