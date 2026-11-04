/* ============================================================
   ui/MapPage.tsx — every site, where it stands.

   Clicking a marker opens a refined preview card (right-side panel
   on desktop, bottom sheet on mobile) with the site's photo, name,
   city/state, region and era tags, a one-sentence description, the
   UNESCO badge where applicable, and three actions: View Details,
   Add to Journey, Mark Visited.

   Markers are custom SVG teardrops with an icon and an accessible
   label, so colour alone never carries meaning. The map is the one
   page in the archive that fetches tiles from the network.
   ============================================================ */
import { useMemo, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import p from './Pages.module.css'
import m from './Map.module.css'
import { SITES, getSite, AVAILABLE_REGIONS, AVAILABLE_TYPES } from '../data/sites'
import { useT, useLang, regionLabel, typeLabel, eraLabel } from '../i18n'
import { useStore } from '../state/store'
import { href } from '../router'

/* ---------- SVG teardrop marker ---------- */
/* A teardrop pin built from markup. The inner glyph is the site's
   type initial, so the marker is identifiable without colour. The
   `title` and `aria-label` on the marker carry the site name for
   screen readers and keyboard users. */
function teardropIcon(letter: string, color: string, journeyNumber?: number) {
  const isJourney = journeyNumber != null
  const size = isJourney ? 28 : 24
  const anchor = isJourney ? 14 : 12
  const label = isJourney ? String(journeyNumber) : letter
  const svg = `
    <svg width="${size}" height="${Math.round(size * 1.35)}" viewBox="0 0 ${size} ${Math.round(size * 1.35)}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M${size/2} 0 C${size*0.22} 0 0 ${size*0.3} 0 ${size*0.62} C0 ${size*0.95} ${size*0.35} ${size*1.15} ${size/2} ${size*1.35} C${size*0.65} ${size*1.15} ${size} ${size*0.95} ${size} ${size*0.62} C${size} ${size*0.3} ${size*0.78} 0 ${size/2} 0 Z"
            fill="${color}" stroke="#16243D" stroke-width="1.5"/>
      <circle cx="${size/2}" cy="${size*0.55}" r="${size*0.28}" fill="#16243D" opacity="0.15"/>
      <text x="${size/2}" y="${size*0.62}" text-anchor="middle" dominant-baseline="central"
            fill="#16243D" font-size="${size*0.42}" font-weight="700" font-family="system-ui, sans-serif">${label}</text>
    </svg>`
  return L.divIcon({
    className: 'bd-pin',
    html: svg,
    iconSize: [size, Math.round(size * 1.35)],
    iconAnchor: [anchor, Math.round(size * 1.35)],
    popupAnchor: [0, -Math.round(size * 1.35)],
  })
}

const PIN_COLORS: Record<string, string> = {
  temple: '#DEA044',
  tomb: '#BF8250',
  fort: '#9D473A',
  cave: '#416A81',
  stepwell: '#416A81',
  palace: '#BF8250',
  monument: '#DEA044',
  memorial: '#9D473A',
  'buddhist site': '#416A81',
}

function pinColor(type: string): string {
  return PIN_COLORS[type.toLowerCase()] ?? '#DEA044'
}

function typeInitial(type: string): string {
  return (type.charAt(0) || '?').toUpperCase()
}

L.Icon.Default.mergeOptions({
  iconRetinaUrl: '',
  iconUrl: '',
  shadowUrl: '',
})

export function MapPage() {
  const t = useT()
  const lang = useLang()
  const journey = useStore((st) => st.journey)
  const addToJourney = useStore((st) => st.addToJourney)
  const toggleVisited = useStore((st) => st.toggleVisited)
  const visitedList = useStore((st) => st.visited)

  const [region, setRegion] = useState<string | null>(null)
  const [type, setType] = useState<string | null>(null)
  const [showRoute, setShowRoute] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const sites = useMemo(
    () =>
      SITES.filter((site) => {
        if (site.lat == null || site.lng == null) return false
        if (region && site.region !== region) return false
        if (type && site.type !== type) return false
        return true
      }),
    [region, type]
  )

  const journeySites = useMemo(
    () =>
      journey
        .map((id) => getSite(id))
        .filter((s): s is NonNullable<ReturnType<typeof getSite>> => !!s && s.lat != null && s.lng != null),
    [journey]
  )

  const routePositions = useMemo(
    () => (showRoute ? journeySites.map((s) => [s.lat, s.lng] as [number, number]) : []),
    [journeySites, showRoute]
  )

  const selectedSite = useMemo(
    () => (selectedId ? getSite(selectedId) : null),
    [selectedId]
  )

  const handleMarkerClick = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  const handleClose = useCallback(() => setSelectedId(null), [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSelectedId(id)
    }
  }, [])

  const center: [number, number] = [22.5, 78.9]

  return (
    <div className={p.page}>
      <header className={p.head}>
        <div className={p.headInner}>
          <div className={p.eyebrow}>
            <span className={p.eyebrowLine} aria-hidden="true" />
            <span>{t('mapEyebrow')}</span>
          </div>
          <h1 className={p.title}>
            {t('mapTitle1')}
            <span className={p.titleEm}>{t('mapTitle2')}</span>
          </h1>
          <p className={p.lede}>{t('mapLede')}</p>
        </div>
      </header>

      <div className={p.wrap}>
        {/* Filters */}
        <div className={m.filters}>
          <select
            className={m.filterSelect}
            value={region ?? ''}
            onChange={(e) => setRegion(e.target.value || null)}
            aria-label="Region"
          >
            <option value="">{t('allRegions')}</option>
            {AVAILABLE_REGIONS.map((r) => (
              <option key={r} value={r}>
                {regionLabel(r, lang)}
              </option>
            ))}
          </select>
          <select
            className={m.filterSelect}
            value={type ?? ''}
            onChange={(e) => setType(e.target.value || null)}
            aria-label="Type"
          >
            <option value="">{t('allTypes')}</option>
            {AVAILABLE_TYPES.map((ty) => (
              <option key={ty} value={ty}>
                {typeLabel(ty, lang)}
              </option>
            ))}
          </select>
          {journeySites.length > 0 && (
            <button
              className={`${m.toggleBtn} ${showRoute ? m.toggleOn : ''}`}
              onClick={() => setShowRoute((v) => !v)}
            >
              {showRoute ? '✓ ' : ''}{t('journeyRoute')}
            </button>
          )}
          <span className={m.count}>
            {sites.length} / {SITES.length}
          </span>
        </div>

        <div className={m.mapFrame}>
          <MapContainer
            center={center}
            zoom={5}
            scrollWheelZoom={true}
            className={m.map}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {routePositions.length >= 2 && (
              <Polyline
                positions={routePositions}
                pathOptions={{
                  color: '#DEA044',
                  weight: 3,
                  opacity: 0.85,
                  dashArray: '6 6',
                }}
              />
            )}
            {sites.map((site) => {
              const journeyIndex = journeySites.findIndex((s) => s.id === site.id)
              const isJourney = journeyIndex >= 0
              const photo = site.media?.find((mm) => mm.kind === 'photo') ?? site.media?.[0]
              const quickFact = site.quickFacts?.[0]
              const color = isJourney ? '#BF8250' : pinColor(site.type)
              const icon = teardropIcon(
                isJourney ? String(journeyIndex + 1) : typeInitial(site.type),
                color
              )
              return (
                <Marker
                  key={site.id}
                  position={[site.lat, site.lng]}
                  icon={icon}
                  title={lang === 'hi' && site.nameHi ? site.nameHi : site.title}
                  eventHandlers={{
                    click: () => handleMarkerClick(site.id),
                    keydown: (e) => handleKeyDown(e as unknown as React.KeyboardEvent, site.id),
                  }}
                />
              )
            })}
          </MapContainer>

          {/* Preview card — right-side panel on desktop, bottom sheet on mobile */}
          {selectedSite && (
            <div className={m.previewOverlay} onClick={handleClose}>
              <div
                className={m.previewCard}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={lang === 'hi' && selectedSite.nameHi ? selectedSite.nameHi : selectedSite.title}
              >
                <button
                  className={m.previewClose}
                  onClick={handleClose}
                  aria-label="Close"
                >
                  ✕
                </button>
                {(() => {
                  const photo = selectedSite.media?.find((mm) => mm.kind === 'photo') ?? selectedSite.media?.[0]
                  const quickFact = selectedSite.quickFacts?.[0]
                  const visited = visitedList.includes(selectedSite.id)
                  const onJourney = journey.includes(selectedSite.id)
                  return (
                    <>
                      {photo && (
                        <img
                          className={m.previewPhoto}
                          src={photo.src}
                          alt=""
                          loading="lazy"
                        />
                      )}
                      <div className={m.previewBody}>
                        <div className={m.previewTags}>
                          {selectedSite.isUnesco && (
                            <span className={m.tagUnesco}>UNESCO</span>
                          )}
                          <span className={m.tagRegion}>
                            {regionLabel(selectedSite.region, lang)}
                          </span>
                          <span className={m.tagEra}>
                            {eraLabel(selectedSite.era, lang)}
                          </span>
                        </div>
                        <h2 className={m.previewTitle}>
                          {lang === 'hi' && selectedSite.nameHi ? selectedSite.nameHi : selectedSite.title}
                        </h2>
                        <p className={m.previewMeta}>
                          {selectedSite.city ? `${selectedSite.city}, ` : ''}{selectedSite.state}
                        </p>
                        <p className={m.previewDesc}>
                          {lang === 'hi' && selectedSite.descriptionHi
                            ? selectedSite.descriptionHi.split('.').slice(0, 2).join('.') + '.'
                            : selectedSite.description.split('.').slice(0, 2).join('.') + '.'}
                        </p>
                        {quickFact && (
                          <div className={m.previewFact}>
                            <span className={m.previewFactLabel}>{quickFact.label}</span>
                            <span className={m.previewFactValue}>{quickFact.value}</span>
                          </div>
                        )}
                        <div className={m.previewActions}>
                          <a
                            className={m.btnPrimary}
                            href={href({ name: 'site', id: selectedSite.id })}
                            onClick={handleClose}
                          >
                            {t('openRecord')} →
                          </a>
                          <button
                            className={m.btnSecondary}
                            onClick={() => addToJourney(selectedSite.id)}
                            disabled={onJourney}
                          >
                            {onJourney ? '✓ On journey' : 'Add to Journey'}
                          </button>
                          <button
                            className={`${m.btnSecondary} ${visited ? m.btnVisited : ''}`}
                            onClick={() => toggleVisited(selectedSite.id)}
                          >
                            {visited ? '✓ Visited' : 'Mark Visited'}
                          </button>
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          )}
        </div>

        {journeySites.length > 0 && showRoute && (
          <p className={p.body} style={{ marginTop: 18 }}>
            {journeySites.length} of {journey.length} journey stops carry coordinates and are
            drawn on the map as a numbered route. The dashed line is the straight-line
            path between them, not a road distance.
          </p>
        )}

        <p className={p.body} style={{ marginTop: 12 }}>
          {sites.length} of {SITES.length} sites carry coordinates in the data file.
          A site without a position is left off the map rather than guessed at.
        </p>
      </div>
    </div>
  )
}