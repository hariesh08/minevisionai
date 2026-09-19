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
let importPathMap = {
    'api.ts': '../utils/dateUtils',
    'mockData.ts': '../utils/dateUtils',
    'MineGuardContext.tsx': '../utils/dateUtils',
    'Dashboard.tsx': '../utils/dateUtils',
    'Reports.tsx': '../utils/dateUtils',
    'AuditLog.tsx': '../utils/dateUtils',
    'CorrectiveActions.tsx': '../utils/dateUtils',
    'Compliance.tsx': '../utils/dateUtils',
    'RiskAI.tsx': '../utils/dateUtils'
};

const getRelativeDateImportStr = (filePath) => {
    const filename = path.basename(filePath);
    let relative = '../utils/dateUtils';
    if (filePath.includes('pages\\') || filePath.includes('services\\') || filePath.includes('context\\') || filePath.includes('data\\')) {
        relative = '../utils/dateUtils';
    }
    return `import { getRelativeDate } from '${relative}';\n`;
};

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // We only process if it has dates
    if (!content.includes('18 ') && !content.includes('18-') && !content.includes('17 ') && !content.includes('19 ') && !content.includes('2026')) return;

    let modified = false;

    // Helper to replace inside strings safely
    // 18 September 2026
    if(content.includes('18 September 2026')) {
        content = content.replace(/'18 September 2026'/g, "getRelativeDate(0, 'full')");
        content = content.replace(/>18 September 2026</g, ">{getRelativeDate(0, 'full')}<");
        content = content.replace(/18 September 2026/g, "${getRelativeDate(0, 'full')}");
        modified = true;
    }
    
    // 19 September 2026
    if(content.includes('19 September 2026')) {
        content = content.replace(/'19 September 2026'/g, "getRelativeDate(1, 'full')");
        modified = true;
    }

    // 17 September 2026
    if(content.includes('17 September 2026')) {
        content = content.replace(/'17 September 2026'/g, "getRelativeDate(-1, 'full')");
        modified = true;
    }

    // 18 Sep 2026
    if(content.includes('18 Sep 2026')) {
        content = content.replace(/'18 Sep 2026'/g, "getRelativeDate(0, 'shortYear')");
        content = content.replace(/>18 Sep 2026</g, ">{getRelativeDate(0, 'shortYear')}<");
        content = content.replace(/18 Sep 2026/g, "${getRelativeDate(0, 'shortYear')}");
        modified = true;
    }

    // 17 Sep 2026
    if(content.includes('17 Sep 2026')) {
        content = content.replace(/'17 Sep 2026'/g, "getRelativeDate(-1, 'shortYear')");
        content = content.replace(/>17 Sep 2026</g, ">{getRelativeDate(-1, 'shortYear')}<");
        content = content.replace(/17 Sep 2026/g, "${getRelativeDate(-1, 'shortYear')}");
        modified = true;
    }
    
    // 18-09-2026
    if(content.includes('18-09-2026')) {
        content = content.replace(/'18-09-2026'/g, "getRelativeDate(0, 'dash')");
        modified = true;
    }
    // 19-09-2026
    if(content.includes('19-09-2026')) {
        content = content.replace(/'19-09-2026'/g, "getRelativeDate(1, 'dash')");
        modified = true;
    }
    // 17-09-2026
    if(content.includes('17-09-2026')) {
        content = content.replace(/'17-09-2026'/g, "getRelativeDate(-1, 'dash')");
        modified = true;
    }
    // 20-09-2026
    if(content.includes('20-09-2026')) {
        content = content.replace(/'20-09-2026'/g, "getRelativeDate(2, 'dash')");
        modified = true;
    }

    // 18 Sep
    if(content.includes('18 Sep')) {
        content = content.replace(/'18 Sep'/g, "getRelativeDate(0, 'short')");
        content = content.replace(/>18 Sep</g, ">{getRelativeDate(0, 'short')}<");
        content = content.replace(/18 Sep/g, "${getRelativeDate(0, 'short')}");
        modified = true;
    }

    // 2026-09-18
    if(content.includes('2026-09-18')) {
        content = content.replace(/2026-09-18/g, "${getRelativeDate(0, 'iso')}");
        modified = true;
    }
    
    // 18Sep2026
    if(content.includes('18Sep2026')) {
        content = content.replace(/18Sep2026/g, "${getRelativeDate(0, 'file')}");
        modified = true;
    }

    if (modified) {
        // Fix template string usages that got broken
        content = content.replace(/'([^']*\$\{getRelativeDate[^}]+\}[^']*)'/g, "`$1`");
        // Ensure import exists if we added getRelativeDate
        if (content.includes('getRelativeDate') && !content.includes('import { getRelativeDate }')) {
            const lines = content.split('\n');
            const importStr = getRelativeDateImportStr(file);
            let importIndex = 0;
            // Find last import
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].startsWith('import ')) {
                    importIndex = i + 1;
                }
            }
            lines.splice(importIndex, 0, importStr);
            content = lines.join('\n');
        }
        
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated dates in ${file}`);
    }
});
