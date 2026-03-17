// Small interactive helpers: theme toggle, dynamic year, and project renderer
const themeToggle = document.getElementById('themeToggle');
const menuToggle = document.getElementById('menuToggle');
const siteMenu = document.getElementById('siteMenu');
const root = document.documentElement;

function applyTheme(theme) {
  if (theme === 'light') root.classList.add('light');
  else root.classList.remove('light');
}

// Load saved theme or respect system preference.
const saved = localStorage.getItem('theme');
const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
applyTheme(saved || (prefersLight ? 'light' : 'dark'));

function updateToggleUI() {
  const isLight = root.classList.contains('light');
  if (!themeToggle) return;
  themeToggle.setAttribute('aria-pressed', String(isLight));
  const icon = themeToggle.querySelector('.icon');
  const label = themeToggle.querySelector('.label');
  if (icon) icon.textContent = isLight ? 'Sun' : 'Moon';
  if (label) label.textContent = isLight ? 'Day' : 'Night';
}

themeToggle?.addEventListener('click', () => {
  const isLight = root.classList.toggle('light');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  updateToggleUI();
});

updateToggleUI();

function setMenuOpen(open) {
  if (!menuToggle || !siteMenu) return;
  menuToggle.setAttribute('aria-expanded', String(open));
  siteMenu.classList.toggle('is-open', open);
}

menuToggle?.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  setMenuOpen(!expanded);
});

siteMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenuOpen(false));
});

document.addEventListener('click', (event) => {
  if (!menuToggle || !siteMenu) return;
  const target = event.target;
  if (!(target instanceof Node)) return;
  if (menuToggle.contains(target) || siteMenu.contains(target)) return;
  setMenuOpen(false);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 720) setMenuOpen(false);
});

// Set current year in footer.
document.getElementById('year').textContent = new Date().getFullYear();

// Render projects from data/projects.json into #projectsGrid.
async function loadAndRenderProjects() {
  try {
    const res = await fetch('data/projects.json');
    if (!res.ok) throw new Error('Failed to load projects.json');
    const projects = await res.json();
    const container = document.getElementById('projectsGrid');
    if (!container) return;
    container.innerHTML = projects.map((p) => projectCardHTML(p)).join('\n');
  } catch (err) {
    console.warn('Could not load projects:', err);
  }
}

function projectCardHTML(p) {
  const tech = (p.tech || []).map((t) => `<span class="muted">${escapeHtml(t)}</span>`).join(' ');
  return `
    <article class="card">
      <h4>${escapeHtml(p.title)}</h4>
      <p class="muted">${escapeHtml(p.description)}</p>
      <p>${tech}</p>
      <p><a href="${escapeAttribute(p.link || '#')}">Read more</a></p>
    </article>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(str) {
  return String(str).replace(/"/g, '&quot;');
}

// Load projects when running from an HTTP server.
loadAndRenderProjects();

// Fade-in-up animation on scroll using IntersectionObserver.
const animatedSections = document.querySelectorAll('.hero, .about, .skills, .experience, .projects, .contact');
animatedSections.forEach((el) => el.classList.add('animate-on-scroll'));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

animatedSections.forEach((el) => observer.observe(el));
