import { useEffect, useState, useMemo } from 'react';
import ResourceManager from '../components/ResourceManager.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';

export default function TasksManager() {
  const { token } = useAuth();
  const [goals, setGoals] = useState([]);
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    let active = true;
    async function loadRelations() {
      try {
        const [goalsData, milestonesData] = await Promise.all([
          api.crud('goals', token).list().catch(() => []),
          api.crud('milestones', token).list().catch(() => []),
        ]);
        if (!active) return;
        setGoals(Array.isArray(goalsData) ? goalsData : []);
        setMilestones(Array.isArray(milestonesData) ? milestonesData : []);
      } catch (err) {
        console.error('Failed to load goals or milestones', err);
      }
    }
    if (token) {
      loadRelations();
    }
    return () => {
      active = false;
    };
  }, [token]);

  const fields = useMemo(() => [
    { name: 'title', label: 'Task title *', type: 'text', full: true },
    {
      name: 'goalId',
      label: 'Goal (Optional)',
      type: 'select',
      default: '',
      nullable: true,
      options: [
        { value: '', label: '— No Goal (Standalone) —' },
        ...goals.map((g) => ({
          value: g._id,
          label: `${g.title} (${g.category || 'goal'})`,
        })),
      ],
      onChange: (selectedGoalId, editing, setEditing) => {
        // If current milestone doesn't belong to this newly selected goal, reset milestone
        const selectedMilestone = milestones.find((m) => m._id === editing.milestoneId);
        const mGoalId = selectedMilestone
          ? (typeof selectedMilestone.goalId === 'object' ? selectedMilestone.goalId?._id : selectedMilestone.goalId)
          : null;
        const keepMilestone = !selectedGoalId || (mGoalId === selectedGoalId);
        setEditing({
          ...editing,
          goalId: selectedGoalId,
          milestoneId: keepMilestone ? (editing.milestoneId || '') : '',
        });
      },
    },
    {
      name: 'milestoneId',
      label: 'Milestone (Optional)',
      type: 'select',
      default: '',
      nullable: true,
      options: (editing) => {
        const currentGoalId = editing?.goalId;
        const filtered = currentGoalId
          ? milestones.filter((m) => {
              const mgId = typeof m.goalId === 'object' ? m.goalId?._id : m.goalId;
              return mgId === currentGoalId;
            })
          : milestones;

        const options = [
          { value: '', label: '— No Milestone —' },
        ];

        if (currentGoalId && filtered.length === 0) {
          options.push({ value: '', label: '(No milestones for this goal yet)' });
          return options;
        }

        filtered.forEach((m) => {
          const parentGoal = goals.find((g) => g._id === (typeof m.goalId === 'object' ? m.goalId?._id : m.goalId));
          const label = !currentGoalId && parentGoal
            ? `${m.title} [Goal: ${parentGoal.title}]`
            : m.title;
          options.push({ value: m._id, label });
        });

        return options;
      },
      onChange: (selectedMilestoneId, editing, setEditing) => {
        if (selectedMilestoneId) {
          const m = milestones.find((item) => item._id === selectedMilestoneId);
          const autoGoalId = m
            ? (typeof m.goalId === 'object' ? m.goalId?._id : m.goalId)
            : null;
          setEditing({
            ...editing,
            milestoneId: selectedMilestoneId,
            ...(autoGoalId ? { goalId: autoGoalId } : {}),
          });
        } else {
          setEditing({
            ...editing,
            milestoneId: '',
          });
        }
      },
    },
    { name: 'status', label: 'Status', type: 'select', options: ['todo', 'in-progress', 'done'], default: 'todo' },
    { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    { name: 'estimateMinutes', label: 'Estimate (minutes)', type: 'number', default: 0 },
    { name: 'dueDate', label: 'Due date', type: 'date', nullable: true },
    { name: 'notes', label: 'Notes', type: 'textarea', full: true },
  ], [goals, milestones]);

  const columns = useMemo(() => [
    { key: 'title', label: 'Task' },
    {
      key: 'goalId',
      label: 'Goal',
      render: (i) => {
        if (i.goalId && typeof i.goalId === 'object') return i.goalId.title || '—';
        const found = goals.find((g) => g._id === i.goalId);
        return found ? found.title : '—';
      },
    },
    {
      key: 'milestoneId',
      label: 'Milestone',
      render: (i) => {
        if (i.milestoneId && typeof i.milestoneId === 'object') return i.milestoneId.title || '—';
        const found = milestones.find((m) => m._id === i.milestoneId);
        return found ? found.title : '—';
      },
    },
    { key: 'status', label: 'Status', mono: true },
    { key: 'priority', label: 'Priority', mono: true },
  ], [goals, milestones]);

  const searchKeys = useMemo(() => [
    'title',
    'status',
    'priority',
    (item) => (typeof item.goalId === 'object' ? item.goalId?.title : goals.find((g) => g._id === item.goalId)?.title) || '',
    (item) => (typeof item.milestoneId === 'object' ? item.milestoneId?.title : milestones.find((m) => m._id === item.milestoneId)?.title) || '',
  ], [goals, milestones]);

  return (
    <ResourceManager
      title="Tasks"
      resource="tasks"
      token={token}
      fields={fields}
      columns={columns}
      searchKeys={searchKeys}
      transformIn={(data) => ({
        ...data,
        goalId: data.goalId?._id || (typeof data.goalId === 'string' ? data.goalId : ''),
        milestoneId: data.milestoneId?._id || (typeof data.milestoneId === 'string' ? data.milestoneId : ''),
        dueDate: data.dueDate ? String(data.dueDate).slice(0, 10) : '',
      })}
      transformOut={(data) => ({
        ...data,
        goalId: data.goalId && typeof data.goalId === 'string' && data.goalId.trim() ? data.goalId.trim() : null,
        milestoneId: data.milestoneId && typeof data.milestoneId === 'string' && data.milestoneId.trim() ? data.milestoneId.trim() : null,
        dueDate: data.dueDate ? data.dueDate : null,
      })}
    />
  );
}
