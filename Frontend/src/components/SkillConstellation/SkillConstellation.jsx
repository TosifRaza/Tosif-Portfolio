import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import { skillCategories, } from "@/data/skills";
import { useApi } from "@/hooks/useApi";
import { api } from "@/utils/api";
import { staggerContainer, staggerItem, slideUp, } from "@/utils/animations";
import { ChevronRight, X } from "lucide-react";

function SkillNode({ skill, categoryColor, onClick }) {
  const size = 20 + (skill.proficiency / 100) * 30;
  return (
    <motion.button
      variants={staggerItem}
      onClick={onClick}
      className="relative flex items-center gap-3 p-3 rounded-lg glass glass-hover cursor-pointer w-full text-left group"
      whileHover={{ x: 4 }}
    >
      {/* Proficiency dot */}
      <div
        className="rounded-full flex-shrink-0 flex items-center justify-center"
        style={{
          width: size,
          height: size,
          background: `${categoryColor}20`,
          border: `2px solid ${categoryColor}60`,
          boxShadow: `0 0 ${skill.proficiency / 5}px ${categoryColor}30`,
        }}
      >
        <div className="rounded-full" style={{ width: size * 0.5, height: size * 0.5, background: categoryColor }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text-primary">{skill.name}</div>
        <div className="text-xs text-text-secondary">{skill.experience}</div>
      </div>

      {/* Proficiency bar */}
      <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: categoryColor }}
          initial={{ width: 0 }}
          animate={{ width: `${skill.proficiency}%` }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </div>

      <ChevronRight size={14} className="text-text-muted group-hover:text-text-secondary" />
    </motion.button>
  );
}

function SkillDeepDive({ skill, categoryColor, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.3 }}
      className="glass rounded-xl p-6 h-fit"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-heading font-bold text-text-primary">{skill.name}</h3>
          <p className="text-xs text-text-secondary">{skill.experience}</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/[0.06] text-text-secondary">
          <X size={18} />
        </button>
      </div>

      {/* Proficiency ring */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-20 h-20">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="2"
            />
            <motion.path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={categoryColor}
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ strokeDasharray: "0 100" }}
              animate={{ strokeDasharray: `${skill.proficiency} 100` }}
              transition={{ duration: 1.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: categoryColor }}>
            {skill.proficiency}%
          </div>
        </div>
        <div>
          <div className="text-xs text-text-muted uppercase tracking-wider">Proficiency</div>
          <div className="text-lg font-bold text-text-primary">{skill.proficiency}%</div>
        </div>
      </div>

      {/* Connected Skills */}
      <div className="mb-4">
        <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Connected To</div>
        <div className="flex flex-wrap gap-2">
          {skill.connectedTo.map((conn) => (
            <span key={conn} className="text-xs px-2 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-text-secondary">
              {conn}
            </span>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="mb-4">
        <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Projects Using This</div>
        <div className="space-y-1">
          {skill.projects.map((proj) => (
            <div key={proj} className="text-sm text-text-secondary flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: categoryColor }} />
              {proj}
            </div>
          ))}
        </div>
      </div>

      {/* Learning Path */}
      <div>
        <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Learning Path</div>
        <div className="space-y-2">
          {skill.learningPath.completed.length > 0 && (
            <div>
              <div className="text-xs text-green-400 mb-1">Completed</div>
              {skill.learningPath.completed.map((item) => (
                <div key={item} className="text-xs text-text-secondary pl-3">✓ {item}</div>
              ))}
            </div>
          )}
          {skill.learningPath.inProgress.length > 0 && (
            <div>
              <div className="text-xs text-amber-400 mb-1">In Progress</div>
              {skill.learningPath.inProgress.map((item) => (
                <div key={item} className="text-xs text-text-secondary pl-3">↻ {item}</div>
              ))}
            </div>
          )}
          {skill.learningPath.planned.length > 0 && (
            <div>
              <div className="text-xs text-text-muted mb-1">Planned</div>
              {skill.learningPath.planned.map((item) => (
                <div key={item} className="text-xs text-text-muted pl-3">○ {item}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function SkillConstellation() {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#7C6AFF");
  const [activeCategory, setActiveCategory] = useState(null);

  const filteredCategories = activeCategory
    ? skillCategories.filter((c) => c.name === activeCategory)
    : skillCategories;

  return (
    <div className="min-h-full p-6">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={slideUp} className="mb-6">
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-1">Skill Constellation</h2>
          <p className="text-sm text-text-secondary">Click any skill to explore proficiency, projects, and learning path</p>
        </motion.div>

        {/* Category Filter */}
        <motion.div variants={staggerItem} className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveCategory(null)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              !activeCategory ? "bg-purple-500/20 text-purple-400 border-purple-500/30" : "bg-white/[0.03] text-text-secondary border-white/[0.06] hover:border-white/[0.12]"
            }`}
          >
            All
          </button>
          {skillCategories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                activeCategory === cat.name ? "border-opacity-60" : "bg-white/[0.03] text-text-secondary border-white/[0.06] hover:border-white/[0.12]"
              }`}
              style={activeCategory === cat.name ? {
                background: `${cat.color}20`,
                color: cat.color,
                borderColor: `${cat.color}60`,
              } : {}}
            >
              {cat.name}
            </button>
          ))}
        </motion.div>

        {/* Skills Grid */}
        <div className="flex gap-6">
          <motion.div variants={staggerContainer} className="flex-1 space-y-2">
            {filteredCategories.map((category) => (
              <div key={category.name} className="mb-6">
                <div className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: category.color }}>
                  {category.name}
                </div>
                <div className="space-y-2">
                  {category.skills.map((skill) => (
                    <SkillNode
                      key={skill.name}
                      skill={skill}
                      categoryColor={category.color}
                      onClick={() => { setSelectedSkill(skill); setSelectedColor(category.color); }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Deep Dive Panel */}
          <AnimatePresence>
            {selectedSkill && (
              <div className="w-80 flex-shrink-0 hide-mobile">
                <SkillDeepDive
                  skill={selectedSkill}
                  categoryColor={selectedColor}
                  onClose={() => setSelectedSkill(null)}
                />
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
