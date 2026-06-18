import ResourceManager from '../components/ResourceManager.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const FIELDS = [
  { name: 'title', label: 'Title', type: 'text', full: true },
  { name: 'issuer', label: 'Issuer', type: 'text' },
  { name: 'date', label: 'Date / Year', type: 'text', default: '2026' },
  { name: 'icon', label: 'Icon (emoji)', type: 'text', default: '🏆' },
  { name: 'color', label: 'Color (hex)', type: 'text', default: '#00d4ff' },
  { name: 'description', label: 'Description', type: 'textarea', full: true },
  { name: 'order', label: 'Order', type: 'number', default: 0 },
];

const COLUMNS = [
  { key: 'icon', label: '', mono: true },
  { key: 'title', label: 'Title' },
  { key: 'issuer', label: 'Issuer' },
  {
    key: 'color',
    label: 'Color',
    render: (i) => (
      <span className="inline-flex items-center gap-2">
        <span className="w-3 h-3 rounded-full" style={{ background: i.color }} />
        <span className="mono text-xs text-muted">{i.color}</span>
      </span>
    ),
  },
];

export default function AchievementsManager() {
  const { token } = useAuth();
  return (
    <ResourceManager
      title="Achievements"
      resource="achievements"
      token={token}
      fields={FIELDS}
      columns={COLUMNS}
      searchKeys={['title', 'issuer']}
    />
  );
}
