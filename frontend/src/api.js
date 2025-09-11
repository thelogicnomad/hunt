import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://hunt-azure-xi.vercel.app'
});

export default instance;
