const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs-extra');

/**
 * Generate a PDF certificate from HTML template
 * @param {Object} data - { name, event_name, position, event_date, erp, college }
 * @returns {Promise<string>} - Path to the generated PDF
 */
const generateCertificatePDF = async (data) => {
  const { name, event_name, position, event_date, erp, college } = data;
  
  // Format position for display
  const displayPosition = position === 'runnerup1' ? '1st Runner Up' : 
                          position === 'runnerup2' ? '2nd Runner Up' : 
                          position.charAt(0).toUpperCase() + position.slice(1);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
            
            body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background-color: #f0f0f0;
                font-family: 'Outfit', sans-serif;
            }
            .certificate-container {
                width: 1000px;
                height: 700px;
                padding: 40px;
                background: white;
                position: relative;
                box-sizing: border-box;
                border: 20px solid transparent;
                background-image: linear-gradient(white, white), 
                                  linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
                background-origin: border-box;
                background-clip: content-box, border-box;
                box-shadow: 0 20px 50px rgba(0,0,0,0.1);
            }
            .inner-border {
                border: 2px solid #e2e8f0;
                height: 100%;
                width: 100%;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 40px;
                position: relative;
            }
            .watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 150px;
                color: rgba(124, 58, 237, 0.03);
                z-index: 0;
                font-weight: 900;
                white-space: nowrap;
            }
            .header {
                z-index: 1;
                text-align: center;
            }
            .college-name {
                font-size: 18px;
                font-weight: 600;
                color: #6366f1;
                text-transform: uppercase;
                letter-spacing: 4px;
                margin-bottom: 20px;
            }
            .title {
                font-family: 'Playfair Display', serif;
                font-size: 56px;
                color: #1e293b;
                margin: 0;
                font-style: italic;
            }
            .subtitle {
                font-size: 16px;
                color: #64748b;
                margin-top: 10px;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            .award-to {
                margin-top: 40px;
                font-size: 20px;
                color: #475569;
            }
            .student-name {
                font-family: 'Playfair Display', serif;
                font-size: 48px;
                font-weight: 700;
                color: #7c3aed;
                margin: 15px 0;
                border-bottom: 2px solid #ddd;
                padding-bottom: 5px;
                min-width: 400px;
                text-align: center;
            }
            .details {
                margin-top: 20px;
                font-size: 18px;
                color: #334155;
                text-align: center;
                line-height: 1.6;
                z-index: 1;
            }
            .highlight {
                font-weight: 700;
                color: #1e293b;
            }
            .footer {
                margin-top: auto;
                width: 100%;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                z-index: 1;
            }
            .signature-box {
                text-align: center;
                width: 200px;
            }
            .signature-line {
                border-top: 1px solid #94a3b8;
                margin-bottom: 10px;
            }
            .signature-name {
                font-weight: 600;
                font-size: 14px;
                color: #1e293b;
            }
            .signature-title {
                font-size: 12px;
                color: #64748b;
            }
            .event-date-box {
                text-align: center;
            }
            .date-label {
                font-size: 12px;
                color: #64748b;
                text-transform: uppercase;
                margin-bottom: 5px;
            }
            .date-value {
                font-weight: 600;
                color: #1e293b;
            }
            .certificate-id {
                position: absolute;
                bottom: 15px;
                right: 20px;
                font-size: 10px;
                color: #94a3b8;
                font-family: monospace;
            }
        </style>
    </head>
    <body>
        <div class="certificate-container">
            <div class="inner-border">
                <div class="watermark">CAMPUSRANK</div>
                <div class="header">
                    <div class="college-name">${college}</div>
                    <h1 class="title">Certificate of Achievement</h1>
                    <div class="subtitle">This is to certify that</div>
                </div>
                
                <div class="award-to">the award is proudly presented to</div>
                <div class="student-name">${name}</div>
                
                <div class="details">
                    for securing <span class="highlight">${displayPosition}</span> in the event <br>
                    <span class="highlight" style="font-size: 24px;">"${event_name}"</span> <br>
                    organized with excellence and dedication.
                </div>
                
                <div class="footer">
                    <div class="signature-box">
                        <div class="signature-line"></div>
                        <div class="signature-name">Event Coordinator</div>
                        <div class="signature-title">Official Signature</div>
                    </div>
                    
                    <div class="event-date-box">
                        <div class="date-label">Event Date</div>
                        <div class="date-value">${new Date(event_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    </div>
                    
                    <div class="signature-box">
                        <div class="signature-line"></div>
                        <div class="signature-name">Head of Club</div>
                        <div class="signature-title">Official Signature</div>
                    </div>
                </div>
                
                <div class="certificate-id">ID: ${erp}-${Date.now()}</div>
            </div>
        </div>
    </body>
    </html>
  `;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1000, height: 700 });
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const fileName = `cert_${erp}_${Date.now()}.pdf`;
    const dirPath = path.join(__dirname, '..', 'uploads', 'e-certificates');
    await fs.ensureDir(dirPath);
    const filePath = path.join(dirPath, fileName);
    
    await page.pdf({
      path: filePath,
      width: '1000px',
      height: '700px',
      printBackground: true
    });

    await browser.close();
    return `/uploads/e-certificates/${fileName}`;
  } catch (error) {
    if (browser) await browser.close();
    throw error;
  }
};

module.exports = { generateCertificatePDF };
