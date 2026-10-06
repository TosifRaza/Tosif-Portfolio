import ResourceManager from '../components/ResourceManager.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const PHASES = ['learning', 'student', 'developer', 'builder', 'founder'];

const FIELDS = [
  { name: 'title', label: 'Title', type: 'text', full: true },
  { name: 'year', label: 'Year', type: 'text', default: '2026' },
  { name: 'phase', label: 'Phase', type: 'select', options: PHASES },
  { name: 'icon', label: 'Icon (emoji)', type: 'text', default: '🚀' },
  { name: 'description', label: 'Description', type: 'textarea', full: true },
  { name: 'category', label: 'Category', type: 'select', options: ['career', 'learning', 'product', 'achievement', 'project', 'personal'], default: 'career' },
  { name: 'image', label: 'Image URL', type: 'text', full: true },
  { name: 'visible', label: 'Visible on public site', type: 'checkbox', default: true },
  { name: 'order', label: 'Order', type: 'number', default: 0 },
];

const COLUMNS = [
  { key: 'year', label: 'Year', mono: true },
  { key: 'title', label: 'Title' },
  { key: 'phase', label: 'Phase', mono: true },
];

export default function TimelineManager() {
  const { token } = useAuth();
  return (
    <ResourceManager
      title="Timeline"
      resource="timeline"
      token={token}
      fields={FIELDS}
      columns={COLUMNS}
      searchKeys={['title', 'year', 'phase']}
    />
  );
}
