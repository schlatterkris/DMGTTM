import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Setting up the worker for PDF processing
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

const PdfIndexer = ({ onEncounterFound }) => {
  const [indexing, setIndexing] = useState(false);
  const [encounters, setEncounters] = useState([]);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIndexing(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const typedarray = new Uint8Array(e.target.result);
      const pdf = await pdfjsLib.getDocument(typedarray).promise;
      const foundMap = [];

      // Logic: Iterate through pages to find "Section" markers
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');

        // Logic: Search for Encounter Keywords (e.g., "Area", "CR", "Room")
        const encounterMatch = pageText.match(/(Area \d+|Room \d+|Encounter: [A-Z]+)/g);
        
        if (encounterMatch) {
          encounterMatch.forEach(name => {
            foundMap.push({ name, page: i, fileUrl: URL.createObjectURL(file) });
          });
        }
      }
      
      setEncounters(foundMap);
      setIndexing(false);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="spellbook-indexer">
      <label className="custom-file-upload">
        <input type="file" onChange={handleUpload} accept="application/pdf" />
        {indexing ? "🔮 Scrying PDF..." : "📜 Upload Adventure PDF"}
      </label>

      {encounters.length > 0 && (
        <ul className="found-encounters-list">
          {encounters.map((enc, idx) => (
            <li key={idx} onClick={() => onEncounterFound(enc)}>
              {enc.name} (Page {enc.page})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
