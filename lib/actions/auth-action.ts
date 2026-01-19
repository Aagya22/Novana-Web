//server side processing of auth actions
"use server";
import {register, login} from "../api/auth";
import { RegisterData, LoginData } from "../../app/(auth)/schema";

export const handleRegister=async (formData: RegisterData) => {
    try{
        const result =await register(formData);
        if(result.success){
            return{
                success: true,
                message: "Registration Successful",
                data:result.data
            };
        }
        return{
            success:false,message:result.message||"Registration failed"

        }
    }catch(err: unknown){
        const errorMessage = err instanceof Error ? err.message : "Registration failed";
        return{success:false,message:errorMessage};
    }
    }

export const handleLogin=async (formData: LoginData) => {
    try{
        const result =await login(formData);
        if(result.success){
            return{
                success: true,
                message: "Login Successful",
                data:result.data
            };
        }
        return{
            success:false,message:result.message||"Login failed"

        }
    }catch(err: unknown){
        const errorMessage = err instanceof Error ? err.message : "Login failed";
        return{success:false,message:errorMessage};
    }
    }
