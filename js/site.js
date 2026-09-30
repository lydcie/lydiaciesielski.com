import {
	applyIdentity,
	initCustomCursor,
	initHomeSignatureReveal,
	initMenu,
	renderHomePage,
} from "./render.js";

applyIdentity();
initMenu();
renderHomePage();
initHomeSignatureReveal();
initCustomCursor();
