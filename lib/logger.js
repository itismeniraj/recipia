import util from "util";

// True client-side environment flag
const isBrowserEnv = typeof window !== "undefined";

// Check if running on your local development machine and color env is explicitly active
const isDevelopment = process.env.NODE_ENV === "development";
const enableColors = process.env.NEXT_PUBLIC_COLOR === "true";

// Unified Color Themes for both Server (ANSI) and Browser (CSS)
const LOG_THEMES = {
  INFO: {
    browserTag:
      "background: #0066cc; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;",
    browserTime: "color: #0066cc; font-weight: bold;",
    ansiTag: "\x1b[44m\x1b[37m\x1b[1m[INFO]\x1b[0m",
    ansiTime: "\x1b[34m",
    ansiReset: "\x1b[0m",
    label: "INFO",
  },
  SUCCESS: {
    browserTag:
      "background: #2ea44f; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;",
    browserTime: "color: #2ea44f; font-weight: bold;",
    ansiTag: "\x1b[42m\x1b[30m\x1b[1m[SUCCESS]\x1b[0m",
    ansiTime: "\x1b[32m",
    ansiReset: "\x1b[0m",
    label: "SUCCESS",
  },
  WARN: {
    browserTag:
      "background: #ffcc00; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;",
    browserTime: "color: #ffcc00; font-weight: bold;",
    ansiTag: "\x1b[43m\x1b[30m\x1b[1m[WARN]\x1b[0m",
    ansiTime: "\x1b[33m",
    ansiReset: "\x1b[0m",
    label: "WARN",
  },
  ERROR: {
    browserTag:
      "background: #cc0000; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;",
    browserTime: "color: #cc0000; font-weight: bold;",
    ansiTag: "\x1b[41m\x1b[30m\x1b[1m[ERROR]\x1b[0m",
    ansiTime: "\x1b[31m",
    ansiReset: "\x1b[0m",
    label: "ERROR",
  },
};

// Safe runtime detection for Winston presence on Server
const checkWinstonPresence = () => {
  if (typeof window !== "undefined") return false;
  try {
    const req = eval("require");
    req.resolve("winston");
    return true;
  } catch {
    return false;
  }
};

const winstonIsInstalled = checkWinstonPresence();

// Winston Logger Initialization (Only initializes if installed AND colors are active)
const initWinston = () => {
  if (!winstonIsInstalled || !isDevelopment || !enableColors) return null;
  try {
    const winston = eval("require")("winston");
    const customLevels = { levels: { error: 0, warn: 1, success: 2, info: 3 } };

    const serverFormatter = winston.format.printf(
      ({ level, message, timestamp }) => {
        const tStr = `[${new Date(timestamp || Date.now()).toLocaleTimeString()}]`;
        const upperLevel = level.toUpperCase();
        const theme = LOG_THEMES[upperLevel] || LOG_THEMES.INFO;

        const outputMessage =
          typeof message === "object" && message !== null
            ? util.inspect(message, {
                showHidden: false,
                depth: null,
                colors: true,
                breakLength: 80,
              })
            : message;

        return `${theme.ansiTime}${tStr}${theme.ansiReset} ${theme.ansiTag} ${outputMessage}`;
      },
    );

    return winston.createLogger({
      levels: customLevels.levels,
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        serverFormatter,
      ),
      transports: [new winston.transports.Console()],
    });
  } catch {
    return null;
  }
};

const mainLogger = initWinston();

// Core router that formats logs safely based on environment and context
const handleLog = (levelLabel, val) => {
  const tStr = `[${new Date().toLocaleTimeString()}]`;
  const theme = LOG_THEMES[levelLabel] || LOG_THEMES.INFO;

  // 1. Genuine Browser Environment (Always Styled in Dev Tools if enabled)
  if (isBrowserEnv) {
    if (enableColors) {
      console.log(
        `%c${tStr} %c[${theme.label}]`,
        theme.browserTime,
        theme.browserTag,
        val,
      );
    } else {
      console.log(`${tStr} [${theme.label}]`, val);
    }
    return;
  }

  // 2. Next.js Client-Side Component SSR Prerender Pass
  // Explicitly skip Winston here to ensure log stream interception can happen for browser hydration
  if (process.browser || typeof __next_ssr_context__ !== "undefined") {
    const outputMessage =
      typeof val === "object" && val !== null
        ? util.inspect(val, {
            showHidden: false,
            depth: null,
            colors: isDevelopment && enableColors,
            breakLength: 80,
          })
        : val;

    if (isDevelopment && enableColors) {
      console.log(
        `${theme.ansiTime}${tStr}${theme.ansiReset} ${theme.ansiTag} ${outputMessage}`,
      );
    } else {
      console.log(`${tStr} [${theme.label}] ${outputMessage}`);
    }
    return;
  }

  // 3. Pure Server Environment (API Routes / Server Components)
  if (mainLogger) {
    if (levelLabel === "SUCCESS") {
      return mainLogger.log("success", val);
    }
    return mainLogger[levelLabel.toLowerCase()](val);
  }

  // Standard Server Fallback (If Winston isn't installed or colors are globally disabled)
  const outputMessage =
    typeof val === "object" && val !== null
      ? util.inspect(val, {
          showHidden: false,
          depth: null,
          colors: isDevelopment && enableColors,
          breakLength: 80,
        })
      : val;

  if (isDevelopment && enableColors) {
    console.log(
      `${theme.ansiTime}${tStr}${theme.ansiReset} ${theme.ansiTag} ${outputMessage}`,
    );
  } else {
    console.log(`${tStr} [${theme.label}] ${outputMessage}`);
  }
};

export const logger = {
  info: (val) => handleLog("INFO", val),
  success: (val) => handleLog("SUCCESS", val),
  warn: (val) => handleLog("WARN", val),
  error: (val) => handleLog("ERROR", val),
};
