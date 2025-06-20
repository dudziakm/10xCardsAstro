import { describe, it, expect } from 'vitest';

describe('Simple Test Suite', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should test string operations', () => {
    const text = 'Hello World';
    expect(text.toLowerCase()).toBe('hello world');
  });

  it('should test array operations', () => {
    const numbers = [1, 2, 3, 4, 5];
    expect(numbers.length).toBe(5);
    expect(numbers.includes(3)).toBe(true);
  });

  it('should test object operations', () => {
    const user = { name: 'John', age: 30 };
    expect(user.name).toBe('John');
    expect(user.age).toBe(30);
  });
});