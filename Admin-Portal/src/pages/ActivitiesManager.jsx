import ResourceManager from '../components/ResourceManager.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const FIELDS = [
  { name: 'date', label: 'Date', type: 'date' },
  { name: 'title', label: 'What did you work on? *', type: 'text', full: true },
  { name: 'type', label: 'Type', type: 'select', options: ['work', 'learning', 'coding', 'exercise', 'reading', 'sleep', 'personal', 'other'], default: 'work' },
  { name: 'durationMinutes', label: 'Duration (minutes)', type: 'number', default: 0 },
  { name: 'goalId', label: 'Related goal ID (optional)', type: 'text' },
  { name: 'skillId', label: 'Related skill ID (optional)', type: 'text' },
  { name: 'notes', label: 'Notes', type: 'textarea', full: true },
];

const COLUMNS = [
  { key: 'date', label: 'Date', mono: true },
  { key: 'title', label: 'Activity' },
  { key: 'type', label: 'Type', mono: true },
  { key: 'durationMinutes', label: 'Minutes', mono: true },
];

export default function ActivitiesManager() {
  const { token } = useAuth();
  return (
    <ResourceManager
      title="Daily Activities"
      resource="activities"
      token={token}
      fields={FIELDS}
      columns={COLUMNS}
      searchKeys={['title', 'type', 'date']}
    />
  );
}
