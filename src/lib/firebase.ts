import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, increment, runTransaction } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDy6Fqr8L-3PYEFeh0OWtux-xEFpDbj9XY",
  authDomain: "crm1-34026.firebaseapp.com",
  projectId: "crm1-34026",
  storageBucket: "crm1-34026.firebasestorage.app",
  messagingSenderId: "1079966153101",
  appId: "1:1079966153101:web:bf1b7b3400fe73a3d2e5c4",
  measurementId: "G-6L1632R3V8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

import api from './api';

// HR Management Backend Logic

// Employee CRUD
export async function addEmployee(employee) {
  const response = await api.post('/employees', employee);
  return response.data;
}
export async function getEmployees() {
  const response = await api.get('/employees');
  return response.data;
}
export async function updateEmployee(id, data) {
  const response = await api.put(`/employees/${id}`, data);
  return response.data;
}
export async function deleteEmployee(id) {
  const response = await api.delete(`/employees/${id}`);
  return response.data;
}

// Attendance CRUD
export async function addAttendance(attendance) {
  const response = await api.post('/attendance', attendance);
  return response.data;
}
export async function getAttendance() {
  const response = await api.get('/attendance');
  return response.data;
}
export async function updateAttendance(id, data) {
  const response = await api.put(`/attendance/${id}`, data);
  return response.data;
}
export async function deleteAttendance(id) {
  const response = await api.delete(`/attendance/${id}`);
  return response.data;
}

// Payroll CRUD
export async function addPayroll(payroll) {
  const response = await api.post('/payroll', payroll);
  return response.data;
}
export async function getPayroll() {
  const response = await api.get('/payroll');
  return response.data;
}
export async function updatePayroll(id, data) {
  const response = await api.put(`/payroll/${id}`, data);
  return response.data;
}
export async function deletePayroll(id) {
  const response = await api.delete(`/payroll/${id}`);
  return response.data;
}

// User CRUD
export async function addUser(user) {
  const response = await api.post('/users', user);
  return response.data;
}
export async function getUsers() {
  const response = await api.get('/users');
  return response.data;
}
export async function updateUser(id, data) {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
}
export async function deleteUser(id) {
  const response = await api.delete(`/users/${id}`);
  return response.data;
}

export async function uploadProfilePicture(userId: string, file: File) {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await api.post(`/users/${userId}/upload-photo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  // Return the photoURL from the response
  return response.data.photoURL;
}

export function getFileUrl(path?: string) {
  if (!path) return "";
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  return `${baseUrl}${path}`;
}

// Opportunities CRUD
export async function addOpportunity(opportunity) {
  const response = await api.post('/opportunities', opportunity);
  return response.data;
}
export async function getOpportunities() {
  const response = await api.get('/opportunities');
  return response.data;
}
export async function updateOpportunity(id, data) {
  const response = await api.put(`/opportunities/${id}`, data);
  return response.data;
}
export async function deleteOpportunity(id) {
  const response = await api.delete(`/opportunities/${id}`);
  return response.data;
}

// Accounts CRUD
export async function addAccount(account) {
  const response = await api.post('/accounts', account);
  return response.data;
}
export async function getAccounts() {
  const response = await api.get('/accounts');
  return response.data;
}
export async function updateAccount(id, data) {
  const response = await api.put(`/accounts/${id}`, data);
  return response.data;
}
export async function deleteAccount(id) {
  const response = await api.delete(`/accounts/${id}`);
  return response.data;
}

// Contacts CRUD
export const addContact = async (contactData) => {
  const response = await api.post('/contacts', contactData);
  return response.data;
};

// Cases (Opportunities) CRUD are already defined above as addOpportunity etc.
// Keeping them for backward compatibility if needed, or mapping them.
export const addCase = addOpportunity;

export const getContacts = async () => {
  const response = await api.get('/contacts');
  return response.data;
};




export const updateContact = async (id: string, contactData: any) => {
  const response = await api.put(`/contacts/${id}`, contactData);
  return response.data;
};


export const deleteContact = async (id: string) => {
  const response = await api.delete(`/contacts/${id}`);
  return response.data;
};

export const getCases = getOpportunities;

export const updateCase = updateOpportunity;

export const deleteCase = deleteOpportunity;

// Notifications CRUD
// Notifications CRUD
export const addNotification = async (notificationData: any) => {
  const response = await api.post('/notifications', notificationData);
  return response.data;
};

export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const updateNotification = async (id: string, notificationData: any) => {
  const response = await api.put(`/notifications/${id}`, notificationData);
  return response.data;
};

export const deleteNotification = async (id: string) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

// Projects CRUD
export async function addProject(project) {
  const response = await api.post('/projects', project);
  return response.data;
}

export async function getProjects() {
  const response = await api.get('/projects');
  return response.data;
}

export async function updateProject(id, data) {
  const response = await api.put(`/projects/${id}`, data);
  return response.data;
}

export async function deleteProject(id) {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
}

// Sprints CRUD
export async function addSprint(sprint) {
  const response = await api.post('/sprints', sprint);
  return response.data;
}

export async function getSprints() {
  const response = await api.get('/sprints');
  return response.data;
}

export async function updateSprint(id, data) {
  const response = await api.put(`/sprints/${id}`, data);
  return response.data;
}

export async function deleteSprint(id) {
  const response = await api.delete(`/sprints/${id}`);
  return response.data;
}

// Tickets CRUD
export async function addTicket(ticket: any) {
  const response = await api.post('/tickets', ticket);
  return response.data;
}

export async function getTickets(sprintId) {
  const response = await api.get('/tickets', { params: { sprintId } });
  return response.data;
}

export async function updateTicket(id, data) {
  const response = await api.put(`/tickets/${id}`, data);
  return response.data;
}

export async function deleteTicket(id) {
  const response = await api.delete(`/tickets/${id}`);
  return response.data;
}

// Comments CRUD
export async function addComment(comment) {
  const response = await api.post('/comments', comment);
  return response.data;
}

export async function getComments(ticketId) {
  const response = await api.get('/comments', { params: { ticketId } });
  return response.data;
}

// Labels CRUD
export async function addLabel(label: any) {
  const response = await api.post('/labels', label);
  return response.data;
}

export async function getLabels() {
  const response = await api.get('/labels');
  return response.data;
}

export async function updateLabel(id: string, data: any) {
  const response = await api.put(`/labels/${id}`, data);
  return response.data;
}

export async function deleteLabel(id: string) {
  const response = await api.delete(`/labels/${id}`);
  return response.data;
}

// Templates CRUD
export async function addTemplate(template: any) {
  const response = await api.post('/templates', template);
  return response.data;
}

export async function getTemplates() {
  const response = await api.get('/templates');
  return response.data;
}

export async function updateTemplate(id: string, data: any) {
  const response = await api.put(`/templates/${id}`, data);
  return response.data;
}

export async function deleteTemplate(id: string) {
  const response = await api.delete(`/templates/${id}`);
  return response.data;
}
// LeaveRequests CRUD
export async function addLeaveRequest(leaveRequest) {
  const response = await api.post('/leave-requests', leaveRequest);
  return response.data;
}

export async function getLeaveRequests() {
  const response = await api.get('/leave-requests');
  return response.data;
}

export async function updateLeaveRequest(id, data) {
  const response = await api.put(`/leave-requests/${id}`, data);
  return response.data;
}

export async function deleteLeaveRequest(id) {
  const response = await api.delete(`/leave-requests/${id}`);
  return response.data;
}
// Leads CRUD
export async function addLead(lead) {
  const response = await api.post('/leads', lead);
  return response.data;
}

export async function getLeads() {
  const response = await api.get('/leads');
  return response.data;
}

export async function updateLead(id, data) {
  const response = await api.put(`/leads/${id}`, data);
  return response.data;
}

export async function deleteLead(id) {
  const response = await api.delete(`/leads/${id}`);
  return response.data;
}

// Tasks CRUD
export async function addTask(task) {
  const response = await api.post('/tasks', task);
  return response.data;
}

export async function getTasks() {
  const response = await api.get('/tasks');
  return response.data;
}

export async function updateTask(id, data) {
  const response = await api.put(`/tasks/${id}`, data);
  return response.data;
}

export async function deleteTask(id) {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
}

// Deals alias
export const addDeal = addOpportunity;
export const getDeals = getOpportunities;
export const updateDeal = updateOpportunity;
export const deleteDeal = deleteOpportunity;

// Column CRUD
export async function getColumns() {
  const response = await api.get('/columns');
  return response.data;
}

export async function addColumn(data) {
  const response = await api.post('/columns', data);
  return response.data;
}

export async function updateColumn(id, data) {
  const response = await api.put(`/columns/${id}`, data);
  return response.data;
}

export async function deleteColumn(id) {
  const response = await api.delete(`/columns/${id}`);
  return response.data;
}

