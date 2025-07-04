import axios from "axios";

const BASE_URL = "https://taskflow-3z4n.onrender.com/api/auth";
const BASE_URLL = "https://taskflow-3z4n.onrender.com";

const api = axios.create({
  baseURL: BASE_URL,
});

export const baseapi = axios.create({
  baseURL: BASE_URLL,
})

export default api;
