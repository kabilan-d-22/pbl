import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Paper, Typography, TextField, IconButton, List, ListItem, 
  ListItemButton, ListItemText, Avatar, Divider, alpha, useTheme, 
  useMediaQuery, CircularProgress, Tooltip 
} from '@mui/material';
import { 
  Send as SendIcon, 
  ArrowBack as BackIcon,
  Chat as ChatIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { chatAPI, userAPI, groupAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isHead } = useAuth(); // Using consistent hook from Layout.jsx
  
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll logic to keep the latest messages in view
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initialize Chat: Load team for Head or find Head for User
  useEffect(() => {
    const initChat = async () => {
      try {
        if (isHead) {
          const res = await userAPI.getUsers();
          setTeamMembers(res.data.filter(u => u.id !== user.id));
        } else {
          const res = await groupAPI.getGroup();
          // regular users automatically target the group head
          setSelectedUser({ id: res.data.head_id, name: 'Team Head' });
        }
      } catch (err) {
        console.error("Chat initialization error:", err);
      } finally {
        setLoading(false);
      }
    };
    initChat();
  }, [user, isHead]);

  // Message Polling: Fetch new messages every 5 seconds
  useEffect(() => {
    if (selectedUser) {
      const fetchMessages = async () => {
        try {
          const res = await chatAPI.getMessages(selectedUser.id);
          setMessages(res.data);
          scrollToBottom();
        } catch (err) {
          console.error("Fetch messages error:", err);
        }
      };
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const res = await chatAPI.sendMessage({
        receiverId: selectedUser.id,
        content: newMessage
      });
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  const handleDeleteConversation = async () => {
    if (window.confirm("Are you sure you want to delete this entire conversation history? This cannot be undone.")) {
      try {
        await chatAPI.deleteConversation(selectedUser.id);
        setMessages([]); // Clear locally
      } catch (err) {
        alert("Failed to delete conversation.");
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      height: { xs: 'calc(100vh - 80px)', sm: 'calc(100vh - 140px)' }, 
      gap: 2,
      overflow: 'hidden'
    }}>
      {/* Sidebar - Visible for Head (Hidden on mobile if chatting) */}
      {isHead && (!isMobile || !selectedUser) && (
        <Paper elevation={0} sx={{ 
          width: isMobile ? '100%' : 300, 
          borderRadius: 3, 
          display: 'flex', 
          flexDirection: 'column',
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden'
        }}>
          <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <Typography variant="h6" fontWeight="700">Conversations</Typography>
          </Box>
          <List sx={{ p: 0, flexGrow: 1, overflowY: 'auto' }}>
            {teamMembers.length > 0 ? teamMembers.map((member) => (
              <ListItem key={member.id} disablePadding>
                <ListItemButton 
                  selected={selectedUser?.id === member.id}
                  onClick={() => setSelectedUser(member)}
                  sx={{ py: 2 }}
                >
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 36, height: 36 }}>
                    {member.name.charAt(0)}
                  </Avatar>
                  <ListItemText 
                    primary={member.name} 
                    primaryTypographyProps={{ fontWeight: 600 }}
                    secondary={member.role}
                  />
                </ListItemButton>
              </ListItem>
            )) : (
              <Box p={3} textAlign="center">
                <Typography variant="body2" color="text.secondary">No team members found</Typography>
              </Box>
            )}
          </List>
        </Paper>
      )}

      {/* Main Chat Area */}
      {(!isHead || selectedUser || !isMobile) && (
        <Paper elevation={0} sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          borderRadius: 3, 
          border: `1px solid ${theme.palette.divider}`, 
          overflow: 'hidden',
          width: '100%'
        }}>
          {selectedUser ? (
            <>
              {/* Chat Header with Delete option for Head */}
              <Box sx={{ 
                p: 2, 
                borderBottom: `1px solid ${theme.palette.divider}`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                gap: 1 
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isHead && isMobile && (
                    <IconButton onClick={() => setSelectedUser(null)}>
                      <BackIcon />
                    </IconButton>
                  )}
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                    {selectedUser.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="700" lineHeight={1}>
                      {selectedUser.name}
                    </Typography>
                  </Box>
                </Box>

                {isHead && (
                  <Tooltip title="Delete Conversation">
                    <IconButton color="error" onClick={handleDeleteConversation}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              {/* Messages display */}
              <Box sx={{ 
                flexGrow: 1, 
                p: { xs: 2, md: 3 }, 
                overflowY: 'auto', 
                bgcolor: alpha(theme.palette.background.default, 0.5),
                display: 'flex', 
                flexDirection: 'column', 
                gap: 1.5 
              }}>
                {messages.length > 0 ? messages.map((msg, idx) => {
                  const isMe = msg.sender === user.id;
                  return (
                    <Box key={idx} sx={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 3, 
                        bgcolor: isMe ? 'primary.main' : 'background.paper',
                        color: isMe ? 'white' : 'text.primary',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        borderBottomRightRadius: isMe ? 0 : 12,
                        borderBottomLeftRadius: isMe ? 12 : 0,
                      }}>
                        <Typography variant="body2">{msg.content}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ mt: 0.3, display: 'block', textAlign: isMe ? 'right' : 'left', opacity: 0.6 }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                  );
                }) : (
                  <Box flex={1} display="flex" alignItems="center" justifyContent="center">
                    <Typography variant="body2" color="text.secondary">No messages yet. Start the conversation!</Typography>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Message Input */}
              <Box component="form" onSubmit={handleSendMessage} sx={{ 
                p: 2, 
                bgcolor: 'background.paper', 
                borderTop: `1px solid ${theme.palette.divider}`, 
                display: 'flex', 
                gap: 1 
              }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  autoComplete="off"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                />
                <IconButton 
                  color="primary" 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </Box>
            </>
          ) : (
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', p: 3 }}>
              <ChatIcon sx={{ fontSize: 60, opacity: 0.1, mb: 2 }} />
              <Typography variant="h6">Your Messages</Typography>
              <Typography variant="body2">Select a team member to start chatting.</Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default Chat;