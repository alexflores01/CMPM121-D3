//a recipe is a row of data, what it needs, and what it makes.
export type Recipe = {
  name: string;
  inputs: Record<string, number>;
  output: string;
};

export const RECIPES: Recipe[] = [
  { name: "Torch", inputs: { wood: 2 }, output: "torch" },
  { name: "Ice Pick", inputs: { wood: 3, torch: 1 }, output: "icepick" },
];
