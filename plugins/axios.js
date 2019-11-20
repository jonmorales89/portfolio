import axios from 'axios';

const API_KEY = process.env.TEAM_UP_API_KEY;

axios.defaults.headers = { "Teamup-Token": `${API_KEY}` };

export default axios;