"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { api, ENDPOINTS } from '@/lib/api';
import { FaUserPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaUsers, FaUserTie, FaUserGraduate, FaShieldAlt, FaAngleLeft, FaAngleRight, FaCheck, FaTimes, FaEnvelope, FaUserCheck, FaUserSlash } from 'react-icons/fa';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { ROLES } from '@/lib/types';

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

const roleLabels: Record<string, { label: string; color: string; icon: JSX.Element }> = {
  admin: { label: 'Admin', color: 'bg-red-100 text-red-700', icon: <FaShieldAlt className="w-3 h-3" /> },
  recruiter: { label: 'Recruiter', color: 'bg-blue-100 text-blue-700', icon: <FaUserTie className="w-3 h-3" /> },
  applicant: { label: 'Applicant', color: 'bg-green-100 text-green-700', icon: <FaUserGraduate className="w-3 h-3" /> },
};

const initialCreateForm = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  role: 'recruiter',
};

export default function AdminUsersPage() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [submitting, setSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState('');

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (searchQuery) params.append('search', searchQuery);
      if (roleFilter) params.append('role', roleFilter);

      const response = await api.get<{ success: boolean; data: { users: User[]; pagination: { page: number; limit: number; total: number; pages: number } } }>(`${ENDPOINTS.ADMIN.USERS}?${params}`, token || undefined);
      const usersArray = response.data?.users || [];
      setUsers(Array.isArray(usersArray) ? usersArray : []);
      setTotalPages(response.data?.pagination?.pages || 1);
      setTotalUsers(response.data?.pagination?.total || usersArray.length || 0);
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch users', 'error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1);
  };

  const handleCreateUser = async () => {
    if (!createForm.email || !createForm.password || !createForm.role) {
      showToast('Email, password, and role are required', 'error');
      return;
    }
    try {
      setSubmitting(true);
      await api.post(ENDPOINTS.ADMIN.CREATE_USER, createForm, token || undefined);
      showToast('User created successfully', 'success');
      setShowCreateModal(false);
      setCreateForm(initialCreateForm);
      fetchUsers(currentPage);
    } catch (error: any) {
      showToast(error.message || 'Failed to create user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingUser) return;
    try {
      setSubmitting(true);
      await api.put(ENDPOINTS.ADMIN.UPDATE_USER_ROLE(editingUser._id), { role: editRole }, token || undefined);
      showToast('User role updated successfully', 'success');
      setEditingUser(null);
      fetchUsers(currentPage);
    } catch (error: any) {
      showToast(error.message || 'Failed to update user role', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      setSubmitting(true);
      const endpoint = user.isActive ? ENDPOINTS.ADMIN.DEACTIVATE_USER : ENDPOINTS.ADMIN.REACTIVATE_USER;
      await api.post(endpoint, { userId: user._id }, token || undefined);
      showToast(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`, 'success');
      fetchUsers(currentPage);
    } catch (error: any) {
      showToast(error.message || 'Failed to update user status', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return user.fullName?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query);
  });

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FaUsers className="text-blue-600" />
            User Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage all users in the system ({totalUsers} total)</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FaUserPlus className="w-4 h-4" />
          Create User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="recruiter">Recruiter</option>
              <option value="applicant">Applicant</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <SkeletonTable rows={5} cols={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Joined</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                            {user.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{user.fullName || 'Unknown'}</p>
                            <p className="text-slate-500 text-xs flex items-center gap-1">
                              <FaEnvelope className="w-3 h-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {user.isActive ? <FaCheck className="w-3 h-3" /> : <FaTimes className="w-3 h-3" />}
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          roleLabels[user.role]?.color || 'bg-slate-100 text-slate-600'
                        }`}>
                          {roleLabels[user.role]?.icon || <FaUserTie className="w-3 h-3" />}
                          {roleLabels[user.role]?.label || user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setEditRole(user.role);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Role"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(user)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.isActive
                                ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                            disabled={submitting}
                          >
                            {user.isActive ? <FaUserSlash className="w-4 h-4" /> : <FaUserCheck className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <FaAngleLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <FaAngleRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FaUserPlus className="text-blue-600" />
              Create New User
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={createForm.firstName}
                    onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={createForm.lastName}
                    onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password *</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Role *</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="recruiter">Recruiter</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                disabled={submitting}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FaEdit className="text-blue-600" />
              Edit User Role
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">User</label>
                <p className="text-slate-900 font-medium">{editingUser.fullName}</p>
                <p className="text-slate-500 text-sm">{editingUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="applicant">Applicant</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                disabled={submitting}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}