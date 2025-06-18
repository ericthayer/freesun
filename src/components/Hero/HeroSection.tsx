import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
  Card,
} from '@mui/material';
import MaterialIcon from '../common/MaterialIcon';
import SignUpForm from '../Auth/SignUpForm';

type PageType =
  | 'home'
  | 'chat'
  | 'media'
  | 'weather'
  | 'stats'
  | 'calendar'
  | 'store';

interface HeroSectionProps {
  onNavigate?: (page: PageType) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [signUpOpen, setSignUpOpen] = useState(false);

  const handleContinueClick = () => {
    if (onNavigate) {
      onNavigate('chat');
    }
  };

  const handleJoinCrewClick = () => {
    setSignUpOpen(true);
  };

  const handleSignUpClose = () => {
    setSignUpOpen(false);
  };

  const handleSignUpSuccess = () => {
    setSignUpOpen(false);
    // Optionally navigate to a specific page after successful signup
    if (onNavigate) {
      onNavigate('chat');
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        py: { xs: 20, md: 4 },
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(circle at 20% 30%, rgba(255, 107, 107, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(102, 126, 234, 0.1) 0%, transparent 50%)',
          zIndex: 1,
        }}
      />

      {/* Floating Particles */}
      {[...Array(12)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: { xs: 4, md: 6 },
            height: { xs: 4, md: 6 },
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float ${8 + Math.random() * 4}s ease-in-out infinite ${
              Math.random() * 2
            }s`,
            zIndex: 1,
            '@keyframes float': {
              '0%, 100%': {
                transform: 'translateY(0px) translateX(0px)',
                opacity: 0.3,
              },
              '50%': {
                transform: `translateY(-${
                  20 + Math.random() * 20
                }px) translateX(${10 - Math.random() * 20}px)`,
                opacity: 0.8,
              },
            },
          }}
        />
      ))}

      {/* Hot Air Balloon with Chevron Pattern */}
      <Box
        sx={{
          display: 'none',
          position: 'absolute',
          top: '15%',
          right: '10%',
          width: { xs: 120, md: 180, lg: 220 },
          height: { xs: 140, md: 200, lg: 240 },
          zIndex: 2,
          animation: 'balloonFloat 12s ease-in-out infinite',
          '@keyframes balloonFloat': {
            '0%, 100%': {
              transform: 'translateY(0px) translateX(0px) rotate(0deg)',
            },
            '25%': {
              transform: 'translateY(-15px) translateX(10px) rotate(1deg)',
            },
            '50%': {
              transform: 'translateY(-25px) translateX(-5px) rotate(-1deg)',
            },
            '75%': {
              transform: 'translateY(-10px) translateX(15px) rotate(0.5deg)',
            },
          },
        }}
      >
        {/* Balloon Envelope with Chevron Pattern */}
        <Box
          sx={{
            width: '100%',
            height: '75%',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
            background: `
              conic-gradient(from 0deg at 50% 50%,
                #2d1b3d 0deg,
                #4a2c5a 15deg,
                #1e3a5f 30deg,
                #2d5a87 45deg,
                #4a7ba7 60deg,
                #2d4a2d 75deg,
                #d4b23a 90deg,
                #e07b35 105deg,
                #c73e47 120deg,
                #8f4c81 135deg,
                #4a1a3d 150deg,
                #1a2332 165deg,
                #1a2332 180deg,
                #4a1a3d 195deg,
                #8f4c81 210deg,
                #c73e47 225deg,
                #e07b35 240deg,
                #d4b23a 255deg,
                #2d4a2d 270deg,
                #4a7ba7 285deg,
                #2d5a87 300deg,
                #1e3a5f 315deg,
                #4a2c5a 330deg,
                #2d1b3d 345deg,
                #2d1b3d 360deg
              )
            `,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                repeating-conic-gradient(from 0deg at 50% 50%,
                  transparent 0deg,
                  rgba(255,255,255,0.1) 7.5deg,
                  transparent 15deg
                )
              `,
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '10%',
              left: '15%',
              right: '15%',
              bottom: '30%',
              background: `
                repeating-conic-gradient(from 0deg at 50% 50%,
                  transparent 0deg,
                  rgba(255,255,255,0.15) 3.75deg,
                  transparent 7.5deg,
                  rgba(255,255,255,0.15) 11.25deg,
                  transparent 15deg
                )
              `,
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            },
          }}
        >
          {/* Chevron Pattern Overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                repeating-linear-gradient(
                  45deg,
                  transparent 0px,
                  rgba(255,255,255,0.1) 1px,
                  transparent 2px,
                  transparent 8px
                ),
                repeating-linear-gradient(
                  -45deg,
                  transparent 0px,
                  rgba(255,255,255,0.1) 1px,
                  transparent 2px,
                  transparent 8px
                )
              `,
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            }}
          />
          
          {/* Gore Lines */}
          {[...Array(24)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                top: 0,
                left: '50%',
                width: '1px',
                height: '100%',
                background: 'rgba(255,255,255,0.2)',
                transformOrigin: 'top center',
                transform: `translateX(-50%) rotate(${(i * 360) / 24}deg)`,
              }}
            />
          ))}
          
          {/* Horizontal Section Lines */}
          {[...Array(12)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                left: '10%',
                right: '10%',
                height: '1px',
                background: 'rgba(255,255,255,0.15)',
                top: `${10 + (i * 70) / 12}%`,
                borderRadius: '50%',
              }}
            />
          ))}
        </Box>

        {/* Load Lines */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '25%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 2,
            height: 30,
            background: 'linear-gradient(to bottom, rgba(139, 69, 19, 0.8), rgba(139, 69, 19, 1))',
          }}
        />

        {/* Basket */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 24,
            height: 18,
            backgroundColor: '#8B4513',
            borderRadius: '3px 3px 6px 6px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -2,
              left: 2,
              right: 2,
              height: 2,
              backgroundColor: '#654321',
              borderRadius: '2px',
            },
          }}
        />
      </Box>

      <Container
        maxWidth="wide"
        sx={{
          position: 'relative',
          zIndex: 3,
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          py: { xs: 2, md: 15, xl: 10 },
          px: { xs: 3, md: 3 },
        }}
      >
        <Stack direction="row" gap={{ xs: 6, xl: 12 }} alignItems="center" flexWrap="wrap" flexGrow={1}>
          {/* Left Content */}
          <Box sx={{ pr: { lg: 4 }, flexGrow: 1, maxWidth: "70rem" }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: 'clamp(3rem, 10vmin, 4.5vmax)',
                fontWeight: 900,
                lineHeight: 1,
                color: 'white',
                letterSpacing: '0.03em',
                textShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                fontFamily: '"Paytone One", sans-serif',
                mb: 2,
                maxWidth: '13ch',
              }}
            >
              <Box
                component="span"
                sx={{
                  fontSize: '1.75em',
                }}
              >
                Rocky
              </Box>{' '}
              Mountain Fly
            </Typography>

            {/* Small Brand Text */}
            <Typography
              variant="subtitle2"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: 'clamp(1.25rem, 3vmin, 1.5rem)',
                fontWeight: 700,
                fontStyle: 'italic',
                letterSpacing: '0.15em',
                mt: 1,
                mb: 2,
                display: 'block',
              }}
            >
              FreeSun Balloon Club
            </Typography>
            <hr />
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                mt: 2,
                mb: 6,
                fontSize: 'clamp(1.125rem, 2vmin, 1.875rem)',
                fontWeight: 300,
                lineHeight: 1.6,
                maxWidth: '50rem',
                letterSpacing: '0.01em',
              }}
            >
              Experience breathtaking views and unforgettable moments floating
              above Colorado's stunning mountain landscapes
            </Typography>

            <Button
              variant="outlined"
              size="large"
              endIcon={<MaterialIcon icon="arrow_forward" />}
              onClick={handleJoinCrewClick}
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.4)',
                fontWeight: 500,
                fontSize: '0.95rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                px: 4,
                py: 1.8,
                borderRadius: '50px',
                borderWidth: '1.5px',
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateY(-2px)',
                  borderWidth: '1.5px',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Join the Crew
            </Button>
          </Box>

          {/* Right Content - Process Steps */}
          <Stack display="none">
            <Box sx={{ pl: { lg: 4, xl: 8, xxl: 12 } }}>
              {/* Step 01 */}
              <Card sx={{ backgroundColor: 'rgba(0,0,0,0.3)', mb: 6, p: 3 }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: '3rem', md: '4rem' },
                    fontWeight: 800,
                    color: 'rgba(255, 255, 255, 0.75)',
                    lineHeight: 1,
                    mb: 1,
                    fontFamily: '"Nunito", sans-serif',
                  }}
                >
                  01
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    mb: 1,
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Choose a tour
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: 1.6,
                    fontSize: '0.95rem',
                    maxWidth: 280,
                  }}
                >
                  Choose the tour that suits you best. From sunrise flights to
                  romantic evening adventures.
                </Typography>
              </Card>

              {/* Step 02 */}
             <Card sx={{ backgroundColor: 'rgba(0,0,0,0.3)', mb: 6, p: 3 }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: '3rem', md: '4rem' },
                    fontWeight: 800,
                    color: 'rgba(255, 255, 255, 0.75)',
                    lineHeight: 1,
                    mb: 1,
                    fontFamily: '"Nunito", sans-serif',
                  }}
                >
                  02
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    mb: 1,
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Choose a route
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: 1.6,
                    fontSize: '0.95rem',
                    maxWidth: 280,
                  }}
                >
                  For each tour we have several routes. Choose the places you
                  want to see from a bird's eye view.
                </Typography>
              </Card>

              {/* Step 03 */}
              <Card sx={{ backgroundColor: 'rgba(0,0,0,0.3)', mb: 6, p: 3 }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: '3rem', md: '4rem' },
                    fontWeight: 800,
                    color: 'rgba(255, 255, 255, 0.75)',
                    lineHeight: 1,
                    mb: 1,
                    fontFamily: '"Nunito", sans-serif',
                  }}
                >
                  03
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    mb: 1,
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Choose your time
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: 1.6,
                    fontSize: '0.95rem',
                    maxWidth: 280,
                  }}
                >
                  We can choose the most suitable time for you. With us, you can
                  meet the dawn.
                </Typography>
              </Card>

              {/* Continue Button */}
              <Box
                sx={{
                  display: 'none',
                  alignItems: 'center',
                  gap: 2,
                  mt: 4,
                  cursor: 'pointer',
                }}
                onClick={handleContinueClick}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <MaterialIcon
                    icon="arrow_forward"
                    sx={{
                      color: 'white',
                      fontSize: '24px',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateX(2px)',
                      },
                    }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                  }}
                >
                  Pull to continue
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Stack>
      </Container>

      {/* Sign Up Drawer */}
      <SignUpForm
        open={signUpOpen}
        onClose={handleSignUpClose}
        onSuccess={handleSignUpSuccess}
      />
    </Box>
  );
};

export default HeroSection;