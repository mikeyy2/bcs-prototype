import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/** P11 — S-01 Search Results (WBS 8.1.1). */

test.describe('P11 search', () => {
  test('the header search box reaches S-01', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('link', { name: 'Search Opportunities and Events' }).click()
    await expect(page).toHaveURL(/#\/search$/)
    await expect(page.getByText('Search BCS')).toBeVisible()
  })

  test('REQ-SRC-1: one query returns both opportunities and events', async ({ page }) => {
    await page.goto('./#/search?q=food')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('results for “food”')

    const types = await page.locator('a[href*="#/"] >> css=span').allTextContents()
    expect(types.join(' ')).toContain('Opportunity')

    await expect(page.getByRole('button', { name: /^Opportunities \(/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Events \(/ })).toBeVisible()
  })

  test('REQ-SRC-3: results can be narrowed to one type', async ({ page }) => {
    await page.goto('./#/search?q=harvest')
    const all = await page.locator('a[href*="#/events/"], a[href*="#/volunteer/"]').count()

    await page.getByRole('button', { name: /^Events \(/ }).click()
    const eventsOnly = await page.locator('a[href*="#/volunteer/"]').count()
    expect(eventsOnly).toBe(0)
    expect(all).toBeGreaterThan(0)
  })

  test('REQ-SRC-2: unapproved listings never appear', async ({ page }) => {
    await page.goto('./#/search?q=Winter Shelter')
    await expect(page.getByText('No matches')).toBeVisible()
  })

  test('submitting the form updates the query', async ({ page }) => {
    await page.goto('./#/search')
    await page.getByLabel('Search opportunities and events').fill('pantry')
    await page.getByRole('button', { name: 'Search', exact: true }).click()
    await expect(page).toHaveURL(/q=pantry/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('for “pantry”')
  })

  test('a result links through to its detail page', async ({ page }) => {
    await page.goto('./#/search?q=pantry')
    await page.locator('a[href*="#/volunteer/"]').first().click()
    await expect(page).toHaveURL(/#\/volunteer\/opp-/)
  })

  test('the deferred services are named rather than implied', async ({ page }) => {
    await page.goto('./#/search?q=food')
    await expect(page.getByText(/Rental items and shuttle routes/)).toBeVisible()
  })

  test('no critical or serious accessibility violations', async ({ page }) => {
    await page.goto('./#/search?q=food')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    const blocking = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    )
    expect(blocking.map((v) => `${v.id}: ${v.help}`)).toEqual([])
  })
})
