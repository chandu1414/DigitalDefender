const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const PDFDocument = require('pdfkit');
const { Users, Resources, Downloads, readDb, writeDb } = require('./db');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'resources');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Helper to create a stylized cybersecurity PDF study guide
function generateGuidePDF(fileName, title, subtitle, topic, keyPoints) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(UPLOADS_DIR, fileName);
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    // Header banner bar (Dark Navy)
    doc.rect(0, 0, 595.28, 120).fill('#0B1120');

    // Teal branding accent line
    doc.rect(0, 120, 595.28, 6).fill('#1FA8A0');

    // Branding text
    doc.fillColor('#1FA8A0').fontSize(16).text('DIGITALDEFENDER // STUDY NOTES', 50, 35, { characterSpacing: 1.5 });
    doc.fillColor('#FFFFFF').fontSize(22).text(title, 50, 60, { width: 500 });

    doc.moveDown(4);

    // Topic badge
    doc.fontSize(10).fillColor('#1FA8A0').text(`TOPIC: ${topic.toUpperCase()}   |   CLASSIFICATION: PUBLIC DEFENSE GUIDE`, 50, 150);
    doc.moveDown(0.5);

    // Subtitle / Overview
    doc.fontSize(13).fillColor('#334155').text(subtitle, 50, 175, { width: 495, lineGap: 4 });
    doc.moveDown(1.5);

    // Section title
    doc.fontSize(14).fillColor('#0F172A').text('Key Defensive Principles & Takeaways:', 50, 220);
    doc.moveDown(0.8);

    let yPos = 245;
    keyPoints.forEach((point, index) => {
      // Teal number circle / bullet
      doc.rect(50, yPos, 20, 20).fill('#1FA8A0');
      doc.fillColor('#FFFFFF').fontSize(11).text(`${index + 1}`, 56, yPos + 4);

      // Title & description
      doc.fillColor('#0F172A').fontSize(11).text(point.heading, 80, yPos + 2, { bold: true });
      doc.fillColor('#475569').fontSize(10).text(point.body, 80, yPos + 18, { width: 465, lineGap: 3 });

      yPos += 58;
    });

    // Verification Box
    doc.rect(50, 660, 495, 70).fillAndStroke('#F8FAFC', '#CBD5E1');
    doc.fillColor('#1FA8A0').fontSize(10).text('DEFENDER VERIFICATION STAMP', 65, 672);
    doc.fillColor('#64748B').fontSize(9).text('Curated by DigitalDefender Research Group • Free Educational Resource', 65, 690);
    doc.fillColor('#94A3B8').fontSize(8).text('Stay Smarter. Stay Safer. • https://www.instagram.com/digital.defender/', 65, 708);

    // Footer
    doc.fontSize(8).fillColor('#94A3B8').text('DigitalDefender Media Platform © 2026. All rights reserved. Not for unauthorized resale.', 50, 780, { align: 'center', width: 495 });

    doc.end();

    writeStream.on('finish', () => {
      const stats = fs.statSync(filePath);
      resolve({ filePath, sizeBytes: stats.size });
    });
    writeStream.on('error', reject);
  });
}

function formatBytes(bytes) {
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

async function seedDatabase() {
  console.log('--- Starting DigitalDefender Database Seeding ---');

  // Clear or initialize
  const db = readDb();

  // 1. Seed Admin
  const adminEmail = 'admin@digitaldefender.io';
  let admin = Users.findByEmail(adminEmail, true);
  if (!admin) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('AdminPassword2026!', salt);
    admin = Users.create({
      name: 'DigitalDefender Admin',
      email: adminEmail,
      password_hash,
      role: 'admin'
    });
    console.log(`Created Admin user: ${adminEmail}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  // 2. Seed Sample User
  const sampleEmail = 'alex@example.com';
  let sampleUser = Users.findByEmail(sampleEmail, true);
  if (!sampleUser) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('UserPassword123!', salt);
    sampleUser = Users.create({
      name: 'Alex Rivera',
      email: sampleEmail,
      password_hash,
      role: 'user'
    });
    console.log(`Created Sample user: ${sampleEmail}`);
  } else {
    console.log(`Sample user already exists: ${sampleEmail}`);
  }

  // 3. Seed Study Notes / Resources with generated real PDFs
  const sampleResources = [
    {
      fileName: 'Personal_Threat_Modeling_Guide_2026.pdf',
      title: 'Personal Threat Modeling 101',
      subtitle: 'A pragmatic framework for everyday internet users to identify their high-value digital assets, assess realistic adversaries, and prioritize defensive safeguards.',
      topic: 'Cybersecurity',
      keyPoints: [
        { heading: 'Asset Inventory', body: 'Catalog your primary email, banking portals, cloud storage backups, and identity documentation.' },
        { heading: 'Adversary Profiling', body: 'Distinguish between automated mass-scanners, credential stuffing bots, and opportunistic scammers.' },
        { heading: 'Defense In Depth', body: 'Apply layer separation: never use one email for account recovery and sensitive banking.' },
        { heading: 'Incident Action Plan', body: 'Prepare offline recovery codes, pre-authorized trusted contacts, and frozen credit checks.' }
      ]
    },
    {
      fileName: 'OSINT_Digital_Footprint_Audit.pdf',
      title: 'OSINT & Digital Footprint Audit Checklist',
      subtitle: 'Learn how open-source intelligence practitioners discover your accounts, exposed phone numbers, and location trails — and how to remove them.',
      topic: 'Privacy & OSINT',
      keyPoints: [
        { heading: 'Username Correlation', body: 'How threat actors query 300+ platforms in seconds to link your casual forum handle to your identity.' },
        { heading: 'Data Broker Opt-Outs', body: 'Step-by-step procedures for removing your home address and family records from public aggregators.' },
        { heading: 'EXIF Metadata Stripping', body: 'Why photos taken on smartphones embed exact GPS coordinates and how to sanitize them prior to posting.' },
        { heading: 'Search Engine Dorking', body: 'Use advanced Google operators (site:, inurl:, filetype:pdf) to audit your own exposed files.' }
      ]
    },
    {
      fileName: 'Home_WiFi_Hardening_Handbook.pdf',
      title: 'Home Wi-Fi Hardening & Router Security',
      subtitle: 'Transform your default ISP router into a fortified gatekeeper for all smart TVs, smart home IoT, laptops, and mobile devices.',
      topic: 'Internet Safety',
      keyPoints: [
        { heading: 'Change Default Admin Passwords', body: 'Routers with default admin/password credentials are the #1 target for automated botnets like Mirai.' },
        { heading: 'Enforce WPA3-Personal', body: 'Switch from WPA2 to WPA3 to prevent offline dictionary cracking attacks against your Wi-Fi handshake.' },
        { heading: 'Segment IoT on Guest VLANs', body: 'Isolate smart bulbs, cameras, and vacuum bots from your sensitive work and banking computers.' },
        { heading: 'Disable WPS & Remote WAN Management', body: 'Turn off Wi-Fi Protected Setup (WPS) PIN brute-forcing and block remote administrative access from the web.' }
      ]
    },
    {
      fileName: 'Mastering_2FA_and_Password_Managers.pdf',
      title: 'Mastering 2FA & Password Management',
      subtitle: 'The definitive guide to eliminating credential stuffing: password managers, hardware security keys, and modern passkeys.',
      topic: 'Digital Protection',
      keyPoints: [
        { heading: 'Never Reuse Passwords', body: 'When one small forum is breached, attackers test that exact email/password pair on 5,000 top websites within hours.' },
        { heading: 'Ditch SMS Verification for Authenticator Apps', body: 'SIM-swapping attacks render SMS codes vulnerable. Use TOTP apps (Bitwarden, Aegis) or FIDO2 keys.' },
        { heading: 'Emergency Access & Recovery Kits', body: 'Store laminated recovery master keys in a fireproof safe or safety deposit box.' },
        { heading: 'Passkeys Demystified', body: 'Public-key cryptography built into your device hardware that is cryptographically immune to phishing websites.' }
      ]
    },
    {
      fileName: 'Phishing_and_Social_Engineering_Field_Guide.pdf',
      title: 'Recognizing Phishing & Psychological Triggers',
      subtitle: 'Understand how modern cybercriminals exploit urgency, authority, and curiosity to deceive even tech-savvy individuals.',
      topic: 'Online Scams',
      keyPoints: [
        { heading: 'Artificial Urgency Red Flags', body: '"Your account will be suspended in 24 hours" is designed to trigger emotional panic before rational inspection.' },
        { heading: 'Inspect the Raw Sender Domain', body: 'Examine the actual SPF/DKIM return-path domain, not the cosmetic display name in your mail client.' },
        { heading: 'Homoglyph & Punycode Attacks', body: 'Recognize substituted Unicode characters (e.g. Cyrillic "а" replacing Latin "a") in spoofed URLs.' },
        { heading: 'Out-Of-Band Verification', body: 'Always contact financial institutions or colleagues via a known, pre-established phone number, never the link provided.' }
      ]
    }
  ];

  for (const item of sampleResources) {
    const existing = Resources.list().find(r => r.file_name === item.fileName);
    if (!existing) {
      console.log(`Generating PDF for "${item.title}"...`);
      const { filePath, sizeBytes } = await generateGuidePDF(
        item.fileName,
        item.title,
        item.subtitle,
        item.topic,
        item.keyPoints
      );

      const created = Resources.create({
        title: item.title,
        description: item.subtitle,
        topic: item.topic,
        file_name: item.fileName,
        file_path: filePath,
        file_size: formatBytes(sizeBytes),
        author: 'DigitalDefender Security Team'
      });
      console.log(`Resource seeded: "${created.title}" [${created.file_size}]`);
    } else {
      console.log(`Resource already exists: "${item.title}"`);
    }
  }

  // Pre-seed some initial downloads count for realism
  const resources = Resources.list();
  if (resources.length > 0 && Downloads.totalCount() === 0) {
    Downloads.record(sampleUser.id, resources[0].id);
    Downloads.record(sampleUser.id, resources[1].id);
    console.log('Seeded sample download events.');
  }

  console.log('--- DigitalDefender Database Seeding Complete! ---');
}

if (require.main === module) {
  seedDatabase().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}

module.exports = { seedDatabase };
