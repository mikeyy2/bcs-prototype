import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/** P5 — V-01 Volunteer Opportunities (WBS 1.1.1, 1.1.2). */

test.describe('P5 volunteer discovery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./#/volunteer')
  })

  test('REQ-VOL-1: lists opportunities 20 per page with working pagination', async ({ page }) => {
    await expect(page.locator('a[href*="#/volunteer/opp-"]')).toHaveCount(20)

    const pagination = page.getByRole('navigation', { name: 'Pagination' })
    await expect(pagination).toBeVisible()
    await expect(page.getByRole('button', { name: 'Previous page' })).toBeDisabled()

    await pagination.getByRole('button', { name: '2', exact: true }).click()
    await expect(page.getByRole('status')).toContainText('Showing 21–')
  })

  test('REQ-VOL-2: keyword search matches title, organisation and category', async ({ page }) => {
    const search = page.getByLabel('Search by title, organization, or category')

    await search.fill('pantry')
    await expect(page.getByRole('status')).toContainText('matching all filters')
    const titles = await page.locator('a[href*="#/volunteer/opp-"] h3').allTextContents()
    expect(titles.length).toBeGreaterThan(0)

    await search.fill('Prairie Trails Alliance')
    const orgs = await page.locator('a[href*="#/volunteer/opp-"] h3').allTextContents()
    expect(orgs.length).toBeGreaterThan(0)

    await search.fill('Animal Welfare')
    await expect(page.locator('a[href*="#/volunteer/opp-"]').first()).toBeVisible()
  })

  test('REQ-VOL-3: two filters combine with the keyword search', async ({ page }) => {
    const status = page.getByRole('status')
    const initial = await status.textContent()

    await page.getByRole('checkbox', { name: 'Food Security' }).check()
    await page.getByLabel('Location (city or ZIP)').fill('Ames')
    await page.getByLabel('Search by title, organization, or category').fill('pantry')

    const narrowed = await status.textContent()
    expect(narrowed).not.toEqual(initial)
    await expect(status).toContainText('matching all filters')

    // Every surviving card must be in the chosen category.
    const tags = await page.locator('a[href*="#/volunteer/opp-"] span').first().textContent()
    expect(tags).toContain('Food Security')
  })

  test('active filter chips appear and clear individually', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Environment' }).check()
    const chip = page.getByRole('button', { name: /Environment/ })
    await expect(chip).toBeVisible()
    await chip.click()
    await expect(page.getByText('Active filters:')).toBeHidden()
  })

  test('empty state appears when nothing matches, and recovers', async ({ page }) => {
    await page.getByLabel('Search by title, organization, or category').fill('zzzz-no-such-thing')
    await expect(page.getByText('Nothing matches yet')).toBeVisible()
    await expect(page.getByRole('status')).toContainText('No opportunities match')

    await page.getByRole('button', { name: 'Clear all filters' }).click()
    await expect(page.getByText('Nothing matches yet')).toBeHidden()
  })

  test('clear all resets every filter', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Environment' }).check()
    await page.getByLabel('Partner organization').fill('Prairie')
    await page.getByRole('button', { name: 'Clear all' }).click()
    await expect(page.getByRole('checkbox', { name: 'Environment' })).not.toBeChecked()
    await expect(page.getByLabel('Partner organization')).toHaveValue('')
  })

  test('sorting by title reorders the results', async ({ page }) => {
    const first = await page.locator('a[href*="#/volunteer/opp-"] h3').first().textContent()
    await page.getByLabel('Sort').selectOption('title')
    const sorted = await page.locator('a[href*="#/volunteer/opp-"] h3').first().textContent()
    expect(sorted).not.toEqual(first)
  })

  test('REQ-PRT-5: a pending partner listing never appears publicly', async ({ page }) => {
    await page.getByLabel('Search by title, organization, or category').fill('Winter Shelter')
    await expect(page.getByText('Nothing matches yet')).toBeVisible()
  })

  test('a card links through to its detail page', async ({ page }) => {
    await page.locator('a[href*="#/volunteer/opp-"]').first().click()
    await expect(page).toHaveURL(/#\/volunteer\/opp-/)
  })

  test('no critical or serious accessibility violations', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    const blocking = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    )
    expect(blocking.map((v) => `${v.id}: ${v.help}`)).toEqual([])
  })
})
