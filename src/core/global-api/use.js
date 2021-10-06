/* @flow */

import { toArray } from '../util/index'

// 初始化Vue.use
export function initUse (Vue: GlobalAPI) {
  // Vue.use可接受参数为函数或者对象
  Vue.use = function (plugin: Function | Object) {
    // Vue可使用插件为复数个
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    // 插件已经安装
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    // Vue.use可以接受多个参数，第一个参数为plugin，后续参数为plugin的参数
    const args = toArray(arguments, 1)
    args.unshift(this)
    // 如果插件是一个对象，则必须具有install方法，如果插件是一个函数，直接调用该函数
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }
    installedPlugins.push(plugin)
    return this
  }
}
