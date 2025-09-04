Folder structure:

job-initiation-api/
├── src/
│   ├── controllers/
│   │   └── jobController.ts
│   ├── models/
│   │   └── job.ts
│   ├── services/
│   │   ├── jobService.ts
│   │   ├── pubsubService.ts
│   │   └── firestoreService.ts
│   ├── middleware/
│   │   ├── validation.ts
│   │   └── errorHandler.ts
│   ├── routes/
│   │   └── jobs.ts
│   ├── utils/
│   │   └── logger.ts
│   └── app.ts
├── package.json
├── tsconfig.json
├── .env.example
├── Dockerfile
└── .dockerignore
