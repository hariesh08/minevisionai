const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Fix backticks
    content = content.replace(/\`short\)/g, "'short')");
    content = content.replace(/\`shortYear\)/g, "'shortYear')");
    content = content.replace(/\`shortYear'/g, "'shortYear'");
    content = content.replace(/'Resolved\`/g, "'Resolved'");
    content = content.replace(/'2-digit\`/g, "'2-digit'");
    content = content.replace(/\`dash\)/g, "'dash')");
    content = content.replace(/\`full\)/g, "'full')");
    content = content.replace(/\`iso\)/g, "'iso')");
    content = content.replace(/\`short\}/g, "'short'}");
    content = content.replace(/\`shortYear\}/g, "'shortYear'}");

    // Let's also fix the `>18 Sep<` replacements that might be `{getRelativeDate(0, 'short')}`
    // If we have `>{getRelativeDate(0, 'short')}<` it's valid JSX.
    // Let's fix bad unclosed tags
    content = content.replace(/>\{getRelativeDate\(([-0-9]+), 'short'\)}\</g, ">{getRelativeDate($1, 'short')}<");
    
    // Fix src/pages/AuditLog.tsx line 88: eventType === `Corrective Action' -> 'Corrective Action'
    content = content.replace(/\`Corrective Action'/g, "'Corrective Action'");

    // Fix Topbar.tsx import just in case
    content = content.replace(/import\s*\{\s*import\s*\{\s*getRelativeDate\s*\}\s*from\s*'[^']+';/g, "import { getRelativeDate } from '../utils/dateUtils';\nimport {");
    content = content.replace(/import\s*\{\r?\nimport\s*\{\s*getRelativeDate\s*\}\s*from\s*'[^']+';/g, "import { getRelativeDate } from '../utils/dateUtils';\nimport {");

    // Any other single quote/backtick mismatches
    content = content.replace(/\`2-digit'/g, "'2-digit'");
    content = content.replace(/'2-digit\}/g, "'2-digit'}");

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log("Fixed " + file);
    }
});
