-- Country Requirements Database Inserts
-- This file contains SQL statements to populate the country_requirements table

-- India to USA requirements
INSERT INTO country_requirements (
    source_country, 
    target_country, 
    document_type,
    requirements,
    formatting_rules,
    certification_types,
    apostille_required,
    typical_processing_days,
    office_locations,
    fees
) VALUES (
    'IN', 
    'US', 
    'degree',
    '{
        "must_have": ["Original degree certificate", "Transcripts for all years", "Medium of instruction letter"],
        "authentication": ["HRD attestation", "MEA apostille", "Embassy attestation"],
        "validity": "No expiry for educational documents",
        "common_rejections": ["Missing backside stamps", "Photocopies instead of originals", "Missing semester marksheets"]
    }'::jsonb,
    '{
        "paper_size": "A4",
        "color_scan": true,
        "dpi_minimum": 300,
        "file_format": "PDF",
        "max_file_size_mb": 10
    }'::jsonb,
    ARRAY['apostille', 'notarization', 'university_verification'],
    true,
    15,
    '[
        {
            "city": "New Delhi",
            "office": "MEA Apostille Division",
            "address": "CPV Division, Patiala House, Tilak Marg",
            "phone": "+91-11-23073122",
            "hours": "9:30 AM - 6:00 PM",
            "saturday_open": true
        }
    ]'::jsonb,
    '{
        "apostille": "₹50 per document",
        "hrd_attestation": "₹200-500 varies by state",
        "university_verification": "₹500-2000",
        "total_estimated": "₹1000-3000"
    }'::jsonb
);

-- Mexico to USA requirements
INSERT INTO country_requirements (
    source_country, 
    target_country, 
    document_type,
    requirements,
    formatting_rules,
    certification_types,
    apostille_required,
    typical_processing_days,
    office_locations,
    fees
) VALUES (
    'MX', 
    'US', 
    'degree',
    '{
        "must_have": ["Original degree certificate", "Official transcripts", "Curriculum details (plan de estudios)"],
        "authentication": ["Public Ministry authentication", "Secretary of Education apostille", "Consular authentication"],
        "validity": "No expiry for educational documents",
        "common_rejections": ["Missing ministry stamps", "Incomplete curriculum details", "Documents not in Spanish"]
    }'::jsonb,
    '{
        "paper_size": "Letter",
        "color_scan": true,
        "dpi_minimum": 300,
        "file_format": "PDF",
        "max_file_size_mb": 10
    }'::jsonb,
    ARRAY['apostille', 'ministry_authentication', 'consular_authentication'],
    true,
    10,
    '[
        {
            "city": "Mexico City",
            "office": "Secretaría de Relaciones Exteriores",
            "address": "Av. Paseo de la Reforma 305, Colonia Cuauhtémoc",
            "phone": "+52 55 5080 4000",
            "hours": "9:00 AM - 3:00 PM",
            "saturday_open": false
        }
    ]'::jsonb,
    '{
        "apostille": "$575 MXN per document",
        "ministry_authentication": "$420 MXN",
        "consular_authentication": "$860 MXN",
        "total_estimated": "$1855-2500 MXN"
    }'::jsonb
);

-- China to Canada requirements
INSERT INTO country_requirements (
    source_country, 
    target_country, 
    document_type,
    requirements,
    formatting_rules,
    certification_types,
    apostille_required,
    typical_processing_days,
    office_locations,
    fees
) VALUES (
    'CN', 
    'CA', 
    'degree',
    '{
        "must_have": ["Original degree certificate", "Official transcripts", "Chinese to English translation"],
        "authentication": ["Ministry of Education authentication", "Foreign Affairs Ministry apostille", "Consular authentication"],
        "validity": "No expiry for educational documents",
        "common_rejections": ["Missing ministry authentication", "Translation not done by certified translator", "Incomplete transcripts"]
    }'::jsonb,
    '{
        "paper_size": "A4",
        "color_scan": true,
        "dpi_minimum": 300,
        "file_format": "PDF",
        "max_file_size_mb": 10
    }'::jsonb,
    ARRAY['apostille', 'ministry_authentication', 'consular_authentication'],
    true,
    14,
    '[
        {
            "city": "Beijing",
            "office": "Ministry of Foreign Affairs",
            "address": "No. 2 Chaoyangmen Nandajie, Chaoyang District",
            "phone": "+86 10 6596 2300",
            "hours": "8:30 AM - 5:00 PM",
            "saturday_open": false
        }
    ]'::jsonb,
    '{
        "apostille": "¥50 per document",
        "ministry_authentication": "¥100-200",
        "consular_authentication": "¥300-500",
        "total_estimated": "¥450-750"
    }'::jsonb
);

-- Philippines to UAE requirements
INSERT INTO country_requirements (
    source_country, 
    target_country, 
    document_type,
    requirements,
    formatting_rules,
    certification_types,
    apostille_required,
    typical_processing_days,
    office_locations,
    fees
) VALUES (
    'PH', 
    'AE', 
    'degree',
    '{
        "must_have": ["Original degree certificate", "Official transcripts", "NSO authentication"],
        "authentication": ["Department of Foreign Affairs authentication", "UAE Embassy authentication", "Attested by relevant authority in Philippines"],
        "validity": "No expiry for educational documents",
        "common_rejections": ["Missing DFA authentication", "Incomplete transcripts", "Not attested by relevant authority"]
    }'::jsonb,
    '{
        "paper_size": "A4",
        "color_scan": true,
        "dpi_minimum": 300,
        "file_format": "PDF",
        "max_file_size_mb": 10
    }'::jsonb,
    ARRAY['dfa_authentication', 'embassy_authentication', 'authority_attestation'],
    false,
    8,
    '[
        {
            "city": "Manila",
            "office": "Department of Foreign Affairs",
            "address": "Roxas Boulevard, Pasay City",
            "phone": "+63 2 8234 3391",
            "hours": "8:00 AM - 5:00 PM",
            "saturday_open": false
        }
    ]'::jsonb,
    '{
        "dfa_authentication": "₱100 per document",
        "embassy_authentication": "₱300",
        "authority_attestation": "₱200-500",
        "total_estimated": "₱600-900"
    }'::jsonb
);

-- Brazil to Portugal requirements
INSERT INTO country_requirements (
    source_country, 
    target_country, 
    document_type,
    requirements,
    formatting_rules,
    certification_types,
    apostille_required,
    typical_processing_days,
    office_locations,
    fees
) VALUES (
    'BR', 
    'PT', 
    'degree',
    '{
        "must_have": ["Original degree certificate", "Official transcripts", "Proof of ancestry (if applicable)"],
        "authentication": ["Public Notary authentication", "Ministry of Foreign Affairs apostille", "Portuguese Consulate authentication"],
        "validity": "No expiry for educational documents",
        "common_rejections": ["Missing apostille", "Incomplete ancestry documentation", "Documents not in Portuguese or English"]
    }'::jsonb,
    '{
        "paper_size": "A4",
        "color_scan": true,
        "dpi_minimum": 300,
        "file_format": "PDF",
        "max_file_size_mb": 10
    }'::jsonb,
    ARRAY['apostille', 'notary_authentication', 'consulate_authentication'],
    true,
    12,
    '[
        {
            "city": "Brasília",
            "office": "Ministry of Foreign Affairs",
            "address": "Esplanada dos Ministérios, Bloco H",
            "phone": "+55 61 2030-9963",
            "hours": "8:00 AM - 6:00 PM",
            "saturday_open": false
        }
    ]'::jsonb,
    '{
        "apostille": "R$100 per document",
        "notary_authentication": "R$50-100",
        "consulate_authentication": "R$150",
        "total_estimated": "R$300-350"
    }'::jsonb
);

-- Nigeria to UK requirements
INSERT INTO country_requirements (
    source_country, 
    target_country, 
    document_type,
    requirements,
    formatting_rules,
    certification_types,
    apostille_required,
    typical_processing_days,
    office_locations,
    fees
) VALUES (
    'NG', 
    'GB', 
    'degree',
    '{
        "must_have": ["Original degree certificate", "Official transcripts", "National Youth Service Corps (NYSC) certificate"],
        "authentication": ["Nigerian Embassy authentication", "UK Apostille (if applicable)", "NIMC verification"],
        "validity": "No expiry for educational documents",
        "common_rejections": ["Missing NYSC certificate", "Incomplete transcripts", "Documents not properly authenticated"]
    }'::jsonb,
    '{
        "paper_size": "A4",
        "color_scan": true,
        "dpi_minimum": 300,
        "file_format": "PDF",
        "max_file_size_mb": 10
    }'::jsonb,
    ARRAY['embassy_authentication', 'apostille', 'nysc_verification'],
    false,
    10,
    '[
        {
            "city": "Abuja",
            "office": "Nigerian Embassy",
            "address": "14 Aguiyi Ironsi Street, Maitama",
            "phone": "+234 9 460 4444",
            "hours": "8:30 AM - 4:00 PM",
            "saturday_open": false
        }
    ]'::jsonb,
    '{
        "embassy_authentication": "₦50,000 per document",
        "apostille": "₦25,000",
        "nysc_verification": "₦15,000",
        "total_estimated": "₦90,000-120,000"
    }'::jsonb
);

-- Pakistan to UK requirements
INSERT INTO country_requirements (
    source_country, 
    target_country, 
    document_type,
    requirements,
    formatting_rules,
    certification_types,
    apostille_required,
    typical_processing_days,
    office_locations,
    fees
) VALUES (
    'PK', 
    'GB', 
    'degree',
    '{
        "must_have": ["Original degree certificate", "Official transcripts", "Higher Education Commission (HEC) verification"],
        "authentication": ["HEC attestation", "Ministry of Foreign Affairs authentication", "Pakistan Embassy authentication"],
        "validity": "No expiry for educational documents",
        "common_rejections": ["Missing HEC verification", "Incomplete transcripts", "Documents not properly attested"]
    }'::jsonb,
    '{
        "paper_size": "A4",
        "color_scan": true,
        "dpi_minimum": 300,
        "file_format": "PDF",
        "max_file_size_mb": 10
    }'::jsonb,
    ARRAY['hec_attestation', 'mofa_authentication', 'embassy_authentication'],
    false,
    15,
    '[
        {
            "city": "Islamabad",
            "office": "Higher Education Commission",
            "address": "Sector H-8/1, Islamabad",
            "phone": "+92 51 904 0000",
            "hours": "9:00 AM - 5:00 PM",
            "saturday_open": false
        }
    ]'::jsonb,
    '{
        "hec_attestation": "₨5,000 per document",
        "mofa_authentication": "₨2,000",
        "embassy_authentication": "₨3,000",
        "total_estimated": "₨10,000-15,000"
    }'::jsonb
);

-- Ukraine to Poland requirements
INSERT INTO country_requirements (
    source_country, 
    target_country, 
    document_type,
    requirements,
    formatting_rules,
    certification_types,
    apostille_required,
    typical_processing_days,
    office_locations,
    fees
) VALUES (
    'UA', 
    'PL', 
    'degree',
    '{
        "must_have": ["Original degree certificate", "Official transcripts", "Ukrainian Ministry of Education authentication"],
        "authentication": ["Ministry of Foreign Affairs authentication", "Polish Embassy authentication", "Apostille (if applicable)"],
        "validity": "No expiry for educational documents",
        "common_rejections": ["Missing ministry authentication", "Incomplete transcripts", "Documents not translated to Polish"]
    }'::jsonb,
    '{
        "paper_size": "A4",
        "color_scan": true,
        "dpi_minimum": 300,
        "file_format": "PDF",
        "max_file_size_mb": 10
    }'::jsonb,
    ARRAY['ministry_authentication', 'embassy_authentication', 'apostille'],
    false,
    14,
    '[
        {
            "city": "Kyiv",
            "office": "Ministry of Foreign Affairs",
            "address": "Mykhailo Hrushevskyi Street, 12",
            "phone": "+380 44 239 1223",
            "hours": "9:00 AM - 6:00 PM",
            "saturday_open": false
        }
    ]'::jsonb,
    '{
        "ministry_authentication": "₴500 per document",
        "embassy_authentication": "₴800",
        "apostille": "₴300",
        "total_estimated": "₴1,600-2,000"
    }'::jsonb
);

-- Venezuela to Spain requirements
INSERT INTO country_requirements (
    source_country, 
    target_country, 
    document_type,
    requirements,
    formatting_rules,
    certification_types,
    apostille_required,
    typical_processing_days,
    office_locations,
    fees
) VALUES (
    'VE', 
    'ES', 
    'degree',
    '{
        "must_have": ["Original degree certificate", "Official transcripts", "Ministry of Education authentication"],
        "authentication": ["Ministry of Foreign Affairs authentication", "Spanish Embassy authentication", "Apostille"],
        "validity": "No expiry for educational documents",
        "common_rejections": ["Missing ministry authentication", "Incomplete transcripts", "Documents not translated to Spanish"]
    }'::jsonb,
    '{
        "paper_size": "A4",
        "color_scan": true,
        "dpi_minimum": 300,
        "file_format": "PDF",
        "max_file_size_mb": 10
    }'::jsonb,
    ARRAY['ministry_authentication', 'embassy_authentication', 'apostille'],
    true,
    12,
    '[
        {
            "city": "Caracas",
            "office": "Ministry of Foreign Affairs",
            "address": "Av. Universidad, Esq. Calle Páez, Plaza Venezuela",
            "phone": "+58 212 576 8800",
            "hours": "8:00 AM - 4:00 PM",
            "saturday_open": false
        }
    ]'::jsonb,
    '{
        "ministry_authentication": "Bs.S 500 per document",
        "embassy_authentication": "Bs.S 800",
        "apostille": "Bs.S 300",
        "total_estimated": "Bs.S 1,600-2,000"
    }'::jsonb
);

-- Bangladesh to Saudi Arabia requirements
INSERT INTO country_requirements (
    source_country, 
    target_country, 
    document_type,
    requirements,
    formatting_rules,
    certification_types,
    apostille_required,
    typical_processing_days,
    office_locations,
    fees
) VALUES (
    'BD', 
    'SA', 
    'degree',
    '{
        "must_have": ["Original degree certificate", "Official transcripts", "University attestation"],
        "authentication": ["Ministry of Foreign Affairs authentication", "Saudi Embassy authentication", "Education Ministry verification"],
        "validity": "No expiry for educational documents",
        "common_rejections": ["Missing ministry authentication", "Incomplete transcripts", "Documents not properly attested"]
    }'::jsonb,
    '{
        "paper_size": "A4",
        "color_scan": true,
        "dpi_minimum": 300,
        "file_format": "PDF",
        "max_file_size_mb": 10
    }'::jsonb,
    ARRAY['ministry_authentication', 'embassy_authentication', 'education_verification'],
    false,
    10,
    '[
        {
            "city": "Dhaka",
            "office": "Ministry of Foreign Affairs",
            "address": "198, Tejgaon Industrial Area, Dhaka 1208",
            "phone": "+880 2 9823791",
            "hours": "9:00 AM - 5:00 PM",
            "saturday_open": false
        }
    ]'::jsonb,
    '{
        "ministry_authentication": "৳500 per document",
        "embassy_authentication": "৳800",
        "education_verification": "৳300",
        "total_estimated": "৳1,600-2,000"
    }'::jsonb
);