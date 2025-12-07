let history = JSON.parse(localStorage.getItem("calcHistory")) || [];
const maxHistory = 10;

const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const historyListEl = document.getElementById("history-list");
const historyEl = document.getElementById("history");
const themeToggle = document.getElementById("theme-toggle");
const historyToggle = document.getElementById("history-toggle");
const buttons = document.querySelectorAll(".buttons button");

function evaluateExpression(expr) {
  try {
    if (!expr || expr.trim() === "") return "";
    const safe = expr.replace(/×/g, "*").replace(/÷/g, "/");
    const val = eval(safe);
    if (!isFinite(val)) return "Erreur: Division par zéro";
    return val;
  } catch {
    return "";
  }
}

function updateDisplay() {
  const expr = expressionEl.textContent || "";
  const res = evaluateExpression(expr);
  if (res === "Erreur: Division par zéro") {
    resultEl.textContent = res;
    resultEl.classList.add("error");
  } else {
    resultEl.textContent = res;
    resultEl.classList.remove("error");
  }
}

function insertTextAtCaret(text) {
  if (
    resultEl.textContent &&
    resultEl.textContent.toLowerCase().includes("erreur")
  ) {
    resultEl.textContent = "";
  }

  expressionEl.focus();

  const sel = window.getSelection();
  if (!sel.rangeCount) {
    const range0 = document.createRange();
    range0.selectNodeContents(expressionEl);
    range0.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range0);
  }
  const range = sel.getRangeAt(0);
  range.deleteContents();

  const textNode = document.createTextNode(text);
  range.insertNode(textNode);

  range.setStartAfter(textNode);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);

  updateDisplay();
}

function isMobile() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
    navigator.userAgent
  );
}

if (isMobile()) {
  expressionEl.addEventListener("focus", (e) => {
    e.preventDefault();
    expressionEl.blur();
  });
}

function deleteCharBeforeCaret() {
  const sel = window.getSelection();
  if (!sel.rangeCount) {
    expressionEl.textContent = (expressionEl.textContent || "").slice(0, -1);
    updateDisplay();
    return;
  }
  const range = sel.getRangeAt(0);

  if (!range.collapsed) {
    range.deleteContents();
    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(expressionEl);
    newRange.collapse(false);
    sel.addRange(newRange);
    updateDisplay();
    return;
  }

  const node = range.startContainer;
  const offset = range.startOffset;

  if (node.nodeType === Node.TEXT_NODE) {
    if (offset > 0) {
      node.deleteData(offset - 1, 1);
      const newRange = document.createRange();
      newRange.setStart(node, offset - 1);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      updateDisplay();
      return;
    }
  }

  const full = expressionEl.textContent || "";
  expressionEl.textContent = full.slice(0, -1);
  updateDisplay();
}

function handleButtonValue(value) {
  if (value === "AC") {
    expressionEl.textContent = "";
    resultEl.textContent = "";
    return;
  }
  if (value === "DEL") {
    deleteCharBeforeCaret();
    return;
  }
  if (value === "=") {
    const expr = (expressionEl.textContent || "").trim();
    const res = evaluateExpression(expr);
    if (res === "" || res === "Erreur: Division par zéro") {
      updateDisplay();
      return;
    }
    const entry = `${expr} = ${res}`;
    history.unshift(entry);
    if (history.length > maxHistory) history.pop();
    localStorage.setItem("calcHistory", JSON.stringify(history));
    updateHistory();

    expressionEl.textContent = String(res);
    updateDisplay();

    const r = document.createRange();
    r.selectNodeContents(expressionEl);
    r.collapse(false);
    const s = window.getSelection();
    s.removeAllRanges();
    s.addRange(r);
    return;
  }
  insertTextAtCaret(value);
}

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const v = btn.dataset.value;
    handleButtonValue(v);
  });
});

expressionEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const expr = (expressionEl.textContent || "").trim();
    const res = evaluateExpression(expr);
    if (res === "" || res === "Erreur: Division par zéro") {
      updateDisplay();
      return;
    }
    const entry = `${expr} = ${res}`;
    history.unshift(entry);
    if (history.length > maxHistory) history.pop();
    localStorage.setItem("calcHistory", JSON.stringify(history));
    updateHistory();

    expressionEl.textContent = String(res);
    updateDisplay();

    const range = document.createRange();
    range.selectNodeContents(expressionEl);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
  if (e.key === "Escape") {
    e.preventDefault();
    expressionEl.textContent = "";
    resultEl.textContent = "";
  }
});

expressionEl.addEventListener("input", () => {
  if (
    resultEl.textContent &&
    resultEl.textContent.toLowerCase().includes("erreur")
  ) {
    resultEl.textContent = "";
  }
  updateDisplay();
});

function updateHistory() {
  historyListEl.innerHTML = "";
  history.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    li.addEventListener("click", () => {
      expressionEl.textContent = item.split(" = ")[0];
      updateDisplay();
      historyEl.classList.remove("show");
      const r = document.createRange();
      r.selectNodeContents(expressionEl);
      r.collapse(false);
      const s = window.getSelection();
      s.removeAllRanges();
      s.addRange(r);
    });
    historyListEl.appendChild(li);
  });
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    themeToggle.textContent = isDark ? "☀️" : "🌙";
  });
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
  }
}

if (historyToggle) {
  historyToggle.addEventListener("click", () => {
    historyEl.classList.toggle("show");
  });
}

updateHistory();
updateDisplay();
