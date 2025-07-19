// Conversion utilities for pivot table data

export interface ConversionConfig {
  field: string;
  type: 'area' | 'amount';
  targetUnit: 'ft2' | 'm2' | 'crores' | 'original';
}

// Area conversion functions
export function convertAreaM2ToFt2(areaInM2: number): number {
  return areaInM2 * 10.7639;
}

export function convertAreaFt2ToM2(areaInFt2: number): number {
  return areaInFt2 / 10.7639;
}

// Amount conversion functions
export function convertAmountToCrores(amount: number): number {
  return amount / 10000000;
}

export function convertCroresToAmount(crores: number): number {
  return crores * 10000000;
}

// Generic conversion function
export function convertValue(
  value: number,
  conversionType: ConversionConfig['type'],
  targetUnit: ConversionConfig['targetUnit']
): number {
  switch (conversionType) {
    case 'area':
      if (targetUnit === 'ft2') {
        return convertAreaM2ToFt2(value);
      } else if (targetUnit === 'm2') {
        return convertAreaFt2ToM2(value);
      }
      return value;
    
    case 'amount':
      if (targetUnit === 'crores') {
        return convertAmountToCrores(value);
      }
      return value;
    
    default:
      return value;
  }
}

// Format display value with unit
export function formatValueWithUnit(
  value: number,
  conversionType: ConversionConfig['type'],
  targetUnit: ConversionConfig['targetUnit'],
  locale: string = 'en-IN'
): string {
  const formatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });

  switch (conversionType) {
    case 'area':
      return `${formatter.format(value)} ${targetUnit === 'ft2' ? 'ft²' : 'm²'}`;
    
    case 'amount':
      if (targetUnit === 'crores') {
        return `₹${formatter.format(value)} cr`;
      }
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(value);
    
    default:
      return formatter.format(value);
  }
}

// Detect field type based on field name
export function detectFieldType(fieldName: string): ConversionConfig['type'] | null {
  const areaKeywords = ['area', 'size', 'sqft', 'sqm', 'square'];
  const amountKeywords = ['amount', 'cost', 'price', 'sales', 'revenue', 'value'];
  
  const fieldLower = fieldName.toLowerCase();
  
  if (areaKeywords.some(keyword => fieldLower.includes(keyword))) {
    return 'area';
  }
  
  if (amountKeywords.some(keyword => fieldLower.includes(keyword))) {
    return 'amount';
  }
  
  return null;
}