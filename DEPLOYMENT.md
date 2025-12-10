# Deployment Guide - Hostinger VPS

## Prerequisites
- Hostinger VPS plan (any tier)
- SSH access to your VPS
- Domain name pointed to your VPS IP
- Git repository (GitHub, GitLab, or Bitbucket)

---

## Step 1: Initial VPS Setup

### 1.1 Connect to VPS
```bash
ssh root@your-vps-ip-address
```

### 1.2 Update System
```bash
apt update && apt upgrade -y
```

### 1.3 Install Node.js 20.x
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs
node -v  # Verify installation
npm -v   # Verify npm installation
```

### 1.4 Install PM2 (Process Manager)
```bash
npm install -g pm2
```

### 1.5 Install Nginx (Web Server)
```bash
apt install nginx -y
systemctl start nginx
systemctl enable nginx
```

### 1.6 Install Git
```bash
apt install git -y
```

---

## Step 2: Clone and Setup Project

### 2.1 Create Application Directory
```bash
mkdir -p /var/www
cd /var/www
```

### 2.2 Clone Your Repository
```bash
# Using HTTPS
git clone https://github.com/yourusername/building-approvals.git

# OR using SSH (if you've set up SSH keys)
git clone git@github.com:yourusername/building-approvals.git
```

### 2.3 Navigate to Project
```bash
cd building-approvals
```

### 2.4 Install Dependencies
```bash
npm install
```

### 2.5 Create Environment File
```bash
nano .env.production
```

Add the following:
```
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

Press `CTRL+X`, then `Y`, then `ENTER` to save.

### 2.6 Build the Application
```bash
npm run build
```

---

## Step 3: Configure PM2

### 3.1 Create Logs Directory
```bash
mkdir -p logs
```

### 3.2 Start Application with PM2
```bash
pm2 start ecosystem.config.js
```

### 3.3 Configure PM2 to Start on Boot
```bash
pm2 startup
# Follow the command it suggests
pm2 save
```

### 3.4 Check Application Status
```bash
pm2 status
pm2 logs building-approvals
```

---

## Step 4: Configure Nginx

### 4.1 Create Nginx Configuration
```bash
nano /etc/nginx/sites-available/building-approvals
```

### 4.2 Add Configuration (Replace yourdomain.com with your actual domain)
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Increase upload size limit (optional, for large files)
    client_max_body_size 50M;
}
```

Press `CTRL+X`, then `Y`, then `ENTER` to save.

### 4.3 Enable Site
```bash
ln -s /etc/nginx/sites-available/building-approvals /etc/nginx/sites-enabled/
```

### 4.4 Test Nginx Configuration
```bash
nginx -t
```

### 4.5 Restart Nginx
```bash
systemctl restart nginx
```

### 4.6 Check Nginx Status
```bash
systemctl status nginx
```

---

## Step 5: Configure Firewall

### 5.1 Allow HTTP and HTTPS
```bash
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw enable
ufw status
```

---

## Step 6: Setup SSL Certificate (HTTPS)

### 6.1 Install Certbot
```bash
apt install certbot python3-certbot-nginx -y
```

### 6.2 Obtain SSL Certificate (Replace with your domain)
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose to redirect HTTP to HTTPS (recommended)

### 6.3 Auto-Renewal Test
```bash
certbot renew --dry-run
```

---

## Step 7: Deploy Updates (Future Deployments)

### 7.1 Make Deploy Script Executable
```bash
chmod +x deploy.sh
```

### 7.2 Run Deployment Script
```bash
./deploy.sh
```

Or manually:
```bash
cd /var/www/building-approvals
git pull origin master
npm install
npm run build
pm2 restart building-approvals
```

---

## Useful Commands

### PM2 Management
```bash
# View logs
pm2 logs building-approvals

# View real-time logs
pm2 logs building-approvals --lines 100

# Restart application
pm2 restart building-approvals

# Stop application
pm2 stop building-approvals

# Delete from PM2
pm2 delete building-approvals

# Monitor
pm2 monit
```

### Nginx Management
```bash
# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Check status
systemctl status nginx

# View error logs
tail -f /var/log/nginx/error.log
```

### System Monitoring
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
htop
```

---

## Troubleshooting

### Application Not Starting
```bash
# Check PM2 logs
pm2 logs building-approvals

# Check if port 3000 is in use
netstat -tlnp | grep 3000

# Check Node.js version
node -v
```

### Nginx Not Working
```bash
# Check Nginx status
systemctl status nginx

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Test configuration
nginx -t
```

### SSL Certificate Issues
```bash
# Check certificate status
certbot certificates

# Renew certificate
certbot renew
```

### Permission Issues
```bash
# Fix ownership
chown -R www-data:www-data /var/www/building-approvals

# Fix permissions
chmod -R 755 /var/www/building-approvals
```

---

## Security Best Practices

1. **Change SSH Port** (Optional but recommended)
2. **Disable Root Login** via SSH
3. **Setup Fail2Ban** for brute force protection
4. **Regular Updates**: `apt update && apt upgrade`
5. **Backup Database** regularly (if using one)
6. **Monitor Logs** regularly

---

## Quick Reference

- **Application URL**: https://yourdomain.com
- **Application Path**: /var/www/building-approvals
- **PM2 Config**: ecosystem.config.js
- **Nginx Config**: /etc/nginx/sites-available/building-approvals
- **SSL Certificates**: /etc/letsencrypt/live/yourdomain.com/

---

## Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs building-approvals`
2. Check Nginx logs: `tail -f /var/log/nginx/error.log`
3. Verify DNS settings point to your VPS IP
4. Ensure firewall allows HTTP/HTTPS traffic
