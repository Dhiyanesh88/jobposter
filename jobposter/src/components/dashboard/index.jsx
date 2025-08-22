import React, { useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
} from "@mui/material";
import {
  TrendingUp,
  Work,
  People,
  CurrencyRupee,
  Visibility,
  Edit,
  Delete,
  Description,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import apiEndpoints from "../../apiconfig";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    recentJobs: [],
    recentApplications: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(apiEndpoints.dashboard, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        if (data.status) {
          // Safely access nested properties with fallbacks
          const bookingStats = data.data?.booking_stats || {};
          const byStatus = bookingStats.by_status || {};

          // In your fetchData function within useEffect:
          const transformedData = {
            stats: [
              {
                title: "Active Jobs",
                value: data.data?.job_stats?.active_jobs?.toString() || "0",
                change: "+0%",
                icon: <Work />,
                color: "#2563eb",
                bgColor: "#eff6ff",
              },
              {
                title: "Total Applications",
                value: bookingStats.total_bookings?.toString() || "0",
                change: "+0%",
                icon: <People />,
                color: "#059669",
                bgColor: "#ecfdf5",
              },
              {
                title: "Monthly Spend",
                value: `₹${(bookingStats.total_spent || 0).toLocaleString()}`,
                change: "+0%",
                icon: <CurrencyRupee />,
                color: "#dc2626",
                bgColor: "#fef2f2",
              },
              {
                title: "Profile Views",
                value: byStatus.Closed?.toString() || "0",
                change: "+0%",
                icon: <TrendingUp />,
                color: "#7c3aed",
                bgColor: "#faf5ff",
              },
            ],
            recentJobs: (data.data?.recent_jobs || []).map((job) => ({
              id: job.id || Math.random().toString(36).substr(2, 9),
              title: job.job_title || "Untitled Job",
              status: job.status || "Unknown",
              Description: job.job_description || "No description provided",
              projectDuration: job.project_duration || "Not specified",
              applications: job.application_count || 0,
              budget: job.budget ? `₹${job.budget}` : "$0",
              postedDate: job.time_ago || "Recently",
              progress:
                job.status === "Active"
                  ? Math.min(100, Math.max(0, (job.application_count || 0) * 5))
                  : 0,
            })),
            recentApplications: (data.data?.recent_applications || []).map(
              (app) => ({
                id: app.id || Math.random().toString(36).substr(2, 9),
                name: app.name || "Anonymous",
                domain: app.domain || "Unknown domain",
                profession: app.profession || "Unknown profession",
                job: app.job_title || "Unknown job",
                rating: app.rating || "0",
                experience: app.experience || "0 years",
                appliedDate: app.time_ago || "Recently",
                avatar:
                  app.profile_img ||
                  "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150",
              })
            ),
          };

          setDashboardData(transformedData);
        } else {
          throw new Error(data.message || "Failed to fetch data");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
        // Fallback to hardcoded data if API fails
        setDashboardData({
          stats: [
            {
              title: "Active Jobs",
              value: "12",
              change: "+2.5%",
              icon: <Work />,
              color: "#2563eb",
              bgColor: "#eff6ff",
            },
            {
              title: "Total Applications",
              value: "248",
              change: "+12.3%",
              icon: <People />,
              color: "#059669",
              bgColor: "#ecfdf5",
            },
            {
              title: "Monthly Spend",
              value: "$4,250",
              change: "+8.1%",
              icon: <CurrencyRupee />,
              color: "#dc2626",
              bgColor: "#fef2f2",
            },
            {
              title: "Profile Views",
              value: "1,429",
              change: "+15.2%",
              icon: <TrendingUp />,
              color: "#7c3aed",
              bgColor: "#faf5ff",
            },
          ],
          recentJobs: [],
          recentApplications: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Your existing StatCard and JobCard components remain the same
  const StatCard = ({ stat }) => (
    <Card
      style={{
        height: "100%",
        width: "100%",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        transition: "all 0.3s ease",
        cursor: "pointer",
      }}
    >
      <CardContent style={{ padding: "24px", alignItems: "center" }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: stat.bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: stat.color,
            }}
          >
            {stat.icon}
          </div>
          <Chip
            label={stat.change}
            size="small"
            style={{
              backgroundColor: "#ecfdf5",
              color: "#059669",
              fontWeight: 600,
              fontSize: "12px",
            }}
          />
        </Box>
        <Typography
          variant="h4"
          style={{
            fontWeight: 700,
            color: "#1f2937",
            marginBottom: "4px",
          }}
        >
          {stat.value}
        </Typography>
        <Typography
          variant="body2"
          style={{
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          {stat.title}
        </Typography>
      </CardContent>
    </Card>
  );

  const JobCard = ({ job }) => (
    <Card
      style={{
        marginBottom: "16px",
        borderRadius: "12px",
        width: "100%",
        border: "1px solid #e2e8f0",
        transition: "all 0.3s ease",
        height: "220px", // Fixed height for all cards
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{
          padding: {
            xs: "10px",
            sm: "20px",
          },
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
          flex={1}
          style={{ overflow: "hidden" }}
        >
          <Box style={{ width: "100%" }}>
            <Typography
              variant="h6"
              style={{
                fontWeight: 600,
                color: "#1f2937",
                marginBottom: "8px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {job.title}
            </Typography>

            <Typography
              variant="body2"
              style={{
                fontWeight: 300,
                color: "#64748b",
                marginBottom: "8px",
                display: "-webkit-box",
                WebkitLineClamp: 2, // Limit to 2 lines
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                minHeight: "40px", // Fixed height for description
              }}
            >
              {job.Description}
            </Typography>

            <Box display="flex" alignItems="center" gap="12px" mb={1}>
              <Chip
                label={job.status}
                size="small"
                style={{
                  backgroundColor:
                    job.status === "Active"
                      ? "#ecfdf5"
                      : job.status === "Draft"
                        ? "#fef3c7"
                        : "#fee2e2",
                  color:
                    job.status === "Active"
                      ? "#059669"
                      : job.status === "Draft"
                        ? "#d97706"
                        : "#dc2626",
                  fontWeight: 500,
                }}
              />
              <Typography variant="body2" style={{ color: "#64748b" }}>
                {job.applications} applications
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          display="flex"
          sx={{
            flexDirection: "row", // default for >320px
            "@media (max-width:360px)": {
              flexDirection: "column", // only for 320px and below
            },
          }}
          justifyContent="space-between"
          // alignItems="center"
          style={{ marginTop: "auto" }}
        >
          <Box display="flex" gap={3} >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 400,
                color: "#1f2937",
                marginBottom: "8px",
                flexDirection: {
                  xs: "column", // mobile → stacked
                  sm: "row",    // tablet & up → inline
                },
                whiteSpace: {
                  xs: "normal",
                  sm: "nowrap",
                },
                display: "flex",
              }}
            >
              <span style={{ paddingRight: "5px" }}>Budget:</span>
              <span>{job.budget}</span>
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#1f2937",
                fontWeight: 300,
                flexDirection: {
                  xs: "column", // mobile → stacked
                  sm: "row",    // tablet & up → inline
                },
                whiteSpace: {
                  xs: "normal",
                  sm: "nowrap",
                },
                display: "flex",
              }}
            >
              <span style={{ paddingRight: "5px" }}>Duration:</span>
              <span style={{ color: "#64748b" }}>{job.projectDuration}</span>
            </Typography>
          </Box>
          <Typography variant="body2" style={{ color: "#64748b", paddingBottom: "10px" }}>
            {job.postedDate}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Typography variant="h6">Loading dashboard data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Typography variant="h6" color="error">
          Error: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="h4"
        style={{
          fontWeight: 700,
          color: "#1f2937",
          marginBottom: "8px",
        }}
      >
        Dashboard
      </Typography>
      <Typography
        variant="body1"
        style={{
          color: "#64748b",
          marginBottom: "32px",
        }}
      >
        Welcome back! Here's what's happening with your jobs.
      </Typography>

      {/* Stats Cards */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: "24px",
          marginBottom: "32px",
          width: "100%",
          "& > *": {
            width: "100%",
            "@media (min-width: 600px)": {
              width: "calc(50% - 12px)",
            },
            "@media (min-width: 1200px)": {
              width: "calc(25% - 18px)",
            },
          },
        }}
      >
        {dashboardData.stats.map((stat, index) => (
          <Box key={index} sx={{ display: "flex" }}>
            <StatCard stat={stat} />
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 3,
          width: "100%",
          marginBottom: 4,
        }}
      >
        {/* Recent Jobs */}
        <Box
          sx={{
            width: { xs: "100%", lg: "79%" },
            flexShrink: 0,
          }}
        >
          <Paper
            sx={{
              padding: 3,
              borderRadius: 2,
              border: "1px solid #e2e8f0",
              height: "fit-content",
              maxHeight: 500,
              overflowY: "auto",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#1f2937" }}
              >
                Recent Jobs
              </Typography>
              <Button
                variant="outlined"
                size="small"
                sx={{ borderRadius: "8px", textTransform: "none" }}
                onClick={() => navigate("/create-job")}
              >
                View All
              </Button>
            </Box>

            <Box>
              {dashboardData.recentJobs.length > 0 ? (
                dashboardData.recentJobs.map((job) => (
                  <Box key={job.id} mb={2}>
                    <JobCard job={job} />
                  </Box>
                ))
              ) : (
                <Typography
                  variant="body2"
                  sx={{ color: "#64748b", textAlign: "center", mt: 2 }}
                >
                  No recent jobs found.
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Recent Applications */}
        <Box
          sx={{
            width: { xs: "100%", lg: "19%" },
            flexShrink: 0,
          }}
        >
          <Paper
            sx={{
              padding: 3,
              borderRadius: 2,
              border: "1px solid #e2e8f0",
              height: "fit-content",
              maxHeight: 500,
              minHeight: 500, // Ensures fixed height even if no applications
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#1f2937",
                marginBottom: "20px",
              }}
            >
              Recent Applications
            </Typography>

            <Box sx={{ flex: 1, overflowY: "auto" }}>
              {dashboardData.recentApplications &&
                dashboardData.recentApplications.length > 0 ? (
                <List sx={{ padding: 0 }}>
                  {dashboardData.recentApplications.map((application) => (
                    <ListItem
                      key={application.id}
                      sx={{
                        padding: "12px 0",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={application.avatar}
                          alt={application.name}
                          sx={{
                            width: "48px",
                            height: "48px",
                          }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 600,
                              color: "#1f2937",
                            }}
                          >
                            {application.name}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#64748b",
                                fontSize: "13px",
                              }}
                            >
                              {application.domain}
                            </Typography>
                            <Box
                              display="flex"
                              alignItems="center"
                              gap="8px"
                              mt={0.5}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#059669",
                                  fontSize: "12px",
                                  fontWeight: 500,
                                }}
                              >
                                ⭐ {application.rating}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#64748b",
                                  fontSize: "12px",
                                }}
                              >
                                {application.profession}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#9ca3af",
                                fontSize: "11px",
                              }}
                            >
                              {application.appliedDate}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748b", textAlign: "center" }}
                  >
                    No recent applications found.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
