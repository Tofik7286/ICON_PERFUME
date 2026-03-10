import axios from "axios";

let axiosInstance;

if (typeof window === "undefined") {
  // Server Side
  const { cookies } = require("next/headers");

  axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 10000,
    withCredentials: true,
  });

  axiosInstance.interceptors.request.use( async (config) => {
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();
    config.headers.Cookie = cookieString;
    return config;
  });
} else {
  // Client Side
  axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 10000,
    withCredentials: true,
  });
}

export default axiosInstance;
