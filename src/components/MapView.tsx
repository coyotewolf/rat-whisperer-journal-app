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
import { Badge } from '@/components/ui/badge';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { MapPin, Plus, RefreshCw, Settings, Edit, Trash2, List, Search } from 'lucide-react';
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
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapData, setMapData] = useState<MapData[]>([]);
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  const [tokenError, setTokenError] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const [newPoint, setNewPoint] = useState({
    title: '',
    description: '',
    category: 'hospital',
    latitude: 0,
    longitude: 0
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDataPanel, setShowDataPanel] = useState(false);
  const [editingPoint, setEditingPoint] = useState<MapData | null>(null);
  const [deletingPoint, setDeletingPoint] = useState<MapData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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
        .maybeSingle();

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

    map.current.on('load', () => {
      setIsMapReady(true);
      // Ensure proper sizing once styles are fully loaded
      map.current?.resize();
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
      setIsMapReady(false);
      map.current?.remove();
    };
  }, [mapboxToken, isLoadingToken]);

  // Load map data
  useEffect(() => {
    loadMapData();
  }, []);

  // Add markers to map
  useEffect(() => {
    if (!map.current || !isMapReady || !mapData) return;

    console.debug('[MapView] Rendering markers:', mapData.length);

    // Remove existing markers via ref to avoid DOM query side-effects
    if (markersRef.current.length) {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
    }

    // Add new markers with custom icons
    mapData.forEach(point => {
      if (!map.current) return;

      const lat = Number(point.latitude);
      const lng = Number(point.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return;

      const customElement = createCustomMarker(point.category);

      const marker = new mapboxgl.Marker({ element: customElement })
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ 
            offset: 25,
            maxWidth: '90vw',
            className: 'mobile-friendly-popup'
          })
            .setHTML(`
              <div class="p-3 min-w-0 max-w-[320px]">
                <div class="flex items-start gap-2 mb-2">
                  <span class="text-lg flex-shrink-0">${getCategoryIcon(point.category)}</span>
                  <div class="min-w-0 flex-1">
                    <h3 class="font-semibold text-base leading-tight break-words">${point.title}</h3>
                  </div>
                </div>
                ${point.description ? `<p class="text-sm text-gray-600 mb-2 leading-relaxed break-words">${point.description}</p>` : ''}
                <div class="flex items-center gap-2 mb-3">
                  <span class="text-xs px-2 py-1 rounded-full text-white flex-shrink-0" style="background-color: ${getCategoryColor(point.category)}">${point.category}</span>
                </div>
                ${isTester ? `
                  <div class="flex gap-2 pt-2 border-t justify-end">
                    <button 
                      onclick="window.editMapPoint('${point.id}')" 
                      class="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                      title="Edit"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button 
                      onclick="window.deleteMapPoint('${point.id}')" 
                      class="flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Delete"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m3 6 18 0"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                ` : ''}
              </div>
            `)
        );

      if (map.current) {
        marker.addTo(map.current);
        markersRef.current.push(marker);
      }
    });
  }, [mapData, isMapReady]);

  // Auto-fit map to markers when data is available
  useEffect(() => {
    if (!map.current || !isMapReady || !mapData || mapData.length === 0) return;
    const bounds = new mapboxgl.LngLatBounds();
    mapData.forEach(p => {
      const lat = Number(p.latitude);
      const lng = Number(p.longitude);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) bounds.extend([lng, lat]);
    });
    if (!bounds.isEmpty()) {
      map.current.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 500 });
    }
  }, [isMapReady, mapData.length]);

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

  const updateMapPoint = async () => {
    if (!user || !editingPoint || !editingPoint.title.trim()) return;

    try {
      const { error } = await supabase
        .from('map_data')
        .update({
          title: editingPoint.title,
          description: editingPoint.description,
          category: editingPoint.category,
          latitude: editingPoint.latitude,
          longitude: editingPoint.longitude,
        })
        .eq('id', editingPoint.id);

      if (error) throw error;

      toast.success('Map point updated successfully');
      setEditingPoint(null);
      setShowEditDialog(false);
      loadMapData();
    } catch (error) {
      console.error('Error updating map point:', error);
      toast.error('Failed to update map point');
    }
  };

  const deleteMapPoint = async () => {
    if (!user || !deletingPoint) return;

    try {
      const { error } = await supabase
        .from('map_data')
        .delete()
        .eq('id', deletingPoint.id);

      if (error) throw error;

      toast.success('Map point deleted successfully');
      setDeletingPoint(null);
      setShowDeleteDialog(false);
      loadMapData();
    } catch (error) {
      console.error('Error deleting map point:', error);
      toast.error('Failed to delete map point');
    }
  };

  const handleEditPoint = (pointId: string) => {
    const point = mapData.find(p => p.id === pointId);
    if (point) {
      setEditingPoint({ ...point });
      setShowEditDialog(true);
    }
  };

  const handleDeletePoint = (pointId: string) => {
    const point = mapData.find(p => p.id === pointId);
    if (point) {
      setDeletingPoint(point);
      setShowDeleteDialog(true);
    }
  };

  // Add global functions for popup buttons
  useEffect(() => {
    (window as any).editMapPoint = handleEditPoint;
    (window as any).deleteMapPoint = handleDeletePoint;
    
    return () => {
      delete (window as any).editMapPoint;
      delete (window as any).deleteMapPoint;
    };
  }, [mapData]);

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

  const getCategoryIcon = (category: string) => {
    const icons = {
      hospital: '🏥',
      clinic: '🏥',
      emergency: '🚑',
      specialist: '👨‍⚕️',
      pharmacy: '💊'
    };
    return icons[category as keyof typeof icons] || icons.hospital;
  };

  const createCustomMarker = (category: string) => {
    const icon = getCategoryIcon(category);
    const color = getCategoryColor(category);
    
    // IMPORTANT: Do NOT set transform on the root element because Mapbox
    // uses transform to position the marker. We'll animate a child instead.
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.cssText = `
      width: 40px;
      height: 40px;
      position: relative;
      display: grid;
      place-items: center;
      cursor: pointer;
    `;

    const inner = document.createElement('div');
    inner.style.cssText = `
      width: 100%;
      height: 100%;
      background-color: ${color};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      border: 3px solid white;
      transition: transform 0.2s ease;
      transform: scale(1);
    `;
    inner.innerHTML = icon;

    el.appendChild(inner);
    
    el.addEventListener('mouseenter', () => {
      inner.style.transform = 'scale(1.1)';
    });
    
    el.addEventListener('mouseleave', () => {
      inner.style.transform = 'scale(1)';
    });
    
    return el;
  };

  // Address search function
  const searchAddress = async (query: string) => {
    if (!query.trim() || !mapboxToken) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&country=tw&limit=5`
      );
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) {
      console.error('Error searching address:', error);
      toast.error('Address search failed');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: any) => {
    const [lng, lat] = result.center;
    setNewPoint(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      title: prev.title || result.text || result.place_name
    }));
    
    // Move map to selected location
    if (map.current) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: 15
      });
    }
    
    setSearchResults([]);
    setSearchQuery('');
    setShowAddDialog(true);
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
      {/* Header section with responsive layout */}
      <div className="space-y-4 sm:space-y-0 sm:flex sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold truncate">Veterinary Hospital Map</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoadingRole ? 'Loading...' : 
              isTester ? 'Tester - You can view and add veterinary hospitals' : 
              'User - You can view veterinary hospitals'}
          </p>
        </div>
        {/* Mobile-friendly button layout */}
        <div className="flex flex-wrap items-center gap-2 sm:ml-4">
          <Button
            onClick={() => setShowDataPanel(!showDataPanel)}
            variant="outline"
            size="sm"
            className="flex-shrink-0"
          >
            <List className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">{showDataPanel ? 'Hide' : 'Show'} Data Points</span>
            <span className="sm:hidden">{showDataPanel ? 'Hide' : 'List'}</span>
          </Button>
          <Button
            onClick={fetchMapboxToken}
            variant="outline"
            size="sm"
            disabled={isLoadingToken}
            className="flex-shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingToken ? 'animate-spin' : ''} sm:mr-2`} />
            <span className="hidden sm:inline">Refresh Token</span>
            <span className="sm:hidden">Refresh</span>
          </Button>
          {isTester && (
            <Button
              onClick={() => setIsAddingPoint(!isAddingPoint)}
              variant={isAddingPoint ? "destructive" : "default"}
              size="sm"
              disabled={isLoadingToken || !!tokenError || isLoadingRole}
              className="flex-shrink-0"
            >
              <MapPin className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{isAddingPoint ? 'Cancel Adding' : 'Add Hospital'}</span>
              <span className="sm:hidden">{isAddingPoint ? 'Cancel' : 'Add'}</span>
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
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click anywhere on the map to add a new veterinary hospital, or search for an address below:
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="map-address-search">Search Address to Add Hospital</Label>
                <div className="relative">
                  <Input
                    id="map-address-search"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.length > 2) {
                        searchAddress(e.target.value);
                      } else {
                        setSearchResults([]);
                      }
                    }}
                    placeholder="搜尋地址或地點名稱..."
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  {isSearching && (
                    <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                </div>
                
                {searchResults.length > 0 && (
                  <div className="border rounded-md max-h-40 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => selectSearchResult(result)}
                        className="w-full text-left p-2 hover:bg-muted text-sm border-b last:border-b-0"
                      >
                        <div className="font-medium">{result.text}</div>
                        <div className="text-xs text-muted-foreground">{result.place_name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showDataPanel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span>Map Data Points ({mapData.length})</span>
              {isTester && (
                <Button
                  onClick={() => setIsAddingPoint(true)}
                  size="sm"
                  disabled={isLoadingToken || !!tokenError}
                  className="self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mapData.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No veterinary hospitals added yet.</p>
            ) : (
              <div className="space-y-4 max-h-60 sm:max-h-80 overflow-y-auto">
                {mapData.map((point) => (
                  <div key={point.id} className="group relative bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:border-primary/20">
                    <div className="space-y-3">
                      {/* Header with icon, title, and category badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-semibold" 
                               style={{ backgroundColor: getCategoryColor(point.category) }}>
                            {getCategoryIcon(point.category)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-foreground text-base leading-tight mb-1 break-words">{point.title}</h4>
                            <Badge 
                              variant="secondary" 
                              className="text-xs font-medium px-2 py-1"
                              style={{ 
                                backgroundColor: `${getCategoryColor(point.category)}20`,
                                color: getCategoryColor(point.category),
                                border: `1px solid ${getCategoryColor(point.category)}40`
                              }}
                            >
                              {point.category}
                            </Badge>
                          </div>
                        </div>
                        {isTester && (
                          <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              onClick={() => handleEditPoint(point.id)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-primary/10"
                            >
                              <Edit className="w-4 h-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              onClick={() => handleDeletePoint(point.id)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {/* Description */}
                      {point.description && (
                        <div className="pl-12">
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 break-words">
                            {point.description}
                          </p>
                        </div>
                      )}
                      
                      {/* Location coordinates */}
                      <div className="pl-12">
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-md">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground font-mono">
                            {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div 
            ref={mapContainer} 
            className="h-[300px] sm:h-[400px] md:h-[500px] w-full rounded-lg"
            style={{ cursor: isAddingPoint ? 'crosshair' : 'default' }}
          />
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Veterinary Hospital</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
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
                className="resize-none"
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
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                onClick={addMapPoint}
                disabled={!newPoint.title.trim()}
                className="order-1 sm:order-2"
              >
                Add Hospital
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Veterinary Hospital</DialogTitle>
          </DialogHeader>
          {editingPoint && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <Label htmlFor="edit-title">Hospital Name</Label>
                <Input
                  id="edit-title"
                  value={editingPoint.title}
                  onChange={(e) => setEditingPoint(prev => prev ? { ...prev, title: e.target.value } : null)}
                  placeholder="Enter hospital name"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  value={editingPoint.description || ''}
                  onChange={(e) => setEditingPoint(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="Enter hospital description, services, contact info, etc."
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Type</Label>
                <Select
                  value={editingPoint.category}
                  onValueChange={(value) => setEditingPoint(prev => prev ? { ...prev, category: value } : null)}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-latitude">Latitude</Label>
                  <Input
                    id="edit-latitude"
                    type="number"
                    step="any"
                    value={editingPoint.latitude}
                    onChange={(e) => setEditingPoint(prev => prev ? { ...prev, latitude: parseFloat(e.target.value) || 0 } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-longitude">Longitude</Label>
                  <Input
                    id="edit-longitude"
                    type="number"
                    step="any"
                    value={editingPoint.longitude}
                    onChange={(e) => setEditingPoint(prev => prev ? { ...prev, longitude: parseFloat(e.target.value) || 0 } : null)}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  className="order-2 sm:order-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={updateMapPoint}
                  disabled={!editingPoint.title.trim()}
                  className="order-1 sm:order-2"
                >
                  Update Hospital
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={deleteMapPoint}
        title="Delete Veterinary Hospital"
        description={`Are you sure you want to delete "${deletingPoint?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
};

export default MapView;