import { assertEquals } from "@std/assert";
import {
  apply,
  type GameState,
  isPassable,
  newGame,
  terrainAt,
} from "./mod.ts";

// Each test has a Given-When-Then shape: https://martinfowler.com/bliki/GivenWhenThen.html
const SEED = 121;

// A state with the player just west of a cell that is, or is not, passable.
// Searching keeps these tests honest if the terrain formula changes.
function besideEasternCell(passable: boolean): GameState {
  for (let x = 2; x < 10_000; x++) {
    const here = isPassable(terrainAt(SEED, x, 0), {});
    const east = isPassable(terrainAt(SEED, x + 1, 0), {});
    if (here && east === passable) {
      const state = newGame(SEED);
      state.player = { x, y: 0 };
      return state;
    }
  }
  throw new Error("Found no suitable cell on this row.");
}

Deno.test("moving onto passable terrain moves the player", () => {
  const state = besideEasternCell(true);
  const { x, y } = state.player;

  const events = apply(state, { type: "move", direction: "east" });

  assertEquals(state.player, { x: x + 1, y });
  assertEquals(events, [{
    type: "moved",
    from: { x, y },
    to: { x: x + 1, y },
  }]);
});

Deno.test("a blocked move changes nothing and reports why", () => {
  const state = besideEasternCell(false);
  const snapshot = JSON.parse(JSON.stringify(state));
  const { x, y } = state.player;
  const target = { x: x + 1, y };

  const events = apply(state, { type: "move", direction: "east" });

  assertEquals(state, snapshot);
  assertEquals(events, [{
    type: "blocked",
    at: { x, y },
    toward: target,
    terrain: terrainAt(SEED, target.x, target.y),
  }]);
});

Deno.test("an event keeps its cells while state moves on", () => {
  const state = besideEasternCell(true);
  const { x, y } = state.player;

  const first = apply(state, { type: "move", direction: "east" });
  const second = apply(state, { type: "move", direction: "west" });
  apply(state, { type: "move", direction: "east" });

  // Both retained events still report the cells from when they happened, even
  // though state.player has since changed.
  assertEquals(first, [{
    type: "moved",
    from: { x, y },
    to: { x: x + 1, y },
  }]);
  assertEquals(second, [{
    type: "moved",
    from: { x: x + 1, y },
    to: { x, y },
  }]);
});

Deno.test("crystal is shut without an icepick and open with one", () => {
  let wall = -1;
  for (let x = 2; x < 10_000; x++) {
    if (
      isPassable(terrainAt(SEED, x, 0), {}) &&
      terrainAt(SEED, x + 1, 0) === "crystal"
    ) {
      wall = x;
      break;
    }
  }
  if (wall < 0) throw new Error("Found no crystal wall on this row.");

  const state = newGame(SEED);
  state.player = { x: wall, y: 0 };

  const blocked = apply(state, { type: "move", direction: "east" });
  assertEquals(blocked[0].type, "blocked");

  state.inventory.icepick = 1;
  const moved = apply(state, { type: "move", direction: "east" });
  assertEquals(moved[0].type, "moved");

  const gathered = apply(state, { type: "gather" });
  assertEquals(gathered[0].type, "gathered");
  assertEquals(state.inventory.crystal, 1);
});
