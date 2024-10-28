import chalk from 'chalk';
import { fxTransfers, fxQuotes, quotes, transfers, discovery, fxTransfers_reverse, fxQuotes_reverse, quotes_reverse, transfers_reverse, discovery_reverse } from './node_modules/@mojaloop/ml-schema-transformer-lib/dist/mappings/fspiopiso20022/index.mjs';

// Function to parse mappings into nested objects and ignore modifiers
function parseMappings(mappingInput) {
  let mappingObj;
  if (typeof mappingInput === 'string') {
    mappingObj = JSON.parse(mappingInput);
  } else {
    mappingObj = mappingInput;
  }

  const nestedMapping = {};

  for (const [key, originalValue] of Object.entries(mappingObj)) {
    const keys = key.split('.');
    let current = nestedMapping;

    // Use let to allow re-assignment of the value
    let value = originalValue;

    // If the value is an array, only take the first element
    if (Array.isArray(value)) {
      value = value[0]; // Ignore the modifier
    }

    for (let i = 0; i < keys.length; i++) {
      const part = keys[i];

      if (i === keys.length - 1) {
        current[part] = value; // Set the value at the last part
      } else {
        // Create nested object if it doesn't exist
        if (!current[part]) {
          current[part] = {};
        }
      }

      current = current[part]; // Move deeper into the nested structure
    }
  }

  return nestedMapping;
}

// Function to print mappings with arrows
function printJsonWithArrows(obj) {
  function indent(level) {
    return '  '.repeat(level); // Helper for indentation
  }

  function printMapping(obj, level = 1) {
    const lines = [];

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        lines.push(chalk.cyan(`${indent(level - 1)}"${key}": {`));
        lines.push(printMapping(value, level + 1).join('\n'));
        lines.push(chalk.cyan(`${indent(level - 1)}}`));
      } else {
        lines.push(
          `${indent(level - 1)}${chalk.green(`"${key}"`)}: ${chalk.yellow('→')} ${chalk.magenta(value)}`
        );
      }
    }

    return lines;
  }

  console.log(chalk.white('{\n') + printMapping(obj).join('\n') + chalk.white('\n}'));
}

function printResourceMapping (resource) {
  // Process each API type and print the mappings
  for (const [apiType, mappingObj] of Object.entries(resource)) {
    console.log(chalk.blue(`Mappings for ${apiType}:\n`));
    const parsedMapping = parseMappings(mappingObj);
    printJsonWithArrows(parsedMapping);
    console.log('\n'); // Add a new line between different API mappings
  }
}

printResourceMapping(fxTransfers);