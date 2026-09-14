import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');

const replacements = [
  // Page/section backgrounds
  [/bg-slate-50\/50/g,                 'bg-muted/30'],
  [/bg-slate-50\b/g,                   'bg-muted/50'],
  [/bg-slate-100\b/g,                  'bg-muted'],
  [/bg-slate-900\b/g,                  'bg-background'],
  [/bg-slate-950\b/g,                  'bg-background'],
  [/bg-slate-800\b/g,                  'bg-muted'],
  [/bg-white\b/g,                      'bg-background'],

  // Text
  [/text-slate-900\b/g,               'text-foreground'],
  [/text-slate-800\b/g,               'text-foreground'],
  [/text-slate-700\b/g,               'text-foreground/80'],
  [/text-slate-600\b/g,               'text-muted-foreground'],
  [/text-slate-500\b/g,               'text-muted-foreground'],
  [/text-slate-400\b/g,               'text-muted-foreground/70'],
  [/text-slate-300\b/g,               'text-muted-foreground/50'],
  [/\btext-white\b/g,                 'text-foreground'],
  [/text-slate-50\b/g,                'text-foreground'],

  // Borders
  [/border-slate-200\b/g,             'border-border'],
  [/border-slate-300\b/g,             'border-border'],
  [/border-slate-700\b/g,             'border-border'],
  [/border-slate-800\b/g,             'border-border'],
  [/border-slate-100\b/g,             'border-border/50'],

  // Hover states
  [/hover:bg-slate-50\b/g,            'hover:bg-muted/50'],
  [/hover:bg-slate-100\b/g,           'hover:bg-muted'],
  [/hover:bg-slate-800\b/g,           'hover:bg-muted'],

  // Trading semantics: replace emerald with comet-up, red with comet-down
  // (only in status/trading contexts — wrapped in conservative patterns)
  [/\btext-emerald-[4-9]00\b/g,       'text-comet-up'],
  [/\bbg-emerald-[45]00\b/g,          'bg-comet-up'],
  [/\btext-emerald-[56]00\b/g,        'text-comet-up'],
  [/\bbg-emerald-50\b/g,              'bg-[#0ecb81]/10'],
  [/\bbg-emerald-100\b/g,             'bg-[#0ecb81]/15'],
  [/\btext-emerald-700\b/g,           'text-comet-up'],
  [/\bborder-emerald-200\b/g,         'border-[#0ecb81]/30'],
  [/\btext-red-[4-9]00\b/g,           'text-comet-down'],
  [/\bbg-red-[45]00\b/g,              'bg-comet-down'],
  [/\btext-red-[56]00\b/g,            'text-comet-down'],
  [/\bbg-red-50\b/g,                  'bg-[#f6465d]/10'],
  [/\bbg-red-100\b/g,                 'bg-[#f6465d]/15'],
  [/\btext-red-700\b/g,               'text-comet-down'],
  [/\bborder-red-200\b/g,             'border-[#f6465d]/30'],

  // min-h-screen text-slate-900 compound (common admin pattern)
  [/bg-slate-50 min-h-screen text-slate-900/g, 'bg-background min-h-screen text-foreground'],
];

const excludeFiles = [
  'appearance-form.tsx',
  'GateKioskDashboard.tsx',
  'MobileInspectionSimulator.tsx',
  'InspectionReportCard.tsx'
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (
      (file.endsWith('.tsx') || file.endsWith('.ts')) &&
      !file.endsWith('.gen.ts')
    ) {
      if (excludeFiles.includes(file)) {
        continue;
      }

      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      let matches = 0;

      for (const [regex, replacement] of replacements) {
        const fileMatches = (content.match(regex) || []).length;
        if (fileMatches > 0) {
          matches += fileMatches;
          content = content.replace(regex, replacement);
        }
      }

      if (matches > 0 && content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${path.relative(process.cwd(), fullPath)} (${matches} replacements)`);
      }
    }
  }
}

console.log('Starting color replacement...');
processDirectory(SRC_DIR);
console.log('Done!');
