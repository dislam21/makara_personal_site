const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const clearBtn = document.getElementById("clear-chat");
const startersEl = document.getElementById("chat-starters");

const CHAT_URL = "https://makara-personal-site.onrender.com/chat";

const WELCOME_HTML = `
  <p>Hi — I’m your <strong>dental information</strong> assistant. I can explain hygiene habits, common procedures, and terminology in plain language.</p>
  <p>I’m not a substitute for an in-person exam or diagnosis. For urgent pain, swelling, bleeding, or trauma, contact a dentist or emergency care right away.</p>
`;

let isSending = false;

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

/** Safe assistant HTML: escaped, then newlines to breaks; simple bullet lines become a list */
function formatAssistantHtml(raw) {
    const lines = escapeHtml(raw).split("\n");
    let html = "";
    let inList = false;

    const flushList = () => {
        if (inList) {
            html += "</ul>";
            inList = false;
        }
    };

    for (const line of lines) {
        const bullet = /^-\s+(.+)$/.exec(line);
        if (bullet) {
            if (!inList) {
                html += "<ul>";
                inList = true;
            }
            html += `<li>${bullet[1]}</li>`;
        } else {
            flushList();
            if (line.trim() === "") {
                html += "<br>";
            } else {
                html += `<p>${line}</p>`;
            }
        }
    }
    flushList();
    return html;
}

function scrollChatToBottom() {
    requestAnimationFrame(() => {
        chatBox.scrollTop = chatBox.scrollHeight;
    });
}

function appendMessage(role, bodyHtmlOrText, options = {}) {
    const { isHtml = false, extraClass = "" } = options;
    const wrap = document.createElement("div");
    wrap.className = `msg msg-${role} ${extraClass}`.trim();

    const meta = document.createElement("span");
    meta.className = "msg-meta";
    meta.textContent = role === "user" ? "You" : "Assistant";

    const body = document.createElement("div");
    body.className = "msg-body";
    if (isHtml) {
        body.innerHTML = bodyHtmlOrText;
    } else {
        body.textContent = bodyHtmlOrText;
    }

    wrap.appendChild(meta);
    wrap.appendChild(body);
    chatBox.appendChild(wrap);
    scrollChatToBottom();
    return wrap;
}

function showTypingIndicator() {
    const el = appendMessage("assistant", "", { extraClass: "msg-typing" });
    const body = el.querySelector(".msg-body");
    body.innerHTML =
        '<span class="typing-dot" aria-hidden="true"></span><span class="typing-dot" aria-hidden="true"></span><span class="typing-dot" aria-hidden="true"></span>';
    el.querySelector(".msg-meta").textContent = "Assistant";
    el.setAttribute("aria-busy", "true");
    el.dataset.typing = "true";
    return el;
}

function setBusy(busy) {
    isSending = busy;
    sendBtn.disabled = busy;
    userInput.disabled = busy;
    clearBtn.disabled = busy;
    document.querySelectorAll(".chat-starter").forEach((btn) => {
        btn.disabled = busy;
    });
}

function autoResizeTextarea() {
    userInput.style.height = "auto";
    userInput.style.height = `${Math.min(userInput.scrollHeight, 8 * 24)}px`;
}

async function sendMessage(textOverride) {
    const userMessage = (textOverride ?? userInput.value).trim();
    if (!userMessage || isSending) return;

    userInput.value = "";
    autoResizeTextarea();

    appendMessage("user", userMessage);
    if (startersEl && !startersEl.classList.contains("is-hidden")) {
        startersEl.classList.add("is-hidden");
    }

    setBusy(true);
    const typingEl = showTypingIndicator();

    try {
        const response = await fetch(CHAT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const errText =
                typeof data.error === "string" ? data.error : response.statusText || "Request failed";
            throw new Error(errText);
        }

        if (data.error) {
            throw new Error(typeof data.error === "string" ? data.error : "Server error");
        }

        const reply = data.message;
        if (typeof reply !== "string") {
            throw new Error("Unexpected response from server.");
        }

        typingEl.remove();
        appendMessage("assistant", formatAssistantHtml(reply), { isHtml: true });
    } catch (error) {
        typingEl.remove();
        const msg = error instanceof Error ? error.message : "Something went wrong.";
        appendMessage(
            "assistant",
            `I couldn’t reach the assistant just now. (${msg}) Please try again in a moment.`,
        );
    } finally {
        setBusy(false);
        userInput.focus();
        scrollChatToBottom();
    }
}

function resetChat() {
    if (isSending) return;
    chatBox.innerHTML = "";
    appendMessage("assistant", WELCOME_HTML, { isHtml: true });
    if (startersEl) {
        startersEl.classList.remove("is-hidden");
    }
    userInput.value = "";
    autoResizeTextarea();
    userInput.focus();
}

sendBtn.addEventListener("click", () => sendMessage());

userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

userInput.addEventListener("input", autoResizeTextarea);

clearBtn.addEventListener("click", resetChat);

document.querySelectorAll(".chat-starter").forEach((btn) => {
    btn.addEventListener("click", () => {
        const prompt = btn.getAttribute("data-prompt");
        if (prompt) {
            userInput.value = prompt;
            autoResizeTextarea();
            sendMessage(prompt);
        }
    });
});

resetChat();
