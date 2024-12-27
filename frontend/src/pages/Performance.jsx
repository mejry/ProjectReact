import React from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Star } from 'lucide-react';

const Performance = () => {
  const performanceData = {
    overall: 4.5,
    categories: [
      { name: 'Work Quality', score: 4.8 },
      { name: 'Productivity', score: 4.3 },
      { name: 'Communication', score: 4.6 },
      { name: 'Teamwork', score: 4.7 },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Performance Evaluation</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Overall Performance</h2>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-4xl font-bold">{performanceData.overall}</span>
              <Star className="h-8 w-8 text-yellow-400 fill-current" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Category Breakdown</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceData.categories.map((category) => (
                <div key={category.name}>
                  <div className="flex justify-between mb-1">
                    <span>{category.name}</span>
                    <span>{category.score}/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${(category.score / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Performance;