"use client";

import React, { useState, useMemo } from "react";
import { Search, UserPlus, Edit2, Trash2, X, Eye, EyeOff } from "lucide-react";

interface User {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  phoneNumber: string;
  role: string;
}

interface AdminDashboardClientProps {
  initialUsers: User[];
  adminUser: any;
  token: string;
}

export default function AdminDashboardClient({
  initialUsers,
  adminUser,
  token,
}: AdminDashboardClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        user.phoneNumber.includes(query) ||
        user.role.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const handleCreateUser = async (formData: FormData) => {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
      
      const password = formData.get("password") as string;
      
      const userData = {
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        username: formData.get("username"),
        password: password,
        confirmPassword: password, // Add confirmPassword with same value as password
        phoneNumber: formData.get("phoneNumber"),
      };
      
      console.log("Creating user with data:", userData);
      console.log("API URL:", `${base}/api/admin/users`);
      
      const res = await fetch(`${base}/api/admin/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      console.log("Response status:", res.status);
      
      const responseData = await res.json();
      console.log("Response data:", responseData);

      if (!res.ok) {
        // Handle both error formats from backend
        let errorMessage = "Failed to create user";
        
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.errors) {
          // Handle zod error format
          const zodErrors = responseData.errors;
          if (zodErrors.fieldErrors) {
            errorMessage = Object.entries(zodErrors.fieldErrors)
              .map(([field, errors]: [string, any]) => `${field}: ${errors.join(", ")}`)
              .join("; ");
          } else if (zodErrors.formErrors) {
            errorMessage = zodErrors.formErrors.join(", ");
          }
        }
        
        throw new Error(errorMessage);
      }

      setUsers([...users, responseData.data]);
      setIsCreateModalOpen(false);
      setShowPassword(false);
      alert("User created successfully!");
    } catch (error: any) {
      console.error("Create user error:", error);
      alert(`Failed to create user: ${error.message}`);
    }
  };

  const handleUpdateUser = async (formData: FormData) => {
    if (!selectedUser) return;

    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
      const updateData = {
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        username: formData.get("username"),
        phoneNumber: formData.get("phoneNumber"),
      };

      console.log("Updating user with data:", updateData);

      const res = await fetch(`${base}/api/admin/users/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const responseData = await res.json();
      console.log("Update response:", responseData);

      if (!res.ok) {
        // Handle both error formats from backend
        let errorMessage = "Failed to update user";
        
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.errors) {
          // Handle zod error format
          const zodErrors = responseData.errors;
          if (zodErrors.fieldErrors) {
            errorMessage = Object.entries(zodErrors.fieldErrors)
              .map(([field, errors]: [string, any]) => `${field}: ${errors.join(", ")}`)
              .join("; ");
          } else if (zodErrors.formErrors) {
            errorMessage = zodErrors.formErrors.join(", ");
          }
        }
        
        throw new Error(errorMessage);
      }

      setUsers(users.map((u) => (u._id === selectedUser._id ? responseData.data : u)));
      setIsEditModalOpen(false);
      setSelectedUser(null);
      alert("User updated successfully!");
    } catch (error: any) {
      console.error("Update user error:", error);
      alert(`Failed to update user: ${error.message}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    setIsDeleting(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
      const res = await fetch(`${base}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete user");
      }

      setUsers(users.filter((u) => u._id !== userId));
      alert("User deleted successfully!");
    } catch (error) {
      alert("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Sora:wght@300;400;600;700&display=swap');
        
        * {
          font-family: 'Sora', sans-serif;
        }
        
        .mono {
          font-family: 'Space Mono', monospace;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .table-row-hover {
          transition: all 0.2s ease;
        }
        
        .table-row-hover:hover {
          background: rgba(79, 70, 229, 0.05);
          transform: translateX(4px);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
          background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4);
        }
        
        .input-field {
          transition: all 0.2s ease;
        }
        
        .input-field:focus {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
        }
      `}</style>

      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Header */}
        <header className="mb-8 animate-slide-in">
          <div className="glass-effect rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600 mt-1 mono">
                  Manage your users with ease
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-2 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {adminUser?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-gray-800">{adminUser?.fullName}</div>
                    <div className="text-gray-500 mono text-xs">{adminUser?.role}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to logout?")) {
                      document.cookie.split(";").forEach((c) => {
                        document.cookie = c
                          .replace(/^ +/, "")
                          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                      });
                      window.location.href = "/admin/login";
                    }
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all hover:shadow-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Search and Actions Bar */}
        <div className="mb-6 glass-effect rounded-2xl p-4 shadow-lg animate-slide-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users by name, email, username, phone, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent input-field bg-white"
              />
            </div>

            {/* Create User Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 justify-center shadow-lg"
            >
              <UserPlus className="w-5 h-5" />
              <span>Create User</span>
            </button>
          </div>

          {/* Search Results Count */}
          {searchQuery && (
            <div className="mt-3 text-sm text-gray-600 mono animate-fade-in">
              Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Users Table */}
        <section className="glass-effect rounded-2xl shadow-lg overflow-hidden animate-slide-in" style={{ animationDelay: '0.2s' }}>
          <div className="p-6 border-b border-gray-200 bg-white bg-opacity-50">
            <h2 className="text-xl font-bold text-gray-800">
              Users ({filteredUsers.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <tr className="text-left text-sm font-semibold text-gray-700">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Username</th>
                  <th className="py-4 px-6">Phone</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user._id}
                    className="border-t border-gray-100 table-row-hover"
                    style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                  >
                    <td className="py-4 px-6 font-medium text-gray-800">{user.fullName}</td>
                    <td className="py-4 px-6 text-gray-600 mono text-sm">{user.email}</td>
                    <td className="py-4 px-6 text-gray-600 mono text-sm">{user.username}</td>
                    <td className="py-4 px-6 text-gray-600 mono text-sm">{user.phoneNumber}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit user"
                        >
                          <Edit2 className="w-4 h-4 text-indigo-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={isDeleting}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">
                          {searchQuery ? "No users found matching your search" : "No users found"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <UserModal
          title="Create New User"
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateUser}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          isEditMode={false}
        />
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <UserModal
          title="Edit User"
          user={selectedUser}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          onSubmit={handleUpdateUser}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          isEditMode={true}
        />
      )}
    </div>
  );
}

interface UserModalProps {
  title: string;
  user?: User;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  isEditMode?: boolean;
}

function UserModal({ title, user, onClose, onSubmit, showPassword, setShowPassword, isEditMode = false }: UserModalProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-in">
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                defaultValue={user?.fullName}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 input-field"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                defaultValue={user?.email}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 input-field mono"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                defaultValue={user?.username}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 input-field mono"
                placeholder="johndoe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                defaultValue={user?.phoneNumber}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 input-field mono"
                placeholder="+1234567890"
              />
            </div>

            {/* Only show password field when creating new user */}
            {!isEditMode && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    minLength={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 input-field mono pr-12"
                    placeholder="Enter password (min 8 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-500" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
            >
              {user ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}