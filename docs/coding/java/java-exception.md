---
isTimeLine: true
title: 异常汇总
date: 2022-05-24
tag: 
 - Java
---
# 异常汇总

## 迭代ArrayList或者HashMap出现ConcurrentModificationException

当我们迭代一个ArrayList或者HashMap时，如果尝试对集合做一些修改操作（例如删除元素），可能会抛出`java.util.ConcurrentModificationException`的异常。

``` java
package demo.test;

import java.util.ArrayList;
import java.util.List;
public class main {

    public static void main(String args[]) {
        List<String> list = new ArrayList<String>();
        list.add("A");
        list.add("B");

        for (String s : list) {
            if (s.equals("B")) {
                list.remove(s);
            }
        }

        //foreach循环等效于迭代器
        /*Iterator<String> iterator=list.iterator();
        while(iterator.hasNext()){
            String s=iterator.next();
            if (s.equals("B")) {
                list.remove(s);
            }
        }*/
    }
}

```

**Output:for循环开始的那一行出错：**
``` java
Exception in thread "main" java.util.ConcurrentModificationException
	at java.util.ArrayList$Itr.checkForComodification(ArrayList.java:909)
	at java.util.ArrayList$Itr.next(ArrayList.java:859)
	at demo.beanTest.main.main(main.java:12)
```
### 异常原因

ArrayList的父类AbstarctList中有一个域`modCount`，每次对集合进行修改（增添元素，删除元素……）时都会`modCount++`

而foreach的背后实现原理其实就是Iterator（关于Iterator可以看[Java Design Pattern: Iterator](https://link.jianshu.com?t=http://www.programcreek.com/2013/02/java-design-pattern-iterator/)），等同于注释部分代码。在这里，迭代ArrayList的Iterator中有一个变量`expectedModCount`，该变量会初始化和`modCount`相等，但如果接下来如果集合进行修改`modCount`改变，就会造成`expectedModCount!=modCount`，此时就会抛出java.util.ConcurrentModificationException异常


我们再来根据源码详细的走一遍这个过程
``` java
/*
 *AbstarctList的内部类，用于迭代
 */
private class Itr implements Iterator<E> {
    int cursor = 0;   //将要访问的元素的索引
    int lastRet = -1;  //上一个访问元素的索引
    int expectedModCount = modCount;//expectedModCount为预期修改值，初始化等于modCount（AbstractList类中的一个成员变量）

    //判断是否还有下一个元素
    public boolean hasNext() {
            return cursor != size();
    }
    //取出下一个元素
    public E next() {
            checkForComodification();  //关键的一行代码，判断expectedModCount和modCount是否相等
        try {
        E next = get(cursor);
        lastRet = cursor++;
        return next;
        } catch (IndexOutOfBoundsException e) {
        checkForComodification();
        throw new NoSuchElementException();
        }
    }

    public void remove() {
        if (lastRet == -1)
        throw new IllegalStateException();
            checkForComodification();

        try {
        AbstractList.this.remove(lastRet);
        if (lastRet < cursor)
            cursor--;
        lastRet = -1;
        expectedModCount = modCount;
        } catch (IndexOutOfBoundsException e) {
        throw new ConcurrentModificationException();
        }
    }

    final void checkForComodification() {
        if (modCount != expectedModCount)
        throw new ConcurrentModificationException();
    }
    }
```

根据代码可知，每次迭代list时，会初始化Itr的三个成员变量

```
int cursor = 0;   //将要访问的元素的索引
int lastRet = -1;  //上一个访问元素的索引
int expectedModCount = modCount; //预期修改值，初始化等于modCount（AbstractList类中的一个成员变量）
```

接着调用`hasNext()`循环判断访问元素的下标是否到达末尾。如果没有，调用`next()`方法，取出元素。\
而最上面测试代码出现异常的原因在于，`next()`方法调用`checkForComodification()`时，发现了`modCount != expectedModCount`

接下来我们看下ArrayList的源码，了解下modCount 是如何与expectedModCount不相等的。

```
public boolean add(E paramE) {  
    ensureCapacityInternal(this.size + 1);  
    /** 省略此处代码 */  
}  
  
private void ensureCapacityInternal(int paramInt) {  
    if (this.elementData == EMPTY_ELEMENTDATA)  
        paramInt = Math.max(10, paramInt);  
    ensureExplicitCapacity(paramInt);  
}  
  
private void ensureExplicitCapacity(int paramInt) {  
    this.modCount += 1;    //修改modCount  
    /** 省略此处代码 */  
}  
  
public boolean remove(Object paramObject) {  
    int i;  
    if (paramObject == null)  
        for (i = 0; i < this.size; ++i) {  
            if (this.elementData[i] != null)  
                continue;  
            fastRemove(i);  
            return true;  
        }  
    else  
        for (i = 0; i < this.size; ++i) {  
            if (!(paramObject.equals(this.elementData[i])))  
                continue;  
            fastRemove(i);  
            return true;  
        }  
    return false;  
}  
  
private void fastRemove(int paramInt) {  
    this.modCount += 1;   //修改modCount  
    /** 省略此处代码 */  
}  
  
public void clear() {  
    this.modCount += 1;    //修改modCount  
    /** 省略此处代码 */  
}  
```

从上面的代码可以看出，ArrayList的add、remove、clear方法都会造成modCount的改变。迭代过程中如何调用这些方法就会造成modCount的增加，使迭代类中expectedModCount和modCount不相等。

### 异常的解决

#### 1. 单线程环境

好，现在我们已经基本了解了异常的发送原因了。接下来我们来解决它。\
我很任性，我就是想在迭代集合时删除集合的元素，怎么办？

```
Iterator<String> iter = list.iterator();
while(iter.hasNext()){
    String str = iter.next();
      if( str.equals("B") )
      {
        iter.remove();
      }
}
```

细心的朋友会发现Itr中的也有一个remove方法，实质也是调用了ArrayList中的remove，但增加了`expectedModCount = modCount;`保证了不会抛出java.util.ConcurrentModificationException异常。

但是，这个办法的有两个弊端\
1.只能进行remove操作，add、clear等Itr中没有。\
2.而且只适用单线程环境。

#### 2. 多线程环境

在多线程环境下，我们再次试验下上面的代码
```
public class Test2 {
    static List<String> list = new ArrayList<String>();

    public static void main(String[] args) {
        list.add("a");
        list.add("b");
        list.add("c");
        list.add("d");

        new Thread() {
            public void run() {
                Iterator<String> iterator = list.iterator();

                while (iterator.hasNext()) {
                    System.out.println(Thread.currentThread().getName() + ":"
                            + iterator.next());
                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            };
        }.start();

        new Thread() {
            public synchronized void run() {
                Iterator<String> iterator = list.iterator();

                while (iterator.hasNext()) {
                    String element = iterator.next();
                    System.out.println(Thread.currentThread().getName() + ":"
                            + element);
                    if (element.equals("c")) {
                        iterator.remove();
                    }
                }
            };
        }.start();

    }
}
```

Output:

异常的原因很简单，一个线程修改了list的modCount导致另外一个线程迭代时modCount与该迭代器的expectedModCount不相等。

此时有两个办法：

1.  迭代前加锁，解决了多线程问题，但还是不能进行迭代add、clear等操作

```
public class Test2 {
    static List<String> list = new ArrayList<String>();

    public static void main(String[] args) {
        list.add("a");
        list.add("b");
        list.add("c");
        list.add("d");

        new Thread() {
            public void run() {
                Iterator<String> iterator = list.iterator();

                synchronized (list) {
                    while (iterator.hasNext()) {
                        System.out.println(Thread.currentThread().getName()
                                + ":" + iterator.next());
                        try {
                            Thread.sleep(1000);
                        } catch (InterruptedException e) {
                            // TODO Auto-generated catch block
                            e.printStackTrace();
                        }
                    }
                }
            };
        }.start();

        new Thread() {
            public synchronized void run() {
                Iterator<String> iterator = list.iterator();

                synchronized (list) {
                    while (iterator.hasNext()) {
                        String element = iterator.next();
                        System.out.println(Thread.currentThread().getName()
                                + ":" + element);
                        if (element.equals("c")) {
                            iterator.remove();
                        }
                    }
                }
            };
        }.start();

    }
}
```

2.  采用CopyOnWriteArrayList，解决了多线程问题，同时可以add、clear等操作

```
public class Test2 {
    static List<String> list = new CopyOnWriteArrayList<String>();

    public static void main(String[] args) {
        list.add("a");
        list.add("b");
        list.add("c");
        list.add("d");

        new Thread() {
            public void run() {
                Iterator<String> iterator = list.iterator();

                    while (iterator.hasNext()) {
                        System.out.println(Thread.currentThread().getName()
                                + ":" + iterator.next());
                        try {
                            Thread.sleep(1000);
                        } catch (InterruptedException e) {
                            // TODO Auto-generated catch block
                            e.printStackTrace();
                        }
                    }
            };
        }.start();

        new Thread() {
            public synchronized void run() {
                Iterator<String> iterator = list.iterator();

                    while (iterator.hasNext()) {
                        String element = iterator.next();
                        System.out.println(Thread.currentThread().getName()
                                + ":" + element);
                        if (element.equals("c")) {
                            list.remove(element);
                        }
                    }
            };
        }.start();

    }
}
```

CopyOnWriteArrayList也是一个线程安全的ArrayList，其实现原理在于，每次add,remove等所有的操作都是重新创建一个新的数组，再把引用指向新的数组。\
由于我用CopyOnWriteArrayList少，这里就不多讨论了，想了解可以看：[Java并发编程：并发容器之CopyOnWriteArrayList](https://link.jianshu.com?t=http://www.cnblogs.com/dolphin0520/p/3938914.html)

### 深入理解异常—fail-fast机制

到这里，我们似乎已经理解完这个异常的产生缘由了。\
但是，仔细思考，还是会有几点疑惑：

1.  既然modCount与expectedModCount不同会产生异常，那为什么还设置这个变量
1.  ConcurrentModificationException可以翻译成“并发修改异常”，那这个异常是否与多线程有关呢？

我们来看看源码中modCount的注解


```
/**
     * The number of times this list has been <i>structurally modified</i>.
     * Structural modifications are those that change the size of the
     * list, or otherwise perturb it in such a fashion that iterations in
     * progress may yield incorrect results.
     *
     * <p>This field is used by the iterator and list iterator implementation
     * returned by the {@code iterator} and {@code listIterator} methods.
     * If the value of this field changes unexpectedly, the iterator (or list
     * iterator) will throw a {@code ConcurrentModificationException} in
     * response to the {@code next}, {@code remove}, {@code previous},
     * {@code set} or {@code add} operations.  This provides
     * <i>fail-fast</i> behavior, rather than non-deterministic behavior in
     * the face of concurrent modification during iteration.
     *
     * <p><b>Use of this field by subclasses is optional.</b> If a subclass
     * wishes to provide fail-fast iterators (and list iterators), then it
     * merely has to increment this field in its {@code add(int, E)} and
     * {@code remove(int)} methods (and any other methods that it overrides
     * that result in structural modifications to the list).  A single call to
     * {@code add(int, E)} or {@code remove(int)} must add no more than
     * one to this field, or the iterators (and list iterators) will throw
     * bogus {@code ConcurrentModificationExceptions}.  If an implementation
     * does not wish to provide fail-fast iterators, this field may be
     * ignored.
     */
    protected transient int modCount = 0;
```

我们注意到，注解中频繁的出现了`fail-fast`\
那么`fail-fast`（快速失败）机制是什么呢？

> “快速失败”也就是fail-fast，它是Java集合的一种错误检测机制。当多个线程对集合进行结构上的改变的操作时，有可能会产生fail-fast机制。记住是有可能，而不是一定。例如：假设存在两个线程（线程1、线程2），线程1通过Iterator在遍历集合A中的元素，在某个时候线程2修改了集合A的结构（是结构上面的修改，而不是简单的修改集合元素的内容），那么这个时候程序就会抛出 ConcurrentModificationException 异常，从而产生fail-fast机制。

看到这里，我们明白了，fail-fast机制就是为了防止多线程修改集合造成并发问题的机制嘛。\
之所以有modCount这个成员变量，就是为了辨别多线程修改集合时出现的错误。而java.util.ConcurrentModificationException就是并发异常。\
但是单线程使用不单时也可能抛出这个异常。

\
参考：[Java提高篇（三四）-----fail-fast机制](https://blog.csdn.net/chenssy/article/details/38151189)\
原文作者：MrDTree\
链接：https://www.jianshu.com/p/c5b52927a61a\