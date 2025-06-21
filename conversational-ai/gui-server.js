/**
 * Simple HTTP Server for Training GUI
 * Serves the Enhanced Financial Training AI web interface
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;

// MIME type mapping
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return mimeTypes[ext] || 'application/octet-stream';
}

function serveFile(filePath, res) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>');
            return;
        }
        
        const contentType = getContentType(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

function serveAPI(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // API endpoints
    if (pathname === '/api/scenarios') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            scenarios: [
                {
                    id: 'frustrated_sarah',
                    name: 'Frustrated Sarah',
                    description: 'Fraud concern, high emotion',
                    difficulty: 'hard',
                    emotion: 'frustrated'
                },
                {
                    id: 'elderly_robert',
                    name: 'Elderly Robert',
                    description: 'Needs help, patient but confused',
                    difficulty: 'medium',
                    emotion: 'confused'
                },
                {
                    id: 'anxious_maria',
                    name: 'Anxious Maria',
                    description: 'Compromised account, very worried',
                    difficulty: 'medium',
                    emotion: 'anxious'
                }
            ]
        }));
        return;
    }
    
    if (pathname === '/api/voice/test' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                console.log(`🔊 Voice Test Request: ${data.text}`);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Voice test completed (server-side simulation)',
                    text: data.text
                }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }
    
    if (pathname === '/api/analyze' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const message = data.message || '';
                
                // Simple analysis simulation
                const analysis = {
                    responseTime: 2.5 + Math.random() * 2,
                    empathyScore: Math.min(10, Math.max(0, 
                        (message.toLowerCase().includes('sorry') ? 3 : 0) +
                        (message.toLowerCase().includes('understand') ? 2 : 0) +
                        (message.toLowerCase().includes('help') ? 2 : 0) +
                        Math.random() * 5
                    )),
                    professionalismScore: Math.min(10, Math.max(0,
                        8 - (message.toLowerCase().match(/\b(yeah|ok|sure)\b/g) || []).length * 2 +
                        Math.random() * 2
                    )),
                    jargonScore: Math.min(100, 
                        ((message.toLowerCase().match(/\b(authenticate|verification|protocol|system)\b/g) || []).length / 
                        message.split(' ').length) * 100
                    )
                };
                
                console.log(`📊 Analysis for: "${message.substring(0, 50)}..."`);
                console.log(`   Empathy: ${analysis.empathyScore.toFixed(1)}/10`);
                console.log(`   Professionalism: ${analysis.professionalismScore.toFixed(1)}/10`);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, analysis }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }
    
    // 404 for unknown API endpoints
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API endpoint not found' }));
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    const pathname = parsedUrl.pathname;
    
    console.log(`📡 ${req.method} ${pathname}`);
    
    // Handle API requests
    if (pathname.startsWith('/api/')) {
        serveAPI(req, res);
        return;
    }
    
    // Serve static files
    let filePath = path.join(__dirname, pathname === '/' ? 'training-gui.html' : pathname);
    
    // Security: prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/html' });
        res.end('<h1>403 Forbidden</h1>');
        return;
    }
    
    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // Try with .html extension
            if (!path.extname(filePath)) {
                filePath += '.html';
                fs.access(filePath, fs.constants.F_OK, (err) => {
                    if (err) {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end('<h1>404 Not Found</h1>');
                    } else {
                        serveFile(filePath, res);
                    }
                });
            } else {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>');
            }
        } else {
            serveFile(filePath, res);
        }
    });
});

server.listen(PORT, () => {
    console.log(`🌐 Enhanced Financial Training AI GUI Server`);
    console.log(`   Server running at: http://localhost:${PORT}`);
    console.log(`   Open your browser and visit the URL above`);
    console.log(`   Features available:`);
    console.log(`   • 🎭 Interactive training scenarios`);
    console.log(`   • 🗣️  Voice synthesis simulation`);
    console.log(`   • 📊 Real-time performance analysis`);
    console.log(`   • 💬 Natural conversation patterns`);
    console.log('');
    console.log('📝 API Endpoints:');
    console.log('   GET  /api/scenarios     - List available scenarios');
    console.log('   POST /api/voice/test    - Test voice synthesis');
    console.log('   POST /api/analyze       - Analyze message quality');
    console.log('');
    console.log('🔌 Ready for training sessions!');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server closed gracefully');
        process.exit(0);
    });
});

// Error handling
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.log('💡 Try running with a different port: PORT=3001 npm run gui');
    } else {
        console.error('❌ Server error:', err);
    }
    process.exit(1);
});

module.exports = server; 