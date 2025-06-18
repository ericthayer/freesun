import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Container, Box } from '@mui/material';
import { theme } from './theme/theme';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import ChatInterface from './components/Chat/ChatInterface';
import WeatherDashboard from './components/Weather/WeatherDashboard';
import CrewStats from './components/Stats/CrewStats';
import EventCalendar from './components/Calendar/EventCalendar';
import MerchandiseStore from './components/Store/MerchandiseStore';
import MediaGallery from './components/Media/MediaGallery';
import HeroSection from './components/Hero/HeroSection';
import BalloonEnvelopePattern from './components/BalloonPattern/BalloonEnvelopePattern';
import UserProfile from './components/Profile/UserProfile';

type PageType =
  | 'home'
  | 'chat'
  | 'media'
  | 'weather'
  | 'stats'
  | 'calendar'
  | 'store'
  | 'pattern'
  | 'profile';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HeroSection onNavigate={setCurrentPage} />;
      case 'chat':
        return <ChatInterface />;
      case 'media':
        return <MediaGallery />;
      case 'weather':
        return <WeatherDashboard />;
      case 'stats':
        return <CrewStats />;
      case 'calendar':
        return <EventCalendar />;
      case 'store':
        return <MerchandiseStore />;
      case 'pattern':
        return <BalloonEnvelopePattern />;
      case 'profile':
        return <UserProfile />;
      default:
        return <HeroSection onNavigate={setCurrentPage} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Box
          sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
        >
          
          {currentPage === 'home' ? (
             <Box
                sx={{
                  minHeight: '100vh',
                  position: 'relative',
                  overflow: 'hidden',
                  background: `
                    linear-gradient(rgb(0 0 0 / 50%) 0%, rgb(22 6 71 / 40%)) 20%,
                    url("https://assets.codepen.io/97621/IMG_8276.jpg?auto=compress&cs=tinysrgb&w=1920") center/cover`,
                  backgroundAttachment: 'fixed',
                  display: 'flex',
                  flexDirection: 'column',
                }}
               >
              <Navbar onNavigate={setCurrentPage} currentPage={currentPage} />
              {renderCurrentPage()}
            </Box>
          ) : (
            <Container maxWidth="xl" sx={{ flexGrow: 1, pt: 14, pb: 3 }}>
              <Navbar onNavigate={setCurrentPage} currentPage={currentPage} />
              {renderCurrentPage()}
            </Container>
          )}
        </Box>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;