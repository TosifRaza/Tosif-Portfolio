import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Server,
  Database,
  Code2,
  Wrench,
  Terminal,
  BarChart3,
  ArrowUpRight,
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { api } from '@/utils/api';

const SKILL_CATEGORIES = [
  {
    id: 'backend',
    title: 'Backend',
    icon: Server,
    iconBoxStyle:
      'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:bg-[#0e1d38] dark:border-blue-500/25 dark:text-[#60a5fa]',
    borderHover: 'hover:border-blue-500/40',
    description: 'Build and manage server-side logic, APIs and middleware for my full-stack projects.',
    skills: ['Node.js', 'Express.js', 'Socket.IO', 'REST APIs', 'JWT Auth', 'Razorpay'],
  },
  {
    id: 'database',
    title: 'Database',
    icon: Database,
    iconBoxStyle:
      'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:bg-[#24133b] dark:border-purple-500/25 dark:text-[#c084fc]',
    borderHover: 'hover:border-purple-500/40',
    description: 'Store and manage application data with efficient schemas and queries.',
    skills: ['MongoDB', 'Mongoose'],
  },
  {
    id: 'frontend',
    title: 'Frontend',
    icon: Code2,
    iconBoxStyle:
      'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:bg-[#072720] dark:border-emerald-500/25 dark:text-[#34d399]',
    borderHover: 'hover:border-emerald-500/40',
    description: 'Develop responsive and dynamic user interfaces.',
    skills: ['React', 'JavaScript', 'Tailwind CSS', 'Redux Toolkit', 'React Router', 'HTML & CSS'],
  },
  {
    id: 'tools-devops',
    title: 'Tools & DevOps',
    icon: Wrench,
    iconBoxStyle:
      'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:bg-[#2c1d09] dark:border-amber-500/25 dark:text-[#fbbf24]',
    borderHover: 'hover:border-amber-500/40',
    description: 'Tools for development, version control and deployment.',
    skills: ['Git', 'GitHub', 'VS Code', 'Vite', 'Render', 'Cloudinary'],
  },
  {
    id: 'programming-apis',
    title: 'Programming & APIs',
    icon: Terminal,
    iconBoxStyle:
      'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:bg-[#2e0e24] dark:border-rose-500/25 dark:text-[#fb7185]',
    borderHover: 'hover:border-rose-500/40',
    description: 'Languages and APIs used for problem solving and building features.',
    skills: ['JavaScript', 'Python', 'REST APIs', 'Socket.IO', 'JWT', 'Razorpay'],
  },
  {
    id: 'others',
    title: 'Others',
    icon: BarChart3,
    iconBoxStyle:
      'bg-teal-500/10 border-teal-500/20 text-teal-600 dark:bg-[#082729] dark:border-teal-500/25 dark:text-[#2dd4bf]',
    borderHover: 'hover:border-teal-500/40',
    description: 'Additional tools and libraries for analytics, visualisations and UI enhancements.',
    skills: ['Recharts', 'Axios', 'ESLint', 'Postman', 'Figma'],
  },
];

export default function SkillsPage() {
  const { data: dbSkills } = useApi(() => api.getSkills());

  // Build a lookup map of DB skill details (description, level, etc.)
  const dbSkillMap = useMemo(() => {
    const map = new Map();
    (dbSkills || []).forEach((s) => {
      if (!s.name) return;
      map.set(s.name.toLowerCase().trim(), s);
    });
    return map;
  }, [dbSkills]);

  // Helper to find DB skill description / info by name or common alias
  const getSkillInfo = (name) => {
    const key = name.toLowerCase().trim();
    if (dbSkillMap.has(key)) return dbSkillMap.get(key);
    if (key === 'express.js' && dbSkillMap.has('express')) return dbSkillMap.get('express');
    if (key === 'jwt auth' && dbSkillMap.has('jwt authentication')) return dbSkillMap.get('jwt authentication');
    if (key === 'jwt' && dbSkillMap.has('jwt authentication')) return dbSkillMap.get('jwt authentication');
    if (key === 'razorpay' && dbSkillMap.has('razorpay integration')) return dbSkillMap.get('razorpay integration');
    if (key === 'git' && dbSkillMap.has('git & github')) return dbSkillMap.get('git & github');
    if (key === 'github' && dbSkillMap.has('git & github')) return dbSkillMap.get('git & github');
    return null;
  };

  // Compile categories with their skills + metadata
  const categories = useMemo(() => {
    // Collect all skill names already covered across all 6 cards
    const allExistingLower = new Set();
    SKILL_CATEGORIES.forEach((cat) => {
      cat.skills.forEach((s) => allExistingLower.add(s.toLowerCase()));
    });
    allExistingLower.add('express');
    allExistingLower.add('jwt authentication');
    allExistingLower.add('razorpay integration');
    allExistingLower.add('git & github');

    return SKILL_CATEGORIES.map((cat) => {
      const skillItems = cat.skills.map((skillName) => {
        const info = getSkillInfo(skillName);
        return {
          name: skillName,
          description: info?.description || '',
          level: info?.level ?? null,
        };
      });

      // If any brand new skill is created in DB under this category and not in any card, append it
      if (dbSkills && Array.isArray(dbSkills)) {
        dbSkills.forEach((s) => {
          const sCat = (s.category || '').toLowerCase().trim();
          const sNameLower = (s.name || '').toLowerCase().trim();

          const matchesCat =
            (cat.id === 'backend' && sCat === 'backend') ||
            (cat.id === 'database' && sCat === 'database') ||
            (cat.id === 'frontend' && sCat === 'frontend') ||
            (cat.id === 'tools-devops' && (sCat === 'tools' || sCat === 'devops')) ||
            (cat.id === 'others' && (sCat === 'other' || sCat === 'others' || sCat === 'soft'));

          const isInternshipOnly =
            sNameLower.includes('numpy') ||
            sNameLower.includes('pandas') ||
            sNameLower.includes('matplotlib') ||
            sNameLower.includes('seaborn') ||
            sNameLower.includes('scikit');

          if (matchesCat && !allExistingLower.has(sNameLower) && !isInternshipOnly && s.visible !== false) {
            allExistingLower.add(sNameLower);
            skillItems.push({
              name: s.name,
              description: s.description || '',
              level: s.level ?? null,
            });
          }
        });
      }

      return {
        ...cat,
        skillItems,
      };
    });
  }, [dbSkills, dbSkillMap]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
      {/* ── Section Header ─────────────────────────────────── */}
      <div className="mb-10 sm:mb-12">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 mb-3.5"
        >
          <span className="w-6 h-[2.5px] rounded-full bg-purple-600 dark:bg-[#a855f7] inline-block" />
          <span className="text-xs font-semibold tracking-[0.25em] text-purple-600 dark:text-[#c084fc] uppercase">
            SKILLS
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground dark:text-white mb-3"
        >
          Technical{' '}
          <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-purple-600 dark:from-[#38bdf8] dark:via-[#60a5fa] dark:to-[#a855f7] bg-clip-text text-transparent">
            Skills
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm sm:text-base text-muted-foreground dark:text-slate-400 max-w-2xl font-normal leading-relaxed"
        >
          Technologies used in my projects, with examples of where I applied them.
        </motion.p>
      </div>

      {/* ── Skills Grid (2 rows x 3 cols on desktop) ─────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, index) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.35 }}
              className={`group relative rounded-2xl bg-card border border-border/80 p-6 sm:p-7 flex flex-col backdrop-blur-sm transition-all duration-300 shadow-xs hover:shadow-lg hover:border-border dark:shadow-none dark:bg-[#0b1120]/90 dark:border-slate-800/80 dark:hover:border-slate-700 dark:hover:bg-[#0c1426]/90 hover:-translate-y-0.5 ${cat.borderHover}`}
            >
              {/* Top part: Icon + Title + Arrow */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${cat.iconBoxStyle}`}
                  >
                    <Icon className="w-6 h-6" strokeWidth={1.85} />
                  </div>
                  <h2 className="text-lg font-bold text-foreground dark:text-white tracking-tight">
                    {cat.title}
                  </h2>
                </div>

                <div className="text-muted-foreground group-hover:text-foreground dark:text-slate-500 dark:group-hover:text-slate-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground dark:text-slate-400 text-sm leading-relaxed mb-6 font-normal min-h-[42px]">
                {cat.description}
              </p>

              {/* Skill Pill Badges */}
              <div className="flex flex-wrap gap-2.5 items-center">
                {cat.skillItems.map((skill) => (
                  <span
                    key={skill.name}
                    title={skill.description ? `${skill.name}: ${skill.description}` : skill.name}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200/90 text-[13px] font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-200/80 hover:border-slate-300 dark:bg-[#101726] dark:border-slate-800 dark:text-slate-300 dark:hover:text-white dark:hover:border-slate-700 dark:hover:bg-[#141f33] transition-colors shadow-xs select-none cursor-default"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
