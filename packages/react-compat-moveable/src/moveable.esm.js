/*
Copyright (c) 2019 Daybrush
name: react-compat-moveable
license: MIT
author: Daybrush
repository: https://github.com/daybrush/moveable/blob/master/packages/react-compat-moveable
version: 0.25.0
*/
import getAgent from '@egjs/agent';
import { prefixNames, prefixCSS, ref, withMethods, refs } from 'framework-utils';
import { throttle, hasClass, getRad, isArray, splitSpace, throttleArray, getKeys, decamelize, isString, dot, calculateBoundSize, getDist as getDist$1, convertUnitSize, find, findIndex, getShapeDirection, isObject, isNumber, addClass, requestAnimationFrame, splitBracket, splitComma, splitUnit, cancelAnimationFrame, removeClass, isUndefined, between, isFunction, TINY_NUM as TINY_NUM$1, average } from '@daybrush/utils';
import { plus, minus, calculate, convertPositionMatrix, convertDimension, multiply, multiplies, createOriginMatrix, ignoreDimension, invert, createIdentityMatrix, createWarpMatrix, convertMatrixtoCSS, fromTranslation, createRotateMatrix, getOrigin, rotate, createScaleMatrix, convertCSStoMatrix } from '@scena/matrix';
import { parseMat, toMat, parse, calculateMatrixDist } from 'css-to-mat';
import ChildrenDiffer, { diff as diff$1 } from '@egjs/children-differ';
import { getMinMaxs, fitPoints, getOverlapSize, getAreaSize, isInside, getIntersectionPointsByConstants } from 'overlap-area';
import DragScroll from '@scena/dragscroll';
import * as React from 'react-simple-compat';
import { createElement } from 'react-simple-compat';
import Gesto from 'gesto';
import styled from 'react-compat-css-styled';
import EventEmitter from '@scena/event-emitter';

/*
Copyright (c) 2019-present NAVER Corp.
name: @egjs/list-differ
license: MIT
author: NAVER Corp.
repository: https://github.com/naver/egjs-list-differ
version: 1.0.0
*/
/*
egjs-list-differ
Copyright (c) 2019-present NAVER Corp.
MIT license
*/
var PolyMap =
/*#__PURE__*/
function () {
  function PolyMap() {
    this.keys = [];
    this.values = [];
  }

  var __proto = PolyMap.prototype;

  __proto.get = function (key) {
    return this.values[this.keys.indexOf(key)];
  };

  __proto.set = function (key, value) {
    var keys = this.keys;
    var values = this.values;
    var prevIndex = keys.indexOf(key);
    var index = prevIndex === -1 ? keys.length : prevIndex;
    keys[index] = key;
    values[index] = value;
  };

  return PolyMap;
}();

/*
egjs-list-differ
Copyright (c) 2019-present NAVER Corp.
MIT license
*/
var HashMap =
/*#__PURE__*/
function () {
  function HashMap() {
    this.object = {};
  }

  var __proto = HashMap.prototype;

  __proto.get = function (key) {
    return this.object[key];
  };

  __proto.set = function (key, value) {
    this.object[key] = value;
  };

  return HashMap;
}();

/*
egjs-list-differ
Copyright (c) 2019-present NAVER Corp.
MIT license
*/
var SUPPORT_MAP = typeof Map === "function";

/*
egjs-list-differ
Copyright (c) 2019-present NAVER Corp.
MIT license
*/
var Link =
/*#__PURE__*/
function () {
  function Link() {}

  var __proto = Link.prototype;

  __proto.connect = function (prevLink, nextLink) {
    this.prev = prevLink;
    this.next = nextLink;
    prevLink && (prevLink.next = this);
    nextLink && (nextLink.prev = this);
  };

  __proto.disconnect = function () {
    // In double linked list, diconnect the interconnected relationship.
    var prevLink = this.prev;
    var nextLink = this.next;
    prevLink && (prevLink.next = nextLink);
    nextLink && (nextLink.prev = prevLink);
  };

  __proto.getIndex = function () {
    var link = this;
    var index = -1;

    while (link) {
      link = link.prev;
      ++index;
    }

    return index;
  };

  return Link;
}();

/*
egjs-list-differ
Copyright (c) 2019-present NAVER Corp.
MIT license
*/

function orderChanged(changed, fixed) {
  // It is roughly in the order of these examples.
  // 4, 6, 0, 2, 1, 3, 5, 7
  var fromLinks = []; // 0, 1, 2, 3, 4, 5, 6, 7

  var toLinks = [];
  changed.forEach(function (_a) {
    var from = _a[0],
        to = _a[1];
    var link = new Link();
    fromLinks[from] = link;
    toLinks[to] = link;
  }); // `fromLinks` are connected to each other by double linked list.

  fromLinks.forEach(function (link, i) {
    link.connect(fromLinks[i - 1]);
  });
  return changed.filter(function (_, i) {
    return !fixed[i];
  }).map(function (_a, i) {
    var from = _a[0],
        to = _a[1];

    if (from === to) {
      return [0, 0];
    }

    var fromLink = fromLinks[from];
    var toLink = toLinks[to - 1];
    var fromIndex = fromLink.getIndex(); // Disconnect the link connected to `fromLink`.

    fromLink.disconnect(); // Connect `fromLink` to the right of `toLink`.

    if (!toLink) {
      fromLink.connect(undefined, fromLinks[0]);
    } else {
      fromLink.connect(toLink, toLink.next);
    }

    var toIndex = fromLink.getIndex();
    return [fromIndex, toIndex];
  });
}

var Result =
/*#__PURE__*/
function () {
  function Result(prevList, list, added, removed, changed, maintained, changedBeforeAdded, fixed) {
    this.prevList = prevList;
    this.list = list;
    this.added = added;
    this.removed = removed;
    this.changed = changed;
    this.maintained = maintained;
    this.changedBeforeAdded = changedBeforeAdded;
    this.fixed = fixed;
  }

  var __proto = Result.prototype;
  Object.defineProperty(__proto, "ordered", {
    get: function () {
      if (!this.cacheOrdered) {
        this.caculateOrdered();
      }

      return this.cacheOrdered;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(__proto, "pureChanged", {
    get: function () {
      if (!this.cachePureChanged) {
        this.caculateOrdered();
      }

      return this.cachePureChanged;
    },
    enumerable: true,
    configurable: true
  });

  __proto.caculateOrdered = function () {
    var ordered = orderChanged(this.changedBeforeAdded, this.fixed);
    var changed = this.changed;
    var pureChanged = [];
    this.cacheOrdered = ordered.filter(function (_a, i) {
      var from = _a[0],
          to = _a[1];
      var _b = changed[i],
          fromBefore = _b[0],
          toBefore = _b[1];

      if (from !== to) {
        pureChanged.push([fromBefore, toBefore]);
        return true;
      }
    });
    this.cachePureChanged = pureChanged;
  };

  return Result;
}();

/**
 *
 * @memberof eg.ListDiffer
 * @static
 * @function
 * @param - Previous List <ko> 이전 목록 </ko>
 * @param - List to Update <ko> 업데이트 할 목록 </ko>
 * @param - This callback function returns the key of the item. <ko> 아이템의 키를 반환하는 콜백 함수입니다.</ko>
 * @return - Returns the diff between `prevList` and `list` <ko> `prevList`와 `list`의 다른 점을 반환한다.</ko>
 * @example
 * import { diff } from "@egjs/list-differ";
 * // script => eg.ListDiffer.diff
 * const result = diff([0, 1, 2, 3, 4, 5], [7, 8, 0, 4, 3, 6, 2, 1], e => e);
 * // List before update
 * // [1, 2, 3, 4, 5]
 * console.log(result.prevList);
 * // Updated list
 * // [4, 3, 6, 2, 1]
 * console.log(result.list);
 * // Index array of values added to `list`
 * // [0, 1, 5]
 * console.log(result.added);
 * // Index array of values removed in `prevList`
 * // [5]
 * console.log(result.removed);
 * // An array of index pairs of `prevList` and `list` with different indexes from `prevList` and `list`
 * // [[0, 2], [4, 3], [3, 4], [2, 6], [1, 7]]
 * console.log(result.changed);
 * // The subset of `changed` and an array of index pairs that moved data directly. Indicate an array of absolute index pairs of `ordered`.(Formatted by: Array<[index of prevList, index of list]>)
 * // [[4, 3], [3, 4], [2, 6]]
 * console.log(result.pureChanged);
 * // An array of index pairs to be `ordered` that can synchronize `list` before adding data. (Formatted by: Array<[prevIndex, nextIndex]>)
 * // [[4, 1], [4, 2], [4, 3]]
 * console.log(result.ordered);
 * // An array of index pairs of `prevList` and `list` that have not been added/removed so data is preserved
 * // [[0, 2], [4, 3], [3, 4], [2, 6], [1, 7]]
 * console.log(result.maintained);
 */

function diff(prevList, list, findKeyCallback) {
  var mapClass = SUPPORT_MAP ? Map : findKeyCallback ? HashMap : PolyMap;

  var callback = findKeyCallback || function (e) {
    return e;
  };

  var added = [];
  var removed = [];
  var maintained = [];
  var prevKeys = prevList.map(callback);
  var keys = list.map(callback);
  var prevKeyMap = new mapClass();
  var keyMap = new mapClass();
  var changedBeforeAdded = [];
  var fixed = [];
  var removedMap = {};
  var changed = [];
  var addedCount = 0;
  var removedCount = 0; // Add prevKeys and keys to the hashmap.

  prevKeys.forEach(function (key, prevListIndex) {
    prevKeyMap.set(key, prevListIndex);
  });
  keys.forEach(function (key, listIndex) {
    keyMap.set(key, listIndex);
  }); // Compare `prevKeys` and `keys` and add them to `removed` if they are not in `keys`.

  prevKeys.forEach(function (key, prevListIndex) {
    var listIndex = keyMap.get(key); // In prevList, but not in list, it is removed.

    if (typeof listIndex === "undefined") {
      ++removedCount;
      removed.push(prevListIndex);
    } else {
      removedMap[listIndex] = removedCount;
    }
  }); // Compare `prevKeys` and `keys` and add them to `added` if they are not in `prevKeys`.

  keys.forEach(function (key, listIndex) {
    var prevListIndex = prevKeyMap.get(key); // In list, but not in prevList, it is added.

    if (typeof prevListIndex === "undefined") {
      added.push(listIndex);
      ++addedCount;
    } else {
      maintained.push([prevListIndex, listIndex]);
      removedCount = removedMap[listIndex] || 0;
      changedBeforeAdded.push([prevListIndex - removedCount, listIndex - addedCount]);
      fixed.push(listIndex === prevListIndex);

      if (prevListIndex !== listIndex) {
        changed.push([prevListIndex, listIndex]);
      }
    }
  }); // Sort by ascending order of 'to(list's index).

  removed.reverse();
  return new Result(prevList, list, added, removed, changed, maintained, changedBeforeAdded, fixed);
}

/*
Copyright (c) 2019 Daybrush
name: react-moveable
license: MIT
author: Daybrush
repository: https://github.com/daybrush/moveable/blob/master/packages/react-moveable
version: 0.40.0
*/
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

/* global Reflect, Promise */

var extendStatics = function (d, b) {
  extendStatics = Object.setPrototypeOf || {
    __proto__: []
  } instanceof Array && function (d, b) {
    d.__proto__ = b;
  } || function (d, b) {
    for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
  };

  return extendStatics(d, b);
};

function __extends(d, b) {
  if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);

  function __() {
    this.constructor = d;
  }

  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function () {
  __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

function __rest(s, e) {
  var t = {};

  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];

  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
}

function __decorate(decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}

function makeAble(name, able) {
  var _a;

  return __assign({
    events: {},
    props: (_a = {}, _a[name] = Boolean, _a),
    name: name
  }, able);
}

function getSVGCursor(scale, degree) {
  return "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"".concat(32 * scale, "px\" height=\"").concat(32 * scale, "px\" viewBox=\"0 0 32 32\" ><path d=\"M 16,5 L 12,10 L 14.5,10 L 14.5,22 L 12,22 L 16,27 L 20,22 L 17.5,22 L 17.5,10 L 20, 10 L 16,5 Z\" stroke-linejoin=\"round\" stroke-width=\"1.2\" fill=\"black\" stroke=\"white\" style=\"transform:rotate(").concat(degree, "deg);transform-origin: 16px 16px\"></path></svg>");
}

function getCursorCSS(degree) {
  var x1 = getSVGCursor(1, degree); // const x2 = getSVGCursor(2, degree);

  var degree45 = Math.round(degree / 45) * 45 % 180;
  var defaultCursor = "ns-resize";

  if (degree45 === 135) {
    defaultCursor = "nwse-resize";
  } else if (degree45 === 45) {
    defaultCursor = "nesw-resize";
  } else if (degree45 === 90) {
    defaultCursor = "ew-resize";
  } // tslint:disable-next-line: max-line-length


  return "cursor:".concat(defaultCursor, ";cursor: url('").concat(x1, "') 16 16, ").concat(defaultCursor, ";");
}

var agent = getAgent();
var IS_WEBKIT = agent.browser.webkit;

var IS_WEBKIT605 = IS_WEBKIT && function () {
  var navi = typeof window === "undefined" ? {
    userAgent: ""
  } : window.navigator;
  var res = /applewebkit\/([^\s]+)/g.exec(navi.userAgent.toLowerCase());
  return res ? parseFloat(res[1]) < 605 : false;
}();

var IS_FIREFOX = agent.browser.name === "firefox";
var IS_SAFARI_ABOVE15 = parseInt(agent.browser.webkitVersion, 10) >= 612 || parseInt(agent.browser.version, 10) >= 15;
var PREFIX = "moveable-";
var MOVEABLE_CSS = "\n{\n\tposition: absolute;\n\twidth: 1px;\n\theight: 1px;\n\tleft: 0;\n\ttop: 0;\n    z-index: 3000;\n    --moveable-color: #4af;\n    --zoom: 1;\n    --zoompx: 1px;\n    will-change: transform;\n}\n.control-box {\n    z-index: 0;\n}\n.line, .control {\n    position: absolute;\n\tleft: 0;\n    top: 0;\n    will-change: transform;\n}\n.control {\n\twidth: 14px;\n\theight: 14px;\n\tborder-radius: 50%;\n\tborder: 2px solid #fff;\n\tbox-sizing: border-box;\n    background: #4af;\n    background: var(--moveable-color);\n\tmargin-top: -7px;\n    margin-left: -7px;\n    border: 2px solid #fff;\n    z-index: 10;\n}\n.padding {\n    position: absolute;\n    top: 0px;\n    left: 0px;\n    width: 100px;\n    height: 100px;\n    transform-origin: 0 0;\n}\n.line {\n\twidth: 1px;\n    height: 1px;\n    background: #4af;\n    background: var(--moveable-color);\n\ttransform-origin: 0px 50%;\n}\n.line.edge {\n    z-index: 1;\n    background: transparent;\n}\n.line.dashed {\n    box-sizing: border-box;\n    background: transparent;\n}\n.line.dashed.horizontal {\n    border-top: 1px dashed #4af;\n    border-top-color: #4af;\n    border-top-color: var(--moveable-color);\n}\n.line.dashed.vertical {\n    border-left: 1px dashed #4af;\n    border-left-color: #4af;\n    border-left-color: var(--moveable-color);\n}\n.line.vertical {\n    transform: translateX(-50%);\n}\n.line.horizontal {\n    transform: translateY(-50%);\n}\n.line.vertical.bold {\n    width: 2px;\n}\n.line.horizontal.bold {\n    height: 2px;\n}\n\n.control.origin {\n\tborder-color: #f55;\n\tbackground: #fff;\n\twidth: 12px;\n\theight: 12px;\n\tmargin-top: -6px;\n    margin-left: -6px;\n\tpointer-events: none;\n}\n".concat([0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165].map(function (degree) {
  return "\n.direction[data-rotation=\"".concat(degree, "\"], :global .view-control-rotation").concat(degree, " {\n\t").concat(getCursorCSS(degree), "\n}\n");
}).join("\n"), "\n.group {\n    z-index: -1;\n}\n.area {\n    position: absolute;\n}\n.area-pieces {\n    position: absolute;\n    top: 0;\n    left: 0;\n    display: none;\n}\n.area.avoid, .area.pass {\n    pointer-events: none;\n}\n.area.avoid+.area-pieces {\n    display: block;\n}\n.area-piece {\n    position: absolute;\n}\n\n").concat(IS_WEBKIT605 ? ":global svg *:before {\n\tcontent:\"\";\n\ttransform-origin: inherit;\n}" : "", "\n");
var NEARBY_POS = [[0, 1, 2], [1, 0, 3], [2, 0, 3], [3, 1, 2]];
var FLOAT_POINT_NUM = 0.0001;
var TINY_NUM = 0.0000001;
var MIN_SCALE = 0.000000001;
var MAX_NUM = Math.pow(10, 10);
var MIN_NUM = -MAX_NUM;
var DIRECTIONS4 = ["n", "w", "s", "e"];
var DIRECTIONS = ["n", "w", "s", "e", "nw", "ne", "sw", "se"];
var DIRECTION_REGION_TO_DIRECTION = {
  n: [0, -1],
  e: [1, 0],
  s: [0, 1],
  w: [-1, 0],
  nw: [-1, -1],
  ne: [1, -1],
  sw: [-1, 1],
  se: [1, 1]
};
var DIRECTION_INDEXES = {
  n: [0, 1],
  e: [1, 3],
  s: [3, 2],
  w: [2, 0],
  nw: [0],
  ne: [1],
  sw: [2],
  se: [3]
};
var DIRECTION_ROTATIONS = {
  n: 0,
  s: 180,
  w: 270,
  e: 90,
  nw: 315,
  ne: 45,
  sw: 225,
  se: 135
};
var MOVEABLE_METHODS = ["isMoveableElement", "updateRect", "updateTarget", "destroy", "dragStart", "isInside", "hitTest", "setState", "getRect", "request", "isDragging", "getManager", "forceUpdate", "waitToChangeTarget", "updateSelectors", "getTargets"];

function setCustomDrag(e, state, delta, isPinch, isConvert, ableName) {
  if (ableName === void 0) {
    ableName = "draggable";
  }

  var result = state.gestos[ableName].move(delta, e.inputEvent);
  var datas = result.originalDatas || result.datas;
  var ableDatas = datas[ableName] || (datas[ableName] = {});
  return __assign(__assign({}, isConvert ? convertDragDist(state, result) : result), {
    isPinch: !!isPinch,
    parentEvent: true,
    datas: ableDatas,
    originalDatas: e.originalDatas
  });
}

var CustomGesto = /*#__PURE__*/function () {
  function CustomGesto(ableName) {
    var _a;

    if (ableName === void 0) {
      ableName = "draggable";
    }

    this.ableName = ableName;
    this.prevX = 0;
    this.prevY = 0;
    this.startX = 0;
    this.startY = 0;
    this.isDrag = false;
    this.isFlag = false;
    this.datas = {
      draggable: {}
    };
    this.datas = (_a = {}, _a[ableName] = {}, _a);
  }

  var __proto = CustomGesto.prototype;

  __proto.dragStart = function (client, e) {
    this.isDrag = false;
    this.isFlag = false;
    var originalDatas = e.originalDatas;
    this.datas = originalDatas;

    if (!originalDatas[this.ableName]) {
      originalDatas[this.ableName] = {};
    }

    return __assign(__assign({}, this.move(client, e.inputEvent)), {
      type: "dragstart"
    });
  };

  __proto.drag = function (client, inputEvent) {
    return this.move([client[0] - this.prevX, client[1] - this.prevY], inputEvent);
  };

  __proto.move = function (delta, inputEvent) {
    var clientX;
    var clientY;

    if (!this.isFlag) {
      this.prevX = delta[0];
      this.prevY = delta[1];
      this.startX = delta[0];
      this.startY = delta[1];
      clientX = delta[0];
      clientY = delta[1];
      this.isFlag = true;
    } else {
      clientX = this.prevX + delta[0];
      clientY = this.prevY + delta[1];

      if (delta[0] || delta[1]) {
        this.isDrag = true;
      }
    }

    this.prevX = clientX;
    this.prevY = clientY;
    return {
      type: "drag",
      clientX: clientX,
      clientY: clientY,
      inputEvent: inputEvent,
      isDrag: this.isDrag,
      distX: clientX - this.startX,
      distY: clientY - this.startY,
      deltaX: delta[0],
      deltaY: delta[1],
      datas: this.datas[this.ableName],
      originalDatas: this.datas,
      parentEvent: true,
      parentGesto: this
    };
  };

  return CustomGesto;
}();

function calculatePointerDist(moveable, e) {
  var clientX = e.clientX,
      clientY = e.clientY,
      datas = e.datas;
  var _a = moveable.state,
      moveableClientRect = _a.moveableClientRect,
      rootMatrix = _a.rootMatrix,
      is3d = _a.is3d,
      pos1 = _a.pos1;
  var left = moveableClientRect.left,
      top = moveableClientRect.top;
  var n = is3d ? 4 : 3;

  var _b = minus(calculateInversePosition(rootMatrix, [clientX - left, clientY - top], n), pos1),
      posX = _b[0],
      posY = _b[1];

  var _c = getDragDist({
    datas: datas,
    distX: posX,
    distY: posY
  }),
      distX = _c[0],
      distY = _c[1];

  return [distX, distY];
}

function setDragStart(moveable, _a) {
  var datas = _a.datas;
  var _b = moveable.state,
      allMatrix = _b.allMatrix,
      beforeMatrix = _b.beforeMatrix,
      is3d = _b.is3d,
      left = _b.left,
      top = _b.top,
      origin = _b.origin,
      offsetMatrix = _b.offsetMatrix,
      targetMatrix = _b.targetMatrix,
      transformOrigin = _b.transformOrigin;
  var n = is3d ? 4 : 3;
  datas.is3d = is3d;
  datas.matrix = allMatrix;
  datas.targetMatrix = targetMatrix;
  datas.beforeMatrix = beforeMatrix;
  datas.offsetMatrix = offsetMatrix;
  datas.transformOrigin = transformOrigin;
  datas.inverseMatrix = invert(allMatrix, n);
  datas.inverseBeforeMatrix = invert(beforeMatrix, n);
  datas.absoluteOrigin = convertPositionMatrix(plus([left, top], origin), n);
  datas.startDragBeforeDist = calculate(datas.inverseBeforeMatrix, datas.absoluteOrigin, n);
  datas.startDragDist = calculate(datas.inverseMatrix, datas.absoluteOrigin, n);
}

function getTransformDirection(e) {
  return calculateMoveablePosition(e.datas.beforeTransform, [50, 50], 100, 100).direction;
}

function resolveTransformEvent(event, functionName) {
  var datas = event.datas,
      originalDatas = event.originalDatas.beforeRenderable;
  var index = datas.transformIndex;
  var nextTransforms = originalDatas.nextTransforms;
  var length = nextTransforms.length;
  var nextTransformAppendedIndexes = originalDatas.nextTransformAppendedIndexes;
  var nextIndex = 0;

  if (index === -1) {
    nextIndex = nextTransforms.length;
    datas.transformIndex = nextIndex;
  } else if (find(nextTransformAppendedIndexes, function (info) {
    return info.index === index && info.functionName === functionName;
  })) {
    nextIndex = index;
  } else {
    nextIndex = index + nextTransformAppendedIndexes.filter(function (info) {
      return info.index < index;
    }).length;
  }

  var result = convertTransformInfo(nextTransforms, nextIndex);
  var targetFunction = result.targetFunction;
  var matFunctionName = functionName === "rotate" ? "rotateZ" : functionName;
  datas.beforeFunctionTexts = result.beforeFunctionTexts;
  datas.afterFunctionTexts = result.afterFunctionTexts;
  datas.beforeTransform = result.beforeFunctionMatrix;
  datas.beforeTransform2 = result.beforeFunctionMatrix2;
  datas.targetTansform = result.targetFunctionMatrix;
  datas.afterTransform = result.afterFunctionMatrix;
  datas.afterTransform2 = result.afterFunctionMatrix2;
  datas.targetAllTransform = result.allFunctionMatrix;

  if (targetFunction.functionName === matFunctionName) {
    datas.afterFunctionTexts.splice(0, 1);
    datas.isAppendTransform = false;
  } else if (length > nextIndex) {
    datas.isAppendTransform = true;
    originalDatas.nextTransformAppendedIndexes = __spreadArray(__spreadArray([], nextTransformAppendedIndexes, true), [{
      functionName: functionName,
      index: nextIndex,
      isAppend: true
    }], false);
  }
}

function convertTransformFormat(datas, value, dist) {
  return "".concat(datas.beforeFunctionTexts.join(" "), " ").concat(datas.isAppendTransform ? dist : value, " ").concat(datas.afterFunctionTexts.join(" "));
}

function getTransformDist(_a) {
  var datas = _a.datas,
      distX = _a.distX,
      distY = _a.distY;

  var _b = getBeforeDragDist({
    datas: datas,
    distX: distX,
    distY: distY
  }),
      bx = _b[0],
      by = _b[1]; // B * [tx, ty] * A = [bx, by] * targetMatrix;
  // [tx, ty] = B-1 * [bx, by] * targetMatrix * A-1 * [0, 0];


  var res = getTransfromMatrix(datas, fromTranslation([bx, by], 4));
  return calculate(res, convertPositionMatrix([0, 0, 0], 4), 4);
}

function getTransfromMatrix(datas, targetMatrix, isAfter) {
  var beforeTransform = datas.beforeTransform,
      afterTransform = datas.afterTransform,
      beforeTransform2 = datas.beforeTransform2,
      afterTransform2 = datas.afterTransform2,
      targetAllTransform = datas.targetAllTransform; // B * afterTargetMatrix * A = (targetMatrix * targetAllTransform)
  // afterTargetMatrix = B-1 * targetMatrix * targetAllTransform * A-1
  // nextTargetMatrix = (targetMatrix * targetAllTransform)

  var nextTargetMatrix = isAfter ? multiply(targetAllTransform, targetMatrix, 4) : multiply(targetMatrix, targetAllTransform, 4); // res1 = B-1 * nextTargetMatrix

  var res1 = multiply(invert(isAfter ? beforeTransform2 : beforeTransform, 4), nextTargetMatrix, 4); // res3 = res2 * A-1

  var afterTargetMatrix = multiply(res1, invert(isAfter ? afterTransform2 : afterTransform, 4), 4);
  return afterTargetMatrix;
}

function getBeforeDragDist(_a) {
  var datas = _a.datas,
      distX = _a.distX,
      distY = _a.distY; // TT = BT

  var inverseBeforeMatrix = datas.inverseBeforeMatrix,
      is3d = datas.is3d,
      startDragBeforeDist = datas.startDragBeforeDist,
      absoluteOrigin = datas.absoluteOrigin;
  var n = is3d ? 4 : 3; // ABS_ORIGIN * [distX, distY] = BM * (ORIGIN + [tx, ty])
  // BM -1 * ABS_ORIGIN * [distX, distY] - ORIGIN = [tx, ty]

  return minus(calculate(inverseBeforeMatrix, plus(absoluteOrigin, [distX, distY]), n), startDragBeforeDist);
}

function getDragDist(_a, isBefore) {
  var datas = _a.datas,
      distX = _a.distX,
      distY = _a.distY;
  var inverseBeforeMatrix = datas.inverseBeforeMatrix,
      inverseMatrix = datas.inverseMatrix,
      is3d = datas.is3d,
      startDragBeforeDist = datas.startDragBeforeDist,
      startDragDist = datas.startDragDist,
      absoluteOrigin = datas.absoluteOrigin;
  var n = is3d ? 4 : 3;
  return minus(calculate(isBefore ? inverseBeforeMatrix : inverseMatrix, plus(absoluteOrigin, [distX, distY]), n), isBefore ? startDragBeforeDist : startDragDist);
}

function getInverseDragDist(_a, isBefore) {
  var datas = _a.datas,
      distX = _a.distX,
      distY = _a.distY;
  var beforeMatrix = datas.beforeMatrix,
      matrix = datas.matrix,
      is3d = datas.is3d,
      startDragBeforeDist = datas.startDragBeforeDist,
      startDragDist = datas.startDragDist,
      absoluteOrigin = datas.absoluteOrigin;
  var n = is3d ? 4 : 3;
  return minus(calculate(isBefore ? beforeMatrix : matrix, plus(isBefore ? startDragBeforeDist : startDragDist, [distX, distY]), n), absoluteOrigin);
}

function calculateTransformOrigin(transformOrigin, width, height, prevWidth, prevHeight, prevOrigin) {
  if (prevWidth === void 0) {
    prevWidth = width;
  }

  if (prevHeight === void 0) {
    prevHeight = height;
  }

  if (prevOrigin === void 0) {
    prevOrigin = [0, 0];
  }

  if (!transformOrigin) {
    return prevOrigin;
  }

  return transformOrigin.map(function (pos, i) {
    var _a = splitUnit(pos),
        value = _a.value,
        unit = _a.unit;

    var prevSize = i ? prevHeight : prevWidth;
    var size = i ? height : width;

    if (pos === "%" || isNaN(value)) {
      // no value but %
      var measureRatio = prevSize ? prevOrigin[i] / prevSize : 0;
      return size * measureRatio;
    } else if (unit !== "%") {
      return value;
    }

    return size * value / 100;
  });
}

function getPosIndexesByDirection(direction) {
  var indexes = [];

  if (direction[1] >= 0) {
    if (direction[0] >= 0) {
      indexes.push(3);
    }

    if (direction[0] <= 0) {
      indexes.push(2);
    }
  }

  if (direction[1] <= 0) {
    if (direction[0] >= 0) {
      indexes.push(1);
    }

    if (direction[0] <= 0) {
      indexes.push(0);
    }
  }

  return indexes;
}

function getPosesByDirection(poses, direction) {
  /*
  [-1, -1](pos1)       [0, -1](pos1,pos2)       [1, -1](pos2)
  [-1, 0](pos1, pos3)                           [1, 0](pos2, pos4)
  [-1, 1](pos3)        [0, 1](pos3, pos4)       [1, 1](pos4)
  */
  return getPosIndexesByDirection(direction).map(function (index) {
    return poses[index];
  });
}

function getPosByDirection(poses, direction) {
  var xRatio = (direction[0] + 1) / 2;
  var yRatio = (direction[1] + 1) / 2;
  var top = [dot(poses[0][0], poses[1][0], xRatio, 1 - xRatio), dot(poses[0][1], poses[1][1], xRatio, 1 - xRatio)];
  var bottom = [dot(poses[2][0], poses[3][0], xRatio, 1 - xRatio), dot(poses[2][1], poses[3][1], xRatio, 1 - xRatio)];
  return [dot(top[0], bottom[0], yRatio, 1 - yRatio), dot(top[1], bottom[1], yRatio, 1 - yRatio)];
}

function getDist(startPos, matrix, width, height, n, fixedDirection) {
  var poses = calculatePoses(matrix, width, height, n);
  var fixedPos = getPosByDirection(poses, fixedDirection);
  var distX = startPos[0] - fixedPos[0];
  var distY = startPos[1] - fixedPos[1];
  return [distX, distY];
}

function getNextMatrix(offsetMatrix, targetMatrix, origin, n) {
  return multiply(offsetMatrix, getAbsoluteMatrix(targetMatrix, n, origin), n);
}

function getNextTransformMatrix(state, datas, transform) {
  var transformOrigin = state.transformOrigin,
      offsetMatrix = state.offsetMatrix,
      is3d = state.is3d;
  var beforeTransform = datas.beforeTransform,
      afterTransform = datas.afterTransform;
  var n = is3d ? 4 : 3;
  var targetTransform = parseMat([transform]);
  return getNextMatrix(offsetMatrix, convertDimension(multiply(multiply(beforeTransform, targetTransform, 4), afterTransform, 4), 4, n), transformOrigin, n);
}

function scaleMatrix(state, scale) {
  var transformOrigin = state.transformOrigin,
      offsetMatrix = state.offsetMatrix,
      is3d = state.is3d,
      targetMatrix = state.targetMatrix;
  var n = is3d ? 4 : 3;
  return getNextMatrix(offsetMatrix, multiply(targetMatrix, createScaleMatrix(scale, n), n), transformOrigin, n);
}

function fillTransformStartEvent(e) {
  var originalDatas = getBeforeRenderableDatas(e);
  return {
    setTransform: function (transform, index) {
      if (index === void 0) {
        index = -1;
      }

      originalDatas.startTransforms = isArray(transform) ? transform : splitSpace(transform);
      setTransformIndex(e, index);
    },
    setTransformIndex: function (index) {
      setTransformIndex(e, index);
    }
  };
}

function setDefaultTransformIndex(e, property) {
  var originalDatas = getBeforeRenderableDatas(e);
  var startTransforms = originalDatas.startTransforms;
  setTransformIndex(e, findIndex(startTransforms, function (func) {
    return func.indexOf("".concat(property, "(")) === 0;
  }));
}

function setTransformIndex(e, index) {
  var originalDatas = getBeforeRenderableDatas(e);
  var datas = e.datas;
  datas.transformIndex = index;

  if (index === -1) {
    return;
  }

  var transform = originalDatas.startTransforms[index];

  if (!transform) {
    return;
  }

  var info = parse([transform]);
  datas.startValue = info[0].functionValue;
}

function fillOriginalTransform(e, transform) {
  var originalDatas = getBeforeRenderableDatas(e);
  originalDatas.nextTransforms = splitSpace(transform); // originalDatas.nextTargetMatrix = parseMat(transform);
}

function getBeforeRenderableDatas(e) {
  return e.originalDatas.beforeRenderable;
}

function getNextTransforms(e) {
  var originalDatas = e.originalDatas.beforeRenderable;
  return originalDatas.nextTransforms;
}

function getNextTransformText(e) {
  return getNextTransforms(e).join(" ");
}

function getNextStyle(e) {
  return getBeforeRenderableDatas(e).nextStyle;
}

function fillTransformEvent(moveable, nextTransform, delta, isPinch, e) {
  fillOriginalTransform(e, nextTransform);
  var drag = Draggable.drag(moveable, setCustomDrag(e, moveable.state, delta, isPinch, false));
  var afterTransform = drag ? drag.transform : nextTransform;
  return __assign(__assign({
    transform: nextTransform,
    drag: drag
  }, fillCSSObject({
    transform: afterTransform
  }, e)), {
    afterTransform: afterTransform
  });
}

function getTranslateDist(moveable, transform, fixedDirection, fixedPosition, datas) {
  var state = moveable.state;
  var left = state.left,
      top = state.top;
  var groupable = moveable.props.groupable;
  var nextMatrix = getNextTransformMatrix(moveable.state, datas, transform);
  var groupLeft = groupable ? left : 0;
  var groupTop = groupable ? top : 0;
  var nextFixedPosition = getDirectionOffset(moveable, fixedDirection, nextMatrix);
  var dist = minus(fixedPosition, nextFixedPosition);
  return minus(dist, [groupLeft, groupTop]);
}

function getScaleDist(moveable, scaleDist, fixedDirection, fixedPosition, datas) {
  var dist = getTranslateDist(moveable, "scale(".concat(scaleDist.join(", "), ")"), fixedDirection, fixedPosition, datas);
  return dist;
}

function getOriginDirection(moveable) {
  var _a = moveable.state,
      width = _a.width,
      height = _a.height,
      transformOrigin = _a.transformOrigin;
  return [-1 + transformOrigin[0] / (width / 2), -1 + transformOrigin[1] / (height / 2)];
}

function getDirectionOffset(moveable, direction, nextMatrix) {
  if (nextMatrix === void 0) {
    nextMatrix = moveable.state.allMatrix;
  }

  var _a = moveable.state,
      width = _a.width,
      height = _a.height,
      is3d = _a.is3d;
  var n = is3d ? 4 : 3;
  var nextFixedOffset = [width / 2 * (1 + direction[0]), height / 2 * (1 + direction[1])];
  return calculatePosition(nextMatrix, nextFixedOffset, n);
}

function getRotateDist(moveable, rotateDist, datas) {
  var fixedDirection = datas.fixedDirection;
  var fixedPosition = datas.fixedPosition;
  return getTranslateDist(moveable, "rotate(".concat(rotateDist, "deg)"), fixedDirection, fixedPosition, datas);
}

function getResizeDist(moveable, width, height, fixedPosition, transformOrigin, datas) {
  var groupable = moveable.props.groupable;
  var state = moveable.state;
  var prevOrigin = state.transformOrigin,
      offsetMatrix = state.offsetMatrix,
      is3d = state.is3d,
      prevWidth = state.width,
      prevHeight = state.height,
      left = state.left,
      top = state.top;
  var fixedDirection = datas.fixedDirection;
  var targetMatrix = datas.nextTargetMatrix || state.targetMatrix;
  var n = is3d ? 4 : 3;
  var nextOrigin = calculateTransformOrigin(transformOrigin, width, height, prevWidth, prevHeight, prevOrigin);
  var groupLeft = groupable ? left : 0;
  var groupTop = groupable ? top : 0;
  var nextMatrix = getNextMatrix(offsetMatrix, targetMatrix, nextOrigin, n);
  var dist = getDist(fixedPosition, nextMatrix, width, height, n, fixedDirection);
  return minus(dist, [groupLeft, groupTop]);
}

function getAbsolutePosition(moveable, direction) {
  return getPosByDirection(getAbsolutePosesByState(moveable.state), direction);
}

function getGestoData(moveable, ableName) {
  var targetGesto = moveable.targetGesto;
  var controlGesto = moveable.controlGesto;
  var data;

  if (targetGesto === null || targetGesto === void 0 ? void 0 : targetGesto.isFlag()) {
    data = targetGesto.getEventData()[ableName];
  }

  if (!data && (controlGesto === null || controlGesto === void 0 ? void 0 : controlGesto.isFlag())) {
    data = controlGesto.getEventData()[ableName];
  }

  return data || {};
}

function multiply2(pos1, pos2) {
  return [pos1[0] * pos2[0], pos1[1] * pos2[1]];
}

function prefix() {
  var classNames = [];

  for (var _i = 0; _i < arguments.length; _i++) {
    classNames[_i] = arguments[_i];
  }

  return prefixNames.apply(void 0, __spreadArray([PREFIX], classNames, false));
}

function defaultSync(fn) {
  fn();
}

function getTransformMatrix(transform) {
  if (!transform || transform === "none") {
    return [1, 0, 0, 1, 0, 0];
  }

  if (isObject(transform)) {
    return transform;
  }

  return parseMat(transform);
}

function getAbsoluteMatrix(matrix, n, origin) {
  return multiplies(n, createOriginMatrix(origin, n), matrix, createOriginMatrix(origin.map(function (a) {
    return -a;
  }), n));
}

function measureSVGSize(el, unit, isHorizontal) {
  if (unit === "%") {
    var viewBox = getSVGViewBox(el.ownerSVGElement);
    return viewBox[isHorizontal ? "width" : "height"] / 100;
  }

  return 1;
}

function getBeforeTransformOrigin(el) {
  var relativeOrigin = getTransformOrigin(getComputedStyle$1(el, ":before"));
  return relativeOrigin.map(function (o, i) {
    var _a = splitUnit(o),
        value = _a.value,
        unit = _a.unit;

    return value * measureSVGSize(el, unit, i === 0);
  });
}

function getTransformOrigin(style) {
  var transformOrigin = style.transformOrigin;
  return transformOrigin ? transformOrigin.split(" ") : ["0", "0"];
}

function getElementTransform(target, computedStyle) {
  if (computedStyle === void 0) {
    computedStyle = getComputedStyle$1(target);
  }

  var computedTransform = computedStyle.transform;

  if (computedTransform && computedTransform !== "none") {
    return computedStyle.transform;
  }

  if ("transform" in target) {
    var list = target.transform;
    var baseVal = list.baseVal;

    if (!baseVal) {
      return "";
    }

    var length = baseVal.length;

    if (!length) {
      return "";
    }

    var matrixes = [];

    var _loop_1 = function (i) {
      var matrix = baseVal[i].matrix;
      matrixes.push("matrix(".concat(["a", "b", "c", "d", "e", "f"].map(function (chr) {
        return matrix[chr];
      }).join(", "), ")"));
    };

    for (var i = 0; i < length; ++i) {
      _loop_1(i);
    }

    return matrixes.join(" ");
  }

  return "";
}

function getOffsetInfo(el, lastParent, isParent) {
  var _a, _b;

  var body = document.body;
  var hasSlot = false;
  var target;
  var parentSlotElement;

  if (!el || isParent) {
    target = el;
  } else {
    var assignedSlotParentElement = (_a = el === null || el === void 0 ? void 0 : el.assignedSlot) === null || _a === void 0 ? void 0 : _a.parentElement;
    var parentElement = el.parentElement;

    if (assignedSlotParentElement) {
      hasSlot = true;
      parentSlotElement = parentElement;
      target = assignedSlotParentElement;
    } else {
      target = parentElement;
    }
  }

  var isCustomElement = false;
  var isEnd = el === lastParent || target === lastParent;
  var position = "relative";

  while (target && target !== body) {
    if (lastParent === target) {
      isEnd = true;
    }

    var style = getComputedStyle$1(target);
    var tagName = target.tagName.toLowerCase();
    var transform = getElementTransform(target, style);
    var willChange = style.willChange;
    position = style.position;

    if (tagName === "svg" || position !== "static" || transform && transform !== "none" || willChange === "transform") {
      break;
    }

    var slotParentNode = (_b = el === null || el === void 0 ? void 0 : el.assignedSlot) === null || _b === void 0 ? void 0 : _b.parentNode;
    var targetParentNode = target.parentNode;

    if (slotParentNode) {
      hasSlot = true;
      parentSlotElement = targetParentNode;
    }

    var parentNode = slotParentNode || targetParentNode;

    if (parentNode && parentNode.nodeType === 11) {
      // Shadow Root
      target = parentNode.host;
      isCustomElement = true;
      break;
    }

    target = parentNode;
    position = "relative";
  }

  return {
    hasSlot: hasSlot,
    parentSlotElement: parentSlotElement,
    isCustomElement: isCustomElement,
    isStatic: position === "static",
    isEnd: isEnd || !target || target === body,
    offsetParent: target || body
  };
}

function getOffsetPosInfo(el, target, style) {
  var _a;

  var tagName = el.tagName.toLowerCase();
  var offsetLeft = el.offsetLeft;
  var offsetTop = el.offsetTop; // svg

  var isSVG = isUndefined(offsetLeft);
  var hasOffset = !isSVG;
  var origin;
  var targetOrigin; // inner svg element

  if (!hasOffset && tagName !== "svg") {
    origin = IS_WEBKIT605 ? getBeforeTransformOrigin(el) : getTransformOrigin(style).map(function (pos) {
      return parseFloat(pos);
    });
    targetOrigin = origin.slice();
    hasOffset = true;
    _a = getSVGGraphicsOffset(el, origin, el === target && target.tagName.toLowerCase() === "g"), offsetLeft = _a[0], offsetTop = _a[1], origin[0] = _a[2], origin[1] = _a[3];
  } else {
    origin = getTransformOrigin(style).map(function (pos) {
      return parseFloat(pos);
    });
    targetOrigin = origin.slice();
  }

  return {
    tagName: tagName,
    isSVG: isSVG,
    hasOffset: hasOffset,
    offset: [offsetLeft || 0, offsetTop || 0],
    origin: origin,
    targetOrigin: targetOrigin
  };
}

function getBodyOffset(el, isSVG, style) {
  if (style === void 0) {
    style = getComputedStyle$1(el);
  }

  var bodyStyle = getComputedStyle$1(document.body);
  var bodyPosition = bodyStyle.position;

  if (!isSVG && (!bodyPosition || bodyPosition === "static")) {
    return [0, 0];
  }

  var marginLeft = parseInt(bodyStyle.marginLeft, 10);
  var marginTop = parseInt(bodyStyle.marginTop, 10);

  if (style.position === "absolute") {
    if (style.top !== "auto" || style.bottom !== "auto") {
      marginTop = 0;
    }

    if (style.left !== "auto" || style.right !== "auto") {
      marginLeft = 0;
    }
  }

  return [marginLeft, marginTop];
}

function convert3DMatrixes(matrixes) {
  matrixes.forEach(function (info) {
    var matrix = info.matrix;

    if (matrix) {
      info.matrix = convertDimension(matrix, 3, 4);
    }
  });
}

function getBodyScrollPos() {
  return [document.documentElement.scrollLeft || document.body.scrollLeft, document.documentElement.scrollTop || document.body.scrollTop];
}

function getPositionFixedInfo(el) {
  var fixedContainer = el.parentElement;
  var hasTransform = false;

  while (fixedContainer) {
    var transform = getComputedStyle$1(fixedContainer).transform;

    if (transform && transform !== "none") {
      hasTransform = true;
      break;
    }

    if (fixedContainer === document.body) {
      break;
    }

    fixedContainer = fixedContainer.parentElement;
  }

  return {
    fixedContainer: fixedContainer || document.body,
    hasTransform: hasTransform
  };
}

function makeMatrixCSS(matrix, is3d) {
  if (is3d === void 0) {
    is3d = matrix.length > 9;
  }

  return "".concat(is3d ? "matrix3d" : "matrix", "(").concat(convertMatrixtoCSS(matrix, !is3d).join(","), ")");
}

function getSVGViewBox(el) {
  var clientWidth = el.clientWidth;
  var clientHeight = el.clientHeight;

  if (!el) {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      clientWidth: clientWidth,
      clientHeight: clientHeight
    };
  }

  var viewBox = el.viewBox;
  var baseVal = viewBox && viewBox.baseVal || {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };
  return {
    x: baseVal.x,
    y: baseVal.y,
    width: baseVal.width || clientWidth,
    height: baseVal.height || clientHeight,
    clientWidth: clientWidth,
    clientHeight: clientHeight
  };
}

function getSVGMatrix(el, n) {
  var _a = getSVGViewBox(el),
      viewBoxWidth = _a.width,
      viewBoxHeight = _a.height,
      clientWidth = _a.clientWidth,
      clientHeight = _a.clientHeight;

  var scaleX = clientWidth / viewBoxWidth;
  var scaleY = clientHeight / viewBoxHeight;
  var preserveAspectRatio = el.preserveAspectRatio.baseVal; // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio

  var align = preserveAspectRatio.align; // 1 : meet 2: slice

  var meetOrSlice = preserveAspectRatio.meetOrSlice;
  var svgOrigin = [0, 0];
  var scale = [scaleX, scaleY];
  var translate = [0, 0];

  if (align !== 1) {
    var xAlign = (align - 2) % 3;
    var yAlign = Math.floor((align - 2) / 3);
    svgOrigin[0] = viewBoxWidth * xAlign / 2;
    svgOrigin[1] = viewBoxHeight * yAlign / 2;
    var scaleDimension = meetOrSlice === 2 ? Math.max(scaleY, scaleX) : Math.min(scaleX, scaleY);
    scale[0] = scaleDimension;
    scale[1] = scaleDimension;
    translate[0] = (clientWidth - viewBoxWidth) / 2 * xAlign;
    translate[1] = (clientHeight - viewBoxHeight) / 2 * yAlign;
  }

  var scaleMatrix = createScaleMatrix(scale, n);
  scaleMatrix[n * (n - 1)] = translate[0], scaleMatrix[n * (n - 1) + 1] = translate[1];
  return getAbsoluteMatrix(scaleMatrix, n, svgOrigin);
}

function getSVGGraphicsOffset(el, origin, isGTarget) {
  if (!el.getBBox || !isGTarget && el.tagName.toLowerCase() === "g") {
    return [0, 0, 0, 0];
  }

  var bbox = el.getBBox();
  var viewBox = getSVGViewBox(el.ownerSVGElement);
  var left = bbox.x - viewBox.x;
  var top = bbox.y - viewBox.y;
  return [left, top, origin[0] - left, origin[1] - top];
}

function calculatePosition(matrix, pos, n) {
  return calculate(matrix, convertPositionMatrix(pos, n), n);
}

function calculatePoses(matrix, width, height, n) {
  return [[0, 0], [width, 0], [0, height], [width, height]].map(function (pos) {
    return calculatePosition(matrix, pos, n);
  });
}

function getRect(poses) {
  var posesX = poses.map(function (pos) {
    return pos[0];
  });
  var posesY = poses.map(function (pos) {
    return pos[1];
  });
  var left = Math.min.apply(Math, posesX);
  var top = Math.min.apply(Math, posesY);
  var right = Math.max.apply(Math, posesX);
  var bottom = Math.max.apply(Math, posesY);
  var rectWidth = right - left;
  var rectHeight = bottom - top;
  return {
    left: left,
    top: top,
    right: right,
    bottom: bottom,
    width: rectWidth,
    height: rectHeight
  };
}

function calculateRect(matrix, width, height, n) {
  var poses = calculatePoses(matrix, width, height, n);
  return getRect(poses);
}

function getSVGOffset(offsetInfo, targetInfo, container, n, beforeMatrix) {
  var _a;

  var target = offsetInfo.target;
  var origin = offsetInfo.origin;
  var targetMatrix = targetInfo.matrix;

  var _b = getSize(target),
      width = _b.offsetWidth,
      height = _b.offsetHeight;

  var containerClientRect = container.getBoundingClientRect();
  var margin = [0, 0];

  if (container === document.body) {
    margin = getBodyOffset(target, true);
  }

  var rect = target.getBoundingClientRect();
  var rectLeft = rect.left - containerClientRect.left + container.scrollLeft - (container.clientLeft || 0) + margin[0];
  var rectTop = rect.top - containerClientRect.top + container.scrollTop - (container.clientTop || 0) + margin[1];
  var rectWidth = rect.width;
  var rectHeight = rect.height;
  var mat = multiplies(n, beforeMatrix, targetMatrix);

  var _c = calculateRect(mat, width, height, n),
      prevLeft = _c.left,
      prevTop = _c.top,
      prevWidth = _c.width,
      prevHeight = _c.height;

  var posOrigin = calculatePosition(mat, origin, n);
  var prevOrigin = minus(posOrigin, [prevLeft, prevTop]);
  var rectOrigin = [rectLeft + prevOrigin[0] * rectWidth / prevWidth, rectTop + prevOrigin[1] * rectHeight / prevHeight];
  var offset = [0, 0];
  var count = 0;

  while (++count < 10) {
    var inverseBeforeMatrix = invert(beforeMatrix, n);
    _a = minus(calculatePosition(inverseBeforeMatrix, rectOrigin, n), calculatePosition(inverseBeforeMatrix, posOrigin, n)), offset[0] = _a[0], offset[1] = _a[1];
    var mat2 = multiplies(n, beforeMatrix, createOriginMatrix(offset, n), targetMatrix);

    var _d = calculateRect(mat2, width, height, n),
        nextLeft = _d.left,
        nextTop = _d.top;

    var distLeft = nextLeft - rectLeft;
    var distTop = nextTop - rectTop;

    if (Math.abs(distLeft) < 2 && Math.abs(distTop) < 2) {
      break;
    }

    rectOrigin[0] -= distLeft;
    rectOrigin[1] -= distTop;
  }

  return offset.map(function (p) {
    return Math.round(p);
  });
}

function calculateMoveableClientPositions(rootMatrix, poses, rootClientRect) {
  var is3d = rootMatrix.length === 16;
  var n = is3d ? 4 : 3;
  var rootPoses = poses.map(function (pos) {
    return calculatePosition(rootMatrix, pos, n);
  });
  var left = rootClientRect.left,
      top = rootClientRect.top;
  return rootPoses.map(function (pos) {
    return [pos[0] + left, pos[1] + top];
  });
}

function calculateMoveablePosition(matrix, origin, width, height) {
  var is3d = matrix.length === 16;
  var n = is3d ? 4 : 3;
  var poses = calculatePoses(matrix, width, height, n);
  var _a = poses[0],
      x1 = _a[0],
      y1 = _a[1],
      _b = poses[1],
      x2 = _b[0],
      y2 = _b[1],
      _c = poses[2],
      x3 = _c[0],
      y3 = _c[1],
      _d = poses[3],
      x4 = _d[0],
      y4 = _d[1];

  var _e = calculatePosition(matrix, origin, n),
      originX = _e[0],
      originY = _e[1];

  var left = Math.min(x1, x2, x3, x4);
  var top = Math.min(y1, y2, y3, y4);
  var right = Math.max(x1, x2, x3, x4);
  var bottom = Math.max(y1, y2, y3, y4);
  x1 = x1 - left || 0;
  x2 = x2 - left || 0;
  x3 = x3 - left || 0;
  x4 = x4 - left || 0;
  y1 = y1 - top || 0;
  y2 = y2 - top || 0;
  y3 = y3 - top || 0;
  y4 = y4 - top || 0;
  originX = originX - left || 0;
  originY = originY - top || 0;
  var direction = getShapeDirection(poses);
  return {
    left: left,
    top: top,
    right: right,
    bottom: bottom,
    origin: [originX, originY],
    pos1: [x1, y1],
    pos2: [x2, y2],
    pos3: [x3, y3],
    pos4: [x4, y4],
    direction: direction
  };
}

function getDistSize(vec) {
  return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
}

function getDiagonalSize(pos1, pos2) {
  return getDistSize([pos2[0] - pos1[0], pos2[1] - pos1[1]]);
}

function getLineStyle(pos1, pos2, zoom, rad) {
  if (zoom === void 0) {
    zoom = 1;
  }

  if (rad === void 0) {
    rad = getRad(pos1, pos2);
  }

  var width = getDiagonalSize(pos1, pos2);
  return {
    transform: "translateY(-50%) translate(".concat(pos1[0], "px, ").concat(pos1[1], "px) rotate(").concat(rad, "rad) scaleY(").concat(zoom, ")"),
    width: "".concat(width, "px")
  };
}

function getControlTransform(rotation, zoom) {
  var poses = [];

  for (var _i = 2; _i < arguments.length; _i++) {
    poses[_i - 2] = arguments[_i];
  }

  var length = poses.length;
  var x = poses.reduce(function (prev, pos) {
    return prev + pos[0];
  }, 0) / length;
  var y = poses.reduce(function (prev, pos) {
    return prev + pos[1];
  }, 0) / length;
  return {
    transform: "translateZ(0px) translate(".concat(x, "px, ").concat(y, "px) rotate(").concat(rotation, "rad) scale(").concat(zoom, ")")
  };
}

function getProps(props, ableName) {
  var self = props[ableName];

  if (isObject(self)) {
    return __assign(__assign({}, props), self);
  }

  return props;
}

function getSize(target, style) {
  if (style === void 0) {
    style = target ? getComputedStyle$1(target) : null;
  }

  var hasOffset = target && !isUndefined(target.offsetWidth);
  var offsetWidth = 0;
  var offsetHeight = 0;
  var clientWidth = 0;
  var clientHeight = 0;
  var cssWidth = 0;
  var cssHeight = 0;
  var contentWidth = 0;
  var contentHeight = 0;
  var minWidth = 0;
  var minHeight = 0;
  var minOffsetWidth = 0;
  var minOffsetHeight = 0;
  var maxWidth = Infinity;
  var maxHeight = Infinity;
  var maxOffsetWidth = Infinity;
  var maxOffsetHeight = Infinity;
  var svg = false;

  if (target) {
    if (!hasOffset && target.tagName.toLowerCase() !== "svg") {
      var bbox = target.getBBox();
      svg = true;
      offsetWidth = bbox.width;
      offsetHeight = bbox.height;
      cssWidth = offsetWidth;
      cssHeight = offsetHeight;
      contentWidth = offsetWidth;
      contentHeight = offsetHeight;
      clientWidth = offsetWidth;
      clientHeight = offsetHeight;
    } else {
      var targetStyle = target.style;
      var boxSizing = style.boxSizing === "border-box";
      var borderLeft = parseFloat(style.borderLeftWidth) || 0;
      var borderRight = parseFloat(style.borderRightWidth) || 0;
      var borderTop = parseFloat(style.borderTopWidth) || 0;
      var borderBottom = parseFloat(style.borderBottomWidth) || 0;
      var paddingLeft = parseFloat(style.paddingLeft) || 0;
      var paddingRight = parseFloat(style.paddingRight) || 0;
      var paddingTop = parseFloat(style.paddingTop) || 0;
      var paddingBottom = parseFloat(style.paddingBottom) || 0;
      var horizontalPadding = paddingLeft + paddingRight;
      var verticalPadding = paddingTop + paddingBottom;
      var horizontalBorder = borderLeft + borderRight;
      var verticalBorder = borderTop + borderBottom;
      var horizontalOffset = horizontalPadding + horizontalBorder;
      var verticalOffset = verticalPadding + verticalBorder;
      var position = style.position;
      var containerWidth = 0;
      var containerHeight = 0; // SVGSVGElement, HTMLElement

      if ("clientLeft" in target) {
        var parentElement = null;

        if (position === "absolute") {
          var offsetInfo = getOffsetInfo(target, document.body, false);
          parentElement = offsetInfo.offsetParent;
        } else {
          parentElement = target.parentElement;
        }

        if (parentElement) {
          var parentStyle = getComputedStyle$1(parentElement);
          containerWidth = parseFloat(parentStyle.width);
          containerHeight = parseFloat(parentStyle.height);
        }
      }

      minWidth = Math.max(horizontalPadding, convertUnitSize(style.minWidth, containerWidth) || 0);
      minHeight = Math.max(verticalPadding, convertUnitSize(style.minHeight, containerHeight) || 0);
      maxWidth = convertUnitSize(style.maxWidth, containerWidth);
      maxHeight = convertUnitSize(style.maxHeight, containerHeight);

      if (isNaN(maxWidth)) {
        maxWidth = Infinity;
      }

      if (isNaN(maxHeight)) {
        maxHeight = Infinity;
      }

      var inlineCSSWidth = convertUnitSize(targetStyle.width, 0) || 0;
      var inlineCSSHeight = convertUnitSize(targetStyle.height, 0) || 0;
      var computedWidth = parseFloat(style.width) || 0;
      var computedHeight = parseFloat(style.height) || 0;
      cssWidth = parseFloat(style.width);
      cssHeight = parseFloat(style.height);
      contentWidth = Math.abs(computedWidth - inlineCSSWidth) < 1 ? between(minWidth, inlineCSSWidth || cssWidth, maxWidth) : computedWidth;
      contentHeight = Math.abs(computedHeight - inlineCSSHeight) < 1 ? between(minHeight, inlineCSSHeight || cssHeight, maxHeight) : computedHeight;
      offsetWidth = contentWidth;
      offsetHeight = contentHeight;
      clientWidth = contentWidth;
      clientHeight = contentHeight;

      if (boxSizing) {
        maxOffsetWidth = maxWidth;
        maxOffsetHeight = maxHeight;
        minOffsetWidth = minWidth;
        minOffsetHeight = minHeight;
        contentWidth = offsetWidth - horizontalOffset;
        contentHeight = offsetHeight - verticalOffset;
      } else {
        maxOffsetWidth = maxWidth + horizontalOffset;
        maxOffsetHeight = maxHeight + verticalOffset;
        minOffsetWidth = minWidth + horizontalOffset;
        minOffsetHeight = minHeight + verticalOffset;
        offsetWidth = contentWidth + horizontalOffset;
        offsetHeight = contentHeight + verticalOffset;
      }

      clientWidth = contentWidth + horizontalPadding;
      clientHeight = contentHeight + verticalPadding;
    }
  }

  return {
    svg: svg,
    offsetWidth: offsetWidth,
    offsetHeight: offsetHeight,
    clientWidth: clientWidth,
    clientHeight: clientHeight,
    contentWidth: contentWidth,
    contentHeight: contentHeight,
    cssWidth: cssWidth,
    cssHeight: cssHeight,
    minWidth: minWidth,
    minHeight: minHeight,
    maxWidth: maxWidth,
    maxHeight: maxHeight,
    minOffsetWidth: minOffsetWidth,
    minOffsetHeight: minOffsetHeight,
    maxOffsetWidth: maxOffsetWidth,
    maxOffsetHeight: maxOffsetHeight
  };
}

function getRotationRad(poses, direction) {
  return getRad(direction > 0 ? poses[0] : poses[1], direction > 0 ? poses[1] : poses[0]);
}

function resetClientRect() {
  return {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    right: 0,
    bottom: 0,
    clientLeft: 0,
    clientTop: 0,
    clientWidth: 0,
    clientHeight: 0,
    scrollWidth: 0,
    scrollHeight: 0
  };
}

function getClientRect(el, isExtends) {
  var _a;

  var left = 0;
  var top = 0;
  var width = 0;
  var height = 0;

  if (el) {
    if (el === document.body || el === document.documentElement) {
      width = window.innerWidth;
      height = window.innerHeight;
      var scrollPos = getBodyScrollPos();
      _a = [-scrollPos[0], -scrollPos[1]], left = _a[0], top = _a[1];
    } else {
      var clientRect = el.getBoundingClientRect();
      left = clientRect.left;
      top = clientRect.top;
      width = clientRect.width;
      height = clientRect.height;
    }
  }

  var rect = {
    left: left,
    top: top,
    width: width,
    height: height,
    right: left + width,
    bottom: top + height
  };

  if (el && isExtends) {
    rect.clientLeft = el.clientLeft;
    rect.clientTop = el.clientTop;
    rect.clientWidth = el.clientWidth;
    rect.clientHeight = el.clientHeight;
    rect.scrollWidth = el.scrollWidth;
    rect.scrollHeight = el.scrollHeight;
    rect.overflow = getComputedStyle$1(el).overflow !== "visible";
  }

  return rect;
}

function getTotalDirection(parentDirection, isPinch, inputEvent, datas) {
  var direction;

  if (parentDirection) {
    direction = parentDirection;
  } else if (isPinch) {
    direction = [0, 0];
  } else {
    var target = inputEvent.target;
    direction = getDirection(target, datas);
  }

  return direction;
}

function getDirection(target, datas) {
  if (!target) {
    return;
  }

  var deg = target.getAttribute("data-rotation") || "";
  var direciton = target.getAttribute("data-direction");
  datas.deg = deg;

  if (!direciton) {
    return;
  }

  var dir = [0, 0];
  direciton.indexOf("w") > -1 && (dir[0] = -1);
  direciton.indexOf("e") > -1 && (dir[0] = 1);
  direciton.indexOf("n") > -1 && (dir[1] = -1);
  direciton.indexOf("s") > -1 && (dir[1] = 1);
  return dir;
}

function getAbsolutePoses(poses, dist) {
  return [plus(dist, poses[0]), plus(dist, poses[1]), plus(dist, poses[2]), plus(dist, poses[3])];
}

function getAbsolutePosesByState(_a) {
  var left = _a.left,
      top = _a.top,
      pos1 = _a.pos1,
      pos2 = _a.pos2,
      pos3 = _a.pos3,
      pos4 = _a.pos4;
  return getAbsolutePoses([pos1, pos2, pos3, pos4], [left, top]);
}

function roundSign(num) {
  return Math.round(num % 1 === -0.5 ? num - 1 : num);
}

function unset(self, name) {
  var _a;

  (_a = self[name]) === null || _a === void 0 ? void 0 : _a.unset();
  self[name] = null;
}

function fillCSSObject(style, resolvedEvent) {
  if (resolvedEvent) {
    var originalDatas = getBeforeRenderableDatas(resolvedEvent);
    originalDatas.nextStyle = __assign(__assign({}, originalDatas.nextStyle), style);
  }

  return {
    style: style,
    cssText: getKeys(style).map(function (name) {
      return "".concat(decamelize(name, "-"), ": ").concat(style[name], ";");
    }).join("")
  };
}

function fillAfterTransform(prevEvent, nextEvent, resolvedEvent) {
  var afterTransform = nextEvent.afterTransform || nextEvent.transform;
  return __assign(__assign({}, fillCSSObject(__assign(__assign(__assign({}, prevEvent.style), nextEvent.style), {
    transform: afterTransform
  }), resolvedEvent)), {
    afterTransform: afterTransform,
    transform: prevEvent.transform
  });
}

function fillParams(moveable, e, params, isBeforeEvent) {
  var datas = e.datas;

  if (!datas.datas) {
    datas.datas = {};
  }

  var nextParams = __assign(__assign({}, params), {
    target: moveable.state.target,
    clientX: e.clientX,
    clientY: e.clientY,
    inputEvent: e.inputEvent,
    currentTarget: moveable,
    moveable: moveable,
    datas: datas.datas,
    stopDrag: function () {
      var _a;

      (_a = e.stop) === null || _a === void 0 ? void 0 : _a.call(e);
    }
  });

  if (!datas.isStartEvent) {
    datas.isStartEvent = true;
  } else if (!isBeforeEvent) {
    datas.lastEvent = nextParams;
  }

  return nextParams;
}

function fillEndParams(moveable, e, params) {
  var datas = e.datas;
  var isDrag = "isDrag" in params ? params.isDrag : e.isDrag;

  if (!datas.datas) {
    datas.datas = {};
  }

  return __assign(__assign({
    isDrag: isDrag
  }, params), {
    moveable: moveable,
    target: moveable.state.target,
    clientX: e.clientX,
    clientY: e.clientY,
    inputEvent: e.inputEvent,
    currentTarget: moveable,
    lastEvent: datas.lastEvent,
    isDouble: e.isDouble,
    datas: datas.datas
  });
}

function catchEvent(moveable, name, callback) {
  moveable._emitter.on(name, callback);
}

function triggerEvent(moveable, name, params, isManager) {
  return moveable.triggerEvent(name, params, isManager);
}

function getComputedStyle$1(el, pseudoElt) {
  return window.getComputedStyle(el, pseudoElt);
}

function filterAbles(ables, methods, triggerAblesSimultaneously) {
  var enabledAbles = {};
  var ableGroups = {};
  return ables.filter(function (able) {
    var name = able.name;

    if (enabledAbles[name] || !methods.some(function (method) {
      return able[method];
    })) {
      return false;
    }

    if (!triggerAblesSimultaneously && able.ableGroup) {
      if (ableGroups[able.ableGroup]) {
        return false;
      }

      ableGroups[able.ableGroup] = true;
    }

    enabledAbles[name] = true;
    return true;
  });
}

function equals(a1, a2) {
  return a1 === a2 || a1 == null && a2 == null;
}

function selectValue() {
  var values = [];

  for (var _i = 0; _i < arguments.length; _i++) {
    values[_i] = arguments[_i];
  }

  var length = values.length - 1;

  for (var i = 0; i < length; ++i) {
    var value = values[i];

    if (!isUndefined(value)) {
      return value;
    }
  }

  return values[length];
}

function groupBy(arr, func) {
  var groups = [];
  var groupKeys = [];
  arr.forEach(function (el, index) {
    var groupKey = func(el, index, arr);
    var keyIndex = groupKeys.indexOf(groupKey);
    var group = groups[keyIndex] || [];

    if (keyIndex === -1) {
      groupKeys.push(groupKey);
      groups.push(group);
    }

    group.push(el);
  });
  return groups;
}

function groupByMap(arr, func) {
  var groups = [];
  var groupKeys = {};
  arr.forEach(function (el, index) {
    var groupKey = func(el, index, arr);
    var group = groupKeys[groupKey];

    if (!group) {
      group = [];
      groupKeys[groupKey] = group;
      groups.push(group);
    }

    group.push(el);
  });
  return groups;
}

function flat(arr) {
  return arr.reduce(function (prev, cur) {
    return prev.concat(cur);
  }, []);
}

function maxOffset() {
  var args = [];

  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }

  args.sort(function (a, b) {
    return Math.abs(b) - Math.abs(a);
  });
  return args[0];
}

function calculateInversePosition(matrix, pos, n) {
  return calculate(invert(matrix, n), convertPositionMatrix(pos, n), n);
}

function convertDragDist(state, e) {
  var _a;

  var is3d = state.is3d,
      rootMatrix = state.rootMatrix;
  var n = is3d ? 4 : 3;
  _a = calculateInversePosition(rootMatrix, [e.distX, e.distY], n), e.distX = _a[0], e.distY = _a[1];
  return e;
}

function calculatePadding(matrix, pos, transformOrigin, origin, n) {
  return minus(calculatePosition(matrix, plus(transformOrigin, pos), n), origin);
}

function convertCSSSize(value, size, isRelative) {
  return isRelative ? "".concat(value / size * 100, "%") : "".concat(value, "px");
}

function getTinyDist(v) {
  return Math.abs(v) <= TINY_NUM ? 0 : v;
}

function getDirectionViewClassName(ableName) {
  return function (moveable) {
    if (!moveable.isDragging(ableName)) {
      return "";
    }

    var data = getGestoData(moveable, ableName);
    var deg = data.deg;

    if (!deg) {
      return "";
    }

    var className = "view-".concat(ableName, "-dragging");
    return prefix(className, "view-control-rotation".concat(deg));
  };
}

function getDirectionCondition(ableName, checkAbles) {
  if (checkAbles === void 0) {
    checkAbles = [ableName];
  }

  return function (moveable, e) {
    if (e.isRequest) {
      if (checkAbles.some(function (name) {
        return e.requestAble === name;
      })) {
        return e.parentDirection;
      } else {
        return false;
      }
    }

    var target = e.inputEvent.target;
    return hasClass(target, prefix("direction")) && (!ableName || hasClass(target, prefix(ableName)));
  };
}

function invertObject(obj) {
  var nextObj = {};

  for (var name in obj) {
    nextObj[obj[name]] = name;
  }

  return nextObj;
}

function convertTransformInfo(transforms, index) {
  var beforeFunctionTexts = transforms.slice(0, index < 0 ? undefined : index);
  var beforeFunctionTexts2 = transforms.slice(0, index < 0 ? undefined : index + 1);
  var targetFunctionText = transforms[index] || "";
  var afterFunctionTexts = index < 0 ? [] : transforms.slice(index);
  var afterFunctionTexts2 = index < 0 ? [] : transforms.slice(index + 1);
  var beforeFunctions = parse(beforeFunctionTexts);
  var beforeFunctions2 = parse(beforeFunctionTexts2);
  var targetFunctions = parse([targetFunctionText]);
  var afterFunctions = parse(afterFunctionTexts);
  var afterFunctions2 = parse(afterFunctionTexts2);
  var beforeFunctionMatrix = toMat(beforeFunctions);
  var beforeFunctionMatrix2 = toMat(beforeFunctions2);
  var afterFunctionMatrix = toMat(afterFunctions);
  var afterFunctionMatrix2 = toMat(afterFunctions2);
  var allFunctionMatrix = multiply(beforeFunctionMatrix, afterFunctionMatrix, 4);
  return {
    transforms: transforms,
    beforeFunctionMatrix: beforeFunctionMatrix,
    beforeFunctionMatrix2: beforeFunctionMatrix2,
    targetFunctionMatrix: toMat(targetFunctions),
    afterFunctionMatrix: afterFunctionMatrix,
    afterFunctionMatrix2: afterFunctionMatrix2,
    allFunctionMatrix: allFunctionMatrix,
    beforeFunctions: beforeFunctions,
    beforeFunctions2: beforeFunctions2,
    targetFunction: targetFunctions[0],
    afterFunctions: afterFunctions,
    afterFunctions2: afterFunctions2,
    beforeFunctionTexts: beforeFunctionTexts,
    beforeFunctionTexts2: beforeFunctionTexts2,
    targetFunctionText: targetFunctionText,
    afterFunctionTexts: afterFunctionTexts,
    afterFunctionTexts2: afterFunctionTexts2
  };
}

function isArrayFormat(arr) {
  if (!arr || !isObject(arr)) {
    return false;
  }

  if (arr instanceof Element) {
    return false;
  }

  return isArray(arr) || "length" in arr;
}

function getRefTarget(target, isSelector) {
  if (!target) {
    return null;
  }

  if (target instanceof Element) {
    return target;
  }

  if (isString(target)) {
    if (isSelector) {
      return document.querySelector(target);
    }

    return target;
  }

  if (isFunction(target)) {
    return target();
  }

  if ("current" in target) {
    return target.current;
  }

  return target;
}

function getRefTargets(targets, isSelector) {
  if (!targets) {
    return [];
  }

  var userTargets = isArrayFormat(targets) ? [].slice.call(targets) : [targets];
  return userTargets.reduce(function (prev, target) {
    if (isString(target) && isSelector) {
      return __spreadArray(__spreadArray([], prev, true), [].slice.call(document.querySelectorAll(target)), true);
    }

    if (isArray(target)) {
      prev.push(getRefTargets(target, isSelector));
    } else {
      prev.push(getRefTarget(target, isSelector));
    }

    return prev;
  }, []);
}

function getAbsoluteRotation(pos1, pos2, direction) {
  var deg = getRad(pos1, pos2) / Math.PI * 180;
  deg = direction >= 0 ? deg : 180 - deg;
  deg = deg >= 0 ? deg : 360 + deg;
  return deg;
}

function getDragDistByState(state, dist) {
  var rootMatrix = state.rootMatrix,
      is3d = state.is3d;
  var n = is3d ? 4 : 3;
  var inverseMatrix = invert(rootMatrix, n);

  if (!is3d) {
    inverseMatrix = convertDimension(inverseMatrix, 3, 4);
  }

  inverseMatrix[12] = 0;
  inverseMatrix[13] = 0;
  inverseMatrix[14] = 0;
  return calculateMatrixDist(inverseMatrix, dist);
}

function getSizeDistByDist(startSize, dist, ratio, direction, keepRatio) {
  var startOffsetWidth = startSize[0],
      startOffsetHeight = startSize[1];
  var distWidth = 0;
  var distHeight = 0;

  if (keepRatio && startOffsetWidth && startOffsetHeight) {
    var rad = getRad([0, 0], dist);
    var standardRad = getRad([0, 0], direction);
    var size = getDistSize(dist);
    var signSize = Math.cos(rad - standardRad) * size;

    if (!direction[0]) {
      // top, bottom
      distHeight = signSize;
      distWidth = distHeight * ratio;
    } else if (!direction[1]) {
      // left, right
      distWidth = signSize;
      distHeight = distWidth / ratio;
    } else {
      // two-way
      var startWidthSize = direction[0] * 2 * startOffsetWidth;
      var startHeightSize = direction[1] * 2 * startOffsetHeight;
      var distSize = getDistSize([startWidthSize + dist[0], startHeightSize + dist[1]]) - getDistSize([startWidthSize, startHeightSize]);
      var ratioRad = getRad([0, 0], [ratio, 1]);
      distWidth = Math.cos(ratioRad) * distSize;
      distHeight = Math.sin(ratioRad) * distSize;
    }
  } else {
    distWidth = direction[0] * dist[0];
    distHeight = direction[1] * dist[1];
  }

  return [distWidth, distHeight];
}

function getOffsetSizeDist(sizeDirection, keepRatio, datas, e) {
  var _a;

  var ratio = datas.ratio,
      startOffsetWidth = datas.startOffsetWidth,
      startOffsetHeight = datas.startOffsetHeight;
  var distWidth = 0;
  var distHeight = 0;
  var distX = e.distX,
      distY = e.distY,
      parentDistance = e.parentDistance,
      parentDist = e.parentDist,
      parentScale = e.parentScale;
  var startFixedDirection = datas.fixedDirection;
  var directionsDists = [0, 1].map(function (index) {
    return Math.abs(sizeDirection[index] - startFixedDirection[index]);
  });
  var directionRatios = [0, 1].map(function (index) {
    var dist = directionsDists[index];

    if (dist !== 0) {
      dist = 2 / dist;
    }

    return dist;
  });

  if (parentDist) {
    distWidth = parentDist[0];
    distHeight = parentDist[1];

    if (keepRatio) {
      if (!distWidth) {
        distWidth = distHeight * ratio;
      } else if (!distHeight) {
        distHeight = distWidth / ratio;
      }
    }
  } else if (parentScale) {
    distWidth = (parentScale[0] - 1) * startOffsetWidth;
    distHeight = (parentScale[1] - 1) * startOffsetHeight;
  } else if (parentDistance) {
    var scaleX = startOffsetWidth * directionsDists[0];
    var scaleY = startOffsetHeight * directionsDists[1];
    var ratioDistance = getDistSize([scaleX, scaleY]);
    distWidth = parentDistance / ratioDistance * scaleX * directionRatios[0];
    distHeight = parentDistance / ratioDistance * scaleY * directionRatios[1];
  } else {
    var dist_1 = getDragDist({
      datas: datas,
      distX: distX,
      distY: distY
    });
    dist_1 = directionRatios.map(function (ratio, i) {
      return dist_1[i] * ratio;
    });
    _a = getSizeDistByDist([startOffsetWidth, startOffsetHeight], dist_1, ratio, sizeDirection, keepRatio), distWidth = _a[0], distHeight = _a[1];
  }

  return {
    // direction,
    // sizeDirection,
    distWidth: distWidth,
    distHeight: distHeight
  };
}
/**
 * @namespace Moveable.Pinchable
 * @description Whether or not target can be pinched with draggable, resizable, scalable, rotatable (default: false)
 */


var Pinchable = makeAble("pinchable", {
  events: {
    onPinchStart: "pinchStart",
    onPinch: "pinch",
    onPinchEnd: "pinchEnd",
    onPinchGroupStart: "pinchGroupStart",
    onPinchGroup: "pinchGroup",
    onPinchGroupEnd: "pinchGroupEnd"
  },
  dragStart: function () {
    return true;
  },
  pinchStart: function (moveable, e) {
    var datas = e.datas,
        targets = e.targets,
        angle = e.angle,
        originalDatas = e.originalDatas;
    var _a = moveable.props,
        pinchable = _a.pinchable,
        ables = _a.ables;

    if (!pinchable) {
      return false;
    }

    var eventName = "onPinch".concat(targets ? "Group" : "", "Start");
    var controlEventName = "drag".concat(targets ? "Group" : "", "ControlStart");
    var pinchAbles = (pinchable === true ? moveable.controlAbles : ables.filter(function (able) {
      return pinchable.indexOf(able.name) > -1;
    })).filter(function (able) {
      return able.canPinch && able[controlEventName];
    });
    var params = fillParams(moveable, e, {});

    if (targets) {
      params.targets = targets;
    }

    var result = triggerEvent(moveable, eventName, params);
    datas.isPinch = result !== false;
    datas.ables = pinchAbles;
    var isPinch = datas.isPinch;

    if (!isPinch) {
      return false;
    }

    pinchAbles.forEach(function (able) {
      originalDatas[able.name] = originalDatas[able.name] || {};

      if (!able[controlEventName]) {
        return;
      }

      var ableEvent = __assign(__assign({}, e), {
        datas: originalDatas[able.name],
        parentRotate: angle,
        isPinch: true
      });

      able[controlEventName](moveable, ableEvent);
    });
    moveable.state.snapRenderInfo = {
      request: e.isRequest,
      direction: [0, 0]
    };
    return isPinch;
  },
  pinch: function (moveable, e) {
    var datas = e.datas,
        pinchScale = e.scale,
        distance = e.distance,
        originalDatas = e.originalDatas,
        inputEvent = e.inputEvent,
        targets = e.targets,
        angle = e.angle;

    if (!datas.isPinch) {
      return;
    }

    var parentDistance = distance * (1 - 1 / pinchScale);
    var params = fillParams(moveable, e, {});

    if (targets) {
      params.targets = targets;
    }

    var eventName = "onPinch".concat(targets ? "Group" : "");
    triggerEvent(moveable, eventName, params);
    var ables = datas.ables;
    var controlEventName = "drag".concat(targets ? "Group" : "", "Control");
    ables.forEach(function (able) {
      if (!able[controlEventName]) {
        return;
      }

      able[controlEventName](moveable, __assign(__assign({}, e), {
        datas: originalDatas[able.name],
        inputEvent: inputEvent,
        parentDistance: parentDistance,
        parentRotate: angle,
        isPinch: true
      }));
    });
    return params;
  },
  pinchEnd: function (moveable, e) {
    var datas = e.datas,
        isPinch = e.isPinch,
        inputEvent = e.inputEvent,
        targets = e.targets,
        originalDatas = e.originalDatas;

    if (!datas.isPinch) {
      return;
    }

    var eventName = "onPinch".concat(targets ? "Group" : "", "End");
    var params = fillEndParams(moveable, e, {
      isDrag: isPinch
    });

    if (targets) {
      params.targets = targets;
    }

    triggerEvent(moveable, eventName, params);
    var ables = datas.ables;
    var controlEventName = "drag".concat(targets ? "Group" : "", "ControlEnd");
    ables.forEach(function (able) {
      if (!able[controlEventName]) {
        return;
      }

      able[controlEventName](moveable, __assign(__assign({}, e), {
        isDrag: isPinch,
        datas: originalDatas[able.name],
        inputEvent: inputEvent,
        isPinch: true
      }));
    });
    return isPinch;
  },
  pinchGroupStart: function (moveable, e) {
    return this.pinchStart(moveable, __assign(__assign({}, e), {
      targets: moveable.props.targets
    }));
  },
  pinchGroup: function (moveable, e) {
    return this.pinch(moveable, __assign(__assign({}, e), {
      targets: moveable.props.targets
    }));
  },
  pinchGroupEnd: function (moveable, e) {
    return this.pinchEnd(moveable, __assign(__assign({}, e), {
      targets: moveable.props.targets
    }));
  }
});
/**
 * Whether or not target can be pinched with draggable, resizable, scalable, rotatable (default: false)
 * @name Moveable.Pinchable#pinchable
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body);
 *
 * moveable.pinchable = true;
 */

/**
 * When the pinch starts, the pinchStart event is called with part of scaleStart, rotateStart, resizeStart
 * @memberof Moveable.Pinchable
 * @event pinchStart
 * @param {Moveable.Pinchable.OnPinchStart} - Parameters for the pinchStart event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     rotatable: true,
 *     scalable: true,
 *     pinchable: true, // ["rotatable", "scalable"]
 * });
 * moveable.on("pinchStart", ({ target }) => {
 *     console.log(target);
 * });
 * moveable.on("rotateStart", ({ target }) => {
 *     console.log(target);
 * });
 * moveable.on("scaleStart", ({ target }) => {
 *     console.log(target);
 * });
 */

/**
 * When pinching, the pinch event is called with part of scale, rotate, resize
 * @memberof Moveable.Pinchable
 * @event pinch
 * @param {Moveable.Pinchable.OnPinch} - Parameters for the pinch event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     rotatable: true,
 *     scalable: true,
 *     pinchable: true, // ["rotatable", "scalable"]
 * });
 * moveable.on("pinch", ({ target }) => {
 *     console.log(target);
 * });
 * moveable.on("rotate", ({ target }) => {
 *     console.log(target);
 * });
 * moveable.on("scale", ({ target }) => {
 *     console.log(target);
 * });
 */

/**
 * When the pinch finishes, the pinchEnd event is called.
 * @memberof Moveable.Pinchable
 * @event pinchEnd
 * @param {Moveable.Pinchable.OnPinchEnd} - Parameters for the pinchEnd event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     rotatable: true,
 *     scalable: true,
 *     pinchable: true, // ["rotatable", "scalable"]
 * });
 * moveable.on("pinchEnd", ({ target }) => {
 *     console.log(target);
 * });
 * moveable.on("rotateEnd", ({ target }) => {
 *     console.log(target);
 * });
 * moveable.on("scaleEnd", ({ target }) => {
 *     console.log(target);
 * });
 */

/**
 * When the group pinch starts, the `pinchGroupStart` event is called.
 * @memberof Moveable.Pinchable
 * @event pinchGroupStart
 * @param {Moveable.Pinchable.OnPinchGroupStart} - Parameters for the `pinchGroupStart` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     target: [].slice.call(document.querySelectorAll(".target")),
 *     pinchable: true
 * });
 * moveable.on("pinchGroupStart", ({ targets }) => {
 *     console.log("onPinchGroupStart", targets);
 * });
 */

/**
 * When the group pinch, the `pinchGroup` event is called.
 * @memberof Moveable.Pinchable
 * @event pinchGroup
 * @param {Moveable.Pinchable.OnPinchGroup} - Parameters for the `pinchGroup` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     target: [].slice.call(document.querySelectorAll(".target")),
 *     pinchable: true
 * });
 * moveable.on("pinchGroup", ({ targets, events }) => {
 *     console.log("onPinchGroup", targets);
 * });
 */

/**
 * When the group pinch finishes, the `pinchGroupEnd` event is called.
 * @memberof Moveable.Pinchable
 * @event pinchGroupEnd
 * @param {Moveable.Pinchable.OnPinchGroupEnd} - Parameters for the `pinchGroupEnd` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     target: [].slice.call(document.querySelectorAll(".target")),
 *     pinchable: true
 * });
 * moveable.on("pinchGroupEnd", ({ targets, isDrag }) => {
 *     console.log("onPinchGroupEnd", targets, isDrag);
 * });
 */

function fillChildEvents(moveable, name, e) {
  var datas = e.originalDatas;
  datas.groupable = datas.groupable || {};
  var groupableDatas = datas.groupable;
  groupableDatas.childDatas = groupableDatas.childDatas || [];
  var childDatas = groupableDatas.childDatas;
  return moveable.moveables.map(function (_, i) {
    childDatas[i] = childDatas[i] || {};
    childDatas[i][name] = childDatas[i][name] || {};
    return __assign(__assign({}, e), {
      datas: childDatas[i][name],
      originalDatas: childDatas[i]
    });
  });
}

function triggerChildGesto(moveable, able, type, delta, e, isConvert, ableName) {
  var isStart = !!type.match(/Start$/g);
  var isEnd = !!type.match(/End$/g);
  var isPinch = e.isPinch;
  var datas = e.datas;
  var events = fillChildEvents(moveable, able.name, e);
  var moveables = moveable.moveables;
  var childs = events.map(function (ev, i) {
    var childMoveable = moveables[i];
    var state = childMoveable.state;
    var gestos = state.gestos;
    var childEvent = ev;

    if (isStart) {
      childEvent = new CustomGesto(ableName).dragStart(delta, ev);
    } else {
      if (!gestos[ableName]) {
        gestos[ableName] = datas.childGestos[i];
      }

      if (!gestos[ableName]) {
        return;
      }

      childEvent = setCustomDrag(ev, state, delta, isPinch, isConvert, ableName);
    }

    var result = able[type](childMoveable, __assign(__assign({}, childEvent), {
      parentFlag: true
    }));

    if (isEnd) {
      gestos[ableName] = null;
    }

    return result;
  });

  if (isStart) {
    datas.childGestos = moveables.map(function (child) {
      return child.state.gestos[ableName];
    });
  }

  return childs;
}

function triggerChildAbles(moveable, able, type, e, eachEvent, callback) {
  if (eachEvent === void 0) {
    eachEvent = function (_, ev) {
      return ev;
    };
  }

  var isEnd = !!type.match(/End$/g);
  var events = fillChildEvents(moveable, able.name, e);
  var moveables = moveable.moveables;
  var childs = events.map(function (ev, i) {
    var childMoveable = moveables[i];
    var childEvent = ev;
    childEvent = eachEvent(childMoveable, ev);
    var result = able[type](childMoveable, __assign(__assign({}, childEvent), {
      parentFlag: true
    }));
    result && callback && callback(childMoveable, ev, result, i);

    if (isEnd) {
      childMoveable.state.gestos = {};
    }

    return result;
  });
  return childs;
}

var VERTICAL_NAMES = ["left", "right", "center"];
var HORIZONTAL_NAMES = ["top", "bottom", "middle"];
var VERTICAL_NAMES_MAP = {
  start: "left",
  end: "right",
  center: "center"
};
var HORIZONTAL_NAMES_MAP = {
  start: "top",
  end: "bottom",
  center: "middle"
};

function hasGuidelines(moveable, ableName) {
  var _a = moveable.props,
      snappable = _a.snappable,
      bounds = _a.bounds,
      innerBounds = _a.innerBounds,
      verticalGuidelines = _a.verticalGuidelines,
      horizontalGuidelines = _a.horizontalGuidelines,
      snapGridWidth = _a.snapGridWidth,
      snapGridHeight = _a.snapGridHeight,
      _b = moveable.state,
      guidelines = _b.guidelines,
      enableSnap = _b.enableSnap;

  if (!snappable || !enableSnap || ableName && snappable !== true && snappable.indexOf(ableName) < 0) {
    return false;
  }

  if (snapGridWidth || snapGridHeight || bounds || innerBounds || guidelines && guidelines.length || verticalGuidelines && verticalGuidelines.length || horizontalGuidelines && horizontalGuidelines.length) {
    return true;
  }

  return false;
}

function getSnapDirections(snapDirections) {
  if (snapDirections === false) {
    return {};
  } else if (snapDirections === true || !snapDirections) {
    return {
      left: true,
      right: true,
      top: true,
      bottom: true
    };
  }

  return snapDirections;
}

function mapSnapDirectionPoses(snapDirections, snapPoses) {
  var nextSnapDirections = getSnapDirections(snapDirections);
  var nextSnapPoses = {};

  for (var name in nextSnapDirections) {
    if (name in snapPoses && nextSnapDirections[name]) {
      nextSnapPoses[name] = snapPoses[name];
    }
  }

  return nextSnapPoses;
}

function splitSnapDirectionPoses(snapDirections, snapPoses) {
  var nextSnapPoses = mapSnapDirectionPoses(snapDirections, snapPoses);
  var horizontalNames = HORIZONTAL_NAMES.filter(function (name) {
    return name in nextSnapPoses;
  });
  var verticalNames = VERTICAL_NAMES.filter(function (name) {
    return name in nextSnapPoses;
  });
  return {
    horizontal: horizontalNames.map(function (name) {
      return nextSnapPoses[name];
    }),
    vertical: verticalNames.map(function (name) {
      return nextSnapPoses[name];
    })
  };
}

function calculateContainerPos(rootMatrix, containerRect, n) {
  var clientPos = calculatePosition(rootMatrix, [containerRect.clientLeft, containerRect.clientTop], n);
  return [containerRect.left + clientPos[0], containerRect.top + clientPos[1]];
}

function solveLineConstants(_a) {
  var point1 = _a[0],
      point2 = _a[1];
  var dx = point2[0] - point1[0];
  var dy = point2[1] - point1[1];

  if (Math.abs(dx) < TINY_NUM$1) {
    dx = 0;
  }

  if (Math.abs(dy) < TINY_NUM$1) {
    dy = 0;
  } // b > 0
  // ax + by + c = 0


  var a = 0;
  var b = 0;
  var c = 0;

  if (!dx) {
    // -x + 1 = 0
    a = -1;
    c = point1[0];
  } else if (!dy) {
    // y - 1 = 0
    b = 1;
    c = -point1[1];
  } else {
    // y = -a(x - x1) + y1
    // ax + y + a * x1 - y1 = 0
    a = -dy / dx;
    b = 1;
    c = a * point1[0] - point1[1];
  }

  return [a, b, c].map(function (v) {
    return throttle(v, TINY_NUM$1);
  });
}

function checkMoveableSnapPoses(moveable, posesX, posesY, customSnapThreshold) {
  var props = moveable.props;
  var snapThreshold = selectValue(customSnapThreshold, props.snapThreshold, 5);
  return checkSnapPoses(moveable.state.guidelines, posesX, posesY, snapThreshold);
}

function checkSnapPoses(guidelines, posesX, posesY, snapThreshold) {
  return {
    vertical: checkSnap(guidelines, "vertical", posesX, snapThreshold),
    horizontal: checkSnap(guidelines, "horizontal", posesY, snapThreshold)
  };
}

function checkSnapKeepRatio(moveable, startPos, endPos) {
  var endX = endPos[0],
      endY = endPos[1];
  var startX = startPos[0],
      startY = startPos[1];

  var _a = minus(endPos, startPos),
      dx = _a[0],
      dy = _a[1];

  var isBottom = dy > 0;
  var isRight = dx > 0;
  dx = getTinyDist(dx);
  dy = getTinyDist(dy);
  var verticalInfo = {
    isSnap: false,
    offset: 0,
    pos: 0
  };
  var horizontalInfo = {
    isSnap: false,
    offset: 0,
    pos: 0
  };

  if (dx === 0 && dy === 0) {
    return {
      vertical: verticalInfo,
      horizontal: horizontalInfo
    };
  }

  var _b = checkMoveableSnapPoses(moveable, dx ? [endX] : [], dy ? [endY] : []),
      verticalSnapInfo = _b.vertical,
      horizontalSnapInfo = _b.horizontal;

  verticalSnapInfo.posInfos.filter(function (_a) {
    var pos = _a.pos;
    return isRight ? pos >= startX : pos <= startX;
  });
  horizontalSnapInfo.posInfos.filter(function (_a) {
    var pos = _a.pos;
    return isBottom ? pos >= startY : pos <= startY;
  });
  verticalSnapInfo.isSnap = verticalSnapInfo.posInfos.length > 0;
  horizontalSnapInfo.isSnap = horizontalSnapInfo.posInfos.length > 0;

  var _c = getNearestSnapGuidelineInfo(verticalSnapInfo),
      isVerticalSnap = _c.isSnap,
      verticalGuideline = _c.guideline;

  var _d = getNearestSnapGuidelineInfo(horizontalSnapInfo),
      isHorizontalSnap = _d.isSnap,
      horizontalGuideline = _d.guideline;

  var horizontalPos = isHorizontalSnap ? horizontalGuideline.pos[1] : 0;
  var verticalPos = isVerticalSnap ? verticalGuideline.pos[0] : 0;

  if (dx === 0) {
    if (isHorizontalSnap) {
      horizontalInfo.isSnap = true;
      horizontalInfo.pos = horizontalGuideline.pos[1];
      horizontalInfo.offset = endY - horizontalInfo.pos;
    }
  } else if (dy === 0) {
    if (isVerticalSnap) {
      verticalInfo.isSnap = true;
      verticalInfo.pos = verticalPos;
      verticalInfo.offset = endX - verticalPos;
    }
  } else {
    // y - y1 = a * (x - x1)
    var a = dy / dx;
    var b = endPos[1] - a * endX;
    var y = 0;
    var x = 0;
    var isSnap = false;

    if (isVerticalSnap) {
      x = verticalPos;
      y = a * x + b;
      isSnap = true;
    } else if (isHorizontalSnap) {
      y = horizontalPos;
      x = (y - b) / a;
      isSnap = true;
    }

    if (isSnap) {
      verticalInfo.isSnap = true;
      verticalInfo.pos = x;
      verticalInfo.offset = endX - x;
      horizontalInfo.isSnap = true;
      horizontalInfo.pos = y;
      horizontalInfo.offset = endY - y;
    }
  }

  return {
    vertical: verticalInfo,
    horizontal: horizontalInfo
  };
}

function checkSnaps(moveable, rect, customSnapThreshold) {
  var poses = splitSnapDirectionPoses(moveable.props.snapDirections, rect);
  return checkMoveableSnapPoses(moveable, poses.vertical, poses.horizontal, customSnapThreshold);
}

function getNearestSnapGuidelineInfo(snapInfo) {
  var isSnap = snapInfo.isSnap;

  if (!isSnap) {
    return {
      isSnap: false,
      offset: 0,
      dist: -1,
      pos: 0,
      guideline: null
    };
  }

  var posInfo = snapInfo.posInfos[0];
  var guidelineInfo = posInfo.guidelineInfos[0];
  var offset = guidelineInfo.offset;
  var dist = guidelineInfo.dist;
  var guideline = guidelineInfo.guideline;
  return {
    isSnap: isSnap,
    offset: offset,
    dist: dist,
    pos: posInfo.pos,
    guideline: guideline
  };
}

function checkSnap(guidelines, targetType, targetPoses, snapThreshold) {
  if (!guidelines || !guidelines.length) {
    return {
      isSnap: false,
      index: -1,
      posInfos: []
    };
  }

  var isVertical = targetType === "vertical";
  var posType = isVertical ? 0 : 1;
  var snapPosInfos = targetPoses.map(function (targetPos, index) {
    var guidelineInfos = guidelines.map(function (guideline) {
      var pos = guideline.pos;
      var offset = targetPos - pos[posType];
      return {
        offset: offset,
        dist: Math.abs(offset),
        guideline: guideline
      };
    }).filter(function (_a) {
      var guideline = _a.guideline,
          dist = _a.dist;
      var type = guideline.type;

      if (type !== targetType || dist > snapThreshold) {
        return false;
      }

      return true;
    }).sort(function (a, b) {
      return a.dist - b.dist;
    });
    return {
      pos: targetPos,
      index: index,
      guidelineInfos: guidelineInfos
    };
  }).filter(function (snapPosInfo) {
    return snapPosInfo.guidelineInfos.length > 0;
  }).sort(function (a, b) {
    return a.guidelineInfos[0].dist - b.guidelineInfos[0].dist;
  });
  var isSnap = snapPosInfos.length > 0;
  return {
    isSnap: isSnap,
    index: isSnap ? snapPosInfos[0].index : -1,
    posInfos: snapPosInfos
  };
}

function getSnapInfosByDirection(moveable, poses, snapDirection) {
  var nextPoses = [];

  if (snapDirection[0] && snapDirection[1]) {
    nextPoses = [snapDirection, [-snapDirection[0], snapDirection[1]], [snapDirection[0], -snapDirection[1]]].map(function (direction) {
      return getPosByDirection(poses, direction);
    });
  } else if (!snapDirection[0] && !snapDirection[1]) {
    var alignPoses = [poses[0], poses[1], poses[3], poses[2], poses[0]];

    for (var i = 0; i < 4; ++i) {
      nextPoses.push(alignPoses[i]);
      nextPoses.push([(alignPoses[i][0] + alignPoses[i + 1][0]) / 2, (alignPoses[i][1] + alignPoses[i + 1][1]) / 2]);
    }
  } else {
    if (moveable.props.keepRatio) {
      nextPoses = [[-1, -1], [-1, 1], [1, -1], [1, 1], snapDirection].map(function (dir) {
        return getPosByDirection(poses, dir);
      });
    } else {
      nextPoses = getPosesByDirection(poses, snapDirection);

      if (nextPoses.length > 1) {
        nextPoses.push([(nextPoses[0][0] + nextPoses[1][0]) / 2, (nextPoses[0][1] + nextPoses[1][1]) / 2]);
      }
    }
  }

  return checkMoveableSnapPoses(moveable, nextPoses.map(function (pos) {
    return pos[0];
  }), nextPoses.map(function (pos) {
    return pos[1];
  }), 1);
}

function checkSnapBoundPriority(a, b) {
  var aDist = Math.abs(a.offset);
  var bDist = Math.abs(b.offset);

  if (a.isBound && b.isBound) {
    return bDist - aDist;
  } else if (a.isBound) {
    return -1;
  } else if (b.isBound) {
    return 1;
  } else if (a.isSnap && b.isSnap) {
    return bDist - aDist;
  } else if (a.isSnap) {
    return -1;
  } else if (b.isSnap) {
    return 1;
  } else if (aDist < TINY_NUM) {
    return 1;
  } else if (bDist < TINY_NUM) {
    return -1;
  }

  return aDist - bDist;
}

function getNearOffsetInfo(offsets, index) {
  return offsets.slice().sort(function (a, b) {
    var aSign = a.sign[index];
    var bSign = b.sign[index];
    var aOffset = a.offset[index];
    var bOffset = b.offset[index]; // -1 The positions of a and b do not change.
    // 1 The positions of a and b are reversed.

    if (!aSign) {
      return 1;
    } else if (!bSign) {
      return -1;
    }

    return checkSnapBoundPriority({
      isBound: a.isBound,
      isSnap: a.isSnap,
      offset: aOffset
    }, {
      isBound: b.isBound,
      isSnap: b.isSnap,
      offset: bOffset
    });
  })[0];
}

function getCheckSnapDirections(direction, fixedDirection, keepRatio) {
  var directions = []; // const fixedDirection = [-direction[0], -direction[1]];

  if (keepRatio) {
    if (Math.abs(fixedDirection[0]) !== 1 || Math.abs(fixedDirection[1]) !== 1) {
      directions.push([fixedDirection, [-1, -1]], [fixedDirection, [-1, 1]], [fixedDirection, [1, -1]], [fixedDirection, [1, 1]]);
    } else {
      directions.push([fixedDirection, [direction[0], -direction[1]]], [fixedDirection, [-direction[0], direction[1]]]);
    }

    directions.push([fixedDirection, direction]);
  } else {
    if (direction[0] && direction[1] || !direction[0] && !direction[1]) {
      var endDirection_1 = direction[0] ? direction : [1, 1];
      [1, -1].forEach(function (signX) {
        [1, -1].forEach(function (signY) {
          var nextDirection = [signX * endDirection_1[0], signY * endDirection_1[1]];

          if (fixedDirection[0] === nextDirection[0] && fixedDirection[1] === nextDirection[1]) {
            return;
          }

          directions.push([fixedDirection, nextDirection]);
        });
      });
    } else if (direction[0]) {
      var signs = Math.abs(fixedDirection[0]) === 1 ? [1] : [1, -1];
      signs.forEach(function (sign) {
        directions.push([[fixedDirection[0], -1], [sign * direction[0], -1]], [[fixedDirection[0], 0], [sign * direction[0], 0]], [[fixedDirection[0], 1], [sign * direction[0], 1]]);
      });
    } else if (direction[1]) {
      var signs = Math.abs(fixedDirection[1]) === 1 ? [1] : [1, -1];
      signs.forEach(function (sign) {
        directions.push([[-1, fixedDirection[1]], [-1, sign * direction[1]]], [[0, fixedDirection[1]], [0, sign * direction[1]]], [[1, fixedDirection[1]], [1, sign * direction[1]]]);
      });
    }
  }

  return directions;
}

function isStartLine(dot, line) {
  // l    o     => true
  // o    l    => false
  var cx = average([line[0][0], line[1][0]]);
  var cy = average([line[0][1], line[1][1]]);
  return {
    vertical: cx <= dot[0],
    horizontal: cy <= dot[1]
  };
}

function hitTestLine(dot, _a) {
  var pos1 = _a[0],
      pos2 = _a[1];
  var dx = pos2[0] - pos1[0];
  var dy = pos2[1] - pos1[1];

  if (Math.abs(dx) < TINY_NUM) {
    dx = 0;
  }

  if (Math.abs(dy) < TINY_NUM) {
    dy = 0;
  }

  var test1;
  var test2;

  if (!dx) {
    test1 = pos1[0];
    test2 = dot[0];
  } else if (!dy) {
    test1 = pos1[1];
    test2 = dot[1];
  } else {
    var a = dy / dx; // y = a * (x - pos1) + pos1

    test1 = a * (dot[0] - pos1[0]) + pos1[1];
    test2 = dot[1];
  }

  return test1 - test2;
}

function isSameStartLine(dots, line, centerSign, error) {
  if (error === void 0) {
    error = TINY_NUM;
  }

  return dots.every(function (dot) {
    var value = hitTestLine(dot, line);
    var sign = value <= 0;
    return sign === centerSign || Math.abs(value) <= error;
  });
}

function checkInnerBoundDot(pos, start, end, isStart, threshold) {
  if (threshold === void 0) {
    threshold = 0;
  }

  if (isStart && start - threshold <= pos || !isStart && pos <= end + threshold) {
    // false 402 565 602 => 37 ([0, 37])
    // true 400 524.9712603540036 600 => 124 ([124, 0])
    // true 400 410 600 => 10 ([10, 0])
    return {
      isBound: true,
      offset: isStart ? start - pos : end - pos
    };
  }

  return {
    isBound: false,
    offset: 0
  };
}

function checkInnerBound(moveable, _a) {
  var line = _a.line,
      centerSign = _a.centerSign,
      verticalSign = _a.verticalSign,
      horizontalSign = _a.horizontalSign,
      lineConstants = _a.lineConstants;
  var bounds = moveable.props.innerBounds;

  if (!bounds) {
    return {
      isAllBound: false,
      isBound: false,
      isVerticalBound: false,
      isHorizontalBound: false,
      offset: [0, 0]
    };
  }

  var left = bounds.left,
      top = bounds.top,
      width = bounds.width,
      height = bounds.height;
  var leftLine = [[left, top], [left, top + height]];
  var topLine = [[left, top], [left + width, top]];
  var rightLine = [[left + width, top], [left + width, top + height]];
  var bottomLine = [[left, top + height], [left + width, top + height]];

  if (isSameStartLine([[left, top], [left + width, top], [left, top + height], [left + width, top + height]], line, centerSign)) {
    return {
      isAllBound: false,
      isBound: false,
      isVerticalBound: false,
      isHorizontalBound: false,
      offset: [0, 0]
    };
  } // test vertical


  var topBoundInfo = checkLineBoundCollision(line, lineConstants, topLine, verticalSign);
  var bottomBoundInfo = checkLineBoundCollision(line, lineConstants, bottomLine, verticalSign); // test horizontal

  var leftBoundInfo = checkLineBoundCollision(line, lineConstants, leftLine, horizontalSign);
  var rightBoundInfo = checkLineBoundCollision(line, lineConstants, rightLine, horizontalSign);
  var isAllVerticalBound = topBoundInfo.isBound && bottomBoundInfo.isBound;
  var isVerticalBound = topBoundInfo.isBound || bottomBoundInfo.isBound;
  var isAllHorizontalBound = leftBoundInfo.isBound && rightBoundInfo.isBound;
  var isHorizontalBound = leftBoundInfo.isBound || rightBoundInfo.isBound;
  var verticalOffset = maxOffset(topBoundInfo.offset, bottomBoundInfo.offset);
  var horizontalOffset = maxOffset(leftBoundInfo.offset, rightBoundInfo.offset);
  var offset = [0, 0];
  var isBound = false;
  var isAllBound = false;

  if (Math.abs(horizontalOffset) < Math.abs(verticalOffset)) {
    offset = [verticalOffset, 0];
    isBound = isVerticalBound;
    isAllBound = isAllVerticalBound;
  } else {
    offset = [0, horizontalOffset];
    isBound = isHorizontalBound;
    isAllBound = isAllHorizontalBound;
  }

  return {
    isAllBound: isAllBound,
    isVerticalBound: isVerticalBound,
    isHorizontalBound: isHorizontalBound,
    isBound: isBound,
    offset: offset
  };
}

function checkLineBoundCollision(line, _a, boundLine, isStart, threshold, isRender) {
  var a = _a[0],
      b = _a[1];
  var dot1 = line[0]; // const dot2 = line[1];

  var boundDot1 = boundLine[0];
  var boundDot2 = boundLine[1]; // const dy1 = getTinyDist(dot2[1] - dot1[1]);
  // const dx1 = getTinyDist(dot2[0] - dot1[0]);

  var dy2 = getTinyDist(boundDot2[1] - boundDot1[1]);
  var dx2 = getTinyDist(boundDot2[0] - boundDot1[0]);
  var hasDx = b;
  var hasDy = a;
  var slope = -a / b; // lineConstants
  // ax + by + c = 0
  // dx2 or dy2 is zero

  if (!dx2) {
    // vertical
    // by + c = 0
    if (isRender && !hasDy) {
      // 90deg
      return {
        isBound: false,
        offset: 0
      };
    } else if (hasDx) {
      // ax + by + c = 0
      // const y = dy1 ? dy1 / dx1 * (boundDot1[0] - dot1[0]) + dot1[1] : dot1[1];
      var y = slope * (boundDot1[0] - dot1[0]) + dot1[1]; // boundDot1[1] <= y  <= boundDot2[1]

      return checkInnerBoundDot(y, boundDot1[1], boundDot2[1], isStart, threshold);
    } else {
      // ax + c = 0
      var offset = boundDot1[0] - dot1[0];
      var isBound = Math.abs(offset) <= (threshold || 0);
      return {
        isBound: isBound,
        offset: isBound ? offset : 0
      };
    }
  } else if (!dy2) {
    // horizontal
    if (isRender && !hasDx) {
      // 90deg
      return {
        isBound: false,
        offset: 0
      };
    } else if (hasDy) {
      // y = a * (x - x1) + y1
      // x = (y - y1) / a + x1
      // const a = dy1 / dx1;
      // const x = dx1 ? (boundDot1[1] - dot1[1]) / a + dot1[0] : dot1[0];
      var x = (boundDot1[1] - dot1[1]) / slope + dot1[0]; // boundDot1[0] <= x && x <= boundDot2[0]

      return checkInnerBoundDot(x, boundDot1[0], boundDot2[0], isStart, threshold);
    } else {
      var offset = boundDot1[1] - dot1[1];
      var isBound = Math.abs(offset) <= (threshold || 0);
      return {
        isBound: isBound,
        offset: isBound ? offset : 0
      };
    }
  }

  return {
    isBound: false,
    offset: 0
  };
}

function getInnerBoundInfo(moveable, lineInfos, datas) {
  return lineInfos.map(function (info) {
    var _a = checkInnerBound(moveable, info),
        isBound = _a.isBound,
        offset = _a.offset,
        isVerticalBound = _a.isVerticalBound,
        isHorizontalBound = _a.isHorizontalBound;

    var multiple = info.multiple;
    var sizeOffset = getDragDist({
      datas: datas,
      distX: offset[0],
      distY: offset[1]
    }).map(function (size, i) {
      return size * (multiple[i] ? 2 / multiple[i] : 0);
    });
    return {
      sign: multiple,
      isBound: isBound,
      isVerticalBound: isVerticalBound,
      isHorizontalBound: isHorizontalBound,
      isSnap: false,
      offset: sizeOffset
    };
  });
}

function getInnerBoundDragInfo(moveable, poses, datas) {
  var _a;

  var lines = getCheckInnerBoundLineInfos(moveable, poses, [0, 0], false).map(function (info) {
    return __assign(__assign({}, info), {
      multiple: info.multiple.map(function (dir) {
        return Math.abs(dir) * 2;
      })
    });
  });
  var innerBoundInfo = getInnerBoundInfo(moveable, lines, datas);
  var widthOffsetInfo = getNearOffsetInfo(innerBoundInfo, 0);
  var heightOffsetInfo = getNearOffsetInfo(innerBoundInfo, 1);
  var verticalOffset = 0;
  var horizontalOffset = 0;
  var isVerticalBound = widthOffsetInfo.isVerticalBound || heightOffsetInfo.isVerticalBound;
  var isHorizontalBound = widthOffsetInfo.isHorizontalBound || heightOffsetInfo.isHorizontalBound;

  if (isVerticalBound || isHorizontalBound) {
    _a = getInverseDragDist({
      datas: datas,
      distX: -widthOffsetInfo.offset[0],
      distY: -heightOffsetInfo.offset[1]
    }), verticalOffset = _a[0], horizontalOffset = _a[1];
  }

  return {
    vertical: {
      isBound: isVerticalBound,
      offset: verticalOffset
    },
    horizontal: {
      isBound: isHorizontalBound,
      offset: horizontalOffset
    }
  };
}

function getCheckSnapLineDirections(direction, keepRatio) {
  var lineDirections = [];
  var x = direction[0];
  var y = direction[1];

  if (x && y) {
    lineDirections.push([[0, y * 2], direction, [-x, y]], [[x * 2, 0], direction, [x, -y]]);
  } else if (x) {
    // vertcal
    lineDirections.push([[x * 2, 0], [x, 1], [x, -1]]);

    if (keepRatio) {
      lineDirections.push([[0, -1], [x, -1], [-x, -1]], [[0, 1], [x, 1], [-x, 1]]);
    }
  } else if (y) {
    // horizontal
    lineDirections.push([[0, y * 2], [1, y], [-1, y]]);

    if (keepRatio) {
      lineDirections.push([[-1, 0], [-1, y], [-1, -y]], [[1, 0], [1, y], [1, -y]]);
    }
  } else {
    // [0, 0] to all direction
    lineDirections.push([[-1, 0], [-1, -1], [-1, 1]], [[1, 0], [1, -1], [1, 1]], [[0, -1], [-1, -1], [1, -1]], [[0, 1], [-1, 1], [1, 1]]);
  }

  return lineDirections;
}

function getCheckInnerBoundLineInfos(moveable, poses, direction, keepRatio) {
  var _a = moveable.state,
      allMatrix = _a.allMatrix,
      is3d = _a.is3d;
  var virtualPoses = calculatePoses(allMatrix, 100, 100, is3d ? 4 : 3);
  var center = getPosByDirection(virtualPoses, [0, 0]);
  return getCheckSnapLineDirections(direction, keepRatio).map(function (_a) {
    var multiple = _a[0],
        dir1 = _a[1],
        dir2 = _a[2];
    var virtualLine = [getPosByDirection(virtualPoses, dir1), getPosByDirection(virtualPoses, dir2)];
    var lineConstants = solveLineConstants(virtualLine);

    var _b = isStartLine(center, virtualLine),
        verticalSign = _b.vertical,
        horizontalSign = _b.horizontal;

    var centerSign = hitTestLine(center, virtualLine) <= 0;
    return {
      multiple: multiple,
      centerSign: centerSign,
      verticalSign: verticalSign,
      horizontalSign: horizontalSign,
      lineConstants: lineConstants,
      line: [getPosByDirection(poses, dir1), getPosByDirection(poses, dir2)]
    };
  });
}

function isBoundRotate$1(relativePoses, boundDots, center, rad) {
  var nextPoses = rad ? relativePoses.map(function (pos) {
    return rotate(pos, rad);
  }) : relativePoses;
  return [[nextPoses[0], nextPoses[1]], [nextPoses[1], nextPoses[3]], [nextPoses[3], nextPoses[2]], [nextPoses[2], nextPoses[0]]].some(function (line) {
    var centerSign = hitTestLine(center, line) <= 0;
    return !isSameStartLine(boundDots, line, centerSign);
  });
}

function getDistPointLine(_a) {
  // x = 0, y = 0
  // d = (ax + by + c) / root(a2 + b2)
  var pos1 = _a[0],
      pos2 = _a[1];
  var dx = pos2[0] - pos1[0];
  var dy = pos2[1] - pos1[1];

  if (!dx) {
    return Math.abs(pos1[0]);
  }

  if (!dy) {
    return Math.abs(pos1[1]);
  } // y - y1 = a(x - x1)
  // 0 = ax -y + -a * x1 + y1


  var a = dy / dx;
  return Math.abs((-a * pos1[0] + pos1[1]) / Math.sqrt(Math.pow(a, 2) + 1));
}

function solveReverseLine(_a) {
  var pos1 = _a[0],
      pos2 = _a[1];
  var dx = pos2[0] - pos1[0];
  var dy = pos2[1] - pos1[1];

  if (!dx) {
    return [pos1[0], 0];
  }

  if (!dy) {
    return [0, pos1[1]];
  }

  var a = dy / dx; // y - y1 = a (x  - x1)
  // y = ax - a * x1 + y1

  var b = -a * pos1[0] + pos1[1]; // y = ax + b = -1/a x
  // x = -b / (a + 1 / a)
  // y = b / (1 + 1 / a^2)

  return [-b / (a + 1 / a), b / (a * a + 1)];
}

function checkRotateInnerBounds(moveable, prevPoses, nextPoses, origin, rotation) {
  var bounds = moveable.props.innerBounds;
  var rad = rotation * Math.PI / 180;

  if (!bounds) {
    return [];
  }

  var left = bounds.left,
      top = bounds.top,
      width = bounds.width,
      height = bounds.height;
  var relativeLeft = left - origin[0];
  var relativeRight = left + width - origin[0];
  var relativeTop = top - origin[1];
  var relativeBottom = top + height - origin[1];
  var dots = [[relativeLeft, relativeTop], [relativeRight, relativeTop], [relativeLeft, relativeBottom], [relativeRight, relativeBottom]];
  var center = getPosByDirection(nextPoses, [0, 0]);

  if (!isBoundRotate$1(nextPoses, dots, center, 0)) {
    return [];
  }

  var result = [];
  var dotInfos = dots.map(function (dot) {
    return [getDistSize(dot), getRad([0, 0], dot)];
  });
  [[nextPoses[0], nextPoses[1]], [nextPoses[1], nextPoses[3]], [nextPoses[3], nextPoses[2]], [nextPoses[2], nextPoses[0]]].forEach(function (line) {
    var lineRad = getRad([0, 0], solveReverseLine(line));
    var lineDist = getDistPointLine(line);
    result.push.apply(result, dotInfos.filter(function (_a) {
      var dotDist = _a[0];
      return dotDist && lineDist <= dotDist;
    }).map(function (_a) {
      var dotDist = _a[0],
          dotRad = _a[1];
      var distRad = Math.acos(dotDist ? lineDist / dotDist : 0);
      var nextRad1 = dotRad + distRad;
      var nextRad2 = dotRad - distRad;
      return [rad + nextRad1 - lineRad, rad + nextRad2 - lineRad];
    }).reduce(function (prev, cur) {
      prev.push.apply(prev, cur);
      return prev;
    }, []).filter(function (nextRad) {
      return !isBoundRotate$1(prevPoses, dots, center, nextRad);
    }).map(function (nextRad) {
      return throttle(nextRad * 180 / Math.PI, TINY_NUM);
    }));
  });
  return result;
}

function checkInnerBoundPoses(moveable) {
  var innerBounds = moveable.props.innerBounds;

  if (!innerBounds) {
    return {
      vertical: [],
      horizontal: []
    };
  }

  var _a = moveable.getRect(),
      pos1 = _a.pos1,
      pos2 = _a.pos2,
      pos3 = _a.pos3,
      pos4 = _a.pos4;

  var poses = [pos1, pos2, pos3, pos4];
  var center = getPosByDirection(poses, [0, 0]);
  var left = innerBounds.left,
      top = innerBounds.top,
      width = innerBounds.width,
      height = innerBounds.height;
  var leftLine = [[left, top], [left, top + height]];
  var topLine = [[left, top], [left + width, top]];
  var rightLine = [[left + width, top], [left + width, top + height]];
  var bottomLine = [[left, top + height], [left + width, top + height]];
  var lineInfos = getCheckInnerBoundLineInfos(moveable, poses, [0, 0], false);
  var horizontalPoses = [];
  var verticalPoses = [];
  var boundMap = {
    top: false,
    bottom: false,
    left: false,
    right: false
  };
  lineInfos.forEach(function (lineInfo) {
    var line = lineInfo.line,
        lineConstants = lineInfo.lineConstants;

    var _a = isStartLine(center, line),
        isHorizontalStart = _a.horizontal,
        isVerticalStart = _a.vertical; // test vertical


    var topBoundInfo = checkLineBoundCollision(line, lineConstants, topLine, isVerticalStart, 1, true);
    var bottomBoundInfo = checkLineBoundCollision(line, lineConstants, bottomLine, isVerticalStart, 1, true); // test horizontal

    var leftBoundInfo = checkLineBoundCollision(line, lineConstants, leftLine, isHorizontalStart, 1, true);
    var rightBoundInfo = checkLineBoundCollision(line, lineConstants, rightLine, isHorizontalStart, 1, true);

    if (topBoundInfo.isBound && !boundMap.top) {
      horizontalPoses.push(top);
      boundMap.top = true;
    }

    if (bottomBoundInfo.isBound && !boundMap.bottom) {
      horizontalPoses.push(top + height);
      boundMap.bottom = true;
    }

    if (leftBoundInfo.isBound && !boundMap.left) {
      verticalPoses.push(left);
      boundMap.left = true;
    }

    if (rightBoundInfo.isBound && !boundMap.right) {
      verticalPoses.push(left + width);
      boundMap.right = true;
    }
  });
  return {
    horizontal: horizontalPoses,
    vertical: verticalPoses
  };
}

function checkBoundPoses(bounds, verticalPoses, horizontalPoses) {
  var _a = bounds || {},
      _b = _a.position,
      position = _b === void 0 ? "client" : _b,
      _c = _a.left,
      left = _c === void 0 ? -Infinity : _c,
      _d = _a.top,
      top = _d === void 0 ? -Infinity : _d,
      _e = _a.right,
      right = _e === void 0 ? Infinity : _e,
      _f = _a.bottom,
      bottom = _f === void 0 ? Infinity : _f;

  var nextBounds = {
    position: position,
    left: left,
    top: top,
    right: right,
    bottom: bottom
  };
  return {
    vertical: checkBounds(nextBounds, verticalPoses, true),
    horizontal: checkBounds(nextBounds, horizontalPoses, false)
  };
}

function getBounds(moveable, externalBounds) {
  var _a = moveable.state,
      _b = _a.containerClientRect,
      containerHeight = _b.clientHeight,
      containerWidth = _b.clientWidth,
      clientLeft = _b.clientLeft,
      clientTop = _b.clientTop,
      _c = _a.snapOffset,
      snapOffsetLeft = _c.left,
      snapOffsetTop = _c.top,
      snapOffsetRight = _c.right,
      snapOffsetBottom = _c.bottom;
  var bounds = externalBounds || moveable.props.bounds || {};
  var position = bounds.position || "client";
  var isCSS = position === "css";
  var _d = bounds.left,
      left = _d === void 0 ? -Infinity : _d,
      _e = bounds.top,
      top = _e === void 0 ? -Infinity : _e;
  var _f = bounds.right,
      right = _f === void 0 ? isCSS ? -Infinity : Infinity : _f,
      _g = bounds.bottom,
      bottom = _g === void 0 ? isCSS ? -Infinity : Infinity : _g;

  if (isCSS) {
    right = containerWidth + snapOffsetRight - snapOffsetLeft - right;
    bottom = containerHeight + snapOffsetBottom - snapOffsetTop - bottom;
  }

  return {
    left: left + snapOffsetLeft - clientLeft,
    right: right + snapOffsetLeft - clientLeft,
    top: top + snapOffsetTop - clientTop,
    bottom: bottom + snapOffsetTop - clientTop
  };
}

function checkBoundKeepRatio(moveable, startPos, endPos) {
  var _a = getBounds(moveable),
      left = _a.left,
      top = _a.top,
      right = _a.right,
      bottom = _a.bottom;

  var endX = endPos[0],
      endY = endPos[1];

  var _b = minus(endPos, startPos),
      dx = _b[0],
      dy = _b[1];

  if (Math.abs(dx) < TINY_NUM) {
    dx = 0;
  }

  if (Math.abs(dy) < TINY_NUM) {
    dy = 0;
  }

  var isBottom = dy > 0;
  var isRight = dx > 0;
  var verticalInfo = {
    isBound: false,
    offset: 0,
    pos: 0
  };
  var horizontalInfo = {
    isBound: false,
    offset: 0,
    pos: 0
  };

  if (dx === 0 && dy === 0) {
    return {
      vertical: verticalInfo,
      horizontal: horizontalInfo
    };
  } else if (dx === 0) {
    if (isBottom) {
      if (bottom < endY) {
        horizontalInfo.pos = bottom;
        horizontalInfo.offset = endY - bottom;
      }
    } else {
      if (top > endY) {
        horizontalInfo.pos = top;
        horizontalInfo.offset = endY - top;
      }
    }
  } else if (dy === 0) {
    if (isRight) {
      if (right < endX) {
        verticalInfo.pos = right;
        verticalInfo.offset = endX - right;
      }
    } else {
      if (left > endX) {
        verticalInfo.pos = left;
        verticalInfo.offset = endX - left;
      }
    }
  } else {
    // y - y1 = a * (x - x1)
    var a = dy / dx;
    var b = endPos[1] - a * endX;
    var y = 0;
    var x = 0;
    var isBound = false;

    if (isRight && right <= endX) {
      y = a * right + b;
      x = right;
      isBound = true;
    } else if (!isRight && endX <= left) {
      y = a * left + b;
      x = left;
      isBound = true;
    }

    if (isBound) {
      if (y < top || y > bottom) {
        isBound = false;
      }
    }

    if (!isBound) {
      if (isBottom && bottom <= endY) {
        y = bottom;
        x = (y - b) / a;
        isBound = true;
      } else if (!isBottom && endY <= top) {
        y = top;
        x = (y - b) / a;
        isBound = true;
      }
    }

    if (isBound) {
      verticalInfo.isBound = true;
      verticalInfo.pos = x;
      verticalInfo.offset = endX - x;
      horizontalInfo.isBound = true;
      horizontalInfo.pos = y;
      horizontalInfo.offset = endY - y;
    }
  }

  return {
    vertical: verticalInfo,
    horizontal: horizontalInfo
  };
}

function checkBounds(bounds, poses, isVertical) {
  // 0   [100 - 200]  300
  var startBoundPos = bounds[isVertical ? "left" : "top"];
  var endBoundPos = bounds[isVertical ? "right" : "bottom"]; // 450

  var minPos = Math.min.apply(Math, poses);
  var maxPos = Math.max.apply(Math, poses);
  var boundInfos = [];

  if (startBoundPos + 1 > minPos) {
    boundInfos.push({
      isBound: true,
      offset: minPos - startBoundPos,
      pos: startBoundPos
    });
  }

  if (endBoundPos - 1 < maxPos) {
    boundInfos.push({
      isBound: true,
      offset: maxPos - endBoundPos,
      pos: endBoundPos
    });
  }

  if (!boundInfos.length) {
    boundInfos.push({
      isBound: false,
      offset: 0,
      pos: 0
    });
  }

  return boundInfos.sort(function (a, b) {
    return Math.abs(b.offset) - Math.abs(a.offset);
  });
}

function isBoundRotate(relativePoses, boundRect, rad) {
  var nextPoses = rad ? relativePoses.map(function (pos) {
    return rotate(pos, rad);
  }) : relativePoses;
  return nextPoses.some(function (pos) {
    return pos[0] < boundRect.left && Math.abs(pos[0] - boundRect.left) > 0.1 || pos[0] > boundRect.right && Math.abs(pos[0] - boundRect.right) > 0.1 || pos[1] < boundRect.top && Math.abs(pos[1] - boundRect.top) > 0.1 || pos[1] > boundRect.bottom && Math.abs(pos[1] - boundRect.bottom) > 0.1;
  });
}

function boundRotate(vec, boundPos, index) {
  var r = getDistSize(vec);
  var nextPos = Math.sqrt(r * r - boundPos * boundPos) || 0;
  return [nextPos, -nextPos].sort(function (a, b) {
    return Math.abs(a - vec[index ? 0 : 1]) - Math.abs(b - vec[index ? 0 : 1]);
  }).map(function (pos) {
    return getRad([0, 0], index ? [pos, boundPos] : [boundPos, pos]);
  });
}

function checkRotateBounds(moveable, prevPoses, nextPoses, origin, rotation) {
  if (!moveable.props.bounds) {
    return [];
  }

  var rad = rotation * Math.PI / 180;

  var _a = getBounds(moveable),
      left = _a.left,
      top = _a.top,
      right = _a.right,
      bottom = _a.bottom;

  var relativeLeft = left - origin[0];
  var relativeRight = right - origin[0];
  var relativeTop = top - origin[1];
  var relativeBottom = bottom - origin[1];
  var boundRect = {
    left: relativeLeft,
    top: relativeTop,
    right: relativeRight,
    bottom: relativeBottom
  };

  if (!isBoundRotate(nextPoses, boundRect, 0)) {
    return [];
  }

  var result = [];
  [[relativeLeft, 0], [relativeRight, 0], [relativeTop, 1], [relativeBottom, 1]].forEach(function (_a) {
    var boundPos = _a[0],
        index = _a[1];
    nextPoses.forEach(function (nextPos) {
      var relativeRad1 = getRad([0, 0], nextPos);
      result.push.apply(result, boundRotate(nextPos, boundPos, index).map(function (relativeRad2) {
        return rad + relativeRad2 - relativeRad1;
      }).filter(function (nextRad) {
        return !isBoundRotate(prevPoses, boundRect, nextRad);
      }).map(function (nextRad) {
        return throttle(nextRad * 180 / Math.PI, TINY_NUM);
      }));
    });
  });
  return result;
}

function renderGuideline(info, React) {
  var _a;

  var direction = info.direction,
      classNames = info.classNames,
      size = info.size,
      pos = info.pos,
      zoom = info.zoom,
      key = info.key;
  var isHorizontal = direction === "horizontal";
  var scaleType = isHorizontal ? "Y" : "X"; // const scaleType2 = isHorizontal ? "Y" : "X";

  return React.createElement("div", {
    key: key,
    className: classNames.join(" "),
    style: (_a = {}, _a[isHorizontal ? "width" : "height"] = "".concat(size), _a.transform = "translate(".concat(pos[0], ", ").concat(pos[1], ") translate").concat(scaleType, "(-50%) scale").concat(scaleType, "(").concat(zoom, ")"), _a)
  });
}

function renderInnerGuideline(info, React) {
  return renderGuideline(__assign(__assign({}, info), {
    classNames: __spreadArray([prefix("line", "guideline", info.direction)], info.classNames, true).filter(function (className) {
      return className;
    }),
    size: info.size || "".concat(info.sizeValue, "px"),
    pos: info.pos || info.posValue.map(function (v) {
      return "".concat(throttle(v, 0.1), "px");
    })
  }), React);
}

function renderSnapPoses(moveable, direction, snapPoses, minPos, targetPos, size, index, React) {
  var zoom = moveable.props.zoom;
  return snapPoses.map(function (_a, i) {
    var type = _a.type,
        pos = _a.pos;
    var renderPos = [0, 0];
    renderPos[index] = minPos;
    renderPos[index ? 0 : 1] = -targetPos + pos;
    return renderInnerGuideline({
      key: "".concat(direction, "TargetGuideline").concat(i),
      classNames: [prefix("target", "bold", type)],
      posValue: renderPos,
      sizeValue: size,
      zoom: zoom,
      direction: direction
    }, React);
  });
}

function renderGuidelines(moveable, type, guidelines, targetPos, targetRect, React) {
  var _a = moveable.props,
      zoom = _a.zoom,
      isDisplayInnerSnapDigit = _a.isDisplayInnerSnapDigit;
  var mainNames = type === "horizontal" ? VERTICAL_NAMES_MAP : HORIZONTAL_NAMES_MAP;
  var targetStart = targetRect[mainNames.start];
  var targetEnd = targetRect[mainNames.end];
  return guidelines.filter(function (_a) {
    var hide = _a.hide,
        elementRect = _a.elementRect;

    if (hide) {
      return false;
    }

    if (isDisplayInnerSnapDigit && elementRect) {
      // inner
      var rect = elementRect.rect;

      if (rect[mainNames.start] <= targetStart && targetEnd <= rect[mainNames.end]) {
        return false;
      }
    }

    return true;
  }).map(function (guideline, i) {
    var pos = guideline.pos,
        size = guideline.size,
        element = guideline.element,
        className = guideline.className;
    var renderPos = [-targetPos[0] + pos[0], -targetPos[1] + pos[1]];
    return renderInnerGuideline({
      key: "".concat(type, "-default-guideline-").concat(i),
      classNames: element ? [prefix("bold"), className] : [prefix("normal"), className],
      direction: type,
      posValue: renderPos,
      sizeValue: size,
      zoom: zoom
    }, React);
  });
}

function renderDigitLine(moveable, type, lineType, index, gap, renderPos, className, React) {
  var _a;

  var _b = moveable.props,
      _c = _b.snapDigit,
      snapDigit = _c === void 0 ? 0 : _c,
      _d = _b.isDisplaySnapDigit,
      isDisplaySnapDigit = _d === void 0 ? true : _d,
      _e = _b.snapDistFormat,
      snapDistFormat = _e === void 0 ? function (v, type) {
    // Type can be used render different values.
    if (type === 'vertical') {
      return v;
    }

    return v;
  } : _e,
      zoom = _b.zoom;
  var scaleType = type === "horizontal" ? "X" : "Y";
  var sizeName = type === "vertical" ? "height" : "width";
  var absGap = Math.abs(gap);
  var snapSize = isDisplaySnapDigit ? parseFloat(absGap.toFixed(snapDigit)) : 0;
  return React.createElement("div", {
    key: "".concat(type, "-").concat(lineType, "-guideline-").concat(index),
    className: prefix("guideline-group", type),
    style: (_a = {
      left: "".concat(renderPos[0], "px"),
      top: "".concat(renderPos[1], "px")
    }, _a[sizeName] = "".concat(absGap, "px"), _a)
  }, renderInnerGuideline({
    direction: type,
    classNames: [prefix(lineType), className],
    size: "100%",
    posValue: [0, 0],
    sizeValue: absGap,
    zoom: zoom
  }, React), React.createElement("div", {
    className: prefix("size-value", "gap"),
    style: {
      transform: "translate".concat(scaleType, "(-50%) scale(").concat(zoom, ")")
    }
  }, snapSize > 0 ? snapDistFormat(snapSize, type) : ""));
}

function groupByElementGuidelines(type, guidelines, targetRect, isDisplayInnerSnapDigit) {
  var index = type === "vertical" ? 0 : 1;
  var otherIndex = type === "vertical" ? 1 : 0;
  var names = index ? VERTICAL_NAMES_MAP : HORIZONTAL_NAMES_MAP;
  var targetStart = targetRect[names.start];
  var targetEnd = targetRect[names.end];
  return groupBy(guidelines, function (guideline) {
    return guideline.pos[index];
  }).map(function (nextGuidelines) {
    var start = [];
    var end = [];
    var inner = [];
    nextGuidelines.forEach(function (guideline) {
      var _a, _b;

      var element = guideline.element;
      var rect = guideline.elementRect.rect;

      if (rect[names.end] < targetStart) {
        start.push(guideline);
      } else if (targetEnd < rect[names.start]) {
        end.push(guideline);
      } else if (rect[names.start] <= targetStart && targetEnd <= rect[names.end] && isDisplayInnerSnapDigit) {
        var pos = guideline.pos;
        var elementRect1 = {
          element: element,
          rect: __assign(__assign({}, rect), (_a = {}, _a[names.end] = rect[names.start], _a))
        };
        var elementRect2 = {
          element: element,
          rect: __assign(__assign({}, rect), (_b = {}, _b[names.start] = rect[names.end], _b))
        };
        var nextPos1 = [0, 0];
        var nextPos2 = [0, 0];
        nextPos1[index] = pos[index];
        nextPos1[otherIndex] = pos[otherIndex];
        nextPos2[index] = pos[index];
        nextPos2[otherIndex] = pos[otherIndex] + guideline.size;
        start.push({
          type: type,
          pos: nextPos1,
          size: 0,
          elementRect: elementRect1
        });
        end.push({
          type: type,
          pos: nextPos2,
          size: 0,
          elementRect: elementRect2
        }); // inner.push(guideline);
      }
    });
    start.sort(function (a, b) {
      return b.pos[otherIndex] - a.pos[otherIndex];
    });
    end.sort(function (a, b) {
      return a.pos[otherIndex] - b.pos[otherIndex];
    });
    return {
      total: nextGuidelines,
      start: start,
      end: end,
      inner: inner
    };
  });
}

function renderDashedGuidelines(moveable, guidelines, targetPos, targetRect, React) {
  var isDisplayInnerSnapDigit = moveable.props.isDisplayInnerSnapDigit;
  var rendered = [];
  ["vertical", "horizontal"].forEach(function (type) {
    var nextGuidelines = guidelines.filter(function (guideline) {
      return guideline.type === type;
    });
    var index = type === "vertical" ? 1 : 0;
    var otherIndex = index ? 0 : 1;
    var groups = groupByElementGuidelines(type, nextGuidelines, targetRect, isDisplayInnerSnapDigit);
    var mainNames = index ? HORIZONTAL_NAMES_MAP : VERTICAL_NAMES_MAP;
    var sideNames = index ? VERTICAL_NAMES_MAP : HORIZONTAL_NAMES_MAP;
    var targetStart = targetRect[mainNames.start];
    var targetEnd = targetRect[mainNames.end];
    groups.forEach(function (_a) {
      var total = _a.total,
          start = _a.start,
          end = _a.end,
          inner = _a.inner;
      var sidePos = targetPos[otherIndex] + total[0].pos[otherIndex] - targetRect[sideNames.start];
      var prevRect = targetRect;
      start.forEach(function (guideline) {
        var nextRect = guideline.elementRect.rect;
        var size = prevRect[mainNames.start] - nextRect[mainNames.end];

        if (size > 0) {
          var renderPos = [0, 0];
          renderPos[index] = targetPos[index] + prevRect[mainNames.start] - targetStart - size;
          renderPos[otherIndex] = sidePos;
          rendered.push(renderDigitLine(moveable, type, "dashed", rendered.length, size, renderPos, guideline.className, React));
        }

        prevRect = nextRect;
      });
      prevRect = targetRect;
      end.forEach(function (guideline) {
        var nextRect = guideline.elementRect.rect;
        var size = nextRect[mainNames.start] - prevRect[mainNames.end];

        if (size > 0) {
          var renderPos = [0, 0];
          renderPos[index] = targetPos[index] + prevRect[mainNames.end] - targetStart;
          renderPos[otherIndex] = sidePos;
          rendered.push(renderDigitLine(moveable, type, "dashed", rendered.length, size, renderPos, guideline.className, React));
        }

        prevRect = nextRect;
      });
      inner.forEach(function (guideline) {
        var nextRect = guideline.elementRect.rect;
        var size1 = targetStart - nextRect[mainNames.start];
        var size2 = nextRect[mainNames.end] - targetEnd;
        var renderPos1 = [0, 0];
        var renderPos2 = [0, 0];
        renderPos1[index] = targetPos[index] - size1;
        renderPos1[otherIndex] = sidePos;
        renderPos2[index] = targetPos[index] + targetEnd - targetStart;
        renderPos2[otherIndex] = sidePos;
        rendered.push(renderDigitLine(moveable, type, "dashed", rendered.length, size1, renderPos1, guideline.className, React));
        rendered.push(renderDigitLine(moveable, type, "dashed", rendered.length, size2, renderPos2, guideline.className, React));
      });
    });
  });
  return rendered;
}

function renderGapGuidelines(moveable, guidelines, targetPos, targetRect, React) {
  var rendered = [];
  ["horizontal", "vertical"].forEach(function (type) {
    var nextGuidelines = guidelines.filter(function (guideline) {
      return guideline.type === type;
    }).slice(0, 1);
    var index = type === "vertical" ? 0 : 1;
    var otherIndex = index ? 0 : 1;
    var mainNames = index ? HORIZONTAL_NAMES_MAP : VERTICAL_NAMES_MAP;
    var sideNames = index ? VERTICAL_NAMES_MAP : HORIZONTAL_NAMES_MAP;
    var targetStart = targetRect[mainNames.start];
    var targetEnd = targetRect[mainNames.end];
    var targetSideStart = targetRect[sideNames.start];
    var targetSideEnd = targetRect[sideNames.end];
    nextGuidelines.forEach(function (_a) {
      var gap = _a.gap,
          gapRects = _a.gapRects;
      var sideStartPos = Math.max.apply(Math, __spreadArray([targetSideStart], gapRects.map(function (_a) {
        var rect = _a.rect;
        return rect[sideNames.start];
      }), false));
      var sideEndPos = Math.min.apply(Math, __spreadArray([targetSideEnd], gapRects.map(function (_a) {
        var rect = _a.rect;
        return rect[sideNames.end];
      }), false));
      var sideCenterPos = (sideStartPos + sideEndPos) / 2;

      if (sideStartPos === sideEndPos || sideCenterPos === (targetSideStart + targetSideEnd) / 2) {
        return;
      }

      gapRects.forEach(function (_a) {
        var rect = _a.rect,
            className = _a.className;
        var renderPos = [targetPos[0], targetPos[1]];

        if (rect[mainNames.end] < targetStart) {
          renderPos[index] += rect[mainNames.end] - targetStart;
        } else if (targetEnd < rect[mainNames.start]) {
          renderPos[index] += rect[mainNames.start] - targetStart - gap;
        } else {
          return;
        }

        renderPos[otherIndex] += sideCenterPos - targetSideStart;
        rendered.push(renderDigitLine(moveable, index ? "vertical" : "horizontal", "gap", rendered.length, gap, renderPos, className, React));
      });
    });
  });
  return rendered;
}

function solveEquation(pos1, pos2, snapOffset, isVertical) {
  var dx = pos2[0] - pos1[0];
  var dy = pos2[1] - pos1[1];

  if (Math.abs(dx) < TINY_NUM$1) {
    dx = 0;
  }

  if (Math.abs(dy) < TINY_NUM$1) {
    dy = 0;
  }

  if (!dx) {
    // y = 0 * x + b
    // only horizontal
    if (!isVertical) {
      return [0, snapOffset];
    }

    return [0, 0];
  }

  if (!dy) {
    // only vertical
    if (isVertical) {
      return [snapOffset, 0];
    }

    return [0, 0];
  } // y = ax + b


  var a = dy / dx;
  var b = pos1[1] - a * pos1[0];

  if (isVertical) {
    // y = a * x + b
    var y = a * (pos2[0] + snapOffset) + b;
    return [snapOffset, y - pos2[1]];
  } else {
    // x = (y - b) / a
    var x = (pos2[1] + snapOffset - b) / a;
    return [x - pos2[0], snapOffset];
  }
}

function solveNextOffset(pos1, pos2, offset, isVertical, datas) {
  var sizeOffset = solveEquation(pos1, pos2, offset, isVertical);

  if (!sizeOffset) {
    return {
      isOutside: false,
      offset: [0, 0]
    };
  }

  var size = getDist$1(pos1, pos2);
  var dist1 = getDist$1(sizeOffset, pos1);
  var dist2 = getDist$1(sizeOffset, pos2);
  var isOutside = dist1 > size || dist2 > size;

  var _a = getDragDist({
    datas: datas,
    distX: sizeOffset[0],
    distY: sizeOffset[1]
  }),
      widthOffset = _a[0],
      heightOffset = _a[1];

  return {
    offset: [widthOffset, heightOffset],
    isOutside: isOutside
  };
}

function getSnapBound(boundInfo, snapInfo) {
  if (boundInfo.isBound) {
    return boundInfo.offset;
  } else if (snapInfo.isSnap) {
    return getNearestSnapGuidelineInfo(snapInfo).offset;
  }

  return 0;
}

function checkThrottleDragRotate(throttleDragRotate, _a, _b, _c, _d) {
  var distX = _a[0],
      distY = _a[1];
  var isVerticalBound = _b[0],
      isHorizontalBound = _b[1];
  var isVerticalSnap = _c[0],
      isHorizontalSnap = _c[1];
  var verticalOffset = _d[0],
      horizontalOffset = _d[1];
  var offsetX = -verticalOffset;
  var offsetY = -horizontalOffset;

  if (throttleDragRotate && distX && distY) {
    offsetX = 0;
    offsetY = 0;
    var adjustPoses = [];

    if (isVerticalBound && isHorizontalBound) {
      adjustPoses.push([0, horizontalOffset], [verticalOffset, 0]);
    } else if (isVerticalBound) {
      adjustPoses.push([verticalOffset, 0]);
    } else if (isHorizontalBound) {
      adjustPoses.push([0, horizontalOffset]);
    } else if (isVerticalSnap && isHorizontalSnap) {
      adjustPoses.push([0, horizontalOffset], [verticalOffset, 0]);
    } else if (isVerticalSnap) {
      adjustPoses.push([verticalOffset, 0]);
    } else if (isHorizontalSnap) {
      adjustPoses.push([0, horizontalOffset]);
    }

    if (adjustPoses.length) {
      adjustPoses.sort(function (a, b) {
        return getDistSize(minus([distX, distY], a)) - getDistSize(minus([distX, distY], b));
      });
      var adjustPos = adjustPoses[0];

      if (adjustPos[0] && Math.abs(distX) > TINY_NUM$1) {
        offsetX = -adjustPos[0];
        offsetY = distY * Math.abs(distX + offsetX) / Math.abs(distX) - distY;
      } else if (adjustPos[1] && Math.abs(distY) > TINY_NUM$1) {
        var prevDistY = distY;
        offsetY = -adjustPos[1];
        offsetX = distX * Math.abs(distY + offsetY) / Math.abs(prevDistY) - distX;
      }

      if (throttleDragRotate && isHorizontalBound && isVerticalBound) {
        if (Math.abs(offsetX) > TINY_NUM$1 && Math.abs(offsetX) < Math.abs(verticalOffset)) {
          var scale = Math.abs(verticalOffset) / Math.abs(offsetX);
          offsetX *= scale;
          offsetY *= scale;
        } else if (Math.abs(offsetY) > TINY_NUM$1 && Math.abs(offsetY) < Math.abs(horizontalOffset)) {
          var scale = Math.abs(horizontalOffset) / Math.abs(offsetY);
          offsetX *= scale;
          offsetY *= scale;
        } else {
          offsetX = maxOffset(-verticalOffset, offsetX);
          offsetY = maxOffset(-horizontalOffset, offsetY);
        }
      }
    }
  } else {
    offsetX = distX || isVerticalBound ? -verticalOffset : 0;
    offsetY = distY || isHorizontalBound ? -horizontalOffset : 0;
  }

  return [offsetX, offsetY];
}

function checkSnapBoundsDrag(moveable, distX, distY, throttleDragRotate, isRequest, datas) {
  if (!hasGuidelines(moveable, "draggable")) {
    return [{
      isSnap: false,
      isBound: false,
      offset: 0
    }, {
      isSnap: false,
      isBound: false,
      offset: 0
    }];
  }

  var poses = getAbsolutePoses(datas.absolutePoses, [distX, distY]);

  var _a = getRect(poses),
      left = _a.left,
      right = _a.right,
      top = _a.top,
      bottom = _a.bottom;

  var boundPoses = {
    horizontal: poses.map(function (pos) {
      return pos[1];
    }),
    vertical: poses.map(function (pos) {
      return pos[0];
    })
  };
  var snapDirections = getSnapDirections(moveable.props.snapDirections);
  var snapPoses = splitSnapDirectionPoses(snapDirections, {
    left: left,
    right: right,
    top: top,
    bottom: bottom,
    center: (left + right) / 2,
    middle: (top + bottom) / 2
  });

  var _b = checkMoveableSnapBounds(moveable, isRequest, snapPoses, boundPoses),
      verticalSnapBoundInfo = _b.vertical,
      horizontalSnapBoundInfo = _b.horizontal;

  var _c = getInnerBoundDragInfo(moveable, poses, datas),
      verticalInnerBoundInfo = _c.vertical,
      horizontalInnerBoundInfo = _c.horizontal;

  var isVerticalSnap = verticalSnapBoundInfo.isSnap;
  var isHorizontalSnap = horizontalSnapBoundInfo.isSnap;
  var isVerticalBound = verticalSnapBoundInfo.isBound || verticalInnerBoundInfo.isBound;
  var isHorizontalBound = horizontalSnapBoundInfo.isBound || horizontalInnerBoundInfo.isBound;
  var verticalOffset = maxOffset(verticalSnapBoundInfo.offset, verticalInnerBoundInfo.offset);
  var horizontalOffset = maxOffset(horizontalSnapBoundInfo.offset, horizontalInnerBoundInfo.offset);

  var _d = checkThrottleDragRotate(throttleDragRotate, [distX, distY], [isVerticalBound, isHorizontalBound], [isVerticalSnap, isHorizontalSnap], [verticalOffset, horizontalOffset]),
      offsetX = _d[0],
      offsetY = _d[1];

  return [{
    isBound: isVerticalBound,
    isSnap: isVerticalSnap,
    offset: offsetX
  }, {
    isBound: isHorizontalBound,
    isSnap: isHorizontalSnap,
    offset: offsetY
  }];
}

function checkMoveableSnapBounds(moveable, isRequest, poses, boundPoses) {
  if (boundPoses === void 0) {
    boundPoses = poses;
  }

  var _a = checkBoundPoses(getBounds(moveable), boundPoses.vertical, boundPoses.horizontal),
      horizontalBoundInfos = _a.horizontal,
      verticalBoundInfos = _a.vertical;

  var _b = isRequest ? {
    horizontal: {
      isSnap: false,
      index: -1
    },
    vertical: {
      isSnap: false,
      index: -1
    }
  } : checkMoveableSnapPoses(moveable, poses.vertical, poses.horizontal),
      horizontalSnapInfo = _b.horizontal,
      verticalSnapInfo = _b.vertical;

  var horizontalOffset = getSnapBound(horizontalBoundInfos[0], horizontalSnapInfo);
  var verticalOffset = getSnapBound(verticalBoundInfos[0], verticalSnapInfo);
  var horizontalDist = Math.abs(horizontalOffset);
  var verticalDist = Math.abs(verticalOffset);
  return {
    horizontal: {
      isBound: horizontalBoundInfos[0].isBound,
      isSnap: horizontalSnapInfo.isSnap,
      snapIndex: horizontalSnapInfo.index,
      offset: horizontalOffset,
      dist: horizontalDist,
      bounds: horizontalBoundInfos,
      snap: horizontalSnapInfo
    },
    vertical: {
      isBound: verticalBoundInfos[0].isBound,
      isSnap: verticalSnapInfo.isSnap,
      snapIndex: verticalSnapInfo.index,
      offset: verticalOffset,
      dist: verticalDist,
      bounds: verticalBoundInfos,
      snap: verticalSnapInfo
    }
  };
}

function checkSnapBounds(guideines, bounds, posesX, posesY, snapThreshold) {
  var _a = checkBoundPoses(bounds, posesX, posesY),
      horizontalBoundInfos = _a.horizontal,
      verticalBoundInfos = _a.vertical; // options.isRequest ? {
  //     horizontal: { isSnap: false, index: -1 } as SnapInfo,
  //     vertical: { isSnap: false, index: -1 } as SnapInfo,
  // } :


  var _b = checkSnapPoses(guideines, posesX, posesY, snapThreshold),
      horizontalSnapInfo = _b.horizontal,
      verticalSnapInfo = _b.vertical;

  var horizontalOffset = getSnapBound(horizontalBoundInfos[0], horizontalSnapInfo);
  var verticalOffset = getSnapBound(verticalBoundInfos[0], verticalSnapInfo);
  var horizontalDist = Math.abs(horizontalOffset);
  var verticalDist = Math.abs(verticalOffset);
  return {
    horizontal: {
      isBound: horizontalBoundInfos[0].isBound,
      isSnap: horizontalSnapInfo.isSnap,
      snapIndex: horizontalSnapInfo.index,
      offset: horizontalOffset,
      dist: horizontalDist,
      bounds: horizontalBoundInfos,
      snap: horizontalSnapInfo
    },
    vertical: {
      isBound: verticalBoundInfos[0].isBound,
      isSnap: verticalSnapInfo.isSnap,
      snapIndex: verticalSnapInfo.index,
      offset: verticalOffset,
      dist: verticalDist,
      bounds: verticalBoundInfos,
      snap: verticalSnapInfo
    }
  };
}

function checkSnapRightLine(startPos, endPos, snapBoundInfo, keepRatio) {
  var rad = getRad(startPos, endPos) / Math.PI * 180;
  var _a = snapBoundInfo.vertical,
      isVerticalBound = _a.isBound,
      isVerticalSnap = _a.isSnap,
      verticalDist = _a.dist,
      _b = snapBoundInfo.horizontal,
      isHorizontalBound = _b.isBound,
      isHorizontalSnap = _b.isSnap,
      horizontalDist = _b.dist;
  var rad180 = rad % 180;
  var isHorizontalLine = rad180 < 3 || rad180 > 177;
  var isVerticalLine = rad180 > 87 && rad180 < 93;

  if (horizontalDist < verticalDist) {
    if (isVerticalBound || isVerticalSnap && !isVerticalLine && (!keepRatio || !isHorizontalLine)) {
      return "vertical";
    }
  }

  if (isHorizontalBound || isHorizontalSnap && !isHorizontalLine && (!keepRatio || !isVerticalLine)) {
    return "horizontal";
  }

  return "";
}

function getSnapBoundInfo(moveable, poses, directions, keepRatio, isRequest, datas) {
  return directions.map(function (_a) {
    var startDirection = _a[0],
        endDirection = _a[1];
    var otherStartPos = getPosByDirection(poses, startDirection);
    var otherEndPos = getPosByDirection(poses, endDirection);
    var snapBoundInfo = keepRatio ? checkSnapBoundsKeepRatio(moveable, otherStartPos, otherEndPos, isRequest) : checkMoveableSnapBounds(moveable, isRequest, {
      vertical: [otherEndPos[0]],
      horizontal: [otherEndPos[1]]
    });
    var _b = snapBoundInfo.horizontal,
        // dist: otherHorizontalDist,
    otherHorizontalOffset = _b.offset,
        isOtherHorizontalBound = _b.isBound,
        isOtherHorizontalSnap = _b.isSnap,
        _c = snapBoundInfo.vertical,
        // dist: otherVerticalDist,
    otherVerticalOffset = _c.offset,
        isOtherVerticalBound = _c.isBound,
        isOtherVerticalSnap = _c.isSnap;
    var multiple = minus(endDirection, startDirection);

    if (!otherVerticalOffset && !otherHorizontalOffset) {
      return {
        isBound: isOtherVerticalBound || isOtherHorizontalBound,
        isSnap: isOtherVerticalSnap || isOtherHorizontalSnap,
        sign: multiple,
        offset: [0, 0]
      };
    }

    var snapLine = checkSnapRightLine(otherStartPos, otherEndPos, snapBoundInfo, keepRatio);

    if (!snapLine) {
      return {
        sign: multiple,
        isBound: false,
        isSnap: false,
        offset: [0, 0]
      };
    }

    var isVertical = snapLine === "vertical";
    var sizeOffset = [0, 0];

    if (!keepRatio && Math.abs(endDirection[0]) === 1 && Math.abs(endDirection[1]) === 1 && startDirection[0] !== endDirection[0] && startDirection[1] !== endDirection[1]) {
      sizeOffset = getDragDist({
        datas: datas,
        distX: -otherVerticalOffset,
        distY: -otherHorizontalOffset
      });
    } else {
      sizeOffset = solveNextOffset(otherStartPos, otherEndPos, -(isVertical ? otherVerticalOffset : otherHorizontalOffset), isVertical, datas).offset;
    }

    sizeOffset = sizeOffset.map(function (size, i) {
      return size * (multiple[i] ? 2 / multiple[i] : 0);
    });
    return {
      sign: multiple,
      isBound: isVertical ? isOtherVerticalBound : isOtherHorizontalBound,
      isSnap: isVertical ? isOtherVerticalSnap : isOtherHorizontalSnap,
      offset: sizeOffset
    };
  });
}

function getSnapBoundOffset(boundInfo, snapInfo) {
  if (boundInfo.isBound) {
    return boundInfo.offset;
  } else if (snapInfo.isSnap) {
    return snapInfo.offset;
  }

  return 0;
}

function checkSnapBoundsKeepRatio(moveable, startPos, endPos, isRequest) {
  var _a = checkBoundKeepRatio(moveable, startPos, endPos),
      horizontalBoundInfo = _a.horizontal,
      verticalBoundInfo = _a.vertical;

  var _b = isRequest ? {
    horizontal: {
      isSnap: false
    },
    vertical: {
      isSnap: false
    }
  } : checkSnapKeepRatio(moveable, startPos, endPos),
      horizontalSnapInfo = _b.horizontal,
      verticalSnapInfo = _b.vertical;

  var horizontalOffset = getSnapBoundOffset(horizontalBoundInfo, horizontalSnapInfo);
  var verticalOffset = getSnapBoundOffset(verticalBoundInfo, verticalSnapInfo);
  var horizontalDist = Math.abs(horizontalOffset);
  var verticalDist = Math.abs(verticalOffset);
  return {
    horizontal: {
      isBound: horizontalBoundInfo.isBound,
      isSnap: horizontalSnapInfo.isSnap,
      offset: horizontalOffset,
      dist: horizontalDist
    },
    vertical: {
      isBound: verticalBoundInfo.isBound,
      isSnap: verticalSnapInfo.isSnap,
      offset: verticalOffset,
      dist: verticalDist
    }
  };
}

function checkMaxBounds(moveable, poses, direction, fixedPosition, datas) {
  var fixedDirection = [-direction[0], -direction[1]];
  var _a = moveable.state,
      width = _a.width,
      height = _a.height;
  var bounds = moveable.props.bounds;
  var maxWidth = Infinity;
  var maxHeight = Infinity;

  if (bounds) {
    var directions = [[direction[0], -direction[1]], [-direction[0], direction[1]]];
    var _b = bounds.left,
        left_1 = _b === void 0 ? -Infinity : _b,
        _c = bounds.top,
        top_1 = _c === void 0 ? -Infinity : _c,
        _d = bounds.right,
        right_1 = _d === void 0 ? Infinity : _d,
        _e = bounds.bottom,
        bottom_1 = _e === void 0 ? Infinity : _e;
    directions.forEach(function (otherDirection) {
      var isCheckVertical = otherDirection[0] !== fixedDirection[0];
      var isCheckHorizontal = otherDirection[1] !== fixedDirection[1];
      var otherPos = getPosByDirection(poses, otherDirection);
      var deg = getRad(fixedPosition, otherPos) * 360 / Math.PI;

      if (isCheckHorizontal) {
        var nextOtherPos = otherPos.slice();

        if (Math.abs(deg - 360) < 2 || Math.abs(deg - 180) < 2) {
          nextOtherPos[1] = fixedPosition[1];
        }

        var _a = solveNextOffset(fixedPosition, nextOtherPos, (fixedPosition[1] < otherPos[1] ? bottom_1 : top_1) - otherPos[1], false, datas),
            _b = _a.offset,
            heightOffset = _b[1],
            isHeightOutside = _a.isOutside;

        if (!isNaN(heightOffset)) {
          maxHeight = height + (isHeightOutside ? 1 : -1) * Math.abs(heightOffset);
        }
      }

      if (isCheckVertical) {
        var nextOtherPos = otherPos.slice();

        if (Math.abs(deg - 90) < 2 || Math.abs(deg - 270) < 2) {
          nextOtherPos[0] = fixedPosition[0];
        }

        var _c = solveNextOffset(fixedPosition, nextOtherPos, (fixedPosition[0] < otherPos[0] ? right_1 : left_1) - otherPos[0], true, datas),
            widthOffset = _c.offset[0],
            isWidthOutside = _c.isOutside;

        if (!isNaN(widthOffset)) {
          maxWidth = width + (isWidthOutside ? 1 : -1) * Math.abs(widthOffset);
        }
      }
    });
  }

  return {
    maxWidth: maxWidth,
    maxHeight: maxHeight
  };
}

function getTotalGuidelines(moveable) {
  var _a = moveable.state,
      snapOffset = _a.snapOffset,
      _b = _a.containerClientRect,
      overflow = _b.overflow,
      containerHeight = _b.scrollHeight,
      containerWidth = _b.scrollWidth,
      containerClientHeight = _b.clientHeight,
      containerClientWidth = _b.clientWidth,
      clientLeft = _b.clientLeft,
      clientTop = _b.clientTop;
  var _c = moveable.props,
      _d = _c.snapGap,
      snapGap = _d === void 0 ? true : _d,
      verticalGuidelines = _c.verticalGuidelines,
      horizontalGuidelines = _c.horizontalGuidelines,
      _e = _c.snapThreshold,
      snapThreshold = _e === void 0 ? 5 : _e,
      _f = _c.snapGridWidth,
      snapGridWidth = _f === void 0 ? 0 : _f,
      _g = _c.snapGridHeight,
      snapGridHeight = _g === void 0 ? 0 : _g,
      _h = _c.maxSnapElementGuidelineDistance,
      maxSnapElementGuidelineDistance = _h === void 0 ? Infinity : _h;

  var _j = getRect(getAbsolutePosesByState(moveable.state)),
      top = _j.top,
      left = _j.left,
      bottom = _j.bottom,
      right = _j.right;

  var targetRect = {
    top: top,
    left: left,
    bottom: bottom,
    right: right,
    center: (left + right) / 2,
    middle: (top + bottom) / 2
  };
  var elementGuidelines = getElementGuidelines(moveable);

  var totalGuidelines = __spreadArray([], elementGuidelines, true);

  if (snapGap) {
    totalGuidelines.push.apply(totalGuidelines, getGapGuidelines(moveable, targetRect, snapThreshold));
  }

  totalGuidelines.push.apply(totalGuidelines, getGridGuidelines(snapGridWidth, snapGridHeight, overflow ? containerWidth : containerClientWidth, overflow ? containerHeight : containerClientHeight, clientLeft, clientTop));
  totalGuidelines.push.apply(totalGuidelines, getDefaultGuidelines(horizontalGuidelines || false, verticalGuidelines || false, overflow ? containerWidth : containerClientWidth, overflow ? containerHeight : containerClientHeight, clientLeft, clientTop, snapOffset));
  totalGuidelines = totalGuidelines.filter(function (_a) {
    var element = _a.element,
        elementRect = _a.elementRect,
        type = _a.type;

    if (!element || !elementRect) {
      return true;
    }

    var rect = elementRect.rect;
    return checkBetweenRects(targetRect, rect, type, maxSnapElementGuidelineDistance);
  });
  return totalGuidelines;
}

function getGapGuidelines(moveable, targetRect, snapThreshold) {
  var _a = moveable.props,
      _b = _a.maxSnapElementGuidelineDistance,
      maxSnapElementGuidelineDistance = _b === void 0 ? Infinity : _b,
      _c = _a.maxSnapElementGapDistance,
      maxSnapElementGapDistance = _c === void 0 ? Infinity : _c;
  var elementRects = moveable.state.elementRects;
  var gapGuidelines = [];
  [["vertical", VERTICAL_NAMES_MAP, HORIZONTAL_NAMES_MAP], ["horizontal", HORIZONTAL_NAMES_MAP, VERTICAL_NAMES_MAP]].forEach(function (_a) {
    var type = _a[0],
        mainNames = _a[1],
        sideNames = _a[2];
    var targetStart = targetRect[mainNames.start];
    var targetEnd = targetRect[mainNames.end];
    var targetCenter = targetRect[mainNames.center];
    var targetStart2 = targetRect[sideNames.start];
    var targetEnd2 = targetRect[sideNames.end]; // element : moveable

    function getDist(elementRect) {
      var rect = elementRect.rect;

      if (rect[mainNames.end] < targetStart + snapThreshold) {
        return targetStart - rect[mainNames.end];
      } else if (targetEnd - snapThreshold < rect[mainNames.start]) {
        return rect[mainNames.start] - targetEnd;
      } else {
        return -1;
      }
    }

    var nextElementRects = elementRects.filter(function (elementRect) {
      var rect = elementRect.rect;

      if (rect[sideNames.start] > targetEnd2 || rect[sideNames.end] < targetStart2) {
        return false;
      }

      return getDist(elementRect) > 0;
    }).sort(function (a, b) {
      return getDist(a) - getDist(b);
    });
    var groups = [];
    nextElementRects.forEach(function (snapRect1) {
      nextElementRects.forEach(function (snapRect2) {
        if (snapRect1 === snapRect2) {
          return;
        }

        var rect1 = snapRect1.rect;
        var rect2 = snapRect2.rect;
        var rect1Start = rect1[sideNames.start];
        var rect1End = rect1[sideNames.end];
        var rect2Start = rect2[sideNames.start];
        var rect2End = rect2[sideNames.end];

        if (rect1Start > rect2End || rect2Start > rect1End) {
          return;
        }

        groups.push([snapRect1, snapRect2]);
      });
    });
    groups.forEach(function (_a) {
      var snapRect1 = _a[0],
          snapRect2 = _a[1];
      var rect1 = snapRect1.rect;
      var rect2 = snapRect2.rect;
      var rect1Start = rect1[mainNames.start];
      var rect1End = rect1[mainNames.end];
      var rect2Start = rect2[mainNames.start];
      var rect2End = rect2[mainNames.end];
      var gap = 0;
      var pos = 0;
      var isStart = false;
      var isCenter = false;
      var isEnd = false;

      if (rect1End <= targetStart && targetEnd <= rect2Start) {
        // (l)element1(r) : (l)target(r) : (l)element2(r)
        isCenter = true;
        gap = (rect2Start - rect1End - (targetEnd - targetStart)) / 2;
        pos = rect1End + gap + (targetEnd - targetStart) / 2;

        if (Math.abs(pos - targetCenter) > snapThreshold) {
          return;
        }
      } else if (rect1End < rect2Start && rect2End < targetStart + snapThreshold) {
        // (l)element1(r) : (l)element2(r) : (l)target
        isStart = true;
        gap = rect2Start - rect1End;
        pos = rect2End + gap;

        if (Math.abs(pos - targetStart) > snapThreshold) {
          return;
        }
      } else if (rect1End < rect2Start && targetEnd - snapThreshold < rect1Start) {
        // target(r) : (l)element1(r) : (l)element2(r)
        isEnd = true;
        gap = rect2Start - rect1End;
        pos = rect1Start - gap;

        if (Math.abs(pos - targetEnd) > snapThreshold) {
          return;
        }
      } else {
        return;
      }

      if (!gap) {
        return;
      }

      if (!checkBetweenRects(targetRect, rect2, type, maxSnapElementGuidelineDistance)) {
        return;
      }

      if (gap > maxSnapElementGapDistance) {
        return;
      }

      gapGuidelines.push({
        type: type,
        pos: type === "vertical" ? [pos, 0] : [0, pos],
        element: snapRect2.element,
        size: 0,
        className: snapRect2.className,
        isStart: isStart,
        isCenter: isCenter,
        isEnd: isEnd,
        gap: gap,
        hide: true,
        gapRects: [snapRect1, snapRect2]
      });
    });
  });
  return gapGuidelines;
}

function getGridGuidelines(snapGridWidth, snapGridHeight, containerWidth, containerHeight, clientLeft, clientTop) {
  if (clientLeft === void 0) {
    clientLeft = 0;
  }

  if (clientTop === void 0) {
    clientTop = 0;
  }

  var guidelines = [];

  if (snapGridHeight) {
    for (var pos = 0; pos <= containerHeight; pos += snapGridHeight) {
      guidelines.push({
        type: "horizontal",
        pos: [0, throttle(pos - clientTop, 0.1)],
        size: containerWidth,
        hide: true
      });
    }
  }

  if (snapGridWidth) {
    for (var pos = 0; pos <= containerWidth; pos += snapGridWidth) {
      guidelines.push({
        type: "vertical",
        pos: [throttle(pos - clientLeft, 0.1), 0],
        size: containerHeight,
        hide: true
      });
    }
  }

  return guidelines;
}

function checkBetweenRects(rect1, rect2, type, distance) {
  if (type === "horizontal") {
    return Math.abs(rect1.right - rect2.left) <= distance || Math.abs(rect1.left - rect2.right) <= distance || rect1.left <= rect2.right && rect2.left <= rect1.right;
  } else if (type === "vertical") {
    return Math.abs(rect1.bottom - rect2.top) <= distance || Math.abs(rect1.top - rect2.bottom) <= distance || rect1.top <= rect2.bottom && rect2.top <= rect1.bottom;
  }

  return true;
}

function getElementGuidelines(moveable) {
  var state = moveable.state;
  var _a = moveable.props.elementGuidelines,
      elementGuidelines = _a === void 0 ? [] : _a;

  if (!elementGuidelines.length) {
    state.elementRects = [];
    return [];
  }

  var prevValues = (state.elementRects || []).filter(function (snapRect) {
    return !snapRect.refresh;
  });
  var nextElementGuidelines = elementGuidelines.map(function (el) {
    if (isObject(el) && "element" in el) {
      return __assign(__assign({}, el), {
        element: getRefTarget(el.element, true)
      });
    }

    return {
      element: getRefTarget(el, true)
    };
  }).filter(function (value) {
    return value.element;
  });

  var _b = diff$1(prevValues.map(function (v) {
    return v.element;
  }), nextElementGuidelines.map(function (v) {
    return v.element;
  })),
      maintained = _b.maintained,
      added = _b.added;

  var nextValues = [];
  maintained.forEach(function (_a) {
    var prevIndex = _a[0],
        nextIndex = _a[1];
    nextValues[nextIndex] = prevValues[prevIndex];
  });
  getSnapElementRects(moveable, added.map(function (index) {
    return nextElementGuidelines[index];
  })).map(function (rect, i) {
    nextValues[added[i]] = rect;
  });
  state.elementRects = nextValues;
  var elementSnapDirections = getSnapDirections(moveable.props.elementSnapDirections);
  var nextGuidelines = [];
  nextValues.forEach(function (snapRect) {
    var element = snapRect.element,
        _a = snapRect.top,
        topValue = _a === void 0 ? elementSnapDirections.top : _a,
        _b = snapRect.left,
        leftValue = _b === void 0 ? elementSnapDirections.left : _b,
        _c = snapRect.right,
        rightValue = _c === void 0 ? elementSnapDirections.right : _c,
        _d = snapRect.bottom,
        bottomValue = _d === void 0 ? elementSnapDirections.bottom : _d,
        _e = snapRect.center,
        centerValue = _e === void 0 ? elementSnapDirections.center : _e,
        _f = snapRect.middle,
        middleValue = _f === void 0 ? elementSnapDirections.middle : _f,
        className = snapRect.className,
        rect = snapRect.rect;

    var _g = splitSnapDirectionPoses({
      top: topValue,
      right: rightValue,
      left: leftValue,
      bottom: bottomValue,
      center: centerValue,
      middle: middleValue
    }, rect),
        horizontal = _g.horizontal,
        vertical = _g.vertical;

    var rectTop = rect.top;
    var rectLeft = rect.left;
    var width = rect.right - rectLeft;
    var height = rect.bottom - rectTop;
    var sizes = [width, height];
    vertical.forEach(function (pos) {
      nextGuidelines.push({
        type: "vertical",
        element: element,
        pos: [throttle(pos, 0.1), rectTop],
        size: height,
        sizes: sizes,
        className: className,
        elementRect: snapRect
      });
    });
    horizontal.forEach(function (pos) {
      nextGuidelines.push({
        type: "horizontal",
        element: element,
        pos: [rectLeft, throttle(pos, 0.1)],
        size: width,
        sizes: sizes,
        className: className,
        elementRect: snapRect
      });
    });
  });
  return nextGuidelines;
}

function getDefaultGuidelines(horizontalGuidelines, verticalGuidelines, width, height, clientLeft, clientTop, snapOffset) {
  if (clientLeft === void 0) {
    clientLeft = 0;
  }

  if (clientTop === void 0) {
    clientTop = 0;
  }

  if (snapOffset === void 0) {
    snapOffset = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    };
  }

  var guidelines = [];
  var snapOffsetLeft = snapOffset.left,
      snapOffsetTop = snapOffset.top,
      snapOffsetBottom = snapOffset.bottom,
      snapOffsetRight = snapOffset.right;
  var snapWidth = width + snapOffsetRight - snapOffsetLeft;
  var snapHeight = height + snapOffsetBottom - snapOffsetTop;
  horizontalGuidelines && horizontalGuidelines.forEach(function (posInfo) {
    var nextPosInfo = isObject(posInfo) ? posInfo : {
      pos: posInfo
    };
    guidelines.push({
      type: "horizontal",
      pos: [snapOffsetLeft, throttle(nextPosInfo.pos - clientTop + snapOffsetTop, 0.1)],
      size: snapWidth,
      className: nextPosInfo.className
    });
  });
  verticalGuidelines && verticalGuidelines.forEach(function (posInfo) {
    var nextPosInfo = isObject(posInfo) ? posInfo : {
      pos: posInfo
    };
    guidelines.push({
      type: "vertical",
      pos: [throttle(nextPosInfo.pos - clientLeft + snapOffsetLeft, 0.1), snapOffsetTop],
      size: snapHeight,
      className: nextPosInfo.className
    });
  });
  return guidelines;
}

function getSnapElementRects(moveable, values) {
  if (!values.length) {
    return [];
  }

  var state = moveable.state;
  var containerClientRect = state.containerClientRect,
      _a = state.targetClientRect,
      clientTop = _a.top,
      clientLeft = _a.left,
      rootMatrix = state.rootMatrix,
      is3d = state.is3d;
  var n = is3d ? 4 : 3;

  var _b = calculateContainerPos(rootMatrix, containerClientRect, n),
      containerLeft = _b[0],
      containerTop = _b[1];

  var poses = getAbsolutePosesByState(state);

  var _c = getMinMaxs(poses),
      targetLeft = _c.minX,
      targetTop = _c.minY;

  var _d = minus([targetLeft, targetTop], calculateInversePosition(rootMatrix, [clientLeft - containerLeft, clientTop - containerTop], n)).map(function (pos) {
    return roundSign(pos);
  }),
      distLeft = _d[0],
      distTop = _d[1];

  return values.map(function (value) {
    var rect = value.element.getBoundingClientRect();
    var left = rect.left - containerLeft;
    var top = rect.top - containerTop;
    var bottom = top + rect.height;
    var right = left + rect.width;

    var _a = calculateInversePosition(rootMatrix, [left, top], n),
        elementLeft = _a[0],
        elementTop = _a[1];

    var _b = calculateInversePosition(rootMatrix, [right, bottom], n),
        elementRight = _b[0],
        elementBottom = _b[1];

    return __assign(__assign({}, value), {
      rect: {
        left: elementLeft + distLeft,
        right: elementRight + distLeft,
        top: elementTop + distTop,
        bottom: elementBottom + distTop,
        center: (elementLeft + elementRight) / 2 + distLeft,
        middle: (elementTop + elementBottom) / 2 + distTop
      }
    });
  });
}

function snapStart(moveable) {
  var state = moveable.state;

  if (state.guidelines && state.guidelines.length) {
    return;
  }

  var container = moveable.state.container;
  var snapContainer = moveable.props.snapContainer || container;
  var containerClientRect = state.containerClientRect;
  var snapOffset = {
    left: 0,
    top: 0,
    bottom: 0,
    right: 0
  };

  if (container !== snapContainer) {
    var snapContainerTarget = getRefTarget(snapContainer, true);

    if (snapContainerTarget) {
      var snapContainerRect = getClientRect(snapContainerTarget);
      var offset1 = getDragDistByState(state, [snapContainerRect.left - containerClientRect.left, snapContainerRect.top - containerClientRect.top]);
      var offset2 = getDragDistByState(state, [snapContainerRect.right - containerClientRect.right, snapContainerRect.bottom - containerClientRect.bottom]);
      snapOffset.left = throttle(offset1[0], 0.00001);
      snapOffset.top = throttle(offset1[1], 0.00001);
      snapOffset.right = throttle(offset2[0], 0.00001);
      snapOffset.bottom = throttle(offset2[1], 0.00001);
    }
  }

  state.snapOffset = snapOffset;
  state.guidelines = getTotalGuidelines(moveable);
  state.enableSnap = true;
}

function getNextFixedPoses(matrix, width, height, fixedDirection, fixedPos, is3d) {
  var nextPoses = calculatePoses(matrix, width, height, is3d ? 4 : 3);
  var nextFixedPos = getPosByDirection(nextPoses, fixedDirection);
  return getAbsolutePoses(nextPoses, minus(fixedPos, nextFixedPos));
}

function getSizeOffsetInfo(moveable, poses, direction, keepRatio, isRequest, datas) {
  var fixedDirection = datas.fixedDirection;
  var directions = getCheckSnapDirections(direction, fixedDirection, keepRatio);
  var innerBoundLineInfos = getCheckInnerBoundLineInfos(moveable, poses, direction, keepRatio);

  var offsets = __spreadArray(__spreadArray([], getSnapBoundInfo(moveable, poses, directions, keepRatio, isRequest, datas), true), getInnerBoundInfo(moveable, innerBoundLineInfos, datas), true);

  var widthOffsetInfo = getNearOffsetInfo(offsets, 0);
  var heightOffsetInfo = getNearOffsetInfo(offsets, 1);
  return {
    width: {
      isBound: widthOffsetInfo.isBound,
      offset: widthOffsetInfo.offset[0]
    },
    height: {
      isBound: heightOffsetInfo.isBound,
      offset: heightOffsetInfo.offset[1]
    }
  };
}

function recheckSizeByTwoDirection(moveable, poses, width, height, maxWidth, maxHeight, direction, isRequest, datas) {
  var snapPos = getPosByDirection(poses, direction);

  var _a = checkMoveableSnapBounds(moveable, isRequest, {
    vertical: [snapPos[0]],
    horizontal: [snapPos[1]]
  }),
      horizontalOffset = _a.horizontal.offset,
      verticalOffset = _a.vertical.offset;

  if (verticalOffset || horizontalOffset) {
    var _b = getDragDist({
      datas: datas,
      distX: -verticalOffset,
      distY: -horizontalOffset
    }),
        nextWidthOffset = _b[0],
        nextHeightOffset = _b[1];

    var nextWidth = Math.min(maxWidth || Infinity, width + direction[0] * nextWidthOffset);
    var nextHeight = Math.min(maxHeight || Infinity, height + direction[1] * nextHeightOffset);
    return [nextWidth - width, nextHeight - height];
  }

  return [0, 0];
}

function checkSizeDist(moveable, getNextPoses, width, height, direction, fixedPosition, isRequest, datas) {
  var poses = getAbsolutePosesByState(moveable.state);
  var keepRatio = moveable.props.keepRatio;
  var widthOffset = 0;
  var heightOffset = 0;

  for (var i = 0; i < 2; ++i) {
    var nextPoses = getNextPoses(widthOffset, heightOffset);

    var _a = getSizeOffsetInfo(moveable, nextPoses, direction, keepRatio, isRequest, datas),
        widthOffsetInfo = _a.width,
        heightOffsetInfo = _a.height;

    var isWidthBound = widthOffsetInfo.isBound;
    var isHeightBound = heightOffsetInfo.isBound;
    var nextWidthOffset = widthOffsetInfo.offset;
    var nextHeightOffset = heightOffsetInfo.offset;

    if (i === 1) {
      if (!isWidthBound) {
        nextWidthOffset = 0;
      }

      if (!isHeightBound) {
        nextHeightOffset = 0;
      }
    }

    if (i === 0 && isRequest && !isWidthBound && !isHeightBound) {
      return [0, 0];
    }

    if (keepRatio) {
      var widthDist = Math.abs(nextWidthOffset) * (width ? 1 / width : 1);
      var heightDist = Math.abs(nextHeightOffset) * (height ? 1 / height : 1);
      var isGetWidthOffset = isWidthBound && isHeightBound ? widthDist < heightDist : isHeightBound || !isWidthBound && widthDist < heightDist;

      if (isGetWidthOffset) {
        // width : height = ? : heightOffset
        nextWidthOffset = width * nextHeightOffset / height;
      } else {
        // width : height = widthOffset : ?
        nextHeightOffset = height * nextWidthOffset / width;
      }
    }

    widthOffset += nextWidthOffset;
    heightOffset += nextHeightOffset;
  }

  if (direction[0] && direction[1]) {
    var _b = checkMaxBounds(moveable, poses, direction, fixedPosition, datas),
        maxWidth = _b.maxWidth,
        maxHeight = _b.maxHeight;

    var _c = recheckSizeByTwoDirection(moveable, getNextPoses(widthOffset, heightOffset).map(function (pos) {
      return pos.map(function (p) {
        return throttle(p, FLOAT_POINT_NUM);
      });
    }), width + widthOffset, height + heightOffset, maxWidth, maxHeight, direction, isRequest, datas),
        nextWidthOffset = _c[0],
        nextHeightOffset = _c[1];

    widthOffset += nextWidthOffset;
    heightOffset += nextHeightOffset;
  }

  return [widthOffset, heightOffset];
}

function checkSnapRotate(moveable, rect, rotation) {
  if (!hasGuidelines(moveable, "rotatable")) {
    return {
      isSnap: false,
      rotation: rotation
    };
  }

  var pos1 = rect.pos1,
      pos2 = rect.pos2,
      pos3 = rect.pos3,
      pos4 = rect.pos4,
      origin2 = rect.origin;
  var rad = rotation * Math.PI / 180;
  var prevPoses = [pos1, pos2, pos3, pos4].map(function (pos) {
    return minus(pos, origin2);
  });
  var nextPoses = prevPoses.map(function (pos) {
    return rotate(pos, rad);
  }); // console.log(moveable.state.left, moveable.state.top, moveable.state.origin);
  // console.log(pos1, pos2, pos3, pos4, origin, rad, prevPoses, nextPoses);

  var result = __spreadArray(__spreadArray([], checkRotateBounds(moveable, prevPoses, nextPoses, origin2, rotation), true), checkRotateInnerBounds(moveable, prevPoses, nextPoses, origin2, rotation), true);

  result.sort(function (a, b) {
    return Math.abs(a - rotation) - Math.abs(b - rotation);
  });
  var isSnap = result.length > 0;
  return {
    isSnap: isSnap,
    rotation: isSnap ? result[0] : rotation
  };
}

function checkSnapResize(moveable, width, height, direction, fixedPosition, isRequest, datas) {
  if (!hasGuidelines(moveable, "resizable")) {
    return [0, 0];
  }

  var fixedDirection = datas.fixedDirection,
      nextAllMatrix = datas.nextAllMatrix;
  var _a = moveable.state,
      allMatrix = _a.allMatrix,
      is3d = _a.is3d;
  return checkSizeDist(moveable, function (widthOffset, heightOffset) {
    return getNextFixedPoses(nextAllMatrix || allMatrix, width + widthOffset, height + heightOffset, fixedDirection, fixedPosition, is3d);
  }, width, height, direction, fixedPosition, isRequest, datas);
}

function checkSnapScale(moveable, scale, direction, isRequest, datas) {
  if (!hasGuidelines(moveable, "scalable")) {
    return [0, 0];
  }

  var startOffsetWidth = datas.startOffsetWidth,
      startOffsetHeight = datas.startOffsetHeight,
      fixedPosition = datas.fixedPosition,
      fixedDirection = datas.fixedDirection,
      is3d = datas.is3d;
  var sizeDist = checkSizeDist(moveable, function (widthOffset, heightOffset) {
    return getNextFixedPoses(scaleMatrix(datas, plus(scale, [widthOffset / startOffsetWidth, heightOffset / startOffsetHeight])), startOffsetWidth, startOffsetHeight, fixedDirection, fixedPosition, is3d);
  }, startOffsetWidth, startOffsetHeight, direction, fixedPosition, isRequest, datas);
  return [sizeDist[0] / startOffsetWidth, sizeDist[1] / startOffsetHeight];
}

function startCheckSnapDrag(moveable, datas) {
  datas.absolutePoses = getAbsolutePosesByState(moveable.state);
}

function getSnapGuidelines(posInfos) {
  var guidelines = [];
  posInfos.forEach(function (posInfo) {
    posInfo.guidelineInfos.forEach(function (_a) {
      var guideline = _a.guideline;

      if (guidelines.indexOf(guideline) > -1) {
        return;
      }

      guidelines.push(guideline);
    });
  });
  return guidelines;
}

function addBoundGuidelines(moveable, verticalPoses, horizontalPoses, verticalSnapPoses, horizontalSnapPoses, externalBounds) {
  var _a = checkBoundPoses(getBounds(moveable, externalBounds), verticalPoses, horizontalPoses),
      verticalBoundInfos = _a.vertical,
      horizontalBoundInfos = _a.horizontal;

  verticalBoundInfos.forEach(function (info) {
    if (info.isBound) {
      verticalSnapPoses.push({
        type: "bounds",
        pos: info.pos
      });
    }
  });
  horizontalBoundInfos.forEach(function (info) {
    if (info.isBound) {
      horizontalSnapPoses.push({
        type: "bounds",
        pos: info.pos
      });
    }
  });

  var _b = checkInnerBoundPoses(moveable),
      verticalInnerBoundPoses = _b.vertical,
      horizontalInnerBoundPoses = _b.horizontal;

  verticalInnerBoundPoses.forEach(function (innerPos) {
    if (findIndex(verticalSnapPoses, function (_a) {
      var type = _a.type,
          pos = _a.pos;
      return type === "bounds" && pos === innerPos;
    }) >= 0) {
      return;
    }

    verticalSnapPoses.push({
      type: "bounds",
      pos: innerPos
    });
  });
  horizontalInnerBoundPoses.forEach(function (innerPos) {
    if (findIndex(horizontalSnapPoses, function (_a) {
      var type = _a.type,
          pos = _a.pos;
      return type === "bounds" && pos === innerPos;
    }) >= 0) {
      return;
    }

    horizontalSnapPoses.push({
      type: "bounds",
      pos: innerPos
    });
  });
}

var directionCondition$2 = getDirectionCondition("", ["resizable", "scalable"]);
/**
 * @namespace Moveable.Snappable
 * @description Whether or not target can be snapped to the guideline. (default: false)
 * @sort 2
 */

var Snappable = {
  name: "snappable",
  dragRelation: "strong",
  props: {
    snappable: [Boolean, Array],
    snapContainer: Object,
    snapDirections: [Boolean, Object],
    elementSnapDirections: [Boolean, Object],
    snapGap: Boolean,
    snapGridWidth: Number,
    snapGridHeight: Number,
    isDisplaySnapDigit: Boolean,
    isDisplayInnerSnapDigit: Boolean,
    snapDigit: Number,
    snapThreshold: Number,
    horizontalGuidelines: Array,
    verticalGuidelines: Array,
    elementGuidelines: Array,
    bounds: Object,
    innerBounds: Object,
    snapDistFormat: Function,
    maxSnapElementGuidelineDistance: Number,
    maxSnapElementGapDistance: Number
  },
  events: {
    onSnap: "snap"
  },
  css: [":host {\n    --bounds-color: #d66;\n}\n.guideline {\n    pointer-events: none;\n    z-index: 2;\n}\n.guideline.bounds {\n    background: #d66;\n    background: var(--bounds-color);\n}\n.guideline-group {\n    position: absolute;\n    top: 0;\n    left: 0;\n}\n.guideline-group .size-value {\n    position: absolute;\n    color: #f55;\n    font-size: 12px;\n    font-weight: bold;\n}\n.guideline-group.horizontal .size-value {\n    transform-origin: 50% 100%;\n    transform: translateX(-50%);\n    left: 50%;\n    bottom: 5px;\n}\n.guideline-group.vertical .size-value {\n    transform-origin: 0% 50%;\n    top: 50%;\n    transform: translateY(-50%);\n    left: 5px;\n}\n.guideline.gap {\n    background: #f55;\n}\n.size-value.gap {\n    color: #f55;\n}\n"],
  render: function (moveable, React) {
    var state = moveable.state;
    var targetTop = state.top,
        targetLeft = state.left,
        pos1 = state.pos1,
        pos2 = state.pos2,
        pos3 = state.pos3,
        pos4 = state.pos4,
        snapRenderInfo = state.snapRenderInfo;

    if (!snapRenderInfo || !hasGuidelines(moveable, "")) {
      return [];
    }

    state.guidelines = getTotalGuidelines(moveable);
    var minLeft = Math.min(pos1[0], pos2[0], pos3[0], pos4[0]);
    var minTop = Math.min(pos1[1], pos2[1], pos3[1], pos4[1]);
    var externalPoses = snapRenderInfo.externalPoses || [];
    var poses = getAbsolutePosesByState(moveable.state);
    var verticalSnapPoses = [];
    var horizontalSnapPoses = [];
    var verticalGuidelines = [];
    var horizontalGuidelines = [];
    var snapInfos = [];

    var _a = getRect(poses),
        width = _a.width,
        height = _a.height,
        top = _a.top,
        left = _a.left,
        bottom = _a.bottom,
        right = _a.right;

    var targetRect = {
      left: left,
      right: right,
      top: top,
      bottom: bottom,
      center: (left + right) / 2,
      middle: (top + bottom) / 2
    };
    var hasExternalPoses = externalPoses.length > 0;
    var externalRect = hasExternalPoses ? getRect(externalPoses) : {};

    if (!snapRenderInfo.request) {
      if (snapRenderInfo.direction) {
        snapInfos.push(getSnapInfosByDirection(moveable, poses, snapRenderInfo.direction));
      }

      if (snapRenderInfo.snap) {
        var rect = getRect(poses);

        if (snapRenderInfo.center) {
          rect.middle = (rect.top + rect.bottom) / 2;
          rect.center = (rect.left + rect.right) / 2;
        }

        snapInfos.push(checkSnaps(moveable, rect, 1));
      }

      if (hasExternalPoses) {
        if (snapRenderInfo.center) {
          externalRect.middle = (externalRect.top + externalRect.bottom) / 2;
          externalRect.center = (externalRect.left + externalRect.right) / 2;
        }

        snapInfos.push(checkSnaps(moveable, externalRect, 1));
      }

      snapInfos.forEach(function (snapInfo) {
        var verticalPosInfos = snapInfo.vertical.posInfos,
            horizontalPosInfos = snapInfo.horizontal.posInfos;
        verticalSnapPoses.push.apply(verticalSnapPoses, verticalPosInfos.filter(function (_a) {
          var guidelineInfos = _a.guidelineInfos;
          return guidelineInfos.some(function (_a) {
            var guideline = _a.guideline;
            return !guideline.hide;
          });
        }).map(function (posInfo) {
          return {
            type: "snap",
            pos: posInfo.pos
          };
        }));
        horizontalSnapPoses.push.apply(horizontalSnapPoses, horizontalPosInfos.filter(function (_a) {
          var guidelineInfos = _a.guidelineInfos;
          return guidelineInfos.some(function (_a) {
            var guideline = _a.guideline;
            return !guideline.hide;
          });
        }).map(function (posInfo) {
          return {
            type: "snap",
            pos: posInfo.pos
          };
        }));
        verticalGuidelines.push.apply(verticalGuidelines, getSnapGuidelines(verticalPosInfos));
        horizontalGuidelines.push.apply(horizontalGuidelines, getSnapGuidelines(horizontalPosInfos));
      });
    }

    addBoundGuidelines(moveable, [left, right], [top, bottom], verticalSnapPoses, horizontalSnapPoses);

    if (hasExternalPoses) {
      addBoundGuidelines(moveable, [externalRect.left, externalRect.right], [externalRect.top, externalRect.bottom], verticalSnapPoses, horizontalSnapPoses, snapRenderInfo.externalBounds);
    }

    var allGuidelines = __spreadArray(__spreadArray([], verticalGuidelines, true), horizontalGuidelines, true);

    var elementGuidelines = allGuidelines.filter(function (guideline) {
      return guideline.element && !guideline.gapRects;
    });
    var gapGuidelines = allGuidelines.filter(function (guideline) {
      return guideline.gapRects;
    }).sort(function (a, b) {
      return a.gap - b.gap;
    });
    triggerEvent(moveable, "onSnap", {
      guidelines: allGuidelines.filter(function (_a) {
        var element = _a.element;
        return !element;
      }),
      elements: elementGuidelines,
      gaps: gapGuidelines
    }, true);
    return __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], renderDashedGuidelines(moveable, elementGuidelines, [minLeft, minTop], targetRect, React), true), renderGapGuidelines(moveable, gapGuidelines, [minLeft, minTop], targetRect, React), true), renderGuidelines(moveable, "horizontal", horizontalGuidelines, [targetLeft, targetTop], targetRect, React), true), renderGuidelines(moveable, "vertical", verticalGuidelines, [targetLeft, targetTop], targetRect, React), true), renderSnapPoses(moveable, "horizontal", horizontalSnapPoses, minLeft, targetTop, width, 0, React), true), renderSnapPoses(moveable, "vertical", verticalSnapPoses, minTop, targetLeft, height, 1, React), true);
  },
  dragStart: function (moveable, e) {
    moveable.state.snapRenderInfo = {
      request: e.isRequest,
      snap: true,
      center: true
    };
    snapStart(moveable);
  },
  drag: function (moveable) {
    var state = moveable.state;
    state.guidelines = getTotalGuidelines(moveable);
  },
  pinchStart: function (moveable) {
    this.unset(moveable);
  },
  dragEnd: function (moveable) {
    this.unset(moveable);
  },
  dragControlCondition: function (moveable, e) {
    if (directionCondition$2(moveable, e) || dragControlCondition(moveable, e)) {
      return true;
    }

    if (!e.isRequest && e.inputEvent) {
      return hasClass(e.inputEvent.target, prefix("snap-control"));
    }
  },
  dragControlStart: function (moveable) {
    moveable.state.snapRenderInfo = null;
    snapStart(moveable);
  },
  dragControl: function (moveable) {
    this.drag(moveable);
  },
  dragControlEnd: function (moveable) {
    this.unset(moveable);
  },
  dragGroupStart: function (moveable, e) {
    this.dragStart(moveable, e);
  },
  dragGroup: function (moveable) {
    this.drag(moveable);
  },
  dragGroupEnd: function (moveable) {
    this.unset(moveable);
  },
  dragGroupControlStart: function (moveable) {
    moveable.state.snapRenderInfo = null;
    snapStart(moveable);
  },
  dragGroupControl: function (moveable) {
    this.drag(moveable);
  },
  dragGroupControlEnd: function (moveable) {
    this.unset(moveable);
  },
  unset: function (moveable) {
    var state = moveable.state;
    state.enableSnap = false;
    state.guidelines = [];
    state.snapRenderInfo = null;
    state.elementRects = [];
  }
};
/**
 * Whether or not target can be snapped to the guideline. (default: false)
 * @name Moveable.Snappable#snappable
 * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Snappable.html#.SnappableOptions}
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body);
 *
 * moveable.snappable = true;
 */

/**
 *  A snap container that is the basis for snap, bounds, and innerBounds. (default: null = container)
 * @name Moveable.Snappable#snapContainer
 * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Snappable.html#.SnappableOptions}
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.querySelector(".container"));
 *
 * moveable.snapContainer = document.body;
 */

/**
 * You can specify the directions to snap to the target. (default: { left: true, top: true, right: true, bottom: true })
 * @name Moveable.Snappable#snapDirections
 * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Snappable.html#.SnappableOptions}
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *   snappable: true,
 *   snapDirections: true,
 * });
 * // snap center
 * moveable.snapDirections = { left: true, top: true, right: true, bottom: true, center: true, middle: true };
 */

/**
 * You can specify the snap directions of elements. (default: { left: true, top: true, right: true, bottom: true })
 * @name Moveable.Snappable#elementSnapDirections
 * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Snappable.html#.SnappableOptions}
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *   snappable: true,
 *   elementSnapDirections: true,
 * });
 * // snap center
 * moveable.elementSnapDirections = { left: true, top: true, right: true, bottom: true, center: true, middle: true };
 */

/**
 * When you drag, make the gap snap in the element guidelines. (default: true)
 * @name Moveable.Snappable#snapGap
 * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Snappable.html#.SnappableOptions}
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *   snappable: true,
 *   snapElement: true,
 *   snapGap: true,
 * });
 *
 * moveable.snapGap = false;
 */

/**
 * Distance value that can snap to guidelines. (default: 5)
 * @name Moveable.Snappable#snapThreshold
 * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Snappable.html#.SnappableOptions}
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body);
 *
 * moveable.snapThreshold = 5;
 */

/**
 * Add guidelines in the horizontal direction. (default: [])
 * @name Moveable.Snappable#horizontalGuidelines
 * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Snappable.html#.SnappableOptions}
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body);
 *
 * moveable.horizontalGuidelines = [100, 200, 500];
 */

/**
 * Add guidelines in the vertical direction. (default: [])
 * @name Moveable.Snappable#verticalGuidelines
 * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Snappable.html#.SnappableOptions}
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body);
 *
 * moveable.verticalGuidelines = [100, 200, 500];
 */

/**
 * Add guidelines for the element. (default: [])
 * @name Moveable.Snappable#elementGuidelines
 * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Snappable.html#.SnappableOptions}
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body);
 *
 * moveable.elementGuidelines = [
 *   document.querySelector(".element"),
 * ];
 */

/**
 * You can set up boundaries.
 * @name Moveable.Snappable#bounds
 * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Snappable.html#.SnappableOptions}
 * @default null
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body);
 *
 * moveable.bounds = { left: 0, right: 1000, top: 0, bottom: 1000};
 */

/**
 * You can set up inner boundaries.
 * @name Moveable.Snappable#innerBounds
 * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Snappable.html#.SnappableOptions}
 * @default null
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body);
 *
 * moveable.innerBounds = { left: 500, top: 500, width: 100, height: 100};
 */

/**
 * snap distance digits (default: 0)
 * @name Moveable.Snappable#snapDigit
 * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Snappable.html#.SnappableOptions}
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body);
 *
 * moveable.snapDigit = 0
 */

/**
 * If width size is greater than 0, you can vertical snap to the grid. (default: 0)
 * @name Moveable.Snappable#snapGridWidth
 * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Snappable.html#.SnappableOptions}
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body);
 *
 * moveable.snapGridWidth = 5;
 */

/**
 * If height size is greater than 0, you can horizontal snap to the grid. (default: 0)
 * @name Moveable.Snappable#snapGridHeight
 * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Snappable.html#.SnappableOptions}
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body);
 *
 * moveable.snapGridHeight = 5;
 */

/**
 * Whether to show snap distance (default: true)
 * @name Moveable.Snappable#isDisplaySnapDigit
 * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Snappable.html#.SnappableOptions}
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body);
 *
 * moveable.isDisplaySnapDigit = true;
 */

/**
 * Whether to show element inner snap distance (default: false)
 * @name Moveable.Snappable#isDisplayInnerSnapDigit
 * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Snappable.html#.SnappableOptions}
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body);
 *
 * moveable.isDisplayInnerSnapDigit = true;
 */

/**
 * You can set the text format of the distance shown in the guidelines. (default: self)
 * @name Moveable.Snappable#snapDistFormat
 * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Snappable.html#.SnappableOptions}
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *  snappable: true,
 *  snapDistFormat: (v, type) => v,
 * });
 * moveable.snapDistFormat = (v, type) => `${v}px`;
 */

/**
 * When you drag or dragControl, the `snap` event is called.
 * @memberof Moveable.Snappable
 * @event snap
 * @param {Moveable.Snappable.OnSnap} - Parameters for the `snap` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     snappable: true
 * });
 * moveable.on("snap", e => {
 *     console.log("onSnap", e);
 * });
 */

function renderDirectionControlsByInfos(moveable, ableName, renderDirections, React) {
  var _a = moveable.getState(),
      renderPoses = _a.renderPoses,
      rotationRad = _a.rotation,
      direction = _a.direction;

  var zoom = getProps(moveable.props, ableName).zoom;
  var sign = direction > 0 ? 1 : -1;
  var degRotation = rotationRad / Math.PI * 180;
  var directionMap = {};
  var renderState = moveable.renderState;

  if (!renderState.renderDirectionMap) {
    renderState.renderDirectionMap = {};
  }

  var renderDirectionMap = renderState.renderDirectionMap;
  renderDirections.forEach(function (_a) {
    var dir = _a.dir;
    directionMap[dir] = true;
  });
  return renderDirections.map(function (_a) {
    var data = _a.data,
        classNames = _a.classNames,
        dir = _a.dir;
    var indexes = DIRECTION_INDEXES[dir];

    if (!indexes || !directionMap[dir]) {
      return null;
    }

    renderDirectionMap[dir] = true;
    var directionRotation = (throttle(degRotation, 15) + sign * DIRECTION_ROTATIONS[dir] + 720) % 180;
    var dataAttrs = {};
    getKeys(data).forEach(function (name) {
      dataAttrs["data-".concat(name)] = data[name];
    });
    return React.createElement("div", __assign({
      className: prefix.apply(void 0, __spreadArray(["control", "direction", dir, ableName], classNames, false)),
      "data-rotation": directionRotation,
      "data-direction": dir
    }, dataAttrs, {
      key: "direction-".concat(dir),
      style: getControlTransform.apply(void 0, __spreadArray([rotationRad, zoom], indexes.map(function (index) {
        return renderPoses[index];
      }), false))
    }));
  });
}

function renderDirectionControls(moveable, defaultDirections, ableName, React) {
  var _a = getProps(moveable.props, ableName).renderDirections,
      directions = _a === void 0 ? defaultDirections : _a;

  if (!directions) {
    return [];
  }

  var renderDirections = directions === true ? DIRECTIONS : directions;
  return renderDirectionControlsByInfos(moveable, ableName, renderDirections.map(function (dir) {
    return {
      data: {},
      classNames: [],
      dir: dir
    };
  }), React);
}

function renderAroundControls(moveable, React) {
  var renderState = moveable.renderState;

  if (!renderState.renderDirectionMap) {
    renderState.renderDirectionMap = {};
  }

  var _a = moveable.getState(),
      renderPoses = _a.renderPoses,
      rotationRad = _a.rotation,
      direction = _a.direction;

  var renderDirectionMap = renderState.renderDirectionMap;
  var zoom = moveable.props.zoom;
  var sign = direction > 0 ? 1 : -1;
  var degRotation = rotationRad / Math.PI * 180;
  return getKeys(renderDirectionMap).map(function (dir) {
    var indexes = DIRECTION_INDEXES[dir];

    if (!indexes) {
      return null;
    }

    var directionRotation = (throttle(degRotation, 15) + sign * DIRECTION_ROTATIONS[dir] + 720) % 180;
    return React.createElement("div", {
      className: prefix("around-control"),
      "data-rotation": directionRotation,
      "data-direction": dir,
      key: "direction-around-".concat(dir),
      style: getControlTransform.apply(void 0, __spreadArray([rotationRad, zoom], indexes.map(function (index) {
        return renderPoses[index];
      }), false))
    });
  });
}

function renderLine(React, direction, pos1, pos2, zoom, key) {
  var classNames = [];

  for (var _i = 6; _i < arguments.length; _i++) {
    classNames[_i - 6] = arguments[_i];
  }

  var rad = getRad(pos1, pos2);
  var rotation = direction ? throttle(rad / Math.PI * 180, 15) % 180 : -1;
  return React.createElement("div", {
    key: "line-".concat(key),
    className: prefix.apply(void 0, __spreadArray(["line", "direction", direction ? "edge" : "", direction], classNames, false)),
    "data-rotation": rotation,
    "data-line-key": key,
    "data-direction": direction,
    style: getLineStyle(pos1, pos2, zoom, rad)
  });
}

function renderEdgeLines(React, ableName, edge, poses, zoom) {
  var directions = edge === true ? DIRECTIONS4 : edge;
  return directions.map(function (direction, i) {
    var _a = DIRECTION_INDEXES[direction],
        index1 = _a[0],
        index2 = _a[1];

    if (index2 == null) {
      return;
    }

    return renderLine(React, direction, poses[index1], poses[index2], zoom, "".concat(ableName, "Edge").concat(i), ableName);
  }).filter(Boolean);
}

function getRenderDirections(ableName) {
  return function (moveable, React) {
    var edge = getProps(moveable.props, ableName).edge;

    if (edge && (edge === true || edge.length)) {
      return __spreadArray(__spreadArray([], renderEdgeLines(React, ableName, edge, moveable.getState().renderPoses, moveable.props.zoom), true), renderDiagonalDirections(moveable, ableName, React), true);
    }

    return renderAllDirections(moveable, ableName, React);
  };
}

function renderAllDirections(moveable, ableName, React) {
  return renderDirectionControls(moveable, DIRECTIONS, ableName, React);
}

function renderDiagonalDirections(moveable, ableName, React) {
  return renderDirectionControls(moveable, ["nw", "ne", "sw", "se"], ableName, React);
}
/**
 * @namespace Draggable
 * @memberof Moveable
 * @description Draggable refers to the ability to drag and move targets.
 */


var Draggable = {
  name: "draggable",
  props: {
    draggable: Boolean,
    throttleDrag: Number,
    throttleDragRotate: Number,
    startDragRotate: Number,
    edgeDraggable: Boolean
  },
  events: {
    onDragStart: "dragStart",
    onDrag: "drag",
    onDragEnd: "dragEnd",
    onDragGroupStart: "dragGroupStart",
    onDragGroup: "dragGroup",
    onDragGroupEnd: "dragGroupEnd"
  },
  render: function (moveable, React) {
    var _a = moveable.props,
        throttleDragRotate = _a.throttleDragRotate,
        zoom = _a.zoom;

    var _b = moveable.getState(),
        dragInfo = _b.dragInfo,
        beforeOrigin = _b.beforeOrigin;

    if (!throttleDragRotate || !dragInfo) {
      return [];
    }

    var dist = dragInfo.dist;

    if (!dist[0] && !dist[1]) {
      return [];
    }

    var width = getDistSize(dist);
    var rad = getRad(dist, [0, 0]);
    return [React.createElement("div", {
      className: prefix("line", "horizontal", "dragline", "dashed"),
      key: "dragRotateGuideline",
      style: {
        width: "".concat(width, "px"),
        transform: "translate(".concat(beforeOrigin[0], "px, ").concat(beforeOrigin[1], "px) rotate(").concat(rad, "rad) scaleY(").concat(zoom, ")")
      }
    })];
  },
  dragStart: function (moveable, e) {
    var datas = e.datas,
        parentEvent = e.parentEvent,
        parentGesto = e.parentGesto;
    var state = moveable.state;
    var target = state.target,
        gestos = state.gestos;

    if (gestos.draggable) {
      return false;
    }

    gestos.draggable = parentGesto || moveable.targetGesto;
    var style = getComputedStyle$1(target);
    datas.datas = {};
    datas.left = parseFloat(style.left || "") || 0;
    datas.top = parseFloat(style.top || "") || 0;
    datas.bottom = parseFloat(style.bottom || "") || 0;
    datas.right = parseFloat(style.right || "") || 0;
    datas.startValue = [0, 0];
    setDragStart(moveable, e);
    setDefaultTransformIndex(e, "translate");
    startCheckSnapDrag(moveable, datas);
    datas.prevDist = [0, 0];
    datas.prevBeforeDist = [0, 0];
    datas.isDrag = false;
    datas.deltaOffset = [0, 0];
    var params = fillParams(moveable, e, __assign({
      set: function (translate) {
        datas.startValue = translate;
      }
    }, fillTransformStartEvent(e)));
    var result = parentEvent || triggerEvent(moveable, "onDragStart", params);

    if (result !== false) {
      datas.isDrag = true;
      moveable.state.dragInfo = {
        startRect: moveable.getRect(),
        dist: [0, 0]
      };
    } else {
      gestos.draggable = null;
      datas.isPinch = false;
    }

    return datas.isDrag ? params : false;
  },
  drag: function (moveable, e) {
    if (!e) {
      return;
    }

    resolveTransformEvent(e, "translate");
    var datas = e.datas,
        parentEvent = e.parentEvent,
        parentFlag = e.parentFlag,
        isPinch = e.isPinch,
        isRequest = e.isRequest,
        deltaOffset = e.deltaOffset;
    var distX = e.distX,
        distY = e.distY;
    var isDrag = datas.isDrag,
        prevDist = datas.prevDist,
        prevBeforeDist = datas.prevBeforeDist,
        startValue = datas.startValue;

    if (!isDrag) {
      return;
    }

    if (deltaOffset) {
      distX += deltaOffset[0];
      distY += deltaOffset[1];
    }

    var props = moveable.props;
    var parentMoveable = props.parentMoveable;
    var throttleDrag = parentEvent ? 0 : props.throttleDrag || 0;
    var throttleDragRotate = parentEvent ? 0 : props.throttleDragRotate || 0;
    var isSnap = false;
    var dragRotateRad = 0;

    if (!parentEvent && throttleDragRotate > 0 && (distX || distY)) {
      var startDragRotate = props.startDragRotate || 0;
      var deg = throttle(startDragRotate + getRad([0, 0], [distX, distY]) * 180 / Math.PI, throttleDragRotate) - startDragRotate;
      var ry = distY * Math.abs(Math.cos((deg - 90) / 180 * Math.PI));
      var rx = distX * Math.abs(Math.cos(deg / 180 * Math.PI));
      var r = getDistSize([rx, ry]);
      dragRotateRad = deg * Math.PI / 180;
      distX = r * Math.cos(dragRotateRad);
      distY = r * Math.sin(dragRotateRad);
    }

    if (!isPinch && !parentEvent && !parentFlag && (!throttleDragRotate || distX || distY)) {
      var _a = checkSnapBoundsDrag(moveable, distX, distY, throttleDragRotate, isRequest || deltaOffset, datas),
          verticalInfo = _a[0],
          horizontalInfo = _a[1];

      var isVerticalSnap = verticalInfo.isSnap,
          isVerticalBound = verticalInfo.isBound,
          verticalOffset = verticalInfo.offset;
      var isHorizontalSnap = horizontalInfo.isSnap,
          isHorizontalBound = horizontalInfo.isBound,
          horizontalOffset = horizontalInfo.offset;
      isSnap = isVerticalSnap || isHorizontalSnap || isVerticalBound || isHorizontalBound;
      distX += verticalOffset;
      distY += horizontalOffset;
    }

    var beforeTranslate = plus(getBeforeDragDist({
      datas: datas,
      distX: distX,
      distY: distY
    }), startValue);
    var translate = plus(getTransformDist({
      datas: datas,
      distX: distX,
      distY: distY
    }), startValue);

    if (!throttleDragRotate && !isSnap) {
      throttleArray(translate, throttleDrag);
      throttleArray(beforeTranslate, throttleDrag);
    }

    throttleArray(translate, TINY_NUM);
    throttleArray(beforeTranslate, TINY_NUM);
    var beforeDist = minus(beforeTranslate, startValue);
    var dist = minus(translate, startValue);
    var delta = minus(dist, prevDist);
    var beforeDelta = minus(beforeDist, prevBeforeDist);
    datas.prevDist = dist;
    datas.prevBeforeDist = beforeDist;
    datas.passDelta = delta; //distX - (datas.passDistX || 0);
    // datas.passDeltaY = distY - (datas.passDistY || 0);

    datas.passDist = dist; //distX;
    // datas.passDistY = distY;

    var left = datas.left + beforeDist[0];
    var top = datas.top + beforeDist[1];
    var right = datas.right - beforeDist[0];
    var bottom = datas.bottom - beforeDist[1];
    var nextTransform = convertTransformFormat(datas, "translate(".concat(translate[0], "px, ").concat(translate[1], "px)"), "translate(".concat(dist[0], "px, ").concat(dist[1], "px)"));
    fillOriginalTransform(e, nextTransform);
    moveable.state.dragInfo.dist = parentEvent ? [0, 0] : dist;

    if (!parentEvent && !parentMoveable && delta.every(function (num) {
      return !num;
    }) && beforeDelta.some(function (num) {
      return !num;
    })) {
      return;
    }

    var _b = moveable.state,
        width = _b.width,
        height = _b.height;
    var params = fillParams(moveable, e, __assign({
      transform: nextTransform,
      dist: dist,
      delta: delta,
      translate: translate,
      beforeDist: beforeDist,
      beforeDelta: beforeDelta,
      beforeTranslate: beforeTranslate,
      left: left,
      top: top,
      right: right,
      bottom: bottom,
      width: width,
      height: height,
      isPinch: isPinch
    }, fillCSSObject({
      transform: nextTransform
    }, e)));
    !parentEvent && triggerEvent(moveable, "onDrag", params);
    return params;
  },
  dragAfter: function (moveable, e) {
    var datas = e.datas;
    var deltaOffset = datas.deltaOffset;

    if (deltaOffset[0] || deltaOffset[1]) {
      datas.deltaOffset = [0, 0];
      return this.drag(moveable, __assign(__assign({}, e), {
        deltaOffset: deltaOffset
      }));
    }

    return false;
  },
  dragEnd: function (moveable, e) {
    var parentEvent = e.parentEvent,
        datas = e.datas;
    moveable.state.dragInfo = null;

    if (!datas.isDrag) {
      return;
    }

    datas.isDrag = false;
    var param = fillEndParams(moveable, e, {});
    !parentEvent && triggerEvent(moveable, "onDragEnd", param);
    return param;
  },
  dragGroupStart: function (moveable, e) {
    var datas = e.datas,
        clientX = e.clientX,
        clientY = e.clientY;
    var params = this.dragStart(moveable, e);

    if (!params) {
      return false;
    }

    var events = triggerChildGesto(moveable, this, "dragStart", [clientX || 0, clientY || 0], e, false, "draggable");

    var nextParams = __assign(__assign({}, params), {
      targets: moveable.props.targets,
      events: events
    });

    var result = triggerEvent(moveable, "onDragGroupStart", nextParams);
    datas.isDrag = result !== false;
    return datas.isDrag ? params : false;
  },
  dragGroup: function (moveable, e) {
    var datas = e.datas;

    if (!datas.isDrag) {
      return;
    }

    var params = this.drag(moveable, e);
    var passDelta = e.datas.passDelta;
    var events = triggerChildGesto(moveable, this, "drag", passDelta, e, false, "draggable");

    if (!params) {
      return;
    }

    var nextParams = __assign({
      targets: moveable.props.targets,
      events: events
    }, params);

    triggerEvent(moveable, "onDragGroup", nextParams);
    return nextParams;
  },
  dragGroupEnd: function (moveable, e) {
    var isDrag = e.isDrag,
        datas = e.datas;

    if (!datas.isDrag) {
      return;
    }

    this.dragEnd(moveable, e);
    var events = triggerChildGesto(moveable, this, "dragEnd", [0, 0], e, false, "draggable");
    triggerEvent(moveable, "onDragGroupEnd", fillEndParams(moveable, e, {
      targets: moveable.props.targets,
      events: events
    }));
    return isDrag;
  },

  /**
   * @method Moveable.Draggable#request
   * @param {object} [e] - the draggable's request parameter
   * @param {number} [e.x] - x position
   * @param {number} [e.y] - y position
   * @param {number} [e.deltaX] - X number to move
   * @param {number} [e.deltaY] - Y number to move
   * @return {Moveable.Requester} Moveable Requester
   * @example
    * // Instantly Request (requestStart - request - requestEnd)
   * // Use Relative Value
   * moveable.request("draggable", { deltaX: 10, deltaY: 10 }, true);
   * // Use Absolute Value
   * moveable.request("draggable", { x: 200, y: 100 }, true);
   *
   * // requestStart
   * const requester = moveable.request("draggable");
   *
   * // request
   * // Use Relative Value
   * requester.request({ deltaX: 10, deltaY: 10 });
   * requester.request({ deltaX: 10, deltaY: 10 });
   * requester.request({ deltaX: 10, deltaY: 10 });
   * // Use Absolute Value
   * moveable.request("draggable", { x: 200, y: 100 });
   * moveable.request("draggable", { x: 220, y: 100 });
   * moveable.request("draggable", { x: 240, y: 100 });
   *
   * // requestEnd
   * requester.requestEnd();
   */
  request: function (moveable) {
    var datas = {};
    var rect = moveable.getRect();
    var distX = 0;
    var distY = 0;
    return {
      isControl: false,
      requestStart: function () {
        return {
          datas: datas
        };
      },
      request: function (e) {
        if ("x" in e) {
          distX = e.x - rect.left;
        } else if ("deltaX" in e) {
          distX += e.deltaX;
        }

        if ("y" in e) {
          distY = e.y - rect.top;
        } else if ("deltaY" in e) {
          distY += e.deltaY;
        }

        return {
          datas: datas,
          distX: distX,
          distY: distY
        };
      },
      requestEnd: function () {
        return {
          datas: datas,
          isDrag: true
        };
      }
    };
  },
  unset: function (moveable) {
    moveable.state.gestos.draggable = null;
    moveable.state.dragInfo = null;
  }
};
/**
 * Whether or not target can be dragged. (default: false)
 * @name Moveable.Draggable#draggable
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body);
 *
 * moveable.draggable = true;
 */

/**
 * throttle of x, y when drag.
 * @name Moveable.Draggable#throttleDrag
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body);
 *
 * moveable.throttleDrag = 1;
 */

/**
* throttle of angle of x, y when drag.
* @name Moveable.Draggable#throttleDragRotate
* @example
* import Moveable from "moveable";
*
* const moveable = new Moveable(document.body);
*
* moveable.throttleDragRotate = 45;
*/

/**
* start angle of throttleDragRotate of x, y when drag.
* @name Moveable.Draggable#startDragRotate
* @example
* import Moveable from "moveable";
*
* const moveable = new Moveable(document.body);
*
* // 45, 135, 225, 315
* moveable.throttleDragRotate = 90;
* moveable.startDragRotate = 45;
*/

/**
 * When the drag starts, the dragStart event is called.
 * @memberof Moveable.Draggable
 * @event dragStart
 * @param {Moveable.Draggable.OnDragStart} - Parameters for the dragStart event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, { draggable: true });
 * moveable.on("dragStart", ({ target }) => {
 *     console.log(target);
 * });
 */

/**
 * When dragging, the drag event is called.
 * @memberof Moveable.Draggable
 * @event drag
 * @param {Moveable.Draggable.OnDrag} - Parameters for the drag event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, { draggable: true });
 * moveable.on("drag", ({ target, transform }) => {
 *     target.style.transform = transform;
 * });
 */

/**
 * When the drag finishes, the dragEnd event is called.
 * @memberof Moveable.Draggable
 * @event dragEnd
 * @param {Moveable.Draggable.OnDragEnd} - Parameters for the dragEnd event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, { draggable: true });
 * moveable.on("dragEnd", ({ target, isDrag }) => {
 *     console.log(target, isDrag);
 * });
 */

/**
* When the group drag starts, the `dragGroupStart` event is called.
* @memberof Moveable.Draggable
* @event dragGroupStart
* @param {Moveable.Draggable.OnDragGroupStart} - Parameters for the `dragGroupStart` event
* @example
* import Moveable from "moveable";
*
* const moveable = new Moveable(document.body, {
*     target: [].slice.call(document.querySelectorAll(".target")),
*     draggable: true
* });
* moveable.on("dragGroupStart", ({ targets }) => {
*     console.log("onDragGroupStart", targets);
* });
*/

/**
* When the group drag, the `dragGroup` event is called.
* @memberof Moveable.Draggable
* @event dragGroup
* @param {Moveable.Draggable.OnDragGroup} - Parameters for the `dragGroup` event
* @example
* import Moveable from "moveable";
*
* const moveable = new Moveable(document.body, {
*     target: [].slice.call(document.querySelectorAll(".target")),
*     draggable: true
* });
* moveable.on("dragGroup", ({ targets, events }) => {
*     console.log("onDragGroup", targets);
*     events.forEach(ev => {
*          // drag event
*          console.log("onDrag left, top", ev.left, ev.top);
*          // ev.target!.style.left = `${ev.left}px`;
*          // ev.target!.style.top = `${ev.top}px`;
*          console.log("onDrag translate", ev.dist);
*          ev.target!.style.transform = ev.transform;)
*     });
* });
*/

/**
 * When the group drag finishes, the `dragGroupEnd` event is called.
 * @memberof Moveable.Draggable
 * @event dragGroupEnd
 * @param {Moveable.Draggable.OnDragGroupEnd} - Parameters for the `dragGroupEnd` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     target: [].slice.call(document.querySelectorAll(".target")),
 *     draggable: true
 * });
 * moveable.on("dragGroupEnd", ({ targets, isDrag }) => {
 *     console.log("onDragGroupEnd", targets, isDrag);
 * });
 */

/**
 * @namespace Resizable
 * @memberof Moveable
 * @description Resizable indicates whether the target's width and height can be increased or decreased.
 */

var directionCondition$1 = getDirectionCondition("resizable");
var Resizable = {
  name: "resizable",
  ableGroup: "size",
  canPinch: true,
  props: {
    resizable: Boolean,
    throttleResize: Number,
    renderDirections: Array,
    keepRatio: Boolean,
    resizeFormat: Function,
    keepRatioFinally: Boolean,
    edge: Boolean
  },
  events: {
    onResizeStart: "resizeStart",
    onBeforeResize: "beforeResize",
    onResize: "resize",
    onResizeEnd: "resizeEnd",
    onResizeGroupStart: "resizeGroupStart",
    onBeforeResizeGroup: "beforeResizeGroup",
    onResizeGroup: "resizeGroup",
    onResizeGroupEnd: "resizeGroupEnd"
  },
  render: getRenderDirections("resizable"),
  dragControlCondition: directionCondition$1,
  viewClassName: getDirectionViewClassName("resizable"),
  dragControlStart: function (moveable, e) {
    var _a;

    var inputEvent = e.inputEvent,
        isPinch = e.isPinch,
        isGroup = e.isGroup,
        parentDirection = e.parentDirection,
        parentGesto = e.parentGesto,
        datas = e.datas,
        parentFixedDirection = e.parentFixedDirection,
        parentEvent = e.parentEvent;
    var direction = getTotalDirection(parentDirection, isPinch, inputEvent, datas);
    var state = moveable.state;
    var target = state.target,
        width = state.width,
        height = state.height,
        gestos = state.gestos;

    if (!direction || !target) {
      return false;
    }

    if (gestos.resizable) {
      return false;
    }

    gestos.resizable = parentGesto || moveable.controlGesto;
    !isPinch && setDragStart(moveable, e);
    datas.datas = {};
    datas.direction = direction;
    datas.startOffsetWidth = width;
    datas.startOffsetHeight = height;
    datas.prevWidth = 0;
    datas.prevHeight = 0;
    datas.minSize = [0, 0];
    datas.startWidth = state.cssWidth;
    datas.startHeight = state.cssHeight;
    datas.maxSize = [Infinity, Infinity];

    if (!isGroup) {
      datas.minSize = [state.minOffsetWidth, state.minOffsetHeight];
      datas.maxSize = [state.maxOffsetWidth, state.maxOffsetHeight];
    }

    var transformOrigin = moveable.props.transformOrigin || "% %";
    datas.transformOrigin = transformOrigin && isString(transformOrigin) ? transformOrigin.split(" ") : transformOrigin;
    datas.startOffsetMatrix = state.offsetMatrix;
    datas.startTransformOrigin = state.transformOrigin;
    datas.isWidth = (_a = e === null || e === void 0 ? void 0 : e.parentIsWidth) !== null && _a !== void 0 ? _a : !direction[0] && !direction[1] || direction[0] || !direction[1];

    function setRatio(ratio) {
      datas.ratio = ratio && isFinite(ratio) ? ratio : 0;
    }

    datas.startPositions = getAbsolutePosesByState(moveable.state);

    function setFixedDirection(fixedDirection) {
      datas.fixedDirection = fixedDirection;
      datas.fixedPosition = getPosByDirection(datas.startPositions, fixedDirection);
    }

    function setMin(minSize) {
      datas.minSize = [convertUnitSize("".concat(minSize[0]), 0) || 0, convertUnitSize("".concat(minSize[1]), 0) || 0];
    }

    function setMax(maxSize) {
      var nextMaxSize = [maxSize[0] || Infinity, maxSize[1] || Infinity];

      if (!isNumber(nextMaxSize[0]) || isFinite(nextMaxSize[0])) {
        nextMaxSize[0] = convertUnitSize("".concat(nextMaxSize[0]), 0) || Infinity;
      }

      if (!isNumber(nextMaxSize[1]) || isFinite(nextMaxSize[1])) {
        nextMaxSize[1] = convertUnitSize("".concat(nextMaxSize[1]), 0) || Infinity;
      }

      datas.maxSize = nextMaxSize;
    }

    setRatio(width / height);
    setFixedDirection(parentFixedDirection || [-direction[0], -direction[1]]);
    datas.setFixedDirection = setFixedDirection;
    datas.setMin = setMin;
    datas.setMax = setMax;
    var params = fillParams(moveable, e, {
      direction: direction,
      startRatio: datas.ratio,
      set: function (_a) {
        var startWidth = _a[0],
            startHeight = _a[1];
        datas.startWidth = startWidth;
        datas.startHeight = startHeight;
      },
      setMin: setMin,
      setMax: setMax,
      setRatio: setRatio,
      setFixedDirection: setFixedDirection,
      setOrigin: function (origin) {
        datas.transformOrigin = origin;
      },
      dragStart: Draggable.dragStart(moveable, new CustomGesto().dragStart([0, 0], e))
    });
    var result = parentEvent || triggerEvent(moveable, "onResizeStart", params);
    datas.startFixedDirection = datas.fixedDirection;

    if (result !== false) {
      datas.isResize = true;
      moveable.state.snapRenderInfo = {
        request: e.isRequest,
        direction: direction
      };
    }

    return datas.isResize ? params : false;
  },
  dragControl: function (moveable, e) {
    var _a;

    var datas = e.datas,
        parentFlag = e.parentFlag,
        isPinch = e.isPinch,
        parentKeepRatio = e.parentKeepRatio,
        dragClient = e.dragClient,
        parentDist = e.parentDist,
        isRequest = e.isRequest,
        isGroup = e.isGroup,
        parentEvent = e.parentEvent,
        resolveMatrix = e.resolveMatrix;
    var isResize = datas.isResize,
        transformOrigin = datas.transformOrigin,
        startWidth = datas.startWidth,
        startHeight = datas.startHeight,
        prevWidth = datas.prevWidth,
        prevHeight = datas.prevHeight,
        minSize = datas.minSize,
        maxSize = datas.maxSize,
        ratio = datas.ratio,
        startOffsetWidth = datas.startOffsetWidth,
        startOffsetHeight = datas.startOffsetHeight,
        isWidth = datas.isWidth;

    if (!isResize) {
      return;
    }

    if (resolveMatrix) {
      var is3d = moveable.state.is3d;
      var startOffsetMatrix = datas.startOffsetMatrix,
          startTransformOrigin = datas.startTransformOrigin;
      var n = is3d ? 4 : 3;
      var targetMatrix = parseMat(getNextTransforms(e));
      var targetN = Math.sqrt(targetMatrix.length);

      if (n !== targetN) {
        targetMatrix = convertDimension(targetMatrix, targetN, n);
      }

      var nextAllMatrix = getNextMatrix(startOffsetMatrix, targetMatrix, startTransformOrigin, n);
      var poses = calculatePoses(nextAllMatrix, startOffsetWidth, startOffsetHeight, n);
      datas.startPositions = poses;
      datas.nextTargetMatrix = targetMatrix;
      datas.nextAllMatrix = nextAllMatrix;
    }

    var props = getProps(moveable.props, "resizable");
    var resizeFormat = props.resizeFormat,
        _b = props.throttleResize,
        throttleResize = _b === void 0 ? parentFlag ? 0 : 1 : _b,
        parentMoveable = props.parentMoveable,
        keepRatioFinally = props.keepRatioFinally;
    var direction = datas.direction;
    var sizeDirection = direction;
    var distWidth = 0;
    var distHeight = 0;

    if (!direction[0] && !direction[1]) {
      sizeDirection = [1, 1];
    }

    var keepRatio = ratio && (parentKeepRatio != null ? parentKeepRatio : props.keepRatio) || false;

    function getNextBoundingSize() {
      var fixedDirection = datas.fixedDirection;
      var nextSize = getOffsetSizeDist(sizeDirection, keepRatio, datas, e);
      distWidth = nextSize.distWidth;
      distHeight = nextSize.distHeight;
      var nextWidth = sizeDirection[0] - fixedDirection[0] || keepRatio ? Math.max(startOffsetWidth + distWidth, TINY_NUM) : startOffsetWidth;
      var nextHeight = sizeDirection[1] - fixedDirection[1] || keepRatio ? Math.max(startOffsetHeight + distHeight, TINY_NUM) : startOffsetHeight;

      if (keepRatio && startOffsetWidth && startOffsetHeight) {
        // startOffsetWidth : startOffsetHeight = nextWidth : nextHeight
        if (isWidth) {
          nextHeight = nextWidth / ratio;
        } else {
          nextWidth = nextHeight * ratio;
        }
      }

      return [nextWidth, nextHeight];
    }

    var _c = getNextBoundingSize(),
        boundingWidth = _c[0],
        boundingHeight = _c[1];

    if (!parentEvent) {
      datas.setFixedDirection(datas.fixedDirection);
      triggerEvent(moveable, "onBeforeResize", fillParams(moveable, e, {
        startFixedDirection: datas.startFixedDirection,
        setFixedDirection: function (nextFixedDirection) {
          var _a;

          datas.setFixedDirection(nextFixedDirection);
          _a = getNextBoundingSize(), boundingWidth = _a[0], boundingHeight = _a[1];
          return [boundingWidth, boundingHeight];
        },
        boundingWidth: boundingWidth,
        boundingHeight: boundingHeight,
        setSize: function (size) {
          boundingWidth = size[0], boundingHeight = size[1];
        }
      }, true));
    }

    var fixedPosition = dragClient;

    if (!dragClient) {
      if (!parentFlag && isPinch) {
        fixedPosition = getAbsolutePosition(moveable, [0, 0]);
      } else {
        fixedPosition = datas.fixedPosition;
      }
    }

    var snapDist = [0, 0];

    if (!isPinch) {
      snapDist = checkSnapResize(moveable, boundingWidth, boundingHeight, direction, fixedPosition, isRequest, datas);
    }

    if (parentDist) {
      !parentDist[0] && (snapDist[0] = 0);
      !parentDist[1] && (snapDist[1] = 0);
    }

    function computeSize() {
      var _a;

      if (resizeFormat) {
        _a = resizeFormat([boundingWidth, boundingHeight]), boundingWidth = _a[0], boundingHeight = _a[1];
      }

      boundingWidth = throttle(boundingWidth, throttleResize);
      boundingHeight = throttle(boundingHeight, throttleResize);
    }

    if (keepRatio) {
      if (sizeDirection[0] && sizeDirection[1] && snapDist[0] && snapDist[1]) {
        if (Math.abs(snapDist[0]) > Math.abs(snapDist[1])) {
          snapDist[1] = 0;
        } else {
          snapDist[0] = 0;
        }
      }

      var isNoSnap = !snapDist[0] && !snapDist[1];

      if (isNoSnap) {
        // pre-compute before maintaining the ratio
        computeSize();
      }

      if (sizeDirection[0] && !sizeDirection[1] || snapDist[0] && !snapDist[1] || isNoSnap && isWidth) {
        boundingWidth += snapDist[0];
        boundingHeight = boundingWidth / ratio;
      } else if (!sizeDirection[0] && sizeDirection[1] || !snapDist[0] && snapDist[1] || isNoSnap && !isWidth) {
        boundingHeight += snapDist[1];
        boundingWidth = boundingHeight * ratio;
      }
    } else {
      boundingWidth += snapDist[0];
      boundingHeight += snapDist[1];
      boundingWidth = Math.max(0, boundingWidth);
      boundingHeight = Math.max(0, boundingHeight);
    }

    _a = calculateBoundSize([boundingWidth, boundingHeight], minSize, maxSize, keepRatio ? ratio : false), boundingWidth = _a[0], boundingHeight = _a[1];
    computeSize();

    if (keepRatio && (isGroup || keepRatioFinally)) {
      if (isWidth) {
        boundingHeight = boundingWidth / ratio;
      } else {
        boundingWidth = boundingHeight * ratio;
      }
    }

    distWidth = boundingWidth - startOffsetWidth;
    distHeight = boundingHeight - startOffsetHeight;
    var delta = [distWidth - prevWidth, distHeight - prevHeight];
    datas.prevWidth = distWidth;
    datas.prevHeight = distHeight;
    var inverseDelta = getResizeDist(moveable, boundingWidth, boundingHeight, fixedPosition, transformOrigin, datas);

    if (!parentMoveable && delta.every(function (num) {
      return !num;
    }) && inverseDelta.every(function (num) {
      return !num;
    })) {
      return;
    }

    var drag = Draggable.drag(moveable, setCustomDrag(e, moveable.state, inverseDelta, !!isPinch, false, "draggable"));
    var transform = drag.transform;
    var nextWidth = startWidth + distWidth;
    var nextHeight = startHeight + distHeight;
    var params = fillParams(moveable, e, __assign({
      width: nextWidth,
      height: nextHeight,
      offsetWidth: Math.round(boundingWidth),
      offsetHeight: Math.round(boundingHeight),
      startRatio: ratio,
      boundingWidth: boundingWidth,
      boundingHeight: boundingHeight,
      direction: direction,
      dist: [distWidth, distHeight],
      delta: delta,
      isPinch: !!isPinch,
      drag: drag
    }, fillAfterTransform({
      style: {
        width: "".concat(nextWidth, "px"),
        height: "".concat(nextHeight, "px")
      },
      transform: transform
    }, drag, e)));
    !parentEvent && triggerEvent(moveable, "onResize", params);
    return params;
  },
  dragControlAfter: function (moveable, e) {
    var datas = e.datas;
    var isResize = datas.isResize,
        startOffsetWidth = datas.startOffsetWidth,
        startOffsetHeight = datas.startOffsetHeight,
        prevWidth = datas.prevWidth,
        prevHeight = datas.prevHeight;

    if (!isResize) {
      return;
    }

    var _a = moveable.state,
        width = _a.width,
        height = _a.height;
    var errorWidth = width - (startOffsetWidth + prevWidth);
    var errorHeight = height - (startOffsetHeight + prevHeight);
    var isErrorWidth = Math.abs(errorWidth) > 3;
    var isErrorHeight = Math.abs(errorHeight) > 3;

    if (isErrorWidth) {
      datas.startWidth += errorWidth;
      datas.startOffsetWidth += errorWidth;
      datas.prevWidth += errorWidth;
    }

    if (isErrorHeight) {
      datas.startHeight += errorHeight;
      datas.startOffsetHeight += errorHeight;
      datas.prevHeight += errorHeight;
    }

    if (isErrorWidth || isErrorHeight) {
      return this.dragControl(moveable, e);
    }
  },
  dragControlEnd: function (moveable, e) {
    var datas = e.datas,
        parentEvent = e.parentEvent;

    if (!datas.isResize) {
      return;
    }

    datas.isResize = false;
    var params = fillEndParams(moveable, e, {});
    !parentEvent && triggerEvent(moveable, "onResizeEnd", params);
    return params;
  },
  dragGroupControlCondition: directionCondition$1,
  dragGroupControlStart: function (moveable, e) {
    var datas = e.datas;
    var params = this.dragControlStart(moveable, __assign(__assign({}, e), {
      isGroup: true
    }));

    if (!params) {
      return false;
    }

    var originalEvents = fillChildEvents(moveable, "resizable", e);

    function setDist(child, ev) {
      var fixedDirection = datas.fixedDirection;
      var fixedPosition = datas.fixedPosition;
      var startPositions = ev.datas.startPositions || getAbsolutePosesByState(child.state);
      var pos = getPosByDirection(startPositions, fixedDirection);

      var _a = calculate(createRotateMatrix(-moveable.rotation / 180 * Math.PI, 3), [pos[0] - fixedPosition[0], pos[1] - fixedPosition[1], 1], 3),
          originalX = _a[0],
          originalY = _a[1];

      ev.datas.originalX = originalX;
      ev.datas.originalY = originalY;
      return ev;
    }

    var parentStartOffsetWidth = datas.startOffsetWidth,
        parentStartOffsetHeight = datas.startOffsetHeight;

    function updateGroupMin() {
      var originalMinSize = datas.minSize;
      originalEvents.forEach(function (ev) {
        var _a = ev.datas,
            childMinSize = _a.minSize,
            childStartOffsetWidth = _a.startOffsetWidth,
            childStartOffsetHeight = _a.startOffsetHeight;
        var parentMinWidth = parentStartOffsetWidth * (childStartOffsetWidth ? childMinSize[0] / childStartOffsetWidth : 0);
        var parentMinHeight = parentStartOffsetHeight * (childStartOffsetHeight ? childMinSize[1] / childStartOffsetHeight : 0);
        originalMinSize[0] = Math.max(originalMinSize[0], parentMinWidth);
        originalMinSize[1] = Math.max(originalMinSize[1], parentMinHeight);
      });
    }

    function updateGroupMax() {
      var originalMaxSize = datas.maxSize;
      originalEvents.forEach(function (ev) {
        var _a = ev.datas,
            childMaxSize = _a.maxSize,
            childStartOffsetWidth = _a.startOffsetWidth,
            childStartOffsetHeight = _a.startOffsetHeight;
        var parentMaxWidth = parentStartOffsetWidth * (childStartOffsetWidth ? childMaxSize[0] / childStartOffsetWidth : 0);
        var parentMaxHeight = parentStartOffsetHeight * (childStartOffsetHeight ? childMaxSize[1] / childStartOffsetHeight : 0);
        originalMaxSize[0] = Math.min(originalMaxSize[0], parentMaxWidth);
        originalMaxSize[1] = Math.min(originalMaxSize[1], parentMaxHeight);
      });
    }

    var events = triggerChildAbles(moveable, this, "dragControlStart", e, function (child, ev) {
      return setDist(child, ev);
    });
    updateGroupMin();
    updateGroupMax();

    var setFixedDirection = function (fixedDirection) {
      params.setFixedDirection(fixedDirection);
      events.forEach(function (ev, i) {
        ev.setFixedDirection(fixedDirection);
        setDist(ev.moveable, originalEvents[i]);
      });
    };

    datas.setFixedDirection = setFixedDirection;

    var nextParams = __assign(__assign({}, params), {
      targets: moveable.props.targets,
      events: events.map(function (ev) {
        return __assign(__assign({}, ev), {
          setMin: function (minSize) {
            ev.setMin(minSize);
            updateGroupMin();
          },
          setMax: function (maxSize) {
            ev.setMax(maxSize);
            updateGroupMax();
          }
        });
      }),
      setFixedDirection: setFixedDirection,
      setMin: function (minSize) {
        params.setMin(minSize);
        updateGroupMin();
      },
      setMax: function (maxSize) {
        params.setMax(maxSize);
        updateGroupMax();
      }
    });

    var result = triggerEvent(moveable, "onResizeGroupStart", nextParams);
    datas.isResize = result !== false;
    return datas.isResize ? params : false;
  },
  dragGroupControl: function (moveable, e) {
    var datas = e.datas;

    if (!datas.isResize) {
      return;
    }

    var props = getProps(moveable.props, "resizable");
    catchEvent(moveable, "onBeforeResize", function (parentEvent) {
      triggerEvent(moveable, "onBeforeResizeGroup", fillParams(moveable, e, __assign(__assign({}, parentEvent), {
        targets: props.targets
      }), true));
    });
    var params = this.dragControl(moveable, __assign(__assign({}, e), {
      isGroup: true
    }));

    if (!params) {
      return;
    }

    var boundingWidth = params.boundingWidth,
        boundingHeight = params.boundingHeight,
        dist = params.dist;
    var keepRatio = props.keepRatio;
    var parentScale = [boundingWidth / (boundingWidth - dist[0]), boundingHeight / (boundingHeight - dist[1])];
    var fixedPosition = datas.fixedPosition;
    var events = triggerChildAbles(moveable, this, "dragControl", e, function (_, ev) {
      var _a = calculate(createRotateMatrix(moveable.rotation / 180 * Math.PI, 3), [ev.datas.originalX * parentScale[0], ev.datas.originalY * parentScale[1], 1], 3),
          clientX = _a[0],
          clientY = _a[1];

      return __assign(__assign({}, ev), {
        parentDist: null,
        parentScale: parentScale,
        dragClient: plus(fixedPosition, [clientX, clientY]),
        parentKeepRatio: keepRatio
      });
    });

    var nextParams = __assign({
      targets: props.targets,
      events: events
    }, params);

    triggerEvent(moveable, "onResizeGroup", nextParams);
    return nextParams;
  },
  dragGroupControlEnd: function (moveable, e) {
    var isDrag = e.isDrag,
        datas = e.datas;

    if (!datas.isResize) {
      return;
    }

    this.dragControlEnd(moveable, e);
    var events = triggerChildAbles(moveable, this, "dragControlEnd", e);
    var nextParams = fillEndParams(moveable, e, {
      targets: moveable.props.targets,
      events: events
    });
    triggerEvent(moveable, "onResizeGroupEnd", nextParams);
    return isDrag;
  },

  /**
   * @method Moveable.Resizable#request
   * @param {Moveable.Resizable.ResizableRequestParam} e - the Resizable's request parameter
   * @return {Moveable.Requester} Moveable Requester
   * @example
    * // Instantly Request (requestStart - request - requestEnd)
   * // Use Relative Value
   * moveable.request("resizable", { deltaWidth: 10, deltaHeight: 10 }, true);
   *
   * // Use Absolute Value
   * moveable.request("resizable", { offsetWidth: 100, offsetHeight: 100 }, true);
   *
   * // requestStart
   * const requester = moveable.request("resizable");
   *
   * // request
   * // Use Relative Value
   * requester.request({ deltaWidth: 10, deltaHeight: 10 });
   * requester.request({ deltaWidth: 10, deltaHeight: 10 });
   * requester.request({ deltaWidth: 10, deltaHeight: 10 });
   *
   * // Use Absolute Value
   * moveable.request("resizable", { offsetWidth: 100, offsetHeight: 100 });
   * moveable.request("resizable", { offsetWidth: 110, offsetHeight: 100 });
   * moveable.request("resizable", { offsetWidth: 120, offsetHeight: 100 });
   *
   * // requestEnd
   * requester.requestEnd();
   */
  request: function (moveable) {
    var datas = {};
    var distWidth = 0;
    var distHeight = 0;
    var rect = moveable.getRect();
    return {
      isControl: true,
      requestStart: function (e) {
        var _a;

        return {
          datas: datas,
          parentDirection: e.direction || [1, 1],
          parentIsWidth: (_a = e === null || e === void 0 ? void 0 : e.horizontal) !== null && _a !== void 0 ? _a : true
        };
      },
      request: function (e) {
        if ("offsetWidth" in e) {
          distWidth = e.offsetWidth - rect.offsetWidth;
        } else if ("deltaWidth" in e) {
          distWidth += e.deltaWidth;
        }

        if ("offsetHeight" in e) {
          distHeight = e.offsetHeight - rect.offsetHeight;
        } else if ("deltaHeight" in e) {
          distHeight += e.deltaHeight;
        }

        return {
          datas: datas,
          parentDist: [distWidth, distHeight],
          parentKeepRatio: e.keepRatio
        };
      },
      requestEnd: function () {
        return {
          datas: datas,
          isDrag: true
        };
      }
    };
  },
  unset: function (moveable) {
    moveable.state.gestos.resizable = null;
  }
};
/**
 * Whether or not target can be resized.
 * @name Moveable.Resizable#resizable
 * @default false
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     resizable: false,
 * });
 *
 * moveable.resizable = true;
 */

/**
 * throttle of width, height when resize. If throttleResize is set to less than 1, the target may shake.
 * @name Moveable.Resizable#throttleResize
 * @default 1
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *   resizable: true,
 *   throttleResize: 1,
 * });
 *
 * moveable.throttleResize = 0;
 */

/**
 * When resize or scale, keeps a ratio of the width, height.
 * @name Moveable.Resizable#keepRatio
 * @default false
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *   resizable: true,
 * });
 *
 * moveable.keepRatio = true;
 */

/**
 * Set directions to show the control box.
 * @name Moveable.Resizable#renderDirections
 * @default ["n", "nw", "ne", "s", "se", "sw", "e", "w"]
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *   resizable: true,
 *   renderDirections: ["n", "nw", "ne", "s", "se", "sw", "e", "w"],
 * });
 *
 * moveable.renderDirections = ["nw", "ne", "sw", "se"];
 */

/**
 * Function to convert size for resize
 * @name Moveable.Resizable#resizeFormat
 * @default oneself
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *   resizable: true,
 *   resizeFormat: v => v,
 * });
 *
 * moveable.resizeFormat = (size: number[]) => ([Math.trunc(size[0]), Math.trunc(size[1])];
 */

/**
 * When the resize starts, the resizeStart event is called.
 * @memberof Moveable.Resizable
 * @event resizeStart
 * @param {Moveable.Resizable.OnResizeStart} - Parameters for the resizeStart event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, { resizable: true });
 * moveable.on("resizeStart", ({ target }) => {
 *     console.log(target);
 * });
 */

/**
 * When resizing, `beforeResize` is called before `resize` occurs. In `beforeResize`, you can get and set the pre-value before resizing.
 * @memberof Moveable.Resizable
 * @event beforeResize
 * @param {Moveable.Resizable.OnBeforeResize} - Parameters for the `beforeResize` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, { resizable: true });
 * moveable.on("beforeResize", ({ setFixedDirection }) => {
 *     if (shiftKey) {
 *        setFixedDirection([0, 0]);
 *     }
 * });
 * moveable.on("resize", ({ target, width, height, drag }) => {
 *     target.style.width = `${width}px`;
 *     target.style.height = `${height}px`;
 *     target.style.transform = drag.transform;
 * });
 */

/**
 * When resizing, the resize event is called.
 * @memberof Moveable.Resizable
 * @event resize
 * @param {Moveable.Resizable.OnResize} - Parameters for the resize event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, { resizable: true });
 * moveable.on("resize", ({ target, width, height }) => {
 *     target.style.width = `${e.width}px`;
 *     target.style.height = `${e.height}px`;
 * });
 */

/**
 * When the resize finishes, the resizeEnd event is called.
 * @memberof Moveable.Resizable
 * @event resizeEnd
 * @param {Moveable.Resizable.OnResizeEnd} - Parameters for the resizeEnd event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, { resizable: true });
 * moveable.on("resizeEnd", ({ target, isDrag }) => {
 *     console.log(target, isDrag);
 * });
 */

/**
* When the group resize starts, the `resizeGroupStart` event is called.
* @memberof Moveable.Resizable
* @event resizeGroupStart
* @param {Moveable.Resizable.OnResizeGroupStart} - Parameters for the `resizeGroupStart` event
* @example
* import Moveable from "moveable";
*
* const moveable = new Moveable(document.body, {
*     target: [].slice.call(document.querySelectorAll(".target")),
*     resizable: true
* });
* moveable.on("resizeGroupStart", ({ targets }) => {
*     console.log("onResizeGroupStart", targets);
* });
*/

/**
* When the group resize, the `resizeGroup` event is called.
* @memberof Moveable.Resizable
* @event resizeGroup
* @param {Moveable.Resizable.onResizeGroup} - Parameters for the `resizeGroup` event
* @example
* import Moveable from "moveable";
*
* const moveable = new Moveable(document.body, {
*     target: [].slice.call(document.querySelectorAll(".target")),
*     resizable: true
* });
* moveable.on("resizeGroup", ({ targets, events }) => {
*     console.log("onResizeGroup", targets);
*     events.forEach(ev => {
*         const offset = [
*             direction[0] < 0 ? -ev.delta[0] : 0,
*             direction[1] < 0 ? -ev.delta[1] : 0,
*         ];
*         // ev.drag is a drag event that occurs when the group resize.
*         const left = offset[0] + ev.drag.beforeDist[0];
*         const top = offset[1] + ev.drag.beforeDist[1];
*         const width = ev.width;
*         const top = ev.top;
*     });
* });
*/

/**
 * When the group resize finishes, the `resizeGroupEnd` event is called.
 * @memberof Moveable.Resizable
 * @event resizeGroupEnd
 * @param {Moveable.Resizable.OnResizeGroupEnd} - Parameters for the `resizeGroupEnd` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     target: [].slice.call(document.querySelectorAll(".target")),
 *     resizable: true
 * });
 * moveable.on("resizeGroupEnd", ({ targets, isDrag }) => {
 *     console.log("onResizeGroupEnd", targets, isDrag);
 * });
 */

/**
 * @namespace Rotatable
 * @memberof Moveable
 * @description Rotatable indicates whether the target can be rotated.
 */

function setRotateStartInfo(moveable, datas, clientX, clientY, rect) {
  var groupable = moveable.props.groupable;
  var state = moveable.state;
  var n = state.is3d ? 4 : 3;
  var origin = datas.origin;
  var nextOrigin = calculatePosition(moveable.state.rootMatrix, // TO-DO #710
  minus([origin[0], origin[1]], groupable ? [0, 0] : [state.left, state.top]), n);
  var startAbsoluteOrigin = plus([rect.left, rect.top], nextOrigin);
  datas.startAbsoluteOrigin = startAbsoluteOrigin;
  datas.prevDeg = getRad(startAbsoluteOrigin, [clientX, clientY]) / Math.PI * 180;
  datas.defaultDeg = datas.prevDeg;
  datas.prevSnapDeg = 0;
  datas.loop = 0;
  datas.startDist = getDist$1(startAbsoluteOrigin, [clientX, clientY]);
}

function getAbsoluteDist(deg, direction, datas) {
  var defaultDeg = datas.defaultDeg,
      prevDeg = datas.prevDeg;
  var normalizedPrevDeg = prevDeg % 360;
  var loop = Math.floor(prevDeg / 360);

  if (normalizedPrevDeg < 0) {
    normalizedPrevDeg += 360;
  }

  if (normalizedPrevDeg > deg && normalizedPrevDeg > 270 && deg < 90) {
    // 360 => 0
    ++loop;
  } else if (normalizedPrevDeg < deg && normalizedPrevDeg < 90 && deg > 270) {
    // 0 => 360
    --loop;
  }

  var dist = direction * (loop * 360 + deg - defaultDeg);
  datas.prevDeg = defaultDeg + dist;
  return dist;
}

function getAbsoluteDistByClient(clientX, clientY, direction, datas) {
  return getAbsoluteDist(getRad(datas.startAbsoluteOrigin, [clientX, clientY]) / Math.PI * 180, direction, datas);
}

function getRotateInfo(moveable, moveableRect, datas, dist, startValue, checkSnap) {
  var _a = moveable.props.throttleRotate,
      throttleRotate = _a === void 0 ? 0 : _a;
  var prevSnapDeg = datas.prevSnapDeg;
  var snapRotation = 0;
  var isSnap = false;

  if (checkSnap) {
    var result = checkSnapRotate(moveable, moveableRect, dist);
    isSnap = result.isSnap;
    snapRotation = startValue + result.rotation;
  }

  if (!isSnap) {
    snapRotation = throttle(startValue + dist, throttleRotate);
  }

  var snapDeg = snapRotation - startValue;
  datas.prevSnapDeg = snapDeg;
  return [snapDeg - prevSnapDeg, snapDeg, snapRotation];
}

function getRotationPositions(rotationPosition, _a, direction) {
  var pos1 = _a[0],
      pos2 = _a[1],
      pos3 = _a[2],
      pos4 = _a[3];

  if (rotationPosition === "none") {
    return;
  }

  var _b = (rotationPosition || "top").split("-"),
      dir1 = _b[0],
      dir2 = _b[1];

  var radPoses = [pos1, pos2]; // if (scale[0] < 0) {
  //     dir1 = getReversePositionX(dir1);
  //     dir2 = getReversePositionX(dir2);
  // }
  // if (scale[1] < 0) {
  //     dir1 = getReversePositionY(dir1);
  //     dir2 = getReversePositionY(dir2);
  // }

  if (dir1 === "left") {
    radPoses = [pos3, pos1];
  } else if (dir1 === "right") {
    radPoses = [pos2, pos4];
  } else if (dir1 === "bottom") {
    radPoses = [pos4, pos3];
  }

  var pos = [(radPoses[0][0] + radPoses[1][0]) / 2, (radPoses[0][1] + radPoses[1][1]) / 2];
  var rad = getRotationRad(radPoses, direction);

  if (dir2) {
    var isStart = dir2 === "top" || dir2 === "left";
    var isReverse = dir1 === "bottom" || dir1 === "left";
    pos = radPoses[isStart && !isReverse || !isStart && isReverse ? 0 : 1];
  }

  return [pos, rad];
}

function dragControlCondition(moveable, e) {
  if (e.isRequest) {
    return e.requestAble === "rotatable";
  }

  var target = e.inputEvent.target;

  if (hasClass(target, prefix("rotation-control")) || hasClass(target, prefix("around-control")) || hasClass(target, prefix("control")) && hasClass(target, prefix("rotatable"))) {
    return true;
  }

  var rotationTarget = moveable.props.rotationTarget;

  if (rotationTarget) {
    return getRefTargets(rotationTarget, true).some(function (element) {
      if (!element) {
        return false;
      }

      return target === element || target.contains(element);
    });
  }

  return false;
}

var directionCSS = DIRECTIONS.map(function (dir) {
  var top = "";
  var left = "";
  var originX = "center";
  var originY = "center";

  if (dir.indexOf("n") > -1) {
    top = "top: -20px;";
    originY = "bottom";
  }

  if (dir.indexOf("s") > -1) {
    top = "top: 0px;";
    originY = "top";
  }

  if (dir.indexOf("w") > -1) {
    left = "left: -20px;";
    originX = "right";
  }

  if (dir.indexOf("e") > -1) {
    left = "left: 0px;";
    originX = "left";
  }

  return ".around-control[data-direction*=\"".concat(dir, "\"] {\n        ").concat(left).concat(top, "\n        transform-origin: ").concat(originX, " ").concat(originY, ";\n    }");
}).join("\n");
var css = ".rotation {\n    position: absolute;\n    height: 40px;\n    width: 1px;\n    transform-origin: 50% 100%;\n    height: calc(40px * var(--zoom));\n    top: auto;\n    left: 0;\n    bottom: 100%;\n    will-change: transform;\n}\n.rotation .rotation-line {\n    display: block;\n    width: 100%;\n    height: 100%;\n    transform-origin: 50% 50%;\n}\n.rotation .rotation-control {\n    border-color: #4af;\n    border-color: var(--moveable-color);\n    background:#fff;\n    cursor: alias;\n}\n:global .view-rotation-dragging, .rotatable.direction.control {\n    cursor: alias;\n}\n.around-control {\n    position: absolute;\n    will-change: transform;\n    width: 20px;\n    height: 20px;\n    left: -10px;\n    top: -10px;\n    box-sizing: border-box;\n    background: transparent;\n    z-index: 8;\n    cursor: alias;\n    transform-origin: center center;\n}\n.rotatable.direction.control.move {\n    cursor: move;\n}\n".concat(directionCSS, "\n");
var Rotatable = {
  name: "rotatable",
  canPinch: true,
  props: {
    rotatable: Boolean,
    rotationPosition: String,
    throttleRotate: Number,
    renderDirections: Object,
    rotationTarget: Object,
    rotateAroundControls: Boolean,
    edge: Boolean,
    resolveAblesWithRotatable: Object
  },
  events: {
    onRotateStart: "rotateStart",
    onBeforeRotate: "beforeRotate",
    onRotate: "rotate",
    onRotateEnd: "rotateEnd",
    onRotateGroupStart: "rotateGroupStart",
    onBeforeRotateGroup: "beforeRotateGroup",
    onRotateGroup: "rotateGroup",
    onRotateGroupEnd: "rotateGroupEnd"
  },
  css: [css],
  viewClassName: function (moveable) {
    if (!moveable.isDragging("rotatable")) {
      return "";
    }

    return prefix("view-rotation-dragging");
  },
  render: function (moveable, React) {
    var _a = getProps(moveable.props, "rotatable"),
        rotatable = _a.rotatable,
        rotationPosition = _a.rotationPosition,
        zoom = _a.zoom,
        renderDirections = _a.renderDirections,
        rotateAroundControls = _a.rotateAroundControls,
        resolveAblesWithRotatable = _a.resolveAblesWithRotatable;

    var _b = moveable.getState(),
        renderPoses = _b.renderPoses,
        direction = _b.direction;

    if (!rotatable) {
      return null;
    }

    var positions = getRotationPositions(rotationPosition, renderPoses, direction);
    var jsxs = [];

    if (positions) {
      var pos = positions[0],
          rad = positions[1];
      jsxs.push(React.createElement("div", {
        key: "rotation",
        className: prefix("rotation"),
        style: {
          // tslint:disable-next-line: max-line-length
          transform: "translate(-50%) translate(".concat(pos[0], "px, ").concat(pos[1], "px) rotate(").concat(rad, "rad)")
        }
      }, React.createElement("div", {
        className: prefix("line rotation-line"),
        style: {
          transform: "scaleX(".concat(zoom, ")")
        }
      }), React.createElement("div", {
        className: prefix("control rotation-control"),
        style: {
          transform: "translate(0.5px) scale(".concat(zoom, ")")
        }
      })));
    }

    if (renderDirections) {
      var ables = getKeys(resolveAblesWithRotatable || {});
      var resolveMap_1 = {};
      ables.forEach(function (name) {
        resolveAblesWithRotatable[name].forEach(function (direction) {
          resolveMap_1[direction] = name;
        });
      });
      var directionControlInfos = [];

      if (isArray(renderDirections)) {
        directionControlInfos = renderDirections.map(function (dir) {
          var able = resolveMap_1[dir];
          return {
            data: able ? {
              resolve: able
            } : {},
            classNames: able ? ["move"] : [],
            dir: dir
          };
        });
      }

      jsxs.push.apply(jsxs, renderDirectionControlsByInfos(moveable, "rotatable", directionControlInfos, React));
    }

    if (rotateAroundControls) {
      jsxs.push.apply(jsxs, renderAroundControls(moveable, React));
    }

    return jsxs;
  },
  dragControlCondition: dragControlCondition,
  dragControlStart: function (moveable, e) {
    var _a;

    var _b;

    var datas = e.datas,
        clientX = e.clientX,
        clientY = e.clientY,
        parentRotate = e.parentRotate,
        parentFlag = e.parentFlag,
        isPinch = e.isPinch,
        isRequest = e.isRequest;
    var state = moveable.state;
    var target = state.target,
        left = state.left,
        top = state.top,
        direction = state.direction,
        beforeDirection = state.beforeDirection,
        targetTransform = state.targetTransform,
        moveableClientRect = state.moveableClientRect,
        offsetMatrix = state.offsetMatrix,
        targetMatrix = state.targetMatrix,
        allMatrix = state.allMatrix,
        width = state.width,
        height = state.height;

    if (!isRequest && !target) {
      return false;
    }

    var rect = moveable.getRect();
    datas.rect = rect;
    datas.transform = targetTransform;
    datas.left = left;
    datas.top = top;

    var setFixedDirection = function (fixedDirection) {
      datas.fixedDirection = fixedDirection;
      datas.fixedPosition = getDirectionOffset(moveable, fixedDirection);

      if (resizeStart) {
        resizeStart.setFixedDirection(fixedDirection);
      }
    };

    var startClientX = clientX;
    var startClientY = clientY;

    if (isRequest || isPinch || parentFlag) {
      var externalRotate = parentRotate || 0;
      datas.beforeInfo = {
        origin: rect.beforeOrigin,
        prevDeg: externalRotate,
        defaultDeg: externalRotate,
        prevSnapDeg: 0,
        startDist: 0
      };
      datas.afterInfo = __assign(__assign({}, datas.beforeInfo), {
        origin: rect.origin
      });
      datas.absoluteInfo = __assign(__assign({}, datas.beforeInfo), {
        origin: rect.origin,
        startValue: externalRotate
      });
    } else {
      var inputTarget = (_b = e.inputEvent) === null || _b === void 0 ? void 0 : _b.target;

      if (inputTarget) {
        var regionDirection = inputTarget.getAttribute("data-direction") || "";
        var controlDirection = DIRECTION_REGION_TO_DIRECTION[regionDirection];

        if (controlDirection) {
          datas.isControl = true;
          datas.isAroundControl = hasClass(inputTarget, prefix("around-control"));
          datas.controlDirection = controlDirection;
          var resolve = inputTarget.getAttribute("data-resolve");

          if (resolve) {
            datas.resolveAble = resolve;
          }

          var clientPoses = calculateMoveableClientPositions(state.rootMatrix, state.renderPoses, moveableClientRect);
          _a = getPosByDirection(clientPoses, controlDirection), startClientX = _a[0], startClientY = _a[1];
        }
      }

      datas.beforeInfo = {
        origin: rect.beforeOrigin
      };
      datas.afterInfo = {
        origin: rect.origin
      };
      datas.absoluteInfo = {
        origin: rect.origin,
        startValue: rect.rotation
      };
      var originalFixedDirection_1 = setFixedDirection;

      setFixedDirection = function (fixedDirection) {
        var n = state.is3d ? 4 : 3;
        var originalPosition = getPosByDirection([[0, 0], [width, 0], [0, height], [width, height]], fixedDirection);

        var _a = plus(getOrigin(targetMatrix, n), originalPosition),
            originX = _a[0],
            originY = _a[1];

        var fixedBeforeOrigin = calculate(offsetMatrix, convertPositionMatrix([originX, originY], n));
        var fixedAfterOrigin = calculate(allMatrix, convertPositionMatrix([originalPosition[0], originalPosition[1]], n));
        originalFixedDirection_1(fixedDirection);
        datas.beforeInfo.origin = fixedBeforeOrigin;
        datas.afterInfo.origin = fixedAfterOrigin;
        datas.absoluteInfo.origin = fixedAfterOrigin;
        setRotateStartInfo(moveable, datas.beforeInfo, startClientX, startClientY, moveableClientRect);
        setRotateStartInfo(moveable, datas.afterInfo, startClientX, startClientY, moveableClientRect);
        setRotateStartInfo(moveable, datas.absoluteInfo, startClientX, startClientY, moveableClientRect);
      };
    }

    datas.startClientX = startClientX;
    datas.startClientY = startClientY;
    datas.direction = direction;
    datas.beforeDirection = beforeDirection;
    datas.startValue = 0;
    datas.datas = {};
    setDefaultTransformIndex(e, "rotate");
    var dragStart = false;
    var resizeStart = false;

    if (datas.isControl && datas.resolveAble) {
      var resolveAble = datas.resolveAble;

      if (resolveAble === "resizable") {
        resizeStart = Resizable.dragControlStart(moveable, __assign(__assign({}, new CustomGesto("resizable").dragStart([0, 0], e)), {
          parentDirection: datas.controlDirection,
          parentFixedDirection: datas.fixedDirection
        }));
      }
    }

    if (!resizeStart) {
      dragStart = Draggable.dragStart(moveable, new CustomGesto().dragStart([0, 0], e));
    }

    setFixedDirection(getOriginDirection(moveable));
    var params = fillParams(moveable, e, __assign(__assign({
      set: function (rotatation) {
        datas.startValue = rotatation * Math.PI / 180;
      },
      setFixedDirection: setFixedDirection
    }, fillTransformStartEvent(e)), {
      dragStart: dragStart,
      resizeStart: resizeStart
    }));
    var result = triggerEvent(moveable, "onRotateStart", params);
    datas.isRotate = result !== false;
    state.snapRenderInfo = {
      request: e.isRequest
    };
    return datas.isRotate ? params : false;
  },
  dragControl: function (moveable, e) {
    var _a, _b, _c;

    var datas = e.datas,
        distX = e.distX,
        distY = e.distY,
        parentRotate = e.parentRotate,
        parentFlag = e.parentFlag,
        isPinch = e.isPinch,
        groupDelta = e.groupDelta;
    var beforeDirection = datas.beforeDirection,
        beforeInfo = datas.beforeInfo,
        afterInfo = datas.afterInfo,
        absoluteInfo = datas.absoluteInfo,
        isRotate = datas.isRotate,
        startValue = datas.startValue,
        rect = datas.rect,
        startClientX = datas.startClientX,
        startClientY = datas.startClientY;

    if (!isRotate) {
      return;
    }

    resolveTransformEvent(e, "rotate");
    var targetDirection = getTransformDirection(e);
    var direction = beforeDirection * targetDirection;
    var parentMoveable = moveable.props.parentMoveable;
    var beforeDelta = 0;
    var beforeDist;
    var beforeRotation;
    var delta = 0;
    var dist;
    var rotation;
    var absoluteDelta = 0;
    var absoluteDist;
    var absoluteRotation;
    var startRotation = 180 / Math.PI * startValue;
    var absoluteStartRotation = absoluteInfo.startValue;
    var isSnap = false;
    var nextClientX = startClientX + distX;
    var nextClientY = startClientY + distY;

    if (!parentFlag && "parentDist" in e) {
      var parentDist = e.parentDist;
      beforeDist = parentDist;
      dist = parentDist;
      absoluteDist = parentDist;
    } else if (isPinch || parentFlag) {
      beforeDist = getAbsoluteDist(parentRotate, beforeDirection, beforeInfo);
      dist = getAbsoluteDist(parentRotate, direction, afterInfo);
      absoluteDist = getAbsoluteDist(parentRotate, direction, absoluteInfo);
    } else {
      beforeDist = getAbsoluteDistByClient(nextClientX, nextClientY, beforeDirection, beforeInfo);
      dist = getAbsoluteDistByClient(nextClientX, nextClientY, direction, afterInfo);
      absoluteDist = getAbsoluteDistByClient(nextClientX, nextClientY, direction, absoluteInfo);
      isSnap = true;
    }

    beforeRotation = startRotation + beforeDist;
    rotation = startRotation + dist;
    absoluteRotation = absoluteStartRotation + absoluteDist;
    triggerEvent(moveable, "onBeforeRotate", fillParams(moveable, e, {
      beforeRotation: beforeRotation,
      rotation: rotation,
      absoluteRotation: absoluteRotation,
      setRotation: function (nextRotation) {
        dist = nextRotation - startRotation;
        beforeDist = dist;
        absoluteDist = dist;
      }
    }, true));
    _a = getRotateInfo(moveable, rect, beforeInfo, beforeDist, startRotation, isSnap), beforeDelta = _a[0], beforeDist = _a[1], beforeRotation = _a[2];
    _b = getRotateInfo(moveable, rect, afterInfo, dist, startRotation, isSnap), delta = _b[0], dist = _b[1], rotation = _b[2];
    _c = getRotateInfo(moveable, rect, absoluteInfo, absoluteDist, absoluteStartRotation, isSnap), absoluteDelta = _c[0], absoluteDist = _c[1], absoluteRotation = _c[2];

    if (!absoluteDelta && !delta && !beforeDelta && !parentMoveable) {
      return;
    }

    var nextTransform = convertTransformFormat(datas, "rotate(".concat(rotation, "deg)"), "rotate(".concat(dist, "deg)"));
    var inverseDist = getRotateDist(moveable, dist, datas);
    var inverseDelta = minus(plus(groupDelta || [0, 0], inverseDist), datas.prevInverseDist || [0, 0]);
    datas.prevInverseDist = inverseDist;
    datas.requestValue = null;
    var dragEvent = fillTransformEvent(moveable, nextTransform, inverseDelta, isPinch, e);
    var transformEvent = dragEvent;
    var parentDistance = getDist$1([nextClientX, nextClientY], absoluteInfo.startAbsoluteOrigin) - absoluteInfo.startDist;
    var resize = undefined;

    if (datas.resolveAble === "resizable") {
      var resizeEvent = Resizable.dragControl(moveable, __assign(__assign({}, setCustomDrag(e, moveable.state, [e.deltaX, e.deltaY], !!isPinch, false, "resizable")), {
        resolveMatrix: true,
        parentDistance: parentDistance
      }));

      if (resizeEvent) {
        resize = resizeEvent;
        transformEvent = fillAfterTransform(transformEvent, resizeEvent, e);
      }
    }

    var params = fillParams(moveable, e, __assign(__assign({
      delta: delta,
      dist: dist,
      rotate: rotation,
      rotation: rotation,
      beforeDist: beforeDist,
      beforeDelta: beforeDelta,
      beforeRotate: beforeRotation,
      beforeRotation: beforeRotation,
      absoluteDist: absoluteDist,
      absoluteDelta: absoluteDelta,
      absoluteRotate: absoluteRotation,
      absoluteRotation: absoluteRotation,
      isPinch: !!isPinch,
      resize: resize
    }, dragEvent), transformEvent));
    triggerEvent(moveable, "onRotate", params);
    return params;
  },
  dragControlAfter: function (moveable, e) {
    e.datas.requestValue;
  },
  dragControlEnd: function (moveable, e) {
    var datas = e.datas;

    if (!datas.isRotate) {
      return;
    }

    datas.isRotate = false;
    var params = fillEndParams(moveable, e, {});
    triggerEvent(moveable, "onRotateEnd", params);
    return params;
  },
  dragGroupControlCondition: dragControlCondition,
  dragGroupControlStart: function (moveable, e) {
    var datas = e.datas;
    var _a = moveable.state,
        parentLeft = _a.left,
        parentTop = _a.top,
        parentBeforeOrigin = _a.beforeOrigin;
    var params = this.dragControlStart(moveable, e);

    if (!params) {
      return false;
    }

    params.set(datas.beforeDirection * moveable.rotation);
    var events = triggerChildAbles(moveable, this, "dragControlStart", e, function (child, ev) {
      var _a = child.state,
          left = _a.left,
          top = _a.top,
          beforeOrigin = _a.beforeOrigin;
      var childClient = plus(minus([left, top], [parentLeft, parentTop]), minus(beforeOrigin, parentBeforeOrigin));
      ev.datas.startGroupClient = childClient;
      ev.datas.groupClient = childClient;
      return __assign(__assign({}, ev), {
        parentRotate: 0
      });
    });

    var nextParams = __assign(__assign({}, params), {
      targets: moveable.props.targets,
      events: events
    });

    var result = triggerEvent(moveable, "onRotateGroupStart", nextParams);
    datas.isRotate = result !== false;
    return datas.isRotate ? params : false;
  },
  dragGroupControl: function (moveable, e) {
    var datas = e.datas;

    if (!datas.isRotate) {
      return;
    }

    catchEvent(moveable, "onBeforeRotate", function (parentEvent) {
      triggerEvent(moveable, "onBeforeRotateGroup", fillParams(moveable, e, __assign(__assign({}, parentEvent), {
        targets: moveable.props.targets
      }), true));
    });
    var params = this.dragControl(moveable, e);

    if (!params) {
      return;
    }

    var direction = datas.beforeDirection;
    var parentRotate = params.beforeDist;
    var rad = parentRotate / 180 * Math.PI;
    var events = triggerChildAbles(moveable, this, "dragControl", e, function (_, ev) {
      var startGroupClient = ev.datas.startGroupClient;
      var _a = ev.datas.groupClient,
          prevClientX = _a[0],
          prevClientY = _a[1];

      var _b = rotate(startGroupClient, rad * direction),
          clientX = _b[0],
          clientY = _b[1];

      var delta = [clientX - prevClientX, clientY - prevClientY];
      ev.datas.groupClient = [clientX, clientY];
      return __assign(__assign({}, ev), {
        parentRotate: parentRotate,
        groupDelta: delta
      });
    });
    moveable.rotation = direction * params.beforeRotation;

    var nextParams = __assign({
      targets: moveable.props.targets,
      events: events,
      set: function (rotation) {
        moveable.rotation = rotation;
      },
      setGroupRotation: function (rotation) {
        moveable.rotation = rotation;
      }
    }, params);

    triggerEvent(moveable, "onRotateGroup", nextParams);
    return nextParams;
  },
  dragGroupControlEnd: function (moveable, e) {
    var isDrag = e.isDrag,
        datas = e.datas;

    if (!datas.isRotate) {
      return;
    }

    this.dragControlEnd(moveable, e);
    var events = triggerChildAbles(moveable, this, "dragControlEnd", e);
    var nextParams = fillEndParams(moveable, e, {
      targets: moveable.props.targets,
      events: events
    });
    triggerEvent(moveable, "onRotateGroupEnd", nextParams);
    return isDrag;
  },

  /**
   * @method Moveable.Rotatable#request
   * @param {object} [e] - the Resizable's request parameter
   * @param {number} [e.deltaRotate=0] -  delta number of rotation
   * @param {number} [e.rotate=0] - absolute number of moveable's rotation
   * @return {Moveable.Requester} Moveable Requester
   * @example
    * // Instantly Request (requestStart - request - requestEnd)
   * moveable.request("rotatable", { deltaRotate: 10 }, true);
   *
   * * moveable.request("rotatable", { rotate: 10 }, true);
   *
   * // requestStart
   * const requester = moveable.request("rotatable");
   *
   * // request
   * requester.request({ deltaRotate: 10 });
   * requester.request({ deltaRotate: 10 });
   * requester.request({ deltaRotate: 10 });
   *
   * requester.request({ rotate: 10 });
   * requester.request({ rotate: 20 });
   * requester.request({ rotate: 30 });
   *
   * // requestEnd
   * requester.requestEnd();
   */
  request: function (moveable) {
    var datas = {};
    var distRotate = 0;
    var startRotation = moveable.getRotation();
    return {
      isControl: true,
      requestStart: function () {
        return {
          datas: datas
        };
      },
      request: function (e) {
        if ("deltaRotate" in e) {
          distRotate += e.deltaRotate;
        } else if ("rotate" in e) {
          distRotate = e.rotate - startRotation;
        }

        return {
          datas: datas,
          parentDist: distRotate
        };
      },
      requestEnd: function () {
        return {
          datas: datas,
          isDrag: true
        };
      }
    };
  }
};
/**
 * Whether or not target can be rotated. (default: false)
 * @name Moveable.Rotatable#rotatable
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body);
 *
 * moveable.rotatable = true;
 */

/**
 * You can specify the position of the rotation. (default: "top")
 * @name Moveable.Rotatable#rotationPosition
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *   rotationPosition: "top",
 * });
 *
 * moveable.rotationPosition = "bottom"
 */

/**
 * throttle of angle(degree) when rotate.
 * @name Moveable.Rotatable#throttleRotate
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body);
 *
 * moveable.throttleRotate = 1;
 */

/**
 * When the rotate starts, the rotateStart event is called.
 * @memberof Moveable.Rotatable
 * @event rotateStart
 * @param {Moveable.Rotatable.OnRotateStart} - Parameters for the rotateStart event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, { rotatable: true });
 * moveable.on("rotateStart", ({ target }) => {
 *     console.log(target);
 * });
 */

/**
* When rotating, the rotate event is called.
* @memberof Moveable.Rotatable
* @event rotate
* @param {Moveable.Rotatable.OnRotate} - Parameters for the rotate event
* @example
* import Moveable from "moveable";
*
* const moveable = new Moveable(document.body, { rotatable: true });
* moveable.on("rotate", ({ target, transform, dist }) => {
*     target.style.transform = transform;
* });
*/

/**
 * When the rotate finishes, the rotateEnd event is called.
 * @memberof Moveable.Rotatable
 * @event rotateEnd
 * @param {Moveable.Rotatable.OnRotateEnd} - Parameters for the rotateEnd event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, { rotatable: true });
 * moveable.on("rotateEnd", ({ target, isDrag }) => {
 *     console.log(target, isDrag);
 * });
 */

/**
 * When the group rotate starts, the `rotateGroupStart` event is called.
 * @memberof Moveable.Rotatable
 * @event rotateGroupStart
 * @param {Moveable.Rotatable.OnRotateGroupStart} - Parameters for the `rotateGroupStart` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     target: [].slice.call(document.querySelectorAll(".target")),
 *     rotatable: true
 * });
 * moveable.on("rotateGroupStart", ({ targets }) => {
 *     console.log("onRotateGroupStart", targets);
 * });
 */

/**
* When the group rotate, the `rotateGroup` event is called.
* @memberof Moveable.Rotatable
* @event rotateGroup
* @param {Moveable.Rotatable.OnRotateGroup} - Parameters for the `rotateGroup` event
* @example
* import Moveable from "moveable";
*
* const moveable = new Moveable(document.body, {
*     target: [].slice.call(document.querySelectorAll(".target")),
*     rotatable: true
* });
* moveable.on("rotateGroup", ({ targets, events }) => {
*     console.log("onRotateGroup", targets);
*     events.forEach(ev => {
*         const target = ev.target;
*         // ev.drag is a drag event that occurs when the group rotate.
*         const left = ev.drag.beforeDist[0];
*         const top = ev.drag.beforeDist[1];
*         const deg = ev.beforeDist;
*     });
* });
*/

/**
 * When the group rotate finishes, the `rotateGroupEnd` event is called.
 * @memberof Moveable.Rotatable
 * @event rotateGroupEnd
 * @param {Moveable.Rotatable.OnRotateGroupEnd} - Parameters for the `rotateGroupEnd` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     target: [].slice.call(document.querySelectorAll(".target")),
 *     rotatable: true
 * });
 * moveable.on("rotateGroupEnd", ({ targets, isDrag }) => {
 *     console.log("onRotateGroupEnd", targets, isDrag);
 * });
 */

var directionCondition = getDirectionCondition("scalable");
/**
 * @namespace Scalable
 * @memberof Moveable
 * @description Scalable indicates whether the target's x and y can be scale of transform.
 */

var Scalable = {
  name: "scalable",
  ableGroup: "size",
  canPinch: true,
  props: {
    scalable: Boolean,
    throttleScale: Number,
    renderDirections: String,
    keepRatio: Boolean,
    edge: Boolean
  },
  events: {
    onScaleStart: "scaleStart",
    onBeforeScale: "beforeScale",
    onScale: "scale",
    onScaleEnd: "scaleEnd",
    onScaleGroupStart: "scaleGroupStart",
    onBeforeScaleGroup: "beforeScaleGroup",
    onScaleGroup: "scaleGroup",
    onScaleGroupEnd: "scaleGroupEnd"
  },
  render: getRenderDirections("scalable"),
  dragControlCondition: directionCondition,
  viewClassName: getDirectionViewClassName("scalable"),
  dragControlStart: function (moveable, e) {
    var datas = e.datas,
        isPinch = e.isPinch,
        inputEvent = e.inputEvent,
        parentDirection = e.parentDirection;
    var direction = getTotalDirection(parentDirection, isPinch, inputEvent, datas);
    var _a = moveable.state,
        width = _a.width,
        height = _a.height,
        targetTransform = _a.targetTransform,
        target = _a.target,
        pos1 = _a.pos1,
        pos2 = _a.pos2,
        pos4 = _a.pos4;

    if (!direction || !target) {
      return false;
    }

    if (!isPinch) {
      setDragStart(moveable, e);
    }

    datas.datas = {};
    datas.transform = targetTransform;
    datas.prevDist = [1, 1];
    datas.direction = direction;
    datas.startOffsetWidth = width;
    datas.startOffsetHeight = height;
    datas.startValue = [1, 1];
    var scaleWidth = getDist$1(pos1, pos2);
    var scaleHeight = getDist$1(pos2, pos4);
    var isWidth = !direction[0] && !direction[1] || direction[0] || !direction[1];
    datas.scaleWidth = scaleWidth;
    datas.scaleHeight = scaleHeight;
    datas.scaleXRatio = scaleWidth / width;
    datas.scaleYRatio = scaleHeight / height;
    setDefaultTransformIndex(e, "scale");
    datas.isWidth = isWidth;

    function setRatio(ratio) {
      datas.ratio = ratio && isFinite(ratio) ? ratio : 0;
    }

    datas.startPositions = getAbsolutePosesByState(moveable.state);

    function setFixedDirection(fixedDirection) {
      datas.fixedDirection = fixedDirection;
      datas.fixedPosition = getPosByDirection(datas.startPositions, fixedDirection);
    }

    datas.setFixedDirection = setFixedDirection;
    setRatio(getDist$1(pos1, pos2) / getDist$1(pos2, pos4));
    setFixedDirection([-direction[0], -direction[1]]);
    var params = fillParams(moveable, e, __assign(__assign({
      direction: direction,
      set: function (scale) {
        datas.startValue = scale;
      },
      setRatio: setRatio,
      setFixedDirection: setFixedDirection
    }, fillTransformStartEvent(e)), {
      dragStart: Draggable.dragStart(moveable, new CustomGesto().dragStart([0, 0], e))
    }));
    var result = triggerEvent(moveable, "onScaleStart", params);
    datas.startFixedDirection = datas.fixedDirection;

    if (result !== false) {
      datas.isScale = true;
      moveable.state.snapRenderInfo = {
        request: e.isRequest,
        direction: direction
      };
    }

    return datas.isScale ? params : false;
  },
  dragControl: function (moveable, e) {
    resolveTransformEvent(e, "scale");
    var datas = e.datas,
        parentKeepRatio = e.parentKeepRatio,
        parentFlag = e.parentFlag,
        isPinch = e.isPinch,
        dragClient = e.dragClient,
        isRequest = e.isRequest;
    var prevDist = datas.prevDist,
        direction = datas.direction,
        startOffsetWidth = datas.startOffsetWidth,
        startOffsetHeight = datas.startOffsetHeight,
        isScale = datas.isScale,
        startValue = datas.startValue,
        isWidth = datas.isWidth,
        ratio = datas.ratio;

    if (!isScale) {
      return false;
    }

    var props = moveable.props;
    var throttleScale = props.throttleScale,
        parentMoveable = props.parentMoveable;
    var sizeDirection = direction;

    if (!direction[0] && !direction[1]) {
      sizeDirection = [1, 1];
    }

    var keepRatio = ratio && (parentKeepRatio != null ? parentKeepRatio : props.keepRatio) || false;
    var state = moveable.state;

    function getNextScale() {
      var _a = getOffsetSizeDist(sizeDirection, keepRatio, datas, e),
          distWidth = _a.distWidth,
          distHeight = _a.distHeight;

      var scaleX = (startOffsetWidth + distWidth) / startOffsetWidth;
      var scaleY = (startOffsetHeight + distHeight) / startOffsetHeight;
      scaleX = sizeDirection[0] || keepRatio ? scaleX * startValue[0] : startValue[0];
      scaleY = sizeDirection[1] || keepRatio ? scaleY * startValue[1] : startValue[1];

      if (scaleX === 0) {
        scaleX = (prevDist[0] > 0 ? 1 : -1) * MIN_SCALE;
      }

      if (scaleY === 0) {
        scaleY = (prevDist[1] > 0 ? 1 : -1) * MIN_SCALE;
      }

      return [scaleX, scaleY];
    }

    var scale = getNextScale();

    if (!isPinch && moveable.props.groupable) {
      var snapRenderInfo = state.snapRenderInfo || {};
      var stateDirection = snapRenderInfo.direction;

      if (isArray(stateDirection) && (stateDirection[0] || stateDirection[1])) {
        state.snapRenderInfo = {
          direction: direction,
          request: e.isRequest
        };
      }
    }

    triggerEvent(moveable, "onBeforeScale", fillParams(moveable, e, {
      scale: scale,
      setFixedDirection: function (nextFixedDirection) {
        datas.setFixedDirection(nextFixedDirection);
        scale = getNextScale();
        return scale;
      },
      startFixedDirection: datas.startFixedDirection,
      setScale: function (nextScale) {
        scale = nextScale;
      }
    }, true));
    var dist = [scale[0] / startValue[0], scale[1] / startValue[1]];
    var fixedPosition = dragClient;
    var snapDist = [0, 0];

    if (!dragClient) {
      if (!parentFlag && isPinch) {
        fixedPosition = getAbsolutePosition(moveable, [0, 0]);
      } else {
        fixedPosition = datas.fixedPosition;
      }
    }

    if (!isPinch) {
      snapDist = checkSnapScale(moveable, dist, direction, isRequest, datas);
    }

    if (keepRatio) {
      if (sizeDirection[0] && sizeDirection[1] && snapDist[0] && snapDist[1]) {
        if (Math.abs(snapDist[0] * startOffsetWidth) > Math.abs(snapDist[1] * startOffsetHeight)) {
          snapDist[1] = 0;
        } else {
          snapDist[0] = 0;
        }
      }

      var isNoSnap = !snapDist[0] && !snapDist[1];

      if (isNoSnap) {
        if (isWidth) {
          dist[0] = throttle(dist[0] * startValue[0], throttleScale) / startValue[0];
        } else {
          dist[1] = throttle(dist[1] * startValue[1], throttleScale) / startValue[1];
        }
      }

      if (sizeDirection[0] && !sizeDirection[1] || snapDist[0] && !snapDist[1] || isNoSnap && isWidth) {
        dist[0] += snapDist[0];
        var snapHeight = startOffsetWidth * dist[0] * startValue[0] / ratio;
        dist[1] = snapHeight / startOffsetHeight / startValue[1];
      } else if (!sizeDirection[0] && sizeDirection[1] || !snapDist[0] && snapDist[1] || isNoSnap && !isWidth) {
        dist[1] += snapDist[1];
        var snapWidth = startOffsetHeight * dist[1] * startValue[1] * ratio;
        dist[0] = snapWidth / startOffsetWidth / startValue[0];
      }
    } else {
      dist[0] += snapDist[0];
      dist[1] += snapDist[1];

      if (!snapDist[0]) {
        dist[0] = throttle(dist[0] * startValue[0], throttleScale) / startValue[0];
      }

      if (!snapDist[1]) {
        dist[1] = throttle(dist[1] * startValue[1], throttleScale) / startValue[1];
      }
    }

    if (dist[0] === 0) {
      dist[0] = (prevDist[0] > 0 ? 1 : -1) * MIN_SCALE;
    }

    if (dist[1] === 0) {
      dist[1] = (prevDist[1] > 0 ? 1 : -1) * MIN_SCALE;
    }

    var delta = [dist[0] / prevDist[0], dist[1] / prevDist[1]];
    scale = multiply2(dist, startValue);
    var inverseDist = getScaleDist(moveable, dist, datas.fixedDirection, fixedPosition, datas);
    var inverseDelta = minus(inverseDist, datas.prevInverseDist || [0, 0]);
    datas.prevDist = dist;
    datas.prevInverseDist = inverseDist;

    if (scale[0] === prevDist[0] && scale[1] === prevDist[1] && inverseDelta.every(function (num) {
      return !num;
    }) && !parentMoveable) {
      return false;
    }

    var nextTransform = convertTransformFormat(datas, "scale(".concat(scale.join(", "), ")"), "scale(".concat(dist.join(", "), ")"));
    var params = fillParams(moveable, e, __assign({
      offsetWidth: startOffsetWidth,
      offsetHeight: startOffsetHeight,
      direction: direction,
      scale: scale,
      dist: dist,
      delta: delta,
      isPinch: !!isPinch
    }, fillTransformEvent(moveable, nextTransform, inverseDelta, isPinch, e)));
    triggerEvent(moveable, "onScale", params);
    return params;
  },
  dragControlEnd: function (moveable, e) {
    var datas = e.datas;

    if (!datas.isScale) {
      return false;
    }

    datas.isScale = false;
    var scaleEndParam = fillEndParams(moveable, e, {});
    triggerEvent(moveable, "onScaleEnd", scaleEndParam);
    return scaleEndParam;
  },
  dragGroupControlCondition: directionCondition,
  dragGroupControlStart: function (moveable, e) {
    var datas = e.datas;
    var params = this.dragControlStart(moveable, e);

    if (!params) {
      return false;
    }

    var originalEvents = fillChildEvents(moveable, "resizable", e);

    function setDist(child, ev) {
      var fixedDirection = datas.fixedDirection;
      var fixedPosition = datas.fixedPosition;
      var startPositions = ev.datas.startPositions || getAbsolutePosesByState(child.state);
      var pos = getPosByDirection(startPositions, fixedDirection);

      var _a = calculate(createRotateMatrix(-moveable.rotation / 180 * Math.PI, 3), [pos[0] - fixedPosition[0], pos[1] - fixedPosition[1], 1], 3),
          originalX = _a[0],
          originalY = _a[1];

      ev.datas.originalX = originalX;
      ev.datas.originalY = originalY;
      return ev;
    }

    datas.moveableScale = moveable.scale;
    var events = triggerChildAbles(moveable, this, "dragControlStart", e, function (child, ev) {
      return setDist(child, ev);
    });

    var setFixedDirection = function (fixedDirection) {
      params.setFixedDirection(fixedDirection);
      events.forEach(function (ev, i) {
        ev.setFixedDirection(fixedDirection);
        setDist(ev.moveable, originalEvents[i]);
      });
    };

    datas.setFixedDirection = setFixedDirection;

    var nextParams = __assign(__assign({}, params), {
      targets: moveable.props.targets,
      events: events,
      setFixedDirection: setFixedDirection
    });

    var result = triggerEvent(moveable, "onScaleGroupStart", nextParams);
    datas.isScale = result !== false;
    return datas.isScale ? nextParams : false;
  },
  dragGroupControl: function (moveable, e) {
    var datas = e.datas;

    if (!datas.isScale) {
      return;
    }

    catchEvent(moveable, "onBeforeScale", function (parentEvent) {
      triggerEvent(moveable, "onBeforeScaleGroup", fillParams(moveable, e, __assign(__assign({}, parentEvent), {
        targets: moveable.props.targets
      }), true));
    });
    var params = this.dragControl(moveable, e);

    if (!params) {
      return;
    }

    var moveableScale = datas.moveableScale;
    moveable.scale = [params.scale[0] * moveableScale[0], params.scale[1] * moveableScale[1]];
    var keepRatio = moveable.props.keepRatio;
    var dist = params.dist,
        scale = params.scale;
    var fixedPosition = datas.fixedPosition;
    var events = triggerChildAbles(moveable, this, "dragControl", e, function (_, ev) {
      var _a = calculate(createRotateMatrix(moveable.rotation / 180 * Math.PI, 3), [ev.datas.originalX * dist[0], ev.datas.originalY * dist[1], 1], 3),
          clientX = _a[0],
          clientY = _a[1];

      return __assign(__assign({}, ev), {
        parentDist: null,
        parentScale: scale,
        parentKeepRatio: keepRatio,
        dragClient: plus(fixedPosition, [clientX, clientY])
      });
    });

    var nextParams = __assign({
      targets: moveable.props.targets,
      events: events
    }, params);

    triggerEvent(moveable, "onScaleGroup", nextParams);
    return nextParams;
  },
  dragGroupControlEnd: function (moveable, e) {
    var isDrag = e.isDrag,
        datas = e.datas;

    if (!datas.isScale) {
      return;
    }

    this.dragControlEnd(moveable, e);
    var events = triggerChildAbles(moveable, this, "dragControlEnd", e);
    var nextParams = fillEndParams(moveable, e, {
      targets: moveable.props.targets,
      events: events
    });
    triggerEvent(moveable, "onScaleGroupEnd", nextParams);
    return isDrag;
  },

  /**
   * @method Moveable.Scalable#request
   * @param {Moveable.Scalable.ScalableRequestParam} e - the Scalable's request parameter
   * @return {Moveable.Requester} Moveable Requester
   * @example
    * // Instantly Request (requestStart - request - requestEnd)
   * moveable.request("scalable", { deltaWidth: 10, deltaHeight: 10 }, true);
   *
   * // requestStart
   * const requester = moveable.request("scalable");
   *
   * // request
   * requester.request({ deltaWidth: 10, deltaHeight: 10 });
   * requester.request({ deltaWidth: 10, deltaHeight: 10 });
   * requester.request({ deltaWidth: 10, deltaHeight: 10 });
   *
   * // requestEnd
   * requester.requestEnd();
   */
  request: function () {
    var datas = {};
    var distWidth = 0;
    var distHeight = 0;
    return {
      isControl: true,
      requestStart: function (e) {
        return {
          datas: datas,
          parentDirection: e.direction || [1, 1]
        };
      },
      request: function (e) {
        distWidth += e.deltaWidth;
        distHeight += e.deltaHeight;
        return {
          datas: datas,
          parentDist: [distWidth, distHeight],
          parentKeepRatio: e.keepRatio
        };
      },
      requestEnd: function () {
        return {
          datas: datas,
          isDrag: true
        };
      }
    };
  }
};
/**
 * Whether or not target can scaled.
 *
 * @name Moveable.Scalable#scalable
 * @default false
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body);
 *
 * moveable.scalable = true;
 */

/**
 * throttle of scaleX, scaleY when scale.
 * @name Moveable.Scalable#throttleScale
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body);
 *
 * moveable.throttleScale = 0.1;
 */

/**
 * Set directions to show the control box. (default: ["n", "nw", "ne", "s", "se", "sw", "e", "w"])
 * @name Moveable.Scalable#renderDirections
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     scalable: true,
 *   renderDirections: ["n", "nw", "ne", "s", "se", "sw", "e", "w"],
 * });
 *
 * moveable.renderDirections = ["nw", "ne", "sw", "se"];
 */

/**
 * When resize or scale, keeps a ratio of the width, height. (default: false)
 * @name Moveable.Scalable#keepRatio
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     scalable: true,
 * });
 *
 * moveable.keepRatio = true;
 */

/**
 * When the scale starts, the scaleStart event is called.
 * @memberof Moveable.Scalable
 * @event scaleStart
 * @param {Moveable.Scalable.OnScaleStart} - Parameters for the scaleStart event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, { scalable: true });
 * moveable.on("scaleStart", ({ target }) => {
 *     console.log(target);
 * });
 */

/**
 * When scaling, `beforeScale` is called before `scale` occurs. In `beforeScale`, you can get and set the pre-value before scaling.
 * @memberof Moveable.Scalable
 * @event beforeScale
 * @param {Moveable.Scalable.OnBeforeScale} - Parameters for the `beforeScale` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, { scalable: true });
 * moveable.on("beforeScale", ({ setFixedDirection }) => {
 *     if (shiftKey) {
 *        setFixedDirection([0, 0]);
 *     }
 * });
 * moveable.on("scale", ({ target, transform, dist }) => {
 *     target.style.transform = transform;
 * });
 */

/**
 * When scaling, the `scale` event is called.
 * @memberof Moveable.Scalable
 * @event scale
 * @param {Moveable.Scalable.OnScale} - Parameters for the `scale` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, { scalable: true });
 * moveable.on("scale", ({ target, transform, dist }) => {
 *     target.style.transform = transform;
 * });
 */

/**
 * When the scale finishes, the `scaleEnd` event is called.
 * @memberof Moveable.Scalable
 * @event scaleEnd
 * @param {Moveable.Scalable.OnScaleEnd} - Parameters for the `scaleEnd` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, { scalable: true });
 * moveable.on("scaleEnd", ({ target, isDrag }) => {
 *     console.log(target, isDrag);
 * });
 */

/**
* When the group scale starts, the `scaleGroupStart` event is called.
* @memberof Moveable.Scalable
* @event scaleGroupStart
* @param {Moveable.Scalable.OnScaleGroupStart} - Parameters for the `scaleGroupStart` event
* @example
* import Moveable from "moveable";
*
* const moveable = new Moveable(document.body, {
*     target: [].slice.call(document.querySelectorAll(".target")),
*     scalable: true
* });
* moveable.on("scaleGroupStart", ({ targets }) => {
*     console.log("onScaleGroupStart", targets);
* });
*/

/**
* When the group scale, the `scaleGroup` event is called.
* @memberof Moveable.Scalable
* @event scaleGroup
* @param {Moveable.Scalable.OnScaleGroup} - Parameters for the `scaleGroup` event
* @example
* import Moveable from "moveable";
*
* const moveable = new Moveable(document.body, {
*     target: [].slice.call(document.querySelectorAll(".target")),
*     scalable: true
* });
* moveable.on("scaleGroup", ({ targets, events }) => {
*     console.log("onScaleGroup", targets);
*     events.forEach(ev => {
*         const target = ev.target;
*         // ev.drag is a drag event that occurs when the group scale.
*         const left = ev.drag.beforeDist[0];
*         const top = ev.drag.beforeDist[1];
*         const scaleX = ev.scale[0];
*         const scaleY = ev.scale[1];
*     });
* });
*/

/**
 * When the group scale finishes, the `scaleGroupEnd` event is called.
 * @memberof Moveable.Scalable
 * @event scaleGroupEnd
 * @param {Moveable.Scalable.OnScaleGroupEnd} - Parameters for the `scaleGroupEnd` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     target: [].slice.call(document.querySelectorAll(".target")),
 *     scalable: true
 * });
 * moveable.on("scaleGroupEnd", ({ targets, isDrag }) => {
 *     console.log("onScaleGroupEnd", targets, isDrag);
 * });
 */

function getMiddleLinePos(pos1, pos2) {
  return pos1.map(function (pos, i) {
    return dot(pos, pos2[i], 1, 2);
  });
}

function getTriangleRad(pos1, pos2, pos3) {
  // pos1 Rad
  var rad1 = getRad(pos1, pos2);
  var rad2 = getRad(pos1, pos3);
  var rad = rad2 - rad1;
  return rad >= 0 ? rad : rad + 2 * Math.PI;
}

function isValidPos(poses1, poses2) {
  var rad1 = getTriangleRad(poses1[0], poses1[1], poses1[2]);
  var rad2 = getTriangleRad(poses2[0], poses2[1], poses2[2]);
  var pi = Math.PI;

  if (rad1 >= pi && rad2 <= pi || rad1 <= pi && rad2 >= pi) {
    return false;
  }

  return true;
}
/**
 * @namespace Moveable.Warpable
 * @description Warpable indicates whether the target can be warped(distorted, bented).
 */


var Warpable = {
  name: "warpable",
  ableGroup: "size",
  props: {
    warpable: Boolean,
    renderDirections: Array,
    edge: Boolean
  },
  events: {
    onWarpStart: "warpStart",
    onWarp: "warp",
    onWarpEnd: "warpEnd"
  },
  viewClassName: getDirectionViewClassName("warpable"),
  render: function (moveable, React) {
    var _a = moveable.props,
        resizable = _a.resizable,
        scalable = _a.scalable,
        warpable = _a.warpable,
        zoom = _a.zoom;

    if (resizable || scalable || !warpable) {
      return [];
    }

    var _b = moveable.state,
        pos1 = _b.pos1,
        pos2 = _b.pos2,
        pos3 = _b.pos3,
        pos4 = _b.pos4;
    var linePosFrom1 = getMiddleLinePos(pos1, pos2);
    var linePosFrom2 = getMiddleLinePos(pos2, pos1);
    var linePosFrom3 = getMiddleLinePos(pos1, pos3);
    var linePosFrom4 = getMiddleLinePos(pos3, pos1);
    var linePosTo1 = getMiddleLinePos(pos3, pos4);
    var linePosTo2 = getMiddleLinePos(pos4, pos3);
    var linePosTo3 = getMiddleLinePos(pos2, pos4);
    var linePosTo4 = getMiddleLinePos(pos4, pos2);
    return __spreadArray([React.createElement("div", {
      className: prefix("line"),
      key: "middeLine1",
      style: getLineStyle(linePosFrom1, linePosTo1, zoom)
    }), React.createElement("div", {
      className: prefix("line"),
      key: "middeLine2",
      style: getLineStyle(linePosFrom2, linePosTo2, zoom)
    }), React.createElement("div", {
      className: prefix("line"),
      key: "middeLine3",
      style: getLineStyle(linePosFrom3, linePosTo3, zoom)
    }), React.createElement("div", {
      className: prefix("line"),
      key: "middeLine4",
      style: getLineStyle(linePosFrom4, linePosTo4, zoom)
    })], renderAllDirections(moveable, "warpable", React), true);
  },
  dragControlCondition: function (moveable, e) {
    if (e.isRequest) {
      return false;
    }

    var target = e.inputEvent.target;
    return hasClass(target, prefix("direction")) && hasClass(target, prefix("warpable"));
  },
  dragControlStart: function (moveable, e) {
    var datas = e.datas,
        inputEvent = e.inputEvent;
    var target = moveable.props.target;
    var inputTarget = inputEvent.target;
    var direction = getDirection(inputTarget, datas);

    if (!direction || !target) {
      return false;
    }

    var state = moveable.state;
    var transformOrigin = state.transformOrigin,
        is3d = state.is3d,
        targetTransform = state.targetTransform,
        targetMatrix = state.targetMatrix,
        width = state.width,
        height = state.height,
        left = state.left,
        top = state.top;
    datas.datas = {};
    datas.targetTransform = targetTransform;
    datas.warpTargetMatrix = is3d ? targetMatrix : convertDimension(targetMatrix, 3, 4);
    datas.targetInverseMatrix = ignoreDimension(invert(datas.warpTargetMatrix, 4), 3, 4);
    datas.direction = direction;
    datas.left = left;
    datas.top = top;
    datas.poses = [[0, 0], [width, 0], [0, height], [width, height]].map(function (p) {
      return minus(p, transformOrigin);
    });
    datas.nextPoses = datas.poses.map(function (_a) {
      var x = _a[0],
          y = _a[1];
      return calculate(datas.warpTargetMatrix, [x, y, 0, 1], 4);
    });
    datas.startValue = createIdentityMatrix(4);
    datas.prevMatrix = createIdentityMatrix(4);
    datas.absolutePoses = getAbsolutePosesByState(state);
    datas.posIndexes = getPosIndexesByDirection(direction);
    setDragStart(moveable, e);
    setDefaultTransformIndex(e, "matrix3d");
    state.snapRenderInfo = {
      request: e.isRequest,
      direction: direction
    };
    var params = fillParams(moveable, e, __assign({
      set: function (matrix) {
        datas.startValue = matrix;
      }
    }, fillTransformStartEvent(e)));
    var result = triggerEvent(moveable, "onWarpStart", params);

    if (result !== false) {
      datas.isWarp = true;
    }

    return datas.isWarp;
  },
  dragControl: function (moveable, e) {
    var datas = e.datas,
        isRequest = e.isRequest;
    var distX = e.distX,
        distY = e.distY;
    var targetInverseMatrix = datas.targetInverseMatrix,
        prevMatrix = datas.prevMatrix,
        isWarp = datas.isWarp,
        startValue = datas.startValue,
        poses = datas.poses,
        posIndexes = datas.posIndexes,
        absolutePoses = datas.absolutePoses;

    if (!isWarp) {
      return false;
    }

    resolveTransformEvent(e, "matrix3d");

    if (hasGuidelines(moveable, "warpable")) {
      var selectedPoses = posIndexes.map(function (index) {
        return absolutePoses[index];
      });

      if (selectedPoses.length > 1) {
        selectedPoses.push([(selectedPoses[0][0] + selectedPoses[1][0]) / 2, (selectedPoses[0][1] + selectedPoses[1][1]) / 2]);
      }

      var _a = checkMoveableSnapBounds(moveable, isRequest, {
        horizontal: selectedPoses.map(function (pos) {
          return pos[1] + distY;
        }),
        vertical: selectedPoses.map(function (pos) {
          return pos[0] + distX;
        })
      }),
          horizontalSnapInfo = _a.horizontal,
          verticalSnapInfo = _a.vertical;

      distY -= horizontalSnapInfo.offset;
      distX -= verticalSnapInfo.offset;
    }

    var dist = getDragDist({
      datas: datas,
      distX: distX,
      distY: distY
    }, true);
    var nextPoses = datas.nextPoses.slice();
    posIndexes.forEach(function (index) {
      nextPoses[index] = plus(nextPoses[index], dist);
    });

    if (!NEARBY_POS.every(function (nearByPoses) {
      return isValidPos(nearByPoses.map(function (i) {
        return poses[i];
      }), nearByPoses.map(function (i) {
        return nextPoses[i];
      }));
    })) {
      return false;
    }

    var h = createWarpMatrix(poses[0], poses[2], poses[1], poses[3], nextPoses[0], nextPoses[2], nextPoses[1], nextPoses[3]);

    if (!h.length) {
      return false;
    } // B * A * M


    var afterMatrix = multiply(targetInverseMatrix, h, 4); // B * M * A

    var matrix = getTransfromMatrix(datas, afterMatrix, true);
    var delta = multiply(invert(prevMatrix, 4), matrix, 4);
    datas.prevMatrix = matrix;
    var totalMatrix = multiply(startValue, matrix, 4);
    var nextTransform = convertTransformFormat(datas, "matrix3d(".concat(totalMatrix.join(", "), ")"), "matrix3d(".concat(matrix.join(", "), ")"));
    fillOriginalTransform(e, nextTransform);
    triggerEvent(moveable, "onWarp", fillParams(moveable, e, {
      delta: delta,
      matrix: totalMatrix,
      dist: matrix,
      multiply: multiply,
      transform: nextTransform
    }));
    return true;
  },
  dragControlEnd: function (moveable, e) {
    var datas = e.datas,
        isDrag = e.isDrag;

    if (!datas.isWarp) {
      return false;
    }

    datas.isWarp = false;
    triggerEvent(moveable, "onWarpEnd", fillEndParams(moveable, e, {}));
    return isDrag;
  }
};
/**
 * Whether or not target can be warped. (default: false)
 * @name Moveable.Warpable#warpable
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body);
 *
 * moveable.warpable = true;
 */

/**
* Set directions to show the control box. (default: ["n", "nw", "ne", "s", "se", "sw", "e", "w"])
* @name Moveable.Warpable#renderDirections
* @example
* import Moveable from "moveable";
*
* const moveable = new Moveable(document.body, {
*     warpable: true,
*     renderDirections: ["n", "nw", "ne", "s", "se", "sw", "e", "w"],
* });
*
* moveable.renderDirections = ["nw", "ne", "sw", "se"];
*/

/**
* When the warp starts, the warpStart event is called.
* @memberof Moveable.Warpable
* @event warpStart
* @param {Moveable.Warpable.OnWarpStart} - Parameters for the warpStart event
* @example
* import Moveable from "moveable";
*
* const moveable = new Moveable(document.body, { warpable: true });
* moveable.on("warpStart", ({ target }) => {
*     console.log(target);
* });
*/

/**
 * When warping, the warp event is called.
 * @memberof Moveable.Warpable
 * @event warp
 * @param {Moveable.Warpable.OnWarp} - Parameters for the warp event
 * @example
 * import Moveable from "moveable";
 * let matrix = [
 *  1, 0, 0, 0,
 *  0, 1, 0, 0,
 *  0, 0, 1, 0,
 *  0, 0, 0, 1,
 * ];
 * const moveable = new Moveable(document.body, { warpable: true });
 * moveable.on("warp", ({ target, transform, delta, multiply }) => {
 *    // target.style.transform = transform;
 *    matrix = multiply(matrix, delta);
 *    target.style.transform = `matrix3d(${matrix.join(",")})`;
 * });
 */

/**
 * When the warp finishes, the warpEnd event is called.
 * @memberof Moveable.Warpable
 * @event warpEnd
 * @param {Moveable.Warpable.OnWarpEnd} - Parameters for the warpEnd event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, { warpable: true });
 * moveable.on("warpEnd", ({ target, isDrag }) => {
 *     console.log(target, isDrag);
 * });
 */

var AREA_PIECES = /*#__PURE__*/prefix("area-pieces");
var AREA_PIECE = /*#__PURE__*/prefix("area-piece");
var AVOID = /*#__PURE__*/prefix("avoid");
var VIEW_DRAGGING = prefix("view-dragging");

function restoreStyle(moveable) {
  var el = moveable.areaElement;

  if (!el) {
    return;
  }

  var _a = moveable.state,
      width = _a.width,
      height = _a.height;
  removeClass(el, AVOID);
  el.style.cssText += "left: 0px; top: 0px; width: ".concat(width, "px; height: ").concat(height, "px");
}

function renderPieces(React) {
  return React.createElement("div", {
    key: "area_pieces",
    className: AREA_PIECES
  }, React.createElement("div", {
    className: AREA_PIECE
  }), React.createElement("div", {
    className: AREA_PIECE
  }), React.createElement("div", {
    className: AREA_PIECE
  }), React.createElement("div", {
    className: AREA_PIECE
  }));
}

var DragArea = {
  name: "dragArea",
  props: {
    dragArea: Boolean,
    passDragArea: Boolean
  },
  events: {
    onClick: "click",
    onClickGroup: "clickGroup"
  },
  render: function (moveable, React) {
    var _a = moveable.props,
        target = _a.target,
        dragArea = _a.dragArea,
        groupable = _a.groupable,
        passDragArea = _a.passDragArea;

    var _b = moveable.getState(),
        width = _b.width,
        height = _b.height,
        renderPoses = _b.renderPoses;

    var className = passDragArea ? prefix("area", "pass") : prefix("area");

    if (groupable) {
      return [React.createElement("div", {
        key: "area",
        ref: ref(moveable, "areaElement"),
        className: className
      }), renderPieces(React)];
    }

    if (!target || !dragArea) {
      return [];
    }

    var h = createWarpMatrix([0, 0], [width, 0], [0, height], [width, height], renderPoses[0], renderPoses[1], renderPoses[2], renderPoses[3]);
    var transform = h.length ? makeMatrixCSS(h, true) : "none";
    return [React.createElement("div", {
      key: "area",
      ref: ref(moveable, "areaElement"),
      className: className,
      style: {
        top: "0px",
        left: "0px",
        width: "".concat(width, "px"),
        height: "".concat(height, "px"),
        transformOrigin: "0 0",
        transform: transform
      }
    }), renderPieces(React)];
  },
  dragStart: function (moveable, _a) {
    var datas = _a.datas,
        clientX = _a.clientX,
        clientY = _a.clientY,
        inputEvent = _a.inputEvent;

    if (!inputEvent) {
      return false;
    }

    datas.isDragArea = false;
    var areaElement = moveable.areaElement;
    var state = moveable.state;
    var moveableClientRect = state.moveableClientRect,
        renderPoses = state.renderPoses,
        rootMatrix = state.rootMatrix,
        is3d = state.is3d;
    var left = moveableClientRect.left,
        top = moveableClientRect.top;

    var _b = getRect(renderPoses),
        relativeLeft = _b.left,
        relativeTop = _b.top,
        width = _b.width,
        height = _b.height;

    var n = is3d ? 4 : 3;

    var _c = calculateInversePosition(rootMatrix, [clientX - left, clientY - top], n),
        posX = _c[0],
        posY = _c[1];

    posX -= relativeLeft;
    posY -= relativeTop;
    var rects = [{
      left: relativeLeft,
      top: relativeTop,
      width: width,
      height: posY - 10
    }, {
      left: relativeLeft,
      top: relativeTop,
      width: posX - 10,
      height: height
    }, {
      left: relativeLeft,
      top: relativeTop + posY + 10,
      width: width,
      height: height - posY - 10
    }, {
      left: relativeLeft + posX + 10,
      top: relativeTop,
      width: width - posX - 10,
      height: height
    }];
    var children = [].slice.call(areaElement.nextElementSibling.children);
    rects.forEach(function (rect, i) {
      children[i].style.cssText = "left: ".concat(rect.left, "px;top: ").concat(rect.top, "px; width: ").concat(rect.width, "px; height: ").concat(rect.height, "px;");
    });
    addClass(areaElement, AVOID);
    state.disableNativeEvent = true;
    return;
  },
  drag: function (moveable, _a) {
    var datas = _a.datas,
        inputEvent = _a.inputEvent;
    this.enableNativeEvent(moveable);

    if (!inputEvent) {
      return false;
    }

    if (!datas.isDragArea) {
      datas.isDragArea = true;
      restoreStyle(moveable);
    }
  },
  dragEnd: function (moveable, e) {
    this.enableNativeEvent(moveable);
    var inputEvent = e.inputEvent,
        datas = e.datas;

    if (!inputEvent) {
      return false;
    }

    if (!datas.isDragArea) {
      restoreStyle(moveable);
    }
  },
  dragGroupStart: function (moveable, e) {
    return this.dragStart(moveable, e);
  },
  dragGroup: function (moveable, e) {
    return this.drag(moveable, e);
  },
  dragGroupEnd: function (moveable, e) {
    return this.dragEnd(moveable, e);
  },
  unset: function (moveable) {
    restoreStyle(moveable);
    moveable.state.disableNativeEvent = false;
  },
  enableNativeEvent: function (moveable) {
    var state = moveable.state;

    if (state.disableNativeEvent) {
      requestAnimationFrame(function () {
        state.disableNativeEvent = false;
      });
    }
  }
};
/**
 * Add an event to the moveable area instead of the target for stopPropagation. (default: false, true in group)
 * @name Moveable#dragArea
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *  dragArea: false,
 * });
 */

/**
 * Set `pointerEvents: none;` css to pass events in dragArea. (default: false)
 * @name Moveable#passDragArea
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *  dragArea: false,
 * });
 */

var Origin = makeAble("origin", {
  render: function (moveable, React) {
    var zoom = moveable.props.zoom;

    var _a = moveable.getState(),
        beforeOrigin = _a.beforeOrigin,
        rotation = _a.rotation;

    return [React.createElement("div", {
      className: prefix("control", "origin"),
      style: getControlTransform(rotation, zoom, beforeOrigin),
      key: "beforeOrigin"
    })];
  }
});
/**
 * Whether or not the origin controlbox will be visible or not (default: true)
 * @name Moveable#origin
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body);
 *
 * moveable.origin = true;
 */

function getDefaultScrollPosition(e) {
  var scrollContainer = e.scrollContainer;
  return [scrollContainer.scrollLeft, scrollContainer.scrollTop];
}
/**
 * @namespace Moveable.Scrollable
 * @description Whether or not target can be scrolled to the scroll container (default: false)
 */


var Scrollable = {
  name: "scrollable",
  canPinch: true,
  props: {
    scrollable: Boolean,
    scrollContainer: Object,
    scrollThreshold: Number,
    getScrollPosition: Function
  },
  events: {
    onScroll: "scroll",
    onScrollGroup: "scrollGroup"
  },
  dragRelation: "strong",
  dragStart: function (moveable, e) {
    var props = moveable.props;
    var _a = props.scrollContainer,
        scrollContainer = _a === void 0 ? moveable.getContainer() : _a;
    var dragScroll = new DragScroll();
    var scrollContainerElement = getRefTarget(scrollContainer, true);
    e.datas.dragScroll = dragScroll;
    var gestoName = e.isControl ? "controlGesto" : "targetGesto";
    var targets = e.targets;
    dragScroll.on("scroll", function (_a) {
      var container = _a.container,
          direction = _a.direction;
      var params = fillParams(moveable, e, {
        scrollContainer: container,
        direction: direction
      });
      var eventName = targets ? "onScrollGroup" : "onScroll";

      if (targets) {
        params.targets = targets;
      }

      triggerEvent(moveable, eventName, params);
    }).on("move", function (_a) {
      var offsetX = _a.offsetX,
          offsetY = _a.offsetY;
      moveable[gestoName].scrollBy(offsetX, offsetY, e.inputEvent, false);
    });
    dragScroll.dragStart(e, {
      container: scrollContainerElement
    });
  },
  checkScroll: function (moveable, e) {
    var dragScroll = e.datas.dragScroll;

    if (!dragScroll) {
      return;
    }

    var _a = moveable.props,
        _b = _a.scrollContainer,
        scrollContainer = _b === void 0 ? moveable.getContainer() : _b,
        _c = _a.scrollThreshold,
        scrollThreshold = _c === void 0 ? 0 : _c,
        _d = _a.getScrollPosition,
        getScrollPosition = _d === void 0 ? getDefaultScrollPosition : _d;
    dragScroll.drag(e, {
      container: scrollContainer,
      threshold: scrollThreshold,
      getScrollPosition: function (ev) {
        return getScrollPosition({
          scrollContainer: ev.container,
          direction: ev.direction
        });
      }
    });
    return true;
  },
  drag: function (moveable, e) {
    return this.checkScroll(moveable, e);
  },
  dragEnd: function (moveable, e) {
    e.datas.dragScroll.dragEnd();
    e.datas.dragScroll = null;
  },
  dragControlStart: function (moveable, e) {
    return this.dragStart(moveable, __assign(__assign({}, e), {
      isControl: true
    }));
  },
  dragControl: function (moveable, e) {
    return this.drag(moveable, e);
  },
  dragControlEnd: function (moveable, e) {
    return this.dragEnd(moveable, e);
  },
  dragGroupStart: function (moveable, e) {
    return this.dragStart(moveable, __assign(__assign({}, e), {
      targets: moveable.props.targets
    }));
  },
  dragGroup: function (moveable, e) {
    return this.drag(moveable, __assign(__assign({}, e), {
      targets: moveable.props.targets
    }));
  },
  dragGroupEnd: function (moveable, e) {
    return this.dragEnd(moveable, __assign(__assign({}, e), {
      targets: moveable.props.targets
    }));
  },
  dragGroupControlStart: function (moveable, e) {
    return this.dragStart(moveable, __assign(__assign({}, e), {
      targets: moveable.props.targets,
      isControl: true
    }));
  },
  dragGroupContro: function (moveable, e) {
    return this.drag(moveable, __assign(__assign({}, e), {
      targets: moveable.props.targets
    }));
  },
  dragGroupControEnd: function (moveable, e) {
    return this.dragEnd(moveable, __assign(__assign({}, e), {
      targets: moveable.props.targets
    }));
  }
};
/**
 * Whether or not target can be scrolled to the scroll container (default: false)
 * @name Moveable.Scrollable#scrollable
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *   scrollable: true,
 *   scrollContainer: document.body,
 *   scrollThreshold: 0,
 *   getScrollPosition: ({ scrollContainer }) => ([scrollContainer.scrollLeft, scrollContainer.scrollTop]),
 * });
 *
 * moveable.scrollable = true;
 */

/**
 * The container to which scroll is applied (default: container)
 * @name Moveable.Scrollable#scrollContainer
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *   scrollable: true,
 *   scrollContainer: document.body,
 *   scrollThreshold: 0,
 *   getScrollPosition: ({ scrollContainer }) => ([scrollContainer.scrollLeft, scrollContainer.scrollTop]),
 * });
 */

/**
 * Expand the range of the scroll check area. (default: 0)
 * @name Moveable.Scrollable#scrollThreshold
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *   scrollable: true,
 *   scrollContainer: document.body,
 *   scrollThreshold: 0,
 *   getScrollPosition: ({ scrollContainer }) => ([scrollContainer.scrollLeft, scrollContainer.scrollTop]),
 * });
 */

/**
 * Sets a function to get the scroll position. (default: Function)
 * @name Moveable.Scrollable#getScrollPosition
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *   scrollable: true,
 *   scrollContainer: document.body,
 *   scrollThreshold: 0,
 *   getScrollPosition: ({ scrollContainer }) => ([scrollContainer.scrollLeft, scrollContainer.scrollTop]),
 * });
 *
 */

/**
 * When the drag cursor leaves the scrollContainer, the `scroll` event occur to scroll.
 * @memberof Moveable.Scrollable
 * @event scroll
 * @param {Moveable.Scrollable.OnScroll} - Parameters for the `scroll` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     target: document.querySelector(".target"),
 * });
 * moveable.on("scroll", ({ scrollContainer, direction }) => {
 *   scrollContainer.scrollLeft += direction[0] * 10;
 *   scrollContainer.scrollTop += direction[1] * 10;
 * });
 */

/**
 * When the drag cursor leaves the scrollContainer, the `scrollGroup` event occur to scroll in group.
 * @memberof Moveable.Scrollable
 * @event scrollGroup
 * @param {Moveable.Scrollable.OnScrollGroup} - Parameters for the `scrollGroup` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     target: [].slice.call(document.querySelectorAll(".target")),
 * });
 * moveable.on("scroll", ({ scrollContainer, direction }) => {
 *   scrollContainer.scrollLeft += direction[0] * 10;
 *   scrollContainer.scrollTop += direction[1] * 10;
 * });
 */

var Default = {
  name: "",
  props: {
    target: Object,
    dragTarget: Object,
    container: Object,
    portalContainer: Object,
    rootContainer: Object,
    useResizeObserver: Boolean,
    zoom: Number,
    transformOrigin: Array,
    edge: Object,
    ables: Array,
    className: String,
    pinchThreshold: Number,
    pinchOutside: Boolean,
    triggerAblesSimultaneously: Boolean,
    checkInput: Boolean,
    cspNonce: String,
    translateZ: Number,
    hideDefaultLines: Boolean,
    props: Object,
    flushSync: Function,
    stopPropagation: Boolean,
    preventClickEventOnDrag: Boolean,
    preventClickDefault: Boolean,
    viewContainer: Object
  },
  events: {}
};
var Padding = makeAble("padding", {
  render: function (moveable, React) {
    var props = moveable.props;

    if (props.dragArea) {
      return [];
    }

    var padding = props.padding || {};
    var _a = padding.left,
        left = _a === void 0 ? 0 : _a,
        _b = padding.top,
        top = _b === void 0 ? 0 : _b,
        _c = padding.right,
        right = _c === void 0 ? 0 : _c,
        _d = padding.bottom,
        bottom = _d === void 0 ? 0 : _d;

    var _e = moveable.getState(),
        renderPoses = _e.renderPoses,
        pos1 = _e.pos1,
        pos2 = _e.pos2,
        pos3 = _e.pos3,
        pos4 = _e.pos4;

    var poses = [pos1, pos2, pos3, pos4];
    var paddingDirections = [];

    if (left > 0) {
      paddingDirections.push([0, 2]);
    }

    if (top > 0) {
      paddingDirections.push([0, 1]);
    }

    if (right > 0) {
      paddingDirections.push([1, 3]);
    }

    if (bottom > 0) {
      paddingDirections.push([2, 3]);
    }

    return paddingDirections.map(function (_a, i) {
      var dir1 = _a[0],
          dir2 = _a[1];
      var paddingPos1 = poses[dir1];
      var paddingPos2 = poses[dir2];
      var paddingPos3 = renderPoses[dir1];
      var paddingPos4 = renderPoses[dir2];
      var h = createWarpMatrix([0, 0], [100, 0], [0, 100], [100, 100], paddingPos1, paddingPos2, paddingPos3, paddingPos4);

      if (!h.length) {
        return undefined;
      }

      return React.createElement("div", {
        key: "padding".concat(i),
        className: prefix("padding"),
        style: {
          transform: makeMatrixCSS(h, true)
        }
      });
    });
  }
});
/**
 * Add padding around the target to increase the drag area.
 * @name Moveable#padding
 * @default null
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *  target: document.querySelector(".target"),
 *  padding: { left: 0, top: 0, right: 0, bottom: 0 },
 * });
 * moveable.padding = { left: 10, top: 10, right: 10, bottom: 10 },
 * moveable.updateRect();
 */

var RADIUS_DIRECTIONS = ["nw", "ne", "se", "sw"];

function calculateRatio(values, size) {
  var sumSize = values[0] + values[1];
  var sumRatio = sumSize > size ? size / sumSize : 1;
  values[0] *= sumRatio;
  values[1] = size - values[1] * sumRatio;
  return values;
}

var HORIZONTAL_RADIUS_ORDER = [1, 2, 5, 6];
var VERTICAL_RADIUS_ORDER = [0, 3, 4, 7];
var HORIZONTAL_RADIUS_DIRECTIONS = [1, -1, -1, 1];
var VERTICAL_RADIUS_DIRECTIONS = [1, 1, -1, -1];

function getRadiusStyles(nextPoses, isRelative, width, height, left, top, right, bottom) {
  if (left === void 0) {
    left = 0;
  }

  if (top === void 0) {
    top = 0;
  }

  if (right === void 0) {
    right = width;
  }

  if (bottom === void 0) {
    bottom = height;
  }

  var clipStyles = [];
  var isVertical = false;
  var radiusPoses = nextPoses.filter(function (pos) {
    return !pos.virtual;
  });
  var raws = radiusPoses.map(function (posInfo) {
    var horizontal = posInfo.horizontal,
        vertical = posInfo.vertical,
        pos = posInfo.pos;

    if (vertical && !isVertical) {
      isVertical = true;
      clipStyles.push("/");
    }

    if (isVertical) {
      var rawPos = Math.max(0, vertical === 1 ? pos[1] - top : bottom - pos[1]);
      clipStyles.push(convertCSSSize(rawPos, height, isRelative));
      return rawPos;
    } else {
      var rawPos = Math.max(0, horizontal === 1 ? pos[0] - left : right - pos[0]);
      clipStyles.push(convertCSSSize(rawPos, width, isRelative));
      return rawPos;
    }
  });
  return {
    radiusPoses: radiusPoses,
    styles: clipStyles,
    raws: raws
  };
}

function getRadiusRange(controlPoses) {
  // [start, length]
  var horizontalRange = [0, 0];
  var verticalRange = [0, 0];
  var length = controlPoses.length;

  for (var i = 0; i < length; ++i) {
    var clipPose = controlPoses[i];

    if (!clipPose.sub) {
      continue;
    }

    if (clipPose.horizontal) {
      if (horizontalRange[1] === 0) {
        horizontalRange[0] = i;
      }

      horizontalRange[1] = i - horizontalRange[0] + 1;
      verticalRange[0] = i + 1;
    }

    if (clipPose.vertical) {
      if (verticalRange[1] === 0) {
        verticalRange[0] = i;
      }

      verticalRange[1] = i - verticalRange[0] + 1;
    }
  }

  return {
    horizontalRange: horizontalRange,
    verticalRange: verticalRange
  };
}

function getRadiusValues(values, width, height, left, top, minCounts, full) {
  var _a, _b, _c, _d;

  if (minCounts === void 0) {
    minCounts = [0, 0];
  }

  if (full === void 0) {
    full = false;
  }

  var splitIndex = values.indexOf("/");
  var splitLength = (splitIndex > -1 ? values.slice(0, splitIndex) : values).length;
  var horizontalValues = values.slice(0, splitLength);
  var verticalValues = values.slice(splitLength + 1);
  var horizontalValuesLength = horizontalValues.length;
  var verticalValuesLength = verticalValues.length;
  var hasVerticalValues = verticalValuesLength > 0;
  var _e = horizontalValues[0],
      nwValue = _e === void 0 ? "0px" : _e,
      _f = horizontalValues[1],
      neValue = _f === void 0 ? nwValue : _f,
      _g = horizontalValues[2],
      seValue = _g === void 0 ? nwValue : _g,
      _h = horizontalValues[3],
      swValue = _h === void 0 ? neValue : _h;
  var _j = verticalValues[0],
      wnValue = _j === void 0 ? nwValue : _j,
      _k = verticalValues[1],
      enValue = _k === void 0 ? hasVerticalValues ? wnValue : neValue : _k,
      _l = verticalValues[2],
      esValue = _l === void 0 ? hasVerticalValues ? wnValue : seValue : _l,
      _m = verticalValues[3],
      wsValue = _m === void 0 ? hasVerticalValues ? enValue : swValue : _m;
  var horizontalRawPoses = [nwValue, neValue, seValue, swValue].map(function (pos) {
    return convertUnitSize(pos, width);
  });
  var verticalRawPoses = [wnValue, enValue, esValue, wsValue].map(function (pos) {
    return convertUnitSize(pos, height);
  });
  var horizontalPoses = horizontalRawPoses.slice();
  var verticalPoses = verticalRawPoses.slice();
  _a = calculateRatio([horizontalPoses[0], horizontalPoses[1]], width), horizontalPoses[0] = _a[0], horizontalPoses[1] = _a[1];
  _b = calculateRatio([horizontalPoses[3], horizontalPoses[2]], width), horizontalPoses[3] = _b[0], horizontalPoses[2] = _b[1];
  _c = calculateRatio([verticalPoses[0], verticalPoses[3]], height), verticalPoses[0] = _c[0], verticalPoses[3] = _c[1];
  _d = calculateRatio([verticalPoses[1], verticalPoses[2]], height), verticalPoses[1] = _d[0], verticalPoses[2] = _d[1];
  var nextHorizontalPoses = full ? horizontalPoses : horizontalPoses.slice(0, Math.max(minCounts[0], horizontalValuesLength));
  var nextVerticalPoses = full ? verticalPoses : verticalPoses.slice(0, Math.max(minCounts[1], verticalValuesLength));
  return __spreadArray(__spreadArray([], nextHorizontalPoses.map(function (pos, i) {
    var direction = RADIUS_DIRECTIONS[i];
    return {
      virtual: i >= horizontalValuesLength,
      horizontal: HORIZONTAL_RADIUS_DIRECTIONS[i],
      vertical: 0,
      pos: [left + pos, top + (VERTICAL_RADIUS_DIRECTIONS[i] === -1 ? height : 0)],
      sub: true,
      raw: horizontalRawPoses[i],
      direction: direction
    };
  }), true), nextVerticalPoses.map(function (pos, i) {
    var direction = RADIUS_DIRECTIONS[i];
    return {
      virtual: i >= verticalValuesLength,
      horizontal: 0,
      vertical: VERTICAL_RADIUS_DIRECTIONS[i],
      pos: [left + (HORIZONTAL_RADIUS_DIRECTIONS[i] === -1 ? width : 0), top + pos],
      sub: true,
      raw: verticalRawPoses[i],
      direction: direction
    };
  }), true);
}

function removeRadiusPos(controlPoses, poses, index, startIndex, length) {
  if (length === void 0) {
    length = poses.length;
  }

  var _a = getRadiusRange(controlPoses.slice(startIndex)),
      horizontalRange = _a.horizontalRange,
      verticalRange = _a.verticalRange;

  var radiuslIndex = index - startIndex;
  var deleteCount = 0;

  if (radiuslIndex === 0) {
    deleteCount = length;
  } else if (radiuslIndex > 0 && radiuslIndex < horizontalRange[1]) {
    deleteCount = horizontalRange[1] - radiuslIndex;
  } else if (radiuslIndex >= verticalRange[0]) {
    deleteCount = verticalRange[0] + verticalRange[1] - radiuslIndex;
  } else {
    return;
  }

  controlPoses.splice(index, deleteCount);
  poses.splice(index, deleteCount);
}

function addRadiusPos(controlPoses, poses, startIndex, horizontalIndex, verticalIndex, distX, distY, right, bottom, left, top) {
  if (left === void 0) {
    left = 0;
  }

  if (top === void 0) {
    top = 0;
  }

  var _a = getRadiusRange(controlPoses.slice(startIndex)),
      horizontalRange = _a.horizontalRange,
      verticalRange = _a.verticalRange;

  if (horizontalIndex > -1) {
    var radiusX = HORIZONTAL_RADIUS_DIRECTIONS[horizontalIndex] === 1 ? distX - left : right - distX;

    for (var i = horizontalRange[1]; i <= horizontalIndex; ++i) {
      var y = VERTICAL_RADIUS_DIRECTIONS[i] === 1 ? top : bottom;
      var x = 0;

      if (horizontalIndex === i) {
        x = distX;
      } else if (i === 0) {
        x = left + radiusX;
      } else if (HORIZONTAL_RADIUS_DIRECTIONS[i] === -1) {
        x = right - (poses[startIndex][0] - left);
      }

      controlPoses.splice(startIndex + i, 0, {
        horizontal: HORIZONTAL_RADIUS_DIRECTIONS[i],
        vertical: 0,
        pos: [x, y]
      });
      poses.splice(startIndex + i, 0, [x, y]);

      if (i === 0) {
        break;
      }
    }
  } else if (verticalIndex > -1) {
    var radiusY = VERTICAL_RADIUS_DIRECTIONS[verticalIndex] === 1 ? distY - top : bottom - distY;

    if (horizontalRange[1] === 0 && verticalRange[1] === 0) {
      var pos = [left + radiusY, top];
      controlPoses.push({
        horizontal: HORIZONTAL_RADIUS_DIRECTIONS[0],
        vertical: 0,
        pos: pos
      });
      poses.push(pos);
    }

    var startVerticalIndex = verticalRange[0];

    for (var i = verticalRange[1]; i <= verticalIndex; ++i) {
      var x = HORIZONTAL_RADIUS_DIRECTIONS[i] === 1 ? left : right;
      var y = 0;

      if (verticalIndex === i) {
        y = distY;
      } else if (i === 0) {
        y = top + radiusY;
      } else if (VERTICAL_RADIUS_DIRECTIONS[i] === 1) {
        y = poses[startIndex + startVerticalIndex][1];
      } else if (VERTICAL_RADIUS_DIRECTIONS[i] === -1) {
        y = bottom - (poses[startIndex + startVerticalIndex][1] - top);
      }

      controlPoses.push({
        horizontal: 0,
        vertical: VERTICAL_RADIUS_DIRECTIONS[i],
        pos: [x, y]
      });
      poses.push([x, y]);

      if (i === 0) {
        break;
      }
    }
  }
}

function splitRadiusPoses(controlPoses, raws) {
  if (raws === void 0) {
    raws = controlPoses.map(function (pos) {
      return pos.raw;
    });
  }

  var horizontals = controlPoses.map(function (pos, i) {
    return pos.horizontal ? raws[i] : null;
  }).filter(function (pos) {
    return pos != null;
  });
  var verticals = controlPoses.map(function (pos, i) {
    return pos.vertical ? raws[i] : null;
  }).filter(function (pos) {
    return pos != null;
  });
  return {
    horizontals: horizontals,
    verticals: verticals
  };
}

var CLIP_DIRECTIONS = [[0, -1, "n"], [1, 0, "e"]];
var CLIP_RECT_DIRECTIONS = [[-1, -1, "nw"], [0, -1, "n"], [1, -1, "ne"], [1, 0, "e"], [1, 1, "se"], [0, 1, "s"], [-1, 1, "sw"], [-1, 0, "w"]]; // 1 2 5 6 0 3 4 7
// 0 1 2 3 4 5 6 7

function getClipStyles(moveable, clipPath, poses) {
  var clipRelative = moveable.props.clipRelative;
  var _a = moveable.state,
      width = _a.width,
      height = _a.height;
  var _b = clipPath,
      clipType = _b.type,
      clipPoses = _b.poses;
  var isRect = clipType === "rect";
  var isCircle = clipType === "circle";

  if (clipType === "polygon") {
    return poses.map(function (pos) {
      return "".concat(convertCSSSize(pos[0], width, clipRelative), " ").concat(convertCSSSize(pos[1], height, clipRelative));
    });
  } else if (isRect || clipType === "inset") {
    var top = poses[1][1];
    var right = poses[3][0];
    var left = poses[7][0];
    var bottom = poses[5][1];

    if (isRect) {
      return [top, right, bottom, left].map(function (pos) {
        return "".concat(pos, "px");
      });
    }

    var clipStyles = [top, width - right, height - bottom, left].map(function (pos, i) {
      return convertCSSSize(pos, i % 2 ? width : height, clipRelative);
    });

    if (poses.length > 8) {
      var _c = minus(poses[4], poses[0]),
          subWidth = _c[0],
          subHeight = _c[1];

      clipStyles.push.apply(clipStyles, __spreadArray(["round"], getRadiusStyles(clipPoses.slice(8).map(function (info, i) {
        return __assign(__assign({}, info), {
          pos: poses[i]
        });
      }), clipRelative, subWidth, subHeight, left, top, right, bottom).styles, false));
    }

    return clipStyles;
  } else if (isCircle || clipType === "ellipse") {
    var center = poses[0];
    var ry = convertCSSSize(Math.abs(poses[1][1] - center[1]), isCircle ? Math.sqrt((width * width + height * height) / 2) : height, clipRelative);
    var clipStyles = isCircle ? [ry] : [convertCSSSize(Math.abs(poses[2][0] - center[0]), width, clipRelative), ry];
    clipStyles.push("at", convertCSSSize(center[0], width, clipRelative), convertCSSSize(center[1], height, clipRelative));
    return clipStyles;
  }
}

function getRectPoses(top, right, bottom, left) {
  var xs = [left, (left + right) / 2, right];
  var ys = [top, (top + bottom) / 2, bottom];
  return CLIP_RECT_DIRECTIONS.map(function (_a) {
    var dirx = _a[0],
        diry = _a[1],
        dir = _a[2];
    var x = xs[dirx + 1];
    var y = ys[diry + 1];
    return {
      vertical: Math.abs(diry),
      horizontal: Math.abs(dirx),
      direction: dir,
      pos: [x, y]
    };
  });
}

function getControlSize(controlPoses) {
  var xRange = [Infinity, -Infinity];
  var yRange = [Infinity, -Infinity];
  controlPoses.forEach(function (_a) {
    var pos = _a.pos;
    xRange[0] = Math.min(xRange[0], pos[0]);
    xRange[1] = Math.max(xRange[1], pos[0]);
    yRange[0] = Math.min(yRange[0], pos[1]);
    yRange[1] = Math.max(yRange[1], pos[1]);
  });
  return [Math.abs(xRange[1] - xRange[0]), Math.abs(yRange[1] - yRange[0])];
}

function moveControlPos(controlPoses, index, dist, isRect, keepRatio) {
  var _a = controlPoses[index],
      direction = _a.direction,
      sub = _a.sub;
  var dists = controlPoses.map(function () {
    return [0, 0];
  });
  var directions = direction ? direction.split("") : [];

  if (isRect && index < 8) {
    var verticalDirections = directions.filter(function (dir) {
      return dir === "w" || dir === "e";
    });
    var horizontalDirections = directions.filter(function (dir) {
      return dir === "n" || dir === "s";
    });
    var verticalDirection_1 = verticalDirections[0];
    var horizontalDirection_1 = horizontalDirections[0];
    dists[index] = dist;

    var _b = getControlSize(controlPoses),
        width = _b[0],
        height = _b[1];

    var ratio = width && height ? width / height : 0;

    if (ratio && keepRatio) {
      // 0 1 2
      // 7   3
      // 6 5 4
      var fixedIndex = (index + 4) % 8;
      var fixedPosition = controlPoses[fixedIndex].pos;
      var sizeDirection = [0, 0];

      if (direction.indexOf("w") > -1) {
        sizeDirection[0] = -1;
      } else if (direction.indexOf("e") > -1) {
        sizeDirection[0] = 1;
      }

      if (direction.indexOf("n") > -1) {
        sizeDirection[1] = -1;
      } else if (direction.indexOf("s") > -1) {
        sizeDirection[1] = 1;
      }

      var nextDist = getSizeDistByDist([width, height], dist, ratio, sizeDirection, true);
      var nextWidth = width + nextDist[0];
      var nextHeight = height + nextDist[1];
      var top = fixedPosition[1];
      var bottom = fixedPosition[1];
      var left = fixedPosition[0];
      var right = fixedPosition[0];

      if (sizeDirection[0] === -1) {
        left = right - nextWidth;
      } else if (sizeDirection[0] === 1) {
        right = left + nextWidth;
      } else {
        left = left - nextWidth / 2;
        right = right + nextWidth / 2;
      }

      if (sizeDirection[1] === -1) {
        top = bottom - nextHeight;
      } else if (sizeDirection[1] === 1) {
        bottom = top + nextHeight;
      } else {
        top = bottom - nextHeight / 2;
        bottom = top + nextHeight;
      }

      var nextControlPoses_1 = getRectPoses(top, right, bottom, left);
      controlPoses.forEach(function (controlPose, i) {
        dists[i][0] = nextControlPoses_1[i].pos[0] - controlPose.pos[0];
        dists[i][1] = nextControlPoses_1[i].pos[1] - controlPose.pos[1];
      });
    } else {
      controlPoses.forEach(function (controlPose, i) {
        var controlDir = controlPose.direction;

        if (!controlDir) {
          return;
        }

        if (controlDir.indexOf(verticalDirection_1) > -1) {
          dists[i][0] = dist[0];
        }

        if (controlDir.indexOf(horizontalDirection_1) > -1) {
          dists[i][1] = dist[1];
        }
      });

      if (verticalDirection_1) {
        dists[1][0] = dist[0] / 2;
        dists[5][0] = dist[0] / 2;
      }

      if (horizontalDirection_1) {
        dists[3][1] = dist[1] / 2;
        dists[7][1] = dist[1] / 2;
      }
    }
  } else if (direction && !sub) {
    directions.forEach(function (dir) {
      var isVertical = dir === "n" || dir === "s";
      controlPoses.forEach(function (controlPose, i) {
        var dirDir = controlPose.direction,
            dirHorizontal = controlPose.horizontal,
            dirVertical = controlPose.vertical;

        if (!dirDir || dirDir.indexOf(dir) === -1) {
          return;
        }

        dists[i] = [isVertical || !dirHorizontal ? 0 : dist[0], !isVertical || !dirVertical ? 0 : dist[1]];
      });
    });
  } else {
    dists[index] = dist;
  }

  return dists;
}

function getClipPath(target, width, height, defaultClip, customClip) {
  var _a, _b, _c, _d, _e, _f, _g;

  var clipText = customClip;

  if (!clipText) {
    var style = getComputedStyle$1(target);
    var clipPath = style.clipPath;
    clipText = clipPath !== "none" ? clipPath : style.clip;
  }

  if (!clipText || clipText === "none" || clipText === "auto") {
    clipText = defaultClip;

    if (!clipText) {
      return;
    }
  }

  var _h = splitBracket(clipText),
      _j = _h.prefix,
      clipPrefix = _j === void 0 ? clipText : _j,
      _k = _h.value,
      value = _k === void 0 ? "" : _k;

  var isCircle = clipPrefix === "circle";
  var splitter = " ";

  if (clipPrefix === "polygon") {
    var values = splitComma(value || "0% 0%, 100% 0%, 100% 100%, 0% 100%");
    splitter = ",";
    var poses = values.map(function (pos) {
      var _a = pos.split(" "),
          xPos = _a[0],
          yPos = _a[1];

      return {
        vertical: 1,
        horizontal: 1,
        pos: [convertUnitSize(xPos, width), convertUnitSize(yPos, height)]
      };
    });
    return {
      type: clipPrefix,
      clipText: clipText,
      poses: poses,
      splitter: splitter
    };
  } else if (isCircle || clipPrefix === "ellipse") {
    var xPos = "";
    var yPos = "";
    var radiusX_1 = 0;
    var radiusY_1 = 0;
    var values = splitSpace(value);

    if (isCircle) {
      var radius = "";
      _a = values[0], radius = _a === void 0 ? "50%" : _a, _b = values[2], xPos = _b === void 0 ? "50%" : _b, _c = values[3], yPos = _c === void 0 ? "50%" : _c;
      radiusX_1 = convertUnitSize(radius, Math.sqrt((width * width + height * height) / 2));
      radiusY_1 = radiusX_1;
    } else {
      var xRadius = "";
      var yRadius = "";
      _d = values[0], xRadius = _d === void 0 ? "50%" : _d, _e = values[1], yRadius = _e === void 0 ? "50%" : _e, _f = values[3], xPos = _f === void 0 ? "50%" : _f, _g = values[4], yPos = _g === void 0 ? "50%" : _g;
      radiusX_1 = convertUnitSize(xRadius, width);
      radiusY_1 = convertUnitSize(yRadius, height);
    }

    var centerPos_1 = [convertUnitSize(xPos, width), convertUnitSize(yPos, height)];

    var poses = __spreadArray([{
      vertical: 1,
      horizontal: 1,
      pos: centerPos_1,
      direction: "nesw"
    }], CLIP_DIRECTIONS.slice(0, isCircle ? 1 : 2).map(function (dir) {
      return {
        vertical: Math.abs(dir[1]),
        horizontal: dir[0],
        direction: dir[2],
        sub: true,
        pos: [centerPos_1[0] + dir[0] * radiusX_1, centerPos_1[1] + dir[1] * radiusY_1]
      };
    }), true);

    return {
      type: clipPrefix,
      clipText: clipText,
      radiusX: radiusX_1,
      radiusY: radiusY_1,
      left: centerPos_1[0] - radiusX_1,
      top: centerPos_1[1] - radiusY_1,
      poses: poses,
      splitter: splitter
    };
  } else if (clipPrefix === "inset") {
    var values = splitSpace(value || "0 0 0 0");
    var roundIndex = values.indexOf("round");
    var rectLength = (roundIndex > -1 ? values.slice(0, roundIndex) : values).length;
    var radiusValues = values.slice(rectLength + 1);

    var _l = values.slice(0, rectLength),
        topValue = _l[0],
        _m = _l[1],
        rightValue = _m === void 0 ? topValue : _m,
        _o = _l[2],
        bottomValue = _o === void 0 ? topValue : _o,
        _p = _l[3],
        leftValue = _p === void 0 ? rightValue : _p;

    var _q = [topValue, bottomValue].map(function (pos) {
      return convertUnitSize(pos, height);
    }),
        top = _q[0],
        bottom = _q[1];

    var _r = [leftValue, rightValue].map(function (pos) {
      return convertUnitSize(pos, width);
    }),
        left = _r[0],
        right = _r[1];

    var nextRight = width - right;
    var nextBottom = height - bottom;
    var radiusPoses = getRadiusValues(radiusValues, nextRight - left, nextBottom - top, left, top);

    var poses = __spreadArray(__spreadArray([], getRectPoses(top, nextRight, nextBottom, left), true), radiusPoses, true);

    return {
      type: "inset",
      clipText: clipText,
      poses: poses,
      top: top,
      left: left,
      right: nextRight,
      bottom: nextBottom,
      radius: radiusValues,
      splitter: splitter
    };
  } else if (clipPrefix === "rect") {
    // top right bottom left
    var values = splitComma(value || "0px, ".concat(width, "px, ").concat(height, "px, 0px"));
    splitter = ",";

    var _s = values.map(function (pos) {
      var posValue = splitUnit(pos).value;
      return posValue;
    }),
        top = _s[0],
        right = _s[1],
        bottom = _s[2],
        left = _s[3];

    var poses = getRectPoses(top, right, bottom, left);
    return {
      type: "rect",
      clipText: clipText,
      poses: poses,
      top: top,
      right: right,
      bottom: bottom,
      left: left,
      values: values,
      splitter: splitter
    };
  }

  return;
}

function addClipPath(moveable, e) {
  var _a = calculatePointerDist(moveable, e),
      distX = _a[0],
      distY = _a[1];

  var _b = e.datas,
      clipPath = _b.clipPath,
      clipIndex = _b.clipIndex;
  var _c = clipPath,
      clipType = _c.type,
      clipPoses = _c.poses,
      splitter = _c.splitter;
  var poses = clipPoses.map(function (pos) {
    return pos.pos;
  });

  if (clipType === "polygon") {
    poses.splice(clipIndex, 0, [distX, distY]);
  } else if (clipType === "inset") {
    var horizontalIndex = HORIZONTAL_RADIUS_ORDER.indexOf(clipIndex);
    var verticalIndex = VERTICAL_RADIUS_ORDER.indexOf(clipIndex);
    var length = clipPoses.length;
    addRadiusPos(clipPoses, poses, 8, horizontalIndex, verticalIndex, distX, distY, poses[4][0], poses[4][1], poses[0][0], poses[0][1]);

    if (length === clipPoses.length) {
      return;
    }
  } else {
    return;
  }

  var clipStyles = getClipStyles(moveable, clipPath, poses);
  triggerEvent(moveable, "onClip", fillParams(moveable, e, {
    clipEventType: "added",
    clipType: clipType,
    poses: poses,
    clipStyles: clipStyles,
    clipStyle: "".concat(clipType, "(").concat(clipStyles.join(splitter), ")"),
    distX: 0,
    distY: 0
  }));
}

function removeClipPath(moveable, e) {
  var _a = e.datas,
      clipPath = _a.clipPath,
      clipIndex = _a.clipIndex;
  var _b = clipPath,
      clipType = _b.type,
      clipPoses = _b.poses,
      splitter = _b.splitter;
  var poses = clipPoses.map(function (pos) {
    return pos.pos;
  });
  var length = poses.length;

  if (clipType === "polygon") {
    clipPoses.splice(clipIndex, 1);
    poses.splice(clipIndex, 1);
  } else if (clipType === "inset") {
    if (clipIndex < 8) {
      return;
    }

    removeRadiusPos(clipPoses, poses, clipIndex, 8, length);

    if (length === clipPoses.length) {
      return;
    }
  } else {
    return;
  }

  var clipStyles = getClipStyles(moveable, clipPath, poses);
  triggerEvent(moveable, "onClip", fillParams(moveable, e, {
    clipEventType: "removed",
    clipType: clipType,
    poses: poses,
    clipStyles: clipStyles,
    clipStyle: "".concat(clipType, "(").concat(clipStyles.join(splitter), ")"),
    distX: 0,
    distY: 0
  }));
}
/**
 * @namespace Moveable.Clippable
 * @description Whether to clip the target.
 */


var Clippable = {
  name: "clippable",
  props: {
    clippable: Boolean,
    defaultClipPath: String,
    customClipPath: String,
    keepRatio: Boolean,
    clipRelative: Boolean,
    clipArea: Boolean,
    dragWithClip: Boolean,
    clipTargetBounds: Boolean,
    clipVerticalGuidelines: Array,
    clipHorizontalGuidelines: Array,
    clipSnapThreshold: Boolean
  },
  events: {
    onClipStart: "clipStart",
    onClip: "clip",
    onClipEnd: "clipEnd"
  },
  css: [".control.clip-control {\n    background: #6d6;\n    cursor: pointer;\n}\n.control.clip-control.clip-radius {\n    background: #d66;\n}\n.line.clip-line {\n    background: #6e6;\n    cursor: move;\n    z-index: 1;\n}\n.clip-area {\n    position: absolute;\n    top: 0;\n    left: 0;\n}\n.clip-ellipse {\n    position: absolute;\n    cursor: move;\n    border: 1px solid #6d6;\n    border: var(--zoompx) solid #6d6;\n    border-radius: 50%;\n    transform-origin: 0px 0px;\n}", ":host {\n    --bounds-color: #d66;\n}", ".guideline {\n    pointer-events: none;\n    z-index: 2;\n}", ".line.guideline.bounds {\n    background: #d66;\n    background: var(--bounds-color);\n}"],
  render: function (moveable, React) {
    var _a = moveable.props,
        customClipPath = _a.customClipPath,
        defaultClipPath = _a.defaultClipPath,
        clipArea = _a.clipArea,
        zoom = _a.zoom;

    var _b = moveable.getState(),
        target = _b.target,
        width = _b.width,
        height = _b.height,
        allMatrix = _b.allMatrix,
        is3d = _b.is3d,
        left = _b.left,
        top = _b.top,
        pos1 = _b.pos1,
        pos2 = _b.pos2,
        pos3 = _b.pos3,
        pos4 = _b.pos4,
        clipPathState = _b.clipPathState,
        snapBoundInfos = _b.snapBoundInfos,
        rotationRad = _b.rotation;

    if (!target) {
      return [];
    }

    var clipPath = getClipPath(target, width, height, defaultClipPath || "inset", clipPathState || customClipPath);

    if (!clipPath) {
      return [];
    }

    var n = is3d ? 4 : 3;
    var type = clipPath.type;
    var clipPoses = clipPath.poses;
    var poses = clipPoses.map(function (pos) {
      // return [x, y];
      var calculatedPos = calculatePosition(allMatrix, pos.pos, n);
      return [calculatedPos[0] - left, calculatedPos[1] - top];
    });
    var controls = [];
    var lines = [];
    var isRect = type === "rect";
    var isInset = type === "inset";
    var isPolygon = type === "polygon";

    if (isRect || isInset || isPolygon) {
      var linePoses_1 = isInset ? poses.slice(0, 8) : poses;
      lines = linePoses_1.map(function (to, i) {
        var from = i === 0 ? linePoses_1[linePoses_1.length - 1] : linePoses_1[i - 1];
        var rad = getRad(from, to);
        var dist = getDiagonalSize(from, to);
        return React.createElement("div", {
          key: "clipLine".concat(i),
          className: prefix("line", "clip-line", "snap-control"),
          "data-clip-index": i,
          style: {
            width: "".concat(dist, "px"),
            transform: "translate(".concat(from[0], "px, ").concat(from[1], "px) rotate(").concat(rad, "rad) scaleY(").concat(zoom, ")")
          }
        });
      });
    }

    controls = poses.map(function (pos, i) {
      return React.createElement("div", {
        key: "clipControl".concat(i),
        className: prefix("control", "clip-control", "snap-control"),
        "data-clip-index": i,
        style: {
          transform: "translate(".concat(pos[0], "px, ").concat(pos[1], "px) rotate(").concat(rotationRad, "rad) scale(").concat(zoom, ")")
        }
      });
    });

    if (isInset) {
      controls.push.apply(controls, poses.slice(8).map(function (pos, i) {
        return React.createElement("div", {
          key: "clipRadiusControl".concat(i),
          className: prefix("control", "clip-control", "clip-radius", "snap-control"),
          "data-clip-index": 8 + i,
          style: {
            transform: "translate(".concat(pos[0], "px, ").concat(pos[1], "px) rotate(").concat(rotationRad, "rad) scale(").concat(zoom, ")")
          }
        });
      }));
    }

    if (type === "circle" || type === "ellipse") {
      var clipLeft = clipPath.left,
          clipTop = clipPath.top,
          radiusX = clipPath.radiusX,
          radiusY = clipPath.radiusY;

      var _c = minus(calculatePosition(allMatrix, [clipLeft, clipTop], n), calculatePosition(allMatrix, [0, 0], n)),
          distLeft = _c[0],
          distTop = _c[1];

      var ellipseClipPath = "none";

      if (!clipArea) {
        var piece = Math.max(10, radiusX / 5, radiusY / 5);
        var areaPoses = [];

        for (var i = 0; i <= piece; ++i) {
          var rad = Math.PI * 2 / piece * i;
          areaPoses.push([radiusX + (radiusX - zoom) * Math.cos(rad), radiusY + (radiusY - zoom) * Math.sin(rad)]);
        }

        areaPoses.push([radiusX, -2]);
        areaPoses.push([-2, -2]);
        areaPoses.push([-2, radiusY * 2 + 2]);
        areaPoses.push([radiusX * 2 + 2, radiusY * 2 + 2]);
        areaPoses.push([radiusX * 2 + 2, -2]);
        areaPoses.push([radiusX, -2]);
        ellipseClipPath = "polygon(".concat(areaPoses.map(function (pos) {
          return "".concat(pos[0], "px ").concat(pos[1], "px");
        }).join(", "), ")");
      }

      controls.push(React.createElement("div", {
        key: "clipEllipse",
        className: prefix("clip-ellipse", "snap-control"),
        style: {
          width: "".concat(radiusX * 2, "px"),
          height: "".concat(radiusY * 2, "px"),
          clipPath: ellipseClipPath,
          transform: "translate(".concat(-left + distLeft, "px, ").concat(-top + distTop, "px) ").concat(makeMatrixCSS(allMatrix))
        }
      }));
    }

    if (clipArea) {
      var _d = getRect(__spreadArray([pos1, pos2, pos3, pos4], poses, true)),
          allWidth = _d.width,
          allHeight = _d.height,
          allLeft_1 = _d.left,
          allTop_1 = _d.top;

      if (isPolygon || isRect || isInset) {
        var areaPoses = isInset ? poses.slice(0, 8) : poses;
        controls.push(React.createElement("div", {
          key: "clipArea",
          className: prefix("clip-area", "snap-control"),
          style: {
            width: "".concat(allWidth, "px"),
            height: "".concat(allHeight, "px"),
            transform: "translate(".concat(allLeft_1, "px, ").concat(allTop_1, "px)"),
            clipPath: "polygon(".concat(areaPoses.map(function (pos) {
              return "".concat(pos[0] - allLeft_1, "px ").concat(pos[1] - allTop_1, "px");
            }).join(", "), ")")
          }
        }));
      }
    }

    if (snapBoundInfos) {
      ["vertical", "horizontal"].forEach(function (directionType) {
        var info = snapBoundInfos[directionType];
        var isHorizontal = directionType === "horizontal";

        if (info.isSnap) {
          lines.push.apply(lines, info.snap.posInfos.map(function (_a, i) {
            var pos = _a.pos;
            var snapPos1 = minus(calculatePosition(allMatrix, isHorizontal ? [0, pos] : [pos, 0], n), [left, top]);
            var snapPos2 = minus(calculatePosition(allMatrix, isHorizontal ? [width, pos] : [pos, height], n), [left, top]);
            return renderLine(React, "", snapPos1, snapPos2, zoom, "clip".concat(directionType, "snap").concat(i), "guideline");
          }));
        }

        if (info.isBound) {
          lines.push.apply(lines, info.bounds.map(function (_a, i) {
            var pos = _a.pos;
            var snapPos1 = minus(calculatePosition(allMatrix, isHorizontal ? [0, pos] : [pos, 0], n), [left, top]);
            var snapPos2 = minus(calculatePosition(allMatrix, isHorizontal ? [width, pos] : [pos, height], n), [left, top]);
            return renderLine(React, "", snapPos1, snapPos2, zoom, "clip".concat(directionType, "bounds").concat(i), "guideline", "bounds", "bold");
          }));
        }
      });
    }

    return __spreadArray(__spreadArray([], controls, true), lines, true);
  },
  dragControlCondition: function (moveable, e) {
    return e.inputEvent && (e.inputEvent.target.getAttribute("class") || "").indexOf("clip") > -1;
  },
  dragStart: function (moveable, e) {
    var props = moveable.props;
    var _a = props.dragWithClip,
        dragWithClip = _a === void 0 ? true : _a;

    if (dragWithClip) {
      return false;
    }

    return this.dragControlStart(moveable, e);
  },
  drag: function (moveable, e) {
    return this.dragControl(moveable, __assign(__assign({}, e), {
      isDragTarget: true
    }));
  },
  dragEnd: function (moveable, e) {
    return this.dragControlEnd(moveable, e);
  },
  dragControlStart: function (moveable, e) {
    var state = moveable.state;
    var _a = moveable.props,
        defaultClipPath = _a.defaultClipPath,
        customClipPath = _a.customClipPath;
    var target = state.target,
        width = state.width,
        height = state.height;
    var inputTarget = e.inputEvent ? e.inputEvent.target : null;
    var className = inputTarget && inputTarget.getAttribute("class") || "";
    var datas = e.datas;
    var clipPath = getClipPath(target, width, height, defaultClipPath || "inset", customClipPath);

    if (!clipPath) {
      return false;
    }

    var clipText = clipPath.clipText,
        type = clipPath.type,
        poses = clipPath.poses;
    var result = triggerEvent(moveable, "onClipStart", fillParams(moveable, e, {
      clipType: type,
      clipStyle: clipText,
      poses: poses.map(function (pos) {
        return pos.pos;
      })
    }));

    if (result === false) {
      datas.isClipStart = false;
      return false;
    }

    datas.isControl = className && className.indexOf("clip-control") > -1;
    datas.isLine = className.indexOf("clip-line") > -1;
    datas.isArea = className.indexOf("clip-area") > -1 || className.indexOf("clip-ellipse") > -1;
    datas.clipIndex = inputTarget ? parseInt(inputTarget.getAttribute("data-clip-index"), 10) : -1;
    datas.clipPath = clipPath;
    datas.isClipStart = true;
    state.clipPathState = clipText;
    setDragStart(moveable, e);
    return true;
  },
  dragControl: function (moveable, e) {
    var _a;

    var datas = e.datas,
        originalDatas = e.originalDatas,
        isDragTarget = e.isDragTarget;

    if (!datas.isClipStart) {
      return false;
    }

    var _b = datas,
        isControl = _b.isControl,
        isLine = _b.isLine,
        isArea = _b.isArea,
        clipIndex = _b.clipIndex,
        clipPath = _b.clipPath;

    if (!clipPath) {
      return false;
    }

    var props = getProps(moveable.props, "clippable");
    var keepRatio = props.keepRatio;
    var distX = 0;
    var distY = 0;
    var originalDraggable = originalDatas.draggable;
    var originalDist = getDragDist(e);

    if (isDragTarget && originalDraggable) {
      _a = originalDraggable.prevBeforeDist, distX = _a[0], distY = _a[1];
    } else {
      distX = originalDist[0], distY = originalDist[1];
    }

    var firstDist = [distX, distY];
    var state = moveable.state;
    var width = state.width,
        height = state.height;
    var isDragWithTarget = !isArea && !isControl && !isLine;
    var clipType = clipPath.type,
        clipPoses = clipPath.poses,
        splitter = clipPath.splitter;
    var poses = clipPoses.map(function (pos) {
      return pos.pos;
    });

    if (isDragWithTarget) {
      distX = -distX;
      distY = -distY;
    }

    var isAll = !isControl || clipPoses[clipIndex].direction === "nesw";
    var isRect = clipType === "inset" || clipType === "rect";
    var dists = clipPoses.map(function () {
      return [0, 0];
    });

    if (isControl && !isAll) {
      var _c = clipPoses[clipIndex],
          horizontal = _c.horizontal,
          vertical = _c.vertical;
      var dist = [distX * Math.abs(horizontal), distY * Math.abs(vertical)];
      dists = moveControlPos(clipPoses, clipIndex, dist, isRect, keepRatio);
    } else if (isAll) {
      dists = poses.map(function () {
        return [distX, distY];
      });
    }

    var nextPoses = poses.map(function (pos, i) {
      return plus(pos, dists[i]);
    });

    var guidePoses = __spreadArray([], nextPoses, true);

    state.snapBoundInfos = null;
    var isCircle = clipPath.type === "circle";
    var isEllipse = clipPath.type === "ellipse";

    if (isCircle || isEllipse) {
      var guideRect = getRect(nextPoses);
      var ry = Math.abs(guideRect.bottom - guideRect.top);
      var rx = Math.abs(isEllipse ? guideRect.right - guideRect.left : ry);
      var bottom = nextPoses[0][1] + ry;
      var left = nextPoses[0][0] - rx;
      var right = nextPoses[0][0] + rx; // right

      if (isCircle) {
        guidePoses.push([right, guideRect.bottom]);
        dists.push([1, 0]);
      } // bottom


      guidePoses.push([guideRect.left, bottom]);
      dists.push([0, 1]); // left

      guidePoses.push([left, guideRect.bottom]);
      dists.push([1, 0]);
    }

    var guidelines = getDefaultGuidelines((props.clipHorizontalGuidelines || []).map(function (v) {
      return convertUnitSize("".concat(v), height);
    }), (props.clipVerticalGuidelines || []).map(function (v) {
      return convertUnitSize("".concat(v), width);
    }), width, height);
    var guideXPoses = [];
    var guideYPoses = [];

    if (isCircle || isEllipse) {
      guideXPoses = [guidePoses[4][0], guidePoses[2][0]];
      guideYPoses = [guidePoses[1][1], guidePoses[3][1]];
    } else if (isRect) {
      var rectPoses = [guidePoses[0], guidePoses[2], guidePoses[4], guidePoses[6]];
      var rectDists_1 = [dists[0], dists[2], dists[4], dists[6]];
      guideXPoses = rectPoses.filter(function (_, i) {
        return rectDists_1[i][0];
      }).map(function (pos) {
        return pos[0];
      });
      guideYPoses = rectPoses.filter(function (_, i) {
        return rectDists_1[i][1];
      }).map(function (pos) {
        return pos[1];
      });
    } else {
      guideXPoses = guidePoses.filter(function (_, i) {
        return dists[i][0];
      }).map(function (pos) {
        return pos[0];
      });
      guideYPoses = guidePoses.filter(function (_, i) {
        return dists[i][1];
      }).map(function (pos) {
        return pos[1];
      });
    }

    var boundDelta = [0, 0];

    var _d = checkSnapBounds(guidelines, props.clipTargetBounds && {
      left: 0,
      top: 0,
      right: width,
      bottom: height
    }, guideXPoses, guideYPoses, 5),
        horizontalSnapInfo = _d.horizontal,
        verticalSnapInfo = _d.vertical;

    var snapOffsetY = horizontalSnapInfo.offset;
    var snapOffsetX = verticalSnapInfo.offset;

    if (horizontalSnapInfo.isBound) {
      boundDelta[1] += snapOffsetY;
    }

    if (verticalSnapInfo.isBound) {
      boundDelta[0] += snapOffsetX;
    }

    if ((isEllipse || isCircle) && dists[0][0] === 0 && dists[0][1] === 0) {
      var guideRect = getRect(nextPoses);
      var cy = guideRect.bottom - guideRect.top;
      var cx = isEllipse ? guideRect.right - guideRect.left : cy;
      var distSnapX = verticalSnapInfo.isBound ? Math.abs(snapOffsetX) : verticalSnapInfo.snapIndex === 0 ? -snapOffsetX : snapOffsetX;
      var distSnapY = horizontalSnapInfo.isBound ? Math.abs(snapOffsetY) : horizontalSnapInfo.snapIndex === 0 ? -snapOffsetY : snapOffsetY;
      cx -= distSnapX;
      cy -= distSnapY;

      if (isCircle) {
        cy = checkSnapBoundPriority(verticalSnapInfo, horizontalSnapInfo) > 0 ? cy : cx;
        cx = cy;
      }

      var center = guidePoses[0];
      guidePoses[1][1] = center[1] - cy;
      guidePoses[2][0] = center[0] + cx;
      guidePoses[3][1] = center[1] + cy;
      guidePoses[4][0] = center[0] - cx;
    } else if (isRect && keepRatio && isControl) {
      var _e = getControlSize(clipPoses),
          width_1 = _e[0],
          height_1 = _e[1];

      var ratio = width_1 && height_1 ? width_1 / height_1 : 0;
      var clipPose = clipPoses[clipIndex];
      var direction = clipPose.direction || "";
      var top = guidePoses[1][1];
      var bottom = guidePoses[5][1];
      var left = guidePoses[7][0];
      var right = guidePoses[3][0];

      if (snapOffsetY <= snapOffsetX) {
        snapOffsetY = snapOffsetX / ratio;
      } else {
        snapOffsetX = snapOffsetY * ratio;
      }

      if (direction.indexOf("w") > -1) {
        left -= snapOffsetX;
      } else if (direction.indexOf("e") > -1) {
        right -= snapOffsetX;
      } else {
        left += snapOffsetX / 2;
        right -= snapOffsetX / 2;
      }

      if (direction.indexOf("n") > -1) {
        top -= snapOffsetY;
      } else if (direction.indexOf("s") > -1) {
        bottom -= snapOffsetY;
      } else {
        top += snapOffsetY / 2;
        bottom -= snapOffsetY / 2;
      }

      var nextControlPoses_2 = getRectPoses(top, right, bottom, left);
      guidePoses.forEach(function (pos, i) {
        var _a;

        _a = nextControlPoses_2[i].pos, pos[0] = _a[0], pos[1] = _a[1];
      });
    } else {
      guidePoses.forEach(function (pos, j) {
        var dist = dists[j];

        if (dist[0]) {
          pos[0] -= snapOffsetX;
        }

        if (dist[1]) {
          pos[1] -= snapOffsetY;
        }
      });
    }

    var nextClipStyles = getClipStyles(moveable, clipPath, nextPoses);
    var clipStyle = "".concat(clipType, "(").concat(nextClipStyles.join(splitter), ")");
    state.clipPathState = clipStyle;

    if (isCircle || isEllipse) {
      guideXPoses = [guidePoses[4][0], guidePoses[2][0]];
      guideYPoses = [guidePoses[1][1], guidePoses[3][1]];
    } else if (isRect) {
      var rectPoses = [guidePoses[0], guidePoses[2], guidePoses[4], guidePoses[6]];
      guideXPoses = rectPoses.map(function (pos) {
        return pos[0];
      });
      guideYPoses = rectPoses.map(function (pos) {
        return pos[1];
      });
    } else {
      guideXPoses = guidePoses.map(function (pos) {
        return pos[0];
      });
      guideYPoses = guidePoses.map(function (pos) {
        return pos[1];
      });
    }

    state.snapBoundInfos = checkSnapBounds(guidelines, props.clipTargetBounds && {
      left: 0,
      top: 0,
      right: width,
      bottom: height
    }, guideXPoses, guideYPoses, 1);

    if (originalDraggable) {
      var is3d = state.is3d,
          allMatrix = state.allMatrix;
      var n = is3d ? 4 : 3;
      var dragDist = boundDelta;

      if (isDragTarget) {
        dragDist = [firstDist[0] + boundDelta[0] - originalDist[0], firstDist[1] + boundDelta[1] - originalDist[1]];
      }

      originalDraggable.deltaOffset = multiply(allMatrix, [dragDist[0], dragDist[1], 0, 0], n);
    }

    triggerEvent(moveable, "onClip", fillParams(moveable, e, {
      clipEventType: "changed",
      clipType: clipType,
      poses: nextPoses,
      clipStyle: clipStyle,
      clipStyles: nextClipStyles,
      distX: distX,
      distY: distY
    }));
    return true;
  },
  dragControlEnd: function (moveable, e) {
    this.unset(moveable);
    var isDrag = e.isDrag,
        datas = e.datas,
        isDouble = e.isDouble;
    var isLine = datas.isLine,
        isClipStart = datas.isClipStart,
        isControl = datas.isControl;

    if (!isClipStart) {
      return false;
    }

    triggerEvent(moveable, "onClipEnd", fillEndParams(moveable, e, {}));

    if (isDouble) {
      if (isControl) {
        removeClipPath(moveable, e);
      } else if (isLine) {
        // add
        addClipPath(moveable, e);
      }
    }

    return isDouble || isDrag;
  },
  unset: function (moveable) {
    moveable.state.clipPathState = "";
    moveable.state.snapBoundInfos = null;
  }
};
/**
 * Whether to clip the target. (default: false)
 * @name Moveable.Clippable#clippable
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     clippable: true,
 *     defaultClipPath: "inset",
 *     customClipPath: "",
 *     clipRelative: false,
 *     clipArea: false,
 *     dragWithClip: true,
 * });
 * moveable.on("clipStart", e => {
 *     console.log(e);
 * }).on("clip", e => {
 *     if (e.clipType === "rect") {
 *         e.target.style.clip = e.clipStyle;
 *     } else {
 *         e.target.style.clipPath = e.clipStyle;
 *     }
 * }).on("clipEnd", e => {
 *     console.log(e);
 * });
 */

/**
 *  If clippath is not set, the default value can be set. (defaultClipPath < style < customClipPath < dragging clipPath)
 * @name Moveable.Clippable#defaultClipPath
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     clippable: true,
 *     defaultClipPath: "inset",
 *     customClipPath: "",
 *     clipRelative: false,
 *     clipArea: false,
 *     dragWithClip: true,
 * });
 * moveable.on("clipStart", e => {
 *     console.log(e);
 * }).on("clip", e => {
 *     if (e.clipType === "rect") {
 *         e.target.style.clip = e.clipStyle;
 *     } else {
 *         e.target.style.clipPath = e.clipStyle;
 *     }
 * }).on("clipEnd", e => {
 *     console.log(e);
 * });
 */

/**
 * % Can be used instead of the absolute px (`rect` not possible) (default: false)
 * @name Moveable.Clippable#clipRelative
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     clippable: true,
 *     defaultClipPath: "inset",
 *     customClipPath: "",
 *     clipRelative: false,
 *     clipArea: false,
 *     dragWithClip: true,
 * });
 * moveable.on("clipStart", e => {
 *     console.log(e);
 * }).on("clip", e => {
 *     if (e.clipType === "rect") {
 *         e.target.style.clip = e.clipStyle;
 *     } else {
 *         e.target.style.clipPath = e.clipStyle;
 *     }
 * }).on("clipEnd", e => {
 *     console.log(e);
 * });
 */

/**
 * You can force the custom clipPath. (defaultClipPath < style < customClipPath < dragging clipPath)
 * @name Moveable.Clippable#customClipPath
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     clippable: true,
 *     defaultClipPath: "inset",
 *     customClipPath: "",
 *     clipRelative: false,
 *     clipArea: false,
 *     dragWithClip: true,
 * });
 * moveable.on("clipStart", e => {
 *     console.log(e);
 * }).on("clip", e => {
 *     if (e.clipType === "rect") {
 *         e.target.style.clip = e.clipStyle;
 *     } else {
 *         e.target.style.clipPath = e.clipStyle;
 *     }
 * }).on("clipEnd", e => {
 *     console.log(e);
 * });
 */

/**
 * When dragging the target, the clip also moves. (default: true)
 * @name Moveable.Clippable#dragWithClip
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     clippable: true,
 *     defaultClipPath: "inset",
 *     customClipPath: "",
 *     clipRelative: false,
 *     clipArea: false,
 *     dragWithClip: true,
 * });
 * moveable.on("clipStart", e => {
 *     console.log(e);
 * }).on("clip", e => {
 *     if (e.clipType === "rect") {
 *         e.target.style.clip = e.clipStyle;
 *     } else {
 *         e.target.style.clipPath = e.clipStyle;
 *     }
 * }).on("clipEnd", e => {
 *     console.log(e);
 * });
 */

/**
 * You can drag the clip by setting clipArea.
 * @name Moveable.Clippable#clipArea
 * @default false
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     clippable: true,
 *     defaultClipPath: "inset",
 *     customClipPath: "",
 *     clipRelative: false,
 *     clipArea: false,
 *     dragWithClip: true,
 * });
 * moveable.on("clipStart", e => {
 *     console.log(e);
 * }).on("clip", e => {
 *     if (e.clipType === "rect") {
 *         e.target.style.clip = e.clipStyle;
 *     } else {
 *         e.target.style.clipPath = e.clipStyle;
 *     }
 * }).on("clipEnd", e => {
 *     console.log(e);
 * });
 */

/**
* Whether the clip is bound to the target.
* @name Moveable.Clippable#clipTargetBounds
* @default false
* @example
* import Moveable from "moveable";
*
* const moveable = new Moveable(document.body, {
*     clippable: true,
*     defaultClipPath: "inset",
*     customClipPath: "",
*     clipRelative: false,
*     clipArea: false,
*     dragWithClip: true,
*     clipTargetBounds: true,
* });
* moveable.on("clipStart", e => {
*     console.log(e);
* }).on("clip", e => {
*     if (e.clipType === "rect") {
*         e.target.style.clip = e.clipStyle;
*     } else {
*         e.target.style.clipPath = e.clipStyle;
*     }
* }).on("clipEnd", e => {
*     console.log(e);
* });
*/

/**
 * Add clip guidelines in the vertical direction.
 * @name Moveable.Clippable#clipVerticalGuidelines
 * @default 0
 * @example
* import Moveable from "moveable";
*
* const moveable = new Moveable(document.body, {
*     clippable: true,
*     defaultClipPath: "inset",
*     customClipPath: "",
*     clipRelative: false,
*     clipArea: false,
*     dragWithClip: true,
*     clipVerticalGuidelines: [0, 100, 200],
*     clipHorizontalGuidelines: [0, 100, 200],
*     clipSnapThreshold: 5,
* });
*/

/**
* Add clip guidelines in the horizontal direction.
* @name Moveable.Clippable#clipHorizontalGuidelines
* @default []
* @example
* import Moveable from "moveable";
*
* const moveable = new Moveable(document.body, {
*     clippable: true,
*     defaultClipPath: "inset",
*     customClipPath: "",
*     clipRelative: false,
*     clipArea: false,
*     dragWithClip: true,
*     clipVerticalGuidelines: [0, 100, 200],
*     clipHorizontalGuidelines: [0, 100, 200],
*     clipSnapThreshold: 5,
* });
*/

/**
* istance value that can snap to clip guidelines.
* @name Moveable.Clippable#clipSnapThreshold
* @default 5
* @example
* import Moveable from "moveable";
*
* const moveable = new Moveable(document.body, {
*     clippable: true,
*     defaultClipPath: "inset",
*     customClipPath: "",
*     clipRelative: false,
*     clipArea: false,
*     dragWithClip: true,
*     clipVerticalGuidelines: [0, 100, 200],
*     clipHorizontalGuidelines: [0, 100, 200],
*     clipSnapThreshold: 5,
* });
*/

/**
 * When drag start the clip area or controls, the `clipStart` event is called.
 * @memberof Moveable.Clippable
 * @event clipStart
 * @param {Moveable.Clippable.OnClipStart} - Parameters for the `clipStart` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     clippable: true,
 *     defaultClipPath: "inset",
 *     customClipPath: "",
 *     clipRelative: false,
 *     clipArea: false,
 *     dragWithClip: true,
 * });
 * moveable.on("clipStart", e => {
 *     console.log(e);
 * }).on("clip", e => {
 *     if (e.clipType === "rect") {
 *         e.target.style.clip = e.clipStyle;
 *     } else {
 *         e.target.style.clipPath = e.clipStyle;
 *     }
 * }).on("clipEnd", e => {
 *     console.log(e);
 * });
 */

/**
 * When drag the clip area or controls, the `clip` event is called.
 * @memberof Moveable.Clippable
 * @event clip
 * @param {Moveable.Clippable.OnClip} - Parameters for the `clip` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     clippable: true,
 *     defaultClipPath: "inset",
 *     customClipPath: "",
 *     clipRelative: false,
 *     clipArea: false,
 *     dragWithClip: true,
 * });
 * moveable.on("clipStart", e => {
 *     console.log(e);
 * }).on("clip", e => {
 *     if (e.clipType === "rect") {
 *         e.target.style.clip = e.clipStyle;
 *     } else {
 *         e.target.style.clipPath = e.clipStyle;
 *     }
 * }).on("clipEnd", e => {
 *     console.log(e);
 * });
 */

/**
 * When drag end the clip area or controls, the `clipEnd` event is called.
 * @memberof Moveable.Clippable
 * @event clipEnd
 * @param {Moveable.Clippable.OnClipEnd} - Parameters for the `clipEnd` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     clippable: true,
 *     defaultClipPath: "inset",
 *     customClipPath: "",
 *     clipRelative: false,
 *     clipArea: false,
 *     dragWithClip: true,
 * });
 * moveable.on("clipStart", e => {
 *     console.log(e);
 * }).on("clip", e => {
 *     if (e.clipType === "rect") {
 *         e.target.style.clip = e.clipStyle;
 *     } else {
 *         e.target.style.clipPath = e.clipStyle;
 *     }
 * }).on("clipEnd", e => {
 *     console.log(e);
 * });
 */

/**
 * @namespace OriginDraggable
 * @memberof Moveable
 * @description Whether to drag origin (default: false)
 */

var OriginDraggable = {
  name: "originDraggable",
  props: {
    originDraggable: Boolean,
    originRelative: Boolean
  },
  events: {
    onDragOriginStart: "dragOriginStart",
    onDragOrigin: "dragOrigin",
    onDragOriginEnd: "dragOriginEnd"
  },
  css: [":host[data-able-origindraggable] .control.origin {\n    pointer-events: auto;\n}"],
  dragControlCondition: function (_, e) {
    if (e.isRequest) {
      return e.requestAble === "originDraggable";
    }

    return hasClass(e.inputEvent.target, prefix("origin"));
  },
  dragControlStart: function (moveable, e) {
    var datas = e.datas;
    setDragStart(moveable, e);
    var params = fillParams(moveable, e, {
      dragStart: Draggable.dragStart(moveable, new CustomGesto().dragStart([0, 0], e))
    });
    var result = triggerEvent(moveable, "onDragOriginStart", params);
    datas.startOrigin = moveable.state.transformOrigin;
    datas.startTargetOrigin = moveable.state.targetOrigin;
    datas.prevOrigin = [0, 0];
    datas.isDragOrigin = true;

    if (result === false) {
      datas.isDragOrigin = false;
      return false;
    }

    return params;
  },
  dragControl: function (moveable, e) {
    var datas = e.datas,
        isPinch = e.isPinch,
        isRequest = e.isRequest;

    if (!datas.isDragOrigin) {
      return false;
    }

    var _a = getDragDist(e),
        distX = _a[0],
        distY = _a[1];

    var state = moveable.state;
    var width = state.width,
        height = state.height,
        offsetMatrix = state.offsetMatrix,
        targetMatrix = state.targetMatrix,
        is3d = state.is3d;
    var _b = moveable.props.originRelative,
        originRelative = _b === void 0 ? true : _b;
    var n = is3d ? 4 : 3;
    var dist = [distX, distY];

    if (isRequest) {
      var distOrigin = e.distOrigin;

      if (distOrigin[0] || distOrigin[1]) {
        dist = distOrigin;
      }
    }

    var origin = plus(datas.startOrigin, dist);
    var targetOrigin = plus(datas.startTargetOrigin, dist);
    var delta = minus(dist, datas.prevOrigin);
    var nextMatrix = getNextMatrix(offsetMatrix, targetMatrix, origin, n);
    var rect = moveable.getRect();
    var nextRect = getRect(calculatePoses(nextMatrix, width, height, n));
    var dragDelta = [rect.left - nextRect.left, rect.top - nextRect.top];
    datas.prevOrigin = dist;
    var transformOrigin = [convertCSSSize(targetOrigin[0], width, originRelative), convertCSSSize(targetOrigin[1], height, originRelative)].join(" ");
    var params = fillParams(moveable, e, {
      width: width,
      height: height,
      origin: origin,
      dist: dist,
      delta: delta,
      transformOrigin: transformOrigin,
      drag: Draggable.drag(moveable, setCustomDrag(e, moveable.state, dragDelta, !!isPinch, false))
    });
    triggerEvent(moveable, "onDragOrigin", params);
    return params;
  },
  dragControlEnd: function (moveable, e) {
    var datas = e.datas;

    if (!datas.isDragOrigin) {
      return false;
    }

    triggerEvent(moveable, "onDragOriginEnd", fillEndParams(moveable, e, {}));
    return true;
  },
  dragGroupControlCondition: function (moveable, e) {
    return this.dragControlCondition(moveable, e);
  },
  dragGroupControlStart: function (moveable, e) {
    var params = this.dragControlStart(moveable, e);

    if (!params) {
      return false;
    }

    return true;
  },
  dragGroupControl: function (moveable, e) {
    var params = this.dragControl(moveable, e);

    if (!params) {
      return false;
    }

    moveable.transformOrigin = params.transformOrigin;
    return true;
  },

  /**
  * @method Moveable.OriginDraggable#request
  * @param {object} e - the OriginDraggable's request parameter
  * @param {number} [e.x] - x position
  * @param {number} [e.y] - y position
  * @param {number} [e.deltaX] - x number to move
  * @param {number} [e.deltaY] - y number to move
  * @param {array} [e.deltaOrigin] - left, top number to move transform-origin
  * @param {array} [e.origin] - transform-origin position
  * @param {number} [e.isInstant] - Whether to execute the request instantly
  * @return {Moveable.Requester} Moveable Requester
  * @example
   * // Instantly Request (requestStart - request - requestEnd)
  * // Use Relative Value
  * moveable.request("originDraggable", { deltaX: 10, deltaY: 10 }, true);
  * // Use Absolute Value
  * moveable.request("originDraggable", { x: 200, y: 100 }, true);
  * // Use Transform Value
  * moveable.request("originDraggable", { deltaOrigin: [10, 0] }, true);
  * moveable.request("originDraggable", { origin: [100, 0] }, true);
  * // requestStart
  * const requester = moveable.request("originDraggable");
  *
  * // request
  * // Use Relative Value
  * requester.request({ deltaX: 10, deltaY: 10 });
  * requester.request({ deltaX: 10, deltaY: 10 });
  * requester.request({ deltaX: 10, deltaY: 10 });
  * // Use Absolute Value
  * moveable.request("originDraggable", { x: 200, y: 100 });
  * moveable.request("originDraggable", { x: 220, y: 100 });
  * moveable.request("originDraggable", { x: 240, y: 100 });
  *
  * // requestEnd
  * requester.requestEnd();
  */
  request: function (moveable) {
    var datas = {};
    var rect = moveable.getRect();
    var distX = 0;
    var distY = 0;
    var transformOrigin = rect.transformOrigin;
    var distOrigin = [0, 0];
    return {
      isControl: true,
      requestStart: function () {
        return {
          datas: datas
        };
      },
      request: function (e) {
        if ("deltaOrigin" in e) {
          distOrigin[0] += e.deltaOrigin[0];
          distOrigin[1] += e.deltaOrigin[1];
        } else if ("origin" in e) {
          distOrigin[0] = e.origin[0] - transformOrigin[0];
          distOrigin[1] = e.origin[1] - transformOrigin[1];
        } else {
          if ("x" in e) {
            distX = e.x - rect.left;
          } else if ("deltaX" in e) {
            distX += e.deltaX;
          }

          if ("y" in e) {
            distY = e.y - rect.top;
          } else if ("deltaY" in e) {
            distY += e.deltaY;
          }
        }

        return {
          datas: datas,
          distX: distX,
          distY: distY,
          distOrigin: distOrigin
        };
      },
      requestEnd: function () {
        return {
          datas: datas,
          isDrag: true
        };
      }
    };
  }
};
/**
 * Whether to drag origin (default: false)
 * @name Moveable.OriginDraggable#originDraggable
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     originDraggable: true,
 * });
 * let translate = [0, 0];
 * moveable.on("dragOriginStart", e => {
 *     e.dragStart && e.dragStart.set(translate);
 * }).on("dragOrigin", e => {
 *     translate = e.drag.beforeTranslate;
 *     e.target.style.cssText
 *         = `transform-origin: ${e.transformOrigin};`
 *         + `transform: translate(${translate[0]}px, ${translate[1]}px)`;
 * }).on("dragOriginEnd", e => {
 *     console.log(e);
 * });
 */

/**
 * % Can be used instead of the absolute px (default: true)
 * @name Moveable.OriginDraggable#originRelative
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     originDraggable: true,
 *     originRelative: false,
 * });
 * moveable.originRelative = true;
 */

/**
* When drag start the origin, the `dragOriginStart` event is called.
* @memberof Moveable.OriginDraggable
* @event dragOriginStart
* @param {Moveable.OriginDraggable.OnDragOriginStart} - Parameters for the `dragOriginStart` event
* @example
* import Moveable from "moveable";
*
* const moveable = new Moveable(document.body, {
*     originDraggable: true,
* });
* let translate = [0, 0];
* moveable.on("dragOriginStart", e => {
*     e.dragStart && e.dragStart.set(translate);
* }).on("dragOrigin", e => {
*     translate = e.drag.beforeTranslate;
*     e.target.style.cssText
*         = `transform-origin: ${e.transformOrigin};`
*         + `transform: translate(${translate[0]}px, ${translate[1]}px)`;
* }).on("dragOriginEnd", e => {
*     console.log(e);
* });
*/

/**
* When drag the origin, the `dragOrigin` event is called.
* @memberof Moveable.OriginDraggable
* @event dragOrigin
* @param {Moveable.OriginDraggable.OnDragOrigin} - Parameters for the `dragOrigin` event
* @example
* import Moveable from "moveable";
*
* const moveable = new Moveable(document.body, {
*     originDraggable: true,
* });
* let translate = [0, 0];
* moveable.on("dragOriginStart", e => {
*     e.dragStart && e.dragStart.set(translate);
* }).on("dragOrigin", e => {
*     translate = e.drag.beforeTranslate;
*     e.target.style.cssText
*         = `transform-origin: ${e.transformOrigin};`
*         + `transform: translate(${translate[0]}px, ${translate[1]}px)`;
* }).on("dragOriginEnd", e => {
*     console.log(e);
* });
*/

/**
* When drag end the origin, the `dragOriginEnd` event is called.
* @memberof Moveable.OriginDraggable
* @event dragOriginEnd
* @param {Moveable.OriginDraggable.OnDragOriginEnd} - Parameters for the `dragOriginEnd` event
* @example
* import Moveable from "moveable";
*
* const moveable = new Moveable(document.body, {
*     originDraggable: true,
* });
* let translate = [0, 0];
* moveable.on("dragOriginStart", e => {
*     e.dragStart && e.dragStart.set(translate);
* }).on("dragOrigin", e => {
*     translate = e.drag.beforeTranslate;
*     e.target.style.cssText
*         = `transform-origin: ${e.transformOrigin};`
*         + `transform: translate(${translate[0]}px, ${translate[1]}px)`;
* }).on("dragOriginEnd", e => {
*     console.log(e);
* });
*/

function addBorderRadiusByLine(controlPoses, lineIndex, distX, distY) {
  // lineIndex
  // 0 top
  // 1 right
  // 2 bottom
  // 3 left
  var horizontalsLength = controlPoses.filter(function (_a) {
    var virtual = _a.virtual,
        horizontal = _a.horizontal;
    return horizontal && !virtual;
  }).length;
  var verticalsLength = controlPoses.filter(function (_a) {
    var virtual = _a.virtual,
        vertical = _a.vertical;
    return vertical && !virtual;
  }).length;
  var controlIndex = -1; //top

  if (lineIndex === 0) {
    if (horizontalsLength === 0) {
      controlIndex = 0;
    } else if (horizontalsLength === 1) {
      controlIndex = 1;
    }
  } // bottom


  if (lineIndex === 2) {
    if (horizontalsLength <= 2) {
      controlIndex = 2;
    } else if (horizontalsLength <= 3) {
      controlIndex = 3;
    }
  } // left


  if (lineIndex === 3) {
    if (verticalsLength === 0) {
      controlIndex = 4;
    } else if (verticalsLength < 4) {
      controlIndex = 7;
    }
  } // right


  if (lineIndex === 1) {
    if (verticalsLength <= 1) {
      controlIndex = 5;
    } else if (verticalsLength <= 2) {
      controlIndex = 6;
    }
  }

  if (controlIndex === -1 || !controlPoses[controlIndex].virtual) {
    return;
  }

  var controlPoseInfo = controlPoses[controlIndex];
  addBorderRadius(controlPoses, controlIndex);

  if (controlIndex < 4) {
    controlPoseInfo.pos[0] = distX;
  } else {
    controlPoseInfo.pos[1] = distY;
  }
}

function addBorderRadius(controlPoses, index) {
  if (index < 4) {
    controlPoses.slice(0, index + 1).forEach(function (info) {
      info.virtual = false;
    });
  } else {
    if (controlPoses[0].virtual) {
      controlPoses[0].virtual = false;
    }

    controlPoses.slice(4, index + 1).forEach(function (info) {
      info.virtual = false;
    });
  }
}

function removeBorderRadius(controlPoses, index) {
  if (index < 4) {
    controlPoses.slice(index, 4).forEach(function (info) {
      info.virtual = true;
    });
  } else {
    controlPoses.slice(index).forEach(function (info) {
      info.virtual = true;
    });
  }
}

function getBorderRadius(target, width, height, minCounts, state, full) {
  if (minCounts === void 0) {
    minCounts = [0, 0];
  }

  var borderRadius;
  var values = [];

  if (!state) {
    var style = getComputedStyle$1(target);
    borderRadius = style && style.borderRadius || "";
  } else {
    borderRadius = state;
  }

  if (!borderRadius || !state && borderRadius === "0px") {
    values = [];
  } else {
    values = splitSpace(borderRadius);
  }

  return getRadiusValues(values, width, height, 0, 0, minCounts, full);
}

function triggerRoundEvent(moveable, e, dist, delta, nextPoses) {
  var state = moveable.state;
  var width = state.width,
      height = state.height;

  var _a = getRadiusStyles(nextPoses, moveable.props.roundRelative, width, height),
      raws = _a.raws,
      styles = _a.styles,
      radiusPoses = _a.radiusPoses;

  var _b = splitRadiusPoses(radiusPoses, raws),
      horizontals = _b.horizontals,
      verticals = _b.verticals;

  var borderRadius = styles.join(" ");
  state.borderRadiusState = borderRadius;
  triggerEvent(moveable, "onRound", fillParams(moveable, e, __assign({
    horizontals: horizontals,
    verticals: verticals,
    borderRadius: borderRadius,
    width: width,
    height: height,
    delta: delta,
    dist: dist
  }, fillCSSObject({
    borderRadius: borderRadius
  }, e))));
}
/**
 * @namespace Moveable.Roundable
 * @description Whether to show and drag or double click border-radius
 */


var Roundable = {
  name: "roundable",
  props: {
    roundable: Boolean,
    roundRelative: Boolean,
    minRoundControls: Array,
    maxRoundControls: Array,
    roundClickable: Boolean,
    roundPadding: Number,
    isDisplayShadowRoundControls: Boolean
  },
  events: {
    onRoundStart: "roundStart",
    onRound: "round",
    onRoundEnd: "roundEnd"
  },
  css: [".control.border-radius {\n    background: #d66;\n    cursor: pointer;\n    z-index: 3;\n}", ".control.border-radius.vertical {\n    background: #d6d;\n    z-index: 2;\n}", ".control.border-radius.virtual {\n    opacity: 0.5;\n    z-index: 1;\n}", ":host.round-line-clickable .line.direction {\n    cursor: pointer;\n}"],
  className: function (moveable) {
    var roundClickable = moveable.props.roundClickable;
    return roundClickable === true || roundClickable === "line" ? prefix("round-line-clickable") : "";
  },
  render: function (moveable, React) {
    var _a = moveable.getState(),
        target = _a.target,
        width = _a.width,
        height = _a.height,
        allMatrix = _a.allMatrix,
        is3d = _a.is3d,
        left = _a.left,
        top = _a.top,
        borderRadiusState = _a.borderRadiusState;

    var _b = moveable.props,
        _c = _b.minRoundControls,
        minRoundControls = _c === void 0 ? [0, 0] : _c,
        _d = _b.maxRoundControls,
        maxRoundControls = _d === void 0 ? [4, 4] : _d,
        zoom = _b.zoom,
        _e = _b.roundPadding,
        roundPadding = _e === void 0 ? 0 : _e,
        isDisplayShadowRoundControls = _b.isDisplayShadowRoundControls;

    if (!target) {
      return null;
    }

    var n = is3d ? 4 : 3;
    var radiusValues = getBorderRadius(target, width, height, minRoundControls, borderRadiusState, true);

    if (!radiusValues) {
      return null;
    }

    var verticalCount = 0;
    var horizontalCount = 0;
    return radiusValues.map(function (v, i) {
      var horizontal = v.horizontal;
      var vertical = v.vertical;
      var direction = v.direction || "";

      var originalPos = __spreadArray([], v.pos, true);

      horizontalCount += Math.abs(horizontal);
      verticalCount += Math.abs(vertical);

      if (horizontal && direction.indexOf("n") > -1) {
        originalPos[1] -= roundPadding;
      }

      if (vertical && direction.indexOf("w") > -1) {
        originalPos[0] -= roundPadding;
      }

      if (horizontal && direction.indexOf("s") > -1) {
        originalPos[1] += roundPadding;
      }

      if (vertical && direction.indexOf("e") > -1) {
        originalPos[0] += roundPadding;
      }

      var pos = minus(calculatePosition(allMatrix, originalPos, n), [left, top]);
      var isDisplay = v.vertical ? verticalCount <= maxRoundControls[1] && (isDisplayShadowRoundControls || !v.virtual) : horizontalCount <= maxRoundControls[0] && (isDisplayShadowRoundControls || !v.virtual);
      return React.createElement("div", {
        key: "borderRadiusControl".concat(i),
        className: prefix("control", "border-radius", v.vertical ? "vertical" : "", v.virtual ? "virtual" : ""),
        "data-radius-index": i,
        style: {
          display: isDisplay ? "block" : "none",
          transform: "translate(".concat(pos[0], "px, ").concat(pos[1], "px) scale(").concat(zoom, ")")
        }
      });
    });
  },
  dragControlCondition: function (moveable, e) {
    if (!e.inputEvent || e.isRequest) {
      return false;
    }

    var className = e.inputEvent.target.getAttribute("class") || "";
    return className.indexOf("border-radius") > -1 || className.indexOf("moveable-line") > -1 && className.indexOf("moveable-direction") > -1;
  },
  dragControlStart: function (moveable, e) {
    var inputEvent = e.inputEvent,
        datas = e.datas;
    var inputTarget = inputEvent.target;
    var className = inputTarget.getAttribute("class") || "";
    var isControl = className.indexOf("border-radius") > -1;
    var isLine = className.indexOf("moveable-line") > -1 && className.indexOf("moveable-direction") > -1;
    var controlIndex = isControl ? parseInt(inputTarget.getAttribute("data-radius-index"), 10) : -1;
    var lineIndex = -1;

    if (isLine) {
      var indexAttr = inputTarget.getAttribute("data-line-key") || "";

      if (indexAttr) {
        lineIndex = parseInt(indexAttr.replace(/render-line-/g, ""), 10);

        if (isNaN(lineIndex)) {
          lineIndex = -1;
        }
      }
    }

    if (!isControl && !isLine) {
      return false;
    }

    var result = triggerEvent(moveable, "onRoundStart", fillParams(moveable, e, {}));

    if (result === false) {
      return false;
    }

    datas.lineIndex = lineIndex;
    datas.controlIndex = controlIndex;
    datas.isControl = isControl;
    datas.isLine = isLine;
    setDragStart(moveable, e);
    var _a = moveable.props,
        roundRelative = _a.roundRelative,
        _b = _a.minRoundControls,
        minRoundControls = _b === void 0 ? [0, 0] : _b;
    var state = moveable.state;
    var target = state.target,
        width = state.width,
        height = state.height;
    datas.isRound = true;
    datas.prevDist = [0, 0];
    var controlPoses = getBorderRadius(target, width, height, minRoundControls, "", true) || [];
    datas.controlPoses = controlPoses;
    state.borderRadiusState = getRadiusStyles(controlPoses, roundRelative, width, height).styles.join(" ");
    return true;
  },
  dragControl: function (moveable, e) {
    var datas = e.datas;
    var controlPoses = datas.controlPoses;

    if (!datas.isRound || !datas.isControl || !controlPoses.length) {
      return false;
    }

    var index = datas.controlIndex;

    var _a = getDragDist(e),
        distX = _a[0],
        distY = _a[1];

    var dist = [distX, distY];
    var delta = minus(dist, datas.prevDist);
    var _b = moveable.props.maxRoundControls,
        maxRoundControls = _b === void 0 ? [4, 4] : _b;
    var _c = moveable.state,
        width = _c.width,
        height = _c.height;
    var selectedControlPose = controlPoses[index];
    var selectedVertical = selectedControlPose.vertical;
    var selectedHorizontal = selectedControlPose.horizontal; // 0: [0, 1, 2, 3] maxCount === 1
    // 0: [0, 2] maxCount === 2
    // 1: [1, 3] maxCount === 2
    // 0: [0] maxCount === 3
    // 1: [1, 3] maxCount === 3

    var dists = controlPoses.map(function (pose) {
      var horizontal = pose.horizontal,
          vertical = pose.vertical;
      var poseDist = [horizontal * selectedHorizontal * dist[0], vertical * selectedVertical * dist[1]];

      if (horizontal) {
        if (maxRoundControls[0] === 1) {
          return poseDist;
        } else if (maxRoundControls[0] < 4 && horizontal !== selectedHorizontal) {
          return poseDist;
        }
      } else if (maxRoundControls[1] === 0) {
        poseDist[1] = vertical * selectedHorizontal * dist[0] / width * height;
        return poseDist;
      } else if (selectedVertical) {
        if (maxRoundControls[1] === 1) {
          return poseDist;
        } else if (maxRoundControls[1] < 4 && vertical !== selectedVertical) {
          return poseDist;
        }
      }

      return [0, 0];
    });
    dists[index] = dist;
    var nextPoses = controlPoses.map(function (info, i) {
      return __assign(__assign({}, info), {
        pos: plus(info.pos, dists[i])
      });
    });

    if (index < 4) {
      nextPoses.slice(0, index + 1).forEach(function (info) {
        info.virtual = false;
      });
    } else {
      nextPoses.slice(4, index + 1).forEach(function (info) {
        info.virtual = false;
      });
    }

    datas.prevDist = [distX, distY];
    triggerRoundEvent(moveable, e, dist, delta, nextPoses);
    return true;
  },
  dragControlEnd: function (moveable, e) {
    var state = moveable.state;
    state.borderRadiusState = "";
    var datas = e.datas,
        isDouble = e.isDouble;

    if (!datas.isRound) {
      return false;
    }

    var isControl = datas.isControl,
        controlIndex = datas.controlIndex,
        isLine = datas.isLine,
        lineIndex = datas.lineIndex;
    var controlPoses = datas.controlPoses;
    var length = controlPoses.filter(function (_a) {
      var virtual = _a.virtual;
      return virtual;
    }).length;
    var _a = moveable.props.roundClickable,
        roundClickable = _a === void 0 ? true : _a;

    if (isDouble && roundClickable) {
      if (isControl && (roundClickable === true || roundClickable === "control")) {
        removeBorderRadius(controlPoses, controlIndex);
      } else if (isLine && (roundClickable === true || roundClickable === "line")) {
        var _b = calculatePointerDist(moveable, e),
            distX = _b[0],
            distY = _b[1];

        addBorderRadiusByLine(controlPoses, lineIndex, distX, distY);
      }

      if (length !== controlPoses.filter(function (_a) {
        var virtual = _a.virtual;
        return virtual;
      }).length) {
        triggerRoundEvent(moveable, e, [0, 0], [0, 0], controlPoses);
      }
    }

    triggerEvent(moveable, "onRoundEnd", fillEndParams(moveable, e, {}));
    state.borderRadiusState = "";
    return true;
  },
  unset: function (moveable) {
    moveable.state.borderRadiusState = "";
  }
};
/**
 * Whether to show and drag or double click border-radius, (default: false)
 * @name Moveable.Roundable#roundable
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     roundable: true,
 *     roundRelative: false,
 * });
 * moveable.on("roundStart", e => {
 *     console.log(e);
 * }).on("round", e => {
 *     e.target.style.borderRadius = e.borderRadius;
 * }).on("roundEnd", e => {
 *     console.log(e);
 * });
 */

/**
 * % Can be used instead of the absolute px
 * @name Moveable.Roundable#roundRelative
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     roundable: true,
 *     roundRelative: false,
 * });
 * moveable.on("roundStart", e => {
 *     console.log(e);
 * }).on("round", e => {
 *     e.target.style.borderRadius = e.borderRadius;
 * }).on("roundEnd", e => {
 *     console.log(e);
 * });
 */

/**
 * Minimum number of round controls. It moves in proportion by control. [horizontal, vertical] (default: [0, 0])
 * @name Moveable.Roundable#minRoundControls
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     roundable: true,
 *     roundRelative: false,
 *     minRoundControls: [0, 0],
 * });
 * moveable.minRoundControls = [1, 0];
 */

/**
 * Maximum number of round controls. It moves in proportion by control. [horizontal, vertical] (default: [4, 4])
 * @name Moveable.Roundable#maxRoundControls
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     roundable: true,
 *     roundRelative: false,
 *     maxRoundControls: [4, 4],
 * });
 * moveable.maxRoundControls = [1, 0];
 */

/**
 * Whether you can add/delete round controls by double-clicking a line or control.
 * @name Moveable.Roundable#roundClickable
 * @default true
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     roundable: true,
 *     roundRelative: false,
 *     roundClickable: true,
 * });
 * moveable.roundClickable = false;
 */

/**
 * Whether to show a round control that does not actually exist as a shadow
 * @name Moveable.Roundable#isDisplayShadowRoundControls
 * @default false
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     roundable: true,
 *     isDisplayShadowRoundControls: false,
 * });
 * moveable.isDisplayShadowRoundControls = true;
 */

/**
 * The padding value of the position of the round control
 * @name Moveable.Roundable#roundPadding
 * @default false
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     roundable: true,
 *     roundPadding: 0,
 * });
 * moveable.roundPadding = 15;
 */

/**
 * When drag start the clip area or controls, the `roundStart` event is called.
 * @memberof Moveable.Roundable
 * @event roundStart
 * @param {Moveable.Roundable.OnRoundStart} - Parameters for the `roundStart` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     roundable: true,
 *     roundRelative: false,
 * });
 * moveable.on("roundStart", e => {
 *     console.log(e);
 * }).on("round", e => {
 *     e.target.style.borderRadius = e.borderRadius;
 * }).on("roundEnd", e => {
 *     console.log(e);
 * });
 */

/**
 * When drag or double click the border area or controls, the `round` event is called.
 * @memberof Moveable.Roundable
 * @event round
 * @param {Moveable.Roundable.OnRound} - Parameters for the `round` event
 * @example
  * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     roundable: true,
 *     roundRelative: false,
 * });
 * moveable.on("roundStart", e => {
 *     console.log(e);
 * }).on("round", e => {
 *     e.target.style.borderRadius = e.borderRadius;
 * }).on("roundEnd", e => {
 *     console.log(e);
 * });
 */

/**
 * When drag end the border area or controls, the `roundEnd` event is called.
 * @memberof Moveable.Roundable
 * @event roundEnd
 * @param {Moveable.Roundable.onRoundEnd} - Parameters for the `roundEnd` event
 * @example
  * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     roundable: true,
 *     roundRelative: false,
 * });
 * moveable.on("roundStart", e => {
 *     console.log(e);
 * }).on("round", e => {
 *     e.target.style.borderRadius = e.borderRadius;
 * }).on("roundEnd", e => {
 *     console.log(e);
 * });
 */

function isIdentityMatrix(matrix, is3d) {
  var n = is3d ? 4 : 3;
  var identityMatrix = createIdentityMatrix(n);
  var value = "matrix".concat(is3d ? "3d" : "", "(").concat(identityMatrix.join(","), ")");
  return matrix === value || matrix === "matrix(1,0,0,1,0,0)";
}

var BeforeRenderable = {
  isPinch: true,
  name: "beforeRenderable",
  props: {},
  events: {
    onBeforeRenderStart: "beforeRenderStart",
    onBeforeRender: "beforeRender",
    onBeforeRenderEnd: "beforeRenderEnd",
    onBeforeRenderGroupStart: "beforeRenderGroupStart",
    onBeforeRenderGroup: "beforeRenderGroup",
    onBeforeRenderGroupEnd: "beforeRenderGroupEnd"
  },
  dragRelation: "weak",
  setTransform: function (moveable, e) {
    var _a = moveable.state,
        is3d = _a.is3d,
        target = _a.target,
        targetMatrix = _a.targetMatrix;
    var transform = target === null || target === void 0 ? void 0 : target.style.transform;
    var cssMatrix = is3d ? "matrix3d(".concat(targetMatrix.join(","), ")") : "matrix(".concat(convertMatrixtoCSS(targetMatrix, true), ")");
    var startTransform = !transform || transform === "none" ? cssMatrix : transform;
    e.datas.startTransforms = isIdentityMatrix(startTransform, is3d) ? [] : splitSpace(startTransform);
  },
  resetStyle: function (e) {
    var datas = e.datas;
    datas.nextStyle = {};
    datas.nextTransforms = e.datas.startTransforms;
    datas.nextTransformAppendedIndexes = [];
  },
  fillDragStartParams: function (moveable, e) {
    return fillParams(moveable, e, {
      setTransform: function (transform) {
        e.datas.startTransforms = isArray(transform) ? transform : splitSpace(transform);
      },
      isPinch: !!e.isPinch
    });
  },
  fillDragParams: function (moveable, e) {
    return fillParams(moveable, e, {
      isPinch: !!e.isPinch
    });
  },
  dragStart: function (moveable, e) {
    this.setTransform(moveable, e);
    this.resetStyle(e);
    triggerEvent(moveable, "onBeforeRenderStart", this.fillDragStartParams(moveable, e));
  },
  drag: function (moveable, e) {
    this.resetStyle(e);
    triggerEvent(moveable, "onBeforeRender", fillParams(moveable, e, {
      isPinch: !!e.isPinch
    }));
  },
  dragEnd: function (moveable, e) {
    triggerEvent(moveable, "onBeforeRenderEnd", fillParams(moveable, e, {
      isPinch: !!e.isPinch,
      isDrag: e.isDrag
    }));
  },
  dragGroupStart: function (moveable, e) {
    var _this = this;

    this.dragStart(moveable, e);
    var events = fillChildEvents(moveable, "beforeRenderable", e);
    var moveables = moveable.moveables;
    var params = events.map(function (childEvent, i) {
      var childMoveable = moveables[i];

      _this.setTransform(childMoveable, childEvent);

      _this.resetStyle(childEvent);

      return _this.fillDragStartParams(childMoveable, childEvent);
    });
    triggerEvent(moveable, "onBeforeRenderGroupStart", fillParams(moveable, e, {
      isPinch: !!e.isPinch,
      targets: moveable.props.targets,
      setTransform: function () {},
      events: params
    }));
  },
  dragGroup: function (moveable, e) {
    var _this = this;

    this.drag(moveable, e);
    var events = fillChildEvents(moveable, "beforeRenderable", e);
    var moveables = moveable.moveables;
    var params = events.map(function (childEvent, i) {
      var childMoveable = moveables[i];

      _this.resetStyle(childEvent);

      return _this.fillDragParams(childMoveable, childEvent);
    });
    triggerEvent(moveable, "onBeforeRenderGroup", fillParams(moveable, e, {
      isPinch: !!e.isPinch,
      targets: moveable.props.targets,
      events: params
    }));
  },
  dragGroupEnd: function (moveable, e) {
    this.dragEnd(moveable, e);
    triggerEvent(moveable, "onBeforeRenderGroupEnd", fillParams(moveable, e, {
      isPinch: !!e.isPinch,
      isDrag: e.isDrag,
      targets: moveable.props.targets
    }));
  },
  dragControlStart: function (moveable, e) {
    return this.dragStart(moveable, e);
  },
  dragControl: function (moveable, e) {
    return this.drag(moveable, e);
  },
  dragControlEnd: function (moveable, e) {
    return this.dragEnd(moveable, e);
  },
  dragGroupControlStart: function (moveable, e) {
    return this.dragGroupStart(moveable, e);
  },
  dragGroupControl: function (moveable, e) {
    return this.dragGroup(moveable, e);
  },
  dragGroupControlEnd: function (moveable, e) {
    return this.dragGroupEnd(moveable, e);
  }
};
var Renderable = {
  name: "renderable",
  props: {},
  events: {
    onRenderStart: "renderStart",
    onRender: "render",
    onRenderEnd: "renderEnd",
    onRenderGroupStart: "renderGroupStart",
    onRenderGroup: "renderGroup",
    onRenderGroupEnd: "renderGroupEnd"
  },
  dragRelation: "weak",
  dragStart: function (moveable, e) {
    triggerEvent(moveable, "onRenderStart", fillParams(moveable, e, {
      isPinch: !!e.isPinch
    }));
  },
  drag: function (moveable, e) {
    triggerEvent(moveable, "onRender", this.fillDragParams(moveable, e));
  },
  dragAfter: function (moveable, e) {
    if (e.resultCount) {
      return this.drag(moveable, e);
    }
  },
  dragEnd: function (moveable, e) {
    triggerEvent(moveable, "onRenderEnd", this.fillDragEndParams(moveable, e));
  },
  dragGroupStart: function (moveable, e) {
    triggerEvent(moveable, "onRenderGroupStart", fillParams(moveable, e, {
      isPinch: !!e.isPinch,
      targets: moveable.props.targets
    }));
  },
  dragGroup: function (moveable, e) {
    var _this = this;

    var events = fillChildEvents(moveable, "beforeRenderable", e);
    var moveables = moveable.moveables;
    var params = events.map(function (childEvent, i) {
      var childMoveable = moveables[i];
      return _this.fillDragParams(childMoveable, childEvent);
    });
    triggerEvent(moveable, "onRenderGroup", fillParams(moveable, e, __assign(__assign({
      isPinch: !!e.isPinch,
      targets: moveable.props.targets,
      transform: getNextTransformText(e)
    }, fillCSSObject(getNextStyle(e))), {
      events: params
    })));
  },
  dragGroupEnd: function (moveable, e) {
    var _this = this;

    var events = fillChildEvents(moveable, "beforeRenderable", e);
    var moveables = moveable.moveables;
    var params = events.map(function (childEvent, i) {
      var childMoveable = moveables[i];
      return _this.fillDragEndParams(childMoveable, childEvent);
    });
    triggerEvent(moveable, "onRenderGroupEnd", fillParams(moveable, e, __assign({
      isPinch: !!e.isPinch,
      isDrag: e.isDrag,
      targets: moveable.props.targets,
      events: params,
      transform: getNextTransformText(e)
    }, fillCSSObject(getNextStyle(e)))));
  },
  dragControlStart: function (moveable, e) {
    return this.dragStart(moveable, e);
  },
  dragControl: function (moveable, e) {
    return this.drag(moveable, e);
  },
  dragControlAfter: function (moveable, e) {
    return this.dragAfter(moveable, e);
  },
  dragControlEnd: function (moveable, e) {
    return this.dragEnd(moveable, e);
  },
  dragGroupControlStart: function (moveable, e) {
    return this.dragGroupStart(moveable, e);
  },
  dragGroupControl: function (moveable, e) {
    return this.dragGroup(moveable, e);
  },
  dragGroupControlEnd: function (moveable, e) {
    return this.dragGroupEnd(moveable, e);
  },
  fillDragParams: function (moveable, e) {
    return fillParams(moveable, e, __assign({
      isPinch: !!e.isPinch,
      transform: getNextTransformText(e)
    }, fillCSSObject(getNextStyle(e))));
  },
  fillDragEndParams: function (moveable, e) {
    return fillParams(moveable, e, __assign({
      isPinch: !!e.isPinch,
      isDrag: e.isDrag,
      transform: getNextTransformText(e)
    }, fillCSSObject(getNextStyle(e))));
  }
};

function triggerAble(moveable, ableType, eventOperation, eventAffix, eventType, e, requestInstant) {
  var isStart = eventType === "Start";
  var target = moveable.state.target;
  var isRequest = e.isRequest;

  if (!target || isStart && eventAffix.indexOf("Control") > -1 && !isRequest && moveable.areaElement === e.inputEvent.target) {
    return false;
  } // "drag" "Control" "After"


  var eventName = "".concat(eventOperation).concat(eventAffix).concat(eventType);
  var conditionName = "".concat(eventOperation).concat(eventAffix, "Condition");
  var isEnd = eventType === "End";
  var isAfter = eventType === "After";
  var isFirstStart = isStart && (!moveable.targetGesto || !moveable.controlGesto || !moveable.targetGesto.isFlag() || !moveable.controlGesto.isFlag());

  if (isFirstStart) {
    moveable.updateRect(eventType, true, false);
  }

  if (eventType === "" && !isRequest) {
    convertDragDist(moveable.state, e);
  } // const isGroup = eventAffix.indexOf("Group") > -1;


  var ables = __spreadArray([], moveable[ableType], true);

  if (isRequest) {
    var requestAble_1 = e.requestAble;

    if (!ables.some(function (able) {
      return able.name === requestAble_1;
    })) {
      ables.push.apply(ables, moveable.props.ables.filter(function (able) {
        return able.name === requestAble_1;
      }));
    }
  }

  if (!ables.length || ables.every(function (able) {
    return able.dragRelation;
  })) {
    return false;
  }

  var eventAbles = __spreadArray(__spreadArray([BeforeRenderable], ables, true), [Renderable], false).filter(function (able) {
    return able[eventName];
  });

  var datas = e.datas;

  if (isFirstStart) {
    eventAbles.forEach(function (able) {
      able.unset && able.unset(moveable);
    });
  }

  var inputEvent = e.inputEvent;
  var inputTarget;

  if (isEnd && inputEvent) {
    inputTarget = document.elementFromPoint(e.clientX, e.clientY) || inputEvent.target;
  }

  var resultCount = 0;
  var isDragStop = false;

  var stop = function () {
    var _a;

    isDragStop = true;
    (_a = e.stop) === null || _a === void 0 ? void 0 : _a.call(e);
  };

  var results = eventAbles.filter(function (able) {
    var ableName = able.name;
    var nextDatas = datas[ableName] || (datas[ableName] = {});

    if (isStart) {
      nextDatas.isEventStart = !able[conditionName] || able[conditionName](moveable, e);
    }

    if (nextDatas.isEventStart) {
      var result = able[eventName](moveable, __assign(__assign({}, e), {
        stop: stop,
        resultCount: resultCount,
        datas: nextDatas,
        originalDatas: datas,
        inputTarget: inputTarget
      }));

      moveable._emitter.off();

      if (isStart && result === false) {
        nextDatas.isEventStart = false;
      }

      resultCount += result ? 1 : 0;
      return result;
    }

    return false;
  });
  var isUpdate = results.length;
  var isForceEnd = false; // end ables

  if (isStart && (isDragStop || eventAbles.length && !isUpdate)) {
    isForceEnd = isDragStop || eventAbles.filter(function (able) {
      var ableName = able.name;
      var nextDatas = datas[ableName];

      if (nextDatas.isEventStart) {
        if (able.dragRelation === "strong") {
          return false;
        } // start drag


        return true;
      } // cancel event


      return false;
    }).length;
  }

  if (isEnd || isForceEnd) {
    moveable.state.gestos = {};

    if (moveable.moveables) {
      moveable.moveables.forEach(function (childMoveable) {
        childMoveable.state.gestos = {};
      });
    }
  }

  if (isFirstStart && isForceEnd) {
    eventAbles.forEach(function (able) {
      able.unset && able.unset(moveable);
    });
  }

  if (isStart && !isForceEnd && !isRequest && isUpdate) {
    e === null || e === void 0 ? void 0 : e.preventDefault();
  }

  if (moveable.isUnmounted || isForceEnd) {
    return false;
  }

  if (!isStart && isUpdate && !requestInstant || isEnd) {
    var flushSync = moveable.props.flushSync || defaultSync;
    flushSync(function () {
      moveable.updateRect(isEnd ? eventType : "", true, false);
      moveable.forceUpdate();
    });
  }

  if (!isStart && !isEnd && !isAfter && isUpdate && !requestInstant) {
    triggerAble(moveable, ableType, eventOperation, eventAffix, eventType + "After", e);
  }

  return true;
}

function checkMoveableTarget(moveable) {
  var dragTarget = moveable.props.dragTarget;
  return function (e) {
    var eventTarget = e.inputEvent.target;
    var areaElement = moveable.areaElement;
    return dragTarget && (eventTarget === dragTarget || dragTarget.contains(eventTarget)) || eventTarget === areaElement || !moveable.isMoveableElement(eventTarget) && !moveable.controlBox.getElement().contains(eventTarget) || hasClass(eventTarget, "moveable-area") || hasClass(eventTarget, "moveable-padding") || hasClass(eventTarget, "moveable-edgeDraggable");
  };
}

function getTargetAbleGesto(moveable, moveableTarget, eventAffix) {
  var controlBox = moveable.controlBox.getElement();
  var targets = [];
  var dragTarget = moveable.props.dragTarget;
  targets.push(controlBox);

  if (!moveable.props.dragArea || dragTarget) {
    targets.push(moveableTarget);
  }

  return getAbleGesto(moveable, targets, "targetAbles", eventAffix, {
    dragStart: checkMoveableTarget(moveable),
    pinchStart: checkMoveableTarget(moveable)
  });
}

function getAbleGesto(moveable, target, ableType, eventAffix, conditionFunctions) {
  if (conditionFunctions === void 0) {
    conditionFunctions = {};
  }

  var isTargetAbles = ableType === "targetAbles";
  var _a = moveable.props,
      pinchOutside = _a.pinchOutside,
      pinchThreshold = _a.pinchThreshold,
      preventClickEventOnDrag = _a.preventClickEventOnDrag,
      preventClickDefault = _a.preventClickDefault,
      checkInput = _a.checkInput;
  var options = {
    preventDefault: true,
    preventRightClick: true,
    preventWheelClick: true,
    container: window,
    pinchThreshold: pinchThreshold,
    pinchOutside: pinchOutside,
    preventClickEventOnDrag: isTargetAbles ? preventClickEventOnDrag : false,
    preventClickEventOnDragStart: isTargetAbles ? preventClickDefault : false,
    preventClickEventByCondition: isTargetAbles ? null : function (e) {
      return moveable.controlBox.getElement().contains(e.target);
    },
    checkInput: isTargetAbles ? checkInput : false
  };
  var gesto = new Gesto(target, options);
  var isControl = eventAffix === "Control";
  ["drag", "pinch"].forEach(function (eventOperation) {
    ["Start", "", "End"].forEach(function (eventType) {
      gesto.on("".concat(eventOperation).concat(eventType), function (e) {
        var _a;

        var eventName = e.eventType;

        if (conditionFunctions[eventName] && !conditionFunctions[eventName](e)) {
          e.stop();
          return;
        }

        var result = triggerAble(moveable, ableType, eventOperation, eventAffix, eventType, e);

        if (!result) {
          e.stop();
        } else if (moveable.props.stopPropagation || eventType === "Start" && isControl) {
          (_a = e === null || e === void 0 ? void 0 : e.inputEvent) === null || _a === void 0 ? void 0 : _a.stopPropagation();
        }
      });
    });
  });
  return gesto;
}

var EventManager = /*#__PURE__*/function () {
  function EventManager(target, moveable, eventName) {
    var _this = this;

    this.target = target;
    this.moveable = moveable;
    this.eventName = eventName;
    this.ables = [];

    this._onEvent = function (e) {
      var eventName = _this.eventName;
      var moveable = _this.moveable;

      if (moveable.state.disableNativeEvent) {
        return;
      }

      _this.ables.forEach(function (able) {
        able[eventName](moveable, {
          inputEvent: e
        });
      });
    };

    target.addEventListener(eventName.toLowerCase(), this._onEvent);
  }

  var __proto = EventManager.prototype;

  __proto.setAbles = function (ables) {
    this.ables = ables;
  };

  __proto.destroy = function () {
    this.target.removeEventListener(this.eventName.toLowerCase(), this._onEvent);
    this.target = null;
    this.moveable = null;
  };

  return EventManager;
}();

function getShadowRoot(parentElement) {
  if (parentElement && parentElement.getRootNode) {
    var rootNode = parentElement.getRootNode();

    if (rootNode.nodeType === 11) {
      return rootNode;
    }
  }

  return;
}

function getMatrixStackInfo(target, container, checkContainer) {
  var el = target;
  var matrixes = [];
  var requestEnd = !checkContainer && target === container || target === document.body;
  var isEnd = requestEnd;
  var is3d = false;
  var n = 3;
  var transformOrigin;
  var targetTransformOrigin;
  var targetMatrix;
  var hasFixed = false;
  var offsetContainer = getOffsetInfo(container, container, true).offsetParent;

  while (el && !isEnd) {
    isEnd = requestEnd;
    var style = getComputedStyle(el);
    var position = style.position;
    var transform = getElementTransform(el, style);
    var matrix = convertCSStoMatrix(getTransformMatrix(transform));
    var isFixed = position === "fixed";
    var fixedInfo = {
      hasTransform: false,
      fixedContainer: null
    };

    if (isFixed) {
      hasFixed = true;
      fixedInfo = getPositionFixedInfo(el);
      offsetContainer = fixedInfo.fixedContainer;
    } // convert 3 to 4


    var length = matrix.length;

    if (!is3d && length === 16) {
      is3d = true;
      n = 4;
      convert3DMatrixes(matrixes);

      if (targetMatrix) {
        targetMatrix = convertDimension(targetMatrix, 3, 4);
      }
    }

    if (is3d && length === 9) {
      matrix = convertDimension(matrix, 3, 4);
    }

    var _a = getOffsetPosInfo(el, target, style),
        tagName = _a.tagName,
        hasOffset = _a.hasOffset,
        isSVG = _a.isSVG,
        origin = _a.origin,
        targetOrigin = _a.targetOrigin,
        offsetPos = _a.offset;

    var offsetLeft = offsetPos[0],
        offsetTop = offsetPos[1];

    if (tagName === "svg" && targetMatrix) {
      // scale matrix for svg's SVGElements.
      matrixes.push({
        type: "target",
        target: el,
        matrix: getSVGMatrix(el, n)
      });
      matrixes.push({
        type: "offset",
        target: el,
        matrix: createIdentityMatrix(n)
      });
    }

    var offsetParent = void 0;
    var isOffsetEnd = false;
    var isStatic = false;

    if (isFixed) {
      offsetParent = fixedInfo.fixedContainer;
      isOffsetEnd = true;
    } else {
      var offsetInfo = getOffsetInfo(el, container);
      offsetParent = offsetInfo.offsetParent;
      isOffsetEnd = offsetInfo.isEnd;
      isStatic = offsetInfo.isStatic;

      if (IS_FIREFOX) {
        var parentSlotElement = offsetInfo.parentSlotElement;

        if (parentSlotElement) {
          var customOffsetParent = offsetParent;
          var customOffsetLeft = 0;
          var customOffsetTop = 0;

          while (customOffsetParent) {
            if (!getShadowRoot(customOffsetParent)) {
              break;
            }

            customOffsetLeft += customOffsetParent.offsetLeft;
            customOffsetTop += customOffsetParent.offsetTop;
            customOffsetParent = customOffsetParent.offsetParent;
          }

          offsetLeft -= customOffsetLeft;
          offsetTop -= customOffsetTop;
        }
      }
    }

    if (IS_WEBKIT && !IS_SAFARI_ABOVE15 && hasOffset && !isSVG && isStatic && (position === "relative" || position === "static")) {
      offsetLeft -= offsetParent.offsetLeft;
      offsetTop -= offsetParent.offsetTop;
      requestEnd = requestEnd || isOffsetEnd;
    }

    var parentClientLeft = 0;
    var parentClientTop = 0;
    var fixedClientLeft = 0;
    var fixedClientTop = 0;

    if (isFixed) {
      if (hasOffset && fixedInfo.hasTransform) {
        // border
        fixedClientLeft = offsetParent.clientLeft;
        fixedClientTop = offsetParent.clientTop;
      }
    } else {
      if (hasOffset && offsetContainer !== offsetParent) {
        // border
        parentClientLeft = offsetParent.clientLeft;
        parentClientTop = offsetParent.clientTop;
      }

      if (hasOffset && offsetParent === document.body) {
        var margin = getBodyOffset(el, false, style);
        offsetLeft += margin[0];
        offsetTop += margin[1];
      }
    }

    matrixes.push({
      type: "target",
      target: el,
      matrix: getAbsoluteMatrix(matrix, n, origin)
    });

    if (hasOffset) {
      var isElementTarget = el === target;
      var scrollLeft = isElementTarget ? 0 : el.scrollLeft;
      var scrollTop = isElementTarget ? 0 : el.scrollTop;
      matrixes.push({
        type: "offset",
        target: el,
        matrix: createOriginMatrix([offsetLeft - scrollLeft + parentClientLeft - fixedClientLeft, offsetTop - scrollTop + parentClientTop - fixedClientTop], n)
      });
    } else {
      // svg
      matrixes.push({
        type: "offset",
        target: el,
        origin: origin
      });
    }

    if (!targetMatrix) {
      targetMatrix = matrix;
    }

    if (!transformOrigin) {
      transformOrigin = origin;
    }

    if (!targetTransformOrigin) {
      targetTransformOrigin = targetOrigin;
    }

    if (isEnd || isFixed) {
      break;
    } else {
      el = offsetParent;
      requestEnd = isOffsetEnd;
    }

    if (!checkContainer || el === document.body) {
      isEnd = requestEnd;
    }
  }

  if (!targetMatrix) {
    targetMatrix = createIdentityMatrix(n);
  }

  if (!transformOrigin) {
    transformOrigin = [0, 0];
  }

  if (!targetTransformOrigin) {
    targetTransformOrigin = [0, 0];
  }

  return {
    offsetContainer: offsetContainer,
    matrixes: matrixes,
    targetMatrix: targetMatrix,
    transformOrigin: transformOrigin,
    targetOrigin: targetTransformOrigin,
    is3d: is3d,
    hasFixed: hasFixed
  };
}

function calculateMatrixStack(target, container, rootContainer, isAbsolute3d) {
  var _a;

  if (rootContainer === void 0) {
    rootContainer = container;
  }

  var _b = getMatrixStackInfo(target, container),
      matrixes = _b.matrixes,
      is3d = _b.is3d,
      prevTargetMatrix = _b.targetMatrix,
      transformOrigin = _b.transformOrigin,
      targetOrigin = _b.targetOrigin,
      offsetContainer = _b.offsetContainer,
      hasFixed = _b.hasFixed; // prevMatrix


  var _c = getMatrixStackInfo(offsetContainer, rootContainer, true),
      rootMatrixes = _c.matrixes,
      isRoot3d = _c.is3d,
      offsetRootContainer = _c.offsetContainer; // prevRootMatrix
  // if (rootContainer === document.body) {
  //     console.log(offsetContainer, rootContainer, rootMatrixes);
  // }


  var isNext3d = isAbsolute3d || isRoot3d || is3d;
  var n = isNext3d ? 4 : 3;
  var isSVGGraphicElement = target.tagName.toLowerCase() !== "svg" && "ownerSVGElement" in target;
  var targetMatrix = prevTargetMatrix; // let allMatrix = prevMatrix ? convertDimension(prevMatrix, prevN!, n) : createIdentityMatrix(n);
  // let rootMatrix = prevRootMatrix ? convertDimension(prevRootMatrix, prevN!, n) : createIdentityMatrix(n);
  // let beforeMatrix = prevMatrix ? convertDimension(prevMatrix, prevN!, n) : createIdentityMatrix(n);

  var allMatrix = createIdentityMatrix(n);
  var rootMatrix = createIdentityMatrix(n);
  var beforeMatrix = createIdentityMatrix(n);
  var offsetMatrix = createIdentityMatrix(n);
  var length = matrixes.length;
  rootMatrixes.reverse();
  matrixes.reverse();

  if (!is3d && isNext3d) {
    targetMatrix = convertDimension(targetMatrix, 3, 4);
    convert3DMatrixes(matrixes);
  }

  if (!isRoot3d && isNext3d) {
    convert3DMatrixes(rootMatrixes);
  } // rootMatrix = (...) -> container -> offset -> absolute -> offset -> absolute(targetMatrix)
  // rootMatrixBeforeOffset = lastOffsetMatrix -> (...) -> container
  // beforeMatrix = (... -> container -> offset -> absolute) -> offset -> absolute(targetMatrix)
  // offsetMatrix = (... -> container -> offset -> absolute -> offset) -> absolute(targetMatrix)


  rootMatrixes.forEach(function (info) {
    rootMatrix = multiply(rootMatrix, info.matrix, n);
  });
  var originalRootContainer = rootContainer || document.body;
  var endContainer = ((_a = rootMatrixes[0]) === null || _a === void 0 ? void 0 : _a.target) || getOffsetInfo(originalRootContainer, originalRootContainer, true).offsetParent;
  var rootMatrixBeforeOffset = rootMatrixes.slice(1).reduce(function (matrix, info) {
    return multiply(matrix, info.matrix, n);
  }, createIdentityMatrix(n));
  matrixes.forEach(function (info, i) {
    if (length - 2 === i) {
      // length - 3
      beforeMatrix = allMatrix.slice();
    }

    if (length - 1 === i) {
      // length - 2
      offsetMatrix = allMatrix.slice();
    } // calculate for SVGElement


    if (!info.matrix) {
      var nextInfo = matrixes[i + 1];
      var offset = getSVGOffset(info, nextInfo, endContainer, n, multiply(rootMatrixBeforeOffset, allMatrix, n));
      info.matrix = createOriginMatrix(offset, n);
    }

    allMatrix = multiply(allMatrix, info.matrix, n);
  });
  var isMatrix3d = !isSVGGraphicElement && is3d;

  if (!targetMatrix) {
    targetMatrix = createIdentityMatrix(isMatrix3d ? 4 : 3);
  }

  var targetTransform = makeMatrixCSS(isSVGGraphicElement && targetMatrix.length === 16 ? convertDimension(targetMatrix, 4, 3) : targetMatrix, isMatrix3d);
  rootMatrix = ignoreDimension(rootMatrix, n, n);
  return {
    hasFixed: hasFixed,
    rootMatrix: rootMatrix,
    beforeMatrix: beforeMatrix,
    offsetMatrix: offsetMatrix,
    allMatrix: allMatrix,
    targetMatrix: targetMatrix,
    targetTransform: targetTransform,
    transformOrigin: transformOrigin,
    targetOrigin: targetOrigin,
    is3d: isNext3d,
    offsetContainer: offsetContainer,
    offsetRootContainer: offsetRootContainer
  };
}

function calculateElementInfo(target, container, rootContainer, isAbsolute3d) {
  if (rootContainer === void 0) {
    rootContainer = container;
  }

  var width = 0;
  var height = 0;
  var rotation = 0;
  var allResult = {};
  var sizes = getSize(target);

  if (target) {
    width = sizes.offsetWidth;
    height = sizes.offsetHeight;
  }

  if (target) {
    var result = calculateMatrixStack(target, container, rootContainer, isAbsolute3d);
    var position = calculateMoveablePosition(result.allMatrix, result.transformOrigin, width, height);
    allResult = __assign(__assign({}, result), position);
    var rotationPosition = calculateMoveablePosition(result.allMatrix, [50, 50], 100, 100);
    rotation = getRotationRad([rotationPosition.pos1, rotationPosition.pos2], rotationPosition.direction);
  }

  var n = isAbsolute3d ? 4 : 3;
  return __assign(__assign(__assign({
    width: width,
    height: height,
    rotation: rotation
  }, sizes), {
    rootMatrix: createIdentityMatrix(n),
    beforeMatrix: createIdentityMatrix(n),
    offsetMatrix: createIdentityMatrix(n),
    allMatrix: createIdentityMatrix(n),
    targetMatrix: createIdentityMatrix(n),
    targetTransform: "",
    transformOrigin: [0, 0],
    targetOrigin: [0, 0],
    is3d: !!isAbsolute3d,
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    origin: [0, 0],
    pos1: [0, 0],
    pos2: [0, 0],
    pos3: [0, 0],
    pos4: [0, 0],
    direction: 1,
    hasFixed: false,
    offsetContainer: null,
    offsetRootContainer: null
  }), allResult);
}

function getElementInfo(target, container, rootContainer) {
  if (rootContainer === void 0) {
    rootContainer = container;
  }

  return calculateElementInfo(target, container, rootContainer, true);
}

function getMoveableTargetInfo(moveableElement, target, container, parentContainer, rootContainer) {
  var beforeDirection = 1;
  var beforeOrigin = [0, 0];
  var targetClientRect = resetClientRect();
  var moveableClientRect = resetClientRect();
  var containerClientRect = resetClientRect();
  var rootContainerClientRect = resetClientRect();
  var result = calculateElementInfo(target, container, rootContainer, true);

  if (target) {
    var n = result.is3d ? 4 : 3;
    var beforePosition = calculateMoveablePosition(result.offsetMatrix, plus(result.transformOrigin, getOrigin(result.targetMatrix, n)), result.width, result.height);
    beforeDirection = beforePosition.direction;
    beforeOrigin = plus(beforePosition.origin, [beforePosition.left - result.left, beforePosition.top - result.top]);
    targetClientRect = getClientRect(target);
    var offsetContainer = getOffsetInfo(parentContainer, parentContainer, true).offsetParent || result.offsetRootContainer;
    containerClientRect = getClientRect(offsetContainer, true);
    rootContainerClientRect = getClientRect(result.offsetRootContainer);

    if (moveableElement) {
      moveableClientRect = getClientRect(moveableElement);
    }
  }

  return __assign({
    targetClientRect: targetClientRect,
    containerClientRect: containerClientRect,
    moveableClientRect: moveableClientRect,
    rootContainerClientRect: rootContainerClientRect,
    beforeDirection: beforeDirection,
    beforeOrigin: beforeOrigin,
    originalBeforeOrigin: beforeOrigin,
    target: target
  }, result);
}

var MoveableManager = /*#__PURE__*/function (_super) {
  __extends(MoveableManager, _super);

  function MoveableManager() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.state = __assign({
      container: null,
      gestos: {},
      renderPoses: [[0, 0], [0, 0], [0, 0], [0, 0]],
      disableNativeEvent: false
    }, getMoveableTargetInfo(null));
    _this.renderState = {};
    _this.enabledAbles = [];
    _this.targetAbles = [];
    _this.controlAbles = [];
    _this.rotation = 0;
    _this.scale = [1, 1];
    _this.isUnmounted = false;
    _this.events = {
      "mouseEnter": null,
      "mouseLeave": null
    };
    _this._emitter = new EventEmitter();
    _this._prevTarget = null;
    _this._prevDragArea = false;
    _this._isPropTargetChanged = false;
    _this._observer = null;
    _this._observerId = 0;
    _this._rootContainer = null;
    _this._viewContainer = null;
    _this._viewClassNames = [];

    _this.checkUpdateRect = function () {
      if (_this.isDragging()) {
        return;
      }

      var parentMoveable = _this.props.parentMoveable;

      if (parentMoveable) {
        parentMoveable.checkUpdateRect();
        return;
      }

      cancelAnimationFrame(_this._observerId);
      _this._observerId = requestAnimationFrame(function () {
        if (_this.isDragging()) {
          return;
        }

        _this.updateRect();
      });
    };

    _this._onPreventClick = function (e) {
      e.stopPropagation();
      e.preventDefault(); // removeEvent(window, "click", this._onPreventClick, true);
    };

    return _this;
  }

  var __proto = MoveableManager.prototype;

  __proto.render = function () {
    var props = this.props;
    var state = this.getState();
    var parentPosition = props.parentPosition,
        className = props.className,
        propsTarget = props.target,
        zoom = props.zoom,
        cspNonce = props.cspNonce,
        translateZ = props.translateZ,
        ControlBoxElement = props.cssStyled,
        portalContainer = props.portalContainer,
        groupable = props.groupable;

    this._checkUpdateRootContainer();

    this.checkUpdate();
    this.updateRenderPoses();

    var _a = parentPosition || [0, 0],
        parentLeft = _a[0],
        parentTop = _a[1];

    var left = state.left,
        top = state.top,
        stateTarget = state.target,
        direction = state.direction,
        hasFixed = state.hasFixed;
    var groupTargets = props.targets;
    var isDisplay = (groupTargets && groupTargets.length || propsTarget) && (stateTarget || groupable);
    var isDragging = this.isDragging();
    var ableAttributes = {};
    this.getEnabledAbles().forEach(function (able) {
      ableAttributes["data-able-".concat(able.name.toLowerCase())] = true;
    });

    var ableClassName = this._getAbleClassName();

    return React.createElement(ControlBoxElement, __assign({
      cspNonce: cspNonce,
      ref: ref(this, "controlBox"),
      className: "".concat(prefix("control-box", direction === -1 ? "reverse" : "", isDragging ? "dragging" : ""), " ").concat(ableClassName, " ").concat(className)
    }, ableAttributes, {
      onClick: this._onPreventClick,
      portalContainer: portalContainer,
      style: {
        "position": hasFixed ? "fixed" : "absolute",
        "display": isDisplay ? "block" : "none",
        "visibility": this.controlBox || this.props.firstRenderState ? "visible" : "hidden",
        "transform": "translate3d(".concat(left - parentLeft, "px, ").concat(top - parentTop, "px, ").concat(translateZ, ")"),
        "--zoom": zoom,
        "--zoompx": "".concat(zoom, "px")
      }
    }), this.renderAbles(), this._renderLines());
  };

  __proto.componentDidMount = function () {
    this.isUnmounted = false;
    this.controlBox.getElement();
    var props = this.props;
    var parentMoveable = props.parentMoveable,
        container = props.container,
        wrapperMoveable = props.wrapperMoveable;

    this._checkUpdateRootContainer();

    this._checkUpdateViewContainer();

    this._updateTargets();

    this._updateNativeEvents();

    this._updateEvents();

    this.updateCheckInput();

    this._updateObserver(this.props);

    if (!container && !parentMoveable && !wrapperMoveable) {
      this.updateRect("", false, true);
      this.forceUpdate();
    }
  };

  __proto.componentDidUpdate = function (prevProps) {
    this._checkUpdateRootContainer();

    this._checkUpdateViewContainer();

    this._updateNativeEvents();

    this._updateEvents();

    this._updateTargets();

    this.updateCheckInput();

    this._updateObserver(prevProps);
  };

  __proto.componentWillUnmount = function () {
    this.isUnmounted = true;

    this._emitter.off();

    var viewContainer = this._viewContainer;

    if (viewContainer) {
      this._changeAbleViewClassNames([]);
    }

    unset(this, "targetGesto");
    unset(this, "controlGesto");
    var events = this.events;

    for (var name in events) {
      var manager = events[name];
      manager && manager.destroy();
    }
  };

  __proto.getTargets = function () {
    var target = this.props.target;
    return target ? [target] : [];
  };
  /**
   * Get the able used in MoveableManager.
   * @method Moveable#getAble
   * @param - able name
   */


  __proto.getAble = function (ableName) {
    var ables = this.props.ables || [];
    return find(ables, function (able) {
      return able.name === ableName;
    });
  };

  __proto.getContainer = function () {
    var _a = this.props,
        parentMoveable = _a.parentMoveable,
        wrapperMoveable = _a.wrapperMoveable,
        container = _a.container;
    return container || wrapperMoveable && wrapperMoveable.getContainer() || parentMoveable && parentMoveable.getContainer() || this.controlBox.getElement().parentElement;
  };
  /**
   * Check if the target is an element included in the moveable.
   * @method Moveable#isMoveableElement
   * @param - the target
   * @example
   * import Moveable from "moveable";
   *
   * const moveable = new Moveable(document.body);
   *
   * window.addEventListener("click", e => {
   *     if (!moveable.isMoveableElement(e.target)) {
   *         moveable.target = e.target;
   *     }
   * });
   */


  __proto.isMoveableElement = function (target) {
    var _a;

    return target && (((_a = target.getAttribute) === null || _a === void 0 ? void 0 : _a.call(target, "class")) || "").indexOf(PREFIX) > -1;
  };
  /**
   * You can drag start the Moveable through the external `MouseEvent`or `TouchEvent`. (Angular: ngDragStart)
   * @method Moveable#dragStart
   * @param - external `MouseEvent`or `TouchEvent`
   * @example
   * import Moveable from "moveable";
   *
   * const moveable = new Moveable(document.body);
   *
   * document.body.addEventListener("mousedown", e => {
   *     if (!moveable.isMoveableElement(e.target)) {
   *          moveable.dragStart(e);
   *     }
   * });
   */


  __proto.dragStart = function (e) {
    var targetGesto = this.targetGesto;
    var controlGesto = this.controlGesto;

    if (targetGesto && checkMoveableTarget(this)({
      inputEvent: e
    })) {
      if (!targetGesto.isFlag()) {
        targetGesto.triggerDragStart(e);
      }
    } else if (controlGesto && this.isMoveableElement(e.target)) {
      if (!controlGesto.isFlag()) {
        controlGesto.triggerDragStart(e);
      }
    }

    return this;
  };
  /**
   * Hit test an element or rect on a moveable target.
   * @method Moveable#hitTest
   * @param - element or rect to test
   * @return - Get hit test rate (rate > 0 is hitted)
   * @example
   * import Moveable from "moveable";
   *
   * const moveable = new Moveable(document.body);
   *
   * document.body.addEventListener("mousedown", e => {
   *     if (moveable.hitTest(e.target) > 0) {
   *          console.log("hiited");
   *     }
   * });
   */


  __proto.hitTest = function (el) {
    var _a = this.state,
        target = _a.target,
        pos1 = _a.pos1,
        pos2 = _a.pos2,
        pos3 = _a.pos3,
        pos4 = _a.pos4,
        targetClientRect = _a.targetClientRect;

    if (!target) {
      return 0;
    }

    var rect;

    if (el instanceof Element) {
      var clientRect = el.getBoundingClientRect();
      rect = {
        left: clientRect.left,
        top: clientRect.top,
        width: clientRect.width,
        height: clientRect.height
      };
    } else {
      rect = __assign({
        width: 0,
        height: 0
      }, el);
    }

    var rectLeft = rect.left,
        rectTop = rect.top,
        rectWidth = rect.width,
        rectHeight = rect.height;
    var points = fitPoints([pos1, pos2, pos4, pos3], targetClientRect);
    var size = getOverlapSize(points, [[rectLeft, rectTop], [rectLeft + rectWidth, rectTop], [rectLeft + rectWidth, rectTop + rectHeight], [rectLeft, rectTop + rectHeight]]);
    var totalSize = getAreaSize(points);

    if (!size || !totalSize) {
      return 0;
    }

    return Math.min(100, size / totalSize * 100);
  };
  /**
   * Whether the coordinates are inside Moveable
   * @method Moveable#isInside
   * @param - x coordinate
   * @param - y coordinate
   * @return - True if the coordinate is in moveable or false
   * @example
   * import Moveable from "moveable";
   *
   * const moveable = new Moveable(document.body);
   *
   * document.body.addEventListener("mousedown", e => {
   *     if (moveable.isInside(e.clientX, e.clientY)) {
   *          console.log("inside");
   *     }
   * });
   */


  __proto.isInside = function (clientX, clientY) {
    var _a = this.state,
        target = _a.target,
        pos1 = _a.pos1,
        pos2 = _a.pos2,
        pos3 = _a.pos3,
        pos4 = _a.pos4,
        targetClientRect = _a.targetClientRect;

    if (!target) {
      return false;
    }

    return isInside([clientX, clientY], fitPoints([pos1, pos2, pos4, pos3], targetClientRect));
  };
  /**
   * If the width, height, left, and top of all elements change, update the shape of the moveable.
   * @method Moveable#updateRect
   * @example
   * import Moveable from "moveable";
   *
   * const moveable = new Moveable(document.body);
   *
   * window.addEventListener("resize", e => {
   *     moveable.updateRect();
   * });
   */


  __proto.updateRect = function (type, isTarget, isSetState) {
    if (isSetState === void 0) {
      isSetState = true;
    }

    var props = this.props;
    var parentMoveable = props.parentMoveable;
    var state = this.state;
    var target = state.target || this.props.target;
    var container = this.getContainer();
    var rootContainer = parentMoveable ? parentMoveable._rootContainer : this._rootContainer;
    this.updateState(getMoveableTargetInfo(this.controlBox && this.controlBox.getElement(), target, container, container, rootContainer || container), parentMoveable ? false : isSetState);
  };
  /**
   * Check if the moveable state is being dragged.
   * @method Moveable#isDragging
   * @param - If you want to check if able is dragging, specify ableName.
   * @example
   * import Moveable from "moveable";
   *
   * const moveable = new Moveable(document.body);
   *
   * // false
   * console.log(moveable.isDragging());
   *
   * moveable.on("drag", () => {
   *   // true
   *   console.log(moveable.isDragging());
   * });
   */


  __proto.isDragging = function (ableName) {
    var _a, _b;

    var targetGesto = this.targetGesto;
    var controlGesto = this.controlGesto;

    if (targetGesto === null || targetGesto === void 0 ? void 0 : targetGesto.isFlag()) {
      if (!ableName) {
        return true;
      }

      var data = targetGesto.getEventData();
      return !!((_a = data[ableName]) === null || _a === void 0 ? void 0 : _a.isEventStart);
    }

    if (controlGesto === null || controlGesto === void 0 ? void 0 : controlGesto.isFlag()) {
      if (!ableName) {
        return true;
      }

      var data = controlGesto.getEventData();
      return !!((_b = data[ableName]) === null || _b === void 0 ? void 0 : _b.isEventStart);
    }

    return false;
  };
  /**
   * If the width, height, left, and top of the only target change, update the shape of the moveable.
   * @method Moveable#updateTarget
   * @example
   * import Moveable from "moveable";
   *
   * const moveable = new Moveable(document.body);
   *
   * moveable.updateTarget();
   */


  __proto.updateTarget = function (type) {
    this.updateRect(type, true);
  };
  /**
   * You can get the vertex information, position and offset size information of the target based on the container.
   * @method Moveable#getRect
   * @return - The Rect Info
   * @example
   * import Moveable from "moveable";
   *
   * const moveable = new Moveable(document.body);
   *
   * const rectInfo = moveable.getRect();
   */


  __proto.getRect = function () {
    var state = this.state;
    var poses = getAbsolutePosesByState(this.state);
    var pos1 = poses[0],
        pos2 = poses[1],
        pos3 = poses[2],
        pos4 = poses[3];
    var rect = getRect(poses);
    var offsetWidth = state.width,
        offsetHeight = state.height;
    var width = rect.width,
        height = rect.height,
        left = rect.left,
        top = rect.top;
    var statePos = [state.left, state.top];
    var origin = plus(statePos, state.origin);
    var beforeOrigin = plus(statePos, state.beforeOrigin);
    var transformOrigin = state.transformOrigin;
    return {
      width: width,
      height: height,
      left: left,
      top: top,
      pos1: pos1,
      pos2: pos2,
      pos3: pos3,
      pos4: pos4,
      offsetWidth: offsetWidth,
      offsetHeight: offsetHeight,
      beforeOrigin: beforeOrigin,
      origin: origin,
      transformOrigin: transformOrigin,
      rotation: this.getRotation()
    };
  };
  /**
   * Get a manager that manages the moveable's state and props.
   * @method Moveable#getManager
   * @return - The Rect Info
   * @example
   * import Moveable from "moveable";
   *
   * const moveable = new Moveable(document.body);
   *
   * const manager = moveable.getManager(); // real moveable class instance
   */


  __proto.getManager = function () {
    return this;
  };

  __proto.getRotation = function () {
    var _a = this.state,
        pos1 = _a.pos1,
        pos2 = _a.pos2,
        direction = _a.direction;
    return getAbsoluteRotation(pos1, pos2, direction);
  };
  /**
   * Request able through a method rather than an event.
   * At the moment of execution, requestStart is executed,
   * and then request and requestEnd can be executed through Requester.
   * @method Moveable#request
   * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Draggable.html#request|Draggable Requester}
   * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Resizable.html#request|Resizable Requester}
   * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Scalable.html#request|Scalable Requester}
   * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Rotatable.html#request|Rotatable Requester}
   * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.OriginDraggable.html#request|OriginDraggable Requester}
   * @param - ableName
   * @param - request to be able params.
   * @param - If isInstant is true, request and requestEnd are executed immediately.
   * @return - Able Requester. If there is no request in able, nothing will work.
   * @example
   * import Moveable from "moveable";
   *
   * const moveable = new Moveable(document.body);
   *
   * // Instantly Request (requestStart - request - requestEnd)
   * moveable.request("draggable", { deltaX: 10, deltaY: 10 }, true);
   *
   * // Start move
   * const requester = moveable.request("draggable");
   * requester.request({ deltaX: 10, deltaY: 10 });
   * requester.request({ deltaX: 10, deltaY: 10 });
   * requester.request({ deltaX: 10, deltaY: 10 });
   * requester.requestEnd();
   */


  __proto.request = function (ableName, param, isInstant) {
    if (param === void 0) {
      param = {};
    }

    var _a = this.props,
        ables = _a.ables,
        groupable = _a.groupable;
    var requsetAble = ables.filter(function (able) {
      return able.name === ableName;
    })[0];

    if (this.isDragging() || !requsetAble || !requsetAble.request) {
      return {
        request: function () {
          return this;
        },
        requestEnd: function () {
          return this;
        }
      };
    }

    var self = this;
    var ableRequester = requsetAble.request(this);
    var requestInstant = isInstant || param.isInstant;
    var ableType = ableRequester.isControl ? "controlAbles" : "targetAbles";
    var eventAffix = "".concat(groupable ? "Group" : "").concat(ableRequester.isControl ? "Control" : "");
    var requester = {
      request: function (ableParam) {
        triggerAble(self, ableType, "drag", eventAffix, "", __assign(__assign({}, ableRequester.request(ableParam)), {
          requestAble: ableName,
          isRequest: true
        }), requestInstant);
        return this;
      },
      requestEnd: function () {
        triggerAble(self, ableType, "drag", eventAffix, "End", __assign(__assign({}, ableRequester.requestEnd()), {
          requestAble: ableName,
          isRequest: true
        }), requestInstant);
        return this;
      }
    };
    triggerAble(self, ableType, "drag", eventAffix, "Start", __assign(__assign({}, ableRequester.requestStart(param)), {
      requestAble: ableName,
      isRequest: true
    }), requestInstant);
    return requestInstant ? requester.request(param).requestEnd() : requester;
  };
  /**
   * Remove the Moveable object and the events.
   * @method Moveable#destroy
   * @example
   * import Moveable from "moveable";
   *
   * const moveable = new Moveable(document.body);
   *
   * moveable.destroy();
   */


  __proto.destroy = function () {
    this.componentWillUnmount();
  };

  __proto.updateRenderPoses = function () {
    var state = this.getState();
    var props = this.props;
    var originalBeforeOrigin = state.originalBeforeOrigin,
        transformOrigin = state.transformOrigin,
        allMatrix = state.allMatrix,
        is3d = state.is3d,
        pos1 = state.pos1,
        pos2 = state.pos2,
        pos3 = state.pos3,
        pos4 = state.pos4,
        stateLeft = state.left,
        stateTop = state.top;

    var _a = props.padding || {},
        _b = _a.left,
        left = _b === void 0 ? 0 : _b,
        _c = _a.top,
        top = _c === void 0 ? 0 : _c,
        _d = _a.bottom,
        bottom = _d === void 0 ? 0 : _d,
        _e = _a.right,
        right = _e === void 0 ? 0 : _e;

    var n = is3d ? 4 : 3;
    var absoluteOrigin = this.controlBox && props.groupable ? originalBeforeOrigin : plus(originalBeforeOrigin, [stateLeft, stateTop]);
    state.renderPoses = [plus(pos1, calculatePadding(allMatrix, [-left, -top], transformOrigin, absoluteOrigin, n)), plus(pos2, calculatePadding(allMatrix, [right, -top], transformOrigin, absoluteOrigin, n)), plus(pos3, calculatePadding(allMatrix, [-left, bottom], transformOrigin, absoluteOrigin, n)), plus(pos4, calculatePadding(allMatrix, [right, bottom], transformOrigin, absoluteOrigin, n))];
  };

  __proto.checkUpdate = function () {
    this._isPropTargetChanged = false;
    var _a = this.props,
        target = _a.target,
        container = _a.container,
        parentMoveable = _a.parentMoveable;
    var _b = this.state,
        stateTarget = _b.target,
        stateContainer = _b.container;

    if (!stateTarget && !target) {
      return;
    }

    this.updateAbles();
    var isTargetChanged = !equals(stateTarget, target);
    var isChanged = isTargetChanged || !equals(stateContainer, container);

    if (!isChanged) {
      return;
    }

    var moveableContainer = container || this.controlBox;

    if (moveableContainer) {
      this.unsetAbles();
    }

    this.updateState({
      target: target,
      container: container
    });

    if (!parentMoveable && moveableContainer) {
      this.updateRect("End", false, false);
    }

    this._isPropTargetChanged = isTargetChanged;
  };

  __proto.waitToChangeTarget = function () {
    return new Promise(function () {});
  };

  __proto.triggerEvent = function (name, e) {
    this._emitter.trigger(name, e);

    var callback = this.props[name];
    return callback && callback(e);
  };

  __proto.useCSS = function (tag, css) {
    var customStyleMap = this.props.customStyledMap;
    var key = tag + css;

    if (!customStyleMap[key]) {
      customStyleMap[key] = styled(tag, css);
    }

    return customStyleMap[key];
  };

  __proto.getState = function () {
    var firstRenderState = this.props.firstRenderState;

    if (firstRenderState && !this.controlBox) {
      return firstRenderState;
    } else {
      return this.state;
    }
  };

  __proto.updateSelectors = function () {};

  __proto.unsetAbles = function () {
    var _this = this;

    this.targetAbles.forEach(function (able) {
      if (able.unset) {
        able.unset(_this);
      }
    });
  };

  __proto.updateAbles = function (ables, eventAffix) {
    if (ables === void 0) {
      ables = this.props.ables;
    }

    if (eventAffix === void 0) {
      eventAffix = "";
    }

    var props = this.props;
    var triggerAblesSimultaneously = props.triggerAblesSimultaneously;
    var enabledAbles = ables.filter(function (able) {
      return able && (able.always && props[able.name] !== false || props[able.name]);
    });
    var dragStart = "drag".concat(eventAffix, "Start");
    var pinchStart = "pinch".concat(eventAffix, "Start");
    var dragControlStart = "drag".concat(eventAffix, "ControlStart");
    var targetAbles = filterAbles(enabledAbles, [dragStart, pinchStart], triggerAblesSimultaneously);
    var controlAbles = filterAbles(enabledAbles, [dragControlStart], triggerAblesSimultaneously);
    this.enabledAbles = enabledAbles;
    this.targetAbles = targetAbles;
    this.controlAbles = controlAbles;
  };

  __proto.updateState = function (nextState, isSetState) {
    if (isSetState) {
      if (this.isUnmounted) {
        return;
      }

      this.setState(nextState);
    } else {
      var state = this.state;

      for (var name in nextState) {
        state[name] = nextState[name];
      }
    }
  };

  __proto.getEnabledAbles = function () {
    var props = this.props;
    var ables = props.ables;
    return ables.filter(function (able) {
      return able && props[able.name];
    });
  };

  __proto.renderAbles = function () {
    var _this = this;

    var props = this.props;
    var triggerAblesSimultaneously = props.triggerAblesSimultaneously;
    var Renderer = {
      createElement: createElement
    };
    this.renderState = {};
    return groupByMap(flat(filterAbles(this.getEnabledAbles(), ["render"], triggerAblesSimultaneously).map(function (_a) {
      var render = _a.render;
      return render(_this, Renderer) || [];
    })).filter(function (el) {
      return el;
    }), function (_a) {
      var key = _a.key;
      return key;
    }).map(function (group) {
      return group[0];
    });
  };

  __proto.updateCheckInput = function () {
    this.targetGesto && (this.targetGesto.options.checkInput = this.props.checkInput);
  };

  __proto._updateObserver = function (prevProps) {
    var _a;

    var props = this.props;
    var target = props.target;

    if (!window.ResizeObserver || !target || !props.useResizeObserver) {
      (_a = this._observer) === null || _a === void 0 ? void 0 : _a.disconnect();
      return;
    }

    if (prevProps.target === target && this._observer) {
      return;
    }

    var observer = new ResizeObserver(this.checkUpdateRect);
    observer.observe(target, {
      box: "border-box"
    });
    this._observer = observer;
    return;
  };

  __proto._updateEvents = function () {
    var controlBoxElement = this.controlBox.getElement();
    var hasTargetAble = this.targetAbles.length;
    var hasControlAble = this.controlAbles.length;
    var props = this.props;
    var target = props.dragTarget || props.target;

    var isUnset = !hasTargetAble && this.targetGesto || this._isTargetChanged(true);

    if (isUnset) {
      unset(this, "targetGesto");
      this.updateState({
        gesto: null
      });
    }

    if (!hasControlAble) {
      unset(this, "controlGesto");
    }

    if (target && hasTargetAble && !this.targetGesto) {
      this.targetGesto = getTargetAbleGesto(this, target, "");
    }

    if (!this.controlGesto && hasControlAble) {
      this.controlGesto = getAbleGesto(this, controlBoxElement, "controlAbles", "Control");
    }
  };

  __proto._updateTargets = function () {
    var props = this.props;
    this._prevTarget = props.dragTarget || props.target;
    this._prevDragArea = props.dragArea;
  };

  __proto._renderLines = function () {
    var props = this.props;
    var _a = props,
        zoom = _a.zoom,
        hideDefaultLines = _a.hideDefaultLines,
        hideChildMoveableDefaultLines = _a.hideChildMoveableDefaultLines,
        parentMoveable = _a.parentMoveable;

    if (hideDefaultLines || parentMoveable && hideChildMoveableDefaultLines) {
      return [];
    }

    var renderPoses = this.getState().renderPoses;
    var Renderer = {
      createElement: createElement
    };
    return [[0, 1], [1, 3], [3, 2], [2, 0]].map(function (_a, i) {
      var from = _a[0],
          to = _a[1];
      return renderLine(Renderer, "", renderPoses[from], renderPoses[to], zoom, "render-line-".concat(i));
    });
  };

  __proto._isTargetChanged = function (useDragArea) {
    var props = this.props;
    var target = props.dragTarget || props.target;
    var prevTarget = this._prevTarget;
    var prevDragArea = this._prevDragArea;
    var dragArea = props.dragArea; // check target without dragArea

    var isTargetChanged = !dragArea && prevTarget !== target;
    var isDragAreaChanged = (useDragArea || dragArea) && prevDragArea !== dragArea;
    return isTargetChanged || isDragAreaChanged;
  };

  __proto._updateNativeEvents = function () {
    var _this = this;

    var props = this.props;
    var target = props.dragArea ? this.areaElement : this.state.target;
    var events = this.events;
    var eventKeys = getKeys(events);

    if (this._isTargetChanged()) {
      for (var eventName in events) {
        var manager = events[eventName];
        manager && manager.destroy();
        events[eventName] = null;
      }
    }

    if (!target) {
      return;
    }

    var enabledAbles = this.enabledAbles;
    eventKeys.forEach(function (eventName) {
      var ables = filterAbles(enabledAbles, [eventName]);
      var hasAbles = ables.length > 0;
      var manager = events[eventName];

      if (!hasAbles) {
        if (manager) {
          manager.destroy();
          events[eventName] = null;
        }

        return;
      }

      if (!manager) {
        manager = new EventManager(target, _this, eventName);
        events[eventName] = manager;
      }

      manager.setAbles(ables);
    });
  };

  __proto._checkUpdateRootContainer = function () {
    var rootContainer = this.props.rootContainer;

    if (!this._rootContainer && rootContainer) {
      this._rootContainer = getRefTarget(rootContainer, true);
    }
  };

  __proto._checkUpdateViewContainer = function () {
    var viewContainerOption = this.props.viewContainer;

    if (!this._viewContainer && viewContainerOption) {
      this._viewContainer = getRefTarget(viewContainerOption, true);
    }

    var viewContainer = this._viewContainer;

    if (viewContainer) {
      this._changeAbleViewClassNames(__spreadArray(__spreadArray([], this._getAbleViewClassNames(), true), [this.isDragging() ? VIEW_DRAGGING : ""], false));
    }
  };

  __proto._changeAbleViewClassNames = function (classNames) {
    var viewContainer = this._viewContainer;
    var nextClassNames = groupBy(classNames.filter(Boolean), function (el) {
      return el;
    }).map(function (_a) {
      var className = _a[0];
      return className;
    });
    var prevClassNames = this._viewClassNames;

    var _a = diff(prevClassNames, nextClassNames),
        removed = _a.removed,
        added = _a.added;

    removed.forEach(function (index) {
      removeClass(viewContainer, prevClassNames[index]);
    });
    added.forEach(function (index) {
      addClass(viewContainer, nextClassNames[index]);
    });
    this._viewClassNames = nextClassNames;
  };

  __proto._getAbleViewClassNames = function () {
    var _this = this;

    return this.getEnabledAbles().map(function (able) {
      var _a;

      return ((_a = able.viewClassName) === null || _a === void 0 ? void 0 : _a.call(able, _this)) || "";
    }).join(" ").split(/\s+/g);
  };

  __proto._getAbleClassName = function () {
    var _this = this;

    var ables = this.getEnabledAbles();
    var targetGesto = this.targetGesto;
    var controlGesto = this.controlGesto;
    var targetGestoData = (targetGesto === null || targetGesto === void 0 ? void 0 : targetGesto.isFlag()) ? targetGesto.getEventData() : {};
    var controlGestoData = (controlGesto === null || controlGesto === void 0 ? void 0 : controlGesto.isFlag()) ? controlGesto.getEventData() : {};
    return ables.map(function (able) {
      var _a, _b, _c;

      var name = able.name;
      var className = ((_a = able.className) === null || _a === void 0 ? void 0 : _a.call(able, _this)) || "";

      if (((_b = targetGestoData[name]) === null || _b === void 0 ? void 0 : _b.isEventStart) || ((_c = controlGestoData[name]) === null || _c === void 0 ? void 0 : _c.isEventStart)) {
        className += " ".concat(prefix("".concat(name, "-dragging")));
      }

      return className.trim();
    }).filter(Boolean).join(" ");
  };

  MoveableManager.defaultProps = {
    target: null,
    dragTarget: null,
    container: null,
    rootContainer: null,
    origin: true,
    parentMoveable: null,
    wrapperMoveable: null,
    parentPosition: null,
    portalContainer: null,
    useResizeObserver: false,
    ables: [],
    pinchThreshold: 20,
    dragArea: false,
    passDragArea: false,
    transformOrigin: "",
    className: "",
    zoom: 1,
    triggerAblesSimultaneously: false,
    padding: {},
    pinchOutside: true,
    checkInput: false,
    groupable: false,
    hideDefaultLines: false,
    cspNonce: "",
    translateZ: 0,
    cssStyled: null,
    customStyledMap: {},
    props: {},
    stopPropagation: false,
    preventClickDefault: false,
    preventClickEventOnDrag: true,
    flushSync: defaultSync,
    firstRenderState: null,
    viewContainer: null
  };
  return MoveableManager;
}(React.PureComponent);
/**
 * The target to indicate Moveable Control Box.
 * @name Moveable#target
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body);
 * moveable.target = document.querySelector(".target");
 */

/**
 * Zooms in the elements of a moveable.
 * @name Moveable#zoom
 * @default 1
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body);
 * moveable.zoom = 2;
 */

/**
 * Whether the target size is detected and updated whenever it changes.
 * @name Moveable#useResizeObserver
 * @default false
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body);
 * moveable.useResizeObserver = true;
 */

/**
 * Resize, Scale Events at edges
 * @name Moveable#edge
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body);
 * moveable.edge = true;
 */

/**
 * You can specify the className of the moveable controlbox.
 * @name Moveable#className
 * @default ""
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *   className: "",
 * });
 *
 * moveable.className = "moveable1";
 */

/**
 * The target(s) to drag Moveable target(s)
 * @name Moveable#dragTarget
 * @default target
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body);
 * moveable.target = document.querySelector(".target");
 * moveable.dragTarget = document.querySelector(".dragTarget");
 */

/**
 * `renderStart` event occurs at the first start of all events.
 * @memberof Moveable
 * @event renderStart
 * @param {Moveable.OnRenderStart} - Parameters for the `renderStart` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     target: document.querySelector(".target"),
 * });
 * moveable.on("renderStart", ({ target }) => {
 *     console.log("onRenderStart", target);
 * });
 */

/**
 * `render` event occurs before the target is drawn on the screen.
 * @memberof Moveable
 * @event render
 * @param {Moveable.OnRender} - Parameters for the `render` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     target: document.querySelector(".target"),
 * });
 * moveable.on("render", ({ target }) => {
 *     console.log("onRender", target);
 * });
 */

/**
 * `renderEnd` event occurs at the end of all events.
 * @memberof Moveable
 * @event renderEnd
 * @param {Moveable.OnRenderEnd} - Parameters for the `renderEnd` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     target: document.querySelector(".target"),
 * });
 * moveable.on("renderEnd", ({ target }) => {
 *     console.log("onRenderEnd", target);
 * });
 */

/**
 * `renderGroupStart` event occurs at the first start of all events in group.
 * @memberof Moveable
 * @event renderGroupStart
 * @param {Moveable.OnRenderGroupStart} - Parameters for the `renderGroupStart` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     target: [].slice.call(document.querySelectorAll(".target")),
 * });
 * moveable.on("renderGroupStart", ({ targets }) => {
 *     console.log("onRenderGroupStart", targets);
 * });
 */

/**
 * `renderGroup` event occurs before the target is drawn on the screen in group.
 * @memberof Moveable
 * @event renderGroup
 * @param {Moveable.OnRenderGroup} - Parameters for the `renderGroup` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     target: [].slice.call(document.querySelectorAll(".target")),
 * });
 * moveable.on("renderGroup", ({ targets }) => {
 *     console.log("onRenderGroup", targets);
 * });
 */

/**
 * `renderGroupEnd` event occurs at the end of all events in group.
 * @memberof Moveable
 * @event renderGroupEnd
 * @param {Moveable.OnRenderGroupEnd} - Parameters for the `renderGroupEnd` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     target: [].slice.call(document.querySelectorAll(".target")),
 * });
 * moveable.on("renderGroupEnd", ({ targets }) => {
 *     console.log("onRenderGroupEnd", targets);
 * });
 */


var Groupable = {
  name: "groupable",
  props: {
    defaultGroupRotate: Number,
    defaultGroupOrigin: String,
    groupable: Boolean,
    targetGroups: Object,
    hideChildMoveableDefaultLines: Boolean
  },
  events: {},
  render: function (moveable, React) {
    var targets = moveable.props.targets || [];
    moveable.moveables = [];
    var _a = moveable.state,
        left = _a.left,
        top = _a.top;
    var position = [left, top];
    var props = moveable.props;
    var zoom = props.zoom || 1;
    var renderGroupRects = moveable.renderGroupRects;
    return __spreadArray(__spreadArray([], targets.map(function (target, i) {
      return React.createElement(MoveableManager, {
        key: "moveable" + i,
        ref: refs(moveable, "moveables", i),
        target: target,
        origin: false,
        cssStyled: props.cssStyled,
        customStyledMap: props.customStyledMap,
        useResizeObserver: props.useResizeObserver,
        hideChildMoveableDefaultLines: props.hideChildMoveableDefaultLines,
        parentMoveable: moveable,
        parentPosition: position,
        zoom: zoom
      });
    }), true), flat(renderGroupRects.map(function (_a, i) {
      var pos1 = _a.pos1,
          pos2 = _a.pos2,
          pos3 = _a.pos3,
          pos4 = _a.pos4;
      var poses = [pos1, pos2, pos3, pos4];
      return [[0, 1], [1, 3], [3, 2], [2, 0]].map(function (_a, j) {
        var from = _a[0],
            to = _a[1];
        return renderLine(React, "", minus(poses[from], position), minus(poses[to], position), zoom, "group-rect-".concat(i, "-").concat(j));
      });
    })), true);
  }
};
var Clickable = makeAble("clickable", {
  props: {
    clickable: Boolean
  },
  events: {
    onClick: "click",
    onClickGroup: "clickGroup"
  },
  always: true,
  dragRelation: "weak",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dragStart: function () {
    return;
  },
  dragControlStart: function () {
    return;
  },
  dragGroupStart: function (moveable, e) {
    e.datas.inputTarget = e.inputEvent && e.inputEvent.target;
  },
  dragEnd: function (moveable, e) {
    var target = moveable.props.target;
    var inputEvent = e.inputEvent;
    var inputTarget = e.inputTarget;
    var isMoveableElement = moveable.isMoveableElement(inputTarget);
    var containsElement = !isMoveableElement && moveable.controlBox.getElement().contains(inputTarget);

    if (!inputEvent || !inputTarget || e.isDrag || moveable.isMoveableElement(inputTarget) || containsElement // External event duplicate target or dragAreaElement
    ) {
      return;
    }

    var containsTarget = target.contains(inputTarget);
    triggerEvent(moveable, "onClick", fillParams(moveable, e, {
      isDouble: e.isDouble,
      inputTarget: inputTarget,
      isTarget: target === inputTarget,
      moveableTarget: moveable.props.target,
      containsTarget: containsTarget
    }));
  },
  dragGroupEnd: function (moveable, e) {
    var inputEvent = e.inputEvent;
    var inputTarget = e.inputTarget;

    if (!inputEvent || !inputTarget || e.isDrag || moveable.isMoveableElement(inputTarget) // External event duplicate target or dragAreaElement
    || e.datas.inputTarget === inputTarget) {
      return;
    }

    var targets = moveable.props.targets;
    var targetIndex = targets.indexOf(inputTarget);
    var isTarget = targetIndex > -1;
    var containsTarget = false;

    if (targetIndex === -1) {
      targetIndex = findIndex(targets, function (parentTarget) {
        return parentTarget.contains(inputTarget);
      });
      containsTarget = targetIndex > -1;
    }

    triggerEvent(moveable, "onClickGroup", fillParams(moveable, e, {
      isDouble: e.isDouble,
      targets: targets,
      inputTarget: inputTarget,
      targetIndex: targetIndex,
      isTarget: isTarget,
      containsTarget: containsTarget,
      moveableTarget: targets[targetIndex]
    }));
  },
  dragControlEnd: function (moveable, e) {
    this.dragEnd(moveable, e);
  },
  dragGroupControlEnd: function (moveable, e) {
    this.dragEnd(moveable, e);
  }
});
/**
 * When you click on the element, the `click` event is called.
 * @memberof Moveable
 * @event click
 * @param {Moveable.OnClick} - Parameters for the `click` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     target: document.querySelector(".target"),
 * });
 * moveable.on("click", ({ hasTarget, containsTarget, targetIndex }) => {
 *     // If you click on an element other than the target and not included in the target, index is -1.
 *     console.log("onClickGroup", target, hasTarget, containsTarget, targetIndex);
 * });
 */

/**
 * When you click on the element inside the group, the `clickGroup` event is called.
 * @memberof Moveable
 * @event clickGroup
 * @param {Moveable.OnClickGroup} - Parameters for the `clickGroup` event
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *     target: [].slice.call(document.querySelectorAll(".target")),
 * });
 * moveable.on("clickGroup", ({ inputTarget, isTarget, containsTarget, targetIndex }) => {
 *     // If you click on an element other than the target and not included in the target, index is -1.
 *     console.log("onClickGroup", inputTarget, isTarget, containsTarget, targetIndex);
 * });
 */

function getDraggableEvent(e) {
  var datas = e.originalDatas.draggable;

  if (!datas) {
    e.originalDatas.draggable = {};
    datas = e.originalDatas.draggable;
  }

  return __assign(__assign({}, e), {
    datas: datas
  });
}

var edgeDraggable = makeAble("edgeDraggable", {
  css: [".edge.edgeDraggable.line {\n    cursor: move;\n}"],
  render: function (moveable, React) {
    var props = moveable.props;
    var edge = props.edgeDraggable;

    if (!edge) {
      return [];
    }

    return renderEdgeLines(React, "edgeDraggable", edge, moveable.getState().renderPoses, props.zoom);
  },
  dragControlCondition: function (moveable, e) {
    if (!moveable.props.edgeDraggable || !e.inputEvent) {
      return false;
    }

    var target = e.inputEvent.target;
    return hasClass(target, prefix("direction")) && hasClass(target, prefix("edge")) && hasClass(target, prefix("edgeDraggable"));
  },
  dragControlStart: function (moveable, e) {
    moveable.state.snapRenderInfo = {
      request: e.isRequest,
      snap: true,
      center: true
    };
    return Draggable.dragStart(moveable, getDraggableEvent(e));
  },
  dragControl: function (moveable, e) {
    return Draggable.drag(moveable, getDraggableEvent(e));
  },
  dragControlEnd: function (moveable, e) {
    return Draggable.dragEnd(moveable, getDraggableEvent(e));
  },
  dragGroupControlCondition: function (moveable, e) {
    if (!moveable.props.edgeDraggable || !e.inputEvent) {
      return false;
    }

    var target = e.inputEvent.target;
    return hasClass(target, prefix("direction")) && hasClass(target, prefix("line"));
  },
  dragGroupControlStart: function (moveable, e) {
    return Draggable.dragGroupStart(moveable, getDraggableEvent(e));
  },
  dragGroupControl: function (moveable, e) {
    return Draggable.dragGroup(moveable, getDraggableEvent(e));
  },
  dragGroupControlEnd: function (moveable, e) {
    return Draggable.dragGroupEnd(moveable, getDraggableEvent(e));
  },
  unset: function (moveable) {
    return Draggable.unset(moveable);
  }
});
/**
 * Whether to move by dragging the edge line (default: false)
 * @name Moveable.Draggable#edgeDraggable
 * @example
 * import Moveable from "moveable";
 *
 * const moveable = new Moveable(document.body, {
 *  draggable: true,
 *  edgeDraggable: false,
 * });
 *
 * moveable.edgeDraggable = true;
 */

var IndividualGroupable = {
  name: "individualGroupable",
  props: {
    individualGroupable: Boolean
  },
  events: {}
};
var MOVEABLE_ABLES = [BeforeRenderable, Default, Snappable, Pinchable, Draggable, edgeDraggable, Resizable, Scalable, Warpable, Rotatable, Scrollable, Padding, Origin, OriginDraggable, Clippable, Roundable, Groupable, IndividualGroupable, Clickable, DragArea, Renderable];
var MOVEABLE_EVENTS_PROPS_MAP = /*#__PURE__*/MOVEABLE_ABLES.reduce(function (current, able) {
  return __assign(__assign({}, current), "events" in able ? able.events : {});
}, {});
var MOVEABLE_PROPS_MAP = /*#__PURE__*/MOVEABLE_ABLES.reduce(function (current, able) {
  return __assign(__assign({}, current), able.props);
}, {});
var MOVEABLE_EVENTS_MAP = /*#__PURE__*/invertObject(MOVEABLE_EVENTS_PROPS_MAP);
var MOVEABLE_EVENTS = Object.keys(MOVEABLE_EVENTS_MAP);
var MOVEABLE_PROPS = Object.keys(MOVEABLE_PROPS_MAP);

function solveConstantsDistance(_a, pos) {
  var a = _a[0],
      b = _a[1],
      c = _a[2];
  return (a * pos[0] + b * pos[1] + c) / Math.sqrt(a * a + b * b);
}

function solveC(_a, pos) {
  var a = _a[0],
      b = _a[1]; // ax + by + c = 0
  // -ax -by;

  return -a * pos[0] - b * pos[1];
}

function getMaxPos(poses, index) {
  return Math.max.apply(Math, poses.map(function (_a) {
    var pos1 = _a[0],
        pos2 = _a[1],
        pos3 = _a[2],
        pos4 = _a[3];
    return Math.max(pos1[index], pos2[index], pos3[index], pos4[index]);
  }));
}

function getMinPos(poses, index) {
  return Math.min.apply(Math, poses.map(function (_a) {
    var pos1 = _a[0],
        pos2 = _a[1],
        pos3 = _a[2],
        pos4 = _a[3];
    return Math.min(pos1[index], pos2[index], pos3[index], pos4[index]);
  }));
}

function getGroupRect(parentPoses, rotation) {
  var _a;

  var pos1 = [0, 0];
  var pos2 = [0, 0];
  var pos3 = [0, 0];
  var pos4 = [0, 0];
  var width = 0;
  var height = 0;

  if (!parentPoses.length) {
    return {
      pos1: pos1,
      pos2: pos2,
      pos3: pos3,
      pos4: pos4,
      minX: 0,
      minY: 0,
      width: width,
      height: height,
      rotation: rotation
    };
  }

  var fixedRotation = throttle(rotation, TINY_NUM);

  if (fixedRotation % 90) {
    var rad = fixedRotation / 180 * Math.PI;
    var a1_1 = Math.tan(rad);
    var a2_1 = -1 / a1_1; // ax = y  // -ax + y = 0 // 0 => 1
    // -ax = y // ax + y = 0  // 0 => 3

    var a1MinMax_1 = [MAX_NUM, MIN_NUM];
    var a1MinMaxPos_1 = [[0, 0], [0, 0]];
    var a2MinMax_1 = [MAX_NUM, MIN_NUM];
    var a2MinMaxPos_1 = [[0, 0], [0, 0]];
    parentPoses.forEach(function (poses) {
      poses.forEach(function (pos) {
        // const b1 = pos[1] - a1 * pos[0];
        // const b2 = pos[1] - a2 * pos[0];
        var a1Dist = solveConstantsDistance([-a1_1, 1, 0], pos);
        var a2Dist = solveConstantsDistance([-a2_1, 1, 0], pos);

        if (a1MinMax_1[0] > a1Dist) {
          a1MinMaxPos_1[0] = pos;
          a1MinMax_1[0] = a1Dist;
        }

        if (a1MinMax_1[1] < a1Dist) {
          a1MinMaxPos_1[1] = pos;
          a1MinMax_1[1] = a1Dist;
        }

        if (a2MinMax_1[0] > a2Dist) {
          a2MinMaxPos_1[0] = pos;
          a2MinMax_1[0] = a2Dist;
        }

        if (a2MinMax_1[1] < a2Dist) {
          a2MinMaxPos_1[1] = pos;
          a2MinMax_1[1] = a2Dist;
        }
      });
    });
    var a1MinPos = a1MinMaxPos_1[0],
        a1MaxPos = a1MinMaxPos_1[1];
    var a2MinPos = a2MinMaxPos_1[0],
        a2MaxPos = a2MinMaxPos_1[1];
    var minHorizontalLine = [-a1_1, 1, solveC([-a1_1, 1], a1MinPos)];
    var maxHorizontalLine = [-a1_1, 1, solveC([-a1_1, 1], a1MaxPos)];
    var minVerticalLine = [-a2_1, 1, solveC([-a2_1, 1], a2MinPos)];
    var maxVerticalLine = [-a2_1, 1, solveC([-a2_1, 1], a2MaxPos)];
    _a = [[minHorizontalLine, minVerticalLine], [minHorizontalLine, maxVerticalLine], [maxHorizontalLine, minVerticalLine], [maxHorizontalLine, maxVerticalLine]].map(function (_a) {
      var line1 = _a[0],
          line2 = _a[1];
      return getIntersectionPointsByConstants(line1, line2)[0];
    }), pos1 = _a[0], pos2 = _a[1], pos3 = _a[2], pos4 = _a[3];
    width = a2MinMax_1[1] - a2MinMax_1[0];
    height = a1MinMax_1[1] - a1MinMax_1[0];
  } else {
    var minX_1 = getMinPos(parentPoses, 0);
    var minY_1 = getMinPos(parentPoses, 1);
    var maxX = getMaxPos(parentPoses, 0);
    var maxY = getMaxPos(parentPoses, 1);
    pos1 = [minX_1, minY_1];
    pos2 = [maxX, minY_1];
    pos3 = [minX_1, maxY];
    pos4 = [maxX, maxY];
    width = maxX - minX_1;
    height = maxY - minY_1;

    if (fixedRotation % 180) {
      // 0
      // 1 2
      // 3 4
      // 90
      // 3 1
      // 4 2
      // 180
      // 4 3
      // 2 1
      // 270
      // 2 4
      // 1 3
      // 1, 2, 3,4 = 3 1 4 2
      var changedX = [pos3, pos1, pos4, pos2];
      pos1 = changedX[0], pos2 = changedX[1], pos3 = changedX[2], pos4 = changedX[3];
      width = maxY - minY_1;
      height = maxX - minX_1;
    }
  }

  if (fixedRotation % 360 > 180) {
    // 1 2   4 3
    // 3 4   2 1
    var changedX = [pos4, pos3, pos2, pos1];
    pos1 = changedX[0], pos2 = changedX[1], pos3 = changedX[2], pos4 = changedX[3];
  }

  var _b = getMinMaxs([pos1, pos2, pos3, pos4]),
      minX = _b.minX,
      minY = _b.minY;

  return {
    pos1: pos1,
    pos2: pos2,
    pos3: pos3,
    pos4: pos4,
    width: width,
    height: height,
    minX: minX,
    minY: minY,
    rotation: rotation
  };
}

function findMoveableGroups(moveables, childTargetGroups) {
  var groups = childTargetGroups.map(function (targetGroup) {
    if (isArray(targetGroup)) {
      var childMoveableGroups = findMoveableGroups(moveables, targetGroup);
      var length = childMoveableGroups.length;

      if (length > 1) {
        return childMoveableGroups;
      } else if (length === 1) {
        return childMoveableGroups[0];
      } else {
        return null;
      }
    } else {
      var checked = find(moveables, function (_a) {
        var manager = _a.manager;
        return manager.props.target === targetGroup;
      });

      if (checked) {
        checked.finded = true;
        return checked.manager;
      }

      return null;
    }
  }).filter(Boolean);

  if (groups.length === 1 && isArray(groups[0])) {
    return groups[0];
  }

  return groups;
}
/**
 * @namespace Moveable.Group
 * @description You can make targets moveable.
 */


var MoveableGroup = /*#__PURE__*/function (_super) {
  __extends(MoveableGroup, _super);

  function MoveableGroup() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.differ = new ChildrenDiffer();
    _this.moveables = [];
    _this.transformOrigin = "50% 50%";
    _this.renderGroupRects = [];
    return _this;
  }

  var __proto = MoveableGroup.prototype;

  __proto.checkUpdate = function () {
    this._isPropTargetChanged = false;
    this.updateAbles();
  };

  __proto.getTargets = function () {
    return this.props.targets;
  };

  __proto.updateRect = function (type, isTarget, isSetState) {
    if (isSetState === void 0) {
      isSetState = true;
    }

    if (!this.controlBox) {
      return;
    }

    this.moveables.forEach(function (moveable) {
      moveable.updateRect(type, false, false);
    });
    var state = this.state;
    var props = this.props;
    var moveables = this.moveables;
    var target = state.target || props.target;
    var checkeds = moveables.map(function (moveable) {
      return {
        finded: false,
        manager: moveable
      };
    });
    var moveableGroups = findMoveableGroups(checkeds, this.props.targetGroups || []);
    moveableGroups.push.apply(moveableGroups, checkeds.filter(function (_a) {
      var finded = _a.finded;
      return !finded;
    }).map(function (_a) {
      var manager = _a.manager;
      return manager;
    }));
    var renderGroupRects = [];
    var isReset = !isTarget || type !== "" && props.updateGroup;

    function getMoveableGroupRect(group, parentRotation, isRoot) {
      var posesRotations = group.map(function (moveable) {
        if (isArray(moveable)) {
          var rect = getMoveableGroupRect(moveable, parentRotation);
          var poses = [rect.pos1, rect.pos2, rect.pos3, rect.pos4];
          renderGroupRects.push(rect);
          return {
            poses: poses,
            rotation: rect.rotation
          };
        } else {
          return {
            poses: getAbsolutePosesByState(moveable.state),
            rotation: moveable.getRotation()
          };
        }
      });
      var rotations = posesRotations.map(function (_a) {
        var rotation = _a.rotation;
        return rotation;
      });
      var groupRotation = 0;
      var firstRotation = rotations[0];
      var isSameRotation = rotations.every(function (nextRotation) {
        return Math.abs(firstRotation - nextRotation) < 0.1;
      });

      if (isReset) {
        groupRotation = isSameRotation ? firstRotation : props.defaultGroupRotate || 0;
      } else {
        groupRotation = !isRoot && isSameRotation ? firstRotation : parentRotation;
      }

      var groupPoses = posesRotations.map(function (_a) {
        var poses = _a.poses;
        return poses;
      });
      var groupRect = getGroupRect(groupPoses, groupRotation);
      return groupRect;
    }

    var rootGroupRect = getMoveableGroupRect(moveableGroups, this.rotation, true);

    if (isReset) {
      // reset rotataion
      this.rotation = rootGroupRect.rotation;
      this.transformOrigin = props.defaultGroupOrigin || "50% 50%";
      this.scale = [1, 1];
    }

    this.renderGroupRects = renderGroupRects;
    var rotation = this.rotation;
    var scale = this.scale;
    var width = rootGroupRect.width,
        height = rootGroupRect.height,
        minX = rootGroupRect.minX,
        minY = rootGroupRect.minY; // tslint:disable-next-line: max-line-length

    var transform = "rotate(".concat(rotation, "deg) scale(").concat(scale[0] >= 0 ? 1 : -1, ", ").concat(scale[1] >= 0 ? 1 : -1, ")");
    target.style.cssText += "left:0px;top:0px; transform-origin: ".concat(this.transformOrigin, "; width:").concat(width, "px; height:").concat(height, "px;") + "transform:".concat(transform);
    state.width = width;
    state.height = height;
    var container = this.getContainer();
    var info = getMoveableTargetInfo(this.controlBox.getElement(), target, this.controlBox.getElement(), this.getContainer(), this._rootContainer || container);
    var pos = [info.left, info.top];

    var _a = getAbsolutePosesByState(info),
        pos1 = _a[0],
        pos2 = _a[1],
        pos3 = _a[2],
        pos4 = _a[3]; // info.left + info.pos(1 ~ 4)


    var minPos = getMinMaxs([pos1, pos2, pos3, pos4]);
    var delta = [minPos.minX, minPos.minY];
    info.pos1 = minus(pos1, delta);
    info.pos2 = minus(pos2, delta);
    info.pos3 = minus(pos3, delta);
    info.pos4 = minus(pos4, delta);
    info.left = minX - info.left + delta[0];
    info.top = minY - info.top + delta[1];
    info.origin = minus(plus(pos, info.origin), delta);
    info.beforeOrigin = minus(plus(pos, info.beforeOrigin), delta);
    info.originalBeforeOrigin = plus(pos, info.originalBeforeOrigin); // info.transformOrigin = minus(plus(pos, info.transformOrigin!), delta);

    var clientRect = info.targetClientRect;
    var direction = scale[0] * scale[1] > 0 ? 1 : -1;
    clientRect.top += info.top - state.top;
    clientRect.left += info.left - state.left;
    target.style.transform = "translate(".concat(-delta[0], "px, ").concat(-delta[1], "px) ").concat(transform);
    this.updateState(__assign(__assign({}, info), {
      direction: direction,
      beforeDirection: direction
    }), isSetState);
  };

  __proto.getRect = function () {
    return __assign(__assign({}, _super.prototype.getRect.call(this)), {
      children: this.moveables.map(function (child) {
        return child.getRect();
      })
    });
  };

  __proto.triggerEvent = function (name, e, isManager) {
    if (isManager || name.indexOf("Group") > -1) {
      return _super.prototype.triggerEvent.call(this, name, e);
    } else {
      this._emitter.trigger(name, e);
    }
  };

  __proto.updateAbles = function () {
    _super.prototype.updateAbles.call(this, __spreadArray(__spreadArray([], this.props.ables, true), [Groupable], false), "Group");
  };

  __proto._updateTargets = function () {
    _super.prototype._updateTargets.call(this);

    this._prevTarget = this.props.dragTarget || this.areaElement;
  };

  __proto._updateEvents = function () {
    var state = this.state;
    var props = this.props;
    var prevTarget = this._prevTarget;
    var nextTarget = props.dragTarget || this.areaElement;

    if (prevTarget !== nextTarget) {
      unset(this, "targetGesto");
      unset(this, "controlGesto");
      state.target = null;
    }

    if (!state.target) {
      state.target = this.areaElement;
      this.controlBox.getElement().style.display = "block";
    }

    if (state.target) {
      if (!this.targetGesto) {
        this.targetGesto = getTargetAbleGesto(this, nextTarget, "Group");
      }

      if (!this.controlGesto) {
        this.controlGesto = getAbleGesto(this, this.controlBox.getElement(), "controlAbles", "GroupControl");
      }
    }

    var isContainerChanged = !equals(state.container, props.container);

    if (isContainerChanged) {
      state.container = props.container;
    }

    var _a = this.differ.update(props.targets),
        added = _a.added,
        changed = _a.changed,
        removed = _a.removed;

    var isTargetChanged = added.length || removed.length;

    if (isContainerChanged || isTargetChanged || changed.length) {
      this.updateRect();
    }

    this._isPropTargetChanged = !!isTargetChanged;
  };

  __proto._updateObserver = function () {};

  MoveableGroup.defaultProps = __assign(__assign({}, MoveableManager.defaultProps), {
    transformOrigin: ["50%", "50%"],
    groupable: true,
    dragArea: true,
    keepRatio: true,
    targets: [],
    defaultGroupRotate: 0,
    defaultGroupOrigin: "50% 50%"
  });
  return MoveableGroup;
}(MoveableManager);
/**
 * @namespace Moveable.IndividualGroup
 * @description Create targets individually, not as a group.Create targets individually, not as a group.
 */


var MoveableIndividualGroup = /*#__PURE__*/function (_super) {
  __extends(MoveableIndividualGroup, _super);

  function MoveableIndividualGroup() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.moveables = [];
    return _this;
  }

  var __proto = MoveableIndividualGroup.prototype;

  __proto.render = function () {
    var _this = this;

    var _a = this.props,
        cspNonce = _a.cspNonce,
        ControlBoxElement = _a.cssStyled,
        targets = _a.targets;
    return React.createElement(ControlBoxElement, {
      cspNonce: cspNonce,
      ref: ref(this, "controlBox"),
      className: prefix("control-box")
    }, targets.map(function (target, i) {
      return React.createElement(MoveableManager, __assign({
        key: "moveable" + i,
        ref: refs(_this, "moveables", i)
      }, _this.props, {
        target: target,
        wrapperMoveable: _this
      }));
    }));
  };

  __proto.componentDidUpdate = function () {};

  __proto.getTargets = function () {
    return this.props.targets;
  };

  __proto.updateRect = function (type, isTarget, isSetState) {
    if (isSetState === void 0) {
      isSetState = true;
    }

    this.moveables.forEach(function (moveable) {
      moveable.updateRect(type, isTarget, isSetState);
    });
  };

  __proto.getRect = function () {
    return __assign(__assign({}, _super.prototype.getRect.call(this)), {
      children: this.moveables.map(function (child) {
        return child.getRect();
      })
    });
  };

  __proto.request = function () {
    return {
      request: function () {
        return this;
      },
      requestEnd: function () {
        return this;
      }
    };
  };

  __proto.dragStart = function () {
    return this;
  };

  __proto.hitTest = function () {
    return 0;
  };

  __proto.isInside = function () {
    return false;
  };

  __proto.isDragging = function () {
    return false;
  };

  __proto.updateRenderPoses = function () {};

  __proto.checkUpdate = function () {};

  __proto.triggerEvent = function () {};

  __proto.updateAbles = function () {};

  __proto._updateEvents = function () {};

  __proto._updateObserver = function () {};

  return MoveableIndividualGroup;
}(MoveableManager);

function getElementTargets(refTargets, selectorMap) {
  var elementTargets = [];
  refTargets.forEach(function (target) {
    if (!target) {
      return;
    }

    if (isString(target)) {
      if (selectorMap[target]) {
        elementTargets.push.apply(elementTargets, selectorMap[target]);
      }

      return;
    }

    if (isArray(target)) {
      elementTargets.push.apply(elementTargets, getElementTargets(target, selectorMap));
    } else {
      elementTargets.push(target);
    }
  });
  return elementTargets;
}

function getTargetGroups(refTargets, selectorMap) {
  var targetGroups = [];
  refTargets.forEach(function (target) {
    if (!target) {
      return;
    }

    if (isString(target)) {
      if (selectorMap[target]) {
        targetGroups.push.apply(targetGroups, selectorMap[target]);
      }

      return;
    }

    if (isArray(target)) {
      targetGroups.push(getTargetGroups(target, selectorMap));
    } else {
      targetGroups.push(target);
    }
  });
  return targetGroups;
}

function compareRefTargets(prevRefTargets, nextRefTargets) {
  return prevRefTargets.length !== nextRefTargets.length || prevRefTargets.some(function (target, i) {
    var nextTarget = nextRefTargets[i];

    if (!target && !nextTarget) {
      return false;
    } else if (target != nextTarget) {
      if (isArray(target) && isArray(nextTarget)) {
        return compareRefTargets(target, nextTarget);
      }

      return true;
    }

    return false;
  });
}

var InitialMoveable = /*#__PURE__*/function (_super) {
  __extends(InitialMoveable, _super);

  function InitialMoveable() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.refTargets = [];
    _this.selectorMap = {};
    _this._differ = new ChildrenDiffer();
    _this._elementTargets = [];
    _this._onChangetarget = null;
    return _this;
  }

  var __proto = InitialMoveable.prototype;

  InitialMoveable.makeStyled = function () {
    var cssMap = {};
    var ables = this.getTotalAbles();
    ables.forEach(function (_a) {
      var css = _a.css;

      if (!css) {
        return;
      }

      css.forEach(function (text) {
        cssMap[text] = true;
      });
    });
    var style = getKeys(cssMap).join("\n");
    this.defaultStyled = styled("div", prefixCSS(PREFIX, MOVEABLE_CSS + style));
  };

  InitialMoveable.getTotalAbles = function () {
    return __spreadArray([Default, Groupable, IndividualGroupable, DragArea], this.defaultAbles, true);
  };

  __proto.render = function () {
    var moveableContructor = this.constructor;

    if (!moveableContructor.defaultStyled) {
      moveableContructor.makeStyled();
    }

    var _a = this.props,
        userAbles = _a.ables,
        userProps = _a.props,
        props = __rest(_a, ["ables", "props"]);

    var refTargets = this._updateRefs(true);

    var elementTargets = getElementTargets(refTargets, this.selectorMap);
    var isGroup = elementTargets.length > 1;
    var totalAbles = moveableContructor.getTotalAbles();

    var ables = __spreadArray(__spreadArray([], totalAbles, true), userAbles || [], true);

    var nextProps = __assign(__assign(__assign({}, props), userProps || {}), {
      ables: ables,
      cssStyled: moveableContructor.defaultStyled,
      customStyledMap: moveableContructor.customStyledMap
    });

    this._elementTargets = elementTargets;
    var firstRenderState = null;
    var prevMoveable = this.moveable;

    if (isGroup) {
      if (props.individualGroupable) {
        return React.createElement(MoveableIndividualGroup, __assign({
          key: "individual-group",
          ref: ref(this, "moveable")
        }, nextProps, {
          target: null,
          targets: elementTargets
        }));
      }

      var targetGroups = getTargetGroups(refTargets, this.selectorMap); // manager

      if (prevMoveable && !prevMoveable.props.groupable && !prevMoveable.props.individualGroupable) {
        var target = prevMoveable.props.target;

        if (target && elementTargets.indexOf(target) > -1) {
          firstRenderState = __assign({}, prevMoveable.state);
        }
      }

      return React.createElement(MoveableGroup, __assign({
        key: "group",
        ref: ref(this, "moveable")
      }, nextProps, {
        target: null,
        targets: elementTargets,
        targetGroups: targetGroups,
        firstRenderState: firstRenderState
      }));
    } else {
      var target_1 = elementTargets[0]; // manager

      if (prevMoveable && (prevMoveable.props.groupable || prevMoveable.props.individualGroupable)) {
        var moveables = prevMoveable.moveables || [];
        var prevTargetMoveable = find(moveables, function (mv) {
          return mv.props.target === target_1;
        });

        if (prevTargetMoveable) {
          firstRenderState = __assign({}, prevTargetMoveable.state);
        }
      }

      return React.createElement(MoveableManager, __assign({
        key: "single",
        ref: ref(this, "moveable")
      }, nextProps, {
        target: target_1,
        firstRenderState: firstRenderState
      }));
    }
  };

  __proto.componentDidMount = function () {
    this._updateRefs();
  };

  __proto.componentDidUpdate = function () {
    var _a = this._differ.update(this._elementTargets),
        added = _a.added,
        removed = _a.removed;

    var isTargetChanged = added.length || removed.length;

    if (isTargetChanged && this._onChangetarget) {
      this._onChangetarget();
    }

    this._updateRefs();
  };

  __proto.componentWillUnmount = function () {
    this.selectorMap = {};
    this.refTargets = [];
  };
  /**
   * Get targets set in moveable through target or targets of props.
   * @method Moveable#getTargets
   * import Moveable from "moveable";
   *
   * const moveable = new Moveable(document.body, {
   *    target: [targetRef, ".target", document.querySelectorAll(".target")],
   * });
   *
   * console.log(moveable.getTargets());
   */


  __proto.getTargets = function () {
    var _a, _b;

    return (_b = (_a = this.moveable) === null || _a === void 0 ? void 0 : _a.getTargets()) !== null && _b !== void 0 ? _b : [];
  };
  /**
   * If the element list corresponding to the selector among the targets is changed, it is updated.
   * @method Moveable#updateSelectors
   * @example
   * import Moveable from "moveable";
   *
   * const moveable = new Moveable(document.body, {
   *    target: ".target",
   * });
   *
   * moveable.updateSelectors();
   */


  __proto.updateSelectors = function () {
    this.selectorMap = {};

    this._updateRefs();
  };
  /**
   * User changes target and waits for target to change.
   * @method Moveable#waitToChangeTarget
   * @example
   * import Moveable from "moveable";
   *
   * const moveable = new Moveable(document.body);
   *
   * document.querySelector(".target").addEventListener("mousedown", e => {
   *   moveable.waitToChangeTarget().then(() => {
   *      moveable.dragStart(e.currentTarget);
   *   });
   *   moveable.target = e.currentTarget;
   * });
   */


  __proto.waitToChangeTarget = function () {
    // let resolvePromise: (e: OnChangeTarget) => void;
    var _this = this; // this._onChangetarget = () => {
    //     this._onChangetarget = null;
    //     resolvePromise({
    //         moveable: this.getManager(),
    //         targets: this._elementTargets,
    //     });
    // };
    // return new Promise<OnChangeTarget>(resolve => {
    //     resolvePromise = resolve;
    // });


    var resolvePromise;

    this._onChangetarget = function () {
      _this._onChangetarget = null;
      resolvePromise();
    };

    return new Promise(function (resolve) {
      resolvePromise = resolve;
    });
  };

  __proto.getManager = function () {
    return this.moveable;
  };

  __proto._updateRefs = function (isRender) {
    var prevRefTargets = this.refTargets;
    var nextRefTargets = getRefTargets(this.props.target || this.props.targets);
    var isBrowser = typeof document !== "undefined";
    var isUpdate = compareRefTargets(prevRefTargets, nextRefTargets);
    var selectorMap = this.selectorMap;
    var nextSelectorMap = {};
    this.refTargets.forEach(function updateSelectorMap(target) {
      if (isString(target)) {
        var selectorTarget = selectorMap[target];

        if (selectorTarget) {
          nextSelectorMap[target] = selectorMap[target];
        } else if (isBrowser) {
          isUpdate = true;
          nextSelectorMap[target] = [].slice.call(document.querySelectorAll(target));
        }
      } else if (isArray(target)) {
        target.forEach(updateSelectorMap);
      }
    });
    this.refTargets = nextRefTargets;
    this.selectorMap = nextSelectorMap;

    if (!isRender && isUpdate) {
      this.forceUpdate();
    }

    return nextRefTargets;
  };

  InitialMoveable.defaultAbles = [];
  InitialMoveable.customStyledMap = {};
  InitialMoveable.defaultStyled = null;

  __decorate([withMethods(MOVEABLE_METHODS)], InitialMoveable.prototype, "moveable", void 0);

  return InitialMoveable;
}(React.PureComponent);

var Moveable$1 = /*#__PURE__*/function (_super) {
  __extends(Moveable, _super);

  function Moveable() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  Moveable.defaultAbles = MOVEABLE_ABLES;
  return Moveable;
}(InitialMoveable);

function makeMoveable(ables) {
  var _a;

  return _a = /*#__PURE__*/function (_super) {
    __extends(Moveable, _super);

    function Moveable() {
      return _super !== null && _super.apply(this, arguments) || this;
    }

    return Moveable;
  }(InitialMoveable), _a.defaultAbles = ables, _a;
}

var Moveable = Moveable$1;

export { Clippable, DIRECTIONS, Draggable, edgeDraggable as EdgeDraggable, InitialMoveable, MOVEABLE_ABLES, MOVEABLE_EVENTS, MOVEABLE_EVENTS_MAP, MOVEABLE_EVENTS_PROPS_MAP, MOVEABLE_METHODS, MOVEABLE_PROPS, MOVEABLE_PROPS_MAP, Pinchable, Resizable, Rotatable, Roundable, Scalable, Snappable, Warpable, Moveable as default, getElementInfo, makeAble, makeMoveable };
