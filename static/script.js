const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const chatBox = document.getElementById("chat-box");
const fileInput = document.getElementById("file-input");
const attachButton = document.getElementById("attach-button");
const preview = document.getElementById("attachment-preview");
const sendButton = document.getElementById("send-button");
let selectedFile = null;
let previewUrl = null;

function escapeText(text) {
  return String(text).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
}
function scrollBottom() { chatBox.scrollTop = chatBox.scrollHeight; }
function timeNow() { return new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}); }
function removeWelcome() {
  const welcome = document.getElementById("welcome");
  if (welcome) welcome.remove();
}
function addMessage(text, sender, file = null) {
  removeWelcome();
  const row = document.createElement("div");
  row.className = `message-row ${sender}`;
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = sender === "bot" ? "MK" : "YOU";
  const content = document.createElement("div");
  content.className = "message-content";
  const meta = document.createElement("div");
  meta.className = "message-meta";
  meta.textContent = `${sender === "bot" ? "MK Chat Bot" : "You"} · ${timeNow()}`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  if (file && file.type.startsWith("image/")) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file); img.alt = file.name;
    bubble.appendChild(document.createElement("br")); bubble.appendChild(img);
  } else if (file && file.type.startsWith("video/")) {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file); video.controls = true;
    bubble.appendChild(document.createElement("br")); bubble.appendChild(video);
  } else if (file) {
    const detail = document.createElement("div");
    detail.textContent = `📎 ${file.name} (${formatBytes(file.size)})`;
    detail.style.marginTop = "8px";
    bubble.appendChild(detail);
  }
  content.append(meta, bubble); row.append(avatar, content); chatBox.appendChild(row);
  scrollBottom();
  return bubble;
}
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function clearSelectedFile() {
  selectedFile = null; fileInput.value = "";
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null; preview.hidden = true; preview.replaceChildren();
}
function showPreview(file) {
  clearSelectedFile();
  selectedFile = file;
  const mime = file.type || "";
  if (mime.startsWith("image/")) {
    previewUrl = URL.createObjectURL(file);
    const img = document.createElement("img"); img.src = previewUrl; img.alt = "Selected image preview"; preview.appendChild(img);
  } else if (mime.startsWith("video/")) {
    previewUrl = URL.createObjectURL(file);
    const video = document.createElement("video"); video.src = previewUrl; video.muted = true; preview.appendChild(video);
  } else {
    const badge = document.createElement("div"); badge.className = "file-badge";
    badge.textContent = (file.name.split(".").pop() || "FILE").slice(0, 4).toUpperCase(); preview.appendChild(badge);
  }
  const meta = document.createElement("div"); meta.className = "attachment-meta";
  const name = document.createElement("b"); name.textContent = file.name;
  const size = document.createElement("small"); size.textContent = `${formatBytes(file.size)} · Ready to send`;
  meta.append(name, size); preview.appendChild(meta);
  const remove = document.createElement("button"); remove.type = "button"; remove.className = "remove-file"; remove.textContent = "×"; remove.title = "Remove attachment";
  remove.addEventListener("click", clearSelectedFile); preview.appendChild(remove); preview.hidden = false;
}
attachButton.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;
  const allowed = file.type.startsWith("image/") || file.type.startsWith("video/") ||
    file.type === "application/pdf" || file.type.startsWith("text/") ||
    /\.(txt|md|csv|json|py|js|html|css)$/i.test(file.name);
  if (!allowed) { alert("Choose an image, video, PDF, or text/code file."); fileInput.value = ""; return; }
  if (file.size > 18 * 1024 * 1024) { alert("Please choose a file smaller than 18 MB."); fileInput.value = ""; return; }
  showPreview(file);
});
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 150)}px`;
});
input.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); }
});
document.querySelectorAll("[data-prompt]").forEach(button => {
  button.addEventListener("click", () => { input.value = button.dataset.prompt; input.focus(); input.dispatchEvent(new Event("input")); });
});
document.getElementById("new-chat").addEventListener("click", resetChat);
document.getElementById("clear-chat").addEventListener("click", resetChat);
function resetChat() {
  chatBox.replaceChildren();
  const welcome = document.createElement("div"); welcome.id = "welcome"; welcome.className = "welcome";
  welcome.innerHTML = `<div class="hero-orb"><span>✦</span></div><p class="eyebrow">YOUR AI, YOUR WAY</p><h1>Hey there!<br><span>What’s on your mind?</span></h1><p class="welcome-copy">I’m MK, your AI companion. Ask a question, explore an idea, or attach a file and let’s figure it out together.</p><div class="prompt-grid"><button class="prompt-card" data-prompt="Explain machine learning in simple words"><span class="prompt-icon purple">✧</span><b>Learn something</b><small>Explain machine learning simply</small><span class="arrow">↗</span></button><button class="prompt-card" data-prompt="Give me 5 creative project ideas"><span class="prompt-icon blue">◈</span><b>Get inspired</b><small>Find ideas for my next project</small><span class="arrow">↗</span></button><button class="prompt-card" data-prompt="Help me debug my code step by step"><span class="prompt-icon orange">{ }</span><b>Write & debug</b><small>Work through a coding problem</small><span class="arrow">↗</span></button><button class="prompt-card" data-prompt="Give me a study plan for this week"><span class="prompt-icon green">▦</span><b>Make a plan</b><small>Turn goals into clear steps</small><span class="arrow">↗</span></button></div>`;
  chatBox.appendChild(welcome);
  welcome.querySelectorAll("[data-prompt]").forEach(button => button.addEventListener("click", () => { input.value = button.dataset.prompt; input.focus(); input.dispatchEvent(new Event("input")); }));
  clearSelectedFile(); input.value = ""; input.style.height = "auto";
}
form.addEventListener("submit", async event => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message && !selectedFile) return;
  const file = selectedFile;
  addMessage(message || `Please analyze this file: ${file.name}`, "user", file);
  input.value = ""; input.style.height = "auto";
  clearSelectedFile();
  const thinking = addMessage("", "bot");
  const dots = document.createElement("div"); dots.className = "typing";
  dots.innerHTML = "<i></i><i></i><i></i>"; thinking.appendChild(dots);
  sendButton.disabled = true;
  try {
    const body = new FormData();
    body.append("message", message);
    if (file) body.append("file", file, file.name);
    const response = await fetch("/chat", {method:"POST", body});
    const data = await response.json();
    thinking.textContent = data.reply || "I didn't receive a response.";
    if (!response.ok) thinking.textContent = data.reply || `Request failed (${response.status}).`;
  } catch (error) {
    thinking.textContent = "Connection error. Check that MK Chat Bot is running, then try again.";
    console.error(error);
  } finally {
    sendButton.disabled = false; input.focus(); scrollBottom();
  }
});

const hidePandaButton = document.getElementById("hide-panda");
if (hidePandaButton) hidePandaButton.addEventListener("click", () => document.getElementById("panda-mascot")?.remove());
