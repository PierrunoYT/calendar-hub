# Calendar-Hub

A modern, full-stack calendar application for managing events and schedules efficiently.

Repository: [https://github.com/PierrunoYT/calendar-hub](https://github.com/PierrunoYT/calendar-hub)

## Features

- Interactive calendar interface
- Event management (create, read, update, delete)
- Real-time updates
- Cross-platform compatibility
- User-friendly interface

## Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- SQLite (v4.0.0 or higher)

## Installation

### Windows

1. Clone the repository
```bash
git clone https://github.com/PierrunoYT/calendar-hub.git
cd calendar-hub
```

2. Install dependencies for both frontend and backend
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Create a `.env` file in the backend directory with your SQLite configuration. For example:
```
DATABASE_URL=sqlite:./data/db.sqlite
PORT=3001
```

### macOS/Linux

1. Clone the repository
```bash
git clone https://github.com/PierrunoYT/calendar-hub.git
cd calendar-hub
```

2. Install dependencies for both frontend and backend
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Create a `.env` file in the backend directory with your SQLite configuration. For example:
```
DATABASE_URL=sqlite:./data/db.sqlite
PORT=3001
```

## Running the Application

### Backend

```bash
cd backend
npm run dev
```

### Frontend

```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## Development

- Frontend runs on port 3000
- Backend runs on port 3001
- Make sure SQLite is running before starting the backend server

## Building for Production

### Frontend
```bash
cd frontend
npm run build
```

### Backend
```bash
cd backend
npm run build
```

## Testing

```bash
# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 PierrunoYT

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. 
