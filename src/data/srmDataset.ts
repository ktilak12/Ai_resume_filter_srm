import { JobRequirement, CandidateProfile, Interview } from '../types';

export const INITIAL_JOBS: JobRequirement[] = [
  {
    id: 'job-abc-aiml',
    title: 'Senior AI / ML Engineer',
    company: 'ABC Technologies',
    job_type: 'Full-time',
    location: 'Chennai / Bangalore / Hybrid',
    ctc_lpa: '14.0 - 22.0 LPA',
    application_deadline: '2026-10-15',
    open_vacancies: 12,
    status: 'Active',
    academic_eligibility: {
      allowed_degrees: ['B.Tech', 'M.Tech', 'MCA'],
      allowed_departments: ['CSE', 'IT', 'AI & DS', 'Software Engineering'],
      min_cgpa: 7.5,
      max_active_backlogs: 0,
      graduation_year: 2027
    },
    required_skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
    preferred_skills: ['AWS', 'Docker', 'Git', 'PyTorch', 'FastAPI'],
    min_experience_years: 0,
    freshers_accepted: true,
    internship_preferred: true,
    job_description: 'We are seeking passionate AI/ML Engineers to build scalable predictive intelligence models, computer vision systems, and deep learning pipelines. Freshers with proven project experience and strong foundations in Python, ML algorithms, and database systems are encouraged to apply.',
    total_applicants_count: 428,
    processed_count: 395,
    shortlisted_count: 64,
    created_at: '2026-08-20'
  },
  {
    id: 'job-deloitte-da',
    title: 'Data Analyst (Campus Drive)',
    company: 'Deloitte USI',
    job_type: 'Full-time',
    location: 'Hyderabad / Bengaluru',
    ctc_lpa: '9.5 - 12.0 LPA',
    application_deadline: '2026-10-20',
    open_vacancies: 25,
    status: 'Active',
    academic_eligibility: {
      allowed_degrees: ['B.Tech', 'BCA', 'MCA', 'B.E.'],
      allowed_departments: ['CSE', 'IT', 'AI & DS', 'ECE', 'Data Science'],
      min_cgpa: 7.5,
      max_active_backlogs: 0,
      graduation_year: 2027
    },
    required_skills: ['Python', 'SQL', 'Excel', 'Power BI', 'Statistics'],
    preferred_skills: ['Tableau', 'AWS', 'Git', 'Pandas'],
    min_experience_years: 0,
    freshers_accepted: true,
    internship_preferred: true,
    job_description: 'Deloitte is hiring Data Analysts for campus intake 2027. Candidates will work with enterprise stakeholders to model datasets, build automated Power BI & Tableau dashboards, and extract quantitative insights using Python and SQL.',
    total_applicants_count: 315,
    processed_count: 290,
    shortlisted_count: 52,
    created_at: '2026-08-25'
  },
  {
    id: 'job-amazon-sde',
    title: 'Software Development Engineer (SDE-1)',
    company: 'Amazon Web Services',
    job_type: 'Full-time',
    location: 'Chennai / Hyderabad',
    ctc_lpa: '28.0 - 45.0 LPA',
    application_deadline: '2026-11-05',
    open_vacancies: 8,
    status: 'Active',
    academic_eligibility: {
      allowed_degrees: ['B.Tech', 'M.Tech', 'B.E.'],
      allowed_departments: ['CSE', 'IT', 'AI & DS', 'ECE'],
      min_cgpa: 8.0,
      max_active_backlogs: 0,
      graduation_year: 2027
    },
    required_skills: ['Java', 'C++', 'Python', 'SQL', 'Data Structures'],
    preferred_skills: ['AWS', 'Docker', 'Microservices', 'Distributed Systems'],
    min_experience_years: 0,
    freshers_accepted: true,
    internship_preferred: true,
    job_description: 'Amazon is hiring SDE-1s for core distributed cloud platforms. High proficiency in Data Structures, Algorithms, Object-Oriented Design, and multithreaded architecture is strictly required.',
    total_applicants_count: 540,
    processed_count: 512,
    shortlisted_count: 38,
    created_at: '2026-08-10'
  },
  {
    id: 'job-zoho-fullstack',
    title: 'Full Stack Web Developer',
    company: 'Zoho Corporation',
    job_type: 'Full-time',
    location: 'Chennai / Tenkasi',
    ctc_lpa: '8.5 - 14.0 LPA',
    application_deadline: '2026-10-30',
    open_vacancies: 30,
    status: 'Active',
    academic_eligibility: {
      allowed_degrees: ['B.Tech', 'B.E.', 'MCA', 'BCA'],
      allowed_departments: ['CSE', 'IT', 'AI & DS', 'ECE', 'Software Engineering'],
      min_cgpa: 7.0,
      max_active_backlogs: 1,
      graduation_year: 2027
    },
    required_skills: ['React', 'Node.js', 'SQL', 'JavaScript', 'HTML/CSS'],
    preferred_skills: ['TypeScript', 'Docker', 'Redis', 'Tailwind CSS'],
    min_experience_years: 0,
    freshers_accepted: true,
    internship_preferred: true,
    job_description: 'Build high-performance web applications using modern JavaScript/TypeScript frameworks, REST microservices, and relational database systems.',
    total_applicants_count: 276,
    processed_count: 250,
    shortlisted_count: 45,
    created_at: '2026-08-28'
  }
];

export const INITIAL_CANDIDATES: CandidateProfile[] = [
  {
    id: 'cand-john-doe',
    reg_number: 'RA2311003010142',
    name: 'John Doe',
    email: 'john.doe@srmist.edu.in',
    phone: '+91 98401 88921',
    location: 'Chennai, Tamil Nadu',
    linkedin: 'linkedin.com/in/johndoe-srm',
    github: 'github.com/johndoe-dev',
    education: {
      degree: 'B.Tech',
      department: 'Computer Science & Engineering',
      college: 'SRM Institute of Science and Technology, Kattankulathur',
      cgpa: 8.92,
      graduation_year: 2027,
      active_backlogs: 0
    },
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Scikit-Learn', 'FastAPI', 'Pandas', 'NumPy', 'React', 'Docker', 'Git'],
    experience: [
      {
        company: 'Cognizant Technology Solutions',
        position: 'AI Research Intern',
        duration_months: 3,
        duration_text: '3 Months (May 2026 - Jul 2026)',
        is_internship: true,
        responsibilities: [
          'Developed predictive machine learning customer churn models using Python & Scikit-Learn with 93% accuracy',
          'Automated SQL pipeline for data preprocessing and feature engineering on PostgreSQL',
          'Containerized deployment pipelines with Docker and FastAPI endpoints'
        ]
      }
    ],
    projects: [
      {
        name: 'Automated Medical Image Classifier',
        technologies: ['Python', 'TensorFlow', 'OpenCV', 'FastAPI'],
        description: 'Built a deep convolutional neural network for automated chest X-ray diagnosis with 96.4% validation accuracy.'
      },
      {
        name: 'Enterprise Recruitment Screening System',
        technologies: ['Python', 'SQL', 'React', 'Scikit-Learn'],
        description: 'Engineered automated NLP ranking pipeline calculating semantic vector similarity between resumes and job specs.'
      }
    ],
    certifications: [
      'AWS Certified Cloud Practitioner',
      'DeepLearning.AI Machine Learning Specialization (Coursera)',
      'HackerRank Python (5 Stars)'
    ],
    raw_resume_text: 'John Doe | B.Tech CSE SRMIST | CGPA 8.92 | Skills: Python, Machine Learning, TensorFlow, SQL, Docker, AWS | Intern at Cognizant'
  },
  {
    id: 'cand-sarah-smith',
    reg_number: 'RA2311003010189',
    name: 'Sarah Smith',
    email: 'sarah.smith@srmist.edu.in',
    phone: '+91 98402 34112',
    location: 'Chennai, Tamil Nadu',
    linkedin: 'linkedin.com/in/sarahsmith-srm',
    github: 'github.com/sarahsmith-ai',
    education: {
      degree: 'B.Tech',
      department: 'AI & Data Science',
      college: 'SRM Institute of Science and Technology, Kattankulathur',
      cgpa: 9.15,
      graduation_year: 2027,
      active_backlogs: 0
    },
    skills: ['Python', 'Machine Learning', 'PyTorch', 'TensorFlow', 'SQL', 'Power BI', 'Pandas', 'NumPy', 'Git', 'Tableau'],
    experience: [
      {
        company: 'Zoho Corporation',
        position: 'Data Science Intern',
        duration_months: 4,
        duration_text: '4 Months (Jan 2026 - Apr 2026)',
        is_internship: true,
        responsibilities: [
          'Trained transformer models for customer query classification and sentiment analytics',
          'Constructed interactive Power BI dashboards for executive analytics',
          'Optimized PostgreSQL queries for high-volume analytics'
        ]
      }
    ],
    projects: [
      {
        name: 'Financial Fraud Detection Engine',
        technologies: ['Python', 'Scikit-Learn', 'PyTorch', 'SQL'],
        description: 'Created anomaly detection algorithms analyzing 500k+ transaction records with real-time alerting.'
      },
      {
        name: 'Campus Placement Trend Analyzer',
        technologies: ['Python', 'Power BI', 'SQL', 'Pandas'],
        description: 'Built comprehensive statistical dashboard forecasting department-wise placement metrics.'
      }
    ],
    certifications: [
      'Microsoft Certified: Azure Data Scientist Associate',
      'Stanford Machine Learning by Andrew Ng'
    ],
    raw_resume_text: 'Sarah Smith | B.Tech AI & DS SRMIST | CGPA 9.15 | Skills: Python, Machine Learning, PyTorch, TensorFlow, SQL, Power BI'
  },
  {
    id: 'cand-arjun-kumar',
    reg_number: 'RA2311003010276',
    name: 'Arjun Kumar',
    email: 'arjun.kumar@srmist.edu.in',
    phone: '+91 98403 99231',
    location: 'Chennai, Tamil Nadu',
    linkedin: 'linkedin.com/in/arjunkumar-dev',
    github: 'github.com/arjun-srm',
    education: {
      degree: 'B.Tech',
      department: 'Information Technology',
      college: 'SRM Institute of Science and Technology, Kattankulathur',
      cgpa: 8.35,
      graduation_year: 2027,
      active_backlogs: 0
    },
    skills: ['Python', 'SQL', 'Machine Learning', 'Scikit-Learn', 'Pandas', 'Excel', 'Power BI', 'Git', 'Java'],
    experience: [
      {
        company: 'Tech Mahindra',
        position: 'Software Intern',
        duration_months: 2,
        duration_text: '2 Months (Jun 2026 - Jul 2026)',
        is_internship: true,
        responsibilities: [
          'Engineered ETL scripts in Python and SQL for data normalization',
          'Assisted senior engineers in testing REST APIs'
        ]
      }
    ],
    projects: [
      {
        name: 'E-Commerce Recommendation System',
        technologies: ['Python', 'SQL', 'Scikit-Learn'],
        description: 'Collaborative filtering recommender system built on user purchase history.'
      }
    ],
    certifications: [
      'Google Cloud Certified: Associate Cloud Engineer'
    ],
    raw_resume_text: 'Arjun Kumar | B.Tech IT SRMIST | CGPA 8.35 | Skills: Python, SQL, Machine Learning, Power BI, Excel'
  },
  {
    id: 'cand-priya-sharma',
    reg_number: 'RA2311003010312',
    name: 'Priya Sharma',
    email: 'priya.sharma@srmist.edu.in',
    phone: '+91 98404 11098',
    location: 'Chennai, Tamil Nadu',
    linkedin: 'linkedin.com/in/priyasharma-web',
    github: 'github.com/priyasharma',
    education: {
      degree: 'B.Tech',
      department: 'Computer Science & Engineering',
      college: 'SRM Institute of Science and Technology, Kattankulathur',
      cgpa: 7.82,
      graduation_year: 2027,
      active_backlogs: 0
    },
    skills: ['Python', 'SQL', 'React', 'HTML/CSS', 'JavaScript', 'Node.js', 'Git', 'Excel'],
    experience: [],
    projects: [
      {
        name: 'College Placement Portal UI',
        technologies: ['React', 'Node.js', 'SQL', 'CSS'],
        description: 'Front-end web portal for student placement registration and timetable display.'
      }
    ],
    certifications: [
      'Meta Front-End Developer Professional Certificate'
    ],
    raw_resume_text: 'Priya Sharma | B.Tech CSE SRMIST | CGPA 7.82 | Skills: Python, SQL, React, JavaScript, HTML/CSS'
  },
  {
    id: 'cand-rohan-verma',
    reg_number: 'RA2311003010488',
    name: 'Rohan Verma',
    email: 'rohan.verma@srmist.edu.in',
    phone: '+91 98405 55432',
    location: 'Chennai, Tamil Nadu',
    linkedin: 'linkedin.com/in/rohanverma-ml',
    github: 'github.com/rohan-ds',
    education: {
      degree: 'B.Tech',
      department: 'Computer Science & Engineering',
      college: 'SRM Institute of Science and Technology, Kattankulathur',
      cgpa: 9.42,
      graduation_year: 2027,
      active_backlogs: 0
    },
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL', 'AWS', 'Docker', 'FastAPI', 'Pandas', 'NumPy', 'Git'],
    experience: [
      {
        company: 'Amazon Web Services',
        position: 'SDE Intern',
        duration_months: 3,
        duration_text: '3 Months (May 2026 - Jul 2026)',
        is_internship: true,
        responsibilities: [
          'Built high-performance inference pipelines for large language models on AWS SageMaker',
          'Optimized distributed TensorFlow model training saving 28% GPU cluster costs',
          'Wrote microservice APIs using Python, Docker and automated CI/CD GitHub Actions'
        ]
      }
    ],
    projects: [
      {
        name: 'Real-time Autonomous Drone Navigation',
        technologies: ['Python', 'TensorFlow', 'ROS', 'PyTorch'],
        description: 'Real-time obstacle avoidance computer vision model processing 60 FPS video streams.'
      },
      {
        name: 'SRM Smart Attendance Face Recognition',
        technologies: ['Python', 'OpenCV', 'SQL', 'FastAPI'],
        description: 'Biometric edge-computing student attendance system deployed across 12 classrooms.'
      }
    ],
    certifications: [
      'AWS Certified Solutions Architect - Associate',
      'TensorFlow Developer Certificate (Google)',
      'NPTEL Elite Gold in Deep Learning'
    ],
    raw_resume_text: 'Rohan Verma | B.Tech CSE SRMIST | CGPA 9.42 | Skills: Python, Machine Learning, TensorFlow, AWS, Docker, PyTorch, SQL'
  },
  {
    id: 'cand-ananya-iyer',
    reg_number: 'RA2311003010567',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@srmist.edu.in',
    phone: '+91 98406 77890',
    location: 'Chennai, Tamil Nadu',
    linkedin: 'linkedin.com/in/ananyaiyer-da',
    github: 'github.com/ananya-analytics',
    education: {
      degree: 'B.Tech',
      department: 'Information Technology',
      college: 'SRM Institute of Science and Technology, Kattankulathur',
      cgpa: 8.85,
      graduation_year: 2027,
      active_backlogs: 0
    },
    skills: ['Python', 'SQL', 'Excel', 'Power BI', 'Statistics', 'Tableau', 'Pandas', 'NumPy', 'R', 'Git'],
    experience: [
      {
        company: 'Deloitte USI',
        position: 'Data Analytics Intern',
        duration_months: 3,
        duration_text: '3 Months (May 2026 - Jul 2026)',
        is_internship: true,
        responsibilities: [
          'Designed enterprise business intelligence dashboards in Power BI and Tableau for Fortune 500 clients',
          'Performed complex statistical hypothesis testing and regression modeling using Python and SQL',
          'Streamlined monthly KPI reporting processes saving 15 manual hours weekly'
        ]
      }
    ],
    projects: [
      {
        name: 'Global Supply Chain KPI Dashboard',
        technologies: ['Power BI', 'SQL', 'Excel', 'Python'],
        description: 'End-to-end interactive dashboard displaying freight delays, warehouse inventory, and turnover.'
      },
      {
        name: 'Customer Lifetime Value Predictive Engine',
        technologies: ['Python', 'SQL', 'Statistics', 'Pandas'],
        description: 'Statistical cohort model predicting customer retention and CLV with 89% accuracy.'
      }
    ],
    certifications: [
      'Microsoft Certified: Power BI Data Analyst Associate (PL-300)',
      'Google Data Analytics Professional Certificate'
    ],
    raw_resume_text: 'Ananya Iyer | B.Tech IT SRMIST | CGPA 8.85 | Skills: Python, SQL, Power BI, Excel, Statistics, Tableau, Pandas'
  },
  {
    id: 'cand-vikram-sundaram',
    reg_number: 'RA2311003010623',
    name: 'Vikram Sundaram',
    email: 'vikram.sundaram@srmist.edu.in',
    phone: '+91 98407 12948',
    location: 'Chennai, Tamil Nadu',
    linkedin: 'linkedin.com/in/vikramsundaram-dev',
    github: 'github.com/vikram-sundaram',
    education: {
      degree: 'B.Tech',
      department: 'Computer Science & Engineering',
      college: 'SRM Institute of Science and Technology, Kattankulathur',
      cgpa: 9.08,
      graduation_year: 2027,
      active_backlogs: 0
    },
    skills: ['Java', 'C++', 'Python', 'SQL', 'Data Structures', 'Algorithms', 'AWS', 'Docker', 'Git', 'Linux'],
    experience: [
      {
        company: 'Tata Consultancy Services',
        position: 'Software Developer Intern',
        duration_months: 3,
        duration_text: '3 Months (Jun 2026 - Aug 2026)',
        is_internship: true,
        responsibilities: [
          'Implemented distributed multithreaded caching services in Java Spring Boot',
          'Solved high-throughput database bottlenecks with optimized SQL indexes and query tuning'
        ]
      }
    ],
    projects: [
      {
        name: 'Distributed Key-Value Store with Raft Consensus',
        technologies: ['C++', 'Java', 'Networking', 'Docker'],
        description: 'Fault-tolerant distributed database implementing Raft consensus algorithm and TCP RPCs.'
      },
      {
        name: 'High-Speed Packet Routing Simulator',
        technologies: ['Java', 'Data Structures', 'Graph Algorithms'],
        description: 'Simulated shortest-path dynamic network routing for packet switching networks.'
      }
    ],
    certifications: [
      'Oracle Certified Professional: Java SE 17 Developer',
      'LeetCode 600+ Problems Solved (Knight Badge - Top 3%)'
    ],
    raw_resume_text: 'Vikram Sundaram | B.Tech CSE SRMIST | CGPA 9.08 | Skills: Java, C++, Python, SQL, Data Structures, AWS, Docker'
  },
  {
    id: 'cand-sneha-reddy',
    reg_number: 'RA2311003010734',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@srmist.edu.in',
    phone: '+91 98408 44219',
    location: 'Chennai, Tamil Nadu',
    linkedin: 'linkedin.com/in/snehareddy-web',
    github: 'github.com/sneha-reddy',
    education: {
      degree: 'B.Tech',
      department: 'Computer Science & Engineering',
      college: 'SRM Institute of Science and Technology, Kattankulathur',
      cgpa: 8.64,
      graduation_year: 2027,
      active_backlogs: 0
    },
    skills: ['React', 'Node.js', 'SQL', 'JavaScript', 'HTML/CSS', 'TypeScript', 'Tailwind CSS', 'Docker', 'Git'],
    experience: [
      {
        company: 'Zoho Corporation',
        position: 'Front-End Intern',
        duration_months: 3,
        duration_text: '3 Months (May 2026 - Jul 2026)',
        is_internship: true,
        responsibilities: [
          'Engineered reusable UI component library in React & TypeScript with 99.8% unit test coverage',
          'Collaborated with backend engineers to integrate REST and GraphQL endpoints'
        ]
      }
    ],
    projects: [
      {
        name: 'SRM Collaborative Code Playground',
        technologies: ['React', 'Node.js', 'WebSockets', 'Docker', 'SQL'],
        description: 'Real-time collaborative code editor with sandboxed execution in Docker containers.'
      }
    ],
    certifications: [
      'Meta Certified Front-End Developer',
      'HackerRank JavaScript (Gold)'
    ],
    raw_resume_text: 'Sneha Reddy | B.Tech CSE SRMIST | CGPA 8.64 | Skills: React, Node.js, SQL, JavaScript, HTML/CSS, TypeScript'
  },
  {
    id: 'cand-karthik-raman',
    reg_number: 'RA2311003010891',
    name: 'Karthik Raman',
    email: 'karthik.raman@srmist.edu.in',
    phone: '+91 98409 66124',
    location: 'Chennai, Tamil Nadu',
    linkedin: 'linkedin.com/in/karthikraman-srm',
    github: 'github.com/karthik-raman',
    education: {
      degree: 'B.Tech',
      department: 'Mechanical Engineering',
      college: 'SRM Institute of Science and Technology, Kattankulathur',
      cgpa: 8.12,
      graduation_year: 2027,
      active_backlogs: 0
    },
    skills: ['Python', 'AutoCAD', 'SolidWorks', 'MATLAB', 'SQL', 'C++'],
    experience: [],
    projects: [
      {
        name: 'Automated Robotic Arm Path Planner',
        technologies: ['Python', 'MATLAB', 'Robotics'],
        description: 'Kinematic trajectory planner for 6-DOF industrial robot arm.'
      }
    ],
    certifications: [
      'Certified SolidWorks Associate (CSWA)'
    ],
    raw_resume_text: 'Karthik Raman | B.Tech Mechanical SRMIST | CGPA 8.12 | Skills: Python, AutoCAD, SolidWorks, MATLAB, SQL'
  },
  {
    id: 'cand-divya-nair',
    reg_number: 'RA2311003010955',
    name: 'Divya Nair',
    email: 'divya.nair@srmist.edu.in',
    phone: '+91 98410 33871',
    location: 'Chennai, Tamil Nadu',
    linkedin: 'linkedin.com/in/divyanair-srm',
    github: 'github.com/divya-nair',
    education: {
      degree: 'B.Tech',
      department: 'Computer Science & Engineering',
      college: 'SRM Institute of Science and Technology, Kattankulathur',
      cgpa: 6.85,
      graduation_year: 2027,
      active_backlogs: 1
    },
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'React', 'HTML/CSS'],
    experience: [],
    projects: [
      {
        name: 'Movie Recommender System',
        technologies: ['Python', 'Scikit-Learn', 'Flask'],
        description: 'Built basic cosine similarity recommender algorithm.'
      }
    ],
    certifications: [],
    raw_resume_text: 'Divya Nair | B.Tech CSE SRMIST | CGPA 6.85 | Backlogs: 1 | Skills: Python, Machine Learning, TensorFlow, SQL'
  },
  {
    id: 'cand-manish-gupta',
    reg_number: 'RA2311003011022',
    name: 'Manish Gupta',
    email: 'manish.gupta@srmist.edu.in',
    phone: '+91 98411 99014',
    location: 'Chennai, Tamil Nadu',
    linkedin: 'linkedin.com/in/manishgupta-srm',
    github: 'github.com/manish-gupta',
    education: {
      degree: 'B.Tech',
      department: 'ECE',
      college: 'SRM Institute of Science and Technology, Kattankulathur',
      cgpa: 7.94,
      graduation_year: 2027,
      active_backlogs: 0
    },
    skills: ['C++', 'Python', 'SQL', 'Embedded Systems', 'IoT', 'Git', 'Linux'],
    experience: [],
    projects: [
      {
        name: 'Smart Campus IoT Environmental Monitor',
        technologies: ['C++', 'Python', 'MQTT', 'SQL'],
        description: 'Real-time air quality and temperature sensor network across SRM campus.'
      }
    ],
    certifications: [
      'Embedded Linux Fundamentals'
    ],
    raw_resume_text: 'Manish Gupta | B.Tech ECE SRMIST | CGPA 7.94 | Skills: C++, Python, SQL, Embedded Systems, IoT'
  },
  {
    id: 'cand-pooja-patel',
    reg_number: 'RA2311003011190',
    name: 'Pooja Patel',
    email: 'pooja.patel@srmist.edu.in',
    phone: '+91 98412 88472',
    location: 'Chennai, Tamil Nadu',
    linkedin: 'linkedin.com/in/poojapatel-ds',
    github: 'github.com/pooja-patel',
    education: {
      degree: 'MCA',
      department: 'Computer Applications',
      college: 'SRM Institute of Science and Technology, Kattankulathur',
      cgpa: 8.76,
      graduation_year: 2027,
      active_backlogs: 0
    },
    skills: ['Python', 'SQL', 'Machine Learning', 'TensorFlow', 'Power BI', 'Excel', 'Pandas', 'Flask', 'Git'],
    experience: [
      {
        company: 'Infosys Limited',
        position: 'Systems Engineer Intern',
        duration_months: 3,
        duration_text: '3 Months (May 2026 - Jul 2026)',
        is_internship: true,
        responsibilities: [
          'Developed automated SQL reporting queries and data visualization dashboards in Power BI',
          'Built Python data validation scripts for enterprise CRM synchronization'
        ]
      }
    ],
    projects: [
      {
        name: 'Hospital Patient Readmission Predictor',
        technologies: ['Python', 'TensorFlow', 'SQL', 'Flask'],
        description: 'Clinical decision-support model identifying high-risk readmission patients with 91% accuracy.'
      }
    ],
    certifications: [
      'IBM Data Science Professional Certificate'
    ],
    raw_resume_text: 'Pooja Patel | MCA SRMIST | CGPA 8.76 | Skills: Python, SQL, Machine Learning, TensorFlow, Power BI, Excel'
  }
];

export const INITIAL_INTERVIEWS: Interview[] = [
  {
    id: 'int-1',
    candidate_id: 'cand-john-doe',
    candidate_name: 'John Doe',
    candidate_reg_no: 'RA2311003010142',
    candidate_email: 'john.doe@srmist.edu.in',
    candidate_dept: 'CSE',
    job_id: 'job-abc-aiml',
    job_title: 'Senior AI / ML Engineer',
    company: 'ABC Technologies',
    round: 'Technical Round 1',
    date: '2026-09-12',
    time: '10:30 AM',
    interviewer: 'Dr. R. Venkat (Lead AI Architect)',
    venue: 'SRM Placement Cell - Interview Suite 302',
    status: 'Scheduled',
    score: 88,
    feedback: 'Strong grasp of Python and ML model architectures.',
    created_at: '2026-09-01'
  },
  {
    id: 'int-2',
    candidate_id: 'cand-sarah-smith',
    candidate_name: 'Sarah Smith',
    candidate_reg_no: 'RA2311003010189',
    candidate_email: 'sarah.smith@srmist.edu.in',
    candidate_dept: 'AI & DS',
    job_id: 'job-abc-aiml',
    job_title: 'Senior AI / ML Engineer',
    company: 'ABC Technologies',
    round: 'Technical Round 2',
    date: '2026-09-13',
    time: '02:00 PM',
    interviewer: 'Priya Narayanan (Principal Data Scientist)',
    venue: 'Google Meet: meet.google.com/abc-srm-hire',
    status: 'Scheduled',
    score: 92,
    created_at: '2026-09-02'
  },
  {
    id: 'int-3',
    candidate_id: 'cand-rohan-verma',
    candidate_name: 'Rohan Verma',
    candidate_reg_no: 'RA2311003010488',
    candidate_email: 'rohan.verma@srmist.edu.in',
    candidate_dept: 'CSE',
    job_id: 'job-amazon-sde',
    job_title: 'Software Development Engineer (SDE-1)',
    company: 'Amazon Web Services',
    round: 'Final Placement Offer',
    date: '2026-09-10',
    time: '11:00 AM',
    interviewer: 'Amazon Placement Panel',
    venue: 'SRM Tech Park Auditorium - Panel B',
    status: 'Cleared',
    score: 96,
    feedback: 'Outstanding problem solving and system design proficiency.',
    created_at: '2026-08-29'
  },
  {
    id: 'int-4',
    candidate_id: 'cand-ananya-iyer',
    candidate_name: 'Ananya Iyer',
    candidate_reg_no: 'RA2311003010567',
    candidate_email: 'ananya.iyer@srmist.edu.in',
    candidate_dept: 'IT',
    job_id: 'job-deloitte-da',
    job_title: 'Data Analyst (Campus Drive)',
    company: 'Deloitte USI',
    round: 'HR Round',
    date: '2026-09-14',
    time: '04:15 PM',
    interviewer: 'Anita Sharma (HR Lead)',
    venue: 'SRM Placement Cell - Board Room 1',
    status: 'Scheduled',
    created_at: '2026-09-03'
  }
];

export const SRM_DEPARTMENT_STATS = [
  { department: 'CSE', applications: 420, eligible: 360, shortlisted: 88, selected: 32, avg_cgpa: 8.42, avg_ai_score: 84.5 },
  { department: 'IT', applications: 280, eligible: 238, shortlisted: 54, selected: 19, avg_cgpa: 8.21, avg_ai_score: 81.2 },
  { department: 'AI & DS', applications: 210, eligible: 192, shortlisted: 48, selected: 18, avg_cgpa: 8.65, avg_ai_score: 87.8 },
  { department: 'ECE', applications: 180, eligible: 145, shortlisted: 26, selected: 9, avg_cgpa: 7.98, avg_ai_score: 75.4 },
  { department: 'MCA', applications: 95, eligible: 82, shortlisted: 18, selected: 6, avg_cgpa: 8.35, avg_ai_score: 80.6 },
  { department: 'Others', applications: 63, eligible: 40, shortlisted: 8, selected: 2, avg_cgpa: 7.62, avg_ai_score: 69.1 }
];

export const SRM_SKILL_DEMAND_STATS = [
  { skill: 'Python', demandCount: 642, candidateProficiency: 580, category: 'Language' },
  { skill: 'SQL', demandCount: 520, candidateProficiency: 495, category: 'Database' },
  { skill: 'Machine Learning', demandCount: 384, candidateProficiency: 310, category: 'Framework' },
  { skill: 'Java', demandCount: 312, candidateProficiency: 390, category: 'Language' },
  { skill: 'React', demandCount: 260, candidateProficiency: 235, category: 'Framework' },
  { skill: 'Power BI', demandCount: 240, candidateProficiency: 190, category: 'Tool' },
  { skill: 'AWS', demandCount: 180, candidateProficiency: 140, category: 'Cloud/DevOps' },
  { skill: 'Docker', demandCount: 165, candidateProficiency: 115, category: 'Cloud/DevOps' },
  { skill: 'C++', demandCount: 150, candidateProficiency: 220, category: 'Language' }
];
