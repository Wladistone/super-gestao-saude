const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function testDocxSectPr() {
  const templatePath = path.join('public', 'modelos', '01 Modelos de Atos Administrativos', 'ADESÃO DE ATA', '01 - DFD - ADESÃO DE ATA.docx');
  const buffer = fs.readFileSync(templatePath);
  const zip = await JSZip.loadAsync(buffer);
  
  const docXml = await zip.file('word/document.xml').async('string');
  const sectPrMatch = docXml.match(/<w:sectPr[\s\S]*?<\/w:sectPr>/);
  console.log('Found sectPr:', !!sectPrMatch);
  if (sectPrMatch) {
    console.log('sectPr snippet:', sectPrMatch[0].substring(0, 200));
  }
}

testDocxSectPr().catch(console.error);
