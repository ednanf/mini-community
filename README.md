<img width="134" height="134" alt="apple-touch-icon" src="https://github.com/user-attachments/assets/9e5523d9-9877-4b08-8aaf-2edef999ba07" />

# Mini Community

## Notes

- The backend is hosted on Render and takes a moment to wake up after periods
  of inactivity. Please allow time for the server to respond on your first
  request.
- Currently, the auth token is stored in local storage instead of cookies to
  avoid CORS complications, particularly with WebKit on iOS.

## About Me

- **Author**: Ednan Rogério Frizzera Filho
- [GitHub](https://github.com/ednanf) • [LinkedIn](https://www.linkedin.com/in/ednanrff/)
- Additional contact info available on my GitHub profile.

## Objective

This project serves as practice for building a full-stack application using the MERN stack.
The scope is intentionally limited to focus on core functionalities, and by design has certain limitations, such as not
allowing users to edit posts or upload images for their profiles.

The backend endpoints include more functionalities than the frontend currently utilizes, allowing for future expansions.

If you are curious about the backend structure, a detailed report was generated using copilot, and it can be found in
/docs.

## API Specification

[See in Scalar](https://registry.scalar.com/@ednan-frizzera-dev-team/apis/mini-community-api/latest)

## Live Application

🚀 Under construction...

## Main Technologies

### Languages

- TypeScript
- HTML
- CSS

### Backend

- Node.js
- Express.js
- Mongoose
- Zod
- tsx

### Frontend

- React
- Vite (build tool)

### Hosting

- Backend: Render
- Frontend: Vercel

## Dependencies

### Backend

```text
mini-community (backend)
├── bcryptjs ^3.0.2
├── cors ^2.8.5
├── express ^5.1.0
├── express-rate-limit ^8.1.0
├── express-xss-sanitizer ^2.0.1
├── helmet ^8.1.0
├── http-status-codes ^2.3.0
├── jsonwebtoken ^9.0.2
├── mongoose ^8.19.0
├── morgan ^1.10.1
├── ms ^2.1.3
├── validator ^13.15.15
├── zod ^4.1.11
├── @eslint/js ^9.37.0 (dev)
├── @types/cors ^2.8.19 (dev)
├── @types/express ^5.0.3 (dev)
├── @types/express-xss-sanitizer ^2.0.0 (dev)
├── @types/jsonwebtoken ^9.0.10 (dev)
├── @types/morgan ^1.9.10 (dev)
├── @types/node ^24.7.0 (dev)
├── @types/validator ^13.15.3 (dev)
├── eslint ^9.37.0 (dev)
├── prettier ^3.6.2 (dev)
├── tsx ^4.20.6 (dev)
├── typescript-eslint ^8.45.0 (dev)
└── typescript ^5.9.3 (dev)
```

### Frontend

```text
mini-community (frontend)
├── axios ^1.12.2
├── react ^19.1.1
├── react-dom ^19.1.1
├── react-icons ^5.5.0
├── react-router-dom ^7.9.4
├── react-toastify ^11.0.5
├── @eslint/js ^9.36.0 (dev)
├── @types/node ^24.6.0 (dev)
├── @types/react ^19.1.16 (dev)
├── @types/react-dom ^19.1.9 (dev)
├── @vitejs/plugin-react ^5.0.4 (dev)
├── babel-plugin-react-compiler ^19.1.0-rc.3 (dev)
├── eslint ^9.36.0 (dev)
├── eslint-plugin-react-hooks ^5.2.0 (dev)
├── eslint-plugin-react-refresh ^0.4.22 (dev)
├── globals ^16.4.0 (dev)
├── prettier ^3.6.2 (dev)
├── typescript ~5.9.3 (dev)
├── typescript-eslint ^8.45.0 (dev)
├── vite ^7.1.11 (dev)
└── vite-plugin-pwa ^1.1.0 (dev)
```

## Legal

[![License: All Rights Reserved](https://img.shields.io/badge/License-All%20Rights%20Reserved-lightgrey)](./LICENSE)
