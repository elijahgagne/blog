function parseEventDate(mmdd, academicStartYear){
  const [y,m,s] = mmdd.split('-');
  const month = parseInt(m,10);
  const day = parseInt(s,10);
  const year = parseInt(y,10);
  // const year = (month >= 8) ? academicStartYear : (academicStartYear + 1);
  return new Date(year, month - 1, day);
}

function buildEventMap(events){
  const map = new Map();
  events.forEach(ev=>{
    const dt = parseEventDate(ev.Date);
    const key = dt.toISOString().slice(0,10);
    const copy = Object.assign({}, ev);
    copy._date = dt;
    if(!map.has(key)) map.set(key, []);
    map.get(key).push(copy);
  });
  return map;
}

// function buildEventMap(events, academicStartYear){
//   const map = new Map();
//   events.forEach(ev=>{
//     const dt = parseEventDate(ev.Date, academicStartYear);
//     const key = dt.toISOString().slice(0,10);
//     const copy = Object.assign({}, ev);
//     copy._date = dt;
//     if(!map.has(key)) map.set(key, []);
//     map.get(key).push(copy);
//   });
//   return map;
// }

/* Helper for CSS class from color */
function colorClassName(c){ return 'c-' + (c || '').trim().replace(/\s+/g,'-'); }

/* DOM refs */

const monthViewBtn = document.getElementById('monthViewBtn');
const listViewBtn = document.getElementById('listViewBtn');

const periodLabel = document.getElementById('periodLabel');
const subLabel = document.getElementById('subLabel');
const calendarGrid = document.getElementById('calendarGrid');
const monthPager = document.getElementById('monthPager');
const prevBottom = document.getElementById('prevBottom');
const nextBottom = document.getElementById('nextBottom');

const prevTop = document.getElementById('prev');
const nextTop = document.getElementById('next');

const monthArea = document.getElementById('monthArea');
const listArea = document.getElementById('listArea');

const legend = document.getElementById('legend');
const colorFilter = document.getElementById('colorFilter');
const listContent = document.getElementById('listContent');
const pagerLabel = document.getElementById('pagerLabel');
const monthNav = document.getElementById('monthNav');

// YAML to JSON conversion
async function readYamlFile(filename) {
  try {
    const response = await fetch(filename);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const yamlText = await response.text();
    return yamlText;
  } catch (error) {
    console.error('Error reading YAML file:', error);
    return null;
  }
}

function processYAMLString(fileContent) {
  const lines = fileContent.split('\n');
  var calendar = []
  var curColor = "";
  var curName = "";
  var curDate = "";

  for (const line of lines) {
    if (line === "Calendar:") {}
    else if (line.startsWith("  - Color: ")) {
      curColor = line.replace("  - Color: ", "").trim();
    }
    else if (line.startsWith("    - Name: ")) {
      curName = line.replace("    - Name: ", "").trim();
    }
    else if (line.startsWith("      Date: ")) {
      curDate = line.replace("      Date: ", "").trim();
      calendar.push({"Date": curDate, "Name": curName, "Color": curColor});
    }
    else if (line.startsWith("        - ")) {
      curDate = line.replace("        - ", "").trim();
      calendar.push({"Date": curDate, "Name": curName, "Color": curColor});
    }
  }

  return calendar;
}