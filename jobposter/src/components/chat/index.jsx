import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  TextField,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
  Badge,
  Button,
} from "@mui/material";
import { Send, Chat as ChatIcon, Search } from "@mui/icons-material";
import apiEndpoints from "../../apiconfig";
import Picker from "emoji-picker-react";

let currentUserGuid = "";
const isJobPoster = sessionStorage.getItem("role") === "jobposter";

const Chat = () => {
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [receiverGuid, setReceiverGuid] = useState(null);
  const messagesEndRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const onEmojiClick = (emojiData) => {
    setMessageText((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isSmallMobile = useMediaQuery("(max-width:599px)");

  const fetchThreads = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(
        `${apiEndpoints.send_message}?action=getThreads`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setThreads(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("Thread error:", err);
      setThreads([]);
    }
  };

  const fetchMessages = async (thread) => {
    const thread_guid = thread.thread_guid;
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(
        `${apiEndpoints.send_message}?action=getMessages&thread_guid=${thread_guid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (data.success) {
        const messagesWithReadStatus = data.data.map((msg) => ({
          ...msg,
          read: msg.read || false,
        }));
        setMessages(messagesWithReadStatus);
        currentUserGuid = thread.jobposter_guid;
        setReceiverGuid(isJobPoster ? thread.user_guid : thread.user_guid);
      }
    } catch (err) {
      console.error("Fetch messages error:", err);
    }
  };

  const markMessagesAsRead = async (thread_guid) => {
    try {
      const token = sessionStorage.getItem("token");
      await fetch(`${apiEndpoints.send_message}?action=markAsRead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ thread_guid }),
      });
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          read: true,
        }))
      );

      setThreads((prev) =>
        prev.map((thread) =>
          thread.thread_guid === thread_guid
            ? { ...thread, unread_count: 0 }
            : thread
        )
      );
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  };

  const handleThreadClick = async (thread) => {
    setSelectedThread(thread);
    await fetchMessages(thread);
    await markMessagesAsRead(thread.thread_guid);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(apiEndpoints.send_message, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "sendMessage",
          thread_guid: selectedThread.thread_guid,
          receiver_guid: receiverGuid,
          job_guid: selectedThread.job_guid,
          message: messageText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessageText("");
        fetchMessages(selectedThread);
      }
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (selectedThread) {
        fetchMessages(selectedThread);
      }
      fetchThreads();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [selectedThread]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleBackToThreads = () => {
    setSelectedThread(null);
  };

  const renderChatList = () => (
    <Paper
      elevation={3}
      sx={{
        width: isSmallMobile ? "86.55%" : "30%",
        p: 2,
        overflow: "hidden",
        borderRadius: 3,
        display: "flex",
        flexDirection: "column",
        height: "90%",
        backgroundColor: "#fff",
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Search sx={{ color: "action.active", mr: 1 }} />
          <Typography variant="h6">Chats</Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 1,
            p: 1,
            backgroundColor: "grey.100",
            borderRadius: 2,
          }}
        >
          <Search sx={{ color: "grey.500", mr: 1 }} />
          <TextField
            fullWidth
            variant="standard"
            placeholder="Search or start new chat"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: "0.875rem",
                color: "grey.800",
              },
            }}
          />
        </Box>

        {threads.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No chats yet. Start your first conversation!
            </Typography>
            <Button
              variant="contained"
              startIcon={<ChatIcon />}
              onClick={() => alert("Start new message flow (to be implemented)")}
            >
              Start Message
            </Button>
          </Box>
        ) : (
          <List>
            {threads
              .filter(
                (thread) =>
                  thread.user_name &&
                  thread.user_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
              )
              .map((thread) => (
                <ListItem
                  key={thread.thread_guid}
                  button
                  onClick={() => handleThreadClick(thread)}
                  sx={{
                    bgcolor:
                      selectedThread?.thread_guid === thread.thread_guid
                        ? theme.palette.primary[50]
                        : theme.palette.common.white,
                    "&:hover": {
                      backgroundColor: theme.palette.primary[50],
                    },
                    borderRadius: 2,
                    mb: 1,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "#2563eb" }}>
                      {thread.user_name?.[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {thread.user_name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {thread.latest_message}
                      </Typography>
                    }
                  />
                  {thread.unread_count > 0 && (
                    <Badge
                      color="primary"
                      badgeContent={thread.unread_count}
                      sx={{
                        "& .MuiBadge-badge": {
                          backgroundColor: "#2563eb",
                          color: "white",
                        },
                      }}
                    />
                  )}
                </ListItem>
              ))}
          </List>
        )}
      </Box>  
    </Paper>
  );

  const renderChatWindow = () => (
    <Paper
      elevation={3}
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        p: 2,
        borderRadius: 3,
        backgroundColor: "#fff",
        height: "90%",
      }}
    >
      {selectedThread ? (
        <>
          {isSmallMobile && (
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <IconButton onClick={handleBackToThreads}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {selectedThread.user_name}
              </Typography>
            </Box>
          )}
          {!isSmallMobile && (
            <ListItem alignItems="center">
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: "#2563eb" }}>
                  {selectedThread.user_name?.[0]}
                </Avatar>
              </ListItemAvatar>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {selectedThread.user_name}
              </Typography>
            </ListItem>
          )}

          <Divider sx={{ my: 1 }} />
          <Box sx={{ flex: 1, overflowY: "auto", mb: 2 }}>
            {messages.map((msg) => {
              const isSent = msg.sender_guid === currentUserGuid;
              return (
                <Box
                  key={msg.message_guid}
                  sx={{
                    display: "flex",
                    justifyContent: isSent ? "flex-end" : "flex-start",
                    mb: 1,
                    px: 1,
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: isSent
                        ? "#2563eb"
                        : "rgba(16, 185, 129, 0.1)",
                      color: isSent ? "white" : "inherit",
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      maxWidth: "75%",
                      boxShadow: 1,
                    }}
                  >
                    <Typography variant="body2">{msg.message}</Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="caption" sx={{ mr: 0.5 }}>
                        {new Date(msg.sentAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                      {isSent && (
                        <span
                          style={{
                            color: msg.read ? "white" : "white",
                            fontSize: "0.75rem",
                          }}
                        >
                          {msg.read ? "✓✓" : "✓"}
                        </span>
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              mt: "auto",
              alignItems: "center",
              borderTop: "1px solid #e0e0e0",
              pt: 1,
              position: "relative",
            }}
          >
            <IconButton
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              sx={{ color: "#2563eb" }}
            >
              <span role="img" aria-label="emoji">
                😊
              </span>
            </IconButton>
            {showEmojiPicker && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: "60px",
                  left: "0",
                  zIndex: 10,
                }}
              >
                <Picker
                  onEmojiClick={onEmojiClick}
                  emojiStyle="native"
                  skinTonesDisabled
                  width={300}
                  height={350}
                />
              </Box>
            )}
            <TextField
              fullWidth
              placeholder="Type a message"
              size="small"
              variant="outlined"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              sx={{
                borderRadius: "20px",
                backgroundColor: "#f9f9f9",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "20px",
                },
              }}
            />
            <IconButton
              onClick={handleSendMessage}
              color="primary"
              sx={{
                borderRadius: "50%",
                backgroundColor: "#2563eb",
                color: "white",
                "&:hover": {
                  backgroundColor: "#1d4ed8",
                },
              }}
            >
              <Send />
            </IconButton>
          </Box>
        </>
      ) : (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            flexDirection: "column",
            color: "#777",
          }}
        >
          <img
            src="https://img.icons8.com/clouds/200/000000/chat.png"
            alt="Start Chat"
            style={{ opacity: 0.6, marginBottom: 20 }}
          />
          <Typography variant="h6" gutterBottom>
            Welcome to the chat!
          </Typography>
          <Typography variant="body2">
            Select a conversation to begin messaging
          </Typography>
        </Box>
      )}
    </Paper>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        height: "85vh",
        gap: 2,
        p: 2,
        backgroundColor: "#f8fafc",
      }}
    >
      {isSmallMobile ? (
        selectedThread ? (
          renderChatWindow()
        ) : (
          renderChatList()
        )
      ) : (
        <>
          {renderChatList()}
          {renderChatWindow()}
        </>
      )}
    </Box>
  );
};

export default Chat;