import {
  type Command,
  type GameState,
  missingFor,
  RECIPES,
} from "../core/mod.ts";

//the recipe list, as page buttons, it never decides whether a craft works.
//it sends a craft command, and ask the core's missingFor query for its labels
export class RecipeBook {
  private readonly state: GameState;
  private readonly buttons: HTMLButtonElement[] = [];

  constructor(
    list: HTMLElement,
    state: GameState,
    craft: (command: Command) => void,
  ) {
    this.state = state;
    for (const recipe of RECIPES) {
      const button = document.createElement("button");
      button.type = "button";
      button.addEventListener("click", (event) => {
        craft({ type: "craft", output: recipe.output });
        //after a mouse click, give keys back to the game
        if (event.detail > 0) button.blur();
      });
      const item = document.createElement("li");
      item.append(button);
      list.append(item);
      this.buttons.push(button);
    }
  }

  update() {
    RECIPES.forEach((recipe, i) => {
      const missing = Object.entries(missingFor(this.state, recipe))
        .map(([item, count]) => `${count} ${item}`)
        .join(", ");
      this.buttons[i].textContent = missing
        ? `${recipe.name} - missing ${missing}`
        : `${recipe.name} - ready`;
    });
  }
}
