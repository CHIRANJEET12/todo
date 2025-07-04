import axios from "axios";

const BASE_URL = "http://localhost:8000/api/auth";
const BASE_URLL = "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
});

export const baseapi = axios.create({
  baseURL: BASE_URLL,
})

export default api;