---
title: "Go append 使用详解"
description: ""
publishDate: "03 Nov 2025"
tags: ["Go"]
---

来自 Go 的官方使用场景：

```go
// The append built-in function appends elements to the end of a slice. If
// it has sufficient capacity, the destination is resliced to accommodate the
// new elements. If it does not, a new underlying array will be allocated.
// Append returns the updated slice. It is therefore necessary to store the
// result of append, often in the variable holding the slice itself:
//
//	slice = append(slice, elem1, elem2)
//	slice = append(slice, anotherSlice...)
//
// As a special case, it is legal to append a string to a byte slice, like this:
//
//	slice = append([]byte("hello "), "world"...)
func append(slice []Type, elems ...Type) []Type
```

append 的函数签名 `...Type` 指明它是 variadic function，即参数量可变。对于这种函数，可以参考 [省略号在 Go 中的使用](https://go.dev/ref/spec#Passing_arguments_to_..._parameters)，

函数内部会认为 elems 是 []T 类型

> If f is variadic with a final parameter p of type ...T, then within f the type of p is equivalent to type []T.



## 基本使用场景一

最典型的，往切片后面插入新元素

```go
a := []int{1, 1, 2, 3, 5}

a = append(a, 8, 13, 21)

//	slice = append(slice, elem1, elem2)

```

当插入的是一个一个的元素时，后面所跟的参数可以有多个；但类型必须与切片相同。

## 基本使用场景二

将一个数组「拆分」后插入，有点像 python 的 list.extends

```go
a := []int{1, 1, 2}
b := []int{3, 5, 8}

a = append(a, b...)
//	slice = append(slice, anotherSlice...)
```

这时候
- 只允许有**两个参数**
- 后面的数组必须使用 `...` 解包。
