import ResourceManager from '../components/ResourceManager.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const CATEGORIES = ['Frontend', 'Backend', 'Database', 'Tools', 'DevOps', 'Soft'];

const FIELDS = [
  { name: 'name', label: 'Skill Name', type: 'text' },
  { name: 'category', label: 'Category', type: 'select', options: CATEGORIES },
  { name: 'level', label: 'Level (0–100)', type: 'number', default: 80 },
  { name: 'icon', label: 'Icon (emoji or URL)', type: 'text', default: '⚙️' },
  { name: 'order', label: 'Order', type: 'number', default: 0 },
];

const COLUMNS = [
  { key: 'name', label: 'Skill' },
  { key: 'category', label: 'Category', mono: true },
  {
    key: 'level',
    label: 'Level',
    render: (i) => (
      <div className="flex items-center gap-2">
        <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple" style={{ width: `${i.level}%` }} />
        </div>
        <span className="mono text-xs text-muted">{i.level}%</span>
      </div>
    ),
  },
];

export default function SkillsManager() {
  const { token } = useAuth();
  return (
    <ResourceManager
      title="Skills"
      resource="skills"
      token={token}
      fields={FIELDS}
      columns={COLUMNS}
      searchKeys={['name', 'category']}
    />
  );
}
