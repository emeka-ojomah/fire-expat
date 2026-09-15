export function calculateYearsToFire(current, annualSavings, rate, target) {
  if (annualSavings <= 0 || target <= 0) return null;
  let years = 0;
  let balance = current;
  while (balance < target && years < 60) {
    balance = balance * (1 + rate) + annualSavings;
    years++;
  }
  return years;
}

export function generateProjection(current, annualSavings, rate, target, span = 30) {
  let balance = current;
  const data = [];
  for (let year = 0; year <= span; year++) {
    data.push({ year, savings: Math.max(0, balance), target });
    balance = balance * (1 + rate) + annualSavings;
  }
  return data;
}

// Real return = growth net of inflation (Fisher equation). Using this
// instead of the raw nominal expected_return keeps the FIRE target — which
// is expressed in today's dollars — consistent with the projection.
export function realRateFromNominal(nominalReturnPct, inflationRatePct) {
  const nominal = (nominalReturnPct || 0) / 100;
  const inflation = (inflationRatePct || 0) / 100;
  return (1 + nominal) / (1 + inflation) - 1;
}

export function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}
