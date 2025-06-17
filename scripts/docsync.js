const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class DocSync {
  constructor(options = {}) {
    this.config = null;
    this.paths = {
      root: options.rootDir || path.join(__dirname, '..'),
      get configFile() { return path.join(this.root, 'docs.json'); },
      get buildDir() { return path.join(this.root, '_build'); },
      get tempDir() { return path.join(this.buildDir, 'repos'); },
      get docsDir() { return path.join(this.root, 'docs'); },
      get dataDir() { return path.join(this.root, '_data'); }
    };
    this.constants = {
      defaultOrder: 999,
      navigationDataFile: 'docsNavigation.json',
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
    
    console.log('Starting documentation sync...');
    
    // Setup directories
    await this.setupDirectories();
    
    // Process each documentation source
    for (const docSource of this.config.sources) {
      console.log(`Processing ${docSource.name}...`);
      await this.syncDocSource(docSource);
    }
    
    // Generate navigation data for Eleventy
    await this.generateNavigationData();
    
    console.log('Documentation sync complete!');
  }

  async setupDirectories() {
    console.log('Setting up directories...');
    await this.ensureCleanDirectory(this.paths.docsDir);
    await this.ensureCleanDirectory(this.paths.buildDir);
    await fs.mkdir(this.paths.tempDir, { recursive: true });
  }

  async syncDocSource(docSource) {
    this.validateDocSource(docSource);
    
    const targetPath = path.join(this.paths.docsDir, docSource.slug);
    
    if (!docSource.url) {
      console.log(`Skipping ${docSource.name} - no URL specified (local docs)`);
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
      console.log(`Using local path ${docSource.url}...`);
      sourcePath = path.resolve(docSource.url, docSource.path || 'docs');
    }

    if (!(await this.pathExists(sourcePath))) {
      console.warn(`Source path ${sourcePath} does not exist, skipping ${docSource.name}`);
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
      console.log(`Cloning ${docSource.url}...`);
      execSync(`git clone ${docSource.url} ${tempRepoPath}`, { stdio: 'inherit' });
    } catch (error) {
      console.error(`Failed to clone ${docSource.url}:`, error.message);
      return null;
    }
    
    return path.join(tempRepoPath, docSource.path || 'docs');
  }

  async processMarkdownFiles(sourcePath, targetPath, docSource) {
    const files = await this.getAllMarkdownFiles(sourcePath);
    const subdirectories = new Set();
    
    for (const filePath of files) {
      const relativePath = path.relative(sourcePath, filePath);
      const targetFilePath = path.join(targetPath, relativePath);
      
      // Track subdirectories (only top-level folders)
      const dirPath = path.dirname(relativePath);
      if (dirPath !== '.' && dirPath !== '') {
        const topLevelDir = dirPath.split('/')[0];
        subdirectories.add(topLevelDir);
      }
      
      // Ensure target directory exists
      const targetDir = path.dirname(targetFilePath);
      await fs.mkdir(targetDir, { recursive: true });
      
      // Process the markdown file
      await this.processMarkdownFile(filePath, targetFilePath, docSource, relativePath);
    }
    
    // Copy all non-markdown files (assets, images, etc.)
    await this.copyAssets(sourcePath, targetPath);
    
    // Generate index files for subdirectories
    for (const subdir of subdirectories) {
      await this.generateFolderIndex(targetPath, subdir, docSource);
    }
  }

  async processMarkdownFile(sourcePath, targetPath, docSource, relativePath) {
    const content = await fs.readFile(sourcePath, 'utf8');
    const { frontmatter, body } = this.parseFrontmatter(content);
    
    // Skip files that have docsync: false or publish: false in frontmatter
    if (
      frontmatter.publish === 'false' || frontmatter.publish === false
    ) {
      console.log(`Skipping ${relativePath} - excluded by frontmatter`);
      return;
    }
    
    // For local docs, preserve existing frontmatter if it has eleventyNavigation
    if (frontmatter.eleventyNavigation) {
      console.log(`Preserving existing frontmatter for ${relativePath}`);
      await fs.writeFile(targetPath, content, 'utf8');
      return;
    }
    
    // Generate metadata for external docs or local docs without proper frontmatter
    const metadata = this.generateMetadata(relativePath, frontmatter, docSource);
    
    // Convert relative paths to absolute paths
    const processedBody = this.convertRelativeToAbsolutePaths(body, docSource, relativePath);
    
    // Create new frontmatter
    const newFrontmatter = this.createFrontmatter(metadata);
    
    // Write processed file
    const newContent = `---\n${newFrontmatter}---\n${processedBody}`;
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
    
    // Common acronyms that should stay uppercase (keep this list small and common)
    const acronyms = ['API', 'SDK', 'CLI', 'HTTP', 'URL', 'JSON', 'XML', 'CSS', 'HTML', 'JS', 'TS', 'GraphQL', 'OAuth', 'JWT', 'REST'];
    
    // Generate title
    let title = existingFrontmatter.title;
    let hasCustomTitle = !!title;
    
    if (!title) {
      // Remove number prefix and convert to sentence case with acronym support
      const cleanFileName = fileName.replace(/^\d+-/, '');
      title = this.toSentenceCase(cleanFileName, acronyms);
      
      // Add section suffix
      title += ` - ${docSource.name}`;
    }
    
    // Generate navigation key with priority order:
    // 1. Explicit navigationKey in frontmatter (highest priority)
    // 2. Custom title without section suffix (medium priority) 
    // 3. Auto-generated from filename (fallback)
    let key;
    if (existingFrontmatter.navigationKey) {
      key = existingFrontmatter.navigationKey;
    } else if (existingFrontmatter.title && !existingFrontmatter.title.includes(' - ')) {
      key = existingFrontmatter.title;
    } else if (hasCustomTitle) {
      // If there's a custom title with section suffix, remove the suffix
      key = existingFrontmatter.title.replace(` - ${docSource.name}`, '');
    } else {
      // Remove number prefix and convert to sentence case
      const cleanFileName = fileName.replace(/^\d+-/, '');
      key = this.toSentenceCase(cleanFileName, acronyms);
    }
    
    // Generate parent from directory
    let parent = docSource.name;
    if (dirPath !== '.' && dirPath !== '') {
      const parentDir = path.basename(dirPath);
      parent = this.toSentenceCase(parentDir.replace(/^\d+-/, ''), acronyms);
    }
     // Generate permalink for proper URL structure
    const cleanKey = fileName.replace(/^\d+-/, '');
    let permalink;
    if (dirPath === '.' || dirPath === '') {
      permalink = `/docs/${docSource.slug}/${cleanKey}/`;
    } else {
      const cleanDirPath = dirPath.replace(/^\d+-/, '');
      permalink = `/docs/${docSource.slug}/${cleanDirPath}/${cleanKey}/`;
    }
    
    // Extract order from filename prefix
    const orderMatch = fileName.match(/^(\d+)-/);
    const order = orderMatch ? parseInt(orderMatch[1]) : 999;

    return {
      title,
      hasCustomTitle,
      key,
      parent,
      permalink,
      order,
      layout: 'docs',
      tags: 'docs'
    };
  }

  createFrontmatter(metadata) {
    let frontmatter = `layout: ${metadata.layout}\n`;
    frontmatter += `title: ${metadata.title}\n`;
    frontmatter += `permalink: ${metadata.permalink}\n`;
    frontmatter += `tags: ${metadata.tags}\n`;
    frontmatter += `eleventyNavigation:\n`;
    frontmatter += `  key: ${metadata.key}\n`;
    frontmatter += `  parent: ${metadata.parent}\n`;
    frontmatter += `  order: ${metadata.order}\n`;
    
    // If title is custom, use it for navigation display too
    if (metadata.hasCustomTitle) {
      frontmatter += `  title: ${metadata.title}\n`;
    }
    
    return frontmatter;
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
      
      // Ensure target directory exists
      const targetDir = path.dirname(targetFilePath);
      await fs.mkdir(targetDir, { recursive: true });
      
      // Copy the file
      await fs.copyFile(filePath, targetFilePath);
      console.log(`Copied asset: ${relativePath}`);
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

  async generateNavigationData() {
    await fs.mkdir(this.paths.dataDir, { recursive: true });
    
    const navigationSections = [];
    
    for (const docSource of this.config.sources) {
      const sectionPath = path.join(this.paths.docsDir, docSource.slug);
      let url = `/docs/${docSource.slug}/`;
      
      // Find the first/main file for this section
      if (await this.pathExists(sectionPath)) {
        const mainFile = await this.findMainFile(sectionPath);
        if (mainFile) {
          const cleanFileName = this.getCleanFileName(mainFile);
          url = `/docs/${docSource.slug}/${cleanFileName}/`;
        }
      }
      
      navigationSections.push({
        name: docSource.name,
        slug: docSource.slug,
        url: url
      });
    }
    
    const navigationData = { sections: navigationSections };
    const dataPath = path.join(this.paths.dataDir, this.constants.navigationDataFile);
    await fs.writeFile(dataPath, JSON.stringify(navigationData, null, 2), 'utf8');
    console.log('Generated navigation data for Eleventy');
  }

  getCleanFileName(fileName) {
    return path.basename(fileName, '.md').replace(/^\d+-/, '');
  }

  async findMainFile(sectionPath) {
    try {
      const files = await fs.readdir(sectionPath, { withFileTypes: true });
      const mdFiles = files
        .filter(file => file.isFile() && file.name.endsWith('.md'))
        .map(file => file.name)
        .sort(); // Sort alphabetically, so numbered files come first
      
      if (mdFiles.length > 0) {
        return mdFiles[0]; // Return the first file
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
    return null;
  }

  async generateFolderIndex(targetPath, folderName, docSource) {
    const folderTitle = this.toSentenceCase(folderName.replace(/^\d+-/, ''), this.constants.acronyms);
    
    // Extract order from folder name prefix
    const orderMatch = folderName.match(/^(\d+)-/);
    const order = orderMatch ? parseInt(orderMatch[1]) : this.constants.defaultOrder;
    
    const indexContent = `---
layout: docs
title: ${folderTitle} - ${docSource.name}
tags: docs
eleventyNavigation:
  key: ${folderTitle}
  parent: ${docSource.name}
  order: ${order}
permalink: false
---

# ${folderTitle}

This section contains ${folderTitle.toLowerCase()} documentation.
`;
    
    const indexPath = path.join(targetPath, folderName, 'index.md');
    await fs.writeFile(indexPath, indexContent, 'utf8');
  }

  convertRelativeToAbsolutePaths(content, docSource, relativePath) {
    // Get the base path for this document section
    const sectionBasePath = `/docs/${docSource.slug}`;
    
    // Get the directory of the current file (for resolving relative paths)
    const currentFileDir = path.dirname(relativePath);
    const currentDirPath = currentFileDir === '.' ? '' : `/${currentFileDir}`;
    
    // Patterns to match various relative path formats
    const patterns = [
      // Markdown images: ![alt](./path/file.ext)
      /(\!\[([^\]]*)\]\()(\.)([^)]+)(\))/g,
      
      // HTML src attributes: src="./path/file.ext"
      /(src=["'])(\.)([^"']+)(["'])/g,
      
      // HTML href attributes: href="./path/file.ext" 
      /(href=["'])(\.)([^"']+)(["'])/g,
      
      // Relative paths starting with ../
      /(\!\[([^\]]*)\]\(|\b(?:src|href)=["'])(\.\.)([^)"']+)(\)|["'])/g,
      
      // Relative paths without ./ prefix (just filename or folder/file)
      /(\!\[([^\]]*)\]\(|\b(?:src|href)=["'])([^http:\/\/|https:\/\/|\/][^)"']+)(\)|["'])/g
    ];
    
    let modifiedContent = content;
    
    // Handle ./ paths (current directory)
    modifiedContent = modifiedContent.replace(
      /(\!\[([^\]]*)\]\(|\b(?:src|href)=["'])(\.)([^)"']+)(\)|["'])/g,
      (match, prefix, alt, dot, pathPart, suffix) => {
        const absolutePath = `${sectionBasePath}${currentDirPath}${pathPart}`;
        return `${prefix}${absolutePath}${suffix}`;
      }
    );
    
    // Handle ../ paths (parent directory)
    modifiedContent = modifiedContent.replace(
      /(\!\[([^\]]*)\]\(|\b(?:src|href)=["'])(\.\.)([^)"']+)(\)|["'])/g,
      (match, prefix, alt, dots, pathPart, suffix) => {
        // Calculate how many levels to go up
        const levels = (match.match(/\.\.\//g) || []).length;
        let absolutePath = sectionBasePath;
        
        // Go up the specified number of levels
        for (let i = 0; i < levels; i++) {
          absolutePath = path.dirname(absolutePath);
        }
        
        // Add the remaining path
        const remainingPath = pathPart.replace(/^(\.\.\/)+/, '');
        absolutePath = path.posix.join(absolutePath, remainingPath);
        
        return `${prefix}${absolutePath}${suffix}`;
      }
    );
    
    return modifiedContent;
  }

  toSentenceCase(str, acronyms = []) {
    const words = str.split('-');
    return words
      .map((word, index) => {
        const upperWord = word.toUpperCase();
        if (acronyms.includes(upperWord)) {
          return upperWord; // Keep acronyms uppercase
        }
        if (index === 0) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); // First word capitalized
        }
        return word.toLowerCase(); // Other words lowercase
      })
      .join(' ');
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


}

// Run if called directly
if (require.main === module) {
  const docSync = new DocSync();
  docSync.sync().catch(console.error);
}

module.exports = DocSync;
