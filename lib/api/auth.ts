// API layer
// Call api from backend

import axios from "./axios";
import { API } from "./endpoints";

export const register = async ( registerData : any ) => {
    try{
        const response = await axios.post(
            API.AUTH.REGISTER, //path
            registerData //body data
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            // 400-500 err code counts as exception
            err.response?.data?.message // log error message from backend
            ||err.message // default error message
            ||"Registration failed" //fallback message if default fails
        );
    }
}

export const login = async ( loginData : any ) => {
    try{
        const response = await axios.post(
            API.AUTH.LOGIN, // change
            loginData // change
        );
        return response.data;

    }catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message 
            || err.message 
            ||"Login failed"
        )
    }
}