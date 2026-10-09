import ResourceManager from '../components/ResourceManager.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const FIELDS = [
  { name: 'company', label: 'Company *', type: 'text' },
  { name: 'role', label: 'Role *', type: 'text' },
  { name: 'companyLogo', label: 'Company logo URL', type: 'text' },
  { name: 'location', label: 'Location', type: 'text' },
  { name: 'startDate', label: 'Start (e.g. Jan 2024)', type: 'text' },
  { name: 'endDate', label: 'End', type: 'text' },
  { name: 'current', label: 'Current position', type: 'checkbox', default: false },
  { name: 'description', label: 'Description', type: 'textarea', full: true },
  { name: 'responsibilities', label: 'Responsibilities (one per line)', type: 'textarea', full: true },
  { name: 'technologies', label: 'Technologies (comma separated)', type: 'tags', full: true },
  { name: 'achievements', label: 'Achievements (comma separated)', type: 'tags', full: true },
  { name: 'publishStatus', label: 'Publish Status', type: 'select', options: ['published', 'draft', 'archived'], default: 'published' },
  { name: 'order', label: 'Order', type: 'number', default: 0 },
];

const COLUMNS = [
  { key: 'role', label: 'Role' },
  { key: 'company', label: 'Company' },
  {
    key: 'period',
    label: 'Period',
    render: (i) => `${i.startDate || '?'} — ${i.current ? 'Present' : i.endDate || '?'}`,
    mono: true,
  },
  {
    key: 'publishStatus',
    label: 'Publish',
    render: (i) => (
      <span className={`badge ${i.publishStatus === 'published' ? 'text-neon-green' : 'text-muted-foreground'}`}>
        {i.publishStatus || 'published'}
      </span>
    ),
  },
];

export default function ExperienceManager() {
  const { token } = useAuth();
  return (
    <ResourceManager
      title="Experience"
      resource="experience"
      token={token}
      fields={FIELDS}
      columns={COLUMNS}
      searchKeys={['company', 'role']}
    />
  );
}
