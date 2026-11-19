import { assert } from "@std/assert";
import { type Recipe, RECIPES, YIELDS } from "./mod.ts";

function reachable(recipes: Recipe[]): Set<string> {
  const have = new Set<string>();
  for (const item of Object.values(YIELDS)) {
    if (item) have.add(item);
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (const recipe of recipes) {
      if (
        !have.has(recipe.output) &&
        Object.keys(recipe.inputs).every((item) => have.has(item))
      ) {
        have.add(recipe.output);
        changed = true;
      }
    }
  }
  return have;
}

Deno.test("every recipe can be reached", () => {
  const have = reachable(RECIPES);
  for (const recipe of RECIPES) {
    assert(have.has(recipe.output), `${recipe.name} can never be made`);
  }
});

Deno.test("a recipe that needs its own output is unreachable", () => {
  const mirror: Recipe = {
    name: "Mirror",
    inputs: { mirror: 1 },
    output: "mirror",
  };
  const have = reachable([...RECIPES, mirror]);
  assert(!have.has("mirror"), "mirror should be unreachable");
});
