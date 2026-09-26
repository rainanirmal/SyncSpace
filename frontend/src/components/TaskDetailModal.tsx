import React, { useState, useEffect } from 'react';
import { getTaskById, createSubtask, updateSubtask, deleteSubtask } from '../api/tasks';
import type { Task, SubTask } from '../types';
import {
  X,
  Loader2,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  AlertCircle,
  User,
  Paperclip,
  Clock,
  CheckCircle2,
  CircleDot,
  Calendar,
} from 'lucide-react';

interface TaskDetailModalProps {
  projectId: string;
  taskId: string | null;
  onClose: () => void;
  onTaskUpdated?: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  projectId,
  taskId,
  onClose,
  onTaskUpdated,
}) => {
  const [task, setTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New subtask state
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId || !projectId) return;

    const fetchTask = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTaskById(projectId, taskId);
        setTask(data);
        setSubtasks(Array.isArray(data?.subtasks) ? data.subtasks : []);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch task details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [projectId, taskId]);

  if (!taskId) return null;

  // Subtask completion toggle
  const handleToggleSubtask = async (subTaskId: string, currentCompleted: boolean) => {
    setActionError(null);
    const targetCompleted = !currentCompleted;

    // Optimistic update
    setSubtasks((prev) =>
      prev.map((s) => (s._id === subTaskId ? { ...s, isCompleted: targetCompleted } : s))
    );

    try {
      await updateSubtask(projectId, subTaskId, { isCompleted: targetCompleted });
      if (onTaskUpdated) onTaskUpdated();
    } catch (err: any) {
      // Revert on error
      setSubtasks((prev) =>
        prev.map((s) => (s._id === subTaskId ? { ...s, isCompleted: currentCompleted } : s))
      );
      setActionError(err.response?.data?.message || 'Failed to update subtask.');
    }
  };

  // Create Subtask
  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !taskId) return;
    setAddingSubtask(true);
    setActionError(null);

    try {
      const created = await createSubtask(projectId, taskId, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      if (created) {
        setSubtasks((prev) => [...prev, created]);
      } else {
        // Refresh task if payload structure differs
        const refreshed = await getTaskById(projectId, taskId);
        setSubtasks(Array.isArray(refreshed?.subtasks) ? refreshed.subtasks : []);
      }
      if (onTaskUpdated) onTaskUpdated();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to add subtask.');
    } finally {
      setAddingSubtask(false);
    }
  };

  // Delete Subtask
  const handleDeleteSubtask = async (subTaskId: string) => {
    setActionError(null);
    // Optimistic deletion
    setSubtasks((prev) => prev.filter((s) => s._id !== subTaskId));

    try {
      await deleteSubtask(projectId, subTaskId);
      if (onTaskUpdated) onTaskUpdated();
    } catch (err: any) {
      // Refresh on error
      if (taskId) {
        const refreshed = await getTaskById(projectId, taskId);
        setSubtasks(Array.isArray(refreshed?.subtasks) ? refreshed.subtasks : []);
      }
      setActionError(err.response?.data?.message || 'Failed to delete subtask.');
    }
  };

  const completedCount = subtasks.filter((s) => s.isCompleted).length;
  const progressPercent = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  const normalizeStatusDisplay = (status?: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'todo') return { label: 'To Do', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: CircleDot };
    if (s === 'in_progress' || s === 'inprogress' || s === 'under_review')
      return { label: 'In Progress', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', icon: Clock };
    if (s === 'done' || s === 'completed')
      return { label: 'Done', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 };
    return { label: 'To Do', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: CircleDot };
  };

  const statusInfo = normalizeStatusDisplay(task?.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl p-6 sm:p-8 rounded-2xl space-y-6 relative shadow-2xl border border-slate-800 my-8">
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1 pr-6">
            {loading ? (
              <div className="h-6 w-48 bg-slate-800 animate-pulse rounded" />
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight">{task?.title}</h2>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${statusInfo.color}`}
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  {statusInfo.label}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Loading task details...</p>
          </div>
        ) : error ? (
          <div className="glass-card p-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center space-y-3">
            <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
            <p className="text-sm text-rose-300 font-medium">{error}</p>
          </div>
        ) : task ? (
          <div className="space-y-6">
            {/* Metadata Info Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400 glass-card p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                <span>Assignee:</span>
                {task.assignedTo ? (
                  <span className="font-semibold text-slate-200">
                    {task.assignedTo.fullName || task.assignedTo.username} (@{task.assignedTo.username})
                  </span>
                ) : (
                  <span className="italic text-slate-500">Unassigned</span>
                )}
              </div>

              {task.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>Created:</span>
                  <span className="font-semibold text-slate-200">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Description</h3>
              <div className="glass-card p-4 rounded-xl text-sm text-slate-200 leading-relaxed min-h-[60px]">
                {task.description || <span className="italic text-slate-500">No description provided for this task.</span>}
              </div>
            </div>

            {/* Attachments (if any) */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Attachments ({task.attachments.length})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {task.attachments.map((att, idx) => (
                    <a
                      key={idx}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-card p-2.5 rounded-lg flex items-center gap-2 hover:border-indigo-500/40 text-xs text-indigo-300 transition"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate flex-1">{att.url.split('/').pop()}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Action / General Error Alert */}
            {actionError && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* SUBTASKS SECTION */}
            <div className="space-y-4 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Subtasks</h3>
                  <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                    {completedCount}/{subtasks.length}
                  </span>
                </div>

                {subtasks.length > 0 && (
                  <span className="text-xs font-semibold text-indigo-400">{progressPercent}% done</span>
                )}
              </div>

              {/* Progress Bar */}
              {subtasks.length > 0 && (
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}

              {/* Subtasks List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {subtasks.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">No subtasks added yet.</p>
                ) : (
                  subtasks.map((st) => (
                    <div
                      key={st._id}
                      className="glass-card p-3 rounded-xl flex items-center justify-between gap-3 group hover:border-indigo-500/30 transition"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleSubtask(st._id, st.isCompleted)}
                        className="flex items-center gap-3 text-left flex-1 min-w-0"
                      >
                        {st.isCompleted ? (
                          <CheckSquare className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 flex-shrink-0 hover:text-slate-300" />
                        )}
                        <span
                          className={`text-xs transition truncate ${
                            st.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'
                          }`}
                        >
                          {st.title}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSubtask(st._id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition opacity-80 group-hover:opacity-100"
                        title="Delete subtask"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Subtask Input Form */}
              <form onSubmit={handleAddSubtask} className="flex gap-2 pt-2">
                <input
                  type="text"
                  required
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add a new subtask..."
                  className="flex-1 px-3.5 py-2 rounded-xl glass-input text-xs transition"
                />
                <button
                  type="submit"
                  disabled={addingSubtask || !newSubtaskTitle.trim()}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition flex items-center gap-1.5 disabled:opacity-50 flex-shrink-0"
                >
                  {addingSubtask ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
