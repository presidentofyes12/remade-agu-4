import React from 'react';
import { Button } from './ui/Button';

const TestComponent: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Component</h1>
      <Button variant="default">Click me</Button>
    </div>
  );
};

export default TestComponent; 