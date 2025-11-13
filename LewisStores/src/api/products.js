import API_URL from "@/constants/ApiUrl";
import axios, { AxiosError } from "axios";

export const FetchProducts = async (page, limit, filter) => {
  try {
    const params = new URLSearchParams({ page, limit, filter });
    const { data } = await axios.get(`${API_URL}products?${params}`);
    return data;
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Fetch failed");
    }
    throw new Error("Network error. Please try again.");
  }
};


export const FetchSingleProduct = async (id) => {
  try {
    const { data } = await axios.get(`${API_URL}products/${id}`);
    console.log(data);
    return data;
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Registration failed");
    }
    throw new Error("Network error. Please try again.");
  }
};