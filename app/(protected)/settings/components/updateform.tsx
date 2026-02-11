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
    <form onSubmit={handleSubmit(onSubmit)} className="w-full bg-white p-6">
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          {previewImage ? (
            <img src={previewImage} className="w-16 h-16 rounded-full object-cover" />
          ) : user.imageUrl && !removeImage ? (
            // plain img for simplicity
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${user.imageUrl}`}
              alt="avatar"
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
              {user.fullName?.[0] || user.username?.[0] || "U"}
            </div>
          )}

          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!isEditing}
              className={`text-sm ${!isEditing ? "text-gray-300 cursor-not-allowed" : "text-green-600"}`}
            >
              Upload
            </button>
            {(user.imageUrl || previewImage) && isEditing && (
              <button
                type="button"
                onClick={() => {
                  setPreviewImage(null);
                  setImageFile(null);
                  setRemoveImage(true);
                }}
                className="text-sm text-red-500"
              >
                Remove
              </button>
            )}
            <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleImageChange} />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Profile</h2>
              <p className="text-sm text-gray-500">Personal information visible to others</p>
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-sm text-green-600"
              >
                Edit
              </button>
            ) : null}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <input
              disabled={!isEditing}
              {...register("fullName")}
              placeholder="Full name"
              className="w-full bg-transparent border-b border-gray-200 py-2 px-1 text-sm focus:outline-none focus:border-green-500"
            />

            <input
              disabled={!isEditing}
              {...register("username")}
              placeholder="Username"
              className="w-full bg-transparent border-b border-gray-200 py-2 px-1 text-sm focus:outline-none focus:border-green-500"
            />

            <input
              disabled={!isEditing}
              {...register("email")}
              placeholder="Email"
              className="w-full bg-transparent border-b border-gray-200 py-2 px-1 text-sm focus:outline-none focus:border-green-500"
            />

            <input
              disabled={!isEditing}
              {...register("phoneNumber")}
              placeholder="Phone"
              className="w-full bg-transparent border-b border-gray-200 py-2 px-1 text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          {isEditing && (
            <div className="mt-6 flex items-center gap-3">
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
                className="text-sm text-gray-600"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleSubmit(onSubmit, onInvalid)()}
                disabled={isSubmitting}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
