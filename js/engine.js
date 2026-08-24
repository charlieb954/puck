export function createEspresso() {
    const state = {
        minDose: 12, maxDose: 24, stepDose: 0.5,
        minYield: 20, maxYield: 60, stepYield: 1,
        minTime: 10, maxTime: 55, stepTime: 1,
        dose: 18.0, yieldOut: 36, time: 28, taste: 'balanced', grindSize: 'medium',
        showHelp: false,
    };

    // helpers
    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
    function toFixedVal(n, decimals = 1) { return +(n.toFixed(decimals)); }

    return {
        ...state,
        init() { },

        inc(k, amt) {
            if (k === 'dose') { this.dose = toFixedVal(clamp(this.dose + amt, this.minDose, this.maxDose), 1); }
            else if (k === 'yield') { this.yieldOut = Math.round(clamp(this.yieldOut + amt, this.minYield, this.maxYield)); }
            else if (k === 'time') { this.time = Math.round(clamp(this.time + amt, this.minTime, this.maxTime)); }
            // don't auto-record on simple adjustments to avoid noisy samples
        },

        ratio() { return +(this.yieldOut / this.dose).toFixed(2); },
        get ratioDisplay() { return `1:${this.ratio()}`; },
        get flow() { return +(this.yieldOut / this.time).toFixed(2); },
        get grindLabel() {
            const map = { fine: 'Fine', medium: 'Medium', coarse: 'Coarse' };
            return map[this.grindSize] || 'Medium';
        },
        get recipeSummary() {
            return `${this.dose}g in → ${this.yieldOut}g out in ${this.time}s • ${this.grindLabel} grind`;
        },

        suggestRatioFix() {
            const targetRatio = 2.0;
            const curr = this.yieldOut / this.dose;
            const delta = curr - targetRatio;
            const tolerance = 0.2;
            if (Math.abs(delta) <= tolerance) return null;
            const suggestedYield = Math.round(this.dose * targetRatio);
            const suggestedDose = Math.round((this.yieldOut / targetRatio) * 10) / 10;
            if (delta < -tolerance) {
                return { action: 'increase_yield', message: `Your ratio is a little low. Increase the yield to ${suggestedYield}g or reduce the dose to ${suggestedDose}g.`, targetDose: this.dose, targetYield: suggestedYield };
            } else {
                return { action: 'decrease_yield', message: `Your ratio is a little high. Pull a little shorter to ${suggestedYield}g or increase the dose to ${suggestedDose}g.`, targetDose: this.dose, targetYield: suggestedYield };
            }
        },

        computeRecommendation() {
            if (this.taste === 'balanced') {
                return {
                    primary: '✅ Balanced',
                    reason: 'This shot is already dialed in. Keep the recipe, grind, and timing as-is.',
                    targetDisplay: `${this.dose}g in → ${this.yieldOut}g out in ${this.time}s`,
                    targetDose: this.dose,
                    targetYield: this.yieldOut,
                    targetTime: this.time,
                    hasSuggestion: false
                };
            }

            let primary = '✅ Balanced';
            let reason = 'This shot is already in balance. Keep this recipe and grind size.';
            let targetDose = this.dose;
            let targetYield = this.yieldOut;
            let targetTime = this.time;
            let hasSuggestion = false;

            if (this.yieldOut <= this.dose) {
                primary = '⚠️ Check the yield';
                reason = 'The yield is too low for a standard espresso. Aim closer to a 1:2 ratio and pull a little longer.';
                targetDose = this.dose;
                targetYield = Math.round(this.dose * 2);
                targetTime = this.time;
                hasSuggestion = true;
                return { primary, reason, targetDisplay: `${targetDose}g in → ${targetYield}g out in ${targetTime}s`, targetDose, targetYield, targetTime, hasSuggestion };
            }

            const ratioFix = this.suggestRatioFix();
            if (ratioFix) {
                primary = '👉 Fix the ratio';
                reason = ratioFix.message;
                targetDose = ratioFix.targetDose;
                targetYield = ratioFix.targetYield;
                targetTime = this.time;
                hasSuggestion = true;
                return { primary, reason, targetDisplay: `${targetDose}g in → ${targetYield}g out in ${targetTime}s`, targetDose, targetYield, targetTime, hasSuggestion };
            }

            if (this.taste === 'sour') {
                if (this.grindSize === 'coarse' || this.time < 24) {
                    primary = '👉 Grind finer';
                    reason = 'The shot tastes bright and under-extracted. A finer grind or a slightly longer pull will help even the extraction.';
                    targetYield = Math.min(this.maxYield, this.yieldOut + 3);
                    targetTime = Math.max(this.minTime, this.time + 2);
                    hasSuggestion = true;
                } else {
                    primary = '👉 Add a little more yield';
                    reason = 'The cup is still a bit sharp. Add a bit more yield to pull more sweetness and body into the shot.';
                    targetYield = Math.min(this.maxYield, this.yieldOut + 4);
                    hasSuggestion = true;
                }
            } else if (this.taste === 'bitter') {
                if (this.grindSize === 'fine' || this.time > 32) {
                    primary = '👉 Grind coarser';
                    reason = 'The shot is over-extracted. A coarser grind or a slightly shorter pull will tame bitterness.';
                    targetYield = Math.max(this.minYield, this.yieldOut - 3);
                    targetTime = Math.max(this.minTime, this.time - 2);
                    hasSuggestion = true;
                } else {
                    primary = '👉 Shorten the pull';
                    reason = 'The brew is drifting toward bitterness. Pull a touch earlier to keep structure and sweetness.';
                    targetYield = Math.max(this.minYield, this.yieldOut - 4);
                    hasSuggestion = true;
                }
            } else if (this.taste === 'weak') {
                primary = '👉 Increase dose';
                reason = 'The shot is thin and underpowered. Add a little more dose to lift strength without losing sweetness.';
                targetDose = Math.min(this.maxDose, toFixedVal(this.dose + 1, 1));
                targetYield = Math.round(targetDose * (this.yieldOut / this.dose));
                hasSuggestion = true;
            } else if (this.taste === 'harsh') {
                primary = '👉 Make it milder';
                reason = 'The shot feels too sharp. Slightly lower the dose or move the grind coarser to soften the extraction.';
                targetDose = Math.max(this.minDose, toFixedVal(this.dose - 1, 1));
                targetYield = Math.round(targetDose * (this.yieldOut / this.dose));
                hasSuggestion = true;
            }

            return { primary, reason, targetDisplay: `${targetDose}g in → ${targetYield}g out in ${targetTime}s`, targetDose, targetYield, targetTime, hasSuggestion };
        },

        get recommendation() { return this.computeRecommendation(); },

        applySuggestion() {
            const rec = this.computeRecommendation();
            if (!rec || !rec.hasSuggestion) return;
            const hasDose = typeof rec.targetDose === 'number' && rec.targetDose !== this.dose;
            const hasYield = typeof rec.targetYield === 'number' && rec.targetYield !== this.yieldOut;
            const hasTime = typeof rec.targetTime === 'number' && rec.targetTime !== this.time;
            if (hasDose) { this.dose = rec.targetDose; }
            if (hasYield) { this.yieldOut = rec.targetYield; }
            if (hasTime) { this.time = rec.targetTime; }
            // no-op: intentionally do not auto-record to avoid noisy samples
        },


        // updateMarker intentionally removed: no automatic recording is performed
    };
}
