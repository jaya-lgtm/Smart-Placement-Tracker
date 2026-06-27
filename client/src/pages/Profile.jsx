import React, { useState, useContext, useEffect } from 'react';
import { User, Mail, ShieldAlert, Sparkles, BrainCircuit, Save, Lock } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import API from '../utils/api';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const { notifySuccess, notifyError } = useContext(NotificationContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Job Readiness Calculator inputs
  const [skillsCount, setSkillsCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const [dsaQuestionsCount, setDsaQuestionsCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);

  const [saving, setSaving] = useState(false);

  // Fetch applications count on load
  useEffect(() => {
    const fetchAppsCount = async () => {
      try {
        const res = await API.get('/applications');
        setApplicationsCount(res.data.length);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAppsCount();
  }, []);

  // Sync profile state when user context is loaded
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setSkillsCount(user.skillsCount || 0);
      setProjectsCount(user.projectsCount || 0);
      setDsaQuestionsCount(user.dsaQuestionsCount || 0);
    }
  }, [user]);

  // Compute Job Readiness Score Preview
  const previewReadinessScore = () => {
    // 1. Applications (30% weight) -> Target: 15 applications
    const appPoints = Math.min((applicationsCount / 15) * 30, 30);
    
    // 2. Skills (30% weight) -> Target: 8 skills
    const skillsPoints = Math.min((Number(skillsCount) / 8) * 30, 30);
    
    // 3. Projects (20% weight) -> Target: 4 projects
    const projectsPoints = Math.min((Number(projectsCount) / 4) * 20, 20);
    
    // 4. DSA Solved (20% weight) -> Target: 250 problems
    const dsaPoints = Math.min((Number(dsaQuestionsCount) / 250) * 20, 20);
    
    return Math.round(appPoints + skillsPoints + projectsPoints + dsaPoints);
  };

  const scorePreview = previewReadinessScore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      notifyError('Name and Email are required');
      return;
    }

    if (password && password.length < 6) {
      notifyError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      notifyError('Passwords do not match');
      return;
    }

    const payload = {
      name,
      email,
      skillsCount: Number(skillsCount),
      projectsCount: Number(projectsCount),
      dsaQuestionsCount: Number(dsaQuestionsCount)
    };

    if (password) {
      payload.password = password;
    }

    setSaving(true);
    const result = await updateProfile(payload);
    setSaving(false);

    if (result.success) {
      notifySuccess('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } else {
      notifyError(result.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Profile Form (Left Panel) */}
      <div className="glass-card border-dark-750 p-6 md:p-8 lg:col-span-2 space-y-6">
        <div className="flex items-center space-x-3 border-b border-dark-700/60 pb-4">
          <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Profile Config</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage your personal credentials and placement metrics</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-dark-950 border border-dark-700 rounded-xl focus:border-brand-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-dark-950 border border-dark-700 rounded-xl focus:border-brand-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500 transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-dark-700/60 pt-4">
            {/* Skills count */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Skills Acquired
              </label>
              <input
                type="number"
                min="0"
                value={skillsCount}
                onChange={(e) => setSkillsCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="block w-full px-4 py-2.5 bg-dark-950 border border-dark-700 rounded-xl focus:border-brand-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500 transition-colors"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Languages, databases, frameworks</span>
            </div>

            {/* Projects count */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Projects Completed
              </label>
              <input
                type="number"
                min="0"
                value={projectsCount}
                onChange={(e) => setProjectsCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="block w-full px-4 py-2.5 bg-dark-950 border border-dark-700 rounded-xl focus:border-brand-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500 transition-colors"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Full-stack, tools, research projects</span>
            </div>

            {/* DSA Count */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                DSA Problems Solved
              </label>
              <input
                type="number"
                min="0"
                value={dsaQuestionsCount}
                onChange={(e) => setDsaQuestionsCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="block w-full px-4 py-2.5 bg-dark-950 border border-dark-700 rounded-xl focus:border-brand-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500 transition-colors"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">LeetCode, GFG, Codeforces solved</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-dark-700/60 pt-4">
            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                <Lock className="mr-1 h-3.5 w-3.5 text-slate-500" />
                Change Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep same"
                className="block w-full px-4 py-2.5 bg-dark-950 border border-dark-700 rounded-xl focus:border-brand-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500 transition-colors"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Leave blank to keep same"
                className="block w-full px-4 py-2.5 bg-dark-950 border border-dark-700 rounded-xl focus:border-brand-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-dark-700/60">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-5 py-3 bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white rounded-xl shadow-glow transition-all"
            >
              <Save className="mr-2 h-4.5 w-4.5" />
              {saving ? 'Updating...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Calculator Breakdown & Preview Widget (Right Panel) */}
      <div className="glass-card border-dark-750 p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center mb-4 border-b border-dark-700/60 pb-3">
            <BrainCircuit className="mr-2 h-4.5 w-4.5 text-brand-400" />
            Job Readiness Calculator
          </h3>

          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative h-28 w-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-dark-750"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-brand-500 transition-all duration-300 ease-out"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - scorePreview / 100)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-extrabold text-white">{scorePreview}%</span>
                <p className="text-[9px] text-slate-400 font-semibold tracking-wider">PREVIEW</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-4 text-center">
              Live calculation updates as you adjust parameters. Click **Save Profile** to sync back with your dashboard.
            </p>
          </div>

          <div className="space-y-3.5 mt-2 text-xs">
            <h4 className="font-bold text-slate-200">Weight Breakdowns</h4>
            <div className="space-y-2.5">
              {[
                { name: 'Applications Tracked', weight: '30%', progress: `${Math.round(Math.min((applicationsCount / 15) * 100, 100))}%`, current: `${applicationsCount}/15` },
                { name: 'Skills Acquired', weight: '30%', progress: `${Math.round(Math.min((skillsCount / 8) * 100, 100))}%`, current: `${skillsCount}/8` },
                { name: 'Projects Completed', weight: '20%', progress: `${Math.round(Math.min((projectsCount / 4) * 100, 100))}%`, current: `${projectsCount}/4` },
                { name: 'DSA Problems Solved', weight: '20%', progress: `${Math.round(Math.min((dsaQuestionsCount / 250) * 100, 100))}%`, current: `${dsaQuestionsCount}/250` }
              ].map((w, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">{w.name} ({w.weight})</span>
                    <span className="text-slate-300 font-bold">{w.current}</span>
                  </div>
                  <div className="w-full bg-dark-950 h-2 rounded-full overflow-hidden border border-dark-750">
                    <div className="bg-brand-500 h-full rounded-full transition-all duration-300" style={{ width: w.progress }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-dark-700/60 bg-dark-950/20 p-3.5 border border-brand-500/10 rounded-xl flex items-start space-x-2 text-[10px] text-slate-400">
          <ShieldAlert className="h-4.5 w-4.5 text-brand-400 shrink-0 mt-0.5" />
          <p className="leading-normal">
            Targets are configured standard (15 applications, 8 skills, 4 projects, 250 DSA). Keep solving and applying to maximize your score!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
