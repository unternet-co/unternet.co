const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class DocSync {
  constructor(options = {}) {
    this.config = null;
    this.paths = {
      root: options.rootDir || path.join(__dirname, '..'),
      get configFile() { return path.join(this.root, '_data', 'docs.json'); },
      get buildDir() { return path.join(this.root, '_build'); },
      get tempDir() { return path.join(this.buildDir, 'repos'); },
      get docsDir() { return path.join(this.root, 'docs'); }
    };
    this.constants = {
      acronyms: ['API', 'SDK', 'CLI', 'HTTP', 'URL', 'JSON', 'XML', 'CSS', 'HTML', 'JS', 'TS']
    };
  }

  async loadConfig() {
    try {
      const configContent = await fs.readFile(this.paths.configFile, 'utf8');
      this.config = JSON.parse(configContent);
      
      if (!this.config.sources || !Array.isArray(this.config.sources)) {
        throw new Error('Invalid config: sources must be an array');
      }
    } catch (error) {
      throw new Error(`Failed to load config from ${this.paths.configFile}: ${error.message}`);
    }
  }

  async sync() {
    await this.loadConfig();
    await this.setupDirectories();
    
    for (const docSource of this.config.sources) {
      await this.syncDocSource(docSource);
    }
  }

  async setupDirectories() {
    await this.ensureCleanDirectory(this.paths.docsDir);
    await this.ensureCleanDirectory(this.paths.buildDir);
    await fs.mkdir(this.paths.tempDir, { recursive: true });
    // Ensure _data/sidebars directory exists
    await fs.mkdir(path.join(this.paths.root, '_data', 'sidebars'), { recursive: true });
  }

  async syncDocSource(docSource) {
    this.validateDocSource(docSource);
    
    const targetPath = path.join(this.paths.docsDir, docSource.slug);
    
    if (!docSource.url) {
      return;
    }

    const sourcePath = await this.getSourcePath(docSource);
    if (!sourcePath) return;

    // Process and copy markdown files
    await this.processMarkdownFiles(sourcePath, targetPath, docSource);
  }

  validateDocSource(docSource) {
    const required = ['name', 'slug'];
    for (const field of required) {
      if (!docSource[field]) {
        throw new Error(`Doc source missing required field: ${field}`);
      }
    }
  }

  async getSourcePath(docSource) {
    let sourcePath;

    if (this.isGitUrl(docSource.url)) {
      sourcePath = await this.cloneRepository(docSource);
    } else {
      const subPath = docSource.path !== undefined ? docSource.path : 'docs';
      sourcePath = subPath ? path.resolve(docSource.url, subPath) : path.resolve(docSource.url);
    }

    if (!(await this.pathExists(sourcePath))) {
      return null;
    }

    return sourcePath;
  }

  isGitUrl(url) {
    return url.startsWith('http') || url.startsWith('git@');
  }

  async cloneRepository(docSource) {
    const tempRepoPath = path.join(this.paths.tempDir, docSource.slug);
    
    try {
      execSync(`git clone ${docSource.url} ${tempRepoPath}`, { stdio: 'inherit' });
    } catch (error) {
      return null;
    }
    
    return path.join(tempRepoPath, docSource.path || 'docs');
  }

  async processMarkdownFiles(sourcePath, targetPath, docSource) {
    const files = await this.getAllMarkdownFiles(sourcePath);
    
    for (const filePath of files) {
      const relativePath = path.relative(sourcePath, filePath);
      const targetFilePath = path.join(targetPath, relativePath);
      
      const targetDir = path.dirname(targetFilePath);
      await fs.mkdir(targetDir, { recursive: true });
      
      await this.processMarkdownFile(filePath, targetFilePath, docSource, relativePath);
    }
    
    await this.copyAssets(sourcePath, targetPath);
    // Copy sidebar config if it exists
    await this.copySidebarConfig(sourcePath, docSource);
  }

  async processMarkdownFile(sourcePath, targetPath, docSource, relativePath) {
    const content = await fs.readFile(sourcePath, 'utf8');
    const { frontmatter, body } = this.parseFrontmatter(content);
    
    if (frontmatter.docsync === 'false' || frontmatter.docsync === false) {
      return;
    }
    
    if (frontmatter.layout) {
      await fs.writeFile(targetPath, content, 'utf8');
      return;
    }
    
    const metadata = this.generateMetadata(relativePath, frontmatter, docSource);
    const newFrontmatter = this.createFrontmatter(metadata);
    const newContent = `---\n${newFrontmatter}---\n${body}`;
    await fs.writeFile(targetPath, newContent, 'utf8');
  }

  parseFrontmatter(content) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (match) {
      const frontmatter = {};
      const frontmatterLines = match[1].split('\n');
      
      for (const line of frontmatterLines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim();
          frontmatter[key] = value.replace(/^['"]|['"]$/g, ''); // Remove quotes
        }
      }
      
      return { frontmatter, body: match[2] };
    }
    
    return { frontmatter: {}, body: content };
  }

  generateMetadata(relativePath, existingFrontmatter, docSource) {
    const fileName = path.basename(relativePath, '.md');
    const dirPath = path.dirname(relativePath);
    
    let title = existingFrontmatter.title;
    if (!title) {
      const cleanFileName = fileName.replace(/^\d+-/, '');
      title = this.toTitleCase(cleanFileName, this.constants.acronyms);
    }
    
    const cleanFileName = fileName.replace(/^\d+-/, '');
    let permalink;
    if (dirPath === '.' || dirPath === '') {
      permalink = `/docs/${docSource.slug}/${cleanFileName}/`;
    } else {
      const cleanDirPath = dirPath.replace(/^\d+-/, '');
      permalink = `/docs/${docSource.slug}/${cleanDirPath}/${cleanFileName}/`;
    }

    return { title, permalink, layout: 'docs', tags: 'docs' };
  }

  createFrontmatter(metadata) {
    return `layout: ${metadata.layout}
title: ${metadata.title}
permalink: ${metadata.permalink}
tags: ${metadata.tags}
`;
  }

  async getAllMarkdownFiles(dirPath) {
    const files = [];
    
    async function walk(currentPath) {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    }
    
    await walk(dirPath);
    return files;
  }

  async copyAssets(sourcePath, targetPath) {
    const allFiles = await this.getAllFiles(sourcePath);
    
    for (const filePath of allFiles) {
      // Skip markdown files (already processed)
      if (filePath.endsWith('.md')) {
        continue;
      }
      
      const relativePath = path.relative(sourcePath, filePath);
      const targetFilePath = path.join(targetPath, relativePath);
      
      const targetDir = path.dirname(targetFilePath);
      await fs.mkdir(targetDir, { recursive: true });
      
      await fs.copyFile(filePath, targetFilePath);
    }
  }

  async getAllFiles(dirPath) {
    const files = [];
    
    async function walk(currentPath) {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
    }
    
    await walk(dirPath);
    return files;
  }

  async ensureCleanDirectory(dirPath) {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
    } catch (error) {
      // Directory might not exist, which is fine
    }
    await fs.mkdir(dirPath, { recursive: true });
  }

  async pathExists(path) {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  toTitleCase(str, acronyms = []) {
    return str
      .split('-')
      .map(word => {
        const upperWord = word.toUpperCase();
        if (acronyms.includes(upperWord)) {
          return upperWord;
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }

  async copySidebarConfig(sourcePath, docSource) {
    const sidebarPath = path.join(sourcePath, 'nav.json');
    
    if (await this.pathExists(sidebarPath)) {
      const targetSidebarPath = path.join(this.paths.root, '_data', 'sidebars', `${docSource.slug}.json`);
      await fs.copyFile(sidebarPath, targetSidebarPath);
      console.log(`Copied navigation config: ${docSource.slug}.json`);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const docSync = new DocSync();
  docSync.sync().catch(console.error);
}

module.exports = DocSync;
