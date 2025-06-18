import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider,
  Link,
  useTheme,
  useMediaQuery,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Backdrop,
  Slide,
} from '@mui/material';
import MaterialIcon from '../common/MaterialIcon';
import SignInForm from './SignInForm';

interface SignUpFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber?: string;
  agreeToTerms?: string;
  general?: string;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ open, onClose, onSuccess }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Form state management
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // SignIn form state
  const [signInOpen, setSignInOpen] = useState(false);

  // Validation patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;

  const steps = ['Personal Info', 'Account Setup', 'Verification'];

  /**
   * Handles opening the SignIn form with proper accessibility and error handling
   */
  const handleSignInOpen = () => {
    try {
      // Prevent multiple clicks during loading
      if (isLoading) return;

      // Clear any existing errors before opening signin
      setErrors({});
      
      // Announce to screen readers that signin form is opening
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = 'Opening sign in form';
      document.body.appendChild(announcement);
      
      // Remove announcement after screen reader has time to read it
      setTimeout(() => {
        if (document.body.contains(announcement)) {
          document.body.removeChild(announcement);
        }
      }, 1000);

      // Open the signin form
      setSignInOpen(true);
      
      // Focus management will be handled by the SignInForm component
      
    } catch (error) {
      console.error('Error opening signin form:', error);
      setErrors({
        general: 'Unable to open sign in form. Please try again.',
      });
    }
  };

  /**
   * Handles closing the SignIn form and returning focus to SignUp
   */
  const handleSignInClose = () => {
    try {
      setSignInOpen(false);
      
      // Return focus to the signin link for better accessibility
      setTimeout(() => {
        const signinLink = document.querySelector('[data-testid="signin-link"]') as HTMLElement;
        if (signinLink) {
          signinLink.focus();
        }
      }, 100);
      
    } catch (error) {
      console.error('Error closing signin form:', error);
    }
  };

  /**
   * Handles successful signin - close both forms and notify parent
   */
  const handleSignInSuccess = () => {
    try {
      setSignInOpen(false);
      
      // If signin is successful, also close the signup form and notify parent
      onSuccess?.();
      handleClose();
      
    } catch (error) {
      console.error('Error handling signin success:', error);
    }
  };

  /**
   * Validates individual form fields
   */
  const validateField = (name: string, value: string | boolean): string | undefined => {
    switch (name) {
      case 'fullName':
        if (!value || typeof value !== 'string') {
          return 'Full name is required';
        }
        if (!nameRegex.test(value.trim())) {
          return 'Please enter a valid full name (2-50 characters, letters only)';
        }
        return undefined;

      case 'email':
        if (!value || typeof value !== 'string') {
          return 'Email address is required';
        }
        if (!emailRegex.test(value)) {
          return 'Please enter a valid email address';
        }
        return undefined;

      case 'password':
        if (!value || typeof value !== 'string') {
          return 'Password is required';
        }
        if (!passwordRegex.test(value)) {
          return 'Password must be at least 8 characters with 1 uppercase letter and 1 number';
        }
        return undefined;

      case 'confirmPassword':
        if (!value || typeof value !== 'string') {
          return 'Please confirm your password';
        }
        if (value !== formData.password) {
          return 'Passwords do not match';
        }
        return undefined;

      case 'phoneNumber':
        if (value && typeof value === 'string' && value.trim()) {
          if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            return 'Please enter a valid phone number';
          }
        }
        return undefined;

      case 'agreeToTerms':
        if (!value) {
          return 'You must agree to the Terms & Conditions';
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

    // Validate all required fields
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'phoneNumber') return; // Optional field
      const error = validateField(key, value);
      if (error) newErrors[key as keyof FormErrors] = error;
    });

    // Validate optional phone number if provided
    if (formData.phoneNumber.trim()) {
      const phoneError = validateField('phoneNumber', formData.phoneNumber);
      if (phoneError) newErrors.phoneNumber = phoneError;
    }

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
    if (type !== 'checkbox' && typeof fieldValue === 'string' && fieldValue.trim()) {
      const fieldError = validateField(name, fieldValue);
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
  const handleTogglePassword = (field: 'password' | 'confirmPassword') => {
    if (field === 'password') {
      setShowPassword(prev => !prev);
    } else {
      setShowConfirmPassword(prev => !prev);
    }
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

      // Simulate potential server errors (5% chance)
      if (Math.random() < 0.05) {
        throw new Error('Email address is already registered');
      }

      // Show success state
      setShowSuccess(true);

      // Call success callback after short delay
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 2000);

    } catch (error) {
      // Handle registration errors
      setErrors({
        general: error instanceof Error ? error.message : 'Registration failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles dialog close with form reset
   */
  const handleClose = () => {
    // Reset form data
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      agreeToTerms: false,
    });
    
    // Clear errors and states
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsLoading(false);
    setShowSuccess(false);
    setCurrentStep(0);
    setSignInOpen(false);
    
    // Close dialog
    onClose();
  };

  /**
   * Handles terms and conditions link
   */
  const handleTermsClick = () => {
    // In a real app, this would open terms dialog or navigate to terms page
    window.open('/terms', '_blank');
  };

  // Success content
  const SuccessContent = () => (
    <Fade in={showSuccess} timeout={600}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: { xs: 6, sm: 8 },
          px: { xs: 3, sm: 4 },
        }}
      >
        <MaterialIcon
          icon="check_circle"
          sx={{ 
            fontSize: { xs: 64, sm: 80 }, 
            color: 'success.main', 
            mb: 3,
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.05)' },
              '100%': { transform: 'scale(1)' },
            },
          }}
        />
        <Typography variant="h4" fontWeight="bold" gutterBottom color="success.main">
          Welcome to FreeSun!
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Your account has been created successfully
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
          You'll receive a confirmation email shortly. Get ready to soar above Colorado's stunning landscapes!
        </Typography>
      </Box>
    </Fade>
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        fullScreen={isSmallMobile}
        PaperProps={{
          sx: {
            borderRadius: isSmallMobile ? 0 : 3,
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.15)',
            background: 'transparent',
            overflow: 'visible',
            maxHeight: { xs: '100vh', sm: '90vh' },
            m: { xs: 0, sm: 2 },
          },
        }}
        BackdropComponent={Backdrop}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
          },
        }}
        TransitionProps={{
          timeout: {
            enter: 400,
            exit: 300,
          },
        }}
        sx={{
          '& .MuiDialog-container': {
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'center',
          },
          zIndex: theme.zIndex.modal + 1,
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            background: 'transparent',
            overflow: 'visible',
            '&:first-of-type': {
              paddingTop: 0,
            },
          }}
        >
          <Slide
            direction="up"
            in={open}
            timeout={{
              enter: 400,
              exit: 300,
            }}
            easing={{
              enter: 'cubic-bezier(0.4, 0, 0.2, 1)',
              exit: 'cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                borderRadius: isSmallMobile ? 0 : 3,
                overflow: 'hidden',
                maxHeight: { xs: '100vh', sm: '90vh' },
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3 },
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: 0,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Background Pattern */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.1,
                    background: `
                      radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
                      radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)
                    `,
                  }}
                />
                
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" gutterBottom>
                        Join FreeSun
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Start your hot air balloon adventure in Colorado
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={handleClose}
                      sx={{
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                      aria-label="Close signup form"
                    >
                      <MaterialIcon icon="close" />
                    </IconButton>
                  </Box>

                  {/* Progress Stepper */}
                  {!showSuccess && !isMobile && (
                    <Stepper activeStep={currentStep} sx={{ mt: 2 }}>
                      {steps.map((label) => (
                        <Step key={label}>
                          <StepLabel
                            sx={{
                              '& .MuiStepLabel-label': {
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontSize: '0.75rem',
                              },
                              '& .MuiStepLabel-label.Mui-active': {
                                color: 'white',
                                fontWeight: 600,
                              },
                              '& .MuiStepIcon-root': {
                                color: 'rgba(255, 255, 255, 0.3)',
                              },
                              '& .MuiStepIcon-root.Mui-active': {
                                color: 'white',
                              },
                              '& .MuiStepIcon-root.Mui-completed': {
                                color: 'rgba(255, 255, 255, 0.8)',
                              },
                            }}
                          >
                            {label}
                          </StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  )}
                </Box>
              </Paper>

              {/* Content */}
              <Box
                sx={{
                  flexGrow: 1,
                  overflow: 'auto',
                  p: { xs: 2, sm: 3 },
                }}
              >
                {showSuccess ? (
                  <SuccessContent />
                ) : (
                  <Paper
                    sx={{
                      p: { xs: 3, sm: 4 },
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                      background: 'white',
                    }}
                  >
                    {/* General Error Alert */}
                    {errors.general && (
                      <Alert 
                        severity="error" 
                        sx={{ mb: 3, borderRadius: 2 }}
                        onClose={() => setErrors(prev => ({ ...prev, general: undefined }))}
                      >
                        {errors.general}
                      </Alert>
                    )}

                    {/* Sign Up Form */}
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                      {/* Full Name Field */}
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        error={!!errors.fullName}
                        helperText={errors.fullName}
                        disabled={isLoading}
                        required
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MaterialIcon icon="person" color="action" />
                            </InputAdornment>
                          ),
                        }}
                        inputProps={{
                          'aria-label': 'Full name',
                          'aria-required': 'true',
                        }}
                      />

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
                        required
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MaterialIcon icon="email" color="action" />
                            </InputAdornment>
                          ),
                        }}
                        inputProps={{
                          'aria-label': 'Email address',
                          'aria-required': 'true',
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
                        required
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
                                onClick={() => handleTogglePassword('password')}
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
                        inputProps={{
                          'aria-label': 'Password',
                          'aria-required': 'true',
                        }}
                      />

                      {/* Confirm Password Field */}
                      <TextField
                        fullWidth
                        label="Confirm Password"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword}
                        disabled={isLoading}
                        required
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
                                onClick={() => handleTogglePassword('confirmPassword')}
                                disabled={isLoading}
                                edge="end"
                                aria-label="toggle confirm password visibility"
                              >
                                <MaterialIcon
                                  icon={showConfirmPassword ? 'visibility_off' : 'visibility'}
                                />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        inputProps={{
                          'aria-label': 'Confirm password',
                          'aria-required': 'true',
                        }}
                      />

                      {/* Phone Number Field (Optional) */}
                      <TextField
                        fullWidth
                        label="Phone Number (Optional)"
                        name="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        error={!!errors.phoneNumber}
                        helperText={errors.phoneNumber || 'We\'ll use this for flight updates and emergencies'}
                        disabled={isLoading}
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MaterialIcon icon="phone" color="action" />
                            </InputAdornment>
                          ),
                        }}
                        inputProps={{
                          'aria-label': 'Phone number (optional)',
                        }}
                      />

                      {/* Terms & Conditions */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            color="primary"
                            inputProps={{
                              'aria-label': 'Agree to terms and conditions',
                              'aria-required': 'true',
                            }}
                            sx={{ py: 0 }}
                          />
                        }
                        label={
                          <Typography variant="body2">
                            I agree to the{' '}
                            <Link
                              component="button"
                              type="button"
                              onClick={handleTermsClick}
                              sx={{
                                fontWeight: 600,
                                textDecoration: 'none',
                                '&:hover': {
                                  textDecoration: 'underline',
                                },
                              }}
                            >
                              Terms & Conditions
                            </Link>{' '}
                            and{' '}
                            <Link
                              component="button"
                              type="button"
                              onClick={handleTermsClick}
                              sx={{
                                fontWeight: 600,
                                textDecoration: 'none',
                                '&:hover': {
                                  textDecoration: 'underline',
                                },
                              }}
                            >
                              Privacy Policy
                            </Link>
                          </Typography>
                        }
                        sx={{ 
                          mb: 3, 
                          alignItems: 'flex-start',
                          '& .MuiFormControlLabel-label': {
                            mt: 0.5,
                          },
                        }}
                      />
                      {errors.agreeToTerms && (
                        <Typography variant="caption" color="error" sx={{ mt: -2, mb: 2, display: 'block' }}>
                          {errors.agreeToTerms}
                        </Typography>
                      )}

                      {/* Submit Button */}
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
                            <span>Creating Account...</span>
                          </Box>
                        ) : (
                          'Create Account'
                        )}
                      </Button>

                      {/* Divider */}
                      <Divider sx={{ my: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          or
                        </Typography>
                      </Divider>

                      {/* Sign In Link */}
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Already have an account?{' '}
                          <Link
                            component="button"
                            type="button"
                            onClick={handleSignInOpen}
                            disabled={isLoading}
                            data-testid="signin-link"
                            aria-label="Open sign in form"
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
                            Sign in here
                          </Link>
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                )}
              </Box>
            </Box>
          </Slide>
        </DialogContent>
      </Dialog>

      {/* SignIn Form Modal */}
      <Dialog
        open={signInOpen}
        onClose={handleSignInClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.15)',
            background: 'transparent',
            overflow: 'visible',
          },
        }}
        BackdropComponent={Backdrop}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
          },
        }}
        TransitionProps={{
          timeout: {
            enter: 400,
            exit: 300,
          },
        }}
        sx={{
          '& .MuiDialog-container': {
            alignItems: 'center',
            justifyContent: 'center',
          },
          zIndex: theme.zIndex.modal + 2, // Higher than SignUp form
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            background: 'transparent',
            overflow: 'visible',
            '&:first-of-type': {
              paddingTop: 0,
            },
          }}
        >
          <Slide
            direction="up"
            in={signInOpen}
            timeout={{
              enter: 400,
              exit: 300,
            }}
            easing={{
              enter: 'cubic-bezier(0.4, 0, 0.2, 1)',
              exit: 'cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <Box>
              <SignInForm
                onClose={handleSignInClose}
                onSuccess={handleSignInSuccess}
              />
            </Box>
          </Slide>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SignUpForm;