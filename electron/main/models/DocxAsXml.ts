import { isDeepStrictEqual } from 'util';
import xpath from 'xpath';
import { Document as WordDocument, Packer, Paragraph, Table, TableCell, TableRow, TextRun } from 'docx';

const isNode = (node: unknown): node is Node => {
    if (!node || typeof node !== 'object') return false;
    return node.hasOwnProperty('childNodes');
};

class DocxAsXml {
    doc: Document;
    currentBmText: string;
    bookmarks: Bookmark[];
    bookmarkId: number;
    bookmarkOpen: boolean;
    paragraphNodes: xpath.SelectedValue[];
    fragData?: { totalLength: number; redundancy: number; redundancyRatio: string };

    private namespace = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
    private select = xpath.useNamespaces({ w: this.namespace });
    private fragmentsRegExp = /(?<=[.!?…])\s/;

    constructor(doc: Document) {
        this.doc = doc;
        this.currentBmText = '';
        this.bookmarks = [];
        this.bookmarkId = 1;
        this.bookmarkOpen = false;
        this.paragraphNodes = [];
    }

    private startBmBefore = (node: Node) => {
        if (this.bookmarkOpen) return;
        const bookmark = this.openingBookmark();
        node.parentNode && node.parentNode.insertBefore(bookmark, node);
        this.bookmarkOpen = true;
    };

    private closeBmAfter = (node: Node) => {
        if (!this.bookmarkOpen) return;
        const bookmark = this.closingBookmark();
        node.parentNode && node.parentNode.insertBefore(bookmark, node.nextSibling);
        this.bookmarkOpen = false;
    };

    private closeBmBefore = (node: Node) => {
        if (!this.bookmarkOpen) return;
        const bookmark = this.closingBookmark();
        node.parentNode && node.parentNode.insertBefore(bookmark, node);
        this.bookmarkOpen = false;
    };

    private openingBookmark = () => {
        const bookmarkStart = this.doc.createElement('w:bookmarkStart');
        bookmarkStart.setAttribute('w:id', this.bookmarkId.toString());
        bookmarkStart.setAttribute('w:name', `TT_${this.bookmarkId.toString().padStart(7, '0')}`);
        return bookmarkStart;
    };

    private closingBookmark = () => {
        const bookmarkEnd = this.doc.createElement('w:bookmarkEnd');
        bookmarkEnd.setAttribute('w:id', this.bookmarkId.toString());
        bookmarkEnd.setAttribute('w:name', `TT_${this.bookmarkId.toString().padStart(7, '0')}`);
        if (this.currentBmText && !this.containsOnlyNumbersAndSpaces(this.currentBmText)) {
            this.bookmarks.push({ text: this.currentBmText, id: `TT_${this.bookmarkId.toString().padStart(7, '0')}` });
        }
        this.currentBmText = '';
        this.bookmarkId++;
        return bookmarkEnd;
    };

    private containsOnlyNumbersAndSpaces = (str: string) => {
        const stringWithoutSpaces = str.replace(/\s/g, '');
        return /^\d+$/.test(stringWithoutSpaces);
    };

    private getParagraphNodes = () => {
        this.paragraphNodes = this.select(`//w:p[not(descendant::w:p) or /w:t]`, this.doc);
    };

    private getStyleFromNode = (node: Node) => {
        const style = this.select('w:rPr', node)[0] as Node;
        const styleData: any = {};
        if (style && style.childNodes) {
            for (const child of Object.values(style.childNodes) as Element[]) {
                const attributes: any = {};
                if (!child || !child.tagName) continue;
                for (const attr of Object.values(child.attributes)) {
                    attributes[attr.name] = attr.value;
                }
                styleData[child.tagName] = attributes;
            }
        }
        return styleData;
    };

    addBookmarks = () => {
        this.getParagraphNodes();
        let previousStyle = {};
        for (const node of this.paragraphNodes) {
            if (!isNode(node)) continue;
            const rows = this.select('w:r', node);
            for (const row of rows) {
                if (!isNode(row)) continue;
                const styleData = this.getStyleFromNode(row);
                if (this.bookmarkOpen && !isDeepStrictEqual(styleData, previousStyle)) this.closeBmBefore(row);
                this.startBmBefore(row);
                previousStyle = styleData;
                const textNodes = this.select('w:t', row);
                if (textNodes.length === 0 || !isNode(textNodes[0])) continue;
                const rowText = textNodes[0].textContent!.trim();
                const fragments = rowText.split(this.fragmentsRegExp);
                const nextSibling = row.nextSibling;
                if (fragments.length > 1) {
                    const nd = this.select('w:t', row)[0] as Node;
                    nd['textContent'] = fragments[0] + ' ';
                    this.currentBmText += fragments[0];
                    this.closeBmAfter(row);
                    for (let i = 1; i < fragments.length; i++) {
                        this.currentBmText = fragments[i];
                        const clonedRow = row.cloneNode(true);
                        const nd = this.select('w:t', clonedRow)[0] as Node;
                        nd['textContent'] = fragments[i] + (i < fragments.length - 1 ? ' ' : '');
                        row.parentNode!.insertBefore(clonedRow, nextSibling);
                        this.closeBmBefore(clonedRow);
                        this.startBmBefore(clonedRow);
                    }
                } else {
                    this.currentBmText += rowText;
                }
            }
            if (this.bookmarkOpen) {
                node.appendChild(this.closingBookmark());
                this.bookmarkOpen = false;
            }
        }
    };

    getDocumentInfo() {
        const tables = this.select('//w:tbl', this.doc);
        const columns = this.select('//w:tblGrid/w:gridCol', this.doc);
        const firstColCells = this.select('//w:tr/w:tc[1]//text()', this.doc);
        const totalLength = this.select('//text()', this.doc).reduce(
            (acc: number, cur) => acc + cur.toString().length,
            0
        ) as number;
        const sourceLength = firstColCells.reduce((acc: number, cur) => acc + cur.toString().length, 0) as number;
        const data = { columns: columns.length, tables: tables.length, sourceLength, totalLength };
        return data;
    }

    async createBookmarkTable() {
        if (this.bookmarks.length === 0) return null;
        let table = new Table({
            columnWidths: [4000, 4000, 1500],
            rows: this.bookmarks.map((bookmark) => {
                return new TableRow({
                    children: [
                        new TableCell({
                            children: [
                                new Paragraph({ children: [new TextRun({ text: bookmark.text, font: 'Calibri' })] }),
                            ],
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({ children: [new TextRun({ text: bookmark.text, font: 'Arial' })] }),
                            ],
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({ children: [new TextRun({ text: bookmark.id, font: 'Calibri' })] }),
                            ],
                        }),
                    ],
                });
            }),
        });

        let document = new WordDocument({ sections: [{ children: [table] }] });
        return await Packer.toBuffer(document);
    }

    async createFragmentTable() {
        if (this.bookmarks.length === 0) return null;
        let totalLength = 0;
        let totalLengthInclRedundancy = 0;
        const bookmarksDict: any = {};
        const bookmarksWithoutRedundancy = [];
        for (const bookmark of this.bookmarks) {
            totalLengthInclRedundancy += bookmark.text.length;
            if (!bookmarksDict[bookmark.text]) {
                bookmarksDict[bookmark.text] = [bookmark.id];
                bookmarksWithoutRedundancy.push(bookmark);
                totalLength += bookmark.text.length;
            } else {
                bookmarksDict[bookmark.text] = [this.bookmarkId];
            }
        }

        const redundancy = totalLengthInclRedundancy - totalLength;
        this.fragData = {
            redundancy,
            totalLength,
            redundancyRatio: ((redundancy / totalLengthInclRedundancy) * 100).toFixed(2),
        };
        const milestones = Array.from({ length: 19 }, (value, index) => (index + 1) * 5);
        let currentLength = 0;
        let currentMilestone = 0;

        const table = new Table({
            columnWidths: [4000, 4000, 1100, 400],
            rows: bookmarksWithoutRedundancy.map((bookmark, i) => {
                currentLength += bookmark.text.length;
                // Mark milestones after every 5% of the total text length
                const isMilestone = (currentLength / totalLength) * 100 >= milestones[currentMilestone];
                const idCell = [new TextRun({ text: `${i + 1}`, font: 'Calibri' })];
                if (isMilestone) {
                    idCell.push(
                        new TextRun({
                            text: ` ${milestones[currentMilestone]}%`,
                            font: 'Calibri',
                            color: '5ab5f2',
                            bold: true,
                        })
                    );
                    currentMilestone++;
                }
                return new TableRow({
                    children: [
                        new TableCell({
                            children: [
                                new Paragraph({ children: [new TextRun({ text: bookmark.text, font: 'Calibri' })] }),
                            ],
                        }),
                        new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: '', font: 'Arial' })] })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ children: idCell })],
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({ children: [new TextRun({ text: '', font: 'Arial', size: 4 })] }),
                            ],
                        }),
                    ],
                });
            }),
        });

        const document = new WordDocument({ sections: [{ children: [table] }] });
        return await Packer.toBuffer(document);
    }
}

export default DocxAsXml;

type Bookmark = {
    text: string;
    id: string;
};
