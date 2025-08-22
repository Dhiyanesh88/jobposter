import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Work,
  People,
  CurrencyRupee,
  Visibility,
} from "@mui/icons-material";
import apiEndpoints from "../../apiconfig";

const Analysis = () => {
  const [timeRange, setTimeRange] = useState("30days");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const timeRangeOptions = [
    { value: "7days", label: "Last 7 days" },
    { value: "30days", label: "Last 30 days" },
    { value: "90days", label: "Last 3 months" },
    { value: "180days", label: "Last 6 months" },
    { value: "1year", label: "Last year" },
  ];

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        const response = await fetch(`${apiEndpoints.analysis}?timeRange=${timeRange}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || "Error fetching data");
        }

        setAnalyticsData(data.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  const processStatsData = () => {
    if (!analyticsData) return [];

    return [
      {
        title: "Total Jobs Posted",
        value: analyticsData.total_jobs_posted.toLocaleString(),
        change: "+0%", // You can calculate this based on previous period
        trend: "up",
        icon: <Work />,
        color: "#2563eb",
      },
      {
        title: "Total Applications",
        value: analyticsData.total_applications.toLocaleString(),
        change: "+0%",
        trend: "up",
        icon: <People />,
        color: "#059669",
      },
      {
        title: "Total Spent",
        value: `₹${analyticsData.total_spent.toLocaleString()}`,
        change: "+0%",
        trend: "up",
        icon: <CurrencyRupee />,
        color: "#dc2626",
      },
      {
        title: "Active Users",
        value: analyticsData.total_Activity_User.toLocaleString(),
        change: "+0%",
        trend: "up",
        icon: <Visibility />,
        color: "#7c3aed",
      },
    ];
  };

  const processJobsOverTimeData = () => {
    if (!analyticsData?.jobs_applications) return [];

    return analyticsData.jobs_applications.map(item => ({
      month: item.month.split('-')[1], // Just show month part
      jobs: item.jobs_posted,
      applications: item.applications_received,
    }));
  };

  const processCategoryData = () => {
    if (!Array.isArray(analyticsData?.job_categories)) return [];

    const colors = ["#2563eb", "#059669", "#dc2626", "#7c3aed", "#f59e0b"];

    return analyticsData.job_categories
      .filter(category => category?.count > 0) // Filter out empty categories
      .map((category, index) => ({
        name: category?.category || "Unknown",
        value: Number(category?.count) || 0, // Ensure value is a number
        color: colors[index % colors.length],
      }));
  };

const processTopJobsData = () => {
  if (!analyticsData?.top_jobs) return [];

  return analyticsData.top_jobs.map(job => {
    // Determine status - prioritize the explicit Status field if available
    const status = job.Status || (job.isActive === "1" ? "Active" : "Closed");

    return {
      id: Math.random().toString(36).substr(2, 9), // Generate random ID
      title: job["Job Title"] || "Untitled Job",
      applications: parseInt(job.Applications) || 0, // Convert string to number
      views: 0, // Not available in your API
      budget: job.Budget ? `₹${parseFloat(job.Budget).toFixed(2)}` : "₹0.00", // Format as Indian Rupees
      status: status, // Use the determined status
      conversionRate: "0%", // You can calculate this if you have views data
      isActive: job.isActive === "1" // Boolean flag for easy filtering
    };
  });
};

  const StatCard = ({ stat }) => (
    <Card
      style={{
        height: "100%",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        transition: "all 0.3s ease",
        
      }}
    >
      <CardContent style={{ padding: "24px" }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: `${stat.color}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: stat.color,
            }}
          >
            {stat.icon}
          </div>
          <Box display="flex" alignItems="center" gap="4px">
            {stat.trend === "up" ? (
              <TrendingUp style={{ color: "#059669", fontSize: "16px" }} />
            ) : (
              <TrendingDown style={{ color: "#dc2626", fontSize: "16px" }} />
            )}
            <Typography
              variant="body2"
              style={{
                color: stat.trend === "up" ? "#059669" : "#dc2626",
                fontWeight: 600,
                fontSize: "12px",
              }}
            >
              {stat.change}
            </Typography>
          </Box>
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "white",
            padding: "12px",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, color: "#1f2937" }}>
            {label}
          </p>
          {payload.map((entry, index) => (
            <p
              key={index}
              style={{
                margin: "4px 0 0 0",
                color: entry.color,
                fontSize: "14px",
              }}
            >
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!analyticsData) {
    return null;
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography
            variant="h4"
            style={{
              fontWeight: 700,
              color: "#1f2937",
              marginBottom: "8px",
            }}
          >
            Analytics
          </Typography>
          <Typography
            variant="body1"
            style={{
              color: "#64748b",
            }}
          >
            Track your job posting performance and insights
          </Typography>
        </Box>

        <TextField
          select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          size="small"
          style={{ minWidth: "150px" }}
        >
          {timeRangeOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 3,
          width: "100%",
          marginBottom: "32px",
        }}
      >
        {processStatsData().map((stat, index) => (
          <Box
            key={index}
            sx={{
              width: "100%",
              "@media (min-width: 768px)": {
                width: "48%",
              },
              "@media (min-width: 1025px)": {
                width: "23%",
              },
            }}
          >
            <StatCard stat={stat} />
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "24px",
          width: "100%",
          marginBottom: "24px",
        }}
      >
        {/* Jobs & Applications Over Time */}
        <Box
          sx={{
            width: "100%",
            "@media (min-width: 768px)": {
              width: "100%",
            },
            "@media (min-width: 1024px)": {
              width: "48%",
            },
          }}
        >
          <Paper
            style={{
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              marginBottom: "24px",
              minHeight: "500px",
            }}
          >
            <Typography
              variant="h6"
              style={{
                fontWeight: 600,
                color: "#1f2937",
                marginBottom: "20px",
              }}
            >
              Jobs & Applications Over Time
            </Typography>
            {processJobsOverTimeData().length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={processJobsOverTimeData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    stackId="1"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.6}
                    name="Applications"
                  />
                  <Area
                    type="monotone"
                    dataKey="jobs"
                    stackId="2"
                    stroke="#059669"
                    fill="#059669"
                    fillOpacity={0.6}
                    name="Jobs Posted"
                  />
                </AreaChart>
              </ResponsiveContainer>) : (<Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height={400}
                style={{ color: "#64748b" }}
              >
                <Typography variant="body1">No data available for the selected time period</Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Job Categories Pie Chart */}
        <Box
          sx={{
            width: "100%",
            "@media (min-width: 768px)": {
              width: "100%",
            },
            "@media (min-width: 1024px)": {
              width: "48%",
            },
          }}
        >
          <Paper
            style={{
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              marginBottom: "24px",
              minHeight: "500px",
            }}
          >
            <Typography
              variant="h6"
              style={{
                fontWeight: 600,
                color: "#1f2937",
                marginBottom: "20px",
              }}
            >
              Job Categories
            </Typography>
            {processCategoryData().length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={processCategoryData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {processCategoryData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <Box mt={2}>
                  {processCategoryData().map((category, index) => (
                    <Box
                      key={index}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      mb={1}
                    >
                      <Box display="flex" alignItems="center" gap="8px">
                        <div
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            backgroundColor: category.color,
                          }}
                        />
                        <Typography
                          variant="body2"
                          style={{ color: "#64748b", fontSize: "13px" }}
                        >
                          {category.name}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        style={{
                          fontWeight: 600,
                          color: "#1f2937",
                          fontSize: "13px",
                        }}
                      >
                        {category.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>) : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height={250}
                style={{ color: "#64748b" }}
              >
                <Typography variant="body1">No category data available</Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "24px",
          width: "100%",
          marginBottom: "24px",
        }}
      >
        {/* Weekly Application Trends */}
        {/* <Box
          sx={{
            width: "100%", // default mobile
            "@media (min-width: 768px)": {
              width: "48%", // tablet and up
            },
          }}
        >
          <Paper
            style={{
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
            }}
          >
            <Typography
              variant="h6"
              style={{
                fontWeight: 600,
                color: "#1f2937",
                marginBottom: "20px",
              }}
            >
              Weekly Application Trends
            </Typography>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={analyticsData.applicationTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="applications"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                  name="Applications"
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Box> */}

        {/* Budget Distribution */}
        {/* <Box
          sx={{
            width: "100%", // default mobile
            "@media (min-width: 768px)": {
              width: "48%", // tablet and up
            },
          }}
        >
          <Paper
            style={{
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
            }}
          >
            <Typography
              variant="h6"
              style={{
                fontWeight: 600,
                color: "#1f2937",
                marginBottom: "20px",
              }}
            >
              Budget Distribution
            </Typography>
            <Box>
              {analyticsData.budgetAnalysis.map((budget, index) => (
                <Box key={index} mb={2}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography variant="body2" style={{ color: "#64748b" }}>
                      {budget.range}
                    </Typography>
                    <Typography
                      variant="body2"
                      style={{ fontWeight: 600, color: "#1f2937" }}
                    >
                      {budget.count} jobs ({budget.percentage}%)
                    </Typography>
                  </Box>
                  <Box
                    style={{
                      width: "100%",
                      height: "8px",
                      backgroundColor: "#f1f5f9",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${budget.percentage}%`,
                        height: "100%",
                        backgroundColor: "#2563eb",
                        borderRadius: "4px",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box> */}
      </Box>


      {/* Top Performing Jobs */}
      <Box
        sx={{
          width: "100%",
          marginBottom: "24px",
        }}
      >
        <Paper
          style={{
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
          }}
        >
          <Typography
            variant="h6"
            style={{
              fontWeight: 600,
              color: "#1f2937",
              marginBottom: "20px",
            }}
          >
            Top Performing Jobs
          </Typography>
          <TableContainer>
            
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ fontWeight: 600, color: "#374151" }}>
                    Job Title
                  </TableCell>
                  <TableCell style={{ fontWeight: 600, color: "#374151" }}>
                    Applications
                  </TableCell>
                  <TableCell style={{ fontWeight: 600, color: "#374151" }}>
                    Budget
                  </TableCell>
                  <TableCell style={{ fontWeight: 600, color: "#374151" }}>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {processTopJobsData().map((job) => (
                  <TableRow
                    key={job.id}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f9fafb",
                      },
                    }}
                  >
                    <TableCell>
                      <Typography
                        variant="subtitle2"
                        style={{ fontWeight: 600, color: "#1f2937" }}
                      >
                        {job.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" style={{ color: "#64748b" }}>
                        {job.applications}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" style={{ color: "#64748b" }}>
                        {job.budget}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={job.isActive ? "Active" : "Closed"}
                        size="small"
                        style={{
                          backgroundColor:
                            job.isActive ? "#ecfdf5" : "#fee2e2",
                          color:
                            job.isActive ? "#059669" : "#dc2626",
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
};

export default Analysis;