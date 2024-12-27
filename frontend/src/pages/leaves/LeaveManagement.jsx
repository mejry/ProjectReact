import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Calendar, Clock, Check, X, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { leaveService } from '../../services/api';
import { Loading } from '../../components/ui/loading';
import ExportButton from '../../components/ExportButton';
import { useNotificationActions } from '../../hooks/useNotificationActions';

const LeaveTypes = {
  VACATION: 'Vacaion',
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
  const [formData, setFormData] = useState({
    type: LeaveTypes.VACATION,
    startDate: '',
    endDate: '',
    reason: '',
    documents: null
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await leaveService.getMyLeaves();
      setLeaves(response || []);
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
      await leaveService.updateStatus(leaveId, status);

      const leaveRequest = leaves.find(leave => leave.id === leaveId);
      await notifyLeaveStatus({
        employeeId: leaveRequest.employeeId,
        status: status
      });

      setLeaves(prevLeaves =>
        prevLeaves.map(leave =>
          leave.id === leaveId ? { ...leave, status } : leave
        )
      );

      addToast({
        title: 'Success',
        description: `Leave request ${status} successfully`,
        type: 'success'
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: `Failed to ${status} leave request`,
        type: 'error'
      });
    } finally {
      setStatusLoading(null);
    }
  };

  const calculateRemainingDays = (type) => {
    const usedDays = leaves
      .filter(leave => leave.type === type && leave.status !== 'rejected')
      .reduce((total, leave) => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        return total + Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      }, 0);

    return LeaveBalances[type] - usedDays;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await leaveService.create(formData);
      addToast({
        title: 'Success',
        description: 'Leave request submitted successfully',
        type: 'success'
      });
      setShowNewLeaveForm(false);
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

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-t-md p-6 rounded-lg shadow-xl">
      <h1 className="text-4xl font-semibold text-white">Leave Management</h1>
        <div className="flex space-x-4">
          <ExportButton
            data={leaves}
            type="leaves"
            fileName="leave-records"
          />
          {user?.role !== 'admin' && (
            <Button onClick={() => setShowNewLeaveForm(true)}
             className="bg-white text-teal-600 hover:bg-teal-100 p-3 rounded-lg shadow-md transition-all">
              <Plus className="h-5 w-5 mr-2" />
              Request Leave
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(LeaveTypes).map(type => (
          <Card key={type} className="transition duration-300 transform hover:scale-105 hover:shadow-xl rounded-lg bg-white shadow-md p-4">
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-lg text-blue-600">{type}</h3>
                  <p className="text-sm text-gray-500">
                    Available: {calculateRemainingDays(type)} days
                  </p>
                </div>
                <div className={`p-3 rounded-full text-white font-semibold ${
                  calculateRemainingDays(type) > 5
                    ? 'bg-green-500'
                    : calculateRemainingDays(type) > 2
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}>
                  {calculateRemainingDays(type)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showNewLeaveForm && (
        <Card className="shadow-lg rounded-lg bg-white p-6">
          <CardHeader>
            <h2 className="text-xl font-semibold text-blue-700">New Leave Request</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Leave Type</label>
                <select
                  className="mt-1 block w-full rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 shadow-sm"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                >
                  {Object.values(LeaveTypes).map(type => (
                    <option key={type} value={type}>
                      {type} ({calculateRemainingDays(type)} days available)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    className="mt-1 block w-full rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 shadow-sm"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    className="mt-1 block w-full rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 shadow-sm"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <textarea
                  className="mt-1 block w-full rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 shadow-sm"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Upload Documents</label>
                <input
                  type="file"
                  className="mt-1 block w-full rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 shadow-sm"
                  onChange={(e) => setFormData(prev => ({ ...prev, documents: e.target.files }))}
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg mt-6 transition duration-300">
                {loading ? 'Submitting...' : 'Submit Leave Request'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Leave Requests</h2>
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="w-full table-auto">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="py-2 px-4 text-left">Type</th>
                <th className="py-2 px-4 text-left">Dates</th>
                <th className="py-2 px-4 text-left">Reason</th>
                <th className="py-2 px-4 text-left">Status</th>
               
              </tr>
            </thead>
            <tbody>
              {leaves.map(leave => (
                <tr key={leave.id} className="hover:bg-gray-100">
                  <td className="py-2 px-4">{leave.type}</td>
                  <td className="py-2 px-4">
                    {new Date(leave.startDate).toLocaleDateString()} -{' '}
                    {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4">{leave.reason}</td>
                  <td className="py-2 px-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full ${
                        leave.status === 'approved'
                          ? 'bg-green-500 text-white'
                          : leave.status === 'rejected'
                          ? 'bg-red-500 text-white'
                          : 'bg-yellow-500 text-white'
                      }`}
                    >
                      {leave.status}
                    </span>
                  </td>
                 
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
