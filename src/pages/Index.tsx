
import React from 'react';
import PivotTable from '../components/PivotTable';

const sampleData = [
  { region: 'North', product: 'Apples', category: 'Fruit', quantity: 10, sales: 100, profit: 20, date: '2025-07-01' },
  { region: 'South', product: 'Apples', category: 'Fruit', quantity: 20, sales: 200, profit: 40, date: '2025-07-08' },
  { region: 'North', product: 'Oranges', category: 'Fruit', quantity: 15, sales: 150, profit: 30, date: '2025-06-25' },
  { region: 'South', product: 'Oranges', category: 'Fruit', quantity: 25, sales: 250, profit: 50, date: '2025-06-15' },
  { region: 'East', product: 'Apples', category: 'Fruit', quantity: 12, sales: 120, profit: 24, date: '2025-07-10' },
  { region: 'West', product: 'Oranges', category: 'Fruit', quantity: 18, sales: 180, profit: 36, date: '2025-07-05' },
  { region: 'North', product: 'Bananas', category: 'Fruit', quantity: 8, sales: 80, profit: 16, date: '2025-06-20' },
  { region: 'South', product: 'Bananas', category: 'Fruit', quantity: 22, sales: 220, profit: 44, date: '2025-06-30' },
  { region: 'East', product: 'Carrots', category: 'Vegetable', quantity: 30, sales: 90, profit: 18, date: '2025-07-15' },
  { region: 'West', product: 'Carrots', category: 'Vegetable', quantity: 35, sales: 105, profit: 21, date: '2025-07-12' },
  { region: 'North', product: 'Lettuce', category: 'Vegetable', quantity: 40, sales: 120, profit: 24, date: '2025-06-28' },
  { region: 'South', product: 'Lettuce', category: 'Vegetable', quantity: 45, sales: 135, profit: 27, date: '2025-07-03' },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            React Pivot Table with Date Filtering
          </h1>
          <p className="text-gray-600">
            A powerful pivot table component with dynamic grouping, multiple aggregations, date filtering, export functionality, and chart visualization.
          </p>
        </div>
        
        <PivotTable data={sampleData} />
      </div>
    </div>
  );
};

export default Index;
