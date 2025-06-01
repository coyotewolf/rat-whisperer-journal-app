
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Mail, Lock } from "lucide-react";

interface AccountSettingsProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  onBack: () => void;
}

const AccountSettings = ({ isLoggedIn, setIsLoggedIn, onBack }: AccountSettingsProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Mock login functionality
    if (email && password) {
      setIsLoggedIn(true);
      console.log("Login successful");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
    console.log("Logged out");
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-4 p-0 h-auto">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Settings
      </Button>

      {!isLoggedIn ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Sign In
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <Button onClick={handleLogin} className="w-full bg-orange-500 hover:bg-orange-600">
              Sign In
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Don't have an account? Sign up to sync your data across devices.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-800">Signed in as</p>
              <p className="text-sm text-green-600">{email}</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Account Actions</h3>
              <Button variant="outline" className="w-full">
                Sync Data
              </Button>
              <Button variant="outline" className="w-full">
                Export Data
              </Button>
              <Button variant="outline" onClick={handleLogout} className="w-full text-red-600 border-red-200 hover:bg-red-50">
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccountSettings;
