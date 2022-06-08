import axios from 'axios';

const API_KEY = process.env.NUXT_ENV_API_KEY;

axios.defaults.headers = { "Teamup-Token": `${API_KEY}` };

export default axios;