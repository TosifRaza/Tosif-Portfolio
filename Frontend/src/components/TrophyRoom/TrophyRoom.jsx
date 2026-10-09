import { motion } from "framer-motion";
import { useApi } from "@/hooks/useApi";
import { api } from "@/utils/api";
import { staggerContainer, staggerItem, slideUp } from "@/utils/animations";
import { Lock, Star } from "lucide-react";

// Rarity system (kept static — these are presentation constants, not data)
const rarityColors = {
  common: "hsl(var(--muted-foreground))",
  rare: "hsl(var(--primary))",
  epic: "hsl(var(--primary))",
  legendary: "#F59E0B",
};

const rarityLabels = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

function AchievementCard({ achievement }) {
  const isLocked = !achievement.unlocked;
  const rarity = achievement.rarity || "common";
  const rarityColor = rarityColors[rarity] || rarityColors.common;

  return (
    <motion.div
      variants={staggerItem}
      className={`relative glass rounded-xl p-4 ${
        isLocked ? "opacity-50" : "glass-hover"
      }`}
      style={!isLocked ? { borderLeft: `3px solid ${rarityColor}` } : {}}
    >
      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute top-2 right-2">
          <Lock size={14} className="text-text-muted" />
        </div>
      )}

      {/* Icon + Title */}
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
          style={{
            background: isLocked ? "rgba(255,255,255,0.04)" : `${rarityColor}20`,
            color: isLocked ? "hsl(var(--muted-foreground))" : rarityColor,
          }}
        >
          {isLocked ? "🔒" : (achievement.icon || "🏆")}
        </div>
        <div>
          <div className={`text-sm font-medium ${isLocked ? "text-text-muted" : "text-text-primary"}`}>
            {achievement.title}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium" style={{ color: rarityColor }}>
              {rarityLabels[rarity]}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-text-secondary mb-2">{achievement.description}</p>

      {/* Stars (default to 3 — admin can't set stars yet, but structure supports it) */}
      <div className="flex gap-0.5 mb-2">
        {[1, 2, 3].map((star) => (
          <Star
            key={star}
            size={12}
            className={star <= (achievement.stars || 3) ? "text-amber-400 fill-amber-400" : "text-text-muted"}
          />
        ))}
      </div>

      {/* Issuer + Date (from MongoDB) */}
      {(achievement.issuer || achievement.date) && (
        <div className="text-[10px] text-text-muted mt-2">
          {achievement.issuer && <span>{achievement.issuer}</span>}
          {achievement.issuer && achievement.date && <span> · </span>}
          {achievement.date && <span>{achievement.date}</span>}
        </div>
      )}

      {/* Progress bar for locked items */}
      {isLocked && achievement.progress !== undefined && achievement.progress > 0 && (
        <div>
          <div className="flex items-center justify-between text-[10px] text-text-muted mb-1">
            <span>Progress</span>
            <span>{achievement.progress}%</span>
          </div>
          <div className="w-full h-1 rounded-full bg-muted/60 overflow-hidden">
            <div className="h-full rounded-full bg-purple-500/50" style={{ width: `${achievement.progress}%` }} />
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Loading skeleton
function TrophySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="glass rounded-xl p-4 animate-pulse">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-muted/60" />
            <div className="flex-1 space-y-1">
              <div className="h-3 bg-muted/60 rounded w-2/3" />
              <div className="h-2 bg-muted/50 rounded w-1/3" />
            </div>
          </div>
          <div className="h-2 bg-muted/50 rounded w-full mb-1" />
          <div className="h-2 bg-muted/50 rounded w-4/5" />
        </div>
      ))}
    </div>
  );
}

export default function TrophyRoom() {
  // Fetch live achievements from MongoDB via backend
  const { data: rawAchievements, loading, error, refetch } = useApi(() => api.getAchievements());

  // Group achievements by Professional / Personal (admin-controlled category)
  const achievementCategories = (() => {
    if (!rawAchievements || rawAchievements.length === 0) return [];

    const normalize = (a) => ({
      id: a._id,
      title: a.title,
      description: a.description || "",
      icon: a.icon || "🏆",
      stars: 3,
      rarity: a.featured ? "epic" : "common",
      unlocked: true,
      issuer: a.issuer,
      date: a.date,
    });

    const professional = rawAchievements.filter((a) => (a.category || "professional") === "professional");
    const personal = rawAchievements.filter((a) => a.category === "personal");

    const groups = [];
    if (professional.length) groups.push({ name: "Professional — jobs, certifications, launches", icon: "trophy", items: professional.map(normalize) });
    if (personal.length) groups.push({ name: "Personal — streaks, learning, milestones", icon: "trophy", items: personal.map(normalize) });
    if (!groups.length) groups.push({ name: "Achievements", icon: "trophy", items: rawAchievements.map(normalize) });
    return groups;
  })();

  const allItems = achievementCategories.flatMap((c) => c.items);
  const totalUnlocked = allItems.filter((a) => a.unlocked).length;
  const totalAchievements = allItems.length;

  if (loading) {
    return (
      <div className="min-h-full p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-1">Achievements & Milestones</h2>
          <p className="text-sm text-text-secondary">Loading achievements from database…</p>
        </div>
        <TrophySkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <h3 className="text-lg font-bold text-text-primary mb-2">Failed to load achievements</h3>
          <p className="text-sm text-text-secondary mb-4">{error}</p>
          <p className="text-xs text-text-muted mb-4">
            Make sure the backend is running on port 5000 and MongoDB Atlas is connected.
          </p>
          <button
            onClick={refetch}
            className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (totalAchievements === 0) {
    return (
      <div className="min-h-full p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-3">🏆</div>
          <h3 className="text-lg font-bold text-text-primary mb-2">No achievements yet</h3>
          <p className="text-sm text-text-secondary">
            Add achievements via the Admin Portal → Achievements → "+ New Achievement"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-6">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={slideUp} className="mb-6">
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-1">Achievements & Milestones</h2>
          <p className="text-sm text-text-secondary">
            {totalUnlocked} of {totalAchievements} achievements unlocked
          </p>
        </motion.div>

        {/* Progress bar */}
        <motion.div variants={staggerItem} className="glass rounded-xl p-4 mb-6">
          <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${(totalUnlocked / totalAchievements) * 100}%` }}
              transition={{ duration: 1.5 }}
            />
          </div>
        </motion.div>

        {/* Categories */}
        {achievementCategories.map((category) => (
          <motion.div key={category.name} variants={slideUp} className="mb-6">
            <h3 className="text-xs text-text-muted uppercase tracking-wider mb-3">{category.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {category.items.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
