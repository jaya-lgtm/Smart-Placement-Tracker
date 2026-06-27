import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, LineChart as LineIcon } from 'lucide-react';
import API from '../utils/api';

const Analytics = () => {
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appRes, intRes] = await Promise.all([
          API.get('/applications'),
          API.get('/interviews')
        ]);
        setApplications(appRes.data);
        setInterviews(intRes.data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 1. Application Status Distribution (Pie Chart)
  const getStatusData = () => {
    const counts = {
      'Applied': 0,
      'OA Cleared': 0,
      'Interview Scheduled': 0,
      'Selected': 0,
      'Rejected': 0
    };
    applications.forEach(app => {
      if (counts[app.status] !== undefined) {
        counts[app.status]++;
      }
    });

    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    })).filter(item => item.value > 0);
  };

  const statusData = getStatusData();
  const STATUS_COLORS = {
    'Applied': '#6b7280',            // Gray
    'OA Cleared': '#0ea5e9',          // Sky
    'Interview Scheduled': '#6366f1', // Indigo
    'Selected': '#10b981',            // Emerald
    'Rejected': '#ef4444'             // Rose
  };

  // 2. Applications per Month (Bar Chart)
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCounts = {};

    applications.forEach(app => {
      const date = new Date(app.appliedDate);
      const monthName = months[date.getMonth()];
      const year = date.getFullYear();
      const label = `${monthName} ${year}`;
      
      monthlyCounts[label] = (monthlyCounts[label] || 0) + 1;
    });

    // Sort key chronologically: extract date from "Month Year"
    return Object.keys(monthlyCounts)
      .map(key => {
        const [mName, yStr] = key.split(' ');
        const mIdx = months.indexOf(mName);
        return { label: key, count: monthlyCounts[key], dateObj: new Date(Number(yStr), mIdx, 1) };
      })
      .sort((a, b) => a.dateObj - b.dateObj)
      .map(item => ({ name: item.label, Applications: item.count }));
  };

  const monthlyData = getMonthlyData();

  // 3. Placement Progress Over Time (Line Chart)
  const getTimelineData = () => {
    // Sort applications by appliedDate
    const sortedApps = [...applications].sort((a, b) => new Date(a.appliedDate) - new Date(b.appliedDate));
    
    let cumulative = 0;
    return sortedApps.map(app => {
      cumulative++;
      return {
        date: new Date(app.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        Applications: cumulative
      };
    });
  };

  const timelineData = getTimelineData();

  // 4. Interview Success Outcomes (Pie Chart)
  const getInterviewOutcomeData = () => {
    const counts = { 'Selected': 0, 'Rejected': 0, 'Waiting': 0 };
    interviews.forEach(int => {
      if (counts[int.result] !== undefined) {
        counts[int.result]++;
      }
    });

    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    })).filter(item => item.value > 0);
  };

  const interviewOutcomeData = getInterviewOutcomeData();
  const INTERVIEW_COLORS = {
    'Selected': '#10b981', // Emerald
    'Rejected': '#ef4444', // Rose
    'Waiting': '#f59e0b'   // Amber
  };

  // Custom tooltips styling for dark mode
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-900 border border-dark-700 p-3 rounded-lg text-xs shadow-xl">
          {label && <p className="font-bold text-white mb-1.5">{label}</p>}
          {payload.map((pld, index) => (
            <p key={index} style={{ color: pld.color || pld.fill }} className="font-medium">
              {pld.name}: {pld.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview stats info */}
      <div>
        <h2 className="text-xl font-bold text-white">Placement Analytics</h2>
        <p className="text-xs text-slate-400 mt-1">Data-driven visualizations of your placement pipeline performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="glass-card p-5 border-dark-750 flex flex-col justify-between min-h-[350px]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center mb-4">
              <PieIcon className="mr-2 h-4.5 w-4.5 text-brand-400" />
              Application Status Distribution
            </h3>
          </div>
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6">
            {statusData.length === 0 ? (
              <p className="text-slate-500 text-xs py-10">No application data to display.</p>
            ) : (
              <>
                <div className="h-[220px] w-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 text-xs">
                  {statusData.map((entry, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[entry.name] }} />
                      <span className="text-slate-400">{entry.name}</span>
                      <span className="text-slate-200 font-bold">({entry.value})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Monthly Activity */}
        <div className="glass-card p-5 border-dark-750 flex flex-col justify-between min-h-[350px]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center mb-4">
              <BarChart3 className="mr-2 h-4.5 w-4.5 text-sky-400" />
              Applications per Month
            </h3>
          </div>
          <div className="flex-1 min-h-[220px] w-full">
            {monthlyData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">No monthly data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} />
                  <YAxis stroke="#6b7280" fontSize={10} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Applications" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Cumulative progress */}
        <div className="glass-card p-5 border-dark-750 flex flex-col justify-between min-h-[350px]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center mb-4">
              <LineIcon className="mr-2 h-4.5 w-4.5 text-indigo-400" />
              Placement Progress (Cumulative Applications)
            </h3>
          </div>
          <div className="flex-1 min-h-[220px] w-full">
            {timelineData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">No timeline data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickLine={false} />
                  <YAxis stroke="#6b7280" fontSize={10} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="Applications" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, stroke: '#6366f1', fill: '#0b0f19' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Interview Outcomes Success Rate chart */}
        <div className="glass-card p-5 border-dark-750 flex flex-col justify-between min-h-[350px]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center mb-4">
              <TrendingUp className="mr-2 h-4.5 w-4.5 text-accent-emerald" />
              Interview Success Distribution
            </h3>
          </div>
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6">
            {interviewOutcomeData.length === 0 ? (
              <p className="text-slate-500 text-xs py-10">No interview data to display.</p>
            ) : (
              <>
                <div className="h-[220px] w-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={interviewOutcomeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {interviewOutcomeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={INTERVIEW_COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 text-xs">
                  {interviewOutcomeData.map((entry, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: INTERVIEW_COLORS[entry.name] }} />
                      <span className="text-slate-400">{entry.name}</span>
                      <span className="text-slate-200 font-bold">({entry.value})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
