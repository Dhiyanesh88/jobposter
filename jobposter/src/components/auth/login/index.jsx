import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
  CircularProgress,
  Collapse,
  Alert,
  Snackbar,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import apiEndpoints from "../../../apiconfig";

const authImage =
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80";

const Login = ({ setIsAuthenticated = () => {}, showSnackbar = () => {} }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // OTP Verification State
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [registeredEmail, setRegisteredEmail] = useState("");
    const [token, setToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "visible";
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.identifier) {
      newErrors.identifier = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.identifier)) {
      newErrors.identifier = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch(apiEndpoints.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: formData.identifier,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.success) {
        setToken(data.token);
        if (data.isverified === 1) {
        
          sessionStorage.setItem("token", data.token);
          setIsAuthenticated(true);
          showSnackbar("Login successful", "success");
          navigate("/dashboard");
        } else {
          try {
            const response = await fetch(apiEndpoints.sendotp, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: formData.identifier,
                purpose: "login",
              }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || "Failed to resend OTP");
            }

            // Reset countdown
            setOtpCountdown(60);
            const countdownInterval = setInterval(() => {
              setOtpCountdown((prev) => {
                if (prev <= 1) clearInterval(countdownInterval);
                return prev - 1;
              });
            }, 1000);

            setSnackbar({
              open: true,
              message: "OTP resent successfully",
              severity: "success",
            });
          } catch (error) {
            setSnackbar({
              open: true,
              message: error.message || "Failed to resend OTP",
              severity: "error",
            });
          }

          // User needs verification
          setRegisteredEmail(formData.identifier);
          setShowOtpSection(true);

          // Start OTP countdown timer
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
              "Please verify your account with the OTP sent to your email",
            severity: "info",
          });
        }
      } else {
        showSnackbar(data.error || "Login failed", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showSnackbar(error.message || "An error occurred during login", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await fetch(apiEndpoints.sendotp, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.identifier,
          purpose: "login",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend OTP");
      }

      // Reset countdown
      setOtpCountdown(60);
      const countdownInterval = setInterval(() => {
        setOtpCountdown((prev) => {
          if (prev <= 1) clearInterval(countdownInterval);
          return prev - 1;
        });
      }, 1000);

      setSnackbar({
        open: true,
        message: "OTP resent successfully",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to resend OTP",
        severity: "error",
      });
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

    setIsVerifying(true);

    try {
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

      // If verification successful, proceed with login
      sessionStorage.setItem("token", token);
      setIsAuthenticated(true);
      showSnackbar("Account verified successfully!", "success");
      navigate("/dashboard");
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "OTP verification failed",
        severity: "error",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  // Styles
  const containerStyle = {
    padding: "0px !important",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    py: isMobile ? 2 : { xs: 4, md: 8 },
    px: isMobile ? 1.5 : { xs: 2, md: 4 },
  };

  const paperStyle = {
    display: "flex",
    borderRadius: 3,
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    width: "100%",
    height:"650px",
    maxWidth: 1000,
  };

const formContainerStyle = {
  padding: { xs: "20px", sm: "24px", md: "40px" },
  width: "100%",
  maxWidth: {
    xs: "90%",   // Mobile
    sm: "400px", // Tablet
    md: "420px", // Small laptop
    lg: "450px"  // Large screens
  },
  backgroundColor: "#ffffff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  mx: "auto",
};



  const imageContainerStyle = {
    display: isMobile ? "none" : "block",
    width: "100%",
    minWidth: 500,
    backgroundImage: `url(${authImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
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
};

const subtitleStyle = {
  textAlign: "center",
  mb: { xs: 2, sm: 3, md: 4 },
  color: "#64748b",
  fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
  fontWeight: 400,
  lineHeight: 1.5,
  px: 1, // Small horizontal padding to avoid text touching edges
};


const textFieldStyle = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    transition: "all 0.2s ease",
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000000ff",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000000ff",
      // boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.2)",
    },
  },
  "& .MuiInputLabel-root": {
    // color: "#64748b",
    fontSize: { xs: "0.875rem", sm: "0.9rem", md: "1rem" },
    "&.Mui-focused": { color: "#000000ff" },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#e2e8f0",
  },
  "& .MuiInputBase-input": {
    fontSize: { xs: "0.875rem", sm: "0.9rem", md: "1rem" },
    padding: { xs: "10px 12px", sm: "11px 13px", md: "12px 14px" },
  },
};


const buttonStyle = {
  py: { xs: 0.8, sm: 1 },
  px: { xs: 4, sm: 6 },
  fontWeight: 600,
  fontSize: { xs: "1rem", sm: "1.05rem" },
  borderRadius: 2,
  textTransform: "none",
  backgroundColor: "#000000ff",
  color: "white",
  transition: "all 0.2s ease",
  width: "100%",
  "&:disabled": { backgroundColor: "#cbd5e1" },
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

  const dividerStyle = {
    width: "100%",
    color: "#e2e8f0",
    my: 2,
    "&::before, &::after": {
      borderColor: "#e2e8f0",
    },
  };

  const footerTextStyle = {
    textAlign: "center",
    color: "#64748b",
    fontSize: isMobile ? "0.8rem" : "0.9rem",
    mt: 3,
  };

  const otpSectionStyle = {
    mt: 2,
    p: 2,
    border: "1px solid #e2e8f0",
    borderRadius: 2,
    backgroundColor: "#f8fafc",
  };

  return (
    <Box sx={containerStyle}>
      <Paper elevation={0} sx={paperStyle}>
        {/* Left side - Form content */}
        <Box sx={formContainerStyle}>
          <Typography variant="h3" sx={titleStyle}>
            Welcome Back
          </Typography>

          <Typography variant="body1" sx={subtitleStyle}>
            Sign in to your account to continue
          </Typography>

          <Collapse in={!showOtpSection}>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                width: "100%",
              }}
            >
              <TextField
                fullWidth
                label="Email Address"
                name="identifier"
                type="email"
                value={formData.identifier}
                onChange={handleChange}
                error={!!errors.identifier}
                helperText={errors.identifier}
                margin="normal"
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email
                        sx={{ color: "#94a3b8", fontSize: isMobile ? 20 : 22 }}
                      />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                margin="normal"
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock
                        sx={{ color: "#94a3b8", fontSize: isMobile ? 20 : 22 }}
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
                          "&:hover": {
                            backgroundColor: "transparent",
                          },
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

            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: { xs: "center", sm: "center" }, // center in mobile, right in larger
                mb: 1,
                px: { xs: 1, sm: 1 }, // small padding for mobile so it doesn't cut off
              }}
            >
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => navigate("/forgot-password")}
                sx={{
                  ...linkStyle,
                  fontSize: { xs: "0.85rem", sm: "0.9rem" }, // slightly smaller on mobile
                  whiteSpace: "nowrap", // prevent text breaking
                }}
              >
                Forgot Password?
              </Link>
            </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={buttonStyle}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Sign In"
                )}
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
                onClick={handleResendOtp}
                disabled={otpCountdown > 0}
                sx={{
                  textTransform: "none",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: otpCountdown > 0 ? "#64748b" : "#000000ff",
                  mb: 2,
                }}
              >
                {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : "Resend OTP"}
              </Button>

              <Button
                onClick={handleVerifyOtp}
                disabled={!otp || otp.length !== 6 || isVerifying}
                variant="contained"
                fullWidth
                sx={buttonStyle}
              >
                {isVerifying ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Verify OTP"
                )}
              </Button>
            </Box>
          </Collapse>

          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              color: "#64748b",
              mt: 2,
              fontSize: isMobile ? "0.9rem" : "1rem",
            }}
          >
            Don't have an account?{" "}
            <Link
              component="button"
              type="button"
              onClick={() => navigate("/register")}
              sx={linkStyle}
            >
              Sign Up
            </Link>
          </Typography>

          <Typography variant="body2" sx={footerTextStyle}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Typography>
        </Box>

        {/* Right side - Image */}
        <Box sx={imageContainerStyle}>
          <Box sx={imageContentStyle}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Effortless AI Solutions
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Transform the way your business operates with seamless AI
              integration—designed to automate workflows and accelerate
              decision-making.
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;
