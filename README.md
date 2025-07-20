# StudyShare

**StudyShare** is a modern academic resource sharing platform built with React (frontend) and Node.js/Express (backend), using MySQL for data storage. It allows users to sign in with Google, upload and share academic resources, and manage their own profile and contributions.

---

## Features

### Authentication
- **Google Sign-In Only:** Users can register and log in using their Google account. Manual email/password registration is disabled, ensuring only real, verified emails are used.
- **JWT-based Sessions:** Authenticated sessions are managed with secure HTTP-only cookies.

### User Profile
- **Profile View:** Users can view their name and email. (Other profile fields are hidden for privacy.)
- **My Resources:** Users see a list of all resources they have uploaded, with the ability to delete any of their own resources.

### Resource Management
- **Upload Resources:** Authenticated users can upload academic resources (PDF, DOC, PPT, XLS, TXT) with metadata (title, description, category, tags).
- **Cloudinary Integration:** Files are uploaded to Cloudinary for secure and scalable storage.
- **Resource Dashboard:** All users can browse and search resources by title, description, tags, category, and file type.
- **Resource Detail View:** Each resource has a detail page with a preview (for PDFs), metadata, and download option.
- **Download Tracking:** The number of downloads is tracked for each resource.
- **Delete Resource:** Users can permanently delete their own resources from their profile.

### Password Management
- **Forgot Password:** (Legacy) Users who registered with email/password can request a password reset link via email.
- **Password Reset:** Users can reset their password using a secure, time-limited token sent to their email.

### Security
- **CORS:** Configured to allow frontend-backend communication on localhost.
- **Authentication Middleware:** Protects all sensitive endpoints.
- **Input Validation:** Basic validation on all forms and API endpoints.

---

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Lucide React Icons
- **Backend:** Node.js, Express, Passport.js (Google OAuth), MySQL, Cloudinary, Multer, Nodemailer
- **Database:** MySQL
- **File Storage:** Cloudinary

---

## Project Structure

```
studyshare-main/
  backend/                # Node.js/Express backend
    index.js              # Main server file
    package.json
  src/                    # React frontend
    components/           # React components (AuthModal, Dashboard, Header, etc.)
    hooks/                # Custom React hooks (useAuth, useResources)
    App.tsx               # Main app component
    main.tsx              # React entry point
  public/                 # Static files (PDF worker, etc.)
  ...
```

---

## Setup Instructions

### Prerequisites

- Node.js (v18+ recommended)
- MySQL server
- Google Cloud project with OAuth 2.0 credentials
- Cloudinary account for file uploads

### 1. Clone the Repository

```sh
git clone <your-repo-url>
cd studyshare-main
```

### 2. Backend Setup

#### a. Install dependencies

```sh
cd backend
npm install
```

#### b. Configure Environment Variables

Create a `.env` file in the `backend/` directory with the following:

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### c. Set up MySQL Database

- Create a database named `studyshare`.
- Import or create the following tables:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255) NULL,
  college VARCHAR(255),
  phone VARCHAR(20) NULL,
  degree_year VARCHAR(10) NULL,
  about TEXT NULL,
  avatar VARCHAR(255) NULL,
  reset_token VARCHAR(255) NULL,
  reset_token_expiry DATETIME NULL
);

CREATE TABLE resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  college VARCHAR(255),
  fileType VARCHAR(20),
  fileUrl VARCHAR(255),
  uploadedBy INT,
  uploadedAt DATETIME,
  downloads INT DEFAULT 0,
  rating FLOAT DEFAULT 0,
  tags TEXT,
  size INT NULL,
  FOREIGN KEY (uploadedBy) REFERENCES users(id)
);
```

#### d. Start the Backend

```sh
node index.js
```

The backend will run on `http://localhost:4000`.

---

### 3. Frontend Setup

#### a. Install dependencies

```sh
npm install
```

#### b. Start the Frontend

```sh
npm run dev
```

The frontend will run on `http://localhost:5173`.

---

## Usage

- **Sign in with Google** to access all features.
- **Upload resources** from the dashboard.
- **View and manage your resources** in your profile.
- **Delete your own resources** from your profile.
- **Browse and download resources** from the dashboard.
- **Reset your password** (legacy users only) via the "Forgot Password" link.

---

## Customization

- **Resource Categories:** Edit `src/components/UploadModal.tsx` to change available categories.
- **File Types:** Supported file types can be extended in the same file.
- **Profile Fields:** You can add or remove profile fields in the database and frontend as needed.

---

## Security Notes

- Only authenticated users can upload, delete, or download resources.
- Only the uploader can delete their own resources.
- All sensitive actions are protected by JWT authentication and secure cookies.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License

[MIT](LICENSE)

---

## Credits

- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [MySQL](https://www.mysql.com/)
- [Cloudinary](https://cloudinary.com/)
- [Google OAuth](https://developers.google.com/identity)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
