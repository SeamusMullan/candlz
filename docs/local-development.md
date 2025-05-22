# Running the Documentation Locally

This guide explains how to run the candlz documentation site on your local machine for development and testing.

## Prerequisites

You'll need one of the following to serve the documentation site locally:

1. A simple HTTP server (Python's built-in server, Node.js's `http-server`, etc.)
2. The Docsify CLI tool (recommended for development)
3. Any web server software (Apache, Nginx, etc.)

## Option 1: Using Python's Built-in Server

Python comes with a simple HTTP server that's perfect for serving static content:

```bash
# Navigate to the docs directory
cd docs

# Python 3
python -m http.server 3000

# Python 2
python -m SimpleHTTPServer 3000
```

Then open your browser and go to http://localhost:3000

## Option 2: Using Docsify CLI (Recommended)

The Docsify CLI provides live reloading and other development features:

### Installation

```bash
# Install docsify-cli globally
npm install -g docsify-cli
```

### Running the Dev Server

```bash
# Navigate to the repository root
cd /path/to/candlz

# Serve the docs
docsify serve docs
```

By default, the site will be available at http://localhost:3000

### Additional Docsify Commands

```bash
# Initialize a new docs site (not needed for this project)
docsify init ./docs

# Help
docsify -h
```

## Option 3: Using Node.js http-server

Another lightweight option is the Node.js `http-server` package:

### Installation

```bash
# Install http-server globally
npm install -g http-server
```

### Running the Server

```bash
# Navigate to the docs directory
cd docs

# Start the server
http-server -p 3000
```

Then open your browser and go to http://localhost:3000

## Viewing the Documentation

After starting your local server using any of the methods above:

1. Open your web browser
2. Navigate to http://localhost:3000 (or whatever port you specified)
3. You should see the candlz documentation site

## Troubleshooting

### CORS Issues

If you encounter CORS (Cross-Origin Resource Sharing) issues:

- Make sure you're accessing the site via http://localhost and not via IP address
- Use a server that sets proper CORS headers
- Try a different browser

### Files Not Loading

If CSS, JavaScript, or other resources fail to load:

- Check your browser's developer console for specific errors
- Verify that paths in HTML files are correct
- Ensure you're serving from the correct directory

### Live Reload Not Working

If using Docsify and live reload isn't working:

- Verify you have the latest version of docsify-cli
- Check if your browser is blocking scripts
- Try disabling browser extensions that might interfere

## Building for Production

The documentation site is designed to be deployed as static files. No build step is required. Simply copy the entire `docs` directory to your web server or hosting service.

Popular options for hosting include:

- GitHub Pages
- Netlify
- Vercel
- Any standard web hosting service

## Documentation Structure

Understanding the documentation structure can help with development:

- `index.html` - The main entry point and configuration
- `README.md` - The home page content
- `_sidebar.md` - Navigation menu structure
- `_coverpage.md` - Cover page content
- `assets/` - Images, CSS, and other static resources
- Topic folders - Organized by feature/section

## Contributing to Documentation

When contributing to the documentation:

1. Run the site locally to preview changes
2. Follow the existing Markdown formatting style
3. Place images in the appropriate `assets` folders
4. Update the sidebar if adding new pages
5. Test all links and navigation

---

For any issues with the documentation setup, please contact the development team or create an issue on GitHub.
