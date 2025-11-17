// Corrected /api/manage.js (fixed the getTokenFromCookie condition)
import axios, { AxiosError } from "axios";
import API_URL from "@/constants/ApiUrl";
import { AArrowDown } from "lucide-react";

// Helper to get token from cookies (called outside React components)
const getTokenFromCookie = () => {
  if (typeof document === "undefined") return null; // Fixed: was incorrectly checking for empty string ""
  const cookieString = document.cookie || "";
  const tokenMatch = cookieString.match(/token=([^;]+)/);
  return tokenMatch ? tokenMatch[1] : null;
};

// const getUserIdFromCookie = () => {
//   if (typeof document === "undefined") return null;
//   const cookieString = document.cookie || "";
//   const userIdMatch = cookieString.match(/userId=([^;]+)/);
//   return userIdMatch ? userIdMatch[1] : null;
// };

const headers = () => {
  const token = getTokenFromCookie();
  return {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };
};

export const getInventory = async (page = 1, limit = 10, filter = null) => {
  try {
    const params = { page, limit };
    if (filter) params.filter = filter;
    const { data } = await axios.get(`${API_URL}manage/inventory`, {
      params,
      ...headers(),
    });
    return data;
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Fetch failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

export const createProduct = async (productDetails) => {
  try {
    const { data } = await axios.post(
      `${API_URL}manage/products`,
      productDetails,
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

export const uploadProductImages = async (id, images) => {
  try {
    const formData = new FormData();
    if (images.image1) formData.append("image1", images.image1);
    if (images.image2) formData.append("image2", images.image2);
    if (images.image3) formData.append("image3", images.image3);
    const { data } = await axios.post(
      `${API_URL}manage/products/${id}/images`,
      formData,
      {
        ...headers(),
        headers: {
          ...headers().headers,
          "Content-Type": "multipart/form-data",
        },
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

export const updateProduct = async (id, updateDetails) => {
  try {
    const { data } = await axios.patch(
      `${API_URL}manage/products/${id}`,
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

export const updateProductImages = async (id, images) => {
  try {
    const formData = new FormData();
    if (images.image1) formData.append("image1", images.image1);
    if (images.image2) formData.append("image2", images.image2);
    if (images.image3) formData.append("image3", images.image3);
    const { data } = await axios.patch(
      `${API_URL}manage/products/${id}/images`,
      formData,
      {
        ...headers(),
        headers: {
          ...headers().headers,
          "Content-Type": "multipart/form-data",
        },
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

export const deleteProduct = async (id) => {
  try {
    const { data } = await axios.delete(
      `${API_URL}manage/products/${id}`,
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

export const importProducts = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await axios.post(
      `${API_URL}manage/products/import`,
      formData,
      {
        ...headers(),
        headers: {
          ...headers().headers,
          "Content-Type": "multipart/form-data",
        },
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

export const exportProducts = async () => {
  try {
    const { data } = await axios.get(`${API_URL}manage/products/export`, {
      ...headers(),
      responseType: "blob",
    });
    return data;
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Fetch failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

export const getDashboard = async () => {
  try {
    const { data } = await axios.get(`${API_URL}manage/dashboard`, headers());
    console.log(data);
    return data;
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Fetch failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

export const getSalesReport = async (start, end, format = "csv") => {
  try {
    const params = { start, end, format };
    const { data } = await axios.get(`${API_URL}manage/reports/sales`, {
      params,
      ...headers(),
      responseType: "blob",
    });
    return data;
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Fetch failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

export const getPaymentsReport = async (start, end, format = "csv") => {
  try {
    const params = { start, end, format };
    const { data } = await axios.get(`${API_URL}manage/reports/payments`, {
      params,
      ...headers(),
      responseType: "blob",
    });
    return data;
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Fetch failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

export const getOverdueReport = async (format = "csv") => {
  try {
    const params = { format };
    const { data } = await axios.get(`${API_URL}manage/reports/overdue`, {
      params,
      ...headers(),
      responseType: "blob",
    });
    return data;
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Fetch failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

export const getOrders = async (page = 1, limit = 10, userId = null) => {
  try {
    const params = { page, limit, userId };
    const { data } = await axios.get(`${API_URL}manage/orders`, {
      params, // Pass the query parameters under the 'params' key
      ...headers(), // Spread the Authorization header configuration
    });
    console.log(data);
    return data;
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Fetch failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

export const getOrdersAdmin = async (page = 1, limit = 10) => {
  try {
    const params = { page, limit };
    const { data } = await axios.get(`${API_URL}manage/orders`, {
      params, // Pass the query parameters under the 'params' key
      ...headers(), // Spread the Authorization header configuration
    });
    console.log(data);
    return data;
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Fetch failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

export const updateOrderStatus = async (id, newStatus) => {
  try {
    const { data } = await axios.patch(
      `${API_URL}manage/orders/${id}`,
      { NewStatus: newStatus }, // Match the DTO
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

export const permanentDeleteProduct = async (id) => {
  try {
    const { data } = await axios.delete(
      `${API_URL}manage/products/${id}/permanent`,
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
