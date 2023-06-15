import { DOMParser } from '@xmldom/xmldom';
import fs from 'fs';
import xpath from 'xpath';
import { decompressDocx } from './fileActions';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun } from 'docx';
import { isDeepStrictEqual } from 'util';
import { FileItem } from '../../types';
import { exec, execSync } from 'child_process';
/**
 * Split the docx file into fragments and bookmark them in the original file.
 * Outputs 3 files:
 * - original docx file with added bookmarks
 * - docx table with all fragments, 3 columns for each: original text, original text (again), bookmark id
 * - docx table with fragments with removed redundancy, 4 columns for each: original text, blank (PH for translation), fragment number, blank(PH)
 * @param sourceFile
 */
export async function bookmarkAndFragmentDocx(sourceFile: FileItem) {
    const originalDocxDirectory = sourceFile.path.replace(`${sourceFile.name}${sourceFile.extension}`, '');
    console.log('Fragmenting file:');
    console.log(JSON.stringify(sourceFile, null, '\t'));
    let currentBmText = '';
    let bookmarks = [];
    let bookmarkId = 1;
    let bookmarkOpen = false;
    let previousStyle = {};
    const bookmarkTableFilePath = `${originalDocxDirectory}${sourceFile.name}_TT.${sourceFile.extension}`;
    const fragmentTableFilePath = `${originalDocxDirectory}${sourceFile.name}_TT_TAB.${sourceFile.extension}`;
    // End fragment when a sentence ends with a period, question mark, exclamation point or three dots followed by a space
    const fragmentsRegExp = /(?<=[.!?…])\s/;
    // Create a backup of the original docx file
    fs.copyFile(sourceFile.path, `${originalDocxDirectory}${sourceFile.name}_backup.${sourceFile.extension}`, (err) => {
        if (err) throw err;
        console.log('Backup created');
    });
    const { dir, folderName } = await decompressDocx(sourceFile.path);
    console.log('decompressed docx');
    console.log(dir);
    console.log(folderName);
    const doc = new DOMParser().parseFromString(fs.readFileSync(`${dir}/word/document.xml`, 'utf-8'));

    const select = xpath.useNamespaces({ w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' });
    const nodes = select(`//w:p[not(descendant::w:p) or /w:t]`, doc);

    const startBmBefore = (node: Node) => {
        if (bookmarkOpen) return;
        const bookmark = openingBookmark();
        node.parentNode.insertBefore(bookmark, node);
        bookmarkOpen = true;
    };

    const closeBmAfter = (node: Node) => {
        if (!bookmarkOpen) return;
        const bookmark = closingBookmark();
        node.parentNode.insertBefore(bookmark, node.nextSibling);
        bookmarkOpen = false;
    };

    const closeBmBefore = (node: Node) => {
        if (!bookmarkOpen) return;
        const bookmark = closingBookmark();
        node.parentNode.insertBefore(bookmark, node);
        bookmarkOpen = false;
    };

    const openingBookmark = () => {
        const bookmarkStart = doc.createElement('w:bookmarkStart');
        bookmarkStart.setAttribute('w:id', bookmarkId.toString());
        bookmarkStart.setAttribute('w:name', `TT_${bookmarkId.toString().padStart(7, '0')}`);
        return bookmarkStart;
    };

    const closingBookmark = () => {
        const bookmarkEnd = doc.createElement('w:bookmarkEnd');
        bookmarkEnd.setAttribute('w:id', bookmarkId.toString());
        bookmarkEnd.setAttribute('w:name', `TT_${bookmarkId.toString().padStart(7, '0')}`);
        if (currentBmText && !containsOnlyNumbersAndSpaces(currentBmText)) {
            bookmarks.push({ text: currentBmText, id: `TT_${bookmarkId.toString().padStart(7, '0')}` });
        }
        currentBmText = '';
        bookmarkId++;
        return bookmarkEnd;
    };

    function containsOnlyNumbersAndSpaces(str) {
        const stringWithoutSpaces = str.replace(/\s/g, '');
        return /^\d+$/.test(stringWithoutSpaces);
    }

    for (const node of nodes) {
        if (!isNode(node)) continue;
        const rows = select('w:r', node);
        for (const row of rows) {
            if (!isNode(row)) continue;
            const style = select('w:rPr', row)[0] as Node;
            const styleData = {};
            // Get style data to end the fragment if the style changes
            if (style && style.childNodes) {
                for (const child of Object.values(style.childNodes) as Element[]) {
                    const attributes = {};
                    if (!child || !child.tagName) continue;
                    for (const attr of Object.values(child.attributes)) {
                        attributes[attr.name] = attr.value;
                    }
                    styleData[child.tagName] = attributes;
                }
            }
            if (bookmarkOpen && !isDeepStrictEqual(styleData, previousStyle)) closeBmBefore(row);
            startBmBefore(row);
            previousStyle = styleData;
            const textNodes = select('w:t', row);
            if (textNodes.length === 0 || !isNode(textNodes[0])) continue;
            const rowText = textNodes[0].textContent.trim();
            const fragments = rowText.split(fragmentsRegExp);
            const nextSibling = row.nextSibling;
            if (fragments.length > 1) {
                select('w:t', row)[0]['textContent'] = fragments[0] + ' ';
                currentBmText += fragments[0];
                closeBmAfter(row);
                for (let i = 1; i < fragments.length; i++) {
                    currentBmText = fragments[i];
                    const clonedRow = row.cloneNode(true);
                    select('w:t', clonedRow)[0]['textContent'] = fragments[i] + (i < fragments.length - 1 ? ' ' : '');
                    row.parentNode.insertBefore(clonedRow, nextSibling);
                    closeBmBefore(clonedRow);
                    startBmBefore(clonedRow);
                }
            } else {
                currentBmText += rowText;
            }
        }
        if (bookmarkOpen) {
            node.appendChild(closingBookmark());
            bookmarkOpen = false;
        }
    }

    let table = new Table({
        columnWidths: [4000, 4000, 1500],
        rows: bookmarks.map((bookmark) => {
            return new TableRow({
                children: [
                    new TableCell({
                        children: [
                            new Paragraph({ children: [new TextRun({ text: bookmark.text, font: 'Calibri' })] }),
                        ],
                    }),
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: bookmark.text, font: 'Arial' })] })],
                    }),
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: bookmark.id, font: 'Calibri' })] })],
                    }),
                ],
            });
        }),
    });

    let document = new Document({ sections: [{ children: [table] }] });
    Packer.toBuffer(document).then((buffer) => {
        fs.writeFileSync(bookmarkTableFilePath, buffer);
    });

    let totalLength = 0;
    let totalLengthInclRedundancy = 0;
    const bookmarksDict = {};
    const bookmarksWithoutRedundancy = [];
    for (const bookmark of bookmarks) {
        totalLengthInclRedundancy += bookmark.text.length;
        if (!bookmarksDict[bookmark.text]) {
            bookmarksDict[bookmark.text] = [bookmark.id];
            bookmarksWithoutRedundancy.push(bookmark);
            totalLength += bookmark.text.length;
        } else {
            bookmarksDict[bookmark.text] = [bookmarkId];
        }
    }

    const milestones = Array.from({ length: 19 }, (value, index) => (index + 1) * 5);
    let currentLength = 0;
    let currentMilestone = 0;

    table = new Table({
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
                        children: [new Paragraph({ children: [new TextRun({ text: '', font: 'Arial', size: 4 })] })],
                    }),
                ],
            });
        }),
    });

    document = new Document({ sections: [{ children: [table] }] });
    Packer.toBuffer(document).then((buffer) => {
        fs.writeFileSync(fragmentTableFilePath, buffer);
    });

    const xml = doc.toString();
    fs.rmSync(`${dir}/word/document.xml`);
    fs.writeFileSync(`${dir}/word/document.xml`, xml, 'utf-8');
    // Check the word/document directory
    const files = fs.readdirSync(`${dir}/word`);
    for (const file of files) {
        console.log(file);
    }
    execSync(`cd "${dir}";zip -r "${sourceFile.path}" ./*`).toString();
    // remove the temp directory
    fs.rmSync(dir, { recursive: true, force: true });
    const redundancy = totalLengthInclRedundancy - totalLength;
    return {
        files: { original: sourceFile, bookmarkTable: bookmarkTableFilePath, fragmentTable: fragmentTableFilePath },
        fragData: {
            redundancy,
            redundancyRatio: ((redundancy / totalLengthInclRedundancy) * 100).toFixed(2),
            totalLength,
        },
    };
}

const isNode = (node: unknown): node is Node => {
    return node.hasOwnProperty('childNodes');
};
