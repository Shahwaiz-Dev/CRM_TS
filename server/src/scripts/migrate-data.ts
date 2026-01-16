import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Contact from '../models/Contact.js';
import Ticket from '../models/Ticket.js';
import Opportunity from '../models/Opportunity.js';
import Account from '../models/Account.js';
import Project from '../models/Project.js';
import Sprint from '../models/Sprint.js';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Payroll from '../models/Payroll.js';
import Notification from '../models/Notification.js';
import Label from '../models/Label.js';
import Template from '../models/Template.js';

dotenv.config();

/**
 * This script is a template for migrating data from Firestore JSON exports to MongoDB.
 * Users should export their Firestore collections as JSON and place them in a known directory.
 */

const migrateData = async (collectionName: string, jsonData: any[]) => {
    try {
        console.log(`Migrating ${collectionName}...`);

        let Model: any;
        switch (collectionName) {
            case 'users': Model = User; break;
            case 'contacts': Model = Contact; break;
            case 'tickets': Model = Ticket; break;
            case 'opportunities': Model = Opportunity; break;
            case 'accounts': Model = Account; break;
            case 'projects': Model = Project; break;
            case 'sprints': Model = Sprint; break;
            case 'employees': Model = Employee; break;
            case 'attendance': Model = Attendance; break;
            case 'payroll': Model = Payroll; break;
            case 'notifications': Model = Notification; break;
            case 'labels': Model = Label; break;
            case 'templates': Model = Template; break;
            default:
                console.warn(`No model found for collection: ${collectionName}`);
                return;
        }

        // Handle Firestore-specific data types (like Timestamps) if necessary
        const processedData = jsonData.map(item => {
            const newItem = { ...item };
            // Map Firestore ID to MongoDB _id if needed, or just let Mongoose handle it
            // if (newItem.id) { newItem._id = newItem.id; delete newItem.id; }

            // Convert Firestore Timestamps to JS Dates if they are in { seconds, nanoseconds } format
            Object.keys(newItem).forEach(key => {
                if (newItem[key] && typeof newItem[key] === 'object' && 'seconds' in newItem[key]) {
                    newItem[key] = new Date(newItem[key].seconds * 1000);
                }
            });

            return newItem;
        });

        await Model.insertMany(processedData, { ordered: false });
        console.log(`Successfully migrated ${processedData.length} documents to ${collectionName}`);
    } catch (err: any) {
        console.error(`Error migrating ${collectionName}:`, err.message);
    }
};

const runMigration = async () => {
    await connectDB();

    // Example usage:
    // const contactsData = JSON.parse(fs.readFileSync('./exports/contacts.json', 'utf-8'));
    // await migrateData('contacts', contactsData);

    console.log('Migration completed (template).');
    process.exit(0);
};

// runMigration();
export default migrateData;
