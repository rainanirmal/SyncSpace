import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProjectById, getMembers, addMember, deleteProject } from '../api/projects';
import { getTasks, createTask, updateTask } from '../api/tasks';
import type { Project, Task, ProjectMember, ProjectMemberRole } from '../types';
import {
  ArrowLeft,
  Plus,
  Loader2,
  CheckCircle2,
  Clock,
  CircleDot,
  AlertCircle,
  X,
  Users,
  UserPlus,
  Trash2,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProjectDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Member Modal State
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<ProjectMemberRole>('member');
  const [addingMember, setAddingMember] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);

  // New Task Modal State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskStatus, setTaskStatus] = useState<string>('todo');
  const [creatingTask, setCreatingTask] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);

  // Deleting Project State
  const [deletingProject, setDeletingProject] = useState(false);

  const fetchProjectData = async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const [projData, membersData, tasksData] = await Promise.all([
        getProjectById(projectId),
        getMembers(projectId).catch(() => []),
        getTasks(projectId).catch(() => []),
      ]);

      setProject(projData);
      setMembers(Array.isArray(membersData) ? membersData : []);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  // Determine if current user is admin in this project
  const currentMember = members.find(
    (m) => (typeof m.user === 'object' && m.user?._id === user?._id) || (m.user as any) === user?._id
  );
  const roleLower = String(currentMember?.role || '').toLowerCase();
  const isAdmin =
    roleLower === 'admin' ||
    roleLower === 'project_admin' ||
    project?.createdBy === user?._id;

  // Add Member Handler
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !memberEmail.trim()) return;
    setAddingMember(true);
    setMemberError(null);

    try {
      await addMember(projectId, memberEmail.trim(), memberRole);
      setMemberEmail('');
      setMemberRole('member');
      setShowMemberModal(false);
      // Refresh members list
      const updatedMembers = await getMembers(projectId);
      setMembers(updatedMembers);
    } catch (err: any) {
      setMemberError(err.response?.data?.message || err.message || 'Failed to add member to project.');
    } finally {
      setAddingMember(false);
    }
  };

  // Create Task Handler
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !taskTitle.trim()) return;
    setCreatingTask(true);
    setTaskError(null);

    try {
      const newTask = await createTask(
        projectId,
        taskTitle.trim(),
        taskDesc.trim() || undefined,
        taskAssignee || undefined,
        taskStatus
      );
      setTaskTitle('');
      setTaskDesc('');
      setTaskAssignee('');
      setTaskStatus('todo');
      setShowTaskModal(false);

      if (newTask) {
        setTasks((prev) => [newTask, ...prev]);
      } else {
        const updatedTasks = await getTasks(projectId);
        setTasks(updatedTasks);
      }
    } catch (err: any) {
      setTaskError(err.response?.data?.message || err.message || 'Failed to create task.');
    } finally {
      setCreatingTask(false);
    }
  };

  // Delete Project Handler (Admin only)
  const handleDeleteProject = async () => {
    if (!projectId || !isAdmin) return;
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    setDeletingProject(true);
    try {
      await deleteProject(projectId);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete project.');
    } finally {
      setDeletingProject(false);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId || !projectId) return;

    // Optimistically update status
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t._id === taskId ? { ...t, status: targetStatus } : t))
    );

    try {
      await updateTask(projectId, taskId, { status: targetStatus });
    } catch (err) {
      console.error('Failed to update task status', err);
      // Revert on failure
      const revertedTasks = await getTasks(projectId);
      setTasks(revertedTasks);
    }
  };

  const columns = [
    { key: 'todo', title: 'To Do', icon: CircleDot, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { key: 'in_progress', title: 'In Progress', icon: Clock, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    { key: 'done', title: 'Done', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  ];

  // Helper to normalize task status string
  const normalizeStatus = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'todo') return 'todo';
    if (s === 'in_progress' || s === 'inprogress' || s === 'under_review') return 'in_progress';
    if (s === 'done' || s === 'completed') return 'done';
    return 'todo';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-sm font-medium">Loading project workspace...</span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="glass-card p-8 rounded-2xl text-center space-y-3 border border-rose-500/20 bg-rose-500/5">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-slate-200 font-medium">{error || 'Project not found or accessible.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {isAdmin && (
          <button
            onClick={handleDeleteProject}
            disabled={deletingProject}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-medium rounded-xl transition disabled:opacity-50"
          >
            {deletingProject ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            <span>Delete Project</span>
          </button>
        )}
      </div>

      {/* Project Banner Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">{project.name}</h1>
            {isAdmin && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Admin
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1">{project.description || 'No description provided for this project.'}</p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          {isAdmin && (
            <button
              onClick={() => {
                setMemberError(null);
                setShowMemberModal(true);
              }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-xl transition flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-indigo-400" />
              <span>Add Member</span>
            </button>
          )}

          <button
            onClick={() => {
              setTaskError(null);
              setShowTaskModal(true);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Members List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Project Members</h2>
            <span className="text-xs font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
              {members.length}
            </span>
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                setMemberError(null);
                setShowMemberModal(true);
              }}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite</span>
            </button>
          )}
        </div>

        {members.length === 0 ? (
          <div className="glass-card p-6 rounded-2xl text-center text-xs text-slate-400">
            No members assigned to this project yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {members.map((m, idx) => {
              const u = typeof m.user === 'object' ? m.user : null;
              const roleDisplay = String(m.role || 'member').toLowerCase();

              return (
                <div key={m._id || idx} className="glass-card p-3.5 rounded-xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-semibold text-xs flex-shrink-0">
                    {u?.username?.[0]?.toUpperCase() || <UserCheck className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{u?.fullName || u?.username || 'Member'}</p>
                    <p className="text-[11px] text-slate-400 truncate">{u?.email || `@${u?.username}`}</p>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                      roleDisplay.includes('admin')
                        ? 'text-indigo-300 bg-indigo-500/20 border-indigo-500/30'
                        : 'text-slate-400 bg-slate-800 border-slate-700'
                    }`}
                  >
                    {roleDisplay}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Drag-and-Drop Kanban Board */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">Task Board</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => normalizeStatus(t.status) === col.key);
            const Icon = col.icon;

            return (
              <div
                key={col.key}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.key)}
                className="glass-panel p-4 rounded-2xl space-y-4 flex flex-col min-h-[450px] border border-slate-800/80"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border ${col.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-sm text-white">{col.title}</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>

                {/* Task Cards Drop Target */}
                <div className="space-y-3 flex-1 overflow-y-auto min-h-[350px]">
                  {colTasks.length === 0 ? (
                    <div className="h-40 border border-dashed border-slate-800/80 rounded-xl flex items-center justify-center text-xs text-slate-600">
                      Drop tasks here
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task._id)}
                        className="glass-card p-4 rounded-xl space-y-2 cursor-grab active:cursor-grabbing hover:border-indigo-500/40 transition group"
                      >
                        <h4 className="font-medium text-sm text-white group-hover:text-indigo-300 transition">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}
                        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                          {task.assignedTo ? (
                            <span className="text-indigo-400 font-medium">
                              @{task.assignedTo.username}
                            </span>
                          ) : (
                            <span className="italic">Unassigned</span>
                          )}
                          <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Member Modal (Admin Only) */}
      {showMemberModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl space-y-5 relative shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Add Team Member</h3>
              <button
                onClick={() => setShowMemberModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {memberError && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{memberError}</span>
              </div>
            )}

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  User Email Address
                </label>
                <input
                  type="email"
                  required
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="member@example.com"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Role
                </label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value as ProjectMemberRole)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm transition bg-slate-900 text-slate-200"
                >
                  <option value="member">Member</option>
                  <option value="project_admin">Project Admin</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingMember}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {addingMember ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl space-y-5 relative shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Create New Task</h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {taskError && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{taskError}</span>
              </div>
            )}

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
                  placeholder="e.g. Design homepage wireframe"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Description <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Describe task details and acceptance criteria..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Assignee <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <select
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm transition bg-slate-900 text-slate-200"
                >
                  <option value="">Unassigned</option>
                  {members.map((m, idx) => {
                    const u = typeof m.user === 'object' ? m.user : null;
                    if (!u) return null;
                    return (
                      <option key={u._id || idx} value={u._id}>
                        {u.fullName || u.username} ({u.email})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Initial Status
                </label>
                <select
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm transition bg-slate-900 text-slate-200"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
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
