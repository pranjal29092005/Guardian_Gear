const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./modules/users/user.model');
const MaintenanceTeam = require('./modules/teams/team.model');
const Equipment = require('./modules/equipment/equipment.model');
const MaintenanceRequest = require('./modules/requests/request.model');
const Category = require('./modules/categories/category.model');
const { USER_ROLES, REQUEST_TYPES, REQUEST_STAGES } = require('./utils/constants');

const seedData = async () => {
    try {
        await connectDB();

        console.log('[SEED] Clearing existing data...');
        await User.deleteMany({});
        await MaintenanceTeam.deleteMany({});
        await Equipment.deleteMany({});
        await MaintenanceRequest.deleteMany({});
        await Category.deleteMany({});

        console.log('[SEED] Creating categories...');
        await Category.create([
            { name: 'Office Equipment', description: 'Printers, scanners, and office devices', icon: 'CategoryIcon' },
            { name: 'Manufacturing', description: 'CNC machines, industrial equipment', icon: 'CategoryIcon' },
            { name: 'IT Equipment', description: 'Computers, servers, network devices', icon: 'CategoryIcon' },
            { name: 'HVAC', description: 'Heating, ventilation, and air conditioning systems', icon: 'CategoryIcon' },
            { name: 'Safety Equipment', description: 'Fire extinguishers, safety gear', icon: 'CategoryIcon' }
        ]);

        console.log('[SEED] Creating teams...');

        // Create 4 teams with empty members initially
        const mechanicsTeam = await MaintenanceTeam.create({
            name: 'Mechanics Team',
            description: 'Handles all mechanical equipment and machinery maintenance',
            memberIds: []
        });

        const itSupportTeam = await MaintenanceTeam.create({
            name: 'IT Support Team',
            description: 'Manages IT equipment, software issues, and network maintenance',
            memberIds: []
        });

        const facilitiesTeam = await MaintenanceTeam.create({
            name: 'Facilities Team',
            description: 'Maintains building systems, HVAC, and general facilities',
            memberIds: []
        });

        const qualityTeam = await MaintenanceTeam.create({
            name: 'Quality Control Team',
            description: 'Inspects and maintains quality control equipment',
            memberIds: []
        });

        console.log('[SEED] Creating users...');

        // Create 6 regular users (no teams)
        const regularUser = await User.create({
            name: 'Regular User',
            email: 'user@demo.com',
            password: 'password',
            role: USER_ROLES.USER
        });

        const user2 = await User.create({
            name: 'Alice Johnson',
            email: 'alice.johnson@demo.com',
            password: 'password',
            role: USER_ROLES.USER
        });

        const user3 = await User.create({
            name: 'Bob Williams',
            email: 'bob.williams@demo.com',
            password: 'password',
            role: USER_ROLES.USER
        });

        const user4 = await User.create({
            name: 'Carol Davis',
            email: 'carol.davis@demo.com',
            password: 'password',
            role: USER_ROLES.USER
        });

        const user5 = await User.create({
            name: 'David Lee',
            email: 'david.lee@demo.com',
            password: 'password',
            role: USER_ROLES.USER
        });

        const user6 = await User.create({
            name: 'Emma Martinez',
            email: 'emma.martinez@demo.com',
            password: 'password',
            role: USER_ROLES.USER
        });

        // Create manager with all teams
        const manager = await User.create({
            name: 'Sarah Manager',
            email: 'manager@demo.com',
            password: 'password',
            role: USER_ROLES.MANAGER,
            teamIds: [mechanicsTeam._id, itSupportTeam._id, facilitiesTeam._id, qualityTeam._id]
        });

        // Mechanics Team Members (5 technicians)
        const mechanic1 = await User.create({
            name: 'John Technician',
            email: 'john.tech@demo.com',
            password: 'password',
            role: USER_ROLES.TECHNICIAN,
            teamIds: [mechanicsTeam._id]
        });

        const mechanic2 = await User.create({
            name: 'Mike Rodriguez',
            email: 'mike.rodriguez@demo.com',
            password: 'password',
            role: USER_ROLES.TECHNICIAN,
            teamIds: [mechanicsTeam._id]
        });

        const mechanic3 = await User.create({
            name: 'David Chen',
            email: 'david.chen@demo.com',
            password: 'password',
            role: USER_ROLES.TECHNICIAN,
            teamIds: [mechanicsTeam._id]
        });

        const mechanic4 = await User.create({
            name: 'Carlos Martinez',
            email: 'carlos.martinez@demo.com',
            password: 'password',
            role: USER_ROLES.TECHNICIAN,
            teamIds: [mechanicsTeam._id]
        });

        const mechanic5 = await User.create({
            name: 'Ahmed Hassan',
            email: 'ahmed.hassan@demo.com',
            password: 'password',
            role: USER_ROLES.TECHNICIAN,
            teamIds: [mechanicsTeam._id]
        });

        // IT Support Team Members (4 technicians)
        const itTech1 = await User.create({
            name: 'Lisa Anderson',
            email: 'lisa.anderson@demo.com',
            password: 'password',
            role: USER_ROLES.TECHNICIAN,
            teamIds: [itSupportTeam._id]
        });

        const itTech2 = await User.create({
            name: 'Kevin Park',
            email: 'kevin.park@demo.com',
            password: 'password',
            role: USER_ROLES.TECHNICIAN,
            teamIds: [itSupportTeam._id]
        });

        const itTech3 = await User.create({
            name: 'Jennifer Wu',
            email: 'jennifer.wu@demo.com',
            password: 'password',
            role: USER_ROLES.TECHNICIAN,
            teamIds: [itSupportTeam._id]
        });

        const itTech4 = await User.create({
            name: 'Robert Johnson',
            email: 'robert.johnson@demo.com',
            password: 'password',
            role: USER_ROLES.TECHNICIAN,
            teamIds: [itSupportTeam._id]
        });

        // Facilities Team Members (3 technicians)
        const facilities1 = await User.create({
            name: 'Tom Wilson',
            email: 'tom.wilson@demo.com',
            password: 'password',
            role: USER_ROLES.TECHNICIAN,
            teamIds: [facilitiesTeam._id]
        });

        const facilities2 = await User.create({
            name: 'Maria Garcia',
            email: 'maria.garcia@demo.com',
            password: 'password',
            role: USER_ROLES.TECHNICIAN,
            teamIds: [facilitiesTeam._id]
        });

        const facilities3 = await User.create({
            name: 'James Brown',
            email: 'james.brown@demo.com',
            password: 'password',
            role: USER_ROLES.TECHNICIAN,
            teamIds: [facilitiesTeam._id]
        });

        // Quality Team Members (3 technicians)
        const quality1 = await User.create({
            name: 'Emily Davis',
            email: 'emily.davis@demo.com',
            password: 'password',
            role: USER_ROLES.TECHNICIAN,
            teamIds: [qualityTeam._id]
        });

        const quality2 = await User.create({
            name: 'Daniel Kim',
            email: 'daniel.kim@demo.com',
            password: 'password',
            role: USER_ROLES.TECHNICIAN,
            teamIds: [qualityTeam._id]
        });

        const quality3 = await User.create({
            name: 'Sophia Patel',
            email: 'sophia.patel@demo.com',
            password: 'password',
            role: USER_ROLES.TECHNICIAN,
            teamIds: [qualityTeam._id]
        });

        // Additional technicians for cross-team coverage
        const crossTech1 = await User.create({
            name: 'Ryan Cooper',
            email: 'ryan.cooper@demo.com',
            password: 'password',
            role: USER_ROLES.TECHNICIAN,
            teamIds: [mechanicsTeam._id, facilitiesTeam._id]
        });

        const crossTech2 = await User.create({
            name: 'Natalie Thompson',
            email: 'natalie.thompson@demo.com',
            password: 'password',
            role: USER_ROLES.TECHNICIAN,
            teamIds: [itSupportTeam._id, qualityTeam._id]
        });

        const crossTech3 = await User.create({
            name: 'Marcus Williams',
            email: 'marcus.williams@demo.com',
            password: 'password',
            role: USER_ROLES.TECHNICIAN,
            teamIds: [facilitiesTeam._id]
        });

        // Additional manager
        const manager2 = await User.create({
            name: 'Alex Thompson',
            email: 'alex.thompson@demo.com',
            password: 'password',
            role: USER_ROLES.MANAGER,
            teamIds: [itSupportTeam._id, facilitiesTeam._id]
        });

        console.log('[SEED] Updating teams with members...');

        // Update teams with their members
        await MaintenanceTeam.findByIdAndUpdate(mechanicsTeam._id, {
            memberIds: [mechanic1._id, mechanic2._id, mechanic3._id, mechanic4._id, mechanic5._id, crossTech1._id, manager._id]
        });

        await MaintenanceTeam.findByIdAndUpdate(itSupportTeam._id, {
            memberIds: [itTech1._id, itTech2._id, itTech3._id, itTech4._id, crossTech2._id, manager._id, manager2._id]
        });

        await MaintenanceTeam.findByIdAndUpdate(facilitiesTeam._id, {
            memberIds: [facilities1._id, facilities2._id, facilities3._id, crossTech1._id, crossTech3._id, manager._id, manager2._id]
        });

        await MaintenanceTeam.findByIdAndUpdate(qualityTeam._id, {
            memberIds: [quality1._id, quality2._id, quality3._id, crossTech2._id, manager._id]
        });

        console.log('[SEED] Creating equipment...');

        // Create diverse equipment
        const printer1 = await Equipment.create({
            name: 'Printer-01',
            serialNumber: 'HP-2024-001',
            category: 'Office Equipment',
            department: 'IT',
            ownerEmployeeName: 'Admin Office',
            purchaseDate: new Date('2023-01-15'),
            warrantyUntil: new Date('2026-01-15'),
            location: 'Building A - Floor 2',
            defaultMaintenanceTeamId: itSupportTeam._id,
            status: 'ACTIVE',
            notes: []
        });

        const cnc1 = await Equipment.create({
            name: 'CNC-01',
            serialNumber: 'CNC-2023-005',
            category: 'Manufacturing',
            department: 'Production',
            ownerEmployeeName: 'Factory Floor',
            purchaseDate: new Date('2022-06-10'),
            warrantyUntil: new Date('2027-06-10'),
            location: 'Factory - Unit 3',
            defaultMaintenanceTeamId: mechanicsTeam._id,
            status: 'ACTIVE',
            notes: []
        });

        const laptop1 = await Equipment.create({
            name: 'Laptop-05',
            serialNumber: 'DELL-2024-LT05',
            category: 'IT Equipment',
            department: 'IT',
            ownerEmployeeName: 'Development Team',
            purchaseDate: new Date('2024-03-01'),
            warrantyUntil: new Date('2027-03-01'),
            location: 'Building B - Floor 1',
            defaultMaintenanceTeamId: itSupportTeam._id,
            status: 'ACTIVE',
            notes: []
        });

        const hvac1 = await Equipment.create({
            name: 'HVAC-Main',
            serialNumber: 'HVAC-2020-001',
            category: 'HVAC',
            department: 'Facilities',
            ownerEmployeeName: 'Facilities Manager',
            purchaseDate: new Date('2020-08-20'),
            warrantyUntil: new Date('2025-08-20'),
            location: 'Rooftop - Building A',
            defaultMaintenanceTeamId: facilitiesTeam._id,
            status: 'ACTIVE',
            notes: []
        });

        const server1 = await Equipment.create({
            name: 'Server-Rack-01',
            serialNumber: 'DELL-SRV-2023',
            category: 'IT Equipment',
            department: 'IT',
            ownerEmployeeName: 'IT Infrastructure',
            purchaseDate: new Date('2023-05-10'),
            warrantyUntil: new Date('2028-05-10'),
            location: 'Server Room - Building B',
            defaultMaintenanceTeamId: itSupportTeam._id,
            status: 'ACTIVE',
            notes: []
        });

        console.log('[SEED] Creating maintenance requests...');

        // Create maintenance requests
        await MaintenanceRequest.create({
            type: REQUEST_TYPES.CORRECTIVE,
            subject: 'Printer paper jam',
            description: 'Paper is getting stuck in the main tray',
            equipmentId: printer1._id,
            equipmentCategorySnapshot: printer1.category,
            maintenanceTeamId: itSupportTeam._id,
            assignedTechnicianId: null,
            stage: REQUEST_STAGES.NEW,
            createdByUserId: regularUser._id
        });

        await MaintenanceRequest.create({
            type: REQUEST_TYPES.PREVENTIVE,
            subject: 'Monthly CNC maintenance',
            description: 'Regular monthly checkup and calibration',
            equipmentId: cnc1._id,
            equipmentCategorySnapshot: cnc1.category,
            maintenanceTeamId: mechanicsTeam._id,
            assignedTechnicianId: mechanic1._id,
            stage: REQUEST_STAGES.IN_PROGRESS,
            scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            createdByUserId: manager._id
        });

        await MaintenanceRequest.create({
            type: REQUEST_TYPES.PREVENTIVE,
            subject: 'HVAC filter replacement',
            description: 'Quarterly HVAC maintenance and filter replacement',
            equipmentId: hvac1._id,
            equipmentCategorySnapshot: hvac1.category,
            maintenanceTeamId: facilitiesTeam._id,
            assignedTechnicianId: facilities1._id,
            stage: REQUEST_STAGES.NEW,
            scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            createdByUserId: manager._id
        });

        console.log('\n==============================================');
        console.log('✅ Seed data created successfully!');
        console.log('==============================================\n');

        console.log('Demo Users:');
        console.log('1. Regular User:');
        console.log('   Email: user@demo.com');
        console.log('   Password: password');
        console.log('   Role: USER\n');

        console.log('2. Manager:');
        console.log('   Email: manager@demo.com');
        console.log('   Password: password');
        console.log('   Role: MANAGER\n');

        console.log('3. Additional Manager:');
        console.log('   Email: alex.thompson@demo.com');
        console.log('   Password: password');
        console.log('   Role: MANAGER\n');

        console.log('Regular Users (6 total, all password: password):');
        console.log('   - user@demo.com');
        console.log('   - alice.johnson@demo.com');
        console.log('   - bob.williams@demo.com');
        console.log('   - carol.davis@demo.com');
        console.log('   - david.lee@demo.com');
        console.log('   - emma.martinez@demo.com\n');

        console.log('Technicians (18 total, all password: password):');
        console.log('   - john.tech@demo.com (Mechanics)');
        console.log('   - mike.rodriguez@demo.com (Mechanics)');
        console.log('   - david.chen@demo.com (Mechanics)');
        console.log('   - carlos.martinez@demo.com (Mechanics)');
        console.log('   - ahmed.hassan@demo.com (Mechanics)');
        console.log('   - lisa.anderson@demo.com (IT Support)');
        console.log('   - kevin.park@demo.com (IT Support)');
        console.log('   - jennifer.wu@demo.com (IT Support)');
        console.log('   - robert.johnson@demo.com (IT Support)');
        console.log('   - tom.wilson@demo.com (Facilities)');
        console.log('   - maria.garcia@demo.com (Facilities)');
        console.log('   - james.brown@demo.com (Facilities)');
        console.log('   - emily.davis@demo.com (Quality Control)');
        console.log('   - daniel.kim@demo.com (Quality Control)');
        console.log('   - sophia.patel@demo.com (Quality Control)');
        console.log('   - ryan.cooper@demo.com (Mechanics + Facilities)');
        console.log('   - natalie.thompson@demo.com (IT Support + Quality)');
        console.log('   - marcus.williams@demo.com (Facilities)\n');

        console.log('==============================================');
        console.log('Teams created: 4 teams with 21+ total members');
        console.log('  - Mechanics Team (7 members)');
        console.log('  - IT Support Team (7 members)');
        console.log('  - Facilities Team (7 members)');
        console.log('  - Quality Control Team (5 members)');
        console.log('Regular Users: 6');
        console.log('Technicians: 18');
        console.log('Managers: 2');
        console.log('Equipment created: 5 items');
        console.log('Categories created: 5 categories');
        console.log('Requests created: 3');
        console.log('==============================================\n');

        process.exit(0);
    } catch (error) {
        console.error('[SEED] Error:', error);
        process.exit(1);
    }
};

seedData();
