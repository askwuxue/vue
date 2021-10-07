import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
  // instanceof 运算符用于检测构造函数的 prototype 属性是否出现在某个实例对象的原型链上。
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 初始化
  this._init(options)
}
// initLifecycle, initEvents, initRender, initInjections, initState, initProvide
initMixin(Vue)
// $set，$delete，$watch
stateMixin(Vue)
// $on， $once，$off, $emit
eventsMixin(Vue)
// _update, $forceUpdate, $destroy
lifecycleMixin(Vue)
// $nextTick, _render
renderMixin(Vue)

export default Vue
