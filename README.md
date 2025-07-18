# lru-cache [![Unit Test](https://github.com/xj63/lru-cache/actions/workflows/unit-test.yml/badge.svg)](https://github.com/xj63/lru-cache/actions/workflows/unit-test.yml) [![JSR](https://jsr.io/badges/@xj63/lru-cache)](https://jsr.io/@xj63/lru-cache) ![Minify Size](https://xj63.github.io/lru-cache/minify.svg) ![Gzipped Size](https://xj63.github.io/lru-cache/gzip.svg)

🚀 一个基于 TypeScript 实现的、快速且轻量级的 LRU (Least Recently Used) 缓存。

它通过双向链表和 `Map` 实现，确保 `get` 和 `set` 操作具有 **O(1)** 的时间复杂度。当缓存达到容量上限时，会自动淘汰最久未使用的项。

## ✨ 特性

-   ⚡️ **高性能**: 核心操作 (`get`, `set`, `delete`) 的时间复杂度均为 O(1)。
-   📦 **轻量级**: 零生产依赖，代码简洁，体积小。minify: 1.52 kB │ gzip: 0.56 kB
-   💪 **类型安全**: 使用 TypeScript 编写，提供完整的类型定义，拥有优秀的开发体验。
-   🌍 **现代 API**: 支持 `for...of` 迭代器，API 设计直观易用，与 `Map` 类似。
-   ✅ **简单可靠**: API 设计简单，上手快，经过充分测试，可靠性高。

## 📦 安装

已经发布到 GitHub Packages & JSR，您可以根据自己的包管理器选择以下任意一种方式安装：

```bash
npx jsr add @xj63/lru-cache   # npm
yarn add jsr:@xj63/lru-cache  # yarn
pnpm i jsr:@xj63/lru-cache    # pnpm
bunx jsr add @xj63/lru-cache  # bun
deno add jsr:@xj63/lru-cache  # deno
```

## 🚀 使用

### 基础用法

```typescript
import { LRUCache } from '@xj63/lru-cache';

// 创建一个容量为 3 的缓存
const cache = new LRUCache<string, number>(3);

// 添加缓存项
cache.set('a', 1);
cache.set('b', 2);
cache.set('c', 3);

// 获取缓存项
console.log(cache.get('a')); // 1
console.log(cache.get('d')); // undefined

// 添加新项，将触发淘汰
// 'b' 是最久未被访问的，所以它将被淘汰
cache.set('d', 4);

// 检查缓存状态
console.log(cache.size); // 3
console.log(cache.has('b')); // false
console.log(cache.keys()); // ['d', 'a', 'c'] (最近访问的在前)
```

### 使用自定义类型

`LRUCache` 支持泛型，可以轻松处理复杂类型。

```typescript
import { LRUCache } from '@xj63/lru-cache';

interface User {
  id: number;
  name: string;
}

const userCache = new LRUCache<number, User>(100);

userCache.set(1, { id: 1, name: 'Alice' });
userCache.set(2, { id: 2, name: 'Bob' });

const user = userCache.get(1);
console.log(user?.name); // 'Alice'
```

### 遍历缓存

缓存实例支持 `for...of` 循环，遍历顺序为**从最近使用到最久未使用**。

```typescript
import { LRUCache } from '@xj63/lru-cache';

const cache = new LRUCache<string, string>(3);
cache.set('first', 'A');
cache.set('second', 'B');
cache.set('third', 'C');

// 使用 for...of 遍历
for (const [key, value] of cache) {
  console.log(`${key}: ${value}`);
}
// 输出:
// third: C
// second: B
// first: A

// 也可以获取所有键值对
console.log(cache.entries()); // [['third', 'C'], ['second', 'B'], ['first', 'A']]
```

## 🛠️ 本地开发

欢迎参与贡献！您可以按照以下步骤在本地设置开发环境：

1.  **克隆仓库**
    ```bash
    git clone https://github.com/xj63/lru-cache.git
    cd lru-cache
    ```

2.  **安装依赖**
    ```bash
    bun install
    ```

3.  **常用命令**
    -   `bun dev`: 启动监视模式进行实时编译。
    -   `bun build`: 构建生产版本的代码。
    -   `bun test`: 运行所有测试。
    -   `bun lint`: 检查代码风格。
    -   `bun format`: 格式化所有代码。

## 📜 License

[MIT](./LICENSE) License © 2025 xj63
