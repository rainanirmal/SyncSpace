import axiosClient from './axiosClient';
import type { ApiResponseEnvelope, User, LoginResponse } from '../types';

export const register = async (
  email: string,
  username: string,
  password: string,
  fullName?: string
): Promise<{ user: User }> => {
  const response = await axiosClient.post<ApiResponseEnvelope<{ user: User }>>(
    '/auth/register',
    { email, username, password, fullName }
  );
  return response.data.data;
};

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await axiosClient.post<ApiResponseEnvelope<LoginResponse>>(
    '/auth/login',
    { email, password }
  );
  return response.data.data;
};

export const logout = async (): Promise<Record<string, unknown>> => {
  const response = await axiosClient.post<ApiResponseEnvelope<Record<string, unknown>>>(
    '/auth/logout'
  );
  return response.data.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await axiosClient.post<ApiResponseEnvelope<User>>(
    '/auth/current-user'
  );
  return response.data.data;
};

export const forgotPassword = async (
  email: string
): Promise<Record<string, unknown>> => {
  const response = await axiosClient.post<ApiResponseEnvelope<Record<string, unknown>>>(
    '/auth/forgot-password',
    { email }
  );
  return response.data.data;
};

export const resetPassword = async (
  resetToken: string,
  newPassword: string
): Promise<Record<string, unknown>> => {
  const response = await axiosClient.post<ApiResponseEnvelope<Record<string, unknown>>>(
    `/auth/reset-password/${resetToken}`,
    { newPassword }
  );
  return response.data.data;
};

export const changePassword = async (
  oldPassword: string,
  newPassword: string
): Promise<Record<string, unknown>> => {
  const response = await axiosClient.post<ApiResponseEnvelope<Record<string, unknown>>>(
    '/auth/change-password',
    { oldPassword, newPassword }
  );
  return response.data.data;
};
