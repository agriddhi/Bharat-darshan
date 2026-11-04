/* ============================================================
   ui/MapPage.tsx — every site, where it stands.

   The one page in this archive that is not a pure function of the
   data file: it fetches map tiles from OpenStreetMap on demand. The
   pins themselves, their popups and their links are all derived from
   src/data/sites.json, so a site added to the file appears on the
   map without any change here.

   Leaflet is imported only by this page, so a reader who never opens
   the map pays nothing for it.
   ============================================================ */
import { useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import p from './Pages.module.css'
import m from './Map.module.css'
import { SITES, getSite, AVAILABLE_REGIONS, AVAILABLE_TYPES } from '../data/sites'
import { useT, useLang, regionLabel, typeLabel } from '../i18n'
import { useStore } from '../state/store'
import { href } from '../router'

/* A small ochre dot, so the pins match the rest of the interface
   instead of Leaflet's default blue teardrop. Building the icon from
   markup avoids shipping the marker image files. */
const PIN = L.divIcon({
  className: 'bd-pin',
  html: '<span class="bd-pin-dot"></span>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -10],
})

/* A larger, numbered pin for journey stops, so the route reads as
   an ordered sequence rather than a set of dots. */
function journeyPin(n: number) {
  return L.divIcon({
    className: 'bd-pin bd-pin-journey',
    html: `<span class="bd-pin-dot bd-pin-dot-journey">${n}</span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -14],
  })
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

  const [region, setRegion] = useState<string | null>(null)
  const [type, setType] = useState<string | null>(null)
  const [showRoute, setShowRoute] = useState(true)

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

  // Resolve the journey ids to sites, in order, keeping only those
  // that actually carry coordinates. The polyline connects them.
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

        <div className={m.frame}>
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
            {/* Journey route, drawn first so the pins sit on top. */}
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
              return (
                <Marker
                  key={site.id}
                  position={[site.lat, site.lng]}
                  icon={isJourney ? journeyPin(journeyIndex + 1) : PIN}
                >
                  <Popup>
                    <div className={m.popup}>
                      {photo && (
                        <img
                          className={m.popupPhoto}
                          src={photo.src}
                          alt=""
                          loading="lazy"
                        />
                      )}
                      <div className={m.popupTitle}>
                        {lang === 'hi' && site.nameHi ? site.nameHi : site.title}
                      </div>
                      <div className={m.popupMeta}>
                        {site.state} · {site.region}
                      </div>
                      {quickFact && (
                        <div className={m.popupFact}>
                          <span className={m.popupFactLabel}>
                            {quickFact.label}
                          </span>
                          <span className={m.popupFactValue}>
                            {quickFact.value}
                          </span>
                        </div>
                      )}
                      <a className={m.popupLink} href={href({ name: 'site', id: site.id })}>
                        {t('openRecord')} →
                      </a>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
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