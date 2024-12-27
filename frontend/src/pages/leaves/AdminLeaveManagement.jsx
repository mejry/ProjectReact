import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Calendar, Clock, Check, X, Plus, Search, Users, Clock3, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { leaveService } from '../../services/api';
import { Loading } from '../../components/ui/loading';
import ExportButton from '../../components/ExportButton';
import { useNotificationActions } from '../../hooks/useNotificationActions';

const LeaveTypes = {
  VACATION: 'Vacation',
  SICK: 'Sick Leave',
  PERSONAL: 'Personal Leave',
  MATERNITY: 'Maternity Leave',
  PATERNITY: 'Paternity Leave',
  UNPAID: 'Unpaid Leave'
};

const LeaveBalances = {
  [LeaveTypes.VACATION]: 21,
  [LeaveTypes.SICK]: 10,
  [LeaveTypes.PERSONAL]: 5,
  [LeaveTypes.MATERNITY]: 90,
  [LeaveTypes.PATERNITY]: 14,
  [LeaveTypes.UNPAID]: 30
};


export default function LeaveManagement() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { notifyLeaveStatus } = useNotificationActions();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(null);
  const [showNewLeaveForm, setShowNewLeaveForm] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    searchTerm: '',
    page: 1
  });
  const [formData, setFormData] = useState({
    type: LeaveTypes.VACATION,
    startDate: '',
    endDate: '',
    reason: '',
    documents: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
  
      // Basic validation
      if (endDate < startDate) {
        addToast({
          title: 'Error',
          description: 'End date cannot be before start date',
          type: 'error'
        });
        return;
      }
  
      // Submit the request
      await leaveService.create({
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason
      });
  
      // Success notification
      addToast({
        title: 'Success',
        description: 'Leave request submitted successfully',
        type: 'success'
      });
  
      // Reset form and close
      setFormData({
        type: LeaveTypes.VACATION,
        startDate: '',
        endDate: '',
        reason: '',
        documents: null
      });
      setShowNewLeaveForm(false);
  
      // Refresh the leave list
      fetchLeaves();
    } catch (error) {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to submit leave request',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from leaves data
  const statistics = useMemo(() => {
    if (!leaves.length) return null;

    const stats = {
      totalRequests: leaves.length,
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
      leavesByType: {},
      leavesByDepartment: {},
      totalDays: 0,
      activeEmployees: new Set()
    };

    leaves.forEach(leave => {
      // Count by status
      if (leave.status === 'pending') stats.pendingRequests++;
      if (leave.status === 'approved') stats.approvedRequests++;
      if (leave.status === 'rejected') stats.rejectedRequests++;

      // Count by type
      stats.leavesByType[leave.type] = (stats.leavesByType[leave.type] || 0) + 1;

      // Count by department
      stats.leavesByDepartment[leave.user.department] =
        (stats.leavesByDepartment[leave.user.department] || 0) + 1;

      // Track unique employees
      stats.activeEmployees.add(leave.user._id);

      // Calculate total days
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      stats.totalDays += days;
    });

    stats.activeEmployees = stats.activeEmployees.size;

    return stats;
  }, [leaves]);

  useEffect(() => {
    fetchLeaves();
  }, [user?.role, filters]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      if (user?.role === 'admin') {
        const response = await leaveService.getAll({
          status: filters.status,
          type: filters.type,
          page: filters.page
        });
        setLeaves(response.leaves || []);
        setPagination({
          page: response.page,
          pages: response.pages,
          total: response.total
        });
      } else {
        const response = await leaveService.getMyLeaves();
        setLeaves(response || []);
      }
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to fetch leave data',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (leaveId, status) => {
    try {
      setStatusLoading(leaveId);
      
      // Find the leave request first
      const leaveRequest = leaves.find(leave => leave._id === leaveId);
      if (!leaveRequest) {
        throw new Error('Leave request not found');
      }
  
      // Update the status
      await leaveService.updateStatus(leaveId, status);
  
      // Send notification
      await notifyLeaveStatus({
        employeeId: leaveRequest.user._id,
        status: status
      });
  
      // Update local state
      setLeaves(prevLeaves =>
        prevLeaves.map(leave =>
          leave._id === leaveId ? { ...leave, status } : leave
        )
      );
  
      addToast({
        title: 'Success',
        description: `Leave request ${status} successfully`,
        type: 'success'
      });
    } catch (error) {
      console.error('Status update error:', error);
      addToast({
        title: 'Error',
        description: error.message || `Failed to ${status} leave request`,
        type: 'error'
      });
    } finally {
      setStatusLoading(null);
    }
  };

  const filteredLeaves = leaves.filter(leave => {
    if (!filters.searchTerm) return true;

    return leave.user.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      leave.user.department.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      leave.reason.toLowerCase().includes(filters.searchTerm.toLowerCase());
  });

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const renderStatistics = () => (
    <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
  <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-l font-medium text-gray-600">Total Requests</p>
          <p className="text-2xl font-bold">{statistics?.totalRequests || 0}</p>
        </div>
        <div className="p-3 bg-blue-100 rounded-full transition-transform duration-300 hover:scale-110">
          <Users className="h-6 w-6 text-blue-600 transition-transform duration-300 hover:scale-110" />
        </div>
      </div>
      <div className="mt-4 flex justify-between text-l text-gray-600">
        <span>Active Employees: {statistics?.activeEmployees || 0}</span>
        <span>Total Days: {statistics?.totalDays || 0}</span>
      </div>
    </CardContent>
  </Card>

  <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-l font-medium text-gray-600">Pending Requests</p>
          <p className="text-2xl font-bold text-yellow-600">
            {statistics?.pendingRequests || 0}
          </p>
        </div>
        <div className="p-3 bg-yellow-100 rounded-full transition-transform duration-300 hover:scale-110">
          <Clock3 className="h-6 w-6 text-yellow-600 transition-transform duration-300 hover:scale-110" />
        </div>
      </div>
      <div className="mt-4 flex justify-between text-l text-gray-600">
        <span>
          {((statistics?.pendingRequests / statistics?.totalRequests) * 100 || 0).toFixed(1)}% of total
        </span>
      </div>
    </CardContent>
  </Card>

  <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-l font-medium text-gray-600">Approved Requests</p>
          <p className="text-2xl font-bold text-green-600">
            {statistics?.approvedRequests || 0}
          </p>
        </div>
        <div className="p-3 bg-green-100 rounded-full transition-transform duration-300 hover:scale-110">
          <CheckCircle className="h-6 w-6 text-green-600 transition-transform duration-300 hover:scale-110" />
        </div>
      </div>
      <div className="mt-4 flex justify-between text-l text-gray-600">
        <span>
          {((statistics?.approvedRequests / statistics?.totalRequests) * 100 || 0).toFixed(1)}% approval rate
        </span>
      </div>
    </CardContent>
  </Card>

  <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg ">
    <CardContent className="pt-6 ">
      <div className="flex items-center justify-between ">
        <div>
          <p className="text-l font-medium text-gray-600 ">Rejected Requests</p>
          <p className="text-2xl font-bold text-red-600">
            {statistics?.rejectedRequests || 0}
          </p>
        </div>
        <div className="p-3 bg-red-100 rounded-full transition-transform duration-300 hover:scale-110">
          <X className="h-6 w-6 text-red-600 transition-transform duration-300 hover:scale-110" />
        </div>
      </div>
      <div className="mt-4 flex justify-between text-l text-gray-600">
        <span>
          {((statistics?.rejectedRequests / statistics?.totalRequests) * 100 || 0).toFixed(1)}% rejection rate
        </span>
      </div>
    </CardContent>
  </Card>
</div>

  );

  const renderPagination = () => (
    <div className="flex justify-between items-center mt-4">
      <div className="text-sm text-gray-600">
        Showing {(pagination.page - 1) * 10 + 1} to {Math.min(pagination.page * 10, pagination.total)} of {pagination.total} entries
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={pagination.page === 1}
          onClick={() => handlePageChange(pagination.page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={pagination.page === pagination.pages}
          onClick={() => handlePageChange(pagination.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );

  const renderAdminFilters = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
    <div className="flex items-center">
      <input
        type="text"
        placeholder="Search by employee, department or reason..."
        className="w-full rounded-md border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        value={filters.searchTerm}
        onChange={(e) => setFilters(prev => ({
          ...prev,
          searchTerm: e.target.value
        }))}
      />
    </div>
  
    <div className="flex items-center">
      <select
        className="w-full rounded-md border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        value={filters.status}
        onChange={(e) => setFilters(prev => ({
          ...prev,
          status: e.target.value
        }))}
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
    </div>
  
    <div className="flex items-center">
      <select
        className="w-full rounded-md border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        value={filters.type}
        onChange={(e) => setFilters(prev => ({
          ...prev,
          type: e.target.value
        }))}
      >
        <option value="">All Types</option>
        {Object.values(LeaveTypes).map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
    </div>
  
    <div className="flex gap-4 items-center">
      <Button
        variant="outline"
        onClick={() => setFilters({
          status: '',
          type: '',
          searchTerm: '',
          page: 1
        })}
        className="px-6 py-2 rounded-md text-gray-700 border-gray-300 hover:bg-gray-100 transition-all duration-200"
      >
        Clear Filters
      </Button>
  
      <ExportButton
        data={filteredLeaves}
        type="leaves"
        fileName="leave-records"
        className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
      />
    </div>
  </div>
  
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-t-md p-6 rounded-lg shadow-xl">
      <h1 className="text-4xl font-semibold text-white">
          {user?.role === 'admin' ? 'Leave Management Dashboard' : 'My Leave Requests'}
        </h1>
        {user?.role !== 'admin' && (
          <Button onClick={() => setShowNewLeaveForm(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Request Leave
          </Button>
        )}
      </div>

      {user?.role === 'admin' && statistics && (
        <>
          {renderStatistics()}
          {renderAdminFilters()}
        </>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">
            {user?.role === 'admin' ? 'All Leave Requests' : 'Leave History'}
          </h2>
        </CardHeader>
        <CardContent>
  <div className="overflow-x-auto shadow-md rounded-lg">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
        <tr>
          {user?.role === 'admin' && (
            <>
              <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
            </>
          )}
          <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider">
            Type
          </th>
          <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider">
            Duration
          </th>
          <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider">
            Reason
          </th>
          {user?.role === 'admin' && (
            <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          )}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {filteredLeaves.map((leave) => (
          <tr key={leave._id} className="hover:bg-gray-100 transition-colors duration-300">
            {user?.role === 'admin' && (
              <>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-m font-medium text-gray-900">{leave.user.name}</div>
                  <div className="text-m text-gray-500">{leave.user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-m text-gray-900">{leave.user.department}</div>
                </td>
              </>
            )}
            <td className="px-6 py-4 whitespace-nowrap text-m text-gray-900">
              {leave.type}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-m text-gray-900">
              {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`px-2 py-1 rounded-full text-m ${leave.status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : leave.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-m text-gray-900">
              {leave.reason}
            </td>
            {user?.role === 'admin' && (
              <td className="px-6 py-4 whitespace-nowrap">
                {leave.status === 'pending' && (
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="m"
                      onClick={() => handleStatusUpdate(leave._id, 'approved')}
                      disabled={statusLoading === leave._id}
                      className="transition-all duration-200 hover:bg-green-100"
                    >
                      {statusLoading === leave._id ? (
                        <Loading size="m" />
                      ) : (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusUpdate(leave._id, 'rejected')}
                      disabled={statusLoading === leave._id}
                      className="transition-all duration-200 hover:bg-red-100"
                    >
                      {statusLoading === leave._id ? (
                        <Loading size="sm" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </div>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  {user?.role === 'admin' && renderPagination()}
</CardContent>

        </Card>
      
    </div>
  );
}