import { assert, assertEquals } from "@std/assert";
import { apply, type GameEvent, newGame } from "./mod.ts";
import { FINISH } from "./finish_fixture.ts";

function play() {
  const state = newGame(121);
  const events: GameEvent[] = [];
  for (const command of FINISH) {
    events.push(...apply(state, command));
  }
  return { state, events };
}

Deno.test("the recording finishes the game", () => {
  const { state, events } = play();
  assert(state.won);
  assert(events.at(-1)?.type === "won");
});

Deno.test("replaying gives identical state and events", () => {
  const first = play();
  const second = play();
  assertEquals(first, second);
});
