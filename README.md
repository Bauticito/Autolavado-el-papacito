# Autolavado Express El Papacito

Landing page premium. HTML5 + CSS3 + JS vanilla. Deploy en Vercel.

## Deploy

1. Subir este repo a GitHub
2. Conectar en [vercel.com](https://vercel.com)
3. Listo

## Editar horarios sin tocar código

1. Creá un **Google Sheet** público con dos columnas:

| A | B |
|---|---|
| openDays | 0,1,2,3,4,5,6 |
| openHour | 8 |
| closeHour | 20 |
| slotInterval | 60 |

- `openDays`: 0 = domingo, 1 = lunes, ..., 6 = sábado. Separado por comas.
- `openHour` / `closeHour`: hora de apertura y cierre (ej: 8, 21).
- `slotInterval`: minutos entre turnos (ej: 60).

2. **Publicá el sheet**: Archivo → Compartir → Publicar en la Web → CSV → Publicar.

3. Copiá el **ID del sheet** de la URL:
   `https://docs.google.com/spreadsheets/d/**ESTE-ES-EL-ID**/edit`

4. Pegalo en `script.js`, línea 26:
   ```js
   var SCHEDULE_SHEET_ID = 'TU_ID_AQUI';
   ```

5. Redeploy en Vercel. Cada vez que edites el Sheet, la página se actualiza sola en < 5 min.

## Editar servicios/precios

En `script.js`, objeto `CONFIG`:

```js
services: [
  { name: 'A domicilio', price: '$100' },
  { name: 'On site',     price: '$150' },
washDuration: 30   // minutos por lavado
```

## Números y dirección

```js
business: { phone: '524491063865', ... },
address: { mapsUrl: 'https://maps.app.goo.gl/...', ... }
```

Cada reserva incluye un link de Google Calendar automático en el mensaje de WhatsApp.
