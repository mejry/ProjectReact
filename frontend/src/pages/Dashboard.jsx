import React, { useState, useEffect } from 'react';
import { Users, Calendar, Clock, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { leaveService, timesheetService, performanceService, employeeService } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [dashboardData, setDashboardData] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    monthlyHours: 0,
    performance: 0,
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const promises = [
        leaveService.getMyLeaves(),
        timesheetService.getWeek(new Date()),
        performanceService.getMyEvaluations(),
      ];

      if (user?.role === 'admin') {
        promises.push(employeeService.getAll());
      }

      const [leaves, timesheet, performance, employees] = await Promise.all(promises);

      const recentActivities = [
        ...(leaves?.recent || []),
        ...(performance?.data?.recent || []),
      ]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

      setDashboardData({
        totalEmployees: employees?.length || 0,
        pendingLeaves: leaves?.filter((leave) => leave.status === 'pending').length || 0,
        monthlyHours: calculateMonthlyHours(timesheet || []),
        performance: calculateAveragePerformance(performance?.data || []),
        recentActivities,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      addToast({
        title: 'Error',
        description: 'Failed to fetch dashboard data',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyHours = (timesheetData) => {
    if (!Array.isArray(timesheetData)) return 0;
    return timesheetData.reduce((total, entry) => total + (entry.totalHours || 0), 0);
  };

  const calculateAveragePerformance = (performanceData) => {
    if (!Array.isArray(performanceData) || performanceData.length === 0) return 0;
    const sum = performanceData.reduce(
      (total, evaluation) => total + (evaluation.score || 0),
      0
    );
    return Number((sum / performanceData.length).toFixed(1));
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="p-6 bg-white min-h-screen text-black">
            <div className="flex justify-between items-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-t-md p-6 rounded-lg shadow-xl m-5">

        <h1 className="text-4xl font-semibold text-white"> Welcome Back, {user?.name}</h1>
    </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {user?.role === 'admin' && (
          <DashboardCard
            title="Total Employees"
            value={dashboardData.totalEmployees}
            icon={Users}
            bgColor="bg-gray-200"
          />
        )}
        <DashboardCard
          title="Pending Leaves"
          value={dashboardData.pendingLeaves}
          icon={Calendar}
          bgColor="bg-purple-200"
        />
        <DashboardCard
          title="Monthly Hours"
          value={`${dashboardData.monthlyHours}h`}
          icon={Clock}
          bgColor="bg-blue-200"
        />
        
      </div>

      <div className="mt-8 p-6 bg-gray-100 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-black">Recent Activities</h2>
        <div className="space-y-4">
          {dashboardData.recentActivities.length > 0 ? (
            dashboardData.recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-lg text-black">{activity.description}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(activity.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No recent activities found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, value, icon: Icon, bgColor }) => (
  <div className={`p-6 ${bgColor} rounded-xl shadow-md transition-transform transform hover:scale-105`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xl text-gray-800">{title}</p>
        <p className="text-3xl font-semibold text-black">{value}</p>
      </div>
      <div className="bg-gray-100 p-4 rounded-full">
        <Icon className="h-8 w-8 text-gray-800" />
      </div>
    </div>
  </div>
);

export default Dashboard;
