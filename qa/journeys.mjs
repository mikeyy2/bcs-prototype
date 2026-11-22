/**
 * QA journeys: walks each main user journey in a real browser at a given
 * width, asserting the acceptance checks from 03-requirements-traceability.md.
 * Usage: node qa/journeys.mjs <width>
 */
import { chromium } from '@playwright/test'

const BASE = 'http://localhost:5173/bcs-prototype/'
const WIDTH = Number(process.argv[2] ?? 1440)
const OUT = 'docs/screenshots'

const results = []
const record = (name, req, ok, note = '') =>
  results.push({ name, req, status: ok ? 'pass' : 'FAIL', note })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: WIDTH, height: 1000 } })
const page = await ctx.newPage()
const consoleErrors = []
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()))
page.on('pageerror', (e) => consoleErrors.push(String(e)))

const text = async () => (await page.locator('body').innerText()).replace(/\s+/g, ' ')
const has = async (s) => (await text()).includes(s)
const shot = (n) => page.screenshot({ path: `${OUT}/test-journey-${n}-${WIDTH}.png`, fullPage: true })

async function signIn(role) {
  await page.goto(`${BASE}#/login`)
  await page.getByRole('button', { name: role, exact: true }).click()
}

// ---------- 1. Volunteer sign-up ----------
await page.goto(BASE)
await page.getByRole('button', { name: 'Find opportunities' }).click()
record('home CTA reaches V-01', 'REQ-COM-2', page.url().includes('#/volunteer'))

await page.getByLabel('Search by title, organization, or category').fill('pantry')
const filtered = await page.getByRole('status').innerText()
record('V-01 keyword search narrows results', 'REQ-VOL-2', filtered.includes('matching all filters'), filtered)

await page.getByRole('checkbox', { name: 'Food Security' }).check()
record('V-01 filter combines with search', 'REQ-VOL-3', (await page.getByRole('status').innerText()).includes('matching'))

await page.goto(`${BASE}#/volunteer/opp-2`)
const lastLeft = async () => {
  const all = [...(await text()).matchAll(/(\d+) of \d+ left/g)].map((m) => Number(m[1]))
  return all.length ? all[all.length - 1] : -1
}
const beforeLeft = await lastLeft()

await page.getByRole('button', { name: 'Register for this shift' }).click()
record('visitor sent to sign in', 'REQ-VOL-6', page.url().includes('#/login'))
await page.getByRole('button', { name: 'Volunteer', exact: true }).click()
record('returned to the same opportunity', 'REQ-VOL-6', page.url().includes('#/volunteer/opp-2'))

await page.getByRole('radio').last().check()
await page.getByRole('checkbox', { name: 'I meet the requirements' }).check()
await page.getByRole('button', { name: 'Register for this shift' }).click()
record('registration succeeds', 'REQ-VOL-5', await has('You are registered.'))
await shot('volunteer-signup')

await page.reload()
const afterLeft = await lastLeft()
record('capacity drops by one and persists', 'REQ-VOL-5', afterLeft === beforeLeft - 1, `${beforeLeft} -> ${afterLeft}`)

await page.getByRole('button', { name: /Mock outbox/ }).click()
await page.getByRole('dialog', { name: 'Mock outbox' }).waitFor()
const outbox = await text()
record('confirmation email queued', 'REQ-VOL-8', outbox.includes("You're signed up"))
record('24-hour reminder queued', 'REQ-NTF-2', outbox.includes('Reminder:') && outbox.includes('Scheduled'))
await shot('mock-outbox')
await page.keyboard.press('Escape')

await page.goto(`${BASE}#/my-activity`)
record('booking appears in My Activity', 'REQ-DSH-1', await has('After-School Reading Buddy'))
await shot('my-activity')

// ---------- 2. Event RSVP ----------
await page.goto(`${BASE}#/events`)
record('E-01 calendar renders', 'REQ-EVT-1', await has('Community events'))
await page.goto(`${BASE}#/events/evt-1`)
const seatsBefore = Number(/(\d+) of \d+ seats left/.exec(await text())?.[1] ?? -1)
await page.getByLabel('Number of guests').fill('2')
await page.getByRole('button', { name: 'RSVP to this event' }).click()
record('E-02a confirmation overlay shown', 'REQ-EVT-3', await has('You’re going!'))
await shot('event-rsvp')
await page.getByRole('button', { name: 'Back to event' }).click()
const seatsAfter = Number(/(\d+) of \d+ seats left/.exec(await text())?.[1] ?? -1)
record('capacity drops by 1 + guests', 'REQ-EVT-3', seatsAfter === seatsBefore - 3, `${seatsBefore} -> ${seatsAfter}`)

await page.goto(`${BASE}#/events/evt-3`)
record('full event disables RSVP', 'REQ-EVT-4', await has('Registration closed'))

// ---------- 3. Money donation ----------
await page.goto(`${BASE}#/donate`)
const donateBody = await text()
record('no card fields anywhere', 'REQ-DON-2', !/Card number|CVC\b/i.test(donateBody.replace('No card fields exist anywhere in this prototype. BCS never sees or stores a card number.', '')))
await page.getByLabel('Other amount').fill('0.50')
await page.getByRole('button', { name: /^Donate/ }).click()
record('amount under $1 rejected', 'REQ-DON-1', await has('at least $1'))
await page.getByLabel('Other amount').fill('')
await page.getByRole('button', { name: '$50', exact: true }).click()
await page.getByLabel('Full name').fill('Jordan Diaz')
await page.getByLabel('Email for receipt').fill('jordan.diaz@example.com')
await page.getByRole('button', { name: /^Donate/ }).click()
await page.waitForURL(/thank-you/)
await page.getByText('Donation receipt').waitFor()
const receipt = await text()
record('receipt shows donor, amount, date, tax ID, reference', 'REQ-DON-5',
  receipt.includes('Jordan Diaz') && receipt.includes('$50.00') && receipt.includes('BCS tax ID') && receipt.includes('mock_pi_'))
await shot('donation-receipt')

// ---------- 4. In-kind offer ----------
await page.goto(`${BASE}#/give-items`)
await page.getByRole('button', { name: 'Submit offer' }).click()
record('in-kind validation blocks empty offer', 'REQ-DON-6', await has('Describe what you are giving'))
await page.getByLabel('Description').fill('Winter coats, adult sizes')
await page.getByLabel('Quantity').fill('6')
const bookedBefore = await page.getByRole('button', { name: /Booked/ }).count()
await page.getByRole('button', { name: /Open$/ }).first().click()
await page.getByRole('button', { name: 'Submit offer' }).click()
record('offer submitted', 'REQ-DON-6', await has('Offer submitted.'))
await shot('in-kind-offer')
await page.reload()
const bookedAfter = await page.getByRole('button', { name: /Booked/ }).count()
record('chosen slot becomes unavailable', 'REQ-DON-7', bookedAfter === bookedBefore + 1, `${bookedBefore} -> ${bookedAfter}`)

// ---------- 5. Partner application and listing ----------
await page.goto(`${BASE}#/partner/apply`)
await page.getByRole('button', { name: 'Submit application' }).click()
record('application validation fires', 'REQ-PRT-1', await has('organization name'))
await page.getByLabel('Organization name').fill('Story County Bike Library')
await page.getByLabel('EIN (tax ID)').fill('12-3456789')
await page.getByLabel('Email').fill('hello@example.org')
await page.setInputFiles('input[type="file"]', {
  name: 'irs-letter.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4'),
})
await page.getByRole('checkbox', { name: /I confirm/ }).check()
await page.getByRole('button', { name: 'Submit application' }).click()
record('application accepted', 'REQ-PRT-2', await has('Application received'))
await shot('partner-application')

await signIn('Partner')
record('partner lands on P-02', 'REQ-PRT-3', page.url().includes('#/partner'))
await page.getByRole('button', { name: '+ New listing' }).click()
await page.getByLabel('Title').fill('Holiday Grocery Box Drive')
await page.getByRole('button', { name: 'Submit for approval' }).click()
await page.waitForURL(/#\/partner$/)
await page.getByRole('cell', { name: 'Holiday Grocery Box Drive' }).waitFor()
record('listing created as pending', 'REQ-PRT-4', await has('Pending approval'))
await shot('partner-listing')

await page.goto(`${BASE}#/volunteer`)
await page.getByLabel('Search by title, organization, or category').fill('Holiday Grocery')
record('pending listing is not public', 'REQ-PRT-5', await has('Nothing matches yet'))

// ---------- 6. Admin approval and report ----------
await signIn('BCS Staff')
record('staff lands on A-01', 'REQ-ADM-4', page.url().includes('#/admin'))
await page.getByRole('cell', { name: 'Holiday Grocery Box Drive' }).waitFor()
record('partner listing reached the queue', 'REQ-PRT-2', await has('Holiday Grocery Box Drive'))
await page.getByRole('button', { name: 'Review' }).first().click()
await page.getByRole('button', { name: 'Reject' }).click()
record('rejection without a reason is blocked', 'REQ-ADM-4', await has('Give a reason before rejecting'))
await page.getByLabel('Reason (required to reject)').fill('Please add a minimum age.')
await page.getByRole('button', { name: 'Reject' }).click()
await page.getByRole('button', { name: /Mock outbox/ }).click()
await page.getByRole('dialog', { name: 'Mock outbox' }).waitFor()
record('rejection reason emailed', 'REQ-ADM-4', await has('Please add a minimum age'))
await page.keyboard.press('Escape')
await shot('admin-approval')

await page.goto(`${BASE}#/admin/accounts`)
await page.getByRole('row', { name: /Ames Food Pantry/ }).getByRole('button', { name: 'Revoke' }).click()
record('revoke warns it unpublishes listings', 'REQ-ADM-2', await has('unpublished'))
await page.goto(`${BASE}#/volunteer`)
await page.getByLabel('Search by title, organization, or category').fill('Ames Food Pantry')
record('revoked partner listings disappear', 'REQ-ADM-2', await has('Nothing matches yet'))

await signIn('BCS Staff')
await page.goto(`${BASE}#/admin/reports`)
await page.getByRole('button', { name: 'Donations' }).click()
record('donation report totals the records', 'REQ-ADM-7', await has('$50.00'))
const dl = page.waitForEvent('download')
await page.getByRole('button', { name: 'Export CSV' }).click()
const file = await dl
record('CSV export downloads', 'REQ-ADM-7', file.suggestedFilename().endsWith('.csv'), file.suggestedFilename())
await shot('admin-report')

// ---------- Empty states ----------
await page.goto(`${BASE}#/search?q=zzzz`)
record('search empty state', 'REQ-SRC-1', await has('No matches'))
await page.goto(`${BASE}#/volunteer`)
await page.getByLabel('Search by title, organization, or category').fill('zzzz')
record('catalogue empty state', 'REQ-VOL-1', await has('Nothing matches yet'))
await shot('empty-state')

// ---------- Keyboard-only ----------
await page.goto(BASE)
await page.keyboard.press('Tab')
const firstStop = await page.evaluate(() => document.activeElement?.textContent?.trim())
record('first tab stop is the skip link', 'NFR-USE-1', firstStop === 'Skip to content', String(firstStop))

await signIn('Volunteer')
await page.goto(`${BASE}#/volunteer/opp-4`)
let reached = false
for (let i = 0; i < 90 && !reached; i += 1) {
  await page.keyboard.press('Tab')
  reached = await page.evaluate(
    () => document.activeElement?.textContent?.includes('Register for this shift') ?? false,
  )
}
record('register button reachable by keyboard alone', 'NFR-USE-1', reached)
if (reached) {
  await page.keyboard.press('Enter')
  record('keyboard activation shows an error, not a silent no-op', 'NFR-USE-1', await has('Choose a shift'))
}

console.log(JSON.stringify({ width: WIDTH, consoleErrors: [...new Set(consoleErrors)], results }, null, 2))
await browser.close()

const failed = results.filter((r) => r.status === 'FAIL')
if (failed.length) process.exitCode = 1
