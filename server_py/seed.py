import os
from werkzeug.security import generate_password_hash
from db import (
    init_db,
    get_user_by_email,
    create_user,
    list_resources,
    create_resource,
    record_download,
    get_platform_stats
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads', 'resources')

def seed_database():
    print("--- Starting Python Flask DigitalDefender Database Seeding ---")
    init_db()

    # 1. Admin User
    admin_email = "admin@digitaldefender.io"
    admin = get_user_by_email(admin_email, include_password=True)
    if not admin:
        admin_hash = generate_password_hash("AdminPassword2026!")
        admin = create_user(
            name="DigitalDefender Admin",
            email=admin_email,
            password_hash=admin_hash,
            role="admin"
        )
        print(f"Created Admin: {admin_email} (password: AdminPassword2026!)")
    else:
        print(f"Admin already exists: {admin_email}")

    # 2. Sample User
    sample_email = "alex@example.com"
    sample_user = get_user_by_email(sample_email, include_password=True)
    if not sample_user:
        sample_hash = generate_password_hash("UserPassword123!")
        sample_user = create_user(
            name="Alex Rivera",
            email=sample_email,
            password_hash=sample_hash,
            role="user"
        )
        print(f"Created Sample user: {sample_email} (password: UserPassword123!)")
    else:
        print(f"Sample user already exists: {sample_email}")

    # 3. Seed Study Notes
    sample_resources = [
        {
            "fileName": "Personal_Threat_Modeling_Guide_2026.pdf",
            "title": "Personal Threat Modeling 101",
            "subtitle": "A pragmatic framework for everyday internet users to identify their high-value digital assets, assess realistic adversaries, and prioritize defensive safeguards.",
            "topic": "Cybersecurity",
            "fileSize": "2.6 KB"
        },
        {
            "fileName": "OSINT_Digital_Footprint_Audit.pdf",
            "title": "OSINT & Digital Footprint Audit Checklist",
            "subtitle": "Learn how open-source intelligence practitioners discover your accounts, exposed phone numbers, and location trails — and how to remove them.",
            "topic": "Privacy & OSINT",
            "fileSize": "2.6 KB"
        },
        {
            "fileName": "Home_WiFi_Hardening_Handbook.pdf",
            "title": "Home Wi-Fi Hardening & Router Security",
            "subtitle": "Transform your default ISP router into a fortified gatekeeper for all smart TVs, smart home IoT, laptops, and mobile devices.",
            "topic": "Internet Safety",
            "fileSize": "2.7 KB"
        },
        {
            "fileName": "Mastering_2FA_and_Password_Managers.pdf",
            "title": "Mastering 2FA & Password Management",
            "subtitle": "The definitive guide to eliminating credential stuffing: password managers, hardware security keys, and modern passkeys.",
            "topic": "Digital Protection",
            "fileSize": "2.7 KB"
        },
        {
            "fileName": "Phishing_and_Social_Engineering_Field_Guide.pdf",
            "title": "Recognizing Phishing & Psychological Triggers",
            "subtitle": "Understand how modern cybercriminals exploit urgency, authority, and curiosity to deceive even tech-savvy individuals.",
            "topic": "Online Scams",
            "fileSize": "2.7 KB"
        }
    ]

    existing_titles = [r['title'] for r in list_resources()]
    for item in sample_resources:
        if item['title'] not in existing_titles:
            file_path = os.path.join(UPLOAD_DIR, item['fileName'])
            create_resource(
                title=item['title'],
                description=item['subtitle'],
                topic=item['topic'],
                file_name=item['fileName'],
                file_path=file_path,
                file_size=item['fileSize'],
                author="DigitalDefender Security Team"
            )
            print(f"Resource seeded: \"{item['title']}\"")
        else:
            print(f"Resource already exists: \"{item['title']}\"")

    # Sample download events
    resources = list_resources()
    if resources and get_platform_stats()['totalDownloads'] == 0:
        record_download(sample_user['id'], resources[0]['id'])
        record_download(sample_user['id'], resources[1]['id'])
        print("Seeded sample download events for Alex Rivera.")

    print("--- Python Flask Database Seeding Complete! ---")

if __name__ == '__main__':
    seed_database()
