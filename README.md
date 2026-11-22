# liffrey.github.io

My portfolio: an isometric cartoon room drawn with three.js. The light follows the visitor's local time, and the objects in the room open the content (monitor → Tech, TV → Games, posters → Cinema, bookcase → Books, file → CV, phone → Contact). All text is plain HTML built from `content/`, so the site also works without WebGL.

## Run it locally

```bash
npm install
npm run dev      # http://localhost:5173, reloads when content/ changes
npm test
npm run build    # dist/, fails if a content file is broken or JS is over 250 KB gzipped
```

Locally the site uses the sample GitHub data in `data/github.sample.json`. To see the real data:

```bash
GITHUB_TOKEN=$(gh auth token) node scripts/fetch-github.mjs   # writes data/github.json (not committed)
```

## Change the content

Edit the files in `content/`; no code changes needed. Text that still starts with `[PLACEHOLDER]` is waiting for real content.

- `site.json`: name, one-line tagline, about text (`whoami` in the terminal), contact links (`https://` or `mailto:`), CV summary and the PDF's file name. Put the PDF in `public/` and set `"pdf": "cv.pdf"`.
- `favorites.json`: up to 5 games, films, tech and books, each with a title, year and one sentence on why. Books also have an author. Films also have a poster: two colors and a motif (`sun`, `moon`, `diamond`, `stripes`, `tower`, `bike`). The first three films hang on the wall, with their titles.
- `projects.extra.json`: projects that GitHub can't list (private repos, work outside GitHub), and `overrides` to replace a repo's title or description.

## Put a repo on the site

Add a topic to the repo on GitHub: `portfolio-games`, `portfolio-tech` or `portfolio-cinema`. Repos without one of these topics are not shown. The site rebuilds every day at 03:17 UTC, on every push to `master`, and when the Deploy workflow is run by hand.

GitHub turns off scheduled workflows after 60 days without activity in the repo. If the daily update stops, enable it again in the Actions tab.

## Refresh the still image

`public/room.png` is shown when WebGL is unavailable and as the link preview. After changing the room:

```bash
npm run build
MSYS_NO_PATHCONV=1 node scripts/snapshot.mjs --url "/?h=20&snapshot" --size 1200,630 --out public/room.png
```

(`MSYS_NO_PATHCONV=1` is only needed in Git Bash. The script uses Microsoft Edge; set `EDGE` to its path if it's not in the default place.)

## License

Code: MIT (`LICENSE`).
