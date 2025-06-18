import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Fade,
  Collapse,
  Badge,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import MaterialIcon from '../common/MaterialIcon';

interface UserProfileData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  bio: string;
  avatar: File | null;
  avatarPreview: string;
  countryCode: string;
}

interface UploadedFile {
  id: string;
  name: string;
  type: 'certification' | 'document';
  fileType: string;
  size: number;
  uploadDate: Date;
  url: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
}

interface FormErrors {
  fullName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  general?: string;
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Refs for file inputs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const certificationInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Form state
  const [profileData, setProfileData] = useState<UserProfileData>({
    fullName: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    avatar: null,
    avatarPreview: user?.avatar || '',
    countryCode: '+1',
  });

  // Form validation and states
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // File management state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: '1',
      name: 'Commercial_Pilot_License.pdf',
      type: 'certification',
      fileType: 'application/pdf',
      size: 2048000,
      uploadDate: new Date('2024-01-15'),
      url: '/documents/commercial_pilot_license.pdf',
      status: 'completed',
      progress: 100,
    },
    {
      id: '2',
      name: 'BFA_Certification.pdf',
      type: 'certification',
      fileType: 'application/pdf',
      size: 1536000,
      uploadDate: new Date('2024-02-20'),
      url: '/documents/bfa_certification.pdf',
      status: 'completed',
      progress: 100,
    },
    {
      id: '3',
      name: 'Flight_Log_2024.docx',
      type: 'document',
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 512000,
      uploadDate: new Date('2024-03-10'),
      url: '/documents/flight_log_2024.docx',
      status: 'completed',
      progress: 100,
    },
  ]);

  // Notification state
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Dialog states
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);

  // Auto-save timer
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Validation patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const phoneRegex = /^[\d\s\-\(\)]{10,15}$/;

  /**
   * Validates individual form fields
   */
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.length < 2 || value.length > 50) return 'Full name must be 2-50 characters';
        return undefined;

      case 'username':
        if (!value.trim()) return 'Username is required';
        if (!usernameRegex.test(value)) return 'Username must be 3-20 alphanumeric characters';
        return undefined;

      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return undefined;

      case 'password':
        if (showPasswordFields && !value) return 'Password is required';
        if (value && !passwordRegex.test(value)) {
          return 'Password must be 8+ characters with uppercase, number, and special character';
        }
        return undefined;

      case 'confirmPassword':
        if (showPasswordFields && !value) return 'Please confirm your password';
        if (value && value !== profileData.password) return 'Passwords do not match';
        return undefined;

      case 'phone':
        if (value && !phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
          return 'Please enter a valid phone number';
        }
        return undefined;

      case 'bio':
        if (value && value.length > 500) return 'Bio must be 500 characters or less';
        return undefined;

      default:
        return undefined;
    }
  };

  /**
   * Handles input field changes with real-time validation and auto-save
   */
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;

    // Update profile data
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Mark as having unsaved changes
    setHasUnsavedChanges(true);

    // Clear field-specific error
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Real-time validation
    const fieldError = validateField(name, value);
    if (fieldError) {
      setErrors(prev => ({
        ...prev,
        [name]: fieldError,
      }));
    }

    // Auto-save after 2 seconds of inactivity
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    const timer = setTimeout(() => {
      handleAutoSave();
    }, 2000);
    
    setAutoSaveTimer(timer);
  }, [errors, autoSaveTimer]);

  /**
   * Handles avatar file selection and preview
   */
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      setErrors(prev => ({
        ...prev,
        avatar: 'Please select a valid image file (JPG, PNG)',
      }));
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        avatar: 'Image file must be less than 5MB',
      }));
      return;
    }

    // Clear avatar error
    setErrors(prev => ({
      ...prev,
      avatar: undefined,
    }));

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    
    setProfileData(prev => ({
      ...prev,
      avatar: file,
      avatarPreview: previewUrl,
    }));

    setHasUnsavedChanges(true);
    setCropDialogOpen(true);
  };

  /**
   * Handles file uploads for certifications and documents
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'certification' | 'document') => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      // Validate file type
      const allowedTypes = type === 'certification' 
        ? ['application/pdf', 'image/jpeg', 'image/png']
        : ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

      if (!allowedTypes.includes(file.type)) {
        showNotification('Invalid file type. Please select PDF, JPG, PNG for certifications or PDF, DOC, DOCX for documents.', 'error');
        continue;
      }

      // Validate file size
      const maxSize = type === 'certification' ? 10 * 1024 * 1024 : 20 * 1024 * 1024; // 10MB or 20MB
      if (file.size > maxSize) {
        showNotification(`File size must be less than ${maxSize / (1024 * 1024)}MB`, 'error');
        continue;
      }

      // Create new file entry
      const newFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type,
        fileType: file.type,
        size: file.size,
        uploadDate: new Date(),
        url: '',
        status: 'uploading',
        progress: 0,
      };

      // Add to uploaded files
      setUploadedFiles(prev => [...prev, newFile]);

      // Simulate file upload with progress
      await simulateFileUpload(newFile.id, file);
    }

    // Clear input
    event.target.value = '';
  };

  /**
   * Simulates file upload with progress updates
   */
  const simulateFileUpload = async (fileId: string, file: File) => {
    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === fileId
              ? { ...f, progress }
              : f
          )
        );
      }

      // Simulate successful upload
      const uploadedUrl = URL.createObjectURL(file);
      
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? { ...f, status: 'completed', url: uploadedUrl }
            : f
        )
      );

      showNotification('File uploaded successfully!', 'success');

    } catch (error) {
      // Handle upload error
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? { ...f, status: 'error' }
            : f
        )
      );

      showNotification('Upload failed. Please try again.', 'error');
    }
  };

  /**
   * Handles file deletion
   */
  const handleFileDelete = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    showNotification('File deleted successfully', 'success');
  };

  /**
   * Handles file preview
   */
  const handleFilePreview = (file: UploadedFile) => {
    setSelectedFile(file);
    setPreviewDialogOpen(true);
  };

  /**
   * Handles file download
   */
  const handleFileDownload = (file: UploadedFile) => {
    // In a real app, this would trigger a download
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
    
    showNotification('Download started', 'info');
  };

  /**
   * Auto-save functionality
   */
  const handleAutoSave = async () => {
    if (!hasUnsavedChanges) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setHasUnsavedChanges(false);
      showNotification('Changes auto-saved', 'info');
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validate all fields
    const newErrors: FormErrors = {};
    Object.entries(profileData).forEach(([key, value]) => {
      if (key === 'avatar' || key === 'avatarPreview' || key === 'countryCode') return;
      const error = validateField(key, value as string);
      if (error) newErrors[key as keyof FormErrors] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setHasUnsavedChanges(false);
      showNotification('Profile updated successfully!', 'success');
      
      // Reset password fields
      if (showPasswordFields) {
        setProfileData(prev => ({
          ...prev,
          password: '',
          confirmPassword: '',
        }));
        setShowPasswordFields(false);
      }

    } catch (error) {
      showNotification('Failed to update profile. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Shows notification
   */
  const showNotification = (message: string, severity: NotificationState['severity']) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  /**
   * Formats file size
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Gets file icon based on file type
   */
  const getFileIcon = (fileType: string): string => {
    if (fileType.includes('pdf')) return 'picture_as_pdf';
    if (fileType.includes('word') || fileType.includes('document')) return 'description';
    if (fileType.includes('image')) return 'image';
    return 'insert_drive_file';
  };

  /**
   * Gets file type color
   */
  const getFileTypeColor = (type: 'certification' | 'document') => {
    return type === 'certification' ? 'primary' : 'secondary';
  };

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              User Profile
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your personal information, security settings, and documents
            </Typography>
          </Box>
          {hasUnsavedChanges && (
            <Chip
              icon={<MaterialIcon icon="edit" />}
              label="Unsaved Changes"
              color="warning"
              variant="outlined"
            />
          )}
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
        >
          <Tab
            icon={<MaterialIcon icon="person" />}
            label="Personal Info"
            iconPosition="start"
          />
          <Tab
            icon={<MaterialIcon icon="security" />}
            label="Security"
            iconPosition="start"
          />
          <Tab
            icon={<MaterialIcon icon="folder" />}
            label="Documents"
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box component="form" onSubmit={handleSubmit}>
        {/* Personal Information Tab */}
        {activeTab === 0 && (
          <Fade in timeout={300}>
            <Grid container spacing={3}>
              {/* Avatar Section */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Profile Picture
                    </Typography>
                    
                    <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                      <Avatar
                        src={profileData.avatarPreview}
                        sx={{
                          width: 120,
                          height: 120,
                          mx: 'auto',
                          border: '4px solid',
                          borderColor: 'primary.main',
                        }}
                      >
                        <MaterialIcon icon="person" sx={{ fontSize: 60 }} />
                      </Avatar>
                      
                      <IconButton
                        onClick={() => avatarInputRef.current?.click()}
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          backgroundColor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                        }}
                      >
                        <MaterialIcon icon="camera_alt" />
                      </IconButton>
                    </Box>

                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleAvatarChange}
                      style={{ display: 'none' }}
                    />

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Upload a new profile picture
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      JPG, PNG up to 5MB
                    </Typography>

                    {errors.avatar && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {errors.avatar}
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Personal Details */}
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Personal Details
                    </Typography>

                    <Grid container spacing={3}>
                      {/* Full Name */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          name="fullName"
                          value={profileData.fullName}
                          onChange={handleInputChange}
                          error={!!errors.fullName}
                          helperText={errors.fullName}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <MaterialIcon icon="person" color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      {/* Username */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Username"
                          name="username"
                          value={profileData.username}
                          onChange={handleInputChange}
                          error={!!errors.username}
                          helperText={errors.username || 'Alphanumeric characters only, 3-20 characters'}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <MaterialIcon icon="alternate_email" color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      {/* Email */}
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          name="email"
                          type="email"
                          value={profileData.email}
                          onChange={handleInputChange}
                          error={!!errors.email}
                          helperText={errors.email}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <MaterialIcon icon="email" color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      {/* Phone Number */}
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <FormControl sx={{ minWidth: 120 }}>
                            <InputLabel>Country</InputLabel>
                            <Select
                              value={profileData.countryCode}
                              label="Country"
                              onChange={(e) => setProfileData(prev => ({
                                ...prev,
                                countryCode: e.target.value,
                              }))}
                            >
                              <MenuItem value="+1">🇺🇸 +1</MenuItem>
                              <MenuItem value="+44">🇬🇧 +44</MenuItem>
                              <MenuItem value="+33">🇫🇷 +33</MenuItem>
                              <MenuItem value="+49">🇩🇪 +49</MenuItem>
                            </Select>
                          </FormControl>
                          
                          <TextField
                            fullWidth
                            label="Phone Number (Optional)"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleInputChange}
                            error={!!errors.phone}
                            helperText={errors.phone}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <MaterialIcon icon="phone" color="action" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Box>
                      </Grid>

                      {/* Bio */}
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Bio / About Me"
                          name="bio"
                          multiline
                          rows={4}
                          value={profileData.bio}
                          onChange={handleInputChange}
                          error={!!errors.bio}
                          helperText={errors.bio || `${profileData.bio.length}/500 characters`}
                          placeholder="Tell us about yourself, your experience with ballooning, interests..."
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Fade>
        )}

        {/* Security Tab */}
        {activeTab === 1 && (
          <Fade in timeout={300}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Security Settings
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Button
                    color="primary"
                    variant={showPasswordFields ? "outlined" : "contained"}
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                    startIcon={<MaterialIcon icon="lock" />}
                    sx={{ borderRadius: 2 }}
                  >
                    {showPasswordFields ? 'Cancel Password Change' : 'Change Password'}
                  </Button>
                </Box>

                <Collapse in={showPasswordFields}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Alert severity="info" sx={{ mb: 3 }}>
                        Password must be at least 8 characters long and include:
                        uppercase letter, number, and special character (@$!%*?&)
                      </Alert>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="New Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={profileData.password}
                        onChange={handleInputChange}
                        error={!!errors.password}
                        helperText={errors.password}
                        required={showPasswordFields}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MaterialIcon icon="lock" color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                <MaterialIcon
                                  icon={showPassword ? 'visibility_off' : 'visibility'}
                                />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={profileData.confirmPassword}
                        onChange={handleInputChange}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword}
                        required={showPasswordFields}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MaterialIcon icon="lock" color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                              >
                                <MaterialIcon
                                  icon={showConfirmPassword ? 'visibility_off' : 'visibility'}
                                />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </Collapse>
              </CardContent>
            </Card>
          </Fade>
        )}

        {/* Documents Tab */}
        {activeTab === 2 && (
          <Fade in timeout={300}>
            <Grid container spacing={3}>
              {/* Upload Sections */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Certifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Upload your pilot licenses and certifications
                    </Typography>

                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<MaterialIcon icon="upload" />}
                      onClick={() => certificationInputRef.current?.click()}
                      sx={{ mb: 2, py: 2 }}
                    >
                      Upload Certifications
                    </Button>

                    <input
                      ref={certificationInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      onChange={(e) => handleFileUpload(e, 'certification')}
                      style={{ display: 'none' }}
                    />

                    <Typography variant="caption" color="text.secondary">
                      Accepted formats: PDF, JPG, PNG (max 10MB each)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Documents
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Upload flight logs, insurance, and other documents
                    </Typography>

                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<MaterialIcon icon="upload" />}
                      onClick={() => documentInputRef.current?.click()}
                      sx={{ mb: 2, py: 2 }}
                    >
                      Upload Documents
                    </Button>

                    <input
                      ref={documentInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      multiple
                      onChange={(e) => handleFileUpload(e, 'document')}
                      style={{ display: 'none' }}
                    />

                    <Typography variant="caption" color="text.secondary">
                      Accepted formats: PDF, DOC, DOCX (max 20MB each)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Uploaded Files */}
              <Grid item xs={12}>
                <Card>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Uploaded Files
                    </Typography>

                    {uploadedFiles.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <MaterialIcon icon="folder_open" sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No files uploaded yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Upload your certifications and documents to get started
                        </Typography>
                      </Box>
                    ) : (
                      <List>
                        {uploadedFiles.map((file, index) => (
                          <React.Fragment key={file.id}>
                            <ListItem sx={{ px: 0 }}>
                              <ListItemIcon>
                                <MaterialIcon
                                  icon={getFileIcon(file.fileType)}
                                  color={file.status === 'error' ? 'error' : 'primary'}
                                />
                              </ListItemIcon>
                              
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="subtitle2">
                                      {file.name}
                                    </Typography>
                                    <Chip
                                      label={file.type}
                                      size="small"
                                      color={getFileTypeColor(file.type) as any}
                                      variant="outlined"
                                    />
                                    {file.status === 'uploading' && (
                                      <CircularProgress size={16} />
                                    )}
                                  </Box>
                                }
                                secondary={
                                  <Box>
                                    <Typography variant="body2" color="text.secondary">
                                      {formatFileSize(file.size)} • {file.uploadDate.toLocaleDateString()}
                                    </Typography>
                                    {file.status === 'uploading' && (
                                      <LinearProgress
                                        variant="determinate"
                                        value={file.progress}
                                        sx={{ mt: 1 }}
                                      />
                                    )}
                                  </Box>
                                }
                              />
                              
                              <ListItemSecondaryAction>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  {file.status === 'completed' && (
                                    <>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleFilePreview(file)}
                                        title="Preview"
                                      >
                                        <MaterialIcon icon="visibility" />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleFileDownload(file)}
                                        title="Download"
                                      >
                                        <MaterialIcon icon="download" />
                                      </IconButton>
                                    </>
                                  )}
                                  <IconButton
                                    size="small"
                                    onClick={() => handleFileDelete(file.id)}
                                    color="error"
                                    title="Delete"
                                  >
                                    <MaterialIcon icon="delete" />
                                  </IconButton>
                                </Box>
                              </ListItemSecondaryAction>
                            </ListItem>
                            {index < uploadedFiles.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Fade>
        )}

        {/* Save Button */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            color="primary"
            disabled={isSaving || !hasUnsavedChanges}
            startIcon={isSaving ? <CircularProgress size={20} /> : <MaterialIcon icon="save" />}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              width: { xs: '100%', sm: 'auto' }
              // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              // '&:hover': {
              //   background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
              // },
            }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>

      {/* File Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedFile?.name}
            </Typography>
            <IconButton onClick={() => setPreviewDialogOpen(false)}>
              <MaterialIcon icon="close" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedFile && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              {selectedFile.fileType.includes('image') ? (
                <img
                  src={selectedFile.url}
                  alt={selectedFile.name}
                  style={{ maxWidth: '100%', maxHeight: '400px' }}
                />
              ) : (
                <Box>
                  <MaterialIcon
                    icon={getFileIcon(selectedFile.fileType)}
                    sx={{ fontSize: 64, color: 'primary.main', mb: 2 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Preview not available for this file type
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>
            Close
          </Button>
          {selectedFile && (
            <Button
              variant="contained"
              onClick={() => handleFileDownload(selectedFile)}
              startIcon={<MaterialIcon icon="download" />}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfile;