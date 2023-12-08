// INSPO - https://github.com/jake-figma/variables-import-export/blob/main/code.js
// This plugin will generate a sample codegen plugin
// that appears in the Element tab of the Inspect panel.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.hmodel" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This provides the callback to generate the code.
/*
figma.codegen.on('generate', (event) => {
  const code = `{
    name: "${event.node.name}"
  }`;
  return [
    {
      language: "PLAINTEXT",
      code: code,
      title: "Codegen Plugin",
    },
  ];
});
*/

type RGBAType = {
  r: number;
  g: number;
  b: number;
  a: number;
};

const rgbToHex = ({ r, g, b, a }: RGBAType) => {
  if (a !== 1) {
    return `rgba(${[r, g, b]
      .map((n) => Math.round(n * 255))
      .join(", ")}, ${a.toFixed(4)})`;
  }
  const toHex = (value: number) => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const hex = [toHex(r), toHex(g), toHex(b)].join("");
  return `#${hex}`;
}

const getVariableariablePrimitiveValue = (value: VariableValue) => {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'object' && 'r' in value && 'g' in value && 'b' in value) {
    return rgbToHex(value as RGBAType);
  }
  // ELSE fetch and return alias
};

const castTokenNameToCssVar = (name: string): string => {
  return `--${name.replace(/\//g, '-').replace(/ /g, '-')}`;
};

console.clear();

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

// console.log('tokenVariables', tokenVariables);
// console.log('tokenModes', tokenModes);
// const foo: RGBAType = tokenVariables[0]?.valuesByMode[tokenModes[1].modeId] as RGBAType;
// console.log(tokenVariables[0]?.name, rgbToHex(foo).toUpperCase());

tokenModes.forEach((mode) => {
  console.log('Token mode:', mode.name);
  tokenVariables.forEach((variable) => {
    if (variable) {
      const tokenValue: VariableValue = variable.valuesByMode[mode.modeId];
      if (tokenValue) {
        const cssVar = castTokenNameToCssVar(variable.name);
        const value = getVariableariablePrimitiveValue(tokenValue);
        console.log(cssVar, value);
      }
    }
  });
});

const exportToCSSVariables = () => {
  figma.ui.postMessage({ type: "EXPORT_RESULT", data: 'hello world' });
};

figma.ui.onmessage = (e) => {
  console.log("code received message", e);
  if (e.type === "EXPORT") {
    exportToCSSVariables();
  }
};

figma.showUI(__html__, { themeColors: true });
