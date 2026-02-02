//server side processing of auth actions
"use server";
import {register, login} from "../api/auth";
import { setAuthToken, setUserData } from "../cookie";
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

export const handleLogin = async (formData: LoginData, options?: { persist?: boolean }) => {
  const persist = options?.persist !== false;

  try {
    const result = await login(formData);

    if (!result.success) {
      return { success: false, message: result.message || "Login failed" };
    }

    if (persist) {
      await setAuthToken(result.token);
      await setUserData(result.data as any);
    }

    return {
      success: true,
      message: "Login Successful",
      data: result.data,
      token: result.token 
    };

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Login failed";
    return { success: false, message: errorMessage };
  }
};
