const Storage = require('@google-cloud/storage');
const fs = require('fs');
const request = require('request');
const PdfPrinter = require('pdfmake/src/printer');
const uuidv4 = require('uuid/v4');
const Google = require('googleapis');
const http = require('http');
const url = require('url');
const querystring = require('querystring');

const BUCKET = 'download_pdf'; // Replace with name of your bucket

function createPDF() {
  // Return a new promise.
  return new Promise(function (resolve, reject) {
    var docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
        'First paragraph',
        'Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines'
      ]
    }
    const fontDescriptors = {
      Roboto: {
        normal: './fonts/test-dep.ttf'
      }
    };
    const printer = new PdfPrinter(fontDescriptors);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const storage = new Storage();
    console.log('storage => ', storage);
    let file_name = uuidv4() + '.pdf';
    console.log('file_name => ', file_name);
    const myPdfFile = storage.bucket(BUCKET).upload(file_name);
    console.log('==== myPdfFile ==== ', myPdfFile);
    pdfDoc
      .pipe(myPdfFile.createWriteStream())
      .on('finish', function () {
        console.log('Pdf successfully created!');
        resolve(file_name);
      })
      .on('error', function (err) {
        console.log('Error during the wirtestream operation in the new file');
        reject('Error: something goes wrong ! ' + err);
      });
    pdfDoc.end();
  });
}

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.downloadPDF = (req, res) => {
  createPDF()
  .then(function (file_name) {
    res.status(200).send("The request was successfully authorized and pdf generated.\n You can find your pdf in the cloud storage " + file_name);
  })
  .catch(function (error) {
    console.error("Failed!" + error);
    res.status(400).send("Error: Pdf generation failed!");
  });
};