var CONFIG = {
  business: {
    name: 'Autolavado Express El Papacito',
    phone: '524491063865',
    phoneDisplay: '449 106 3865'
  },
  address: {
    line: 'Av San Felipe 129',
    city: 'Aguascalientes',
    mapsUrl: 'https://maps.app.goo.gl/6eMeCjffU7poGz2CA'
  },
  schedule: {
    openDays: [0,1,2,3,4,5,6],
    openHour: 8,
    closeHour: 22,
    slotInterval: 60
  },
  services: [
    { name: 'A domicilio', price: '$100' },
    { name: 'On site', price: '$150' }
  ],
  washDuration: 30
};

var SCHEDULE_SHEET_ID = null;

var DAYS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
var DAYS_CAPS = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

function getNextOpenDay(from){
  from = from !== undefined ? from : new Date().getDay();
  for(var i=0; i<7; i++){
    var d = (from + i) % 7;
    if(CONFIG.schedule.openDays.indexOf(d) !== -1) return d;
  }
  return from;
}

function getNextOpenDayName(from){
  return DAYS_CAPS[getNextOpenDay(from)];
}

function buildSlots(){
  var out = [];
  var totalMin = (CONFIG.schedule.closeHour - CONFIG.schedule.openHour) * 60;
  for(var m=0; m<totalMin; m+=CONFIG.schedule.slotInterval){
    var h = CONFIG.schedule.openHour + Math.floor(m/60);
    var mm = m % 60;
    out.push((h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm);
  }
  return out;
}

var selectedService = null;

function selectService(name, el){
  if(selectedService === name){
    selectedService = null;
    el.classList.remove('selected');
    updateSlotHeader();
    return;
  }
  var opts = document.querySelectorAll('.service-option');
  for(var i=0; i<opts.length; i++) opts[i].classList.remove('selected');
  selectedService = name;
  el.classList.add('selected');
  updateSlotHeader();
}

function updateSlotHeader(){
  var h = document.querySelector('.booking .section-title');
  if(!h) return;
  h.textContent = selectedService ? 'Elige tu turno — ' + selectedService : 'Elige tu turno';
}

function renderServices(){
  var c = document.getElementById('services-container');
  if(!c) return;
  var h = '<div class="services-row">';
  for(var i=0; i<CONFIG.services.length; i++){
    var s = CONFIG.services[i];
    h += '<div class="service-option" onclick="selectService(\''+s.name+'\',this)"><span class="svc-name">'+s.name+'</span><span class="svc-price">'+s.price+'</span></div>';
  }
  h += '</div>';
  c.innerHTML = h;
}

function renderSlots(){
  var c = document.getElementById('slots-container');
  if(!c) return;
  var slots = buildSlots();
  var now = new Date();
  var d = now.getDay();
  var curH = now.getHours();
  var curM = now.getMinutes();
  var isOpenNow = CONFIG.schedule.openDays.indexOf(d) !== -1 && curH >= CONFIG.schedule.openHour && curH < CONFIG.schedule.closeHour;

  var h = '<div class="gantt-track">';
  for(var i=0; i<slots.length; i++){
    var t = slots[i];
    var parts = t.split(':');
    var slotH = parseInt(parts[0],10);
    var slotM = parseInt(parts[1],10) || 0;
    var past = isOpenNow && (curH > slotH || (curH === slotH && curM > slotM));
    h += '<div class="'+(past?'gantt-block past':'gantt-block')+'" data-time="'+t+'" title="'+getSlotLabel(t)+'" onclick="reservar(\''+t+'\')"></div>';
  }
  h += '</div><div class="gantt-labels">';
  for(var j=0; j<slots.length; j++){
    h += '<span class="gantt-label">'+slots[j]+'</span>';
  }
  h += '</div>';
  c.innerHTML = h;
}

function refreshSlots(){
  var blocks = document.querySelectorAll('.gantt-block[data-time]');
  var now = new Date();
  var d = now.getDay();
  var curH = now.getHours();
  var curM = now.getMinutes();
  var isOpenNow = CONFIG.schedule.openDays.indexOf(d) !== -1 && curH >= CONFIG.schedule.openHour && curH < CONFIG.schedule.closeHour;
  for(var i=0; i<blocks.length; i++){
    if(blocks[i].disabled) continue;
    var t = blocks[i].getAttribute('data-time');
    var parts = t.split(':');
    var slotH = parseInt(parts[0],10);
    var slotM = parseInt(parts[1],10) || 0;
    var past = isOpenNow && (curH > slotH || (curH === slotH && curM > slotM));
    if(past) blocks[i].classList.add('past');
    else blocks[i].classList.remove('past');
  }
}

function getSlotLabel(time){
  var parts = time.split(':');
  var slotH = parseInt(parts[0],10);
  var slotM = parseInt(parts[1],10) || 0;
  var now = new Date();
  var d = now.getDay();
  var curH = now.getHours();
  var curM = now.getMinutes();

  var isOpen = CONFIG.schedule.openDays.indexOf(d) !== -1;
  var slotFuture = (curH < slotH || (curH === slotH && curM <= slotM));
  var shopNotClosed = curH < CONFIG.schedule.closeHour;

  if(isOpen && shopNotClosed && slotFuture) return 'Hoy ' + time;

  var next = getNextOpenDay(isOpen ? d+1 : d);
  if(next === d) return 'Hoy ' + time;
  if(next === (d+1)%7) return 'Mañana ' + time;
  return DAYS_CAPS[next] + ' ' + time;
}

function updateStatus(){
  var now = new Date();
  var d = now.getDay();
  var curH = now.getHours();
  var statusEl = document.getElementById('status-text');
  var statusContainer = document.querySelector('.status');
  if(!statusEl || !statusContainer) return;

  var isOpenToday = CONFIG.schedule.openDays.indexOf(d) !== -1;
  var isOpenNow = isOpenToday && curH >= CONFIG.schedule.openHour && curH < CONFIG.schedule.closeHour;

  if(isOpenNow){
    statusEl.textContent = 'Disponible hoy';
    statusContainer.classList.remove('closed');
    return;
  }

  statusContainer.classList.add('closed');

  if(isOpenToday && curH < CONFIG.schedule.openHour){
    statusEl.textContent = 'Abrimos a las ' + (CONFIG.schedule.openHour<10?'0':'') + CONFIG.schedule.openHour + ':00';
    return;
  }

  statusEl.textContent = 'Cerrado — Abrimos el ' + DAYS_CAPS[getNextOpenDay(d+1)];
}

function updateFooterHours(){
  var el = document.getElementById('footer-hours');
  if(!el) return;
  var daysLabel = CONFIG.schedule.openDays.length === 7
    ? 'Todos los días'
    : CONFIG.schedule.openDays.map(function(d){return DAYS_CAPS[d].substring(0,3)}).join(', ');
  el.textContent = daysLabel + ' · ' +
    (CONFIG.schedule.openHour<10?'0':'') + CONFIG.schedule.openHour + ':00 – ' +
    (CONFIG.schedule.closeHour<10?'0':'') + CONFIG.schedule.closeHour + ':00';
}

function buildCalendarLink(hora){
  var now = new Date();
  var y = now.getFullYear();
  var mo = now.getMonth() + 1;
  var d = now.getDate();
  var parts = hora.split(':');
  var h = parseInt(parts[0],10);
  var m = parseInt(parts[1],10) || 0;

  var endH = h;
  var endM = m + CONFIG.washDuration;
  if(endM >= 60){ endH++; endM -= 60; }

  function pad(n){ return n < 10 ? '0' + n : n; }

  var start = '' + y + pad(mo) + pad(d) + 'T' + pad(h) + pad(m) + '00';
  var end   = '' + y + pad(mo) + pad(d) + 'T' + pad(endH) + pad(endM) + '00';

  return 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent('Lavado — El Papacito') +
    '&dates=' + start + '/' + end +
    '&details=' + encodeURIComponent('Reserva de turno\n') +
    '&location=' + encodeURIComponent(CONFIG.address.line + ', ' + CONFIG.address.city) +
    '&ctz=America/Mexico_City';
}

function reservar(hora){
  if(!selectedService){
    var svcFirst = document.querySelector('.service-option');
    if(svcFirst) svcFirst.scrollIntoView({behavior:'smooth'});
    return;
  }

  var buttons = document.querySelectorAll('.gantt-block[data-time]');
  var clicked = null;
  for(var i=0; i<buttons.length; i++){
    if(buttons[i].getAttribute('data-time') === hora){ clicked = buttons[i]; break; }
  }
  if(!clicked || clicked.disabled) return;

  clicked.disabled = true;
  clicked.classList.add('booking');

  var now = new Date();
  var fecha = now.toLocaleDateString('es-MX',{ weekday:'long', day:'2-digit', month:'long' });
  var calLink = buildCalendarLink(hora);

  var mensaje =
    'Hola, quiero reservar un turno en Autolavado Express El Papacito.\n\n' +
    'Servicio: ' + selectedService + '\n' +
    'Fecha: ' + fecha + '\n' +
    'Hora: ' + hora + ' (∼' + CONFIG.washDuration + ' min)\n\n' +
    '¿Está disponible?\n\n' +
    '📅 Calendario: ' + calLink;

  setTimeout(function(){
    clicked.classList.remove('booking');
    clicked.classList.add('booked');
    window.open('https://wa.me/' + CONFIG.business.phone + '?text=' + encodeURIComponent(mensaje), '_blank');

    setTimeout(function(){
      clicked.classList.remove('booked');
      clicked.disabled = false;
    }, 3500);
  }, 300);
}

function fetchSchedule(){
  if(!SCHEDULE_SHEET_ID) return Promise.resolve(null);
  return fetch('https://docs.google.com/spreadsheets/d/' + SCHEDULE_SHEET_ID + '/pub?gid=0&single=true&output=csv')
    .then(function(r){ return r.text(); })
    .then(function(csv){
      var lines = csv.trim().split('\n');
      var data = {};
      for(var i=0; i<lines.length; i++){
        var cols = lines[i].split(',');
        if(cols.length < 2) continue;
        var key = cols[0].trim();
        var val = cols[1].trim();
        if(key === 'openDays') data.openDays = val.split(',').map(function(v){return parseInt(v,10)});
        else if(key === 'openHour') data.openHour = parseInt(val,10);
        else if(key === 'closeHour') data.closeHour = parseInt(val,10);
        else if(key === 'slotInterval') data.slotInterval = parseInt(val,10);
      }
      return data;
    });
}

(function init(){
  var btnWa = document.getElementById('btn-whatsapp');
  var btnCall = document.getElementById('btn-call');
  var floatingWa = document.getElementById('floating-wa');
  var mapsLink = document.getElementById('maps-link');

  function getWaUrl(txt){ return 'https://wa.me/' + CONFIG.business.phone + '?text=' + encodeURIComponent(txt || 'Hola'); }
  function getTelUrl(){ return 'tel:+' + CONFIG.business.phone; }

  if(btnWa) btnWa.href = getWaUrl('Hola, quiero agendar un lavado de auto');
  if(btnCall) btnCall.href = getTelUrl();
  if(floatingWa) floatingWa.href = getWaUrl('Hola, quiero información');
  if(mapsLink) mapsLink.href = CONFIG.address.mapsUrl;

  var base = window.location.origin;
  var canonicalUrl = base + window.location.pathname;
  var canonical = document.createElement('link');
  canonical.rel = 'canonical';
  canonical.href = canonicalUrl;
  document.head.appendChild(canonical);

  var ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context':'https://schema.org',
    '@type':'LocalBusiness',
    name:CONFIG.business.name,
    image:base+'/assets/logo.png',
    description:'Lavado de autos premium en Aguascalientes.',
    url:canonicalUrl,
    telephone:'+'+CONFIG.business.phone,
    address:{'@type':'PostalAddress',streetAddress:CONFIG.address.line,addressLocality:CONFIG.address.city,addressCountry:'MX'},
    openingHoursSpecification:[{
      '@type':'OpeningHoursSpecification',
      dayOfWeek:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
      opens:(CONFIG.schedule.openHour<10?'0':'')+CONFIG.schedule.openHour+':00',
      closes:(CONFIG.schedule.closeHour<10?'0':'')+CONFIG.schedule.closeHour+':00'
    }],
    priceRange:CONFIG.services.map(function(s){return s.price}).join(' – '),
    currenciesAccepted:'MXN'
  });
  document.head.appendChild(ld);

  function finishInit(){
    renderServices();
    renderSlots();
    updateStatus();
    updateFooterHours();
    setInterval(function(){ refreshSlots(); updateStatus(); }, 60000);
  }

  if(SCHEDULE_SHEET_ID){
    fetchSchedule().then(function(data){
      if(data && data.openDays !== undefined){
        CONFIG.schedule.openDays     = data.openDays;
        CONFIG.schedule.openHour     = data.openHour;
        CONFIG.schedule.closeHour    = data.closeHour;
        CONFIG.schedule.slotInterval = data.slotInterval;
      }
      finishInit();
    }).catch(function(){ finishInit(); });
  } else {
    finishInit();
  }
})();
