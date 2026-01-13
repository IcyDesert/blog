---
title: "无内鬼，来点 Go 笑话"
description: ""
publishDate: "13 Jan 2026"
tags: ["Go"]
---

刷算法有感：这是 Go 1.21 以前的一个辅助函数

```go
func min(a, b int) int {
    if a > b {
        return b
    }
    return a
}
```

<details>
<summary>笑点解析</summary>

1. Go 1.21 之前甚至没有一个内置的 min/max 函数；不过现在加了，支持传数组
2. Go 到现在没有三目运算符

</details>
