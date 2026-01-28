import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Music, ArrowRight, User, Mail, Calendar, MapPin, Lock, Eye, EyeOff, ChevronDown, LogIn } from 'lucide-react';

const USER_DRAFT_KEY = 'pplay_user_draft';

const loadInitialUserData = () => {
   if (typeof window === 'undefined') return { firstName: '', lastName: '', email: '', password: '', birthDate: '', country: '' };

   try {
      const raw = localStorage.getItem(USER_DRAFT_KEY);
      if (!raw) return { firstName: '', lastName: '', email: '', password: '', birthDate: '', country: '' };
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
      return { firstName: '', lastName: '', email: '', password: '', birthDate: '', country: '' };
   }
};

const RegistrationScreen = ({ onComplete }) => {
   // --- STATE ---
   const [isLoginMode, setIsLoginMode] = useState(false); // Toggle for Login/Signup
   const [userData, setUserData] = useState(loadInitialUserData);
   const [errors, setErrors] = useState({});
   const [showPassword, setShowPassword] = useState(false);

   const [isCountryOpen, setIsCountryOpen] = useState(false);
   const [countryQuery, setCountryQuery] = useState('');
   const dropdownRef = useRef(null);

   const today = new Date().toISOString().split('T')[0];

   // --- DATA: COUNTRIES ---
   const countries = [
      { code: 'AF', name: 'Afghanistan' }, { code: 'AL', name: 'Albania' }, { code: 'DZ', name: 'Algeria' },
      { code: 'AR', name: 'Argentina' }, { code: 'AU', name: 'Australia' }, { code: 'AT', name: 'Austria' },
      { code: 'BE', name: 'Belgium' }, { code: 'BR', name: 'Brazil' }, { code: 'BG', name: 'Bulgaria' },
      { code: 'CA', name: 'Canada' }, { code: 'CL', name: 'Chile' }, { code: 'CN', name: 'China' },
      { code: 'CO', name: 'Colombia' }, { code: 'HR', name: 'Croatia' }, { code: 'CZ', name: 'Czech Republic' },
      { code: 'DK', name: 'Denmark' }, { code: 'EG', name: 'Egypt' }, { code: 'FI', name: 'Finland' },
      { code: 'FR', name: 'France' }, { code: 'DE', name: 'Germany' }, { code: 'GR', name: 'Greece' },
      { code: 'HK', name: 'Hong Kong' }, { code: 'HU', name: 'Hungary' }, { code: 'IS', name: 'Iceland' },
      { code: 'IN', name: 'India' }, { code: 'ID', name: 'Indonesia' }, { code: 'IE', name: 'Ireland' },
      { code: 'IL', name: 'Israel' }, { code: 'IT', name: 'Italy' }, { code: 'JP', name: 'Japan' },
      { code: 'MX', name: 'Mexico' }, { code: 'NL', name: 'Netherlands' }, { code: 'NZ', name: 'New Zealand' },
      { code: 'NO', name: 'Norway' }, { code: 'PL', name: 'Poland' }, { code: 'PT', name: 'Portugal' },
      { code: 'RO', name: 'Romania' }, { code: 'RU', name: 'Russia' }, { code: 'SA', name: 'Saudi Arabia' },
      { code: 'SG', name: 'Singapore' }, { code: 'ZA', name: 'South Africa' }, { code: 'KR', name: 'South Korea' },
      { code: 'ES', name: 'Spain' }, { code: 'SE', name: 'Sweden' }, { code: 'CH', name: 'Switzerland' },
      { code: 'TW', name: 'Taiwan' }, { code: 'TH', name: 'Thailand' }, { code: 'TR', name: 'Turkey' },
      { code: 'UA', name: 'Ukraine' }, { code: 'AE', name: 'United Arab Emirates' }, { code: 'GB', name: 'United Kingdom' },
      { code: 'US', name: 'United States' }, { code: 'VN', name: 'Vietnam' }
   ];

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

   useEffect(() => {
      if (!isCountryOpen) setCountryQuery('');
   }, [isCountryOpen]);

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

      // Common validations
      if (!userData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(userData.email)) newErrors.email = 'Email is invalid';

      if (!userData.password) newErrors.password = 'Password is required';

      // Signup-only validations
      if (!isLoginMode) {
         if (!userData.firstName.trim()) newErrors.firstName = 'First name is required';
         if (!userData.lastName.trim()) newErrors.lastName = 'Last name is required';

         if (userData.password) {
            const passwordErrors = validatePassword(userData.password);
            if (passwordErrors.length > 0) newErrors.password = passwordErrors.join(', ');
         }

         if (!userData.birthDate) {
            newErrors.birthDate = 'Birth date is required';
         } else {
            const selectedDate = new Date(userData.birthDate);
            const now = new Date();
            const minAllowedDate = new Date();
            minAllowedDate.setFullYear(now.getFullYear() - 120);

            if (selectedDate > now) newErrors.birthDate = 'Date cannot be in the future';
            else if (selectedDate < minAllowedDate) newErrors.birthDate = 'Please enter a realistic birth date';
         }

         if (!userData.country) newErrors.country = 'Country is required';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleSubmit = () => {
      if (validateForm()) {
         try { localStorage.removeItem(USER_DRAFT_KEY); } catch (e) { console.warn('Failed to clear draft', e); }

         // PASS BOTH DATA AND MODE TO PARENT
         onComplete(userData, isLoginMode);
      }
   };

   const handleChange = (field, value) => {
      setUserData(prev => {
         const updated = { ...prev, [field]: value };
         // Only save draft if signing up
         if (!isLoginMode) {
            try { localStorage.setItem(USER_DRAFT_KEY, JSON.stringify(updated)); } catch (e) { console.warn('Failed save draft', e); }
         }
         return updated;
      });
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
   };

   const getPasswordStrength = () => {
      if (!userData.password) return { strength: 0, label: '', color: '' };
      if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(userData.password)) return { strength: 0, label: 'Invalid', color: 'bg-red-500' };

      const passwordErrors = validatePassword(userData.password);
      const totalRequirements = 4;
      const metRequirements = totalRequirements - passwordErrors.length;

      if (metRequirements === 0) return { strength: 0, label: '', color: '' };
      if (metRequirements === 1) return { strength: 25, label: 'Weak', color: 'bg-red-500' };
      if (metRequirements === 2) return { strength: 50, label: 'Fair', color: 'bg-yellow-500' };
      if (metRequirements === 3) return { strength: 75, label: 'Good', color: 'bg-blue-500' };
      return { strength: 100, label: 'Strong', color: 'bg-green-500' };
   };

   // Country search logic
   const passwordStrength = getPasswordStrength();
   const selectedCountry = countries.find(c => c.code === userData.country);
   const normalizedQuery = countryQuery.trim().toLowerCase();
   const filteredCountries = countries.filter(({ name, code }) => {
      if (!normalizedQuery) return true;
      return name.toLowerCase().includes(normalizedQuery) || code.toLowerCase().includes(normalizedQuery);
   });

   return (
       <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6 py-12">
          <div className="max-w-4xl w-full">
             <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 lg:p-10 space-y-6">

                {/* Header & Toggle */}
                <div className="text-center space-y-4 mb-8">
                   <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 inline-block">
                      <Music className="w-16 h-16 text-white" strokeWidth={1.5} />
                   </div>
                   <h2 className="text-4xl font-bold text-white">
                      {isLoginMode ? 'Welcome Back' : 'Create Account'}
                   </h2>

                   {/* TOGGLE SWITCH */}
                   <div className="flex justify-center mt-4">
                      <div className="bg-black/20 p-1 rounded-xl flex">
                         <button onClick={() => setIsLoginMode(false)} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${!isLoginMode ? 'bg-white text-purple-900 shadow-lg' : 'text-white/60 hover:text-white'}`}>Sign Up</button>
                         <button onClick={() => setIsLoginMode(true)} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${isLoginMode ? 'bg-white text-purple-900 shadow-lg' : 'text-white/60 hover:text-white'}`}>Log In</button>
                      </div>
                   </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                   {/* First/Last Name (Hidden in Login) */}
                   {!isLoginMode && (
                       <>
                          <div>
                             <label className="block text-white font-medium mb-2 flex items-center gap-2"><User className="w-4 h-4" /> First Name</label>
                             <input type="text" value={userData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} className={`w-full px-4 py-3 rounded-xl bg-white/20 text-white border ${errors.firstName ? 'border-red-500' : 'border-white/30'} focus:border-pink-500 outline-none`} placeholder="John" />
                             {errors.firstName && <p className="text-red-300 text-sm mt-1">{errors.firstName}</p>}
                          </div>
                          <div>
                             <label className="block text-white font-medium mb-2 flex items-center gap-2"><User className="w-4 h-4" /> Last Name</label>
                             <input type="text" value={userData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} className={`w-full px-4 py-3 rounded-xl bg-white/20 text-white border ${errors.lastName ? 'border-red-500' : 'border-white/30'} focus:border-pink-500 outline-none`} placeholder="Doe" />
                             {errors.lastName && <p className="text-red-300 text-sm mt-1">{errors.lastName}</p>}
                          </div>
                       </>
                   )}

                   {/* Email (Always Visible) */}
                   <div className="md:col-span-2">
                      <label className="block text-white font-medium mb-2 flex items-center gap-2"><Mail className="w-4 h-4" /> Email</label>
                      <input type="email" value={userData.email} onChange={(e) => handleChange('email', e.target.value)} className={`w-full px-4 py-3 rounded-xl bg-white/20 text-white border ${errors.email ? 'border-red-500' : 'border-white/30'} focus:border-pink-500 outline-none`} placeholder="john.doe@example.com" />
                      {errors.email && <p className="text-red-300 text-sm mt-1">{errors.email}</p>}
                   </div>

                   {/* Password (Always Visible) */}
                   <div className="md:col-span-2">
                      <label className="block text-white font-medium mb-2 flex items-center gap-2"><Lock className="w-4 h-4" /> Password</label>
                      <div className="relative">
                         <input type={showPassword ? 'text' : 'password'} value={userData.password} onChange={(e) => handleChange('password', e.target.value)} className={`w-full px-4 py-3 rounded-xl bg-white/20 text-white border ${errors.password ? 'border-red-500' : 'border-white/30'} focus:border-pink-500 outline-none pr-12`} placeholder="Enter password" />
                         <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                      </div>

                      {/* Password Strength UI (Hidden in Login) */}
                      {!isLoginMode && userData.password && (
                          <div className="mt-2 space-y-2">
                             <div className="flex items-center gap-2">
                                <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden">
                                   <div className={`h-full ${passwordStrength.color} transition-all duration-300`} style={{ width: `${passwordStrength.strength}%` }}></div>
                                </div>
                                {passwordStrength.label && <span className="text-sm font-medium text-white">{passwordStrength.label}</span>}
                             </div>
                          </div>
                      )}
                      {errors.password && <p className="text-red-300 text-sm mt-1">{errors.password}</p>}
                   </div>

                   {/* Birth Date & Country (Hidden in Login) */}
                   {!isLoginMode && (
                       <>
                          <div>
                             <label className="block text-white font-medium mb-2 flex items-center gap-2"><Calendar className="w-4 h-4" /> Birth Date</label>
                             <input type="date" max={today} value={userData.birthDate} onChange={(e) => handleChange('birthDate', e.target.value)} className={`w-full px-4 py-3 rounded-xl bg-white/20 text-white border ${errors.birthDate ? 'border-red-500' : 'border-white/30'} focus:border-pink-500 outline-none`} />
                             {errors.birthDate && <p className="text-red-300 text-sm mt-1">{errors.birthDate}</p>}
                          </div>

                          <div className="relative" ref={dropdownRef}>
                             <label className="block text-white font-medium mb-2 flex items-center gap-2"><MapPin className="w-4 h-4" /> Country</label>
                             <button type="button" onClick={() => setIsCountryOpen(!isCountryOpen)} className={`w-full px-4 py-3 rounded-xl bg-white/20 text-white text-left border flex items-center justify-between ${errors.country ? 'border-red-500' : 'border-white/30'} focus:border-pink-500 outline-none`}>
                                {selectedCountry ? (
                                    <div className="flex items-center gap-3">
                                       <img src={`https://flagcdn.com/w20/${selectedCountry.code.toLowerCase()}.png`} width="20" alt="" className="rounded-sm" />
                                       <span>{selectedCountry.name}</span>
                                    </div>
                                ) : <span className="text-white/50">Select country</span>}
                                <ChevronDown className={`w-5 h-5 text-white/50 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} />
                             </button>

                             {isCountryOpen && (
                                 <div className="absolute z-50 w-full mt-2 bg-gray-900 border border-white/20 rounded-xl shadow-xl max-h-72 overflow-hidden">
                                    <div className="p-3 border-b border-white/10 bg-black/20">
                                       <input type="text" value={countryQuery} onChange={(e) => setCountryQuery(e.target.value)} placeholder="Search..." className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:border-pink-500 outline-none" autoFocus />
                                    </div>
                                    <div className="max-h-56 overflow-y-auto">
                                       {filteredCountries.map((country) => (
                                           <button key={country.code} type="button" onClick={() => { handleChange('country', country.code); setIsCountryOpen(false); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 text-white text-left">
                                              <img src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`} width="20" alt="" className="rounded-sm" />
                                              <span>{country.name}</span>
                                           </button>
                                       ))}
                                    </div>
                                 </div>
                             )}
                             {errors.country && <p className="text-red-300 text-sm mt-1">{errors.country}</p>}
                          </div>
                       </>
                   )}
                </div>

                {/* Submit Button */}
                <button onClick={handleSubmit} className="w-full mt-6 bg-gradient-to-r from-pink-500 to-violet-500 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-pink-500/50 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                   <span>{isLoginMode ? 'Log In' : 'Continue'}</span>
                   {isLoginMode ? <LogIn className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                </button>

                <p className="text-white/60 text-sm text-center">By continuing, you agree to our Terms & Privacy Policy</p>
             </div>
          </div>
       </div>
   );
};

export default RegistrationScreen;