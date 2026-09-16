# Hanoi 1946: Gameplay Mechanics & Agent Prompts
**Focus:** Translating historical urban warfare tactics (1946-1947) into engaging 2D Phaser 3 mechanics.

## General Architecture (Zustand + Phaser)
The game relies on strict state management. React handles the UI (dialogues, trivia, current objective) and Phaser handles the real-time physics.
*   **Agent Prompt:** "Use Zustand for all cross-boundary state. Example: When the Phaser player collects a 'Weapon Crate', call `useGameStore.getState().addInventory('crate')`. React will detect this and update the HUD. Do NOT build React UI components inside the Phaser canvas."

---

## Minigame 1: The Old Quarter (Đục tường & Barricades)
**Historical Basis:** Viet Minh forces broke holes through the walls of adjacent houses ("đục tường") to move safely without exposing themselves to French tanks on the streets. They fought block-by-block.

**Gameplay Loop (Phaser 3 - Top-Down Tactical):**
*   **The Map:** A grid of 4 connected houses. The street runs horizontally at the top, constantly patrolled by a heavy tank (which one-shots the player if they step out).
*   **The Objective:** Move from House 1 to House 4 to plant a satchel charge on the street corner to disable the tank's treads.
*   **The Mechanic:** Player cannot use the street. They must stand next to the internal walls between houses and hold the 'Spacebar' for 3 seconds to "break through" (creating a passable gap in the collision mask). 
*   **Enemies:** French infantry periodically breach the houses through the windows. Player must shoot them or use melee (machete) at close range to conserve ammo.

**[PROMPT FOR AGENT - LEVEL 1]**
> Build a Phaser 3 Top-Down scene.
> - **Map Structure:** Create a Tilemap or static physics groups representing 4 terraced houses side-by-side. The area above them is the "Street" (a death zone).
> - **Wall Breaking:** Place specific `WallNode` sprites between the houses. When the player overlaps a `WallNode` and holds 'SPACE' for 3s (show a progress bar above the player), destroy the `WallNode` and remove its physics body, allowing passage.
> - **Enemy Spawning:** Spawn infantry at the top edges (windows) of the houses. They use A* pathfinding (or basic move-to-player logic) to hunt the player inside the houses.
> - **Win Condition:** Player reaches the designated zone in House 4 and presses 'E' to trigger an explosion animation on the street.

---

## Minigame 2: The Night Raid (Cửa Bắc / Northern Gate)
**Historical Basis:** The Viet Minh lacked heavy weaponry and relied on night raids against French supply depots to capture rifles and grenades.

**Gameplay Loop (Phaser 3 - Top-Down Stealth & Scavenge):**
*   **The Map:** A ruined courtyard near the Citadel. It is pitch black.
*   **The Mechanic (Lighting):** Utilize Phaser's `Light` system (or a mask over a dark rectangle). The only light sources are:
    1.  The sweeping cone of an armored car's headlight (instant death if caught).
    2.  The player's limited matches (lights a small radius for 5 seconds, cooldown 10s).
*   **The Objective:** Find and collect 3 scattered weapon crates in the dark, then return to the extraction point.
*   **Enemies:** Stationary guards. If they hear footsteps (player moving at full speed), they turn on flashlights. Player must use 'Shift' to walk slowly (no noise).

**[PROMPT FOR AGENT - LEVEL 2]**
> Build a stealth-focused Phaser 3 scene with dynamic lighting.
> - **Lighting:** Add a black rectangle covering the screen with `alpha: 0.95`. Use a `Phaser.Display.Masks.BitmapMask` to punch holes in the darkness.
> - **Enemy Vision:** Create an armored car sprite that moves back and forth. Attach a polygon vision cone to it that acts as a light mask. If the player intersects this cone, trigger Game Over.
> - **Movement/Sound:** If the player uses normal WASD, create invisible 'sound radius' circles that expand momentarily. If a guard sprite overlaps the sound circle, they change state to 'Alert' and aim a flashlight mask in the player's direction. Player must hold 'Shift' to halve velocity and eliminate the sound radius.
> - **Collectibles:** Place 3 'Crate' sprites. Overlap to collect, updating the Zustand store `cratesCollected`.

---

## Minigame 3: The Miraculous Retreat (Vượt Sông Hồng)
**Historical Basis:** The stealthy crossing of the Red River (Feb 17, 1947). Thousands crossed under fog, directly beneath the French-controlled Long Bien bridge, maintaining absolute silence.

**Gameplay Loop (Phaser 3 - Side-Scrolling Escort/Rhythm):**
*   **The Map:** Side-scrolling view of the river water at the bottom, the massive steel structure of Long Bien bridge at the top.
*   **The Mechanic (The Noise Meter):** You are guiding a small boat (or wading troops) from left to right. Above, French guards are patrolling the bridge with searchlights sweeping down.
*   **Action:** 
    *   **Move:** Hold 'Right Arrow' to row/wade forward. This increases the global "Noise Meter" UI bar at the top of the screen.
    *   **Freeze:** Let go of all keys to stay perfectly still. The Noise Meter slowly decreases.
    *   **Searchlights:** Beams of light sweep across the water. You *must* be completely still (frozen) when a light beam passes over you. If you are moving while illuminated, or if the Noise Meter reaches 100%, you are spotted (Game Over).
*   **Atmosphere:** Heavy fog (using a scrolling particle emitter or semi-transparent overlay). Only the sound of water and distant French voices.

**[PROMPT FOR AGENT - LEVEL 3]**
> Build a tense side-scrolling Phaser 3 scene focusing on movement discipline.
> - **Player Entity:** A group of soldiers in the water at the bottom of the screen. Moving them horizontally increases a `noiseLevel` variable (0-100). If `noiseLevel >= 100`, trigger Game Over.
> - **Hazards (Searchlights):** Create graphical light beams originating from the top of the screen, sweeping left and right using Tweens.
> - **Detection Logic:** In the `update()` loop: Check if the player bounding box intersects a searchlight beam. IF intersection == true AND player velocity.x > 0, trigger Game Over.
> - **Atmosphere:** Add a `Phaser.GameObjects.Particles.ParticleEmitter` emitting slow-moving, large, low-alpha white circles across the screen to simulate heavy fog.
> - **Win Condition:** Player safely reaches the right edge of the world bounds. Trigger `useGameStore.getState().triggerEndingCinematic()`.
