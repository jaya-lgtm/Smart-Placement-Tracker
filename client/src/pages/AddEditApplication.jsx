import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Briefcase } from 'lucide-react';
import API from '../utils/api';
import { NotificationContext } from '../context/NotificationContext';

const AddEditApplication = () => {
  const { id } = useParams(); // Exists if we are in Edit mode
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { notifySuccess, notifyError, triggerRefresh } = useContext(NotificationContext);

  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [pack, setPack] = useState(''); // Package in LPA
  const [applicationLink, setApplicationLink] = useState('');
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().split('T')[0]);
  const [deadlineDate, setDeadlineDate] = useState('');
  const [status, setStatus] = useState('Applied');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditMode);

  // Fetch application details if in Edit Mode
  useEffect(() => {
    if (isEditMode) {
      const fetchApplication = async () => {
        try {
          const res = await API.get(`/applications/${id}`);
          const app = res.data;
          setCompanyName(app.companyName);
          setRole(app.role);
          setPack(app.package);
          setApplicationLink(app.applicationLink || '');
          if (app.appliedDate) {
            setAppliedDate(new Date(app.appliedDate).toISOString().split('T')[0]);
          }
          if (app.deadlineDate) {
            setDeadlineDate(new Date(app.deadlineDate).toISOString().split('T')[0]);
          }
          setStatus(app.status);
          setNotes(app.notes || '');
        } catch (error) {
          console.error(error);
          notifyError('Failed to load application details');
          navigate('/applications');
        } finally {
          setLoading(false);
        }
      };
      fetchApplication();
    }
  }, [id, isEditMode, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName || !role || !pack || !deadlineDate) {
      notifyError('Please fill in all required fields');
      return;
    }

    const payload = {
      companyName,
      role,
      package: Number(pack),
      applicationLink,
      appliedDate,
      deadlineDate,
      status,
      notes
    };

    setSubmitting(true);
    try {
      if (isEditMode) {
        await API.put(`/applications/${id}`, payload);
        notifySuccess(`Updated application for ${companyName}`);
      } else {
        await API.post('/applications', payload);
        notifySuccess(`Added application for ${companyName}`);
      }
      triggerRefresh(); // Refresh notification badge & alerts
      navigate('/applications');
    } catch (error) {
      console.error(error);
      notifyError(error.response?.data?.message || 'Failed to save application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link to="/applications" className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-slate-100 transition-colors">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Pipeline
        </Link>
      </div>

      {/* Form Container */}
      <div className="glass-card border-dark-750 p-6 md:p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {isEditMode ? 'Edit Application' : 'Track New Application'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEditMode ? 'Modify details for your job application' : 'Add details of the company and job role you applied to'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Company Name <span className="text-accent-rose">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Google, Stripe, etc."
                className="block w-full px-4 py-2.5 bg-dark-950 border border-dark-700 rounded-xl focus:border-brand-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500 transition-colors"
                required
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Job Role / Title <span className="text-accent-rose">*</span>
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Software Engineer Intern"
                className="block w-full px-4 py-2.5 bg-dark-950 border border-dark-700 rounded-xl focus:border-brand-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Package */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Compensation / Package (LPA) <span className="text-accent-rose">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={pack}
                onChange={(e) => setPack(e.target.value)}
                placeholder="12.5"
                className="block w-full px-4 py-2.5 bg-dark-950 border border-dark-700 rounded-xl focus:border-brand-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500 transition-colors"
                required
              />
            </div>

            {/* Application URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Application Link / URL
              </label>
              <input
                type="url"
                value={applicationLink}
                onChange={(e) => setApplicationLink(e.target.value)}
                placeholder="https://careers.google.com/jobs/..."
                className="block w-full px-4 py-2.5 bg-dark-950 border border-dark-700 rounded-xl focus:border-brand-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Applied Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Applied Date
              </label>
              <input
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="block w-full px-4 py-2.5 bg-dark-950 border border-dark-700 rounded-xl focus:border-brand-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500 transition-colors"
              />
            </div>

            {/* Deadline Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Deadline Date <span className="text-accent-rose">*</span>
              </label>
              <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="block w-full px-4 py-2.5 bg-dark-950 border border-dark-700 rounded-xl focus:border-brand-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Application Pipeline Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {['Applied', 'OA Cleared', 'Interview Scheduled', 'Selected', 'Rejected'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`py-2 px-3 text-[10px] font-bold border rounded-xl transition-all ${
                    status === s
                      ? 'bg-brand-600 border-brand-500 text-white shadow-glow'
                      : 'bg-dark-950 border-dark-700 text-slate-400 hover:bg-dark-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Notes / Custom Details
            </label>
            <textarea
              rows="4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Questions asked in OA, recruiter phone call contact, follow-up timeline details..."
              className="block w-full px-4 py-3 bg-dark-950 border border-dark-700 rounded-xl focus:border-brand-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500 transition-colors resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-5 py-3 bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white rounded-xl shadow-glow transition-all disabled:opacity-50"
            >
              <Save className="mr-2 h-4.5 w-4.5" />
              {submitting ? 'Saving...' : 'Save Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditApplication;
