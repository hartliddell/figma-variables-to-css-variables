const rgbToHex = (color: RGBA | RGB) => {
  const toHex = (value: number) => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  if ('a' in color) {
    const { r, g, b, a } = color;
    if (color.a < 1) {
      return `rgba(${[r, g, b]
        .map((n) => Math.round(n * 255))
        .join(", ")}, ${a.toFixed(4)})`;
    }
    const hex = [toHex(r), toHex(g), toHex(b)].join('');
    return `#${hex}`;
  } else if ('r' in color && 'g' in color && 'b' in color) {
    const { r, g, b } = color;
    const hex = [toHex(r), toHex(g), toHex(b)].join('');
    return `#${hex}`;
  }
}

const getVariablePrimitiveValue = (value: VariableValue) => {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'object' && 'r' in value && 'g' in value && 'b' in value) {
    return rgbToHex(value);
  }
  // ELSE fetch and return alias
};

const castTokenNameToCssVarName = (name: string): string => {
  return `--${name.replace(/\//g, '-').replace(/ /g, '-')}`;
};

console.clear();

const getCSSVarsFromVariableCollections = () => {
  const localCollections = figma.variables.getLocalVariableCollections();

  let tokenModes: any[] = [];
  let tokenVariablesIds: string[] = [];

  localCollections.some((c) => {
    if (c.name === 'tokens') {
      tokenModes = c.modes;
      tokenVariablesIds = c.variableIds;
      return true;
    }
  });

  const tokenVariables = tokenVariablesIds.map((id) => {
    return figma.variables.getVariableById(id);
  });

  return tokenModes.reduce((acc, mode) => {
    const variables = tokenVariables.map((variable) => {
      if (variable) {
        const tokenValue: VariableValue = variable.valuesByMode[mode.modeId];
        if (tokenValue) {
          const cssVar = castTokenNameToCssVarName(variable.name);
          const value = getVariablePrimitiveValue(tokenValue);
          return `${cssVar}: ${value};`;
        }
      }
    }).filter(Boolean);
    acc[mode.name] = variables;
    return acc;
  }, {});
};

figma.ui.onmessage = (e) => {
  if (e.type === "EXPORT") {
    const data = getCSSVarsFromVariableCollections();
    figma.ui.postMessage({ type: "EXPORT_RESULT", data });
  }
};

figma.showUI(__html__, { themeColors: true, width: 400, height: 450 });
