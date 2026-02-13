"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-toastify";
import { updateProfileClient } from "@/lib/api/auth";
import {
  UpdateProfileData,
  updateProfileSchema,
  User,
} from "@/app/(auth)/schema";

export default function UpdateUserForm({ user }: { user: User }) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
    setValue,
  } = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
    },
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return;

    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  useEffect(() => {
    // ensure form has fullName and other fields value
    setValue("fullName", user.fullName);
    setValue("username", user.username);
    setValue("email", user.email);
    setValue("phoneNumber", user.phoneNumber);
  }, [user.fullName, setValue]);

  const onSubmit = async (data: UpdateProfileData) => {
    if (!isEditing) return;
    try {
      toast.info("Submitting changes...");
      console.log("Submitting profile update", { data });
      const formData = new FormData();

      // fullName from form data
      if (data.fullName && data.fullName !== user.fullName) formData.append("fullName", data.fullName);

      // include username if changed
      if (data.username && data.username !== user.username) formData.append("username", data.username);

      if (data.email !== user.email) formData.append("email", data.email);

      if (data.phoneNumber !== user.phoneNumber)
        formData.append("phoneNumber", data.phoneNumber);

      // no password updates from settings page

      if (imageFile) {
        formData.append("image", imageFile); // BACKEND expects "image"
      }

      if (removeImage) {
        formData.append("imageUrl", ""); // signal backend to remove image
      }

      if ([...formData.keys()].length === 0) {
        toast.info("No changes to update");
        return;
      }

      const response = await updateProfileClient(formData);
      if (!response.success) throw new Error(response.message);

      toast.success("Profile updated successfully");

      setIsEditing(false);
      // no password fields to reset
      setPreviewImage(null);
      setImageFile(null);
      setRemoveImage(false);

      reset({
        fullName: data.fullName ?? user.fullName,
        username: data.username,
        email: data.email,
        phoneNumber: data.phoneNumber,
      });
      // update client-side cookie so header and other clients reflect change
      try {
        const newUser = response.data;
        if (typeof document !== "undefined" && newUser) {
          document.cookie = `user_data=${encodeURIComponent(JSON.stringify(newUser))}; path=/`;
          try {
            // also write to localStorage to trigger storage events in other tabs
            localStorage.setItem("user_data", JSON.stringify(newUser));
          } catch (e) {
            /* ignore localStorage errors */
          }
          // notify other components
          try {
            window.dispatchEvent(new CustomEvent("user_data_updated", { detail: newUser }));
          } catch (e) {
            console.warn("Broadcast event failed", e);
          }
        }
      } catch (e) {
        console.warn("Failed to update user_data cookie", e);
      }
      // refresh server-side data on the page so server components re-render
      try {
        router.refresh();
      } catch (e) {
        console.warn("router.refresh failed", e);
      }
      // done
    } catch (err: any) {
      console.error("update form submit error:", err);
      // show server message if available
      const serverMessage = (err && (err as any).message) || "Profile update failed";
      toast.error(serverMessage);
    }
  };

  const onInvalid = (errors: any) => {
    console.log("Validation errors:", errors);
    const messages = Object.values(errors)
      .map((e: any) => e?.message || (typeof e === 'object' && e && Object.values(e)[0] as any)?.message)
      .filter(Boolean)
      .join(" • ");
    toast.error(messages || "Validation failed");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #344C3D, #829672)",
          padding: "32px"
        }}>
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          <p className="text-green-100 mt-2">Manage your profile and account information</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Profile Picture Section */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 border-4 border-white shadow-lg" style={{
                  background: "linear-gradient(135deg, #344C3D, #829672)"
                }}>
                  {previewImage ? (
                    <img src={previewImage} className="w-full h-full object-cover" alt="Profile preview" />
                  ) : user.imageUrl && !removeImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${user.imageUrl}`}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                      {user.fullName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 text-white rounded-full p-2 cursor-pointer shadow-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {isEditing ? "Click the camera icon to change your profile picture" : ""}
              </p>
              {(user.imageUrl || previewImage) && isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    setImageFile(null);
                    setRemoveImage(true);
                  }}
                  className="text-sm text-red-500 mt-2 hover:underline"
                >
                  Remove Photo
                </button>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Full Name
                </label>
                <input 
                  disabled={!isEditing}
                  {...register("fullName")}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500" 
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Username
                </label>
                <input 
                  disabled={!isEditing}
                  {...register("username")}
                  placeholder="Enter your username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500" 
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Address
                </label>
                <input 
                  disabled={!isEditing}
                  {...register("email")}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500" 
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Phone Number
                </label>
                <input 
                  disabled={!isEditing}
                  {...register("phoneNumber")}
                  placeholder="Enter your phone number (optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500" 
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pt-6">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  style={{
                    background: "linear-gradient(135deg, #344C3D, #829672)"
                  }}
                  className="text-white font-semibold px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      reset({
                        fullName: user.fullName,
                        username: user.username,
                        email: user.email,
                        phoneNumber: user.phoneNumber,
                      });
                      setIsEditing(false);
                      setPreviewImage(null);
                      setImageFile(null);
                      setRemoveImage(false);
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSubmit(onSubmit, onInvalid)()}
                    disabled={isSubmitting}
                    style={{
                      background: "linear-gradient(135deg, #344C3D, #829672)"
                    }}
                    className="text-white font-semibold px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {isSubmitting ? 'Updating...' : 'Update Profile'}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
