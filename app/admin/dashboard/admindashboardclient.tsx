"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Users, UserCheck, Activity, TrendingUp, ArrowRight } from "lucide-react";

interface User {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  phoneNumber: string;
  role: string;
  imageUrl?: string;
  createdAt: string;
}

interface AdminDashboardClientProps {
  initialUsers: User[];
  adminUser: any;
  token: string;
}

export default function AdminDashboardClient({
  initialUsers,
  adminUser,
}: AdminDashboardClientProps) {
  const router = useRouter();

  // Calculate stats
  const stats = useMemo(() => {
    const totalUsers = initialUsers.length;
    const totalAdmins = initialUsers.filter(user => user.role === 'admin').length;
    const regularUsers = totalUsers - totalAdmins;
    
    // Get users created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = initialUsers.filter(user => 
      new Date(user.createdAt) >= thirtyDaysAgo
    ).length;

    return {
      totalUsers,
      totalAdmins,
      regularUsers,
      recentUsers
    };
  }, [initialUsers]);

  // Get 5 most recent users
  const recentUsers = useMemo(() => {
    return [...initialUsers]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [initialUsers]);

  const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/40 to-violet-50/40 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-700 to-violet-700 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-sm text-slate-600 mt-1">Welcome back, {adminUser?.fullName}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {/* Total Users */}
          <div className="bg-white/90 rounded-2xl border border-indigo-100 shadow-sm p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-indigo-100">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md">
                All accounts
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
            <p className="mt-1 text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            <p className="mt-2 text-xs text-gray-500">Includes regular users and admin users.</p>
          </div>

          {/* Regular Users */}
          <div className="bg-white/90 rounded-2xl border border-violet-100 shadow-sm p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-violet-100">
                <UserCheck className="w-6 h-6 text-violet-600" />
              </div>
              <span className="text-xs font-medium text-violet-700 bg-violet-50 px-2 py-1 rounded-md">
                Non-admin
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Regular Users</h3>
            <p className="mt-1 text-3xl font-bold text-gray-900">{stats.regularUsers}</p>
            <p className="mt-2 text-xs text-gray-500">Only standard users, excluding admins.</p>
          </div>

          {/* Admins */}
          <div className="bg-white/90 rounded-2xl border border-purple-100 shadow-sm p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-100">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-md">
                Elevated role
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Administrators</h3>
            <p className="mt-1 text-3xl font-bold text-gray-900">{stats.totalAdmins}</p>
            <p className="mt-2 text-xs text-gray-500">Users with admin-level access.</p>
          </div>

          {/* New Users (30 days) */}
          <div className="bg-white/90 rounded-2xl border border-indigo-100 shadow-sm p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-indigo-100">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md">
                Last 30 days
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">New Users</h3>
            <p className="mt-1 text-3xl font-bold text-gray-900">{stats.recentUsers}</p>
            <p className="mt-2 text-xs text-gray-500">Accounts created in the recent 30-day window.</p>
          </div>
        </div>

        {/* Recent Users Section */}
        <div className="bg-white/95 rounded-2xl border border-indigo-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-indigo-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
              <p className="text-sm text-gray-600">Latest registered users</p>
            </div>
            <button
              onClick={() => router.push("/admin/users")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-violet-700 transition-all"
            >
              View All Users
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-indigo-50/60 border-b border-indigo-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  recentUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="cursor-pointer hover:bg-indigo-50/40 transition-colors"
                      onClick={() => router.push(`/admin/users/${user._id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            {user.imageUrl ? (
                              <img
                                src={`${backendBase}${user.imageUrl}`}
                                alt={user.fullName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">${user.fullName?.charAt(0).toUpperCase()}</div>`;
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                {user.fullName?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.fullName}</div>
                            <div className="text-xs text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{user.email}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
