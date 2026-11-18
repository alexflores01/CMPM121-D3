import { assertEquals } from "@std/assert";
import {
  apply,
  type GameState,
  isPassable,
  newGame,
  terrainAt,
  YIELDS,
} from "./mod.ts";

const SEED = 121;

// a new game with the player on a passable cell that yields 'item'.
function standingOn(item: string | null): GameState {
  for (let y = 0; y < 200; y++) {
    for (let x = 0; x < 200; x++) {
      const terrain = terrainAt(SEED, x, y);
      if (isPassable(terrain) && YIELDS[terrain] === item) {
        const state = newGame(SEED);
        state.player = { x, y };
        return state;
      }
    }
  }
  throw new Error("Found no suitable cell.");
}

Deno.test("gathering twice gives nothing the second time", () => {
  const state = standingOn("wood");
  const { x, y } = state.player;

  const first = apply(state, { type: "gather" });
  const second = apply(state, { type: "gather" });

  assertEquals(first, [{ type: "gathered", at: { x, y }, item: "wood" }]);
  assertEquals(second, [{ type: "gatherFailed", at: { x, y } }]);
  assertEquals(state.inventory, { wood: 1 });
});

Deno.test("a failed gather changes nothing", () => {
  const state = standingOn(null);
  const snapshot = JSON.parse(JSON.stringify(state));
  const { x, y } = state.player;

  const events = apply(state, { type: "gather" });

  assertEquals(state, snapshot);
  assertEquals(events, [{ type: "gatherFailed", at: { x, y } }]);
});

Deno.test("saved state holds only the cells that changed", () => {
  const state = standingOn("wood");
  const { x, y } = state.player;

  apply(state, { type: "gather" });

  assertEquals(state.gathered, { [`${x},${y}`]: true });
});
