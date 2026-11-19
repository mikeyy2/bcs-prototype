import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/** P4 — C-01 Home (WBS 9.4.1, REQ-COM-1, REQ-COM-2). */

test.describe('P4 home', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./')
  })

  test('the hero renders its headline and both calls to action', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Make a difference in your community',
    )
    await expect(page.getByRole('button', { name: 'Find opportunities' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Donate today' })).toBeVisible()
  })

  test('REQ-COM-2: opportunities, events and both CTAs are featured', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Featured volunteer opportunities' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Upcoming community events' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Give items your neighbors need' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Are you a nonprofit?' })).toBeVisible()
  })

  test('three opportunity cards link through to V-02', async ({ page }) => {
    const cards = page.locator('a[href*="#/volunteer/"]')
    await expect(cards).toHaveCount(3)
    await cards.first().click()
    await expect(page).toHaveURL(/#\/volunteer\/opp-/)
  })

  test('three event rows link through to E-02', async ({ page }) => {
    const rows = page.locator('a[href*="#/events/"]')
    await expect(rows).toHaveCount(3)
    await rows.first().click()
    await expect(page).toHaveURL(/#\/events\/evt-/)
  })

  test('hero buttons navigate', async ({ page }) => {
    await page.getByRole('button', { name: 'Find opportunities' }).click()
    await expect(page).toHaveURL(/#\/volunteer$/)
    await page.goBack()
    await page.getByRole('button', { name: 'Donate today' }).click()
    await expect(page).toHaveURL(/#\/donate$/)
  })

  test('impact figures are derived from the seed, not hardcoded (DATA-1)', async ({ page }) => {
    const stats = page.getByRole('region', { name: 'BCS at a glance' })
    await expect(stats).toContainText('partner organizations')
    // 12 fictional organisations are seeded; the figure must agree.
    await expect(stats).toContainText('12')
  })

  test('photography stays as captioned placeholders', async ({ page }) => {
    await expect(
      page.getByRole('img', { name: 'Volunteers sorting food at a local pantry' }),
    ).toBeVisible()
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

  test('renders without horizontal overflow at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(overflow).toBe(false)
  })
})
