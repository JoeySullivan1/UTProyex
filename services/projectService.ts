import axios from 'axios';
import { Project } from '../types';

const API_URL = 'https://utproyex.ddns.net:4000/api';

export const getProjects = async () => {
    const response = await axios.get(`${API_URL}/projects`);
    return response.data;
};

export const getProjectById = async (id: string) => {
    const response = await axios.get(`${API_URL}/projects/${id}`);
    return response.data;
};

export const createProject = async (projectData: any) => {
    const response = await axios.post(`${API_URL}/projects`, projectData);
    return response.data;
};


