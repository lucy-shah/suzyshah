// "Seal & send" posts the note to Formspree, which emails it to Suzy.
// Paste the form's endpoint from formspree.io (Form → Integration) below.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mzedqyog";

const noteForm = document.querySelector("#note-form");
const envelope = document.querySelector(".envelope");
const sentNote = envelope.querySelector(".env-sent");
const errorNote = noteForm.querySelector(".env-error");
const sealButton = document.querySelector(".env-seal");

// Spam guards. Bots tend to fill every field and submit instantly, so a note is
// quietly dropped if the hidden "_gotcha" field has text (Formspree also rejects
// those) or it's sent within a few seconds of the page loading. Each browser can
// send one note per minute.
const pageOpenedAt = Date.now();
const MIN_SECONDS_ON_PAGE = 4;
const COOLDOWN_SECONDS = 60;
const lastSentKey = "suzy-note-last-sent";

function lastSentAt() {
  try { return Number(localStorage.getItem(lastSentKey)) || 0; } catch { return 0; }
}
function rememberSent() {
  try { localStorage.setItem(lastSentKey, String(Date.now())); } catch {}
}
function showSealed() {
  envelope.classList.add("sealed");
  sentNote.hidden = false;
}

function showError(message) {
  errorNote.textContent = message;
  errorNote.hidden = false;
}

noteForm.addEventListener("submit", async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(noteForm));
  const emailOk = noteForm.elements.email.checkValidity();
  if (!data.name.trim() || !emailOk || !data.email.trim() || !data.note.trim()) {
    showError("Please add your name, a valid email, and a note.");
    return;
  }
  errorNote.hidden = true;
  if (data._gotcha || (Date.now() - pageOpenedAt) / 1000 < MIN_SECONDS_ON_PAGE) {
    showSealed();
    return;
  }
  const waitSeconds = Math.ceil(COOLDOWN_SECONDS - (Date.now() - lastSentAt()) / 1000);
  if (waitSeconds > 0) {
    showError(`You just sent a note! Please wait ${waitSeconds} seconds before sending another.`);
    return;
  }
  sealButton.disabled = true;
  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name.trim(),
        email: data.email.trim(),
        _replyto: data.email.trim(),
        _subject: `${data.topic} — from ${data.name.trim()}`,
        topic: data.topic,
        message: data.note.trim(),
        _gotcha: data._gotcha
      })
    });
    if (!response.ok) throw new Error(`Formspree returned ${response.status}`);
    rememberSent();
    showSealed();
  } catch {
    showError("Your note didn't go through. Please try again, or email suzyshah9@gmail.com directly.");
  } finally {
    sealButton.disabled = false;
  }
});

envelope.querySelector(".env-again").addEventListener("click", () => {
  noteForm.reset();
  envelope.classList.remove("sealed");
  sentNote.hidden = true;
  noteForm.elements.name.focus();
});
