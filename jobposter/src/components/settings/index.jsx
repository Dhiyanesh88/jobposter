import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Building,
  Globe,
  MapPin,
  Calendar,
  FileText,
  Edit,
  Check,
  X,
  Camera,
  Hash,
  Briefcase,
} from "lucide-react";
import apiEndpoints from "../../apiconfig";

function SettingsPage({ showSnackbar }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfileData, setTempProfileData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [domains, setDomains] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState(null);

  const [profileData, setProfileData] = useState({
    userName: "",
    Email: "",
    Phone: "",
    companyName: "",
    gstno: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    state_id: "",
    city_id: "",
    state: "",
    city: "",
    domain: "",
    FoundedIn: "",
    website: "",
    profileimg_url: "",
    IsActive: "1",
  });

  // Fetch cities helper function
  const fetchCities = async (stateId) => {
    if (!stateId) {
      setCities([]);
      return;
    }

    try {
      setLoadingCities(true);
      const response = await fetch(`${apiEndpoints.locations}?type=cities&state_id=${stateId}`);
      const data = await response.json();

      if (data.status === "success") {
        setCities(data.data);

        // Update city name if city_id exists in profile data
        if (profileData.city_id) {
          const selectedCity = data.data.find(city => city.city_id === profileData.city_id);
          if (selectedCity) {
            setProfileData(prev => ({
              ...prev,
              city: selectedCity.city_name
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // First fetch states
        setLoadingStates(true);
        const statesResponse = await fetch(`${apiEndpoints.locations}?type=states`);
        const statesData = await statesResponse.json();

        if (statesData.status === "success") {
          const validStates = statesData.data.filter(state =>
            state.state_id && state.state_name && state.state_name !== "0"
          );
          setStates(validStates);
        }

        // Then fetch profile data
        setLoadingProfile(true);
        const token = sessionStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const profileResponse = await fetch(apiEndpoints.profile, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!profileResponse.ok) throw new Error(`HTTP error! status: ${profileResponse.status}`);

        const profileJson = await profileResponse.json();
        if (profileJson.success && profileJson.data) {
          const apiData = profileJson.data;
          const newProfileData = {
            userName: apiData.userName || "",
            Email: apiData.Email || "",
            Phone: apiData.Phone || "",
            companyName: apiData.companyName || "",
            gstno: apiData.gstno || "",
            companyEmail: apiData.companyEmail || "",
            companyPhone: apiData.companyPhone || "",
            companyAddress: apiData.companyAddress || "",
            state_id: apiData.state_id || "",
            city_id: apiData.city_id || "",
            state: apiData.state || "",
            city: apiData.city || "",
            domain: apiData.domain || "",
            FoundedIn: apiData.FoundedIn || "",
            website: apiData.website || "",
            profileimg_url: apiData.profileimg_url || "",
            IsActive: apiData.IsActive || "1"
          };
          setProfileData(newProfileData);

          // After setting profile data, fetch cities if state_id exists
          if (apiData.state_id) {
            await fetchCities(apiData.state_id);
          }

          if (apiData.profileimg_url) {
            setProfileImage(apiData.profileimg_url);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError(error.message);
      } finally {
        setLoadingStates(false);
        setLoadingProfile(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch cities when state_id changes (for editing)
  useEffect(() => {
    if (isEditing && tempProfileData?.state_id) {
      fetchCities(tempProfileData.state_id);
    } else if (profileData.state_id) {
      fetchCities(profileData.state_id);
    }
  }, [profileData.state_id, profileData.city_id, isEditing, tempProfileData?.state_id]);

  // Fetch domains
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await fetch(apiEndpoints.domain_dropdown);
        const data = await response.json();

        if (data.success) {
          const activeDomains = data.data.filter(
            (domain) => domain.isActive === "1" && domain.isDeleted === "0"
          );
          setDomains(activeDomains);

          if (profileData.domain) {
            const selectedDomain = activeDomains.find(
              (d) => String(d.id) === String(profileData.domain)
            );
            if (selectedDomain) {
              setProfileData((prev) => ({
                ...prev,
                domain: selectedDomain.domain_name,
              }));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching domains:", error);
      }
    };

    fetchDomains();
  }, [profileData.domain]);

  const handleInputChange = async (field, value) => {
    const updatedData = {
      ...tempProfileData,
      [field]: value,
      ...(field === 'state_id' ? {
        city_id: '',
        city: ''
      } : {})
    };


    setTempProfileData(updatedData);

    // If the changed field is state_id, fetch cities for that state
    if (field === "state_id" && value) {
      try {
        setLoadingCities(true);
        const response = await fetch(
          `${apiEndpoints.locations}?type=cities&state_id=${value}`
        );
        const data = await response.json();

        if (data.status === "success") {
          setCities(data.data);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = () => {
    setTempProfileData({
      ...profileData,
      state_id: profileData.state_id,
      city_id: profileData.city_id,
      domain: profileData.domain,
    });
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const formData = new FormData();

      Object.entries(tempProfileData).forEach(([key, value]) => {
        if (key !== "state" && key !== "city" && key !== "domain") {
          formData.append(key, value);
        }
      });

      if (tempProfileData.domain) {
        const selectedDomain = domains.find(
          (d) =>
            d.domain_name === tempProfileData.domain ||
            String(d.id) === String(tempProfileData.domain)
        );

        if (selectedDomain) {
          formData.append("domain", selectedDomain.id);
        } else {
          formData.append("domain", tempProfileData.domain);
        }
      }

      if (previewImage) {
        if (previewImage instanceof File) {
          formData.append("profileImg", previewImage);
        } else if (
          typeof previewImage === "string" &&
          previewImage.startsWith("data:")
        ) {
          const blob = await fetch(previewImage).then((res) => res.blob());
          formData.append("profileImg", blob, "profile.jpg");
        }
      }

      const response = await fetch(apiEndpoints.profile, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        // throw new Error(`HTTP error! status: ${response.status}`);
        showSnackbar("Profile Updated Successfully", "success");

      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        // Handle API errors (including PHP errors)
        const errorMessage = data.error ||
          data.message ||
          (data.data && data.data.error) ||
          "Failed to update profile";
        throw new Error(errorMessage);
      }

      if (data.success) {
        const selectedState = states.find(state => String(state.state_id) === String(tempProfileData.state_id));
        const selectedCity = cities.find(city => String(city.city_id) === String(tempProfileData.city_id));
        const selectedDomain = domains.find(domain => String(domain.id) === String(tempProfileData.domain) || String(domain.domain_name) === String(tempProfileData.domain));

        setProfileData({
          ...tempProfileData,
          state: selectedState ? selectedState.state_name : tempProfileData.state,
          city: selectedCity ? selectedCity.city_name : tempProfileData.city,
          domain: selectedDomain ? selectedDomain.domain_name : tempProfileData.domain,
          profileimg_url: data.profileimg_url || profileData.profileimg_url
        });

        if (data.profileimg_url) {
          setProfileImage(data.profileimg_url);
          setPreviewImage(null);
        }
        showSnackbar("Profile Updated Successfully", "success");
        setIsEditing(false);
      } else {
        showSnackbar(data.error || "Failed to update profile", "error");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      showSnackbar(error.message || "An error occurred while saving the profile", "error");
    }
  };

  const resolvedDomainName =
    typeof profileData.domain === "string" && profileData.domain !== ""
      ? profileData.domain
      : domains.find((d) => String(d.id) === String(profileData.domain))
        ?.domain_name || "Not provided";

  const resolvedStateName =
    typeof profileData.state === "string" && profileData.state !== ""
      ? profileData.state
      : states.find(s => String(s.state_id) === String(profileData.state_id))?.state_name || "Not provided";

  const resolvedCityName =
    cities.find((c) => String(c.city_id) === String(profileData.city_id))
      ?.city_name || "Not provided";

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const renderField = (label, value, fieldName, icon, type = "text",) => {
    if (isEditing) {
      return (
        <div style={{ flex: "1 1 200px", marginBottom: "16px" }}>
          <label
            style={{
              width: "100%",
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            {React.cloneElement(icon, {
              size: 16,
              style: { display: "inline", marginRight: "6px" },
            })}
            {label}
          </label>
          <input
            type={type}
            value={tempProfileData[fieldName] || ""}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "12px",
              border: "2px solid #e5e7eb",
              fontSize: "16px",
              transition: "all 0.3s ease",
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
        </div>
      );
    }
    return (
      <div style={{ flex: "1 1 200px", marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "600",
            color: "#374151",
            marginBottom: "8px",
          }}
        >
          {React.cloneElement(icon, {
            size: 16,
            style: { display: "inline", marginRight: "6px" },
          })}
          {label}
        </label>
        <div
          style={{
            gap: 2,
            justifyContent: "space-between",
            padding: "12px 16px",
            borderRadius: "12px",
            border: "2px solid transparent",
            fontSize: "16px",
            backgroundColor: "#f3f4f6",
          }}
        >
          {value || "Not provided"}
        </div>
      </div>
    );
  };

  const renderDropdown = (
    label,
    value,
    fieldName,
    icon,
    options,
    isApiData = false
  ) => {
    if (isEditing) {
      return (
        <div style={{ flex: "1 1 200px", marginBottom: "16px" }}>
          <label
            style={{
              width: "90%",
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            {React.cloneElement(icon, {
              size: 16,
              style: { display: "inline", marginRight: "6px" },
            })}
            {label}
          </label>
          <select
            value={
              fieldName === "domain"
                ? domains.find(
                  (d) => String(d.id) === String(tempProfileData[fieldName])
                )?.domain_name || tempProfileData[fieldName]
                : tempProfileData[fieldName] || ""
            }
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            disabled={
              loadingStates || (fieldName === "city_id" && loadingCities)
            }
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "12px",
              border: "2px solid #e5e7eb",
              fontSize: "16px",
              transition: "all 0.3s ease",
              outline: "none",
              appearance: "none",
              background: "white",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          >
            <option value="">Select {label}</option>
            {options.map((option) => (
              <option
                key={
                  isApiData
                    ? option.domain || option.state_id || option.city_id
                    : option
                }
                value={
                  isApiData
                    ? option.domain || option.state_id || option.city_id
                    : option
                }
              >
                {isApiData
                  ? option.domain_name || option.state_name || option.city_name
                  : option}
              </option>
            ))}
          </select>
          {(loadingStates && fieldName === "state_id") ||
            (loadingCities && fieldName === "city_id") ? (
            <div style={{ marginTop: "8px", color: "#6b7280" }}>Loading...</div>
          ) : null}
        </div>
      );
    }
    return (
      <div style={{ flex: "1 1 200px", marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "600",
            color: "#374151",
            marginBottom: "8px",
          }}
        >
          {React.cloneElement(icon, {
            size: 16,
            style: { display: "inline", marginRight: "6px" },
          })}
          {label}
        </label>
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "12px",
            border: "2px solid transparent",
            fontSize: "16px",
            backgroundColor: "#f3f4f6",
          }}
        >
          {fieldName === "domain"
            ? resolvedDomainName
            : fieldName === "state_id"
              ? resolvedStateName
              : fieldName === "city_id"
                ? resolvedCityName
                : value || "Not provided"}
        </div>
      </div>
    );
  };

  const renderTextarea = (label, value, fieldName, icon) => {
    if (isEditing) {
      return (
        <div style={{ flex: "1 1 200px", marginBottom: "16px" }}>
          <label
            style={{
              width: "100%",
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            {React.cloneElement(icon, {
              size: 16,
              style: { display: "inline", marginRight: "6px" },
            })}
            {label}
          </label>
          <textarea
            value={tempProfileData[fieldName] || ""}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "12px",
              border: "2px solid #e5e7eb",
              fontSize: "16px",
              transition: "all 0.3s ease",
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
        </div>
      );
    }
    return (
      <div style={{ flex: "1 1 200px",marginBottom: "16px", width: "100%" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "600",
            color: "#374151",
            marginBottom: "8px",
          }}
        >
          {React.cloneElement(icon, {
            size: 16,
            style: { display: "inline", marginRight: "6px" },
          })}
          {label}
        </label>
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "12px",
            border: "2px solid transparent",
            fontSize: "16px",
            backgroundColor: "#f3f4f6",
            whiteSpace: "pre-wrap",
          }}
        >
          {value || "Not provided"}
        </div>
      </div>
    );
  };

  if (loadingProfile) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div>Loading profile data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: "red",
        }}
      >
        <div>Error: {error}</div>
      </div>
    );
  }
  // console.log("data", profileData);

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: "#f9fafb",
        padding: "clamp(0px, (100vw - 426px) * 999, 32px)",
      }}
    >
      <div
        style={{
          width: "xl",
          margin: "0 auto",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "20px",
            padding: "32px",
            marginBottom: "24px",
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "20px",
              backdropFilter: "blur(10px)",
            }}
          ></div>

          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "48px",
                  fontWeight: "bold",
                  color: "white",
                  border: "4px solid rgba(255, 255, 255, 0.3)",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                  overflow: "hidden",
                }}
              >
                {!profileData.profileimg_url && !profileImage && (
                  <span>{profileData.userName.charAt(0).toUpperCase()}</span>
                )}

                {!isEditing && (
                  <img
                    src={
                      `${apiEndpoints.blob}${profileImage}` ||
                      `${apiEndpoints.blobFromAdmin}${profileImage}`
                    }
                    alt="Profile preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}

                {isEditing && (
                  <img
                    src={
                      previewImage
                        ? previewImage
                        : `${apiEndpoints.blob}${profileImage}` ||
                        `${apiEndpoints.blobFromAdmin}${profileImage}`
                    }
                    alt="Profile preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
              </div>

              {isEditing && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    right: "8px",
                  }}
                >
                  <label
                    htmlFor="profile-image-upload"
                    style={{
                      background: "rgba(255, 255, 255, 0.9)",
                      border: "none",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Camera size={18} color="#333" />
                    <input
                      id="profile-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              )}
            </div>

            <div>
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  margin: "0 0 8px 0",
                }}
              >
                {profileData.userName}
              </h2>
              <p
                style={{
                  fontSize: "16px",
                  opacity: 0.9,
                  margin: "0 0 4px 0",
                }}
              >
                {profileData.companyName}
              </p>
              <p
                style={{
                  fontSize: "14px",
                  opacity: 0.8,
                  margin: 0,
                }}
              >
                <MapPin
                  size={14}
                  style={{ display: "inline", marginRight: "4px" }}
                />
                {resolvedCityName}, {resolvedStateName}
              </p>
            </div>
          </div>
        </div>

        <div style={{ width: "100%", margin: "0 auto" }}>
          {!isEditing && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "24px",
              }}
            >
              <button
                onClick={handleEditClick}
                style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Edit size={16} />
                Edit Profile
              </button>
            </div>
          )}

          <div style={{ marginBottom: "32px" }}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "24px",
                color: "#111827",
              }}
            >
              Personal Information
            </h3>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              {renderField(
                "Username",
                profileData.userName,
                "userName",
                <User />
              )}
              {renderField(
                "Email",
                profileData.Email,
                "Email",
                <Mail />,
                "email"
              )}
              {renderField(
                "Phone",
                profileData.Phone,
                "Phone",
                <Phone />,
                "tel"
              )}
            </div>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "24px",
                color: "#111827",
              }}
            >
              Company Information
            </h3>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "24px",
                flexDirection: "row",
                marginBottom: "24px",
              }}
            >
              {renderField(
                "Company Name",
                profileData.companyName,
                "companyName",
                <Building />
              )}
              {renderField("GST Number", profileData.gstno, "gstno", <Hash />)}


            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "24px",
                flexDirection: "row",
                marginBottom: "24px",
              }}
            >
              {renderField(
                "Official Email",
                profileData.companyEmail,
                "companyEmail",
                <Mail />,
                "email"
              )}
              {renderField(
                "Office Phone",
                profileData.companyPhone,
                "companyPhone",
                <Phone />,
                "tel"
              )}

            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "24px",
                flexDirection: "row",
                marginBottom: "24px",
              }}
            >
              {renderDropdown(
                "Domain",
                profileData.domain,
                "domain",
                <Briefcase />,
                domains,
                true
              )}
              {renderField(
                "Founded In",
                profileData.FoundedIn,
                "FoundedIn",
                <Calendar />,
                "number"
              )}

            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              {renderField(
                "Website",
                profileData.website,
                "website",
                <Globe />,
                "url"
              )}
              {renderDropdown(
                "State",
                profileData.state,
                "state_id",
                <MapPin />,
                states,
                true
              )}

            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "24px",
                marginBottom: "24px",
              }}>
              {renderDropdown(
                "City",
                profileData.city,
                "city_id",
                <MapPin />,
                cities,
                true
              )}
              {renderTextarea(
                "Company Address",
                profileData.companyAddress,
                "companyAddress",
                <FileText />
              )}
            </div>

          </div>

          {isEditing && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "32px",
              }}
            >
              <button
                onClick={handleCancelClick}
                style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  border: "2px solid #e5e7eb",
                  background: "white",
                  color: "#6b7280",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <X size={16} />
                Cancel
              </button>
              <button
                onClick={handleSaveClick}
                style={{
                  width: "clamp(120px, calc(100vw - 185px), 185px)",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Check size={16} />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;