const fs = require('fs');

const csv = fs.readFileSync('out.csv', 'utf8');
const lines = csv.split('\n');

const data = [];
for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Skip headers and bad lines
    if (line.includes('STT,Mã NV') || line.includes('tạo ra ngẫu nhiên') || line.includes('npm warn')) continue;

    // Handle potential BOM or special chars
    const cleanLine = line.replace(/^\uFEFF/, '');
    
    const parts = cleanLine.split(',');
    if (parts.length >= 6) {
        data.push({
            id: parseInt(parts[0], 10),
            code: parts[1],
            fullName: parts[2],
            department: parts[3],
            title: parts[4],
            email: parts[5]
        });
    }
}

const tsContent = `export const EMPLOYEES_MOCK = ${JSON.stringify(data, null, 4)};\n`;
fs.writeFileSync('src/app/core/mocks/employees.mock.ts', tsContent);
console.log('Successfully created employees.mock.ts with ' + data.length + ' records.');
