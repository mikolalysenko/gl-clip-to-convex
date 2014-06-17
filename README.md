gl-clip-to-convex
=================
Clips drawable region to a convex polytope

# Example

```javascript
```

# Install

```
npm install gl-clip-to-convex
```

# API

```javascript
var createClipper = require("gl-clip-to-convex")
```

## Constructor

### `var clipper = createClipper(gl, vertices)`
Creates a new clipper object

* `gl` is a WebGL context
* `vertices` is a list of vertices for the convex polytope

**Returns** A new clipper object

## Methods

### `clipper.draw(camera)`
Updates the depth buffer such that all subsequent draw calls will be clipped to the convex region.

* `camera` is an object containing the camera parameters of the object.

### `clipper.update(vertices)`
Updates the vertices of the clipper object

### `clipper.dispose()`
Destroys the clipper object and releases all resources

# Credits

(c) 2014 Mikola Lysenko.  MIT License