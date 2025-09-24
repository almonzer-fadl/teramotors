// Basic test to verify Jest is working
describe('Basic Test Suite', () => {
  test('should pass basic test', () => {
    expect(1 + 1).toBe(2)
  })

  test('should handle strings', () => {
    expect('hello').toBe('hello')
  })

  test('should handle arrays', () => {
    const arr = [1, 2, 3]
    expect(arr).toHaveLength(3)
    expect(arr).toContain(2)
  })

  test('should handle objects', () => {
    const obj = { name: 'test', value: 123 }
    expect(obj).toHaveProperty('name')
    expect(obj.name).toBe('test')
  })
})
