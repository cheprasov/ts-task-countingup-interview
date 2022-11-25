import fs from 'fs';
import LineReader from '../file/LineReader';
import PromisePool from '../promise/PromisePool';
import UrlReader from '../reader/UrlReader';

console.clear();

const filename = process.argv[2];
if (!filename) {
    console.error('Please provide correct path to file');
    process.exit(1);
}

if (!fs.existsSync(filename)) {
    console.error('Can not find file');
    process.exit(1);
}

const FETCH_POOL_SIZE = 5;

const outputFile = 'results.json';
const foutput = fs.openSync(outputFile, 'w');

let processedUrls = 0;

const writeData = async (d: any): Promise<void> => {
    const data = (processedUrls > 0 ? ',\n': '' ) + JSON.stringify(d, null, 2).replace(/^/gm, '  ');
    fs.writeFileSync(foutput, data);
    processedUrls += 1;
    return;
}

const processUrl = async (url: string): Promise<void> => {
    console.log(Date.now(), 'Fetching started', url);
    const reader = new UrlReader();
    return reader.read(url).then((r) => {
        console.log(Date.now(), 'Fetshing done', url);
        writeData(r);
        console.log(Date.now(), 'Result saved', url);
    });
}

const run = async () => {
    fs.writeFileSync(foutput, '[\n');
    const fetchPool = new PromisePool(FETCH_POOL_SIZE);
    const lineReader = new LineReader(filename);

    let urlsCount = 0;
    while (!lineReader.isEOF()) {
        const url = lineReader.readNotEmptyLine();
        if (!url) {
            continue;
        }
        urlsCount += 1;
        await fetchPool.waitFree();
        await fetchPool.add(processUrl(url));
    }
    lineReader.close();
    await fetchPool.waitAll();
    fs.writeFileSync(foutput, '\n]');
    fs.closeSync(foutput);

    console.log('Found urls', urlsCount);
    console.log('Processed urls', processedUrls);
}
run();