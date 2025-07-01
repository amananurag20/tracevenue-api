const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const moment = require('moment');
const os = require('os');

// Log directory
const LOG_DIR = path.join(process.cwd(), 'logs');

// Environment info for dashboard
const ENV_INFO = {
  hostname: os.hostname(),
  platform: os.platform(),
  release: os.release(),
  uptime: os.uptime(),
  nodeVersion: process.version,
  env: process.env.NODE_ENV || 'development'
};

/**
 * @route GET /logs
 * @desc Root route - Display HTML error log view by default
 */

router.get('/view/html', async (req, res) => {
  try {
    // Pagination params
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 15;
    const startIndex = (page - 1) * perPage;
    const endIndex = page * perPage;
    
    // Get file filter (combined or error logs)
    const fileType = req.query.type || 'all';
    
    // Option to show/hide log viewer's own logs
    const showLoggerLogs = req.query.showLoggerLogs === 'true';
    
    // Collect logs from all log files
    const files = await fs.readdir(LOG_DIR);
    let logFiles = files.filter(file => file.endsWith('.log'));
    
    // Filter files based on type
    if (fileType === 'error') {
      logFiles = logFiles.filter(file => file.includes('error'));
    } else if (fileType === 'combined') {
      logFiles = logFiles.filter(file => file.includes('combined'));
    }
    
    let allLogs = [];
    
    for (const file of logFiles) {
      const filePath = path.join(LOG_DIR, file);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        
        const fileLogs = content
          .split('\n')
          .filter(line => line.trim())
          .map(line => {
            try {
              const parsed = JSON.parse(line);
              // Add source file info
              parsed.sourceFile = file;
              return parsed;
            } catch (e) {
              return null;
            }
          })
          .filter(entry => entry !== null);
          
        allLogs = [...allLogs, ...fileLogs];
      } catch (err) {
        console.error(`Error reading file ${file}:`, err);
      }
    }
    
    // Apply additional filters
    const level = req.query.level;
    const search = req.query.search;
    
    // Filter out logs related to the log viewer itself
    allLogs = allLogs.filter(log => {
      // Determine URL from either url or originalUrl field
      const logUrl = log.url || log.meta?.url || '';
      const originalUrl = log.originalUrl || log.meta?.originalUrl || '';
      
      // Skip logs for log viewer requests (unless explicitly shown)
      if (!showLoggerLogs && (
          logUrl.includes('/logs/view/html') || logUrl.includes('/logs/files') || 
          logUrl.includes('/logs/file/') || logUrl === '/logs' ||
          originalUrl.includes('/logs/view/html') || originalUrl.includes('/logs/files') || 
          originalUrl.includes('/logs/file/') || originalUrl === '/logs')) {
        return false;
      }
      
      // Apply level filter if provided
      if (level && log.level !== level) {
        return false;
      }
      
      // Apply search term filter if provided
      if (search) {
        const searchLower = search.toLowerCase();
        return JSON.stringify(log).toLowerCase().includes(searchLower);
      }
      
      return true;
    });
    
    // Sort logs by timestamp (newest first)
    allLogs.sort((a, b) => {
      const dateA = new Date(a.timestamp || 0);
      const dateB = new Date(b.timestamp || 0); 
      return dateB - dateA;
    });
    
    // Get total count and calculate total pages
    const totalLogs = allLogs.length;
    const totalPages = Math.ceil(totalLogs / perPage);
    
    // Format time for display
    const formatTimeAgo = timestamp => {
      if (!timestamp) return 'unknown time';
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      
      // Format time ago
      const minutesAgo = Math.floor(diff / (1000 * 60));
      if (minutesAgo < 60) return `${minutesAgo} minute${minutesAgo === 1 ? '' : 's'} ago`;
      
      const hoursAgo = Math.floor(diff / (1000 * 60 * 60));
      if (hoursAgo < 24) return `${hoursAgo === 1 ? 'an' : hoursAgo} hour${hoursAgo === 1 ? '' : 's'} ago`;
      
      const daysAgo = Math.floor(diff / (1000 * 60 * 60 * 24));
      return `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`;
    };
    
    // Generate pagination links
    const generatePaginationLinks = (currentPage, totalPages) => {
      // Add page size options
      const pageSizes = [10, 15, 20, 25, 30, 50, 100];
      
      // Create query params
      const createQueryParams = (p, size) => {
        const params = new URLSearchParams();
        params.append('page', p);
        params.append('per_page', size || perPage);
        if (level) params.append('level', level);
        if (search) params.append('search', search);
        if (fileType !== 'all') params.append('type', fileType);
        if (showLoggerLogs) params.append('showLoggerLogs', 'true');
        return params.toString();
      };
      
      // Generate pagination HTML
      return `
        <div style="margin: 10px 0;">
          Logs ${startIndex + 1} to ${Math.min(startIndex + perPage, totalLogs)} of total ${totalLogs}. 
          Show 
          ${pageSizes.map(size => 
            `<a href="?${createQueryParams(1, size)}" ${perPage === size ? 'style="font-weight: bold;"' : ''}>${size}</a>`
          ).join(', ')} 
          logs per page.
        </div>
        <div style="margin: 10px 0;">
          ${currentPage > 1 ? `<a href="?${createQueryParams(1)}" style="margin: 0 5px;">First</a>` : ''}
          ${currentPage > 1 ? `<a href="?${createQueryParams(currentPage-1)}" style="margin: 0 5px;">Prev</a>` : ''}
          
          ${Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
            const pageNum = i + 1;
            if (pageNum === currentPage) {
              return `<span style="font-weight: bold; margin: 0 5px;">${pageNum}</span>`;
            } else {
              return `<a href="?${createQueryParams(pageNum)}" style="margin: 0 5px;">${pageNum}</a>`;
            }
          }).join('')}
          
          ${totalPages > 10 ? '...' : ''}
          ${currentPage < totalPages ? `<a href="?${createQueryParams(currentPage+1)}" style="margin: 0 5px;">Next</a>` : ''}
          ${currentPage < totalPages ? `<a href="?${createQueryParams(totalPages)}" style="margin: 0 5px;">Last</a>` : ''}
        </div>
      `;
    };
    
    // Generate filter options
    const generateFilterOptions = () => {
      // Level options
      const levels = ['error', 'warn', 'info', 'http', 'debug'];
      
      // File type options
      const fileTypes = [
        { value: 'all', label: 'All Logs' },
        { value: 'error', label: 'Error Logs' },
        { value: 'combined', label: 'Combined Logs' }
      ];
      
      return `
        <div style="margin: 20px 0; padding: 10px; background-color: #f9f9f9; border-radius: 5px;">
          <form action="/logs/view/html" method="get">
            <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
              <div>
                <label for="type">Log Type:</label>
                <select id="type" name="type" style="padding: 5px;">
                  ${fileTypes.map(type => 
                    `<option value="${type.value}" ${fileType === type.value ? 'selected' : ''}>${type.label}</option>`
                  ).join('')}
                </select>
              </div>
              
              <div>
                <label for="level">Log Level:</label>
                <select id="level" name="level" style="padding: 5px;">
                  <option value="">All Levels</option>
                  ${levels.map(l => 
                    `<option value="${l}" ${level === l ? 'selected' : ''}>${l.toUpperCase()}</option>`
                  ).join('')}
                </select>
              </div>
              
              <div>
                <label for="search">Search:</label>
                <input type="text" id="search" name="search" value="${search || ''}" placeholder="Search logs..." style="padding: 5px; width: 200px;">
              </div>
              
              <div style="display: flex; align-items: center;">
                <input type="checkbox" id="showLoggerLogs" name="showLoggerLogs" value="true" ${showLoggerLogs ? 'checked' : ''} style="margin-right: 5px;">
                <label for="showLoggerLogs">Show Logger Logs</label>
              </div>
              
              <input type="hidden" name="per_page" value="${perPage}">
              <button type="submit" style="padding: 5px 15px; background-color: #0066cc; color: white; border: none; border-radius: 3px; cursor: pointer;">Apply</button>
              <a href="/logs/view/html" style="padding: 5px 15px; background-color: #f0f0f0; color: #333; text-decoration: none; border-radius: 3px;">Reset</a>
            </div>
          </form>
        </div>
      `;
    };
    
    // Build HTML response
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Log Viewer - TraceVenue-API</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; 
            margin: 0; 
            padding: 20px;
            background-color: #f4f6f8;
            color: #333;
            line-height: 1.6; 
          }
          .container {
            max-width: 1600px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 { 
            color: #2c3e50; 
            margin-bottom: 20px; 
            font-size: 24px;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 10px;
          }
          table { 
            border-collapse: collapse; 
            width: 100%; 
            margin-top: 20px; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          th, td { 
            padding: 12px 15px; 
            text-align: left; 
            border-bottom: 1px solid #e0e0e0; 
          }
          th { 
            background-color: #f8f9fa; 
            font-weight: 600;
            color: #495057;
            position: sticky; 
            top: 0; 
            z-index: 10;
          }
          tr:hover { background-color: #f1f3f5; }
          .error-message { max-width: 600px; word-break: break-word; font-size: 14px; }
          .time-ago { white-space: nowrap; font-size: 13px; color: #555; }
          .code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace; font-size: 13px; }
          .type { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace; font-weight: 500; }
          a { color: #007bff; text-decoration: none; }
          a:hover { text-decoration: underline; }
          
          .level-label {
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            color: white;
            text-transform: uppercase;
          }
          .error-level { background-color: #d32f2f; } /* Red */
          .warn-level { background-color: #f57c00; } /* Orange */
          .info-level { background-color: #0288d1; } /* Blue */
          .http-level { background-color: #388e3c; } /* Green */
          .debug-level { background-color: #7b1fa2; } /* Purple */

          .details-link { font-size: 12px; color: #007bff; margin-left: 10px; cursor: pointer; }
          .host-col { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          
          .controls-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 15px;
          }

          .pagination { display: flex; align-items: center; margin: 20px 0; justify-content: center; flex-wrap: wrap;}
          .pagination a, .pagination span { 
            padding: 8px 12px; 
            margin: 0 3px; 
            border: 1px solid #dee2e6; 
            border-radius: 4px;
            color: #007bff;
            font-size: 14px;
          }
          .pagination span { background-color: #007bff; color: white; border-color: #007bff; font-weight: bold; }
          .pagination a:hover { background-color: #e9ecef; }
          
          .stats-summary { 
            background-color: #e9ecef; 
            padding: 15px; 
            border-radius: 5px; 
            margin-bottom: 20px; 
            font-size: 14px;
            border: 1px solid #ced4da;
          }
          .stats-summary strong { color: #343a40; }

          .filter-container { 
            background-color: #f8f9fa; 
            padding: 15px; 
            border-radius: 5px; 
            margin-bottom: 20px;
            border: 1px solid #dee2e6;
          }
          .filter-container form { margin-bottom: 0; }
          .filter-container label { margin-right: 8px; font-weight: 500; font-size: 14px; }
          .filter-container select, .filter-container input[type="text"] { 
            padding: 8px 10px; 
            border-radius: 4px; 
            border: 1px solid #ced4da; 
            font-size: 14px;
            margin-right: 10px;
          }
          .filter-container input[type="checkbox"] { margin-right: 5px; vertical-align: middle; }
          .filter-container button, .filter-container a.button-link {
            padding: 8px 15px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            text-decoration: none;
            display: inline-block;
            margin-left: 5px;
          }
          .filter-container a.button-link {
            background-color: #6c757d;
          }
          .filter-container button:hover, .filter-container a.button-link:hover {
            opacity: 0.9;
          }
          .filter-form-row {
            display: flex; 
            gap: 15px; 
            align-items: center; 
            flex-wrap: wrap;
          }

          #detailsModal {
            display: none; 
            position: fixed; 
            z-index: 1001; /* Ensure modal is on top */
            left: 0; 
            top: 0; 
            width: 100%; 
            height: 100%; 
            background-color: rgba(0,0,0,0.6);
            overflow: auto; /* Enable scroll if content is too long */
          }
          .modal-content {
            background-color: white; 
            margin: 5% auto; /* Adjusted margin for better centering */
            padding: 25px; 
            width: 85%; 
            max-width: 900px; 
            max-height: 85vh; /* Max height relative to viewport height */
            overflow-y: auto; /* Scroll within modal content */
            border-radius: 8px; 
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            position: relative;
          }
          .modal-content h3 {
            margin-top: 0;
            color: #2c3e50;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 10px;
          }
          #detailsContent { 
            white-space: pre-wrap; 
            font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace; 
            font-size: 13px;
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            border: 1px solid #dee2e6;
            max-height: 60vh; /* Max height for content, enables internal scroll */
            overflow-y: auto;
          }
          .modal-close-button {
            position: absolute;
            top: 15px;
            right: 20px;
            font-size: 24px;
            font-weight: bold;
            color: #aaa;
            cursor: pointer;
            background: none;
            border: none;
          }
          .modal-close-button:hover {
            color: #333;
          }

          @media (max-width: 992px) {
            .filter-form-row { flex-direction: column; align-items: stretch; }
            .filter-container select, .filter-container input[type="text"] { width: 100%; margin-bottom: 10px; }
            .filter-container button, .filter-container a.button-link { width: 100%; margin-left: 0; margin-top: 5px;}
          }
          @media (max-width: 768px) {
            body { padding: 10px; }
            .container { padding: 15px; }
            h1 { font-size: 20px; }
            th, td { padding: 8px 10px; font-size: 13px; }
            .host-col, .code-col { display: none; }
            .time-ago { font-size: 12px; }
            .error-message { max-width: 100%; }
            .modal-content { width: 95%; margin: 10% auto; max-height: 90vh; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Log Viewer - TraceVenue-API</h1>
          <div class="stats-summary">
            <div>Total logs: <strong>${totalLogs}</strong></div>
            <div>Current filter: <strong>${level ? level.toUpperCase() : 'All levels'}</strong> 
                                | <strong>${fileType === 'all' ? 'All logs' : (fileType.charAt(0).toUpperCase() + fileType.slice(1)) + ' logs'}</strong>
                                ${search ? ` | Search: "<strong>${search}</strong>"` : ''}</div>
          </div>
          
          ${generateFilterOptions()}
          
          <div class="controls-container">
            ${generatePaginationLinks(page, totalPages)}
          </div>
          
          <table>
            <thead>
              <tr>
                <th class="host-col">Host</th>
                <th class="code-col">Code</th>
                <th>Level</th>
                <th>Message</th>
                <th>User</th>
                <th>When</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              ${allLogs.slice(startIndex, endIndex).map(log => {
                // Extract information from the log object
                const host = log.hostname || log.meta?.hostname || 'Server';
                
                // Determine log type and code
                let code, type, message;
                const logLevel = (log.level || 'info').toLowerCase();
                
                if (logLevel === 'error') {
                  code = log.code || 'EXCEPTION';
                  type = 'ERROR'; // Simplified type for display
                  message = log.message || 'Unknown Error';
                } else if (logLevel === 'http') {
                  const statusCode = log.statusCode || log.meta?.statusCode;
                  code = statusCode ? `HTTP ${statusCode}` : 'HTTP';
                  type = 'HTTP';
                  message = log.message || `${log.method} ${log.url || log.originalUrl || ''}`;
                } else {
                  code = log.code || logLevel.toUpperCase();
                  type = logLevel.toUpperCase();
                  message = log.message || 'Log Entry';
                }
                
                // Extract user information
                let determinedUserId = null;
                if (log.userId && log.userId !== 'anonymous') {
                    determinedUserId = log.userId;
                } else if (log.meta && log.meta.userId && log.meta.userId !== 'anonymous') {
                    determinedUserId = log.meta.userId;
                } else if (log.userId === 'anonymous') { // If primary was 'anonymous' and meta wasn't better
                    determinedUserId = 'anonymous';
                } else if (log.meta && log.meta.userId === 'anonymous') { // If meta was 'anonymous' and primary was missing/null
                    determinedUserId = 'anonymous';
                }

                let determinedUserEmail = null;
                if (log.email) {
                    determinedUserEmail = log.email;
                } else if (log.meta && log.meta.email) {
                    determinedUserEmail = log.meta.email;
                }

                let userDisplay = 'N/A';
                if (determinedUserId && determinedUserId !== 'anonymous') {
                  userDisplay = determinedUserId;
                } else if (determinedUserEmail) {
                  userDisplay = determinedUserEmail;
                } else if (determinedUserId === 'anonymous') { // Catches cases where it was explicitly 'anonymous' and no email.
                  userDisplay = 'Anonymous';
                }

                // Format time ago
                const timeAgo = formatTimeAgo(log.timestamp);
                const sourceFile = log.sourceFile || 'N/A';
                
                return `
                  <tr>
                    <td class="host-col">${host}</td>
                    <td class="code-col code">${code}</td>
                    <td><span class="level-label ${logLevel}-level">${type}</span></td>
                    <td class="error-message">
                      ${message}
                      <a class="details-link"
                         onclick="showDetails('${encodeURIComponent(JSON.stringify(log)).replace(/'/g, "\\'")}')">
                         Details
                      </a>
                    </td>
                    <td class="code">${userDisplay}</td>
                    <td class="time-ago">${timeAgo}</td>
                    <td class="code">${sourceFile}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div class="controls-container" style="margin-top: 20px;">
             ${generatePaginationLinks(page, totalPages)}
          </div>
        </div>
        
        <div id="detailsModal">
          <div class="modal-content">
            <button class="modal-close-button" onclick="hideDetails()">&times;</button>
            <h3>Log Details</h3>
            <div id="detailsContent"></div>
          </div>
        </div>
        
        <script>
          function showDetails(logData) {
            try {
              const log = JSON.parse(decodeURIComponent(logData));
              const modalContent = document.getElementById('detailsContent');
              modalContent.innerHTML = JSON.stringify(log, null, 2);
              document.getElementById('detailsModal').style.display = 'block';
            } catch (e) {
              alert('Error showing details: ' + e.message);
            }
          }
          
          function hideDetails() {
            document.getElementById('detailsModal').style.display = 'none';
            document.getElementById('detailsContent').innerHTML = ''; // Clear content
          }
          
          // Close modal when clicking outside
          window.onclick = function(event) {
            if (event.target === document.getElementById('detailsModal')) {
              hideDetails();
            }
          }
          
          // Close modal with Escape key
          document.addEventListener('keydown', function(event) {
            if (event.key === "Escape") {
              hideDetails();
            }
          });
        </script>
      </body>
      </html>
    `;
    
    // Send HTML response
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlResponse);
  } catch (error) {
    console.error('Error generating log view:', error); // Log the error on the server
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; color: #333; background-color: #f4f6f8; }
          .error-container { max-width: 800px; margin: 50px auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #d32f2f; }
          pre { background-color: #f0f0f0; padding: 15px; border-radius: 4px; overflow-x: auto; }
        </style>
      </head>
        <body>
          <div class="error-container">
            <h1>Error Generating Log View</h1>
            <p>We encountered an issue while trying to display the logs. Please try again later.</p>
            <p><strong>Error Message:</strong> ${error.message}</p>
            <details>
              <summary>Error Stack (for debugging)</summary>
              <pre>${error.stack}</pre>
            </details>
          </div>
        </body>
      </html>
    `);
  }
});

module.exports = router; 