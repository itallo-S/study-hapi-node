class BaseRoute {
  static method() {
    return Object.getOwnPropertyNames(this.prototype)
    .filter((method) => method !== 'constructor' && !method.startsWith('_'))
  }
}

module.exports = BaseRoute