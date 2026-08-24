# Espresso Dial-In Engine ☕️⚙️

A playful, practical, and developer-friendly espresso dial-in tool.

Whether you chase bright citrus notes or syrupy sweetness, this tiny client-side app helps you iterate fast: tweak `dose`, `yield`, and `time`, and get prioritized recommendations from the decision engine.

Why you'll enjoy it
- For coffee people: fast feedback and clear, prioritized advice (fix ratio first, then taste/time).
- For tinkerers: modular ES modules, Alpine.js reactivity, minimal CSS, and a GitHub Actions workflow to auto-deploy to GitHub Pages.

Quick start

```bash
cd path/to/coffee
# serve locally (simple, no toolchain required)
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Features (high level)
- Dose / Yield / Time controls with presets and step buttons.
- Decision engine: suggests actionable recipe changes (dose/yield/time), with one-click Apply + Undo.
- Accessibility: ARIA labels, focus trapping for modal help, and keyboard-friendly controls.
- Deployment: GitHub Actions workflow included for automatic Pages deployment.

Examples
- Dial 1:2 Classic: choose the `Classic 1:2 Medium Roast` preset (18g → 36g). Pull a shot; if your ratio is off the engine suggests a fix — click `Apply suggestion` to update the recipe.

Developer notes
- Files:
	- `index.html` — UI and Alpine bindings.
	- `js/engine.js` — the decision engine logic.
	- `js/bootstrap.js` — exposes `createEspresso()` to the global scope for Alpine.
	- `css/app.css` — micro-interaction styles and layout tweaks.
- Deploy: see `.github/workflows/deploy.yml` — pushes site files (`index.html`, `css/`, `js/`) to GitHub Pages on `main`.

Extending the project (ideas)
- Continuous sampling mode (record every N seconds during a pull).
- Mini session history with thumbnails + export (CSV/JSON) for deeper analysis.

Contributing
- PRs welcome. Keep changes focused — the app is intentionally tiny and dependency-free. If you add a build step, update the GH Actions workflow to deploy the build output (recommended `dist/`).

License
- MIT — brew responsibly and have fun tinkering.

Have a feature idea or a wild roast to test? Open an issue or a PR — I love both espresso and good code.
