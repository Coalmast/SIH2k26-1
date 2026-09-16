module.exports = function(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirty = false;

  // 1. Wrap JSX text
  root.find(j.JSXText).forEach(path => {
    const text = path.value.value;
    const trimmed = text.trim();
    if (!trimmed || trimmed.length === 0) return;
    
    // Ignore small structural things
    if (trimmed === '-' || trimmed === '|' || trimmed === '&' || trimmed === '/') return;
    
    // Basic key generation from text (e.g., "Hello World" -> "hello_world")
    const key = trimmed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 30);
    
    // Create the replacement: {t('key', 'Original text')}
    path.replace(
      j.jsxExpressionContainer(
        j.callExpression(j.identifier('t'), [
          j.literal(key || 'text'),
          j.literal(trimmed)
        ])
      )
    );
    dirty = true;
  });

  if (!dirty) return root.toSource();

  // 2. Add import { useTranslation } from 'react-i18next'
  const hasImport = root.find(j.ImportDeclaration, {
    source: { value: 'react-i18next' }
  }).size() > 0;

  if (!hasImport) {
    const importStmts = root.find(j.ImportDeclaration);
    const newImport = j.importDeclaration(
      [j.importSpecifier(j.identifier('useTranslation'))],
      j.literal('react-i18next')
    );
    if (importStmts.size() > 0) {
      importStmts.at(0).insertBefore(newImport);
    } else {
      root.get().node.program.body.unshift(newImport);
    }
  }

  // Helper to inject the hook into a component body
  function injectHook(path) {
    const body = path.node.body;
    if (!body) return;
    
    if (body.type === 'BlockStatement') {
      const hasT = j(path).find(j.VariableDeclarator, {
        id: { type: 'ObjectPattern', properties: [{ key: { name: 't' } }] }
      }).size() > 0;
      
      if (!hasT) {
        body.body.unshift(
          j.variableDeclaration('const', [
            j.variableDeclarator(
              j.objectPattern([
                j.objectProperty.from({
                  key: j.identifier('t'),
                  value: j.identifier('t'),
                  shorthand: true
                })
              ]),
              j.callExpression(j.identifier('useTranslation'), [])
            )
          ])
        );
      }
    } else {
      // It's an implicit return arrow function: () => <div/>
      path.node.body = j.blockStatement([
        j.variableDeclaration('const', [
            j.variableDeclarator(
              j.objectPattern([
                j.objectProperty.from({
                  key: j.identifier('t'),
                  value: j.identifier('t'),
                  shorthand: true
                })
              ]),
              j.callExpression(j.identifier('useTranslation'), [])
            )
          ]),
        j.returnStatement(body)
      ]);
    }
  }

  // 3. Inject const { t } = useTranslation(); into React components
  // We identify components as functions starting with an Uppercase letter that return JSX.
  
  root.find(j.FunctionDeclaration).forEach(path => {
    const name = path.node.id ? path.node.id.name : '';
    if (name && /^[A-Z]/.test(name)) {
      // Check if it has JSX inside
      if (j(path).find(j.JSXElement).size() > 0) {
        injectHook(path);
      }
    }
  });

  root.find(j.VariableDeclarator).forEach(path => {
    const name = path.node.id && path.node.id.name ? path.node.id.name : '';
    if (name && /^[A-Z]/.test(name)) {
      if (path.node.init && (path.node.init.type === 'ArrowFunctionExpression' || path.node.init.type === 'FunctionExpression')) {
        if (j(path).find(j.JSXElement).size() > 0) {
          injectHook(path.get('init'));
        }
      }
    }
  });

  return root.toSource();
};
