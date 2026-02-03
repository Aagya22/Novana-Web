"use server";
import { register, login,  updateProfile, whoAmI } from "../api/auth";
import { setAuthToken, setUserData, clearAuthCookies } from "../cookie";
import { RegisterData, LoginData } from "../../app/(auth)/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const handleRegister = async (formData: RegisterData) => {
    try {
        const result = await register(formData);
        if (result.success) {
            return {
                success: true,
                message: "Registration Successful",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Registration failed"
        }
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Registration failed";
        return { success: false, message: errorMessage };
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
}

export const handleLogout = async () => {
    await clearAuthCookies();
    return redirect('/login');
}

export async function handleWhoAmI() {
    try {
        const result = await whoAmI();
        if (result.success) {
            return {
                success: true,
                message: 'User data fetched successfully',
                data: result.data
            };
        }
        return { success: false, message: result.message || 'Failed to fetch user data' };
    } catch (error: Error | any) {
        return { success: false, message: error.message };
    }
}

export async function handleUpdateProfile(formData: FormData) {
    try {
        // The formData already contains:
        // - fullName
        // - username
        // - email
        // - phoneNumber
        // - password (optional - only if changing password)
        // - image (optional - File object)
        
        const result = await updateProfile(formData);
        if (result.success) {
            await setUserData(result.data); // update cookie with new user data
            revalidatePath('/user/profile'); // revalidate profile page to refresh with new data
            return {
                success: true,
                message: 'Profile updated successfully',
                data: result.data
            };
        }
        return { success: false, message: result.message || 'Failed to update profile' };
    } catch (error: Error | any) {
        return { success: false, message: error.message };
    }
}