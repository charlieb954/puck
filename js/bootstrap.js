import { createEspresso } from './engine.js';

// expose factory for Alpine x-data
window.espresso = createEspresso;

// warm up icons when DOM is ready
document.addEventListener('DOMContentLoaded', () => { if (window.lucide) window.lucide.createIcons(); });
