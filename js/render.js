import { siteData } from "../data/site-data.js";

const projectUrl = (slug) => `project.html?slug=${encodeURIComponent(slug)}`;

const createElement = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text) {
    element.textContent = text;
  }
  return element;
};

const createImage = (image, eager = false) => {
  const img = document.createElement("img");
  img.src = image.src;
  img.alt = image.alt;
  img.width = image.width;
  img.height = image.height;
  img.loading = eager ? "eager" : "lazy";
  img.decoding = "async";
  img.sizes = "(max-width: 700px) 92vw, (max-width: 1100px) 70vw, 42vw";

  if (eager) {
    img.fetchPriority = "high";
  }

  if (image.position) {
    img.style.objectPosition = image.position;
  }

  return img;
};

const styleFromLayout = (layout = {}) => {
  const styles = [];

  if (layout.colStart) {
    styles.push(`--col-start:${layout.colStart}`);
  }
  if (layout.colSpan) {
    styles.push(`--col-span:${layout.colSpan}`);
  }
  if (layout.marginTop) {
    styles.push(`--offset-top:${layout.marginTop}`);
  }

  return styles.join(";");
};

const applyHomePreviewSize = (img, image) => {
  if (!image?.width || !image?.height) {
    return null;
  }

  const ratio = image.width / image.height;
  const targetArea = 165000;
  const desiredWidth = Math.sqrt(targetArea * ratio);
  const desiredHeight = Math.sqrt(targetArea / ratio);

  const longestSide = Math.max(desiredWidth, desiredHeight);
  const minLongest = 360;
  const maxLongest = 460;
  const clampedLongest = Math.max(minLongest, Math.min(maxLongest, longestSide));
  const scale = clampedLongest / longestSide;
  const finalWidth = Math.round(desiredWidth * scale);

  img.style.width = `min(100%, ${finalWidth}px)`;
  img.style.height = "auto";

  return finalWidth;
};

export const applyIdentity = () => {
  const { first, last, kicker } = siteData.identity;
  const firstLength = first.length;
  const lastLength = last.length;

  document.documentElement.style.setProperty("--first-name-length", firstLength);
  document.documentElement.style.setProperty("--last-name-length", lastLength);

  document.querySelectorAll("[data-name-first]").forEach((node) => {
    node.textContent = first;
  });

  document.querySelectorAll("[data-name-last]").forEach((node) => {
    node.textContent = last;
  });

  const kickerNode = document.querySelector("[data-identity-kicker]");
  if (kickerNode) {
    kickerNode.textContent = kicker;
  }
};

export const initMenu = () => {
  const button = document.querySelector("[data-menu-button]");
  const menu = document.querySelector("[data-menu]");
  const links = document.querySelectorAll("[data-nav-link]");

  if (!button || !menu) {
    return;
  }

  const syncMenuStyles = (open) => {
    const mobile = window.matchMedia("(max-width: 820px)").matches;

    if (!mobile) {
      menu.style.visibility = "";
      menu.style.opacity = "";
      menu.style.transform = "";
      menu.style.pointerEvents = "";
      return;
    }

    menu.style.visibility = open ? "visible" : "hidden";
    menu.style.opacity = open ? "1" : "0";
    menu.style.transform = open ? "translateY(0)" : "translateY(-0.4rem)";
    menu.style.pointerEvents = open ? "auto" : "none";
  };

  const setState = (open) => {
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    button.textContent = open ? "×" : "☰";
    menu.dataset.open = String(open);
    document.body.classList.toggle("menu-open", open);
    syncMenuStyles(open);
  };

  setState(false);

  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") !== "true";
    setState(open);
  });

  links.forEach((link) => {
    link.addEventListener("click", () => setState(false));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) {
      setState(false);
      return;
    }

    syncMenuStyles(button.getAttribute("aria-expanded") === "true");
  });
};

export const renderHomePage = () => {
  const descriptor = document.querySelector("[data-home-descriptor]");
  const intro = document.querySelector("[data-home-intro]");
  const annotations = document.querySelector("[data-home-annotations]");
  const aboutLede = document.querySelector("[data-about-lede]");
  const aboutBody = document.querySelector("[data-about-body]");
  const contactNote = document.querySelector("[data-contact-note]");
  const contactList = document.querySelector("[data-contact-list]");
  const projectIndex = document.querySelector("[data-project-index]");

  descriptor.textContent = siteData.identity.descriptor;
  intro.textContent = siteData.home.intro;
  aboutLede.textContent = siteData.about.lede;
  contactNote.textContent = siteData.contact.note;

  siteData.home.annotations.forEach((item) => {
    annotations.appendChild(createElement("p", "intro__annotation", item));
  });

  siteData.about.body.forEach((paragraph) => {
    aboutBody.appendChild(createElement("p", "", paragraph));
  });

  siteData.contact.items.forEach((item) => {
    const li = createElement("li", "contact__item");
    const label = createElement("span", "contact__label", item.label);
    const anchor = createElement("a", "contact__value", item.value);
    anchor.href = item.href;

    if (item.href.startsWith("https://")) {
      anchor.target = "_blank";
      anchor.rel = "noreferrer";
    }

    li.append(label, anchor);
    contactList.appendChild(li);
  });

  siteData.projects.forEach((project, index) => {
    const li = createElement(
      "li",
      `project-index__item project-index__item--${project.homeLayout.variant || "wide"}`
    );
    li.style.cssText = styleFromLayout(project.homeLayout);

    const article = createElement("article", "project-tease");
    const link = createElement("a", "project-tease__link");
    link.href = projectUrl(project.slug);
    link.setAttribute("aria-label", `${project.title}, ${project.year}`);

    const figure = createElement("figure", "project-tease__figure");
    const coverImage = createImage(project.cover, index === 0);
    const previewWidth = applyHomePreviewSize(coverImage, project.cover);
    if (previewWidth) {
      li.style.setProperty("--project-width", `${previewWidth}px`);
    }
    figure.appendChild(coverImage);

    const meta = createElement("div", "project-tease__meta");
    meta.append(
      createElement("span", "", `P-${project.number}`),
      createElement("span", "", project.year)
    );

    const title = createElement("h3", "project-tease__title", project.title);
    const body = createElement("p", "project-tease__text", project.shortDescription);

    link.append(figure, meta, title, body);
    article.appendChild(link);

    if (project.homeLayout.note) {
      const isLongLabel = project.number === "03" || project.number === "01";
      const noteClass = isLongLabel
        ? "project-tease__note project-tease__note--long"
        : "project-tease__note";
      const note = createElement("p", noteClass, project.homeLayout.note);

      if (isLongLabel) {
        note.style.whiteSpace = "nowrap";
        note.style.maxWidth = "none";
        note.style.width = "max-content";
      }

      article.appendChild(note);
    }

    li.appendChild(article);
    projectIndex.appendChild(li);
  });
};

export const getProject = (slug) =>
  siteData.projects.find((project) => project.slug === slug);

export const getNeighbors = (slug) => {
  const index = siteData.projects.findIndex((project) => project.slug === slug);

  if (index === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: siteData.projects[index + 1] || null,
    next: siteData.projects[index - 1] || null,
  };
};

const renderFact = (label, value) => {
  const fragment = document.createDocumentFragment();
  fragment.append(createElement("dt", "", label), createElement("dd", "", value));
  return fragment;
};

const renderGalleryItems = (items, label) => {
  const section = createElement("section", "project-extra__group");
  const header = createElement("div", "project-extra__header");
  header.append(
    createElement("p", "project-extra__number", label.number),
    createElement("h2", "project-extra__title", label.title)
  );

  const grid = createElement("div", "project-gallery project-gallery--nested");

  items.forEach((item) => {
    const figure = createElement(
      "figure",
      `gallery-item gallery-item--${item.layout?.variant || "wide"}`
    );
    figure.style.cssText = styleFromLayout(item.layout);
    figure.appendChild(createImage(item));

    if (item.caption) {
      figure.appendChild(createElement("figcaption", "gallery-item__caption", item.caption));
    }

    grid.appendChild(figure);
  });

  section.append(header, grid);
  return section;
};

export const renderProjectPage = (project) => {
  const hero = document.querySelector("[data-project-hero]");
  const gallery = document.querySelector("[data-project-gallery]");
  const extra = document.querySelector("[data-project-extra]");
  const pagination = document.querySelector("[data-project-pagination]");
  const missing = document.querySelector("[data-project-missing]");

  if (!project) {
    missing.hidden = false;
    return;
  }

  hero.hidden = false;
  gallery.hidden = false;
  pagination.hidden = false;

  document.title = `${project.title} — Lydia Ciesielski`;

  document.querySelector("[data-project-code]").textContent = `P-${project.number}`;
  document.querySelector("[data-project-category]").textContent = project.category;
  document.querySelector("[data-project-title]").textContent = project.title;
  document.querySelector("[data-project-year]").textContent = project.year;
  document.querySelector("[data-project-description]").textContent = project.description;

  const facts = document.querySelector("[data-project-facts]");
  facts.append(
    renderFact("Materials", project.materials),
    renderFact("Dimensions", project.dimensions)
  );

  const notes = document.querySelector("[data-project-notes]");
  project.notes.forEach((note) => {
    notes.appendChild(createElement("p", "project-notes__item", note));
  });

  project.gallery.forEach((item, index) => {
    const figure = createElement(
      "figure",
      `gallery-item gallery-item--${item.layout?.variant || "wide"}`
    );
    figure.style.cssText = styleFromLayout(item.layout);
    figure.appendChild(createImage(item, index === 0));

    if (item.caption) {
      figure.appendChild(createElement("figcaption", "gallery-item__caption", item.caption));
    }

    gallery.appendChild(figure);
  });

  const extraGroups = [];

  if (project.process?.length) {
    extraGroups.push(renderGalleryItems(project.process, { number: "A", title: "Process" }));
  }

  if (project.sketches?.length) {
    extraGroups.push(renderGalleryItems(project.sketches, { number: "B", title: "Sketches" }));
  }

  if (extraGroups.length) {
    extra.hidden = false;
    extraGroups.forEach((group) => extra.appendChild(group));
  }

  const { previous, next } = getNeighbors(project.slug);
  const prevNode = document.querySelector("[data-project-prev]");
  const nextNode = document.querySelector("[data-project-next]");

  if (previous) {
    prevNode.href = projectUrl(previous.slug);
    prevNode.innerHTML = `<span>Previous</span><strong>${previous.title}</strong>`;
  } else {
    prevNode.classList.add("is-hidden");
  }

  if (next) {
    nextNode.href = projectUrl(next.slug);
    nextNode.innerHTML = `<span>Next</span><strong>${next.title}</strong>`;
  } else {
    nextNode.classList.add("is-hidden");
  }
};
