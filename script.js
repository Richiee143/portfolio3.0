/* =========================================================
   Richard Licupa - Programmer Profile (script.js)
   Each feature is its own small function.
   At the bottom, init() runs them all once the page is ready.
   ========================================================= */

/* ---------- 1. THEME (light / dark) ---------- */
const THEME_KEY = "portfolio-theme"; // name used to save the choice in localStorage

function getSavedTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch (error) {
    return null; // localStorage can be blocked in some browsers
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  const button = document.getElementById("theme-toggle");
  if (!button) return;

  // Show the icon of the mode you can switch TO
  const icon = button.querySelector("i");
  icon.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
  button.setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
  );
}

function initTheme() {
  // Use the saved theme, or dark by default
  applyTheme(getSavedTheme() || "dark");

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next); // remember after refresh
    } catch (error) {
      /* ignore: the theme still changes, it just won't be saved */
    }
  });
}

/* ---------- 2. SPLASH / INTRO SCREEN ---------- */
const SPLASH_DURATION = 2800; // milliseconds (about 2.8 seconds)

function initSplash() {
  const splash = document.getElementById("splash");
  const skipButton = document.getElementById("skip-intro");
  let finished = false;

  function hideSplash() {
    if (finished) return; // makes sure it only runs once
    finished = true;
    splash.classList.add("hide");                  // fade out (see CSS)
    document.body.classList.remove("is-loading");  // allow scrolling again
    setTimeout(() => splash.remove(), 800);        // remove it after the fade
  }

  setTimeout(hideSplash, SPLASH_DURATION);
  skipButton.addEventListener("click", hideSplash);
}

/* ---------- 3. NAVIGATION (hamburger + active link) ---------- */
function initMobileMenu() {
  const menuButton = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");
  const icon = menuButton.querySelector("i");

  function setMenu(open) {
    navLinks.classList.toggle("open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    icon.className = open ? "fa-solid fa-xmark" : "fa-solid fa-bars";
  }

  menuButton.addEventListener("click", () => {
    setMenu(!navLinks.classList.contains("open"));
  });

  // Close the menu after tapping a link
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  // Close with the Escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  // If the window gets wide again, reset the menu
  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) setMenu(false);
  });
}

// Highlights the nav link of the section you are currently viewing
function initActiveLink() {
  const links = document.querySelectorAll(".nav-link");
  const sections = Array.from(links)
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" } // a section is "current" near the middle of the screen
  );

  sections.forEach((section) => observer.observe(section));
}

/* ---------- 4. TERMINAL (decorative, safe, text only) ---------- */
// Add your own commands here. Each one just prints text lines.
const TERMINAL_COMMANDS = {
  whoami: ["Richard Licupa"],
  status: ["Student / Programmer in Progress"],
  mission: ["Learn. Build. Improve."],
  help: ["Available commands: whoami, status, mission, clear, help"],
};

const TERMINAL_PROMPT = "richard@portfolio:~$";
const PREFERS_REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Adds a prompt line like "richard@portfolio:~$ whoami" and returns the command <span>
function addPromptLine(output, commandText) {
  const line = document.createElement("div");
  line.className = "terminal-line";

  const prompt = document.createElement("span");
  prompt.className = "prompt";
  prompt.textContent = TERMINAL_PROMPT;

  const command = document.createElement("span");
  command.textContent = commandText;

  line.append(prompt, command);
  output.appendChild(line);
  return { line, command };
}

// Adds a plain output line (uses textContent, so nothing typed can run as code)
function addOutputLine(output, text) {
  const line = document.createElement("p");
  line.className = "term-out";
  line.textContent = text;
  output.appendChild(line);
}

// Types a command letter by letter with a blinking cursor
async function typeCommand(output, commandText) {
  const { line, command } = addPromptLine(output, "");
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  line.appendChild(cursor);

  for (const letter of commandText) {
    command.textContent += letter;
    if (!PREFERS_REDUCED_MOTION) await sleep(70);
  }
  if (!PREFERS_REDUCED_MOTION) await sleep(250);
  cursor.remove();
}

async function playTerminalIntro(output) {
  for (const name of ["whoami", "status", "mission"]) {
    await typeCommand(output, name);
    TERMINAL_COMMANDS[name].forEach((text) => addOutputLine(output, text));
    if (!PREFERS_REDUCED_MOTION) await sleep(350);
  }
}

function runTerminalCommand(output, rawText) {
  const text = rawText.trim().toLowerCase();
  if (text === "") return;

  if (text === "clear") {
    output.innerHTML = "";
    return;
  }

  addPromptLine(output, rawText.trim());
  if (TERMINAL_COMMANDS[text]) {
    TERMINAL_COMMANDS[text].forEach((line) => addOutputLine(output, line));
  } else {
    addOutputLine(output, 'Command not found. Type "help" to see what you can try.');
  }
}

function initTerminal() {
  const box = document.getElementById("terminal-box");
  const output = document.getElementById("terminal-output");
  const form = document.getElementById("terminal-form");
  const input = document.getElementById("terminal-input");
  let started = false;

  async function start() {
    if (started) return;
    started = true;
    await playTerminalIntro(output);
    input.disabled = false; // now the visitor can type "help"
  }

  // Start typing only when the terminal scrolls into view
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          start();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(box);
  } else {
    start();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    runTerminalCommand(output, input.value);
    input.value = "";
  });
}

/* ---------- 5. AVATAR PHOTO FALLBACK ---------- */
// If my-photo.jpg is missing (for example it was not uploaded to GitHub),
// show the hoodie icon instead of a broken image.
function initAvatarFallback() {
  const image = document.querySelector(".avatar-img");
  if (!image) return;

  function showHoodie() {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "avatar-svg");
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS(svgNS, "use");
    use.setAttribute("href", "#hoodie-icon");
    svg.appendChild(use);
    image.replaceWith(svg);
  }

  image.addEventListener("error", showHoodie);
  if (image.complete && image.naturalWidth === 0) showHoodie(); // already failed
}

/* ---------- 6. START EVERYTHING ---------- */
function init() {
  initTheme();
  initSplash();
  initMobileMenu();
  initActiveLink();
  initTerminal();
  initAvatarFallback();
}

document.addEventListener("DOMContentLoaded", init);
