import { assert, assertEquals } from "@std/assert";
import {
  apply,
  CAPSTONE,
  type Command,
  ENTRY,
  newGame,
  type Recipe,
  RECIPES,
  type Terrain,
  YIELDS,
} from "./mod.ts";

function reachable(recipes: Recipe[]): Set<string> {
  const have = new Set<string>();

  const enter = (opener: string | null) => {
    for (const terrain of Object.keys(ENTRY) as Terrain[]) {
      if (ENTRY[terrain] === "open" || ENTRY[terrain] === opener) {
        const item = YIELDS[terrain];
        if (item) have.add(item);
      }
    }
  };

  enter(null);
  let changed = true;
  while (changed) {
    changed = false;
    for (const recipe of recipes) {
      if (
        !have.has(recipe.output) &&
        Object.keys(recipe.inputs).every((item) => have.has(item))
      ) {
        have.add(recipe.output);
        enter(recipe.output);
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

Deno.test("the capstone can be reached", () => {
  assert(reachable(RECIPES).has(CAPSTONE));
});

Deno.test("crafting the capstone wins the game", () => {
  const state = newGame(121);
  state.inventory = { lantern: 1, firewood: 1 };
  const events = apply(state, { type: "craft", output: CAPSTONE });
  assert(state.won);
  assert(events.at(-1)?.type === "won");
});

Deno.test("cystal recipes need what opens crystal", () => {
  const noPick = RECIPES.filter((recipe) => recipe.output != "icepick");
  assert(!reachable(noPick).has("lens"), "lens should need the icepick");
});

Deno.test("after the ending, no command changes anything", () => {
  const state = newGame(121);
  state.inventory = { lantern: 1, firewood: 1, wood: 10 };
  apply(state, { type: "craft", output: CAPSTONE });
  const snapshot = JSON.parse(JSON.stringify(state));

  const commands: Command[] = [
    { type: "move", direction: "east" },
    { type: "gather" },
    { type: "craft", output: "torch" },
  ];
  for (const command of commands) {
    assertEquals(apply(state, command), []);
    assertEquals(state, snapshot);
  }
});
