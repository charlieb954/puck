const GRIND_ORDER = ['fine', 'medium', 'coarse'];

function icon(body) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

const ICONS = {
    info: icon('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'),
    close: icon('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
};

const TASTES = [
    { id: 'sour', label: 'Sour', hint: 'Bright / Citrusy', icon: icon('<circle cx="12" cy="12" r="4"/><path d="M12 3v1"/><path d="M12 20v1"/><path d="M3 12h1"/><path d="M20 12h1"/><path d="m18.364 5.636-.707.707"/><path d="m6.343 17.657-.707.707"/><path d="m5.636 5.636.707.707"/><path d="m17.657 17.657.707.707"/>') },
    { id: 'bitter', label: 'Bitter', hint: 'Dry / Astringent', icon: icon('<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>') },
    { id: 'weak', label: 'Weak', hint: 'Thin / Lacking body', icon: icon('<path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>') },
    { id: 'harsh', label: 'Harsh', hint: 'Overpowering', icon: icon('<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>') },
    { id: 'balanced', label: 'Balanced', hint: 'Sweet / Full body', icon: icon('<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>') },
];

const GRINDS = GRIND_ORDER.map((id) => ({
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1),
}));

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function toFixedVal(n, decimals = 1) {
    return +n.toFixed(decimals);
}

function grindIndex(size) {
    const i = GRIND_ORDER.indexOf(size);
    return i === -1 ? 1 : i;
}

function grindLabel(size) {
    return GRINDS.find((g) => g.id === size)?.label || 'Medium';
}

function nudgeGrind(size, direction) {
    const next = grindIndex(size) + direction;
    if (next < 0 || next >= GRIND_ORDER.length) return null;
    return GRIND_ORDER[next];
}

function formatRecipe(dose, yieldOut, time, grindSize) {
    return `${dose}g in \u2192 ${yieldOut}g out in ${time}s \u2022 ${grindLabel(grindSize)} grind`;
}

export function createEspresso() {
    return {
        minDose: 12,
        maxDose: 24,
        stepDose: 0.5,
        minYield: 20,
        maxYield: 60,
        stepYield: 1,
        minTime: 10,
        maxTime: 55,
        stepTime: 1,

        dose: 18,
        yieldOut: 36,
        time: 28,
        taste: null,
        grindSize: 'medium',
        showHelp: false,

        tastes: TASTES,
        grinds: GRINDS,
        icons: ICONS,

        init() {
            this.$watch('showHelp', (open) => {
                document.body.classList.toggle('help-open', Boolean(open));
            });
        },

        openHelp() {
            this.showHelp = true;
            this.$nextTick(() => this.$refs.closeBtn?.focus());
        },

        closeHelp() {
            if (!this.showHelp) return;
            this.showHelp = false;
            this.$nextTick(() => this.$refs.helpBtn?.focus());
        },

        selectTaste(id) {
            this.taste = id;
        },

        onTasteKey(event, index) {
            const move = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
            let next = index;
            if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = this.tastes.length - 1;
            else if (move[event.key] != null) {
                next = (index + move[event.key] + this.tastes.length) % this.tastes.length;
            } else {
                return;
            }
            event.preventDefault();
            this.taste = this.tastes[next].id;
            this.$nextTick(() => {
                this.$root.querySelector(`[data-taste="${this.taste}"]`)?.focus();
            });
        },

        get ratio() {
            return toFixedVal(this.yieldOut / this.dose, 2);
        },

        get ratioDisplay() {
            return `1:${this.ratio}`;
        },

        get flow() {
            return toFixedVal(this.yieldOut / this.time, 2);
        },

        get grindLabel() {
            return grindLabel(this.grindSize);
        },

        get recipeSummary() {
            return formatRecipe(this.dose, this.yieldOut, this.time, this.grindSize);
        },

        get tasteLabel() {
            return this.tastes.find((t) => t.id === this.taste)?.label || 'Not set';
        },

        suggestRatioFix() {
            const targetRatio = 2;
            const delta = this.yieldOut / this.dose - targetRatio;
            const tolerance = 0.2;
            if (Math.abs(delta) <= tolerance) return null;

            const suggestedYield = Math.round(clamp(this.dose * targetRatio, this.minYield, this.maxYield));
            const suggestedDose = toFixedVal(clamp(this.yieldOut / targetRatio, this.minDose, this.maxDose), 1);

            if (delta < 0) {
                return {
                    message: `Your ratio is a little low. Increase the yield to ${suggestedYield}g or reduce the dose to ${suggestedDose}g.`,
                    targetYield: suggestedYield,
                };
            }
            return {
                message: `Your ratio is a little high. Pull a little shorter to ${suggestedYield}g or increase the dose to ${suggestedDose}g.`,
                targetYield: suggestedYield,
            };
        },

        computeRecommendation() {
            const current = {
                targetDose: this.dose,
                targetYield: this.yieldOut,
                targetTime: this.time,
                targetGrind: this.grindSize,
            };

            const pack = (primary, reason, extra = {}) => {
                const target = { ...current, ...extra };
                const changed =
                    target.targetDose !== this.dose ||
                    target.targetYield !== this.yieldOut ||
                    target.targetTime !== this.time ||
                    target.targetGrind !== this.grindSize;
                const hasSuggestion = extra.hasSuggestion === false ? false : changed;
                return {
                    primary,
                    reason,
                    hasSuggestion,
                    targetDisplay: formatRecipe(
                        target.targetDose,
                        target.targetYield,
                        target.targetTime,
                        target.targetGrind
                    ),
                    targetDose: target.targetDose,
                    targetYield: target.targetYield,
                    targetTime: target.targetTime,
                    targetGrind: target.targetGrind,
                };
            };

            const advise = (primary, reason, extra = {}) => {
                const result = pack(primary, reason, extra);
                if (!result.hasSuggestion && extra.hasSuggestion !== false) {
                    return pack(
                        'At the edge of the range',
                        'This recipe is already at the limit for that adjustment. Change grind on the next shot, or mark it Balanced if the cup is close enough.',
                        { hasSuggestion: false }
                    );
                }
                return result;
            };

            if (!this.taste) {
                return pack(
                    'Waiting on taste',
                    'Set the recipe you pulled, then choose the taste that matches the cup.',
                    { hasSuggestion: false }
                );
            }

            if (this.taste === 'balanced') {
                return pack(
                    'Balanced',
                    'This shot is dialed in. Keep the recipe, grind, and timing as-is.',
                    { hasSuggestion: false }
                );
            }

            if (this.yieldOut <= this.dose) {
                return advise(
                    'Check the yield',
                    'The yield is too low for a standard espresso. Aim closer to a 1:2 ratio.',
                    { targetYield: Math.round(clamp(this.dose * 2, this.minYield, this.maxYield)) }
                );
            }

            const ratioFix = this.suggestRatioFix();
            if (ratioFix) {
                return advise('Fix the ratio', ratioFix.message, { targetYield: ratioFix.targetYield });
            }

            if (this.taste === 'sour') {
                const finer = nudgeGrind(this.grindSize, -1);
                if (finer) {
                    return advise(
                        'Grind finer',
                        'The shot tastes bright and under-extracted. A finer grind will slow the flow and even out the extraction.',
                        { targetGrind: finer }
                    );
                }
                if (this.time < 28) {
                    return advise(
                        'Pull a little longer',
                        'You are already on a fine grind. Give the shot a couple more seconds to develop sweetness.',
                        { targetTime: Math.min(this.maxTime, this.time + 3) }
                    );
                }
                return advise(
                    'Add a little more yield',
                    'The cup is still a bit sharp. A slightly longer yield will pull more sweetness into the shot.',
                    { targetYield: Math.min(this.maxYield, this.yieldOut + 4) }
                );
            }

            if (this.taste === 'bitter') {
                const coarser = nudgeGrind(this.grindSize, 1);
                if (coarser) {
                    return advise(
                        'Grind coarser',
                        'The shot is over-extracted. A coarser grind will speed the flow and tame bitterness.',
                        { targetGrind: coarser }
                    );
                }
                if (this.time > 28) {
                    return advise(
                        'Stop a little earlier',
                        'You are already on a coarse grind. Cut the shot a couple of seconds sooner to keep sweetness.',
                        { targetTime: Math.max(this.minTime, this.time - 3) }
                    );
                }
                return advise(
                    'Shorten the pull',
                    'The brew is drifting toward bitterness. Pull a touch less yield to keep structure.',
                    { targetYield: Math.max(this.minYield, this.yieldOut - 4) }
                );
            }

            if (this.taste === 'weak') {
                if (this.dose < this.maxDose) {
                    const targetDose = toFixedVal(Math.min(this.maxDose, this.dose + 1), 1);
                    const ratio = this.yieldOut / this.dose;
                    const targetYield = Math.round(clamp(targetDose * ratio, this.minYield, this.maxYield));
                    return advise(
                        'Increase dose',
                        'The shot is thin and underpowered. Add a little more coffee and keep the same ratio.',
                        { targetDose, targetYield }
                    );
                }
                return advise(
                    'Pull a shorter shot',
                    'Dose is already at the top of the range. Reduce the yield to concentrate the cup.',
                    { targetYield: Math.max(this.minYield, this.yieldOut - 4) }
                );
            }

            if (this.taste === 'harsh') {
                if (this.dose > this.minDose) {
                    const targetDose = toFixedVal(Math.max(this.minDose, this.dose - 1), 1);
                    const ratio = this.yieldOut / this.dose;
                    const targetYield = Math.round(clamp(targetDose * ratio, this.minYield, this.maxYield));
                    return advise(
                        'Make it milder',
                        'The shot feels too intense. Drop the dose slightly and keep the same ratio.',
                        { targetDose, targetYield }
                    );
                }
                return advise(
                    'Add a little more yield',
                    'Dose is already at the bottom of the range. A longer yield will soften the cup.',
                    { targetYield: Math.min(this.maxYield, this.yieldOut + 4) }
                );
            }

            return pack('Balanced', 'Keep this recipe and grind size.', { hasSuggestion: false });
        },

        get recommendation() {
            return this.computeRecommendation();
        },

        applySuggestion() {
            const rec = this.recommendation;
            if (!rec?.hasSuggestion) return;
            this.dose = rec.targetDose;
            this.yieldOut = rec.targetYield;
            this.time = rec.targetTime;
            this.grindSize = rec.targetGrind;
        },
    };
}
