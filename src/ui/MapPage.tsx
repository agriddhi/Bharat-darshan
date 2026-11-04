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
import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import p from './Pages.module.css'
import m from './Map.module.css'
import { SITES } from '../data/sites'
import { useT, useLang } from '../i18n'
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

L.Icon.Default.mergeOptions({
  iconRetinaUrl: '',
  iconUrl: '',
  shadowUrl: '',
})

export function MapPage() {
  const t = useT()
  const lang = useLang()

  const sites = useMemo(
    () => SITES.filter((site) => site.lat != null && site.lng != null),
    []
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
            {sites.map((site) => (
              <Marker key={site.id} position={[site.lat, site.lng]} icon={PIN}>
                <Popup>
                  <div className={m.popup}>
                    <div className={m.popupTitle}>
                      {lang === 'hi' && site.nameHi ? site.nameHi : site.title}
                    </div>
                    <div className={m.popupMeta}>
                      {site.state} · {site.region}
                    </div>
                    <a className={m.popupLink} href={href({ name: 'site', id: site.id })}>
                      {t('openRecord')} →
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <p className={p.body} style={{ marginTop: 18 }}>
          {sites.length} of {SITES.length} sites carry coordinates in the data file.
          A site without a position is left off the map rather than guessed at.
        </p>
      </div>
    </div>
  )
}