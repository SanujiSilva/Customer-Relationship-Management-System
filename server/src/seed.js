import { Lead } from './models/Lead.js';
import { User } from './models/User.js';

const sampleLeads = [
  {
    leadName: 'Maya Fernando',
    companyName: 'Ceylon Cloud Kitchens',
    email: 'maya@ceyloncloud.test',
    phone: '+94 77 245 8291',
    source: 'Website',
    assignedSalesperson: 'Aarav Silva',
    status: 'New',
    dealValue: 4200,
    notes: [{ content: 'Downloaded the pricing guide and requested a callback.', createdBy: 'Admin User' }]
  },
  {
    leadName: 'Daniel Perera',
    companyName: 'BrightPath Logistics',
    email: 'daniel@brightpath.test',
    phone: '+94 71 550 0184',
    source: 'LinkedIn',
    assignedSalesperson: 'Nisha Raman',
    status: 'Qualified',
    dealValue: 12800,
    notes: [{ content: 'Confirmed budget and timeline for Q2 rollout.', createdBy: 'Admin User' }]
  },
  {
    leadName: 'Sara Wickramasinghe',
    companyName: 'Lanka Retail Group',
    email: 'sara@lankaretail.test',
    phone: '+94 76 912 3340',
    source: 'Referral',
    assignedSalesperson: 'Aarav Silva',
    status: 'Proposal Sent',
    dealValue: 21500,
    notes: [{ content: 'Sent proposal with implementation package.', createdBy: 'Admin User' }]
  },
  {
    leadName: 'Owen Clark',
    companyName: 'Harbor Analytics',
    email: 'owen@harboranalytics.test',
    phone: '+1 415 555 0148',
    source: 'Event',
    assignedSalesperson: 'Leah Brooks',
    status: 'Won',
    dealValue: 9300,
    notes: [{ content: 'Closed after product demo and security review.', createdBy: 'Admin User' }]
  },
  {
    leadName: 'Priya Menon',
    companyName: 'FinEdge Advisory',
    email: 'priya@finedge.test',
    phone: '+91 80 5550 8871',
    source: 'Cold Email',
    assignedSalesperson: 'Nisha Raman',
    status: 'Lost',
    dealValue: 6700,
    notes: [{ content: 'Chose an internal tool for this quarter.', createdBy: 'Admin User' }]
  }
];

export async function seedDatabase() {
  const adminEmail = 'admin@example.com';
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: 'password123',
      role: 'Admin'
    });
    console.log('Seeded admin user');
  }

  const leadCount = await Lead.countDocuments();

  if (leadCount === 0) {
    await Lead.insertMany(sampleLeads);
    console.log('Seeded sample leads');
  }
}
