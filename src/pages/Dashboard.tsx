import React from 'react';
import { Users, Briefcase, FileText, CheckCircle, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { UserRole } from '../types';

const Dashboard: React.FC = () => {
  const { userRole } = useOutletContext<{ userRole: UserRole }>();

  // Mock data for the dashboard
  const stats = [
    { name: 'Active Job Drives', value: '12', icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { name: 'Total Applicants', value: '4,821', icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { name: 'Resumes Processed', value: '3,904', icon: FileText, color: 'text-srm-400', bg: 'bg-srm-400/10' },
    { name: 'Shortlisted Candidates', value: '842', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  const recentActivity = [
    { id: 1, type: 'screening', text: 'AI Screening completed for ABC Tech - Software Engineer', time: '10 mins ago', status: 'success' },
    { id: 2, type: 'upload', text: 'Dr. Smith uploaded 150 resumes for CSE Dept', time: '1 hour ago', status: 'info' },
    { id: 3, type: 'job', text: 'New placement drive added: XYZ Corp Data Scientist', time: '3 hours ago', status: 'info' },
    { id: 4, type: 'alert', text: 'System detected 5 corrupted resumes in recent batch', time: '5 hours ago', status: 'warning' },
  ];

  const upcomingDrives = [
    { id: 1, company: 'Google', role: 'SDE Intern', date: 'Oct 15, 2026', applicants: 1250, screened: 1000 },
    { id: 2, company: 'Microsoft', role: 'Program Manager', date: 'Oct 18, 2026', applicants: 850, screened: 850 },
    { id: 3, company: 'Amazon', role: 'AWS Solutions Architect', date: 'Oct 22, 2026', applicants: 920, screened: 400 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back, Placement Officer</h1>
          <p className="text-slate-400 mt-1">Here's an overview of the current placement season.</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-800/50 p-1.5 rounded-lg border border-slate-700/50">
          <span className="px-3 py-1 rounded-md bg-srm-600 text-white text-sm font-medium shadow-sm">Fall 2026</span>
          <span className="px-3 py-1 rounded-md text-slate-300 text-sm font-medium hover:text-white cursor-pointer transition-colors">Spring 2027</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="relative bg-slate-900 pt-5 px-4 pb-6 sm:pt-6 sm:px-6 rounded-xl border border-slate-800 shadow-sm overflow-hidden hover:border-slate-700 transition-colors">
            <dt>
              <div className={`absolute rounded-lg p-3 ${item.bg}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-slate-400 truncate">{item.name}</p>
            </dt>
            <dd className="ml-16 pb-2 flex items-baseline sm:pb-3">
              <p className="text-2xl font-semibold text-white">{item.value}</p>
            </dd>
            {/* Decorative background element */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl pointer-events-none"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Drives */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-srm-400" />
              Active Placement Drives
            </h2>
            <button className="text-sm font-medium text-srm-400 hover:text-srm-300 transition-colors">View All</button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Company & Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Progress</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900">
                {upcomingDrives.map((drive) => {
                  const progress = Math.round((drive.screened / drive.applicants) * 100);
                  return (
                    <tr key={drive.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded bg-slate-800 flex items-center justify-center text-white font-bold border border-slate-700">
                            {drive.company.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{drive.company}</div>
                            <div className="text-sm text-slate-400">{drive.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">{drive.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full max-w-xs">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">{drive.screened} / {drive.applicants} screened</span>
                            <span className="text-white font-medium">{progress}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5">
                            <div className="bg-srm-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-srm-400 hover:text-srm-300 transition-colors bg-srm-400/10 hover:bg-srm-400/20 px-3 py-1.5 rounded-md">Manage</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Clock className="mr-2 h-5 w-5 text-slate-400" />
              Recent Activity
            </h2>
          </div>
          <div className="p-6 flex-1">
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== recentActivity.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-800" aria-hidden="true"></span>
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-slate-900
                            ${activity.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 
                              activity.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : 
                              'bg-blue-500/20 text-blue-400'}`}
                          >
                            {activity.status === 'success' ? <CheckCircle className="h-4 w-4" /> : 
                             activity.status === 'warning' ? <AlertCircle className="h-4 w-4" /> : 
                             <FileText className="h-4 w-4" />}
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-slate-300">{activity.text}</p>
                          </div>
                          <div className="whitespace-nowrap text-right text-xs text-slate-500">
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <button className="w-full text-center text-sm font-medium text-slate-400 hover:text-white transition-colors">View All Activity</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
