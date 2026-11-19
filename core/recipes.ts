//a recipe is a row of data, what it needs, and what it makes.
export type Recipe = {
  name: string;
  inputs: Record<string, number>;
  output: string;
};

export const RECIPES: Recipe[] = [
  { name: "Torch", inputs: { wood: 2 }, output: "torch" },
  { name: "Ice Pick", inputs: { wood: 3, torch: 1 }, output: "icepick" },
  { name: "Firewood", inputs: { wood: 3 }, output: "firewood" },
  { name: "Crystal Lens", inputs: { crystal: 2 }, output: "lens" },
  { name: "Lantern", inputs: { torch: 1, lens: 1 }, output: "lantern" },
  {
    name: "Warm Hearth",
    inputs: { lantern: 1, firewood: 1 },
    output: "hearth",
  },
];

export const CAPSTONE = "hearth";
