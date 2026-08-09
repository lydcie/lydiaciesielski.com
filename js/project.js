import { applyIdentity, getProject, initMenu, renderProjectPage } from "./render.js";

const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

applyIdentity();
initMenu();
renderProjectPage(getProject(slug));
