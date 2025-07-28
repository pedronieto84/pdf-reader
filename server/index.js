
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
        const which = req.query.which || 'sant-boi'; // Valor por defecto

        let pdfFileName;
        switch (which) {
            case 'sant-boi':
                pdfFileName = 'SantBoi-relacioBens.pdf';
                break;
            case 'premia':
                pdfFileName = 'Premia-llibreA-001.pdf';
                break;
            default:
                return res.status(400).json({
                    error: 'Parámetro "which" inválido',
                    validOptions: ['sant-boi', 'premia']
                });
        }

        const pdfPath = path.resolve(__dirname, `../src/assets/${pdfFileName}`);

        // Verificar que el archivo existe
        if (!fs.existsSync(pdfPath)) {
            return res.status(404).json({
                error: `Archivo no encontrado: ${pdfFileName}`,
                path: pdfPath
            });
        }

        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdfParse(dataBuffer);
        res.json({
            fileName: pdfFileName,
            which: which,
            text: data.text,
            lines: data.text.split('\n'),
            numPages: data.numpages,
            totalCharacters: data.text.length
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al leer el PDF', details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`PDF Reader backend listening on port ${PORT}`);
});

// Endpoint 1: Detectar líneas usando análisis de texto (simulado como detección de imagen)
app.get('/detect-lines-image', async (req, res) => {
    try {
        const pdfPath = path.resolve(__dirname, '../src/assets/SantBoi-relacioBens.pdf');
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdfParse(dataBuffer);

        // Simular detección de líneas basada en el texto extraído
        // Buscar patrones que podrían indicar líneas horizontales
        const textLines = data.text.split('\n');
        const horizontalLines = [];

        textLines.forEach((line, index) => {
            // Detectar líneas que contengan solo caracteres de separación
            if (line.match(/^[-_=\s]*$/) && line.trim().length > 3) {
                horizontalLines.push({
                    lineNumber: index + 1,
                    content: line.trim(),
                    length: line.trim().length,
                    type: "text_separator",
                    estimatedY: 800 - (index * 12) // Estimación de posición Y
                });
            }
        });

        res.json({
            method: "text-based line detection (simulating image analysis)",
            linesFound: horizontalLines.length,
            lines: horizontalLines,
            totalTextLines: textLines.length,
            note: "Análisis basado en patrones de texto que sugieren líneas horizontales"
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al detectar líneas', details: err.message });
    }
});

// Endpoint 2: Detectar líneas usando pdf-lib (análisis de contenido)
app.get('/detect-lines-content', async (req, res) => {
    try {
        const pdfPath = path.resolve(__dirname, '../src/assets/SantBoi-relacioBens.pdf');
        const dataBuffer = fs.readFileSync(pdfPath);

        // Análisis básico simulado de contenido PDF
        // En un caso real, analizarías operadores de dibujo como 'l', 'm', etc.
        const horizontalLines = [
            { page: 1, y: 742, x1: 72, x2: 523, type: "separator" },
            { page: 1, y: 680, x1: 72, x2: 523, type: "table_border" },
            { page: 1, y: 620, x1: 72, x2: 523, type: "underline" }
        ];

        res.json({
            method: "pdf-lib content analysis",
            linesFound: horizontalLines.length,
            lines: horizontalLines,
            note: "Análisis simulado - implementar parsing de operadores PDF"
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al detectar líneas con análisis de contenido', details: err.message });
    }
});
