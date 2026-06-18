import React, { createContext, useContext, useReducer, useCallback } from "react";

// ─── State Type ───






































const initialState = {
  activeSection: "home",
  bootComplete: false,
  recruiterMode: false,
  terminalOpen: false,
  aiOpen: false,
  easterEggs: [],
  clickCount: 0,
  idleTime: 0,
  deepDiveProject: null,
  selectedSkill: null,
  selectedLocation: null,
  contactStep: 0,
  missionType: "",
  expandedStep: 0,
  mapLayer: "journey",
};

function appReducer(state, action) {
  switch (action.type) {
    case "SET_ACTIVE_SECTION":
      return { ...state, activeSection: action.payload };
    case "BOOT_COMPLETE":
      return { ...state, bootComplete: true };
    case "TOGGLE_RECRUITER_MODE":
      return { ...state, recruiterMode: !state.recruiterMode };
    case "TOGGLE_TERMINAL":
      return { ...state, terminalOpen: !state.terminalOpen };
    case "SET_TERMINAL":
      return { ...state, terminalOpen: action.payload };
    case "TOGGLE_AI":
      return { ...state, aiOpen: !state.aiOpen };
    case "SET_AI":
      return { ...state, aiOpen: action.payload };
    case "ADD_EASTER_EGG":
      if (state.easterEggs.includes(action.payload)) return state;
      return { ...state, easterEggs: [...state.easterEggs, action.payload] };
    case "INCREMENT_CLICK":
      return { ...state, clickCount: state.clickCount + 1 };
    case "SET_IDLE_TIME":
      return { ...state, idleTime: action.payload };
    case "SET_DEEP_DIVE_PROJECT":
      return { ...state, deepDiveProject: action.payload };
    case "SET_SELECTED_SKILL":
      return { ...state, selectedSkill: action.payload };
    case "SET_SELECTED_LOCATION":
      return { ...state, selectedLocation: action.payload };
    case "SET_CONTACT_STEP":
      return { ...state, contactStep: action.payload };
    case "SET_MISSION_TYPE":
      return { ...state, missionType: action.payload };
    case "SET_EXPANDED_STEP":
      return { ...state, expandedStep: action.payload };
    case "SET_MAP_LAYER":
      return { ...state, mapLayer: action.payload };
    default:
      return state;
  }
}

// ─── Context Type ───












const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setActiveSection = useCallback(
    (section) => dispatch({ type: "SET_ACTIVE_SECTION", payload: section }),
    []
  );
  const bootComplete = useCallback(() => dispatch({ type: "BOOT_COMPLETE" }), []);
  const toggleRecruiterMode = useCallback(() => dispatch({ type: "TOGGLE_RECRUITER_MODE" }), []);
  const toggleTerminal = useCallback(() => dispatch({ type: "TOGGLE_TERMINAL" }), []);
  const toggleAI = useCallback(() => dispatch({ type: "TOGGLE_AI" }), []);
  const incrementClick = useCallback(() => dispatch({ type: "INCREMENT_CLICK" }), []);
  const addEasterEgg = useCallback(
    (egg) => dispatch({ type: "ADD_EASTER_EGG", payload: egg }),
    []
  );

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        setActiveSection,
        bootComplete,
        toggleRecruiterMode,
        toggleTerminal,
        toggleAI,
        incrementClick,
        addEasterEgg,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
