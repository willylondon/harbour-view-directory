import assert from 'node:assert/strict';
import { getDisplayCategory } from '../lib/categoryMap.js';

const cases = [
  {
    input: { business_name: 'Ms Doctor Teacher', description: '' },
    expected: 'Education',
  },
  {
    input: { business_name: 'Doctor Brown Teacher', description: '' },
    expected: 'Education',
  },
  {
    input: { business_name: 'Doctor tutoring students', description: '' },
    expected: 'Education',
  },
  {
    input: { business_name: 'Doctor’s office medical clinic', description: '' },
    expected: 'Health & Medical',
  },
  {
    input: { business_name: 'Harbour View Medical Clinic', description: '' },
    expected: 'Health & Medical',
  },
];

for (const testCase of cases) {
  const actual = getDisplayCategory(testCase.input).display;
  assert.equal(actual, testCase.expected, `${testCase.input.business_name}: expected ${testCase.expected}, got ${actual}`);
}

console.log(JSON.stringify({
  passed: cases.length,
  cases: cases.map((testCase) => ({
    business_name: testCase.input.business_name,
    expected: testCase.expected,
  })),
}, null, 2));
