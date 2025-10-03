// Using native Date instead of moment to avoid deprecation warnings

// Allowed currencies as per assignment requirements
const ALLOWED_CURRENCIES = ['AED', 'SAR', 'MYR', 'USD'];

function checkTotalsBalance(data) {
  const results = [];
  let passCount = 0;

  if (!data || data.length === 0) {
    results.push({ rule: 'TOTALS_BALANCE', ok: false, message: 'No data to validate' });
    return { results, score: 0 };
  }

  data.forEach((row, index) => {
    const totalExclVat = parseFloat(row.total_excl_vat || row.totalNet || row.total_net || row.totalnet || 0) || 0;
    const vatAmount = parseFloat(row.vat_amount || row.vat || row.tax_amount || row.tax || 0) || 0;
    const totalInclVat = parseFloat(row.total_incl_vat || row.grandTotal || row.grand_total || row.grandtotal || row.total || 0) || 0;
    
    const calculated = totalExclVat + vatAmount;
    const difference = Math.abs(calculated - totalInclVat);
    const isValid = difference <= 0.01;
    
    if (isValid) passCount++;
    
    if (!isValid) {
      results.push({
        rule: 'TOTALS_BALANCE',
        ok: false,
        exampleLine: index + 1,
        expected: calculated,
        got: totalInclVat,
        message: `Total mismatch: ${totalExclVat} + ${vatAmount} ≠ ${totalInclVat}`
      });
    }
  });

  if (results.length === 0) {
    results.push({ rule: 'TOTALS_BALANCE', ok: true });
  }

  return {
    results,
    score: Math.round((passCount / data.length) * 100)
  };
}

function checkLineMath(data) {
  const results = [];
  let passCount = 0;
  let totalLines = 0;

  if (!data || data.length === 0) {
    results.push({ rule: 'LINE_MATH', ok: false, message: 'No data to validate' });
    return { results, score: 0 };
  }

  data.forEach((row, rowIndex) => {
    // Handle nested structure (JSON format)
    const lines = row.lines || [];
    
    if (lines.length > 0) {
      lines.forEach((line, lineIndex) => {
        totalLines++;
        const qty = parseFloat(line.qty || line.quantity || line.lineqty || 0);
        const unitPrice = parseFloat(line.unit_price || line.price || line.lineprice || 0);
        const lineTotal = parseFloat(line.line_total || line.linetotal || line.total || line.amount || 0);
        
        const calculated = qty * unitPrice;
        const difference = Math.abs(calculated - lineTotal);
        const isValid = difference <= 0.01;
        
        if (isValid) passCount++;
        
        if (!isValid && results.length < 5) { // Limit examples
          results.push({
            rule: 'LINE_MATH',
            ok: false,
            exampleLine: rowIndex + 1,
            expected: calculated,
            got: lineTotal,
            message: `Line ${lineIndex + 1}: ${qty} × ${unitPrice} ≠ ${lineTotal}`
          });
        }
      });
    } else {
      // Handle flat structure (CSV format) - each row is one line item
      totalLines++;
      const qty = parseFloat(row.lineQty || row.line_qty || row.qty || row.quantity || 0) || 0;
      const unitPrice = parseFloat(row.linePrice || row.line_price || row.unit_price || row.price || 0) || 0;
      const lineTotal = parseFloat(row.lineTotal || row.line_total || row.total || row.amount || 0) || 0;
      
      const calculated = qty * unitPrice;
      const difference = Math.abs(calculated - lineTotal);
      const isValid = difference <= 0.01;
      
      if (isValid) passCount++;
      
      if (!isValid && results.length < 5) { // Limit examples
        results.push({
          rule: 'LINE_MATH',
          ok: false,
          exampleLine: rowIndex + 1,
          expected: calculated,
          got: lineTotal,
          message: `Row ${rowIndex + 1}: ${qty} × ${unitPrice} ≠ ${lineTotal}`
        });
      }
    }
  });

  if (results.length === 0 && totalLines > 0) {
    results.push({ rule: 'LINE_MATH', ok: true });
  } else if (totalLines === 0) {
    results.push({ 
      rule: 'LINE_MATH', 
      ok: false, 
      message: 'No line items found' 
    });
  }

  return {
    results,
    score: totalLines > 0 ? Math.round((passCount / totalLines) * 100) : 0
  };
}

function checkDateISO(data) {
  const results = [];
  let passCount = 0;

  if (!data || data.length === 0) {
    results.push({ rule: 'DATE_ISO', ok: false, message: 'No data to validate' });
    return { results, score: 0 };
  }

  data.forEach((row, index) => {
    const dateField = row.date || row.issue_date || row.issued_on || row.issuedon || row.invoice_date || row.created_date;
    
    if (!dateField) {
      results.push({
        rule: 'DATE_ISO',
        ok: false,
        exampleLine: index + 1,
        message: 'Missing date field'
      });
      return;
    }

    // Check if date matches YYYY-MM-DD format
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const isValidFormat = isoDateRegex.test(dateField);
    
    if (isValidFormat) {
      // Additional check: is it a valid date?
      const date = new Date(dateField + 'T00:00:00.000Z');
      const isValidDate = !isNaN(date.getTime()) && dateField === date.toISOString().split('T')[0];
      
      if (isValidDate) {
        passCount++;
      } else {
        results.push({
          rule: 'DATE_ISO',
          ok: false,
          exampleLine: index + 1,
          value: dateField,
          message: 'Invalid date value'
        });
      }
    } else {
      results.push({
        rule: 'DATE_ISO',
        ok: false,
        exampleLine: index + 1,
        value: dateField,
        message: 'Date format must be YYYY-MM-DD'
      });
    }
  });

  if (results.length === 0) {
    results.push({ rule: 'DATE_ISO', ok: true });
  }

  return {
    results,
    score: Math.round((passCount / data.length) * 100)
  };
}

function checkCurrencyAllowed(data) {
  const results = [];
  let passCount = 0;

  if (!data || data.length === 0) {
    results.push({ rule: 'CURRENCY_ALLOWED', ok: false, message: 'No data to validate' });
    return { results, score: 0 };
  }

  data.forEach((row, index) => {
    const currency = row.currency || row.curr || row.currency_code;
    
    if (!currency) {
      results.push({
        rule: 'CURRENCY_ALLOWED',
        ok: false,
        exampleLine: index + 1,
        message: 'Missing currency field'
      });
      return;
    }

    const isAllowed = ALLOWED_CURRENCIES.includes(currency.toUpperCase());
    
    if (isAllowed) {
      passCount++;
    } else {
      results.push({
        rule: 'CURRENCY_ALLOWED',
        ok: false,
        exampleLine: index + 1,
        value: currency,
        message: `Currency '${currency}' not allowed. Must be one of: ${ALLOWED_CURRENCIES.join(', ')}`
      });
    }
  });

  if (results.length === 0) {
    results.push({ rule: 'CURRENCY_ALLOWED', ok: true });
  }

  return {
    results,
    score: Math.round((passCount / data.length) * 100)
  };
}

function checkTrnPresent(data) {
  const results = [];
  let passCount = 0;

  if (!data || data.length === 0) {
    results.push({ rule: 'TRN_PRESENT', ok: false, message: 'No data to validate' });
    return { results, score: 0 };
  }

  data.forEach((row, index) => {
    const buyerTrn = row.buyer_trn || row.buyerTax || row.buyertax || row.buyer_tax_id || row.customer_trn;
    const sellerTrn = row.seller_trn || row.sellerTax || row.sellertax || row.seller_tax_id || row.vendor_trn;
    
    const buyerTrnValid = buyerTrn && buyerTrn.toString().trim().length > 0;
    const sellerTrnValid = sellerTrn && sellerTrn.toString().trim().length > 0;
    
    if (buyerTrnValid && sellerTrnValid) {
      passCount++;
    } else {
      const missing = [];
      if (!buyerTrnValid) missing.push('buyer.trn');
      if (!sellerTrnValid) missing.push('seller.trn');
      
      results.push({
        rule: 'TRN_PRESENT',
        ok: false,
        exampleLine: index + 1,
        message: `Missing TRN fields: ${missing.join(', ')}`
      });
    }
  });

  if (results.length === 0) {
    results.push({ rule: 'TRN_PRESENT', ok: true });
  }

  return {
    results,
    score: Math.round((passCount / data.length) * 100)
  };
}

function runAllRuleChecks(data) {
  const startTime = Date.now();
  
  // Input validation
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error('Invalid data: must be a non-empty array');
  }
  
  const totalsCheck = checkTotalsBalance(data);
  const lineMathCheck = checkLineMath(data);
  const dateCheck = checkDateISO(data);
  const currencyCheck = checkCurrencyAllowed(data);
  const trnCheck = checkTrnPresent(data);

  const allResults = [
    ...totalsCheck.results,
    ...lineMathCheck.results,
    ...dateCheck.results,
    ...currencyCheck.results,
    ...trnCheck.results
  ];

  // Calculate overall rules score
  const scores = [
    totalsCheck.score,
    lineMathCheck.score,
    dateCheck.score,
    currencyCheck.score,
    trnCheck.score
  ].filter(score => !isNaN(score) && isFinite(score));
  
  const overallRulesScore = scores.length > 0 
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : 0;
  
  const processingTime = Date.now() - startTime;

  return {
    ruleFindings: allResults,
    rulesScore: overallRulesScore,
    processingTime,
    individualScores: {
      totalsBalance: totalsCheck.score,
      lineMath: lineMathCheck.score,
      dateISO: dateCheck.score,
      currencyAllowed: currencyCheck.score,
      trnPresent: trnCheck.score
    }
  };
}

module.exports = {
  runAllRuleChecks,
  checkTotalsBalance,
  checkLineMath,
  checkDateISO,
  checkCurrencyAllowed,
  checkTrnPresent,
  ALLOWED_CURRENCIES
};