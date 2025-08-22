import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  MenuItem,
  Chip,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Switch,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  CircularProgress,
  LinearProgress,
  Avatar,
  Fab,
} from "@mui/material";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import CategoryIcon from "@mui/icons-material/Category";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BuildIcon from "@mui/icons-material/Build";
import {
  Save,
  Publish,
  Edit,
  Delete,
  Visibility,
  Add,
  Work,
  People,
  AttachMoney,
  Schedule,
  Close,
  Drafts,
} from "@mui/icons-material";
import apiEndpoints from "../../apiconfig";
import { useNavigate } from "react-router-dom";

const CreateEditJob = ({ showSnackbar }) => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [skillsList, setSkillsList] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [skillsError, setSkillsError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingJob, setViewingJob] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const navigate = useNavigate();

  // Hardcoded data
  const jobData = {
    categories: [
      { id: "1", name: "Web Development" },
      { id: "2", name: "Mobile Development" },
      { id: "3", name: "ui/ux Design" },
      { id: "4", name: "Data Science" },
      { id: "5", name: "Content Writing" },
      { id: "6", name: "Digital Marketing" },
      { id: "7", name: "Graphic Design" },
      { id: "8", name: " Software Development" },
    ],
    experienceLevels: [
      { id: "1", name: "Beginner" }, // Removed extra spaces
      { id: "2", name: "Intermediate" },
      { id: "3", name: "Expert" },
    ],
    projectTypes: ["Fixed Price", "Hourly Rate"],
  };

  // Helper functions
  const getCategoryName = (id) => {
    const category = jobData.categories.find((c) => c.id === id);
    return category ? category.name : "Unknown";
  };

  const getPublishedStatus = (status) => {
    return status === true || status === "1" || status === 1;
  };

  const getExperienceName = (id) => {
    console.log("Looking up experience ID:", id, "Type:", typeof id);
    console.log("Available experience levels:", jobData.experienceLevels);

    if (!id) return "Unknown";

    const idStr = String(id).trim();
    const exp = jobData.experienceLevels.find((e) => {
      console.log("Comparing:", String(e.id).trim(), "with", idStr);
      return String(e.id).trim() === idStr;
    });

    const result = exp ? exp.name : "Unknown";
    console.log("Result:", result);
    return result;
  };
  console.log("jobData", jobData);
  const getSkillNames = (skillIds) => {
    if (!skillIds) return [];

    try {
      // Handle string (JSON), array, or already parsed array
      let ids = [];
      if (typeof skillIds === "string") {
        // Remove any escaping if present
        const cleanString = skillIds.replace(/\\/g, "");
        ids = JSON.parse(cleanString);
      } else if (Array.isArray(skillIds)) {
        ids = skillIds;
      }

      // Ensure we have an array of numbers (not strings)
      ids = ids.map((id) => Number(id));

      return ids.map((id) => {
        const skill = skillsList.find((s) => Number(s.id) === id);
        return skill ? skill.skill_name : "Unknown";
      });
    } catch (e) {
      console.error("Error parsing skill IDs:", e);
      return [];
    }
  };

  const [formData, setFormData] = useState({
    jobTitle: "",
    jobDescription: "",
    domain_id: "",
    experience_id: "",
    projectType: "",
    budget: "",
    projectDuration: "",
    durationValue: 1,
    durationUnit: "months",
    skill_id: [],
    additionalInformations: "",
    isPublished: false,
  });

  const [errors, setErrors] = useState({});

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await fetch(apiEndpoints.jobcrud, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();
      setJobs(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      showSnackbar("Failed to load jobs", "error");
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const fetchSkills = async () => {
      try {
        setLoadingSkills(true);
        const response = await fetch(apiEndpoints.skilldropdown, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch skills");
        }

        const data = await response.json();
        setSkillsList(data);
        setLoadingSkills(false);
      } catch (error) {
        console.error("Error fetching skills:", error);
        setSkillsError(error.message);
        setLoadingSkills(false);
      }
    };

    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetch(apiEndpoints.domain_dropdown, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();
        setCategories(data.data || data); // Adjust based on your API response structure
        setLoadingCategories(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoadingCategories(false);
      }
    };

    fetchCategories();

    fetchSkills();
    fetchJobs();
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      const job = jobs.find((j) => j.job_guid === id);
      if (job) {
        // Parse existing duration if available
        const durationParts = job.projectDuration
          ? job.projectDuration.split(" ")
          : ["1", "months"];

        setFormData({
          jobTitle: job.jobTitle,
          jobDescription: job.jobDescription,
          domain_id: job.domain_id,
          experience_id: job.experience_id,
          projectType: job.projectType,
          budget: job.budget,
          projectDuration: job.projectDuration,
          durationValue: parseInt(durationParts[0]) || 1,
          durationUnit: durationParts.length > 1 ? durationParts[1] : "months",
          skill_id: Array.isArray(job.skill_id)
            ? job.skill_id.map((id) => Number(id))
            : typeof job.skill_id === "string"
              ? JSON.parse(job.skill_id).map((id) => Number(id))
              : [],
          additionalInformations: job.additionalInformations,
          isPublished: Boolean(job.isPublished),
        });
        setEditingJob(job);
        setOpenModal(true);
      }
    }
  }, [isEditing, id, jobs]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.jobTitle.trim()) newErrors.jobTitle = "Job title is required";
    if (!formData.jobDescription.trim())
      newErrors.jobDescription = "Job description is required";
    if (!formData.domain_id) newErrors.domain_id = "Category is required";
    if (!formData.experience_id)
      newErrors.experience_id = "Experience level is required";
    if (!formData.projectType)
      newErrors.projectType = "Project type is required";
    if (!formData.budget || formData.budget <= 0)
      newErrors.budget = "Valid budget is required";
    if (
      !formData.projectDuration &&
      (!formData.durationValue || formData.durationValue <= 0)
    )
      newErrors.projectDuration = "Duration is required";
    if (formData.skill_id.length === 0)
      newErrors.skill_id = "At least one skill is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    setLoading(true);

    // Combine duration fields for display if custom text not provided
    const durationText =
      formData.projectDuration ||
      `${formData.durationValue} ${formData.durationUnit}`;

    const submitData = {
      ...formData,
      projectDuration: durationText,
      isPublished: isDraft ? false : true,
      skill_id: formData.skill_id,
    };

    if (validateForm()) {
      try {
        const token = sessionStorage.getItem("token");
        const url = editingJob
          ? `${apiEndpoints.jobcrud}?job_guid=${editingJob.job_guid}`
          : apiEndpoints.jobcrud;

        const method = editingJob ? "PUT" : "POST";

        const response = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(submitData),
        });

        if (!response.ok) {
          throw new Error(
            editingJob ? "Failed to update job" : "Failed to create job"
          );
        }
        fetchJobs();
        const data = await response.json();

        showSnackbar(
          editingJob
            ? `Job updated and ${isDraft ? "saved as draft" : "published"
            } successfully!`
            : `Job created and ${isDraft ? "saved as draft" : "published"
            } successfully!`,
          "success"
        );

        handleCloseModal();
      } catch (error) {
        console.error("Error saving job:", error);
        showSnackbar(
          error.message || "Failed to save job. Please try again.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    const durationParts = job.projectDuration
      ? job.projectDuration.split(" ")
      : ["1", "months"];

    setFormData({
      jobTitle: job.jobTitle,
      jobDescription: job.jobDescription,
      domain_id: job.domain_id,
      experience_id: job.experience_id,
      projectType: job.projectType,
      budget: job.budget,
      projectDuration: job.projectDuration,
      durationValue: parseInt(durationParts[0]) || 1,
      durationUnit: durationParts.length > 1 ? durationParts[1] : "months",
      skill_id: Array.isArray(job.skill_id)
        ? job.skill_id
        : typeof job.skill_id === "string"
          ? JSON.parse(job.skill_id)
          : [],
      additionalInformations: job.additionalInformations,
      isPublished: getPublishedStatus(job.isPublished),
    });
    setOpenModal(true);
  };

  const handleDelete = async (jobId) => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `${apiEndpoints.jobcrud}?job_guid=${jobId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete job");
      }
      fetchJobs();
      showSnackbar("Job deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting job:", error);
      showSnackbar(error.message || "Failed to delete job", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingJob(null);
    setFormData({
      jobTitle: "",
      jobDescription: "",
      domain_id: "",
      experience_id: "",
      projectType: "",
      budget: "",
      projectDuration: "",
      durationValue: 1,
      durationUnit: "months",
      skill_id: [],
      additionalInformations: "",
      isPublished: false,
    });
    setErrors({});
    setOpenModal(true);
  };

  const handleViewJob = (job) => {
    setViewingJob(job);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setViewingJob(null);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingJob(null);
    setFormData({
      jobTitle: "",
      jobDescription: "",
      domain_id: "",
      experience_id: "",
      projectType: "",
      budget: "",
      projectDuration: "",
      durationValue: 1,
      durationUnit: "months",
      skill_id: [],
      additionalInformations: "",
      isPublished: false,
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleViewProposals = (jobGuid) => {
    navigate(`/proposals/${jobGuid}`);
  };

  const handleSkillsChange = (event) => {
    const { value } = event.target;
    const selectedSkills = (
      Array.isArray(value) ? value : [value].filter(Boolean)
    ).map((id) => Number(id));

    setFormData({
      ...formData,
      skill_id: selectedSkills,
    });
    if (errors.skill_id) {
      setErrors({
        ...errors,
        skill_id: "",
      });
    }
  };

  const JobCard = ({ job, onViewProposals }) => {
    const isPublished = getPublishedStatus(job.isPublished);

    const getSkillNames = (skillIds) => {
      if (!skillIds) return [];

      try {
        const ids =
          typeof skillIds === "string"
            ? JSON.parse(skillIds.replace(/\\/g, ""))
            : skillIds;

        return ids.map((id) => {
          const numId = Number(id);
          const skill = skillsList.find((s) => Number(s.id) === numId);
          return skill ? skill.skill_name : "Unknown";
        });
      } catch (e) {
        console.error("Error parsing skill IDs:", e);
        return [];
      }
    };

    const jobSkills = getSkillNames(job.skill_id || []).filter(
      (skill) => skill !== "Unknown"
    );

    const getCategoryName = (job) => {
      // First check if domain_id is an object with domain_name property
      if (
        job.domain_id &&
        typeof job.domain_id === "object" &&
        job.domain_id.domain_name
      ) {
        return job.domain_id.domain_name;
      }

      // Then check if domain_name exists directly on the job object
      if (job.domain_name) {
        return job.domain_name;
      }

      // Finally, try to find the category in the categories list
      const category = categories.find((c) => c.id == job.domain_id); // Use loose equality to handle string/number
      return category ? category.domain_name : "Unknown";
    };

    return (
      <Card
        sx={{
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          height: "100%",
          width: '100%',
          display: "flex",
          boxSizing: "border-box",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          background: isPublished
            ? "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"
            : "linear-gradient(135deg, #fefbff 0%, #f3f4f6 100%)",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          transition: "all 0.3s ease",

          "&:hover": {
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            transform: "translateY(-2px)",
          },
          "&:before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: isPublished
              ? "linear-gradient(90deg, #4f46e5 0%, #10b981 100%)"
              : "linear-gradient(90deg, #f472b6 0%, #f59e0b 100%)",
          },
        }}
      >
        <CardContent
          sx={{
            padding: "clamp(14px,2vh,24px)",
            flex: " 1 1 100%",
            display: "flex",
            flexDirection: "column",
            overflowX: "hidden",
            width: "94%",
            "&:last-child": { paddingBottom: "24px" },
          }}
        >
          {/* Header Section */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            flexDirection={{ xs: "column", sm: "row" }}
            mb={2}
          >
            <Box flex={1}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#111827",
                  marginBottom: "8px",
                  lineHeight: 1.3,
                }}
              >
                {job.jobTitle}
              </Typography>

              <Box display="flex" alignItems="center" gap="8px" mb={2}>
                <Chip
                  label={isPublished ? "Published" : "Unpublished"}
                  size="small"
                  sx={{
                    backgroundColor: isPublished
                      ? "rgba(16, 185, 129, 0.1)"
                      : "rgba(239, 68, 68, 0.1)",
                    color: isPublished ? "#10b981" : "#ef4444",
                    fontWeight: 600,
                    fontSize: "11px",
                    height: "22px",
                  }}
                />
                <Chip
                  label={job.domain_name || getCategoryName(job)}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(79, 70, 229, 0.1)",
                    color: "#4f46e5",
                    fontSize: "11px",
                    fontWeight: 600,
                    height: "22px",
                  }}
                />
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box
              display="flex"
              gap="4px"
              sx={{
                p: {
                  sm: "10px",
                  md: "10px", 
                  lg: "10px",
                  xl: "10px", 
                },
              }}
            >
              <Tooltip title="View Job" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleViewJob(job)}
                  sx={{
                    backgroundColor: "rgba(241, 245, 249, 0.7)",
                    color: "#64748b",
                    width: "32px",
                    height: "32px",
                    "&:hover": {
                      backgroundColor: "rgba(226, 232, 240, 0.9)",
                    },
                  }}
                >
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Edit Job" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleEdit(job)}
                  sx={{
                    backgroundColor: "rgba(199, 210, 254, 0.3)",
                    color: "#4f46e5",
                    width: "32px",
                    height: "32px",
                    "&:hover": {
                      backgroundColor: "rgba(199, 210, 254, 0.5)",
                    },
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete Job" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(job.job_guid)}
                  sx={{
                    backgroundColor: "rgba(254, 202, 202, 0.3)",
                    color: "#ef4444",
                    width: "32px",
                    height: "32px",
                    "&:hover": {
                      backgroundColor: "rgba(254, 202, 202, 0.5)",
                    },
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Description */}
          <Typography
            variant="body2"
            sx={{
              color: "#4b5563",
              marginBottom: "16px",
              lineHeight: 1.6,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              fontSize: "14px",
            }}
          >
            {job.jobDescription}
          </Typography>

          {/* Skills */}
          <Box display="flex" flexWrap="wrap" gap="6px" mb={2}>
            {jobSkills.slice(0, 3).map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                size="small"
                sx={{
                  backgroundColor: "rgba(229, 231, 235, 0.7)",
                  color: "#374151",
                  fontSize: "11px",
                  height: "24px",
                  fontWeight: 500,
                  "&:hover": {
                    backgroundColor: "rgba(209, 213, 219, 0.9)",
                  },
                }}
              />
            ))}
            {jobSkills.length > 3 && (
              <Chip
                label={`+${jobSkills.length - 3} more`}
                size="small"
                sx={{
                  backgroundColor: "rgba(229, 231, 235, 0.7)",
                  color: "#6b7280",
                  fontSize: "11px",
                  height: "24px",
                }}
              />
            )}
          </Box>

          {/* Footer */}
          <Box sx={{ marginTop: "auto" }}>
            <Grid container spacing={2} sx={{ marginBottom: "16px" }}>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap="6px">
                  <Box
                    sx={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "6px",
                      background:
                        "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "white", fontWeight: 700, fontSize: "10px" }}
                    >
                      {job.projectType === "Hourly Rate" ? "H" : "F"}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#374151",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  >
                    {job.projectType === "Hourly Rate"
                      ? `₹${job.budget}/hr`
                      : `₹${job.budget}`}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap="6px">
                  <Box
                    sx={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "6px",
                      background:
                        "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Schedule sx={{ fontSize: "14px", color: "white" }} />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#374151",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  >
                    {job.projectDuration}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: "#6b7280",
                  fontSize: "12px",
                  textAlign: { xs: "center", sm: "right" },
                  mb: 1,
                  padding: "7px",
                }}
              >
                Created on{" "}
                {new Date(job.modifiedOn).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Typography>

              <CardActions>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={() => onViewProposals(job.job_guid)}
                  sx={{
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 600,
                    borderColor: "rgba(209, 213, 219, 0.7)",
                    color: "#374151",
                    fontSize: "14px",
                    py: "6px",
                    background: "rgba(255,255,255,0.7)",
                    "&:hover": {
                      borderColor: "#9ca3af",
                      background: "rgba(249, 250, 251, 0.9)",
                    },
                  }}
                >
                  View Proposals
                </Button>
              </CardActions>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        padding="0px"  // smaller on mobile
        boxSizing="border-box"
        mb={3}
      >
        <Box>
          <Typography
            variant="h4"
            style={{
              fontWeight: 700,
              color: "#1f2937",
              marginBottom: "8px",
              fontSize: "clamp(1.5rem, 2vw + 1rem, 2.125rem)",
            }}
          >
            Manage Jobs
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#64748b",
              fontSize: "clamp(0.5rem, 2vw + 1rem, 1rem)", // better min
            }}
          >
            Create, edit, and manage your job postings
          </Typography>

        </Box>
        <Box>
          <Fab
            color="primary"
            onClick={handleCreateNew}
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
              boxShadow: "0 8px 25px rgba(37, 99, 235, 0.3)",
              width: "clamp(40px, 9vw, 56px)",
              height: "clamp(40px, 9vw, 56px)",
            }}
          >
            <Add />
          </Fab>
        </Box>

      </Box>

      {/* Job Cards Grid */}
      <Box
        className="job-list-container"
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr",
            md: "1fr",
            lg: "repeat(3, 1fr)",
          },
          width: "100%",
        }}
      >
        {jobs.map((job) => (
          <Box key={job.id}>
            <JobCard job={job} onViewProposals={handleViewProposals} />
          </Box>
        ))}
      </Box>

      {/* Create/Edit Job Modal */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: "20px",
            maxHeight: "90vh",
            background: "linear-gradient(to bottom right, #f8fafc, #f1f5f9)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
            overflow: "hidden",
          },
        }}
      >
        {/* Header with gradient background */}
        <DialogTitle
          style={{
            padding: "20px 24px",
            background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
            color: "white",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" style={{ fontWeight: 700, color: "#fff", fontSize: "clamp(16px, 4vw, 20px)", lineHeight: 1.2, }}>
              {editingJob ? "✏️ Edit Job" : "✨ Create New Job"}
            </Typography>
            <IconButton
              onClick={handleCloseModal}
              size="small"
              style={{ color: "white" }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent style={{ padding: "clamp(12px, 3vw, 24px)" }}>
          <form onSubmit={(e) => handleSubmit(e, false)}>
            <Grid container spacing={3}>
              {/* Job Title */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="jobTitle"
                  label="Job Title"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  error={!!errors.jobTitle}
                  helperText={errors.jobTitle}
                  placeholder="e.g., Senior React Developer"
                  variant="outlined"
                  sx={{
                    minWidth: {
                      xs: "clamp(230px, 70vw, 390px)",
                      sm: "clamp(280px, 70vw, 300px)",
                      md: "clamp(300px, 70vw, 400px)",
                      lg: "400px",
                      xl: "350px",
                    },
                  }}
                  InputLabelProps={{
                    style: {
                      color: "#64748b",
                    },
                  }}
                />
              </Grid>

              {/* Category and Experience */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  name="domain_id"
                  label="Category"
                  value={formData.domain_id}
                  onChange={handleChange}
                  error={!!errors.domain_id}
                  helperText={errors.domain_id}
                  variant="outlined"
                  disabled={loadingCategories}
                  sx={{
                    minWidth: {
                      xs: "clamp(230px, 70vw, 390px)",
                      sm: "clamp(280px, 70vw, 300px)",
                      md: "clamp(300px, 70vw, 400px)",
                      lg: "400px",
                      xl: "350px",
                    },
                  }}
                >
                  {loadingCategories ? (
                    <MenuItem disabled>
                      <LinearProgress style={{ width: "100%" }} />
                    </MenuItem>
                  ) : (
                    categories.map((category) => (
                      <MenuItem
                        key={category.id}
                        value={category.id}
                        style={{ padding: "12px 16px" }}
                      >
                        {category.domain_name}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  name="experience_id"
                  label="Experience Level"
                  value={formData.experience_id}
                  onChange={handleChange}
                  error={!!errors.experience_id}
                  helperText={errors.experience_id}
                  variant="outlined"
                  sx={{
                    minWidth: {
                      xs: "clamp(230px, 70vw, 390px)",
                      sm: "clamp(280px, 70vw, 300px)",
                      md: "clamp(300px, 70vw, 400px)",
                      lg: "400px",
                      xl: "350px",
                    },
                  }}
                >
                  {jobData.experienceLevels.map((level) => (
                    <MenuItem
                      key={level.id}
                      value={level.id}
                      style={{ padding: "12px 16px" }}
                    >
                      {level.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Project Type and Budget */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  name="projectType"
                  label="Project Type"
                  value={formData.projectType}
                  onChange={handleChange}
                  error={!!errors.projectType}
                  helperText={errors.projectType}
                  variant="outlined"
                  sx={{
                    minWidth: {
                      xs: "clamp(230px, 70vw, 390px)",
                      sm: "clamp(280px, 70vw, 300px)",
                      md: "clamp(300px, 70vw, 400px)",
                      lg: "400px",
                      xl: "350px",
                    },
                  }}
                >
                  {jobData.projectTypes.map((type) => (
                    <MenuItem
                      key={type}
                      value={type}
                      style={{ padding: "12px 16px" }}
                    >
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="budget"
                  label={
                    formData.projectType === "Hourly Rate"
                      ? "Hourly Rate "
                      : "Budget "
                  }
                  type="number"
                  value={formData.budget}
                  onChange={handleChange}
                  error={!!errors.budget}
                  helperText={errors.budget}
                  placeholder={
                    formData.projectType === "Hourly Rate" ? "25" : "5000"
                  }
                  variant="outlined"
                  sx={{
                    minWidth: {
                      xs: "clamp(230px, 70vw, 390px)",
                      sm: "clamp(280px, 70vw, 300px)",
                      md: "clamp(300px, 70vw, 400px)",
                      lg: "400px",
                      xl: "350px",
                    },
                  }}
                  InputLabelProps={{
                    style: {
                      color: "#64748b",
                    },
                  }}
                />
              </Grid>

              {/* Project Duration - New Input Fields */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="durationValue"
                  label="Duration Value"
                  type="number"
                  value={formData.durationValue}
                  onChange={handleChange}
                  error={!!errors.projectDuration}
                  helperText={errors.projectDuration}
                  sx={{
                    minWidth: {
                      xs: "clamp(230px, 70vw, 390px)",
                      sm: "clamp(280px, 70vw, 300px)",
                      md: "clamp(300px, 70vw, 400px)",
                      lg: "400px",
                      xl: "350px",
                    },
                  }}
                  variant="outlined"
                  InputProps={{
                    inputProps: {
                      min: 1,
                      step: 1,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  name="durationUnit"
                  label="Duration Unit"
                  value={formData.durationUnit}
                  onChange={handleChange}
                  sx={{
                    minWidth: {
                      xs: "clamp(230px, 70vw, 390px)",
                      sm: "clamp(280px, 70vw, 300px)",
                      md: "clamp(300px, 70vw, 400px)",
                      lg: "400px",
                      xl: "350px",
                    },
                  }}
                  variant="outlined"
                >
                  <MenuItem value="days">Days</MenuItem>
                  <MenuItem value="weeks">Weeks</MenuItem>
                  <MenuItem value="months">Months</MenuItem>
                </TextField>
              </Grid>
              {/* <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  name="projectDuration"
                  label="Display Text (Optional)"
                  value={formData.projectDuration}
                  onChange={handleChange}
                  placeholder="e.g. 3 months"
                  variant="outlined"
                  helperText="Leave blank to use calculated duration"
                />
              </Grid> */}


              {/* Skills */}
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  error={!!errors.skill_id}
                  sx={{
                    minWidth: {
                      xs: "clamp(230px, 70vw, 390px)",
                      sm: "clamp(280px, 70vw, 300px)",
                      md: "clamp(300px, 70vw, 400px)",
                      lg: "400px",
                      xl: "350px",
                    },
                  }}
                >
                  <InputLabel>Required Skills</InputLabel>
                  <Select
                    multiple
                    name="skill_id"
                    value={formData.skill_id}
                    onChange={handleSkillsChange}
                    input={<OutlinedInput label="Required Skills" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((skillId) => {
                          const skill = skillsList.find(
                            (s) => Number(s.id) === Number(skillId)
                          );
                          return (
                            <Chip
                              key={skillId}
                              label={skill ? skill.skill_name : "Unknown"}
                              size="small"
                              style={{
                                background: "linear-gradient(135deg, #e0f2fe, #bfdbfe)",
                                color: "#1e40af",
                                fontWeight: 500,
                              }}
                            />
                          );
                        })}
                      </Box>
                    )}
                    MenuProps={{
                      PaperProps: {
                        style: { maxHeight: 300 },
                      },
                    }}
                    sx={{
                      "& .MuiSelect-select": {
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        minHeight: "56px", // 👈 matches TextField height
                        padding: "0 14px", // 👈 matches TextField padding
                      },
                    }}
                  >
                    {skillsList.map((skill) => (
                      <MenuItem
                        key={skill.id}
                        value={Number(skill.id)}
                        style={{ padding: "12px 16px" }}
                      >
                        {skill.skill_name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.skill_id && (
                    <Typography
                      variant="caption"
                      sx={{ color: "#d32f2f", ml: "14px", mt: "4px" }}
                    >
                      {errors.skill_id}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Job Description */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="jobDescription"
                  label="Job Description"
                  multiline
                  rows={4}
                  value={formData.jobDescription}
                  onChange={handleChange}
                  error={!!errors.jobDescription}
                  helperText={errors.jobDescription}
                  placeholder="Describe the job requirements, responsibilities, and what you're looking for..."
                  variant="outlined"
                  sx={{
                    minWidth: {
                      xs: "clamp(230px, 70vw, 390px)",
                      sm: "clamp(280px, 70vw, 300px)",
                      md: "400px",
                      lg: "400px",
                      xl: "350px",
                    },
                    "@media (min-width:768px) and (max-width:865px)": {
                      minWidth: "clamp(300px, calc(45% + 80px), 400px)", // force side by side on tablets
                    },
                  }}

                  InputLabelProps={{
                    style: {
                      color: "#64748b",
                    },
                  }}
                />
              </Grid>

              {/* Additional Requirements */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="additionalInformations"
                  label="Additional Requirements"
                  multiline
                  rows={4}
                  value={formData.additionalInformations}
                  onChange={handleChange}
                  placeholder="Any specific requirements, qualifications, or preferences..."
                  variant="outlined"
                  sx={{
                    minWidth: {
                      xs: "clamp(230px, 70vw, 390px)",
                      sm: "clamp(280px, 70vw, 300px)",
                      md: "400px",
                      lg: "400px",
                      xl: "350px",
                    },
                    "@media (min-width:768px) and (max-width:865px)": {
                      minWidth: "clamp(300px, calc(45% + 80px), 400px)", // force side by side on tablets
                    },
                  }}


                  InputLabelProps={{
                    style: {
                      color: "#64748b",
                    },
                  }}
                />
              </Grid>

              {/* Publish Toggle */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isPublished}
                      onChange={(e) =>
                        setFormData({ ...formData, isPublished: e.target.checked })
                      }
                      color="primary"
                      sx={{ mr: 1 }} // spacing between switch & label
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", flexDirection: "column", minWidth: "140px" }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          color: formData.isPublished ? "#2563eb" : "#64748b",
                        }}
                      >
                        {formData.isPublished ? "Published" : "Unpublished"}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#64748b",
                          fontSize: "13px",
                        }}
                      >
                        {formData.isPublished ? "Visible to candidates" : "Saved as draft"}
                      </Typography>
                    </Box>
                  }
                  sx={{ ml: 0 }}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>

        {/* Footer with Gradient Buttons */}
        <DialogActions
          style={{
            padding: "16px 24px",
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <Button
            onClick={handleCloseModal}
            style={{
              color: "#64748b",
              textTransform: "none",
              fontWeight: 500,
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              background: "white",
              fontSize: "clamp(12px, 3.5vw, 14px)",
              px: "clamp(12px, 4vw, 20px)",
              py: "clamp(6px, 2vw, 10px)",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            startIcon={formData.isPublished ? <Publish /> : <Save />}
            onClick={(e) => handleSubmit(e, !formData.isPublished)}
            sx={{
              borderRadius: "8px",
              background: formData.isPublished
                ? "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)"
                : "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
              textTransform: "none",
              fontWeight: 600,
              padding: {
                xs: "6px 12px",  // tighter padding for 320px devices
                sm: "8px 20px",  // normal padding otherwise
              },
              minHeight: "40px",   // keeps button height consistent
              fontSize: {
                xs: "0.75rem",  // slightly smaller text on 320px
                sm: "0.875rem", // normal on larger screens
              },
              color: "white",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "all 0.2s ease",
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <CircularProgress
                  size={20}
                  style={{ color: "white", marginRight: "8px" }}
                />
                Saving...
              </>
            ) : formData.isPublished ? (
              "Publish Job"
            ) : (
              "Save as Draft"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Job Modal */}
      <Dialog
        open={viewModalOpen}
        onClose={handleCloseViewModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: "20px",
            maxHeight: "90vh",
            background: "linear-gradient(to bottom right, #f0f4ff, #ffffff)",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
            backdropFilter: "blur(6px)",
          },
        }}
      >
        <DialogTitle
          style={{
            padding: "24px 24px 16px",
            borderBottom: "1px solid #e2e8f0",
            background: "linear-gradient(135deg, #3b82f6, #9333ea)",
            color: "#fff",
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" style={{ fontWeight: 600 }}>
              Job Details
            </Typography>
            <IconButton
              onClick={handleCloseViewModal}
              size="small"
              sx={{ color: "#fff" }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent style={{ padding: "clamp(12px, 4vw, 24px)", maxWidth: "100%", boxSizing: "border-box", }}>
          {viewingJob && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: 700, color: "#1e293b", fontSize: "clamp(18px, 2vw + 0.5rem, 24px)", }}
                >
                  {viewingJob.jobTitle}
                </Typography>

                <Box display="flex" gap={1} mb={2}>
                  <Chip
                    label={
                      getPublishedStatus(viewingJob.isPublished)
                        ? "Published"
                        : "Unpublished"
                    }
                    size="small"
                    sx={{
                      backgroundColor: getPublishedStatus(
                        viewingJob.isPublished
                      )
                        ? "#d1fae5"
                        : "#fee2e2",
                      color: getPublishedStatus(viewingJob.isPublished)
                        ? "#047857"
                        : "#b91c1c",
                      fontWeight: 600,
                    }}
                  />

                  <Chip
                    label={getCategoryName(viewingJob.domain_id)}
                    size="small"
                    sx={{
                      backgroundColor: "#eff6ff",
                      color: "#2563eb",
                      fontWeight: 600,
                      fontSize: "clamp(10px, 1vw + 0.4rem, 13px)",
                      height: "clamp(20px, 2.5vw, 28px)",
                    }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ fontWeight: 600 }}
                >
                  Job Description
                </Typography>
                <Typography variant="body2" sx={{ color: "#475569", fontSize: "clamp(12px, 1vw + 0.5rem, 14px)", }}>
                  {viewingJob.jobDescription}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "#0f172a",
                  }}
                >
                  <WorkOutlineIcon sx={{ fontSize: "clamp(16px, 2vw, 20px)", color: "#3b82f6" }} />
                  Experience Level
                </Typography>
                <Typography variant="body2" sx={{ color: "#475569" }}>
                  {getExperienceName(viewingJob.experience_id)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "#0f172a",
                  }}
                >
                  <CategoryIcon sx={{ fontSize: 20, color: "#9333ea" }} />
                  Project Type
                </Typography>
                <Typography variant="body2" sx={{ color: "#475569" }}>
                  {viewingJob.projectType}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "#0f172a",
                  }}
                >
                  <AttachMoneyIcon sx={{ fontSize: 20, color: "#10b981" }} />
                  {viewingJob.projectType === "Hourly Rate"
                    ? "Hourly Rate"
                    : "Budget"}
                </Typography>
                <Typography variant="body2" sx={{ color: "#475569" }}>
                  {viewingJob.projectType === "Hourly Rate"
                    ? `${viewingJob.budget}/hr`
                    : `${viewingJob.budget}`}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "#0f172a",
                  }}
                >
                  <AccessTimeIcon sx={{ fontSize: 20, color: "#f59e0b" }} />
                  Project Duration
                </Typography>
                <Typography variant="body2" sx={{ color: "#475569" }}>
                  {viewingJob.projectDuration}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "#0f172a",
                  }}
                >
                  <BuildIcon sx={{ fontSize: 20, color: "#ef4444" }} />
                  Required Skills
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {getSkillNames(viewingJob.skill_id).map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      sx={{
                        backgroundColor: "#f1f5f9",
                        color: "#1e293b",
                        fontWeight: 500,
                      }}
                    />
                  ))}
                </Box>
                {viewingJob.additionalInformations && (
                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      Additional Requirements
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#475569" }}>
                      {viewingJob.additionalInformations}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            padding: "16px 24px",
            borderTop: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
            borderBottomLeftRadius: "20px",
            borderBottomRightRadius: "20px",
          }}
        >
          <Button
            onClick={handleCloseViewModal}
            variant="outlined"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#334155",
              borderColor: "#cbd5e1",
              "&:hover": {
                borderColor: "#94a3b8",
                backgroundColor: "#f1f5f9",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateEditJob;
