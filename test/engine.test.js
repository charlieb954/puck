import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createEspresso } from '../js/engine.js';

function shot(overrides = {}) {
    return Object.assign(createEspresso(), overrides);
}

test('starts waiting on taste instead of claiming the shot is dialed in', () => {
    const app = shot();
    assert.equal(app.taste, null);
    assert.equal(app.recommendation.primary, 'Waiting on taste');
    assert.equal(app.recommendation.hasSuggestion, false);
});

test('balanced reports no suggestion', () => {
    const app = shot({ taste: 'balanced' });
    assert.equal(app.recommendation.primary, 'Balanced');
    assert.equal(app.recommendation.hasSuggestion, false);
});

test('low yield is corrected to a 1:2 ratio before taste advice', () => {
    const app = shot({ taste: 'sour', dose: 18, yieldOut: 18, time: 28 });
    const rec = app.recommendation;
    assert.equal(rec.primary, 'Check the yield');
    assert.equal(rec.targetYield, 36);
    assert.equal(rec.hasSuggestion, true);
});

test('ratio fix changes yield only', () => {
    const app = shot({ taste: 'bitter', dose: 18, yieldOut: 50, time: 28, grindSize: 'fine' });
    const rec = app.recommendation;
    assert.equal(rec.primary, 'Fix the ratio');
    assert.equal(rec.targetYield, 36);
    assert.equal(rec.targetGrind, 'fine');
    assert.equal(rec.targetDose, 18);
});

test('sour recommends a finer grind and apply actually changes grind', () => {
    const app = shot({ taste: 'sour', grindSize: 'coarse' });
    const rec = app.recommendation;
    assert.equal(rec.primary, 'Grind finer');
    assert.equal(rec.targetGrind, 'medium');
    assert.equal(rec.targetYield, app.yieldOut);
    app.applySuggestion();
    assert.equal(app.grindSize, 'medium');
    assert.equal(app.recommendation.primary, 'Grind finer');
    assert.equal(app.recommendation.targetGrind, 'fine');
});

test('sour on a fine grind with a short shot pulls longer instead of grinding finer', () => {
    const app = shot({ taste: 'sour', grindSize: 'fine', time: 20 });
    const rec = app.recommendation;
    assert.equal(rec.primary, 'Pull a little longer');
    assert.equal(rec.targetGrind, 'fine');
    assert.equal(rec.targetTime, 23);
});

test('bitter recommends a coarser grind', () => {
    const app = shot({ taste: 'bitter', grindSize: 'fine' });
    assert.equal(app.recommendation.primary, 'Grind coarser');
    assert.equal(app.recommendation.targetGrind, 'medium');
});

test('weak increases dose and keeps the ratio', () => {
    const app = shot({ taste: 'weak', dose: 18, yieldOut: 36 });
    const rec = app.recommendation;
    assert.equal(rec.primary, 'Increase dose');
    assert.equal(rec.targetDose, 19);
    assert.equal(rec.targetYield, 38);
});

test('weak at max dose shortens yield instead of no-op', () => {
    const app = shot({ taste: 'weak', dose: 24, yieldOut: 48 });
    const rec = app.recommendation;
    assert.equal(rec.primary, 'Pull a shorter shot');
    assert.equal(rec.targetDose, 24);
    assert.equal(rec.targetYield, 44);
});

test('harsh at min dose lengthens yield instead of no-op', () => {
    const app = shot({ taste: 'harsh', dose: 12, yieldOut: 24 });
    const rec = app.recommendation;
    assert.equal(rec.primary, 'Add a little more yield');
    assert.equal(rec.targetYield, 28);
});

test('current and target recipe strings use the same format', () => {
    const app = shot({ taste: 'sour', grindSize: 'coarse' });
    assert.match(app.recipeSummary, /Medium grind|Coarse grind|Fine grind/);
    assert.match(app.recommendation.targetDisplay, /grind$/);
    assert.notEqual(app.recipeSummary, app.recommendation.targetDisplay);
});

test('apply is a no-op without a suggestion', () => {
    const app = shot({ taste: 'balanced' });
    app.applySuggestion();
    assert.equal(app.dose, 18);
    assert.equal(app.yieldOut, 36);
    assert.equal(app.time, 28);
    assert.equal(app.grindSize, 'medium');
});
