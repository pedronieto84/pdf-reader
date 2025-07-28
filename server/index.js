
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());

app.get('/extract-pdf', async (req, res) => {
    try {
        const pdfPath = path.resolve(__dirname, '../src/assets/SantBoi-relacioBens.pdf');
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdfParse(dataBuffer);
        res.json({ text: data.text, lines: data.text.split('\n') });
    } catch (err) {
        res.status(500).json({ error: 'Error al leer el PDF', details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`PDF Reader backend listening on port ${PORT}`);
});
