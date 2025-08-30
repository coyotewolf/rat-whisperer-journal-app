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
import { MapPin, Plus, RefreshCw, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  const [tokenError, setTokenError] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const [newPoint, setNewPoint] = useState({
    title: '',
    description: '',
    category: 'hospital',
    latitude: 0,
    longitude: 0
  });
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Fetch token from Supabase edge function
  const fetchMapboxToken = async () => {
    try {
      setIsLoadingToken(true);
      setTokenError('');
      
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      
      if (error) throw error;
      
      if (data?.token) {
        setMapboxToken(data.token);
      } else {
        throw new Error('No token received');
      }
    } catch (error) {
      console.error('Error fetching Mapbox token:', error);
      setTokenError('Failed to load Mapbox token. Please check configuration.');
      toast.error('Failed to load map configuration');
    } finally {
      setIsLoadingToken(false);
    }
  };

  // Fetch user role
  const fetchUserRole = async () => {
    if (!user) {
      setIsLoadingRole(false);
      return;
    }

    try {
      setIsLoadingRole(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setUserRole(data?.role || 'user');
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('user'); // Default to user role
    } finally {
      setIsLoadingRole(false);
    }
  };

  // Fetch token on component mount
  useEffect(() => {
    fetchMapboxToken();
  }, []);

  // Fetch user role when user changes
  useEffect(() => {
    fetchUserRole();
  }, [user]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || isLoadingToken) return;

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
  }, [isAddingPoint, mapboxToken, isLoadingToken]);

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
        category: 'hospital',
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

  const getCategoryColor = (category: string) => {
    const colors = {
      hospital: '#EF4444',
      clinic: '#F59E0B',
      emergency: '#DC2626',
      specialist: '#3B82F6',
      pharmacy: '#10B981'
    };
    return colors[category as keyof typeof colors] || colors.hospital;
  };

  const isTester = userRole === 'tester';

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
        <div>
          <h2 className="text-2xl font-bold">Veterinary Hospital Map</h2>
          <p className="text-sm text-muted-foreground">
            {isLoadingRole ? 'Loading...' : 
              isTester ? 'Tester - You can view and add veterinary hospitals' : 
              'User - You can view veterinary hospitals'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchMapboxToken}
            variant="outline"
            size="sm"
            disabled={isLoadingToken}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingToken ? 'animate-spin' : ''}`} />
            Refresh Token
          </Button>
          {isTester && (
            <Button
              onClick={() => setIsAddingPoint(!isAddingPoint)}
              variant={isAddingPoint ? "destructive" : "default"}
              size="sm"
              disabled={isLoadingToken || !!tokenError || isLoadingRole}
            >
              <MapPin className="w-4 h-4 mr-2" />
              {isAddingPoint ? 'Cancel Adding' : 'Add Hospital'}
            </Button>
          )}
        </div>
      </div>

      {isLoadingToken && (
        <Alert>
          <AlertDescription>
            Loading map configuration...
          </AlertDescription>
        </Alert>
      )}

      {tokenError && (
        <Alert variant="destructive">
          <AlertDescription>
            {tokenError}
          </AlertDescription>
        </Alert>
      )}

      {isTester && isAddingPoint && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Click anywhere on the map to add a new veterinary hospital.
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

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Veterinary Hospital</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Hospital Name</Label>
              <Input
                id="title"
                value={newPoint.title}
                onChange={(e) => setNewPoint(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter hospital name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newPoint.description}
                onChange={(e) => setNewPoint(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter hospital description, services, contact info, etc."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="category">Type</Label>
              <Select
                value={newPoint.category}
                onValueChange={(value) => setNewPoint(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hospital">Veterinary Hospital</SelectItem>
                  <SelectItem value="clinic">Veterinary Clinic</SelectItem>
                  <SelectItem value="emergency">Emergency Vet</SelectItem>
                  <SelectItem value="specialist">Specialist Vet</SelectItem>
                  <SelectItem value="pharmacy">Veterinary Pharmacy</SelectItem>
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
                Add Hospital
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MapView;