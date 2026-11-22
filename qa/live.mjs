import { chromium } from '@playwright/test'
const BASE = 'https://mikeyy2.github.io/bcs-prototype/'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
const p = await ctx.newPage()
const errs = [], bad = []
p.on('console', m => m.type() === 'error' && errs.push(m.text()))
p.on('pageerror', e => errs.push(String(e)))
p.on('response', r => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`) })

const ok = []
await p.goto(BASE); await p.waitForSelector('h1')
ok.push(['home loads with styling', (await p.locator('section').first().evaluate(e => getComputedStyle(e).backgroundColor)) === 'rgb(15, 82, 87)'])
ok.push(['icons render', await p.evaluate(() => [...document.images].every(i => i.complete && i.naturalWidth > 0))])

await p.goto(BASE + '#/volunteer/opp-2'); await p.waitForSelector('h1')
await p.reload(); await p.waitForSelector('h1')
ok.push(['deep link survives refresh', p.url().includes('#/volunteer/opp-2')])

await p.goto(BASE + '#/login'); await p.getByRole('button', { name: 'Volunteer', exact: true }).click()
await p.goto(BASE + '#/volunteer/opp-2')
await p.getByRole('radio').last().check()
await p.getByRole('checkbox', { name: 'I meet the requirements' }).check()
await p.getByRole('button', { name: 'Register for this shift' }).click()
ok.push(['registration journey works live', await p.getByText('You are registered.').isVisible()])
await p.getByRole('button', { name: /Mock outbox/ }).click()
ok.push(['mock outbox populated', (await p.locator('body').innerText()).includes("You're signed up")])
await p.screenshot({ path: 'docs/screenshots/live-home-1440.png' })

await p.setViewportSize({ width: 360, height: 900 })
await p.goto(BASE); await p.waitForSelector('h1')
const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
ok.push([`no mobile overflow (${over}px)`, over <= 1])

console.log(ok.map(([n, v]) => `${v ? 'OK  ' : 'FAIL'} ${n}`).join('\n'))
console.log('console errors:', errs.length ? errs : 'none')
console.log('failed requests:', bad.length ? bad : 'none')
await b.close()
