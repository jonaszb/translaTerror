import fs from 'fs';
import JSZip from 'jszip';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import DocxAsXml from './DocxAsXml';

class DocxFile {
    path: string;
    private zip: JSZip | null;
    fileName: string;
    private asXml: DocxAsXml | null;

    namespace = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
    private hasBackup = false;

    constructor(path: string) {
        if (!fs.existsSync(path)) throw new Error('File not found');
        if (!path.endsWith('.docx')) throw new Error('File is not a docx file');
        this.path = path;
        this.fileName = path
            .split(/[\\\/]/)
            .pop()
            .replace('.docx', '');
        this.zip = new JSZip();
        this.asXml = null;
    }

    private checkXml() {
        if (!this.asXml) throw new Error('XML not found, use read() first');
    }

    private async decompress() {
        // Load the file into memory
        const data = fs.readFileSync(this.path);
        // Decompress the file and store it in memory
        await this.zip.loadAsync(data);
    }

    getPathWithSuffix(suffix: string) {
        const index = this.path.lastIndexOf('.docx');
        return this.path.slice(0, index) + suffix + '.docx';
    }

    async read() {
        await this.decompress();
        // Get document.xml from the decompressed file
        const xmlFile = this.zip.file('word/document.xml');
        if (xmlFile) {
            const documentXml = await xmlFile.async('nodebuffer');
            const parser = new DOMParser();
            const parsedXml = parser.parseFromString(documentXml.toString(), 'application/xml');
            this.asXml = new DocxAsXml(parsedXml);
        }
    }

    async saveDocumentXml(documentXml: Document) {
        // Ensure the file is decompressed
        if (!this.zip) throw new Error('File not decompressed');
        // Serialize the XML document
        const serializer = new XMLSerializer();
        const xmlString = serializer.serializeToString(documentXml);
        // Overwrite the document.xml file in the decompressed file
        this.zip.file('word/document.xml', xmlString);
    }

    private async compress() {
        // Ensure the file is decompressed
        if (!this.zip) throw new Error('File not decompressed');
        // Compress the decompressed file back into a docx file
        const compressedData = await this.zip.generateAsync({ type: 'nodebuffer' });
        fs.writeFileSync(this.path, compressedData);
    }

    async addBookmarks() {
        this.checkXml();
        this.asXml.addBookmarks();
    }

    async saveChanges() {
        this.checkXml();
        await this.saveDocumentXml(this.asXml.doc);
        await this.compress();
    }

    async getDocumentInfo() {
        this.checkXml();
        return this.asXml.getDocumentInfo();
    }

    async createBookmarkTable() {
        this.checkXml();
        return this.asXml.createBookmarkTable();
    }

    async createFragmentTable() {
        this.checkXml();
        return this.asXml.createFragmentTable();
    }

    getFragData() {
        return this.asXml.fragData;
    }

    createBackup() {
        fs.copyFile(this.path, this.path.replace('.docx', '_backup.docx'), (err) => {
            if (err) throw err;
            this.hasBackup = true;
            console.log('Backup created');
        });
    }

    deleteBackup() {
        if (this.hasBackup) {
            fs.rmSync(this.path.replace('.docx', '_backup.docx'), { recursive: true, force: true });
            this.hasBackup = false;
            console.log('Backup deleted');
        } else {
            console.warn('No backup found');
        }
    }

    restoreBackup() {
        if (this.hasBackup) {
            fs.copyFile(this.path.replace('.docx', '_backup.docx'), this.path, (err) => {
                if (err) throw err;
                console.log('Backup restored');
            });
        } else {
            console.warn('No backup found');
        }
    }
}

export default DocxFile;

const file = new DocxFile('/Users/jonaszbilinski/Desktop/frag.docx');

const main = async () => {
    await file.read();
    // await file.bookmark();
};

main();
