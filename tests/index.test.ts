import { beforeEach, describe, expect, it } from 'vitest'
import { createLRUCache, LRUCache } from '../src'

describe('LRUCache', () => {
  let cache: LRUCache<string, number>

  beforeEach(() => {
    cache = new LRUCache<string, number>(3)
  })

  describe('constructor', () => {
    it('should create cache with valid capacity', () => {
      const cache = new LRUCache<string, number>(5)
      expect(cache.size).toBe(0)
    })

    it('should throw error for invalid capacity', () => {
      expect(() => new LRUCache(0)).toThrowError('Capacity must be positive')
      expect(() => new LRUCache(-1)).toThrowError('Capacity must be positive')
    })
  })

  describe('basic operations', () => {
    it('should set and get values', () => {
      cache.set('a', 1)
      cache.set('b', 2)

      expect(cache.get('a')).toBe(1)
      expect(cache.get('b')).toBe(2)
      expect(cache.get('c')).toBeUndefined()
    })

    it('should update existing key', () => {
      cache.set('a', 1)
      cache.set('a', 10)

      expect(cache.get('a')).toBe(10)
      expect(cache.size).toBe(1)
    })

    it('should return correct size', () => {
      expect(cache.size).toBe(0)

      cache.set('a', 1)
      expect(cache.size).toBe(1)

      cache.set('b', 2)
      expect(cache.size).toBe(2)

      cache.set('c', 3)
      expect(cache.size).toBe(3)
    })
  })

  describe('LRU behavior', () => {
    it('should evict least recently used item when capacity exceeded', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // 缓存满了，添加新项应该淘汰最久未使用的项
      cache.set('d', 4)

      expect(cache.size).toBe(3)
      expect(cache.get('a')).toBeUndefined() // 'a' 被淘汰
      expect(cache.get('b')).toBe(2)
      expect(cache.get('c')).toBe(3)
      expect(cache.get('d')).toBe(4)
    })

    it('should update access order when getting item', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // 访问 'a'，使其成为最近使用
      cache.get('a')

      // 添加新项，应该淘汰 'b'（现在是最久未使用的）
      cache.set('d', 4)

      expect(cache.get('a')).toBe(1) // 'a' 仍然存在
      expect(cache.get('b')).toBeUndefined() // 'b' 被淘汰
      expect(cache.get('c')).toBe(3)
      expect(cache.get('d')).toBe(4)
    })

    it('should update access order when updating existing key', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // 更新 'a' 的值，使其成为最近使用
      cache.set('a', 10)

      // 添加新项，应该淘汰 'b'
      cache.set('d', 4)

      expect(cache.get('a')).toBe(10) // 'a' 仍然存在且值已更新
      expect(cache.get('b')).toBeUndefined() // 'b' 被淘汰
      expect(cache.get('c')).toBe(3)
      expect(cache.get('d')).toBe(4)
    })
  })

  describe('delete operation', () => {
    it('should delete existing key', () => {
      cache.set('a', 1)
      cache.set('b', 2)

      expect(cache.delete('a')).toBe(true)
      expect(cache.get('a')).toBeUndefined()
      expect(cache.size).toBe(1)
    })

    it('should return false for non-existing key', () => {
      expect(cache.delete('nonexistent')).toBe(false)
      expect(cache.size).toBe(0)
    })

    it('should not affect other items when deleting', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.delete('b')

      expect(cache.get('a')).toBe(1)
      expect(cache.get('c')).toBe(3)
      expect(cache.size).toBe(2)
    })
  })

  describe('has operation', () => {
    it('should return true for existing key', () => {
      cache.set('a', 1)
      expect(cache.has('a')).toBe(true)
    })

    it('should return false for non-existing key', () => {
      expect(cache.has('nonexistent')).toBe(false)
    })

    it('should not affect access order', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // has 操作不应该影响访问顺序
      cache.has('a')

      // 添加新项，'a' 应该仍然被淘汰
      cache.set('d', 4)

      expect(cache.get('a')).toBeUndefined()
    })
  })

  describe('clear operation', () => {
    it('should clear all items', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.clear()

      expect(cache.size).toBe(0)
      expect(cache.get('a')).toBeUndefined()
      expect(cache.get('b')).toBeUndefined()
      expect(cache.get('c')).toBeUndefined()
    })

    it('should work correctly after clear', () => {
      cache.set('a', 1)
      cache.clear()

      cache.set('b', 2)
      expect(cache.get('b')).toBe(2)
      expect(cache.size).toBe(1)
    })
  })

  describe('iteration methods', () => {
    beforeEach(() => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      // 访问 'a' 使其成为最近使用
      cache.get('a')
      // 现在顺序应该是: a (最新), c, b (最旧)
    })

    it('should return keys in correct order', () => {
      const keys = cache.keys()
      expect(keys).toEqual(['a', 'c', 'b'])
    })

    it('should return values in correct order', () => {
      const values = cache.values()
      expect(values).toEqual([1, 3, 2])
    })

    it('should return entries in correct order', () => {
      const entries = cache.entries()
      expect(entries).toEqual([
        ['a', 1],
        ['c', 3],
        ['b', 2],
      ])
    })

    it('should support for...of iteration', () => {
      const result: [string, number][] = []
      for (const [key, value] of cache) {
        result.push([key, value])
      }
      expect(result).toEqual([
        ['a', 1],
        ['c', 3],
        ['b', 2],
      ])
    })
  })

  describe('edge cases', () => {
    it('should handle capacity of 1', () => {
      const smallCache = new LRUCache<string, number>(1)

      smallCache.set('a', 1)
      expect(smallCache.get('a')).toBe(1)

      smallCache.set('b', 2)
      expect(smallCache.get('a')).toBeUndefined()
      expect(smallCache.get('b')).toBe(2)
      expect(smallCache.size).toBe(1)
    })

    it('should handle empty cache operations', () => {
      expect(cache.get('nonexistent')).toBeUndefined()
      expect(cache.delete('nonexistent')).toBe(false)
      expect(cache.has('nonexistent')).toBe(false)
      expect(cache.keys()).toEqual([])
      expect(cache.values()).toEqual([])
      expect(cache.entries()).toEqual([])
    })

    it('should handle multiple operations in sequence', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.delete('a')
      cache.set('c', 3)
      cache.set('d', 4)
      cache.set('e', 5)

      expect(cache.size).toBe(3)
      expect(cache.get('a')).toBeUndefined()
      expect(cache.get('b')).toBeUndefined() // 被淘汰
      expect(cache.get('c')).toBe(3)
      expect(cache.get('d')).toBe(4)
      expect(cache.get('e')).toBe(5)
    })
  })

  describe('type safety', () => {
    it('should work with different key types', () => {
      const numberKeyCache = new LRUCache<number, string>(3)

      numberKeyCache.set(1, 'one')
      numberKeyCache.set(2, 'two')

      expect(numberKeyCache.get(1)).toBe('one')
      expect(numberKeyCache.get(2)).toBe('two')
    })

    it('should work with object values', () => {
      interface User {
        id: number
        name: string
      }

      const userCache = new LRUCache<string, User>(3)
      const user1: User = { id: 1, name: 'Alice' }
      const user2: User = { id: 2, name: 'Bob' }

      userCache.set('user1', user1)
      userCache.set('user2', user2)

      expect(userCache.get('user1')).toEqual(user1)
      expect(userCache.get('user2')).toEqual(user2)
    })
  })

  describe('performance characteristics', () => {
    it('should handle large number of operations efficiently', () => {
      const largeCache = new LRUCache<number, number>(1000)

      // 添加大量数据
      for (let i = 0; i < 1000; i++) {
        largeCache.set(i, i * 2)
      }

      expect(largeCache.size).toBe(1000)

      // 访问一些项
      for (let i = 0; i < 100; i++) {
        expect(largeCache.get(i)).toBe(i * 2)
      }

      // 添加更多项，触发淘汰
      for (let i = 1000; i < 1100; i++) {
        largeCache.set(i, i * 2)
      }

      expect(largeCache.size).toBe(1000)

      // 验证淘汰行为
      expect(largeCache.get(100)).toBeUndefined() // 应该被淘汰
      expect(largeCache.get(1000)).toBe(2000) // 新添加的项应该存在
    })
  })
})

describe('createLRUCache factory function', () => {
  it('should create cache with specified capacity', () => {
    const cache = createLRUCache<string, number>({ capacity: 5 })

    expect(cache.size).toBe(0)

    cache.set('a', 1)
    expect(cache.get('a')).toBe(1)
  })

  it('should work with default types', () => {
    const cache = createLRUCache({ capacity: 3 })

    cache.set('key', 'value')
    expect(cache.get('key')).toBe('value')
  })

  it('should throw error for invalid capacity', () => {
    expect(() => createLRUCache({ capacity: 0 })).toThrowError(
      'Capacity must be positive',
    )
    expect(() => createLRUCache({ capacity: -1 })).toThrowError(
      'Capacity must be positive',
    )
  })
})

describe('integration tests', () => {
  it('should work as a typical cache scenario', () => {
    // 模拟一个用户会话缓存
    interface Session {
      userId: number
      loginTime: Date
      data: Record<string, any>
    }

    const sessionCache = new LRUCache<string, Session>(100)

    // 创建会话
    const session1: Session = {
      userId: 1,
      loginTime: new Date(),
      data: { theme: 'dark', language: 'en' },
    }

    sessionCache.set('session_1', session1)

    // 获取会话
    const retrieved = sessionCache.get('session_1')
    expect(retrieved).toEqual(session1)

    // 更新会话数据
    if (retrieved) {
      retrieved.data.theme = 'light'
      sessionCache.set('session_1', retrieved)
    }

    expect(sessionCache.get('session_1')?.data.theme).toBe('light')
  })

  it('should handle concurrent-like operations', () => {
    const cache = new LRUCache<string, number>(5)

    // 模拟多个操作混合执行
    const operations = [
      () => cache.set('a', 1),
      () => cache.set('b', 2),
      () => cache.get('a'),
      () => cache.set('c', 3),
      () => cache.delete('b'),
      () => cache.set('d', 4),
      () => cache.set('e', 5),
      () => cache.get('c'),
      () => cache.set('f', 6),
      () => cache.clear(),
      () => cache.set('g', 7),
    ]

    // 执行所有操作
    operations.forEach((op) => op())

    // 验证最终状态
    expect(cache.size).toBe(1)
    expect(cache.get('g')).toBe(7)
  })
})
