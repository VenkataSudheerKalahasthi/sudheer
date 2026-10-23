# Developer character model (not included)

The About scene renders a built-in workstation. To add a real 3D developer character:

1. Get a rigged, licensed GLB (Sketchfab, Mixamo, Ready Player Me, or your own).
   Confirm the license allows portfolio use and note any attribution requirement.
2. Save it as `assets/models/developer.glb`.
3. In `index.html`, set `data-model-url="./assets/models/developer.glb"` on the `.about-stage` element.

What the loader does with it: auto-scales it to fit the desk, plays a real animation clip
(prefers names containing "typ"/"work", then "idle"/"breath"), turns the head toward the pointer
if a bone named `...Head` exists, and blinks if a morph target named `...blink...` exists.
If the file is missing or invalid, the workstation still renders.
