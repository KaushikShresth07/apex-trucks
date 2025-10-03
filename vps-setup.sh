#!/bin/bash

# Quick VPS Setup Script for Apex Trucks
# Run this on your Hostinger VPS: ssh root@89.116.51.122

echo "🚀 Setting up Apex Trucks on Hostinger VPS (89.116.51.122)..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
echo "📦 Installing essential packages..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js LTS
echo "📦 Installing Node.js LTS..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt-get install -y nodejs

# Verify Node.js installation
echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install PM2 globally
echo "📦 Installing PM2..."
npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
apt install -y nginx

# Install Certbot for SSL
echo "📦 Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Create application directory structure
echo "📁 Creating application directories..."
mkdir -p /var/www/apex-trucks/{data/trucks/images,logs}
mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled

# Set proper permissions
echo "🔐 Setting permissions..."
chown -R www-data:www-data /var/www/apex-trucks

# Create a quick test server file
echo "📝 Creating test server..."
cat > /var/www/apex-trucks/test.js << 'EOF'
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({
    message: 'Apex Trucks API Ready!',
    timestamp: new Date().toISOString(),
    status: 'healthy',
    server: '89.116.51.122'
  }));
});
server.listen(3001, '0.0.0.0', () => {
  console.log('✅ Test server running on port 3001');
});
EOF

# Start PM2 test server
echo "🚀 Starting test server..."
cd /var/www/apex-trucks
pm2 start test.js --name "test-server"

# Configure firewall
echo "🔥 Configuring firewall..."
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3001
ufw --force enable

echo ""
echo "✅ VPS setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Upload your project files to /var/www/apex-trucks/"
echo "2. Run: npm install && npm run build"
echo "3. Configure PM2: pm2 start ecosystem.config.js --env production"
echo "4. Setup Nginx: cp nginx-production.conf /etc/nginx/sites-available/apex-trucks"
echo "5. Enable site: ln -sf /etc/nginx/sites-available/apex-trucks /etc/nginx/sites-enabled/"
echo "6. Remove default: rm -f /etc/nginx/sites-enabled/default"
echo "7. Test Nginx: nginx -t"
echo "8. Restart Nginx: systemctl restart nginx"
echo "9. Get SSL: certbot --nginx -d 89.116.51.122"
echo ""
echo "🌐 Your VPS is ready! Test server running on http://89.116.51.122:3001"
echo "📊 PM2 status: pm2 status"
echo "📝 PM2 logs: pm2 logs test-server"
