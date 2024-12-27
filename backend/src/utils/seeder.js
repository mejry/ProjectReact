const bcrypt = require('bcryptjs');
const {User} = require('../models');

const seedAdminUser = async () => {
    try {
        // Check if admin already exists
        const adminExists = await User.findOne({ email: 'admin@example.com' });
        
        if (!adminExists) {
            // Create admin user
            const adminUser = new User({
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'admin123',  
                role: 'admin',
                department: 'Administration',
                position: 'System Administrator'
            });

            await adminUser.save();
            console.log('Admin user created successfully');
        } else {
            console.log('Admin user already exists');
        }

        // Check if demo employee exists
        const employeeExists = await User.findOne({ email: 'employee@example.com' });

        if (!employeeExists) {
            // Create demo employee
            const employeeUser = new User({
                name: 'Employee User',
                email: 'employee@example.com',
                password: 'employee', 
                role: 'employee',
                department: 'Sales',
                position: 'Sales Representative'
            });

            await employeeUser.save();
            console.log('Demo employee created successfully');
        } else {
            console.log('Demo employee already exists');
        }

    } catch (error) {
        console.error('Error seeding users:', error);
    }
};

module.exports = { seedAdminUser };