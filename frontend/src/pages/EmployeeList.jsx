import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { LoadingPage, Loading } from '../components/ui/loading';
import EmployeeFormModal from '../components/EmployeeFormModal';
import { useToast } from '../context/ToastContext';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { employeeService } from '../services/api';

const EmployeeList = () => {
  const { addToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll();
      setEmployees(data || []);
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to fetch employees',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeleteLoading(id);
      await employeeService.delete(id);
      setEmployees(employees.filter(emp => emp._id !== id));
      addToast({
        title: 'Success',
        description: 'Employee deleted successfully',
        type: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to delete employee',
        type: 'error',
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedEmployee(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  const handleModalSuccess = () => {
    fetchEmployees();
    handleModalClose();
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-t-md p-6 rounded-lg shadow-xl">
      <h1 className="text-4xl font-semibold text-white">Employee Management</h1>
        <Button onClick={handleAdd} className="bg-blue-600 text-white hover:bg-blue-700 transition-colors">
          <Plus className="h-5 w-5 mr-2" />
          Add Employee
        </Button>
      </div>

      <Card className="shadow-lg rounded-xl border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                className="p-2 m-2 w-full pl-10 pr-4 py-2 border rounded-md shadow-md focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto shadow-lg rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <tr key={employee._id || employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-m text-gray-900">{employee.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-m text-gray-900">{employee.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-m text-gray-900">{employee.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-m text-gray-900">{employee.position}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-m text-gray-500">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(employee)}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="h-5 w-5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(employee._id || employee.id)}
                            disabled={deleteLoading === (employee._id || employee.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            {deleteLoading === (employee._id || employee.id) ? (
                              <Loading size="sm" />
                            ) : (
                              <Trash2 className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No employees found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <EmployeeFormModal 
        isOpen={showModal}
        onClose={handleModalClose}
        employee={selectedEmployee}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default EmployeeList;
