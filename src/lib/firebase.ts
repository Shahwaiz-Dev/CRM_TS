import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

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