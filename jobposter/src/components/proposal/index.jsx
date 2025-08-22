import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Card,
  CardContent,
  IconButton,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  TextField,
} from "@mui/material";
import {
  Visibility,
  Favorite,
  Bookmark,
  People,
  LocationOn,
  TrendingUp,
  Schedule,
  AttachMoney,
  Star,
  CheckCircle,
  Close,
  Add,
  Lock,
  BarChart,
  CalendarToday,
  GpsFixed,
  EmojiEvents,
  Share,
  Boost,
  Send,
} from "@mui/icons-material";
import apiEndpoints from "../../apiconfig";
import { useParams } from "react-router-dom";
import MoreHoriz from "@mui/icons-material/MoreHoriz";

const StatCard = ({ icon: Icon, title, value, change, color, bgColor }) => (
  <Card
    sx={{
      borderRadius: "16px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      border: "1px solid #f0f0f0",
      transition: "all 0.3s ease",
      cursor: "pointer",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: "12px",
              background: bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ color: "white", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: "#6b7280",
                fontWeight: 500,
                mb: 0.5,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#111827",
                lineHeight: 1,
              }}
            >
              {value}
            </Typography>
          </Box>
        </Box>
        {change && (
          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="body2"
              sx={{
                color: "#10b981",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              {change}
            </Typography>
          </Box>
        )}
      </Box>
    </CardContent>
  </Card>
);

const AnalyticsPage = () => {
  const { job_guid } = useParams();
  // const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBid, setSelectedBid] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [userGuid, setUserGuid] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editFeedback, setEditFeedback] = useState("");
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [userRatingData, setUserRatingData] = useState({
    averageRating: 4.5, // This would come from API in real implementation
    totalRatings: 24, // This would come from API in real implementation
    ratingsBreakdown: [],
  });
  const [jobData, setJobData] = useState({
    title: "",
    postedDate: "",
    views: 0,
    likes: 0,
    saves: 0,
    bids: 0,
    avgBid: 0,
    bidRange: [0, 0],
    status: 1,
    bidsList: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [hasAcceptedBid, setHasAcceptedBid] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatThreadId, setChatThreadId] = useState(null);
  const [chatReceiverGuid, setChatReceiverGuid] = useState(null);
  const [chatJobGuid, setChatJobGuid] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");


  useEffect(() => {
    if (jobData.bidsList) {
      const acceptedBidExists = jobData.bidsList.some(
        (bid) => bid.status === "Accepted"
      );
      setHasAcceptedBid(acceptedBidExists);
    }
  }, [jobData.bidsList]);

  // Map API status to UI status
  const mapStatusToUI = (status) => {
    switch (status) {
      case "Accepted":
        return "Accept"; // Changed from "Hire" to "Accept"
      case "Pending":
        return "Pending";
      case "Rejected":
        return "Reject";
      case "Completed": // Changed from "Closed" to "Completed"
        return "Completed";
      default:
        return status;
    }
  };

  // Map UI status to API status
  const mapStatusToAPI = (status) => {
    switch (status) {
      case "Accept": // Changed from "Hire"
        return "Accepted";
      case "Pending":
        return "Pending";
      case "Reject":
        return "Rejected";
      case "Completed": // Changed from "Closed" to "Completed"
        return "Completed";
      default:
        return status;
    }
  };

  // const tabs = [
  //   { id: 0, label: "All Bids", status: "All" },
  //   { id: 1, label: "Shortlisted", status: "Pending" },
  //   { id: 2, label: "Hired", status: "Accepted" },
  // ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Accept":
      case "Accepted":
        return { bg: "#dcfce7", color: "#166534", border: "#bbf7d0" };
      case "Pending":
      case "Pending":
        return { bg: "#fef3c7", color: "#92400e", border: "#fde68a" };
      case "Reject":
      case "Rejected":
        return { bg: "#fee2e2", color: "#991b1b", border: "#fecaca" };
      case "Complted":
      case "Completed": // Add new case for Closed status
        return { bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" };
      default:
        return { bg: "#f3f4f6", color: "#374151", border: "#e5e7eb" };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Accept":
      case "Accepted":
        return <Lock sx={{ fontSize: 16 }} />;
      case "Pending":
      case "Pending":
        return <Schedule sx={{ fontSize: 16 }} />;
      case "Reject":
      case "Rejected":
        return <Close sx={{ fontSize: 16 }} />;
      case "Complete":
      case "Completed":
        return <CheckCircle sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };

  const handleMenuOpen = (event, bid) => {
    if (hasAcceptedBid && bid.status !== "Accepted") {
      return;
    }
    setAnchorEl(event.currentTarget);
    setSelectedBid(bid);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBid(null);
  };

  const handleStatusChange = async (newStatus) => {
    if (selectedBid) {
      await handleStatusUpdate(selectedBid.booking_guid, newStatus);
    }
    handleMenuClose();
  };

  
  const fetchReviews = async (jobGuid) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `${apiEndpoints.rating}?job_guid=${jobGuid}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch reviews");

      const data = await response.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setSnackbar({
        open: true,
        message: "Failed to load reviews",
        severity: "error",
      });
    }
  };
  const fetchBids = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");

      const response = await fetch(
        `${apiEndpoints.bidding}?job_guid=${job_guid}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch bids");
      }

      const data = await response.json();

      if (data.success && data.applications) {
        const job = data.job_details;

        // Calculate days ago for posted date
        const jobCreatedDate = new Date(job.job_createdOn);
        const daysAgo = Math.floor(
          (new Date() - jobCreatedDate) / (1000 * 60 * 60 * 24)
        );
        const postedDateText =
          daysAgo === 0
            ? "Today"
            : `${daysAgo} day${daysAgo !== 1 ? "s" : ""} ago`;

        // Transform API data to match our UI structure
        const transformedBids = data.applications.map((bid) => ({
          booking_guid: bid.booking_guid,
          name: bid.userName,
          bidAmount: bid.bidprice,
          rating: bid.average_rating
            ? parseFloat(bid.average_rating).toFixed(1)
            : 0,
          status: bid.status,
          avatar: bid.userName
            .split(" ")
            .map((n) => n[0])
            .join(""),
          experience: bid.profession_name || "Freelancer",
          completionRate: Math.floor(Math.random() * 20) + 80, // Mock data
          responseTime: `${Math.floor(Math.random() * 12) + 1} hours`, // Mock data
          coverletter: bid.coverletter,
          title: job.jobTitle,
          domain: bid.domain_name || "Unknown",
          skill_names: bid.skill_names ? bid.skill_names.join(", ") : "Unknown",
          user_guid: bid.user_guid, // Add this line to include user_guid from the API response
        }));
        // Calculate bid statistics
        const bidAmounts = transformedBids.map((bid) => bid.bidAmount);
        const avgBid =
          bidAmounts.length > 0
            ? Math.round(
                bidAmounts.reduce((a, b) => a + b, 0) / bidAmounts.length
              )
            : 0;
        const bidRange =
          bidAmounts.length > 0
            ? [Math.min(...bidAmounts), Math.max(...bidAmounts)]
            : [0, 0];

        setJobData((prev) => ({
          ...prev,
          title: job.jobTitle,
          status: job.job_isActive === 1 ? "Open" : "Closed",
          postedDate: postedDateText,
          bidsList: transformedBids,
          bids: transformedBids.length,
          avgBid,
          bidRange,
        }));
      } else {
        throw new Error(data.message || "No bids found");
      }
    } catch (err) {
      console.error("Error fetching bids:", err);
      setError(err.message);
      setJobData({
        title: "",
        postedDate: "",
        views: 0,
        likes: 0,
        saves: 0,
        bids: 0,
        avgBid: 0,
        bidRange: [0, 0],
        status: 1,
        bidsList: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch bids data from API
  useEffect(() => {
    fetchBids();
  }, [job_guid]);

  // Handle status update

  const handleStatusUpdate = async (booking_guid, newStatus) => {
    try {
      const token = sessionStorage.getItem("token");
      const apiStatus = mapStatusToAPI(newStatus);

      const response = await fetch(apiEndpoints.bidding, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          booking_guid,
          status: apiStatus,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to update status");
      }

       if (apiStatus === "Accepted") {
      const acceptedBid = jobData.bidsList.find(
        (bid) => bid.booking_guid === booking_guid
      );
      if (acceptedBid) {
        const welcomeMessage = `Your bid has been accepted for "${acceptedBid.title}"! Let's discuss the project details.`;
        await fetch(apiEndpoints.send_message, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "sendMessage",
            receiver_guid: acceptedBid.user_guid,
            message: welcomeMessage,
          }),
        });
      }
    }

    // fetchBids();

      //   const sendData = await sendResponse.json();
      //   if (sendData.success) {
      //     setChatThreadId(sendData.thread_guid);
      //     setChatMessages([{
      //       message_guid: Date.now().toString(),
      //       message: welcomeMessage,
      //       sender_guid: userGuid,
      //       sentAt: new Date().toISOString()
      //     }]);
      //   }
      //     setChatOpen(true);
      //   }
      // }

      fetchBids();

      setSnackbar({
        open: true,
        message:
          apiStatus === "Accepted"
            ? "Bid accepted and other bids rejected"
            : "Status updated successfully",
        severity: "success",
      });
    } catch (err) {
      console.error("Error updating status:", err);
      setSnackbar({
        open: true,
        message: err.message || "Failed to update status",
        severity: "error",
      });
    }
  };

  const fetchChatMessages = async () => {
    if (!chatThreadId) return;

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `${apiEndpoints.send_message}?action=getMessages&thread_guid=${chatThreadId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setChatMessages(data.data);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      
      const token = sessionStorage.getItem("token");
      const response = await fetch(apiEndpoints.send_message, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "sendMessage",
          receiver_guid: chatReceiverGuid,
          message: newMessage,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to send message");
      }

      setNewMessage("");
      
      if (data.thread_guid && !chatThreadId) {
        setChatThreadId(data.thread_guid);
      }

      // Refresh messages
      fetchChatMessages();

      setSnackbar({
        open: true,
        message: "Message sent successfully",
        severity: "success",
      });
    } catch (err) {
      console.error("Error sending message:", err);
      setSnackbar({
        open: true,
        message: err.message || "Failed to send message",
        severity: "error",
      });
    }
  };


  // Filter bids based on active tab
  // const filteredBids = activeTab === 0
  //   ? jobData.bidsList
  //   : jobData.bidsList.filter(bid =>
  //     activeTab === 1 ? bid.status === "Pending" : bid.status === "Accepted"
  //   );
  useEffect(() => {
    // Get user GUID from JWT token
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        setUserGuid(decoded.userGuid);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }

    // Fetch bids and reviews
    fetchBids();
    if (job_guid) {
      fetchReviews(job_guid);
    }
  }, [job_guid]);

  useEffect(() => {
    if (chatOpen && chatThreadId) {
      fetchChatMessages();
      const interval = setInterval(fetchChatMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [chatOpen, chatThreadId]);


  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };
  const handleFreelancerClick = (freelancer) => {
    setSelectedFreelancer(freelancer);
    setDialogOpen(true);
  };

  // Function to open feedback dialog
  const handleFeedbackClick = () => {
    setFeedbackDialogOpen(true);
  };

  const handleRatingChange = (newValue) => {
    setRatingValue(newValue);
    setShowFeedbackInput(true);
  };
  const handleUpdateReview = async () => {
    if (!editingReview || !editRating) return;

    setIsSubmittingReview(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `${apiEndpoints.rating}?review_guid=${editingReview.review_guid}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rating: editRating,
            feedback: editFeedback,
          }),
        }
      );

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to update review");
      }

      setSnackbar({
        open: true,
        message: "Review updated successfully!",
        severity: "success",
      });

      // Refresh reviews after update
      fetchReviews(job_guid);

      // Reset form
      setEditingReview(null);
      setEditRating(0);
      setEditFeedback("");
      setShowFeedbackInput(false);
    } catch (error) {
      console.error("Error updating review:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to update review",
        severity: "error",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedFreelancer || !ratingValue) return;

    setIsSubmittingReview(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(apiEndpoints.rating, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: ratingValue,
          feedback: feedbackText,
          user_guid: selectedFreelancer.user_guid, // Pass user_guid in payload
        }),
      });
      const data = await response.json();
      if (!data.success)
        throw new Error(data.message || "Failed to submit review");

      setSnackbar({
        open: true,
        message: "Review submitted successfully!",
        severity: "success",
      });

      // Refresh reviews after submission
      fetchReviews(job_guid);

      // Reset form
      setRatingValue(0);
      setFeedbackText("");
      setShowFeedbackInput(false);
      setFeedbackDialogOpen(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to submit review",
        severity: "error",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Call fetchReviews when the component mounts or job_guid changes
  useEffect(() => {
    if (job_guid) {
      fetchReviews(job_guid);
    }
  }, [job_guid]);
  console.log("user", userGuid);
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafb" }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          borderBottom: "1px solid #e5e7eb",
          bgcolor: "white",
        }}
      >
        <Box
          sx={{
            maxWidth: 1400,
            mx: "auto",
            px: { xs: 2, sm: 3, lg: 4 },
            py: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { sm: "center" },
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  p: 1.5,
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BarChart sx={{ color: "white", fontSize: 32 }} />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: "#111827",
                    mb: 1,
                  }}
                >
                  {jobData.title}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Chip
                    icon={
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          bgcolor: "#10b981",
                          borderRadius: "50%",
                        }}
                      />
                    }
                    label={jobData.status}
                    sx={{
                      bgcolor:
                        jobData.status === "Open"
                          ? "#dcfce7"
                          : jobData.status === "Closed"
                          ? "#e5e7eb"
                          : "#fee2e2",
                      color:
                        jobData.status === "Open"
                          ? "#166534"
                          : jobData.status === "Closed"
                          ? "#4b5563"
                          : "#991b1b",
                      fontWeight: 600,
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      color: "#6b7280",
                    }}
                  >
                    <CalendarToday sx={{ fontSize: 16 }} />
                    <Typography variant="body2">
                      Posted {jobData.postedDate}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Box
        sx={{ Width: "100%", mx: "auto", px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}
      >
        {/* Bids Table */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box
            sx={{
              bgcolor: "#fee2e2",
              p: 3,
              borderRadius: "12px",
              textAlign: "center",
              mb: 4,
            }}
          >
            <Typography color="error">
              {error} - Showing mock data instead
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              borderRadius: "16px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              border: "1px solid #f0f0f0",
              width: "100%",
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 3, borderBottom: "1px solid #f0f0f0" }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#111827",
                  mb: 3,
                }}
              >
                Bid Management
              </Typography>

              {/* <Box sx={{
                display: 'flex',
                bgcolor: "#f3f4f6",
                borderRadius: "12px",
                p: 0.5,
                gap: 0.5
              }}>
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: "8px",
                      minHeight: 40,
                      color: activeTab === tab.id ? "#3b82f6" : "#6b7280",
                      bgcolor: activeTab === tab.id ? "white" : "transparent",
                      boxShadow: activeTab === tab.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      '&:hover': {
                        bgcolor: activeTab === tab.id ? "white" : "rgba(0,0,0,0.05)"
                      }
                    }}
                  >
                    <span>{tab.label}</span>
                    <Chip
                      label={
                        tab.id === 0 ? jobData.bidsList.length :
                          tab.id === 1 ? jobData.bidsList.filter(b => b.status === "Pending").length :
                            jobData.bidsList.filter(b => b.status === "Accepted").length
                      }
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.75rem",
                        bgcolor: activeTab === tab.id ? "#dbeafe" : "#e5e7eb",
                        color: activeTab === tab.id ? "#3b82f6" : "#6b7280",
                      }}
                    />
                  </Button>
                ))}
              </Box> */}
            </Box>

            <Box sx={{ overflowX: "auto" }}>
              <Box
                component="table"
                sx={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "600px",
                }}
              >
                <Box component="thead" sx={{ bgcolor: "#f9fafb" }}>
                  <Box component="tr">
                    <Box
                      component="th"
                      sx={{
                        fontWeight: 600,
                        color: "#6b7280",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textAlign: "left",
                        p: 2,
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      Freelancer
                    </Box>
                    <Box
                      component="th"
                      sx={{
                        fontWeight: 600,
                        color: "#6b7280",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textAlign: "left",
                        p: 2,
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      Bid Amount
                    </Box>
                    <Box
                      component="th"
                      sx={{
                        fontWeight: 600,
                        color: "#6b7280",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textAlign: "left",
                        p: 2,
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      Rating
                    </Box>
                    {/* <Box component="th" sx={{
                      fontWeight: 600,
                      color: "#6b7280",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      textAlign: 'left',
                      p: 2,
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      Details
                    </Box> */}
                    <Box
                      component="th"
                      sx={{
                        fontWeight: 600,
                        color: "#6b7280",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textAlign: "left",
                        p: 2,
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      Status
                    </Box>
                    <Box
                      component="th"
                      sx={{
                        fontWeight: 600,
                        color: "#6b7280",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textAlign: "left",
                        p: 2,
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      Actions
                    </Box>
                  </Box>
                </Box>

                <Box component="tbody">
                  {jobData.bidsList.length > 0 ? (
                    jobData.bidsList.map((bid, index) => (
                      <Box
                        key={bid.booking_guid || index}
                        component="tr"
                        sx={{
                          "&:hover": { bgcolor: "#f9fafb" },
                          "&:not(:last-child)": {
                            borderBottom: "1px solid #e5e7eb",
                          },
                          bgcolor:
                            bid.status === "Rejected"
                              ? "rgba(254, 226, 226, 0.3)"
                              : "transparent",
                          opacity: bid.status === "Rejected" ? 0.7 : 1,
                          position: "relative",
                          "&::after":
                            bid.status === "Rejected"
                              ? {
                                  content: '""',
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  background:
                                    "repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(239, 68, 68, 0.1) 5px, rgba(239, 68, 68, 0.1) 10px)",
                                  pointerEvents: "none",
                                }
                              : null,
                        }}
                      >
                        <Box component="td" sx={{ p: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                background:
                                  "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: 700,
                                fontSize: "0.875rem",
                              }}
                              onClick={() => handleFreelancerClick(bid)}
                              style={{ cursor: "pointer" }}
                            >
                              {bid.avatar}
                            </Box>
                            <Box>
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  color: "#111827",
                                  fontSize: "0.875rem",
                                }}
                              >
                                {bid.name}
                              </Typography>
                              <Typography
                                sx={{
                                  color: "#6b7280",
                                  fontSize: "0.75rem",
                                }}
                              >
                                {bid.experience}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Box component="td" sx={{ p: 2 }}>
                          <Typography
                            sx={{
                              fontSize: "1.125rem",
                              fontWeight: 700,
                              color: "#111827",
                            }}
                          >
                            ₹{bid.bidAmount}
                          </Typography>
                        </Box>

                        <Box component="td" sx={{ p: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Star sx={{ color: "#fbbf24", fontSize: 16 }} />
                            <Typography
                              sx={{
                                fontWeight: 600,
                                color: "#111827",
                                fontSize: "0.875rem",
                              }}
                            >
                              {bid.rating}
                            </Typography>
                          </Box>
                        </Box>

                        {/* <Box component="td" sx={{ p: 2 }}>
                          <Box>
                            <Typography sx={{
                              color: "#6b7280",
                              fontSize: "0.75rem",
                            }}>
                              {bid.completionRate}% completion
                            </Typography>
                            <Typography sx={{
                              color: "#6b7280",
                              fontSize: "0.75rem",
                            }}>
                              Responds in {bid.responseTime}
                            </Typography>
                          </Box> 
                        </Box>*/}

                        <Box component="td" sx={{ p: 2 }}>
                          <Chip
                            icon={getStatusIcon(bid.status)}
                            label={mapStatusToUI(bid.status)}
                            sx={{
                              bgcolor: getStatusColor(bid.status).bg,
                              color: getStatusColor(bid.status).color,
                              border: `1px solid ${
                                getStatusColor(bid.status).border
                              }`,
                              fontWeight: 600,
                              fontSize: "0.75rem",
                            }}
                          />
                        </Box>

                        <Box component="td" sx={{ p: 2 }}>
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, bid)}
                            sx={{
                              color: "#6b7280",
                              "&:hover": {
                                bgcolor: "rgba(0,0,0,0.05)",
                              },
                            }}
                            size="small"
                          >
                            <MoreHoriz /> {/* Best alternative */}
                          </IconButton>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Box component="tr">
                      <Box
                        component="td"
                        colSpan={6}
                        sx={{ p: 4, textAlign: "center" }}
                      >
                        <Typography color="textSecondary">
                          No bids found for this filter
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
        <Dialog
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        fullWidth
        maxWidth="md"
        sx={{
          "& .MuiDialog-paper": {
            height: "80vh",
          },
        }}
      >
        <DialogTitle>
          Chat with {selectedFreelancer?.name || "Freelancer"}
          <IconButton
            aria-label="close"
            onClick={() => setChatOpen(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Messages area */}
            <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
              {chatMessages.length > 0 ? (
                chatMessages.map((msg) => (
                  <Box
                    key={msg.message_guid}
                    sx={{
                      display: "flex",
                      justifyContent:
                        msg.sender_guid === userGuid ? "flex-end" : "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor:
                          msg.sender_guid === userGuid ? "#dbeafe" : "#f5f6f6",
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        maxWidth: "70%",
                      }}
                    >
                      <Typography>{msg.message}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(msg.sentAt).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography color="textSecondary">
                  No messages yet. Start the conversation!
                </Typography>
              )}
            </Box>
            
            {/* Message input */}
            <Box sx={{ p: 2, borderTop: "1px solid #e5e7eb" }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Type a message..."
                  size="small"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                >
                  Send
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>


      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setShowFeedbackInput(false);
          setRatingValue(0);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 48,
              height: 48,
              fontSize: "1.25rem",
            }}
          >
            {selectedFreelancer?.avatar}
          </Avatar>
          <Box>
            <Typography variant="h6">{selectedFreelancer?.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedFreelancer?.experience}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          <Grid container spacing={3} width={"100%"}>
            <Grid item xs={12} sm={6} width={"100%"}>
              <Typography variant="subtitle2" color="text.secondary">
                Domain
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedFreelancer?.domain || "Not specified"}
              </Typography>

              {/* <Typography variant="subtitle2" color="text.secondary">
                Profession
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedFreelancer?.experience || 'Not specified'}
              </Typography> */}

              <Typography variant="subtitle2" color="text.secondary">
                Cover Letter
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, mb: 2 }}>
                <Typography variant="body2">
                  {selectedFreelancer?.coverletter ||
                    "No cover letter provided"}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Skills
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                {selectedFreelancer?.skill_names
                  ?.split(",") // Split the string into an array
                  .map((skill) => skill.trim()) // Trim whitespace from each skill
                  .filter((skill) => skill) // Remove any empty strings
                  .map((skill) => (
                    <Chip key={skill} label={skill} size="small" />
                  ))}
              </Box>
            </Grid>

            <Grid item xs={12} width={"100%"}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Reviews
              </Typography>

              {/* Add Rating Input Section */}
              <Box sx={{ mb: 4, p: 2, bgcolor: "#f9fafb", borderRadius: 1 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {editingReview ? "Edit your review" : "Add your review"}
                </Typography>
                <Rating
                  value={editingReview ? editRating : ratingValue}
                  onChange={(event, newValue) => {
                    if (editingReview) {
                      setEditRating(newValue);
                    } else {
                      setRatingValue(newValue);
                    }
                    setShowFeedbackInput(true);
                  }}
                  size="large"
                />

                {showFeedbackInput && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      variant="outlined"
                      placeholder="Share your experience with this freelancer..."
                      value={editingReview ? editFeedback : feedbackText}
                      onChange={(e) => {
                        if (editingReview) {
                          setEditFeedback(e.target.value);
                        } else {
                          setFeedbackText(e.target.value);
                        }
                      }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mt: 1,
                        gap: 1,
                      }}
                    >
                      {editingReview && (
                        <Button
                          onClick={() => {
                            setEditingReview(null);
                            setEditRating(0);
                            setEditFeedback("");
                            setShowFeedbackInput(false);
                          }}
                        >
                          Cancel Edit
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        onClick={
                          editingReview
                            ? handleUpdateReview
                            : handleSubmitFeedback
                        }
                        disabled={
                          !(editingReview ? editFeedback : feedbackText).trim()
                        }
                        endIcon={
                          isSubmittingReview ? (
                            <CircularProgress size={20} />
                          ) : null
                        }
                      >
                        {isSubmittingReview
                          ? "Submitting..."
                          : editingReview
                          ? "Update Review"
                          : "Submit Review"}
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>

              {reviews.length > 0 ? (
                <List>
                  {reviews
                    .filter(
                      (review) =>
                        review.reviewee_guid === selectedFreelancer?.user_guid
                    )
                    .map((review) => (
                      <ListItem
                        key={review.review_guid}
                        alignItems="flex-start"
                        sx={{
                          bgcolor:
                            editingReview?.review_guid === review.review_guid
                              ? "#f0f7ff"
                              : "transparent",
                          borderRadius: 1,
                          transition: "background-color 0.2s",
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar>{review.reviewer_name?.charAt(0)}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Typography component="span" fontWeight="bold">
                                  {review.reviewer_name}
                                </Typography>
                                {review.reviewer_guid === userGuid && ( // Only show edit if current user is the reviewer
                                  <Button
                                    size="small"
                                    onClick={() => {
                                      setEditingReview(review);
                                      setEditRating(review.rating);
                                      setEditFeedback(review.feedback || "");
                                      setShowFeedbackInput(true);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                )}
                              </Box>
                              <Rating
                                value={review.rating}
                                readOnly
                                precision={0.5}
                                size="small"
                              />
                            </>
                          }
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                {review.feedback}
                              </Typography>
                              <Typography variant="caption" display="block">
                                {new Date(
                                  review.created_at
                                ).toLocaleDateString()}
                                {review.created_at !== review.updated_at && (
                                  <span
                                    style={{ marginLeft: "8px", color: "#666" }}
                                  >
                                    (edited)
                                  </span>
                                )}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No reviews yet
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e5e7eb" }}>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            minWidth: 180,
            py: 0.5,
          },
        }}
      >
        <MenuItem
          onClick={() => handleStatusChange("Accepted")}
          disabled={selectedBid?.status === "Accepted"}
          sx={{
            color: selectedBid?.status === "Accepted" ? "#9ca3af" : "#166534",
            "&:hover": {
              bgcolor: "#dcfce7",
            },
          }}
        >
          <Lock sx={{ fontSize: 18, mr: 1.5, color: "#166534" }} />
          Accept
        </MenuItem>
        <MenuItem
          onClick={() => handleStatusChange("Pending")} // Changed from 'Maybe' to 'Pending'
          disabled={selectedBid?.status === "Pending"}
          sx={{
            color: selectedBid?.status === "Pending" ? "#9ca3af" : "#92400e",
            "&:hover": {
              bgcolor: "#fef3c7",
            },
          }}
        >
          <Schedule sx={{ fontSize: 18, mr: 1.5, color: "#92400e" }} />
          Pending
        </MenuItem>
        <MenuItem
          onClick={() => handleStatusChange("Reject")}
          disabled={selectedBid?.status === "Rejected"}
          sx={{
            color: selectedBid?.status === "Rejected" ? "#9ca3af" : "#991b1b",
            "&:hover": {
              bgcolor: "#fee2e2",
            },
          }}
        >
          <Close sx={{ fontSize: 18, mr: 1.5, color: "#991b1b" }} />
          Reject
        </MenuItem>
        {/* <Divider sx={{ my: 0.5 }} /> */}
        <MenuItem
          onClick={() => handleStatusChange("Completed")}
          sx={{
            color: "#1e40af",
            "&:hover": {
              bgcolor: "#dbeafe",
            },
          }}
        >
          <CheckCircle sx={{ fontSize: 18, mr: 1.5, color: "#1e40af" }} />
          Complete
        </MenuItem>
        {/* <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={() => handleStatusChange('Cancel')}
          sx={{
            color: '#6b7280',
            '&:hover': {
              bgcolor: '#f3f4f6'
            }
          }}
        >
          <Close sx={{ fontSize: 18, mr: 1.5, color: '#6b7280' }} />
          Cancel
        </MenuItem> */}
      </Menu>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AnalyticsPage;
