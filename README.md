# Unternet Homepage

## Documentation Sync (docsync)

This project uses a documentation sync system that automatically pulls documentation from external repositories and generates navigation.

### Adding docs from a new repository

1. Add your repo to `docs.json`:
   ```json
   {
     "entrypoint": "/docs/web-applets/introduction/",
     "sources": [
       {
         "name": "Your Project",
         "slug": "your-project", 
         "url": "https://github.com/your-org/your-repo",
         "path": "docs"
       }
     ]
   }
   ```

2. Run the sync: `node scripts/docsync.js`

### Setting up automatic sync for a new repository

To have your repository automatically trigger documentation updates:

1. **Add your repo to `docs.json`** (as shown above)

2. **Copy `.github/workflows/docsync.yml`** from this repository to your repository's `.github/workflows/` directory

4. **Add a deploy hook as a secret** in your external repository:
   - Go to your repo's Settings → Secrets and variables → Actions
   - Add a new secret named `DOCS_DEPLOY_HOOK` with your deploy hook URL

5. **Push to main** - your docs will now automatically trigger a website rebuild!

### Repository requirements

- Documentation should be in markdown files
- Put assets (images, etc.) in an `assets/` folder next to your docs
- Use relative paths for assets: `./assets/image.png`
- Number your files for ordering: `01-introduction.md`, `02-quickstart.md`, etc.
- The docsync system will automatically generate navigation and convert asset paths

### How it works

- External repos directly trigger Render deploy hooks when docs change
- During deployment, the build process automatically runs docsync (see `package.json` build script)
- External repos are cloned to `_build/repos/` (gitignored) during build
- Processed docs are output to `docs/` for Eleventy to build
- Frontmatter is automatically generated with navigation structure
- Relative asset paths are converted to absolute paths for proper loading
- Navigation data is generated in `_data/docsNavigation.json`
- The main site also rebuilds daily via scheduled workflow to keep docs fresh

### Skipping files

Add `docsync: false` to any markdown file's frontmatter to exclude it from sync.
