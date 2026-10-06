import ResourceManager from '../components/ResourceManager.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const FIELDS = [
  { name: 'name', label: 'Product name *', type: 'text' },
  { name: 'tagline', label: 'Tagline', type: 'text', full: true },
  { name: 'logoUrl', label: 'Logo URL', type: 'text' },
  { name: 'description', label: 'Description *', type: 'textarea', full: true },
  { name: 'problem', label: 'Problem', type: 'textarea', full: true },
  { name: 'solution', label: 'Solution', type: 'textarea', full: true },
  { name: 'founderRole', label: 'Founder role', type: 'text' },
  { name: 'technologies', label: 'Technologies (comma separated)', type: 'tags', full: true },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: ['idea', 'planning', 'development', 'mvp', 'live', 'maintenance', 'archived'],
    default: 'idea',
  },
  { name: 'launchDate', label: 'Launch date', type: 'text' },
  { name: 'url', label: 'Product URL', type: 'text', full: true },
  { name: 'githubUrl', label: 'GitHub URL', type: 'text', full: true },
  { name: 'caseStudy', label: 'Case study / business model', type: 'textarea', full: true },
  { name: 'images', label: 'Image URLs (comma separated)', type: 'tags', full: true },
  {
    name: 'metrics',
    label: 'Metrics — one "label,value" per line. LEAVE EMPTY if you have no real numbers.',
    type: 'textarea',
    full: true,
  },
  { name: 'featured', label: 'Featured', type: 'checkbox', default: false },
  { name: 'publishStatus', label: 'Publish Status', type: 'select', options: ['published', 'draft', 'archived'], default: 'published' },
  { name: 'order', label: 'Order', type: 'number', default: 0 },
];

const COLUMNS = [
  { key: 'name', label: 'Product' },
  { key: 'status', label: 'Status', mono: true },
  {
    key: 'metrics',
    label: 'Metrics',
    render: (i) => (i.metrics?.length ? i.metrics.map((m) => `${m.label}: ${m.value}`).join(' · ') : '—'),
  },
  {
    key: 'publishStatus',
    label: 'Publish',
    render: (i) => (
      <span className={`badge ${i.publishStatus === 'published' ? 'text-neon-green' : 'text-muted'}`}>
        {i.publishStatus || 'published'}
      </span>
    ),
  },
];

export default function ProductsManager() {
  const { token } = useAuth();

  // Metrics + roadmap need line-based parsing — handled via transform hooks.
  return (
    <ResourceManager
      title="Products"
      resource="products"
      token={token}
      fields={FIELDS}
      columns={COLUMNS}
      searchKeys={['name', 'tagline', 'status']}
      transformOut={(data) => ({
        ...data,
        metrics: typeof data.metrics === 'string'
          ? data.metrics.split('\n').filter((l) => l.trim()).map((l) => {
              const [label, value] = l.split(',');
              return { label: (label || '').trim(), value: (value || '').trim() };
            })
          : data.metrics,
        roadmap: typeof data.roadmap === 'string'
          ? data.roadmap.split('\n').filter((l) => l.trim()).map((l) => {
              // phase,status,quarter,description
              const [phase, status, quarter, description] = l.split(',');
              return { phase: (phase || '').trim(), status: (status || 'upcoming').trim(), quarter: (quarter || '').trim(), description: (description || '').trim() };
            })
          : data.roadmap,
      })}
      transformIn={(item) => ({
        ...item,
        metrics: Array.isArray(item.metrics) ? item.metrics.map((m) => `${m.label},${m.value}`).join('\n') : '',
        roadmap: Array.isArray(item.roadmap)
          ? item.roadmap.map((r) => [r.phase, r.status, r.quarter, r.description].join(',')).join('\n')
          : '',
      })}
    />
  );
}
