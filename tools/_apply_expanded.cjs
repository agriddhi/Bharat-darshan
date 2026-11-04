const fs = require('fs');
const path = require('path');
const root = 'C:\\Users\\Gaupad\\OneDrive\\Dokumen\\Default Project\\bharat-darshan-v2';
const sitesPath = path.join(root, 'src', 'data', 'sites.json');
const expandedPath = path.join(root, 'tools', '_folklore_expanded.json');
const sites = JSON.parse(fs.readFileSync(sitesPath, 'utf8'));
const expanded = JSON.parse(fs.readFileSync(expandedPath, 'utf8'));
let updated = 0;
for (const site of sites) {
  const note = expanded[site.id];
  if (note) { site.folkloreNote = note; updated++; }
}
fs.writeFileSync(sitesPath, JSON.stringify(sites, null, 2) + '\n', 'utf8');
console.log('Updated folklore for ' + updated + '/' + sites.length + ' sites');
console.log('Sample length (taj-mahal): ' + site.folkloreNote.length + ' chars');
