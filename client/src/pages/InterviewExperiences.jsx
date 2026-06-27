import React, { useState, useEffect, useContext } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  AlertCircle,
  Tag
} from 'lucide-react';
import API from '../utils/api';
import { NotificationContext } from '../context/NotificationContext';

const InterviewExperiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState('All');

  // Modal form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [applicationId, setApplicationId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [interviewDate, setInterviewDate] = useState(new Date().toISOString().split('T')[0]);
  const [rounds, setRounds] = useState('1');
  const [questionsAsked, setQuestionsAsked] = useState('');
  const [experienceSummary, setExperienceSummary] = useState('');
  const [result, setResult] = useState('Waiting');
  const [submitting, setSubmitting] = useState(false);

  // Collapsed states for experience cards
  const [expandedIds, setExpandedIds] = useState([]);

  const { notifySuccess, notifyError, triggerRefresh } = useContext(NotificationContext);

  const fetchExperiences = async () => {
    try {
      let queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (resultFilter && resultFilter !== 'All') queryParams.append('result', resultFilter);

      const res = await API.get(`/interviews?${queryParams.toString()}`);
      setExperiences(res.data);
    } catch (error) {
      console.error(error);
      notifyError('Failed to fetch experiences');
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await API.get('/applications');
      setApplications(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const loadInitData = async () => {
      setLoading(true);
      await Promise.all([fetchExperiences(), fetchApplications()]);
      setLoading(false);
    };
    loadInitData();
  }, []);

  // Re-fetch experiences when filters change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchExperiences();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, resultFilter]);

  const toggleExpand = (id) => {
    if (expandedIds.includes(id)) {
      setExpandedIds(expandedIds.filter(item => item !== id));
    } else {
      setExpandedIds([...expandedIds, id]);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setApplicationId('');
    setCompanyName('');
    setRole('');
    setInterviewDate(new Date().toISOString().split('T')[0]);
    setRounds('1');
    setQuestionsAsked('');
    setExperienceSummary('');
    setResult('Waiting');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEditModal = (exp) => {
    setEditingId(exp._id);
    setApplicationId(exp.applicationId || '');
    setCompanyName(exp.companyName);
    setRole(exp.role);
    setInterviewDate(new Date(exp.interviewDate).toISOString().split('T')[0]);
    setRounds(String(exp.rounds));
    setQuestionsAsked(exp.questionsAsked);
    setExperienceSummary(exp.experienceSummary);
    setResult(exp.result);
    setModalOpen(true);
  };

  // Auto-fill company/role when selecting a linked application
  const handleApplicationChange = (appId) => {
    setApplicationId(appId);
    if (appId) {
      const selectedApp = applications.find(app => app._id === appId);
      if (selectedApp) {
        setCompanyName(selectedApp.companyName);
        setRole(selectedApp.role);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName || !role || !interviewDate || !rounds || !questionsAsked || !experienceSummary) {
      notifyError('Please fill in all required fields');
      return;
    }

    const payload = {
      applicationId: applicationId || null,
      companyName,
      role,
      interviewDate,
      rounds: Number(rounds),
      questionsAsked,
      experienceSummary,
      result
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await API.put(`/interviews/${editingId}`, payload);
        notifySuccess(`Updated interview details for ${companyName}`);
      } else {
        await API.post('/interviews', payload);
        notifySuccess(`Saved interview experience for ${companyName}`);
      }
      setModalOpen(false);
      resetForm();
      fetchExperiences();
      triggerRefresh();
    } catch (error) {
      console.error(error);
      notifyError('Failed to save experience');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, company) => {
    if (window.confirm(`Are you sure you want to delete the interview experience for ${company}?`)) {
      try {
        await API.delete(`/interviews/${id}`);
        notifySuccess(`Removed interview experience for ${company}`);
        fetchExperiences();
        triggerRefresh();
      } catch (error) {
        console.error(error);
        notifyError('Failed to delete experience');
      }
    }
  };

  // Compute stats on current overall list of experiences
  const stats = {
    total: experiences.length,
    selected: experiences.filter(e => e.result === 'Selected').length,
    rejected: experiences.filter(e => e.result === 'Rejected').length,
    waiting: experiences.filter(e => e.result === 'Waiting').length,
    successRate: () => {
      const completed = experiences.filter(e => e.result === 'Selected' || e.result === 'Rejected').length;
      if (completed === 0) return 0;
      return Math.round((experiences.filter(e => e.result === 'Selected').length / completed) * 100);
    }
  };

  const getResultBadge = (res) => {
    switch (res) {
      case 'Selected':
        return 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/30';
      case 'Rejected':
        return 'bg-accent-rose/10 text-accent-rose border-accent-rose/30';
      case 'Waiting':
      default:
        return 'bg-accent-amber/10 text-accent-amber border-accent-amber/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Interview Experiences</h2>
          <p className="text-xs text-slate-400 mt-1">Reflect on past interviews, store questions asked, and check results</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-brand-600 hover:bg-brand-500 font-semibold text-xs text-white rounded-xl shadow-glow transition-all"
        >
          <Plus className="mr-2 h-4 w-4" />
          Share Experience
        </button>
      </div>

      {/* Summary Statistics block */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Interviews', value: stats.total, color: 'text-slate-400 bg-slate-500/10 border-slate-750', icon: MessageSquare },
          { label: 'Selected / Offer', value: stats.selected, color: 'text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20', icon: CheckCircle },
          { label: 'Rejected', value: stats.rejected, color: 'text-accent-rose bg-accent-rose/10 border-accent-rose/20', icon: XCircle },
          { label: 'Waiting Status', value: stats.waiting, color: 'text-accent-amber bg-accent-amber/10 border-accent-amber/20', icon: Clock },
          { label: 'Success Rate', value: `${stats.successRate()}%`, color: 'text-brand-400 bg-brand-500/10 border-brand-500/20 shadow-glow', icon: Tag }
        ].map((s, idx) => (
          <div key={idx} className="glass-card p-4 border border-dark-750 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{s.label}</p>
              <h3 className="text-xl font-extrabold text-white mt-1">{s.value}</h3>
            </div>
            <div className={`p-2 rounded-xl border ${s.color.split(' ')[1]} ${s.color.split(' ')[2]}`}>
              <s.icon className={`h-4.5 w-4.5 ${s.color.split(' ')[0]}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="glass-card p-4 border-dark-750 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company name..."
            className="block w-full pl-10 pr-4 py-2 bg-dark-950 border border-dark-700 rounded-xl focus:border-brand-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500 transition-colors"
          />
        </div>

        <div className="flex items-center bg-dark-950 border border-dark-700 rounded-xl px-3 py-2">
          <Filter className="h-4 w-4 text-slate-500 mr-2 shrink-0" />
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-300 w-full focus:outline-none"
          >
            <option value="All">All Outcomes</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
            <option value="Waiting">Waiting</option>
          </select>
        </div>
      </div>

      {/* Experiences List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : experiences.length === 0 ? (
        <div className="glass-card p-10 border-dark-750 flex flex-col items-center justify-center text-slate-500">
          <MessageSquare className="h-8 w-8 text-slate-700 mb-2" />
          <p className="text-xs">No interview experiences recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => {
            const isExpanded = expandedIds.includes(exp._id);
            return (
              <div key={exp._id} className="glass-card border-dark-750 overflow-hidden transition-all duration-200">
                {/* Collapsible Header */}
                <div
                  onClick={() => toggleExpand(exp._id)}
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-dark-900/20 select-none"
                >
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className="h-10 w-10 bg-dark-950 border border-dark-750 flex items-center justify-center rounded-xl text-slate-400 font-bold shrink-0">
                      {exp.companyName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-slate-100 truncate">{exp.companyName}</h4>
                        <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-md shrink-0 ${getResultBadge(exp.result)}`}>
                          {exp.result}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 truncate">
                        {exp.role} • {exp.rounds} Round(s) • {new Date(exp.interviewDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 lg:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(exp);
                        }}
                        className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-dark-800 rounded transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(exp._id, exp.companyName);
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4.5 w-4.5 text-slate-400" /> : <ChevronDown className="h-4.5 w-4.5 text-slate-400" />}
                  </div>
                </div>

                {/* Collapsible Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-dark-700/50 bg-dark-950/20 pt-4 space-y-4 text-xs leading-relaxed text-slate-300">
                    <div>
                      <h5 className="font-bold text-slate-200 mb-1 flex items-center">
                        <AlertCircle className="mr-1.5 h-4 w-4 text-brand-400" />
                        Questions Asked
                      </h5>
                      <div className="bg-dark-950 border border-dark-750 rounded-xl p-3.5 text-slate-300 font-mono whitespace-pre-wrap">
                        {exp.questionsAsked}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-bold text-slate-200 mb-1">Experience Summary</h5>
                      <p className="text-slate-400 whitespace-pre-wrap bg-dark-950/40 p-3.5 border border-dark-750/50 rounded-xl">
                        {exp.experienceSummary}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Shared Modal Popup (Add & Edit Experience) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card border-dark-700 bg-dark-900 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-dark-750 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold text-white">
                {editingId ? 'Edit Interview Experience' : 'Add Interview Experience'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 font-semibold"
              >
                Close
              </button>
            </div>

            {/* Modal Scrollable Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Link Application Selector */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Link with Application (Optional)
                </label>
                <select
                  value={applicationId}
                  onChange={(e) => handleApplicationChange(e.target.value)}
                  className="block w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded-xl focus:border-brand-500 focus:outline-none text-xs text-slate-300 transition-colors"
                >
                  <option value="">-- Select Job Application --</option>
                  {applications.map(app => (
                    <option key={app._id} value={app._id}>
                      {app.companyName} - {app.role} ({app.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Company Name */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Company Name <span className="text-accent-rose">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Stripe, Netflix"
                    className="block w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded-xl focus:border-brand-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500"
                    required
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Role <span className="text-accent-rose">*</span>
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Backend Developer"
                    className="block w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded-xl focus:border-brand-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Interview Date <span className="text-accent-rose">*</span>
                  </label>
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="block w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded-xl focus:border-brand-500 focus:outline-none text-xs text-slate-100"
                    required
                  />
                </div>

                {/* Rounds */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Number of Rounds <span className="text-accent-rose">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={rounds}
                    onChange={(e) => setRounds(e.target.value)}
                    className="block w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded-xl focus:border-brand-500 focus:outline-none text-xs text-slate-100"
                    required
                  />
                </div>
              </div>

              {/* Outcome Result Selection */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Interview Outcome / Result
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Waiting', 'Selected', 'Rejected'].map((resVal) => (
                    <button
                      key={resVal}
                      type="button"
                      onClick={() => setResult(resVal)}
                      className={`py-2 px-3 text-[10px] font-bold border rounded-xl transition-all ${
                        result === resVal
                          ? resVal === 'Selected' ? 'bg-accent-emerald border-accent-emerald text-white' :
                            resVal === 'Rejected' ? 'bg-accent-rose border-accent-rose text-white' :
                            'bg-accent-amber border-accent-amber text-white'
                          : 'bg-dark-950 border-dark-700 text-slate-400 hover:bg-dark-800'
                      }`}
                    >
                      {resVal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Questions Asked */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Questions Asked <span className="text-accent-rose">*</span>
                </label>
                <textarea
                  rows="3"
                  value={questionsAsked}
                  onChange={(e) => setQuestionsAsked(e.target.value)}
                  placeholder="1. Reverse a Linked List&#10;2. Explain event delegation in JS&#10;3. Design a URL shortener system..."
                  className="block w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded-xl focus:border-brand-500 focus:outline-none text-xs text-slate-100 font-mono resize-none"
                  required
                />
              </div>

              {/* Experience Summary */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Experience Summary <span className="text-accent-rose">*</span>
                </label>
                <textarea
                  rows="3"
                  value={experienceSummary}
                  onChange={(e) => setExperienceSummary(e.target.value)}
                  placeholder="The interviewer was friendly. System design round focused on scale. Took around 45 mins..."
                  className="block w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded-xl focus:border-brand-500 focus:outline-none text-xs text-slate-100 resize-none"
                  required
                />
              </div>

              {/* Form Footer */}
              <div className="flex justify-end pt-2 border-t border-dark-750 gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-dark-800 hover:bg-dark-750 text-slate-300 font-bold border border-dark-700 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-glow transition-all"
                >
                  {submitting ? 'Saving...' : 'Save Experience'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewExperiences;
