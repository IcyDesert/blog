---
title: "高效的 Go 二维切片分配方式及原因"
description: "从常见力扣题目切入，在汇编层面分析高效的原因"
publishDate: "5 July 2026"
tags: ["Go"]
---

## 缘由

这篇文章来自笔者刷力扣的一点奇思妙想。以经典二维动态规划 [编辑距离](https://leetcode.cn/problems/edit-distance/description/) 为例，经常刷力扣的同学都知道，这类题目会有一个二维数组 `dp`，用来存储子问题的解。大部分人在写代码时，都会直接写成：

```go
m, n := len(s1), len(s2)
dp := make([][]int, m+1)
for i := range dp {
    dp[i] = make([]int, n+1) // 在循环中每次都调用一次 `make` 来分配一个新的切片
}
```

**但是**，在 [Effective Go](https://go.dev/doc/effective_go#two_dimensional_slices) 中，笔者看到一种 Go 官方推荐的做法：

> If the slices might not grow or shrink, it can be more efficient to construct the object with a single allocation.
>
> ```go
> m, n := len(s1), len(s2)
> dp := make([][]int, m+1)
> underlay := make([]int, (m+1)*(n+1)) // 仅调用一次 `make` 来分配一个大的切片
> for i := range dp {
>     dp[i], underlay = underlay[:n+1], underlay[n+1:] // 通过切片操作分配每一行
> }
> ```

实测，这两种方式在力扣 OJ 上的运行时间差别不大，用同样的状态转移方程都可以做到 0ms 和几乎相同的内存使用。那为什么 Go 官方推荐第二种方式呢？

## 直观感受

在下文中，我们把第一种方式称为非连续布局（Separate），记作 S；第二种方式称为连续布局（Contiguous），记作 C。

从代码上来看，

- S 布局需要调用 m+1 次 make 函数来分配内存，但每一行的切片直接指向每次 make 分配的内存块
- C 布局需要调用一次 make 函数，但需要 m+1 次切片操作来分配每一行

直觉上，make 函数的调用开销应该比切片操作大。make 函数涉及在堆上分配内存，大概率有系统调用、与 GC 打交道之类的耗时指令；相比之下，Go 中的切片数据由指针表示，切片操作本质上是腾挪指针，要比调用 make 函数分配内存快得多：

```go
// src/runtime/slice.go
type slice struct {
	array unsafe.Pointer
	len   int
	cap   int
}
```

也就是说，C 布局的运行开销应该比 S 布局小。但这只是直观感受，实际情况如何呢？

## Benchmark

```go
func allocSeparate(m, n int) [][]int {
	dp := make([][]int, m)
	for i := range dp {
		dp[i] = make([]int, n)
	}
	return dp
}

func allocContiguous(m, n int) [][]int {
	dp, underlay := make([][]int, m), make([]int, m*n)
	for i := range dp {
		dp[i], underlay = underlay[:n], underlay[n:]
	}
	return dp
}
```

这两个函数是被测对象，分别对应 S 布局和 C 布局。我们用 Go 的 benchmark 工具来测试它们的性能：

```go
func benchAlloc(b *testing.B, fn func(int, int) [][]int, m, n int) {
	for b.Loop() {
		fn(m, n)
	}
}
```
并设置多组方阵和非方阵测试数据，分别对应不同规模的二维切片分配。

<details>

```go
var allocCases = []benchCase{
	{name: "8x8", m: 8, n: 8},
	{name: "256x256", m: 256, n: 256},
	{name: "1024x1024", m: 1024, n: 1024},
	{name: "2048x2048", m: 2048, n: 2048},
	{name: "16x4096", m: 16, n: 4096},
	{name: "4096x16", m: 4096, n: 16},
	{name: "128x1024", m: 128, n: 1024},
	{name: "1024x128", m: 1024, n: 128},
}
```
</details>

在我的笔记本电脑上结果如下：

```bash
$ go test -bench=. -benchmem slice2d_bench_test.go 
goos: linux
goarch: amd64
cpu: 13th Gen Intel(R) Core(TM) i9-13900H
BenchmarkSeparate_8x8-20                 3102693               369.5 ns/op           704 B/op          9 allocs/op
BenchmarkContiguous_8x8-20               5024581               232.7 ns/op           704 B/op          2 allocs/op
BenchmarkSeparate_256x256-20                8203            160838 ns/op          530818 B/op        257 allocs/op
BenchmarkContiguous_256x256-20              8622            145530 ns/op          530819 B/op          2 allocs/op
BenchmarkSeparate_1024x1024-20               368           3231649 ns/op         8415876 B/op       1025 allocs/op
BenchmarkContiguous_1024x1024-20            1570            754953 ns/op         8415875 B/op          2 allocs/op
BenchmarkSeparate_2048x2048-20               138           8141752 ns/op        33603591 B/op       2049 allocs/op
BenchmarkContiguous_2048x2048-20             390           2955934 ns/op        33603586 B/op          2 allocs/op
BenchmarkSeparate_16x4096-20               10000            115131 ns/op          524674 B/op         17 allocs/op
BenchmarkContiguous_16x4096-20             12103            102182 ns/op          524676 B/op          2 allocs/op
BenchmarkSeparate_4096x16-20                4952            247381 ns/op          622592 B/op       4097 allocs/op
BenchmarkContiguous_4096x16-20              8372            155813 ns/op          622593 B/op          2 allocs/op
BenchmarkSeparate_128x1024-20               3613            330690 ns/op         1051780 B/op        129 allocs/op
BenchmarkContiguous_128x1024-20             4551            303209 ns/op         1051778 B/op          2 allocs/op
BenchmarkSeparate_1024x128-20               2835            366887 ns/op         1075842 B/op       1025 allocs/op
BenchmarkContiguous_1024x128-20             3115            388539 ns/op         1075842 B/op          2 allocs/op
```

测试的结论**几乎**也能支持我们的直观感受：C 布局的每一轮分配总时长，几乎都比 S 布局短，在 1024x1024 方阵上二者的分配速率比甚至达到了 1:4.3。而最终分配的内存大小几乎相同。

### 额外结论

有两个很有意思的现象：

1. 行较少的非方阵，两个布局分配速率差距不大；行越多，C 布局的优势越明显。
	为了验证这个现象我又跑了另一组测试，行列乘积（分配数据量）相同，但行列比例不同的测试：

<details>

```bash
$ go test -bench=. -benchmem slice2d_bench_test.go
goos: linux
goarch: amd64
cpu: 13th Gen Intel(R) Core(TM) i9-13900H
BenchmarkAlloc/1x1048576/Separate-20        1363            861594 ns/op         8388647 B/op          2 allocs/op
BenchmarkAlloc/1x1048576/Contiguous-20              1386            838168 ns/op         8388635 B/op          2 allocs/op
BenchmarkAlloc/2x524288/Separate-20                 1392            930961 ns/op         8388671 B/op          3 allocs/op
BenchmarkAlloc/2x524288/Contiguous-20               1167            885826 ns/op         8388659 B/op          2 allocs/op
BenchmarkAlloc/4x262144/Separate-20                 1137           1118058 ns/op         8388716 B/op          5 allocs/op
BenchmarkAlloc/4x262144/Contiguous-20               1557            768104 ns/op         8388706 B/op          2 allocs/op
BenchmarkAlloc/8x131072/Separate-20                  808           1239958 ns/op         8388810 B/op          9 allocs/op
BenchmarkAlloc/8x131072/Contiguous-20               1405            752010 ns/op         8388802 B/op          2 allocs/op
BenchmarkAlloc/16x65536/Separate-20                  746           1620847 ns/op         8388999 B/op         17 allocs/op
BenchmarkAlloc/16x65536/Contiguous-20               1650            732378 ns/op         8388993 B/op          2 allocs/op
BenchmarkAlloc/32x32768/Separate-20                  704           1573107 ns/op         8389512 B/op         33 allocs/op
BenchmarkAlloc/32x32768/Contiguous-20               1491            749449 ns/op         8389506 B/op          2 allocs/op
BenchmarkAlloc/64x16384/Separate-20                  738           1563769 ns/op         8390406 B/op         65 allocs/op
BenchmarkAlloc/64x16384/Contiguous-20               1461            810575 ns/op         8390401 B/op          2 allocs/op
BenchmarkAlloc/128x8192/Separate-20                  664           1764810 ns/op         8391817 B/op        129 allocs/op
BenchmarkAlloc/128x8192/Contiguous-20               1369            758166 ns/op         8391809 B/op          2 allocs/op
BenchmarkAlloc/256x4096/Separate-20                  540           2052760 ns/op         8395144 B/op        257 allocs/op
BenchmarkAlloc/256x4096/Contiguous-20               1585            739080 ns/op         8395138 B/op          2 allocs/op
BenchmarkAlloc/1024x1024/Separate-20                 375           3156333 ns/op         8415878 B/op       1025 allocs/op
BenchmarkAlloc/1024x1024/Contiguous-20              1310            791561 ns/op         8415873 B/op          2 allocs/op
```
</details>

结果支持。

2. `1024x128` 的非方阵，C 布局的分配速率反而比 S 布局慢。后来做了重复实验，发现这可能是波动导致的，总体来看，在这个测试用例上 C 布局的分配速率比 S 布局快。
   但似乎 C 布局的波动频率很高，在我做的 6 次实验中就出现了两次「异常」值——大多数测例是 ~250000 ns/op ，而这两次异常值分别是 388539 ns/op、420749 ns/op。

## 汇编分析