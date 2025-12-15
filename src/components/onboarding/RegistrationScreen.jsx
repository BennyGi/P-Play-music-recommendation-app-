import React, { useState } from 'react';
import { Music, ArrowRight, User, Mail, Calendar, MapPin, Lock, Eye, EyeOff } from 'lucide-react';

const RegistrationScreen = ({ onComplete }) => {
   const [userData, setUserData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      birthDate: '',
      country: ''
   });

   const [errors, setErrors] = useState({});
   const [showPassword, setShowPassword] = useState(false);

   const validatePassword = (password) => {
      const errors = [];

      // Check for non-English characters FIRST (highest priority)
      if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(password) && password.length > 0) {
         return ['Password must contain only English letters'];
      }

      if (password.length < 8) {
         errors.push('At least 8 characters');
      }

      if (!/[A-Z]/.test(password)) {
         errors.push('At least 1 uppercase letter');
      }

      if (!/[0-9]/.test(password)) {
         errors.push('At least 1 number');
      }

      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
         errors.push('At least 1 special character');
      }

      return errors;
   };

   const validateForm = () => {
      const newErrors = {};

      if (!userData.firstName.trim()) {
         newErrors.firstName = 'First name is required';
      }

      if (!userData.lastName.trim()) {
         newErrors.lastName = 'Last name is required';
      }

      if (!userData.email.trim()) {
         newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
         newErrors.email = 'Email is invalid';
      }

      // Password validation
      if (!userData.password) {
         newErrors.password = 'Password is required';
      } else {
         const passwordErrors = validatePassword(userData.password);
         if (passwordErrors.length > 0) {
            newErrors.password = passwordErrors.join(', ');
         }
      }

      if (!userData.birthDate) {
         newErrors.birthDate = 'Birth date is required';
      }

      if (!userData.country) {
         newErrors.country = 'Country is required';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleSubmit = () => {
      if (validateForm()) {
         onComplete(userData);
      }
   };

   const handleChange = (field, value) => {
      setUserData(prev => ({ ...prev, [field]: value }));
      if (errors[field]) {
         setErrors(prev => ({ ...prev, [field]: '' }));
      }
   };

   const getPasswordStrength = () => {
      if (!userData.password) return { strength: 0, label: '', color: '' };

      // Check for non-English characters first
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
                     {errors.firstName && (
                        <p className="text-red-300 text-sm mt-1">{errors.firstName}</p>
                     )}
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
                     {errors.lastName && (
                        <p className="text-red-300 text-sm mt-1">{errors.lastName}</p>
                     )}
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
                     {errors.email && (
                        <p className="text-red-300 text-sm mt-1">{errors.email}</p>
                     )}
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
                           {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                           ) : (
                              <Eye className="w-5 h-5" />
                           )}
                        </button>
                     </div>

                     {/* Password Strength Bar */}
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

                           {/* Password Requirements */}
                           <div className="space-y-1">
                              {/* Check for non-English characters first */}
                              {!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(userData.password) && userData.password.length > 0 ? (
                                 <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                                    <p className="text-red-300 text-sm font-medium flex items-center gap-2">
                                       <span>⚠️</span>
                                       <span>Password must contain only English letters!</span>
                                    </p>
                                    <p className="text-red-200/80 text-xs mt-1">
                                       Please use only: a-z, A-Z, 0-9, and special characters (!@#$%^&* etc.)
                                    </p>
                                 </div>
                              ) : (
                                 <>
                                    <p className="text-white/60 text-xs font-medium">Password must contain:</p>
                                    <div className="grid grid-cols-2 gap-1">
                                       <div className={`text-xs flex items-center gap-1 ${userData.password.length >= 8 ? 'text-green-300' : 'text-white/60'
                                          }`}>
                                          <span>{userData.password.length >= 8 ? '✓' : '○'}</span>
                                          <span>8+ characters</span>
                                       </div>
                                       <div className={`text-xs flex items-center gap-1 ${/[A-Z]/.test(userData.password) ? 'text-green-300' : 'text-white/60'
                                          }`}>
                                          <span>{/[A-Z]/.test(userData.password) ? '✓' : '○'}</span>
                                          <span>1 uppercase</span>
                                       </div>
                                       <div className={`text-xs flex items-center gap-1 ${/[0-9]/.test(userData.password) ? 'text-green-300' : 'text-white/60'
                                          }`}>
                                          <span>{/[0-9]/.test(userData.password) ? '✓' : '○'}</span>
                                          <span>1 number</span>
                                       </div>
                                       <div className={`text-xs flex items-center gap-1 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(userData.password) ? 'text-green-300' : 'text-white/60'
                                          }`}>
                                          <span>{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(userData.password) ? '✓' : '○'}</span>
                                          <span>1 special char</span>
                                       </div>
                                    </div>
                                 </>
                              )}
                           </div>
                        </div>
                     )}

                     {errors.password && (
                        <p className="text-red-300 text-sm mt-1">{errors.password}</p>
                     )}
                  </div>

                  {/* Birth Date */}
                  <div>
                     <label className="block text-white font-medium mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Birth Date
                     </label>
                     <input
                        type="date"
                        value={userData.birthDate}
                        onChange={(e) => handleChange('birthDate', e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 border ${errors.birthDate ? 'border-red-500' : 'border-white/30'
                           } focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50`}
                     />
                     {errors.birthDate && (
                        <p className="text-red-300 text-sm mt-1">{errors.birthDate}</p>
                     )}
                  </div>

                  {/* Country */}
                  <div>
                     <label className="block text-white font-medium mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Country
                     </label>
                     <select
                        value={userData.country}
                        onChange={(e) => handleChange('country', e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl bg-white/20 text-white border ${errors.country ? 'border-red-500' : 'border-white/30'
                           } focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50`}
                     >
                        <option value="" className="bg-gray-800">Select your country</option>
                        <option value="AF" className="bg-gray-800">Afghanistan</option>
                        <option value="AL" className="bg-gray-800">Albania</option>
                        <option value="DZ" className="bg-gray-800">Algeria</option>
                        <option value="AR" className="bg-gray-800">Argentina</option>
                        <option value="AM" className="bg-gray-800">Armenia</option>
                        <option value="AU" className="bg-gray-800">Australia</option>
                        <option value="AT" className="bg-gray-800">Austria</option>
                        <option value="AZ" className="bg-gray-800">Azerbaijan</option>
                        <option value="BH" className="bg-gray-800">Bahrain</option>
                        <option value="BD" className="bg-gray-800">Bangladesh</option>
                        <option value="BY" className="bg-gray-800">Belarus</option>
                        <option value="BE" className="bg-gray-800">Belgium</option>
                        <option value="BR" className="bg-gray-800">Brazil</option>
                        <option value="BG" className="bg-gray-800">Bulgaria</option>
                        <option value="CA" className="bg-gray-800">Canada</option>
                        <option value="CL" className="bg-gray-800">Chile</option>
                        <option value="CN" className="bg-gray-800">China</option>
                        <option value="CO" className="bg-gray-800">Colombia</option>
                        <option value="CR" className="bg-gray-800">Costa Rica</option>
                        <option value="HR" className="bg-gray-800">Croatia</option>
                        <option value="CY" className="bg-gray-800">Cyprus</option>
                        <option value="CZ" className="bg-gray-800">Czech Republic</option>
                        <option value="DK" className="bg-gray-800">Denmark</option>
                        <option value="DO" className="bg-gray-800">Dominican Republic</option>
                        <option value="EC" className="bg-gray-800">Ecuador</option>
                        <option value="EG" className="bg-gray-800">Egypt</option>
                        <option value="SV" className="bg-gray-800">El Salvador</option>
                        <option value="EE" className="bg-gray-800">Estonia</option>
                        <option value="ET" className="bg-gray-800">Ethiopia</option>
                        <option value="FI" className="bg-gray-800">Finland</option>
                        <option value="FR" className="bg-gray-800">France</option>
                        <option value="GE" className="bg-gray-800">Georgia</option>
                        <option value="DE" className="bg-gray-800">Germany</option>
                        <option value="GH" className="bg-gray-800">Ghana</option>
                        <option value="GR" className="bg-gray-800">Greece</option>
                        <option value="GT" className="bg-gray-800">Guatemala</option>
                        <option value="HN" className="bg-gray-800">Honduras</option>
                        <option value="HK" className="bg-gray-800">Hong Kong</option>
                        <option value="HU" className="bg-gray-800">Hungary</option>
                        <option value="IS" className="bg-gray-800">Iceland</option>
                        <option value="IN" className="bg-gray-800">India</option>
                        <option value="ID" className="bg-gray-800">Indonesia</option>
                        <option value="IR" className="bg-gray-800">Iran</option>
                        <option value="IQ" className="bg-gray-800">Iraq</option>
                        <option value="IE" className="bg-gray-800">Ireland</option>
                        <option value="IL" className="bg-gray-800">Israel</option>
                        <option value="IT" className="bg-gray-800">Italy</option>
                        <option value="JM" className="bg-gray-800">Jamaica</option>
                        <option value="JP" className="bg-gray-800">Japan</option>
                        <option value="JO" className="bg-gray-800">Jordan</option>
                        <option value="KZ" className="bg-gray-800">Kazakhstan</option>
                        <option value="KE" className="bg-gray-800">Kenya</option>
                        <option value="KW" className="bg-gray-800">Kuwait</option>
                        <option value="LV" className="bg-gray-800">Latvia</option>
                        <option value="LB" className="bg-gray-800">Lebanon</option>
                        <option value="LT" className="bg-gray-800">Lithuania</option>
                        <option value="LU" className="bg-gray-800">Luxembourg</option>
                        <option value="MY" className="bg-gray-800">Malaysia</option>
                        <option value="MX" className="bg-gray-800">Mexico</option>
                        <option value="MA" className="bg-gray-800">Morocco</option>
                        <option value="NL" className="bg-gray-800">Netherlands</option>
                        <option value="NZ" className="bg-gray-800">New Zealand</option>
                        <option value="NG" className="bg-gray-800">Nigeria</option>
                        <option value="NO" className="bg-gray-800">Norway</option>
                        <option value="OM" className="bg-gray-800">Oman</option>
                        <option value="PK" className="bg-gray-800">Pakistan</option>
                        <option value="PA" className="bg-gray-800">Panama</option>
                        <option value="PY" className="bg-gray-800">Paraguay</option>
                        <option value="PE" className="bg-gray-800">Peru</option>
                        <option value="PH" className="bg-gray-800">Philippines</option>
                        <option value="PL" className="bg-gray-800">Poland</option>
                        <option value="PT" className="bg-gray-800">Portugal</option>
                        <option value="QA" className="bg-gray-800">Qatar</option>
                        <option value="RO" className="bg-gray-800">Romania</option>
                        <option value="RU" className="bg-gray-800">Russia</option>
                        <option value="SA" className="bg-gray-800">Saudi Arabia</option>
                        <option value="RS" className="bg-gray-800">Serbia</option>
                        <option value="SG" className="bg-gray-800">Singapore</option>
                        <option value="SK" className="bg-gray-800">Slovakia</option>
                        <option value="SI" className="bg-gray-800">Slovenia</option>
                        <option value="ZA" className="bg-gray-800">South Africa</option>
                        <option value="KR" className="bg-gray-800">South Korea</option>
                        <option value="ES" className="bg-gray-800">Spain</option>
                        <option value="LK" className="bg-gray-800">Sri Lanka</option>
                        <option value="SE" className="bg-gray-800">Sweden</option>
                        <option value="CH" className="bg-gray-800">Switzerland</option>
                        <option value="TW" className="bg-gray-800">Taiwan</option>
                        <option value="TH" className="bg-gray-800">Thailand</option>
                        <option value="TN" className="bg-gray-800">Tunisia</option>
                        <option value="TR" className="bg-gray-800">Turkey</option>
                        <option value="UA" className="bg-gray-800">Ukraine</option>
                        <option value="AE" className="bg-gray-800">United Arab Emirates</option>
                        <option value="GB" className="bg-gray-800">United Kingdom</option>
                        <option value="US" className="bg-gray-800">United States</option>
                        <option value="UY" className="bg-gray-800">Uruguay</option>
                        <option value="VE" className="bg-gray-800">Venezuela</option>
                        <option value="VN" className="bg-gray-800">Vietnam</option>
                        <option value="YE" className="bg-gray-800">Yemen</option>
                     </select>
                     {errors.country && (
                        <p className="text-red-300 text-sm mt-1">{errors.country}</p>
                     )}
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