module.exports = (() => {
"use strict"

//----------------------------------------------------------------------------
// The MultiMap class provides operations on a map that can have multiple
// values for the same key. This is imlemented in a way that it can be
// converted to JSON as an object with array values for the properties

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

   forEach(f) {
      for (const key of Object.keys(this)) {
         for (const v of this[key]) {
            f(key, v)
         }
      }
   }
}

})()
