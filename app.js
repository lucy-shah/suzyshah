const STORAGE_KEY = "suzy-portfolio-draft-v1";
const defaultState = {
  intro: "I'm a student filmmaker, writer, and director from Newbury Park, California. I love character-driven stories and realistic teen characters, and work across screenwriting, directing, producing, editing, and live broadcast production.",
  projects: [
    { title: "The Version I Was", year: "2025", credits: "Writer, Director, Producer · Approx. 10 min", notes: "2nd Place, NXT Kino Lime National Competition · CVAF Film Festival selection", script: "", image: "assets/suzy-filming.jpg" },
    { title: "The Candidate", year: "2026", credits: "Writer, Director, Producer · Approx. 10 min", notes: "", script: "", image: "assets/suzy-camera-portrait.jpg" },
    { title: "One Last Summer", year: "2025", credits: "Writer, Director, Producer · Approx. 10 min", notes: "", script: "", image: "assets/suzy-profile-camera.jpg" },
    { title: "The Girl in the Trees", year: "2025", credits: "Writer, Director, Producer · Approx. 10 min", notes: "CVAF Film Festival selection", script: "", image: "assets/suzy-shooting.jpg" }
  ]
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(defaultState);
    const state = JSON.parse(saved);
    return {
      intro: typeof state.intro === "string" ? state.intro : defaultState.intro,
      projects: Array.isArray(state.projects) ? state.projects : structuredClone(defaultState.projects)
    };
  } catch {
    return structuredClone(defaultState);
  }
}

let portfolioState = loadState();
let currentProject = 0;

const signInDialog = document.querySelector(".signin-dialog");
const scriptDialog = document.querySelector(".script-dialog");
const editorDialog = document.querySelector(".editor-dialog");
const filmList = document.querySelector("#film-list");
const slideImage = document.querySelector("#slide-image");
const slideCaption = document.querySelector("#slide-caption");
const slideCount = document.querySelector("#slide-count");
const aboutText = document.querySelector("#about-text");

function showProject(index) {
  const projects = portfolioState.projects;
  if (!projects.length) return;
  currentProject = (index + projects.length) % projects.length;
  const project = projects[currentProject];
  slideImage.src = project.image || "assets/suzy-filming.jpg";
  slideImage.alt = project.title ? `Behind the scenes of ${project.title}` : "Behind the scenes of Suzy filming";
  slideCaption.textContent = [project.title || "Untitled film", project.year].filter(Boolean).join(" · ");
  slideCount.textContent = projects.map((_, i) => i === currentProject ? "●" : "○").join(" ");
}

function openScript(project) {
  document.querySelector("#script-title").textContent = project.title || "Untitled screenplay";
  const screenplay = project.script || "";
  document.querySelector("#script-content").textContent = screenplay;
  document.querySelector("#script-content").hidden = !screenplay;
  document.querySelector("#script-empty").hidden = Boolean(screenplay);
  scriptDialog.showModal();
}

function renderFilms() {
  filmList.replaceChildren();
  portfolioState.projects.forEach(project => {
    const card = document.createElement("article");
    const heading = document.createElement("h3");
    const title = document.createTextNode(project.title || "Untitled film");
    const year = document.createElement("span");
    year.textContent = project.year || "Year TBD";
    heading.append(title, year);
    card.append(heading);

    if (project.credits) {
      const credits = document.createElement("p");
      credits.textContent = project.credits;
      card.append(credits);
    }
    if (project.notes) {
      const notes = document.createElement("p");
      notes.className = "recognition";
      notes.textContent = project.notes;
      card.append(notes);
    }

    const readButton = document.createElement("button");
    readButton.type = "button";
    readButton.className = "read-script";
    readButton.textContent = "Read script ↗";
    readButton.addEventListener("click", () => openScript(project));
    card.append(readButton);
    filmList.append(card);
  });
  showProject(currentProject);
}

function addEditorField(parent, labelText, name, value, multiline = false) {
  const label = document.createElement("label");
  label.className = "editor-label";
  label.append(document.createTextNode(labelText));
  const control = multiline ? document.createElement("textarea") : document.createElement("input");
  control.name = name;
  control.value = value || "";
  if (!multiline) control.type = "text";
  if (multiline && name === "script") control.rows = 8;
  if (multiline && name === "notes") control.rows = 2;
  label.append(control);
  parent.append(label);
}

function renderEditor() {
  document.querySelector("#edit-intro").value = portfolioState.intro;
  const projectsForm = document.querySelector("#editor-projects");
  projectsForm.replaceChildren();

  portfolioState.projects.forEach((project, index) => {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "editor-project";
    const legend = document.createElement("legend");
    legend.textContent = project.title || `New film ${index + 1}`;
    fieldset.append(legend);

    const row = document.createElement("div");
    row.className = "editor-fields-row";
    addEditorField(row, "Film title", "title", project.title);
    addEditorField(row, "Year", "year", project.year);
    fieldset.append(row);
    addEditorField(fieldset, "Credits / runtime", "credits", project.credits);
    addEditorField(fieldset, "Awards or notes", "notes", project.notes, true);
    addEditorField(fieldset, "Image path or URL", "image", project.image);
    addEditorField(fieldset, "Screenplay text", "script", project.script, true);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-movie";
    remove.textContent = "Remove this film";
    remove.addEventListener("click", () => {
      portfolioState.projects.splice(index, 1);
      renderEditor();
    });
    fieldset.append(remove);
    projectsForm.append(fieldset);
  });
}

function saveEditor(event) {
  event.preventDefault();
  const projects = [...document.querySelectorAll(".editor-project")].map(fieldset => {
    const fields = Object.fromEntries([...fieldset.querySelectorAll("[name]")].map(input => [input.name, input.value.trim()]));
    return { ...fields, image: fields.image || "assets/suzy-filming.jpg" };
  }).filter(project => project.title || project.script || project.credits || project.notes);

  portfolioState = {
    intro: document.querySelector("#edit-intro").value.trim() || defaultState.intro,
    projects
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolioState));
    aboutText.textContent = portfolioState.intro;
    renderFilms();
    document.querySelector(".editor-status").textContent = "Saved in this browser.";
  } catch {
    document.querySelector(".editor-status").textContent = "Could not save in this browser. Try shorter screenplay text.";
  }
}

document.querySelectorAll("[data-slide]").forEach(button => {
  button.addEventListener("click", () => showProject(currentProject + (button.dataset.slide === "next" ? 1 : -1)));
});

const nav = document.querySelector("#main-nav");
const menuToggle = document.querySelector(".menu-toggle");
menuToggle.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  nav.classList.toggle("open", open);
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
}));

document.querySelectorAll("[data-open-signin]").forEach(button => button.addEventListener("click", () => signInDialog.showModal()));
document.querySelector(".signin-dialog .dialog-close").addEventListener("click", () => signInDialog.close());
document.querySelector("[data-close-script]").addEventListener("click", () => scriptDialog.close());
document.querySelector("[data-close-editor]").addEventListener("click", () => editorDialog.close());
for (const dialog of [signInDialog, scriptDialog, editorDialog]) {
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
}

document.querySelector("#open-demo-editor").addEventListener("click", () => {
  signInDialog.close();
  renderEditor();
  editorDialog.showModal();
});
document.querySelector("#editor-form").addEventListener("submit", saveEditor);
document.querySelector("#add-movie").addEventListener("click", () => {
  portfolioState.projects.push({ title: "", year: "", credits: "", notes: "", script: "", image: "assets/suzy-filming.jpg" });
  renderEditor();
  document.querySelector(".editor-project:last-child input[name=title]").focus();
});
document.querySelector("#reset-draft").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  portfolioState = structuredClone(defaultState);
  aboutText.textContent = portfolioState.intro;
  renderFilms();
  renderEditor();
  document.querySelector(".editor-status").textContent = "Restored the original resume details.";
});

// Placeholder routes for a future authentication service; the local editor does not call them.
window.portfolioAuth = {
  endpoints: {
    signIn: "/api/auth/sign-in",
    signOut: "/api/auth/sign-out",
    session: "/api/auth/session"
  }
};

aboutText.textContent = portfolioState.intro;
renderFilms();
