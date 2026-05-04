'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Input } from './ui/input';
import { Button } from './ui/button';
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
      className={`p-6 cursor-pointer border-b border-black/10 transition-colors group ${selectedProperty?.id === p.id ? 'bg-black text-white' : 'hover:bg-black hover:text-white'}`}
    >
      <h3 className="font-black uppercase leading-none text-sm">
        {p.name || p.address}
      </h3>
      <div className="flex items-start gap-1.5 mt-2 opacity-60">
        <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
        <p className="text-[10px] font-medium leading-relaxed">{p.address}</p>
      </div>
      {p.localite && !groupByLocalite && (
        <div className="mt-3 flex gap-2">
          <div className="text-[9px] px-1.5 py-0.5 border-2 border-current font-bold uppercase">
            {p.localite}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <header className="h-16 border-b-swiss border-black flex items-center px-6 justify-between bg-white z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="font-black text-2xl tracking-tighter text-black uppercase">GENEVA MAP</div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-3">
            <Switch 
              id="group-by-localite" 
              checked={groupByLocalite} 
              onCheckedChange={setGroupByLocalite} 
            />
            <Label htmlFor="group-by-localite" className="text-[10px] font-bold uppercase tracking-widest text-black cursor-pointer">
              GROUP BY LOCALITÉ
            </Label>
          </div>
          
          <div className="bg-black text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
            {filtered.length} PROPERTIES
          </div>
        </div>
      </header>

      <div className="h-14 border-b-swiss border-black flex items-center px-6 gap-4 bg-white z-10 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Input 
            placeholder="SEARCH PROPERTIES..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="h-10 border-swiss border-black bg-white focus:ring-0 px-4 font-black placeholder:text-black/30" 
          />
        </div>
        <NativeSelect 
          value={selectedLocalite} 
          onChange={(e) => setSelectedLocalite(e.target.value)} 
          className="h-10 min-w-[180px] border-swiss border-black bg-white uppercase font-black"
        >
           <option value="all">ALL LOCALITÉS</option>
           {localites.sort().map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
        </NativeSelect>
        <NativeSelect 
          value={selectedFondation} 
          onChange={(e) => setSelectedFondation(e.target.value)} 
          className="h-10 min-w-[180px] border-swiss border-black bg-white uppercase font-black"
        >
           <option value="all">ALL FONDATIONS</option>
           {fondations.sort().map((f) => <option key={f} value={f}>{f.toUpperCase()}</option>)}
        </NativeSelect>
        <Button className="h-10 px-6 bg-black text-white font-black uppercase tracking-widest hover:bg-black/90 transition-none">
          REFINE RESULTS
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 overflow-y-auto border-r-swiss border-black bg-white z-30">
          <div className="p-6 border-b-swiss border-black">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
              Filtered Results ({filtered.length})
            </h2>
          </div>
          {filtered.length > 0 ? (
            <div className="divide-y divide-black/10">
              {Object.entries(groupedProperties).map(([groupName, groupItems]) => (
                <div key={groupName}>
                  {groupByLocalite && (
                    <div className="bg-slate-50 px-5 py-2 sticky top-0 z-10 border-b-swiss border-black flex items-center gap-2">
                      <Layers className="w-3 h-3 opacity-30" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{groupName}</span>
                      <div className="ml-auto text-[10px] font-black px-1 border-2 border-black/20">
                        {groupItems.length}
                      </div>
                    </div>
                  )}
                  <div className="divide-y divide-black/10">
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
        <SheetContent side="right" className="sm:max-w-md p-0 gap-0 border-l-[3px] border-black shadow-none mt-16 !h-[calc(100vh-4rem)]">
          <SheetDescription className="sr-only">
            Details and information about the selected property.
          </SheetDescription>
          <div className="h-full flex flex-col bg-white">
            <div className="relative h-72 bg-black shrink-0">
              {selectedProperty?.image_url ? (
                <Image 
                  src={selectedProperty.image_url} 
                  alt={selectedProperty.name || selectedProperty.address} 
                  fill
                  unoptimized
                  className="w-full h-full object-cover grayscale opacity-80"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white bg-black">
                  <Building2 className="w-12 h-12 mb-2 opacity-20" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">No photo available</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <SheetHeader className="p-0 space-y-0">
                  <SheetTitle className="text-4xl font-black uppercase tracking-tighter leading-none text-white">
                    {selectedProperty?.name || selectedProperty?.address}
                  </SheetTitle>
                </SheetHeader>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10">
              <div className="space-y-12">
                <section>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-black mb-6 border-b-swiss border-black pb-2 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" /> Location Details
                  </h4>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[9px] font-bold uppercase opacity-40 mb-1">Full Address</p>
                      <p className="text-base font-black leading-tight">{selectedProperty?.address}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-black/10">
                      <div>
                        <p className="text-[9px] font-bold uppercase opacity-40 mb-1">Localité</p>
                        <p className="text-sm font-black uppercase">{selectedProperty?.localite || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase opacity-40 mb-1">Units</p>
                        <div className="flex items-center gap-1.5 text-sm font-black uppercase">
                          <Users className="w-4 h-4" />
                          {selectedProperty?.units || 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-black mb-6 border-b-swiss border-black pb-2 flex items-center gap-2">
                    <Landmark className="w-3.5 h-3.5" /> Management
                  </h4>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-5 border-swiss border-black">
                      <span className="text-[10px] font-bold uppercase opacity-40">Fondation</span>
                      <span className="text-sm font-black uppercase">{selectedProperty?.fondation || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between p-5 border-swiss border-black">
                      <span className="text-[10px] font-bold uppercase opacity-40">Group</span>
                      <span className="text-sm font-black uppercase">{selectedProperty?.group || 'N/A'}</span>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="p-8 border-t-swiss border-black bg-white">
              <a 
                href={selectedProperty?.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center w-full bg-black text-white font-black py-5 uppercase tracking-[0.2em] text-xs hover:bg-slate-900 transition-colors"
              >
                Visit Official Site
              </a>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
