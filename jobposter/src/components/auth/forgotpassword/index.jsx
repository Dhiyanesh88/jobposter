import React, { useState } from "react";
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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Email,
  ArrowBack,
  VpnKey,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import apiEndpoints from "../../../apiconfig";
// import CustomSnackbar from '../../common/snackbar';

const authImage =
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80";

const ForgotPassword = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const navigate = useNavigate();

  const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    return otp;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "email":
        setEmail(value);
        break;
      case "otp":
        if (/^\d*$/.test(value) && value.length <= 6) {
          setOtp(value);
        }
        break;
      case "newPassword":
        setNewPassword(value);
        break;
      case "confirmPassword":
        setConfirmPassword(value);
        break;
      default:
        break;
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateEmail = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtp = () => {
    const newErrors = {};

    if (!otp) {
      newErrors.otp = "OTP is required";
    } else if (otp.length !== 6) {
      newErrors.otp = "OTP must be 6 digits";
    } 

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        newPassword
      )
    ) {
      newErrors.newPassword =
        "Password must contain uppercase, lowercase, number, special character and be at least 8 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (validateEmail()) {
      const otp = generateOtp(); // Save to state
      console.log("Generated OTP:", otp);

      try {
        const response = await fetch(apiEndpoints.sendotp, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp, purpose: "forgot_password" }), // Send both email and OTP to PHP
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to send OTP");
        }

        setSnackbar({
          open: true,
          message: data.message || `OTP sent to ${email}`,
          severity: "success",
        });
        setStep(2);
      } catch (err) {
        setSnackbar({
          open: true,
          message: err.message || "Error sending OTP",
          severity: "error",
        });
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (validateOtp()) {
      setIsLoading(true);

      try {
        const response = await fetch(apiEndpoints.verifyotp, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            otp: otp,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to verify OTP");
        }

        setSnackbar({
          open: true,
          message: data.message || "OTP verified successfully!",
          severity: "success",
        });
        setStep(3);
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.message || "Failed to verify OTP",
          severity: "error",
        });
        // Clear OTP field on error
        setOtp("");
      } finally {
        setIsLoading(false);
      }
    }
  };
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (validatePassword()) {
      setIsLoading(true);

      try {
        const response = await fetch(apiEndpoints.forgotpassword, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            newPassword: newPassword,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to reset password");
        }

        setSnackbar({
          open: true,
          message: data.message || "Password reset successfully!",
          severity: "success",
        });
        setTimeout(() => navigate("/login"), 2000);
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.message || "Failed to reset password",
          severity: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Styles matching the register page
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
    maxWidth: 1000,
    height: isMobile ? "auto" : "600px",
  };

  const formContainerStyle = {
    p: isMobile ? 3 : { xs: 4, md: 6 },
    width: "100%",
    maxWidth: 500,
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  };

  const imageContainerStyle = {
    display: isMobile ? "none" : "block",
    width: "100%",
    maxWidth: 500,
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
    fontSize: isMobile ? "1.75rem" : "2rem",
    color: "#1a202c",
    letterSpacing: "-0.02em",
  };

  const subtitleStyle = {
    textAlign: "center",
    mb: isMobile ? 3 : 4,
    color: "#64748b",
    fontSize: isMobile ? "0.9rem" : "1rem",
    fontWeight: 400,
    lineHeight: 1.6,
  };

  const textFieldStyle = {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      backgroundColor: "#ffffff",
      border: "1px solid #e2e8f0",
      transition: "all 0.2s ease",
      "&:hover": {
        borderColor: "#000000ff",
      },
      "&.Mui-focused": {
        borderColor: "#000000ff",
        boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.2)",
      },
    },
    "& .MuiInputLabel-root": {
      color: "#64748b",
      fontSize: isMobile ? "0.9rem" : "1rem",
      "&.Mui-focused": {
        color: "#000000ff",
      },
    },
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none",
    },
    "& .MuiInputBase-input": {
      fontSize: isMobile ? "0.9rem" : "1rem",
      padding: isMobile ? "12px 14px" : "14px 16px",
    },
  };

  const buttonStyle = {
    py: isMobile ? 0.8 : 1,
    px: isMobile ? 8 : 15,
    fontWeight: 600,
    fontSize: isMobile ? "1rem" : "1.05rem",
    borderRadius: 2,
    textTransform: "none",
    backgroundColor: "#000000ff",
    color: "white",
    transition: "all 0.2s ease",
    width: "100%",
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

  const backButtonStyle = {
    color: "#000000ff",
    textTransform: "none",
    fontWeight: 500,
    mb: 2,
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04)",
    },
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Forgot Password?";
      case 2:
        return "Verify OTP";
      case 3:
        return "Reset Password";
      default:
        return "Forgot Password?";
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 1:
        return "Enter your email address and we'll send you an OTP to reset your password.";
      case 2:
        return `We've sent a 6-digit code to ${email}`;
      case 3:
        return `Create a new password for ${email}`;
      default:
        return "";
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: // Email step
        return (
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
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
        );

      case 2: // OTP verification step
        return (
          <>
            <TextField
              fullWidth
              label="Enter OTP"
              name="otp"
              type="text"
              value={otp}
              onChange={handleChange}
              error={!!errors.otp}
              helperText={errors.otp}
              margin="normal"
              inputProps={{ maxLength: 6, inputMode: "numeric" }}
              sx={textFieldStyle}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKey
                      sx={{ color: "#94a3b8", fontSize: isMobile ? 20 : 22 }}
                    />
                  </InputAdornment>
                ),
              }}
            />

            <Typography
              variant="body2"
              sx={{
                textAlign: "center",
                color: "#64748b",
                mt: 2,
                fontSize: isMobile ? "0.9rem" : "1rem",
              }}
            >
              Didn't receive code?{" "}
              <Link
                component="button"
                type="button"
                onClick={() => {
                  const newOtp = generateOtp();
                  console.log("Resending OTP to:", email);
                  console.log("New OTP:", newOtp);
                  setSnackbar({
                    open: true,
                    message: `OTP resent! New OTP is: ${newOtp}`,
                    severity: "success",
                  });
                }}
                sx={linkStyle}
              >
                Resend
              </Link>
            </Typography>
          </>
        );

      case 3: // New password step
        return (
          <>
            <TextField
              fullWidth
              label="New Password"
              name="newPassword"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={handleChange}
              error={!!errors.newPassword}
              helperText={errors.newPassword}
              margin="normal"
              sx={textFieldStyle}
              InputProps={{
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
                        <Visibility fontSize={isMobile ? "small" : "medium"} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              margin="normal"
              sx={textFieldStyle}
              InputProps={{
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
                        <Visibility fontSize={isMobile ? "small" : "medium"} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={containerStyle}>
      <Paper elevation={0} sx={paperStyle}>
        {/* Left side - Form content */}
        <Box sx={formContainerStyle}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() =>
              step === 1 ? navigate("/login") : setStep(step - 1)
            }
            sx={backButtonStyle}
          >
            Back
          </Button>

          <Typography variant="h3" sx={titleStyle}>
            {getStepTitle()}
          </Typography>

          <Typography variant="body1" sx={subtitleStyle}>
            {getStepSubtitle()}
          </Typography>

          <Box
            component="form"
            onSubmit={
              step === 1
                ? handleSendOtp
                : step === 2
                ? handleVerifyOtp
                : handleResetPassword
            }
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: "100%",
              flex: "1 1 auto",
              justifyContent: "center",
            }}
          >
            {renderStep()}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                ...buttonStyle,
                mt: 3,
              }}
            >
              {step === 1 && "Send OTP"}
              {step === 2 && "Verify OTP"}
              {step === 3 && (isLoading ? "Processing..." : "Reset Password")}
            </Button>
          </Box>

          {step === 1 && (
            <Typography
              variant="body2"
              sx={{
                textAlign: "center",
                color: "#64748b",
                mt: 3,
                fontSize: isMobile ? "0.9rem" : "1rem",
              }}
            >
              Remember your password?{" "}
              <Link
                component="button"
                type="button"
                onClick={() => navigate("/login")}
                sx={linkStyle}
              >
                Sign In
              </Link>
            </Typography>
          )}
        </Box>

        {/* Right side - Image */}
        <Box sx={imageContainerStyle}>
          <Box sx={imageContentStyle}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Secure Password Reset
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              We'll help you regain access to your account quickly and securely.
              Your data protection is our priority.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Uncomment when CustomSnackbar component is available */}
      {/* <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      /> */}
    </Box>
  );
};

export default ForgotPassword;
