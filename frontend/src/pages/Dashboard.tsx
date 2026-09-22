import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import type { Project } from '../types';
import { FolderKanban, CheckCircle2, Clock, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects');
        if (response.data?.data) {
          const list = response.data.data.map((item: any) => item.project || item);
          setProjects(list);
        }
      } catch (err) {
        console.error('Failed to load projects', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {user?.fullName || user?.username}!</h1>
          <p className="text-sm text-slate-400 mt-1">Here is what is happening across your SyncSpace projects today.</p>
        </div>

        <Link
          to="/projects"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{projects.length}</p>
            <p className="text-xs text-slate-400 font-medium">Active Projects</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">12</p>
            <p className="text-xs text-slate-400 font-medium">Tasks Completed</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">5</p>
            <p className="text-xs text-slate-400 font-medium">In Progress</p>
          </div>
        </div>
      </div>

      {/* Projects Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Your Projects</h2>
          <Link to="/projects" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mr-2" />
            <span>Loading projects...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl text-center space-y-3">
            <FolderKanban className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-300 font-medium">No projects found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Create your first project to start organizing tasks with your team.</p>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium hover:bg-indigo-500 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="glass-card p-5 rounded-2xl space-y-3 block group"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-white group-hover:text-indigo-400 transition">
                    {project.name}
                  </h3>
                  <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Active
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {project.description || 'No description provided.'}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span>{project.members ?? 1} member(s)</span>
                  <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
