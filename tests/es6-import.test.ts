/**
 * Test to verify that ES6 import syntax works correctly.
 * This test addresses the issue where ES6 imports were failing.
 */

describe('Testing ES6 import compatibility', () => {
  test('should be able to import MindsDB using ES6 import syntax', async () => {
    // This test verifies that the ES6 import works
    // We use dynamic import to test ES6 module compatibility
    const MindsDBModule = await import('../src/index');
    const MindsDB = MindsDBModule.default;
    
    expect(MindsDB).toBeDefined();
    expect(typeof MindsDB.connect).toBe('function');
    expect(typeof MindsDB.SQL).toBe('object');
    expect(typeof MindsDB.Models).toBe('object');
    expect(typeof MindsDB.Projects).toBe('object');
    expect(typeof MindsDB.Databases).toBe('object');
    expect(typeof MindsDB.Tables).toBe('object');
    expect(typeof MindsDB.Views).toBe('object');
    expect(typeof MindsDB.Jobs).toBe('object');
    expect(typeof MindsDB.MLEngines).toBe('object');
    expect(typeof MindsDB.Agents).toBe('object');
    expect(typeof MindsDB.Callbacks).toBe('object');
    expect(typeof MindsDB.KnowledgeBases).toBe('object');
    expect(typeof MindsDB.Skills).toBe('object');
  });

  test('should be able to import named exports using ES6 syntax', async () => {
    // Test named exports
    const { 
      MindsDbError, 
      LogLevel,
      Model,
      Database,
      Project,
      Table,
      View 
    } = await import('../src/index');
    
    expect(MindsDbError).toBeDefined();
    expect(LogLevel).toBeDefined();
    expect(Model).toBeDefined();
    expect(Database).toBeDefined();
    expect(Project).toBeDefined();
    expect(Table).toBeDefined();
    expect(View).toBeDefined();
  });

  test('should maintain compatibility with CommonJS require syntax', () => {
    // Test CommonJS compatibility
    const MindsDB = require('../dist/index.js');
    
    expect(MindsDB.default).toBeDefined();
    expect(typeof MindsDB.default.connect).toBe('function');
    expect(typeof MindsDB.default.SQL).toBe('object');
  });
});
