import ResourceManager from '../components/ResourceManager.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const FIELDS = [
  { name: 'title', label: 'Task title *', type: 'text', full: true },
  { name: 'goalId', label: 'Goal ID (optional — set automatically when milestone is set)', type: 'text' },
  { name: 'milestoneId', label: 'Milestone ID (optional)', type: 'text' },
  { name: 'status', label: 'Status', type: 'select', options: ['todo', 'in-progress', 'done'], default: 'todo' },
  { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  { name: 'estimateMinutes', label: 'Estimate (minutes)', type: 'number', default: 0 },
  { name: 'dueDate', label: 'Due date', type: 'date' },
  { name: 'notes', label: 'Notes', type: 'textarea', full: true },
];

const COLUMNS = [
  { key: 'title', label: 'Task' },
  { key: 'goalId', label: 'Goal', render: (i) => i.goalId?.title || '—' },
  { key: 'milestoneId', label: 'Milestone', render: (i) => i.milestoneId?.title || '—' },
  { key: 'status', label: 'Status', mono: true },
  { key: 'priority', label: 'Priority', mono: true },
];

export default function TasksManager() {
  const { token } = useAuth();
  return (
    <ResourceManager
      title="Tasks"
      resource="tasks"
      token={token}
      fields={FIELDS}
      columns={COLUMNS}
      searchKeys={['title', 'status']}
    />
  );
}
