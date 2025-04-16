import axios from 'axios';

const API_URL ='https://project-flow-backend.vercel.app/api';

export const updateProjectStatus = async (projectId: string, status: string) => {
  try {
    const response = await axios.put(`${API_URL}/projects/updateStatus/${projectId}`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 