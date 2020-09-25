import axios from 'axios';

export const AUTH_API = `${process.env.REACT_APP_API_URL_AUTH}`;
export const PUBLIC_API = `${process.env.REACT_APP_API_URL_PUBLIC}`;

export const REST = path => ({
  create: params => axios.post(`${AUTH_API}/${path}`, params).then(response => response.data),
  getMany: params => {
    return axios.get(`${AUTH_API}/${path}`, { params }).then(response => response.data);
  },
  getOne: params => {
    const { id, ...queryParams } = params;
    return axios.get(`${AUTH_API}/${path}/${id}`, { params: queryParams }).then(response => response.data);
  },
  delete: params => axios.delete(`${AUTH_API}/${path}/${params.id}`, { params }).then(response => response.data),
  update: params => axios.put(`${AUTH_API}/${path}/${params.id}`, params).then(response => response.data),
  patch: params => {
    const { id, ...queryParams } = params;
    return axios.patch(`${AUTH_API}/${path}/${params.id}`, { ...queryParams }).then(response => response.data);
  }
});
