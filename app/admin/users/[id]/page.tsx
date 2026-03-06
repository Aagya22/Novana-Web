"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Edit, Mail, Phone, User as UserIcon, Calendar, Shield } from "lucide-react";
import { toast } from "react-toastify";

interface User {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  phoneNumber: string;
  role: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params?.id as string;
  const refreshKey = searchParams?.get("refresh");
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, refreshKey]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
      
      const res = await fetch(`${base}/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const data = await res.json();
      
      if (data.success) {
        setUser(data.data);
      } else {
        toast.error(data.message || "Failed to fetch user");
        router.push("/admin/users");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to fetch user");
      router.push("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  const normalizeImageUrl = (rawUrl?: string) => {
    if (!rawUrl) return "";
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) return rawUrl;
    const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
    if (rawUrl.startsWith("/")) return `${backendBase}${rawUrl}`;
    return `${backendBase}/${rawUrl}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/40 to-violet-50/40 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-slate-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/40 to-violet-50/40 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-600">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/40 to-violet-50/40 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push("/admin/users")}
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 mb-6 transition-all group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Users</span>
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-700 to-violet-700 bg-clip-text text-transparent mb-1">
              User Details
            </h1>
            <p className="text-slate-600">View complete information about this user</p>
          </div>
          <button
            onClick={() => router.push(`/admin/users/${userId}/edit`)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 transition-all shadow-sm w-full md:w-auto"
          >
            <Edit className="w-5 h-5" />
            Edit User
          </button>
        </div>

        {/* User Profile Card */}
        <div className="bg-white/95 rounded-2xl shadow-sm mb-6 border border-indigo-100 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gray-200 flex-shrink-0 ring-4 ring-white shadow-md">
              {!avatarFailed && user.imageUrl ? (
                <img
                  src={normalizeImageUrl(user.imageUrl)}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-4xl">
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{user.fullName}</h2>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-slate-600">@{user.username}</span>
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                    user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-indigo-100 text-indigo-800"
                  }`}
                >
                  {user.role.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Contact Information */}
          <div className="bg-white/95 rounded-2xl shadow-sm p-6 sm:p-8 border border-indigo-100">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-indigo-600" />
              </div>
              Contact Information
            </h3>
            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <p className="text-slate-900 font-mono text-sm">{user.email}</p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <p className="text-slate-900 font-mono text-sm">{user.phoneNumber}</p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
                  <UserIcon className="w-4 h-4" />
                  Username
                </label>
                <p className="text-slate-900 font-mono text-sm">{user.username}</p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white/95 rounded-2xl shadow-sm p-6 sm:p-8 border border-indigo-100">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-violet-600" />
              </div>
              Account Information
            </h3>
            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
                  <Shield className="w-4 h-4" />
                  Role
                </label>
                <p className="text-slate-900 capitalize font-semibold">{user.role}</p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  Created At
                </label>
                <p className="text-slate-900 text-sm">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  Last Updated
                </label>
                <p className="text-slate-900 text-sm">
                  {new Date(user.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-white/95 rounded-2xl shadow-sm p-6 sm:p-8 border border-indigo-100">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Additional Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-indigo-50/60 border border-indigo-100 rounded-xl">
              <p className="text-sm font-medium text-slate-500 mb-2">User ID</p>
              <p className="text-xs font-mono text-slate-900 break-all">{user._id}</p>
            </div>
            <div className="p-5 bg-indigo-50/60 border border-indigo-100 rounded-xl">
              <p className="text-sm font-medium text-slate-500 mb-2">Account Status</p>
              <p className="text-sm font-bold text-green-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Active
              </p>
            </div>
            <div className="p-5 bg-indigo-50/60 border border-indigo-100 rounded-xl">
              <p className="text-sm font-medium text-slate-500 mb-2">Profile Image</p>
              <p className="text-sm font-semibold text-slate-900">
                {user.imageUrl ? "✓ Uploaded" : "Not Set"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
