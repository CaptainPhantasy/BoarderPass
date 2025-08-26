/**
 * Sample documents for testing
 */

export const sampleDocuments = {
  indianDegree: {
    type: 'degree',
    country: 'IN',
    targetCountry: 'US',
    extractedText: `UNIVERSITY OF DELHI
                  
                  This is to certify that Test Student
                  has been duly admitted to the degree of
                  Bachelor of Technology
                  in Computer Science and Engineering
                  during the academic year 2016-2020
                  
                  Date of Issue: 15th July, 2020
                  Registration No: 1234567890
                  
                  (OFFICIAL SEAL)               (SIGNATURE)
                  Dr. A.K. Sharma               Dean of Academics
                  Controller of Examinations`,
    expectedFields: {
      university: 'University of Delhi',
      degree: 'Bachelor of Technology',
      studentName: 'Test Student',
      startDate: '2016',
      endDate: '2020',
      issueDate: '2020-07-15',
      registrationNumber: '1234567890',
      major: 'Computer Science and Engineering'
    }
  },
  
  mexicanTranscript: {
    type: 'transcript',
    country: 'MX',
    targetCountry: 'US',
    extractedText: `Universidad Nacional Autónoma de México
                  
                  CERTIFICADO DE ESTUDIOS
                  
                  Nombre del Alumno: Juan Pérez López
                  Matrícula: 12345678
                  Carrera: Ingeniería en Sistemas Computacionales
                  
                  Semestre: Agosto-Diciembre 2019
                  Materia: Programación Avanzada
                  Calificación: 9.5
                  
                  Semestre: Enero-Junio 2020
                  Materia: Bases de Datos
                  Calificación: 8.7
                  
                  Promedio General: 9.1
                  
                  Ciudad de México, a 15 de junio de 2020
                  
                  (SELLO OFICIAL)               (FIRMA)
                  Dra. María González           Jefa de Control Escolar`,
    expectedFields: {
      university: 'Universidad Nacional Autónoma de México',
      studentName: 'Juan Pérez López',
      studentId: '12345678',
      major: 'Ingeniería en Sistemas Computacionales',
      gpa: '9.1',
      courses: [
        {
          semester: 'Agosto-Diciembre 2019',
          subject: 'Programación Avanzada',
          grade: '9.5'
        },
        {
          semester: 'Enero-Junio 2020',
          subject: 'Bases de Datos',
          grade: '8.7'
        }
      ]
    }
  },
  
  chineseDegree: {
    type: 'degree',
    country: 'CN',
    targetCountry: 'CA',
    extractedText: `清华大学
                  
                  学位证书
                  
                  兹证明李明华同学于2016年9月至2020年6月
                  在我校计算机科学与技术专业学习，完成教学计划规定的全部课程，
                  成绩合格，准予毕业。
                  经审核符合《中华人民共和国学位条例》规定，
                  授予工学学士学位。
                  
                  校长：邱勇
                  证书编号：2020123456
                  发证日期：2020年6月30日
                  
                  （学校印章）`,
    expectedFields: {
      university: 'Tsinghua University',
      degree: 'Bachelor of Engineering',
      studentName: 'Li Minghua',
      startDate: '2016-09',
      endDate: '2020-06',
      issueDate: '2020-06-30',
      certificateNumber: '2020123456',
      major: 'Computer Science and Technology'
    }
  },
  
  brazilianBirthCertificate: {
    type: 'birth_certificate',
    country: 'BR',
    targetCountry: 'PT',
    extractedText: `CERTIDÃO DE NASCIMENTO
                  
                  Livro: 02    Folha: 125    Termo: 3456
                  
                  NOME: Maria Silva Santos
                  NASCIDO(A): Em São Paulo, SP, no dia 15 de março de 1995,
                  às 14 horas e 30 minutos.
                  
                  FILHO(A) DE: João Silva Oliveira e Ana Paula Santos Silva
                  
                  REGISTRADO(A) EM: 16 de março de 1995
                  CARTÓRIO: 1º Tabelionato de Notas de São Paulo
                  
                  MATRÍCULA: 1234567890`,
    expectedFields: {
      fullName: 'Maria Silva Santos',
      birthDate: '1995-03-15',
      birthPlace: 'São Paulo, SP',
      birthTime: '14:30',
      parents: [
        'João Silva Oliveira',
        'Ana Paula Santos Silva'
      ],
      registrationDate: '1995-03-16',
      notary: '1º Tabelionato de Notas de São Paulo',
      registrationNumber: '1234567890'
    }
  },
  
  philippineMarriageCertificate: {
    type: 'marriage_certificate',
    country: 'PH',
    targetCountry: 'AE',
    extractedText: `REPUBLIC OF THE PHILIPPINES
                  OFFICE OF THE CIVIL REGISTRAR
                  
                  CERTIFICATE OF MARRIAGE
                  
                  This is to certify that
                  JUAN DELA CRUZ
                  and
                  MARIA SANTOS
                  were married on the fifteenth day of June, two thousand twenty,
                  at 3:00 o'clock in the afternoon,
                  at San Agustin Church, Manila,
                  by Rev. Fr. Antonio Reyes.
                  
                  GROOM: Juan Dela Cruz
                  AGE: 30
                  RESIDENCE: Quezon City
                  
                  BRIDE: Maria Santos
                  AGE: 28
                  RESIDENCE: Makati City
                  
                  REGISTRATION NO: MC2020-001234
                  DATE OF REGISTRATION: June 16, 2020`,
    expectedFields: {
      groom: 'Juan Dela Cruz',
      bride: 'Maria Santos',
      marriageDate: '2020-06-15',
      marriageTime: '15:00',
      location: 'San Agustin Church, Manila',
      officiant: 'Rev. Fr. Antonio Reyes',
      groomAge: '30',
      groomResidence: 'Quezon City',
      brideAge: '28',
      brideResidence: 'Makati City',
      registrationNumber: 'MC2020-001234',
      registrationDate: '2020-06-16'
    }
  }
};

export const sampleDocumentsArray = Object.values(sampleDocuments);