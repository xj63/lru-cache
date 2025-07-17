/**
 * 双向链表节点
 * @internal
 */
class LRUNode<K, V> {
  key: K
  value: V
  prev: LRUNode<K, V> | null = null
  next: LRUNode<K, V> | null = null

  constructor(key: K, value: V) {
    this.key = key
    this.value = value
  }
}

/**
 * LRU (Least Recently Used) Cache 实现
 *
 * 使用双向链表 + HashMap 实现，所有操作都是 O(1) 时间复杂度。
 * 当缓存达到容量上限时，会自动淘汰最久未使用的项目。
 *
 * @template K - 键的类型，默认为 string
 * @template V - 值的类型，默认为 any
 *
 * @example
 * ```typescript
 * // 创建一个容量为 3 的字符串缓存
 * const cache = new LRUCache<string, number>(3);
 *
 * // 添加缓存项
 * cache.set('a', 1);
 * cache.set('b', 2);
 * cache.set('c', 3);
 *
 * // 获取缓存项
 * console.log(cache.get('a')); // 1
 * console.log(cache.get('d')); // undefined
 *
 * // 添加新项，触发淘汰
 * cache.set('d', 4); // 'b' 被淘汰（最久未使用）
 *
 * // 检查缓存状态
 * console.log(cache.size); // 3
 * console.log(cache.has('b')); // false
 * console.log(cache.keys()); // ['d', 'a', 'c']
 * ```
 *
 * @example
 * ```typescript
 * // 使用自定义类型
 * interface User {
 *   id: number;
 *   name: string;
 * }
 *
 * const userCache = new LRUCache<number, User>(100);
 *
 * userCache.set(1, { id: 1, name: 'Alice' });
 * userCache.set(2, { id: 2, name: 'Bob' });
 *
 * const user = userCache.get(1);
 * console.log(user?.name); // 'Alice'
 * ```
 *
 * @example
 * ```typescript
 * // 遍历缓存（按使用顺序，从新到旧）
 * const cache = new LRUCache<string, string>(3);
 * cache.set('first', 'A');
 * cache.set('second', 'B');
 * cache.set('third', 'C');
 *
 * // 使用 for...of 遍历
 * for (const [key, value] of cache) {
 *   console.log(`${key}: ${value}`);
 * }
 *
 * // 获取所有键值对
 * console.log(cache.entries()); // [['third', 'C'], ['second', 'B'], ['first', 'A']]
 * ```
 */
export class LRUCache<K = string, V = any> {
  private readonly capacity: number
  private readonly cache = new Map<K, LRUNode<K, V>>()
  private readonly head: LRUNode<K, V>
  private readonly tail: LRUNode<K, V>

  /**
   * 创建一个新的 LRU Cache 实例
   *
   * @param capacity - 缓存容量，必须为正整数
   * @throws {Error} 当容量小于等于 0 时抛出错误
   *
   * @example
   * ```typescript
   * const cache = new LRUCache<string, number>(10);
   * ```
   */
  constructor(capacity: number) {
    if (capacity <= 0) {
      throw new Error('Capacity must be positive')
    }

    this.capacity = capacity

    // 创建虚拟头尾节点，简化边界处理
    this.head = new LRUNode<K, V>(null as any, null as any)
    this.tail = new LRUNode<K, V>(null as any, null as any)
    this.head.next = this.tail
    this.tail.prev = this.head
  }

  /**
   * 获取缓存值
   *
   * 如果键存在，会将对应项移动到最近使用位置，然后返回值。
   * 如果键不存在，返回 undefined。
   *
   * @param key - 要获取的键
   * @returns 对应的值，如果不存在则返回 undefined
   *
   * @example
   * ```typescript
   * const cache = new LRUCache<string, number>(3);
   * cache.set('foo', 42);
   *
   * console.log(cache.get('foo')); // 42
   * console.log(cache.get('bar')); // undefined
   * ```
   */
  get(key: K): V | undefined {
    const node = this.cache.get(key)
    if (!node) return undefined

    // 移动到头部（最近使用）
    this.moveToHead(node)
    return node.value
  }

  /**
   * 设置缓存值
   *
   * 如果键已存在，更新其值并移动到最近使用位置。
   * 如果键不存在，创建新的缓存项。
   * 当缓存达到容量上限时，会自动淘汰最久未使用的项目。
   *
   * @param key - 要设置的键
   * @param value - 要设置的值
   *
   * @example
   * ```typescript
   * const cache = new LRUCache<string, number>(2);
   *
   * cache.set('a', 1);
   * cache.set('b', 2);
   * cache.set('c', 3); // 'a' 被淘汰
   *
   * console.log(cache.has('a')); // false
   * console.log(cache.get('b')); // 2
   * console.log(cache.get('c')); // 3
   * ```
   */
  set(key: K, value: V): void {
    const existingNode = this.cache.get(key)

    if (existingNode) {
      // 更新现有节点
      existingNode.value = value
      this.moveToHead(existingNode)
    } else {
      // 创建新节点
      const newNode = new LRUNode(key, value)

      if (this.cache.size >= this.capacity) {
        // 删除尾部节点（最久未使用）
        this.removeTail()
      }

      this.cache.set(key, newNode)
      this.addToHead(newNode)
    }
  }

  /**
   * 删除缓存项
   *
   * @param key - 要删除的键
   * @returns 如果成功删除返回 true，如果键不存在返回 false
   *
   * @example
   * ```typescript
   * const cache = new LRUCache<string, number>(3);
   * cache.set('foo', 42);
   *
   * console.log(cache.delete('foo')); // true
   * console.log(cache.delete('bar')); // false
   * console.log(cache.has('foo')); // false
   * ```
   */
  delete(key: K): boolean {
    const node = this.cache.get(key)
    if (!node) return false

    this.cache.delete(key)
    this.removeNode(node)
    return true
  }

  /**
   * 检查是否存在指定键
   *
   * 注意：此方法不会影响项目的使用顺序。
   *
   * @param key - 要检查的键
   * @returns 如果键存在返回 true，否则返回 false
   *
   * @example
   * ```typescript
   * const cache = new LRUCache<string, number>(3);
   * cache.set('foo', 42);
   *
   * console.log(cache.has('foo')); // true
   * console.log(cache.has('bar')); // false
   * ```
   */
  has(key: K): boolean {
    return this.cache.has(key)
  }

  /**
   * 清空缓存
   *
   * 删除所有缓存项，将缓存重置为空状态。
   *
   * @example
   * ```typescript
   * const cache = new LRUCache<string, number>(3);
   * cache.set('a', 1);
   * cache.set('b', 2);
   *
   * console.log(cache.size); // 2
   * cache.clear();
   * console.log(cache.size); // 0
   * ```
   */
  clear(): void {
    this.cache.clear()
    this.head.next = this.tail
    this.tail.prev = this.head
  }

  /**
   * 获取当前缓存大小
   *
   * @returns 当前缓存中的项目数量
   *
   * @example
   * ```typescript
   * const cache = new LRUCache<string, number>(10);
   * console.log(cache.size); // 0
   *
   * cache.set('a', 1);
   * cache.set('b', 2);
   * console.log(cache.size); // 2
   * ```
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * 获取所有键（按使用顺序，从新到旧）
   *
   * @returns 包含所有键的数组，按照从最近使用到最久未使用的顺序排列
   *
   * @example
   * ```typescript
   * const cache = new LRUCache<string, number>(3);
   * cache.set('a', 1);
   * cache.set('b', 2);
   * cache.set('c', 3);
   * cache.get('a'); // 将 'a' 移动到最近使用位置
   *
   * console.log(cache.keys()); // ['a', 'c', 'b']
   * ```
   */
  keys(): K[] {
    const keys: K[] = []
    let current = this.head.next
    while (current && current !== this.tail) {
      keys.push(current.key)
      current = current.next
    }
    return keys
  }

  /**
   * 获取所有值（按使用顺序，从新到旧）
   *
   * @returns 包含所有值的数组，按照从最近使用到最久未使用的顺序排列
   *
   * @example
   * ```typescript
   * const cache = new LRUCache<string, number>(3);
   * cache.set('a', 1);
   * cache.set('b', 2);
   * cache.set('c', 3);
   *
   * console.log(cache.values()); // [3, 2, 1]
   * ```
   */
  values(): V[] {
    const values: V[] = []
    let current = this.head.next
    while (current && current !== this.tail) {
      values.push(current.value)
      current = current.next
    }
    return values
  }

  /**
   * 获取所有键值对（按使用顺序，从新到旧）
   *
   * @returns 包含所有键值对的数组，按照从最近使用到最久未使用的顺序排列
   *
   * @example
   * ```typescript
   * const cache = new LRUCache<string, number>(3);
   * cache.set('a', 1);
   * cache.set('b', 2);
   * cache.set('c', 3);
   *
   * console.log(cache.entries()); // [['c', 3], ['b', 2], ['a', 1]]
   * ```
   */
  entries(): [K, V][] {
    const entries: [K, V][] = []
    let current = this.head.next
    while (current && current !== this.tail) {
      entries.push([current.key, current.value])
      current = current.next
    }
    return entries
  }

  /**
   * 支持 for...of 遍历
   *
   * 使缓存可以使用 for...of 循环遍历，按照从最近使用到最久未使用的顺序。
   *
   * @yields 键值对 [K, V]
   *
   * @example
   * ```typescript
   * const cache = new LRUCache<string, number>(3);
   * cache.set('a', 1);
   * cache.set('b', 2);
   * cache.set('c', 3);
   *
   * for (const [key, value] of cache) {
   *   console.log(`${key}: ${value}`);
   * }
   * // 输出:
   * // c: 3
   * // b: 2
   * // a: 1
   * ```
   */
  *[Symbol.iterator](): Iterator<[K, V]> {
    let current = this.head.next
    while (current && current !== this.tail) {
      yield [current.key, current.value]
      current = current.next
    }
  }

  // 私有方法

  /**
   * 将节点添加到头部
   * @internal
   */
  private addToHead(node: LRUNode<K, V>): void {
    node.prev = this.head
    node.next = this.head.next
    this.head.next!.prev = node
    this.head.next = node
  }

  /**
   * 移除指定节点
   * @internal
   */
  private removeNode(node: LRUNode<K, V>): void {
    node.prev!.next = node.next
    node.next!.prev = node.prev
  }

  /**
   * 将节点移动到头部
   * @internal
   */
  private moveToHead(node: LRUNode<K, V>): void {
    this.removeNode(node)
    this.addToHead(node)
  }

  /**
   * 移除尾部节点
   * @internal
   */
  private removeTail(): void {
    const last = this.tail.prev!
    this.cache.delete(last.key)
    this.removeNode(last)
  }
}

/**
 * LRU Cache 创建选项
 */
export type LRUCacheOptions = {
  /** 缓存容量 */
  capacity: number
}

/**
 * 创建 LRU Cache 的工厂函数
 *
 * 提供一个更灵活的方式来创建 LRUCache 实例，支持选项对象参数。
 *
 * @template K - 键的类型，默认为 string
 * @template V - 值的类型，默认为 any
 * @param options - 创建选项
 * @returns 新的 LRUCache 实例
 *
 * @example
 * ```typescript
 * // 使用工厂函数创建缓存
 * const cache = createLRUCache<string, User>({ capacity: 100 });
 *
 * // 等价于
 * const cache2 = new LRUCache<string, User>(100);
 * ```
 *
 * @example
 * ```typescript
 * // 在函数中使用
 * function createUserCache(maxUsers: number) {
 *   return createLRUCache<number, User>({ capacity: maxUsers });
 * }
 *
 * const userCache = createUserCache(1000);
 * ```
 */
export function createLRUCache<K = string, V = any>(
  options: LRUCacheOptions,
): LRUCache<K, V> {
  return new LRUCache<K, V>(options.capacity)
}
