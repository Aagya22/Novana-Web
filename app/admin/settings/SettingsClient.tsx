"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Camera, Save, Shield, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

interface Props {
  adminUser: any;
  token: string;
}

type SettingsTab = "profile" | "security";

export default function SettingsClient({ adminUser, token }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const [fullName, setFullName] = useState(adminUser?.fullName || "");
  const [username, setUsername] = useState(adminUser?.username || "");
  const [email, setEmail] = useState(adminUser?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(adminUser?.phoneNumber || "");
  const [imagePreview, setImagePreview] = useState(
    normalizeImageUrl(adminUser?.imageUrl)
  );
  const [isSaving, setIsSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function normalizeImageUrl(rawUrl?: string) {
    if (!rawUrl) return "";
    let value = String(rawUrl).trim();
    if (!value) return "";
    value = value.replace(/\\/g, "/");
    const uploadsIndex = value.lastIndexOf("/uploads/");
    if (uploadsIndex !== -1) {
      value = value.slice(uploadsIndex);
    }
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
    if (value.startsWith("uploads/")) value = `/${value}`;
    if (value.startsWith("./uploads/")) value = value.replace("./", "/");
    if (value.startsWith("/")) return `${backendBase}${value}`;
    return `${backendBase}/${value}`;
  }

  const applyProfileState = (nextUser: any) => {
    if (!nextUser) return;
    setFullName(nextUser.fullName || "");
    setUsername(nextUser.username || "");
    setEmail(nextUser.email || "");
    setPhoneNumber(nextUser.phoneNumber || "");
    setImagePreview(normalizeImageUrl(nextUser.imageUrl));
  };

  const refreshProfileFromServer = async () => {
    if (!token) return;

    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
      const res = await fetch(`${base}/api/auth/whoami`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!res.ok) return;
      const data = await res.json();
      if (data?.success && data?.data) {
        applyProfileState(data.data);
      }
    } catch {
     
    }
  };

  useEffect(() => {
    refreshProfileFromServer();
  
  }, [token]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
      const form = new FormData(e.currentTarget as HTMLFormElement);

      const res = await fetch(`${base}/api/auth/update-profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      if (data?.data) {
        applyProfileState(data.data);
      }

      await refreshProfileFromServer();
      toast.success("Profile updated successfully", { autoClose: 3000 });

      setTimeout(() => {
        router.refresh();
      }, 300);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      setIsChangingPassword(true);
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

      const res = await fetch(`${base}/api/auth/change-password`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update password");

      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-700 to-violet-700 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-600">Manage profile settings and privacy/security options.</p>
      </div>

      <div className="bg-white/95 rounded-2xl border border-indigo-100 shadow-sm p-2 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === "profile"
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                : "bg-indigo-50/50 text-slate-700 hover:bg-indigo-50"
            }`}
          >
            <User className="w-4 h-4" />
            Profile Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === "security"
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                : "bg-indigo-50/50 text-slate-700 hover:bg-indigo-50"
            }`}
          >
            <Shield className="w-4 h-4" />
            Privacy & Security
          </button>
        </div>
      </div>

      {activeTab === "profile" && (
        <div className="bg-white/95 rounded-2xl border border-indigo-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 sm:px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
            <p className="text-indigo-100 mt-1">Update your profile information and photo.</p>
          </div>

          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 mx-auto mb-4 border-4 border-white shadow-sm">
                    {imagePreview ? (
                      <img src={imagePreview} className="w-full h-full object-cover" alt="Profile preview" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                        {adminUser?.fullName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 cursor-pointer shadow-sm transition-colors">
                    <Camera className="w-5 h-5" />
                    <input
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-slate-600">Click the camera icon to change your profile picture</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  <input
                    name="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Username
                  </label>
                  <input
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-colors"
                    placeholder="Enter your username"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-colors"
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  <input
                    name="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-colors"
                    placeholder="Enter your phone number (optional)"
                  />
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold px-8 py-3 rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="bg-white/95 rounded-2xl border border-indigo-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 sm:px-8 py-6">
              <h2 className="text-2xl font-bold text-white">Privacy & Security</h2>
              <p className="text-indigo-100 mt-1">Update your password and secure your admin account.</p>
            </div>

            <div className="p-6 sm:p-8">
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full pl-11 pr-12 py-3 border border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full pl-11 pr-12 py-3 border border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full pl-11 pr-12 py-3 border border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:from-indigo-700 hover:to-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <Shield className="w-4 h-4" />
                    {isChangingPassword ? "Updating Password..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="bg-white/95 rounded-2xl border border-indigo-100 shadow-sm p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Security Recommendations</h3>
            <ul className="space-y-2 text-sm text-slate-600 list-disc pl-5">
              <li>Use a strong password with at least 8 characters.</li>
              <li>Avoid reusing passwords from other platforms.</li>
              <li>Update your password periodically to keep your account secure.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
