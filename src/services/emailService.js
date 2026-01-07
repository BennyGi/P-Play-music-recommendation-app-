// =====================================================
//   EMAIL SERVICE - Using EmailJS for real email sending
// =====================================================
// 
// To set up EmailJS:
// 1. Go to https://www.emailjs.com/ and create a free account
// 2. Create an Email Service (connect your Gmail/Outlook/etc)
// 3. Create an Email Template with these variables:
//    - {{to_email}} - recipient email
//    - {{to_name}} - recipient name  
//    - {{reset_link}} - password reset link
//    - {{reset_token}} - the reset token
// 4. Copy your Service ID, Template ID, and Public Key
// 5. Add them to your .env file:
//    VITE_EMAILJS_SERVICE_ID=your_service_id
//    VITE_EMAILJS_TEMPLATE_ID=your_template_id
//    VITE_EMAILJS_PUBLIC_KEY=your_public_key
//
// =====================================================

// EmailJS Configuration from environment variables
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Check if EmailJS is configured
const isEmailJSConfigured = () => {
   return EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY;
};

// Generate a secure reset token
export const generateResetToken = () => {
   const array = new Uint8Array(32);
   crypto.getRandomValues(array);
   return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Get the base URL for reset links
const getBaseUrl = () => {
   if (typeof window !== 'undefined') {
      return window.location.origin;
   }
   return 'http://localhost:5173'; // Default Vite dev server
};

// =====================================================
//   SEND PASSWORD RESET EMAIL
// =====================================================

export const sendPasswordResetEmail = async (email, userName = 'User') => {
   // Generate reset token
   const resetToken = generateResetToken();
   const resetLink = `${getBaseUrl()}/reset-password?token=${resetToken}`;
   
   // Save token to localStorage for validation (in production, save to database)
   saveResetToken(email, resetToken);

   // Check if EmailJS is configured
   if (!isEmailJSConfigured()) {
      console.warn('⚠️ EmailJS not configured. Using demo mode.');
      console.log('📧 Demo Mode - Reset email would be sent to:', email);
      console.log('🔗 Reset link:', resetLink);
      console.log('🔑 Reset token:', resetToken);
      
      // Return success for demo mode
      return {
         success: true,
         demoMode: true,
         resetToken,
         resetLink,
         message: 'Demo mode: Check console for reset link'
      };
   }

   try {
      // Load EmailJS SDK dynamically
      if (!window.emailjs) {
         await loadEmailJSScript();
      }

      // Initialize EmailJS
      window.emailjs.init(EMAILJS_PUBLIC_KEY);

      // Send email using EmailJS
      const response = await window.emailjs.send(
         EMAILJS_SERVICE_ID,
         EMAILJS_TEMPLATE_ID,
         {
            to_email: email,
            to_name: userName,
            reset_link: resetLink,
            reset_token: resetToken,
            app_name: 'P-Play',
            expiry_time: '24 hours'
         }
      );

      console.log('✅ Email sent successfully:', response);

      return {
         success: true,
         demoMode: false,
         resetToken,
         message: 'Password reset email sent successfully'
      };

   } catch (error) {
      console.error('❌ Failed to send email:', error);
      
      // Fallback to demo mode if EmailJS fails
      console.log('📧 Fallback Demo Mode - Reset details:');
      console.log('🔗 Reset link:', resetLink);
      console.log('🔑 Reset token:', resetToken);

      return {
         success: true, // Still return success so user isn't stuck
         demoMode: true,
         resetToken,
         resetLink,
         error: error.message,
         message: 'Email service unavailable. Check console for reset link.'
      };
   }
};

// =====================================================
//   HELPER FUNCTIONS
// =====================================================

// Load EmailJS script dynamically
const loadEmailJSScript = () => {
   return new Promise((resolve, reject) => {
      if (window.emailjs) {
         resolve();
         return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
      script.async = true;
      script.onload = () => {
         console.log('✅ EmailJS loaded');
         resolve();
      };
      script.onerror = () => {
         reject(new Error('Failed to load EmailJS'));
      };
      document.head.appendChild(script);
   });
};

// Save reset token to localStorage
const saveResetToken = (email, token) => {
   const RESETS_KEY = 'pplay_password_resets';
   
   try {
      const existingResets = JSON.parse(localStorage.getItem(RESETS_KEY) || '[]');
      
      // Remove old resets for this email
      const filteredResets = existingResets.filter(r => r.email !== email);
      
      // Add new reset
      filteredResets.push({
         email,
         token,
         expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
         used: false,
         createdAt: new Date().toISOString()
      });
      
      localStorage.setItem(RESETS_KEY, JSON.stringify(filteredResets));
   } catch (error) {
      console.error('Error saving reset token:', error);
   }
};

// Validate reset token
export const validateResetToken = (token) => {
   const RESETS_KEY = 'pplay_password_resets';
   
   try {
      const resets = JSON.parse(localStorage.getItem(RESETS_KEY) || '[]');
      const reset = resets.find(r => 
         r.token === token && 
         !r.used && 
         r.expiry > Date.now()
      );
      return reset || null;
   } catch {
      return null;
   }
};

// Mark token as used and update password
export const resetPassword = (token, newPassword) => {
   const RESETS_KEY = 'pplay_password_resets';
   const USERS_KEY = 'pplay_users_db';
   
   try {
      const reset = validateResetToken(token);
      if (!reset) return { success: false, error: 'Invalid or expired token' };

      // Update user password
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const userIndex = users.findIndex(u => u.email === reset.email);
      
      if (userIndex === -1) {
         return { success: false, error: 'User not found' };
      }

      users[userIndex].password = newPassword;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      // Mark token as used
      const resets = JSON.parse(localStorage.getItem(RESETS_KEY) || '[]');
      const resetIndex = resets.findIndex(r => r.token === token);
      if (resetIndex !== -1) {
         resets[resetIndex].used = true;
         localStorage.setItem(RESETS_KEY, JSON.stringify(resets));
      }

      return { success: true, message: 'Password updated successfully' };
   } catch (error) {
      console.error('Error resetting password:', error);
      return { success: false, error: 'Failed to reset password' };
   }
};

// =====================================================
//   ALTERNATIVE: Using Web3Forms (Free, no account needed)
// =====================================================

export const sendEmailViaWeb3Forms = async (email, userName, resetToken) => {
   const resetLink = `${getBaseUrl()}/reset-password?token=${resetToken}`;
   
   // Web3Forms API - Free tier available
   // Sign up at https://web3forms.com/ to get your access key
   const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY;
   
   if (!WEB3FORMS_KEY) {
      console.warn('Web3Forms not configured');
      return { success: false, error: 'Email service not configured' };
   }

   try {
      const response = await fetch('https://api.web3forms.com/submit', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            to: email,
            subject: 'P-Play Password Reset',
            from_name: 'P-Play Music App',
            message: `
Hi ${userName},

You requested to reset your password for P-Play.

Click the link below to reset your password:
${resetLink}

This link will expire in 24 hours.

If you didn't request this, please ignore this email.

Best regards,
P-Play Team
            `
         })
      });

      const data = await response.json();
      return { success: data.success, message: data.message };
   } catch (error) {
      console.error('Web3Forms error:', error);
      return { success: false, error: error.message };
   }
};

// Export configuration check for UI
export const getEmailServiceStatus = () => {
   return {
      emailjsConfigured: isEmailJSConfigured(),
      serviceId: EMAILJS_SERVICE_ID ? '✓ Set' : '✗ Missing',
      templateId: EMAILJS_TEMPLATE_ID ? '✓ Set' : '✗ Missing',
      publicKey: EMAILJS_PUBLIC_KEY ? '✓ Set' : '✗ Missing'
   };
};