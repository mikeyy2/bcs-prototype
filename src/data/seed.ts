/**
 * Fictional demo data. No real people, accounts, donations or contact details
 * appear here (CLAUDE.md). Organisation names and listing titles follow the
 * copy drawn in the Figma prototype so screens match the design.
 *
 * Dates are stored as day offsets from today and resolved at load, so the
 * calendar and shift lists never go stale.
 */
import type {
  ApprovalItem,
  BcsEvent,
  DropOffSlot,
  Opportunity,
  OpportunityCategory,
  Organization,
  Shift,
} from './types'

export const ORGANIZATIONS: Organization[] = [
  ['org-1', 'Ames Food Pantry', 'Keeps shelves full for neighbours facing food insecurity.', 'Story County', '41-0000101'],
  ['org-2', 'Riverbend Youth Collective', 'After-school tutoring and mentoring for ages 6 to 14.', 'Ames and Nevada', '41-0000102'],
  ['org-3', 'Prairie Trails Alliance', 'Restores and maintains local prairie and trail systems.', 'Story County', '41-0000103'],
  ['org-4', 'Golden Years Companions', 'Friendly visits and meal delivery for older neighbours.', 'Ames', '41-0000104'],
  ['org-5', 'Second Chance Animal Refuge', 'Fosters and rehomes surrendered pets.', 'Story and Boone counties', '41-0000105'],
  ['org-6', 'Cyclone Community Kitchen', 'Hot meals five evenings a week, no questions asked.', 'Ames', '41-0000106'],
  ['org-7', 'Neighbors Build Housing', 'Volunteer home repair for low-income owners.', 'Story County', '41-0000107'],
  ['org-8', 'Little Sprouts Literacy', 'Puts books in the hands of pre-school children.', 'Ames', '41-0000108'],
  ['org-9', 'Skunk River Cleanup Crew', 'Quarterly waterway cleanups and water monitoring.', 'Story County', '41-0000109'],
  ['org-10', 'Warm Coats Collective', 'Collects and distributes winter clothing.', 'Ames and Gilbert', '41-0000110'],
  ['org-11', 'Fresh Start Job Coaching', 'Résumé help and interview practice.', 'Ames', '41-0000111'],
  ['org-12', 'Harvest Share Gardens', 'Community plots growing produce for the pantry.', 'Ames', '41-0000112'],
].map(([id, name, mission, serviceArea, ein]) => ({
  id,
  name,
  mission,
  serviceArea,
  ein,
  contactEmail: `${id}@example.org`,
  verified: true,
}))

type OppTemplate = [string, string, OpportunityCategory, string, string, string[]]

/** First eight titles are the ones drawn in Figma; the rest fill the catalogue. */
const OPPORTUNITY_TEMPLATES: OppTemplate[] = [
  ['Saturday Food Pantry Sorting', 'org-1', 'Food Security', 'Ames', '50010', ['Lifting 20 lbs', 'Teamwork']],
  ['After-School Reading Buddy', 'org-2', 'Youth & Education', 'Ames', '50014', ['Patience', 'Background check']],
  ['Ada Hayden Park Trail Cleanup', 'org-3', 'Environment', 'Ames', '50010', ['Outdoor work']],
  ['Mobile Food Distribution Driver', 'org-1', 'Food Security', 'Nevada', '50201', ['Valid license', 'Lifting 30 lbs']],
  ['Food Rescue Pickup Volunteer', 'org-6', 'Food Security', 'Ames', '50010', ['Valid license']],
  ['Thanksgiving Meal Packing', 'org-6', 'Food Security', 'Ames', '50010', ['Teamwork']],
  ['Senior Meal Delivery', 'org-4', 'Seniors', 'Ames', '50014', ['Valid license', 'Friendly manner']],
  ['Community Garden Harvest Helper', 'org-12', 'Environment', 'Ames', '50010', ['Outdoor work']],
  ['Pantry Shelf Restocking', 'org-1', 'Food Security', 'Ames', '50010', ['Lifting 20 lbs']],
  ['Homework Club Mentor', 'org-2', 'Youth & Education', 'Ames', '50014', ['Patience']],
  ['Prairie Seed Collecting', 'org-3', 'Environment', 'Gilbert', '50105', ['Outdoor work']],
  ['Companion Phone Calls', 'org-4', 'Seniors', 'Ames', '50014', ['Friendly manner']],
  ['Dog Walking Shift', 'org-5', 'Animal Welfare', 'Ames', '50010', ['Comfortable with dogs']],
  ['Cat Socialisation Hour', 'org-5', 'Animal Welfare', 'Boone', '50036', ['Comfortable with cats']],
  ['Evening Meal Service', 'org-6', 'Food Security', 'Ames', '50010', ['Food handling']],
  ['Porch Ramp Build Day', 'org-7', 'Community Events', 'Ames', '50014', ['Power tools', 'Lifting 30 lbs']],
  ['Storytime Reader', 'org-8', 'Youth & Education', 'Ames', '50010', ['Reading aloud']],
  ['Book Drive Sorting', 'org-8', 'Youth & Education', 'Ames', '50010', ['Organised']],
  ['Riverbank Litter Sweep', 'org-9', 'Environment', 'Ames', '50010', ['Outdoor work']],
  ['Water Sample Collection', 'org-9', 'Environment', 'Nevada', '50201', ['Attention to detail']],
  ['Coat Sorting and Sizing', 'org-10', 'Community Events', 'Ames', '50014', ['Organised']],
  ['Coat Distribution Desk', 'org-10', 'Community Events', 'Gilbert', '50105', ['Friendly manner']],
  ['Mock Interview Partner', 'org-11', 'Community Events', 'Ames', '50010', ['Interview experience']],
  ['Résumé Review Desk', 'org-11', 'Community Events', 'Ames', '50010', ['Writing']],
  ['Garden Bed Preparation', 'org-12', 'Environment', 'Ames', '50010', ['Outdoor work']],
  ['Produce Washing and Packing', 'org-12', 'Food Security', 'Ames', '50010', ['Food handling']],
  ['Weekend Pantry Greeter', 'org-1', 'Food Security', 'Ames', '50010', ['Friendly manner']],
  ['Math Tutor, Grades 5 to 8', 'org-2', 'Youth & Education', 'Ames', '50014', ['Maths', 'Background check']],
  ['Trail Sign Repair', 'org-3', 'Environment', 'Ames', '50010', ['Hand tools']],
  ['Grocery Shopping Buddy', 'org-4', 'Seniors', 'Ames', '50014', ['Valid license']],
  ['Kennel Cleaning Crew', 'org-5', 'Animal Welfare', 'Ames', '50010', ['Comfortable with dogs']],
  ['Adoption Event Helper', 'org-5', 'Animal Welfare', 'Ames', '50010', ['Friendly manner']],
  ['Dish Room Support', 'org-6', 'Food Security', 'Ames', '50010', ['Standing for 3 hours']],
  ['Winter Weatherisation Visit', 'org-7', 'Seniors', 'Nevada', '50201', ['Hand tools']],
  ['Paint Crew, Accessibility Ramp', 'org-7', 'Community Events', 'Ames', '50014', ['Painting']],
  ['Bilingual Storytime Reader', 'org-8', 'Youth & Education', 'Ames', '50010', ['Spanish', 'Reading aloud']],
  ['Creek Monitoring Walk', 'org-9', 'Environment', 'Gilbert', '50105', ['Outdoor work']],
  ['Donation Intake Desk', 'org-10', 'Community Events', 'Ames', '50014', ['Organised']],
  ['Job Fair Setup Crew', 'org-11', 'Community Events', 'Ames', '50010', ['Lifting 20 lbs']],
  ['Seed Library Cataloguing', 'org-12', 'Environment', 'Ames', '50010', ['Attention to detail']],
  ['Holiday Basket Assembly', 'org-1', 'Food Security', 'Ames', '50010', ['Teamwork']],
  ['Science Club Assistant', 'org-2', 'Youth & Education', 'Ames', '50014', ['Background check']],
  ['Invasive Species Removal', 'org-3', 'Environment', 'Ames', '50010', ['Outdoor work', 'Hand tools']],
  ['Technology Help Desk for Seniors', 'org-4', 'Seniors', 'Ames', '50014', ['Patience', 'Basic IT']],
  ['Foster Transport Driver', 'org-5', 'Animal Welfare', 'Ames', '50010', ['Valid license']],
  ['Weekend Breakfast Service', 'org-6', 'Food Security', 'Ames', '50010', ['Food handling']],
  ['Gutter Clearing Team', 'org-7', 'Seniors', 'Ames', '50014', ['Comfortable on ladders']],
  ['Little Free Library Restock', 'org-8', 'Youth & Education', 'Gilbert', '50105', ['Organised']],
]

const SUMMARY = (title: string, org: string) =>
  `Join ${org} for ${title.toLowerCase()}. Shifts are posted a few weeks ahead and new volunteers are always welcome.`

const DESCRIPTION = (title: string, org: string) =>
  `${org} runs ${title.toLowerCase()} as part of its regular programme. A staff member meets you at the door, ` +
  `shows you where everything lives and stays nearby for the whole shift. No experience is needed unless the ` +
  `skills below say otherwise, and you can sign up for a single shift without committing to anything further.`

function shiftsFor(index: number): Shift[] {
  const count = (index % 3) + 1
  return Array.from({ length: count }, (_, i) => {
    const capacity = 8 + ((index + i * 3) % 10)
    // Every seventh listing has a full first shift so the Full state is visible.
    const full = index % 7 === 0 && i === 0
    return {
      id: `opp-${index + 1}-shift-${i + 1}`,
      dayOffset: 3 + ((index * 2 + i * 5) % 26),
      startHour: 9 + ((index + i) % 7),
      endHour: 12 + ((index + i) % 7),
      capacity,
      taken: full ? capacity : (index + i * 2) % Math.max(1, capacity - 2),
    }
  })
}

export const OPPORTUNITIES: Opportunity[] = OPPORTUNITY_TEMPLATES.map((t, index) => {
  const [title, organizationId, category, city, zip, skills] = t
  const org = ORGANIZATIONS.find((o) => o.id === organizationId)!
  return {
    id: `opp-${index + 1}`,
    title,
    organizationId,
    category,
    city,
    zip,
    skills,
    summary: SUMMARY(title, org.name),
    description: DESCRIPTION(title, org.name),
    shifts: shiftsFor(index),
    status: 'published' as const,
  }
})

/** One partner listing left awaiting approval so REQ-PRT-5 is demonstrable. */
OPPORTUNITIES.push({
  id: 'opp-pending-1',
  title: 'Winter Shelter Overnight Host',
  organizationId: 'org-6',
  category: 'Community Events',
  city: 'Ames',
  zip: '50010',
  skills: ['Overnight availability'],
  summary: SUMMARY('Winter Shelter Overnight Host', 'Cyclone Community Kitchen'),
  description: DESCRIPTION('Winter Shelter Overnight Host', 'Cyclone Community Kitchen'),
  shifts: [
    {
      id: 'opp-pending-1-shift-1',
      dayOffset: 20,
      startHour: 20,
      endHour: 23,
      capacity: 4,
      taken: 0,
    },
  ],
  status: 'pending',
})

type EventTemplate = [string, BcsEvent['category'], string | null, number, number, number, string, number, boolean]

const EVENT_TEMPLATES: EventTemplate[] = [
  ['Community Harvest Dinner', 'celebration', 'org-12', 4, 17, 20, 'Great Hall', 120, true],
  ['Winter Coat Drive Kickoff', 'fundraiser', 'org-10', 7, 10, 14, 'Great Hall', 80, false],
  ['Holiday Gift Wrapping Night', 'celebration', null, 11, 18, 21, 'Garden Room', 40, false],
  ['Pantry Open House', 'partner event', 'org-1', 2, 13, 16, 'Garden Room', 60, false],
  ['Budget Basics Workshop', 'community meeting', 'org-11', 9, 18, 20, 'Meeting Room A', 30, false],
  ['Thanksgiving Food Drive', 'fundraiser', 'org-6', 14, 9, 15, 'Great Hall', 150, true],
  ['Family Craft Day', 'celebration', 'org-8', 16, 10, 13, 'Garden Room', 50, false],
  ['Neighbourhood Safety Meeting', 'community meeting', null, 5, 19, 21, 'Meeting Room A', 35, false],
  ['Volunteer Appreciation Evening', 'celebration', null, 21, 18, 21, 'Great Hall', 100, false],
  ['Memorial Service for Pat Alvarez', 'memorial service', null, 6, 14, 16, 'Chapel Room', 70, false],
  ['Spring Planting Information Night', 'community meeting', 'org-12', 24, 18, 20, 'Meeting Room A', 30, false],
  ['Shelter Fundraising Breakfast', 'fundraiser', 'org-5', 18, 8, 11, 'Great Hall', 90, true],
  ['Literacy Night', 'partner event', 'org-8', 12, 17, 19, 'Garden Room', 45, false],
  ['Trail Stewardship Briefing', 'partner event', 'org-3', 27, 17, 19, 'Meeting Room A', 25, false],
]

export const EVENTS: BcsEvent[] = EVENT_TEMPLATES.map((t, index) => {
  const [title, category, organizationId, dayOffset, startHour, endHour, space, capacity, shuttle] = t
  // "Holiday Gift Wrapping Night · Full" is drawn as full in Figma (E-01).
  const full = title === 'Holiday Gift Wrapping Night'
  return {
    id: `evt-${index + 1}`,
    title,
    category,
    organizationId,
    dayOffset,
    startHour,
    endHour,
    space,
    capacity,
    taken: full ? capacity : Math.floor(capacity * (0.2 + (index % 5) * 0.12)),
    guestLimit: category === 'memorial service' ? 0 : 2,
    summary: `${title} in the ${space} at the BCS building. Everyone is welcome.`,
    description:
      `${title} runs in the ${space}. Doors open fifteen minutes beforehand, seating is unreserved, ` +
      `and a BCS host is on hand throughout. Let us know when you RSVP if you need anything to take part.`,
    accessibility:
      'Step-free entrance, accessible toilets, reserved seating near the front and a hearing loop in the main rooms.',
    shuttle,
    status: 'published' as const,
  }
})

export const DROP_OFF_SLOTS: DropOffSlot[] = Array.from({ length: 12 }, (_, i) => ({
  id: `slot-${i + 1}`,
  dayOffset: 2 + Math.floor(i / 3),
  startHour: 9 + (i % 3) * 3,
  // A couple are pre-booked so "Booked (cannot be selected)" from D-03 is visible.
  booked: i === 1 || i === 6,
}))

export const APPROVAL_ITEMS: ApprovalItem[] = [
  {
    id: 'apr-1',
    kind: 'listing',
    title: 'Winter Shelter Overnight Host',
    organizationName: 'Cyclone Community Kitchen',
    submittedDayOffset: -1,
    status: 'pending',
    rejectionReason: null,
  },
  {
    id: 'apr-2',
    kind: 'partner application',
    title: 'Story County Bike Library',
    organizationName: 'Story County Bike Library',
    submittedDayOffset: -2,
    status: 'pending',
    rejectionReason: null,
  },
  {
    id: 'apr-3',
    kind: 'profile edit',
    title: 'Updated mission statement',
    organizationName: 'Prairie Trails Alliance',
    submittedDayOffset: -3,
    status: 'pending',
    rejectionReason: null,
  },
]

/**
 * Historical totals printed on C-01. These two have no seed basis — they are
 * the figures drawn in Figma, kept as illustrative copy (DEVIATION DATA-1).
 */
export const YEAR_TO_DATE = {
  volunteerHours: 12480,
  donatedCents: 21_400_000,
}

/** The signed-in demo member. Invented; not a real person. */
export const DEMO_PROFILE = {
  name: 'Jordan Diaz',
  email: 'jordan.diaz@example.com',
  phone: '(515) 555-0142',
  address: '18 Maple Court, Ames, IA 50010',
  skills: 'Lifting 20 lbs, Food handling, Spanish',
  availability: 'Weekday evenings and Saturday mornings',
  deleted: false,
}
