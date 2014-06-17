"use strict"

var createBuffer = require("gl-buffer")
var createVAO = require("gl-vao")
var createState = require("gl-state")
var glslify = require("glslify")
var convexHull = require("incremental-convex-hull")

var createShader = glslify({
  vertex: "./shaders/vertex.glsl",
  fragment: "./shaders/fragment.glsl"
})

var IDENTITY = [ 1,0,0,0, 
                 0,1,0,0,
                 0,0,1,0,
                 0,0,0,1 ]

function TrimPolytope(gl, shader, buffer, vao, state) {
  this.gl = gl
  this.shader = shader
  this.buffer = buffer
  this.vao = vao
  this.state = state
  this.vertexCount = 0
}

var proto = TrimPolytope.prototype

proto.draw = function(camera) {
  this.shader.bind()
  this.shader.uniforms = {
    model: camera.model || IDENTITY,
    view: camera.view || IDENTITY,
    projection: camera.projection || IDENTITY
  }
  this.vao.bind()
  this.vao.draw(gl.TRIANGLES, this.vertexCount)
}

proto.update = function(vertices) {
}

proto.dispose = function() {
  this.shader.dispose()
  this.vao.dispose()
  this.buffer.dispose()
}

function createTrimPolytope(gl, vertices) {
  var shader = createShader(gl)
  shader.attributes.position.location = 0

  var buffer = createBuffer(gl)
  var vao = createVAO(gl, [{
      "buffer": buffer,
      "size": 3
    }])

  var clipper = new TrimPolytope(
    gl, 
    shader,
    buffer,
    vao)

  clipper.update(vertices) 

  return clipper
}