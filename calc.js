function calc(baseSalary) {
  const cnss = Math.min(baseSalary, 6000) * 0.0448;
  const amo = baseSalary * 0.0226;
  const fraisPro = Math.min(baseSalary * 0.2, 2500);
  const sni = baseSalary - cnss - amo - fraisPro;

  let igr = 0;
  if (sni > 2500 && sni <= 4166) igr = sni * 0.1 - 250;
  else if (sni > 4166 && sni <= 5000) igr = sni * 0.2 - 666.67;
  else if (sni > 5000 && sni <= 6666) igr = sni * 0.3 - 1166.67;
  else if (sni > 6666 && sni <= 15000) igr = sni * 0.34 - 1433.33;
  else if (sni > 15000) igr = sni * 0.38 - 2033.33;
  igr = Math.max(0, igr);

  const netSalary = baseSalary - cnss - amo - igr;
  return { net: netSalary.toFixed(2), cnss: cnss.toFixed(2), amo: amo.toFixed(2), igr: igr.toFixed(2) };
}

console.log('Ahmed (14500):', calc(14500));
console.log('Karima (9500):', calc(9500));
console.log('Youssef (4000):', calc(4000));
console.log('Sofia (6000):', calc(6000));
