import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  useTheme,
  useMediaQuery,
  IconButton,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemText,
  Container,
  alpha,
  ListItemIcon,
  Avatar,
  Menu,
  MenuItem,
  Fade,
  Slide,
  Dialog,
  DialogContent,
  Backdrop,
  Stack,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import MaterialIcon from '../common/MaterialIcon';
import SignInForm from '../Auth/SignInForm';
import SignUpForm from '../Auth/SignUpForm';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('xl'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const handleSignInOpen = () => {
    setSignInOpen(true);
  };

  const handleSignInClose = () => {
    setSignInOpen(false);
  };

  const handleSignInSuccess = () => {
    setSignInOpen(false);
    // Optionally navigate to a specific page after successful login
    // onNavigate('home');
  };

  const handleSignUpOpen = () => {
    setSignUpOpen(true);
  };

  const handleSignUpClose = () => {
    setSignUpOpen(false);
  };

  const handleSignUpSuccess = () => {
    setSignUpOpen(false);
    // Optionally navigate to a specific page after successful signup
    // onNavigate('home');
  };

  const menuItems = [
    {
      label: 'Home',
      page: 'home',
      icon: 'home',
      description: 'Welcome & Overview',
    },
    {
      label: 'About',
      page: 'pattern',
      icon: 'explore',
      description: 'Balloon Envelope Pattern',
    },
    {
      label: 'Media',
      page: 'media',
      icon: 'photo_size_select_actual',
      description: 'Photos & Videos',
    },
    {
      label: 'Crew',
      page: 'stats',
      icon: 'people_alt',
      description: 'Pilot Profiles',
    },
    {
      label: 'Events',
      page: 'calendar',
      icon: 'calendar_month',
      description: 'Schedule Events',
    },
    {
      label: 'Chat',
      page: 'chat',
      icon: 'question_answer',
      description: 'Crew Communication',
    },
    {
      label: 'Weather',
      page: 'weather',
      icon: 'cloud',
      description: 'Flight Conditions',
    },
    {
      label: 'Store',
      page: 'store',
      icon: 'store',
      description: 'Merchandise',
    },
  ];

  const handleNavigation = (page: string) => {
    onNavigate(page);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ width: 320, height: '100%', bgcolor: 'background.paper' }}>
      {/* Drawer Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            cursor: 'pointer',
          }}
          onClick={() => handleNavigation('home')}
        >
          {/* <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff6b6b, #ffa726)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(255, 107, 107, 0.3)',
            }}
          >
            <MaterialIcon
              icon="air"
              sx={{ color: 'white', fontSize: '24px' }}
            />
          </Box> */}
          <Box>
            <Typography
              variant="h5"
              sx={{ 
                fontFamily: 'Paytone One',
                color: 'text.primary',
                letterSpacing: '0.05em',
                lineHeight: 1
              }}
            >
              FreeSun
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Balloon Club
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Items */}
      <List sx={{ px: 2, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.page}
            onClick={() => handleNavigation(item.page)}
            sx={{
              alignItems: 'start',
              borderRadius: 3,
              mb: 1,
              cursor: 'pointer',
              backgroundColor:
                currentPage === item.page
                  ? alpha(theme.palette.primary.main, 0.12)
                  : 'transparent',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                transform: 'translateX(4px)',
              },
              py: 1.5,
            }}
          >
            <ListItemIcon
              sx={{
                color:
                  currentPage === item.page ? 'primary.main' : 'text.secondary',
                minWidth: 48,
                pt: 1.125,
                pl: 0.75,
                transition: 'color 0.2s ease',
              }}
            >
              <MaterialIcon icon={item.icon} />
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              secondary={item.description}
              sx={{
                '& .MuiListItemText-primary': {
                  fontWeight: currentPage === item.page ? 700 : 600,
                  fontSize: '1rem',
                  color:
                    currentPage === item.page ? 'primary.main' : 'text.primary',
                  transition: 'all 0.2s ease',
                },
                '& .MuiListItemText-secondary': {
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  mt: 0.5,
                },
              }}
            />
          </ListItem>
        ))}
      </List>

      {/* User Section */}
      {user && (
        <Box
          sx={{
            mt: 'auto',
            p: 3,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar src={user.avatar} sx={{ width: 40, height: 40 }}>
              <MaterialIcon icon="account_circle" />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Typography>
            </Box>
          </Box>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<MaterialIcon icon="logout" />}
            onClick={handleLogout}
            sx={{ borderRadius: 2 }}
          >
            Sign Out
          </Button>
        </Box>
      )}

      {/* Sign In Section for Mobile (when not authenticated) */}
      {!user && (
        <Box
          sx={{
            mt: 'auto',
            p: 3,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Button
            fullWidth
            variant="contained"
            startIcon={<MaterialIcon icon="login" />}
            onClick={handleSignInOpen}
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
              mb: 2,
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
              },
            }}
          >
            Sign In
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<MaterialIcon icon="person_add" />}
            onClick={handleSignUpOpen}
            sx={{ borderRadius: 2 }}
          >
            Join The Crew
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          opacity: mobileOpen && currentPage === 'home' ? 0 : 1,
          backgroundColor:
            currentPage === 'home'
              ? 'transparent'
              : 'rgb(255 255 255)',
          // backdropFilter: 'blur(0.75rem)',
          borderBottom:
            currentPage === 'home'
              ? 'none'
              : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: currentPage === 'home' ? '8px' : '0',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          top: currentPage === 'home' ? '1rem' : undefined,
          left: currentPage === 'home' ? '1rem' : undefined,
          maxWidth: currentPage === 'home' ? 'calc(100% - 2rem)' : undefined,
          width: '100%',
          zIndex: theme.zIndex.drawer - 1,
        }}
      >
        <Container maxWidth={ currentPage === 'home' ? null : 'xl'} sx={{ pr: { xs: 1 } }}>
          <Toolbar sx={{ px: { xs: 0, sm: 0 }, py: 1 }}>
            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open navigation menu"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{
                  mr: 1,
                  color: currentPage === 'home' ? 'white' : 'text.primary',
                  '&:hover': {
                    backgroundColor:
                      currentPage === 'home'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <MaterialIcon icon="menu" />
              </IconButton>
            )}

            {/* Logo and Brand */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexGrow: isMobile ? 1 : 0,
                cursor: 'pointer',
              }}
              onClick={() => handleNavigation('home')}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Paytone One',
                    color: currentPage === 'home' ? 'white' : 'text.primary',
                    letterSpacing: '0.05em',
                    lineHeight: 1,
                    transition: 'color 0.3s ease',
                    // textTransform: 'uppercase',
                    position: 'relative',
                    top: '-2px',
                  }}
                >
                  FreeSun
                </Typography>
                {!isMobile && (
                  <Typography
                    variant="caption"
                    sx={{
                      color:
                        currentPage === 'home'
                          ? 'rgba(255, 255, 255, 0.8)'
                          : 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      transition: 'color 0.3s ease',
                    }}
                  >
                    Balloon Club
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box
                sx={{
                  display: 'flex',
                  gap: currentPage === 'home' ? { xl: 3, xxl: '2vw' } : 1,
                  mx: 'auto',
                  flexGrow: 1,
                  justifyContent: 'center',
                }}
              >
                {menuItems.slice(1).map((item) => (
                  <Button
                    key={item.page}
                    startIcon={<MaterialIcon icon={item.icon} />}
                    onClick={() => handleNavigation(item.page)}
                    sx={{
                      color:
                        currentPage === 'home'
                          ? currentPage === item.page
                            ? 'white'
                            : 'rgba(255, 255, 255, 0.8)'
                          : currentPage === item.page
                          ? 'primary.main'
                          : 'text.secondary',
                      backgroundColor:
                        currentPage === item.page
                          ? currentPage === 'home'
                            ? 'rgba(255, 255, 255, 0.15)'
                            : alpha(theme.palette.primary.main, 0.08)
                          : 'transparent',
                      fontWeight: currentPage === item.page ? 700 : 600,
                      fontSize: '0.95rem',
                      px: 3,
                      py: 1.2,
                      borderRadius: 3,
                      textTransform: 'none',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor:
                          currentPage === 'home'
                            ? 'rgba(255, 255, 255, 0.15)'
                            : alpha(theme.palette.primary.main, 0.08),
                        color:
                          currentPage === 'home' ? 'white' : 'primary.main',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* User Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {user ? (
                <>
                  {!isSmallScreen && (
                    <Stack gap={0} display="none">
                      <Typography
                      variant="body1"
                      sx={{
                        color:
                          currentPage === 'home'
                            ? 'rgba(255, 255, 255, 0.9)'
                            : 'text.primary',
                        fontWeight: 500,
                        textAlign: 'right',
                      }}
                    >
                      {user.name}
                    </Typography>
                   <Typography
                      variant="body2"
                      sx={{
                        color:
                          currentPage === 'home'
                            ? 'rgba(255, 255, 255, 0.9)'
                            : 'text.primary',
                        fontWeight: 500,
                        textAlign: 'right',
                        textTransform: 'uppercase',
                      }}
                    >
                      {user.role}
                    </Typography>
                    </Stack>
                  )}
                  <IconButton
                    size="large"
                    aria-label="account menu"
                    aria-controls="user-menu"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    sx={{
                      '&:hover': {
                        backgroundColor:
                          currentPage === 'home'
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    <Avatar src={user.avatar} sx={{ width: 36, height: 36 }}>
                      <MaterialIcon icon="account_circle" />
                    </Avatar>
                  </IconButton>
                  <Menu
                    id="user-menu"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    TransitionComponent={Fade}
                    sx={{
                      '& .MuiPaper-root': {
                        borderRadius: 1,
                        mt: 1,
                        minWidth: 180,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                      },
                    }}
                  >
                    <Stack gap={0} sx={{ px: 2, pb: 1, mb: 0.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                      <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 500,
                      }}
                    >
                      {user.name}
                    </Typography>
                   <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        textTransform: 'uppercase',
                      }}
                    >
                      {user.role}
                    </Typography>
                    </Stack>
                    <MenuItem onClick={() => { handleClose(); handleNavigation('profile'); }} sx={{ py: 1.5 }}>
                      <MaterialIcon icon="account_circle" sx={{ mr: 2 }} />
                      Profile
                    </MenuItem>
                    <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                      <MaterialIcon icon="logout" sx={{ mr: 2 }} />
                      Sign Out
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleSignInOpen}
                    sx={{
                      color:
                        currentPage === 'home'
                          ? 'rgba(255, 255, 255, 0.9)'
                          : 'text.primary',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      textTransform: 'none',
                      display: { xs: 'none', sm: 'inline-flex' },
                      '&:hover': {
                        backgroundColor:
                          currentPage === 'home'
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSignUpOpen}
                    sx={{
                      background:
                        currentPage === 'home'
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      display: 'none',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0',
                      px: 3,
                      py: 1,
                      borderRadius: 3,
                      borderWidth: '1.5px',
                      backdropFilter:
                        currentPage === 'home' ? 'blur(10px)' : 'none',
                      border:
                        currentPage === 'home'
                          ? '1px solid rgba(255, 255, 255, 0.4)'
                          : 'none',
                      boxShadow:
                        currentPage === 'home'
                          ? '0 8px 32px rgba(0, 0, 0, 0.2)'
                          : '0 4px 16px rgba(102, 126, 234, 0.4)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        background:
                          currentPage === 'home'
                            ? 'rgba(255, 255, 255, 0.3)'
                            : 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                        boxShadow:
                          currentPage === 'home'
                            ? '0 12px 40px rgba(0, 0, 0, 0.3)'
                            : '0 6px 20px rgba(102, 126, 234, 0.5)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', xxl: 'none' },
          '& .MuiDrawer-paper': {
          borderRadius: '0 8px 8px 0',
            boxSizing: 'border-box',
            width: 320,
            backgroundColor: 'background.paper',
            borderRight: 'none',
            boxShadow: '0 16px 64px rgba(0, 0, 0, 0.15)',
          },
        }}
        SlideProps={{
          direction: 'right',
        }}
      >
        {drawer}
      </Drawer>

      {/* Sign In Modal Dialog */}
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
      

      {/* Sign Up Drawer */}
      <SignUpForm
        open={signUpOpen}
        onClose={handleSignUpClose}
        onSuccess={handleSignUpSuccess}
      />

      {/* Spacer for fixed AppBar */}
      {/* <Toolbar sx={{ minHeight: '72px !important' }} /> */}
    </>
  );
};

export default Navbar;