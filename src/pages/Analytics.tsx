import React from 'react';
import { BarChart3, TrendingUp, Users, Building, Download } from 'lucide-react';

export const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Placement Analytics</h1>
          <p className="text-slate-400 mt-1">Institutional insights and performance metrics for the current season.</p>
        </div>
        <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg font-medium border border-slate-700 transition-colors">
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex items-center space-x-4">
          <div className="p-3 bg-srm-500/10 text-srm-400 rounded-lg">
            <Building className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm text-slate-400">Total Companies</div>
            <div className="text-2xl font-bold text-white">45</div>
          </div>
        </div>
        
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm text-slate-400">Students Placed</div>
            <div className="text-2xl font-bold text-white">842</div>
          </div>
        </div>
        
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm text-slate-400">Avg Package (LPA)</div>
            <div className="text-2xl font-bold text-white">8.5</div>
          </div>
        </div>
        
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex items-center space-x-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm text-slate-400">Highest Package (LPA)</div>
            <div className="text-2xl font-bold text-white">42.0</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department breakdown mock */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Placement by Department</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">Computer Science (CSE)</span>
                <span className="text-white font-medium">85%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-srm-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">Information Technology (IT)</span>
                <span className="text-white font-medium">78%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-srm-500 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">Electronics (ECE)</span>
                <span className="text-white font-medium">65%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-srm-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top skills mock */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Most Demanded Skills</h2>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm border border-slate-700">React (120 jobs)</span>
            <span className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm border border-slate-700">Python (95 jobs)</span>
            <span className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm border border-slate-700">Java (88 jobs)</span>
            <span className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm border border-slate-700">Machine Learning (60 jobs)</span>
            <span className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm border border-slate-700">AWS (55 jobs)</span>
            <span className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm border border-slate-700">Node.js (50 jobs)</span>
            <span className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm border border-slate-700">SQL (45 jobs)</span>
            <span className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm border border-slate-700">Docker (40 jobs)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
