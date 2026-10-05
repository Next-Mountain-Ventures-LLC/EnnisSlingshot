# Trail map + drive-time data: provenance (maintainers only)

This file is **not imported by any code**. It keeps the research and build notes that used to live inside
the public data files, so they no longer ship in the JS bundle (or in third-party trail-map embeds).

- `client/content/data/trail-map.geojson`: the `sourceNote` property was removed from every feature on 2026-10-05.
  The notes are below. Visitor-facing text stays in the `note` (loops) and `description` (points) properties.
- `client/content/data/drive-times.json`: the per-origin `source` field was removed on 2026-10-05.
  - Original source for every origin: "OSRM demo routing API (router.project-osrm.org), driving profile, no live traffic".
  - On 2026-10-05, Dallas (35 mi / 37 min), Fort Worth (57 / 59), Arlington (52 / 53), Plano (53 / 54), Frisco (64 / 62) and
    Waco (74 / 75) were changed to match the drive-time figures in the page copy, which use typical-traffic times.
    Houston (180 min), Austin (165 min) and San Antonio (240 min) were changed to match the /slingshot-rental/texas/ table
    ("roughly 3 hours", "roughly 2.5–3 hours", "roughly 4 hours"); their mileage is still the OSRM value.
  - The other origins (McKinney, Denton, Irving, Grand Prairie, Mesquite, Waxahachie, Midlothian, Corsicana, Tyler,
    Oklahoma City) are still the OSRM no-traffic values. OSRM's times ran about 8–22% above the page-copy figures where the
    two overlapped.
  - The original OSRM values were: Dallas 34.8 mi / 40 min, Fort Worth 57.2 / 70, Arlington 51.7 / 60, Plano 52.9 / 60,
    Frisco 61.9 / 75, Waco 71.9 / 90, Austin 172.7 / 195, Houston 205.4 / 220, San Antonio 250.8 / 280.

## Trail-map `sourceNote` values (removed from the GeoJSON)

| Feature | Kind | Source note |
|---|---|---|
| West Bluebonnet Trail | loop `west` | Roads traced from the official 2018 Ennis Bluebonnet Trails & Festival map (Ennis Garden Club, bluebonnettrail.org) in waypoint order, then snapped to real roads with OSRM. Turn sequence may differ from the current-year map. |
| North Bluebonnet Trail | loop `north` | Roads traced from the official 2018 Ennis Bluebonnet Trails & Festival map (Ennis Garden Club, bluebonnettrail.org) in waypoint order, then snapped to real roads with OSRM. Turn sequence may differ from the current-year map. |
| South Bluebonnet Trail | loop `south` | Roads traced from the official 2018 Ennis Bluebonnet Trails & Festival map (Ennis Garden Club, bluebonnettrail.org) in waypoint order, then snapped to real roads with OSRM. Turn sequence may differ from the current-year map. |
| Slingshot Scenic Loop | loop `slingshot-route` | Curated for ennisslingshot.com: Welcome Center → Sugar Ridge Rd/Sugar Ridge Winery → Lakeview Dr/Lake Bardwell → Meadow View Nature Area → Welcome Center, routed on real roads with OSRM. Distance is OSRM's driving estimate. |
| Ennis Welcome Center | point `welcome-center` | Meeting-point coordinate (shared/business.ts geo); https://www.bluebonnettrail.org/trailmap |
| Meadow View Nature Area | point `photo-spot` | Nominatim geocode of Laneview Dr (the nature area itself isn't indexed by name); official 2018 Ennis Bluebonnet Trails map |
| Bluebonnet Park | point `park` | Nominatim geocode |
| Sugar Ridge Winery | point `winery` | Sugar Ridge Rd centroid near Bristol (street address didn't geocode in Nominatim); official 2018 Ennis Bluebonnet Trails map |
| Lakeview Drive / Lake Bardwell Area | point `photo-spot` | Nominatim geocode |
| Downtown Ennis Parking | point `parking` | Nominatim geocode |
