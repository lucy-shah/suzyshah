// "Seal & send" posts the note to Formspree, which emails it to Suzy.
// Paste the form's endpoint from formspree.io (Form → Integration) below.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mzedqyog";

const noteForm = document.querySelector("#note-form");
const envelope = document.querySelector(".envelope");
const sentNote = envelope.querySelector(".env-sent");
const errorNote = noteForm.querySelector(".env-error");
const sealButton = document.querySelector(".env-seal");

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
        message: data.note.trim()
      })
    });
    if (!response.ok) throw new Error(`Formspree returned ${response.status}`);
    envelope.classList.add("sealed");
    sentNote.hidden = false;
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
