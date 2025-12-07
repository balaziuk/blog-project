import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
});

export const api = {
  getPosts: () => axiosInstance.get("/posts"),
  getPost: (id) => axiosInstance.get(`/posts/${id}`),

  createPost: (formData) => axiosInstance.post("/posts", formData),
  updatePost: (id, formData) => axiosInstance.put(`/posts/${id}`, formData),
  deletePost: (id) => axiosInstance.delete(`/posts/${id}`),

  addComment: (postId, content) =>
    axiosInstance.post(`/posts/${postId}/comments`, { content }),
  updateComment: (id, content) =>
    axiosInstance.put(`/comments/${id}`, { content }),
  deleteComment: (id) => axiosInstance.delete(`/comments/${id}`),

  getComments: (postId, { page = 1, limit = 15 } = {}) =>
    axiosInstance.get(`/posts/${postId}/comments?page=${page}&limit=${limit}`),

  toggleLike: (postId) => axiosInstance.post(`/posts/${postId}/like`),
};
