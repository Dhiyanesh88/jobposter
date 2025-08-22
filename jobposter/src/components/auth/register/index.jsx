import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  MenuItem,
  InputAdornment,
  IconButton,
  useMediaQuery,
  useTheme,
  FormControl,
  Autocomplete,
  Chip,
  Collapse,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Work,
  Public,
  Phone,
  Business,
  LocationOn,
  CalendarToday,
  CheckCircle,
  Language,
  CloudUpload,
  ArrowBack,
} from "@mui/icons-material";
import apiEndpoints from "../../../apiconfig";
import { Snackbar, Alert } from "@mui/material";
import { AlignCenter } from "lucide-react";

const authImage =
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80";

const Register = ({ showSnackbar = () => {} }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const registerData = {
    title: "Create Your Account",
    subtitle: "Join our platform today",
    steps: ["Personal Info", "Company Info", "Business Details"],
    industries: [
      "Technology",
      "Healthcare",
      "Finance",
      "Education",
      "Marketing",
      "Construction",
      "Retail",
      "Other",
    ],
    companySizes: [
      "1-10 employees",
      "11-50 employees",
      "51-200 employees",
      "201-500 employees",
      "500+ employees",
    ],
  };

  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loadingDomains, setLoadingDomains] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    gstno: "",
    companyAddress: "",
    state_id: "",
    city_id: "",
    domain: "",
    foundedIn: "",
    website: "",
    profileimg: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const navigate = useNavigate();

  // Styles - Updated for full height and centering
  const containerStyle = {
    minHeight: "100vh",
    height: "100vh", // Full viewport height
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    padding: isMobile ? "16px" : "24px",
    boxSizing: "border-box",
    overflow: "hidden", // Prevent page scroll
  };

  const paperStyle = {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.12)",
    width: "100%",
    maxWidth: 1000,
    height: isMobile ? "calc(100vh - 32px)" : "650px", // Full height on mobile, fixed on desktop
    maxHeight: isMobile ? "none" : "650px",
  };

  const formContainerStyle = {
    width: "100%",
    maxWidth: { xs: "100%", sm: "500px" },
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minHeight: 0, // Important for flex shrinking
  };

  // Fixed header section (non-scrollable)
  const headerSectionStyle = {
    p: isMobile ? 2 : 3,
    pb: 1.5,
    borderBottom: "1px solid #f1f5f9",
    flex: "0 0 auto",
    backgroundColor: "#ffffff",
  };

  // Scrollable content section
  const formContentStyle = {
    flex: "1 1 auto",
    overflowY: "auto",
    p: isMobile ? 2 : 3,
    pt: 1.5,
    minHeight: 0, // Important for proper scrolling
    "&::-webkit-scrollbar": {
      width: "6px",
    },
    "&::-webkit-scrollbar-track": {
      background: "#f8fafc",
      borderRadius: "10px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#cbd5e1",
      borderRadius: "10px",
      "&:hover": {
        background: "#94a3b8",
      },
    },
  };

  // Fixed footer section (non-scrollable)
  const footerSectionStyle = {
    p: isMobile ? 2 : 3,
    pt: 1.5,
    borderTop: "1px solid #f1f5f9",
    flexShrink: 0,
    backgroundColor: "#ffffff",
  };

  const imageContainerStyle = {
    display: isMobile ? "none" : "flex",
    width: "100%",
    minWidth: 500,
    backgroundImage: `url(${authImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    position: "relative",
    height: "100%",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background:
        "linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(79, 70, 229, 0.9) 100%)",
      opacity: 0.8,
    },
  };

  const imageContentStyle = {
    position: "relative",
    zIndex: 1,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    p: 4,
    color: "white",
    textAlign: "center",
  };

  const titleStyle = {
    textAlign: "center",
    mb: 1,
    fontWeight: 700,
    fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
    color: "#1a202c",
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  };

  const subtitleStyle = {
    textAlign: "center",
    mb: 1.5,
    color: "#64748b",
    fontSize: { xs: "0.875rem", sm: "1rem" },
    fontWeight: 400,
    lineHeight: 1.5,
  };

  const textFieldStyle = {
    width: "100%",
    mb: 2, // Increased gap between fields
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      backgroundColor: "#ffffff",
      "& fieldset": {
        borderColor: "#e2e8f0",
      },
      "&:hover fieldset": {
        borderColor: "#000000ff",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#000000ff",
        borderWidth: "2px",
      },
    },
    "& .MuiInputLabel-root": {
      backgroundColor: "#ffffff",
      padding: "0 4px",
      "&.Mui-focused": {
        color: "#000000ff",
      },
    },
    "& .MuiInputBase-input": {
      padding: "14px 16px", // Restored normal padding for better touch targets
    },
  };

  const buttonStyle = {
    padding: isSmallMobile ? "10px 16px" : "12px 24px",
    fontWeight: 600,
    fontSize: isSmallMobile ? "0.875rem" : "1rem",
    borderRadius: "8px",
    textTransform: "none",
    backgroundColor: "#000000ff",
    color: "white",
    transition: "all 0.2s ease",
    width: "100%",
    "&:hover": {
      backgroundColor: "#000000dd",
    },
    "&:disabled": {
      backgroundColor: "#cbd5e1",
    },
  };

  const linkStyle = {
    textDecoration: "none",
    fontWeight: 500,
    color: "#000000ff",
    transition: "all 0.2s ease",
    "&:hover": {
      textDecoration: "underline",
    },
  };

  const footerTextStyle = {
    textAlign: "center",
    color: "#64748b",
    fontSize: isMobile ? "0.8rem" : "0.9rem",
    mt: 1.5,
  };

  const otpSectionStyle = {
    mt: 2,
    p: 2,
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    backgroundColor: "#f8fafc",
  };

  const backButtonStyle = {
    textTransform: "none",
    fontWeight: 600,
    color: "#000000ff",
    fontSize: isMobile ? "0.875rem" : "1rem",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.05)",
    },
    padding: "4px 8px",
    minWidth: "auto",
  };

  const validatePassword = (password) => {
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
  };

  const CustomSnackbar = ({ open, message, severity, onClose }) => {
    return (
      <Snackbar open={open} autoHideDuration={6000} onClose={onClose}>
        <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    );
  };

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        setLoadingDomains(true);
        const response = await fetch(apiEndpoints.domain_dropdown);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to load domains");
        }
        if (data.success) {
          setDomains(data.data);
        } else {
          throw new Error(data.message || "Failed to load domains");
        }
      } catch (error) {
        console.error("Domain fetch error:", error);
        setSnackbar({
          open: true,
          message: error.message || "Failed to load domains",
          severity: "error",
        });
      } finally {
        setLoadingDomains(false);
      }
    };
    fetchDomains();
  }, []);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        setLoadingStates(true);
        const response = await fetch(`${apiEndpoints.locations}?type=states`);
        const data = await response.json();
        if (data.status === "success") {
          const validStates = data.data.filter(
            (state) =>
              state.state_id && state.state_name && state.state_name !== "0"
          );
          setStates(validStates);
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Failed to load states",
          severity: "error",
        });
      } finally {
        setLoadingStates(false);
      }
    };
    fetchStates();
  }, []);

  const fetchCities = async (stateId) => {
    if (!stateId) {
      setCities([]);
      return;
    }
    try {
      setLoadingCities(true);
      const response = await fetch(
        `${apiEndpoints.locations}?type=cities&state_id=${stateId}`
      );
      const data = await response.json();
      if (data.status === "success") {
        setCities(data.data);
      } else {
        throw new Error(data.message || "Failed to load cities");
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      setSnackbar({ open: true, message: error.message, severity: "error" });
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === "domain") {
      const selectedDomain = domains.find(d => 
        d.domain_name === value || String(d.id) === String(value)
      );
      
      setFormData(prev => ({
        ...prev,
        domain: selectedDomain ? selectedDomain.id : value
      }));
      setErrors(prev => ({ ...prev, [name]: "" }));
      return;
    }
    
    if (name === "phone" || name === "companyPhone") {
      if (value && !/^\d*$/.test(value)) return;
      if (value.length > 10) return;
    }
    if (name === "gstno") {
      if (value && !/^[0-9A-Za-z]*$/.test(value)) return;
      if (value.length > 15) return;
    }
    if (name === "profileimg") {
      setFormData({ ...formData, [name]: files[0] });
      if (files && files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFormData((prev) => ({
            ...prev,
            profileimgPreview: event.target.result,
          }));
        };
        reader.readAsDataURL(files[0]);
      }
    } else {
      if (name === "state_id") {
        setFormData((prev) => ({
          ...prev,
          state_id: value,
          city_id: "",
        }));
        
        if (value) {
          await fetchCities(value);
        } else {
          setCities([]);
        }
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = "Username is required";
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, number, special character and be at least 8 characters";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.companyName) {
      newErrors.companyName = "Company name is required";
    }

    if (!formData.companyEmail) {
      newErrors.companyEmail = "Company email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyEmail)) {
      newErrors.companyEmail = "Please enter a valid email";
    }

    if (!formData.companyPhone) {
      newErrors.companyPhone = "Company phone is required";
    } else if (!/^[0-9]{10}$/.test(formData.companyPhone)) {
      newErrors.companyPhone = "Please enter a valid 10-digit phone number";
    }

    if (!formData.gstno) {
      newErrors.gstno = "GST number is required";
    } else if (!/^[0-9A-Za-z]{15}$/.test(formData.gstno)) {
      newErrors.gstno =
        "Please enter a valid 15-character alphanumeric GST number";
    }

    if (!formData.companyAddress) {
      newErrors.companyAddress = "Company address is required";
    }

    if (!formData.state_id) {
      newErrors.state_id = "State is required";
    }

    if (!formData.city_id) {
      newErrors.city_id = "City is required";
    }

    if (!formData.domain) {
      newErrors.domain = "Domain is required";
    }

    if (!formData.foundedIn) {
      newErrors.foundedIn = "Founded year is required";
    } else if (!/^\d{4}$/.test(formData.foundedIn)) {
      newErrors.foundedIn = "Please enter a valid 4-digit year";
    } else if (parseInt(formData.foundedIn) > new Date().getFullYear()) {
      newErrors.foundedIn = "Year cannot be in the future";
    } else if (parseInt(formData.foundedIn) < 1900) {
      newErrors.foundedIn = "Year must be 1900 or later";
    }

    if (!formData.website) {
      newErrors.website = "Website is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    try {
      setIsSubmitting(true);

      const response = await fetch(apiEndpoints.sendotp, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          purpose: "register",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      // Start countdown timer
      setOtpCountdown(60);
      const countdownInterval = setInterval(() => {
        setOtpCountdown((prev) => {
          if (prev <= 1) clearInterval(countdownInterval);
          return prev - 1;
        });
      }, 1000);

      setSnackbar({
        open: true,
        message: data.message || "OTP sent to your email",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to send OTP. Please try again.",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setSnackbar({
        open: true,
        message: "Please enter a valid 6-digit OTP",
        severity: "error",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(apiEndpoints.verifyotp, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registeredEmail,
          otp: otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "OTP verification failed");
      }

      setSnackbar({
        open: true,
        message: "Account verified successfully! You can now login.",
        severity: "success",
      });
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "OTP verification failed",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: "Please fix the errors in the form",
        severity: "error",
      });
      return;
    }

    setIsSubmitting(true);

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === "profileimg" && value instanceof File) {
          formDataToSend.append(key, value);
        } else if (key === "domain") {
          const domainId = typeof value === "string" 
            ? domains.find(d => d.domain_name === value)?.id || value
            : value;
          formDataToSend.append(key, domainId);
        } else if (key !== "profileimgPreview") {
          formDataToSend.append(key, value);
        }
      }
    });

    try {
      // First, call the register endpoint
      const registerResponse = await fetch(apiEndpoints.register, {
        method: "POST",
        body: formDataToSend,
      });
      const registerResult = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerResult.error || "Registration failed");
      }

      if (registerResult.status) {
        // If registration is successful, call the sendotp endpoint
        const otpResponse = await fetch(apiEndpoints.sendotp, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            purpose: "register",
          }),
        });
        const otpResult = await otpResponse.json();

        if (!otpResponse.ok) {
          throw new Error(otpResult.error || "Failed to send OTP");
        }

        // If both calls are successful, show OTP section
        setRegisteredEmail(formData.email);
        setShowOtpSection(true);
        setRegistrationSuccess(true);

        // Start countdown timer
        setOtpCountdown(60);
        const countdownInterval = setInterval(() => {
          setOtpCountdown((prev) => {
            if (prev <= 1) clearInterval(countdownInterval);
            return prev - 1;
          });
        }, 1000);

        setSnackbar({
          open: true,
          message:
            "Registration successful! Please verify your email with the OTP sent to your inbox.",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: registerResult.error || "Registration failed.",
          severity: "error",
        });
        if (registerResult.errors) {
          setErrors(registerResult.errors);
        }
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "An error occurred during registration",
        severity: "error",
      });
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={containerStyle}>
      <Paper elevation={0} sx={paperStyle}>
        {/* Left side - Form content */}
        <Box sx={formContainerStyle}>
          {/* Fixed Header Section */}
          <Box sx={headerSectionStyle}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
              <Button
                startIcon={
                  <ArrowBack sx={{ fontSize: isMobile ? "1rem" : "1.25rem" }} />
                }
                onClick={() => navigate("/login")}
                sx={backButtonStyle}
              >
                Back
              </Button>
            </Box>

            <Typography variant="h3" sx={titleStyle}>
              Create Your Account
            </Typography>

            <Typography variant="body1" sx={subtitleStyle}>
              Join our platform today
            </Typography>
          </Box>

          {/* Scrollable Form Content */}
          <Box sx={formContentStyle}>
            <Collapse in={!showOtpSection}>
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1, // Added gap between form elements
                  pb: 2,
                }}
              >
                <TextField
                  fullWidth
                  name="username"
                  label="Username"
                  value={formData.username}
                  onChange={handleChange}
                  error={!!errors.username}
                  helperText={errors.username}
                  sx={textFieldStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person
                          sx={{
                            color: "#94a3b8",
                            fontSize: isMobile ? 18 : 20,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  name="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  sx={textFieldStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email
                          sx={{
                            color: "#94a3b8",
                            fontSize: isMobile ? 18 : 20,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  name="phone"
                  label="Phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  sx={textFieldStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone
                          sx={{
                            color: "#94a3b8",
                            fontSize: isMobile ? 18 : 20,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{
                    maxLength: 10,
                    pattern: "[0-9]*",
                  }}
                />

                <TextField
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  sx={textFieldStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock
                          sx={{
                            color: "#94a3b8",
                            fontSize: isMobile ? 18 : 20,
                          }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{
                            color: "#94a3b8",
                            "&:hover": { backgroundColor: "transparent" },
                          }}
                        >
                          {showPassword ? (
                            <VisibilityOff
                              fontSize={isMobile ? "small" : "medium"}
                            />
                          ) : (
                            <Visibility
                              fontSize={isMobile ? "small" : "medium"}
                            />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  sx={textFieldStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock
                          sx={{
                            color: "#94a3b8",
                            fontSize: isMobile ? 18 : 20,
                          }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          edge="end"
                          sx={{
                            color: "#94a3b8",
                            "&:hover": { backgroundColor: "transparent" },
                          }}
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff
                              fontSize={isMobile ? "small" : "medium"}
                            />
                          ) : (
                            <Visibility
                              fontSize={isMobile ? "small" : "medium"}
                            />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  name="companyName"
                  label="Company Name"
                  value={formData.companyName}
                  onChange={handleChange}
                  error={!!errors.companyName}
                  helperText={errors.companyName}
                  sx={textFieldStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Business
                          sx={{
                            color: "#94a3b8",
                            fontSize: isMobile ? 18 : 20,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  name="companyEmail"
                  label="Company Email"
                  type="email"
                  value={formData.companyEmail}
                  onChange={handleChange}
                  error={!!errors.companyEmail}
                  helperText={errors.companyEmail}
                  sx={textFieldStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email
                          sx={{
                            color: "#94a3b8",
                            fontSize: isMobile ? 18 : 20,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  name="companyPhone"
                  label="Company Phone"
                  type="tel"
                  value={formData.companyPhone}
                  onChange={handleChange}
                  error={!!errors.companyPhone}
                  helperText={errors.companyPhone}
                  sx={textFieldStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone
                          sx={{
                            color: "#94a3b8",
                            fontSize: isMobile ? 18 : 20,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{
                    maxLength: 10,
                    pattern: "[0-9]*",
                  }}
                />

                <TextField
                  fullWidth
                  name="gstno"
                  label="GST Number"
                  value={formData.gstno}
                  onChange={handleChange}
                  error={!!errors.gstno}
                  helperText={errors.gstno}
                  sx={textFieldStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Work
                          sx={{
                            color: "#94a3b8",
                            fontSize: isMobile ? 18 : 20,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{
                    maxLength: 15,
                    pattern: "[0-9A-Za-z]*",
                  }}
                />

                <TextField
                  fullWidth
                  name="companyAddress"
                  label="Company Address"
                  value={formData.companyAddress}
                  onChange={handleChange}
                  error={!!errors.companyAddress}
                  helperText={errors.companyAddress}
                  sx={textFieldStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn
                          sx={{
                            color: "#94a3b8",
                            fontSize: isMobile ? 18 : 20,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  select
                  fullWidth
                  name="state_id"
                  label="State"
                  value={formData.state_id}
                  onChange={handleChange}
                  error={!!errors.state_id}
                  helperText={errors.state_id}
                  disabled={loadingStates}
                  sx={textFieldStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn
                          sx={{
                            color: "#94a3b8",
                            fontSize: isMobile ? 18 : 20,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="">Select State</MenuItem>
                  {states.map((state) => (
                    <MenuItem key={state.state_id} value={state.state_id}>
                      {state.state_name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  name="city_id"
                  label="City"
                  value={formData.city_id}
                  onChange={handleChange}
                  error={!!errors.city_id}
                  helperText={errors.city_id}
                  disabled={!formData.state_id || loadingCities}
                  sx={textFieldStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn
                          sx={{
                            color: "#94a3b8",
                            fontSize: isMobile ? 18 : 20,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  SelectProps={{
                    MenuProps: {
                      disablePortal: true,
                      PaperProps: {
                        sx: {
                          maxHeight: 200,
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="">Select City</MenuItem>
                  {cities.map((city) => (
                    <MenuItem key={city.city_id} value={city.city_id}>
                      {city.city_name}
                    </MenuItem>
                  ))}
                </TextField>

                <FormControl fullWidth error={!!errors.domain} sx={{ mb: 2 }}>
                  <Autocomplete
                    freeSolo
                    options={domains}
                    getOptionLabel={(option) => option.domain_name}
                    value={
                      domains.find((d) => d.id === formData.domain) ||
                      formData.domain
                    }
                    onChange={(event, newValue) => {
                      const value = newValue?.id || newValue;
                      handleChange({ target: { name: "domain", value } });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Domain"
                        error={!!errors.domain}
                        helperText={errors.domain}
                        sx={{
                          ...textFieldStyle,
                          mb: 0,
                          "& .MuiOutlinedInput-root": {
                            paddingLeft: "40px",
                          },
                        }}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment
                                position="start"
                                sx={{ position: "absolute", left: 10 }}
                              >
                                <Public
                                  sx={{
                                    color: "#94a3b8",
                                    fontSize: isMobile ? 18 : 20,
                                  }}
                                />
                              </InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </FormControl>

                <TextField
                  fullWidth
                  name="foundedIn"
                  label="Founded In"
                  value={formData.foundedIn}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      handleChange(e);
                    }
                  }}
                  error={!!errors.foundedIn}
                  helperText={errors.foundedIn}
                  sx={textFieldStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday
                          sx={{
                            color: "#94a3b8",
                            fontSize: isMobile ? 18 : 20,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  name="website"
                  label="Website"
                  value={formData.website}
                  onChange={handleChange}
                  error={!!errors.website}
                  helperText={errors.website}
                  sx={textFieldStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Language
                          sx={{
                            color: "#94a3b8",
                            fontSize: isMobile ? 18 : 20,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ mb: 2 }}>
                  {formData.profileimgPreview && (
                    <img
                      src={formData.profileimgPreview}
                      alt="Profile preview"
                      style={{
                        maxWidth: "100px",
                        maxHeight: "100px",
                        marginBottom: "8px",
                        borderRadius: 8,
                        display: "block",
                      }}
                    />
                  )}
                  <Button
                    variant="contained"
                    component="label"
                    sx={{
                      background: "#000000ff",
                      textTransform: "none",
                      padding: "10px 16px",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      borderRadius: "8px",
                      width: "100%",
                    }}
                    startIcon={<CloudUpload sx={{ fontSize: 18 }} />}
                  >
                    Upload Profile Image
                    <input
                      type="file"
                      name="profileimg"
                      accept="image/*"
                      onChange={handleChange}
                      hidden
                    />
                  </Button>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                  sx={buttonStyle}
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>
              </Box>
            </Collapse>

            {/* OTP Verification Section */}
            <Collapse in={showOtpSection}>
              <Box sx={otpSectionStyle}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Verify Your Email
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  We've sent a 6-digit verification code to {registeredEmail}.
                  Please enter it below:
                </Typography>

                <TextField
                  fullWidth
                  label="OTP Code"
                  variant="outlined"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  inputProps={{ maxLength: 6 }}
                  sx={{ mb: 2 }}
                />

                <Button
                  onClick={handleSendOtp}
                  disabled={otpCountdown > 0}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    color: otpCountdown > 0 ? "#64748b" : "#000000ff",
                    mb: 2,
                  }}
                >
                  {otpCountdown > 0
                    ? `Resend in ${otpCountdown}s`
                    : "Resend OTP"}
                </Button>

                <Button
                  onClick={handleVerifyOtp}
                  disabled={!otp || otp.length !== 6 || isSubmitting}
                  variant="contained"
                  fullWidth
                  sx={buttonStyle}
                >
                  {isSubmitting ? "Verifying..." : "Verify OTP"}
                </Button>
              </Box>
            </Collapse>
          </Box>

          {/* Fixed Footer Section */}
          <Box sx={footerSectionStyle}>
            <Typography
              variant="body2"
              sx={{
                textAlign: "center",
                color: "#64748b",
                fontSize: isMobile ? "0.875rem" : "1rem",
                mb: 0.5,
              }}
            >
              Already have an account?{" "}
              <Link
                component="button"
                type="button"
                to={"/login"}
                sx={linkStyle}
              >
                Sign In
              </Link>
            </Typography>

            <Typography variant="body2" sx={footerTextStyle}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </Box>
        </Box>

        {/* Right side - Image */}
        <Box sx={imageContainerStyle}>
          <Box sx={imageContentStyle}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: "2rem",
                lineHeight: 1.2,
              }}
            >
              Build Your Business
            </Typography>
            <Typography
              variant="body1"
              sx={{
                opacity: 0.9,
                fontSize: "1.125rem",
                maxWidth: "80%",
                lineHeight: 1.5,
              }}
            >
              Join our platform to connect with clients and grow your
              professional network.
            </Typography>
          </Box>
        </Box>
      </Paper>

      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
};

export default Register;