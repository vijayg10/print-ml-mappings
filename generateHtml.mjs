import fs from 'fs';
import * as Mappings from './node_modules/@mojaloop/ml-schema-transformer-lib/dist/mappings/fspiopiso20022/index.mjs';


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

const generateHtml = (mappings) => {
  let html = `
      <ul class="tree">`;

  const buildMapping = (obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        html += `<li><span class="key">${key}</span>
                    <ul>`;
        buildMapping(value); // Recursively build nested objects
        html += `</ul></li>`;
      } else {
        html += `<li><span class="key">${key}</span><span class="arrow">➔</span><span class="value">${value}</span></li>`;
      }
    }
  };

  buildMapping(mappings);

  html += `
      </ul>`;
  
  return html;
};


function printHtmlResourceMapping (resource) {
  // Process each API type and print the mappings
  let htmlContent = '';
  for (const [apiType, mappingObj] of Object.entries(resource)) {
    const parsedMapping = parseMappings(mappingObj);
    htmlContent += `<h2>Mappings for ${apiType}:</h2><br />` + generateHtml(parsedMapping);
  }
  return htmlContent;
}

let tabButtons = '';
let tabContents = '';
let firstTab = true;
// Iterate through Mappings and generate HTML output
for (const [apiType, mappingObj] of Object.entries(Mappings)) {

  tabButtons += `<button class="tab-button" id="button-${apiType}" onclick="showTab('${apiType}')">${apiType}</button>`;

  const htmlContent = printHtmlResourceMapping(mappingObj);

  tabContents += `
      <div class="tab" id="tab-${apiType}" style="display: ${firstTab ? 'block' : 'none'};">
          ${htmlContent}
      </div>`;
  firstTab = false;
}

const finalHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tab Example</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333; margin: 20px; }
        .tab { display: none; }
        .tab-button { padding: 10px; width: 150px; cursor: pointer; margin-right: 5px; }
        .tab-button.active { background-color: #ccc; }
        .tab-content { border: 1px solid #ccc; padding: 10px; margin-top: 5px; }
        h2 { color: #0056b3; }
        .tree { list-style-type: none; padding-left: 20px; }
        .tree ul { padding-left: 20px; }
        .tree li { margin: 5px 0; }
        .key { color: #333; font-weight: bold; }
        .arrow { color: #e2b500; font-size: 20px; padding: 0 10px; }
        .value { color: #d9534f; }
      </style>
</head>
<body>

<div id="tabs">
    <div id="tab-buttons">${tabButtons}</div>
    <div id="tab-contents">${tabContents}</div>
</div>

<script>
    function showTab(tabName) {
        const tabs = document.querySelectorAll('.tab');
        const buttons = document.querySelectorAll('.tab-button');

        tabs.forEach((tab, i) => {
            tab.style.display = tab.id === ('tab-' + tabName) ? 'block' : 'none';
        });
        buttons.forEach((button, i) => {
            button.classList.toggle('active', button.id === ('button-' + tabName));
        });
    }

    // Show the first tab by default
    // showTab(0);
</script>

</body>
</html>
`;


fs.writeFileSync('mappings_output.html', finalHtml);

console.log('HTML output generated: mappings_output.html');
