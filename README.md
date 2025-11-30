# 🚀 Web Scraper Application

A beautiful, modern web application for scraping websites with an intuitive UI. Built with Express, Puppeteer, and vanilla JavaScript.

![Web Scraper](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-green)
![License](https://img.shields.io/badge/license-MIT-orange)

## ✨ Features

- 🌐 **Simple URL Input** - Just paste any URL and start scraping
- 📸 **Screenshot Capture** - Full-page screenshots of all visited pages
- 🖼️ **Image Clicking** - Automatically opens images in new tabs and captures them
- 📧 **Contact Page** - Finds and visits contact/about pages automatically
- 📊 **Live Progress** - Real-time progress bar and live logs
- 💾 **Multiple Formats** - Saves data in JSON, HTML, and TXT formats
- ⚙️ **Customizable** - Adjust delays, number of images, and more
- 🎨 **Beautiful UI** - Modern, responsive design with dark theme

## 📁 Project Structure

```
web-scraper-app/
├── server.js              # Express backend server
├── package.json           # Dependencies
├── public/                # Frontend files
│   ├── index.html        # Main HTML page
│   ├── styles.css        # Styles
│   └── app.js            # Frontend JavaScript
├── screenshots/           # Generated screenshots
└── output/               # Generated data files
```

## 🚀 Installation

### Prerequisites

- Node.js 14 or higher
- npm (comes with Node.js)

### Step 1: Install Node.js

If you don't have Node.js:
- Download from: https://nodejs.org/
- Choose LTS version
- Install with default settings

### Step 2: Install Dependencies

```bash
# Navigate to project folder
cd web-scraper-app

# Install all dependencies
npm install
```

This will install:
- express (web server)
- puppeteer (browser automation)
- cors (cross-origin support)
- multer (file uploads)

### Step 3: Start the Server

```bash
npm start
```

You should see:
```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║         🚀 WEB SCRAPER APPLICATION STARTED! 🚀               ║
║                                                              ║
║  Server running at: http://localhost:3000                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### Step 4: Open in Browser

Open your web browser and go to:
```
http://localhost:3000
```

## 🎯 How to Use

### Basic Usage

1. **Enter URL**
   - Paste the website URL you want to scrape
   - Example: `https://vnvideoseditor.com`

2. **Configure Options** (optional)
   - ☑️ Click Images - Opens image links in new tabs
   - ☑️ Visit Contact Page - Finds and visits contact page
   - Click "Advanced Settings" for more options

3. **Start Scraping**
   - Click the "🚀 Start Scraping" button
   - Watch the progress bar and live logs
   - Wait for completion (usually 30-90 seconds)

4. **View Results**
   - Browse screenshots in the gallery
   - Download JSON, HTML, or TXT files
   - Click screenshots to view full-size

5. **Start New Scrape**
   - Click "🔄 Start New Scrape" button

### Advanced Options

Click "🔧 Advanced Settings" to customize:

- **Max Images to Click** (1-20)
  - How many images to open and capture
  - Default: 5

- **Page Load Delay** (5-60 seconds)
  - How long to wait after page loads
  - Default: 15 seconds

- **Scroll Delay** (5-30 seconds)
  - How long to wait after scrolling
  - Default: 10 seconds

## 📊 Output Files

After scraping, you'll get:

### Screenshots
- `[timestamp]-01-homepage.png` - Full homepage
- `[timestamp]-02-image-1.png` - First clicked image
- `[timestamp]-02-image-2.png` - Second clicked image
- ... (more images if enabled)
- `[timestamp]-03-contact.png` - Contact page

### Data Files
- `[timestamp]-data.json` - Complete structured data
- `[timestamp]-report.txt` - Human-readable report
- `[timestamp]-homepage.html` - Saved HTML source

## 🔧 API Endpoints

If you want to use the API directly:

### POST /api/scrape
Start a new scraping session.

**Request:**
```json
{
  "url": "https://example.com",
  "options": {
    "clickImages": true,
    "visitContact": true,
    "maxImages": 5,
    "pageLoadDelay": 15000
  }
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "1234567890",
  "message": "Scraping started"
}
```

### GET /api/status/:sessionId
Get status of a scraping session.

**Response:**
```json
{
  "status": "running",
  "progress": 45,
  "logs": [...],
  "startTime": "2024-11-30T12:00:00Z"
}
```

### GET /api/files/:sessionId
Get list of generated files.

**Response:**
```json
{
  "files": {
    "screenshots": ["/screenshots/..."],
    "json": "/output/...",
    "report": "/output/...",
    "html": "/output/..."
  }
}
```

## ⚙️ Configuration

### Change Port

Edit `server.js`:
```javascript
const PORT = 3000; // Change to your preferred port
```

### Adjust Timeouts

Edit `server.js`:
```javascript
const config = {
  timeout: 120000, // 2 minutes
  // ... other settings
};
```

### Enable/Disable Headless Mode

Edit `server.js` in the `runScraper` function:
```javascript
browser = await puppeteer.launch({
  headless: true, // false to see browser
  // ...
});
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill
```

### Puppeteer Installation Issues (Linux)
```bash
# Install Chrome dependencies
sudo apt-get install -y \
  gconf-service libasound2 libatk1.0-0 libgdk-pixbuf2.0-0 libgtk-3-0
```

### Cannot Connect to Server
- Check if server is running: `npm start`
- Verify port 3000 is not blocked by firewall
- Try `http://localhost:3000` instead of `http://127.0.0.1:3000`

### Scraping Fails
- Increase timeouts in Advanced Settings
- Check if URL is accessible
- Try with headless: false to see what's happening

## 📝 Development

### Run in Development Mode

Install nodemon:
```bash
npm install -g nodemon
```

Run with auto-reload:
```bash
npm run dev
```

### Modify Frontend

All frontend files are in `/public`:
- `index.html` - Structure
- `styles.css` - Styling
- `app.js` - JavaScript logic

Changes take effect immediately (just refresh browser).

### Modify Backend

Edit `server.js` and restart:
```bash
# Stop server (Ctrl+C)
# Start again
npm start
```

## 🚀 Deployment

### Deploy to Local Network

1. Find your local IP:
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

2. Update `app.js`:
```javascript
const API_BASE = 'http://YOUR_LOCAL_IP:3000/api';
```

3. Start server and access from other devices:
```
http://YOUR_LOCAL_IP:3000
```

### Deploy to Cloud (Heroku, AWS, etc.)

1. Set PORT from environment:
```javascript
const PORT = process.env.PORT || 3000;
```

2. Update API_BASE in `public/app.js` to use relative URLs:
```javascript
const API_BASE = '/api';
```

3. Follow your hosting provider's deployment guide.

## 📄 License

MIT License - Free to use and modify!

## 🤝 Contributing

Feel free to fork, modify, and create pull requests!

## 💡 Tips

- **Longer delays** = More reliable but slower
- **Shorter delays** = Faster but might miss content
- **Max images = 10+** can significantly increase time
- Check **live logs** to see exactly what's happening
- **Headless: false** is great for debugging

## 🎉 Features Coming Soon

- [ ] Multiple URL scraping
- [ ] Scheduled scraping
- [ ] Email notifications
- [ ] Export to CSV
- [ ] Screenshot comparison
- [ ] API key authentication

---

**Built with ❤️ using Express, Puppeteer, and modern web technologies**
