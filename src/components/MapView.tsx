import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Plus, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import MapboxTokenInput from './MapboxTokenInput';

interface MapData {
  id: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  category: string;
  user_id: string;
}

const MapView = () => {
  const { user } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapData, setMapData] = useState<MapData[]>([]);
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [newPoint, setNewPoint] = useState({
    title: '',
    description: '',
    category: 'general',
    latitude: 0,
    longitude: 0
  });
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Check for token on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      setMapboxToken(savedToken);
    } else {
      setShowTokenInput(true);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Get Mapbox token from Supabase secrets (will be available in production)
    // For development, you can temporarily set it here
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [121.5654, 25.0330], // Taipei coordinates as default
      zoom: 10,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add click handler for adding points
    map.current.on('click', (e) => {
      if (isAddingPoint) {
        setNewPoint(prev => ({
          ...prev,
          latitude: e.lngLat.lat,
          longitude: e.lngLat.lng
        }));
        setShowAddDialog(true);
        setIsAddingPoint(false);
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [isAddingPoint, mapboxToken]);

  // Load map data
  useEffect(() => {
    loadMapData();
  }, []);

  // Add markers to map
  useEffect(() => {
    if (!map.current || !mapData.length) return;

    // Clear existing markers
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());

    // Add new markers
    mapData.forEach(point => {
      const marker = new mapboxgl.Marker({
        color: getCategoryColor(point.category)
      })
        .setLngLat([point.longitude, point.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold">${point.title}</h3>
                ${point.description ? `<p class="text-sm text-muted-foreground mt-1">${point.description}</p>` : ''}
                <p class="text-xs text-muted-foreground mt-1">Category: ${point.category}</p>
              </div>
            `)
        )
        .addTo(map.current!);
    });
  }, [mapData]);

  const loadMapData = async () => {
    try {
      const { data, error } = await supabase
        .from('map_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMapData(data || []);
    } catch (error) {
      console.error('Error loading map data:', error);
      toast.error('Failed to load map data');
    }
  };

  const addMapPoint = async () => {
    if (!user || !newPoint.title.trim()) return;

    try {
      const { error } = await supabase
        .from('map_data')
        .insert({
          title: newPoint.title,
          description: newPoint.description,
          category: newPoint.category,
          latitude: newPoint.latitude,
          longitude: newPoint.longitude,
          user_id: user.id
        });

      if (error) throw error;

      toast.success('Map point added successfully');
      setNewPoint({
        title: '',
        description: '',
        category: 'general',
        latitude: 0,
        longitude: 0
      });
      setShowAddDialog(false);
      loadMapData();
    } catch (error) {
      console.error('Error adding map point:', error);
      toast.error('Failed to add map point');
    }
  };

  const handleTokenSubmit = (token: string) => {
    setMapboxToken(token);
    toast.success('Mapbox token saved successfully');
  };

  const clearToken = () => {
    localStorage.removeItem('mapbox_token');
    setMapboxToken('');
    setShowTokenInput(true);
    toast.info('Mapbox token cleared');
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      general: '#6B7280',
      health: '#EF4444',
      behavior: '#3B82F6',
      environment: '#10B981',
      food: '#F59E0B'
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please sign in to access the map features.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Interactive Map</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={clearToken}
            variant="outline"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Token Settings
          </Button>
          <Button
            onClick={() => setIsAddingPoint(!isAddingPoint)}
            variant={isAddingPoint ? "destructive" : "default"}
            size="sm"
          >
            <MapPin className="w-4 h-4 mr-2" />
            {isAddingPoint ? 'Cancel Adding' : 'Add Point'}
          </Button>
        </div>
      </div>

      {!mapboxToken && (
        <Alert>
          <AlertDescription>
            Map requires a Mapbox token to display. Click Token Settings to configure.
          </AlertDescription>
        </Alert>
      )}

      {isAddingPoint && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Click anywhere on the map to add a new point.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div 
            ref={mapContainer} 
            className="h-[500px] w-full rounded-lg"
            style={{ cursor: isAddingPoint ? 'crosshair' : 'default' }}
          />
        </CardContent>
      </Card>

      <MapboxTokenInput
        open={showTokenInput}
        onClose={() => setShowTokenInput(false)}
        onTokenSubmit={handleTokenSubmit}
      />

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Map Point</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newPoint.title}
                onChange={(e) => setNewPoint(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter point title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newPoint.description}
                onChange={(e) => setNewPoint(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter point description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={newPoint.category}
                onValueChange={(value) => setNewPoint(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="behavior">Behavior</SelectItem>
                  <SelectItem value="environment">Environment</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={addMapPoint}
                disabled={!newPoint.title.trim()}
              >
                Add Point
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MapView;