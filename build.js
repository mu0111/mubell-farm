#!/usr/bin/env node
/**
 * MuBell Farm — Lightweight Static Site Generator
 *
 * Usage:  node build.js
 * Output: dist/        (Danish — primary)
 *         dist/en/     (English — secondary)
 *
 * Reads:  content/**\/*.md + content/settings.json
 * Uses:   templates/*.html  (base.html wraps others)
 * Deps:   gray-matter, marked
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ─── Lazy-load deps (nice error if npm install not run yet) ───────────────────
let matter, marked;
try {
  matter = require('gray-matter');
  marked = require('marked').marked;
} catch (e) {
  console.error('❌  Missing dependencies. Run: npm install');
  process.exit(1);
}

// ─── Config ───────────────────────────────────────────────────────────────────
const ROOT     = __dirname;
const CONTENT  = path.join(ROOT, 'content');
const TEMPLATES= path.join(ROOT, 'templates');
const DIST     = path.join(ROOT, 'dist');

// ─── i18n strings ─────────────────────────────────────────────────────────────
const I18N = {
  da: {
    nav_prefix:      '/',
    nav_om:          'Om os',
    nav_husstanden:  'Husstanden',
    nav_opstaldning: 'Opstaldning',
    nav_heste:       'Heste',
    nav_lagotto:     'Lagotto',
    nav_historien:   'Historien',
    nav_events:      'Events',
    nav_galleri:     'Galleri',
    nav_nyheder:     'Nyheder',
    nav_kontakt:     'Kontakt',
    footer_copy:     '© 2026 MuBell Farm / Sandholmgaard. Alle rettigheder forbeholdes.',
    lang_switch_text:  'EN',
    lang_switch_label: 'Switch to English',
    label_nyheder:   'Fra gården',
    title_nyheder:   'Nyheder',
    label_read_more: 'Læs mere →',
    label_back:      'Alle nyheder',
    og_locale:       'da_DK',
    lang_root:       '',        // Danish at root
    other_lang_root: 'en/',
  },
  en: {
    nav_prefix:      '/en/',
    nav_om:          'About us',
    nav_husstanden:  'The Family',
    nav_opstaldning: 'Boarding',
    nav_heste:       'Horses',
    nav_lagotto:     'Lagotto',
    nav_historien:   'History',
    nav_events:      'Events',
    nav_galleri:     'Gallery',
    nav_nyheder:     'News',
    nav_kontakt:     'Contact',
    footer_copy:     '© 2026 MuBell Farm / Sandholmgaard. All rights reserved.',
    lang_switch_text:  'DA',
    lang_switch_label: 'Skift til dansk',
    label_nyheder:   'From the farm',
    title_nyheder:   'News',
    label_read_more: 'Read more →',
    label_back:      'All news',
    og_locale:       'en_GB',
    lang_root:       'en/',     // English under /en/
    other_lang_root: '',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Minimal template engine: {{var}}, {{#if x}}...{{/if}}, {{#each arr}}...{{/each}} */
function renderTemplate(tmpl, vars) {
  // {{#each arr}}...{{/each}}
  tmpl = tmpl.replace(/\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, key, block) => {
    const arr = vars[key];
    if (!Array.isArray(arr)) return '';
    return arr.map(item => renderTemplate(block, { ...vars, ...item })).join('');
  });

  // {{#if x}}...{{/if}}  (also handles {{#if x}}...{{else}}...{{/if}} crudely)
  tmpl = tmpl.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, block) => {
    return vars[key] ? renderTemplate(block, vars) : '';
  });

  // {{variable}}
  tmpl = tmpl.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return vars[key] !== undefined ? vars[key] : '';
  });

  return tmpl;
}

function readTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATES, name), 'utf8');
}

function parseMarkdown(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data: frontmatter, content } = matter(raw);
  return { frontmatter, body: marked(content) };
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/** Copy a directory recursively (only if it exists) */
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

/** Format a date string nicely */
function formatDate(dateVal, lang) {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d)) return String(dateVal);
  return d.toLocaleDateString(lang === 'da' ? 'da-DK' : 'en-GB', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

/** Wrap page content in base.html */
function wrapBase(content, vars, lang) {
  const t      = I18N[lang];
  const root   = vars.root || (lang === 'da' ? '/' : '/en/');
  const rootFs = lang === 'da' ? '' : 'en/';

  // Build the lang switch URL: from current page to same page in other lang
  const currentSlug = vars.page_slug || 'index';
  const switchRoot  = lang === 'da' ? '/en/' : '/';
  const langSwitchUrl = `${switchRoot}${currentSlug === 'index' ? '' : currentSlug + '.html'}`;

  const finalTitle = vars.page_title || vars.title || 'MuBell Farm';
  // Build <title> tag: if title already contains "MuBell Farm", use as-is
  const titleTag = finalTitle.includes('MuBell Farm')
    ? finalTitle
    : `${finalTitle} | MuBell Farm - Sandholmgaard`;

  const base = readTemplate('base.html');
  return renderTemplate(base, {
    ...t,
    lang,
    root:             lang === 'da' ? '' : '../',
    rootFs:           rootFs,
    title_tag:        titleTag,
    page_title:       finalTitle,
    meta_description: vars.meta_description || t.nav_om,
    page_url:         vars.page_url || '/',
    og_image:         vars.og_image || '/images/hero.jpg',
    lang_switch_url:  langSwitchUrl,
    content,
    ...vars,
  });
}

/** Write a file to dist, creating dirs as needed */
function writeDist(relPath, html) {
  const full = path.join(DIST, relPath);
  ensureDir(path.dirname(full));
  fs.writeFileSync(full, html, 'utf8');
  console.log('  ✓', relPath);
}

// ─── Settings ─────────────────────────────────────────────────────────────────
function loadSettings() {
  const p = path.join(CONTENT, 'settings.json');
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

// ─── Pages ────────────────────────────────────────────────────────────────────
function buildPages(settings) {
  console.log('\n📄  Pages');
  const pagesDir = path.join(CONTENT, 'pages');
  if (!fs.existsSync(pagesDir)) return;

  for (const lang of ['da', 'en']) {
    const files = fs.readdirSync(pagesDir).filter(f => f.endsWith(`.${lang}.md`));

    for (const file of files) {
      const slug     = file.replace(`.${lang}.md`, '');
      const filePath = path.join(pagesDir, file);
      const { frontmatter, body } = parseMarkdown(filePath);
      const title = frontmatter.title || slug;

      let inner;
      if (slug === 'index') {
        const homeTmpl = readTemplate('home.html');
        const heroRoot = lang === 'da' ? '' : '../';
        const heroVars = lang === 'da' ? {
          root:           heroRoot,
          hero_alt:       'Luftfoto af Sandholmgaard, en firelænget stråtækt gård i Snekkersten',
          hero_svg_label: 'Sandholmgaard - MuBell Farm - Siden 1789',
          hero_arch_text: 'SANDHOLMGAARD',
          hero_since:     'SIDEN 1789',
          hero_tagline:   'Mennesker, planter og dyr f\u00e5r vores hjerter til at synge',
          hero_scroll:    'Udforsk',
          page_ext:       '.html',
        } : {
          root:           heroRoot,
          hero_alt:       'Aerial view of Sandholmgaard, a four-winged thatched farm in Snekkersten',
          hero_svg_label: 'Sandholmgaard - MuBell Farm - Since 1789',
          hero_arch_text: 'SANDHOLMGAARD',
          hero_since:     'SINCE 1789',
          hero_tagline:   'People, plants and animals make our hearts sing',
          hero_scroll:    'Explore',
          page_ext:       '.html',
        };
        inner = renderTemplate(homeTmpl, heroVars);
      } else {
        const pageTmpl = readTemplate('page.html');
        const heroRoot = lang === 'da' ? '' : '../';
        const rawHero = frontmatter.hero_image || '';
        // Support relative paths: prefix with root if not absolute
        const heroImg = rawHero && !rawHero.startsWith('/') && !rawHero.startsWith('http')
          ? heroRoot + rawHero
          : rawHero;
        inner = renderTemplate(pageTmpl, {
          page_id:        slug,
          title,
          subtitle:       frontmatter.subtitle || '',
          hero_image:     heroImg,
          hero_image_alt: frontmatter.hero_image_alt || title,
          body,
        });
      }

      // For the index/home page, use a concise site title
      const pageTitle = slug === 'index'
        ? 'MuBell Farm | Sandholmgaard'
        : (frontmatter.title || title);

      const html = wrapBase(inner, {
        page_title:       pageTitle,
        meta_description: frontmatter.meta_description || frontmatter.subtitle || title,
        page_url:         lang === 'da' ? `/${slug}.html` : `/en/${slug}.html`,
        page_slug:        slug,
        og_image:         frontmatter.hero_image || '/images/hero.jpg',
        ...frontmatter,
      }, lang);

      const outFile = slug === 'index'
        ? (lang === 'da' ? 'index.html' : 'en/index.html')
        : (lang === 'da' ? `${slug}.html` : `en/${slug}.html`);

      writeDist(outFile, html);
    }
  }
}

// ─── Horses ───────────────────────────────────────────────────────────────────
function buildHorses(settings) {
  console.log('\n🐴  Horses');
  const horsesDir = path.join(CONTENT, 'horses');
  if (!fs.existsSync(horsesDir)) return;

  const catLabels = {
    da: { hoppe: 'Hoppe', hingst: 'Hingst', shetlandspony: 'Shetlandspony', vallak: 'Vallak' },
    en: { hoppe: 'Mare',  hingst: 'Stallion', shetlandspony: 'Shetland Pony', vallak: 'Gelding' },
  };

  for (const lang of ['da', 'en']) {
    const files = fs.readdirSync(horsesDir).filter(f => f.endsWith(`.${lang}.md`));
    const horseTmpl = readTemplate('horse.html');

    for (const file of files) {
      const slug     = file.replace(`.${lang}.md`, '');
      const filePath = path.join(horsesDir, file);
      const { frontmatter, body } = parseMarkdown(filePath);

      const inner = renderTemplate(horseTmpl, {
        slug,
        name:          frontmatter.name  || slug,
        category_label:catLabels[lang][frontmatter.category] || frontmatter.category || '',
        breed:         frontmatter.breed || '',
        birth_year:    frontmatter.birth_year || '',
        photo:         frontmatter.photo || '',
        facebook_url:  frontmatter.facebook_url || '',
        body,
      });

      const html = wrapBase(inner, {
        page_title: frontmatter.name || slug,
        page_slug:  `heste/${slug}`,
        ...frontmatter,
      }, lang);

      const outFile = lang === 'da'
        ? `heste/${slug}.html`
        : `en/heste/${slug}.html`;

      writeDist(outFile, html);
    }
  }
}

// ─── News ─────────────────────────────────────────────────────────────────────
function buildNews(settings) {
  console.log('\n📰  News');
  const newsDir = path.join(CONTENT, 'news');
  if (!fs.existsSync(newsDir)) return;

  for (const lang of ['da', 'en']) {
    const files = fs.readdirSync(newsDir)
      .filter(f => f.endsWith(`.${lang}.md`))
      .sort()
      .reverse(); // newest first

    const t       = I18N[lang];
    const postTmpl= readTemplate('news-post.html');
    const postList = [];

    for (const file of files) {
      const slug     = file.replace(`.${lang}.md`, '');
      const filePath = path.join(newsDir, file);
      const { frontmatter, body } = parseMarkdown(filePath);

      const postUrl = lang === 'da' ? `/nyheder/${slug}.html` : `/en/nyheder/${slug}.html`;
      const dateIso = frontmatter.date ? new Date(frontmatter.date).toISOString().split('T')[0] : '';
      const dateFormatted = formatDate(frontmatter.date, lang);

      const inner = renderTemplate(postTmpl, {
        slug,
        title:          frontmatter.title || slug,
        date_iso:       dateIso,
        date_formatted: dateFormatted,
        featured_image: frontmatter.featured_image || '',
        body,
        root:           lang === 'da' ? '' : '../',
        label_back:     t.label_back,
      });

      const html = wrapBase(inner, {
        page_title: frontmatter.title || slug,
        page_slug:  `nyheder/${slug}`,
        og_image:   frontmatter.featured_image || '/images/hero.jpg',
        ...frontmatter,
      }, lang);

      const outFile = lang === 'da'
        ? `nyheder/${slug}.html`
        : `en/nyheder/${slug}.html`;

      writeDist(outFile, html);

      postList.push({
        url:            postUrl,
        title:          frontmatter.title || slug,
        date_iso:       dateIso,
        date_formatted: dateFormatted,
        featured_image: frontmatter.featured_image || '',
        excerpt:        frontmatter.excerpt || '',
      });
    }

    // News list page
    const listTmpl = readTemplate('news.html');
    const listInner = renderTemplate(listTmpl, {
      label_nyheder:  t.label_nyheder,
      title_nyheder:  t.title_nyheder,
      label_read_more: t.label_read_more,
      root:            lang === 'da' ? '' : '../',
      posts: postList,
    });

    const listHtml = wrapBase(listInner, {
      page_title:  t.title_nyheder,
      page_slug:   'nyheder',
    }, lang);

    const listOut = lang === 'da' ? 'nyheder.html' : 'en/nyheder.html';
    writeDist(listOut, listHtml);
  }
}

// ─── Index redirect for English ───────────────────────────────────────────────
function buildLangRoot() {
  // /en/ already written by buildPages as en/index.html
  // nothing extra needed
}

// ─── Copy static assets ───────────────────────────────────────────────────────
function copyAssets() {
  console.log('\n📦  Assets');
  const assets = ['images', 'css', 'js', 'static'];
  for (const dir of assets) {
    const src  = path.join(ROOT, dir);
    const dest = path.join(DIST, dir);
    if (fs.existsSync(src)) {
      copyDir(src, dest);
      console.log('  ✓', dir + '/');
    }
  }
  // Also copy admin/ into dist/admin/
  const adminSrc  = path.join(ROOT, 'admin');
  const adminDest = path.join(DIST, 'admin');
  if (fs.existsSync(adminSrc)) {
    copyDir(adminSrc, adminDest);
    // Decap CMS config.yml needs to be at /static/config.yml in dist
    // (already handled by copying static/ above)
    console.log('  ✓', 'admin/');
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function build() {
  console.log('🌾  MuBell Farm — building...\n');

  // Clean dist
  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true });
  }
  ensureDir(DIST);
  ensureDir(path.join(DIST, 'en'));

  const settings = loadSettings();

  buildPages(settings);
  buildHorses(settings);
  buildNews(settings);
  copyAssets();

  console.log('\n✅  Build complete → dist/\n');
}

build();
