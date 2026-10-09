import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/utils/api";
import { staggerContainer, staggerItem, slideUp } from "@/utils/animations";
import { Rocket, Users, Lightbulb, ArrowRight, Check, Loader2, AlertCircle } from "lucide-react";

const missionTypes = [
  { id: "collab", icon: <Users size={24} />, title: "Collaborate", description: "Let's build something together" },
  { id: "hire", icon: <Rocket size={24} />, title: "Hire Me", description: "Join your amazing team" },
  { id: "idea", icon: <Lightbulb size={24} />, title: "Share an Idea", description: "Have a cool concept to discuss" },
];

export default function ContactPortal() {
  const [step, setStep] = useState(0);
  const [missionType, setMissionType] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", company: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Send to backend → MongoDB Atlas
      // The /api/contact endpoint is public (no JWT needed)
      // The submission is stored in the `contacts` collection
      // Viewable in the Admin Portal → Messages
      await api.submitContact({
        name: formData.name,
        email: formData.email,
        subject: missionType ? `Mission: ${missionType}` : (formData.company || "Portfolio Contact"),
        message: formData.message,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("[ContactPortal] submission error:", err);
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full p-6 flex items-center justify-center">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-lg w-full">
        {/* Header */}
        <motion.div variants={slideUp} className="text-center mb-8">
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-1">Contact Portal</h2>
          <p className="text-sm text-text-secondary">Launch a mission to connect</p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div variants={staggerItem} className="flex items-center justify-center gap-2 mb-8">
          {[0, 1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                s < step ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                s === step ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" :
                "bg-muted/50 text-text-muted border border-border"
              }`}>
                {s < step ? <Check size={14} /> : s + 1}
              </div>
              {s < 2 && <div className={`w-8 h-[2px] ${s < step ? "bg-green-500/30" : "bg-muted/60"}`} />}
            </div>
          ))}
        </motion.div>

        {/* Error banner (shown on any step if submission failed) */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2"
          >
            <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-xs font-medium text-red-500 mb-1">Failed to launch mission</div>
              <div className="text-xs text-text-secondary">{error}</div>
              <div className="text-[10px] text-text-muted mt-1">
                Make sure the backend is running on port 5000 and MongoDB Atlas is connected.
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-text-muted hover:text-text-primary text-xs"
            >
              ✕
            </button>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 0: Mission Type */}
          {step === 0 && !submitted && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
              {missionTypes.map((type) => (
                <motion.button
                  key={type.id}
                  onClick={() => { setMissionType(type.id); setStep(1); }}
                  className="w-full glass glass-hover rounded-xl p-4 flex items-center gap-4 text-left group"
                  whileHover={{ x: 4 }}
                >
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    {type.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-text-primary group-hover:text-purple-400 transition-colors">{type.title}</div>
                    <div className="text-xs text-text-secondary">{type.description}</div>
                  </div>
                  <ArrowRight size={16} className="text-text-muted group-hover:text-purple-400" />
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Step 1: Form */}
          {step === 1 && !submitted && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <label className="text-xs text-text-muted block mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="Company name (optional)"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                  placeholder="Tell me about your mission..."
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="px-4 py-2.5 rounded-lg glass text-text-secondary text-sm hover:bg-muted/60">
                  ← Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.name || !formData.email || !formData.message}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-purple-500/20 text-purple-400 text-sm font-medium hover:bg-purple-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Launch */}
          {step === 2 && !submitted && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center space-y-6">
              <div className="glass rounded-xl p-6 text-left space-y-2">
                <div className="text-xs text-text-muted">Mission Type: <span className="text-purple-400 capitalize">{missionType}</span></div>
                <div className="text-xs text-text-muted">From: <span className="text-text-secondary">{formData.name}</span></div>
                <div className="text-xs text-text-muted">Email: <span className="text-text-secondary">{formData.email}</span></div>
                {formData.company && <div className="text-xs text-text-muted">Company: <span className="text-text-secondary">{formData.company}</span></div>}
                <div className="text-xs text-text-muted pt-2 border-t border-border">Message:</div>
                <div className="text-xs text-text-secondary">{formData.message}</div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={24} className="animate-spin mx-auto" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Rocket size={20} /> LAUNCH MISSION
                  </span>
                )}
              </button>

              <button
                onClick={() => setStep(1)}
                disabled={loading}
                className="text-xs text-text-muted hover:text-text-secondary"
              >
                ← Back to edit
              </button>
            </motion.div>
          )}

          {/* Success */}
          {submitted && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto"
              >
                <Check size={32} className="text-green-400" />
              </motion.div>
              <div>
                <h3 className="text-xl font-heading font-bold text-text-primary">Mission Launched!</h3>
                <p className="text-sm text-text-secondary mt-1">
                  Your message has been stored in the database. I'll respond within 24 hours. Thanks for reaching out!
                </p>
              </div>
              <motion.div
                animate={{ y: [-5, 0, -5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🚀
              </motion.div>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setStep(0);
                  setMissionType("");
                  setFormData({ name: "", email: "", company: "", message: "" });
                }}
                className="text-xs px-4 py-2 rounded-lg glass text-text-secondary hover:bg-muted/60"
              >
                Send another message
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
