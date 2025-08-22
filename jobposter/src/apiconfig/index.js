const API_BASE_URL = "http://localhost/freelancer/api";
// const API_BASE_URL = "https://freelancer.gudstart.com/api";

const apiEndpoints = {
  blob: `${API_BASE_URL}/`,
  blobFromAdmin: `${API_BASE_URL}/`,

  skilldropdown: `${API_BASE_URL}/skill_dropdown.php`,
  jobcrud: `${API_BASE_URL}/job_crud.php`,
  validateToken: `${API_BASE_URL}/jwtautogenerate.php`,
  login: `${API_BASE_URL}/login.php`,
  register: `${API_BASE_URL}/register.php`,
  locations: `${API_BASE_URL}/locations.php`,
  domain_dropdown: `${API_BASE_URL}/domain_dropdown.php`,
  forgotpassword: `${API_BASE_URL}/forgotpassword.php`,
  dashboard: `${API_BASE_URL}/dashboard.php`,
  analysis: `${API_BASE_URL}/analysis.php`,
  bidding: `${API_BASE_URL}/bidding.php`,
  profile: `${API_BASE_URL}/profile.php`,
  rating :`${API_BASE_URL}/rating.php`,
  sendotp :`${API_BASE_URL}/sendotp.php`,
  send_message :`${API_BASE_URL}/send_message.php`,
  verifyotp :`${API_BASE_URL}/verifyotp.php`,

};
export default apiEndpoints;
