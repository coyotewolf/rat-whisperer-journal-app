
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Bell, Calendar, Activity } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import QuickLogModal from "@/components/QuickLogModal";

const Index = () => {
  const [showQuickLog, setShowQuickLog] = useState(false);

  // Mock data for demonstration
  const todayChecklist = [
    { id: 1, task: "Fresh water", completed: true },
    { id: 2, task: "Food check", completed: true },
    { id: 3, task: "Health observation", completed: false },
    { id: 4, task: "Social interaction log", completed: false },
  ];

  const healthAlerts = [
    { id: 1, rat: "Pepper", alert: "Weight loss detected", severity: "high" },
    { id: 2, rat: "Salt", alert: "Medication due", severity: "medium" },
  ];

  const upcomingBirthdays = [
    { id: 1, name: "Pepper", date: "Tomorrow", age: "18 months" },
  ];

  const completedTasks = todayChecklist.filter(task => task.completed).length;
  const totalTasks = todayChecklist.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">RatTracker</h1>
            <p className="text-sm text-gray-600">Your rats' daily companion</p>
          </div>
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Daily Progress */}
        <Card className="bg-gradient-to-r from-orange-100 to-orange-200 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Activity className="h-5 w-5" />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-orange-700">
                {completedTasks} of {totalTasks} tasks completed
              </span>
              <span className="text-lg font-bold text-orange-800">
                {Math.round((completedTasks / totalTasks) * 100)}%
              </span>
            </div>
            <div className="w-full bg-orange-300 rounded-full h-2">
              <div 
                className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Health Alerts */}
        {healthAlerts.length > 0 && (
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Bell className="h-5 w-5" />
                Health Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {healthAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-red-800">{alert.rat}</p>
                    <p className="text-sm text-red-600">{alert.alert}</p>
                  </div>
                  <Badge variant={alert.severity === "high" ? "destructive" : "secondary"}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Upcoming Birthdays */}
        {upcomingBirthdays.length > 0 && (
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Calendar className="h-5 w-5" />
                Upcoming Birthdays
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingBirthdays.map((birthday) => (
                <div key={birthday.id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-800">{birthday.name}</p>
                    <p className="text-sm text-blue-600">{birthday.date}</p>
                  </div>
                  <Badge variant="outline" className="border-blue-300 text-blue-700">
                    {birthday.age}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Daily Checklist */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-800">Daily Care Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayChecklist.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => {}}
                  className="h-4 w-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                  {item.task}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={() => setShowQuickLog(true)}
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full bg-orange-500 hover:bg-orange-600 shadow-lg"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Quick Log Modal */}
      <QuickLogModal isOpen={showQuickLog} onClose={() => setShowQuickLog(false)} />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Index;
