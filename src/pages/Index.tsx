
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Bell, Calendar, Activity, Settings, Sparkles } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import QuickLogModal from "@/components/QuickLogModal";
import SettingsModal from "@/components/SettingsModal";

const Index = () => {
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 pb-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

      {/* Header with Glassmorphism */}
      <div className="relative backdrop-blur-md bg-white/10 border-b border-white/20 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-orange-400 to-pink-500 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                RatTracker
              </h1>
              <p className="text-sm text-blue-100/80">Your rats' digital companion</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              className="backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300"
            >
              <Bell className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setShowSettings(true)}
              className="backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative p-4 space-y-6">
        {/* Daily Progress - Enhanced with Glassmorphism */}
        <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-white">
              <div className="p-1 rounded-lg bg-gradient-to-r from-orange-400 to-red-500">
                <Activity className="h-5 w-5 text-white" />
              </div>
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-blue-100">
                {completedTasks} of {totalTasks} tasks completed
              </span>
              <span className="text-lg font-bold text-white">
                {Math.round((completedTasks / totalTasks) * 100)}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm">
              <div 
                className="bg-gradient-to-r from-orange-400 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Health Alerts - Enhanced Design */}
        {healthAlerts.length > 0 && (
          <Card className="backdrop-blur-md bg-white/10 border-red-300/30 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-100">
                <div className="p-1 rounded-lg bg-gradient-to-r from-red-500 to-pink-500">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                Health Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {healthAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 backdrop-blur-sm bg-red-500/20 rounded-lg border border-red-300/30">
                  <div>
                    <p className="font-medium text-white">{alert.rat}</p>
                    <p className="text-sm text-red-100">{alert.alert}</p>
                  </div>
                  <Badge 
                    variant={alert.severity === "high" ? "destructive" : "secondary"}
                    className="backdrop-blur-sm"
                  >
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Upcoming Birthdays - Enhanced Design */}
        {upcomingBirthdays.length > 0 && (
          <Card className="backdrop-blur-md bg-white/10 border-blue-300/30 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-100">
                <div className="p-1 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                Upcoming Birthdays
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingBirthdays.map((birthday) => (
                <div key={birthday.id} className="flex items-center justify-between p-3 backdrop-blur-sm bg-blue-500/20 rounded-lg border border-blue-300/30">
                  <div>
                    <p className="font-medium text-white">{birthday.name}</p>
                    <p className="text-sm text-blue-100">{birthday.date}</p>
                  </div>
                  <Badge variant="outline" className="border-blue-300 text-blue-100 backdrop-blur-sm">
                    {birthday.age}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Daily Checklist - Enhanced Design */}
        <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-white">Daily Care Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayChecklist.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => {}}
                  className="h-4 w-4 text-orange-500 rounded focus:ring-orange-400 focus:ring-2 bg-white/20 border-white/30"
                />
                <span className={`flex-1 transition-all duration-300 ${item.completed ? 'line-through text-gray-300' : 'text-white'}`}>
                  {item.task}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Floating Action Button */}
      <Button
        onClick={() => setShowQuickLog(true)}
        className="fixed bottom-24 right-4 h-16 w-16 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-2xl transform hover:scale-110 transition-all duration-300 border-2 border-white/20 backdrop-blur-sm"
        size="icon"
      >
        <Plus className="h-7 w-7 text-white" />
      </Button>

      {/* Modals */}
      <QuickLogModal isOpen={showQuickLog} onClose={() => setShowQuickLog(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Index;
