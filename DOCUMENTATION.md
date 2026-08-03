# Autolavado Express El Papacito — Documentación Completa

> **Última actualización:** 2026-08-03  
> **URL producción:** https://autolavado-el-papacito.vercel.app  
> **GitHub:** https://github.com/Bauticito/Autolavado-el-papacito  
> **Sucursal:** https://autolavado-el-papacito.vercel.app/sucursal

---

## Arquitectura

```
autolavado-el-papacito/
├── index.html              ← Landing principal (108 líneas)
├── sucursal.html           ← Página de franquicia (46 líneas)
├── styles.css              ← Todos los estilos (332 líneas)
├── script.js               ← Lógica frontend (370 líneas)
├── sw.js                   ← Service Worker PWA (40 líneas)
├── manifest.json           ← PWA installable
├── vercel.json             ← Config de Vercel (headers, redirects, functions)
├── package.json            ← Dependencias npm
├── robots.txt              ← SEO crawlers
├── sitemap.xml             ← SEO index
├── README.md               ← Documentación básica
├── .gitignore
├── api/
│   ├── track.js            ← Contador de visitas (serverless)
│   └── meta/
│       ├── events.js       ← Meta CAPI (Conversion API)
│       └── catalog.js      ← Catálogo de productos Meta
└── assets/
    ├── logo.mp4            ← Video de fondo (6.9 MB, 1080p sin audio)
    ├── logo.png            ← Logo para OG/previews (110 KB)
    ├── negociador.mp4      ← Video fondo sucursal (11.4 MB)
    ├── icon-192.png        ← Icono PWA 192×192
    └── icon-512.png        ← Icono PWA 512×512
```

**Stack:** HTML5 + CSS3 + JavaScript vanilla. Sin framework, sin build step, sin bundler. Deploy estático en Vercel con funciones serverless en `/api/`.

---

## Funcionalidades implementadas

| Funcionalidad | Detalle |
|---------------|---------|
| **Landing con video** | Video `logo.mp4` como fondo fullscreen con overlay oscuro, `object-fit: cover` |
| **Status dinámico** | "Disponible hoy" / "Disponible mañana" / "Abrimos a las 08:00" automático, refresh cada 60s |
| **Servicios clickeables** | "A domicilio" $100 / "On site" $150 — selección con feedback visual, toggle |
| **Gantt timeline** | Slots horarios de 08:00 a 19:00 (closeHour configurable), pasados grises, futuros dorados |
| **Reserva → WhatsApp** | Mensaje pre-armado con: servicio, fecha, hora, duración, link de Google Calendar |
| **Google Calendar** | Link de evento autogenerado con hora y duración, timezone America/Mexico_City |
| **Página sucursal** | `/sucursal` con video negociador.mp4, CTA a WhatsApp |
| **SEO** | Meta tags, OG, Twitter card, JSON-LD LocalBusiness, sitemap.xml, robots.txt, canonical |
| **Responsive** | 4 breakpoints: 360px, 600px, 800px, 1000px |
| **PWA** | Service worker cache-first, manifest standalone, iconos 192 y 512 |
| **Vercel Analytics** | Scripts de Web Analytics + Speed Insights |
| **Facebook Pixel** | Client-side `fbq` con ID `1309829625537659` |
| **Meta CAPI** | Server-side `/api/meta/events` y `/api/meta/catalog` |
| **Tracking visitas** | `/api/track` (contador en memoria, ventana 1h, alerta en 50+) |
| **Config dinámica** | `CONFIG` en script.js como fuente única de verdad + Google Sheets opcional |
| **Security headers** | X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, cache immutable en assets |

---

## Bugs encontrados

### 🔴 Críticos

| # | Archivo:Línea | Descripción |
|---|---------------|-------------|
| 1 | `script.js:206-230` | **Calendar link usa fecha de hoy para slots de mañana.** Si el slot dice "Mañana 08:00", el link de Google Calendar se genera con la fecha de HOY. |
| 2 | `script.js:250-251` | **WhatsApp message usa fecha de hoy para slots de mañana.** Mismo bug, distinto lugar. |
| 3 | `api/meta/events.js:40` | **Token de Meta en URL query string.** `?access_token=...` expone el token en logs de Vercel, Facebook, y proxies. |
| 4 | `api/meta/catalog.js:19` | **Mismo token-en-URL.** |

### 🟠 Altos

| # | Archivo:Línea | Descripción |
|---|---------------|-------------|
| 5 | `sw.js:8-10` | **Precaching de videos grandes (18 MB).** `cache.addAll` es atómico: si un video falla, nada se cachea. |
| 6 | `index.html:51` | **Video 6.9 MB sin `poster`.** Flash negro antes del primer frame. Destruye LCP. |
| 7 | `sucursal.html:34` | **Video 11.4 MB sin optimizar.** |
| 8 | `script.js:46` | **Loop infinito si `slotInterval ≤ 0`.** `for(m=0; m<totalMin; m+=0)` no termina. |
| 9 | `script.js:43-52` | **`buildSlots()` vacío si `closeHour ≤ openHour`.** Página sin slots, sin error. |
| 10 | `script.js:285` | **CSV parsing naïve.** `split(',')` rompe con valores que contienen comas (Google Sheets los escapa con comillas). |
| 11 | `script.js:200-201` | **`DAYS_CAPS[d].substring(0,3)` crashea si `openDays` tiene índice fuera de rango.** |

### 🟡 Medios

| # | Archivo:Línea | Descripción |
|---|---------------|-------------|
| 12 | `api/track.js:13` | **Alerta nunca consumida.** `var alert = count >= 50` se calcula pero `script.js:351` descarta el response. |
| 13 | `styles.css:173-189` | **Contraste WCAG AA fallido.** Bloques gantt activos 2.3:1, pasados 1.3:1 (mínimo requerido 3:1). |
| 14 | `sw.js:32-39` | **`activate` no llama `self.clients.claim()`.** El SW nuevo no controla páginas ya abiertas. |
| 15 | `script.js:95` | **Service cards no son navegables por teclado.** `onclick` en `<div>` sin `tabindex` ni `role="button"`. |
| 16 | `script.js:117` | **Gantt blocks no navegables por teclado.** Mismo problema. |
| 17 | `api/meta/catalog.js:14-16` | **Catálogo hardcodeado.** Si cambian precios en CONFIG, el catálogo Meta queda desincronizado. |
| 18 | `vercel.json:21` | **Header `X-XSS-Protection` deprecado.** Chrome lo removió en 2019. Usar CSP en su lugar. |
| 19 | `vercel.json` | **Sin Content-Security-Policy.** XSS no tiene mitigación. |
| 20 | `vercel.json` | **Sin Strict-Transport-Security (HSTS).** |

---

## Estado de Meta / Facebook

| Componente | Estado |
|------------|--------|
| **Facebook Pixel client-side (fbq)** | ✅ Funcionando. ID: `1309829625537659` |
| **Meta CAPI server-side** | ❌ Roto. `META_ACCESS_TOKEN` no está configurado en Vercel. |
| **Catálogo de productos** | ❌ Roto + nunca llamado desde el frontend. |
| **Facebook Page** | ❌ No existe. `61592788830802` es un perfil personal, no una Page. |
| **Ad Account** | ❌ No configurado. |
| **WhatsApp Business API** | ✅ Token con permisos `whatsapp_business_management` y `messaging`. |

### Para completar Meta

1. Crear una Facebook Page real (facebook.com/pages/create) o convertir perfil a modo profesional
2. Verificar Pixel ID en business.facebook.com/settings/pixels
3. Generar token con permisos `pages_show_list`, `pages_manage_posts`, `ads_management`
4. Setear `META_ACCESS_TOKEN` en Vercel → Settings → Environment Variables
5. Mover token del URL query string al header `Authorization: Bearer`
6. Agregar `event_id` para deduplicación browser pixel + CAPI
7. Hashear user data (SHA256) antes de enviar a CAPI

---

## Problemas de seguridad

| # | Severidad | Ubicación | Descripción |
|---|-----------|-----------|-------------|
| 1 | 🔴 CRÍTICO | `api/meta/events.js:40` | Token Meta en URL. Expuesto en logs. |
| 2 | 🔴 CRÍTICO | `api/meta/catalog.js:19` | Ídem. |
| 3 | 🟠 ALTO | `vercel.json` | Sin Content-Security-Policy. |
| 4 | 🟠 ALTO | `api/meta/events.js:25-26` | Acepta email/phone arbitrario del body sin auth. |
| 5 | 🟠 ALTO | `api/meta/catalog.js` | Sin autenticación. Cualquiera puede POSTear. |
| 6 | 🟡 MEDIO | `.gitignore` | Falta `.env*`. Credenciales podrían commitearse accidentalmente. |
| 7 | 🟡 MEDIO | `index.html, events.js, catalog.js` | Pixel ID hardcodeado en 4 lugares. |
| 8 | 🟡 MEDIO | `api/meta/events.js:50-53` | Error messages expuestos al cliente. |

---

## Problemas de performance

| # | Severidad | Archivo | Descripción |
|---|-----------|---------|-------------|
| 1 | 🔴 CRÍTICO | `index.html:51` | `logo.mp4` 6.9 MB cargado en page load. LCP destruido. |
| 2 | 🔴 CRÍTICO | `sucursal.html:34` | `negociador.mp4` 11.4 MB. |
| 3 | 🟠 ALTO | `sw.js:8-10` | Videos en precache list (18 MB total). Puede exceder quota. |
| 4 | 🟠 ALTO | `index.html:51` | Sin `poster` en video. Flash negro. |
| 5 | 🟡 MEDIO | `assets/logo.png` | 110 KB PNG. Debería ser WebP (~20 KB) o AVIF. |
| 6 | 🟡 MEDIO | `index.html:34` | Google Fonts 4 weights render-blocking. |

---

## Duplicación de datos

| Dato | Lugares donde aparece |
|------|----------------------|
| Teléfono `524491063865` | `script.js:4`, `sucursal.html:42` |
| Pixel ID `1309829625537659` | `index.html:43`, `events.js:2`, `catalog.js:2` |
| Dominio `autolavado-el-papacito.vercel.app` | `robots.txt:3`, `sitemap.xml:4,10`, `events.js:17` |
| Servicios + precios | `script.js:19-20`, `catalog.js:14-16` |

---

## Lo que NO está hecho

| Tarea | Estado |
|-------|--------|
| **Facebook Page** — crear o convertir perfil | Pendiente |
| **META_ACCESS_TOKEN** — setear en Vercel | Pendiente |
| **Vercel Analytics** — activar en dashboard | Pendiente (2 clicks) |
| **Vercel Speed Insights** — activar en dashboard | Pendiente (2 clicks) |
| **Custom domain** — dominio propio | Pendiente |
| **CSP header** — Content-Security-Policy | Pendiente |
| **Fix fecha mañana** — Calendar link y WhatsApp msg | Pendiente |
| **Fix token en URL** — mover a header Authorization | Pendiente |
| **Fix contraste gantt** — WCAG AA | Pendiente |
| **Keyboard navigation** — focus styles + tabindex | Pendiente |
| **Google Sheets** — SCHEDULE_SHEET_ID = null, nunca se usó | Pendiente |
| **Google My Business** — listing en Maps | Pendiente |
| **Instagram** — cuenta conectada | Pendiente |

---

## Git

```
master: 16 commits
staging: sincronizado con master
Último deploy: automático en cada push a master
```

---

## Cómo editar

Todo lo configurable está en `script.js`:

```js
var CONFIG = {
  business: { phone: '524491063865', ... },
  schedule: { openDays: [0,1,2,3,4,5,6], openHour: 8, closeHour: 20, slotInterval: 60 },
  services: [{ name: 'A domicilio', price: '$100' }, { name: 'On site', price: '$150' }],
  washDuration: 30
};
```

Cambios en CONFIG → `git push` → Vercel redeploya automáticamente.

---

## Resumen numérico

| Métrica | Valor |
|---------|-------|
| Archivos fuente (sin node_modules) | 15 |
| Bugs encontrados | 14 |
| Issues de seguridad | 10 |
| Issues de performance | 8 |
| Issues de accesibilidad | 10 |
| Código muerto | 6 |
| Datos duplicados | 6 |
| **Total issues** | **54** |
