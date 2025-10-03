const csv = require('csv-parser');
const { Readable } = require('stream');

function parseCSV(csvText) {
  return new Promise((resolve, reject) => {
    if (!csvText || csvText.trim().length === 0) {
      reject(new Error('CSV content is empty'));
      return;
    }
    
    const results = [];
    const stream = Readable.from([csvText]);
    
    stream
      .pipe(csv({
        skipEmptyLines: true,
        skipLinesWithError: true
      }))
      .on('data', (data) => {
        // Clean up the data
        const cleanedData = {};
        Object.keys(data).forEach(key => {
          const cleanKey = key.trim();
          const value = data[key];
          
          // Try to parse numbers
          if (value && !isNaN(value) && !isNaN(parseFloat(value))) {
            cleanedData[cleanKey] = parseFloat(value);
          } else {
            cleanedData[cleanKey] = value ? value.toString().trim() : '';
          }
        });
        
        results.push(cleanedData);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      });
  });
}

function parseJSON(jsonText) {
  try {
    if (!jsonText || jsonText.trim().length === 0) {
      throw new Error('JSON content is empty');
    }
    
    const data = JSON.parse(jsonText);
    
    if (!Array.isArray(data)) {
      throw new Error('JSON must be an array of objects');
    }
    
    if (data.length === 0) {
      throw new Error('JSON array cannot be empty');
    }
    
    // Validate that each item is an object
    data.forEach((item, index) => {
      if (typeof item !== 'object' || item === null) {
        throw new Error(`Item at index ${index} must be an object`);
      }
    });
    
    return data;
  } catch (error) {
    throw new Error(`JSON parsing error: ${error.message}`);
  }
}

function detectFileType(content) {
  const trimmed = content.trim();
  
  // Check if it starts with [ or { (JSON)
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    return 'json';
  }
  
  // Check if it has comma-separated headers (CSV)
  const firstLine = trimmed.split('\n')[0];
  if (firstLine && firstLine.includes(',')) {
    return 'csv';
  }
  
  throw new Error('Unable to detect file type. Please ensure the file is valid CSV or JSON.');
}

function validateDataStructure(data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Data must be a non-empty array');
  }
  
  const firstRow = data[0];
  if (typeof firstRow !== 'object' || firstRow === null) {
    throw new Error('Each data row must be an object');
  }
  
  // Check if we have at least some recognizable fields
  const keys = Object.keys(firstRow);
  if (keys.length === 0) {
    throw new Error('Data rows cannot be empty');
  }
  
  return true;
}

function limitRows(data, maxRows = 200) {
  if (data.length > maxRows) {
    console.log(`Limiting data from ${data.length} to ${maxRows} rows`);
    return data.slice(0, maxRows);
  }
  return data;
}

function calculateDataScore(originalLength, parsedLength, hasErrors = false) {
  if (originalLength === 0) return 0;
  
  const parseRatio = parsedLength / originalLength;
  let score = Math.round(parseRatio * 100);
  
  // Penalize if there were parsing errors
  if (hasErrors) {
    score = Math.max(0, score - 10);
  }
  
  return Math.min(100, score);
}

async function parseData(content, fileType = null) {
  try {
    // Input validation
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid content: must be a non-empty string');
    }
    
    if (content.trim().length === 0) {
      throw new Error('Content cannot be empty');
    }
    
    // Auto-detect file type if not provided
    const detectedType = fileType || detectFileType(content);
    
    let parsedData;
    let originalLength = 0;
    
    if (detectedType === 'csv') {
      // Count original lines for scoring
      originalLength = content.split('\n').filter(line => line.trim()).length - 1; // -1 for header
      parsedData = await parseCSV(content);
    } else if (detectedType === 'json') {
      const tempData = JSON.parse(content);
      originalLength = Array.isArray(tempData) ? tempData.length : 1;
      parsedData = parseJSON(content);
    } else {
      throw new Error(`Unsupported file type: ${detectedType}`);
    }
    
    // Validate structure
    validateDataStructure(parsedData);
    
    // Limit rows for processing
    const limitedData = limitRows(parsedData);
    
    // Calculate data quality score
    const dataScore = calculateDataScore(originalLength, limitedData.length);
    
    return {
      data: limitedData,
      fileType: detectedType,
      originalLength,
      parsedLength: limitedData.length,
      dataScore,
      hasErrors: limitedData.length < parsedData.length
    };
    
  } catch (error) {
    throw new Error(`Data parsing failed: ${error.message}`);
  }
}

module.exports = {
  parseData,
  parseCSV,
  parseJSON,
  detectFileType,
  validateDataStructure,
  limitRows,
  calculateDataScore
};