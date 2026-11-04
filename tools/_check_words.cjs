const fs = require('fs');
const path = require('path');
const root = 'C:\\Users\\Gaupad\\OneDrive\\Dokumen\\Default Project\\bharat-darshan-v2';
const sites = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'sites.json'), 'utf8'));
const notes = sites.map(s => ({ id: s.id, len: (s.folkloreNote || '').length, words: (s.folkloreNote || '').split(/\s+/).filter(w => w.length > 0).length }));
notes.forEach(n => console.log(n.id + ': ' + n.words + ' words'));
const avgWords = notes.reduce((a,b) => a + b.words, 0) / notes.length;
console.log('Average: ' + Math.round(avgWords) + ' words across ' + notes.length + ' sites');
