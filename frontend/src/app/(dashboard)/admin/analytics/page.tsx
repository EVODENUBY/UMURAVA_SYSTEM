"use client";

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { FaChartLine, FaUsers, FaBriefcase, FaRobot } from 'react-icons/fa';

export default function AdminAnalyticsPage() {
  const monthlyData = [
    { month: 'Jan', users: 120, jobs: 45, hires: 12 },
    { month: 'Feb', users: 180, jobs: 52, hires: 18 },
    { month: 'Mar', users: 250, jobs: 68, hires: 24 },
    { month: 'Apr', users: 320, jobs: 75, hires: 31 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight">Analytics</h1>
        <p className="text-slate-500 mt-2">Platform performance metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: '$45,230', change: '+18%', icon: <FaChartLine />, color: 'bg-blue-500' },
          { label: 'Active Users', value: '2,847', change: '+12%', icon: <FaUsers />, color: 'bg-emerald-500' },
          { label: 'Posted Jobs', value: '456', change: '+8%', icon: <FaBriefcase />, color: 'bg-purple-500' },
          { label: 'AI Screenings', value: '1,234', change: '+23%', icon: <FaRobot />, color: 'bg-amber-500' },
        ].map((stat, i) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center text-white`}>{stat.icon}</div>
              <div>
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="text-xs font-bold text-slate-400 uppercase">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-black uppercase tracking-tight">Monthly Trends</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider pb-4">Month</th>
                  <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider pb-4">New Users</th>
                  <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider pb-4">Jobs Posted</th>
                  <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider pb-4">Successful Hires</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((row) => (
                  <tr key={row.month} className="border-b border-slate-50">
                    <td className="py-4 font-bold">{row.month}</td>
                    <td className="py-4 text-slate-600">{row.users}</td>
                    <td className="py-4 text-slate-600">{row.jobs}</td>
                    <td className="py-4 text-emerald-500 font-bold">{row.hires}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
