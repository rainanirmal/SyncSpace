import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import type { Project, Task } from '../types';
import { ArrowLeft, Plus, Loader2, CheckCircle2, Clock, CircleDot, AlertCircle, X } from 'lucide-react';

export const ProjectDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  
  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskStatus, setTaskStatus] = useState<'TODO' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED'>('TODO');
  const [creatingTask, setCreatingTask] = useState(false);

  const fetchProjectData = async () => {
    if (!projectId) return;
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/tasks`).catch(() => ({ data: { data: [] } }))
      ]);

      if (projRes.data?.data) {
        setProject(projRes.data.data);
      }
      if (taskRes.data?.data) {
        setTasks(Array.isArray(taskRes.data.data) ? taskRes.data.data : []);
      }
    } catch (err) {
      console.error('Error loading project details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !projectId) return;
    setCreatingTask(true);

    try {
      await api.post(`/projects/${projectId}/tasks`, {
        title: taskTitle,
        description: taskDesc,
        status: taskStatus
      });
      setTaskTitle('');
      setTaskDesc('');
      setTaskStatus('TODO');
      setShowTaskModal(false);
      fetchProjectData();
    } catch (err) {
      console.error('Error creating task', err);
    } finally {
      setCreatingTask(false);
    }
  };

  const columns = [
    { key: 'TODO', title: 'To Do', icon: CircleDot, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { key: 'IN_PROGRESS', title: 'In Progress', icon: Clock, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    { key: 'UNDER_REVIEW', title: 'Under Review', icon: AlertCircle, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { key: 'COMPLETED', title: 'Completed', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mr-2" />
        <span>Loading project details...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <Link to="/projects" className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>
        <div className="glass-card p-8 rounded-2xl text-center text-slate-400">
          Project not found or accessible.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/projects" className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Link>

      <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{project.name}</h1>
          <p className="text-sm text-slate-400 mt-1">{project.description || 'No project description.'}</p>
        </div>

        <button
          onClick={() => setShowTaskModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          const Icon = col.icon;

          return (
            <div key={col.key} className="glass-panel p-4 rounded-2xl space-y-4 flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg border ${col.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-sm text-white">{col.title}</h3>
                </div>
                <span className="text-xs font-bold text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="h-32 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-600">
                    No tasks
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div key={task._id} className="glass-card p-4 rounded-xl space-y-2">
                      <h4 className="font-medium text-sm text-white">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                      )}
                      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                        <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                        {task.assignedTo && (
                          <span className="text-indigo-400 font-medium">{task.assignedTo.username}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl space-y-5 relative">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Create New Task</h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Implement authentication layout"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Describe task requirements..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Status
                </label>
                <select
                  value={taskStatus}
                  onChange={(e: any) => setTaskStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm transition bg-slate-900"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTask}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {creatingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
