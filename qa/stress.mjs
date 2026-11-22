import { chromium } from '@playwright/test'
const BASE='http://localhost:5173/bcs-prototype/'
// Force a font that is wider than Inter/system-ui on every platform, to
// reproduce what the Linux CI runner does with the fallback stack.
const WIDE = `*, *::before, *::after { font-family: "Courier New", monospace !important; }`
const SCREENS = [['C-03','#/profile','Volunteer'],['V-01','#/volunteer',null],['V-03','#/my-activity','Volunteer'],
                 ['D-01','#/donate',null],['A-02','#/admin/accounts','BCS Staff'],['P-03','#/partner/new-listing','Partner'],
                 ['E-01','#/events',null],['S-01','#/search?q=food',null],['D-03','#/give-items',null],
                 ['A-01','#/admin','BCS Staff'],['A-03','#/admin/reports','BCS Staff'],['P-02','#/partner','Partner'],
                 ['V-02','#/volunteer/opp-2',null],['E-02','#/events/evt-1',null],['P-01','#/partner/apply',null],
                 ['C-01','',null],['C-02','#/login',null]]
const b=await chromium.launch()
for (const stress of [false,true]) {
  const out=[]
  for (const [id,route,role] of SCREENS) {
    const ctx=await b.newContext({viewport:{width:360,height:900}}); const p=await ctx.newPage()
    if (stress) await p.addInitScript(css => {
      document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent=css;document.head.appendChild(s)})
    }, WIDE)
    if (role){ await p.goto(BASE+'#/login'); await p.getByRole('button',{name:role,exact:true}).click() }
    await p.goto(BASE+route); await p.waitForSelector('h1'); await p.waitForTimeout(120)
    const r = await p.evaluate(()=>{
      const dw=document.documentElement.clientWidth
      const over=document.documentElement.scrollWidth-dw
      const worst=[...document.querySelectorAll('*')].map(el=>({e:el,r:el.getBoundingClientRect()}))
        .filter(x=>x.r.right>dw+0.5).sort((a,b)=>b.r.right-a.r.right).slice(0,2)
        .map(x=>`${x.e.tagName}.${(x.e.className||'').toString().split(' ')[0]}(${Math.round(x.r.right)})`)
      return {over, worst}
    })
    out.push(`${id} ${String(r.over).padStart(4)}px ${r.worst.join(' ')}`)
    await ctx.close()
  }
  console.log(`\n--- ${stress?'STRESS (monospace)':'normal font'} @360 ---`)
  out.forEach(l=>console.log('  '+l))
}
await b.close()
