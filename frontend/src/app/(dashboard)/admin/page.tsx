"use client";

import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { FaUsers, FaBriefcase, FaRobot, FaChartBar, FaArrowUp, FaArrowDown } from 'react-icons/fa';

export default function AdminDashboard() {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Users', value: '2,847', change: '+12%', up: true, icon: <FaUsers />, color: 'bg-blue-500' },
    { label: 'Active Jobs', value: '456', change: '+8%', up: true, icon: <FaBriefcase />, color: 'bg-emerald-500' },
    { label: 'AI Screenings', value: '1,234', change: '+23%', up: true, icon: <FaRobot />, color: 'bg-purple-500' },
    { label: 'Success Rate', value: '87%', change: '-2%', up: false, icon: <FaChartBar />, color: 'bg-amber-500' },
  ];

  const recentUsers = [
    { name: 'Jane Mukamana', email: 'jane@email.com', role: 'Applicant', status: 'Active' },
    { name: 'TechCorp Rwanda', email: 'hr@techcorp.rw', role: 'Recruiter', status: 'Active' },
    { name: 'Patrick Habimana', email: 'patrick@email.com', role: 'Applicant', status: 'Pending' },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black uppercase tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-500 mt-2">Platform overview and management</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center text-white`}>
                  {stat.icon}
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${stat.up ? 'text-emerald-500' : 'text-red-500'}`}>
                  {stat.up ? <FaArrowUp /> : <FaArrowDown />} {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-black">{stat.value}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardContent>
            <h2 className="text-xl font-black uppercase tracking-tight mb-6">Recent Users</h2>
            <div className="space-y-4">
              {recentUsers.map((user, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold" style={{ color: '#2b71f0' }}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400">{user.role}</p>
                    <p className={`text-[10px] font-bold uppercase ${user.status === 'Active' ? 'text-emerald-500' : 'text-amber-500'}`}>{user.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-xl font-black uppercase tracking-tight mb-6">Platform Health</h2>
            <div className="space-y-4">
              {[
                { label: 'API Response Time', value: 98, status: 'Excellent' },
                { label: 'Database Performance', value: 95, status: 'Good' },
                { label: 'AI Service Uptime', value: 99, status: 'Excellent' },
                { label: 'Security Score', value: 100, status: 'Perfect' },
              ].map((metric, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold">{metric.label}</span>
                    <span className="text-xs font-bold text-emerald-500">{metric.status}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${metric.value}%`, backgroundColor: '#2b71f0' }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
