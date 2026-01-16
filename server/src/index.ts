import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json());
app.use(cors());

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

import contactRoutes from './routes/contacts.js';
import ticketRoutes from './routes/tickets.js';
import userRoutes from './routes/users.js';
import sprintRoutes from './routes/sprints.js';
import projectRoutes from './routes/projects.js';
import employeeRoutes from './routes/employees.js';
import accountRoutes from './routes/accounts.js';
import attendanceRoutes from './routes/attendance.js';
import payrollRoutes from './routes/payroll.js';
import leaveRequestRoutes from './routes/leaveRequests.js';
import leadRoutes from './routes/leads.js';
import taskRoutes from './routes/tasks.js';
import notificationRoutes from './routes/notifications.js';
import labelRoutes from './routes/labels.js';
import templateRoutes from './routes/templates.js';
import commentRoutes from './routes/comments.js';
import opportunityRoutes from './routes/opportunities.js';
import caseRoutes from './routes/cases.js';
import emailRoutes from './routes/email.js';
import columnRoutes from './routes/columns.js';

import { auth } from './middleware/auth.js';



// Define Routes
app.use('/api/contacts', auth, contactRoutes);
app.use('/api/tickets', auth, ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sprints', auth, sprintRoutes);
app.use('/api/projects', auth, projectRoutes);
app.use('/api/employees', auth, employeeRoutes);
app.use('/api/accounts', auth, accountRoutes);
app.use('/api/attendance', auth, attendanceRoutes);
app.use('/api/payroll', auth, payrollRoutes);
app.use('/api/leave-requests', auth, leaveRequestRoutes);
app.use('/api/leads', auth, leadRoutes);
app.use('/api/tasks', auth, taskRoutes);
app.use('/api/notifications', auth, notificationRoutes);
app.use('/api/labels', auth, labelRoutes);
app.use('/api/templates', auth, templateRoutes);
app.use('/api/comments', auth, commentRoutes);
app.use('/api/opportunities', auth, opportunityRoutes);
app.use('/api/cases', auth, caseRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/columns', columnRoutes);


app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

export default app;
