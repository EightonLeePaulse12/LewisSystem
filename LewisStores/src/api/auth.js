import axios, { AxiosError } from "axios";
import API_URL from "@/constants/ApiUrl";

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
