/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */
/**
 * 定义 arrayMethods 对象，用于增强 Array.prototype
 * 当访问 arrayMethods 对象上的那七个方法时会被拦截，以实现数组响应式
*/

import { def } from '../util/index'
// 备份 数组 原型对象
const arrayProto = Array.prototype
// 通过继承的方式创建新的 arrayMethods
export const arrayMethods = Object.create(arrayProto)

// 以下方法被重写，调用时会触发更新
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
// 重写数组方法
methodsToPatch.forEach(function (method) {
  // cache original method
  // 缓存原生方法，比如 push
  const original = arrayProto[method]
  // arrayMethods对象配置属性
  def(arrayMethods, method, function mutator (...args) {
    // 执行数组方法，传递参数
    const result = original.apply(this, args)
    // 调用数组方法的对象上添加__ob__属性
    const ob = this.__ob__
    let inserted
    // 如果 method 是以下三个之一，说明是新插入了元素
    switch (method) {
      case 'push':
      case 'unshift':
        // 新插入数组的数据
        inserted = args
        break
      case 'splice':
        // 使用数组的splice方法时，传递的参数数组为args，新插入数据为args.slice(2)
        inserted = args.slice(2)
        break
    }
    // 对新插入的元素做响应式处理
    if (inserted) ob.observeArray(inserted)
    // 通知更新
    ob.dep.notify()
    return result
  })
})
