import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import MaterialIcon from '../common/MaterialIcon';
import SignUpForm from './SignUpForm';

interface SignInFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const SignInForm: React.FC<SignInFormProps> = ({ onClose, onSuccess }) => {
  const { login } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Form state management
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // SignUp form state
  const [signUpOpen, setSignUpOpen] = useState(false);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Password validation: 8+ chars, 1 uppercase, 1 number
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  /**
   * Handles opening the SignUp form with proper accessibility and error handling
   */
  const handleSignUpOpen = () => {
    try {
      // Clear any existing errors before opening signup
      setErrors({});
      
      // Announce to screen readers that signup form is opening
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = 'Opening sign up form';
      document.body.appendChild(announcement);
      
      // Remove announcement after screen reader has time to read it
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);

      // Open the signup form
      setSignUpOpen(true);
      
      // Focus management - when signup opens, focus should be managed by the SignUpForm component
      // The SignInForm will remain in the background but lose focus
      
    } catch (error) {
      console.error('Error opening signup form:', error);
      setErrors({
        general: 'Unable to open signup form. Please try again.',
      });
    }
  };

  /**
   * Handles closing the SignUp form and returning focus to SignIn
   */
  const handleSignUpClose = () => {
    try {
      setSignUpOpen(false);
      
      // Return focus to the signup link for better accessibility
      setTimeout(() => {
        const signupLink = document.querySelector('[data-testid="signup-link"]') as HTMLElement;
        if (signupLink) {
          signupLink.focus();
        }
      }, 100);
      
    } catch (error) {
      console.error('Error closing signup form:', error);
    }
  };

  /**
   * Handles successful signup - close both forms and notify parent
   */
  const handleSignUpSuccess = () => {
    try {
      setSignUpOpen(false);
      
      // If signup is successful, also close the signin form and notify parent
      onSuccess?.();
      onClose?.();
      
    } catch (error) {
      console.error('Error handling signup success:', error);
    }
  };

  /**
   * Validates individual form fields
   */
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'email':
        if (!value.trim()) {
          return 'Email is required';
        }
        if (!emailRegex.test(value)) {
          return 'Please enter a valid email address';
        }
        return undefined;

      case 'password':
        if (!value) {
          return 'Password is required';
        }
        if (!passwordRegex.test(value)) {
          return 'Password must be at least 8 characters with 1 uppercase letter and 1 number';
        }
        return undefined;

      default:
        return undefined;
    }
  };

  /**
   * Validates the entire form
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate email
    const emailError = validateField('email', formData.email);
    if (emailError) newErrors.email = emailError;

    // Validate password
    const passwordError = validateField('password', formData.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles input field changes with real-time validation
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue,
    }));

    // Clear field-specific error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Real-time validation for text fields
    if (type !== 'checkbox' && value.trim()) {
      const fieldError = validateField(name, value);
      if (fieldError) {
        setErrors(prev => ({
          ...prev,
          [name]: fieldError,
        }));
      }
    }
  };

  /**
   * Toggles password visibility
   */
  const handleTogglePassword = () => {
    setShowPassword(prev => !prev);
  };

  /**
   * Handles form submission with validation and API simulation
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Clear any previous general errors
    setErrors(prev => ({ ...prev, general: undefined }));

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call with 2-second delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Attempt login through auth context
      await login(formData.email, formData.password);

      // Show success state
      setShowSuccess(true);

      // Handle remember me functionality (in real app, this would set persistent storage)
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('userEmail', formData.email);
      }

      // Call success callback after short delay
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 1500);

    } catch (error) {
      // Handle login errors
      setErrors({
        general: 'Invalid email or password. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles forgot password action
   */
  const handleForgotPassword = () => {
    // In a real app, this would open a forgot password dialog or navigate to reset page
    alert('Forgot password functionality would be implemented here');
  };

  // Show success message
  if (showSuccess) {
    return (
      <Paper
        sx={{
          p: 4,
          maxWidth: 400,
          mx: 'auto',
          textAlign: 'center',
          borderRadius: 3,
        }}
      >
        <Box sx={{ mb: 3 }}>
          <MaterialIcon
            icon="check_circle"
            sx={{ fontSize: 64, color: 'success.main', mb: 2 }}
          />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Welcome Back!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You have been successfully signed in.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <>
      <Paper
        sx={{
          p: { xs: 3, sm: 4 },
          maxWidth: 400,
          mx: 'auto',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to your FreeSun Balloon Club account
          </Typography>
        </Box>

        {/* General Error Alert */}
        {errors.general && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {errors.general}
          </Alert>
        )}

        {/* Sign In Form */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            error={!!errors.email}
            helperText={errors.email}
            disabled={isLoading}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MaterialIcon icon="email" color="action" />
                </InputAdornment>
              ),
            }}
          />

          {/* Password Field */}
          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange}
            error={!!errors.password}
            helperText={errors.password}
            disabled={isLoading}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MaterialIcon icon="lock" color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePassword}
                    disabled={isLoading}
                    edge="end"
                    aria-label="toggle password visibility"
                  >
                    <MaterialIcon
                      icon={showPassword ? 'visibility_off' : 'visibility'}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Remember Me & Forgot Password */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 0 },
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  color="primary"
                />
              }
              label="Remember me"
              sx={{ m: 0 }}
            />
            <Link
              component="button"
              type="button"
              onClick={handleForgotPassword}
              disabled={isLoading}
              sx={{
                fontSize: '0.875rem',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Forgot password?
            </Link>
          </Box>

          {/* Sign In Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: 2,
              textTransform: 'none',
              position: 'relative',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                transform: 'translateY(-1px)',
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
                boxShadow: 'none',
                transform: 'none',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                <span>Signing In...</span>
              </Box>
            ) : (
              'Sign In'
            )}
          </Button>

          {/* Divider */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              or
            </Typography>
          </Divider>

          {/* Sign Up Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link
                component="button"
                type="button"
                onClick={handleSignUpOpen}
                disabled={isLoading}
                data-testid="signup-link"
                aria-label="Open sign up form"
                sx={{
                  fontWeight: 600,
                  textDecoration: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    textDecoration: isLoading ? 'none' : 'underline',
                    transform: isLoading ? 'none' : 'translateY(-1px)',
                  },
                  '&:focus': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: '2px',
                    borderRadius: '4px',
                  },
                }}
              >
                Sign up here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* SignUp Form Modal */}
      <SignUpForm
        open={signUpOpen}
        onClose={handleSignUpClose}
        onSuccess={handleSignUpSuccess}
      />
    </>
  );
};

export default SignInForm;