"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  const userId = params?.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push("/admin/users")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6 transition-all group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Users</span>
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">User Details</h1>
            <p className="text-gray-600">View complete information about this user</p>
          </div>
          <button
            onClick={() => router.push(`/admin/users/${userId}/edit`)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl w-full md:w-auto"
          >
            <Edit className="w-5 h-5" />
            Edit User
          </button>
        </div>

        {/* User Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 border border-gray-100 p-8">
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
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{user.fullName}</h2>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-gray-600">@{user.username}</span>
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                    user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
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
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-indigo-600" />
              </div>
              Contact Information
            </h3>
            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <p className="text-gray-900 font-mono text-sm">{user.email}</p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <p className="text-gray-900 font-mono text-sm">{user.phoneNumber}</p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  <UserIcon className="w-4 h-4" />
                  Username
                </label>
                <p className="text-gray-900 font-mono text-sm">{user.username}</p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              Account Information
            </h3>
            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  <Shield className="w-4 h-4" />
                  Role
                </label>
                <p className="text-gray-900 capitalize font-semibold">{user.role}</p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  Created At
                </label>
                <p className="text-gray-900 text-sm">
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
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  Last Updated
                </label>
                <p className="text-gray-900 text-sm">
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
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Additional Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-gray-50 rounded-xl">
              <p className="text-sm font-medium text-gray-500 mb-2">User ID</p>
              <p className="text-xs font-mono text-gray-900 break-all">{user._id}</p>
            </div>
            <div className="p-5 bg-gray-50 rounded-xl">
              <p className="text-sm font-medium text-gray-500 mb-2">Account Status</p>
              <p className="text-sm font-bold text-green-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Active
              </p>
            </div>
            <div className="p-5 bg-gray-50 rounded-xl">
              <p className="text-sm font-medium text-gray-500 mb-2">Profile Image</p>
              <p className="text-sm font-semibold text-gray-900">
                {user.imageUrl ? "✓ Uploaded" : "Not Set"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
