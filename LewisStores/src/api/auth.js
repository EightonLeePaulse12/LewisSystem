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
    console.log(data)
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
      `${API_URL}customers/profile`,
      UpdateProfilePayload,
      headers()
    );
    return data;
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Upload Failed");
    }
    throw new Error("Network error. Please try again.");
  }
};
