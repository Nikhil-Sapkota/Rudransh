<div align="center">

# Nikhil Sapkota — Personal Portfolio

**Code, coffee, and concepts.**
A clean, fast, and responsive portfolio that showcases my projects, experience, and journey as a software developer.

[![Live Site](https://img.shields.io/badge/Live-nikhil.name.np-0f766e?style=for-the-badge&logo=googlechrome&logoColor=white)](https://nikhil.name.np)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=flat-square&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white)

[Live Demo](https://nikhil.name.np) · [Blog](https://nikhil.name.np/blog.html) · [Report a Bug](https://github.com/Nikhil-Sapkota/Rudransh/issues)

</div>

<!-- Add a screenshot of your site here:
<p align="center"><img src="assets/screenshot.png" alt="Portfolio preview" width="800"></p>
-->

---

## 📖 About

This repository contains the source code of my personal portfolio website, **[nikhil.name.np](https://nikhil.name.np)**. It is a place where I share who I am, the work I have done, and the things I am learning.

The site is built with plain **HTML, CSS, and JavaScript** on the front end, with a **PHP + MySQL** back end for dynamic features such as the contact form, blog, and admin page. I kept the front end framework-free on purpose, so I can focus on mastering the fundamentals of the web.

---

## ✨ Features

- **Responsive design:** Looks great on phones, tablets, and desktops.
- **Light and dark themes:** A theme toggle lets visitors pick the look they prefer.
- **Experience timeline:** A clear walkthrough of my professional experience and education.
- **Skills and tools:** A quick overview of the technologies I work with.
- **Projects showcase:** Featured work with descriptions, tech tags, and live links.
- **Leadership and community:** Open-source contributions, speaking, and design work.
- **Contact form:** Visitors can send me a message directly from the site.
- **Blog:** A dedicated `blog.html` page for articles and notes.
- **Admin page:** An `admin.html` page for managing site content.
- **Downloadable resume:** One click to get my latest resume as a PDF.
- **SEO ready:** Includes `robots.txt`, `sitemap.xml`, and Open Graph meta tags for rich link previews.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Markup** | HTML5 |
| **Styling** | CSS3 (custom properties for theming) |
| **Scripting** | Vanilla JavaScript (ES6+) |
| **Back end** | PHP (`api/`) |
| **Database** | MySQL (`db/`) |
| **Design** | Figma |
| **Tools** | Git, GitHub, VS Code |

---

## 📁 Project Structure

```text
Rudransh/
├── api/                  # PHP back-end endpoints (contact form, blog, admin)
├── assets/
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript files
│   └── Professional Resume.pdf
├── db/                   # Database files and schema
├── index.html            # Home page (portfolio)
├── blog.html             # Blog page
├── admin.html            # Admin page
├── robots.txt            # Search engine crawl rules
├── sitemap.xml           # Sitemap for SEO
├── 4-beyond.svg          # Graphic asset
├── .hintrc               # Webhint configuration (accessibility and best practices)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [PHP 8+](https://www.php.net/downloads) (for the back-end features)
- [MySQL](https://www.mysql.com/) or MariaDB (for the database)

If you only want to view the front end, you do not need PHP or MySQL. A simple static server is enough.

### 1. Clone the repository

```bash
git clone https://github.com/Nikhil-Sapkota/Rudransh.git
cd Rudransh
```

### 2. Run the front end only

Open `index.html` directly in your browser, or use the **Live Server** extension in VS Code.

### 3. Run with the PHP back end

1. Create a MySQL database and import the schema from the `db/` folder.
2. Add your database credentials to the back-end configuration in `api/`.
3. Start the built-in PHP server from the project root:

```bash
php -S localhost:8000
```

4. Visit **http://localhost:8000** in your browser.

> **Security note:** Never commit real passwords, API keys, or database credentials. Keep them in a config file that is listed in `.gitignore`.

---

## 🎨 Customization

Colors are controlled with CSS custom properties, so the whole look can be changed in one place. Update the values in your stylesheet under `assets/css/`:

```css
:root {
  --text-primary:   #111111;  /* headings and names */
  --text-secondary: #444444;  /* body paragraphs */
  --text-muted:     #6b6b6b;  /* dates, labels, footer */
  --text-accent:    #0f766e;  /* links and highlights */
}
```

To make this site your own:

1. Replace the text in `index.html` with your own information.
2. Swap `assets/Professional Resume.pdf` with your resume and update the link in the navigation.
3. Update the URLs in `sitemap.xml`, `robots.txt`, and the meta tags in each HTML file.

---

## 🌐 Deployment

Because the site uses PHP and MySQL, deploy it to a host that supports both (shared hosting, a VPS, or a similar service). The static pages alone can also be hosted on GitHub Pages, Netlify, or Vercel, but the PHP features will not run there.

---

## 🗺️ Roadmap

- [ ] Add detailed case studies for each project
- [ ] Add more blog posts
- [ ] Run a Lighthouse audit and reach 90+ in every category
- [ ] Improve keyboard navigation and screen reader support
- [ ] Add project screenshots

---

## 📬 Contact

I'm always open to project ideas, collaborations, internships, or a chat about tech.

- **Email:** [mahadevsapkota2@gmail.com](mailto:mahadevsapkota2@gmail.com)
- **Portfolio:** [nikhil.name.np](https://nikhil.name.np)
- **GitHub:** [@Nikhil-Sapkota](https://github.com/Nikhil-Sapkota)
- **LinkedIn:** [Nikhil Sapkota](https://www.linkedin.com/in/nikhil-sapkota-2a71112aa/)
- **X (Twitter):** [@NikhilSapkota50](https://x.com/NikhilSapkota50)
- **Location:** Lalitpur, Nepal

---

## 📄 License

© 2026 Nikhil Sapkota. All rights reserved.

You are welcome to browse this code to learn from it. Please do not copy my personal content, such as text, images, and resume, without permission.

---

<div align="center">

Built with ❤️ and a lot of ☕ in Nepal.

If you like this project, consider giving it a ⭐

</div>
