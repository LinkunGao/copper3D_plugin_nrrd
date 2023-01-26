(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('three'), require('fflate')) :
  typeof define === 'function' && define.amd ? define(['exports', 'three', 'fflate'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["bundle-name"] = {}, global.three, global.fflate));
})(this, (function (exports, three, fflate) { 'use strict';

  function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    }
    n.default = e;
    return Object.freeze(n);
  }

  var fflate__namespace = /*#__PURE__*/_interopNamespaceDefault(fflate);

  /**
   * This class has been made to hold a slice of a volume data
   * @class
   * @param   {Volume} volume    The associated volume
   * @param   {number}       [index=0] The index of the slice
   * @param   {string}       [axis='z']      For now only 'x', 'y' or 'z' but later it will change to a normal vector
   * @see Volume
   */
  class VolumeSlice {
    constructor(volume, index, axis) {
      const slice = this;
      /**
       * @member {Volume} volume The associated volume
       */
      this.volume = volume;
      /**
       * @member {Number} index The index of the slice, if changed, will automatically call updateGeometry at the next repaint
       */
      index = index || 0;
      Object.defineProperty(this, "index", {
        get: function () {
          return index;
        },
        set: function (value) {
          index = value;
          slice.geometryNeedsUpdate = true;
          return index;
        },
      });
      /**
       * @member {String} axis The normal axis
       */
      this.axis = axis || "z";

      /**
       * @member {HTMLCanvasElement} canvas The final canvas used for the texture
       */
      /**
       * @member {CanvasRenderingContext2D} ctx Context of the canvas
       */
      this.canvas = document.createElement("canvas");
      /**
       * @member {HTMLCanvasElement} canvasBuffer The intermediary canvas used to paint the data
       */
      /**
       * @member {CanvasRenderingContext2D} ctxBuffer Context of the canvas buffer
       */
      this.canvasBuffer = document.createElement("canvas");
      this.updateGeometry();

      const canvasMap = new three.Texture(this.canvas);
      canvasMap.minFilter = three.LinearFilter;
      canvasMap.wrapS = canvasMap.wrapT = three.ClampToEdgeWrapping;
      const material = new three.MeshBasicMaterial({
        map: canvasMap,
        side: three.DoubleSide,
        transparent: true,
      });
      /**
       * @member {Mesh} mesh The mesh ready to get used in the scene
       */
      this.mesh = new three.Mesh(this.geometry, material);
      this.mesh.matrixAutoUpdate = false;
      /**
       * @member {Boolean} geometryNeedsUpdate If set to true, updateGeometry will be triggered at the next repaint
       */
      this.geometryNeedsUpdate = true;
      this.repaint();

      /**
       * @member {Number} iLength Width of slice in the original coordinate system, corresponds to the width of the buffer canvas
       */

      /**
       * @member {Number} jLength Height of slice in the original coordinate system, corresponds to the height of the buffer canvas
       */

      /**
       * @member {Function} sliceAccess Function that allow the slice to access right data
       * @see Volume.extractPerpendicularPlane
       * @param {Number} i The first coordinate
       * @param {Number} j The second coordinate
       * @returns {Number} the index corresponding to the voxel in volume.data of the given position in the slice
       */
    }

    /**
     * @member {Function} repaint Refresh the texture and the geometry if geometryNeedsUpdate is set to true
     * @memberof VolumeSlice
     */
    repaint() {
      if (this.geometryNeedsUpdate) {
        this.updateGeometry();
      }

      const iLength = this.iLength,
        jLength = this.jLength,
        sliceAccess = this.sliceAccess,
        volume = this.volume,
        canvas = this.canvasBuffer,
        ctx = this.ctxBuffer;

      // get the imageData and pixel array from the canvas
      const imgData = ctx.getImageData(0, 0, iLength, jLength);
      const data = imgData.data;
      const volumeData = volume.data;
      const upperThreshold = volume.upperThreshold;
      const lowerThreshold = volume.lowerThreshold;
      const windowLow = volume.windowLow;
      const windowHigh = volume.windowHigh;

      // manipulate some pixel elements
      let pixelCount = 0;

      if (volume.dataType === "label") {
        //this part is currently useless but will be used when colortables will be handled
        for (let j = 0; j < jLength; j++) {
          for (let i = 0; i < iLength; i++) {
            let label = volumeData[sliceAccess(i, j)];
            label =
              label >= this.colorMap.length
                ? (label % this.colorMap.length) + 1
                : label;
            const color = this.colorMap[label];
            data[4 * pixelCount] = (color >> 24) & 0xff;
            data[4 * pixelCount + 1] = (color >> 16) & 0xff;
            data[4 * pixelCount + 2] = (color >> 8) & 0xff;
            data[4 * pixelCount + 3] = color & 0xff;
            pixelCount++;
          }
        }
      } else {
        for (let j = 0; j < jLength; j++) {
          for (let i = 0; i < iLength; i++) {
            let value = volumeData[sliceAccess(i, j)];
            let alpha = 0xff;
            //apply threshold
            alpha =
              upperThreshold >= value ? (lowerThreshold <= value ? alpha : 0) : 0;
            //apply window level
            value = Math.floor(
              (255 * (value - windowLow)) / (windowHigh - windowLow)
            );
            value = value > 255 ? 255 : value < 0 ? 0 : value | 0;

            data[4 * pixelCount] = value;
            data[4 * pixelCount + 1] = value;
            data[4 * pixelCount + 2] = value;
            data[4 * pixelCount + 3] = alpha;
            pixelCount++;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      this.ctx.drawImage(
        canvas,
        0,
        0,
        iLength,
        jLength,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );

      this.mesh.material.map.needsUpdate = true;
    }

    /**
     * @member {Function} Refresh the geometry according to axis and index
     * @see Volume.extractPerpendicularPlane
     * @memberof VolumeSlice
     */
    updateGeometry() {
      const extracted = this.volume.extractPerpendicularPlane(
        this.axis,
        this.index
      );
      this.sliceAccess = extracted.sliceAccess;
      this.jLength = extracted.jLength;
      this.iLength = extracted.iLength;
      this.matrix = extracted.matrix;

      this.canvas.width = extracted.planeWidth;
      this.canvas.height = extracted.planeHeight;
      this.canvasBuffer.width = this.iLength;
      this.canvasBuffer.height = this.jLength;
      this.ctx = this.canvas.getContext("2d");
      this.ctxBuffer = this.canvasBuffer.getContext("2d");

      if (this.geometry) this.geometry.dispose(); // dispose existing geometry

      this.geometry = new three.PlaneGeometry(
        extracted.planeWidth,
        extracted.planeHeight
      );

      if (this.mesh) {
        this.mesh.geometry = this.geometry;
        //reset mesh matrix
        this.mesh.matrix.identity();
        this.mesh.applyMatrix4(this.matrix);
      }

      this.geometryNeedsUpdate = false;
    }
  }

  /**
   * This class had been written to handle the output of the NRRD loader.
   * It contains a volume of data and informations about it.
   * For now it only handles 3 dimensional data.
   * See the webgl_loader_nrrd.html example and the loaderNRRD.js file to see how to use this class.
   * @class
   * @param   {number}        xLength         Width of the volume
   * @param   {number}        yLength         Length of the volume
   * @param   {number}        zLength         Depth of the volume
   * @param   {string}        type            The type of data (uint8, uint16, ...)
   * @param   {ArrayBuffer}   arrayBuffer     The buffer with volume data
   */
  class Volume {
    constructor(xLength, yLength, zLength, type, arrayBuffer) {
      if (xLength !== undefined) {
        /**
         * @member {number} xLength Width of the volume in the IJK coordinate system
         */
        this.xLength = Number(xLength) || 1;
        /**
         * @member {number} yLength Height of the volume in the IJK coordinate system
         */
        this.yLength = Number(yLength) || 1;
        /**
         * @member {number} zLength Depth of the volume in the IJK coordinate system
         */
        this.zLength = Number(zLength) || 1;
        /**
         * @member {Array<string>} The order of the Axis dictated by the NRRD header
         */
        this.axisOrder = ["x", "y", "z"];
        /**
         * @member {TypedArray} data Data of the volume
         */

        switch (type) {
          case "Uint8":
          case "uint8":
          case "uchar":
          case "unsigned char":
          case "uint8_t":
            this.data = new Uint8Array(arrayBuffer);
            break;
          case "Int8":
          case "int8":
          case "signed char":
          case "int8_t":
            this.data = new Int8Array(arrayBuffer);
            break;
          case "Int16":
          case "int16":
          case "short":
          case "short int":
          case "signed short":
          case "signed short int":
          case "int16_t":
            this.data = new Int16Array(arrayBuffer);
            break;
          case "Uint16":
          case "uint16":
          case "ushort":
          case "unsigned short":
          case "unsigned short int":
          case "uint16_t":
            this.data = new Uint16Array(arrayBuffer);
            break;
          case "Int32":
          case "int32":
          case "int":
          case "signed int":
          case "int32_t":
            this.data = new Int32Array(arrayBuffer);
            break;
          case "Uint32":
          case "uint32":
          case "uint":
          case "unsigned int":
          case "uint32_t":
            this.data = new Uint32Array(arrayBuffer);
            break;
          case "longlong":
          case "long long":
          case "long long int":
          case "signed long long":
          case "signed long long int":
          case "int64":
          case "int64_t":
          case "ulonglong":
          case "unsigned long long":
          case "unsigned long long int":
          case "uint64":
          case "uint64_t":
            throw new Error(
              "Error in Volume constructor : this type is not supported in JavaScript"
            );
          case "Float32":
          case "float32":
          case "float":
            this.data = new Float32Array(arrayBuffer);
            break;
          case "Float64":
          case "float64":
          case "double":
            this.data = new Float64Array(arrayBuffer);
            break;
          default:
            this.data = new Uint8Array(arrayBuffer);
        }

        if (this.data.length !== this.xLength * this.yLength * this.zLength) {
          throw new Error(
            "Error in Volume constructor, lengths are not matching arrayBuffer size"
          );
        }
      }

      /**
       * @member {Array}  spacing Spacing to apply to the volume from IJK to RAS coordinate system
       */
      this.spacing = [1, 1, 1];
      /**
       * @member {Array}  offset Offset of the volume in the RAS coordinate system
       */
      this.offset = [0, 0, 0];
      /**
       * @member {Martrix3} matrix The IJK to RAS matrix
       */
      this.matrix = new three.Matrix3();
      this.matrix.identity();
      /**
       * @member {Martrix3} inverseMatrix The RAS to IJK matrix
       */
      /**
       * @member {number} lowerThreshold The voxels with values under this threshold won't appear in the slices.
       *                      If changed, geometryNeedsUpdate is automatically set to true on all the slices associated to this volume
       */
      let lowerThreshold = -Infinity;
      Object.defineProperty(this, "lowerThreshold", {
        get: function () {
          return lowerThreshold;
        },
        set: function (value) {
          lowerThreshold = value;
          this.sliceList.forEach(function (slice) {
            slice.geometryNeedsUpdate = true;
          });
        },
      });
      /**
       * @member {number} upperThreshold The voxels with values over this threshold won't appear in the slices.
       *                      If changed, geometryNeedsUpdate is automatically set to true on all the slices associated to this volume
       */
      let upperThreshold = Infinity;
      Object.defineProperty(this, "upperThreshold", {
        get: function () {
          return upperThreshold;
        },
        set: function (value) {
          upperThreshold = value;
          this.sliceList.forEach(function (slice) {
            slice.geometryNeedsUpdate = true;
          });
        },
      });

      /**
       * @member {Array} sliceList The list of all the slices associated to this volume
       */
      this.sliceList = [];

      /**
       * @member {Array} RASDimensions This array holds the dimensions of the volume in the RAS space
       */
    }

    /**
     * @member {Function} getData Shortcut for data[access(i,j,k)]
     * @memberof Volume
     * @param {number} i    First coordinate
     * @param {number} j    Second coordinate
     * @param {number} k    Third coordinate
     * @returns {number}  value in the data array
     */
    getData(i, j, k) {
      return this.data[k * this.xLength * this.yLength + j * this.xLength + i];
    }

    /**
     * @member {Function} access compute the index in the data array corresponding to the given coordinates in IJK system
     * @memberof Volume
     * @param {number} i    First coordinate
     * @param {number} j    Second coordinate
     * @param {number} k    Third coordinate
     * @returns {number}  index
     */
    access(i, j, k) {
      return k * this.xLength * this.yLength + j * this.xLength + i;
    }

    /**
     * @member {Function} reverseAccess Retrieve the IJK coordinates of the voxel corresponding of the given index in the data
     * @memberof Volume
     * @param {number} index index of the voxel
     * @returns {Array}  [x,y,z]
     */
    reverseAccess(index) {
      const z = Math.floor(index / (this.yLength * this.xLength));
      const y = Math.floor(
        (index - z * this.yLength * this.xLength) / this.xLength
      );
      const x = index - z * this.yLength * this.xLength - y * this.xLength;
      return [x, y, z];
    }

    /**
     * @member {Function} map Apply a function to all the voxels, be careful, the value will be replaced
     * @memberof Volume
     * @param {Function} functionToMap A function to apply to every voxel, will be called with the following parameters :
     *                                 value of the voxel
     *                                 index of the voxel
     *                                 the data (TypedArray)
     * @param {Object}   context    You can specify a context in which call the function, default if this Volume
     * @returns {Volume}   this
     */
    map(functionToMap, context) {
      const length = this.data.length;
      context = context || this;

      for (let i = 0; i < length; i++) {
        this.data[i] = functionToMap.call(context, this.data[i], i, this.data);
      }

      return this;
    }

    /**
     * @member {Function} extractPerpendicularPlane Compute the orientation of the slice and returns all the information relative to the geometry such as sliceAccess, the plane matrix (orientation and position in RAS coordinate) and the dimensions of the plane in both coordinate system.
     * @memberof Volume
     * @param {string}            axis  the normal axis to the slice 'x' 'y' or 'z'
     * @param {number}            index the index of the slice
     * @returns {Object} an object containing all the usefull information on the geometry of the slice
     */
    extractPerpendicularPlane(axis, RASIndex) {
      let firstSpacing, secondSpacing, positionOffset, IJKIndex;

      const axisInIJK = new three.Vector3(),
        firstDirection = new three.Vector3(),
        secondDirection = new three.Vector3(),
        planeMatrix = new three.Matrix4().identity(),
        volume = this;

      const dimensions = new three.Vector3(this.xLength, this.yLength, this.zLength);

      switch (axis) {
        case "x":
          axisInIJK.set(1, 0, 0);
          firstDirection.set(0, 0, -1);
          secondDirection.set(0, -1, 0);
          firstSpacing = this.spacing[this.axisOrder.indexOf("z")];
          secondSpacing = this.spacing[this.axisOrder.indexOf("y")];
          IJKIndex = new three.Vector3(RASIndex, 0, 0);

          planeMatrix.multiply(new three.Matrix4().makeRotationY(Math.PI / 2));
          positionOffset = (volume.RASDimensions[0] - 1) / 2;
          planeMatrix.setPosition(new three.Vector3(RASIndex - positionOffset, 0, 0));
          break;
        case "y":
          axisInIJK.set(0, 1, 0);
          firstDirection.set(1, 0, 0);
          secondDirection.set(0, 0, 1);
          firstSpacing = this.spacing[this.axisOrder.indexOf("x")];
          secondSpacing = this.spacing[this.axisOrder.indexOf("z")];
          IJKIndex = new three.Vector3(0, RASIndex, 0);

          planeMatrix.multiply(new three.Matrix4().makeRotationX(-Math.PI / 2));
          positionOffset = (volume.RASDimensions[1] - 1) / 2;
          planeMatrix.setPosition(new three.Vector3(0, RASIndex - positionOffset, 0));
          break;
        case "z":
        default:
          axisInIJK.set(0, 0, 1);
          firstDirection.set(1, 0, 0);
          secondDirection.set(0, -1, 0);
          firstSpacing = this.spacing[this.axisOrder.indexOf("x")];
          secondSpacing = this.spacing[this.axisOrder.indexOf("y")];
          IJKIndex = new three.Vector3(0, 0, RASIndex);

          positionOffset = (volume.RASDimensions[2] - 1) / 2;
          planeMatrix.setPosition(new three.Vector3(0, 0, RASIndex - positionOffset));
          break;
      }

      firstDirection.applyMatrix4(volume.inverseMatrix).normalize();
      firstDirection.arglet = "i";
      secondDirection.applyMatrix4(volume.inverseMatrix).normalize();
      secondDirection.arglet = "j";
      axisInIJK.applyMatrix4(volume.inverseMatrix).normalize();
      const iLength = Math.floor(Math.abs(firstDirection.dot(dimensions)));
      const jLength = Math.floor(Math.abs(secondDirection.dot(dimensions)));
      const planeWidth = Math.abs(iLength * firstSpacing);
      const planeHeight = Math.abs(jLength * secondSpacing);

      IJKIndex = Math.abs(
        Math.round(IJKIndex.applyMatrix4(volume.inverseMatrix).dot(axisInIJK))
      );
      const base = [
        new three.Vector3(1, 0, 0),
        new three.Vector3(0, 1, 0),
        new three.Vector3(0, 0, 1),
      ];
      const iDirection = [firstDirection, secondDirection, axisInIJK].find(
        function (x) {
          return Math.abs(x.dot(base[0])) > 0.9;
        }
      );
      const jDirection = [firstDirection, secondDirection, axisInIJK].find(
        function (x) {
          return Math.abs(x.dot(base[1])) > 0.9;
        }
      );
      const kDirection = [firstDirection, secondDirection, axisInIJK].find(
        function (x) {
          return Math.abs(x.dot(base[2])) > 0.9;
        }
      );

      function sliceAccess(i, j) {
        const si =
          iDirection === axisInIJK ? IJKIndex : iDirection.arglet === "i" ? i : j;
        const sj =
          jDirection === axisInIJK ? IJKIndex : jDirection.arglet === "i" ? i : j;
        const sk =
          kDirection === axisInIJK ? IJKIndex : kDirection.arglet === "i" ? i : j;

        // invert indices if necessary

        const accessI =
          iDirection.dot(base[0]) > 0 ? si : volume.xLength - 1 - si;
        const accessJ =
          jDirection.dot(base[1]) > 0 ? sj : volume.yLength - 1 - sj;
        const accessK =
          kDirection.dot(base[2]) > 0 ? sk : volume.zLength - 1 - sk;

        return volume.access(accessI, accessJ, accessK);
      }

      return {
        iLength: iLength,
        jLength: jLength,
        sliceAccess: sliceAccess,
        matrix: planeMatrix,
        planeWidth: planeWidth,
        planeHeight: planeHeight,
      };
    }

    /**
     * @member {Function} extractSlice Returns a slice corresponding to the given axis and index
     *                        The coordinate are given in the Right Anterior Superior coordinate format
     * @memberof Volume
     * @param {string}            axis  the normal axis to the slice 'x' 'y' or 'z'
     * @param {number}            index the index of the slice
     * @returns {VolumeSlice} the extracted slice
     */
    extractSlice(axis, index) {
      const slice = new VolumeSlice(this, index, axis);
      this.sliceList.push(slice);
      return slice;
    }

    /**
     * @member {Function} repaintAllSlices Call repaint on all the slices extracted from this volume
     * @see VolumeSlice.repaint
     * @memberof Volume
     * @returns {Volume} this
     */
    repaintAllSlices() {
      this.sliceList.forEach(function (slice) {
        slice.repaint();
      });

      return this;
    }

    /**
     * @member {Function} computeMinMax Compute the minimum and the maximum of the data in the volume
     * @memberof Volume
     * @returns {Array} [min,max]
     */
    computeMinMax() {
      let min = Infinity;
      let max = -Infinity;

      // buffer the length
      const datasize = this.data.length;

      let i = 0;

      for (i = 0; i < datasize; i++) {
        if (!isNaN(this.data[i])) {
          const value = this.data[i];
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      }

      this.min = min;
      this.max = max;

      return [min, max];
    }
  }

  class NRRDLoader extends three.Loader {
    constructor(manager) {
      super(manager);
    }

    load(url, onLoad, onProgress, onError) {
      const scope = this;

      const loader = new three.FileLoader(scope.manager);
      loader.setPath(scope.path);
      loader.setResponseType("arraybuffer");
      loader.setRequestHeader(scope.requestHeader);
      loader.setWithCredentials(scope.withCredentials);
      loader.load(
        url,
        function (data) {
          try {
            onLoad(scope.parse(data));
          } catch (e) {
            if (onError) {
              onError(e);
            } else {
              console.error(e);
            }

            scope.manager.itemError(url);
          }
        },
        onProgress,
        onError
      );
    }

    parse(data) {
      // this parser is largely inspired from the XTK NRRD parser : https://github.com/xtk/X

      let _data = data;

      let _dataPointer = 0;

      const _nativeLittleEndian =
        new Int8Array(new Int16Array([1]).buffer)[0] > 0;

      const _littleEndian = true;

      const headerObject = {};

      function scan(type, chunks) {
        if (chunks === undefined || chunks === null) {
          chunks = 1;
        }

        let _chunkSize = 1;
        let _array_type = Uint8Array;

        switch (type) {
          // 1 byte data types
          case "uchar":
            break;
          case "schar":
            _array_type = Int8Array;
            break;
          // 2 byte data types
          case "ushort":
            _array_type = Uint16Array;
            _chunkSize = 2;
            break;
          case "sshort":
            _array_type = Int16Array;
            _chunkSize = 2;
            break;
          // 4 byte data types
          case "uint":
            _array_type = Uint32Array;
            _chunkSize = 4;
            break;
          case "sint":
            _array_type = Int32Array;
            _chunkSize = 4;
            break;
          case "float":
            _array_type = Float32Array;
            _chunkSize = 4;
            break;
          case "complex":
            _array_type = Float64Array;
            _chunkSize = 8;
            break;
          case "double":
            _array_type = Float64Array;
            _chunkSize = 8;
            break;
        }

        // increase the data pointer in-place
        let _bytes = new _array_type(
          _data.slice(_dataPointer, (_dataPointer += chunks * _chunkSize))
        );

        // if required, flip the endianness of the bytes
        if (_nativeLittleEndian != _littleEndian) {
          // we need to flip here since the format doesn't match the native endianness
          _bytes = flipEndianness(_bytes, _chunkSize);
        }

        if (chunks == 1) {
          // if only one chunk was requested, just return one value
          return _bytes[0];
        }

        // return the byte array
        return _bytes;
      }

      //Flips typed array endianness in-place. Based on https://github.com/kig/DataStream.js/blob/master/DataStream.js.

      function flipEndianness(array, chunkSize) {
        const u8 = new Uint8Array(
          array.buffer,
          array.byteOffset,
          array.byteLength
        );
        for (let i = 0; i < array.byteLength; i += chunkSize) {
          for (let j = i + chunkSize - 1, k = i; j > k; j--, k++) {
            const tmp = u8[k];
            u8[k] = u8[j];
            u8[j] = tmp;
          }
        }

        return array;
      }

      //parse the header
      function parseHeader(header) {
        let data, field, fn, i, l, m, _i, _len;
        const lines = header.split(/\r?\n/);
        for (_i = 0, _len = lines.length; _i < _len; _i++) {
          l = lines[_i];
          if (l.match(/NRRD\d+/)) {
            headerObject.isNrrd = true;
          } else if (!l.match(/^#/) && (m = l.match(/(.*):(.*)/))) {
            field = m[1].trim();
            data = m[2].trim();
            fn = _fieldFunctions[field];
            if (fn) {
              fn.call(headerObject, data);
            } else {
              headerObject[field] = data;
            }
          }
        }

        if (!headerObject.isNrrd) {
          throw new Error("Not an NRRD file");
        }

        if (
          headerObject.encoding === "bz2" ||
          headerObject.encoding === "bzip2"
        ) {
          throw new Error("Bzip is not supported");
        }

        if (!headerObject.vectors) {
          //if no space direction is set, let's use the identity
          headerObject.vectors = [];
          headerObject.vectors.push([1, 0, 0]);
          headerObject.vectors.push([0, 1, 0]);
          headerObject.vectors.push([0, 0, 1]);

          //apply spacing if defined
          if (headerObject.spacings) {
            for (i = 0; i <= 2; i++) {
              if (!isNaN(headerObject.spacings[i])) {
                for (let j = 0; j <= 2; j++) {
                  headerObject.vectors[i][j] *= headerObject.spacings[i];
                }
              }
            }
          }
        }
      }

      //parse the data when registred as one of this type : 'text', 'ascii', 'txt'
      function parseDataAsText(data, start, end) {
        let number = "";
        start = start || 0;
        end = end || data.length;
        let value;
        //length of the result is the product of the sizes
        const lengthOfTheResult = headerObject.sizes.reduce(function (
          previous,
          current
        ) {
          return previous * current;
        },
        1);

        let base = 10;
        if (headerObject.encoding === "hex") {
          base = 16;
        }

        const result = new headerObject.__array(lengthOfTheResult);
        let resultIndex = 0;
        let parsingFunction = parseInt;
        if (
          headerObject.__array === Float32Array ||
          headerObject.__array === Float64Array
        ) {
          parsingFunction = parseFloat;
        }

        for (let i = start; i < end; i++) {
          value = data[i];
          //if value is not a space
          if ((value < 9 || value > 13) && value !== 32) {
            number += String.fromCharCode(value);
          } else {
            if (number !== "") {
              result[resultIndex] = parsingFunction(number, base);
              resultIndex++;
            }

            number = "";
          }
        }

        if (number !== "") {
          result[resultIndex] = parsingFunction(number, base);
          resultIndex++;
        }

        return result;
      }

      const _bytes = scan("uchar", data.byteLength);
      const _length = _bytes.length;
      let _header = null;
      let _data_start = 0;
      let i;
      for (i = 1; i < _length; i++) {
        if (_bytes[i - 1] == 10 && _bytes[i] == 10) {
          // we found two line breaks in a row
          // now we know what the header is
          _header = this.parseChars(_bytes, 0, i - 2);
          // this is were the data starts
          _data_start = i + 1;
          break;
        }
      }

      // parse the header
      parseHeader(_header);

      _data = _bytes.subarray(_data_start); // the data without header
      if (headerObject.encoding.substring(0, 2) === "gz") {
        // we need to decompress the datastream
        // here we start the unzipping and get a typed Uint8Array back
        _data = fflate__namespace.gunzipSync(new Uint8Array(_data)); // eslint-disable-line no-undef
      } else if (
        headerObject.encoding === "ascii" ||
        headerObject.encoding === "text" ||
        headerObject.encoding === "txt" ||
        headerObject.encoding === "hex"
      ) {
        _data = parseDataAsText(_data);
      } else if (headerObject.encoding === "raw") {
        //we need to copy the array to create a new array buffer, else we retrieve the original arraybuffer with the header
        const _copy = new Uint8Array(_data.length);

        for (let i = 0; i < _data.length; i++) {
          _copy[i] = _data[i];
        }

        _data = _copy;
      }

      // .. let's use the underlying array buffer
      _data = _data.buffer;

      const volume = new Volume();
      volume.header = headerObject;
      //
      // parse the (unzipped) data to a datastream of the correct type
      //
      volume.data = new headerObject.__array(_data);
      // get the min and max intensities
      const min_max = volume.computeMinMax();
      const min = min_max[0];
      const max = min_max[1];
      // attach the scalar range to the volume
      volume.windowLow = min;
      volume.windowHigh = max;

      // get the image dimensions
      volume.dimensions = [
        headerObject.sizes[0],
        headerObject.sizes[1],
        headerObject.sizes[2],
      ];
      volume.xLength = volume.dimensions[0];
      volume.yLength = volume.dimensions[1];
      volume.zLength = volume.dimensions[2];

      // Identify axis order in the space-directions matrix from the header if possible.
      if (headerObject.vectors) {
        const xIndex = headerObject.vectors.findIndex(
          (vector) => vector[0] !== 0
        );
        const yIndex = headerObject.vectors.findIndex(
          (vector) => vector[1] !== 0
        );
        const zIndex = headerObject.vectors.findIndex(
          (vector) => vector[2] !== 0
        );

        const axisOrder = [];
        axisOrder[xIndex] = "x";
        axisOrder[yIndex] = "y";
        axisOrder[zIndex] = "z";
        volume.axisOrder = axisOrder;
      } else {
        volume.axisOrder = ["x", "y", "z"];
      }

      // spacing
      const spacingX = new three.Vector3().fromArray(headerObject.vectors[0]).length();
      const spacingY = new three.Vector3().fromArray(headerObject.vectors[1]).length();
      const spacingZ = new three.Vector3().fromArray(headerObject.vectors[2]).length();
      volume.spacing = [spacingX, spacingY, spacingZ];

      // Create IJKtoRAS matrix
      volume.matrix = new three.Matrix4();

      const transitionMatrix = new three.Matrix4();

      if (headerObject.space === "left-posterior-superior") {
        transitionMatrix.set(-1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
      } else if (headerObject.space === "left-anterior-superior") {
        transitionMatrix.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1);
      }

      if (!headerObject.vectors) {
        volume.matrix.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
      } else {
        // const v = headerObject.vectors;

        // const ijk_to_transition = new Matrix4().set(
        //   v[0][0],
        //   v[1][0],
        //   v[2][0],
        //   0,
        //   v[0][1],
        //   v[1][1],
        //   v[2][1],
        //   0,
        //   v[0][2],
        //   v[1][2],
        //   v[2][2],
        //   0,
        //   0,
        //   0,
        //   0,
        //   1
        // );

        // const transition_to_ras = new Matrix4().multiplyMatrices(
        //   ijk_to_transition,
        //   transitionMatrix
        // );

        // volume.matrix = transition_to_ras;
        volume.matrix.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
      }

      console.log("hi it's me!!!!! In nrrd support line 383!");

      volume.inverseMatrix = new three.Matrix4();
      volume.inverseMatrix.copy(volume.matrix).invert();
      volume.RASDimensions = new three.Vector3(
        volume.xLength,
        volume.yLength,
        volume.zLength
      )
        .applyMatrix4(volume.matrix)
        .round()
        .toArray()
        .map(Math.abs);

      // .. and set the default threshold
      // only if the threshold was not already set
      if (volume.lowerThreshold === -Infinity) {
        volume.lowerThreshold = min;
      }

      if (volume.upperThreshold === Infinity) {
        volume.upperThreshold = max;
      }

      return volume;
    }

    parseChars(array, start, end) {
      // without borders, use the whole array
      if (start === undefined) {
        start = 0;
      }

      if (end === undefined) {
        end = array.length;
      }

      let output = "";
      // create and append the chars
      let i = 0;
      for (i = start; i < end; ++i) {
        output += String.fromCharCode(array[i]);
      }

      return output;
    }
  }

  const _fieldFunctions = {
    type: function (data) {
      switch (data) {
        case "uchar":
        case "unsigned char":
        case "uint8":
        case "uint8_t":
          this.__array = Uint8Array;
          break;
        case "signed char":
        case "int8":
        case "int8_t":
          this.__array = Int8Array;
          break;
        case "short":
        case "short int":
        case "signed short":
        case "signed short int":
        case "int16":
        case "int16_t":
          this.__array = Int16Array;
          break;
        case "ushort":
        case "unsigned short":
        case "unsigned short int":
        case "uint16":
        case "uint16_t":
          this.__array = Uint16Array;
          break;
        case "int":
        case "signed int":
        case "int32":
        case "int32_t":
          this.__array = Int32Array;
          break;
        case "uint":
        case "unsigned int":
        case "uint32":
        case "uint32_t":
          this.__array = Uint32Array;
          break;
        case "float":
          this.__array = Float32Array;
          break;
        case "double":
          this.__array = Float64Array;
          break;
        default:
          throw new Error("Unsupported NRRD data type: " + data);
      }

      return (this.type = data);
    },

    endian: function (data) {
      return (this.endian = data);
    },

    encoding: function (data) {
      return (this.encoding = data);
    },

    dimension: function (data) {
      return (this.dim = parseInt(data, 10));
    },

    sizes: function (data) {
      let i;
      return (this.sizes = (function () {
        const _ref = data.split(/\s+/);
        const _results = [];

        for (let _i = 0, _len = _ref.length; _i < _len; _i++) {
          i = _ref[_i];
          _results.push(parseInt(i, 10));
        }

        return _results;
      })());
    },

    space: function (data) {
      return (this.space = data);
    },

    "space origin": function (data) {
      return (this.space_origin = data.split("(")[1].split(")")[0].split(","));
    },

    "space directions": function (data) {
      let f, v;
      const parts = data.match(/\(.*?\)/g);
      return (this.vectors = (function () {
        const _results = [];

        for (let _i = 0, _len = parts.length; _i < _len; _i++) {
          v = parts[_i];
          _results.push(
            (function () {
              const _ref = v.slice(1, -1).split(/,/);
              const _results2 = [];

              for (let _j = 0, _len2 = _ref.length; _j < _len2; _j++) {
                f = _ref[_j];
                _results2.push(parseFloat(f));
              }

              return _results2;
            })()
          );
        }

        return _results;
      })());
    },

    spacings: function (data) {
      let f;
      const parts = data.split(/\s+/);
      return (this.spacings = (function () {
        const _results = [];

        for (let _i = 0, _len = parts.length; _i < _len; _i++) {
          f = parts[_i];
          _results.push(parseFloat(f));
        }

        return _results;
      })());
    },
  };

  const version = "0.0.1";

  // "main": "/src/index.js",

  exports.NRRDLoader = NRRDLoader;
  exports.version = version;

}));
