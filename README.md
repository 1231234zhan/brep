

Model solid objects using [Boundary representation](https://en.wikipedia.org/wiki/Boundary_representation). Use [Euler Operations](https://en.wikipedia.org/wiki/Euler_operator_(digital_geometry)) to manipulate meshes. 

User could use five basic operations plus `sweep` to build a model.

```
mvsf  mev  mef  kemr  kfmrh  
```

B-rep data structure and operations are implemented in Typescript. This work uses [Three.js](https://github.com/mrdoob/three.js/) and some code from [Three.js Fundamentals](https://github.com/gfxfundamentals/threejsfundamentals) to draw the built model in browser. [poly2tri](https://github.com/r3mi/poly2tri.js/) is used to triangulate polygonal faces with holes inside.

You can build it with following commands. However there must be **so many bugs** in this project. Do not use it! It's just a course work.

```
npm install
npm run build
```
