# 🚀 Apex Trucks VPS Deployment Guide

This guide will help you deploy your Apex Trucks website to your Hostinger VPS at `89.116.51.122`.

## 📋 Prerequisites

- Access to your VPS via SSH: `ssh root@89.116.51.122`
- Your project files uploaded to the VPS

## 🔧 Method 1: Automated Deployment (Recommended)

### Step 1: Upload Project Files

```bash
# On your local machine, compress the project
tar -czf apex-trucks.tar.gz --exclude=node_modules --exclude=.git .

# Upload to VPS
scp apex-trucks.tar.gz root@89.116.51.122:/root/
```

### Step 2: Run Deployment Script

```bash
# SSH into your VPS
ssh root@89.116.51.122

# Extract project files
cd /root
tar -xzf apex-trucks.tar.gz -C /var/www/apex-trucks/
cd /var/www/apex-trucks

# Make deployment script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

The script will:
- ✅ Install Node.js, PM2, Nginx, and Certbot
- ✅ Set up directories and permissions
- ✅ Install dependencies and build the React app
- ✅ Configure PM2 for process management
- ✅ Configure Nginx with SSL
- ✅ Set up automatic SSL renewal

## 🔧 Method 2: Manual Deployment

### Step 1: System Setup

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx

# Install Git
apt install -y git
```

### Step 2: Project Setup

```bash
# Create application directory
mkdir -p /var/www/apex-trucks
cd /var/www/apex-trucks

# Upload your project files here (use FTP, SCP, or Git)
# ... upload your files ...

# Install dependencies
npm install

# Build React app
npm run build

# Create data directories
mkdir -p data/trucks/images logs
```

### Step 3: Configure PM2

```bash
# Start the API server with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup

# View status
pm2 status
pm2 logs apex-trucks-api
```

### Step 4: Configure Nginx

```bash
# Copy Nginx configuration
cp nginx-production.conf /etc/nginx/sites-available/apex-trucks
ln -sf /etc/nginx/sites-available/apex-trucks /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx
```

### Step 5: Setup SSL Certificate

```bash
# Get SSL certificate
certbot --nginx -d 89.116.51.122 --non-interactive --agree-tos --email admin@89.116.51.122

# Setup automatic renewal
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
```

### Step 6: Configure Firewall

```bash
# Configure UFW firewall
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable
```

## 🔧 Method 3: Docker Deployment

### Option A: Single Container with Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option B: Build Docker Image Locally and Deploy

```bash
# On your local machine
docker build -t apex-trucks:latest .
docker save apex-trucks:latest > apex-trucks-image.tar

# Upload to VPS
scp apex-trucks-image.tar root@89.116.51.122:/root/

# On VPS
docker load < apex-trucks-image.tar
docker run -d -p 80:80 -p 3001:3001 --name apex-trucks apex-trucks:latest
```

## 🔍 Post-Deployment Verification

### Check Services Status

```bash
# Check PM2 status
pm2 status

# Check Nginx status
systemctl status nginx

# Check API server logs
pm2 logs apex-trucks-api --lines 50

# Check Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Test Endpoints

```bash
# Test API health
curl http://localhost:3001/api/status

# Test website
curl -I https://89.116.51.122
curl -I http://89.116.51.122/health
```

### Check File Permissions

```bash
# Ensure data directory has proper permissions
chown -R www-data:www-data /var/www/apex-trucks/data
chmod -R 755 /var/www/apex-trucks/data
```

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. API Server Not Starting
```bash
# Check PM2 logs
pm2 logs apex-trucks-api

# Restart PM2
pm2 restart apex-trucks-api

# Check if port 3001 is in use
netstat -tlnp | grep 3001
```

#### 2. Nginx Configuration Errors
```bash
# Test Nginx config
nginx -t

# Check Nginx error logs
tail -f /var/log/nginx/error.log
```

#### 3. SSL Certificate Issues
```bash
# Check certificate status
certbot certificates

# Renew certificate manually
certbot renew --force-renewal
```

#### 4. Permission Issues
```bash
# Fix ownership
chown -R root:root /var/www/apex-trucks
chown -R www-data:www-data /var/www/apex-trucks/data

# Fix permissions
chmod -R 755 /var/www/apex-trucks
chmod -R 755 /var/www/apex-trucks/data
```

## 📊 Monitoring and Maintenance

### View Real-time Logs
```bash
# PM2 logs
pm2 logs apex-trucks-api --lines 100 -f

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
# Restart API
pm2 restart apex-trucks-api

# Restart Nginx
systemctl restart nginx

# Restart everything
pm2 restart all
systemctl restart nginx
```

### Backup Data
```bash
# Backup truck data
tar -czf backup-$(date +%Y%m%d).tar.gz /var/www/apex-trucks/data/

# Setup automatic backup (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * tar -czf /root/backups/backup-$(date +\%Y\%m\%d).tar.gz /var/www/apex-trucks/data/") | crontab -
```

## 🌐 Access Your Website

Once deployment is complete, your website should be accessible at:

- **HTTP**: http://89.116.51.122 (will redirect to HTTPS)
- **HTTPS**: https://89.116.51.122
- **API**: https://89.116.51.122/api/trucks
- **Health Check**: https://89.116.51.122/health

## 📞 Support

If you encounter any issues during deployment:

1. Check the logs: `pm2 logs apex-trucks-api`
2. Verify service status: `pm2 status`
3. Test Nginx configuration: `nginx -t`
4. Check port bindings: `netstat -tlnp | grep -E ':(80|443|3001)'`

The deployment should take about 5-10 minutes to complete. Your Apex Trucks website will then be live and serving traffic!
