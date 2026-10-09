const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const persistence = require('../persistence.js');
const KEY = 'archPackageClickerSave_v2';
function boot(initial, {blocked = false, now = 10_000} = {}) {
  const nodes = new Map();
  const storage = new Map(initial === undefined ? [] : [[KEY, initial]]);
  const intervals = [];
  const makeNode = () => ({style:{}, listeners:{}, textContent:'', innerText:'',
    addEventListener(event, fn) { this.listeners[event] = fn; }});
  class Clock extends Date { static now() { return now; } }
  const context = vm.createContext({
    ClickerPersistence:persistence, Date:Clock, Intl, Math:Object.assign(Object.create(Math), {random:()=>1}),
    document:{hidden:false, addEventListener(){}, getElementById(id) {
      if (!nodes.has(id)) nodes.set(id, makeNode());
      return nodes.get(id);
    }},
    window:{addEventListener(){}, confirm:()=>true},
    localStorage:{getItem(k) { if (blocked) throw Error('denied'); return storage.get(k)||null; },
      setItem(k,v) { if (blocked) throw Error('denied'); storage.set(k,v); }},
    setTimeout(){}, setInterval(fn) { intervals.push(fn); }
  });
  vm.runInContext(source, context);
  return {nodes, storage, intervals, run: code=>vm.runInContext(code, context), setNow:v=>{now=v;}};
}
const save = (extra = {}) => JSON.stringify({packages:0,totalPackages:0,
  automationUpgrades:[{name:'pacbot',count:10}], ...extra});

test('startup survives corrupt or unavailable storage and retains the original', () => {
  const game = boot('{broken');
  game.nodes.get('main-click-btn').listeners.click();
  assert.equal(game.run('packages'), 1);
  game.run('saveGame()');
  assert.equal(game.storage.get(KEY), '{broken');
  assert.match(game.nodes.get('save-status').textContent, /nicht lesbar/);
  const denied = boot(undefined, {blocked:true});
  denied.nodes.get('main-click-btn').listeners.click();
  assert.equal(denied.run('packages'), 1);
});
test('offline production is consumed once, capped and independent of saved prices', () => {
  const now = 100_000_000;
  const game = boot(save({savedAt: now - 12*3600*1000, systemMultiplier:9999}), {now});
  assert.equal(game.run('packages'), 8*3600);
  assert.equal(game.run('pps'), 1);
  const reloaded = boot(game.storage.get(KEY), {now});
  assert.equal(reloaded.run('packages'), 8*3600);
});
test('elapsed production settles before a purchase changes the rate', () => {
  const game = boot(save({packages:1000,totalPackages:1000}), {now:10_000});
  game.setNow(20_000);
  game.run('buyAutomationUpgrade(1)');
  assert.equal(game.run('packages'), 910); // 10 seconds at 1 PPS, then 100 spent
  assert.equal(game.run('pps'), 2);
  game.setNow(25_000);
  game.run('gameLoop()');
  assert.equal(game.run('packages'), 920);
});
test('invalid imports cannot partly replace live state', () => {
  const game = boot(save({packages:40,totalPackages:40}));
  assert.throws(() => game.run('restoreGame({packages:999, totalPackages:999, automationUpgrades:{}})'));
  assert.equal(game.run('packages'), 40);
  assert.equal(game.run('pps'), 1);
});
test('prestige preserves meta upgrades while resetting automation', () => {
  const game = boot(save({packages:0,totalPackages:5_000_000, metaUpgrades:[{name:'meta_click',count:2}]}));
  game.run('startOver()');
  assert.equal(game.run('aurReputation'), 5);
  assert.equal(game.run('archCredits'), 1);
  assert.equal(game.run('automationUpgrades[0].count'), 0);
  assert.equal(game.run('metaUpgrades[2].count'), 2);
  assert.equal(JSON.parse(game.storage.get(KEY)).aurReputation, 5);
});
