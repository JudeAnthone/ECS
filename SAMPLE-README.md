# *BrewCrafter: Your Drink, Your Rules. A Smart Cafe System with Custom Drink Builder and Sales Analytics.*
This project is developed under the academic requirements for Information Management Systems. From the pressure of deadlines and the need for a unique approach, this project combines the convenience of modern cafe "SMART" ordering with the creativity of customizable drinks.<br>  

# *About the Project*
BrewCrafter: Your Drink, Your Rules is a full-stack smart café management system developed as a capstone school project. The system was designed with a practical, real-world café business in mind—particularly targeting small to mid-sized establishments that face limitations due to manual workflows.

The system provides a complete digital ordering experience for customers through an interactive web-based client platform, and a admin dashboard for café owners or staff to manage day-to-day operations efficiently. It allows customers to browse a dynamic menu, customize their drinks through a custom builder, and securely place orders—all with real-time pricing and cart management.

On the admin side, the system uses café staff to manage menus, monitor inventory, view detailed customer orders, and generate sales analytics through visual charts. The platform uses modern technologies like React, Node.js, PostgreSQL, and JWT authentication to ensure performance, security, and scalability.

*Key Objectives of the Project:*
- To replace manual café operations with a centralized, automated system.
- To enhance customer engagement through personalized drink options.
- To provide café managers with actionable insights via real-time analytics and inventory alerts.
- To implement secure authentication for both users and admins, including OTP verification and step-up security layers.
----
# *System Architecture*
BrewCrafter is mainly design for both customer and admin side of a Caffe with the help of the following technologies:
### *Tech Stack:*
### Frontend (Customer Side)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Axios](https://img.shields.io/badge/axios-%230072C6.svg?style=for-the-badge&logo=axios&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Admin Dashboard (Admin Side)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![JSX](https://img.shields.io/badge/jsx-%2361DAFB.svg?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Framer Motion](https://img.shields.io/badge/framer--motion-%23000000.svg?style=for-the-badge&logo=framer&logoColor=white)
![Axios](https://img.shields.io/badge/axios-%230072C6.svg?style=for-the-badge&logo=axios&logoColor=white)
![Multer](https://img.shields.io/badge/multer-%23000000.svg?style=for-the-badge&logo=npm&logoColor=white)

### Backend (API & Business Logic)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![OAuth (Facebook)](https://img.shields.io/badge/Facebook_Login-1877F2?style=for-the-badge&logo=facebook&logoColor=white)
![OAuth (Github)](https://img.shields.io/badge/GitHub_Login-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)
![OAuth (Email)](https://img.shields.io/badge/Email-0078D4?style=for-the-badge&logo=gmail&logoColor=white)
![Nodemailer](https://img.shields.io/badge/nodemailer-%230077B5.svg?style=for-the-badge&logo=maildotru&logoColor=white)
![Multer](https://img.shields.io/badge/multer-%23000000.svg?style=for-the-badge&logo=npm&logoColor=white)

### 🗄Database
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

----

# *Development Environment & Dependencies*
### Core Dependencies: 
Client-Side Dependencies (/frontend):
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.14.2",
  "axios": "^1.6.8",
  "framer-motion": "^10.16.4",
  "tailwindcss": "^3.3.3"
}
```

Admin Dashboard Dependencies (/admin-dashboard):
```json
{
  "react": "^18.2.0",
  "typescript": "^5.3.3",
  "tailwindcss": "^3.3.3",
  "react-router-dom": "^6.14.2",
  "chart.js": "^4.4.0",
  "recharts": "^2.8.0"
}
```
Backend Dependencies (/backend):
```json
{
  "express": "^4.21.2",
  "pg": "^8.16.0",
  "bcryptjs": "^3.0.2",
  "jsonwebtoken": "^9.0.2",
  "passport": "^0.7.0",
  "passport-facebook-google-github": "^3.0.0",
  "multer": "^2.0.1",
  "nodemailer": "^7.0.3",
  "cors": "^2.8.5",
  "dotenv": "^16.5.0",
  "uuid": "^11.1.0"
}
```

----
# *System Features Overview*
## 1. Client-Side Features 🧑‍💻

### Authentication & Security
- Email-based registration with OTP verification
- Facebook OAuth integration
- Step-up verification (Birthday + OTP) after 5 failed login attempts
- JWT-based authentication

### Menu & Ordering
- Browse product catalog with categories
- Real-time product availability status
- Custom drink builder with options:
  - Base drink selection
  - Size customization
  - Milk alternatives
  - Sweetener options
  - Toppings and add-ins
  - Temperature preference

### Shopping Cart & Checkout
- Add/remove items
- Quantity adjustment
- Real-time price calculation
- Order summary
- Order status tracking
- Order history viewing

## 2. Admin Dashboard Features 👨‍💼

### Analytics & Monitoring
- Real-time sales tracking
- Daily order statistics
- Custom drink popularity metrics
- Inventory status monitoring
- Sales trend visualization
- Popular items tracking

### Order Management
- Real-time order notifications
- Order status updates
- Customer order history
- Order details viewing
- Payment tracking

### Inventory Control
- Stock level monitoring
- Low stock alerts
- Out-of-stock notifications
- Product availability toggle

### Customer Management
- Customer database
- Purchase history tracking
- Customer activity monitoring
- Profile management

### System Settings
- Profile management
- Password changes
- Notification preferences
- System information

## 3. Backend Features ⚙️

### API Endpoints
- Authentication routes (`/api/auth/*`)
- Product management (`/api/products/*`)
- Custom drink handling (`/api/custom-drinks/*`)
- Cart operations (`/api/cart/*`)
- Order processing (`/api/orders/*`)
- Admin routes (`/api/admin/*`)

### Database Operations
- PostgreSQL database integration
- Queries for analytics
- Transaction management
- Data integrity checks

### Security Implementation
- Password hashing (bcrypt)
- JWT token management
- IP restriction for admin access
- Multi-factor authentication
- Session management

### File Handling
- Image upload support (Multer)
- File storage management

### Email Services
- OTP delivery
- Email verification
- Notification system

### Data Processing
- Price calculation logic
- Order processing pipeline
- Inventory tracking
- Sales analytics computation

----
# *System Walkthrough & User Flow*
### I provide the GOOGLE DRIVE link below for all the images and screenshots of every part of the system. This is to ensure that all the parts, including the customer, admin, and authentication can be seen in one folder to avoid confusion. 
GOOGLE DRIVE LINK: 
https://drive.google.com/drive/folders/1454MwAXWY-DHvL2d0Pjh8C6moxJ8JsJe?usp=sharing

----
# *Installation & Setup Guide*
### Cloning the repository
git clone https://github.com/JudeAnthone/BrewCrafter-SmartCafeSystem-with-SalesAnalytics.git
cd BREWCRAFTER-INFOMGMT-FINALS

### Backend Setup:
- npm install (for each folder)
- cd backend (backend)
- cd frontend (frontend)
- cd admin-dashboard (admin)
- npm run dev (admin and frontend server starter)
- node server.js (backend server starter)

----
# *Materials & External Resources*
### Project Inspirations:
(Custom drink builder inspiration)
- https://easypc.com.ph/pages/build-a-pc?srsltid=AfmBOorVXKarFKr6cyQM8UFq867cU4wTym6IruDEKVhNg_kMYO3iq2uz  
- https://www.corsair.com/us/en/pc-builder/?srsltid=AfmBOorgmBiLs4JF2miupdhg4Kd5NYYJZpOUO81Sfj225rRjS1d74evN

(Overall)
- https://www.starbucks.com/menu
- https://www.nescafe.com/ph/
- https://react.dev/
- https://tailwindcss.com/
- https://nodejs.org/en
- https://www.postgresql.org/

----
# *Project Contributors*
- Me as fuck
- Jude Anthone R. Duarte (Full Stack developer)
 
