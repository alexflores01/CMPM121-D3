# Manual test script

For a person, or an agent driving a browser. Run `deno task dev` and open the local URL with `?seed=121`. Before each section, reload. To read logical state, use `game.state` in the console. To read what has played, use the panel beside the grid, including the `#live` text, or look at the marker.

**Promotion rule:** a bug found by hand or by an agent becomes a permanent test in `core/` before it is fixed, unless it truly lives in `game/`, in which case add a step here.

| #  | Action                                                        | Expected observation                                                                                                                                              |
| -- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1  | Load the page                                                 | One canvas. A pale marker at the center of a snowy map. No console errors.                                                                                        |
| 2  | Tap the right arrow                                           | The marker slides one cell east. `#live` says `moved to 1, 0`. `player` is `{ x: 1, y: 0 }`.                                                                      |
| 3  | Walk until icewater or crystal is ahead, then press toward it | The marker lurches and flashes red, then returns to its cell. `#live` says `blocked by icewater at ...` or `blocked by crystal at ...`. `player` has not changed. |
| 4  | Tap an arrow during a walk                                    | The tap waits. The marker finishes the walk, then takes that step. It never skips a cell.                                                                         |
| 5  | Mash arrows quickly, then stop                                | The marker settles on the cell `player` reports.                                                                                                                  |
| 6  | Hold an arrow down                                            | The marker keeps walking. Holding into a wall repeats the bump.                                                                                                   |
| 7  | Load `?seed=7`                                                | A different map.                                                                                                                                                  |
| 8  | Run `game.state` in the console                               | Plain data: `seed` and `player`, `inventory`, and `gathered`. No terrain list.                                                                                    |
| 9  | Press an arrow several times                                  | Position and Terrain in the panel change as each step plays, and never ahead of the marker.                                                                       |
| 10 | Make the window short, then press the down arrow              | The page does not scroll. The marker moves.                                                                                                                       |
| 11 | Click the sound button, then press an arrow                   | The button reads `Sound: off`, and the arrow still moves the marker.                                                                                              |
| 12 | Click the sound button again                                  | The button reads `Sound: on`, and you hear a two-note chime.                                                                                                      |
| 13 | Tab to the sound button and press Space                       | It toggles. Arrow keys still move the marker.                                                                                                                     |
| 14 | Listen while walking and bumping (headphones or speakers)     | A soft tick on each step, and a low buzz on each bump. **This is the only check that a person can hear them.**                                                    |
| 15 | On a high-resolution display, or at browser zoom 200%         | Grid edges stay sharp. The marker stays centered. Run `document.querySelector("canvas").width`: it is the canvas `clientWidth` times `devicePixelRatio`.          |

| 16 | Stand on pines and press G | `#live` says `gathered wood`, chime plays, and the cell turns gray-blue. `inventory` is `{ wood: 1}`. |

| 17 | Press G agaon on the same cell | `#live` says `nothing to gather here`, and a buzz plays. `inventory` has not changed. |

| 18 | Walk a few cells away from a gathered cell, then back onto it | The cell is still gray-blue, and Terrain reads `pines (gathered)`. |

| 19 | Stand on snowfield and press G | `#live` says `nothing to gather here`. `gathered` has not changed. |
