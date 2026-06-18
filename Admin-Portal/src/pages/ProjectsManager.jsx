import ResourceManager from '../components/ResourceManager.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS = ['Active', 'In Progress', 'Completed', 'Archived'];
const DIFFICULTY = ['Low', 'Medium', 'High', 'Extreme'];

const FIELDS = [
  { name: 'missionId', label: 'Mission ID', type: 'text', default: 'MISSION-XXX' },
  { name: 'title', label: 'Title', type: 'text' },
  { name: 'tagline', label: 'Tagline', type: 'text', full: true },
  { name: 'description', label: 'Description', type: 'textarea', full: true },
  { name: 'stack', label: 'Tech Stack (comma separated)', type: 'tags', full: true },
  { name: 'status', label: 'Status', type: 'select', options: STATUS },
  { name: 'difficulty', label: 'Difficulty', type: 'select', options: DIFFICULTY },
  { name: 'githubUrl', label: 'GitHub URL', type: 'text', full: true },
  { name: 'liveUrl', label: 'Live URL', type: 'text', full: true },
  { name: 'featured', label: 'Featured (true/false)', type: 'text', default: 'false' },
  { name: 'order', label: 'Order', type: 'number', default: 0 },
];

const COLUMNS = [
  { key: 'missionId', label: 'ID', mono: true },
  { key: 'title', label: 'Title' },
  {
    key: 'status',
    label: 'Status',
    render: (i) => (
      <span className={`badge border-white/10 ${i.status === 'Active' ? 'text-neon-green' : 'text-muted'}`}>
        {i.status}
      </span>
    ),
  },
  { key: 'difficulty', label: 'Difficulty', mono: true },
  {
    key: 'featured',
    label: 'Featured',
    render: (i) => (i.featured ? <span className="text-neon-cyan">★</span> : <span className="text-muted">—</span>),
  },
];

export default function ProjectsManager() {
  const { token } = useAuth();
  return (
    <ResourceManager
      title="Projects"
      resource="projects"
      token={token}
      fields={FIELDS}
      columns={COLUMNS}
      searchKeys={['missionId', 'title', 'tagline']}
    />
  );
}
