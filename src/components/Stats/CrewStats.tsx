import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Divider,
  Tab,
  Tabs,
} from '@mui/material';
import MaterialIcon from '../common/MaterialIcon';

interface CrewMember {
  id: string;
  name: string;
  role: 'pilot' | 'crew' | 'admin';
  avatar?: string;
  email: string;
  phone: string;
  flightHours: number;
  certifications: string[];
  rating: number;
  bio: string;
  joinDate: Date;
  lastActive: Date;
}

const CrewStats: React.FC = () => {
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const crewMembers: CrewMember[] = [
    {
      id: '1',
      name: 'John Pilot',
      role: 'pilot',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      email: 'john@freesun.com',
      phone: '+1 (555) 123-4567',
      flightHours: 1250,
      certifications: ['Commercial Pilot', 'BFA Certified', 'Safety Officer'],
      rating: 4.9,
      bio: 'Experienced hot air balloon pilot with over 10 years of flying in Colorado. Specializes in sunrise flights and scenic tours.',
      joinDate: new Date('2018-03-15'),
      lastActive: new Date()
    },
    {
      id: '2',
      name: 'Sarah Chen',
      role: 'pilot',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      email: 'sarah@freesun.com',
      phone: '+1 (555) 234-5678',
      flightHours: 890,
      certifications: ['Private Pilot', 'BFA Certified', 'First Aid'],
      rating: 4.8,
      bio: 'Passionate about hot air ballooning and mountain scenery. Weather specialist with meteorology background.',
      joinDate: new Date('2019-07-22'),
      lastActive: new Date(Date.now() - 3600000)
    },
    {
      id: '3',
      name: 'Mike Rodriguez',
      role: 'crew',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      email: 'mike@freesun.com',
      phone: '+1 (555) 345-6789',
      flightHours: 0,
      certifications: ['Ground Crew Chief', 'Chase Vehicle Certified'],
      rating: 4.7,
      bio: 'Dedicated ground crew member and chase team leader. Expert in balloon setup and recovery operations.',
      joinDate: new Date('2020-01-10'),
      lastActive: new Date(Date.now() - 7200000)
    },
    {
      id: '4',
      name: 'Emma Thompson',
      role: 'crew',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      email: 'emma@freesun.com',
      phone: '+1 (555) 456-7890',
      flightHours: 45,
      certifications: ['Safety Officer', 'First Aid', 'CPR'],
      rating: 4.9,
      bio: 'Safety-focused crew member with medical training. Ensures all operations meet safety standards.',
      joinDate: new Date('2021-05-18'),
      lastActive: new Date(Date.now() - 1800000)
    }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'pilot': return 'primary';
      case 'crew': return 'secondary';
      case 'admin': return 'error';
      default: return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'pilot': return 'flight';
      case 'crew': return 'person';
      case 'admin': return 'star';
      default: return 'person';
    }
  };

  const getExperienceLevel = (hours: number) => {
    if (hours >= 1000) return 'Expert';
    if (hours >= 500) return 'Advanced';
    if (hours >= 100) return 'Intermediate';
    if (hours > 0) return 'Beginner';
    return 'Ground Crew';
  };

  const filteredMembers = tabValue === 0 ? crewMembers : 
                          tabValue === 1 ? crewMembers.filter(m => m.role === 'pilot') :
                          crewMembers.filter(m => m.role === 'crew');

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Crew Statistics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Pilot and crew member profiles, certifications, and flight hours
        </Typography>
      </Paper>

      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary.main" fontWeight="bold">
                {crewMembers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Crew Members
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="secondary.main" fontWeight="bold">
                {crewMembers.filter(m => m.role === 'pilot').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Certified Pilots
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success.main" fontWeight="bold">
                {crewMembers.reduce((sum, m) => sum + m.flightHours, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Flight Hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="warning.main" fontWeight="bold">
                {crewMembers.reduce((sum, m) => sum + m.certifications.length, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Certifications
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Crew Members */}
      <Paper sx={{ p: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="All Members" />
          <Tab label="Pilots" />
          <Tab label="Crew" />
        </Tabs>

        <List>
          {filteredMembers.map((member, index) => (
            <React.Fragment key={member.id}>
              <ListItem
                sx={{ 
                  px: 0, 
                  cursor: 'pointer',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
                onClick={() => setSelectedMember(member)}
              >
                <ListItemAvatar>
                  <Avatar src={member.avatar} sx={{ width: 56, height: 56 }}>
                    <MaterialIcon icon="person" />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  sx={{ ml: 2 }}
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {member.name}
                      </Typography>
                      <Chip
                        icon={<MaterialIcon icon={getRoleIcon(member.role)} />}
                        label={member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        size="small"
                        color={getRoleColor(member.role) as any}
                        variant="outlined"
                      />
                      <Chip
                        label={getExperienceLevel(member.flightHours)}
                        size="small"
                        color="default"
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Flight Hours: {member.flightHours} • Rating: {member.rating}/5.0
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {member.certifications.slice(0, 3).map((cert) => (
                          <Chip
                            key={cert}
                            label={cert}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                        {member.certifications.length > 3 && (
                          <Chip
                            label={`+${member.certifications.length - 3} more`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  }
                />
                <IconButton>
                  <MaterialIcon icon="bar_chart" />
                </IconButton>
              </ListItem>
              {index < filteredMembers.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Member Detail Dialog */}
      <Dialog
        open={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedMember && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={selectedMember.avatar} sx={{ width: 48, height: 48 }}>
                  <MaterialIcon icon="person" />
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedMember.name}</Typography>
                  <Chip
                    icon={<MaterialIcon icon={getRoleIcon(selectedMember.role)} />}
                    label={selectedMember.role.charAt(0).toUpperCase() + selectedMember.role.slice(1)}
                    size="small"
                    color={getRoleColor(selectedMember.role) as any}
                  />
                </Box>
              </Box>
              <IconButton onClick={() => setSelectedMember(null)}>
                <MaterialIcon icon="close" />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Contact Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemAvatar>
                        <MaterialIcon icon="email" color="primary" />
                      </ListItemAvatar>
                      <ListItemText primary={selectedMember.email} />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <MaterialIcon icon="phone" color="primary" />
                      </ListItemAvatar>
                      <ListItemText primary={selectedMember.phone} />
                    </ListItem>
                  </List>

                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Statistics
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Flight Hours
                    </Typography>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      {selectedMember.flightHours}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((selectedMember.flightHours / 1500) * 100, 100)}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Rating
                    </Typography>
                    <Typography variant="h4" color="secondary.main" fontWeight="bold">
                      {selectedMember.rating}/5.0
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(selectedMember.rating / 5) * 100}
                      color="secondary"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Certifications
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                    {selectedMember.certifications.map((cert) => (
                      <Chip
                        key={cert}
                        icon={<MaterialIcon icon="school" />}
                        label={cert}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>

                  <Typography variant="h6" gutterBottom>
                    Bio
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedMember.bio}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedMember(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CrewStats;