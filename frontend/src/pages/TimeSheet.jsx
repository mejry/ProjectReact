import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/index';
import { Button } from '../components/ui/button';
import { Loading, LoadingPage } from '../components/ui/loading';
import { useToast } from '../context/ToastContext';
import { Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { timesheetService } from '../services/api';

const TimeSheet = () => {
  const { addToast } = useToast();
  const [currentWeek, setCurrentWeek] = useState(getWeekDates());
  const [timeEntries, setTimeEntries] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Helper function to get week dates
  function getWeekDates() {
    const today = new Date();
    const week = [];
    for (let i = 1; i <= 7; i++) {
      const first = today.getDate() - today.getDay() + i;
      const day = new Date(today.setDate(first));
      week.push(new Date(day));
    }
    return week;
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleWeekChange = (direction) => {
    setCurrentWeek(prevWeek => {
      const newWeek = prevWeek.map(date => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        return newDate;
      });
      return newWeek;
    });
  };

  const fetchTimeSheet = useCallback(async () => {
    try {
      setLoading(true);
      const response = await timesheetService.getWeek(currentWeek[0]);
      
      const formattedEntries = {};
      if (response.entries && Array.isArray(response.entries)) {
        response.entries.forEach(entry => {
          const dateKey = new Date(entry.date).toISOString().split('T')[0];
          formattedEntries[dateKey] = {
            startTime: entry.startTime || '',
            endTime: entry.endTime || '',
            break: entry.breakDuration?.toString() || '0',
            totalHours: entry.totalHours || 0,
            id: entry._id || null,
            status: entry.status || 'pending'
          };
        });
      }
      
      setTimeEntries(formattedEntries);
    } catch (error) {
      console.error('Error fetching timesheet:', error);
      addToast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load timesheet',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [currentWeek, addToast]);

  useEffect(() => {
    fetchTimeSheet();
  }, [fetchTimeSheet]);

  const validateTimeEntry = (entry) => {
    if (!entry.startTime || !entry.endTime) return false;

    const start = new Date(`2000-01-01T${entry.startTime}`);
    const end = new Date(`2000-01-01T${entry.endTime}`);

    const breakHours = parseFloat(entry.break || 0);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
    if (end <= start) return false;
    if (isNaN(breakHours) || breakHours < 0) return false;

    const totalHours = (end - start) / (1000 * 60 * 60) - breakHours;
    return totalHours > 0;
  };

  const handleTimeChange = (date, field, value) => {
    setTimeEntries(prev => {
      const updatedEntry = { ...prev[date] };

      if (field === 'startTimeHour' || field === 'startTimeMinute') {
        const newStartTime =
          field === 'startTimeHour'
            ? `${value.padStart(2, '0')}:${updatedEntry.startTime ? updatedEntry.startTime.split(':')[1] : '00'}`
            : `${updatedEntry.startTime ? updatedEntry.startTime.split(':')[0] : '00'}:${value.padStart(2, '0')}`;

        updatedEntry.startTime = newStartTime;
      } else if (field === 'endTimeHour' || field === 'endTimeMinute') {
        const newEndTime =
          field === 'endTimeHour'
            ? `${value.padStart(2, '0')}:${updatedEntry.endTime ? updatedEntry.endTime.split(':')[1] : '00'}`
            : `${updatedEntry.endTime ? updatedEntry.endTime.split(':')[0] : '00'}:${value.padStart(2, '0')}`;

        updatedEntry.endTime = newEndTime;
      } else if (field === 'break') {
        updatedEntry.break = value;
      }

      // Recalculate total hours after break change
      if (updatedEntry.startTime && updatedEntry.endTime) {
        const start = new Date(`2000-01-01T${updatedEntry.startTime}`);
        const end = new Date(`2000-01-01T${updatedEntry.endTime}`);
        const breakDuration = parseFloat(updatedEntry.break || 0);

        const totalHours = (end - start) / (1000 * 60 * 60) - breakDuration;
        updatedEntry.totalHours = totalHours > 0 ? totalHours.toFixed(2) : 0;
      }

      return {
        ...prev,
        [date]: updatedEntry
      };
    });
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      
      const entries = Object.entries(timeEntries).map(([date, entry]) => {
        if (!validateTimeEntry(entry)) return null;
      
        return {
          date: new Date(date).toISOString(),
          startTime: entry.startTime,
          endTime: entry.endTime,
          breakDuration: parseFloat(entry.break || 0),
          totalHours: entry.totalHours,
          _id: entry.id // Include existing entry ID if it exists
        };
      }).filter(entry => entry !== null);
      
      if (entries.length === 0) {
        addToast({
          title: 'Warning',
          description: 'No valid entries to save',
          type: 'warning',
        });
        return;
      }
      
      await timesheetService.submit({ entries });
      
      addToast({
        title: 'Success',
        description: 'Timesheet saved successfully',
        type: 'success',
      });

      await fetchTimeSheet();
    } catch (error) {
      console.error('Error saving timesheet:', error);
      addToast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save timesheet',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-8">
      {/* Title and Week Navigation */}
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-t-md p-6 rounded-lg shadow-xl">
        <h1 className="text-4xl font-semibold text-white">My TimeSheet</h1>
        <div className="flex space-x-6">
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleWeekChange('prev')}
            className="bg-white text-teal-600 hover:bg-teal-100 p-3 rounded-lg shadow-md transition-all"
          >
            <ChevronLeft className="h-6 w-6 " />
            Previous Week
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleWeekChange('next')}
            className="bg-white text-teal-600 hover:bg-teal-100 p-3 rounded-lg shadow-md transition-all"
          >
            Next Week
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* TimeSheet Table */}
      <Card className="shadow-lg">
        <CardContent className="p-8">
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-center">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider">Day</th>
                  <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                  <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                  <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider">Break Duration (hrs)</th>
                  <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {currentWeek.map((date, index) => {
                  const dateKey = date.toISOString().split('T')[0];
                  const entry = timeEntries[dateKey] || {};
                  return (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-4">{formatDate(date)}</td>
                      <td className="py-2 px-4">
                        <div className="flex justify-center space-x-2">
                          <input
                            type="number"
                            value={entry.startTime ? entry.startTime.split(':')[0] : ''}
                            onChange={(e) => handleTimeChange(dateKey, 'startTimeHour', e.target.value)}
                            className="text-center border-2 border-gray-500 px-2 py-1 rounded-md focus:outline-none"
                            min="0"
                            max="23"
                            placeholder="hh"
                          />
                          <span>:</span>
                          <input
                            type="number"
                            value={entry.startTime ? entry.startTime.split(':')[1] : ''}
                            onChange={(e) => handleTimeChange(dateKey, 'startTimeMinute', e.target.value)}
                            className="text-center border-2 border-gray-500 px-2 py-1 rounded-md focus:outline-none"
                            min="0"
                            max="59"
                            placeholder="mm"
                          />
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex justify-center space-x-2">
                          <input
                            type="number"
                            value={entry.endTime ? entry.endTime.split(':')[0] : ''}
                            onChange={(e) => handleTimeChange(dateKey, 'endTimeHour', e.target.value)}
                            className="text-center border-2 border-gray-500 px-2 py-1 rounded-md focus:outline-none"
                            min="0"
                            max="23"
                            placeholder="hh"
                          />
                          <span>:</span>
                          <input
                            type="number"
                            value={entry.endTime ? entry.endTime.split(':')[1] : ''}
                            onChange={(e) => handleTimeChange(dateKey, 'endTimeMinute', e.target.value)}
                            className="text-center border-2 border-gray-500 px-2 py-1 rounded-md focus:outline-none"
                            min="0"
                            max="59"
                            placeholder="mm"
                          />
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <input
                          type="number"
                          value={entry.break || '0'}
                          onChange={(e) => handleTimeChange(dateKey, 'break', e.target.value)}
                          className="text-center border-2 border-gray-500 px-2 py-1 rounded-md focus:outline-none"
                          min="0"
                          max="12"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <span>{entry.totalHours}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-center space-x-6 py-8">
        <Button
          variant="outline"
          size="lg"
          onClick={handleSubmit}
          className="bg-gray text-teal-600 hover:bg-teal-100 p-3 rounded-lg shadow-md transition-all"
          disabled={saving}
        >
          {saving ? <Loading /> : <Save className="h-5 w-5" />}
          Save
        </Button>
      </div>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Leave Requests</h2>
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="w-full table-auto">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="py-2 px-4 text-left">startDate</th>
                <th className="py-2 px-4 text-left">endDate</th>
                <th className="py-2 px-4 text-left">Reason</th>
                <th className="py-2 px-4 text-left">Status</th>
               
              </tr>
              </thead>
              </table>
              
              </div>
    </div>
    </div>
  );
};

export default TimeSheet;
