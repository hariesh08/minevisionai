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

    // MineGuardContext fixes
    content = content.replace(/newStatus === 'Resolved`/g, "newStatus === 'Resolved'");
    content = content.replace(/\{ hour: '2-digit', minute: '2-digit`/g, "{ hour: '2-digit', minute: '2-digit'");
    content = content.replace(/date: getRelativeDate\(0, `shortYear'\),/g, "date: getRelativeDate(0, 'shortYear'),");
    content = content.replace(/\$\{getRelativeDate\(0, `short'\)\} \$\{timeStr\}/g, "${getRelativeDate(0, 'short')} ${timeStr}");
    content = content.replace(/import\s*{\s*getRelativeDate\s*}\s*from\s*'[^']+';\s*import\s*\{\s*import\s*\{\s*getRelativeDate\s*\}\s*from\s*'[^']+';/g, "import { getRelativeDate } from '../utils/dateUtils';\nimport {");
    
    // Topbar fix
    content = content.replace(/import \{ getRelativeDate \} from '\.\.\/utils\/dateUtils';\r?\nimport React, \{ useState, useRef, useEffect \} from 'react';\r?\nimport \{\r?\nimport \{ getRelativeDate \} from '\.\.\/utils\/dateUtils';/g, "import { getRelativeDate } from '../utils/dateUtils';\nimport React, { useState, useRef, useEffect } from 'react';\nimport {");
    content = content.replace(/import\s*\{\r?\nimport\s*\{\s*getRelativeDate\s*\}\s*from\s*'\.\.\/utils\/dateUtils';/g, "import { getRelativeDate } from '../utils/dateUtils';\nimport {");

    // MineZoneMap JSX fixes
    content = content.replace(/className=\{`text-base font-bold mt-0.5 \$\{/g, "className={`text-base font-bold mt-0.5 ${");
    // wait, what is broken in MineZoneMap? 
    // let's just restore it from backup if I can? I can't.

    // AuditLog and Reports unclosed tags:
    content = content.replace(/>\{getRelativeDate\(([^,]+), '([^']+)'\)}\</g, ">{getRelativeDate($1, '$2')}<");
    content = content.replace(/>\{getRelativeDate\(([^,]+), '([^']+)'\)}/g, ">{getRelativeDate($1, '$2')}");

    // Also fixing broken JSX where {getRelativeDate(0, 'short')} was replaced as `{getRelativeDate(0, 'short')}` inside a tag
    content = content.replace(/<span[^>]*>`\$\{getRelativeDate/g, "<span>{getRelativeDate");
    content = content.replace(/\}`<\/span>/g, "}</span>");
    content = content.replace(/<strong[^>]*>`\$\{getRelativeDate[^}]+\}`<\/strong>/g, (match) => {
        return match.replace(/`/g, "").replace(/\$\{/g, "{");
    });
    content = content.replace(/<span[^>]*>`\$\{getRelativeDate[^}]+\}`<\/span>/g, (match) => {
        return match.replace(/`/g, "").replace(/\$\{/g, "{");
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log("Fixed " + file);
    }
});
