const fs = require('fs');
const path = require('path');
const root = process.cwd();
const sitesPath = path.join(root, 'src', 'data', 'sites.json');
const sites = JSON.parse(fs.readFileSync(sitesPath, 'utf8'));
const missing = sites.filter(s => !s.folkloreNote || s.folkloreNote.length < 200);
console.log('Sites with short/null folklore:');
missing.forEach(s => console.log('  ' + s.id + ' (' + (s.folkloreNote ? s.folkloreNote.length + ' chars' : 'null') + ')'));
console.log('Total updated/' + sites.length);
