/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0

// 初始化混入
export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++

    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    vm._isVue = true
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      // 子组件：性能优化，减少原型链的动态查找，提高执行效率
      initInternalComponent(vm, options)
    } else {
      // 根组件：选项合并，将全局配置合并到根组件的实例上
      // 1. Vue.component做了选项合并，合并Vue内置的全局组件和用户自己注册的全局组件，最终都会放到components选项上
      // 2. components局部注册，执行编译器生成的render函数时进行选合并，合并全局配置项到组件局部配置项上
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    // 组件关系属性的初始化 $parent, $root, $children, $refs, _watcher, _directInactive
    initLifecycle(vm)
    // 初始化自定事件
    // 谁触发谁监听
    // 触发 this.$emit('click') 监听 this.$on('click', function handler() {})
    initEvents(vm)
    // 初始化插槽，获取this.$slots 定义this._c 即createElement方法，平时使用的h函数
    initRender(vm)
    // 执行beforeCreate生命周期函数
    callHook(vm, 'beforeCreate')
    // 初始化inject选项 并做响应式处理
    initInjections(vm) // resolve injections before data/props
    // 响应式处理的核心，对data，props，method进行处理
    initState(vm)
    // 处理provide选项
    initProvide(vm) // resolve provide after data/props
    // 调用created生命周期函数
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

// 性能优化 打平配置对象上的属性，减少运行时原型链的查找，提高执行效率
export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

// 从构造函数上解析对象
export function resolveConstructorOptions (Ctor: Class<Component>) {
  let options = Ctor.options
  // Ctor是由Vue.extend创建的继承自Vue类的子类
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super)
    // 缓存
    const cachedSuperOptions = Ctor.superOptions
    // 基类配置项发生了变化
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      // 发生变化的配置项
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      // 更改的选项和extend合并
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      // 新选项赋值给options
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

// 解析构造函数选项中后续被修改或者增加的选项
function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  // 构造函数选项
  const latest = Ctor.options
  // 密封的构造函数选项，备份
  const sealed = Ctor.sealedOptions
  // 对比两个选项，记录不一致的选项
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}
