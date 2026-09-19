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

    // Fix imports
    content = content.replace(/import \{\r?\nimport \{ getRelativeDate \} from '\.\.\/utils\/dateUtils';\r?\n/g, "import { getRelativeDate } from '../utils/dateUtils';\nimport {\n");
    
    // Some files might have import at the very top before 'import React'
    // but the regex script I used did:
    // lines.splice(importIndex, 0, importStr)
    // If it was inserted inside a destructured import...
    content = content.replace(/import \{\nimport \{ getRelativeDate \} from '[^']+';\n/g, "import { getRelativeDate } from '../utils/dateUtils';\nimport {\n");

    // Fix bad insertions in strings
    // like >{getRelativeDate(0, 'short')}< when it's just meant to be a string inside an object
    // Wait, the regex replaced '18 Sep' with >{...}< ? No, it replaced `'18 Sep'` with `getRelativeDate(...)`
    // but >18 Sep< was replaced with >{getRelativeDate(...)}<
    // but plain `18 Sep` was replaced with `${getRelativeDate(...)}`
    // So if it was inside a string literal, it might look like: `... ${getRelativeDate(...)} ...` which is valid if it's a template string (but I didn't change '' to ``).
    
    // Oh, I did:
    // content = content.replace(/'([^']*\$\{getRelativeDate[^}]+\}[^']*)'/g, "`$1`");
    // This fixed the template strings.

    // Let's look at the errors.
    // src/context/MineGuardContext.tsx(479,75): error TS1005: ',' expected.
    // src/context/MineGuardContext.tsx(479,119): error TS1002: Unterminated string literal.

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log("Fixed imports in " + file);
    }
});
