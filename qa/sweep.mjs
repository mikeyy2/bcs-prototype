/**
 * QA sweep: every screen at three widths, capturing screenshots plus any
 * console errors, failed requests, broken images and dead internal links.
 * Run against the dev server. Not part of the app build.
 */
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const BASE = 'http://localhost:5173/bcs-prototype/'
const OUT = 'docs/screenshots'
const WIDTHS = [375, 768, 1440]

const SCREENS = [
  ['C-01', '', 'visitor'],
  ['C-02', '#/login', 'visitor'],
  ['C-03', '#/profile', 'volunteer'],
  ['C-04', '', 'visitor'],
  ['S-01', '#/search?q=food', 'visitor'],
  ['V-01', '#/volunteer', 'visitor'],
  ['V-02', '#/volunteer/opp-2', 'visitor'],
  ['V-03', '#/my-activity', 'volunteer'],
  ['E-01', '#/events', 'visitor'],
  ['E-02', '#/events/evt-1', 'visitor'],
  ['D-01', '#/donate', 'visitor'],
  ['D-03', '#/give-items', 'visitor'],
  ['P-01', '#/partner/apply', 'visitor'],
  ['P-02', '#/partner', 'partner'],
  ['P-03', '#/partner/new-listing', 'partner'],
  ['A-01', '#/admin', 'staff'],
  ['A-02', '#/admin/accounts', 'staff'],
  ['A-03', '#/admin/reports', 'staff'],
]

const LABEL = { volunteer: 'Volunteer', donor: 'Donor', partner: 'Partner', staff: 'BCS Staff' }

mkdirSync(OUT, { recursive: true })

const problems = { console: [], requests: [], images: [], links: [] }

const browser = await chromium.launch()

async function newPage(width) {
  const ctx = await browser.newContext({ viewport: { width, height: 1000 } })
  const page = await ctx.newPage()
  page.on('console', (m) => {
    if (m.type() === 'error') problems.console.push(`${page.url()} :: ${m.text()}`)
  })
  page.on('pageerror', (e) => problems.console.push(`${page.url()} :: pageerror ${e.message}`))
  page.on('requestfailed', (r) =>
    problems.requests.push(`${r.url()} :: ${r.failure()?.errorText ?? 'failed'}`),
  )
  page.on('response', (r) => {
    if (r.status() >= 400) problems.requests.push(`${r.status()} ${r.url()}`)
  })
  return { ctx, page }
}

async function signIn(page, role) {
  if (role === 'visitor') return
  await page.goto(`${BASE}#/login`)
  await page.getByRole('button', { name: LABEL[role], exact: true }).click()
}

for (const width of WIDTHS) {
  for (const [id, route, role] of SCREENS) {
    // C-04 is the mobile home frame; only meaningful at phone width.
    if (id === 'C-04' && width !== 375) continue
    if (id === 'C-01' && width === 375) continue

    const { ctx, page } = await newPage(width)
    await signIn(page, role)
    await page.goto(BASE + route)
    await page.waitForSelector('h1', { timeout: 10000 })
    await page.waitForTimeout(150)

    await page.screenshot({ path: `${OUT}/test-${id}-${width}.png`, fullPage: true })

    // Broken or zero-size images
    const broken = await page.evaluate(() =>
      [...document.images]
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.currentSrc || img.src),
    )
    broken.forEach((src) => problems.images.push(`${id}@${width}: ${src}`))

    // Internal links that point nowhere the router knows about
    const hrefs = await page.evaluate(() =>
      [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
    )
    for (const href of new Set(hrefs)) {
      if (!href) continue
      if (href.startsWith('http') || href === '#main') continue
      if (!href.startsWith('#/')) problems.links.push(`${id}@${width}: odd href ${href}`)
    }

    await ctx.close()
  }
}

await browser.close()

console.log(JSON.stringify({
  consoleErrors: [...new Set(problems.console)],
  failedRequests: [...new Set(problems.requests)],
  brokenImages: [...new Set(problems.images)],
  oddLinks: [...new Set(problems.links)],
}, null, 2))
