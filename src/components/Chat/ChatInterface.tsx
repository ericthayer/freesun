import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  InputAdornment,
  Card,
  CardContent,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import MaterialIcon from '../common/MaterialIcon';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'video' | 'file';
  avatar?: string;
  role?: string;
}

const ChatInterface: React.FC = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'Sarah Chen',
      content: 'Good morning everyone! Weather looks perfect for flights today. Wind speeds are ideal at 5-8 mph.',
      timestamp: new Date(Date.now() - 3600000),
      type: 'text',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      role: 'Pilot'
    },
    {
      id: '2',
      sender: 'Mike Rodriguez',
      content: 'Confirmed! Chase crew is ready. All vehicles checked and fueled.',
      timestamp: new Date(Date.now() - 3000000),
      type: 'text',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      role: 'Crew Chief'
    },
    {
      id: '3',
      sender: 'Emma Thompson',
      content: 'Safety briefing completed. All crew members present and accounted for.',
      timestamp: new Date(Date.now() - 1800000),
      type: 'text',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      role: 'Safety Officer'
    },
    {
      id: '4',
      sender: 'John Pilot',
      content: 'Great work team! Launch time is set for 6:30 AM. See you all at the field.',
      timestamp: new Date(Date.now() - 900000),
      type: 'text',
      avatar: user?.avatar,
      role: 'Lead Pilot'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: user?.name || 'Unknown',
        content: message,
        timestamp: new Date(),
        type: 'text',
        avatar: user?.avatar,
        role: user?.role === 'pilot' ? 'Pilot' : user?.role === 'crew' ? 'Crew' : 'Admin'
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'pilot':
      case 'lead pilot':
        return 'primary';
      case 'crew chief':
        return 'secondary';
      case 'safety officer':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Crew Chat
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Real-time communication for Free Sun crew members
        </Typography>
      </Paper>

      <Card sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
            <List>
              {messages.map((msg, index) => (
                <React.Fragment key={msg.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar src={msg.avatar}>
                        <MaterialIcon icon="person" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {msg.sender}
                          </Typography>
                          {msg.role && (
                            <Chip
                              label={msg.role}
                              size="small"
                              color={getRoleColor(msg.role) as any}
                              variant="outlined"
                            />
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(msg.timestamp)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
                          {msg.content}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < messages.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
            <div ref={messagesEndRef} />
          </Box>

          <Divider />
          
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton size="small" color="primary">
                      <MaterialIcon icon="attach_file" />
                    </IconButton>
                    <IconButton size="small" color="primary">
                      <MaterialIcon icon="image" />
                    </IconButton>
                    <IconButton size="small" color="primary">
                      <MaterialIcon icon="video_file" />
                    </IconButton>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleSendMessage}
                      color="primary"
                      disabled={!message.trim()}
                    >
                      <MaterialIcon icon="send" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ChatInterface;