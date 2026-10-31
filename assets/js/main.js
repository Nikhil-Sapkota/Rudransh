/* ============================================================
   main.js — Portfolio core: loader, nav, scroll, content
   ============================================================ */
'use strict';

// ============================================================
// Page Loader
// ============================================================
const loader = document.getElementById('page-loader');

function hideLoader() {
  if (!loader) return;
  loader.classList.add('hidden');
  document.body.classList.remove('loading');

  // Show nav island after load
  setTimeout(() => {
    const nav = document.getElementById('nav-island');
    if (nav) nav.classList.add('visible');
  }, 300);
}

window.addEventListener('load', () => {
  // Give a small breathing room for the entrance animation
  setTimeout(hideLoader, 1600);
});

// ============================================================
// Scroll Reveal (IntersectionObserver)
// ============================================================
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal, .reveal-stagger');

  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  targets.forEach(el => observer.observe(el));
}

// ============================================================
// Active Nav Section Highlighting
// ============================================================
function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-item[data-section]');

  if (!sections.length || !navItems.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navItems.forEach(item => {
          item.classList.toggle('active', item.dataset.section === id);
        });
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '-10% 0px -55% 0px'
  });

  sections.forEach(s => observer.observe(s));
}

// ============================================================
// Contrast Toggle
// ============================================================
function initContrastToggle() {
  const btn = document.getElementById('contrast-toggle');
  if (!btn) return;

  const key = 'portfolio-contrast';
  const saved = localStorage.getItem(key);
  if (saved === 'light') document.body.classList.add('contrast-light');

  btn.addEventListener('click', () => {
    document.body.classList.toggle('contrast-light');
    const isLight = document.body.classList.contains('contrast-light');
    localStorage.setItem(key, isLight ? 'light' : 'dark');
  });
}

// ============================================================
// Smooth Scroll for Nav Items
// ============================================================
function initSmoothNav() {
  const navItems = document.querySelectorAll('.nav-item[data-section]');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const sectionId = item.dataset.section;
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ============================================================
// Dynamic Content Loading from PHP API
// ============================================================
async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) return data.data;
    return null;
  } catch { return null; }
}

// --- About / Hero content ---
async function loadSiteContent() {
  const content = await fetchJSON('api/content.php?table=site_content');
  if (!content) return;

  setIfExists('hero-tagline', content.hero_tagline);
  setIfExists('hero-intro', content.hero_intro);
  setIfExists('hero-detail', content.about_detail);
  setIfExists('contact-email', content.contact_email);
  setIfExists('contact-phone', content.contact_phone);
  setIfExists('contact-location', content.contact_location);

  const twitterLinks = document.querySelectorAll('[data-social="twitter"]');
  const githubLinks  = document.querySelectorAll('[data-social="github"]');
  const linkedinLinks = document.querySelectorAll('[data-social="linkedin"]');

  twitterLinks.forEach(el => { if (content.twitter_url) el.href = content.twitter_url; });
  githubLinks.forEach(el  => { if (content.github_url)  el.href = content.github_url; });
  linkedinLinks.forEach(el => { if (content.linkedin_url) el.href = content.linkedin_url; });
}

function setIfExists(id, value) {
  const el = document.getElementById(id);
  if (el && value) el.textContent = value;
}

// --- Experience Timeline ---
async function loadExperiences() {
  const items = await fetchJSON('api/content.php?table=experiences');
  const container = document.getElementById('experience-timeline');
  if (!container || !items?.length) return;

  container.innerHTML = items.map(exp => `
    <div class="timeline-item reveal">
      <span class="timeline-duration">${escHtml(exp.duration)}</span>
      <h3 class="timeline-role">${escHtml(exp.role)}</h3>
      <p class="timeline-company">${escHtml(exp.company)}</p>
      <p class="timeline-desc">${escHtml(exp.description)}</p>
    </div>
  `).join('');

  initScrollReveal();
}

// --- Education ---
async function loadEducation() {
  const items = await fetchJSON('api/content.php?table=education');
  const container = document.getElementById('education-list');
  if (!container || !items?.length) return;

  container.innerHTML = items.map(edu => `
    <div class="edu-card reveal">
      <span class="edu-year">${escHtml(edu.year)}</span>
      <h3 class="edu-degree">${escHtml(edu.degree)}</h3>
      <p class="edu-institution">${escHtml(edu.institution)}</p>
      ${edu.description ? `<p class="edu-desc">${escHtml(edu.description)}</p>` : ''}
    </div>
  `).join('');

  initScrollReveal();
}

// --- Skills ---
async function loadSkills() {
  const items = await fetchJSON('api/content.php?table=skills');
  const container = document.getElementById('skills-grid');
  if (!container || !items?.length) return;

  container.innerHTML = items.map(s => `
    <span class="skill-tag">${escHtml(s.name)}</span>
  `).join('');
}

// --- Projects ---
async function loadProjects() {
  const items = await fetchJSON('api/projects.php');
  const container = document.getElementById('projects-grid');
  if (!container || !items?.length) return;

  container.innerHTML = items.map(p => `
    <div class="project-card reveal">
      <div class="project-card-top">
        <h3 class="project-name">${escHtml(p.name)}</h3>
        <div class="project-links">
          ${p.github_url ? `
            <a href="${escHtml(p.github_url)}" target="_blank" rel="noopener"
               class="project-link" title="GitHub" data-cursor-hover>
              <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.5">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
              </svg>
            </a>` : ''}
          ${p.live_url ? `
            <a href="${escHtml(p.live_url)}" target="_blank" rel="noopener"
               class="project-link" title="Live" data-cursor-hover>
              <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>` : ''}
        </div>
      </div>
      <p class="project-desc">${escHtml(p.description)}</p>
      <div class="project-tech">
        ${p.tech_stack.split(',').map(t => `<span class="tech-chip">${escHtml(t.trim())}</span>`).join('')}
      </div>
    </div>
  `).join('');

  initScrollReveal();
}

// --- Leadership ---
async function loadLeadership() {
  const items = await fetchJSON('api/content.php?table=leadership');
  const container = document.getElementById('leadership-list');
  if (!container || !items?.length) return;

  const icons = ['◈', '◇', '◉', '◎', '◆'];
  container.innerHTML = items.map((item, i) => `
    <div class="leadership-item reveal">
      <div class="leadership-icon">${icons[i % icons.length]}</div>
      <div class="leadership-body">
        <div class="leadership-role">${escHtml(item.role)}</div>
        <div class="leadership-org">${escHtml(item.organization)}</div>
        ${item.duration ? `<div class="leadership-duration">${escHtml(item.duration)}</div>` : ''}
        ${item.description ? `<p class="leadership-desc">${escHtml(item.description)}</p>` : ''}
      </div>
    </div>
  `).join('');

  initScrollReveal();
}

// ============================================================
// Contact Form
// ============================================================
function initContactForm() {
  const form   = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form || !status) return;

  const ACCESS_KEY = 'c1867fd9-4229-4cfe-97bb-a413d721a9f3';

  const setStatus = (type, msg) => {
    status.className = 'form-status ' + type;
    status.textContent = msg;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');

    const name    = form.querySelector('#f-name').value.trim();
    const email   = form.querySelector('#f-email').value.trim();
    const subject = form.querySelector('#f-subject').value.trim();
    const message = form.querySelector('#f-message').value.trim();
    const isBot   = form.querySelector('#f-botcheck').checked;

    if (isBot) return; // bot le hidden checkbox tick garyo

    // form ma novalidate xa, tesaile yaha aafai check garne
    if (!name || !email || !message) {
      setStatus('error', 'Please fill in your name, email and message.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error', 'Please enter a valid email address.');
      return;
    }

    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          from_name: 'Portfolio Website',
          subject: subject ? 'Portfolio: ' + subject : 'New message from your portfolio',
          name,
          email,
          message,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success', "Message sent! I'll get back to you soon.");
        form.reset();
      } else {
        setStatus('error', data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error', 'Something went wrong. Please try again.');
    } finally {
      btn.textContent = 'Send Message';
      btn.disabled = false;
    }
  });
}

// ============================================================
// Utility
// ============================================================
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ============================================================
// Init
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initNavHighlight();
  initContrastToggle();
  initSmoothNav();
  initContactForm();

  // Load dynamic content from backend
  loadSiteContent();
  loadExperiences();
  loadEducation();
  loadSkills();
  loadProjects();
  loadLeadership();
});
