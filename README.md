# Unternet Homepage

## Documentation Sync (docsync)

This project uses a documentation sync system that automatically pulls documentation from external repositories and generates navigation using sidebar configs.

### Adding docs from a new repository

1. Add your repo to `_data/docs.json`:
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

2. Create a `nav.json` file in your docs folder:
   ```json
   {
     "title": "Your Project",
     "items": [
       {
         "title": "Introduction",
         "path": "introduction"
       },
       {
         "title": "Guides",
         "items": [
           {
             "title": "Getting Started",
             "path": "guides/getting-started"
           }
         ]
       }
     ]
   }
   ```

3. Run the sync: `node scripts/docsync.js`

### Setting up automatic sync for a new repository

To have your repository automatically trigger documentation updates:

1. **Add your repo to `_data/docs.json`** (as shown above)

2. **Copy `.github/workflows/docsync.yml`** from this repository to your repository's `.github/workflows/` directory

3. **Add a deploy hook as a secret** in your external repository:
   - Go to your repo's Settings → Secrets and variables → Actions
   - Add a new secret named `DOCS_DEPLOY_HOOK` with your deploy hook URL

4. **Push to main** - your docs will now automatically trigger a website rebuild!

### Repository requirements

- Documentation should be in markdown files with clean names (no number prefixes)
- Put assets (images, etc.) in an `assets/` folder next to your docs
- Use relative paths for assets: `assets/image.png` or `./assets/image.png`
- Create a `nav.json` file to define navigation structure and ordering
- The docsync system will automatically convert asset paths and copy navigation configs

### How it works

- External repos directly trigger Render deploy hooks when docs change
- During deployment, the build process automatically runs docsync (see `package.json` build script)
- External repos are cloned to `_build/repos/` (gitignored) during build
- Navigation configs (`nav.json`) are copied to `_data/sidebars/{slug}.json`
- Processed docs are output to `docs/` for Eleventy to build
- Frontmatter is automatically generated for files without existing layout
- Relative asset paths are converted to absolute paths for proper loading
- Eleventy automatically loads sidebar data for template navigation
