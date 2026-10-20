// The site has no mail server, so "seal & send" opens the visitor's email app
// with the note already addressed to Suzy.
const noteForm = document.querySelector("#note-form");
const envelope = document.querySelector(".envelope");
const sentNote = envelope.querySelector(".env-sent");
const errorNote = noteForm.querySelector(".env-error");

noteForm.addEventListener("submit", event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(noteForm));
  const emailOk = noteForm.elements.email.checkValidity();
  if (!data.name.trim() || !emailOk || !data.email.trim() || !data.note.trim()) {
    errorNote.hidden = false;
    return;
  }
  errorNote.hidden = true;
  const subject = `${data.topic} — from ${data.name.trim()}`;
  const body = `${data.note.trim()}\n\n— ${data.name.trim()}\n${data.email.trim()}`;
  envelope.classList.add("sealed");
  sentNote.hidden = false;
  window.location.href = `mailto:suzyshah9@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

envelope.querySelector(".env-again").addEventListener("click", () => {
  noteForm.reset();
  envelope.classList.remove("sealed");
  sentNote.hidden = true;
  noteForm.elements.name.focus();
});
