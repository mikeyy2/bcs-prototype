import { chromium } from '@playwright/test'
const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:1440,height:1000}})).newPage()
const BASE='http://localhost:5173/bcs-prototype/'
await p.goto(BASE+'#/donate'); await p.waitForSelector('h1')
console.log('button initially:', await p.getByRole('button',{name:/^Donate/}).innerText())
await p.getByLabel('Other amount').fill('0.50')
console.log('after typing 0.50:', await p.getByRole('button',{name:/^Donate/}).innerText())
await p.getByLabel('Other amount').fill('')
console.log('after clearing:   ', await p.getByRole('button',{name:/^Donate/}).innerText())
const sel = await p.locator('[aria-pressed="true"]').count()
console.log('presets selected after clearing:', sel)
await b.close()
