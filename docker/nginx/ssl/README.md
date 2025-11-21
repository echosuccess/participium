# SSL Certificates Directory

Place your SSL certificates here for HTTPS support.

## Required Files

- `cert.pem` - SSL certificate
- `key.pem` - Private key
- `chain.pem` - Certificate chain (optional)

## Generate Self-Signed Certificate (Development Only)

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout key.pem -out cert.pem \
  -subj "/C=IT/ST=Piedmont/L=Turin/O=Participium/CN=localhost"
```

## Production Certificates

For production, use certificates from a trusted Certificate Authority like:
- Let's Encrypt (free)
- DigiCert
- Comodo
- Others

### Using Let's Encrypt with Certbot

```bash
certbot certonly --standalone -d yourdomain.com
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem key.pem
```

## ⚠️ Security Warning

- Never commit actual certificates to version control
- Add `*.pem` and `*.key` to `.gitignore`
- Protect private keys with proper file permissions
- Rotate certificates before expiry
