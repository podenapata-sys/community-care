# Website photos

The site looks for these four files. A missing file hides its slot, so the page keeps the photo-free layout until a photo is added.

| File | Where it shows | Shape |
|---|---|---|
| `hero.jpg` | Top of the page, above the timings card | 16:10, about 1200×750 |
| `about.jpg` | "About us" section | 4:3, about 1200×900 |
| `lab.jpg` | Banner above the services cards | wide, about 1600×500 |
| `consult.jpg` | Beside "Why Community Care" | square, about 1000×1000 |

- Keep each file under 200 KB (squoosh.app, JPG quality about 75).
- Temporary stock photos must come from Unsplash or Pexels (free for commercial use). Note each source URL and photographer below.
- To swap in the real hospital photos later, overwrite the file with the same name and run `firebase deploy --only hosting`.

## Service card photos (optional)
Each service card shows `svc-<name>.jpg` on top once the file exists; until then it keeps its icon.
Files: `svc-medicine`, `svc-kidney`, `svc-lab`, `svc-ultrasound`, `svc-gynae`, `svc-child`, `svc-cabin`, `svc-emergency` (all `.jpg`, 16:10, about 800×500, under 120 KB). Add all eight together so the grid looks even.

## Credits
- `hero.jpg`, `about.jpg`, `consult.jpg`: AI-generated placeholders supplied by FS Solutions. Replace them with real hospital photos after the visit.
- `about.jpg` shows a generic reception, not Community Care's own, so replace it first.
- `lab.jpg`: not added yet (its banner stays hidden).
