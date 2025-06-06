const PdfPrinter = require('pdfmake');
const path = require('path');

module.exports = {
  Roboto: {
    normal: path.join(__dirname, 'fonts', 'Roboto-Regular.ttf'),
    bold: path.join(__dirname, 'fonts', 'Roboto-Bold.ttf'),
    italics: path.join(__dirname, 'fonts', 'Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, 'fonts', 'Roboto-BoldItalic.ttf'),
  }
};

const printer = new PdfPrinter(fonts);

module.exports = printer;
