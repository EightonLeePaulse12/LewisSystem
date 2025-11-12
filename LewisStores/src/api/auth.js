import axios, { AxiosError } from "axios";
import API_URL from "@/constants/ApiUrl";

export const Register = async (user) => {
  try {
    const { data } = await axios.post(`${API_URL}api/Auth/register`, user);
    return data;
  } catch (e) {
    if (e instanceof AxiosError && e.response)
      throw new Error(e | undefined && "Network Error");
  }
};

export const Login = async (user) => {
  try {
    const { data } = axios.post(`${API_URL}api/Auth/login`, user);
    return data;
  } catch (e) {
    if (e instanceof AxiosError && e.response)
      throw new Error(e | undefined && "Network Error");
  }
};
