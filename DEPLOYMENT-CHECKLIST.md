# Hostinger VPS Deployment Checklist

## Pre-Deployment

- [ ] Hostinger VPS account active
- [ ] Domain name registered and DNS pointed to VPS IP
- [ ] SSH credentials received from Hostinger
- [ ] Code pushed to Git repository
- [ ] Git repository URL ready

---

## VPS Setup (One-time)

- [ ] Connect to VPS via SSH: `ssh root@your-vps-ip`
- [ ] Update system: `apt update && apt upgrade -y`
- [ ] Install Node.js 20.x
- [ ] Install PM2: `npm install -g pm2`
- [ ] Install Nginx: `apt install nginx -y`
- [ ] Install Git: `apt install git -y`
- [ ] Install Certbot: `apt install certbot python3-certbot-nginx -y`

---

## Project Deployment

- [ ] Create directory: `mkdir -p /var/www && cd /var/www`
- [ ] Clone repository: `git clone your-repo-url building-approvals`
- [ ] Navigate to project: `cd building-approvals`
- [ ] Install dependencies: `npm install`
- [ ] Create .env.production file
- [ ] Build application: `npm run build`
- [ ] Create logs directory: `mkdir -p logs`
- [ ] Start with PM2: `pm2 start ecosystem.config.js`
- [ ] Setup PM2 startup: `pm2 startup` then `pm2 save`

---

## Nginx Configuration

- [ ] Create Nginx config: `nano /etc/nginx/sites-available/building-approvals`
- [ ] Add server configuration (update domain name)
- [ ] Enable site: `ln -s /etc/nginx/sites-available/building-approvals /etc/nginx/sites-enabled/`
- [ ] Test config: `nginx -t`
- [ ] Restart Nginx: `systemctl restart nginx`

---

## Firewall & Security

- [ ] Allow Nginx: `ufw allow 'Nginx Full'`
- [ ] Allow SSH: `ufw allow OpenSSH`
- [ ] Enable firewall: `ufw enable`

---

## SSL Certificate

- [ ] Obtain certificate: `certbot --nginx -d yourdomain.com -d www.yourdomain.com`
- [ ] Test renewal: `certbot renew --dry-run`

---

## Verification

- [ ] Check PM2 status: `pm2 status`
- [ ] Check Nginx status: `systemctl status nginx`
- [ ] Visit http://yourdomain.com
- [ ] Visit https://yourdomain.com (after SSL)
- [ ] Test all pages and features
- [ ] Check mobile responsiveness

---

## Post-Deployment

- [ ] Monitor logs: `pm2 logs building-approvals`
- [ ] Setup regular backups
- [ ] Document custom configurations
- [ ] Test contact forms (if any)
- [ ] Setup monitoring/uptime checks

---

## Future Updates

Use the deployment script:
```bash
cd /var/www/building-approvals
chmod +x deploy.sh
./deploy.sh
```

---

## Quick Commands Reference

**Check Status:**
- PM2: `pm2 status`
- Nginx: `systemctl status nginx`
- Disk: `df -h`
- Memory: `free -h`

**View Logs:**
- PM2: `pm2 logs building-approvals`
- Nginx Error: `tail -f /var/log/nginx/error.log`
- Nginx Access: `tail -f /var/log/nginx/access.log`

**Restart Services:**
- Application: `pm2 restart building-approvals`
- Nginx: `systemctl restart nginx`

**SSL:**
- Check: `certbot certificates`
- Renew: `certbot renew`
