"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { FaUser, FaUserTie, FaUserShield, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

const mockUsers = [
  { id: '1', name: 'Jane Mukamana', email: 'jane@email.com', role: 'applicant', status: 'active', joined: '2024-01-15' },
  { id: '2', name: 'TechCorp Rwanda', email: 'hr@techcorp.rw', role: 'recruiter', status: 'active', joined: '2024-02-20' },
  { id: '3', name: 'Patrick Habimana', email: 'patrick@email.com', role: 'applicant', status: 'pending', joined: '2024-03-10' },
  { id: '4', name: 'Admin User', email: 'admin@umurava.ai', role: 'admin', status: 'active', joined: '2024-01-01' },
];

export default function AdminUsersPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredUsers = mockUsers.filter(u => {
    const matchesFilter = filter === 'all' || u.role === filter;
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const roleIcons: Record<string, JSX.Element> = {
    applicant: <FaUser className="text-blue-500" />,
    recruiter: <FaUserTie className="text-emerald-500" />,
    admin: <FaUserShield className="text-red-500" />,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight">User Management</h1>
        <p className="text-slate-500 mt-2">Manage platform users and permissions</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-4" />
        </div>
        <div className="flex gap-2">
          {['all', 'applicant', 'recruiter', 'admin'].map((role) => (
            <button key={role} onClick={() => setFilter(role)}
              className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${filter === role ? 'bg-blue-500 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredUsers.map((user, i) => (
          <motion.div key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                    {roleIcons[user.role]}
                  </div>
                  <div>
                    <h3 className="font-bold">{user.name}</h3>
                    <p className="text-sm text-slate-500">{user.email}</p>
                    <p className="text-xs text-slate-400">Joined: {user.joined}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${user.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {user.status}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-100 text-slate-600 capitalize">
                    {user.role}
                  </span>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg hover:bg-slate-100"><FaEdit className="text-slate-400" /></button>
                    <button className="p-2 rounded-lg hover:bg-red-50"><FaTrash className="text-red-400" /></button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
