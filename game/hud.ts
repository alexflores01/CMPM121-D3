import {
  ENTRY,
  type GameEvent,
  type GameState,
  terrainAt,
} from "../core/mod.ts";

function element(id: string): HTMLElement {
  return document.getElementById(id)!;
}

function describe(event: GameEvent): string {
  switch (event.type) {
    case "moved":
      return `moved to ${event.to.x}, ${event.to.y}`;
    case "blocked": {
      const entry = ENTRY[event.terrain];
      const need = entry === "closed" ? "" : ` (needs ${entry})`;
      return `blocked by ${event.terrain} at ${event.toward.x}, ${event.toward.y}${need}`;
    }
    case "gathered":
      return `gathered ${event.item}`;
    case "gatherFailed":
      return "nothing to gather here";
    case "crafted":
      return `crafted ${event.output}`;
    case "craftFailed": {
      const list = Object.entries(event.missing)
        .map(([item, count]) => `${count} ${item}`)
        .join(", ");
      return `can't make ${event.output}: missing ${list}`;
    }
  }
}

// The readout, as ordinary page elements that CSS can style and that assistive
// tools can read. It changes only as events play.
export class Hud {
  private readonly seed: number;
  //cells this HUD has seen gathered, learned from events, not from the core
  private readonly gathered = new Set<string>();

  constructor(state: GameState) {
    this.seed = state.seed;
    this.showPosition(state.player.x, state.player.y);
  }

  show(event: GameEvent) {
    element("live").textContent = describe(event);
    if (event.type === "moved") this.showPosition(event.to.x, event.to.y);
    if (event.type === "gathered") {
      this.gathered.add(`${event.at.x},${event.at.y}`);
      this.showPosition(event.at.x, event.at.y);
      this.showInventory(event.inventory);
    }
    if (event.type === "crafted") this.showInventory(event.inventory);
  }

  private showPosition(x: number, y: number) {
    element("position").textContent = `${x}, ${y}`;
    const terrain = terrainAt(this.seed, x, y);
    const taken = this.gathered.has(`${x},${y}`);
    element("terrain").textContent = taken ? `${terrain} (gathered)` : terrain;
  }

  private showInventory(inventory: Record<string, number>) {
    const items = Object.entries(inventory).map(([item, count]) => {
      const li = document.createElement("li");
      li.textContent = `${item}: ${count}`;
      return li;
    });
    element("inventory").replaceChildren(...items);
  }
}
