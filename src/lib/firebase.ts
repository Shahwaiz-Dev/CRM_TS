import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, increment } from 'firebase/firestore';

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

// HR Management Backend Logic

// Employee CRUD
export async function addEmployee(employee) {
  return await addDoc(collection(db, 'employees'), employee);
}
export async function getEmployees() {
  const snapshot = await getDocs(collection(db, 'employees'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
export async function updateEmployee(id, data) {
  return await updateDoc(doc(db, 'employees', id), data);
}
export async function deleteEmployee(id) {
  return await deleteDoc(doc(db, 'employees', id));
}

// Attendance CRUD
export async function addAttendance(attendance) {
  return await addDoc(collection(db, 'attendance'), attendance);
}
export async function getAttendance() {
  const snapshot = await getDocs(collection(db, 'attendance'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
export async function updateAttendance(id, data) {
  return await updateDoc(doc(db, 'attendance', id), data);
}
export async function deleteAttendance(id) {
  return await deleteDoc(doc(db, 'attendance', id));
}

// Payroll CRUD
export async function addPayroll(payroll) {
  return await addDoc(collection(db, 'payroll'), payroll);
}
export async function getPayroll() {
  const snapshot = await getDocs(collection(db, 'payroll'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
export async function updatePayroll(id, data) {
  return await updateDoc(doc(db, 'payroll', id), data);
}
export async function deletePayroll(id) {
  return await deleteDoc(doc(db, 'payroll', id));
}

// User CRUD
export async function addUser(user) {
  return await addDoc(collection(db, 'users'), user);
}
export async function getUsers() {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
export async function updateUser(id, data) {
  return await updateDoc(doc(db, 'users', id), data);
}
export async function deleteUser(id) {
  return await deleteDoc(doc(db, 'users', id));
}

// Opportunities CRUD
export async function addOpportunity(opportunity) {
  return await addDoc(collection(db, 'opportunities'), opportunity);
}
export async function getOpportunities() {
  const snapshot = await getDocs(collection(db, 'opportunities'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
export async function updateOpportunity(id, data) {
  return await updateDoc(doc(db, 'opportunities', id), data);
}
export async function deleteOpportunity(id) {
  return await deleteDoc(doc(db, 'opportunities', id));
}

// Accounts CRUD
export async function addAccount(account) {
  return await addDoc(collection(db, 'accounts'), account);
}
export async function getAccounts() {
  const snapshot = await getDocs(collection(db, 'accounts'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
export async function updateAccount(id, data) {
  return await updateDoc(doc(db, 'accounts', id), data);
}
export async function deleteAccount(id) {
  return await deleteDoc(doc(db, 'accounts', id));
}

// Add contact to Firestore
export const addContact = async (contactData) => {
  try {
    const docRef = await addDoc(collection(db, 'contacts'), {
      ...contactData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding contact:', error);
    throw error;
  }
};

// Add case to Firestore
export const addCase = async (caseData) => {
  try {
    const docRef = await addDoc(collection(db, 'cases'), {
      ...caseData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding case:', error);
    throw error;
  }
};

// Get all contacts
export const getContacts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'contacts'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting contacts:', error);
    throw error;
  }
};

// Update contact in Firestore
export const updateContact = async (id: string, contactData: any) => {
  try {
    await updateDoc(doc(db, 'contacts', id), {
      ...contactData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
};

// Delete contact from Firestore
export const deleteContact = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'contacts', id));
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
};

// Get all cases
export const getCases = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'cases'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting cases:', error);
    throw error;
  }
};

// Update case in Firestore
export const updateCase = async (id: string, caseData: any) => {
  try {
    await updateDoc(doc(db, 'cases', id), {
      ...caseData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating case:', error);
    throw error;
  }
};

// Delete case from Firestore
export const deleteCase = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'cases', id));
  } catch (error) {
    console.error('Error deleting case:', error);
    throw error;
  }
};

// Notifications CRUD
export const addNotification = async (notificationData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...notificationData,
      createdAt: new Date(),
      read: false
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding notification:', error);
    throw error;
  }
};

export const getNotifications = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'notifications'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

export const updateNotification = async (id: string, notificationData: any) => {
  try {
    await updateDoc(doc(db, 'notifications', id), {
      ...notificationData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    throw error;
  }
};

export const deleteNotification = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'notifications', id));
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Projects CRUD
export async function addProject(project) {
  return await addDoc(collection(db, 'projects'), {
    ...project,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

export async function getProjects() {
  const snapshot = await getDocs(collection(db, 'projects'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateProject(id, data) {
  return await updateDoc(doc(db, 'projects', id), {
    ...data,
    updatedAt: new Date()
  });
}

export async function deleteProject(id) {
  return await deleteDoc(doc(db, 'projects', id));
}

// Sprints CRUD
export async function addSprint(sprint) {
  return await addDoc(collection(db, 'sprints'), {
    ...sprint,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

export async function getSprints() {
  const snapshot = await getDocs(collection(db, 'sprints'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateSprint(id, data) {
  return await updateDoc(doc(db, 'sprints', id), {
    ...data,
    updatedAt: new Date()
  });
}

export async function deleteSprint(id) {
  return await deleteDoc(doc(db, 'sprints', id));
}

// Tickets CRUD
export async function addTicket(ticket) {
  return await addDoc(collection(db, 'tickets'), {
    ...ticket,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

export async function getTickets(sprintId) {
  const q = sprintId
    ? query(collection(db, 'tickets'), where("sprintId", "==", sprintId))
    : collection(db, 'tickets');
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateTicket(id, data) {
  return await updateDoc(doc(db, 'tickets', id), {
    ...data,
    updatedAt: new Date()
  });
}

export async function deleteTicket(id) {
  return await deleteDoc(doc(db, 'tickets', id));
}

// Comments CRUD
export async function addComment(comment) {
  const commentRef = await addDoc(collection(db, 'comments'), {
    ...comment,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Increment comment count on ticket
  if (comment.ticketId) {
    await updateDoc(doc(db, 'tickets', comment.ticketId), {
      commentCount: increment(1)
    });
  }

  return commentRef;
}

export async function getComments(ticketId) {
  const q = query(collection(db, 'comments'), where("ticketId", "==", ticketId));
  const snapshot = await getDocs(q);
  // Client-side sorting might be needed if index is missing
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a: any, b: any) => a.createdAt?.seconds - b.createdAt?.seconds);
}
