import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Layers,
  Calendar,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Sparkles,
  TrendingUp,
  BrainCircuit,
  ArrowUpRight
} from 'lucide-react';
import API from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute status statistics
  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'Applied').length,
    oaCleared: applications.filter(a => a.status === 'OA Cleared').length,
    interviewScheduled: applications.filter(a => a.status === 'Interview Scheduled').length,
    selected: applications.filter(a => a.status === 'Selected').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
  };

  // Job Readiness Score Calculation
  const getReadinessScore = () => {
    if (!user) return 0;
    
    // 1. Applications (30% weight) -> Target: 15 applications
    const appPoints = Math.min((applications.length / 15) * 30, 30);
    
    // 2. Skills (30% weight) -> Target: 8 skills
    const skillsPoints = Math.min(((user.skillsCount || 0) / 8) * 30, 30);
    
    // 3. Projects (20% weight) -> Target: 4 projects
    const projectsPoints = Math.min(((user.projectsCount || 0) / 4) * 20, 20);
    
    // 4. DSA Solved (20% weight) -> Target: 250 problems
    const dsaPoints = Math.min(((user.dsaQuestionsCount || 0) / 250) * 20, 20);
    
    return Math.round(appPoints + skillsPoints + projectsPoints + dsaPoints);
  };

  const readinessScore = getReadinessScore();

  // Upcoming Deadlines (with countdowns & color coding)
  const getUpcomingDeadlines = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return applications
      .filter(app => app.status !== 'Selected' && app.status !== 'Rejected')
      .map(app => {
        const deadline = new Date(app.deadlineDate);
        deadline.setHours(0, 0, 0, 0);
        const diffTime = deadline.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let colorClass = 'text-accent-emerald bg-accent-emerald/10 border-accent-emerald/30';
        let text = `${diffDays} days left`;
        
        if (diffDays < 0) {
          colorClass = 'text-accent-rose bg-accent-rose/10 border-accent-rose/30 shadow-glow-red';
          text = 'Deadline Passed';
        } else if (diffDays <= 2) {
          colorClass = 'text-accent-rose bg-accent-rose/10 border-accent-rose/30 shadow-glow-red';
          text = diffDays === 0 ? 'Due Today' : diffDays === 1 ? '1 day left' : '2 days left';
        } else if (diffDays <= 5) {
          colorClass = 'text-accent-amber bg-accent-amber/10 border-accent-amber/30 shadow-glow-orange';
          text = `${diffDays} days left`;
        }

        return { ...app, diffDays, colorClass, countdownText: text };
      })
      .sort((a, b) => a.diffDays - b.diffDays)
      .slice(0, 4); // Limit to top 4
  };

  const upcomingDeadlines = getUpcomingDeadlines();

  // Upcoming Interviews
  const getUpcomingInterviews = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return interviews
      .filter(int => new Date(int.interviewDate) >= today && int.result === 'Waiting')
      .map(int => {
        const date = new Date(int.interviewDate);
        return {
          ...int,
          formattedDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          daysAway: Math.ceil((date.getTime() - today.getTime()) / (1000 * 3600 * 24))
        };
      })
      .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate))
      .slice(0, 4);
  };

  const upcomingInterviews = getUpcomingInterviews();

  // Success Rates
  const interviewSuccessRate = () => {
    const completed = interviews.filter(i => i.result === 'Selected' || i.result === 'Rejected').length;
    if (completed === 0) return 0;
    const selected = interviews.filter(i => i.result === 'Selected').length;
    return Math.round((selected / completed) * 100);
  };

  const successRate = interviewSuccessRate();

  // Get status icon and coloring
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selected':
        return 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/30';
      case 'Rejected':
        return 'bg-accent-rose/10 text-accent-rose border-accent-rose/30';
      case 'Interview Scheduled':
        return 'bg-brand-500/10 text-brand-400 border-brand-500/30';
      case 'OA Cleared':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'Applied':
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-700';
    }
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
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6 glass-panel relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
            Welcome back, {user?.name}! <Sparkles className="ml-2 h-5 w-5 text-accent-amber animate-pulse" />
          </h2>
          <p className="text-slate-400 text-sm mt-1.5 max-w-xl">
            You're currently tracking {applications.length} applications and have interview success rate of {successRate}%. Let's secure that offer!
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3 relative z-10">
          <Link
            to="/applications/add"
            className="flex items-center px-4 py-2.5 bg-brand-600 hover:bg-brand-500 font-semibold text-xs text-white rounded-xl shadow-glow transition-all"
          >
            Add Application
          </Link>
          <Link
            to="/profile"
            className="flex items-center px-4 py-2.5 bg-dark-800 hover:bg-dark-700 border border-dark-700 font-semibold text-xs text-slate-300 rounded-xl transition-all"
          >
            Update Skills
          </Link>
        </div>
      </div>

      {/* Grid of 6 Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Applications', count: stats.total, color: 'text-brand-400 bg-brand-500/10 border-brand-500/20', icon: Briefcase },
          { label: 'Applied', count: stats.applied, color: 'text-slate-400 bg-slate-500/10 border-slate-700', icon: Clock },
          { label: 'OA Cleared', count: stats.oaCleared, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20', icon: Layers },
          { label: 'Interviews Scheduled', count: stats.interviewScheduled, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', icon: Calendar },
          { label: 'Selected / Offers', count: stats.selected, color: 'text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20 shadow-glow-green', icon: CheckCircle },
          { label: 'Rejected', count: stats.rejected, color: 'text-accent-rose bg-accent-rose/10 border-accent-rose/20', icon: XCircle }
        ].map((c, i) => (
          <div key={i} className="glass-card p-4 flex flex-col justify-between border border-dark-750">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{c.label}</span>
              <div className={`p-1.5 rounded-lg border ${c.color.split(' ')[1]} ${c.color.split(' ')[2]}`}>
                <c.icon className={`h-4 w-4 ${c.color.split(' ')[0]}`} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-white leading-none">{c.count}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Dashboard Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Job Readiness Score Box */}
        <div className="glass-card p-6 flex flex-col justify-between border-dark-750 lg:col-span-1">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center">
                <BrainCircuit className="mr-2 h-4 w-4 text-brand-400" />
                Job Readiness Score
              </h3>
              <Link to="/profile" className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center">
                Configure
                <ArrowUpRight className="ml-0.5 h-3.5 w-3.5" />
              </Link>
            </div>
            
            {/* Visual Gauge */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative h-32 w-32 flex items-center justify-center">
                {/* SVG Progress Circle */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle
                    className="text-dark-750"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  {/* Foreground Circle */}
                  <circle
                    className="text-brand-500 transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - readinessScore / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-extrabold text-white">{readinessScore}%</span>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">SCORE</p>
                </div>
              </div>

              {/* Status Descriptor */}
              <div className="mt-4 text-center">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                  readinessScore >= 80 ? 'bg-accent-emerald/10 text-accent-emerald' :
                  readinessScore >= 50 ? 'bg-accent-amber/10 text-accent-amber' :
                  'bg-accent-rose/10 text-accent-rose'
                }`}>
                  {readinessScore >= 80 ? 'Placement Ready' : readinessScore >= 50 ? 'Needs Practice' : 'Start Preparation'}
                </span>
              </div>
            </div>
          </div>

          {/* Sub-breakdown statistics */}
          <div className="border-t border-dark-700/60 pt-4 mt-2 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p className="text-slate-400 font-semibold">Skills</p>
              <p className="text-slate-200 font-bold mt-0.5">{user?.skillsCount || 0}</p>
            </div>
            <div className="border-x border-dark-700/60">
              <p className="text-slate-400 font-semibold">Projects</p>
              <p className="text-slate-200 font-bold mt-0.5">{user?.projectsCount || 0}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold">DSA</p>
              <p className="text-slate-200 font-bold mt-0.5">{user?.dsaQuestionsCount || 0}</p>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines Widget */}
        <div className="glass-card p-6 flex flex-col justify-between border-dark-750 lg:col-span-1">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center">
                <Clock className="mr-2 h-4 w-4 text-accent-rose" />
                Upcoming Deadlines
              </h3>
              <Link to="/applications" className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center">
                View All
                <ArrowUpRight className="ml-0.5 h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-slate-500 text-xs py-8 text-center">No upcoming deadlines.</p>
              ) : (
                upcomingDeadlines.map((app) => (
                  <div key={app._id} className="flex items-center justify-between p-2.5 bg-dark-950/40 border border-dark-750 rounded-xl hover:border-dark-700 transition-all">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">{app.companyName}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{app.role}</p>
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] font-bold border rounded-lg ${app.colorClass}`}>
                      {app.countdownText}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Interviews Widget */}
        <div className="glass-card p-6 flex flex-col justify-between border-dark-750 lg:col-span-1">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-indigo-400" />
                Upcoming Interviews
              </h3>
              <Link to="/interviews" className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center">
                View All
                <ArrowUpRight className="ml-0.5 h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingInterviews.length === 0 ? (
                <p className="text-slate-500 text-xs py-8 text-center">No upcoming interviews scheduled.</p>
              ) : (
                upcomingInterviews.map((int) => (
                  <div key={int._id} className="flex items-center justify-between p-2.5 bg-dark-950/40 border border-dark-750 rounded-xl hover:border-dark-700 transition-all">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">{int.companyName}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{int.role} • {int.rounds} Round(s)</p>
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-lg shrink-0">
                      {int.formattedDate}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Recent Applications & General Statistics Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications Listing */}
        <div className="glass-card p-6 border-dark-750 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Recent Applications</h3>
            <Link to="/applications" className="text-xs text-brand-400 hover:text-brand-300 font-semibold">
              View pipeline
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-dark-700 text-slate-400 font-semibold">
                  <th className="py-2.5">Company</th>
                  <th className="py-2.5">Role</th>
                  <th className="py-2.5">Package</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/60">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500">No applications added yet.</td>
                  </tr>
                ) : (
                  applications.slice(0, 5).map((app) => (
                    <tr key={app._id} className="hover:bg-dark-900/30 transition-colors">
                      <td className="py-3 font-semibold text-slate-200">{app.companyName}</td>
                      <td className="py-3 text-slate-400">{app.role}</td>
                      <td className="py-3 text-slate-200 font-medium">{app.package} LPA</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-md ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => navigate(`/applications/edit/${app._id}`)}
                          className="text-brand-400 hover:text-brand-300 font-semibold"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Success Widget */}
        <div className="glass-card p-6 flex flex-col justify-between border-dark-750 lg:col-span-1">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center mb-4">
              <TrendingUp className="mr-2 h-4 w-4 text-accent-emerald" />
              Interview Success Rate
            </h3>
            <div className="flex flex-col items-center justify-center py-6">
              <span className="text-5xl font-extrabold text-white">{successRate}%</span>
              <p className="text-xs text-slate-400 mt-2 text-center max-w-[200px]">
                Percentage of completed interviews that resulted in a "Selected" offer outcome.
              </p>
            </div>
          </div>
          <div className="border-t border-dark-700/60 pt-4 mt-2 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Interviews</span>
              <span className="text-slate-200 font-bold">{interviews.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Selected Offers</span>
              <span className="text-slate-200 font-bold text-accent-emerald">
                {interviews.filter(i => i.result === 'Selected').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Waiting Results</span>
              <span className="text-slate-200 font-bold text-accent-amber">
                {interviews.filter(i => i.result === 'Waiting').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
