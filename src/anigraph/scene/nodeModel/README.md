# Node Models

`ANodeModel`s represent the model of scene graph nodes.

For the final project, we will be working mostly with children of the [`ANodeModel3D`](ANodeModel3D.ts) class. 

### [ANodeModel3D](ANodeModel3D.ts) 

- `model.transform`([Mat4](../../math/linalg/3D/Mat4.ts)): The model transformation for the scene graph node. In other words, the 4x4 matrix that transforms from the local coordinate system of this node to the local coordinate system of its parent. 
- `model.geometry`([AGeometrySet](../../math/geometry/AGeometrySet.ts)): A container for the geometry of this node. Most of the time you will not need to worry about this; you will instead deal directly with `model.verts`, which accesses a default member of `model.geometry`.
  - `model.verts`([VertexArray3D](../../math/geometry/VertexArray3D.ts)): accesses a member of `model.geometry` representing a potentially editable vertex array. For anything where you create the geometry, you will probably do so by specifying `model.verts`. 
- `model.material`([AMaterial](../../rendering/material/AMaterial.ts)): the material used to render the model. If you implement a custom shader, it will take the form of a material.



### [ANodeModel2D](ANodeModel2D.ts)
Same as ANodeModel3D except that `model.transform` is a [Mat3](../../math/linalg/2D/Mat3.ts), and `model.verts` is a [VertexArray2D](../../math/geometry/VertexArray2D.ts).
