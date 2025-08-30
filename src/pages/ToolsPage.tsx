import React, { useState } from 'react';
import MapView from '@/components/MapView';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BottomNav from '@/components/BottomNav';
import { 
  MapPin, 
  Calculator, 
  Volume2, 
  Sun, 
  Wind,
  Thermometer,
  Calendar,
  Wheat
} from 'lucide-react';

const ToolsPage = () => {
  const { t } = useTranslation();
  const [cageLength, setCageLength] = useState('');
  const [cageWidth, setCageWidth] = useState('');
  const [cageHeight, setCageHeight] = useState('');
  const [ratCount, setRatCount] = useState(0);
  const [ratAge, setRatAge] = useState('');
  const [humanAge, setHumanAge] = useState(0);
  const [showCalculatorResult, setShowCalculatorResult] = useState(false);

  // 計算籠子可容納的老鼠數量（基於最小空間需求）
  const calculateRatCapacity = () => {
    const length = parseFloat(cageLength);
    const width = parseFloat(cageWidth);
    const height = parseFloat(cageHeight);
    
    if (!length || !width || !height) {
      setRatCount(0);
      return;
    }

    const totalVolume = length * width * height;
    // 每隻老鼠需要至少 2000 立方公分的空間（建議值）
    const minSpacePerRat = 2000;
    const capacity = Math.floor(totalVolume / minSpacePerRat);
    setRatCount(Math.max(0, capacity));
    setShowCalculatorResult(true);
  };

  // 計算老鼠年齡對應人類年齡
  const calculateHumanAge = () => {
    const age = parseFloat(ratAge);
    if (!age) {
      setHumanAge(0);
      return;
    }
    
    // 老鼠年齡轉換公式：大約1個月的老鼠相當於人類12歲
    // 成年後每個月約等於人類2.5歲
    let human = 0;
    if (age <= 1) {
      human = age * 12;
    } else {
      human = 12 + (age - 1) * 30;
    }
    setHumanAge(Math.round(human));
  };

  const tools = [
    {
      title: t('Veterinary Hospital Map'),
      description: t('Find nearby exotic pet hospitals'),
      icon: MapPin,
      component: 'map',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: t('Cage Space Calculator'),
      description: t('Calculate optimal rat capacity for cage'),
      icon: Calculator,
      component: 'calculator',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: t('Decibel Meter'),
      description: t('Measure environmental noise levels'),
      icon: Volume2,
      component: 'decibel',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: t('Light Meter'),
      description: t('Measure light intensity'),
      icon: Sun,
      component: 'light',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: t('Oxygen Equipment Rental'),
      description: t('Find oxygen equipment rental services'),
      icon: Wind,
      component: 'oxygen',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    },
    {
      title: t('Temperature Monitor'),
      description: t('Monitor ambient temperature'),
      icon: Thermometer,
      component: 'temperature',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: t('Age Comparison Chart'),
      description: t('Compare rat age to human age'),
      icon: Calendar,
      component: 'age',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: t('Nutrition Analysis'),
      description: t('Analyze feed nutrition and recommendations'),
      icon: Wheat,
      component: 'nutrition',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const renderToolContent = (component: string) => {
    switch (component) {
      case 'map':
        return <MapView />;
      
      case 'calculator':
        return (
          <div className="p-4 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">{t('Cage Dimensions')}</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="length" className="text-sm font-medium">{t('Length')} (cm)</Label>
                  <Input
                    id="length"
                    type="number"
                    placeholder="60"
                    value={cageLength}
                    onChange={(e) => setCageLength(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="width" className="text-sm font-medium">{t('Width')} (cm)</Label>
                  <Input
                    id="width"
                    type="number"
                    placeholder="40"
                    value={cageWidth}
                    onChange={(e) => setCageWidth(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="height" className="text-sm font-medium">{t('Height')} (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="30"
                    value={cageHeight}
                    onChange={(e) => setCageHeight(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            
            <Button onClick={calculateRatCapacity} className="w-full py-3 text-lg">
              {t('Calculate Capacity')}
            </Button>
            
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
              <p className="font-semibold mb-1">{t('Minimum space requirements')}:</p>
              <p>• {t('Adult rats need at least 2000cm³ each')}</p>
              <p>• {t('More space is always better for rat welfare')}</p>
              <p>• {t('Consider adding multiple levels for enrichment')}</p>
            </div>
          </div>
        );
      
      case 'age':
        return (
          <div className="p-4 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">{t('Rat Age Calculator')}</h3>
              <div>
                <Label htmlFor="ratAge" className="text-sm font-medium">{t('Rat Age')} ({t('months')})</Label>
                <Input
                  id="ratAge"
                  type="number"
                  placeholder="12"
                  step="0.5"
                  value={ratAge}
                  onChange={(e) => setRatAge(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            
            <Button onClick={calculateHumanAge} className="w-full py-3 text-lg">
              {t('Calculate Human Age')}
            </Button>
            
            {humanAge > 0 && (
              <div className="text-center p-6 bg-primary/10 rounded-lg space-y-2">
                <div className="text-3xl font-bold text-primary">{humanAge}</div>
                <p className="text-lg font-semibold">
                  {t('Human years equivalent')}
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <h4 className="font-semibold">{t('Age Reference Chart')}</h4>
              <div className="text-sm space-y-2">
                <div className="flex justify-between border-b pb-1">
                  <span>{t('Rat Age')}</span>
                  <span>{t('Human Equivalent')}</span>
                </div>
                <div className="flex justify-between"><span>1-3 {t('weeks')}</span><span>0-2 {t('years')}</span></div>
                <div className="flex justify-between"><span>1 {t('month')}</span><span>12 {t('years')}</span></div>
                <div className="flex justify-between"><span>3 {t('months')}</span><span>18 {t('years')}</span></div>
                <div className="flex justify-between"><span>6 {t('months')}</span><span>25 {t('years')}</span></div>
                <div className="flex justify-between"><span>12 {t('months')}</span><span>40 {t('years')}</span></div>
                <div className="flex justify-between"><span>18 {t('months')}</span><span>55 {t('years')}</span></div>
                <div className="flex justify-between"><span>24 {t('months')}</span><span>70 {t('years')}</span></div>
              </div>
            </div>
          </div>
        );
      
      case 'nutrition':
        return (
          <div className="p-4 space-y-6">
            <h3 className="text-lg font-semibold text-center">{t('Nutrition Analysis')}</h3>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-green-600">{t('Recommended Nutrition Values')}</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-green-50 p-3 rounded">
                  <div className="font-semibold">{t('Protein')}</div>
                  <div>16-18% (Adult)</div>
                  <div>20-22% (Young/Pregnant)</div>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <div className="font-semibold">{t('Fat')}</div>
                  <div>4-5% (Adult)</div>
                  <div>7-8% (Young/Pregnant)</div>
                </div>
                <div className="bg-orange-50 p-3 rounded">
                  <div className="font-semibold">{t('Fiber')}</div>
                  <div>14-20%</div>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <div className="font-semibold">{t('Calcium')}</div>
                  <div>0.5-1.0%</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-orange-600">{t('Essential Vitamins')}</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-yellow-50 p-3 rounded">
                  <div className="font-semibold">{t('Vitamin A')}</div>
                  <div>4000-8000 IU/kg</div>
                </div>
                <div className="bg-red-50 p-3 rounded">
                  <div className="font-semibold">{t('Vitamin D3')}</div>
                  <div>1000-2000 IU/kg</div>
                </div>
                <div className="bg-pink-50 p-3 rounded">
                  <div className="font-semibold">{t('Vitamin E')}</div>
                  <div>30-100 mg/kg</div>
                </div>
                <div className="bg-indigo-50 p-3 rounded">
                  <div className="font-semibold">{t('Vitamin C')}</div>
                  <div>30-50 mg/kg</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-600">{t('Popular Feed Brands')}</h4>
              <div className="space-y-3 text-sm">
                <div className="border rounded p-3">
                  <div className="font-semibold">Oxbow Regal Rat</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t('Protein')}: 17% | {t('Fat')}: 5% | {t('Fiber')}: 20%
                  </div>
                </div>
                <div className="border rounded p-3">
                  <div className="font-semibold">Mazuri Rat Diet</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t('Protein')}: 16% | {t('Fat')}: 4% | {t('Fiber')}: 18%
                  </div>
                </div>
                <div className="border rounded p-3">
                  <div className="font-semibold">Harlan Teklad 2018</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t('Protein')}: 18% | {t('Fat')}: 6% | {t('Fiber')}: 14%
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded text-xs">
              <p className="font-semibold text-yellow-800 mb-1">{t('Important Notes')}:</p>
              <p>• {t('Always transition feed gradually over 7-10 days')}</p>
              <p>• {t('Fresh vegetables should complement, not replace pellets')}</p>
              <p>• {t('Avoid high-fat seeds and nuts as primary food')}</p>
            </div>
          </div>
        );
      
      case 'decibel':
        return (
          <div className="p-4 text-center">
            <p className="text-muted-foreground mb-4">
              {t('This feature requires microphone access and Capacitor mobile integration.')}
            </p>
            <Button disabled className="w-full">
              {t('Start Measuring')} ({t('Mobile App Required')})
            </Button>
          </div>
        );
      
      case 'light':
        return (
          <div className="p-4 text-center">
            <p className="text-muted-foreground mb-4">
              {t('This feature requires light sensor access and Capacitor mobile integration.')}
            </p>
            <Button disabled className="w-full">
              {t('Measure Light')} ({t('Mobile App Required')})
            </Button>
          </div>
        );
      
      case 'oxygen':
        return (
          <div className="p-4">
            <h3 className="font-semibold mb-3">{t('Oxygen Equipment Rental Services')}</h3>
            <div className="space-y-2 text-sm">
              <p>• {t('Contact your local pet supply store')}</p>
              <p>• {t('Check with veterinary clinics')}</p>
              <p>• {t('Search online medical equipment rental')}</p>
            </div>
            <Button className="w-full mt-4" disabled>
              {t('Find Nearby Services')} ({t('Coming Soon')})
            </Button>
          </div>
        );
      
      default:
        return (
          <div className="p-4 text-center">
            <p className="text-muted-foreground">
              {t('This tool is under development')}
            </p>
          </div>
        );
    }
  };

  if (selectedTool) {
    const tool = tools.find(t => t.component === selectedTool);
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedTool(null)}
            >
              ← {t('Back')}
            </Button>
            <h1 className="text-2xl font-bold">{tool?.title}</h1>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {tool?.icon && <tool.icon className={`h-5 w-5 ${tool.color}`} />}
                {tool?.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderToolContent(selectedTool)}
            </CardContent>
          </Card>
        </div>
        <BottomNav />
        
        {/* Calculator Result Modal */}
        <Dialog open={showCalculatorResult} onOpenChange={setShowCalculatorResult}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-center">{t('Space Analysis Results')}</DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-6">
              {/* Cage Information */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="font-semibold mb-2 text-center">{t('Cage Information')}</div>
                <div className="text-sm space-y-1 text-center">
                  <div>{t('Dimensions')}: {cageLength} × {cageWidth} × {cageHeight} cm</div>
                  <div>{t('Total volume')}: {(parseFloat(cageLength || '0') * parseFloat(cageWidth || '0') * parseFloat(cageHeight || '0')).toLocaleString()}cm³</div>
                </div>
              </div>

              {/* Comfort Level Recommendations */}
              <div className="space-y-4">
                <h3 className="font-semibold text-center">{t('Comfort Level Recommendations')}</h3>
                
                {(() => {
                  const totalVolume = parseFloat(cageLength || '0') * parseFloat(cageWidth || '0') * parseFloat(cageHeight || '0');
                  const comfortable = Math.floor(totalVolume / (43 * 43 * 43)); // 43×43×43 cm per rat
                  const minimum = Math.floor(totalVolume / 26028); // 38x38x18 cm per rat
                  
                  return (
                    <>
                      {/* Comfortable */}
                      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="font-semibold text-green-700">{t('Comfortable')}</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {Math.max(0, comfortable)} {t('rats')}
                        </div>
                        <div className="text-sm text-green-600">
                          {t('Adequate space: 43×43×43cm per rat provides good living conditions')}
                        </div>
                      </div>

                      {/* Minimum Acceptable */}
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                          <span className="font-semibold text-amber-700">{t('Minimum Acceptable')}</span>
                        </div>
                        <div className="text-2xl font-bold text-amber-600 mb-1">
                          {Math.max(0, minimum)} {t('rats')}
                        </div>
                        <div className="text-sm text-amber-600">
                          {t('Veterinary minimum: Based on textbook standards (38-51×38-51×18-25cm)')}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
              
              <div className="bg-blue-50 p-3 rounded text-xs border border-blue-200">
                <p className="font-semibold text-blue-800 mb-1">{t('Important Notes')}:</p>
                <p>• {t('Rats are social animals - always keep pairs or groups')}</p>
                <p>• {t('Multiple levels and enrichment items increase usable space')}</p>
                <p>• {t('Young rats need less space, but will grow quickly')}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('Rat Care Tools')}
          </h1>
          <p className="text-muted-foreground">
            {t('Essential tools for optimal rat care and monitoring')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                onClick={() => setSelectedTool(tool.component)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex p-3 rounded-full ${tool.bgColor} mb-3`}>
                    <Icon className={`h-6 w-6 ${tool.color}`} />
                  </div>
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {tool.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h2 className="font-semibold mb-2">{t('Mobile Features Note')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('Some tools require mobile device sensors and will be fully functional when using the Capacitor mobile app version.')}
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default ToolsPage;