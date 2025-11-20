import axios, { AxiosError } from "axios";
import API_URL from "@/constants/ApiUrl";

// Helper to get token from cookies (called outside React components)
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

export const getOrders = async (page = 1, limit = 10) => {
  try {
    const { data } = await axios.get(
      `${API_URL}orders`,
      {
        params: { page, limit },
        ...headers(),
      }
    );
    return data;
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Fetch failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

export const checkout = async (checkoutDetails) => {
  try {
    const { data } = await axios.post(
      `${API_URL}orders/checkout`,
      checkoutDetails,
      headers()
    );
    return data;
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Fetch failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

export const getOrderDetails = async (id) => {
  try {
    const { data } = await axios.get(
      `${API_URL}orders/${id}`,
      headers()
    );
    return data;
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Fetch failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

export const cancelOrder = async (id) => {
  try {
    const { data } = await axios.post(
      `${API_URL}orders/${id}/cancel`,
      null,
      headers()
    );
    return data;
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Fetch failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

export const updateOrder = async (id, updateDetails) => {
  try {
    const { data } = await axios.patch(
      `${API_URL}orders/${id}`,
      updateDetails,
      headers()
    );
    return data;
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Fetch failed");
    }
    throw new Error("Network error. Please try again.");
  }
};