// The rules of the game. There is no clock here: a command updates the state at
// once, and the events it returns are a record of what happened. Whoever called
// apply() decides how, or whether, to show them over time.

import { isPassable, type Terrain, terrainAt, YIELDS } from "./terrain.ts";
import { type Recipe, RECIPES } from "./recipes.ts";

export type Cell = { x: number; y: number };

export type Direction = "north" | "south" | "east" | "west";

// Plain data that survives JSON. Terrain is absent because the seed can recompute
// it: besides the seed, only what the player has caused belongs here.
export type GameState = {
  seed: number;
  player: Cell;
  inventory: Record<string, number>;
  //cells already gathered from, keyed "x,y". Only changed cells are stored
  gathered: Record<string, boolean>;
};

// Command: https://gameprogrammingpatterns.com/command.html
export type Command =
  | { type: "move"; direction: Direction }
  | { type: "gather" }
  | { type: "craft"; output: string };

// Domain Event: https://martinfowler.com/eaaDev/DomainEvent.html
export type GameEvent =
  | { type: "moved"; from: Cell; to: Cell }
  | { type: "blocked"; at: Cell; toward: Cell; terrain: Terrain }
  | {
    type: "gathered";
    at: Cell;
    item: string;
    inventory: Record<string, number>;
  }
  | { type: "gatherFailed"; at: Cell }
  | { type: "crafted"; output: string; inventory: Record<string, number> }
  | { type: "craftFailed"; output: string; missing: Record<string, number> };

const STEPS: Record<Direction, Cell> = {
  north: { x: 0, y: -1 },
  south: { x: 0, y: 1 },
  east: { x: 1, y: 0 },
  west: { x: -1, y: 0 },
};

// Singleton, avoided on purpose: tests make as many games as they need. https://gameprogrammingpatterns.com/singleton.html
export function newGame(seed: number): GameState {
  return { seed, player: { x: 0, y: 0 }, inventory: {}, gathered: {} };
}

// The single way in. It updates the state it is given and returns the events.
export function apply(state: GameState, command: Command): GameEvent[] {
  switch (command.type) {
    case "move":
      return move(state, command.direction);
    case "gather":
      return gather(state);
    case "craft":
      return craft(state, command.output);
  }
}

function cellKey(cell: Cell): string {
  return `${cell.x},${cell.y}`;
}

//what can be gathered here now: the terrian's yield, unless already taken.
export function yeildAt(state: GameState, cell: Cell): string | null {
  if (state.gathered[cellKey(cell)]) return null;
  return YIELDS[terrainAt(state.seed, cell.x, cell.y)];
}

function move(state: GameState, direction: Direction): GameEvent[] {
  const step = STEPS[direction];
  // Events are retained and played back later, while state keeps changing. So an
  // event gets cells of its own, never an object that state still holds.
  // Aliasing Bug: https://martinfowler.com/bliki/AliasingBug.html
  // Cells in events act as a Value Object: https://martinfowler.com/bliki/ValueObject.html
  const from = { ...state.player };
  const to = { x: from.x + step.x, y: from.y + step.y };
  const terrain = terrainAt(state.seed, to.x, to.y);
  if (!isPassable(terrain, state.inventory)) {
    return [{ type: "blocked", at: from, toward: to, terrain }];
  }
  state.player.x = to.x;
  state.player.y = to.y;
  return [{ type: "moved", from, to }];
}

function gather(state: GameState): GameEvent[] {
  const at = { ...state.player };
  const item = yeildAt(state, at);
  if (!item) return [{ type: "gatherFailed", at }];
  state.inventory[item] = (state.inventory[item] ?? 0) + 1;
  state.gathered[cellKey(at)] = true;
  return [{ type: "gathered", at, item, inventory: { ...state.inventory } }];
}

//what is still missing for recipe. empty means ready
export function missingFor(
  state: GameState,
  recipe: Recipe,
): Record<string, number> {
  const missing: Record<string, number> = {};
  for (const [item, need] of Object.entries(recipe.inputs)) {
    const have = state.inventory[item] ?? 0;
    if (have < need) missing[item] = need - have;
  }
  return missing;
}

function craft(state: GameState, output: string): GameEvent[] {
  const recipe = RECIPES.find((row) => row.output === output);
  if (!recipe) return [{ type: "craftFailed", output, missing: {} }];
  const missing = missingFor(state, recipe);
  if (Object.keys(missing).length > 0) {
    return [{ type: "craftFailed", output, missing }];
  }
  for (const [item, need] of Object.entries(recipe.inputs)) {
    state.inventory[item] -= need;
    if (state.inventory[item] === 0) delete state.inventory[item];
  }
  state.inventory[output] = (state.inventory[output] ?? 0) + 1;
  return [{ type: "crafted", output, inventory: { ...state.inventory } }];
}
