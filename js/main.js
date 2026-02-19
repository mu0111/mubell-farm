/* ============================================================
   MuBell Farm - main.js
   Language toggle, gallery lightbox, smooth scroll, mobile nav
   ============================================================ */

(function () {
  'use strict';

  // --- Mobile Navigation ---
  var hamburger = document.querySelector('.nav__hamburger');
  var mobileMenu = document.querySelector('.nav__mobile');
  var mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

  function toggleMobileMenu(e) {
    if (e) e.stopPropagation();
    if (!mobileMenu || !hamburger) return;
    var isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('active');
    document.body.classList.toggle('menu-open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  }

  function closeMobileMenu() {
    if (!mobileMenu || !hamburger) return;
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('active');
    document.body.classList.remove('menu-open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  if (hamburger) {
    hamburger.addEventListener('click', toggleMobileMenu);
  }

  // Use Array.prototype.forEach for NodeList compatibility
  Array.prototype.forEach.call(mobileLinks, function (link) {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close mobile menu on outside click
  document.addEventListener('click', function (e) {
    if (!mobileMenu || !mobileMenu.classList.contains('open')) return;
    if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
      closeMobileMenu();
    }
  });

  // --- Navbar Scroll Effect ---
  const nav = document.querySelector('.nav');
  var lastScroll = 0;

  window.addEventListener('scroll', function () {
    var scrollY = window.scrollY || window.pageYOffset;
    if (scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }, { passive: true });

  // --- Smooth Scroll ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 70;
        var y = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  // --- Active Nav Link on Scroll ---
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav__links a');

  function updateActiveLink() {
    var scrollY = window.scrollY || window.pageYOffset;
    var navHeight = 80;

    sections.forEach(function (section) {
      var top = section.offsetTop - navHeight - 100;
      var bottom = top + section.offsetHeight;
      var id = section.getAttribute('id');

      if (scrollY >= top && scrollY < bottom) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });

  // --- Gallery Lightbox ---
  var lightbox = document.querySelector('.lightbox');
  var lightboxImg = document.querySelector('.lightbox__img');
  var lightboxClose = document.querySelector('.lightbox__close');
  var lightboxPrev = document.querySelector('.lightbox__nav--prev');
  var lightboxNext = document.querySelector('.lightbox__nav--next');
  var galleryItems = document.querySelectorAll('.gallery__item');
  var currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    var img = galleryItems[index].querySelector('img');
    lightboxImg.src = img.dataset.src || img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function navigateLightbox(direction) {
    currentIndex = (currentIndex + direction + galleryItems.length) % galleryItems.length;
    var img = galleryItems[currentIndex].querySelector('img');
    lightboxImg.src = img.dataset.src || img.src;
    lightboxImg.alt = img.alt;
  }

  galleryItems.forEach(function (item, index) {
    item.addEventListener('click', function () {
      openLightbox(index);
    });

    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', function () {
      navigateLightbox(-1);
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener('click', function () {
      navigateLightbox(1);
    });
  }

  // Lightbox keyboard navigation
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });

  // Close lightbox on backdrop click
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  // --- Language Toggle ---
  var currentLang = 'da';
  var langBtn = document.querySelector('.nav__lang');

  // Translation data
  var translations = {
    // Navigation
    'nav-om': { da: 'Om os', en: 'About' },
    'nav-husstanden': { da: 'Husstanden', en: 'Household' },
    'nav-opstaldning': { da: 'Opstaldning', en: 'Stabling' },
    'nav-lagotto': { da: 'Lagotto', en: 'Lagotto' },
    'nav-historie': { da: 'Historien', en: 'History' },
    'nav-galleri': { da: 'Galleri', en: 'Gallery' },
    'nav-events': { da: 'Events', en: 'Events' },
    'nav-heste': { da: 'Heste', en: 'Horses' },
    'nav-kontakt': { da: 'Kontakt', en: 'Contact' },

    // Hero
    'hero-crest': { da: 'SANDHOLMGAARD \u00B7 SIDEN 1789', en: 'SANDHOLMGAARD \u00B7 SINCE 1789' },
    'hero-title': { da: 'MuBell Farm', en: 'MuBell Farm' },
    'hero-tagline': {
      da: 'Mennesker, planter og dyr f\u00E5r vores hjerter til at synge',
      en: 'People, plants and animals make our hearts sing'
    },
    'hero-scroll': { da: 'Udforsk', en: 'Explore' },

    // Om Os
    'om-label': { da: 'Velkommen', en: 'Welcome' },
    'om-title': { da: 'Om os', en: 'About Us' },
    'om-text-1': {
      da: 'MuBell Farm er en bondeg\u00E5rd med et levende bof\u00E6llesskab p\u00E5 Sandholmgaard i Snekkersten. Her lever vi t\u00E6t p\u00E5 naturen med islandske heste, Lagotto Romagnolo hunde, katte, h\u00F8ns, frugttr\u00E6er og blomster.',
      en: 'MuBell Farm is a working farm with a vibrant community at Sandholmgaard in Snekkersten. Here we live close to nature with Icelandic horses, Lagotto Romagnolo dogs, cats, chickens, fruit trees and flowers.'
    },
    'om-text-2': {
      da: 'Vi er stadig i den sp\u00E6de start, men visionen er klar: et sted hvor mennesker, dyr og natur trives sammen. Vi har plantet frugttr\u00E6er, dyrker blomster, og dr\u00F8mmer om selvpluk og g\u00E5rdsalg. Vores g\u00E6ster er mest lokale familier og hesteinteresserede opstaldere.',
      en: 'We are still in the early days, but the vision is clear: a place where people, animals and nature thrive together. We have planted fruit trees, grow flowers, and dream of pick-your-own and farm sales. Our visitors are mostly local families and horse boarding clients.'
    },
    'om-text-3': {
      da: 'Det handler ikke om h\u00F8j produktion. Det handler om at have benene i jorden.',
      en: 'It is not about high production. It is about being grounded.'
    },

    // Husstanden
    'hus-label': { da: 'Familieliv', en: 'Family Life' },
    'hus-title': { da: 'Husstanden', en: 'The Household' },
    'hus-intro': {
      da: 'Sandholmgaard summer af liv. B\u00F8rn leger i g\u00E5rden, heste gr\u00E6sser p\u00E5 marken, killinger sover i h\u00F8et, og h\u00F8nsene g\u00E5r frit. Her er der altid noget der r\u00F8rer sig.',
      en: 'Sandholmgaard buzzes with life. Children play in the yard, horses graze in the fields, kittens sleep in the hay, and chickens roam free. There is always something happening here.'
    },
    'hus-cap-1': { da: 'B\u00F8rnene i haven', en: 'Children in the garden' },
    'hus-cap-2': { da: 'Familien samlet', en: 'Family together' },
    'hus-cap-3': { da: 'Hverdagsliv p\u00E5 g\u00E5rden', en: 'Everyday farm life' },

    // Opstaldning
    'ops-label': { da: 'Islandske Heste', en: 'Icelandic Horses' },
    'ops-title': { da: 'Opstaldning', en: 'Horse Boarding' },
    'ops-subtitle': {
      da: 'Professionel opstaldning for islandske heste i natursk\u00F8nne omgivelser',
      en: 'Professional boarding for Icelandic horses in beautiful natural surroundings'
    },
    'ops-text-1': {
      da: 'Vi tilbyder opstaldning for islandske heste med fokus p\u00E5 dyrevelf\u00E6rd og naturlige forhold. Hestene har adgang til store foldarealer, l\u00E6skure og en runddel. Skoven ligger t\u00E6t p\u00E5, og vandet er ikke langt v\u00E6k.',
      en: 'We offer boarding for Icelandic horses with a focus on animal welfare and natural conditions. The horses have access to large paddock areas, shelters and a round pen. The forest is nearby, and the sea is not far away.'
    },
    'ops-text-2': {
      da: 'Bellis tilbyder undervisning og tr\u00E6ning for b\u00E5de ryttere og heste. Vi arbejder mod at f\u00E5 en ridebane snart, s\u00E5 faciliteterne bliver endnu bedre.',
      en: 'Bellis offers lessons and training for both riders and horses. We are working towards getting a riding arena soon, so the facilities will become even better.'
    },
    'ops-features-title': { da: 'Faciliteter', en: 'Facilities' },
    'ops-f1': { da: 'Store foldarealer med naturligt gr\u00E6s', en: 'Large paddock areas with natural grass' },
    'ops-f2': { da: 'L\u00E6skure og staldfaciliteter', en: 'Shelters and stable facilities' },
    'ops-f3': { da: 'Runddel til tr\u00E6ning', en: 'Round pen for training' },
    'ops-f4': { da: 'Ridebane (kommer snart)', en: 'Riding arena (coming soon)' },
    'ops-f5': { da: 'Skov og strand i n\u00E6rheden', en: 'Forest and beach nearby' },
    'ops-f6': { da: 'Undervisning og tr\u00E6ning', en: 'Lessons and training' },
    'ops-price': {
      da: 'Kontakt os for priser og ledige pladser. Vi tager gerne en snak om jeres behov.',
      en: 'Contact us for prices and availability. We are happy to discuss your needs.'
    },

    // Lagotto
    'lag-label': { da: 'Vores Hunde', en: 'Our Dogs' },
    'lag-title': { da: 'Lagotto Romagnolo', en: 'Lagotto Romagnolo' },
    'lag-text-1': {
      da: 'Lagotto Romagnolo er en fantastisk race, kendt for deres venlige temperament, allergivenlige pels og naturlige evne til at s\u00F8ge tr\u00F8fler. P\u00E5 MuBell Farm opdr\u00E6tter vi Lagotto med fokus p\u00E5 sundhed, karakter og familievenlighed.',
      en: 'The Lagotto Romagnolo is a wonderful breed, known for their friendly temperament, hypoallergenic coat and natural truffle-hunting ability. At MuBell Farm we breed Lagotto with a focus on health, character and family-friendliness.'
    },
    'lag-text-2': {
      da: 'Vores hunde vokser op midt i g\u00E5rdlivet, omgivet af b\u00F8rn, heste og natur. Det giver rolige, velafbalancerede hvalpe der er trygge i alle situationer.',
      en: 'Our dogs grow up in the heart of farm life, surrounded by children, horses and nature. This produces calm, well-balanced puppies who feel secure in any situation.'
    },
    'lag-text-3': {
      da: 'Vi har l\u00F8bende kuld og tager gerne en samtale med potentielle hvalpek\u00F8bere. Kontakt os for at h\u00F8re mere.',
      en: 'We have regular litters and are happy to talk with prospective puppy buyers. Contact us to learn more.'
    },

    // Heste (Horses)
    'hst-label': { da: 'Vores Heste', en: 'Our Horses' },
    'hst-title': { da: 'Heste', en: 'Horses' },
    'hst-text-1': {
      da: 'Islandske heste og shetlandsponyer er en naturlig del af livet p\u00E5 Sandholmgaard. De gr\u00E6sser p\u00E5 markerne, fylder g\u00E5rden med energi og bringer ro til hverdagen.',
      en: 'Icelandic horses and Shetland ponies are a natural part of life at Sandholmgaard. They graze the fields, fill the farm with energy and bring calm to everyday life.'
    },
    'hst-text-2': {
      da: 'Vi avler islandske heste og shetlandsponyer i det smukke landskab omkring Sandholmgaard. Vores heste vokser op i naturlige omgivelser med store foldarealer, skov og frisk luft. Det giver robuste, velafbalancerede heste med et godt temperament.',
      en: 'We breed Icelandic horses and Shetland ponies in the beautiful landscape around Sandholmgaard. Our horses grow up in natural surroundings with large paddock areas, forest and fresh air. This produces sturdy, well-balanced horses with good temperaments.'
    },
    'hst-text-3': {
      da: 'De islandske heste er kendt for deres fem gangarter og deres rolige, nysgerrige natur. Shetlandsponyerne er b\u00F8rnenes favoritter - sm\u00E5, modige og fulde af personlighed. Sammen giver de g\u00E5rden dens s\u00E6rlige karakter.',
      en: 'The Icelandic horses are known for their five gaits and their calm, curious nature. The Shetland ponies are the children\'s favourites - small, brave and full of personality. Together, they give the farm its special character.'
    },
    'hst-text-4': {
      da: 'Hestene er en del af vores hverdag. De l\u00E6rer os t\u00E5lmodighed, n\u00E6rv\u00E6r og respekt for naturen.',
      en: 'The horses are part of our daily life. They teach us patience, presence and respect for nature.'
    },

    // Historie
    'his-label': { da: 'Siden 1789', en: 'Since 1789' },
    'his-title': { da: 'Historien', en: 'The History' },
    'his-text-1': {
      da: 'Sandholmgaard er en firel\u00E6nget, stråtækt g\u00E5rd fra 1789. Den b\u00E6rer matrikelnummer 1 i R\u00F8rtang, det vil sige landsbyens bedste ejendom siden udskiftningen.',
      en: 'Sandholmgaard is a four-winged, thatched farm from 1789. It carries cadastral number 1 in R\u00F8rtang, meaning the village\'s premier property since the land reforms.'
    },
    'his-text-2': {
      da: 'G\u00E5rden er den mest originale af R\u00F8rtangs fire g\u00E5rde og har bevaret sin historiske karakter gennem \u00E5rhundreder. De stråtækte tage, brostensg\u00E5rden og de gule mure fort\u00E6ller om en tid, hvor landbruget var centrum for alt liv.',
      en: 'The farm is the most original of R\u00F8rtang\'s four farms and has preserved its historic character through centuries. The thatched roofs, cobblestone courtyard and yellow walls tell of a time when farming was the centre of all life.'
    },
    'his-quote': {
      da: 'Landsbyens bedste ejendom siden 1789',
      en: 'The village\'s finest property since 1789'
    },
    'his-text-3': {
      da: 'I dag genf\u00F8des Sandholmgaard som MuBell Farm. Vi \u00E6rer den lange historie, mens vi skaber noget nyt: et sted for f\u00E6llesskab, dyr og natur. Bygningerne istandættes med respekt for den originale arkitektur, og g\u00E5rdens sjæl lever videre.',
      en: 'Today Sandholmgaard is reborn as MuBell Farm. We honour the long history while creating something new: a place for community, animals and nature. The buildings are being restored with respect for the original architecture, and the farm\'s soul lives on.'
    },

    // Events
    'evt-label': { da: 'Fremtiden', en: 'The Future' },
    'evt-title': { da: 'Events & Rum', en: 'Events & Spaces' },
    'evt-text': {
      da: 'Vi dr\u00F8mmer om at \u00E5bne Sandholmgaards l\u00E6nger for g\u00E6ster. Vi vil istandætte en l\u00E6nge til eventspace med plads til yoga, breathwork, konfirmationer og bryllupper. Et rum med sjæl, stråtag og udsigt til marker og heste.',
      en: 'We dream of opening Sandholmgaard\'s wings for guests. We plan to restore a wing into an event space with room for yoga, breathwork, confirmations and weddings. A space with soul, thatched roof and views of fields and horses.'
    },
    'evt-badge': { da: 'Kommer snart', en: 'Coming Soon' },
    'evt-yoga': { da: 'Yoga & Breathwork', en: 'Yoga & Breathwork' },
    'evt-yoga-desc': { da: 'Ro og fordybelse i historiske rammer', en: 'Peace and immersion in historic surroundings' },
    'evt-fest': { da: 'Fester & Fejringer', en: 'Celebrations' },
    'evt-fest-desc': { da: 'Konfirmationer, bryllupper og private fester', en: 'Confirmations, weddings and private parties' },
    'evt-retreat': { da: 'Retreats', en: 'Retreats' },
    'evt-retreat-desc': { da: 'Naturn\u00E6re ophold med plads til eftertanke', en: 'Nature-close stays with space for reflection' },

    // STU
    'stu-label': { da: 'P\u00E6dagogik', en: 'Education' },
    'stu-title': { da: 'STU', en: 'STU' },
    'stu-subtitle': {
      da: 'S\u00E6rligt Tilrettelagt Ungdomsuddannelse',
      en: 'Specially Designed Youth Education'
    },
    'stu-text-1': {
      da: 'Vi udvikler en g\u00E5rdbaseret STU for unge kvinder (16-25 \u00E5r) med stress, angst eller skoleudfordringer. Gennem arbejdet med heste, hunde, blomster og natur skaber vi et p\u00E6dagogisk rum, hvor de unge kan vokse i deres eget tempo.',
      en: 'We are developing a farm-based STU for young women (16-25 years) dealing with stress, anxiety or school challenges. Through working with horses, dogs, flowers and nature, we create a pedagogical space where young people can grow at their own pace.'
    },
    'stu-text-2': {
      da: 'Eleverne l\u00E6rer hestehold, management og praktisk g\u00E5rdarbejde. Det p\u00E6dagogiske arbejde er vigtigt for os. Vi tror p\u00E5 at have benene i jorden.',
      en: 'Students learn horse care, management and practical farm work. The pedagogical work is important to us. We believe in being grounded.'
    },
    'stu-teaser': { da: 'Kommer snart...', en: 'Coming soon...' },
    'stu-contact': {
      da: 'Interesseret? Kontakt os for mere information.',
      en: 'Interested? Contact us for more information.'
    },

    // Gallery
    'gal-label': { da: 'Billeder', en: 'Photos' },
    'gal-title': { da: 'Galleri', en: 'Gallery' },
    'gal-subtitle': {
      da: 'Glimt fra hverdagen p\u00E5 Sandholmgaard',
      en: 'Glimpses of everyday life at Sandholmgaard'
    },

    // Contact
    'kon-label': { da: 'Skriv til os', en: 'Get in Touch' },
    'kon-title': { da: 'Kontakt', en: 'Contact' },
    'kon-info-title': { da: 'Find os', en: 'Find Us' },
    'kon-form-name': { da: 'Navn', en: 'Name' },
    'kon-form-email': { da: 'E-mail', en: 'Email' },
    'kon-form-msg': { da: 'Besked', en: 'Message' },
    'kon-form-send': { da: 'Send besked', en: 'Send message' },
    'kon-form-name-ph': { da: 'Dit navn', en: 'Your name' },
    'kon-form-email-ph': { da: 'Din e-mail', en: 'Your email' },
    'kon-form-msg-ph': { da: 'Skriv din besked her...', en: 'Write your message here...' },

    // Footer
    'footer-copy': {
      da: '\u00A9 2026 MuBell Farm / Sandholmgaard. Alle rettigheder forbeholdes.',
      en: '\u00A9 2026 MuBell Farm / Sandholmgaard. All rights reserved.'
    }
  };

  function setLanguage(lang) {
    currentLang = lang;
    langBtn.textContent = lang === 'da' ? 'EN' : 'DA';

    // Update all translatable elements
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (translations[key] && translations[key][lang]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          // For placeholder
          if (el.getAttribute('data-i18n-attr') === 'placeholder') {
            el.placeholder = translations[key][lang];
          }
        } else {
          el.textContent = translations[key][lang];
        }
      }
    });

    // Update html lang
    document.documentElement.lang = lang;
  }

  if (langBtn) {
    langBtn.addEventListener('click', function () {
      setLanguage(currentLang === 'da' ? 'en' : 'da');
    });
  }

  // --- Scroll Reveal ---
  var revealElements = document.querySelectorAll('.reveal');

  function checkReveal() {
    var windowHeight = window.innerHeight;
    revealElements.forEach(function (el) {
      var top = el.getBoundingClientRect().top;
      if (top < windowHeight - 80) {
        el.classList.add('visible');
      }
    });
  }

  window.addEventListener('scroll', checkReveal, { passive: true });
  window.addEventListener('load', checkReveal);

  // --- Lazy Load Images ---
  if ('IntersectionObserver' in window) {
    var imgObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imgObserver.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });

    document.querySelectorAll('img[data-src]').forEach(function (img) {
      imgObserver.observe(img);
    });
  } else {
    // Fallback: load all images immediately
    document.querySelectorAll('img[data-src]').forEach(function (img) {
      img.src = img.dataset.src;
    });
  }

})();
