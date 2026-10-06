import ResourceManager from '../components/ResourceManager.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const FIELDS = [
  { name: 'title', label: 'Goal title *', type: 'text', full: true },
  { name: 'description', label: 'Description', type: 'textarea', full: true },
  { name: 'category', label: 'Category', type: 'select', options: ['career', 'founder', 'learning', 'financial', 'health', 'personal'], default: 'career' },
  { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  { name: 'status', label: 'Status', type: 'select', options: ['active', 'paused', 'completed', 'archived'], default: 'active' },
  { name: 'progressMode', label: 'Progress mode', type: 'select', options: ['auto', 'manual'], default: 'auto' },
  { name: 'progress', label: 'Progress (0-100; recomputed in auto mode)', type: 'number', default: 0 },
  { name: 'targetDate', label: 'Target date', type: 'date' },
  { name: 'order', label: 'Order', type: 'number', default: 0 },
];

const COLUMNS = [
  { key: 'title', label: 'Goal' },
  { key: 'category', label: 'Category', mono: true },
  { key: 'priority', label: 'Priority', mono: true },
  { key: 'progress', label: 'Progress', render: (i) => `${i.progress ?? 0}%`, mono: true },
  { key: 'status', label: 'Status', mono: true },
  { key: 'targetDate', label: 'Target', render: (i) => (i.targetDate ? new Date(i.targetDate).toLocaleDateString() : '—') },
];

export default function GoalsManager() {
  const { token } = useAuth();
  return (
    <ResourceManager
      title="Goals"
      resource="goals"
      token={token}
      fields={FIELDS}
      columns={COLUMNS}
      searchKeys={['title', 'category', 'status']}
    />
  );
}
