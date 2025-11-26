import axios, { AxiosError } from "axios";
import API_URL from "@/constants/ApiUrl";
import { Cookies } from "react-cookie";

const getTokenFromCookie = () => {
  if (typeof document === "undefined") return null;
  const cookieString = document.cookie || "";
  const tokenMatch = cookieString.match(/token=([^;]+)/);
  return tokenMatch ? tokenMatch[1] : null;
};

const headers = () => {
  const token = getTokenFromCookie();
  return {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };
};

export const Register = async (user) => {
  try {
    const { data } = await axios.post(`${API_URL}Auth/register`, user);
    console.log(data);
    return data;
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Registration failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

export const Login = async (user) => {
  try {
    const { data } = await axios.post(`${API_URL}Auth/login`, user);
    console.log(data);
    return data;
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Login failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

export const GetProfile = async () => {
  try {
    const { data } = await axios.get(`${API_URL}customers/profile`, headers());
    console.log(data);
    return data;
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Fetch failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

export const UpdateProfile = async (UpdateProfilePayload) => {
  try {
    const { data } = await axios.patch(
      // Changed to patch
      `${API_URL}customers/profile`, // Changed endpoint to match C# [HttpPatch("profile")]
      UpdateProfilePayload,
      headers() // Correctly passing headers as a single object argument
    );
    return data;
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Update Failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

export const UploadProfilePicture = async (formDataPayload) => {
  try {
    // Axios automatically sets the Content-Type to 'multipart/form-data' for FormData
    const { data } = await axios.post(
      `${API_URL}customers/profile-picture`, // Endpoint for picture upload
      formDataPayload, // FormData object
      headers() // Correctly passing headers for Authorization
    );
    return data;
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Upload Failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

export const GetProfilePicture = async (userId) => {
  try {
    // Set responseType to 'blob' since the endpoint returns an image file (binary data)
    const response = await axios.get(`${API_URL}auth/profile-picture/${userId}`, {
      ...headers(),
      responseType: 'blob',  // Ensures the response is treated as binary data (e.g., for images)
    });
    console.log(response);
    return response.data;  // Return the blob data (the image)
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Failed to fetch profile picture");
    }
    throw new Error("Network error. Please try again.");
  }
};