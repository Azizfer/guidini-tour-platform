// frontend/src/services/api/tourApi.ts
import axios from 'axios';
import { Tour } from '@/services/toursService';

const API_URL = 'http://localhost:5000/api/tours';

export const fetchTours = async (guideId: string) => {
  const response = await axios.get(`${API_URL}/guide/${guideId}`);
  return response.data;
};

export const createTour = async (tourData: Omit<Tour, 'id'>) => {
  const response = await axios.post(API_URL, tourData);
  return response.data;
};

export const updateTour = async (id: string, tourData: Partial<Tour>) => {
  const response = await axios.put(`${API_URL}/${id}`, tourData);
  return response.data;
};

export const deleteTour = async (id: string) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

export const toggleTourVisibility = async (id: string) => {
  const response = await axios.patch(`${API_URL}/${id}/toggle-visibility`, {});
  return response.data;
};