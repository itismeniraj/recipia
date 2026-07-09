import util from "util";

const isBrowser = typeof window !== "undefined";
const enableColors =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_COLOR === "true";

const LOG_THEMES = {
  INFO: {
    browserTag:
      "background:#0066cc;color:#fff;font-weight:bold;padding:2px 6px;border-radius:3px;",
    browserTime: "color:#0066cc;font-weight:bold;",
    ansiTag: "\x1b[44m\x1b[37m\x1b[1m[INFO]\x1b[0m",
    ansiTime: "\x1b[34m",
    reset: "\x1b[0m",
    label: "INFO",
  },
  SUCCESS: {
    browserTag:
      "background:#2ea44f;color:#fff;font-weight:bold;padding:2px 6px;border-radius:3px;",
    browserTime: "color:#2ea44f;font-weight:bold;",
    ansiTag: "\x1b[42m\x1b[30m\x1b[1m[SUCCESS]\x1b[0m",
    ansiTime: "\x1b[32m",
    reset: "\x1b[0m",
    label: "SUCCESS",
  },
  WARN: {
    browserTag:
      "background:#ffcc00;color:#000;font-weight:bold;padding:2px 6px;border-radius:3px;",
    browserTime: "color:#ffcc00;font-weight:bold;",
    ansiTag: "\x1b[43m\x1b[30m\x1b[1m[WARN]\x1b[0m",
    ansiTime: "\x1b[33m",
    reset: "\x1b[0m",
    label: "WARN",
  },
  ERROR: {
    browserTag:
      "background:#cc0000;color:#fff;font-weight:bold;padding:2px 6px;border-radius:3px;",
    browserTime: "color:#cc0000;font-weight:bold;",
    ansiTag: "\x1b[41m\x1b[37m\x1b[1m[ERROR]\x1b[0m",
    ansiTime: "\x1b[31m",
    reset: "\x1b[0m",
    label: "ERROR",
  },
};

function format(value) {
  if (typeof value !== "object" || value === null) {
    return value;
  }
  return util.inspect(value, {
    showHidden: false,
    depth: null,
    colors: enableColors,
    breakLength: 80,
  });
}

function browserLog(theme, time, values) {
  if (enableColors) {
    console.log(
      `%c${time} %c[${theme.label}]`,
      theme.browserTime,
      theme.browserTag,
      ...values,
    );
  } else {
    console.log(`${time} [${theme.label}]`, ...values);
  }
}

function serverLog(theme, time, values) {
  const output = values.map((v) => format(v)).join(" ");
  if (enableColors) {
    console.log(
      `${theme.ansiTime}${time}${theme.reset} ${theme.ansiTag} ${output}`,
    );
  } else {
    console.log(`${time} [${theme.label}] ${output}`);
  }
}

function handleLog(level, values) {
  const theme = LOG_THEMES[level];
  const time = `[${new Date().toLocaleTimeString("en-US", { timeZone: "Asia/Kathmandu" })}]`;

  if (isBrowser) {
    browserLog(theme, time, values);
  } else {
    serverLog(theme, time, values);
  }
}

export const logger = {
  info: (...values) => handleLog("INFO", values),
  success: (...values) => handleLog("SUCCESS", values),
  warn: (...values) => handleLog("WARN", values),
  error: (...values) => handleLog("ERROR", values),
};
