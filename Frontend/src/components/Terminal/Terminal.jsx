import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { api } from "@/utils/api";
import { commands, getCommandResponse } from "@/data/terminalCommands";
import MatrixRain from "@/components/Terminal/MatrixRain";
import { applyTerminalTheme, readTerminalTheme, saveTerminalTheme } from "@/utils/terminalTheme";

const COLOR_PRESETS = ["#22c55e", "#3b82f6", "#a855f7", "#f97316", "#ec4899", "#f8fafc"];

const HELP_COMMANDS = [
  { name: "help", description: "Show available commands" },
  ...commands.filter(({ name }) => name !== "help").map(({ name, description }) => ({ name, description })),
  { name: "clear", description: "Clear terminal" },
];

const PROFILE_TEXT_FIELDS = [
  ["name", "Name"], ["title", "Professional title"], ["tagline", "Tagline"],
  ["shortBio", "Short bio"], ["longBio", "Long bio"], ["pitch", "Founder pitch"],
];

const COLLECTION_TEXT_FIELDS = {
  projects: { label: "Projects", fields: [["title", "Title"], ["tagline", "Tagline"], ["description", "Description"], ["problem", "Problem"], ["solution", "Solution"], ["role", "Role"], ["caseStudy", "Case study"]] },
  products: { label: "Products", fields: [["name", "Name"], ["tagline", "Tagline"], ["description", "Description"], ["problem", "Problem"], ["solution", "Solution"], ["founderRole", "Founder role"]] },
  skills: { label: "Skills", fields: [["name", "Name"], ["category", "Category"], ["description", "Description"]] },
  timeline: { label: "Timeline", fields: [["title", "Title"], ["year", "Year"], ["description", "Description"]] },
  experience: { label: "Experience", fields: [["company", "Company"], ["role", "Role"], ["location", "Location"], ["description", "Description"]] },
  achievements: { label: "Achievements", fields: [["title", "Title"], ["issuer", "Issuer"], ["date", "Date"], ["description", "Description"]] },
};

function buildEditableTargets(content) {
  if (!content) return [];
  const targets = [];
  const add = (resource, record, group, label, path) => {
    const value = path.split(".").reduce((current, key) => current?.[key], record);
    if (typeof value !== "string" || !value.trim()) return;
    const recordId = record?._id ? String(record._id) : "";
    targets.push({
      id: `${resource}:${recordId}:${path}`,
      resource,
      recordId,
      group,
      label,
      path,
      value,
    });
  };

  PROFILE_TEXT_FIELDS.forEach(([path, label]) => add("profile", content.profile, "Profile", label, path));
  (content.about?.paragraphs || []).forEach((_, index) => add("about", content.about, "About", `Paragraph ${index + 1}`, `paragraphs.${index}`));
  ["highlights", "values"].forEach((group) => (content.about?.[group] || []).forEach((_, index) => {
    add("about", content.about, "About", `${group === "highlights" ? "Highlight" : "Value"} ${index + 1} title`, `${group}.${index}.title`);
    add("about", content.about, "About", `${group === "highlights" ? "Highlight" : "Value"} ${index + 1} description`, `${group}.${index}.description`);
  }));

  const siteFields = [
    ["hero.badge", "Hero badge"], ["hero.heading", "Hero heading"], ["hero.subtitle", "Hero subtitle"],
    ["hero.description", "Hero description"], ["hero.primaryCta.label", "Primary button label"],
    ["hero.secondaryCta.label", "Secondary button label"], ["currentMission.title", "Current mission title"],
    ["currentMission.description", "Current mission description"], ["currentMission.progressLabel", "Mission progress label"],
    ["footer.text", "Footer text"],
  ];
  siteFields.forEach(([path, label]) => add("site", content.site, "Site", label, path));
  (content.site?.nav || []).forEach((_, index) => add("site", content.site, "Site navigation", `Navigation ${index + 1} label`, `nav.${index}.label`));
  (content.site?.sections || []).forEach((_, index) => add("site", content.site, "Site sections", `Section ${index + 1} label`, `sections.${index}.label`));

  Object.entries(COLLECTION_TEXT_FIELDS).forEach(([resource, config]) => {
    (content[resource] || []).forEach((record, index) => {
      const recordTitle = record.title || record.name || record.company || `${config.label.slice(0, -1)} ${index + 1}`;
      config.fields.forEach(([path, label]) => add(resource, record, config.label, `${recordTitle} / ${label}`, path));
      if (resource === "experience") {
        (record.responsibilities || []).forEach((_, itemIndex) => add(resource, record, config.label, `${recordTitle} / Responsibility ${itemIndex + 1}`, `responsibilities.${itemIndex}`));
      }
    });
  });

  return targets;
}

function setNestedTextValue(record, path, value) {
  const parts = path.split(".");
  const finalKey = parts.pop();
  const parent = parts.reduce((current, key) => current[key], record);
  parent[finalKey] = value;
}

function formatRecruiterResponse(data) {
  const lines = [data.reply].filter(Boolean);
  if (data.bullets?.length) lines.push(...data.bullets.map((item) => `- ${item}`));
  if (data.projects?.length) {
    lines.push("Projects:", ...data.projects.map((item) => `- ${item.title}${item.tagline ? ` -- ${item.tagline}` : ""}${item.status ? ` (${item.status})` : ""}`));
  }
  if (data.skills) {
    lines.push("Skills:", ...Object.entries(data.skills).map(([category, items]) =>
      `- ${category}: ${items.map((item) => item.name).join(", ")}`
    ));
  }
  if (data.timeline?.length) lines.push("Experience:", ...data.timeline.map((item) => `- ${item.year || ""} ${item.title}${item.description ? ` -- ${item.description}` : ""}`));
  if (data.achievements?.length) lines.push("Achievements:", ...data.achievements.map((item) => `- ${item.title}${item.issuer ? ` -- ${item.issuer}` : ""}`));
  if (data.contact) {
    lines.push("Contact:", ...Object.entries(data.contact).filter(([, value]) => value).map(([label, value]) => `- ${label}: ${typeof value === "object" ? JSON.stringify(value) : value}`));
  }
  return lines.join("\n") || "I couldn't find an answer for that. Try asking about projects, skills, experience, achievements, or contact info.";
}

export default function Terminal() {
  const { state, dispatch } = useApp();
  const [history, setHistory] = useState([
    { type: "output", text: "FOUNDER OS Terminal v3.0\nType 'help' for available commands.\n" },
  ]);
  const [input, setInput] = useState("");
  const [position, setPosition] = useState(null);
  const [matrixActive, setMatrixActive] = useState(false);
  const [customColors, setCustomColors] = useState(readTerminalTheme);
  const [adminToken, setAdminToken] = useState("");
  const [adminUser, setAdminUser] = useState(null);
  const [adminContent, setAdminContent] = useState(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [contentFilter, setContentFilter] = useState("");
  const [contentDraft, setContentDraft] = useState("");
  const [contentStatus, setContentStatus] = useState("");
  const [contentBusy, setContentBusy] = useState(false);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);
  const panelRef = useRef(null);
  const dragRef = useRef(null);
  const requestSequenceRef = useRef(0);
  const editableTargets = buildEditableTargets(adminContent);
  const matchingTargets = editableTargets.filter((target) =>
    `${target.group} ${target.label} ${target.value}`.toLowerCase().includes(contentFilter.trim().toLowerCase())
  );
  const selectedTarget = editableTargets.find((target) => target.id === selectedTargetId) || editableTargets[0];
  const selectableTargets = selectedTarget && !matchingTargets.some((target) => target.id === selectedTarget.id)
    ? [selectedTarget, ...matchingTargets]
    : matchingTargets;

  const closeMatrix = useCallback(() => setMatrixActive(false), []);

  useLayoutEffect(() => {
    applyTerminalTheme(customColors);
  }, [customColors]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "`") {
        event.preventDefault();
        dispatch({ type: "TOGGLE_TERMINAL" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  const executeCommand = async (command) => {
    const normalized = command.trim().toLowerCase();
    setInput("");

    if (!normalized) return;
    const commandEntry = { type: "input", text: command };
    const knownCommand = HELP_COMMANDS.some((item) => item.name === normalized);

    if (knownCommand) {
      const response = getCommandResponse(command);
      if (response === "__CLEAR__") {
        setHistory([]);
        return;
      }
      if (response === "__MATRIX__") {
        setHistory((current) => [...current, commandEntry]);
        setMatrixActive(true);
        dispatch({ type: "SET_TERMINAL", payload: false });
        return;
      }
      if (response === "__CONTENT__") {
        setHistory((current) => current.some((item) => item.type === "content")
          ? current
          : [...current, commandEntry, { type: "content" }]
        );
        return;
      }
      setHistory((current) => [
        ...current,
        commandEntry,
        normalized === "help"
          ? { type: "help" }
          : response === "__COLORS__"
            ? { type: "colors" }
            : { type: "output", text: response },
      ]);
      return;
    }

    const requestId = ++requestSequenceRef.current;
    setHistory((current) => [
      ...current,
      commandEntry,
      { type: "output", requestId, text: "Looking that up..." },
    ]);
    try {
      const data = await api.askRecruiter(command);
      setHistory((current) => current.map((item) =>
        item.requestId === requestId ? { type: "output", text: formatRecruiterResponse(data) } : item
      ));
    } catch (error) {
      setHistory((current) => current.map((item) =>
        item.requestId === requestId ? { type: "output", text: error.message || "I couldn't get an answer right now. Try again." } : item
      ));
    }
  };

  const handleDragStart = (event) => {
    if (event.button !== 0 || !panelRef.current) return;
    const bounds = panelRef.current.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - bounds.left,
      offsetY: event.clientY - bounds.top,
    };
    setPosition({ left: bounds.left, top: bounds.top });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDrag = (event) => {
    const drag = dragRef.current;
    const panel = panelRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !panel) return;

    const maxLeft = Math.max(8, window.innerWidth - panel.offsetWidth - 8);
    const maxTop = Math.max(8, window.innerHeight - panel.offsetHeight - 8);
    setPosition({
      left: Math.min(maxLeft, Math.max(8, event.clientX - drag.offsetX)),
      top: Math.min(maxTop, Math.max(8, event.clientY - drag.offsetY)),
    });
  };

  const handleDragEnd = (event) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  };

  const updateColor = (key, color) => {
    setCustomColors((current) => {
      const next = { ...current, [key]: color };
      saveTerminalTheme(next);
      return next;
    });
  };

  const removeColor = (key) => {
    setCustomColors((current) => {
      const next = { ...current };
      delete next[key];
      saveTerminalTheme(next);
      return next;
    });
  };

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    setContentBusy(true);
    setContentStatus("Signing in and loading site text...");
    try {
      const session = await api.adminLogin(adminEmail, adminPassword);
      if (session.user?.role !== "admin") throw new Error("This editor requires an admin account.");
      const content = await api.getAdminTextContent(session.token);
      const targets = buildEditableTargets(content);
      setAdminToken(session.token);
      setAdminUser(session.user);
      setAdminContent(content);
      setSelectedTargetId(targets[0]?.id || "");
      setContentFilter("");
      setContentDraft(targets[0]?.value || "");
      setAdminPassword("");
      setContentStatus(targets.length ? "Signed in. Choose the text you want to edit." : "Signed in, but no editable text was found.");
    } catch (error) {
      setAdminPassword("");
      setContentStatus(error.message || "Sign-in failed. Check the admin credentials and try again.");
    } finally {
      setContentBusy(false);
    }
  };

  const handleSaveContent = async (event) => {
    event.preventDefault();
    if (!adminToken || !selectedTarget) return;
    const resourceContent = adminContent[selectedTarget.resource];
    const isCollection = Array.isArray(resourceContent);
    const currentRecord = isCollection
      ? resourceContent.find((record) => String(record._id) === selectedTarget.recordId)
      : resourceContent;
    if (!currentRecord) {
      setContentStatus("This text item is no longer available. Reload the editor and try again.");
      return;
    }

    const nextRecord = JSON.parse(JSON.stringify(currentRecord));
    setNestedTextValue(nextRecord, selectedTarget.path, contentDraft);
    setContentBusy(true);
    setContentStatus("Saving to the live site...");
    try {
      const saved = await api.updateAdminTextContent(selectedTarget.resource, selectedTarget.recordId, nextRecord, adminToken);
      setAdminContent((current) => ({
        ...current,
        [selectedTarget.resource]: isCollection
          ? current[selectedTarget.resource].map((record) => String(record._id) === selectedTarget.recordId ? saved : record)
          : saved,
      }));
      setContentStatus("Saved to the live site. Reload the page to see the published text.");
    } catch (error) {
      setContentStatus(error.message || "Save failed. Sign in again if the admin session expired.");
    } finally {
      setContentBusy(false);
    }
  };

  const signOutOfTextEditor = () => {
    setAdminToken("");
    setAdminUser(null);
    setAdminContent(null);
    setSelectedTargetId("");
    setContentFilter("");
    setContentDraft("");
    setContentStatus("Signed out of the live text editor.");
  };

  return (
    <>
      {matrixActive && <MatrixRain onClose={closeMatrix} />}
      {state.terminalOpen && <AnimatePresence>
      <motion.div
        ref={panelRef}
        className={`fixed z-[60] flex max-h-[min(65dvh,440px)] flex-col overflow-hidden rounded-xl ${position ? "" : "inset-x-3 bottom-3 sm:inset-x-auto sm:bottom-4 sm:left-4 lg:left-20"}`}
        style={{
          left: position?.left,
          top: position?.top,
          bottom: position ? "auto" : undefined,
          width: "min(500px, calc(100vw - 1.5rem))",
          background: "rgba(6, 6, 12, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6)",
        }}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="flex touch-none select-none cursor-move items-center justify-between border-b border-border px-4 py-2"
          onPointerDown={handleDragStart}
          onPointerMove={handleDrag}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
          onDoubleClick={() => setPosition(null)}
          title="Drag to move; double-click to return to the corner"
        >
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <span className="font-mono text-xs text-text-muted">founder-os:~</span>
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => dispatch({ type: "SET_TERMINAL", payload: false })}
            className="rounded p-1 text-text-muted transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close terminal"
            title="Close terminal"
          >
            <X size={14} />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed"
          style={{ maxHeight: "min(280px, 38dvh)" }}
          onClick={() => inputRef.current?.focus()}
        >
          {history.map((item, index) => (
            item.type === "content" ? (
              <div key={index} onClick={(event) => event.stopPropagation()} className="mb-3 rounded-lg border border-border bg-black/20 p-3 font-mono text-xs">
                <p className="mb-3 text-text-secondary">Edit profile, about, home, project, product, skill, timeline, experience, and achievement text. Changes save to the live site.</p>
                {!adminToken ? (
                  <form onSubmit={handleAdminLogin} className="space-y-2">
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(event) => setAdminEmail(event.target.value)}
                      autoComplete="username"
                      required
                      placeholder="Admin email"
                      className="w-full rounded border border-border bg-black/40 px-2 py-1.5 text-text-primary outline-none focus:border-primary"
                    />
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(event) => setAdminPassword(event.target.value)}
                      autoComplete="current-password"
                      required
                      placeholder="Admin password"
                      className="w-full rounded border border-border bg-black/40 px-2 py-1.5 text-text-primary outline-none focus:border-primary"
                    />
                    <button type="submit" disabled={contentBusy} className="rounded border border-primary/50 px-3 py-1.5 text-primary transition hover:bg-primary/10 disabled:opacity-50">
                      {contentBusy ? "Signing in..." : "Sign in to edit live text"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSaveContent} className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-text-muted">
                      <span>Admin: {adminUser?.email}</span>
                      <button type="button" onClick={signOutOfTextEditor} className="text-rose-300 hover:text-white">Sign out</button>
                    </div>
                    {editableTargets.length ? (
                      <>
                        <label htmlFor="terminal-content-target" className="block text-text-primary">Choose site text</label>
                        <input
                          type="search"
                          value={contentFilter}
                          onChange={(event) => {
                            const query = event.target.value;
                            const matching = editableTargets.filter((target) =>
                              `${target.group} ${target.label} ${target.value}`.toLowerCase().includes(query.trim().toLowerCase())
                            );
                            setContentFilter(query);
                            if (matching[0]) {
                              setSelectedTargetId(matching[0].id);
                              setContentDraft(matching[0].value);
                            }
                          }}
                          placeholder="Search by text or section..."
                          className="w-full rounded border border-border bg-black/40 px-2 py-1.5 text-text-primary outline-none focus:border-primary"
                        />
                        <select
                          id="terminal-content-target"
                          value={selectedTarget?.id || ""}
                          onChange={(event) => {
                            const target = editableTargets.find((entry) => entry.id === event.target.value);
                            setSelectedTargetId(event.target.value);
                            setContentDraft(target?.value || "");
                            setContentStatus("");
                          }}
                          className="w-full rounded border border-border bg-[#080d15] px-2 py-1.5 text-text-primary outline-none focus:border-primary"
                        >
                          {selectableTargets.map((target) => (
                            <option key={target.id} value={target.id}>{target.group} / {target.label}</option>
                          ))}
                        </select>
                        <label htmlFor="terminal-content-draft" className="block text-text-primary">Updated text</label>
                        <textarea
                          id="terminal-content-draft"
                          rows={5}
                          value={contentDraft}
                          onChange={(event) => setContentDraft(event.target.value)}
                          className="w-full resize-y rounded border border-border bg-black/40 px-2 py-1.5 text-text-primary outline-none focus:border-primary"
                        />
                        <details className="text-text-muted">
                          <summary className="cursor-pointer hover:text-text-primary">Show current live text</summary>
                          <p className="mt-1 whitespace-pre-wrap">{selectedTarget?.value}</p>
                        </details>
                        <div className="flex flex-wrap gap-2">
                          <button type="submit" disabled={contentBusy || !selectedTarget} className="rounded border border-emerald-500/50 px-3 py-1.5 text-emerald-300 transition hover:bg-emerald-500/10 disabled:opacity-50">
                            {contentBusy ? "Saving..." : "Save to live site"}
                          </button>
                          {contentStatus.startsWith("Saved to the live site") && (
                            <button type="button" onClick={() => window.location.reload()} className="rounded border border-border px-3 py-1.5 text-text-secondary hover:text-foreground">
                              Reload site
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-amber-300">No editable text fields were returned by the CMS.</p>
                    )}
                  </form>
                )}
                {contentStatus && <p role="status" className="mt-2 whitespace-pre-wrap text-text-secondary">{contentStatus}</p>}
                <p className="mt-2 text-[10px] text-text-muted">Your password is cleared after sign-in. The admin token stays in memory only.</p>
              </div>
            ) : item.type === "colors" ? (
              <div key={index} onClick={(event) => event.stopPropagation()} className="mb-3 rounded-lg border border-border bg-black/20 p-3 font-mono text-xs">
                <p className="mb-3 text-text-secondary">Choose a color to preview it across the site. It stays active until you remove it.</p>
                {[{ key: "text", label: "Global text" }, { key: "accent", label: "UI accent" }].map(({ key, label }) => (
                  <div key={key} className="mb-3 last:mb-0">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label htmlFor={`terminal-color-${key}`} className="text-text-primary">{label}</label>
                      {customColors[key] ? (
                        <button type="button" onClick={() => removeColor(key)} className="text-rose-300 hover:text-white">Remove</button>
                      ) : (
                        <span className="text-text-muted">Original</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        id={`terminal-color-${key}`}
                        type="color"
                        value={customColors[key] || (key === "text" ? "#d7e0ef" : "#3b82f6")}
                        onChange={(event) => updateColor(key, event.target.value)}
                        className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent p-0.5"
                        aria-label={`Pick ${label.toLowerCase()}`}
                      />
                      {COLOR_PRESETS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => updateColor(key, color)}
                          className="h-5 w-5 rounded-full border border-white/30 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                          style={{ backgroundColor: color }}
                          aria-label={`Set ${label.toLowerCase()} to ${color}`}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                {(customColors.text || customColors.accent) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomColors({});
                      saveTerminalTheme({});
                    }}
                    className="mt-3 rounded border border-border px-2 py-1 text-text-secondary transition hover:border-primary hover:text-foreground"
                  >
                    Restore original colors
                  </button>
                )}
              </div>
            ) : item.type === "help" ? (
              <div key={index} className="mb-2 font-mono text-xs">
                <div className="mb-1 text-text-secondary">Available commands:</div>
                <div className="flex flex-col">
                  {HELP_COMMANDS.map(({ name, description }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => executeCommand(name)}
                      className="flex gap-3 rounded px-2 py-0.5 text-left text-text-secondary transition-colors hover:bg-green-400/10 hover:text-green-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-400"
                      title={`Run ${name}`}
                    >
                      <span className="w-[68px] shrink-0 text-green-400">{name}</span>
                      <span>- {description}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div key={index} className={item.type === "input" ? "mb-1 text-green-400" : "mb-2 whitespace-pre-wrap text-text-secondary"}>
                {item.type === "input" ? `> ${item.text}` : item.text}
              </div>
            )
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="flex items-center gap-2 border-t border-border px-4 py-2">
          <span className="font-mono text-xs text-green-400">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") executeCommand(input); }}
            className="flex-1 bg-transparent font-mono text-xs text-text-primary focus:outline-none"
            placeholder="Type a command or ask something..."
            autoFocus
          />
        </div>
      </motion.div>
      </AnimatePresence>}
    </>
  );
}
