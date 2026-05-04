'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { NativeSelect } from './ui/native-select';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { type Property } from './PropertyMap';
import { Building2, MapPin, Users, Globe, Landmark, Layers } from 'lucide-react';

const PropertyMap = dynamic(() => import('./PropertyMap'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Loading Map...</div>
});

export default function DashboardClient({ initialProperties }: { initialProperties: Property[] }) {
  const [search, setSearch] = useState('');
  const [selectedLocalite, setSelectedLocalite] = useState('all');
  const [selectedFondation, setSelectedFondation] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [groupByLocalite, setGroupByLocalite] = useState(false);
  
  const listRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const properties = initialProperties;

  // Sync list scroll when a property is selected
  useEffect(() => {
    if (selectedProperty) {
      const el = listRefs.current.get(selectedProperty.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedProperty]);

  const filtered = useMemo(() => {
    return properties
      .filter((p) => {
        const name = p.name || '';
        const address = p.address || '';
        const localite = p.localite || '';
        const fondation = p.fondation || '';

        const matchSearch = 
          name.toLowerCase().includes(search.toLowerCase()) || 
          address.toLowerCase().includes(search.toLowerCase());
        
        const matchLocalite = selectedLocalite === 'all' || localite === selectedLocalite;
        const matchFondation = selectedFondation === 'all' || fondation === selectedFondation;
        
        return matchSearch && matchLocalite && matchFondation;
      })
      .sort((a, b) => (a.name || a.address).localeCompare(b.name || b.address));
  }, [search, selectedLocalite, selectedFondation, properties]);

  const groupedProperties = useMemo(() => {
    if (!groupByLocalite) return { 'All Properties': filtered };

    const groups: Record<string, Property[]> = {};
    filtered.forEach(p => {
      const key = p.localite || 'Unknown';
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    
    // Sort keys (Localités) alphabetically
    return Object.fromEntries(
      Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
    );
  }, [filtered, groupByLocalite]);

  const localites = useMemo(() => 
    Array.from(new Set(properties.map((p) => p.localite).filter(Boolean))) as string[], 
    [properties]
  );
  
  const fondations = useMemo(() => 
    Array.from(new Set(properties.map((p) => p.fondation).filter(Boolean))) as string[], 
    [properties]
  );

  const renderPropertyCard = (p: Property) => (
    <div 
      key={p.id} 
      ref={(el) => {
        if (el) listRefs.current.set(p.id, el);
        else listRefs.current.delete(p.id);
      }}
      onClick={() => setSelectedProperty(p)} 
      className={`p-5 cursor-pointer hover:bg-white transition-all group ${selectedProperty?.id === p.id ? 'bg-white shadow-sm ring-1 ring-inset ring-blue-100' : ''}`}
    >
      <h3 className="font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors text-sm">
        {p.name || p.address}
      </h3>
      <div className="flex items-start gap-1.5 mt-2 text-slate-500">
        <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
        <p className="text-[11px] leading-relaxed">{p.address}</p>
      </div>
      {p.localite && !groupByLocalite && (
        <div className="mt-3 flex gap-2">
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-slate-200 text-slate-500 font-medium">
            {p.localite}
          </Badge>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <header className="h-16 border-b flex items-center px-6 gap-6 bg-white z-10 shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="font-bold text-xl tracking-tight text-slate-900">FIDPMap</div>
        </div>
        
        <div className="flex-1 flex gap-3">
          <div className="relative max-w-sm flex-1">
            <Input 
              placeholder="Search properties..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="h-10 pl-3 bg-slate-50 border-slate-200 focus:bg-white transition-colors" 
            />
          </div>
          <NativeSelect 
            value={selectedLocalite} 
            onChange={(e) => setSelectedLocalite(e.target.value)} 
            className="h-10 min-w-[160px] bg-slate-50 border-slate-200"
          >
             <option value="all">All Localités</option>
             {localites.sort().map((l) => <option key={l} value={l}>{l}</option>)}
          </NativeSelect>
          <NativeSelect 
            value={selectedFondation} 
            onChange={(e) => setSelectedFondation(e.target.value)} 
            className="h-10 min-w-[160px] bg-slate-50 border-slate-200"
          >
             <option value="all">All Fondations</option>
             {fondations.sort().map((f) => <option key={f} value={f}>{f}</option>)}
          </NativeSelect>
        </div>

        <div className="flex items-center space-x-2 border-l pl-6">
          <Switch 
            id="group-by-localite" 
            checked={groupByLocalite} 
            onCheckedChange={setGroupByLocalite} 
          />
          <Label htmlFor="group-by-localite" className="text-xs font-medium text-slate-600 cursor-pointer">
            Group by Localité
          </Label>
        </div>
        
        <Badge variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-100 font-semibold">
          {filtered.length} properties
        </Badge>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 overflow-y-auto border-r bg-slate-50/50">
          {filtered.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {Object.entries(groupedProperties).map(([groupName, groupItems]) => (
                <div key={groupName}>
                  {groupByLocalite && (
                    <div className="bg-slate-100/80 px-5 py-2 sticky top-0 z-10 border-b border-slate-200 flex items-center gap-2">
                      <Layers className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{groupName}</span>
                      <Badge variant="outline" className="ml-auto text-[10px] h-4 px-1 bg-white/50 border-slate-200 text-slate-400">
                        {groupItems.length}
                      </Badge>
                    </div>
                  )}
                  <div className="divide-y divide-slate-100">
                    {groupItems.map(renderPropertyCard)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm text-slate-500 font-medium text-balance">No properties match your filters.</p>
            </div>
          )}
        </aside>
        
        <main className="flex-1 relative">
          <PropertyMap 
            properties={filtered} 
            onSelect={setSelectedProperty} 
            selectedProperty={selectedProperty}
          />
        </main>
      </div>

      <Sheet modal={false} open={!!selectedProperty} onOpenChange={(open) => !open && setSelectedProperty(null)}>
        <SheetContent side="right" className="sm:max-w-md p-0 gap-0 border-l-0 shadow-2xl">
          <SheetDescription className="sr-only">
            Details and information about the selected property.
          </SheetDescription>
          <div className="h-full flex flex-col">
            <div className="relative h-64 bg-slate-900 shrink-0">
              {selectedProperty?.image_url ? (
                <Image 
                  src={selectedProperty.image_url} 
                  alt={selectedProperty.name || selectedProperty.address} 
                  fill
                  unoptimized
                  className="w-full h-full object-cover opacity-90"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-100">
                  <Building2 className="w-12 h-12 mb-2 opacity-20" />
                  <span className="text-xs font-medium opacity-40">No photo available</span>
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <SheetHeader className="p-0 space-y-0">
                  <SheetTitle className="text-2xl font-bold leading-tight drop-shadow-md text-white">
                    {selectedProperty?.name || selectedProperty?.address}
                  </SheetTitle>
                </SheetHeader>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="space-y-8">
                <section>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Location Details
                  </h4>
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Full Address</p>
                      <p className="text-sm font-medium text-slate-700 leading-relaxed">{selectedProperty?.address}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/50">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Localité</p>
                        <p className="text-sm font-bold text-slate-900">{selectedProperty?.localite || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Units</p>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                          <Users className="w-3.5 h-3.5 text-blue-500" />
                          {selectedProperty?.units || 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                    <Landmark className="w-3 h-3" /> Management
                  </h4>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                      <span className="text-xs text-slate-500">Fondation</span>
                      <span className="text-sm font-bold text-blue-600">{selectedProperty?.fondation || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                      <span className="text-xs text-slate-500">Group</span>
                      <span className="text-sm font-bold text-slate-900">{selectedProperty?.group || 'N/A'}</span>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="p-6 border-t bg-slate-50/50">
              <a 
                href={selectedProperty?.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
              >
                View Details on Official Site
              </a>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
