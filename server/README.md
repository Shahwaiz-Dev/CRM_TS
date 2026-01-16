# Express.js & MongoDB Backend for CRM_TS

This backend handles the CRM and HR management logic, replacing the previous Firebase infrastructure.

## Technologies
- **Express.js**: Web framework for Node.js.
- **Mongoose**: MongoDB object modeling tool.
- **MongoDB**: Primary database.
- **JSONWebToken & Bcryptjs**: For secure authentication.
- **TypeScript**: For type safety.

## Getting Started

### Prerequisites
- Node.js installed.
- MongoDB running locally (default: `mongodb://localhost:27017/crm_ts`) or a MongoDB Atlas connection string.

### Installation
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the `server` directory with the following:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

### Running the Server
- **Development Mode**:
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

## API Endpoints

### CRM Modules
- `GET /api/contacts`: Retrieve all contacts.
- `POST /api/contacts`: Create a new contact.
- `PUT /api/contacts/:id`: Update a contact.
- `DELETE /api/contacts/:id`: Delete a contact.
- `GET /api/tickets`: Retrieve all tickets.
- `POST /api/tickets`: Create a new ticket (auto-assigns key/number).
- `GET /api/accounts`: Retrieve all accounts.

### HR Management
- `GET /api/employees`: Retrieve all employees.
- `GET /api/attendance`: Retrieve attendance records.
- `GET /api/payroll`: Retrieve payroll records.

### Users
- `GET /api/users`: List all users.
- `POST /api/users/`: Create a user.

## Data Migration
To migrate data from Firestore, export your collections to JSON and use the template script in `src/scripts/migrate-data.ts`.

1. Place JSON exports in `server/exports/`.
2. Configure the script to point to your files.
3. Run the script (see template for details).
