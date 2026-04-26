# Full Stack MERN Car Rental Booking Application

**Live Demo:** [https://car-rental-one-jet.vercel.app/](https://car-rental-one-jet.vercel.app/)

A responsive, full-stack car rental booking web application built using the MERN stack (MongoDB, Express.js, React.js, Node.js). The platform features a dual-role system where regular users can search for and book cars, while car owners have a dedicated dashboard to list their vehicles and manage reservations.

##  Tech Stack

*   **Frontend:** React.js (initialized with Vite), Tailwind CSS for responsive styling, Framer Motion for UI animations, and React Router DOM. Global state management is handled via the built-in React Context API.
*   **Backend:** Node.js, Express.js.
*   **Database:** MongoDB Atlas utilizing Mongoose ORM.
*   **Security & Authentication:** JSON Web Tokens (JWT) and bcrypt for password hashing.
*   **Media Processing & Storage:** ImageKit API for real-time image optimization, compression (WebP), and cloud storage.
*   **Deployment:** Vercel (Independent deployments for frontend and backend).

##  Key Features

### User Features
*   **Authentication:** Secure login and registration using encrypted passwords (bcrypt) and JWT-based session handling.
*   **Dynamic Search & Filtering:** Filter available cars dynamically by providing a pickup location, pickup date, and return date. Search parameters are synchronized with the URL to make searches shareable.
*   **Booking System:** Calculate total rental prices automatically based on the selected date range. Custom backend logic queries the database to prevent scheduling conflicts and double-bookings for the requested dates. 
*   **My Bookings:** A dedicated page to track rental history, view total calculated prices, and monitor real-time booking statuses (Pending, Confirmed, Cancelled).

### Owner Features (Dashboard)
*   **Role Upgrade:** Users can seamlessly upgrade their account to an "owner" role to access the admin dashboard.
*   **Vehicle Management:** List new cars with complete specifications and upload images. Owners can toggle a car's public availability or perform a "soft delete" to hide the car while preserving historical booking records.
*   **Reservation Management:** View incoming booking requests, and update their statuses to confirmed or cancelled.
*   **Analytics:** Track total cars, pending/completed bookings, and calculate automated monthly revenue from confirmed bookings.
*   **Image Optimization:** Heavy user-uploaded car and profile images are parsed using Multer and automatically resized, compressed, and converted to modern formats (WebP) via ImageKit before saving to MongoDB, drastically improving load times.

## 🛠️ Local Installation & Setup

Follow these steps to run the application locally.

### Prerequisites
*   Node.js installed
*   MongoDB Atlas account & connection string
*   ImageKit account for API keys

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/car-rental-fullstack.git
cd car-rental-fullstack
```

### 2. Backend Setup
Navigate to the server directory, install dependencies, and setup environment variables.
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory and add the following variables:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```
Start the backend server:
```bash
npm run server
```

### 3. Frontend Setup
Open a new terminal, navigate to the client directory, install dependencies, and setup environment variables.
```bash
cd client
npm install
```
Create a `.env` file in the `client` directory and add the following variables:
```env
VITE_CURRENCY=$
VITE_BASE_URL=http://localhost:3000
```
Start the frontend development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend will be running on `http://localhost:3000`.

## 👨‍💻 Contributors

- Hiten Kala – Lead Developer (designed and built core application, backend APIs, authentication, booking logic)
- Rahul – UI improvements and testing
- Gaurav – Minor contributions
- Aditya – Documentation and testing