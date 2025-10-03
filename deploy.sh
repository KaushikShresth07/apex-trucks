#!/bin/bash

# Apex Trucks VPS Deployment Script
# This script sets up the complete environment on your Hostinger VPS

set -e

echo "🚀 Starting Apex Trucks deployment on VPS..."

# Update system packages
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js LTS
echo "📦 Installing Node.js LTS..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt-get install -y nodejs

# Install PM2 globally
echo "📦 Installing PM2..."
npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
apt install -y nginx

# Install Certbot for SSL
echo "📦 Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Install Git
echo "📦 Installing Git..."
apt install -y git

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /var/www/apex-trucks
cd /var/www/apex-trucks

# Clone or copy your project here
echo "📁 Setting up project files..."
# Note: You'll need to upload your project files here or clone from a repository

# Create logs directory
mkdir -p logs

# Create data directories
mkdir -p data/trucks/images

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

# Build the React application
echo "🏗️ Building React application..."
npm run build

# Set up PM2
echo "⚙️ Configuring PM2..."
pm2 install pm2-logrotate
pm2 startup
pm2 save

# Configure Nginx
echo "⚙️ Configuring Nginx..."
cp nginx-production.conf /etc/nginx/sites-available/apex-trucks
ln -sf /etc/nginx/sites-available/apex-trucks /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "🔍 Testing Nginx configuration..."
nginx -t

# Start services
echo "🚀 Starting services..."
pm2 start ecosystem.config.js --env production
systemctl restart nginx
systemctl enable nginx

# Configure firewall
echo "🔥 Configuring firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# Get SSL certificate
echo "🔒 Getting SSL certificate..."
certbot --nginx -d 89.116.51.122 --non-interactive --agree-tos --email admin@89.116.51.122

# Set up automatic SSL renewal
echo "🔄 Setting up SSL renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

echo "✅ Deployment completed successfully!"
echo "🌐 Your website should now be accessible at: https://89.116.51.122"
echo "📊 Check status with: pm2 status"
echo "📝 Check logs with: pm2 logs apex-trucks-api"
echo "🔄 Restart API with: pm2 restart apex-trucks-api"
echo "🔄 Restart Nginx with: systemctl restart nginx"
