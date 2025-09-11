import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://hunt-iota.vercel.app'
});

export default instance;
