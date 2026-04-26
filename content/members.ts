export type Member = {
  slug: string;
  name: string;
  role: string;
  photo: string;
  index: string;
};

// Bios are intentionally absent. Existing site lists only name + role per member.
// Flagged in the direction-review summary as a proposed addition.
export const members: Member[] = [
  {
    slug: "kyle-mixon",
    name: "Kyle Mixon",
    role: "Founder & Producer",
    photo: "/images/members/kyle.png",
    index: "01",
  },
  {
    slug: "joseph-humphrey",
    name: "Joseph Humphrey",
    role: "Media & Production",
    photo: "/images/members/joseph.jpg",
    index: "02",
  },
  {
    slug: "brendan-meeks",
    name: "Brendan Meeks",
    role: "Creative Director",
    photo: "/images/members/brendan.png",
    index: "03",
  },
  {
    slug: "samuel-tweed",
    name: "Samuel Tweed",
    role: "Stage Manager",
    photo: "/images/members/sam.png",
    index: "04",
  },
  {
    slug: "garrett-iverson",
    name: "Garrett Iverson",
    role: "Photographer",
    photo: "/images/members/garrett-iverson.jpg",
    index: "05",
  },
];

export const pillars = [
  {
    title: "Production & Ops",
    body: "Producers, bookers, and stage managers who keep tours, residencies, and monthly showcases running smoothly.",
  },
  {
    title: "Media Team",
    body: "Cinematographers, editors, and photographers crafting specials, podcast visuals, and crisp headshots for every comic.",
  },
  {
    title: "Community & Partners",
    body: "Venue partners, sponsors, and collaborators who help us elevate Pacific Northwest comedy together.",
  },
  {
    title: "Creative Lab",
    body: "Writers and creative directors shaping new formats, themed shows, and social content that keeps audiences engaged.",
  },
];

export const aboutCopy = {
  heading: "About the Team",
  subhead:
    "Stoned Goose Productions is a crew of producers, performers, and media pros building cinematic comedy experiences across the Pacific Northwest.",
  crewHeading: "Meet the Crew",
  crewSubhead: "Faces behind the productions.",
};
