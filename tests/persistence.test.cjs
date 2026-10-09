const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeSave, elapsedSeconds } = require('../persistence.js');
const groups = {
  automationUpgrades: [{name:'pacbot'}, {name:'compiler'}],
  clickUpgrades: [{name:'mouse'}],
  systemUpgrades: [{name:'core', maxCount:20}],
  metaUpgrades: [{name:'meta', maxCount:10}]
};
function legacy() {
  return {packages: 10, totalPackages: 25, automationUpgrades: [
    {name:'compiler', count:2, cost:-999}, {name:'pacbot', count:3}
  ], systemMultiplier:999};
}
test('legacy saves migrate by name, never by array order or stored prices', () => {
  const save = normalizeSave(legacy(), groups);
  assert.deepEqual(save.automationUpgrades, [{name:'pacbot',count:3},{name:'compiler',count:2}]);
  assert.equal(save.systemMultiplier, undefined);
  assert.equal(save.savedAt, null); // no invented offline time for old saves
  assert.equal(save.version, 3);
});
test('invalid balances, counts and timestamps are rejected before restoring', () => {
  for (const value of [-1, NaN, Infinity, '42', null]) {
    assert.throws(() => normalizeSave({...legacy(), packages:value}, groups));
  }
  for (const count of [-1, 0.5, 1001, Infinity, '2']) {
    assert.throws(() => normalizeSave({...legacy(), automationUpgrades:[{name:'pacbot',count}]}, groups));
  }
  assert.throws(() => normalizeSave({...legacy(), savedAt:'yesterday'}, groups));
  assert.throws(() => normalizeSave({...legacy(), systemUpgrades:[{name:'core',count:21}]}, groups));
  assert.throws(() => normalizeSave({...legacy(), totalPackages:1}, groups));
});
test('unrelated JSON, duplicates and unknown versions cannot replace a game', () => {
  for (const data of [null, [], {}, {hello:'world'}, {...legacy(), version:99},
    {...legacy(), automationUpgrades:{}},
    {...legacy(), automationUpgrades:[{name:'pacbot'},{name:'pacbot'}]},
    {...legacy(), automationUpgrades:[{name:'unknown'}]}]) {
    assert.throws(() => normalizeSave(data, groups));
  }
});
test('elapsed time follows the clock rather than interval callback count', () => {
  assert.equal(elapsedSeconds(1000, 3500), 2.5);
  assert.equal(elapsedSeconds(1000, 1000 + 9*3600*1000), 8*3600);
  assert.equal(elapsedSeconds(1000, 900), 0);
  assert.equal(elapsedSeconds(null, 2000), 0);
  assert.equal(elapsedSeconds(NaN, 2000), 0);
});
