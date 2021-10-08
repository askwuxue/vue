/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def } from '../util/index'
// 以Array.prototype为原型创建新对象，为该对象重写数组方法
const arrayProto = Array.prototype
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
  const original = arrayProto[method]
  // arrayMethods对象配置属性
  def(arrayMethods, method, function mutator (...args) {
    // 执行数组方法，传递参数
    const result = original.apply(this, args)
    // 调用数组方法的对象上添加__ob__属性
    const ob = this.__ob__
    let inserted
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
    // 为数组元素设置响应式
    if (inserted) ob.observeArray(inserted)
    // notify change
    // 通知更新
    ob.dep.notify()
    return result
  })
})
