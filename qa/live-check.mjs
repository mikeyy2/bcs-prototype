/**
 * Post-deploy verification against the live GitHub Pages site.
 * Read-only: navigates and screenshots, changes nothing on the server.
 */
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const BASE = 'https://mikeyy2.github.io/bcs-prototype/'
const OUT = 'docs/screenshots'
mkdirSync(OUT, { recursive: true })

const checks = []
const add = (group, name, ok, note = '') =>
  checks.push({ group, name, status: ok ? 'pass' : 'FAIL', note })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await ctx.newPage()

const consoleErrors = []
const failedRequests = []
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()))
page.on('pageerror', (e) => consoleErrors.push(String(e)))
page.on('requestfailed', (r) => failedRequests.push(`${r.url()} ${r.failure()?.errorText}`))
page.on('response', (r) => {
  if (r.status() >= 400) failedRequests.push(`${r.status()} ${r.url()}`)
})

const body = async () => (await page.locator('body').innerText()).replace(/\s+/g, ' ')
const has = async (s) => (await body()).includes(s)

async function open(route, id, width = 1440) {
  if (width !== 1440) await page.setViewportSize({ width, height: 1000 })
  await page.goto(BASE + route, { waitUntil: 'load' })
  await page.waitForSelector('h1', { timeout: 20000 })
  await page.waitForTimeout(200)
  if (id) await page.screenshot({ path: `${OUT}/live-${id}.png`, fullPage: true })
  if (width !== 1440) await page.setViewportSize({ width: 1440, height: 1000 })
}

async function signIn(role) {
  await page.goto(BASE + '#/login', { waitUntil: 'load' })
  await page.getByRole('button', { name: role, exact: true }).click()
  await page.waitForTimeout(200)
}

// ---------- Serving ----------
const res = await page.goto(BASE, { waitUntil: 'load' })
add('serving', 'index returns 200 over HTTPS', res?.status() === 200, String(res?.status()))
add('serving', 'served from the /bcs-prototype/ base path', page.url().startsWith(BASE))
add('serving', 'page title is set', (await page.title()).includes('Best Community Services'))

// ---------- Images and assets ----------
await page.waitForSelector('h1')
const imgReport = await page.evaluate(() =>
  [...document.images].map((i) => ({
    src: i.currentSrc || i.src,
    ok: i.complete && i.naturalWidth > 0,
  })),
)
add('assets', `every image on C-01 loads (${imgReport.length} images)`, imgReport.every((i) => i.ok),
  imgReport.filter((i) => !i.ok).map((i) => i.src).join(', '))

const cssApplied = await page
  .locator('section')
  .first()
  .evaluate((el) => getComputedStyle(el).backgroundColor)
add('assets', 'stylesheet applied (hero band is the primary colour)', cssApplied === 'rgb(15, 82, 87)', cssApplied)

const tokenOk = await page.evaluate(() =>
  getComputedStyle(document.documentElement).getPropertyValue('--bcs-primary').trim(),
)
add('assets', 'design tokens present', tokenOk === '#0f5257', tokenOk)

// ---------- Screens ----------
const SCREENS = [
  ['', 'C-01', 'visitor'],
  ['#/login', 'C-02', 'visitor'],
  ['#/search?q=food', 'S-01', 'visitor'],
  ['#/volunteer', 'V-01', 'visitor'],
  ['#/volunteer/opp-2', 'V-02', 'visitor'],
  ['#/events', 'E-01', 'visitor'],
  ['#/events/evt-1', 'E-02', 'visitor'],
  ['#/donate', 'D-01', 'visitor'],
  ['#/give-items', 'D-03', 'visitor'],
  ['#/partner/apply', 'P-01', 'visitor'],
  ['#/my-activity', 'V-03', 'Volunteer'],
  ['#/profile', 'C-03', 'Volunteer'],
  ['#/partner', 'P-02', 'Partner'],
  ['#/partner/new-listing', 'P-03', 'Partner'],
  ['#/admin', 'A-01', 'BCS Staff'],
  ['#/admin/accounts', 'A-02', 'BCS Staff'],
  ['#/admin/reports', 'A-03', 'BCS Staff'],
]
let current = 'visitor'
for (const [route, id, role] of SCREENS) {
  if (role !== 'visitor' && role !== current) {
    await signIn(role)
    current = role
  }
  await open(route, id)
  add('screens', `${id} renders live`, (await page.locator('h1').count()) > 0)
}
// C-04 is the mobile home.
await open('', 'C-04', 375)
add('screens', 'C-04 mobile home renders live', true)

// ---------- Refresh survival ----------
for (const [route, id] of [
  ['#/volunteer/opp-2', 'V-02'],
  ['#/events/evt-1', 'E-02'],
  ['#/admin/reports', 'A-03'],
]) {
  await page.goto(BASE + route, { waitUntil: 'load' })
  await page.waitForSelector('h1')
  const before = await page.locator('h1').innerText()
  await page.reload({ waitUntil: 'load' })
  await page.waitForSelector('h1')
  const after = await page.locator('h1').innerText()
  add('refresh', `${id} survives a hard refresh`, before === after && page.url().includes(route.slice(1)), after)
}
// A 404-style deep link should fall back, not break.
await page.goto(BASE + '#/does-not-exist', { waitUntil: 'load' })
await page.waitForSelector('h1')
add('refresh', 'unknown route falls back to home', page.url().endsWith('#/'), page.url())

// ---------- Role: Volunteer ----------
await signIn('Volunteer')
add('volunteer', 'signs in and lands on V-03', page.url().includes('#/my-activity'))
await page.goto(BASE + '#/volunteer', { waitUntil: 'load' })
await page.getByLabel('Search by title, organization, or category').fill('pantry')
add('volunteer', 'search filters the catalogue', (await page.getByRole('status').innerText()).includes('matching'))

await page.goto(BASE + '#/volunteer/opp-2', { waitUntil: 'load' })
await page.getByRole('radio').last().check()
await page.getByRole('checkbox', { name: 'I meet the requirements' }).check()
await page.getByRole('button', { name: 'Register for this shift' }).click()
add('volunteer', 'registers for a shift', await has('You are registered.'))
await page.screenshot({ path: `${OUT}/live-journey-volunteer.png`, fullPage: true })

await page.getByRole('button', { name: /Mock outbox/ }).click()
await page.getByRole('dialog', { name: 'Mock outbox' }).waitFor()
add('volunteer', 'confirmation and reminder reach the mock outbox',
  (await has("You're signed up")) && (await has('Reminder:')))
await page.keyboard.press('Escape')

await page.goto(BASE + '#/my-activity', { waitUntil: 'load' })
add('volunteer', 'booking shows in My Activity', await has('After-School Reading Buddy'))

await page.goto(BASE + '#/events/evt-1', { waitUntil: 'load' })
await page.getByRole('button', { name: 'RSVP to this event' }).click()
add('volunteer', 'RSVPs to an event', await has('You’re going!'))
await page.screenshot({ path: `${OUT}/live-E-02a.png` })
await page.getByRole('button', { name: 'Back to event' }).click()

// ---------- Role: Donor ----------
await signIn('Donor')
add('donor', 'signs in as Donor', page.url().includes('#/my-activity'))
await page.goto(BASE + '#/donate', { waitUntil: 'load' })
await page.getByLabel('Full name').fill('Jordan Diaz')
await page.getByLabel('Email for receipt').fill('jordan.diaz@example.com')
await page.getByRole('button', { name: /^Donate/ }).click()
await page.getByText('Donation receipt').waitFor()
add('donor', 'completes a mock donation and gets a receipt',
  (await has('Jordan Diaz')) && (await has('$50.00')) && (await has('mock_pi_')))
await page.screenshot({ path: `${OUT}/live-D-02.png`, fullPage: true })

await page.goto(BASE + '#/give-items', { waitUntil: 'load' })
await page.getByLabel('Description').fill('Winter coats, adult sizes')
await page.getByRole('button', { name: /Open$/ }).first().click()
await page.getByRole('button', { name: 'Submit offer' }).click()
add('donor', 'submits an in-kind offer and books a slot', await has('Offer submitted.'))
await page.screenshot({ path: `${OUT}/live-journey-donor.png`, fullPage: true })

// ---------- Role: Partner ----------
await signIn('Partner')
add('partner', 'signs in and lands on P-02', page.url().includes('#/partner'))
add('partner', 'sees its own listings', await has('My listings'))
await page.getByRole('button', { name: '+ New listing' }).click()
await page.getByLabel('Title').fill('Holiday Grocery Box Drive')
await page.getByRole('button', { name: 'Submit for approval' }).click()
await page.waitForURL(/#\/partner$/)
await page.getByRole('cell', { name: 'Holiday Grocery Box Drive' }).waitFor()
add('partner', 'creates a listing that is pending approval', await has('Pending approval'))
await page.screenshot({ path: `${OUT}/live-journey-partner.png`, fullPage: true })

await page.goto(BASE + '#/volunteer', { waitUntil: 'load' })
await page.getByLabel('Search by title, organization, or category').fill('Holiday Grocery')
add('partner', 'pending listing is not publicly visible', await has('Nothing matches yet'))

// ---------- Role: BCS Staff ----------
await signIn('BCS Staff')
add('staff', 'signs in and lands on A-01', page.url().includes('#/admin'))
await page.getByRole('cell', { name: 'Holiday Grocery Box Drive' }).waitFor()
add('staff', 'the partner listing arrived in the queue', true)

await page.getByRole('row', { name: /Holiday Grocery Box Drive/ }).getByRole('button', { name: 'Review' }).click()
await page.getByRole('button', { name: 'Reject' }).click()
add('staff', 'rejection without a reason is blocked', await has('Give a reason before rejecting'))
await page.getByLabel('Reason (required to reject)').fill('Please add a minimum age.')
await page.getByRole('button', { name: 'Reject' }).click()
await page.getByRole('button', { name: /Mock outbox/ }).click()
await page.getByRole('dialog', { name: 'Mock outbox' }).waitFor()
add('staff', 'the rejection reason is emailed', await has('Please add a minimum age'))
await page.keyboard.press('Escape')
await page.screenshot({ path: `${OUT}/live-journey-staff.png`, fullPage: true })

await page.goto(BASE + '#/admin/accounts', { waitUntil: 'load' })
await page.getByLabel('Search by name or email').fill('Priya')
add('staff', 'account search works', await has('Priya Shah'))
await page.getByRole('button', { name: 'Suspend' }).first().click()
add('staff', 'suspending an account reports back', await has('Account suspended'))

await page.goto(BASE + '#/admin/reports', { waitUntil: 'load' })
await page.getByRole('button', { name: 'Donations' }).click()
const download = page.waitForEvent('download')
await page.getByRole('button', { name: 'Export CSV' }).click()
const file = await download
add('staff', 'CSV export downloads from the live site', file.suggestedFilename().endsWith('.csv'),
  file.suggestedFilename())

// ---------- Responsive spot check ----------
for (const width of [375, 768]) {
  await page.setViewportSize({ width, height: 1000 })
  await page.goto(BASE, { waitUntil: 'load' })
  await page.waitForSelector('h1')
  const over = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  add('responsive', `no horizontal overflow at ${width}px`, over <= 1, `${over}px`)
}

add('hygiene', 'no console errors across the whole run', consoleErrors.length === 0,
  [...new Set(consoleErrors)].slice(0, 3).join(' | '))
add('hygiene', 'no failed requests across the whole run', failedRequests.length === 0,
  [...new Set(failedRequests)].slice(0, 3).join(' | '))

await browser.close()

const failed = checks.filter((c) => c.status !== 'pass')
console.log(JSON.stringify({ total: checks.length, failed: failed.length, checks }, null, 2))
if (failed.length) process.exitCode = 1
