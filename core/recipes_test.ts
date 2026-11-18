import { assert, assertEquals } from "@std/assert";
import { apply, newGame, RECIPES, YIELDS } from "./mod.ts";

const SEED = 121;
const torch = RECIPES.find((recipe) => recipe.output === "torch")!;

Deno.test("crafting spends the inputs and adds the output", () => {
  const state = newGame(SEED);
  state.inventory = { ...torch.inputs };

  const events = apply(state, { type: "craft", output: "torch" });

  assertEquals(state.inventory, { torch: 1 });
  assertEquals(events[0].type, "crafted");
});

Deno.test("a failed craft changes nothing and says what is missing", () => {
  const state = newGame(SEED);
  const snapshot = JSON.parse(JSON.stringify(state));

  const events = apply(state, { type: "craft", output: "torch" });

  assertEquals(state, snapshot);
  assertEquals(events, [{
    type: "craftFailed",
    output: "torch",
    missing: torch.inputs,
  }]);
});

// A content test: it checks the game's data, not its code.
Deno.test("every recipe input can be gathered or crafted", () => {
  const sources = new Set<string>();
  for (const item of Object.values(YIELDS)) {
    if (typeof item === "string") sources.add(item);
  }
  for (const recipe of RECIPES) sources.add(recipe.output);

  for (const recipe of RECIPES) {
    for (const item of Object.keys(recipe.inputs)) {
      assert(
        sources.has(item),
        `${recipe.name} needs ${item}, which nothing provides`,
      );
    }
  }
});
