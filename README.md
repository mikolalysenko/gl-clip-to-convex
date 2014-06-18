gl-clip-to-convex
=================
Clips drawable region to a convex polytope

# Example

[Try this in your browser here.](https://mikolalysenko.github.io/gl-clip-to-convex)

```javascript
var NUM_VERTS = 10

var shell = require("gl-now")({
  tickRate: 2,
  clearColor: [0,0,0,0] 
})
var camera = require("game-shell-orbit-camera")(shell)
var now = require("right-now")
var createScatter = require("gl-scatter-plot")
var createClipper = require("gl-clip-to-convex")
var mat4 = require("gl-matrix").mat4

camera.lookAt(
  [10, 0, 0],
  [ 0, 0, 0],
  [ 0, 1, 0])

var phases, freqs, clipper, pointCloud

function getVerts() {
  var t = 0.0001 * now()
  var verts = new Array(NUM_VERTS)
  for(var i=0; i<NUM_VERTS; ++i) {
    var p = phases[i]
    var f = freqs[i]
    verts[i] = [
      Math.sin(f[0] * t + p[0]),
      Math.sin(f[1] * t + p[1]),
      Math.sin(f[2] * t + p[2]) ]
  }
  return verts
}


shell.on("gl-init", function() {
  var gl = shell.gl

  //Initialize curve parameters
  phases = new Array(NUM_VERTS)
  freqs = new Array(NUM_VERTS)
  for(var i=0; i<NUM_VERTS; ++i) {
    phases[i] = [
      2.0 * Math.PI * Math.random(), 
      2.0 * Math.PI * Math.random(), 
      2.0 * Math.PI * Math.random() ]
    freqs[i] = [ 
      (Math.random() * 30)|0,
      (Math.random() * 30)|0,
      (Math.random() * 30)|0 ]
  }

  //Create point cloud
  var pcVerts = new Array(1000)
  var pcColors = new Array(1000)
  for(var i=0; i<1000; ++i) {
    pcVerts[i] = [
      2*Math.random()-1,
      2*Math.random()-1,
      2*Math.random()-1]
    pcColors[i] = [
      Math.random(),
      Math.random(),
      Math.random()]
  }
  pointCloud = createScatter(gl, {
    positions: pcVerts,
    colors: pcColors,
    size: 12,
    orthographic: true
  })

  clipper = createClipper(gl, getVerts())
})

shell.on("gl-render", function() {
  var gl = shell.gl
  var cameraParameters = {
    view: camera.view(),
    projection: mat4.perspective(
        mat4.create(),
        Math.PI/4.0,
        shell.width/shell.height,
        0.1,
        1000.0)
  }
  gl.clear(gl.DEPTH_BUFFER_BIT)
  gl.depthMask(true)
  gl.enable(gl.DEPTH_TEST)

  clipper.update(getVerts())
  clipper.draw(cameraParameters)
  pointCloud.draw(cameraParameters)
})
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