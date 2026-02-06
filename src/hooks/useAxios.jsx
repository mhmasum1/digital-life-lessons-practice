import axios from 'axios';
import React from 'react';


const axiosInstance = axios.create({
    baseURL: 'https://digital-life-lessons-server-rho.vercel.app'

})

const useAxios = () => {
    return axiosInstance;
};

export default useAxios;