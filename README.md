# Puck: The Espresso Dial-In Engine ☕️

A playful, practical, and developer-friendly tool for dialing in the perfect
shot of espresso. 

Whether you chase bright citrus notes or crave syrupy sweetness, this
lightweight client-side app helps you iterate fast. Tweak your dose, yield, and
time, select your taste profile, and let Puck's decision engine give you
recommendations to rescue your extraction.

## Why You'll Love It

*   **For Coffee Lovers:** Stop guessing. Puck gives you fast, prioritized
    advice based on taste profiles (Sour, Bitter, Weak, Harsh). Fix your ratio
    first, then tweak your grind and time.
*   **Actionable Advice:** One-click "Apply suggestion" instantly updates your
    target recipe based on real barista logic.
*   **For Developers:** Built with modular ES modules, Alpine.js reactivity, and
    Tailwind CSS. It is deliberately minimal and blazing fast.
*   **Zero-Config Deployment:** Includes a GitHub Actions workflow
    (`deploy.yml`) to bundle and auto-deploy static assets right to GitHub Pages
    without exposing your config files.

## The Stack & Setup

Puck requires no heavy toolchains or build steps to run locally. Just serve the
directory and start tinkering:

```bash
cd path/to/coffee
# Serve locally using Python's built-in server
python3 -m http.server 8000
# Open http://localhost:8000 in your browser
```

*   **UI & State:** `index.html` leverages Alpine.js for lightweight state
    management and Tailwind for styling.
*   **Logic:** `js/engine.js` handles the decision tree (taste vs. flow rate)
    and `js/bootstrap.js` exposes it to the DOM.
*   **Accessibility:** Fully keyboard-navigable with ARIA labels and focus
    trapping for the help modal.

## Contributing & Ideas

Have a feature idea or a wild roast to test? Open an issue or a PR—let's brew
some good code.
