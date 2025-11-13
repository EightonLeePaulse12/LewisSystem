import axios, { AxiosError } from "axios";
import API_URL from "@/constants/ApiUrl";
import { useAuth } from "@/hooks/useAuth";

function GetToken() {
  const { token } = useAuth();
  return token;
}

export const checkout = async (checkoutDetails) => {
  try {
    const { data } = await axios.get(
      `${API_URL}orders/checkout`,
      checkoutDetails,
      {
        headers: {
          Authorization: `Bearer ${GetToken}`,
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
