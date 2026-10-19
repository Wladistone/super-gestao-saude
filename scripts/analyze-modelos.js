const fs = require('fs');

const content = fs.readFileSync('src/data/modelos-licitacao-catalog.ts', 'utf8');
const tipos = new Set();
const regex = /"tipoPeca":\s*"([^"]+)"/g;
let m;
while ((m = regex.exec(content)) !== null) {
  tipos.add(m[1]);
}

console.log('Tipos de Peça Encontrados:');
console.log(Array.from(tipos));
