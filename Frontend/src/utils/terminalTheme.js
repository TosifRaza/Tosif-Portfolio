const STORAGE_KEY = "tosif-terminal-colors";

const COLOR_VARIABLES = {
  text: [
    "--foreground",
    "--card-foreground",
    "--popover-foreground",
    "--secondary-foreground",
    "--accent-foreground",
    "--muted-foreground",
  ],
  accent: ["--primary", "--ring", "--chart-1"],
};

function isHexColor(value) {
  return typeof value === "string" && /^#[\da-f]{6}$/i.test(value);
}

function hexToHslChannels(hex) {
  const red = parseInt(hex.slice(1, 3), 16) / 255;
  const green = parseInt(hex.slice(3, 5), 16) / 255;
  const blue = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;

  if (delta) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    if (max === red) hue = ((green - blue) / delta) % 6;
    else if (max === green) hue = (blue - red) / delta + 2;
    else hue = (red - green) / delta + 4;
    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;
  }

  return `${hue} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`;
}

export function readTerminalTheme() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    return Object.fromEntries(Object.entries(saved).filter(([key, value]) => COLOR_VARIABLES[key] && isHexColor(value)));
  } catch {
    return {};
  }
}

export function saveTerminalTheme(theme) {
  try {
    if (Object.keys(theme).length) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // The live color preview still works when browser storage is unavailable.
  }
}

export function applyTerminalTheme(theme) {
  if (typeof document === "undefined") return;
  const rootStyle = document.documentElement.style;

  for (const [key, variables] of Object.entries(COLOR_VARIABLES)) {
    const color = isHexColor(theme[key]) ? hexToHslChannels(theme[key]) : null;
    for (const variable of variables) {
      if (color) rootStyle.setProperty(variable, color);
      else rootStyle.removeProperty(variable);
    }
  }
}
