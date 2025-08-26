/**
 * Validation test cases for document compliance checking
 */

export const validationTestCases = [
  {
    name: 'Missing apostille for US submission',
    document: {
      type: 'degree',
      sourceCountry: 'IN',
      targetCountry: 'US',
      fields: {
        university: 'University of Delhi',
        degree: 'Bachelor of Technology',
        studentName: 'Test Student',
        endDate: '2020'
      },
      certifications: ['hrd_attestation', 'university_verification']
    },
    expectedErrors: ['Apostille required for educational documents to US'],
    expectedWarnings: [],
    expectedScore: 80
  },
  
  {
    name: 'Complete Indian degree for US with all certifications',
    document: {
      type: 'degree',
      sourceCountry: 'IN',
      targetCountry: 'US',
      fields: {
        university: 'University of Delhi',
        degree: 'Bachelor of Technology',
        studentName: 'Test Student',
        endDate: '2020'
      },
      certifications: ['hrd_attestation', 'university_verification', 'apostille']
    },
    expectedErrors: [],
    expectedWarnings: [],
    expectedScore: 100
  },
  
  {
    name: 'Missing transcripts for US degree',
    document: {
      type: 'degree',
      sourceCountry: 'IN',
      targetCountry: 'US',
      fields: {
        university: 'University of Delhi',
        degree: 'Bachelor of Technology',
        studentName: 'Test Student',
        endDate: '2020'
        // Missing transcripts
      },
      certifications: ['hrd_attestation', 'university_verification', 'apostille']
    },
    expectedErrors: ['Transcripts required for educational documents to US'],
    expectedWarnings: [],
    expectedScore: 85
  },
  
  {
    name: 'Mexican degree missing ministry authentication',
    document: {
      type: 'degree',
      sourceCountry: 'MX',
      targetCountry: 'US',
      fields: {
        university: 'Universidad Nacional Autónoma de México',
        degree: 'Ingeniería en Sistemas Computacionales',
        studentName: 'Juan Pérez López',
        endDate: '2020'
      },
      certifications: ['university_verification'] // Missing ministry authentication
    },
    expectedErrors: ['Ministry of Education authentication required for Mexican documents'],
    expectedWarnings: [],
    expectedScore: 75
  },
  
  {
    name: 'Chinese degree with all required certifications',
    document: {
      type: 'degree',
      sourceCountry: 'CN',
      targetCountry: 'CA',
      fields: {
        university: 'Tsinghua University',
        degree: 'Bachelor of Engineering',
        studentName: 'Li Minghua',
        endDate: '2020'
      },
      certifications: ['ministry_authentication', 'apostille', 'consular_authentication']
    },
    expectedErrors: [],
    expectedWarnings: [],
    expectedScore: 100
  },
  
  {
    name: 'Brazilian documents for Portugal without proper translation',
    document: {
      type: 'degree',
      sourceCountry: 'BR',
      targetCountry: 'PT',
      fields: {
        university: 'Universidade de São Paulo',
        degree: 'Engenharia de Software',
        studentName: 'Carlos Silva',
        endDate: '2020'
      },
      certifications: ['notary_authentication', 'apostille']
      // Missing Portuguese translation
    },
    expectedErrors: ['Documents must be translated to Portuguese for Portuguese authorities'],
    expectedWarnings: [],
    expectedScore: 80
  },
  
  {
    name: 'Nigerian degree missing NYSC certificate',
    document: {
      type: 'degree',
      sourceCountry: 'NG',
      targetCountry: 'GB',
      fields: {
        university: 'University of Lagos',
        degree: 'B.Sc. Computer Science',
        studentName: 'Ade Johnson',
        endDate: '2020'
      },
      certifications: ['embassy_authentication']
      // Missing NYSC certificate
    },
    expectedErrors: ['NYSC certificate required for Nigerian educational documents'],
    expectedWarnings: [],
    expectedScore: 85
  },
  
  {
    name: 'Pakistani degree without HEC verification',
    document: {
      type: 'degree',
      sourceCountry: 'PK',
      targetCountry: 'GB',
      fields: {
        university: 'Lahore University of Management Sciences',
        degree: 'BBA',
        studentName: 'Ali Khan',
        endDate: '2020'
      },
      certifications: ['mofa_authentication', 'embassy_authentication']
      // Missing HEC verification
    },
    expectedErrors: ['HEC verification required for Pakistani educational documents'],
    expectedWarnings: [],
    expectedScore: 80
  },
  
  {
    name: 'Ukrainian degree for Poland without Polish translation',
    document: {
      type: 'degree',
      sourceCountry: 'UA',
      targetCountry: 'PL',
      fields: {
        university: 'Taras Shevchenko National University',
        degree: 'Master of Computer Science',
        studentName: 'Olena Kovalenko',
        endDate: '2020'
      },
      certifications: ['ministry_authentication', 'embassy_authentication']
      // Missing Polish translation
    },
    expectedErrors: ['Documents must be translated to Polish for Polish authorities'],
    expectedWarnings: [],
    expectedScore: 85
  },
  
  {
    name: 'Venezuelan degree for Spain without Spanish translation',
    document: {
      type: 'degree',
      sourceCountry: 'VE',
      targetCountry: 'ES',
      fields: {
        university: 'Universidad Central de Venezuela',
        degree: 'Ingeniería Informática',
        studentName: 'Carlos Mendoza',
        endDate: '2020'
      },
      certifications: ['ministry_authentication', 'embassy_authentication', 'apostille']
      // Already in Spanish, so no translation needed
    },
    expectedErrors: [],
    expectedWarnings: [],
    expectedScore: 100
  },
  
  {
    name: 'Bangladeshi degree for Saudi Arabia with all certifications',
    document: {
      type: 'degree',
      sourceCountry: 'BD',
      targetCountry: 'SA',
      fields: {
        university: 'Bangladesh University of Engineering and Technology',
        degree: 'B.Sc. Engineering',
        studentName: 'Ahmed Rahman',
        endDate: '2020'
      },
      certifications: ['ministry_authentication', 'embassy_authentication', 'education_verification']
    },
    expectedErrors: [],
    expectedWarnings: [],
    expectedScore: 100
  },
  
  {
    name: 'Document with low-quality scan',
    document: {
      type: 'degree',
      sourceCountry: 'IN',
      targetCountry: 'US',
      fields: {
        university: 'University of Delhi',
        degree: 'Bachelor of Technology',
        studentName: 'Test Student',
        endDate: '2020'
      },
      certifications: ['hrd_attestation', 'university_verification', 'apostille'],
      scanQuality: 150 // Below minimum 300 DPI
    },
    expectedErrors: [],
    expectedWarnings: ['Document scan quality is below recommended 300 DPI'],
    expectedScore: 95
  },
  
  {
    name: 'Document with wrong paper size',
    document: {
      type: 'degree',
      sourceCountry: 'IN',
      targetCountry: 'US',
      fields: {
        university: 'University of Delhi',
        degree: 'Bachelor of Technology',
        studentName: 'Test Student',
        endDate: '2020'
      },
      certifications: ['hrd_attestation', 'university_verification', 'apostille'],
      paperSize: 'Letter' // Should be A4 for Indian documents
    },
    expectedErrors: [],
    expectedWarnings: ['Document paper size is Letter, A4 recommended for Indian documents'],
    expectedScore: 95
  },
  
  {
    name: 'Document with missing signature',
    document: {
      type: 'degree',
      sourceCountry: 'IN',
      targetCountry: 'US',
      fields: {
        university: 'University of Delhi',
        degree: 'Bachelor of Technology',
        studentName: 'Test Student',
        endDate: '2020'
      },
      certifications: ['hrd_attestation', 'university_verification', 'apostille'],
      hasSignature: false
    },
    expectedErrors: ['Document appears to be missing official signature'],
    expectedWarnings: [],
    expectedScore: 85
  },
  
  {
    name: 'Document with missing official seal',
    document: {
      type: 'degree',
      sourceCountry: 'IN',
      targetCountry: 'US',
      fields: {
        university: 'University of Delhi',
        degree: 'Bachelor of Technology',
        studentName: 'Test Student',
        endDate: '2020'
      },
      certifications: ['hrd_attestation', 'university_verification', 'apostille'],
      hasSeal: false
    },
    expectedErrors: ['Document appears to be missing official seal'],
    expectedWarnings: [],
    expectedScore: 85
  }
];