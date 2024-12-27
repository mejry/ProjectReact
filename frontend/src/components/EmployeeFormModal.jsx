import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useToast } from '../context/ToastContext';
import { employeeService } from '../services/api';
import { Loading } from './ui/loading';

const EmployeeForm = ({ isOpen, onClose, employee = null, onSuccess }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    department: '',
    position: '',
    role: 'employee'
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        password: '', // Don't populate password on edit
        department: employee.department || '',
        position: employee.position || '',
        role: employee.role || 'employee'
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (employee) {
        await employeeService.update(employee._id, formData);
        addToast({
          title: 'Success',
          description: 'Employee updated successfully',
          type: 'success'
        });
      } else {
        await employeeService.create(formData);
        addToast({
          title: 'Success',
          description: 'Employee created successfully',
          type: 'success'
        });
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      addToast({
        title: 'Error',
        description: error.response?.data?.message || 'Something went wrong',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-6 bg-white rounded-lg shadow-lg border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password {employee && '(Leave blank to keep current)'}
            </label>
            <input
              type="password"
              name="password"
              required={!employee}
              className="mt-1 block w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <input
              type="text"
              name="department"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.department}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Position</label>
            <input
              type="text"
              name="position"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.position}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              name="role"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="px-6 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400"
            >
              {loading ? <Loading size="sm" /> : employee ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeForm;
