const stringSimilarity = require('string-similarity');

// GETS v0.1 Schema mapping - based on the assignment spec
const GETS_SCHEMA = {
  'invoice.id': { type: 'string', required: true, weight: 3 },
  'invoice.issue_date': { type: 'date', required: true, weight: 3 },
  'invoice.currency': { type: 'enum', required: true, weight: 3 },
  'invoice.total_excl_vat': { type: 'number', required: true, weight: 3 },
  'invoice.vat_amount': { type: 'number', required: true, weight: 3 },
  'invoice.total_incl_vat': { type: 'number', required: true, weight: 3 },
  'seller.name': { type: 'string', required: true, weight: 2 },
  'seller.trn': { type: 'string', required: true, weight: 2 },
  'seller.country': { type: 'string', required: true, weight: 2 },
  'seller.city': { type: 'string', required: false, weight: 1 },
  'buyer.name': { type: 'string', required: true, weight: 2 },
  'buyer.trn': { type: 'string', required: true, weight: 2 },
  'buyer.country': { type: 'string', required: true, weight: 2 },
  'buyer.city': { type: 'string', required: false, weight: 1 },
  'lines[].sku': { type: 'string', required: true, weight: 1 },
  'lines[].description': { type: 'string', required: false, weight: 1 },
  'lines[].qty': { type: 'number', required: true, weight: 1 },
  'lines[].unit_price': { type: 'number', required: true, weight: 1 },
  'lines[].line_total': { type: 'number', required: true, weight: 1 }
};

// Field name variations for better matching
const FIELD_VARIATIONS = {
  'invoice.id': ['inv_id', 'invoice_id', 'inv_no', 'invoice_no', 'invoice_number', 'id'],
  'invoice.issue_date': ['date', 'issuedate', 'issue_date', 'issued_on', 'issuedon', 'invoice_date', 'invoicedate', 'created_date', 'createddate'],
  'invoice.currency': ['currency', 'curr', 'currency_code'],
  'invoice.total_excl_vat': ['total_excl_vat', 'total_net', 'totalNet', 'net_total', 'subtotal', 'totalnet'],
  'invoice.vat_amount': ['vat_amount', 'vat', 'tax_amount', 'tax'],
  'invoice.total_incl_vat': ['total_incl_vat', 'grand_total', 'grandTotal', 'total', 'grandtotal'],
  'seller.name': ['seller_name', 'sellername', 'sellerName', 'vendor_name', 'supplier_name'],
  'seller.trn': ['seller_trn', 'seller_tax_id', 'sellertax', 'sellerTax', 'vendor_trn', 'supplier_trn'],
  'seller.country': ['seller_country', 'vendor_country', 'supplier_country'],
  'seller.city': ['seller_city', 'vendor_city', 'supplier_city'],
  'buyer.name': ['buyer_name', 'buyername', 'buyerName', 'customer_name', 'client_name'],
  'buyer.trn': ['buyer_trn', 'buyer_tax_id', 'buyertax', 'buyerTax', 'customer_trn', 'client_trn'],
  'buyer.country': ['buyer_country', 'buyerCountry', 'customer_country', 'client_country'],
  'buyer.city': ['buyer_city', 'customer_city', 'client_city'],
  'lines[].sku': ['sku', 'linesku', 'lineSku', 'line_sku', 'product_code', 'item_code'],
  'lines[].description': ['description', 'line_description', 'product_description', 'item_description'],
  'lines[].qty': ['qty', 'quantity', 'lineqty', 'lineQty', 'line_qty', 'line_quantity'],
  'lines[].unit_price': ['unit_price', 'price', 'lineprice', 'linePrice', 'line_price', 'item_price'],
  'lines[].line_total': ['line_total', 'linetotal', 'lineTotal', 'total', 'amount', 'line_amount']
};

function normalizeFieldName(fieldName) {
  return fieldName.toLowerCase()
    .replace(/[_\s-]/g, '');
}

function inferType(value) {
  if (value === null || value === undefined || value === '') return 'empty';
  
  // Check if it's a number
  const numValue = parseFloat(value);
  if (!isNaN(numValue) && isFinite(numValue)) return 'number';
  
  // Check if it's a date
  const dateValue = new Date(value);
  if (!isNaN(dateValue.getTime()) && value.toString().match(/\d{4}[-/]\d{1,2}[-/]\d{1,2}/)) {
    return 'date';
  }
  
  return 'string';
}

function isTypeCompatible(inferredType, expectedType) {
  if (expectedType === 'enum') return inferredType === 'string';
  return inferredType === expectedType || inferredType === 'empty';
}

function detectFields(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { matched: [], close: [], missing: Object.keys(GETS_SCHEMA) };
  }

  const sampleRow = data[0];
  if (!sampleRow || typeof sampleRow !== 'object') {
    return { matched: [], close: [], missing: Object.keys(GETS_SCHEMA) };
  }
  const sourceFields = Object.keys(sampleRow);
  const matched = [];
  const close = [];
  const missing = [];

  // Flatten nested objects for field detection
  const flattenedFields = {};
  sourceFields.forEach(field => {
    const value = sampleRow[field];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.keys(value).forEach(subField => {
        flattenedFields[`${field}.${subField}`] = value[subField];
      });
    } else {
      flattenedFields[field] = value;
    }
  });

  // Check for lines array (JSON format)
  if (sampleRow.lines && Array.isArray(sampleRow.lines) && sampleRow.lines.length > 0) {
    const lineFields = Object.keys(sampleRow.lines[0]);
    lineFields.forEach(field => {
      flattenedFields[`lines[].${field}`] = sampleRow.lines[0][field];
    });
  } else {
    // For flat CSV structure, map line-related fields
    sourceFields.forEach(field => {
      const normalizedField = normalizeFieldName(field);
      // Check if this looks like a line item field
      if (normalizedField.includes('line') || normalizedField.includes('sku') || 
          normalizedField.includes('qty') || normalizedField.includes('price') || 
          normalizedField.includes('total') || normalizedField.includes('amount')) {
        flattenedFields[`lines[].${field}`] = sampleRow[field];
      }
    });
  }

  // Match fields against GETS schema
  Object.keys(GETS_SCHEMA).forEach(getsField => {
    const schemaInfo = GETS_SCHEMA[getsField];
    let bestMatch = null;
    let bestScore = 0;
    let exactMatch = false;

    // Check variations first
    const variations = FIELD_VARIATIONS[getsField] || [];
    
    Object.keys(flattenedFields).forEach(sourceField => {
      const normalizedSource = normalizeFieldName(sourceField);
      const value = flattenedFields[sourceField];
      const inferredType = inferType(value);
      
      // Skip if type is incompatible
      if (!isTypeCompatible(inferredType, schemaInfo.type)) return;

      // Check exact matches in variations
      if (variations.some(v => normalizeFieldName(v) === normalizedSource)) {
        exactMatch = true;
        bestMatch = sourceField;
        bestScore = 1.0;
        return;
      }

      // Calculate similarity score
      const similarity = Math.max(
        ...variations.map(v => stringSimilarity.compareTwoStrings(normalizedSource, normalizeFieldName(v)))
      );

      if (similarity > bestScore && similarity > 0.6) {
        bestMatch = sourceField;
        bestScore = similarity;
      }
    });

    if (exactMatch || bestScore >= 0.8) {
      matched.push(getsField);
    } else if (bestMatch && bestScore >= 0.6) {
      close.push({
        target: getsField,
        candidate: bestMatch,
        confidence: Math.round(bestScore * 100) / 100
      });
    } else {
      missing.push(getsField);
    }
  });

  return { matched, close, missing };
}

function calculateCoverageScore(coverage) {
  const totalFields = Object.keys(GETS_SCHEMA).length;
  const weights = Object.values(GETS_SCHEMA).reduce((sum, field) => sum + field.weight, 0);
  
  let matchedWeight = 0;
  let closeWeight = 0;

  coverage.matched.forEach(field => {
    matchedWeight += GETS_SCHEMA[field]?.weight || 1;
  });

  coverage.close.forEach(item => {
    closeWeight += (GETS_SCHEMA[item.target]?.weight || 1) * item.confidence * 0.7;
  });

  const score = Math.round(((matchedWeight + closeWeight) / weights) * 100);
  return Math.min(100, Math.max(0, score));
}

module.exports = {
  detectFields,
  calculateCoverageScore,
  GETS_SCHEMA,
  inferType
};