// Optional theme toggle -- the only script the real site ships (§2).
// The site works fully without this; it only overrides the system preference
// tokens.css already follows via prefers-color-scheme.
(function () {
  "use strict";

  var STORAGE_KEY = "theme";
  var root = document.documentElement;

  function applyStored() {
    var stored;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      stored = null; // private browsing / storage blocked -- falls back to system preference
    }
    if (stored === "light" || stored === "dark") {
      root.setAttribute("data-theme", stored);
    }
    return stored;
  }

  function currentChoice() {
    var attr = root.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") return attr;
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  }

  function setTheme(choice) {
    root.setAttribute("data-theme", choice);
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch (e) {
      // storage unavailable -- toggle still works for this page view
    }
    updateButton(choice);
  }

  function updateButton(choice) {
    var btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;
    var next = choice === "dark" ? "light" : "dark";
    btn.setAttribute("aria-pressed", String(choice === "dark"));
    btn.textContent = next === "dark" ? "Dark mode" : "Light mode";
  }

  applyStored();

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;
    updateButton(currentChoice());
    btn.addEventListener("click", function () {
      setTheme(currentChoice() === "dark" ? "light" : "dark");
    });
  });
})();
