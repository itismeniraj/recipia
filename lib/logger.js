import util from "util";
const ESC = "\x1b[";
const RESET = `${ESC}0m`;

const ANSI_CODES = {
  text: {
    black: "30m",
    red: "31m",
    green: "32m",
    yellow: "33m",
    blue: "34m",
    magenta: "35m",
    cyan: "36m",
    white: "37m",
    // Bright variants
    gray: "90m",
    brightRed: "91m",
    brightGreen: "92m",
    brightYellow: "93m",
    brightBlue: "94m",
    brightMagenta: "95m",
    brightCyan: "96m",
    brightWhite: "97m",
  },
  bg: {
    black: "40m",
    red: "41m",
    green: "42m",
    yellow: "43m",
    blue: "44m",
    magenta: "45m",
    cyan: "46m",
    white: "47m",
    // Bright variants
    gray: "100m",
    brightRed: "101m",
    brightGreen: "102m",
    brightYellow: "103m",
    brightBlue: "104m",
    brightMagenta: "105m",
    brightCyan: "106m",
    brightWhite: "107m",
  },
  style: {
    bold: "1m",
    dim: "2m",
    italic: "3m",
    underline: "4m",
    inverse: "7m",
    strikethrough: "9m",
  },
  // Helper functions for dynamic custom colors
  rgbText: (r, g, b) => `38;2;${r};${g};${b}m`,
  rgbBg: (r, g, b) => `48;2;${r};${g};${b}m`,
};

const isBrowser = typeof window !== "undefined";
const enableColors =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_COLOR === "true";

const LOG_THEMES = {
  INFO: {
    ansiTime: `${ESC}${ANSI_CODES.text.blue}`,
    ansiTag: `${ESC}${ANSI_CODES.bg.blue}${ESC}${ANSI_CODES.text.white}${ESC}${ANSI_CODES.style.bold}[INFO]${RESET}`,
    reset: RESET,
    label: "INFO",
  },
  SUCCESS: {
    ansiTime: `${ESC}${ANSI_CODES.text.green}`,
    ansiTag: `${ESC}${ANSI_CODES.bg.green}${ESC}${ANSI_CODES.text.black}${ESC}${ANSI_CODES.style.bold}[SUCCESS]${RESET}`,
    reset: RESET,
    label: "SUCCESS",
  },
  WARN: {
    ansiTime: `${ESC}${ANSI_CODES.text.yellow}`,
    ansiTag: `${ESC}${ANSI_CODES.bg.yellow}${ESC}${ANSI_CODES.text.black}${ESC}${ANSI_CODES.style.bold}[WARN]${RESET}`,
    reset: RESET,
    label: "WARN",
  },
  ERROR: {
    ansiTime: `${ESC}${ANSI_CODES.text.red}`,
    ansiTag: `${ESC}${ANSI_CODES.bg.red}${ESC}${ANSI_CODES.text.white}${ESC}${ANSI_CODES.style.bold}[ERROR]${RESET}`,
    reset: RESET,
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
