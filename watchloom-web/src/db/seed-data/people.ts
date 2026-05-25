export type SeedPerson = {
  name: string;
  slug: string;
  biography?: string | null;
  birthDate?: string | null;
  photoUrl?: string | null;
};

export type SeedMoviePerson = {
  movieSlug: string;
  personSlug: string;
  role: "director" | "writer" | "actor";
};

export type SeedSeriesPerson = {
  seriesSlug: string;
  personSlug: string;
  role: "creator" | "writer" | "actor";
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const person = (name: string): SeedPerson => ({
  name,
  slug: slugify(name),
  biography: null,
  birthDate: null,
  photoUrl: null,
});

export const seedPeople: SeedPerson[] = [
  person("Christopher Nolan"),
  person("Jonathan Nolan"),
  person("Frank Darabont"),
  person("Tim Robbins"),
  person("Morgan Freeman"),
  person("Tom Hanks"),
  person("Robert Zemeckis"),
  person("Leonardo DiCaprio"),
  person("Christian Bale"),
  person("Heath Ledger"),
  person("Vince Gilligan"),
  person("Bryan Cranston"),
  person("Aaron Paul"),
  person("Anna Gunn"),
  person("David Benioff"),
  person("D. B. Weiss"),
  person("Emilia Clarke"),
  person("Kit Harington"),
  person("Peter Dinklage"),
  person("Peter Gould"),
  person("Bob Odenkirk"),
  person("Rhea Seehorn"),
  person("Jon Favreau"),
  person("Pedro Pascal"),
  person("Tony Gilroy"),
  person("Diego Luna"),
];

export const seedMoviePeople: SeedMoviePerson[] = [
  { movieSlug: "the-shawshank-redemption", personSlug: "frank-darabont", role: "director" },
  { movieSlug: "the-shawshank-redemption", personSlug: "frank-darabont", role: "writer" },
  { movieSlug: "the-shawshank-redemption", personSlug: "tim-robbins", role: "actor" },
  { movieSlug: "the-shawshank-redemption", personSlug: "morgan-freeman", role: "actor" },
  { movieSlug: "the-dark-knight", personSlug: "christopher-nolan", role: "director" },
  { movieSlug: "the-dark-knight", personSlug: "christopher-nolan", role: "writer" },
  { movieSlug: "the-dark-knight", personSlug: "jonathan-nolan", role: "writer" },
  { movieSlug: "the-dark-knight", personSlug: "christian-bale", role: "actor" },
  { movieSlug: "the-dark-knight", personSlug: "heath-ledger", role: "actor" },
  { movieSlug: "inception", personSlug: "christopher-nolan", role: "director" },
  { movieSlug: "inception", personSlug: "christopher-nolan", role: "writer" },
  { movieSlug: "inception", personSlug: "leonardo-dicaprio", role: "actor" },
  { movieSlug: "forrest-gump", personSlug: "robert-zemeckis", role: "director" },
  { movieSlug: "forrest-gump", personSlug: "tom-hanks", role: "actor" },
  { movieSlug: "the-green-mile", personSlug: "frank-darabont", role: "director" },
  { movieSlug: "the-green-mile", personSlug: "frank-darabont", role: "writer" },
  { movieSlug: "the-green-mile", personSlug: "tom-hanks", role: "actor" },
];

export const seedSeriesPeople: SeedSeriesPerson[] = [
  { seriesSlug: "breaking-bad", personSlug: "vince-gilligan", role: "creator" },
  { seriesSlug: "breaking-bad", personSlug: "vince-gilligan", role: "writer" },
  { seriesSlug: "breaking-bad", personSlug: "bryan-cranston", role: "actor" },
  { seriesSlug: "breaking-bad", personSlug: "aaron-paul", role: "actor" },
  { seriesSlug: "breaking-bad", personSlug: "anna-gunn", role: "actor" },
  { seriesSlug: "better-call-saul", personSlug: "vince-gilligan", role: "creator" },
  { seriesSlug: "better-call-saul", personSlug: "peter-gould", role: "creator" },
  { seriesSlug: "better-call-saul", personSlug: "bob-odenkirk", role: "actor" },
  { seriesSlug: "better-call-saul", personSlug: "rhea-seehorn", role: "actor" },
  { seriesSlug: "game-of-thrones", personSlug: "david-benioff", role: "creator" },
  { seriesSlug: "game-of-thrones", personSlug: "d-b-weiss", role: "creator" },
  { seriesSlug: "game-of-thrones", personSlug: "emilia-clarke", role: "actor" },
  { seriesSlug: "game-of-thrones", personSlug: "kit-harington", role: "actor" },
  { seriesSlug: "game-of-thrones", personSlug: "peter-dinklage", role: "actor" },
  { seriesSlug: "the-mandalorian", personSlug: "jon-favreau", role: "creator" },
  { seriesSlug: "the-mandalorian", personSlug: "jon-favreau", role: "writer" },
  { seriesSlug: "the-mandalorian", personSlug: "pedro-pascal", role: "actor" },
  { seriesSlug: "andor", personSlug: "tony-gilroy", role: "creator" },
  { seriesSlug: "andor", personSlug: "tony-gilroy", role: "writer" },
  { seriesSlug: "andor", personSlug: "diego-luna", role: "actor" },
];
