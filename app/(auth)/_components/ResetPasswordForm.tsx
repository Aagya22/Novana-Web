"use client";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleResetPassword } from "@/lib/actions/auth-action";
import { toast } from "react-toastify";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export const ResetPasswordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters long")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
});

export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;

export default function ResetPasswordForm({
    token,
}: {
    token: string;
}) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordDTO>({
        resolver: zodResolver(ResetPasswordSchema)
    });
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const onSubmit = async (data: ResetPasswordDTO) => {
        try {
            const response = await handleResetPassword(token, data.password);
            if (response.success) {
                toast.success("Password reset successfully");
                router.replace('/login');
            } else {
                toast.error(response.message || "Failed to reset password");
            }
        } catch {
            toast.error("An unexpected error occurred");
        }
    };

    return (
        <div className="min-h-screen w-full flex">

            {/* Left branding panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#1a4d3f] flex-col justify-between p-12">
                <Image src="/novacane.png" alt="Novana" width={110} height={80} className="object-contain brightness-0 invert" priority />
                <div className="space-y-6">
                    <h2 className="text-4xl font-extrabold text-white leading-snug">
                        Set a new password.<br />Keep it safe.
                    </h2>
                    <p className="text-teal-200 text-base leading-relaxed max-w-sm">
                        Choose a strong password to secure your Novana account and continue your wellness journey.
                    </p>
                </div>
                <p className="text-teal-400 text-xs">&copy; {new Date().getFullYear()} Novana. All rights reserved.</p>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
                <div className="w-full max-w-md">

                    {/* Mobile logo */}
                    <div className="lg:hidden mb-8 flex justify-center">
                        <Image src="/novacane.png" alt="Novana" width={110} height={80} className="object-contain" priority />
                    </div>

                    <button
                        onClick={() => router.push("/login")}
                        className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a4d3f] transition"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to login
                    </button>

                    <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Reset password</h1>
                    <p className="text-gray-500 text-sm mb-8">Enter your new password below.</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1.5" htmlFor="password">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    {...register("password")}
                                    placeholder="Enter your new password"
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-[#1a4d3f] focus:ring-2 focus:ring-[#1a4d3f]/20 transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a4d3f]"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-[11px] text-red-500">{errors.password.message}</p>}
                        </div>

                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1.5" htmlFor="confirmPassword">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    {...register("confirmPassword")}
                                    placeholder="Confirm your new password"
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-[#1a4d3f] focus:ring-2 focus:ring-[#1a4d3f]/20 transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a4d3f]"
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="mt-1 text-[11px] text-red-500">{errors.confirmPassword.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-xl bg-[#1a4d3f] py-3.5 text-sm font-semibold text-white hover:bg-[#134237] transition disabled:opacity-60"
                        >
                            {isSubmitting ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-500">
                        Didn&apos;t get a link?{" "}
                        <Link href="/request-password-reset" className="font-semibold text-[#1a4d3f] hover:underline">
                            Request a new one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}