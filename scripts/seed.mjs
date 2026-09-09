// Idempotent seed script for the `cafes` and `sips` tables.
//
// Cafe/sip ids are derived deterministically from their slug (and, for
// sips, the visit date) rather than randomUUID(), so re-running this
// script upserts the same rows instead of creating duplicates on every
// run — `ON CONFLICT (id) DO UPDATE` then keeps the row's content fresh.
//
// This is demo/seed data: cafe names, addresses, and write-ups are
// invented for a realistic-looking Chicago cappuccino journal, not real
// businesses.
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to seed the database.");
}
const sql = postgres(process.env.DATABASE_URL, { prepare: false });

/** Same rounding rule as computeOverall() in src/lib/ratings.ts. */
function overallOf(taste, atmosphere, foam, cost) {
  return Math.round(((taste + atmosphere + foam + cost) / 4) * 100) / 100;
}

const cafes = [
  {
    slug: "cero-coffee-co",
    name: "Cero Coffee Co.",
    neighborhood: "Wicker Park",
    address: "1543 N Milwaukee Ave, Chicago, IL",
    lat: 41.9095,
    lng: -87.6712,
    website: "https://cerocoffee.com",
    instagram: "@cerocoffeeco",
  },
  {
    slug: "logan-square-roasting-house",
    name: "Logan Square Roasting House",
    neighborhood: "Logan Square",
    address: "2557 N Milwaukee Ave, Chicago, IL",
    lat: 41.9276,
    lng: -87.7071,
    website: "https://loganroastinghouse.com",
    instagram: "@loganroastinghouse",
  },
  {
    slug: "west-loop-espresso-bar",
    name: "West Loop Espresso Bar",
    neighborhood: "West Loop",
    address: "900 W Randolph St, Chicago, IL",
    lat: 41.8846,
    lng: -87.6489,
    website: "https://westloopespresso.com",
    instagram: "@westloopespresso",
  },
  {
    slug: "pilsen-coffee-collective",
    name: "Pilsen Coffee Collective",
    neighborhood: "Pilsen",
    address: "1801 S Allport St, Chicago, IL",
    lat: 41.8565,
    lng: -87.6564,
    website: "https://pilsencoffeecollective.com",
    instagram: "@pilsencoffeecollective",
  },
  {
    slug: "lincoln-park-cortado-co",
    name: "Lincoln Park Cortado Co.",
    neighborhood: "Lincoln Park",
    address: "2200 N Halsted St, Chicago, IL",
    lat: 41.9236,
    lng: -87.6485,
    website: "https://lpcortado.com",
    instagram: "@lpcortadoco",
  },
  {
    slug: "ukrainian-village-coffee-lab",
    name: "Ukrainian Village Coffee Lab",
    neighborhood: "Ukrainian Village",
    address: "2101 W Chicago Ave, Chicago, IL",
    lat: 41.8958,
    lng: -87.6819,
    website: "https://uvcoffeelab.com",
    instagram: "@uvcoffeelab",
  },
  {
    slug: "andersonville-milk-and-bean",
    name: "Andersonville Milk & Bean",
    neighborhood: "Andersonville",
    address: "5201 N Clark St, Chicago, IL",
    lat: 41.9774,
    lng: -87.669,
    website: "https://milkandbeanchicago.com",
    instagram: "@milkandbeanchi",
  },
  {
    slug: "bridgeport-brew-bar",
    name: "Bridgeport Brew Bar",
    neighborhood: "Bridgeport",
    address: "3201 S Halsted St, Chicago, IL",
    lat: 41.8354,
    lng: -87.6467,
    website: "https://bridgeportbrewbar.com",
    instagram: "@bridgeportbrewbar",
  },
];

const sipsByCafeSlug = {
  "cero-coffee-co": [
    {
      visitDate: "2025-01-11",
      title: "A Wicker Park standby that never disappoints",
      body: "The **cappuccino** here is textbook: tight microfoam, a short pull\nof espresso underneath, and just enough heat to open it up without\nscalding the milk. Counter seating along the front window is the move\nfor people-watching on Milwaukee Ave.\n",
      taste: 2,
      atmosphere: 1,
      foam: 2,
      cost: 0,
      priceLabel: "$5.25",
      tags: ["oat milk", "counter seating", "wifi"],
    },
    {
      visitDate: "2025-04-02",
      title: "Springtime revisit — still solid",
      body: "Back a few months later and the consistency holds up. Slightly\nsweeter foam this time, maybe a house-blend swap. Gets loud after 9am\nas the laptop crowd fills in.\n",
      taste: 1,
      atmosphere: 0,
      foam: 1,
      cost: 0,
      priceLabel: "$5.50",
      tags: ["oat milk", "laptop-friendly", "gets loud"],
    },
  ],
  "logan-square-roasting-house": [
    {
      visitDate: "2025-02-08",
      title: "Roasts their own, and it shows",
      body: "This is a roastery first, cafe second, and the cappuccino benefits\nfrom it — bright, fruit-forward beans that cut through the milk\ninstead of disappearing into it. Foam was a touch loose but the flavor\ncarried it.\n",
      taste: 2,
      atmosphere: 2,
      foam: 0,
      cost: 1,
      priceLabel: "$4.75",
      tags: ["single origin", "quiet", "natural light"],
    },
  ],
  "west-loop-espresso-bar": [
    {
      visitDate: "2025-03-14",
      title: "Fast, polished, a little pricey",
      body: "Sleek bar, dialed-in machine, and a barista who clearly cares about\nlatte art. The cappuccino was well balanced but the $6.50 price tag is\nsteep for the size. Good if you're already in the neighborhood for a\nmeeting.\n",
      taste: 1,
      atmosphere: 1,
      foam: 1,
      cost: -1,
      priceLabel: "$6.50",
      tags: ["wifi", "counter seating", "meetings"],
    },
  ],
  "pilsen-coffee-collective": [
    {
      visitDate: "2025-01-25",
      title: "Community-run, worth the trip",
      body: "A worker-owned spot with a rotating guest roaster program. This\nweek's cappuccino used a Mexican light roast that paired beautifully\nwith the milk — nutty, not bitter. Cash-friendly pricing too.\n",
      taste: 2,
      atmosphere: 2,
      foam: 1,
      cost: 2,
      priceLabel: "$4.50",
      tags: ["oat milk", "quiet", "local roaster"],
    },
    {
      visitDate: "2025-05-19",
      title: "Foam fell flat this visit",
      body: "Same great atmosphere and value, but the foam was thin and\ndeflated fast — might have been an off-day for the steam wand. Still a\nneighborhood favorite for the write-up nook in the back.\n",
      taste: 1,
      atmosphere: 2,
      foam: -1,
      cost: 2,
      priceLabel: "$4.50",
      tags: ["quiet", "counter seating"],
    },
  ],
  "lincoln-park-cortado-co": [
    {
      visitDate: "2025-02-22",
      title: "More cortado bar than cappuccino bar, but they deliver",
      body: "Menu leans hard into cortados, but I asked for a cappuccino and it\ndidn't disappoint — dense, sweet foam and a well-pulled shot. Small\nspace, so it fills up fast on weekends.\n",
      taste: 1,
      atmosphere: 0,
      foam: 2,
      cost: 0,
      priceLabel: "$5.00",
      tags: ["small space", "weekend crowds", "oat milk"],
    },
  ],
  "ukrainian-village-coffee-lab": [
    {
      visitDate: "2025-03-30",
      title: "Lab by name, precise by nature",
      body: "They weigh every shot and it shows in the consistency. The\ncappuccino was clean and balanced, foam textured like velvet. No wifi\npassword given out after 11am on purpose — they want conversation, not\nlaptops.\n",
      taste: 2,
      atmosphere: 1,
      foam: 2,
      cost: 0,
      priceLabel: "$5.25",
      tags: ["no wifi after 11am", "quiet", "third wave"],
    },
  ],
  "andersonville-milk-and-bean": [
    {
      visitDate: "2025-04-18",
      title: "A cozy stop on Clark Street",
      body: "Warm, plant-filled space with mismatched armchairs. The cappuccino\nwas good but not spectacular — slightly over-steamed milk masked some\nof the espresso's flavor. Great spot to sit and read for an hour\nthough.\n",
      taste: 0,
      atmosphere: 2,
      foam: 0,
      cost: 1,
      priceLabel: "$4.95",
      tags: ["cozy", "reading nook", "plants"],
    },
  ],
  "bridgeport-brew-bar": [
    {
      visitDate: "2025-05-03",
      title: "Neighborhood gem, no frills",
      body: "Small counter-service spot near the park. Cappuccino was solid and\nhonest — nothing fancy, just a well-made drink at a fair price. Good\ncounter seating if you don't mind the espresso machine noise.\n",
      taste: 1,
      atmosphere: 0,
      foam: 1,
      cost: 2,
      priceLabel: "$4.25",
      tags: ["counter seating", "no frills"],
    },
  ],
};

let cafeCount = 0;
let sipCount = 0;

for (const cafe of cafes) {
  const id = `cafe_${cafe.slug}`;
  await sql`
    INSERT INTO cafes (id, slug, name, neighborhood, address, lat, lng, website, instagram)
    VALUES (${id}, ${cafe.slug}, ${cafe.name}, ${cafe.neighborhood}, ${cafe.address}, ${cafe.lat}, ${cafe.lng}, ${cafe.website}, ${cafe.instagram})
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      neighborhood = EXCLUDED.neighborhood,
      address = EXCLUDED.address,
      lat = EXCLUDED.lat,
      lng = EXCLUDED.lng,
      website = EXCLUDED.website,
      instagram = EXCLUDED.instagram
  `;
  cafeCount += 1;

  const sipsForCafe = sipsByCafeSlug[cafe.slug] ?? [];
  for (const sip of sipsForCafe) {
    const sipId = `sip_${cafe.slug}_${sip.visitDate}`;
    const overall = overallOf(sip.taste, sip.atmosphere, sip.foam, sip.cost);
    await sql`
      INSERT INTO sips (
        id, cafe_id, title, body, visit_date,
        taste, atmosphere, foam, cost, overall,
        photos, tags, price_label, published
      )
      VALUES (
        ${sipId}, ${id}, ${sip.title}, ${sip.body}, ${sip.visitDate},
        ${sip.taste}, ${sip.atmosphere}, ${sip.foam}, ${sip.cost}, ${overall},
        '[]'::jsonb, ${sql.array(sip.tags)}, ${sip.priceLabel}, true
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        body = EXCLUDED.body,
        visit_date = EXCLUDED.visit_date,
        taste = EXCLUDED.taste,
        atmosphere = EXCLUDED.atmosphere,
        foam = EXCLUDED.foam,
        cost = EXCLUDED.cost,
        overall = EXCLUDED.overall,
        tags = EXCLUDED.tags,
        price_label = EXCLUDED.price_label,
        updated_at = now()
    `;
    sipCount += 1;
  }
}

await sql.end();
console.log(`Seeded ${cafeCount} Chicago cafes and ${sipCount} sips.`);
