/* ============================================================
   admin.js — Admin Panel Logic
   ============================================================ */
'use strict';

// ── State ─────────────────────────────────────────────────
const state = {
  currentPanel: 'dashboard',
  blogs:        [],
  projects:     [],
  experiences:  [],
  education:    [],
  skills:       [],
  leadership:   [],
  messages:     [],
  content:      {},
  editingBlog:  null,
  editingItem:  null,
};

// ── API Helper ─────────────────────────────────────────────
async function api(endpoint, method = 'GET', body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
  };
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch(endpoint, opts);
  const data = await res.json();
  return data;
}

// ── Toast ──────────────────────────────────────────────────
function toast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('fade-out');
    setTimeout(() => el.remove(), 350);
  }, 3000);
}

// ── Confirm Dialog ─────────────────────────────────────────
let confirmResolve = null;

function showConfirm(title, message) {
  return new Promise(resolve => {
    confirmResolve = resolve;
    document.getElementById('confirm-title').textContent   = title;
    document.getElementById('confirm-message').textContent = message;
    document.getElementById('confirm-dialog').classList.add('open');
  });
}

document.getElementById('confirm-ok').addEventListener('click', () => {
  document.getElementById('confirm-dialog').classList.remove('open');
  if (confirmResolve) confirmResolve(true);
});

document.getElementById('confirm-cancel').addEventListener('click', () => {
  document.getElementById('confirm-dialog').classList.remove('open');
  if (confirmResolve) confirmResolve(false);
});

// ── Auth ───────────────────────────────────────────────────
async function checkAuth() {
  const data = await api('api/auth.php');
  if (data.success && data.data.logged_in) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('sidebar-username').textContent = data.data.username;
    await loadDashboard();
    showPanel('dashboard');
  }
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');
  errEl.textContent = '';

  const data = await api('api/auth.php', 'POST', { action: 'login', username, password });
  if (data.success) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('sidebar-username').textContent = data.username;
    await loadDashboard();
    showPanel('dashboard');
  } else {
    errEl.textContent = data.message;
  }
});

document.getElementById('btn-logout').addEventListener('click', async () => {
  await api('api/auth.php', 'POST', { action: 'logout' });
  location.reload();
});

// ── Panel Navigation ───────────────────────────────────────
function showPanel(name) {
  state.currentPanel = name;

  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));

  const panel = document.getElementById(`panel-${name}`);
  if (panel) panel.classList.add('active');

  const sideItem = document.querySelector(`[data-panel="${name}"]`);
  if (sideItem) sideItem.classList.add('active');

  // Load data on navigate
  const loaders = {
    dashboard:  loadDashboard,
    blogs:      loadBlogsPanel,
    projects:   loadProjectsPanel,
    experience: loadExperiencePanel,
    education:  loadEducationPanel,
    skills:     loadSkillsPanel,
    leadership: loadLeadershipPanel,
    about:      loadAboutPanel,
    messages:   loadMessagesPanel,
    settings:   () => {},
  };

  if (loaders[name]) loaders[name]();
}

document.querySelectorAll('.sidebar-item[data-panel]').forEach(item => {
  item.addEventListener('click', () => showPanel(item.dataset.panel));
});

// ── DASHBOARD ─────────────────────────────────────────────
async function loadDashboard() {
  try {
    const [blogsRes, projRes, msgRes] = await Promise.all([
      api('api/blog.php?all=1'),
      api('api/projects.php?all=1'),
      api('api/contact.php'),
    ]);

    const blogs    = blogsRes.data    || [];
    const projects = projRes.data     || [];
    const messages = msgRes.data      || [];

    safeSet('stat-blogs',    blogs.length);
    safeSet('stat-projects', projects.length);
    safeSet('stat-messages', messages.length);
    safeSet('stat-unread',   messages.filter(m => !m.is_read).length);
  } catch { /* offline */ }
}

function safeSet(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ── BLOG PANEL ────────────────────────────────────────────
async function loadBlogsPanel() {
  const data = await api('api/blog.php?all=1');
  state.blogs = data.data || [];
  renderBlogsTable();
}

function renderBlogsTable() {
  const tbody = document.getElementById('blogs-tbody');
  if (!tbody) return;

  if (!state.blogs.length) {
    tbody.innerHTML = '<tr><td colspan="4" style="color:var(--text-muted);text-align:center;padding:2rem">No blog posts yet.</td></tr>';
    return;
  }

  tbody.innerHTML = state.blogs.map(b => `
    <tr>
      <td style="color:var(--text-primary);font-weight:500">${escHtml(b.title)}</td>
      <td>${formatDate(b.created_at)}</td>
      <td><span class="badge ${b.published ? 'badge-published' : 'badge-draft'}">${b.published ? 'Published' : 'Draft'}</span></td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm" onclick="editBlog(${b.id})">Edit</button>
          <button class="btn btn-sm" onclick="toggleBlogPublish(${b.id}, ${b.published})">${b.published ? 'Unpublish' : 'Publish'}</button>
          <button class="btn btn-sm btn-danger" onclick="deleteBlog(${b.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openBlogEditor(blog = null) {
  state.editingBlog = blog;
  document.getElementById('blog-editor-title').textContent = blog ? 'Edit Post' : 'New Post';
  document.getElementById('blog-title-input').value    = blog?.title    || '';
  document.getElementById('blog-excerpt-input').value  = blog?.excerpt  || '';
  document.getElementById('blog-slug-input').value     = blog?.slug     || '';
  document.getElementById('blog-published-input').value = blog ? String(blog.published) : '0';
  document.getElementById('blog-body-editor').innerHTML = blog?.body || '';
  document.getElementById('blogs-table-view').style.display = 'none';
  document.getElementById('blogs-editor-view').style.display = 'block';
}

function closeBlogEditor() {
  document.getElementById('blogs-table-view').style.display = 'block';
  document.getElementById('blogs-editor-view').style.display = 'none';
  state.editingBlog = null;
}

function editBlog(id) {
  const blog = state.blogs.find(b => b.id === id);
  if (blog) openBlogEditor(blog);
}

async function saveBlog() {
  const title     = document.getElementById('blog-title-input').value.trim();
  const excerpt   = document.getElementById('blog-excerpt-input').value.trim();
  const slug      = document.getElementById('blog-slug-input').value.trim();
  const published = parseInt(document.getElementById('blog-published-input').value);
  const body      = document.getElementById('blog-body-editor').innerHTML.trim();

  if (!title || !body) { toast('Title and body are required.', 'error'); return; }

  let data;
  if (state.editingBlog) {
    data = await api('api/blog.php', 'PUT', { id: state.editingBlog.id, title, excerpt, slug, published, body });
  } else {
    data = await api('api/blog.php', 'POST', { title, excerpt, slug, published, body });
  }

  if (data.success) {
    toast(data.message);
    closeBlogEditor();
    loadBlogsPanel();
  } else {
    toast(data.message, 'error');
  }
}

async function toggleBlogPublish(id, current) {
  const data = await api('api/blog.php', 'PUT', { id, published: current ? 0 : 1 });
  if (data.success) { toast(data.message); loadBlogsPanel(); }
  else toast(data.message, 'error');
}

async function deleteBlog(id) {
  const ok = await showConfirm('Delete Post', 'Are you sure you want to delete this blog post? This cannot be undone.');
  if (!ok) return;
  const data = await api('api/blog.php', 'DELETE', { id });
  if (data.success) { toast(data.message); loadBlogsPanel(); }
  else toast(data.message, 'error');
}

// Editor toolbar commands
function editorCmd(cmd, value = null) {
  document.getElementById('blog-body-editor').focus();
  document.execCommand(cmd, false, value);
}

// ── PROJECTS PANEL ────────────────────────────────────────
async function loadProjectsPanel() {
  const data = await api('api/projects.php?all=1');
  state.projects = data.data || [];
  renderProjectsTable();
}

function renderProjectsTable() {
  const tbody = document.getElementById('projects-tbody');
  if (!tbody) return;

  if (!state.projects.length) {
    tbody.innerHTML = '<tr><td colspan="4" style="color:var(--text-muted);text-align:center;padding:2rem">No projects yet.</td></tr>';
    return;
  }

  tbody.innerHTML = state.projects.map(p => `
    <tr>
      <td style="color:var(--text-primary);font-weight:500">${escHtml(p.name)}</td>
      <td style="max-width:220px;color:var(--text-muted);font-size:0.8rem">${escHtml(p.tech_stack)}</td>
      <td>${p.featured ? '<span class="badge badge-published">Featured</span>' : ''}</td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm" onclick="editProject(${p.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteProject(${p.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openProjectEditor(project = null) {
  state.editingItem = project;
  document.getElementById('project-editor-title').textContent = project ? 'Edit Project' : 'New Project';
  document.getElementById('proj-name').value       = project?.name        || '';
  document.getElementById('proj-desc').value       = project?.description || '';
  document.getElementById('proj-tech').value       = project?.tech_stack  || '';
  document.getElementById('proj-github').value     = project?.github_url  || '';
  document.getElementById('proj-live').value       = project?.live_url    || '';
  document.getElementById('proj-featured').value   = project ? String(project.featured) : '0';
  document.getElementById('proj-order').value      = project?.sort_order  || '0';
  document.getElementById('projects-table-view').style.display = 'none';
  document.getElementById('projects-editor-view').style.display = 'block';
}

function closeProjectEditor() {
  document.getElementById('projects-table-view').style.display = 'block';
  document.getElementById('projects-editor-view').style.display = 'none';
  state.editingItem = null;
}

function editProject(id) {
  const p = state.projects.find(x => x.id === id);
  if (p) openProjectEditor(p);
}

async function saveProject() {
  const payload = {
    name:        document.getElementById('proj-name').value.trim(),
    description: document.getElementById('proj-desc').value.trim(),
    tech_stack:  document.getElementById('proj-tech').value.trim(),
    github_url:  document.getElementById('proj-github').value.trim(),
    live_url:    document.getElementById('proj-live').value.trim(),
    featured:    parseInt(document.getElementById('proj-featured').value),
    sort_order:  parseInt(document.getElementById('proj-order').value) || 0,
  };

  if (!payload.name || !payload.description) { toast('Name and description required.', 'error'); return; }

  let data;
  if (state.editingItem) {
    data = await api('api/projects.php', 'PUT', { id: state.editingItem.id, ...payload });
  } else {
    data = await api('api/projects.php', 'POST', payload);
  }

  if (data.success) { toast(data.message); closeProjectEditor(); loadProjectsPanel(); }
  else toast(data.message, 'error');
}

async function deleteProject(id) {
  const ok = await showConfirm('Delete Project', 'Delete this project permanently?');
  if (!ok) return;
  const data = await api('api/projects.php', 'DELETE', { id });
  if (data.success) { toast(data.message); loadProjectsPanel(); }
  else toast(data.message, 'error');
}

// ── GENERIC TABLE PANEL (Experience, Education, Leadership) ─
function makeTablePanel(table, fields, columns) {
  return {
    async load() {
      const data = await api(`api/content.php?table=${table}`);
      state[table] = data.data || [];
      this.render();
    },

    render() {
      const tbody = document.getElementById(`${table}-tbody`);
      if (!tbody) return;

      if (!state[table].length) {
        tbody.innerHTML = `<tr><td colspan="${columns.length + 1}" style="color:var(--text-muted);text-align:center;padding:2rem">No entries yet.</td></tr>`;
        return;
      }

      tbody.innerHTML = state[table].map(row => `
        <tr>
          ${columns.map(c => `<td>${escHtml(String(row[c] || ''))}</td>`).join('')}
          <td>
            <div class="btn-group">
              <button class="btn btn-sm" onclick="${table}Panel.openEditor(${row.id})">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="${table}Panel.delete(${row.id})">Delete</button>
            </div>
          </td>
        </tr>
      `).join('');
    },

    openEditor(id = null) {
      const row = id ? state[table].find(r => r.id === id) : null;
      state.editingItem = row;
      const prefix = table;

      document.getElementById(`${prefix}-editor-title`).textContent = row ? 'Edit Entry' : 'New Entry';
      fields.forEach(f => {
        const el = document.getElementById(`${prefix}-${f}`);
        if (el) el.value = row ? (row[f] || '') : '';
      });

      document.getElementById(`${prefix}-table-view`).style.display  = 'none';
      document.getElementById(`${prefix}-editor-view`).style.display = 'block';
    },

    closeEditor() {
      document.getElementById(`${table}-table-view`).style.display  = 'block';
      document.getElementById(`${table}-editor-view`).style.display = 'none';
      state.editingItem = null;
    },

    async save() {
      const payload = { table, action: state.editingItem ? 'update' : 'create' };
      if (state.editingItem) payload.id = state.editingItem.id;
      fields.forEach(f => {
        const el = document.getElementById(`${table}-${f}`);
        if (el) payload[f] = el.value.trim();
      });

      const method = state.editingItem ? 'PUT' : 'POST';
      const data   = await api('api/content.php', method, payload);
      if (data.success) { toast(data.message); this.closeEditor(); this.load(); }
      else toast(data.message, 'error');
    },

    async delete(id) {
      const ok = await showConfirm('Delete Entry', 'Delete this entry permanently?');
      if (!ok) return;
      const data = await api('api/content.php', 'DELETE', { table, id });
      if (data.success) { toast(data.message); this.load(); }
      else toast(data.message, 'error');
    },
  };
}

const experiencesPanel = makeTablePanel(
  'experiences',
  ['role', 'company', 'duration', 'description', 'sort_order'],
  ['role', 'company', 'duration']
);

const educationPanel = makeTablePanel(
  'education',
  ['degree', 'institution', 'year', 'description', 'sort_order'],
  ['degree', 'institution', 'year']
);

const leadershipPanel = makeTablePanel(
  'leadership',
  ['role', 'organization', 'duration', 'description', 'sort_order'],
  ['role', 'organization', 'duration']
);

async function loadExperiencePanel() { await experiencesPanel.load(); }
async function loadEducationPanel()  { await educationPanel.load(); }
async function loadLeadershipPanel() { await leadershipPanel.load(); }

// ── SKILLS PANEL ──────────────────────────────────────────
async function loadSkillsPanel() {
  const data = await api('api/content.php?table=skills');
  state.skills = data.data || [];
  renderSkillTags();
}

function renderSkillTags() {
  const container = document.getElementById('skills-tag-list');
  if (!container) return;
  container.innerHTML = state.skills.map(s => `
    <div class="admin-tag">
      ${escHtml(s.name)}
      <button onclick="deleteSkill(${s.id})" title="Remove">×</button>
    </div>
  `).join('');
}

async function addSkill() {
  const input = document.getElementById('new-skill-input');
  const name  = input.value.trim();
  if (!name) return;

  const data = await api('api/content.php', 'POST', {
    table: 'skills', action: 'create', name,
    sort_order: state.skills.length + 1,
  });

  if (data.success) { toast('Skill added.'); input.value = ''; loadSkillsPanel(); }
  else toast(data.message, 'error');
}

async function deleteSkill(id) {
  const data = await api('api/content.php', 'DELETE', { table: 'skills', id });
  if (data.success) { toast('Skill removed.'); loadSkillsPanel(); }
  else toast(data.message, 'error');
}

// ── ABOUT / CONTENT PANEL ────────────────────────────────
async function loadAboutPanel() {
  const data = await api('api/content.php?table=site_content');
  state.content = data.data || {};
  const container = document.getElementById('about-content-list');
  if (!container) return;

  const keys = [
    { key: 'hero_tagline',    label: 'Hero Tagline', type: 'input' },
    { key: 'hero_intro',      label: 'Hero Introduction', type: 'textarea' },
    { key: 'about_detail',    label: 'About Detail', type: 'textarea' },
    { key: 'contact_email',   label: 'Contact Email', type: 'input' },
    { key: 'contact_phone',   label: 'Contact Phone', type: 'input' },
    { key: 'contact_location',label: 'Location', type: 'input' },
    { key: 'twitter_url',     label: 'Twitter URL', type: 'input' },
    { key: 'github_url',      label: 'GitHub URL', type: 'input' },
    { key: 'linkedin_url',    label: 'LinkedIn URL', type: 'input' },
  ];

  container.innerHTML = keys.map(k => `
    <div class="content-edit-item">
      <div class="content-edit-key">${k.label}</div>
      ${k.type === 'textarea'
        ? `<textarea class="content-edit-val" id="content-${k.key}" rows="3">${escHtml(state.content[k.key] || '')}</textarea>`
        : `<input type="text" class="content-edit-val" id="content-${k.key}" value="${escHtml(state.content[k.key] || '')}" />`
      }
    </div>
  `).join('');
}

async function saveAboutContent() {
  const keys = ['hero_tagline','hero_intro','about_detail','contact_email','contact_phone','contact_location','twitter_url','github_url','linkedin_url'];
  let allOk = true;

  for (const key of keys) {
    const el = document.getElementById(`content-${key}`);
    if (!el) continue;
    const value = el.value.trim();
    const data  = await api('api/content.php', 'POST', { table: 'site_content', key, value });
    if (!data.success) allOk = false;
  }

  toast(allOk ? 'Content saved!' : 'Some updates failed.', allOk ? 'success' : 'error');
}

// ── MESSAGES PANEL ────────────────────────────────────────
async function loadMessagesPanel() {
  const data = await api('api/contact.php');
  state.messages = data.data || [];
  renderMessages();
}

function renderMessages() {
  const container = document.getElementById('messages-list');
  if (!container) return;

  if (!state.messages.length) {
    container.innerHTML = '<p style="color:var(--text-muted);padding:2rem 0;text-align:center">No messages yet.</p>';
    return;
  }

  container.innerHTML = state.messages.map(m => `
    <div class="message-card ${m.is_read ? '' : 'unread'}" id="msg-${m.id}">
      <div class="message-meta">
        <div>
          <div class="message-from">${escHtml(m.name)} &lt;${escHtml(m.email)}&gt;
            ${!m.is_read ? '<span class="badge badge-unread" style="margin-left:.5rem">New</span>' : ''}
          </div>
          ${m.subject ? `<div class="message-subject">Re: ${escHtml(m.subject)}</div>` : ''}
        </div>
        <div class="message-date">${formatDate(m.created_at)}</div>
      </div>
      <div class="message-body">${escHtml(m.message)}</div>
      <div class="message-actions">
        ${!m.is_read ? `<button class="btn btn-sm" onclick="markRead(${m.id})">Mark as read</button>` : ''}
        <button class="btn btn-sm btn-danger" onclick="deleteMessage(${m.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

async function markRead(id) {
  const data = await api('api/contact.php', 'PUT', { id });
  if (data.success) { toast('Marked as read.'); loadMessagesPanel(); }
}

async function deleteMessage(id) {
  const ok = await showConfirm('Delete Message', 'Delete this message permanently?');
  if (!ok) return;
  const data = await api('api/contact.php', 'DELETE', { id });
  if (data.success) { toast('Message deleted.'); loadMessagesPanel(); }
}

// ── SETTINGS PANEL ────────────────────────────────────────
document.getElementById('change-pass-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = await api('api/auth.php', 'POST', {
    action:           'change_password',
    current_password: document.getElementById('current-pass').value,
    new_password:     document.getElementById('new-pass').value,
  });
  toast(data.message, data.success ? 'success' : 'error');
  if (data.success) e.target.reset();
});

// ── Utilities ─────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function formatDate(str) {
  const d = new Date(str);
  return d.toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
}

// ── Bootstrap ─────────────────────────────────────────────
checkAuth();
