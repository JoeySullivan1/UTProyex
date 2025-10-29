import axios from 'axios';
import { Project } from '../types';

const API_URL = 'http://localhost:8080/api/projects';

export const getProjects = async (): Promise<Project[]> => {
  const response = await axios.get<Project[]>(API_URL);
  return response.data;
};

export const getProjectById = async (id: string): Promise<Project> => {
  const response = await axios.get<Project>(`${API_URL}/${id}`);
  return response.data;
};
