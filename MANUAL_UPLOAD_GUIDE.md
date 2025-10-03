# 📤 Manual Upload Guide for Ubuntu VPS

## 🎯 You have: 
- Ubuntu VPS: `root@89.116.51.122`
- Local project: `apex-trucks` folder

## 📝 Step-by-Step Instructions

### Step 1: Upload Files Using FileZilla/WinSCP (Recommended)

**Option A: Using FileZilla (Free SSH/SFTP Client)**
1. Download FileZilla from https://filezilla-project.org/
2. Install and open FileZilla
3. Connect using these settings:
   - **Host:** `89.116.51.122`
   - **Username:** `root`
   - **Password:** (your VPS password)
   - **Port:** `22`
4. Navigate to `/var/www/` on the server (right side)
5. Create folder `apex-trucks` in `/var/www/`
6. Upload ALL files from your local project to `/var/www/apex-trucks/`

**Option B: Using WinSCP (Alternative)**
1. Download WinSCP from https://winscp.net/
2. Connect with same settings as above
3. Upload all files to `/var/www/apex-trucks/`

### Step 2: SSH Commands to Run

After uploading, connect via SSH and run these commands:

```bash
# Connect to your VPS
ssh root@89.116.51.122

# Navigate to project directory
cd /var/www/apex-trucks

# Install Node.js (Ubuntu)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo bash -
apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx

# Install project dependencies
npm install

# Build the React application
npm run build

# Start the API server
pm2 start ecosystem.config.js --env production

# Configure Nginx
cp nginx-production.conf /etc/nginx/sites-available/apex-trucks
ln -sf /etc/nginx/sites-available/apex-trucks /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx

# Get SSL certificate
certbot --nginx -d 89.116.51.122 -n --agree-tos --email admin@89.116.51.122

# Save PM2 configuration
pm2 save
pm2 startup
```

### Step 3: Verify Everything Works

```bash
# Check if services are running
pm2 status
systemctl status nginx

# Test your website
curl -I https://89.116.51.122

# If everything is working, visit:
# https://89.116.51.122
```

## 🚨 Quick Troubleshooting

**If PM2 doesn't start:**
```bash
pm2 logs apex-trucks-api
pm2 restart apex-trucks-api
```

**If Nginx fails:**
```bash
nginx -t
tail -f /var/log/nginx/error.log
```

**If you get permission errors:**
```bash
chown -R www-data:www-data /var/www/apex-trucks
chmod -R 755 /var/www/apex-trucks
```

## 📱 Alternative: GitHub Method

If you prefer, you can also:

1. Push your code to GitHub
2. SSH to VPS: `ssh root@89.116.51.122`
3. Run:
```bash
apt install -y git
cd /var/www/
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git apex-trucks
cd apex-trucks
# Then continue with Step 2 above
```

## 🎉 After Completion

Your Apex Trucks website will be live at:
- **Main site**: https://89.116.51.122
- **API**: https://89.116.51.122/api/trucks
- **Admin features**: https://89.116.51.122/admin
