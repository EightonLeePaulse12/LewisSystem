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

export const getProductById = async (id) => {
  try {
    const { data } = await axios.get(`${API_URL}manage/products/${id}`, {
      ...headers(),
    });
    console.log(data)
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

    // Debug log to ensure file exists before sending
    console.log("File being sent:", file.name, file.size);

    const { data } = await axios.post(
      `${API_URL}manage/products/import`,
      formData,
      {
        // Spread existing auth headers
        ...headers(),
        // IMPORTANT: Do NOT manually set "Content-Type": "multipart/form-data"
        // The browser will detect FormData and add the correct header + boundary automatically.
      }
    );

    return data;
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Import failed");
    }
    console.error(e);
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

export const getSingleOrderAdmin = async (orderId) => {
  try {
    const { data } = await axios.get(
      `${API_URL}manage/orders/single/${orderId}`,
      {
        ...headers(),
      }
    );
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

export const DownloadReport = async (type, start, end, format = "csv") => {
  try {
    const params = new URLSearchParams({ start, end, format });
    const response = await axios.get(
      `${API_URL}manage/reports/${type}?${params}`,
      {
        responseType: "blob",
        ...headers(),
      }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${type}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Download failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

export const DownloadOverdueReport = async (format = "csv") => {
  try {
    const params = new URLSearchParams({ format });
    const response = await axios.get(
      `${API_URL}manage/reports/overdue?${params}`,
      {
        responseType: "blob",
        ...headers(),
      }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `overdue.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Download failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

export const FetchAuditLogs = async (page, limit, filter) => {
  try {
    const params = new URLSearchParams({ page, limit, filter });
    const { data } = await axios.get(`${API_URL}Auditlogs?${params}`, {
      ...headers(),
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

export const FetchStoreSettings = async () => {
  try {
    const { data } = await axios.get(`${API_URL}manage/settings`, {
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

export const UpdateStoreSettings = async (dto) => {
  try {
    await axios.patch(`${API_URL}manage/settings`, dto, {
      ...headers(),
    });
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Update failed");
    }
    throw new Error("Network error. Please try again.");
  }
};

export const GetAllUsers = async (page, limit) => {
  try {
    const params = new URLSearchParams({ page, limit });
    const { data } = await axios.get(`${API_URL}manage/users?${params}`, {
      ...headers(),
    });
    console.log;
    return data;
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Failed to fetch users");
    }
    throw new Error("Network error. Please try again.");
  }
};

export const BanUser = async (id) => {
  try {
    await axios.post(`${API_URL}manage/ban/${id}`, {
      headers
    });
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      throw new Error(e.response.data?.message || "Failed to fetch users");
    }
    throw new Error("Network error. Please try again.");
  }
};
