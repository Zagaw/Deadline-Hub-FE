import axios from 'axios';

const API_URL = 'http://localhost:5000/api/rooms'; // သင့် Backend URL အတိုင်းပြင်ပါ

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const createRoom = async (roomData) => {
  const res = await axios.post(`${API_URL}/create`, roomData, getHeaders());
  return res.data;
};

export const joinRoomByCode = async (roomCode) => {
  const res = await axios.post(`${API_URL}/join`, { roomCode }, getHeaders());
  return res.data;
};

export const getRoomDetails = async (roomId) => {
  const res = await axios.get(`${API_URL}/${roomId}`, getHeaders());
  return res.data;
};

export const approveMember = async (roomId, userId) => {
  const res = await axios.post(`${API_URL}/${roomId}/approve`, { userId }, getHeaders());
  return res.data;
};

export const removeMember = async (roomId, userId) => {
  const res = await axios.delete(`${API_URL}/${roomId}/members/${userId}`, getHeaders());
  return res.data;
};

export const removeRoomDeadline = async (roomId, deadlineId) => {
  const res = await axios.delete(`${API_URL}/${roomId}/deadlines/${deadlineId}`, getHeaders());
  return res.data;
};