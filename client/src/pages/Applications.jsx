import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Briefcase,
  ExternalLink,
  Edit2,
  Trash2,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import API from '../utils/api';
import { NotificationContext } from '../context/NotificationContext';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [deadlineStatus, setDeadlineStatus] = useState('');
  const [packageRange, setPackageRange] = useState('All'); // 'All', '0-5', '5-10', '10-20', '20+'
  const [sortBy, setSortBy] = useState('appliedDate');
  const [sortOrder, setSortOrder] = useState('desc');

  const { notifySuccess, notifyError, triggerRefresh } = useContext(NotificationContext);
  const navigate = useNavigate();

  const fetchApplications = async () => {
    setLoading(true);
    try {
      let queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (status && status !== 'All') queryParams.append('status', status);
      if (deadlineStatus) queryParams.append('deadlineStatus', deadlineStatus);
      
      // Handle package range filter
      if (packageRange !== 'All') {
        const [min, max] = packageRange.split('-');
        if (min) queryParams.append('packageMin', min);
        if (max) queryParams.append('packageMax', max);
      }

      queryParams.append('sortBy', sortBy);
      queryParams.append('sortOrder', sortOrder);

      const res = await API.get(`/applications?${queryParams.toString()}`);
      setApplications(res.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      notifyError('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when filters/sorting changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchApplications();
    }, 300); // Debounce search changes

    return () => clearTimeout(delayDebounceFn);
  }, [search, status, deadlineStatus, packageRange, sortBy, sortOrder]);

  const handleDelete = async (id, company) => {
    if (window.confirm(`Are you sure you want to delete application for ${company}?`)) {
      try {
        await API.delete(`/applications/${id}`);
        notifySuccess(`Deleted application for ${company}`);
        fetchApplications();
        triggerRefresh(); // Update notification context
      } catch (error) {
        console.error('Error deleting application:', error);
        notifyError('Failed to delete application');
      }
    }
  };

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

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Application Pipeline</h2>
          <p className="text-xs text-slate-400 mt-1">Manage and track your active job and internship applications</p>
        </div>
        <Link
          to="/applications/add"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-brand-600 hover:bg-brand-500 font-semibold text-xs text-white rounded-xl shadow-glow transition-all"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Application
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-card p-4 border-dark-750 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
        {/* Search */}
        <div className="relative md:col-span-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company or role..."
            className="block w-full pl-10 pr-4 py-2 bg-dark-950 border border-dark-700 rounded-xl focus:border-brand-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500 transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center bg-dark-950 border border-dark-700 rounded-xl px-3 py-2">
          <Filter className="h-4 w-4 text-slate-500 mr-2 shrink-0" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-300 w-full focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="OA Cleared">OA Cleared</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Deadline Status Filter */}
        <div className="flex items-center bg-dark-950 border border-dark-700 rounded-xl px-3 py-2">
          <Filter className="h-4 w-4 text-slate-500 mr-2 shrink-0" />
          <select
            value={deadlineStatus}
            onChange={(e) => setDeadlineStatus(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-300 w-full focus:outline-none"
          >
            <option value="">All Deadlines</option>
            <option value="upcoming">Upcoming Deadlines</option>
            <option value="overdue">Overdue / Passed</option>
            <option value="0-2days">Due within 2 days</option>
            <option value="3-5days">Due within 3-5 days</option>
            <option value="6+days">Due in 6+ days</option>
          </select>
        </div>

        {/* Package Range Filter */}
        <div className="flex items-center bg-dark-950 border border-dark-700 rounded-xl px-3 py-2">
          <Filter className="h-4 w-4 text-slate-500 mr-2 shrink-0" />
          <select
            value={packageRange}
            onChange={(e) => setPackageRange(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-300 w-full focus:outline-none"
          >
            <option value="All">All Packages</option>
            <option value="0-5">0 - 5 LPA</option>
            <option value="5-10">5 - 10 LPA</option>
            <option value="10-20">10 - 20 LPA</option>
            <option value="20-999">20+ LPA</option>
          </select>
        </div>
      </div>

      {/* Main Applications Table */}
      <div className="glass-card border-dark-750 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Briefcase className="h-10 w-10 text-slate-700 mb-2" />
              <p className="text-xs">No matching applications found.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-dark-700 bg-dark-900/50 text-slate-400 font-semibold select-none">
                  <th className="py-3.5 px-4">Company</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => toggleSort('package')}>
                    <span className="flex items-center">
                      Package
                      <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                    </span>
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => toggleSort('appliedDate')}>
                    <span className="flex items-center">
                      Applied Date
                      <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                    </span>
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => toggleSort('deadline')}>
                    <span className="flex items-center">
                      Deadline Date
                      <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                    </span>
                  </th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/60">
                {applications.map((app) => {
                  const today = new Date();
                  today.setHours(0,0,0,0);
                  const deadline = new Date(app.deadlineDate);
                  const isOverdue = deadline < today && app.status !== 'Selected' && app.status !== 'Rejected';

                  return (
                    <tr key={app._id} className="hover:bg-dark-900/30 transition-colors group">
                      <td className="py-3 px-4 font-bold text-slate-200">{app.companyName}</td>
                      <td className="py-3 px-4 text-slate-400">{app.role}</td>
                      <td className="py-3 px-4 text-slate-200 font-medium">{app.package} LPA</td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(app.appliedDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center ${isOverdue ? 'text-accent-rose font-semibold' : 'text-slate-400'}`}>
                          {new Date(app.deadlineDate).toLocaleDateString()}
                          {isOverdue && <AlertTriangle className="ml-1 h-3.5 w-3.5 text-accent-rose animate-bounce" />}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-md ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {app.applicationLink && (
                            <a
                              href={app.applicationLink.startsWith('http') ? app.applicationLink : `https://${app.applicationLink}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-slate-500 hover:text-slate-300 hover:bg-dark-800 rounded transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            onClick={() => navigate(`/applications/edit/${app._id}`)}
                            className="p-1 text-slate-500 hover:text-slate-300 hover:bg-dark-800 rounded transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(app._id, app.companyName)}
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Applications;
