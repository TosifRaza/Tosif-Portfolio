import ResourceManager from '../components/ResourceManager.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const FIELDS = [
  { name: 'date', label: 'Date', type: 'date' },
  { name: 'category', label: 'Category', type: 'select', options: ['work', 'learning', 'coding', 'exercise', 'reading', 'sleep', 'personal', 'other'], default: 'work' },
  { name: 'minutes', label: 'Minutes', type: 'number', default: 0 },
  { name: 'source', label: 'Source', type: 'select', options: ['manual', 'timer'], default: 'manual' },
  { name: 'goalId', label: 'Related goal ID (optional)', type: 'text' },
  { name: 'projectId', label: 'Related project ID (optional)', type: 'text' },
  { name: 'notes', label: 'Notes', type: 'textarea', full: true },
];

const COLUMNS = [
  { key: 'date', label: 'Date', mono: true },
  { key: 'category', label: 'Category', mono: true },
  { key: 'minutes', label: 'Minutes', mono: true },
  { key: 'source', label: 'Source', mono: true },
  { key: 'notes', label: 'Notes', render: (i) => i.notes || '—' },
];

export default function TimeManager() {
  const { token } = useAuth();
  return (
    <ResourceManager
      title="Time Entries"
      resource="time"
      token={token}
      fields={FIELDS}
      columns={COLUMNS}
      searchKeys={['category', 'date', 'notes']}
    />
  );
}
