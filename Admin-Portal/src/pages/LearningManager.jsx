import ResourceManager from '../components/ResourceManager.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const FIELDS = [
  { name: 'date', label: 'Date', type: 'date' },
  { name: 'skillId', label: 'Skill ID *', type: 'text' },
  { name: 'topicId', label: 'Topic ID (optional)', type: 'text' },
  { name: 'goalId', label: 'Related goal ID (optional)', type: 'text' },
  { name: 'durationMinutes', label: 'Duration (minutes) *', type: 'number', default: 30 },
  { name: 'difficulty', label: 'Difficulty', type: 'select', options: ['easy', 'medium', 'hard'], default: 'medium' },
  { name: 'confidence', label: 'Confidence after (1-5)', type: 'number', default: 3 },
  { name: 'resource', label: 'Resource (course/book/URL)', type: 'text', full: true },
  { name: 'notes', label: 'Notes', type: 'textarea', full: true },
];

const COLUMNS = [
  { key: 'date', label: 'Date', mono: true },
  { key: 'skillId', label: 'Skill', render: (i) => i.skillId?.name || i.skillId || '—' },
  { key: 'durationMinutes', label: 'Minutes', mono: true },
  { key: 'difficulty', label: 'Difficulty', mono: true },
  { key: 'confidence', label: 'Conf.', mono: true },
];

export default function LearningManager() {
  const { token } = useAuth();
  return (
    <div>
      <ResourceManager
        title="Learning Sessions"
        resource="learning"
        token={token}
        fields={FIELDS}
        columns={COLUMNS}
        searchKeys={['date', 'notes', 'resource']}
      />
      <div className="glass rounded-2xl p-4 mt-6 mono text-[11px] text-muted leading-relaxed">
        Tip: open <span className="text-neon-cyan">/skills</span> in this portal to find skill IDs, or{' '}
        <span className="text-neon-cyan">/goals</span> for goal IDs. Topics per skill are managed inside
        the private OS (Skills page) for convenience.
      </div>
    </div>
  );
}
