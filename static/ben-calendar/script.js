const today = new Date();
let currentView = 'month';
let listFilter = "All";
let showPreviousEvents = false;
let monthIndex = 0;
const academicStartYear = 2025;
// weekStartDate must exist before switching to week view or calling renderWeek()
let weekStartDate = startOfWeek(today);
weekStartDate = clampWeekToAcademic(weekStartDate);

events = processYAMLString(yamlString);
const eventMap = buildEventMap(events);

/* months array Aug..Dec then Jan..Jul */
const months = [];
for(let m=8;m<=12;m++) months.push({month:m-1, year:academicStartYear});
for(let m=1;m<=7;m++) months.push({month:m-1, year:academicStartYear + 1});

(function initMonthIndex(){
  for(let i=0;i<months.length;i++){
    if(months[i].month === today.getMonth() && months[i].year === today.getFullYear()){
      monthIndex = i;
      break;
    }
  }
})();

// Legend click: sets color filter; in list view it applies immediately; highlight active item
document.addEventListener('DOMContentLoaded', function() {
  const legend = document.getElementById('legend');
  if (legend) {
    legend.addEventListener('click', (e) => {
      const item = e.target.closest('.item');
      if (!item) return;
      const color = item.getAttribute('data-color') || 'All';
      // visually mark active legend item
      legend.querySelectorAll('.item').forEach(it => it.classList.remove('active'));
      item.classList.add('active');
      // set filter and re-render list
      listFilter = color;
      if (currentView === 'list') renderList();
    });
    // Set "All" as active by default
    legend.querySelectorAll('.item').forEach(it => {
      it.classList.toggle('active', it.getAttribute('data-color') === 'All');
    });
  }
});


/* Toggle views */
monthViewBtn.addEventListener('click', ()=> { currentView = 'month'; render(); });
weekViewBtn.addEventListener('click', ()=> { currentView = 'week'; render(); });
listViewBtn.addEventListener('click', ()=> { currentView = 'list'; render(); });

/* Month navigation */
prevTop.addEventListener('click', ()=> { if(monthIndex > 0){ monthIndex--; render(); }});
nextTop.addEventListener('click', ()=> { if(monthIndex < months.length - 1){ monthIndex++; render(); }});
prevBottom.addEventListener('click', ()=> {
  if(currentView === 'month' && monthIndex > 0){ monthIndex--; render(); }
});
nextBottom.addEventListener('click', ()=> {
  if(currentView === 'month' && monthIndex < months.length - 1){ monthIndex++; render(); }
});
/* Week navigation */
prevWeek.addEventListener('click', ()=> { weekStartDate = startOfWeek(addDays(weekStartDate, -7)); weekStartDate = clampWeekToAcademic(weekStartDate); render(); });
nextWeek.addEventListener('click', ()=> { weekStartDate = startOfWeek(addDays(weekStartDate, 7)); weekStartDate = clampWeekToAcademic(weekStartDate); render(); });
// Fix: also wire top pager buttons for week view
prevTop.addEventListener('click', ()=> {
  if(currentView === 'month') {
    if(monthIndex > 0){ monthIndex--; render(); }
  } else if(currentView === 'week') {
    weekStartDate = startOfWeek(addDays(weekStartDate, -7));
    weekStartDate = clampWeekToAcademic(weekStartDate);
    render();
  }
});
nextTop.addEventListener('click', ()=> {
  if(currentView === 'month') {
    if(monthIndex < months.length - 1){ monthIndex++; render(); }
  } else if(currentView === 'week') {
    weekStartDate = startOfWeek(addDays(weekStartDate, 7));
    weekStartDate = clampWeekToAcademic(weekStartDate);
    render();
  }
});
/* Legend click: sets color filter; in list view it applies immediately; highlight active item */
legend.addEventListener('click', (e)=>{
  const item = e.target.closest('.item');
  if(!item) return;
  const color = item.getAttribute('data-color') || 'All';
  // visually mark active legend item
  document.querySelectorAll('#legend .item').forEach(it => it.classList.remove('active'));
  item.classList.add('active');
  // set filter
  if(colorFilter){
    colorFilter.value = color;
  }
  if(currentView === 'list') renderList();
});

/* Color filter change in list view */
if(colorFilter){
  colorFilter.addEventListener('change', ()=> {
    // highlight corresponding legend item
    const val = colorFilter.value;
    document.querySelectorAll('#legend .item').forEach(it => {
      it.classList.toggle('active', it.getAttribute('data-color') === val);
    });
    renderList();
  });
}

/* Keyboard navigation specific to view */
document.addEventListener('keydown', (e)=>{
  if(currentView === 'month'){
    if(e.key === 'ArrowLeft') { if(monthIndex > 0) { monthIndex--; render(); } }
    if(e.key === 'ArrowRight') { if(monthIndex < months.length - 1) { monthIndex++; render(); } }
  } else if(currentView === 'week'){
    if(e.key === 'ArrowLeft') { weekStartDate = startOfWeek(addDays(weekStartDate,-7)); weekStartDate = clampWeekToAcademic(weekStartDate); render(); }
    if(e.key === 'ArrowRight') { weekStartDate = startOfWeek(addDays(weekStartDate, 7)); weekStartDate = clampWeekToAcademic(weekStartDate); render(); }
  }
});

// Make "All" selected by default in legend and select
(function setDefaultAllFilter() {
  // Set "All" as selected in the select dropdown
  if (colorFilter) colorFilter.value = "All";
  // Set "All" as active in the legend
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('#legend .item').forEach(it => {
      it.classList.toggle('active', it.getAttribute('data-color') === 'All');
    });
  });
  // Also set immediately in case DOMContentLoaded already fired
  document.querySelectorAll('#legend .item').forEach(it => {
    it.classList.toggle('active', it.getAttribute('data-color') === 'All');
  });
})();

// Patch renderMonth to enable expand on mobile
const origRenderMonth = renderMonth;
renderMonth = function() {
  origRenderMonth();
  setTimeout(enableMonthDayExpand, 0);
  setTimeout(enableMonthEventExpand, 0);
};

// Remove duplicate event listeners for prevTop/nextTop/prevBottom/nextBottom
// and ensure only one handler per button for month navigation

// Remove any previous conflicting listeners if present
// (Do this only once, not on every render)
if (!window._monthNavPatched) {
  prevTop.replaceWith(prevTop.cloneNode(true));
  nextTop.replaceWith(nextTop.cloneNode(true));
  prevBottom.replaceWith(prevBottom.cloneNode(true));
  nextBottom.replaceWith(nextBottom.cloneNode(true));

  // Re-acquire references after replaceWith
  window.prevTopBtn = document.getElementById('prev');
  window.nextTopBtn = document.getElementById('next');
  window.prevBottomBtn = document.getElementById('prevBottom');
  window.nextBottomBtn = document.getElementById('nextBottom');

  // Month navigation: only increment/decrement by 1
  window.prevTopBtn.addEventListener('click', ()=> {
    if(currentView === 'month' && monthIndex > 0){ monthIndex--; render(); }
    else if(currentView === 'week') {
      // Always allow previous week unless at academic start
      const academicStart = new Date(academicStartYear,7,1);
      const firstWeekStart = startOfWeek(academicStart);
      if(weekStartDate > firstWeekStart) {
        weekStartDate = startOfWeek(addDays(weekStartDate, -7));
        weekStartDate = clampWeekToAcademic(weekStartDate);
        render();
      }
    }
  });
  window.nextTopBtn.addEventListener('click', ()=> {
    if(currentView === 'month' && monthIndex < months.length - 1){ monthIndex++; render(); }
    else if(currentView === 'week') {
      // Always allow next week unless at academic end
      const academicEnd = new Date(academicStartYear + 1,6,31);
      const lastWeekStart = startOfWeek(academicEnd);
      if(weekStartDate < lastWeekStart) {
        weekStartDate = startOfWeek(addDays(weekStartDate, 7));
        weekStartDate = clampWeekToAcademic(weekStartDate);
        render();
      }
    }
  });
  window.prevBottomBtn.addEventListener('click', ()=> {
    if(currentView === 'month' && monthIndex > 0){ monthIndex--; render(); }
  });
  window.nextBottomBtn.addEventListener('click', ()=> {
    if(currentView === 'month' && monthIndex < months.length - 1){ monthIndex++; render(); }
  });

  window._monthNavPatched = true;
}

// Patch render to update button disabled state after rendering
const origRender = render;
render = function() {
  origRender();
  updateMonthWeekNavDisabled();
};

/* Initialize: start in Month view for current month */
(function init(){
  if (window.innerWidth > 700) {
    currentView = 'month';
  } else {
    currentView = 'list'; // Default to week on mobile
  }
  // ensure monthIndex is set to current month (done earlier)
  render();
})();

// Theme slider toggle functionality
const themeToggleSlider = document.getElementById('themeToggleSlider');
const themeToggleIcon = document.getElementById('themeToggleIcon');
const themeToggleIconLight = document.getElementById('themeToggleIconLight');

// Check for saved theme preference or default to dark
const savedTheme = localStorage.getItem('theme') || 'dark';
const isDarkTheme = savedTheme === 'dark';

// Apply initial theme
if (!isDarkTheme) {
  document.documentElement.classList.add('light-theme');
  themeToggleSlider.checked = true;
}

// Set initial icon state
updateThemeIcons(!isDarkTheme);

if (themeToggleSlider) {
  themeToggleSlider.addEventListener('change', function() {
    const isLightMode = this.checked;

    if (isLightMode) {
      document.documentElement.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    }

    // Update icon visibility
    updateThemeIcons(isLightMode);
  });
}

// Previous events toggle functionality
const showPreviousBtn = document.getElementById('showPreviousBtn');
const previousEventsIcon = document.getElementById('previousEventsIcon');

if (showPreviousBtn) {
  showPreviousBtn.addEventListener('click', function() {
    showPreviousEvents = !showPreviousEvents;

    // Update button appearance
    if (showPreviousEvents) {
      showPreviousBtn.classList.add('active');
      showPreviousBtn.innerHTML = '<span id="previousEventsIcon">🙈</span> Hide Previous';
    } else {
      showPreviousBtn.classList.remove('active');
      showPreviousBtn.innerHTML = '<span id="previousEventsIcon">👁️</span> Show Previous';
    }

    // Re-render list view if currently active
    if (currentView === 'list') {
      renderList();
    }
  });
}



/* Render functions */
function render(){
  if(currentView === 'month'){
    renderMonth();
    monthArea.style.display = '';
    weekArea.style.display = 'none';
    listArea.style.display = 'none';
    legend.style.display = 'none';
    monthViewBtn.classList.add('active'); monthViewBtn.setAttribute('aria-selected','true');
    weekViewBtn.classList.remove('active'); weekViewBtn.setAttribute('aria-selected','false');
    listViewBtn.classList.remove('active'); listViewBtn.setAttribute('aria-selected','false');
    monthNav.style.display = ''; // Show navigation in month view
    // Remove clickable and selected from all days in month view
    setTimeout(() => {
      document.querySelectorAll('.day').forEach(cell => {
        cell.classList.remove('clickable', 'selected');
        cell.style.cursor = 'default';
        cell.onclick = null;
      });
    }, 0);
  } else if(currentView === 'week'){
    renderWeek();
    monthArea.style.display = 'none';
    weekArea.style.display = '';
    listArea.style.display = 'none';
    legend.style.display = 'none';
    monthViewBtn.classList.remove('active'); monthViewBtn.setAttribute('aria-selected','false');
    weekViewBtn.classList.add('active'); weekViewBtn.setAttribute('aria-selected','true');
    listViewBtn.classList.remove('active'); listViewBtn.setAttribute('aria-selected','false');
    subLabel.textContent = '';
    monthNav.style.display = ''; // Show navigation in week view
  } else {
    renderList();
    monthArea.style.display = 'none';
    weekArea.style.display = 'none';
    listArea.style.display = '';
    legend.style.display = '';
    monthViewBtn.classList.remove('active'); monthViewBtn.setAttribute('aria-selected','false');
    weekViewBtn.classList.remove('active'); weekViewBtn.setAttribute('aria-selected','false');
    listViewBtn.classList.add('active'); listViewBtn.setAttribute('aria-selected','true');
    monthNav.style.display = 'none'; // Hide navigation in list view
  }
}

/* Month render: full 7x6 grid for months[monthIndex] */
function renderMonth(){
  calendarGrid.innerHTML = '';
  const mobj = months[monthIndex];
  const year = mobj.year, month = mobj.month;
  const firstOfMonth = new Date(year, month, 1);
  const startDay = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  periodLabel.textContent = firstOfMonth.toLocaleString(undefined,{month:'long', year:'numeric'});
  subLabel.textContent = '';

  for(let i=0;i<42;i++){
    const cell = document.createElement('div');
    cell.className = 'day';
    // No clickable class in month view
    const idx = i - startDay + 1;
    let cellDate;
    if(idx <= 0){
      cellDate = new Date(year, month -1, prevMonthLastDate + idx);
      cell.classList.add('dim');
    } else if(idx > daysInMonth){
      cellDate = new Date(year, month +1, idx - daysInMonth);
      cell.classList.add('dim');
    } else {
      cellDate = new Date(year, month, idx);
    }


    const dateRow = document.createElement('div');
    dateRow.className = 'date-row';
    const dn = document.createElement('div');
    dn.className = 'date-num';
    dn.textContent = String(cellDate.getDate()).padStart(2,'0');
    dateRow.appendChild(dn);

    const key = cellDate.toISOString().slice(0,10);
    const dayEvents = eventMap.get(key) || [];
    cell.setAttribute('data-date', key);

    const eventsWrap = document.createElement('div');
    eventsWrap.className = 'events';
    dayEvents.slice(0,3).forEach(ev=>{
      const pill = document.createElement('div');
      pill.className = 'event-pill ' + colorClassName(ev.Color);
      pill.textContent = ev.Name;
      pill.setAttribute('data-date', key);
      eventsWrap.appendChild(pill);
    });
    if(dayEvents.length > 3){
      const more = document.createElement('div');
      more.className = 'small';
      more.textContent = `+${dayEvents.length - 3} more`;
      more.style.marginTop='4px';
      more.style.color='var(--muted)';
      eventsWrap.appendChild(more);
    }

    cell.appendChild(dateRow);
    cell.appendChild(eventsWrap);

    // No click handler, no highlight in month view

    calendarGrid.appendChild(cell);
  }

  prevTop.disabled = prevBottom.disabled = (monthIndex === 0);
  nextTop.disabled = nextBottom.disabled = (monthIndex === months.length - 1);

  pagerLabel.textContent = `${monthIndex + 1} / ${months.length}`;
}

/* Week render: show week starting at weekStartDate */
function renderWeek(){
  weekGrid.innerHTML = '';
  // Ensure weekStartDate exists and clamp it to academic range
  if (typeof weekStartDate === 'undefined' || !weekStartDate) {
    weekStartDate = startOfWeek(new Date());
  }
  weekStartDate = clampWeekToAcademic(weekStartDate);
  const weekEnd = addDays(weekStartDate,6);
  periodLabel.textContent = formatRangeLabel(weekStartDate, weekEnd);

  // generate 7 days
  let d = new Date(weekStartDate);
  for(let i=0;i<7;i++){
    const wd = document.createElement('div');
    wd.className = 'week-day';
    const dn = document.createElement('div');
    dn.className = 'date-num';
    dn.textContent = d.toLocaleDateString(undefined,{weekday:'short', month:'short', day:'numeric'});
    wd.appendChild(dn);

    const key = d.toISOString().slice(0,10);
    const dayEvents = eventMap.get(key) || [];

    dayEvents.forEach(ev=>{
      const pill = document.createElement('div');
      pill.className = 'event-pill ' + colorClassName(ev.Color);
      pill.style.marginTop = '6px';
      pill.textContent = ev.Name;
      wd.appendChild(pill);
    });

    weekGrid.appendChild(wd);
    d = addDays(d,1);
  }

  // week pager hard stops: compute first and last possible week starts within academic year
  const academicStart = new Date(academicStartYear,7,1);
  const academicEnd = new Date(academicStartYear + 1,6,31);
  const firstWeekStart = startOfWeek(academicStart);
  const lastWeekStart = startOfWeek(academicEnd);

  prevWeek.disabled = weekStartDate <= firstWeekStart;
  nextWeek.disabled = weekStartDate >= lastWeekStart;

  // subLabel (show week counts)
  // subLabel.textContent = `Week of ${weekStartDate.toLocaleDateString()}`; // removed
}

function renderList(){
  listContent.innerHTML = '';
  periodLabel.textContent = '';
  subLabel.textContent = '';

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Set to start of today for comparison

  // Filter events by selected color and date
  const allEntries = [];
  eventMap.forEach((arr) => {
    arr.forEach(ev => {
      const eventDate = new Date(ev._date);
      eventDate.setHours(0, 0, 0, 0);

      // Skip past events if showPreviousEvents is false
      if (!showPreviousEvents && eventDate < currentDate) {
        return;
      }

      if (listFilter === "All" || ev.Color === listFilter) {
        allEntries.push(ev);
      }
    });
  });
  allEntries.sort((a, b) => a._date - b._date);

  if (allEntries.length === 0) {
    const none = document.createElement('div');
    none.className = 'small';
    none.style.color = 'var(--muted)';
    none.textContent = showPreviousEvents ? 'No events' : 'No upcoming events';
    listContent.appendChild(none);
  } else {
    allEntries.forEach(ev => {
      const row = document.createElement('div');
      row.className = 'event-row c-' + ev.Color;

      // Add opacity for past events when showing them
      const eventDate = new Date(ev._date);
      eventDate.setHours(0, 0, 0, 0);
      if (eventDate < currentDate) {
        row.style.opacity = '0.6';
      }

      const left = document.createElement('div');
      left.style.display = 'flex';
      left.style.gap = '12px';
      left.style.alignItems = 'center';
      const date = document.createElement('div');
      date.style.minWidth = '110px';
      date.style.fontWeight = '700';
      // Show day of week, e.g. "Thu Sep 25"
      date.textContent = ev._date.toLocaleDateString(undefined, {weekday:'short', month:'short', day:'numeric'});
      const desc = document.createElement('div');
      desc.textContent = ev.Name;
      left.appendChild(date);
      left.appendChild(desc);

      row.appendChild(left);
      // No badge on the right

      listContent.appendChild(row);
    });
  }
}

// Add click-to-expand for month view on mobile
function enableMonthDayExpand() {
  // Remove any previous handlers
  calendarGrid.querySelectorAll('.day').forEach(cell => {
    cell.onclick = null;
    cell.classList.remove('clickable');
  });

  // Only enable on mobile
  if (window.innerWidth > 700) return;

  calendarGrid.querySelectorAll('.day').forEach(cell => {
    cell.classList.add('clickable');
    cell.onclick = function(e) {
      // Prevent multiple expanded
      document.querySelectorAll('.day.expanded').forEach(exp => {
        exp.classList.remove('expanded');
        if (exp.querySelector('.close-btn')) exp.querySelector('.close-btn').remove();
      });
      // Expand this cell
      cell.classList.add('expanded');
      document.body.classList.add('expanded-day-open');
      // Add close button
      const closeBtn = document.createElement('button');
      closeBtn.className = 'close-btn';
      closeBtn.innerHTML = '&times;';
      closeBtn.onclick = function(ev) {
        ev.stopPropagation();
        cell.classList.remove('expanded');
        document.body.classList.remove('expanded-day-open');
        closeBtn.remove();
      };
      cell.appendChild(closeBtn);
      // Clicking outside the expanded cell closes it
      setTimeout(() => {
        function outsideClick(ev) {
          if (!cell.contains(ev.target)) {
            cell.classList.remove('expanded');
            document.body.classList.remove('expanded-day-open');
            closeBtn.remove();
            document.removeEventListener('mousedown', outsideClick, true);
            document.removeEventListener('touchstart', outsideClick, true);
          }
        }
        document.addEventListener('mousedown', outsideClick, true);
        document.addEventListener('touchstart', outsideClick, true);
      }, 0);
    };
  });
}

function enableMonthEventExpand() {
  if (window.innerWidth > 700) return;
  document.querySelectorAll('.event-pill').forEach(pill => pill.onclick = null);

  document.querySelectorAll('#calendarGrid .event-pill').forEach(pill => {
    pill.onclick = function(e) {
      e.stopPropagation();

      if (pill.classList.contains('expanded-mobile')) {
        pill.classList.remove('expanded-mobile');
        document.body.classList.remove('event-pill-expanded');
        // remove date label if you want (optional)
        // const lbl = pill.querySelector('.date-label'); if (lbl) lbl.remove();
        return;
      }

      // Close others
      document.querySelectorAll('.event-pill.expanded-mobile').forEach(exp => {
        exp.classList.remove('expanded-mobile');
      });

      // Insert date label if available and not present
      if (!pill.querySelector('.date-label')) {
        const dateStr = pill.getAttribute('data-date') || pill.closest('.day')?.getAttribute('data-date');
        if (dateStr) {
          const d = new Date(dateStr);
          if (!isNaN(d)) {
            const label = document.createElement('span');
            label.className = 'date-label';
            label.textContent = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); // "Jun 13"
            pill.insertBefore(label, pill.firstChild);
          }
        }
      }

      // Insert date label if available and not present
      if (!pill.querySelector('.date-label')) {
        // Try pill data-date, then the enclosing day cell's data-date (recommended to render day cells with data-date="YYYY-MM-DD")
        const dateStr = pill.getAttribute('data-date') || pill.closest('.day')?.getAttribute('data-date');
        if (dateStr) {
          const d = new Date(dateStr);
          if (!isNaN(d)) {
            // Use a locale-aware short month name + day number, e.g. "Jun 13".
            // If you want English regardless of locale, pass 'en-US' as first arg.
            const labelText = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const label = document.createElement('span');
            label.className = 'date-label';
            label.textContent = labelText;
            // style can be overridden in CSS; inserting before text so it shows first
            pill.insertBefore(label, pill.firstChild);
          }
        }
      }

      // Expand this pill
      pill.classList.add('expanded-mobile');
      document.body.classList.add('event-pill-expanded');

      function closeOnClick(ev) {
        if (!pill.contains(ev.target)) {
          pill.classList.remove('expanded-mobile');
          document.body.classList.remove('event-pill-expanded');
          document.removeEventListener('click', closeOnClick, true);
        }
      }
      setTimeout(() => {
        document.addEventListener('click', closeOnClick, true);
      }, 0);
    };
  });
}

// --- Fix disabling logic for prev/next buttons ---
function updateMonthWeekNavDisabled() {
  // Month view
  if (currentView === 'month') {
    window.prevTopBtn.disabled = window.prevBottomBtn.disabled = (monthIndex === 0);
    window.nextTopBtn.disabled = window.nextBottomBtn.disabled = (monthIndex === months.length - 1);
  }
  // Week view
  else if (currentView === 'week') {
    const academicStart = new Date(academicStartYear,7,1);
    const academicEnd = new Date(academicStartYear + 1,6,31);
    const firstWeekStart = startOfWeek(academicStart);
    const lastWeekStart = startOfWeek(academicEnd);
    window.prevTopBtn.disabled = (weekStartDate <= firstWeekStart);
    window.nextTopBtn.disabled = (weekStartDate >= lastWeekStart);
    // Hide bottom pager in week view
    window.prevBottomBtn.disabled = true;
    window.nextBottomBtn.disabled = true;
  }
  // List view: all enabled
  else {
    window.prevTopBtn.disabled = false;
    window.nextTopBtn.disabled = false;
    window.prevBottomBtn.disabled = false;
    window.nextBottomBtn.disabled = false;
  }
}

// Update icon visibility based on theme
function updateThemeIcons(isLight) {
  if (themeToggleIcon && themeToggleIconLight) {
    themeToggleIcon.style.opacity = isLight ? '0.4' : '1';
    themeToggleIconLight.style.opacity = isLight ? '1' : '0.4';
  }
}