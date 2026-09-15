import axios from 'axios';
import { API_URL } from '../utils/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export default apiClient;