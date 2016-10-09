module.exports = (() => {
"use strict"

return class {
   constructor() {}

   get(key) {
      return this[key]
   }

   set(key, value) {
      if (this[key] === undefined) {
         this[key] = []
      }
      this[key].push(value)
   }

   union(that) {
      for (const key of Object.keys(that)) {
         if (this[key] === undefined) {
            this[key] = []
         }
         for (const t of that[key]) {
            this[key].push(t)
         }
      }
   }
}

})()
