const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve static files (screenshots, output)
app.use('/screenshots', express.static(path.join(__dirname, 'screenshots')));
app.use('/output', express.static(path.join(__dirname, 'output')));

// Create directories if they don't exist
const screenshotPath = path.join(__dirname, 'screenshots');
const outputPath = path.join(__dirname, 'output');

if (!fs.existsSync(screenshotPath)) {
  fs.mkdirSync(screenshotPath, { recursive: true });
}
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

// Utility function
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Store active scraping sessions
const scrapingSessions = new Map();

// API endpoint to start scraping
app.post('/api/scrape', async (req, res) => {
  const { url, options } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  // Generate session ID
  const sessionId = Date.now().toString();
  
  // Set default options
  const config = {
    url: url,
    clickImages: options?.clickImages !== false,
    visitContact: options?.visitContact !== false,
    maxImages: options?.maxImages || 5,
    delays: {
      pageLoad: options?.pageLoadDelay || 15000,
      afterScroll: options?.afterScrollDelay || 10000,
      beforeScreenshot: options?.beforeScreenshotDelay || 3000,
      beforeClose: options?.beforeCloseDelay || 5000,
      betweenActions: options?.betweenActionsDelay || 2000
    }
  };
  
  // Initialize session
  scrapingSessions.set(sessionId, {
    status: 'starting',
    progress: 0,
    logs: [],
    startTime: new Date()
  });
  
  // Send immediate response with session ID
  res.json({
    success: true,
    sessionId: sessionId,
    message: 'Scraping started',
    config: config
  });
  
  // Start scraping in background
  runScraper(sessionId, config).catch(error => {
    const session = scrapingSessions.get(sessionId);
    if (session) {
      session.status = 'error';
      session.error = error.message;
    }
  });
});

// API endpoint to get scraping status
app.get('/api/status/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = scrapingSessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json(session);
});

// API endpoint to get list of generated files
app.get('/api/files/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = scrapingSessions.get(sessionId);
  
  if (!session || !session.files) {
    return res.json({ files: [] });
  }
  
  res.json({ files: session.files });
});

// Main scraping function
async function runScraper(sessionId, config) {
  const session = scrapingSessions.get(sessionId);
  let browser;
  
  const log = (message, type = 'info') => {
    const logEntry = {
      time: new Date().toISOString(),
      type: type,
      message: message
    };
    session.logs.push(logEntry);
    console.log(`[${sessionId}] ${message}`);
  };
  
  const updateProgress = (progress, status) => {
    session.progress = progress;
    session.status = status;
  };
  
  try {
    log('🚀 Starting scraper...');
    updateProgress(5, 'initializing');
    
    // Launch browser
    log('📱 Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-blink-features=AutomationControlled'
      ]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    updateProgress(10, 'loading_page');
    log(`🌐 Navigating to ${config.url}...`);
    
    await page.goto(config.url, { 
      waitUntil: 'domcontentloaded',
      timeout: 120000 
    });
    
    log('✅ Page loaded! Waiting for content...');
    updateProgress(20, 'waiting_content');
    await wait(config.delays.pageLoad);
    
    // Scroll page
    log('📜 Scrolling to load all content...');
    updateProgress(30, 'scrolling');
    await autoScroll(page);
    await wait(config.delays.afterScroll);
    
    // Take homepage screenshot
    log('📸 Taking homepage screenshot...');
    updateProgress(40, 'screenshot_homepage');
    await page.evaluate(() => window.scrollTo(0, 0));
    await wait(config.delays.beforeScreenshot);
    
    const timestamp = sessionId;
    const homepageScreenshot = `${timestamp}-01-homepage.png`;
    await page.screenshot({ 
      path: path.join(screenshotPath, homepageScreenshot),
      fullPage: true 
    });
    
    // Extract homepage data
    log('🔍 Extracting homepage data...');
    const homepageData = await extractPageData(page);
    
    const results = {
      homepage: homepageData,
      screenshots: [homepageScreenshot],
      clickedImages: [],
      contactPage: null
    };
    
    // Click images if enabled
    if (config.clickImages) {
      log('🖼️  Finding clickable images...');
      updateProgress(50, 'clicking_images');
      
      const clickableImages = await page.evaluate((maxImages) => {
        const images = [];
        document.querySelectorAll('img').forEach((img, index) => {
          const parentLink = img.closest('a');
          if (parentLink && parentLink.href && !parentLink.href.includes('#')) {
            images.push({
              index: index,
              src: img.src,
              alt: img.alt || 'no-alt',
              linkHref: parentLink.href
            });
          }
        });
        return images.slice(0, maxImages);
      }, config.maxImages);
      
      log(`Found ${clickableImages.length} clickable images`);
      
      for (let i = 0; i < clickableImages.length; i++) {
        const img = clickableImages[i];
        log(`📸 Processing image ${i + 1}/${clickableImages.length}: ${img.alt}`);
        updateProgress(50 + (i / clickableImages.length) * 20, 'clicking_images');
        
        try {
          const newPage = await browser.newPage();
          await newPage.setViewport({ width: 1920, height: 1080 });
          await newPage.goto(img.linkHref, { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
          });
          
          await wait(config.delays.pageLoad);
          
          const imgScreenshot = `${timestamp}-02-image-${i + 1}.png`;
          await newPage.screenshot({ 
            path: path.join(screenshotPath, imgScreenshot),
            fullPage: true 
          });
          
          results.screenshots.push(imgScreenshot);
          results.clickedImages.push({
            ...img,
            screenshot: imgScreenshot
          });
          
          await newPage.close();
          await wait(config.delays.betweenActions);
          
        } catch (error) {
          log(`⚠️  Error processing image ${i + 1}: ${error.message}`, 'warning');
        }
      }
    }
    
    // Visit contact page if enabled
    if (config.visitContact) {
      log('🔍 Looking for contact page...');
      updateProgress(75, 'visiting_contact');
      
      const contactLink = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        const contactLink = links.find(link => {
          const text = link.innerText.toLowerCase();
          const href = link.href.toLowerCase();
          return text.includes('contact') || href.includes('contact') || 
                 text.includes('about') || href.includes('about');
        });
        return contactLink ? contactLink.href : null;
      });
      
      if (contactLink) {
        log(`✅ Found contact page: ${contactLink}`);
        
        const contactPage = await browser.newPage();
        await contactPage.setViewport({ width: 1920, height: 1080 });
        await contactPage.goto(contactLink, { 
          waitUntil: 'domcontentloaded',
          timeout: 60000 
        });
        
        await wait(config.delays.pageLoad);
        await autoScroll(contactPage);
        await wait(config.delays.afterScroll);
        
        await contactPage.evaluate(() => window.scrollTo(0, 0));
        await wait(config.delays.beforeScreenshot);
        
        const contactScreenshot = `${timestamp}-03-contact.png`;
        await contactPage.screenshot({ 
          path: path.join(screenshotPath, contactScreenshot),
          fullPage: true 
        });
        
        results.screenshots.push(contactScreenshot);
        results.contactPage = {
          url: contactLink,
          data: await extractPageData(contactPage),
          screenshot: contactScreenshot
        };
        
        await contactPage.close();
      } else {
        log('⚠️  Contact page not found', 'warning');
      }
    }
    
    // Save data
    log('💾 Saving results...');
    updateProgress(90, 'saving_results');
    
    const jsonFile = `${timestamp}-data.json`;
    const reportFile = `${timestamp}-report.txt`;
    const htmlFile = `${timestamp}-homepage.html`;
    
    fs.writeFileSync(
      path.join(outputPath, jsonFile),
      JSON.stringify(results, null, 2)
    );
    
    const report = generateReport(results, config);
    fs.writeFileSync(path.join(outputPath, reportFile), report);
    
    const html = await page.content();
    fs.writeFileSync(path.join(outputPath, htmlFile), html);
    
    // Store file references
    session.files = {
      screenshots: results.screenshots.map(s => `/screenshots/${s}`),
      json: `/output/${jsonFile}`,
      report: `/output/${reportFile}`,
      html: `/output/${htmlFile}`
    };
    
    // Wait before closing
    await wait(config.delays.beforeClose);
    
    log('✨ Scraping completed successfully!');
    updateProgress(100, 'completed');
    
    session.results = results;
    session.endTime = new Date();
    
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'error');
    updateProgress(session.progress, 'error');
    session.error = error.message;
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      log('🔒 Browser closed');
    }
  }
}

// Helper functions
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 500);
    });
  });
}

async function extractPageData(page) {
  return await page.evaluate(() => {
    const data = {
      title: document.title,
      url: window.location.href,
      heading: '',
      sections: [],
      links: [],
      images: [],
      adElements: { iframes: 0, adsbyGoogle: 0 }
    };
    
    const h1 = document.querySelector('h1');
    if (h1) data.heading = h1.innerText.trim();
    
    document.querySelectorAll('h2, h3').forEach(h => {
      data.sections.push(h.innerText.trim());
    });
    
    document.querySelectorAll('a[href]').forEach(link => {
      if (link.href && link.href !== '#') {
        data.links.push({
          text: link.innerText.trim() || '(no text)',
          url: link.href
        });
      }
    });
    
    document.querySelectorAll('img').forEach(img => {
      data.images.push({
        src: img.src,
        alt: img.alt || ''
      });
    });
    
    data.adElements.iframes = document.querySelectorAll('iframe[id*="google_ads"], iframe[id*="aswift"]').length;
    data.adElements.adsbyGoogle = document.querySelectorAll('ins.adsbygoogle').length;
    
    return data;
  });
}

function generateReport(results, config) {
  let report = `WEB SCRAPER - COMPLETE REPORT\n`;
  report += `==============================\n\n`;
  report += `URL: ${config.url}\n`;
  report += `Scraped: ${new Date().toLocaleString()}\n\n`;
  
  report += `HOMEPAGE:\n`;
  report += `  Title: ${results.homepage.title}\n`;
  report += `  Heading: ${results.homepage.heading}\n`;
  report += `  Sections: ${results.homepage.sections.length}\n`;
  report += `  Links: ${results.homepage.links.length}\n`;
  report += `  Images: ${results.homepage.images.length}\n\n`;
  
  if (results.clickedImages.length > 0) {
    report += `CLICKED IMAGES: ${results.clickedImages.length}\n`;
    results.clickedImages.forEach((img, i) => {
      report += `  ${i + 1}. ${img.alt}\n`;
    });
    report += `\n`;
  }
  
  if (results.contactPage) {
    report += `CONTACT PAGE:\n`;
    report += `  URL: ${results.contactPage.url}\n`;
    report += `  Title: ${results.contactPage.data.title}\n\n`;
  }
  
  report += `SCREENSHOTS: ${results.screenshots.length}\n`;
  report += `FILES GENERATED: JSON, HTML, Report, ${results.screenshots.length} images\n`;
  
  return report;
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║         🚀 WEB SCRAPER APPLICATION STARTED! 🚀               ║
║                                                              ║
║  Server running on port: ${PORT}                               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
});
