# GoXplora (Xplora web)

The production application lives in [`Xploraweb-main/`](./Xploraweb-main). That
is the only app in this repository — Vercel builds and deploys goxplora.ca
from that directory, and it's where all application changes should be made.

The legacy top-level Figma Make export that used to live at the repository
root has been removed; it was an unused duplicate of `Xploraweb-main/` left
over from an earlier export step.

## Running the code

```sh
cd Xploraweb-main
npm i
npm run dev
```

See [`Xploraweb-main/README.md`](./Xploraweb-main/README.md) for more details.
