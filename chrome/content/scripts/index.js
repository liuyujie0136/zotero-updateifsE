"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __decorateClass = (decorators, target, key, kind) => {
    var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
    for (var i = decorators.length - 1, decorator; i >= 0; i--)
      if (decorator = decorators[i])
        result = (kind ? decorator(target, key, result) : decorator(result)) || result;
    if (kind && result)
      __defProp(target, key, result);
    return result;
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // node_modules/zotero-plugin-toolkit/dist/utils/debugBridge.js
  var require_debugBridge = __commonJS({
    "node_modules/zotero-plugin-toolkit/dist/utils/debugBridge.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.DebugBridge = void 0;
      var basic_1 = require_basic();
      var toolkitGlobal_1 = __importDefault(require_toolkitGlobal());
      var DebugBridge = class {
        get version() {
          return DebugBridge.version;
        }
        get disableDebugBridgePassword() {
          return this._disableDebugBridgePassword;
        }
        set disableDebugBridgePassword(value) {
          this._disableDebugBridgePassword = value;
        }
        get password() {
          return basic_1.BasicTool.getZotero().Prefs.get(DebugBridge.passwordPref, true);
        }
        set password(v) {
          basic_1.BasicTool.getZotero().Prefs.set(DebugBridge.passwordPref, v, true);
        }
        constructor() {
          this._disableDebugBridgePassword = false;
          this.initializeDebugBridge();
        }
        static setModule(instance) {
          var _a;
          if (!((_a = instance.debugBridge) === null || _a === void 0 ? void 0 : _a.version) || instance.debugBridge.version < DebugBridge.version) {
            instance.debugBridge = new DebugBridge();
          }
        }
        initializeDebugBridge() {
          const debugBridgeExtension = {
            noContent: true,
            doAction: async (uri) => {
              var _a;
              const Zotero2 = basic_1.BasicTool.getZotero();
              const uriString = uri.spec.split("//").pop();
              if (!uriString) {
                return;
              }
              const params = {};
              (_a = uriString.split("?").pop()) === null || _a === void 0 ? void 0 : _a.split("&").forEach((p) => {
                params[p.split("=")[0]] = p.split("=")[1];
              });
              if (toolkitGlobal_1.default.getInstance().debugBridge.disableDebugBridgePassword || params.password === this.password) {
                if (params.run) {
                  try {
                    const AsyncFunction = Object.getPrototypeOf(async function() {
                    }).constructor;
                    const f = new AsyncFunction("Zotero,window", decodeURIComponent(params.run));
                    await f(Zotero2, Zotero2.getMainWindow());
                  } catch (e) {
                    Zotero2.debug(e);
                    Zotero2.getMainWindow().console.log(e);
                  }
                }
                if (params.file) {
                  try {
                    Services.scriptloader.loadSubScript(decodeURIComponent(params.file), { Zotero: Zotero2, window: Zotero2.getMainWindow() });
                  } catch (e) {
                    Zotero2.debug(e);
                    Zotero2.getMainWindow().console.log(e);
                  }
                }
              }
            },
            newChannel: function(uri) {
              this.doAction(uri);
            }
          };
          Services.io.getProtocolHandler("zotero").wrappedJSObject._extensions["zotero://ztoolkit-debug"] = debugBridgeExtension;
        }
      };
      exports.DebugBridge = DebugBridge;
      DebugBridge.version = 1;
      DebugBridge.passwordPref = "extensions.zotero.debug-bridge.password";
    }
  });

  // node_modules/zotero-plugin-toolkit/dist/managers/toolkitGlobal.js
  var require_toolkitGlobal = __commonJS({
    "node_modules/zotero-plugin-toolkit/dist/managers/toolkitGlobal.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ToolkitGlobal = void 0;
      var basic_1 = require_basic();
      var debugBridge_1 = require_debugBridge();
      var ToolkitGlobal = class {
        constructor() {
          initializeModules(this);
        }
        /**
         * Get the global unique instance of `class ToolkitGlobal`.
         * @returns An instance of `ToolkitGlobal`.
         */
        static getInstance() {
          const Zotero2 = basic_1.BasicTool.getZotero();
          if (!("_toolkitGlobal" in Zotero2)) {
            Zotero2._toolkitGlobal = new ToolkitGlobal();
          } else {
            initializeModules(Zotero2._toolkitGlobal);
          }
          return Zotero2._toolkitGlobal;
        }
      };
      exports.ToolkitGlobal = ToolkitGlobal;
      function initializeModules(instance) {
        setModule(instance, "fieldHooks", {
          _ready: false,
          getFieldHooks: {},
          setFieldHooks: {},
          isFieldOfBaseHooks: {}
        });
        setModule(instance, "itemTree", {
          _ready: false,
          columns: [],
          renderCellHooks: {}
        });
        setModule(instance, "itemBox", {
          _ready: false,
          fieldOptions: {}
        });
        setModule(instance, "shortcut", {
          _ready: false,
          eventKeys: []
        });
        setModule(instance, "prompt", {
          _ready: false,
          instance: void 0
        });
        setModule(instance, "readerInstance", {
          _ready: false,
          initializedHooks: {}
        });
        debugBridge_1.DebugBridge.setModule(instance);
      }
      function setModule(instance, key, module2) {
        var _a;
        var _b;
        if (!module2) {
          return;
        }
        if (!instance[key]) {
          instance[key] = module2;
        }
        for (const moduleKey in module2) {
          (_a = (_b = instance[key])[moduleKey]) !== null && _a !== void 0 ? _a : _b[moduleKey] = module2[moduleKey];
        }
      }
      exports.default = ToolkitGlobal;
    }
  });

  // node_modules/zotero-plugin-toolkit/dist/basic.js
  var require_basic = __commonJS({
    "node_modules/zotero-plugin-toolkit/dist/basic.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.unregister = exports.ManagerTool = exports.BasicTool = void 0;
      var toolkitGlobal_1 = __importDefault(require_toolkitGlobal());
      var BasicTool3 = class {
        get basicOptions() {
          return this._basicOptions;
        }
        /**
         *
         * @param basicTool Pass an BasicTool instance to copy its options.
         */
        constructor(data) {
          this.patchSign = "zotero-plugin-toolkit@2.0.0";
          this._basicOptions = {
            log: {
              _type: "toolkitlog",
              disableConsole: false,
              disableZLog: false,
              prefix: ""
            },
            debug: toolkitGlobal_1.default.getInstance().debugBridge
          };
          this.updateOptions(data);
          return;
        }
        getGlobal(k) {
          const _Zotero = typeof Zotero !== "undefined" ? Zotero : Components.classes["@zotero.org/Zotero;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
          const window2 = _Zotero.getMainWindow();
          switch (k) {
            case "Zotero":
            case "zotero":
              return _Zotero;
            case "window":
              return window2;
            case "document":
              return window2.document;
            case "ZoteroPane":
            case "ZoteroPane_Local":
              return _Zotero.getActiveZoteroPane();
            default:
              return window2[k];
          }
        }
        /**
         * Check if it's running on Zotero 7 (Firefox 102)
         */
        isZotero7() {
          return Zotero.platformMajorVersion >= 102;
        }
        /**
         * Get DOMParser.
         *
         * For Zotero 6: mainWindow.DOMParser or nsIDOMParser
         *
         * For Zotero 7: Firefox 102 support DOMParser natively
         */
        getDOMParser() {
          if (this.isZotero7()) {
            return new (this.getGlobal("DOMParser"))();
          }
          try {
            return new (this.getGlobal("DOMParser"))();
          } catch (e) {
            return Components.classes["@mozilla.org/xmlextras/domparser;1"].createInstance(Components.interfaces.nsIDOMParser);
          }
        }
        /**
         * If it's an XUL element
         * @param elem
         */
        isXULElement(elem) {
          return elem.namespaceURI === "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
        }
        /**
         * Create an XUL element
         *
         * For Zotero 6, use `createElementNS`;
         *
         * For Zotero 7+, use `createXULElement`.
         * @param doc
         * @param type
         * @example
         * Create a `<menuitem>`:
         * ```ts
         * const compat = new ZoteroCompat();
         * const doc = compat.getWindow().document;
         * const elem = compat.createXULElement(doc, "menuitem");
         * ```
         */
        createXULElement(doc, type) {
          if (this.isZotero7()) {
            return doc.createXULElement(type);
          } else {
            return doc.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", type);
          }
        }
        /**
         * Output to both Zotero.debug and console.log
         * @param data e.g. string, number, object, ...
         */
        log(...data) {
          var _a;
          if (data.length === 0) {
            return;
          }
          const Zotero2 = this.getGlobal("Zotero");
          const console = this.getGlobal("console");
          let options;
          if (((_a = data[data.length - 1]) === null || _a === void 0 ? void 0 : _a._type) === "toolkitlog") {
            options = data.pop();
          } else {
            options = this._basicOptions.log;
          }
          try {
            if (options.prefix) {
              data.splice(0, 0, options.prefix);
            }
            if (!options.disableConsole) {
              console.groupCollapsed(...data);
              console.trace();
              console.groupEnd();
            }
            if (!options.disableZLog) {
              Zotero2.debug(data.map((d) => {
                try {
                  return typeof d === "object" ? JSON.stringify(d) : String(d);
                } catch (e) {
                  Zotero2.debug(d);
                  return "";
                }
              }).join("\n"));
            }
          } catch (e) {
            console.error(e);
            Zotero2.logError(e);
          }
        }
        /**
         * Patch a function
         * @param object The owner of the function
         * @param funcSign The signature of the function(function name)
         * @param ownerSign The signature of patch owner to avoid patching again
         * @param patcher The new wrapper of the patched funcion
         */
        patch(object, funcSign, ownerSign, patcher) {
          if (object[funcSign][ownerSign]) {
            throw new Error(`${String(funcSign)} re-patched`);
          }
          this.log("patching", funcSign, `by ${ownerSign}`);
          object[funcSign] = patcher(object[funcSign]);
          object[funcSign][ownerSign] = true;
        }
        updateOptions(source) {
          if (!source) {
            return;
          }
          if (source instanceof BasicTool3) {
            this._basicOptions = source._basicOptions;
          } else {
            this._basicOptions = source;
          }
        }
        static getZotero() {
          return typeof Zotero !== "undefined" ? Zotero : Components.classes["@zotero.org/Zotero;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
        }
      };
      exports.BasicTool = BasicTool3;
      var ManagerTool = class extends BasicTool3 {
      };
      exports.ManagerTool = ManagerTool;
      function unregister2(tools) {
        Object.values(tools).forEach((tool) => {
          if (tool instanceof ManagerTool || typeof tool.unregisterAll === "function") {
            tool.unregisterAll();
          }
        });
      }
      exports.unregister = unregister2;
    }
  });

  // node_modules/zotero-plugin-toolkit/dist/tools/ui.js
  var require_ui = __commonJS({
    "node_modules/zotero-plugin-toolkit/dist/tools/ui.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.UITool = void 0;
      var basic_1 = require_basic();
      var UITool2 = class extends basic_1.BasicTool {
        get basicOptions() {
          return this._basicOptions;
        }
        constructor(base) {
          super(base);
          this.elementCache = [];
          if (!this._basicOptions.ui) {
            this._basicOptions.ui = {
              enableElementRecord: true,
              enableElementJSONLog: false,
              enableElementDOMLog: true
            };
          }
        }
        /**
         * Remove all elements created by `createElement`.
         *
         * @remarks
         * > What is this for?
         *
         * In bootstrap plugins, elements must be manually maintained and removed on exiting.
         *
         * This API does this for you.
         */
        unregisterAll() {
          this.elementCache.forEach((e) => {
            try {
              e === null || e === void 0 ? void 0 : e.remove();
            } catch (e2) {
              this.log(e2);
            }
          });
        }
        createElement(...args) {
          var _a, _b, _c;
          const doc = args[0];
          const tagName = args[1].toLowerCase();
          let props = args[2] || {};
          if (!tagName) {
            return;
          }
          if (typeof args[2] === "string") {
            props = {
              namespace: args[2],
              enableElementRecord: args[3]
            };
          }
          if (typeof props.enableElementJSONLog !== "undefined" && props.enableElementJSONLog || this.basicOptions.ui.enableElementJSONLog) {
            this.log(props);
          }
          props.properties = props.properties || props.directAttributes;
          props.children = props.children || props.subElementOptions;
          let elem;
          if (tagName === "fragment") {
            const fragElem = doc.createDocumentFragment();
            elem = fragElem;
          } else {
            let realElem = props.id && (props.checkExistenceParent ? props.checkExistenceParent : doc).querySelector(`#${props.id}`);
            if (realElem && props.ignoreIfExists) {
              return realElem;
            }
            if (realElem && props.removeIfExists) {
              realElem.remove();
              realElem = void 0;
            }
            if (props.customCheck && !props.customCheck(doc, props)) {
              return void 0;
            }
            if (!realElem || !props.skipIfExists) {
              let namespace = props.namespace;
              if (!namespace) {
                const mightHTML = HTMLElementTagNames.includes(tagName);
                const mightXUL = XULElementTagNames.includes(tagName);
                const mightSVG = SVGElementTagNames.includes(tagName);
                if (Number(mightHTML) + Number(mightXUL) + Number(mightSVG) > 1) {
                  this.log(`[Warning] Creating element ${tagName} with no namespace specified. Found multiply namespace matches.`);
                }
                if (mightHTML) {
                  namespace = "html";
                } else if (mightXUL) {
                  namespace = "xul";
                } else if (mightSVG) {
                  namespace = "svg";
                } else {
                  namespace = "html";
                }
              }
              if (namespace === "xul") {
                realElem = this.createXULElement(doc, tagName);
              } else {
                realElem = doc.createElementNS({
                  html: "http://www.w3.org/1999/xhtml",
                  svg: "http://www.w3.org/2000/svg"
                }[namespace], tagName);
              }
              this.elementCache.push(realElem);
            }
            if (props.id) {
              realElem.id = props.id;
            }
            if (props.styles && Object.keys(props.styles).length) {
              Object.keys(props.styles).forEach((k) => {
                const v = props.styles[k];
                typeof v !== "undefined" && (realElem.style[k] = v);
              });
            }
            if (props.properties && Object.keys(props.properties).length) {
              Object.keys(props.properties).forEach((k) => {
                const v = props.properties[k];
                typeof v !== "undefined" && (realElem[k] = v);
              });
            }
            if (props.attributes && Object.keys(props.attributes).length) {
              Object.keys(props.attributes).forEach((k) => {
                const v = props.attributes[k];
                typeof v !== "undefined" && realElem.setAttribute(k, String(v));
              });
            }
            if ((_a = props.classList) === null || _a === void 0 ? void 0 : _a.length) {
              realElem.classList.add(...props.classList);
            }
            if ((_b = props.listeners) === null || _b === void 0 ? void 0 : _b.length) {
              props.listeners.forEach(({ type, listener, options }) => {
                listener && realElem.addEventListener(type, listener, options);
              });
            }
            elem = realElem;
          }
          if ((_c = props.children) === null || _c === void 0 ? void 0 : _c.length) {
            const subElements = props.children.map((childProps) => {
              childProps.namespace = childProps.namespace || props.namespace;
              return this.createElement(doc, childProps.tag, childProps);
            }).filter((e) => e);
            elem.append(...subElements);
          }
          if (typeof props.enableElementDOMLog !== "undefined" && props.enableElementDOMLog || this.basicOptions.ui.enableElementDOMLog) {
            this.log(elem);
          }
          return elem;
        }
        /**
         * Append element(s) to a node.
         * @param properties See {@link ElementProps}
         * @param container The parent node to append to.
         * @returns A Node that is the appended child (aChild),
         *          except when aChild is a DocumentFragment,
         *          in which case the empty DocumentFragment is returned.
         */
        appendElement(properties, container) {
          return container.appendChild(this.createElement(container.ownerDocument, properties.tag, properties));
        }
        /**
         * Inserts a node before a reference node as a child of its parent node.
         * @param properties See {@link ElementProps}
         * @param referenceNode The node before which newNode is inserted.
         * @returns
         */
        insertElementBefore(properties, referenceNode) {
          if (referenceNode.parentNode)
            return referenceNode.parentNode.insertBefore(this.createElement(referenceNode.ownerDocument, properties.tag, properties), referenceNode);
          else
            this.log(referenceNode.tagName + " has no parent, cannot insert " + properties.tag);
        }
        /**
         * Replace oldNode with a new one.
         * @param properties See {@link ElementProps}
         * @param oldNode The child to be replaced.
         * @returns The replaced Node. This is the same node as oldChild.
         */
        replaceElement(properties, oldNode) {
          if (oldNode.parentNode)
            return oldNode.parentNode.replaceChild(this.createElement(oldNode.ownerDocument, properties.tag, properties), oldNode);
          else
            this.log(oldNode.tagName + " has no parent, cannot replace it with " + properties.tag);
        }
        /**
         * Parse XHTML to XUL fragment. For Zotero 6.
         *
         * To load preferences from a Zotero 7's `.xhtml`, use this method to parse it.
         * @param str xhtml raw text
         * @param entities dtd file list ("chrome://xxx.dtd")
         * @param defaultXUL true for default XUL namespace
         */
        parseXHTMLToFragment(str, entities = [], defaultXUL = true) {
          let parser = this.getDOMParser();
          const xulns = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
          const htmlns = "http://www.w3.org/1999/xhtml";
          const wrappedStr = `${entities.length ? `<!DOCTYPE bindings [ ${entities.reduce((preamble, url, index) => {
            return preamble + `<!ENTITY % _dtd-${index} SYSTEM "${url}"> %_dtd-${index}; `;
          }, "")}]>` : ""}
      <html:div xmlns="${defaultXUL ? xulns : htmlns}"
          xmlns:xul="${xulns}" xmlns:html="${htmlns}">
      ${str}
      </html:div>`;
          this.log(wrappedStr, parser);
          let doc = parser.parseFromString(wrappedStr, "text/xml");
          this.log(doc);
          if (doc.documentElement.localName === "parsererror") {
            throw new Error("not well-formed XHTML");
          }
          let range = doc.createRange();
          range.selectNodeContents(doc.querySelector("div"));
          return range.extractContents();
        }
      };
      exports.UITool = UITool2;
      var HTMLElementTagNames = [
        "a",
        "abbr",
        "address",
        "area",
        "article",
        "aside",
        "audio",
        "b",
        "base",
        "bdi",
        "bdo",
        "blockquote",
        "body",
        "br",
        "button",
        "canvas",
        "caption",
        "cite",
        "code",
        "col",
        "colgroup",
        "data",
        "datalist",
        "dd",
        "del",
        "details",
        "dfn",
        "dialog",
        "div",
        "dl",
        "dt",
        "em",
        "embed",
        "fieldset",
        "figcaption",
        "figure",
        "footer",
        "form",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "head",
        "header",
        "hgroup",
        "hr",
        "html",
        "i",
        "iframe",
        "img",
        "input",
        "ins",
        "kbd",
        "label",
        "legend",
        "li",
        "link",
        "main",
        "map",
        "mark",
        "menu",
        "meta",
        "meter",
        "nav",
        "noscript",
        "object",
        "ol",
        "optgroup",
        "option",
        "output",
        "p",
        "picture",
        "pre",
        "progress",
        "q",
        "rp",
        "rt",
        "ruby",
        "s",
        "samp",
        "script",
        "section",
        "select",
        "slot",
        "small",
        "source",
        "span",
        "strong",
        "style",
        "sub",
        "summary",
        "sup",
        "table",
        "tbody",
        "td",
        "template",
        "textarea",
        "tfoot",
        "th",
        "thead",
        "time",
        "title",
        "tr",
        "track",
        "u",
        "ul",
        "var",
        "video",
        "wbr"
      ];
      var XULElementTagNames = [
        "action",
        "arrowscrollbox",
        "bbox",
        "binding",
        "bindings",
        "box",
        "broadcaster",
        "broadcasterset",
        "button",
        "browser",
        "checkbox",
        "caption",
        "colorpicker",
        "column",
        "columns",
        "commandset",
        "command",
        "conditions",
        "content",
        "deck",
        "description",
        "dialog",
        "dialogheader",
        "editor",
        "grid",
        "grippy",
        "groupbox",
        "hbox",
        "iframe",
        "image",
        "key",
        "keyset",
        "label",
        "listbox",
        "listcell",
        "listcol",
        "listcols",
        "listhead",
        "listheader",
        "listitem",
        "member",
        "menu",
        "menubar",
        "menuitem",
        "menulist",
        "menupopup",
        "menuseparator",
        "observes",
        "overlay",
        "page",
        "popup",
        "popupset",
        "preference",
        "preferences",
        "prefpane",
        "prefwindow",
        "progressmeter",
        "radio",
        "radiogroup",
        "resizer",
        "richlistbox",
        "richlistitem",
        "row",
        "rows",
        "rule",
        "script",
        "scrollbar",
        "scrollbox",
        "scrollcorner",
        "separator",
        "spacer",
        "splitter",
        "stack",
        "statusbar",
        "statusbarpanel",
        "stringbundle",
        "stringbundleset",
        "tab",
        "tabbrowser",
        "tabbox",
        "tabpanel",
        "tabpanels",
        "tabs",
        "template",
        "textnode",
        "textbox",
        "titlebar",
        "toolbar",
        "toolbarbutton",
        "toolbargrippy",
        "toolbaritem",
        "toolbarpalette",
        "toolbarseparator",
        "toolbarset",
        "toolbarspacer",
        "toolbarspring",
        "toolbox",
        "tooltip",
        "tree",
        "treecell",
        "treechildren",
        "treecol",
        "treecols",
        "treeitem",
        "treerow",
        "treeseparator",
        "triple",
        "vbox",
        "window",
        "wizard",
        "wizardpage"
      ];
      var SVGElementTagNames = [
        "a",
        "animate",
        "animateMotion",
        "animateTransform",
        "circle",
        "clipPath",
        "defs",
        "desc",
        "ellipse",
        "feBlend",
        "feColorMatrix",
        "feComponentTransfer",
        "feComposite",
        "feConvolveMatrix",
        "feDiffuseLighting",
        "feDisplacementMap",
        "feDistantLight",
        "feDropShadow",
        "feFlood",
        "feFuncA",
        "feFuncB",
        "feFuncG",
        "feFuncR",
        "feGaussianBlur",
        "feImage",
        "feMerge",
        "feMergeNode",
        "feMorphology",
        "feOffset",
        "fePointLight",
        "feSpecularLighting",
        "feSpotLight",
        "feTile",
        "feTurbulence",
        "filter",
        "foreignObject",
        "g",
        "image",
        "line",
        "linearGradient",
        "marker",
        "mask",
        "metadata",
        "mpath",
        "path",
        "pattern",
        "polygon",
        "polyline",
        "radialGradient",
        "rect",
        "script",
        "set",
        "stop",
        "style",
        "svg",
        "switch",
        "symbol",
        "text",
        "textPath",
        "title",
        "tspan",
        "use",
        "view"
      ];
    }
  });

  // node_modules/zotero-plugin-toolkit/dist/tools/reader.js
  var require_reader = __commonJS({
    "node_modules/zotero-plugin-toolkit/dist/tools/reader.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ReaderTool = void 0;
      var basic_1 = require_basic();
      var ReaderTool = class extends basic_1.BasicTool {
        /**
         * Get the selected tab reader.
         * @param waitTime Wait for n MS until the reader is ready
         */
        async getReader(waitTime = 5e3) {
          const Zotero_Tabs = this.getGlobal("Zotero_Tabs");
          if (Zotero_Tabs.selectedType !== "reader") {
            return void 0;
          }
          let reader = Zotero.Reader.getByTabID(Zotero_Tabs.selectedID);
          let delayCount = 0;
          const checkPeriod = 50;
          while (!reader && delayCount * checkPeriod < waitTime) {
            await Zotero.Promise.delay(checkPeriod);
            reader = Zotero.Reader.getByTabID(Zotero_Tabs.selectedID);
            delayCount++;
          }
          await (reader === null || reader === void 0 ? void 0 : reader._initPromise);
          return reader;
        }
        /**
         * Get all window readers.
         */
        getWindowReader() {
          const Zotero_Tabs = this.getGlobal("Zotero_Tabs");
          let windowReaders = [];
          let tabs = Zotero_Tabs._tabs.map((e) => e.id);
          for (let i = 0; i < Zotero.Reader._readers.length; i++) {
            let flag = false;
            for (let j = 0; j < tabs.length; j++) {
              if (Zotero.Reader._readers[i].tabID == tabs[j]) {
                flag = true;
                break;
              }
            }
            if (!flag) {
              windowReaders.push(Zotero.Reader._readers[i]);
            }
          }
          return windowReaders;
        }
        /**
         * Get Reader tabpanel deck element.
         * @alpha
         */
        getReaderTabPanelDeck() {
          var _a;
          const deck = (_a = this.getGlobal("window").document.querySelector(".notes-pane-deck")) === null || _a === void 0 ? void 0 : _a.previousElementSibling;
          return deck;
        }
        /**
         * Add a reader tabpanel deck selection change observer.
         * @alpha
         * @param callback
         */
        addReaderTabPanelDeckObserver(callback) {
          const deck = this.getReaderTabPanelDeck();
          const observer = new (this.getGlobal("MutationObserver"))(async (mutations) => {
            mutations.forEach(async (mutation) => {
              const target = mutation.target;
              if (target.classList.contains("zotero-view-tabbox") || target.tagName === "deck") {
                callback();
              }
            });
          });
          observer.observe(deck, {
            attributes: true,
            attributeFilter: ["selectedIndex"],
            subtree: true
          });
          return observer;
        }
        /**
         * Get the text selection of reader.
         * @param currentReader Target reader
         */
        getSelectedText(currentReader) {
          var _a;
          if (!currentReader) {
            return "";
          }
          let textArea = (_a = currentReader._iframeWindow) === null || _a === void 0 ? void 0 : _a.document.querySelectorAll("textarea");
          if (!textArea) {
            return "";
          }
          for (let i = 0; i < textArea.length; i++) {
            if (textArea[i].style.zIndex === "-1" && textArea[i].style["width"] === "0px") {
              return textArea[i].value.replace(/(^\s*)|(\s*$)/g, "");
            }
          }
          return "";
        }
      };
      exports.ReaderTool = ReaderTool;
    }
  });

  // node_modules/zotero-plugin-toolkit/dist/tools/extraField.js
  var require_extraField = __commonJS({
    "node_modules/zotero-plugin-toolkit/dist/tools/extraField.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ExtraFieldTool = void 0;
      var basic_1 = require_basic();
      var ExtraFieldTool = class extends basic_1.BasicTool {
        /**
         * Get all extra fields
         * @param item
         */
        getExtraFields(item, backend = "custom") {
          const extraFiledRaw = item.getField("extra");
          if (backend === "default") {
            return this.getGlobal("Zotero").Utilities.Internal.extractExtraFields(extraFiledRaw).fields;
          } else {
            const map = /* @__PURE__ */ new Map();
            const nonStandardFields = [];
            extraFiledRaw.split("\n").forEach((line) => {
              const split = line.split(": ");
              if (split.length >= 2 && split[0]) {
                map.set(split[0], split.slice(1).join(": "));
              } else {
                nonStandardFields.push(line);
              }
            });
            map.set("__nonStandard__", nonStandardFields.join("\n"));
            return map;
          }
        }
        /**
         * Get extra field value by key. If it does not exists, return undefined.
         * @param item
         * @param key
         */
        getExtraField(item, key) {
          const fields = this.getExtraFields(item);
          return fields.get(key);
        }
        /**
         * Replace extra field of an item.
         * @param item
         * @param fields
         */
        async replaceExtraFields(item, fields) {
          let kvs = [];
          if (fields.has("__nonStandard__")) {
            kvs.push(fields.get("__nonStandard__"));
            fields.delete("__nonStandard__");
          }
          fields.forEach((v, k) => {
            kvs.push(`${k}: ${v}`);
          });
          item.setField("extra", kvs.join("\n"));
          await item.saveTx();
        }
        /**
         * Set an key-value pair to the item's extra field
         * @param item
         * @param key
         * @param value
         */
        async setExtraField(item, key, value) {
          const fields = this.getExtraFields(item);
          fields.set(key, value);
          await this.replaceExtraFields(item, fields);
        }
      };
      exports.ExtraFieldTool = ExtraFieldTool;
    }
  });

  // node_modules/zotero-plugin-toolkit/dist/managers/fieldHook.js
  var require_fieldHook = __commonJS({
    "node_modules/zotero-plugin-toolkit/dist/managers/fieldHook.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.FieldHookManager = void 0;
      var basic_1 = require_basic();
      var toolkitGlobal_1 = __importDefault(require_toolkitGlobal());
      var FieldHookManager = class extends basic_1.ManagerTool {
        constructor(base) {
          super(base);
          this.localCache = [];
          this.initializeGlobal();
        }
        register(type, field, hook) {
          let hooks = this.getHooksFactory(type);
          if (!hooks) {
            return;
          }
          if (field in hooks) {
            this.log(`[WARNING] ${type}.${field} overwrites an existing hook.`);
          }
          hooks[field] = hook;
          this.localCache.push({ type, field });
        }
        unregister(type, field) {
          let hooks = this.getHooksFactory(type);
          if (hooks) {
            delete hooks[field];
          }
          const idx = this.localCache.findIndex(({ type: cacheType }) => cacheType === type);
          if (idx > -1) {
            this.localCache.splice(idx, 1);
          }
        }
        unregisterAll() {
          [...this.localCache].forEach((cache) => {
            this.unregister(cache.type, cache.field);
          });
        }
        getHooksFactory(type) {
          switch (type) {
            case "getField":
              const globalItemTree = toolkitGlobal_1.default.getInstance().itemTree;
              const deprecatedHooks = globalItemTree.fieldHooks;
              if (deprecatedHooks && deprecatedHooks !== this.globalCache.getFieldHooks) {
                Object.assign(this.globalCache.getFieldHooks, deprecatedHooks);
                globalItemTree.fieldHooks = this.globalCache.getFieldHooks;
              }
              return this.globalCache.getFieldHooks;
              break;
            case "setField":
              return this.globalCache.setFieldHooks;
              break;
            case "isFieldOfBase":
              return this.globalCache.isFieldOfBaseHooks;
              break;
            default:
              break;
          }
        }
        initializeGlobal() {
          const Zotero2 = this.getGlobal("Zotero");
          const globalCache = this.globalCache = toolkitGlobal_1.default.getInstance().fieldHooks;
          if (!this.globalCache._ready) {
            this.globalCache._ready = true;
            this.patch(Zotero2.Item.prototype, "getField", this.patchSign, (original) => function(field, unformatted, includeBaseMapped) {
              const originalThis = this;
              if (Object.keys(globalCache.getFieldHooks).includes(field)) {
                try {
                  const hook = globalCache.getFieldHooks[field];
                  return hook(field, unformatted, includeBaseMapped, originalThis, original.bind(originalThis));
                } catch (e) {
                  return field + String(e);
                }
              }
              return original.apply(originalThis, arguments);
            });
            this.patch(Zotero2.Item.prototype, "setField", this.patchSign, (original) => function(field, value, loadIn) {
              const originalThis = this;
              if (Object.keys(globalCache.setFieldHooks).includes(field)) {
                try {
                  const hook = globalCache.setFieldHooks[field];
                  return hook(field, value, loadIn, originalThis, original.bind(originalThis));
                } catch (e) {
                  return field + String(e);
                }
              }
              return original.apply(originalThis, arguments);
            });
            this.patch(Zotero2.ItemFields, "isFieldOfBase", this.patchSign, (original) => function(field, baseField) {
              const originalThis = this;
              if (Object.keys(globalCache.isFieldOfBaseHooks).includes(field)) {
                try {
                  const hook = globalCache.isFieldOfBaseHooks[field];
                  return hook(field, baseField, original.bind(originalThis));
                } catch (e) {
                  return false;
                }
              }
              return original.apply(originalThis, arguments);
            });
          }
        }
      };
      exports.FieldHookManager = FieldHookManager;
    }
  });

  // node_modules/zotero-plugin-toolkit/dist/managers/itemTree.js
  var require_itemTree = __commonJS({
    "node_modules/zotero-plugin-toolkit/dist/managers/itemTree.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ItemTreeManager = void 0;
      var basic_1 = require_basic();
      var fieldHook_1 = require_fieldHook();
      var toolkitGlobal_1 = __importDefault(require_toolkitGlobal());
      var ItemTreeManager = class extends basic_1.ManagerTool {
        /**
         * Initialize Zotero._ItemTreeExtraColumnsGlobal if it doesn't exist.
         *
         * New columns and hooks are stored there.
         *
         * Then patch `require("zotero/itemTree").getColumns` and `Zotero.Item.getField`
         */
        constructor(base) {
          super(base);
          this.localColumnCache = [];
          this.localRenderCellCache = [];
          this.fieldHooks = new fieldHook_1.FieldHookManager(base);
          this.initializationLock = this.getGlobal("Zotero").Promise.defer();
          this.initializeGlobal();
        }
        unregisterAll() {
          [...this.localColumnCache].forEach((key) => this.unregister(key, { skipGetField: true }));
          [...this.localRenderCellCache].forEach(this.removeRenderCellHook.bind(this));
          this.fieldHooks.unregisterAll();
        }
        /**
         * Register a new column. Don't forget to call `unregister` on plugin exit.
         * @param key Column dataKey
         * @param label Column display label
         * @param getFieldHook Called when loading cell content.
         * If you registered the getField hook somewhere else (in ItemBox or FieldHooks), leave it undefined.
         * @param options See zotero source code:chrome/content/zotero/itemTreeColumns.jsx
         * @param options.renderCellHook Called when rendering cell. This will override
         *
         * @example
         * ```ts
         * const itemTree = new ItemTreeTool();
         * await itemTree.register(
         *   "test",
         *   "new column",
         *   (
         *     field: string,
         *     unformatted: boolean,
         *     includeBaseMapped: boolean,
         *     item: Zotero.Item
         *   ) => {
         *     return field + String(item.id);
         *   },
         *   {
         *     iconPath: "chrome://zotero/skin/cross.png",
         *   }
         * );
         * ```
         */
        async register(key, label, getFieldHook, options = {}) {
          await this.initializationLock.promise;
          if (this.globalCache.columns.map((_c) => _c.dataKey).includes(key)) {
            this.log(`ItemTreeTool: ${key} is already registered.`);
            return;
          }
          const column = {
            dataKey: key,
            label,
            iconLabel: options.iconPath ? this.createIconLabel({
              iconPath: options.iconPath,
              name: label
            }) : void 0,
            zoteroPersist: options.zoteroPersist || /* @__PURE__ */ new Set(["width", "ordinal", "hidden", "sortActive", "sortDirection"]),
            defaultIn: options.defaultIn,
            disabledIn: options.disabledIn,
            defaultSort: options.defaultSort,
            flex: typeof options.flex === "undefined" ? 1 : options.flex,
            width: options.width,
            fixedWidth: options.fixedWidth,
            staticWidth: options.staticWidth,
            minWidth: options.minWidth,
            ignoreInColumnPicker: options.ignoreInColumnPicker,
            submenu: options.submenu
          };
          if (getFieldHook) {
            this.fieldHooks.register("getField", key, getFieldHook);
          }
          if (options.renderCellHook) {
            await this.addRenderCellHook(key, options.renderCellHook);
          }
          this.globalCache.columns.push(column);
          this.localColumnCache.push(column.dataKey);
          await this.refresh();
        }
        /**
         * Unregister an extra column. Call it on plugin exit.
         * @param key Column dataKey, should be same as the one used in `register`
         * @param options.skipGetField skip unregister of getField hook.
         * This is useful when the hook is not initialized by this instance
         */
        async unregister(key, options = {}) {
          const Zotero2 = this.getGlobal("Zotero");
          await this.initializationLock.promise;
          let persisted = Zotero2.Prefs.get("pane.persist");
          const persistedJSON = JSON.parse(persisted);
          delete persistedJSON[key];
          Zotero2.Prefs.set("pane.persist", JSON.stringify(persistedJSON));
          const idx = this.globalCache.columns.map((_c) => _c.dataKey).indexOf(key);
          if (idx >= 0) {
            this.globalCache.columns.splice(idx, 1);
          }
          if (!options.skipGetField) {
            this.fieldHooks.unregister("getField", key);
          }
          this.removeRenderCellHook(key);
          await this.refresh();
          const localKeyIdx = this.localColumnCache.indexOf(key);
          if (localKeyIdx >= 0) {
            this.localColumnCache.splice(localKeyIdx, 1);
          }
        }
        /**
         * Add a patch hook for `_renderCell`, which is called when cell is rendered.
         *
         * This also works for Zotero's built-in cells.
         * @remarks
         * Don't call it manually unless you understand what you are doing.
         * @param dataKey Cell `dataKey`, e.g. 'title'
         * @param renderCellHook patch hook
         */
        async addRenderCellHook(dataKey, renderCellHook) {
          await this.initializationLock.promise;
          if (dataKey in this.globalCache.renderCellHooks) {
            this.log("[WARNING] ItemTreeTool.addRenderCellHook overwrites an existing hook:", dataKey);
          }
          this.globalCache.renderCellHooks[dataKey] = renderCellHook;
          this.localRenderCellCache.push(dataKey);
        }
        /**
         * Remove a patch hook by `dataKey`.
         */
        async removeRenderCellHook(dataKey) {
          delete this.globalCache.renderCellHooks[dataKey];
          const idx = this.localRenderCellCache.indexOf(dataKey);
          if (idx >= 0) {
            this.localRenderCellCache.splice(idx, 1);
          }
          await this.refresh();
        }
        /**
         * Do initializations. Called in constructor to be async
         */
        async initializeGlobal() {
          const Zotero2 = this.getGlobal("Zotero");
          await Zotero2.uiReadyPromise;
          const window2 = this.getGlobal("window");
          const globalCache = this.globalCache = toolkitGlobal_1.default.getInstance().itemTree;
          if (!globalCache._ready) {
            globalCache._ready = true;
            const itemTree = window2.require("zotero/itemTree");
            this.patch(itemTree.prototype, "getColumns", this.patchSign, (original) => function() {
              const columns = original.apply(this, arguments);
              const insertAfter = columns.findIndex((column) => column.dataKey === "title");
              columns.splice(insertAfter + 1, 0, ...globalCache.columns);
              return columns;
            });
            this.patch(itemTree.prototype, "_renderCell", this.patchSign, (original) => function(index, data, column) {
              if (!(column.dataKey in globalCache.renderCellHooks)) {
                return original.apply(this, arguments);
              }
              const hook = globalCache.renderCellHooks[column.dataKey];
              const elem = hook(index, data, column, original.bind(this));
              if (elem.classList.contains("cell")) {
                return elem;
              }
              const span = window2.document.createElementNS("http://www.w3.org/1999/xhtml", "span");
              span.classList.add("cell", column.dataKey, `${column.dataKey}-item-tree-main-default`);
              if (column.fixedWidth) {
                span.classList.add("fixed-width");
              }
              span.appendChild(elem);
              return span;
            });
          }
          this.initializationLock.resolve();
        }
        /**
         * Create a React Icon element
         * @param props
         */
        createIconLabel(props) {
          const _React = window.require("react");
          return _React.createElement("span", null, _React.createElement("img", {
            src: props.iconPath,
            height: "10px",
            width: "9px",
            style: {
              "margin-left": "6px"
            }
          }), " ", props.name);
        }
        /**
         * Refresh itemView. You don't need to call it manually.
         */
        async refresh() {
          var _a, _b;
          await this.initializationLock.promise;
          const ZoteroPane2 = this.getGlobal("ZoteroPane");
          ZoteroPane2.itemsView._columnsId = null;
          const virtualizedTable = (_a = ZoteroPane2.itemsView.tree) === null || _a === void 0 ? void 0 : _a._columns;
          if (!virtualizedTable) {
            this.log("ItemTree is still loading. Refresh skipped.");
            return;
          }
          (_b = document.querySelector(`.${virtualizedTable._styleKey}`)) === null || _b === void 0 ? void 0 : _b.remove();
          await ZoteroPane2.itemsView.refreshAndMaintainSelection();
          ZoteroPane2.itemsView.tree._columns = new virtualizedTable.__proto__.constructor(ZoteroPane2.itemsView.tree);
          await ZoteroPane2.itemsView.refreshAndMaintainSelection();
        }
      };
      exports.ItemTreeManager = ItemTreeManager;
    }
  });

  // node_modules/zotero-plugin-toolkit/dist/managers/prompt.js
  var require_prompt = __commonJS({
    "node_modules/zotero-plugin-toolkit/dist/managers/prompt.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.PromptManager = exports.Prompt = void 0;
      var basic_1 = require_basic();
      var basic_2 = require_basic();
      var ui_1 = require_ui();
      var toolkitGlobal_1 = __importDefault(require_toolkitGlobal());
      var Prompt = class {
        /**
         * Initialize `Prompt` but do not create UI.
         */
        constructor() {
          this.lastInputText = "";
          this.defaultText = {
            placeholder: "Select a command...",
            empty: "No commands found."
          };
          this.maxLineNum = 12;
          this.maxSuggestionNum = 100;
          this.commands = [];
          this.base = new basic_1.BasicTool();
          this.ui = new ui_1.UITool();
          this.document = this.base.getGlobal("document");
          this.initializeUI();
        }
        /**
         * Initialize `Prompt` UI and then bind events on it.
         */
        initializeUI() {
          this.addStyle();
          this.createHTML();
          this.initInputEvents();
          this.registerShortcut();
        }
        createHTML() {
          this.promptNode = this.ui.createElement(this.document, "div", {
            styles: {
              display: "none"
            },
            children: [
              {
                tag: "div",
                styles: {
                  position: "fixed",
                  left: "0",
                  top: "0",
                  backgroundColor: "rgba(220, 220, 220, 0.4)",
                  width: "100%",
                  height: "100%",
                  opacity: "0.5"
                },
                listeners: [
                  {
                    type: "click",
                    listener: () => {
                      this.promptNode.style.display = "none";
                    }
                  }
                ]
              }
            ]
          });
          this.promptNode.appendChild(this.ui.createElement(this.document, "div", {
            id: `zotero-plugin-toolkit-prompt`,
            classList: ["prompt-container"],
            children: [
              {
                tag: "div",
                classList: ["input-container"],
                children: [
                  {
                    tag: "input",
                    classList: ["prompt-input"],
                    attributes: {
                      type: "text",
                      placeholder: this.defaultText.placeholder
                    }
                  },
                  {
                    tag: "div",
                    classList: ["cta"]
                  }
                ]
              },
              {
                tag: "div",
                classList: ["commands-containers"]
              },
              {
                tag: "div",
                classList: ["instructions"],
                children: [
                  {
                    tag: "div",
                    classList: ["instruction"],
                    children: [
                      {
                        tag: "span",
                        classList: ["key"],
                        properties: {
                          innerText: "\u2191\u2193"
                        }
                      },
                      {
                        tag: "span",
                        properties: {
                          innerText: "to navigate"
                        }
                      }
                    ]
                  },
                  {
                    tag: "div",
                    classList: ["instruction"],
                    children: [
                      {
                        tag: "span",
                        classList: ["key"],
                        properties: {
                          innerText: "enter"
                        }
                      },
                      {
                        tag: "span",
                        properties: {
                          innerText: "to trigger"
                        }
                      }
                    ]
                  },
                  {
                    tag: "div",
                    classList: ["instruction"],
                    children: [
                      {
                        tag: "span",
                        classList: ["key"],
                        properties: {
                          innerText: "esc"
                        }
                      },
                      {
                        tag: "span",
                        properties: {
                          innerText: "to exit"
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }));
          this.inputNode = this.promptNode.querySelector("input");
          this.document.documentElement.appendChild(this.promptNode);
        }
        /**
         * Show commands in a new `commandsContainer`
         * All other `commandsContainer` is hidden
         * @param commands Command[]
         * @param clear remove all `commandsContainer` if true
         */
        showCommands(commands, clear = false) {
          if (clear) {
            this.promptNode.querySelectorAll(".commands-container").forEach((e) => e.remove());
          }
          this.inputNode.placeholder = this.defaultText.placeholder;
          const commandsContainer = this.createCommandsContainer();
          for (let command of commands) {
            if (!command.name || command.when && !command.when()) {
              continue;
            }
            commandsContainer.appendChild(this.createCommandNode(command));
          }
        }
        /**
         * Create a `commandsContainer` div element, append to `commandsContainer` and hide others.
         * @returns commandsNode
         */
        createCommandsContainer() {
          const commandsContainer = this.ui.createElement(this.document, "div", {
            classList: ["commands-container"]
          });
          this.promptNode.querySelectorAll(".commands-container").forEach((e) => {
            e.style.display = "none";
          });
          this.promptNode.querySelector(".commands-containers").appendChild(commandsContainer);
          return commandsContainer;
        }
        /**
         * Return current displayed `commandsContainer`
         * @returns
         */
        getCommandsContainer() {
          return [...this.promptNode.querySelectorAll(".commands-container")].find((e) => {
            return e.style.display != "none";
          });
        }
        /**
         * Create a command item for `Prompt` UI.
         * @param command
         * @returns
         */
        createCommandNode(command) {
          const commandNode = this.ui.createElement(this.document, "div", {
            classList: ["command"],
            children: [
              {
                tag: "div",
                classList: ["content"],
                children: [
                  {
                    tag: "div",
                    classList: ["name"],
                    children: [
                      {
                        tag: "span",
                        properties: {
                          innerText: command.name
                        }
                      }
                    ]
                  },
                  {
                    tag: "div",
                    classList: ["aux"],
                    children: command.label ? [
                      {
                        tag: "span",
                        classList: ["label"],
                        properties: {
                          innerText: command.label
                        }
                      }
                    ] : []
                  }
                ]
              }
            ],
            listeners: [
              {
                type: "mousemove",
                listener: () => {
                  this.selectItem(commandNode);
                }
              },
              {
                type: "click",
                listener: async () => {
                  await this.execCallback(command.callback);
                }
              }
            ]
          });
          commandNode.command = command;
          return commandNode;
        }
        /**
         * Called when `enter` key is pressed.
         */
        trigger() {
          [...this.promptNode.querySelectorAll(".commands-container")].find((e) => e.style.display != "none").querySelector(".selected").click();
        }
        /**
         * Called when `escape` key is pressed.
         */
        exit() {
          this.inputNode.placeholder = this.defaultText.placeholder;
          if (this.promptNode.querySelectorAll(".commands-containers .commands-container").length >= 2) {
            this.promptNode.querySelector(".commands-container:last-child").remove();
            const commandsContainer = this.promptNode.querySelector(".commands-container:last-child");
            commandsContainer.style.display = "";
            commandsContainer.querySelectorAll(".commands").forEach((e) => e.style.display = "flex");
            this.inputNode.focus();
          } else {
            this.promptNode.style.display = "none";
          }
        }
        async execCallback(callback) {
          if (Array.isArray(callback)) {
            this.showCommands(callback);
          } else {
            await callback(this);
          }
        }
        /**
         * Match suggestions for user's entered text.
         */
        async showSuggestions(inputText) {
          var _w = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/, jw = /\s/, Ww = /[\u0F00-\u0FFF\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;
          function Yw(e2, t, n, i) {
            if (0 === e2.length)
              return 0;
            var r = 0;
            r -= Math.max(0, e2.length - 1), r -= i / 10;
            var o = e2[0][0];
            return r -= (e2[e2.length - 1][1] - o + 1 - t) / 100, r -= o / 1e3, r -= n / 1e4;
          }
          function $w(e2, t, n, i) {
            if (0 === e2.length)
              return null;
            for (var r = n.toLowerCase(), o = 0, a = 0, s = [], l = 0; l < e2.length; l++) {
              var c = e2[l], u = r.indexOf(c, a);
              if (-1 === u)
                return null;
              var h = n.charAt(u);
              if (u > 0 && !_w.test(h) && !Ww.test(h)) {
                var p = n.charAt(u - 1);
                if (h.toLowerCase() !== h && p.toLowerCase() !== p || h.toUpperCase() !== h && !_w.test(p) && !jw.test(p) && !Ww.test(p))
                  if (i) {
                    if (u !== a) {
                      a += c.length, l--;
                      continue;
                    }
                  } else
                    o += 1;
              }
              if (0 === s.length)
                s.push([u, u + c.length]);
              else {
                var d = s[s.length - 1];
                d[1] < u ? s.push([u, u + c.length]) : d[1] = u + c.length;
              }
              a = u + c.length;
            }
            return {
              matches: s,
              score: Yw(s, t.length, r.length, o)
            };
          }
          function Gw(e2) {
            for (var t = e2.toLowerCase(), n = [], i = 0, r = 0; r < t.length; r++) {
              var o = t.charAt(r);
              jw.test(o) ? (i !== r && n.push(t.substring(i, r)), i = r + 1) : (_w.test(o) || Ww.test(o)) && (i !== r && n.push(t.substring(i, r)), n.push(o), i = r + 1);
            }
            return i !== t.length && n.push(t.substring(i, t.length)), {
              query: e2,
              tokens: n,
              fuzzy: t.split("")
            };
          }
          function Xw(e2, t) {
            if ("" === e2.query)
              return {
                score: 0,
                matches: []
              };
            var n = $w(e2.tokens, e2.query, t, false);
            return n || $w(e2.fuzzy, e2.query, t, true);
          }
          var e = Gw(inputText);
          let container = this.getCommandsContainer();
          if (container.classList.contains("suggestions")) {
            this.exit();
          }
          if (inputText.trim() == "") {
            return true;
          }
          let suggestions = [];
          this.getCommandsContainer().querySelectorAll(".command").forEach((commandNode) => {
            let spanNode = commandNode.querySelector(".name span");
            let spanText = spanNode.innerText;
            let res = Xw(e, spanText);
            if (res) {
              commandNode = this.createCommandNode(commandNode.command);
              let spanHTML = "";
              let i = 0;
              for (let j = 0; j < res.matches.length; j++) {
                let [start, end] = res.matches[j];
                if (start > i) {
                  spanHTML += spanText.slice(i, start);
                }
                spanHTML += `<span class="highlight">${spanText.slice(start, end)}</span>`;
                i = end;
              }
              if (i < spanText.length) {
                spanHTML += spanText.slice(i, spanText.length);
              }
              commandNode.querySelector(".name span").innerHTML = spanHTML;
              suggestions.push({ score: res.score, commandNode });
            }
          });
          if (suggestions.length > 0) {
            suggestions.sort((a, b) => b.score - a.score).slice(this.maxSuggestionNum);
            container = this.createCommandsContainer();
            container.classList.add("suggestions");
            suggestions.forEach((suggestion) => {
              container.appendChild(suggestion.commandNode);
            });
            return true;
          } else {
            const anonymousCommand = this.commands.find((c) => !c.name && (!c.when || c.when()));
            if (anonymousCommand) {
              await this.execCallback(anonymousCommand.callback);
            } else {
              this.showTip(this.defaultText.empty);
            }
            return false;
          }
        }
        /**
         * Bind events of pressing `keydown` and `keyup` key.
         */
        initInputEvents() {
          this.promptNode.addEventListener("keydown", (event) => {
            if (["ArrowUp", "ArrowDown"].indexOf(event.key) != -1) {
              event.preventDefault();
              let selectedIndex;
              let allItems = [
                ...this.getCommandsContainer().querySelectorAll(".command")
              ].filter((e) => e.style.display != "none");
              selectedIndex = allItems.findIndex((e) => e.classList.contains("selected"));
              if (selectedIndex != -1) {
                allItems[selectedIndex].classList.remove("selected");
                selectedIndex += event.key == "ArrowUp" ? -1 : 1;
              } else {
                if (event.key == "ArrowUp") {
                  selectedIndex = allItems.length - 1;
                } else {
                  selectedIndex = 0;
                }
              }
              if (selectedIndex == -1) {
                selectedIndex = allItems.length - 1;
              } else if (selectedIndex == allItems.length) {
                selectedIndex = 0;
              }
              allItems[selectedIndex].classList.add("selected");
              let commandsContainer = this.getCommandsContainer();
              commandsContainer.scrollTo(0, commandsContainer.querySelector(".selected").offsetTop - commandsContainer.offsetHeight + 7.5);
              allItems[selectedIndex].classList.add("selected");
            }
          });
          this.promptNode.addEventListener("keyup", async (event) => {
            if (event.key == "Enter") {
              this.trigger();
            } else if (event.key == "Escape") {
              if (this.inputNode.value.length > 0) {
                this.inputNode.value = "";
              } else {
                this.exit();
              }
            } else if (["ArrowUp", "ArrowDown"].indexOf(event.key) != -1) {
              return;
            }
            const currentInputText = this.inputNode.value;
            if (currentInputText == this.lastInputText) {
              return;
            }
            this.lastInputText = currentInputText;
            window.setTimeout(async () => {
              await this.showSuggestions(currentInputText);
            });
          });
        }
        /**
         * Create a commandsContainer and display a text
         */
        showTip(text) {
          const tipNode = this.ui.createElement(this.document, "div", {
            classList: ["tip"],
            properties: {
              innerText: text
            }
          });
          let container = this.createCommandsContainer();
          container.classList.add("suggestions");
          container.appendChild(tipNode);
          return tipNode;
        }
        /**
         * Mark the selected item with class `selected`.
         * @param item HTMLDivElement
         */
        selectItem(item) {
          this.getCommandsContainer().querySelectorAll(".command").forEach((e) => e.classList.remove("selected"));
          item.classList.add("selected");
        }
        addStyle() {
          const style = this.ui.createElement(this.document, "style", {
            namespace: "html",
            id: "prompt-style"
          });
          style.innerText = `
      .prompt-container * {
        box-sizing: border-box;
      }
      .prompt-container {
        ---radius---: 10px;
        position: fixed;
        left: 25%;
        top: 10%;
        width: 50%;
        border-radius: var(---radius---);
        border: 1px solid #bdbdbd;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: white;
        font-size: 18px;
        box-shadow: 0px 1.8px 7.3px rgba(0, 0, 0, 0.071),
                    0px 6.3px 24.7px rgba(0, 0, 0, 0.112),
                    0px 30px 90px rgba(0, 0, 0, 0.2);
        font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Microsoft YaHei Light", sans-serif;
      }
      
      /* input */
      .prompt-container .input-container  {
        width: 100%;
      }
      
      .input-container input {
        width: 100%;
        height: 40px;
        padding: 24px;
        border-radius: 50%;
        border: none;
        outline: none;
        font-size: 18px;
      }
      
      .input-container .cta {
        border-bottom: 1px solid #f6f6f6;  
        margin: 5px auto;
      }
      
      /* results */
      .commands-containers {
        width: 100%;
        height: 100%;
      }
      .commands-container {
        max-height: calc(${this.maxLineNum} * 35.5px);
        width: calc(100% - 12px);
        margin-left: 12px;
        margin-right: 0%;
        overflow-y: auto;
        overflow-x: hidden;
      }
      
      .commands-container .command {
        display: flex;
        align-content: baseline;
        justify-content: space-between;
        border-radius: 5px;
        padding: 6px 12px;
        margin-right: 12px;
        margin-top: 2px;
        margin-bottom: 2px;
      }
      .commands-container .command .content {
        display: flex;
        width: 100%;
        justify-content: space-between;
        flex-direction: row;
        overflow: hidden;
      }
      .commands-container .command .content .name {
        white-space: nowrap; 
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .commands-container .command .content .aux {
        display: flex;
        align-items: center;
        align-self: center;
        flex-shrink: 0;
      }
      
      .commands-container .command .content .aux .label {
        font-size: 15px;
        color: #5a5a5a;
        padding: 2px 6px;
        background-color: #fafafa;
        border-radius: 5px;
      }
      
      .commands-container .selected {
          background-color: rgba(0, 0, 0, 0.075);
      }

      .commands-container .highlight {
        font-weight: bold;
      }

      .tip {
        color: #5a5a5a;
        text-align: center;
        padding: 12px 12px;
        font-size: 18px;
      }
      
      .current-value {
        background-color: #a7b8c1;
        color: white;
        border-radius: 5px;
        padding: 0 5px;
        margin-left: 10px;
        font-size: 14px;
        vertical-align: middle;
        letter-spacing: 0.05em;
      }

      /* instructions */
      .instructions {
        display: flex;
        align-content: center;
        justify-content: center;
        font-size: 15px;
        color: rgba(0, 0, 0, 0.4);
        height: 2.5em;
        width: 100%;
        border-top: 1px solid #f6f6f6;
        margin-top: 5px;
      }
      
      .instructions .instruction {
        margin: auto .5em;  
      }
      
      .instructions .key {
        margin-right: .2em;
        font-weight: 600;
      }
    `;
          this.document.documentElement.appendChild(style);
        }
        registerShortcut() {
          this.document.addEventListener("keydown", (event) => {
            if (event.shiftKey && event.key.toLowerCase() == "p") {
              if (event.originalTarget.isContentEditable || "value" in event.originalTarget || this.commands.length == 0) {
                return;
              }
              event.preventDefault();
              event.stopPropagation();
              if (this.promptNode.style.display == "none") {
                this.promptNode.style.display = "flex";
                if (this.promptNode.querySelectorAll(".commands-container").length == 1) {
                  this.showCommands(this.commands, true);
                }
                this.promptNode.focus();
                this.inputNode.focus();
              } else {
                this.promptNode.style.display = "none";
              }
            }
          }, true);
        }
      };
      exports.Prompt = Prompt;
      var PromptManager = class extends basic_2.ManagerTool {
        constructor(base) {
          super(base);
          this.commands = [];
          const globalCache = toolkitGlobal_1.default.getInstance().prompt;
          if (!globalCache._ready) {
            globalCache._ready = true;
            globalCache.instance = new Prompt();
          }
          this.prompt = globalCache.instance;
        }
        /**
         * Register commands. Don't forget to call `unregister` on plugin exit.
         * @param commands Command[]
         * @example
         * ```ts
         * let getReader = () => {
         *   return BasicTool.getZotero().Reader.getByTabID(
         *     (Zotero.getMainWindow().Zotero_Tabs).selectedID
         *   )
         * }
         *
         * register([
         *   {
         *     name: "Split Horizontally",
         *     label: "Zotero",
         *     when: () => getReader() as boolean,
         *     callback: (prompt: Prompt) => getReader().menuCmd("splitHorizontally")
         *   },
         *   {
         *     name: "Split Vertically",
         *     label: "Zotero",
         *     when: () => getReader() as boolean,
         *     callback: (prompt: Prompt) => getReader().menuCmd("splitVertically")
         *   }
         * ])
         * ```
         */
        register(commands) {
          commands.forEach((c) => {
            var _a;
            return (_a = c.id) !== null && _a !== void 0 ? _a : c.id = c.name;
          });
          this.prompt.commands = [...this.prompt.commands, ...commands];
          this.commands = [...this.commands, ...commands];
          this.prompt.showCommands(this.commands, true);
        }
        /**
         * You can delete a command registed before by its name.
         * @remarks
         * There is a premise here that the names of all commands registered by a single plugin are not duplicated.
         * @param id Command.name
         */
        unregister(id) {
          const command = this.commands.find((c) => c.id == id);
          this.prompt.commands = this.prompt.commands.filter((c) => {
            return JSON.stringify(command) != JSON.stringify(c);
          });
          this.commands = this.commands.filter((c) => c.id != id);
        }
        /**
         * Call `unregisterAll` on plugin exit.
         */
        unregisterAll() {
          this.prompt.commands = this.prompt.commands.filter((c) => {
            return this.commands.find((_c) => {
              JSON.stringify(_c) != JSON.stringify(c);
            });
          });
          this.commands = [];
        }
      };
      exports.PromptManager = PromptManager;
    }
  });

  // node_modules/zotero-plugin-toolkit/dist/managers/libraryTabPanel.js
  var require_libraryTabPanel = __commonJS({
    "node_modules/zotero-plugin-toolkit/dist/managers/libraryTabPanel.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.LibraryTabPanelManager = void 0;
      var ui_1 = require_ui();
      var basic_1 = require_basic();
      var LibraryTabPanelManager = class extends basic_1.ManagerTool {
        constructor(base) {
          super(base);
          this.ui = new ui_1.UITool(this);
          this.libraryTabCache = {
            optionsList: []
          };
        }
        /**
         * Register a tabpanel in library.
         * @remarks
         * If you don't want to remove the tab & panel in runtime, `unregisterLibraryTabPanel` is not a must.
         *
         * The elements wiil be removed by `removeAddonElements`.
         * @param tabLabel Label of panel tab.
         * @param renderPanelHook Called when panel is ready. Add elements to the panel.
         * @param options Other optional parameters.
         * @param options.tabId ID of panel tab. Also used as unregister query. If not set, generate a random one.
         * @param options.panelId ID of panel container (XUL.TabPanel). If not set, generate a random one.
         * @param options.targetIndex Index of the inserted tab. Default the end of tabs.
         * @param options.selectPanel If the panel should be selected immediately.
         * @returns tabId. Use it for unregister.
         * @example
         * Register an extra library tabpanel into index 1.
         * ```ts
         * const libPaneManager = new LibraryTabPanelManager();
         * const libTabId = libPaneManager.registerLibraryTabPanel(
         *   "test",
         *   (panel: XUL.Element, win: Window) => {
         *     const elem = ui.creatElementsFromJSON(
         *       win.document,
         *       {
         *         tag: "vbox",
         *         namespace: "xul",
         *         subElementOptions: [
         *           {
         *             tag: "h2",
         *             directAttributes: {
         *               innerText: "Hello World!",
         *             },
         *           },
         *           {
         *             tag: "label",
         *             namespace: "xul",
         *             directAttributes: {
         *               value: "This is a library tab.",
         *             },
         *           },
         *           {
         *             tag: "button",
         *             directAttributes: {
         *               innerText: "Unregister",
         *             },
         *             listeners: [
         *               {
         *                 type: "click",
         *                 listener: () => {
         *                   ui.unregisterLibraryTabPanel(
         *                     libTabId
         *                   );
         *                 },
         *               },
         *             ],
         *           },
         *         ],
         *       }
         *     );
         *     panel.append(elem);
         *   },
         *   {
         *     targetIndex: 1,
         *   }
         * );
         * ```
         */
        register(tabLabel, renderPanelHook, options) {
          options = options || {
            tabId: void 0,
            panelId: void 0,
            targetIndex: -1,
            selectPanel: false
          };
          const window2 = this.getGlobal("window");
          const tabbox = window2.document.querySelector("#zotero-view-tabbox");
          const randomId = `${Zotero.Utilities.randomString()}-${(/* @__PURE__ */ new Date()).getTime()}`;
          const tabId = options.tabId || `toolkit-readertab-${randomId}`;
          const panelId = options.panelId || `toolkit-readertabpanel-${randomId}`;
          const tab = this.ui.createElement(window2.document, "tab", {
            id: tabId,
            classList: [`toolkit-ui-tabs-${tabId}`],
            attributes: {
              label: tabLabel
            },
            ignoreIfExists: true
          });
          const tabpanel = this.ui.createElement(window2.document, "tabpanel", {
            id: panelId,
            classList: [`toolkit-ui-tabs-${tabId}`],
            ignoreIfExists: true
          });
          const tabs = tabbox.querySelector("tabs");
          const tabpanels = tabbox.querySelector("tabpanels");
          const targetIndex = typeof options.targetIndex === "number" ? options.targetIndex : -1;
          if (targetIndex >= 0) {
            tabs.querySelectorAll("tab")[targetIndex].before(tab);
            tabpanels.querySelectorAll("tabpanel")[targetIndex].before(tabpanel);
          } else {
            tabs.appendChild(tab);
            tabpanels.appendChild(tabpanel);
          }
          if (options.selectPanel) {
            tabbox.selectedTab = tab;
          }
          this.libraryTabCache.optionsList.push({
            tabId,
            tabLabel,
            panelId,
            renderPanelHook,
            targetIndex,
            selectPanel: options.selectPanel
          });
          renderPanelHook(tabpanel, window2);
          return tabId;
        }
        /**
         * Unregister the library tabpanel.
         * @param tabId tab id
         */
        unregister(tabId) {
          const idx = this.libraryTabCache.optionsList.findIndex((v) => v.tabId === tabId);
          if (idx >= 0) {
            this.libraryTabCache.optionsList.splice(idx, 1);
          }
          this.removeTabPanel(tabId);
        }
        /**
         * Unregister all library tabpanel.
         */
        unregisterAll() {
          const tabIds = this.libraryTabCache.optionsList.map((options) => options.tabId);
          tabIds.forEach(this.unregister.bind(this));
        }
        removeTabPanel(tabId) {
          const doc = this.getGlobal("document");
          Array.prototype.forEach.call(doc.querySelectorAll(`.toolkit-ui-tabs-${tabId}`), (e) => {
            e.remove();
          });
        }
      };
      exports.LibraryTabPanelManager = LibraryTabPanelManager;
    }
  });

  // node_modules/zotero-plugin-toolkit/dist/managers/readerTabPanel.js
  var require_readerTabPanel = __commonJS({
    "node_modules/zotero-plugin-toolkit/dist/managers/readerTabPanel.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ReaderTabPanelManager = void 0;
      var ui_1 = require_ui();
      var reader_1 = require_reader();
      var basic_1 = require_basic();
      var ReaderTabPanelManager = class extends basic_1.ManagerTool {
        constructor(base) {
          super(base);
          this.ui = new ui_1.UITool(this);
          this.readerTool = new reader_1.ReaderTool(this);
          this.readerTabCache = {
            optionsList: [],
            observer: void 0,
            initializeLock: void 0
          };
        }
        /**
         * Register a tabpanel for every reader.
         * @remarks
         * Don't forget to call `unregisterReaderTabPanel` on exit.
         * @remarks
         * Every time a tab reader is selected/opened, the hook will be called.
         * @param tabLabel Label of panel tab.
         * @param renderPanelHook Called when panel is ready. Add elements to the panel.
         *
         * The panel might be `undefined` when opening a PDF without parent item.
         *
         * The owner deck is the top container of right-side bar.
         *
         * The readerInstance is the reader of current tabpanel.
         * @param options Other optional parameters.
         * @param options.tabId ID of panel tab. Also used as unregister query. If not set, generate a random one.
         * @param options.panelId ID of panel container (XUL.TabPanel). If not set, generate a random one.
         * @param options.targetIndex Index of the inserted tab. Default the end of tabs.
         * @param options.selectPanel If the panel should be selected immediately.
         * @returns tabId. Use it for unregister.
         * @example
         * Register an extra reader tabpanel into index 1.
         * ```ts
         * const readerTabId = `${config.addonRef}-extra-reader-tab`;
         * this._Addon.toolkit.UI.registerReaderTabPanel(
         *   "test",
         *   (
         *     panel: XUL.Element,
         *     deck: XUL.Deck,
         *     win: Window,
         *     reader: _ZoteroReaderInstance
         *   ) => {
         *     if (!panel) {
         *       this._Addon.toolkit.Tool.log(
         *         "This reader do not have right-side bar. Adding reader tab skipped."
         *       );
         *       return;
         *     }
         *     this._Addon.toolkit.Tool.log(reader);
         *     const elem = this._Addon.toolkit.UI.creatElementsFromJSON(
         *       win.document,
         *       {
         *         tag: "vbox",
         *         id: `${config.addonRef}-${reader._instanceID}-extra-reader-tab-div`,
         *         namespace: "xul",
         *         // This is important! Don't create content for multiple times
         *         ignoreIfExists: true,
         *         subElementOptions: [
         *           {
         *             tag: "h2",
         *             directAttributes: {
         *               innerText: "Hello World!",
         *             },
         *           },
         *           {
         *             tag: "label",
         *             namespace: "xul",
         *             directAttributes: {
         *               value: "This is a reader tab.",
         *             },
         *           },
         *           {
         *             tag: "label",
         *             namespace: "xul",
         *             directAttributes: {
         *               value: `Reader: ${reader._title.slice(0, 20)}`,
         *             },
         *           },
         *           {
         *             tag: "label",
         *             namespace: "xul",
         *             directAttributes: {
         *               value: `itemID: ${reader.itemID}.`,
         *             },
         *           },
         *           {
         *             tag: "button",
         *             directAttributes: {
         *               innerText: "Unregister",
         *             },
         *             listeners: [
         *               {
         *                 type: "click",
         *                 listener: () => {
         *                   this._Addon.toolkit.UI.unregisterReaderTabPanel(
         *                     readerTabId
         *                   );
         *                 },
         *               },
         *             ],
         *           },
         *         ],
         *       }
         *     );
         *     panel.append(elem);
         *   },
         *   {
         *     tabId: readerTabId,
         *   }
         * );
         * ```
         */
        async register(tabLabel, renderPanelHook, options) {
          var _a;
          options = options || {
            tabId: void 0,
            panelId: void 0,
            targetIndex: -1,
            selectPanel: false
          };
          if (typeof this.readerTabCache.initializeLock === "undefined") {
            await this.initializeReaderTabObserver();
          }
          await ((_a = this.readerTabCache.initializeLock) === null || _a === void 0 ? void 0 : _a.promise);
          const randomId = `${Zotero.Utilities.randomString()}-${(/* @__PURE__ */ new Date()).getTime()}`;
          const tabId = options.tabId || `toolkit-readertab-${randomId}`;
          const panelId = options.panelId || `toolkit-readertabpanel-${randomId}`;
          const targetIndex = typeof options.targetIndex === "number" ? options.targetIndex : -1;
          this.readerTabCache.optionsList.push({
            tabId,
            tabLabel,
            panelId,
            renderPanelHook,
            targetIndex,
            selectPanel: options.selectPanel
          });
          await this.addReaderTabPanel();
          return tabId;
        }
        /**
         * Unregister the reader tabpanel.
         * @param tabId tab id
         */
        unregister(tabId) {
          var _a;
          const idx = this.readerTabCache.optionsList.findIndex((v) => v.tabId === tabId);
          if (idx >= 0) {
            this.readerTabCache.optionsList.splice(idx, 1);
          }
          if (this.readerTabCache.optionsList.length === 0) {
            (_a = this.readerTabCache.observer) === null || _a === void 0 ? void 0 : _a.disconnect();
            this.readerTabCache = {
              optionsList: [],
              observer: void 0,
              initializeLock: void 0
            };
          }
          this.removeTabPanel(tabId);
        }
        /**
         * Unregister all library tabpanel.
         */
        unregisterAll() {
          const tabIds = this.readerTabCache.optionsList.map((options) => options.tabId);
          tabIds.forEach(this.unregister.bind(this));
        }
        changeTabPanel(tabId, options) {
          const idx = this.readerTabCache.optionsList.findIndex((v) => v.tabId === tabId);
          if (idx >= 0) {
            Object.assign(this.readerTabCache.optionsList[idx], options);
          }
        }
        removeTabPanel(tabId) {
          const doc = this.getGlobal("document");
          Array.prototype.forEach.call(doc.querySelectorAll(`.toolkit-ui-tabs-${tabId}`), (e) => {
            e.remove();
          });
        }
        async initializeReaderTabObserver() {
          this.readerTabCache.initializeLock = this.getGlobal("Zotero").Promise.defer();
          await Promise.all([
            Zotero.initializationPromise,
            Zotero.unlockPromise,
            Zotero.uiReadyPromise
          ]);
          let lock = Zotero.Promise.defer();
          lock.resolve();
          const observer = this.readerTool.addReaderTabPanelDeckObserver(async () => {
            await lock.promise;
            lock = Zotero.Promise.defer();
            try {
              this.addReaderTabPanel();
            } catch (e) {
            }
            lock.resolve();
          });
          this.readerTabCache.observer = observer;
          this.readerTabCache.initializeLock.resolve();
        }
        async addReaderTabPanel() {
          var _a, _b;
          const window2 = this.getGlobal("window");
          const deck = this.readerTool.getReaderTabPanelDeck();
          const reader = await this.readerTool.getReader();
          if (!reader) {
            return;
          }
          if (((_a = deck.selectedPanel) === null || _a === void 0 ? void 0 : _a.children[0].tagName) === "vbox") {
            const container = deck.selectedPanel;
            container.innerHTML = "";
            this.ui.appendElement({
              tag: "tabbox",
              classList: ["zotero-view-tabbox"],
              attributes: {
                flex: "1"
              },
              enableElementRecord: false,
              children: [
                {
                  tag: "tabs",
                  classList: ["zotero-editpane-tabs"],
                  attributes: {
                    orient: "horizontal"
                  },
                  enableElementRecord: false
                },
                {
                  tag: "tabpanels",
                  classList: ["zotero-view-item"],
                  attributes: {
                    flex: "1"
                  },
                  enableElementRecord: false
                }
              ]
            }, container);
          }
          let tabbox = (_b = deck.selectedPanel) === null || _b === void 0 ? void 0 : _b.querySelector("tabbox");
          if (!tabbox) {
            return;
          }
          const tabs = tabbox.querySelector("tabs");
          const tabpanels = tabbox.querySelector("tabpanels");
          this.readerTabCache.optionsList.forEach((options) => {
            const tabId = `${options.tabId}-${reader._instanceID}`;
            const tabClass = `toolkit-ui-tabs-${options.tabId}`;
            if (tabs === null || tabs === void 0 ? void 0 : tabs.querySelector(`.${tabClass}`)) {
              return;
            }
            const tab = this.ui.createElement(window2.document, "tab", {
              id: tabId,
              classList: [tabClass],
              attributes: {
                label: options.tabLabel
              },
              ignoreIfExists: true
            });
            const tabpanel = this.ui.createElement(window2.document, "tabpanel", {
              id: `${options.panelId}-${reader._instanceID}`,
              classList: [tabClass],
              ignoreIfExists: true
            });
            if (options.targetIndex >= 0) {
              tabs === null || tabs === void 0 ? void 0 : tabs.querySelectorAll("tab")[options.targetIndex].before(tab);
              tabpanels === null || tabpanels === void 0 ? void 0 : tabpanels.querySelectorAll("tabpanel")[options.targetIndex].before(tabpanel);
              if (tabbox.getAttribute("toolkit-select-fixed") !== "true") {
                tabbox.tabpanels.addEventListener("select", () => {
                  this.getGlobal("setTimeout")(() => {
                    tabbox.tabpanels.selectedPanel = tabbox.tabs.getRelatedElement(tabbox === null || tabbox === void 0 ? void 0 : tabbox.tabs.selectedItem);
                  }, 0);
                });
                tabbox.setAttribute("toolkit-select-fixed", "true");
              }
            } else {
              tabs === null || tabs === void 0 ? void 0 : tabs.appendChild(tab);
              tabpanels === null || tabpanels === void 0 ? void 0 : tabpanels.appendChild(tabpanel);
            }
            if (options.selectPanel) {
              tabbox.selectedTab = tab;
            }
            options.renderPanelHook(tabpanel, deck, window2, reader);
          });
        }
      };
      exports.ReaderTabPanelManager = ReaderTabPanelManager;
    }
  });

  // node_modules/zotero-plugin-toolkit/dist/managers/menu.js
  var require_menu = __commonJS({
    "node_modules/zotero-plugin-toolkit/dist/managers/menu.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.MenuManager = void 0;
      var ui_1 = require_ui();
      var basic_1 = require_basic();
      var MenuManager = class extends basic_1.ManagerTool {
        constructor(base) {
          super(base);
          this.ui = new ui_1.UITool(this);
        }
        /**
         * Insert an menu item/menu(with popup)/menuseprator into a menupopup
         * @remarks
         * options:
         * ```ts
         * export interface MenuitemOptions {
         *   tag: "menuitem" | "menu" | "menuseparator";
         *   id?: string;
         *   label?: string;
         *   // data url (chrome://xxx.png) or base64 url (data:image/png;base64,xxx)
         *   icon?: string;
         *   class?: string;
         *   styles?: { [key: string]: string };
         *   hidden?: boolean;
         *   disabled?: boolean;
         *   oncommand?: string;
         *   commandListener?: EventListenerOrEventListenerObject;
         *   // Attributes below are used when type === "menu"
         *   popupId?: string;
         *   onpopupshowing?: string;
         *   subElementOptions?: Array<MenuitemOptions>;
         * }
         * ```
         * @param menuPopup
         * @param options
         * @param insertPosition
         * @param anchorElement The menuitem will be put before/after `anchorElement`. If not set, put at start/end of the menupopup.
         * @example
         * Insert menuitem with icon into item menupopup
         * ```ts
         * // base64 or chrome:// url
         * const menuIcon = "chrome://addontemplate/content/icons/favicon@0.5x.png";
         * ztoolkit.Menu.register("item", {
         *   tag: "menuitem",
         *   id: "zotero-itemmenu-addontemplate-test",
         *   label: "Addon Template: Menuitem",
         *   oncommand: "alert('Hello World! Default Menuitem.')",
         *   icon: menuIcon,
         * });
         * ```
         * @example
         * Insert menu into file menupopup
         * ```ts
         * ztoolkit.Menu.register(
         *   "menuFile",
         *   {
         *     tag: "menu",
         *     label: "Addon Template: Menupopup",
         *     subElementOptions: [
         *       {
         *         tag: "menuitem",
         *         label: "Addon Template",
         *         oncommand: "alert('Hello World! Sub Menuitem.')",
         *       },
         *     ],
         *   },
         *   "before",
         *   Zotero.getMainWindow().document.querySelector(
         *     "#zotero-itemmenu-addontemplate-test"
         *   )
         * );
         * ```
         */
        register(menuPopup, options, insertPosition = "after", anchorElement) {
          let popup;
          if (typeof menuPopup === "string") {
            popup = this.getGlobal("document").querySelector(MenuSelector[menuPopup]);
          } else {
            popup = menuPopup;
          }
          if (!popup) {
            return false;
          }
          const doc = popup.ownerDocument;
          const generateElementOptions = (menuitemOption) => {
            var _a;
            const elementOption = {
              tag: menuitemOption.tag,
              id: menuitemOption.id,
              namespace: "xul",
              attributes: {
                label: menuitemOption.label || "",
                hidden: Boolean(menuitemOption.hidden),
                disaled: Boolean(menuitemOption.disabled),
                class: menuitemOption.class || "",
                oncommand: menuitemOption.oncommand || ""
              },
              classList: menuitemOption.classList,
              styles: menuitemOption.styles || {},
              listeners: [],
              children: []
            };
            if (menuitemOption.icon) {
              elementOption.attributes["class"] += " menuitem-iconic";
              elementOption.styles["list-style-image"] = `url(${menuitemOption.icon})`;
            }
            if (menuitemOption.tag === "menu") {
              elementOption.children.push({
                tag: "menupopup",
                id: menuitemOption.popupId,
                attributes: { onpopupshowing: menuitemOption.onpopupshowing || "" },
                children: (menuitemOption.children || menuitemOption.subElementOptions || []).map(generateElementOptions)
              });
            }
            if (menuitemOption.commandListener) {
              (_a = elementOption.listeners) === null || _a === void 0 ? void 0 : _a.push({
                type: "command",
                listener: menuitemOption.commandListener
              });
            }
            return elementOption;
          };
          const props = generateElementOptions(options);
          const menuItem = this.ui.createElement(doc, options.tag, props);
          if (!anchorElement) {
            anchorElement = insertPosition === "after" ? popup.lastElementChild : popup.firstElementChild;
          }
          anchorElement[insertPosition](menuItem);
          if (options.getVisibility) {
            popup.addEventListener("popupshowing", (ev) => {
              const showing = options.getVisibility(menuItem, ev);
              if (showing) {
                menuItem.removeAttribute("hidden");
              } else {
                menuItem.setAttribute("hidden", "true");
              }
            });
          }
        }
        unregister(menuId) {
          var _a;
          (_a = this.getGlobal("document").querySelector(`#${menuId}`)) === null || _a === void 0 ? void 0 : _a.remove();
        }
        unregisterAll() {
          this.ui.unregisterAll();
        }
      };
      exports.MenuManager = MenuManager;
      var MenuSelector;
      (function(MenuSelector2) {
        MenuSelector2["menuFile"] = "#menu_FilePopup";
        MenuSelector2["menuEdit"] = "#menu_EditPopup";
        MenuSelector2["menuView"] = "#menu_viewPopup";
        MenuSelector2["menuGo"] = "#menu_goPopup";
        MenuSelector2["menuTools"] = "#menu_ToolsPopup";
        MenuSelector2["menuHelp"] = "#menu_HelpPopup";
        MenuSelector2["collection"] = "#zotero-collectionmenu";
        MenuSelector2["item"] = "#zotero-itemmenu";
      })(MenuSelector || (MenuSelector = {}));
    }
  });

  // node_modules/zotero-plugin-toolkit/dist/managers/preferencePane.js
  var require_preferencePane = __commonJS({
    "node_modules/zotero-plugin-toolkit/dist/managers/preferencePane.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.PreferencePaneManager = void 0;
      var ui_1 = require_ui();
      var basic_1 = require_basic();
      var PreferencePaneManager2 = class extends basic_1.ManagerTool {
        constructor(base) {
          super(base);
          this.alive = true;
          this.ui = new ui_1.UITool(this);
          this.prefPaneCache = { win: void 0, listeners: {} };
        }
        /**
         * Register a preference pane from an xhtml, for Zotero 6 & 7.
         * @remarks
         * Don't forget to call `unregisterPrefPane` on exit.
         * @remarks
         * options:
         * ```ts
         * export interface PrefPaneOptions {
         *   pluginID: string;
         *   src: string;
         *   id?: string;
         *   parent?: string;
         *   label?: string;
         *   image?: string;
         *   extraDTD?: string[];
         *   scripts?: string[];
         *   defaultXUL?: boolean;
         *   // Only for Zotero 6
         *   onload?: (win: Window) => any;
         * }
         * ```
         *
         * @param options See {@link https://github.com/windingwind/zotero-plugin-toolkit/blob/main/src/options.ts | source code:options.ts}
         * @example
         * ```ts
         * const prefsManager = new PreferencePaneManager();
         * function initPrefs() {
         *   const prefOptions = {
         *     pluginID: addonID,
         *     src: rootURI + "chrome/content/preferences.xhtml",
         *     label: "Template",
         *     image: `chrome://${addonRef}/content/icons/favicon.png`,
         *     extraDTD: [`chrome://${addonRef}/locale/overlay.dtd`],
         *     defaultXUL: true
         *   };
         *   prefsManager.register(prefOptions);
         * };
         *
         * function unInitPrefs() {
         *   prefsManager.unregisterAll();
         * };
         * ```
         * // bootstrap.js:startup
         * initPrefs();
         *
         * // bootstrap.js:shutdown
         * unInitPrefs();
         */
        register(options) {
          if (this.isZotero7()) {
            this.getGlobal("Zotero").PreferencePanes.register(options);
            return;
          }
          const _initImportedNodesPostInsert = (container) => {
            var _a;
            const _observerSymbols = /* @__PURE__ */ new Map();
            const Zotero2 = this.getGlobal("Zotero");
            const window2 = container.ownerGlobal;
            let useChecked = (elem) => elem instanceof window2.HTMLInputElement && elem.type == "checkbox" || elem.tagName == "checkbox";
            let syncFromPref = (elem, preference) => {
              let value = Zotero2.Prefs.get(preference, true);
              if (useChecked(elem)) {
                elem.checked = value;
              } else {
                elem.value = value;
              }
              elem.dispatchEvent(new window2.Event("syncfrompreference"));
            };
            let syncToPrefOnModify = (event) => {
              const targetNode = event.currentTarget;
              if (targetNode === null || targetNode === void 0 ? void 0 : targetNode.getAttribute("preference")) {
                let value = useChecked(targetNode) ? targetNode.checked : targetNode.value;
                Zotero2.Prefs.set(targetNode.getAttribute("preference") || "", value, true);
                targetNode.dispatchEvent(new window2.Event("synctopreference"));
              }
            };
            let attachToPreference = (elem, preference) => {
              Zotero2.debug(`Attaching <${elem.tagName}> element to ${preference}`);
              let symbol = Zotero2.Prefs.registerObserver(preference, () => syncFromPref(elem, preference), true);
              _observerSymbols.set(elem, symbol);
            };
            let detachFromPreference = (elem) => {
              if (_observerSymbols.has(elem)) {
                Zotero2.debug(`Detaching <${elem.tagName}> element from preference`);
                Zotero2.Prefs.unregisterObserver(this._observerSymbols.get(elem));
                _observerSymbols.delete(elem);
              }
            };
            for (let elem of container.querySelectorAll("[preference]")) {
              let preference = elem.getAttribute("preference");
              if (container.querySelector("preferences > preference#" + preference)) {
                this.log("<preference> is deprecated -- `preference` attribute values should be full preference keys, not <preference> IDs");
                preference = (_a = container.querySelector("preferences > preference#" + preference)) === null || _a === void 0 ? void 0 : _a.getAttribute("name");
              }
              attachToPreference(elem, preference);
              elem.addEventListener(this.isXULElement(elem) ? "command" : "input", syncToPrefOnModify);
              window2.setTimeout(() => {
                syncFromPref(elem, preference);
              });
            }
            new window2.MutationObserver((mutations) => {
              for (let mutation of mutations) {
                if (mutation.type == "attributes") {
                  let target = mutation.target;
                  detachFromPreference(target);
                  if (target.hasAttribute("preference")) {
                    attachToPreference(target, target.getAttribute("preference") || "");
                    target.addEventListener(this.isXULElement(target) ? "command" : "input", syncToPrefOnModify);
                  }
                } else if (mutation.type == "childList") {
                  for (let node of mutation.removedNodes) {
                    detachFromPreference(node);
                  }
                  for (let node of mutation.addedNodes) {
                    if (node.nodeType == window2.Node.ELEMENT_NODE && node.hasAttribute("preference")) {
                      attachToPreference(node, node.getAttribute("preference") || "");
                      node.addEventListener(this.isXULElement(node) ? "command" : "input", syncToPrefOnModify);
                    }
                  }
                }
              }
            }).observe(container, {
              childList: true,
              subtree: true,
              attributeFilter: ["preference"]
            });
            for (let elem of container.querySelectorAll("[oncommand]")) {
              elem.oncommand = elem.getAttribute("oncommand");
            }
            for (let child of container.children) {
              child.dispatchEvent(new window2.Event("load"));
            }
          };
          const windowListener = {
            onOpenWindow: (xulWindow) => {
              if (!this.alive) {
                return;
              }
              const win = xulWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindow);
              win.addEventListener("load", async () => {
                var _a;
                if (win.location.href === "chrome://zotero/content/preferences/preferences.xul") {
                  this.log("registerPrefPane:detected", options);
                  const Zotero2 = this.getGlobal("Zotero");
                  options.id || (options.id = `plugin-${Zotero2.Utilities.randomString()}-${(/* @__PURE__ */ new Date()).getTime()}`);
                  const contentOrXHR = await Zotero2.File.getContentsAsync(options.src);
                  const content = typeof contentOrXHR === "string" ? contentOrXHR : contentOrXHR.response;
                  const src = `<prefpane xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" id="${options.id}" insertafter="zotero-prefpane-advanced" label="${options.label || options.pluginID}" image="${options.image || ""}">
                ${content}
                </prefpane>`;
                  const frag = this.ui.parseXHTMLToFragment(src, options.extraDTD, options.defaultXUL);
                  this.log(frag);
                  const prefWindow = win.document.querySelector("prefwindow");
                  prefWindow.appendChild(frag);
                  const prefPane = win.document.querySelector(`#${options.id}`);
                  prefWindow.addPane(prefPane);
                  const contentBox = win.document.getAnonymousNodes(win.document.querySelector(`#${options.id}`))[0];
                  contentBox.style.overflowY = "scroll";
                  contentBox.style.height = "440px";
                  win.sizeToContent();
                  if (contentBox.scrollHeight === contentBox.clientHeight) {
                    contentBox.style.overflowY = "hidden";
                  }
                  this.prefPaneCache.win = win;
                  this.prefPaneCache.listeners[options.id] = windowListener;
                  _initImportedNodesPostInsert(prefPane);
                  if ((_a = options.scripts) === null || _a === void 0 ? void 0 : _a.length) {
                    options.scripts.forEach((script) => Services.scriptloader.loadSubScript(script, win));
                  }
                  if (options.onload) {
                    options.onload(win);
                  }
                }
              }, false);
            }
          };
          Services.wm.addListener(windowListener);
        }
        unregister(id) {
          var _a;
          const idx = Object.keys(this.prefPaneCache.listeners).indexOf(id);
          if (idx < 0) {
            return false;
          }
          const listener = this.prefPaneCache.listeners[id];
          Services.wm.removeListener(listener);
          listener.onOpenWindow = void 0;
          const win = this.prefPaneCache.win;
          if (win && !win.closed) {
            (_a = win.document.querySelector(`#${id}`)) === null || _a === void 0 ? void 0 : _a.remove();
          }
          delete this.prefPaneCache.listeners[id];
          return true;
        }
        /**
         * Unregister all preference panes added with this instance
         *
         * Called on exiting
         */
        unregisterAll() {
          this.alive = false;
          for (const id in this.prefPaneCache.listeners) {
            this.unregister(id);
          }
        }
      };
      exports.PreferencePaneManager = PreferencePaneManager2;
    }
  });

  // node_modules/zotero-plugin-toolkit/dist/managers/shortcut.js
  var require_shortcut = __commonJS({
    "node_modules/zotero-plugin-toolkit/dist/managers/shortcut.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ShortcutManager = void 0;
      var basic_1 = require_basic();
      var ui_1 = require_ui();
      var basic_2 = require_basic();
      var toolkitGlobal_1 = __importDefault(require_toolkitGlobal());
      var ShortcutManager = class extends basic_2.ManagerTool {
        constructor(base) {
          super(base);
          this.ui = new ui_1.UITool(this);
          this.creatorId = `${Zotero.Utilities.randomString()}-${(/* @__PURE__ */ new Date()).getTime()}`;
          this.initializeGlobal();
        }
        register(type, keyOptions) {
          const _keyOptions = keyOptions;
          _keyOptions.type = type;
          switch (_keyOptions.type) {
            case "event":
              this.registerEventKey(_keyOptions);
              return true;
            case "element":
              this.registerElementKey(_keyOptions);
              return true;
            case "prefs":
              this.getGlobal("Zotero").Prefs.set(_keyOptions.id, _keyOptions.key || "");
              return true;
            default:
              try {
                if (_keyOptions.register) {
                  return _keyOptions.register(_keyOptions);
                } else {
                  return false;
                }
              } catch (e) {
                this.log(e);
                return false;
              }
          }
        }
        /**
         * Get all shortcuts(element, event, prefs, builtin)
         */
        getAll() {
          return Array.prototype.concat(this.getMainWindowElementKeys(), this.getEventKeys(), this.getPrefsKeys(), this.getBuiltinKeys());
        }
        /**
         * Check key conflicting of `inputKeyOptions`.
         * @param inputKeyOptions
         * @param options
         * @returns conflicting keys array
         */
        checkKeyConflicting(inputKeyOptions, options = { includeEmpty: false, customKeys: [] }) {
          var _a;
          inputKeyOptions.modifiers = new KeyModifier(inputKeyOptions.modifiers || "").getRaw();
          let allKeys = this.getAll();
          if ((_a = options.customKeys) === null || _a === void 0 ? void 0 : _a.length) {
            allKeys = allKeys.concat(options.customKeys);
          }
          if (!options.includeEmpty) {
            allKeys = allKeys.filter((_keyOptions) => _keyOptions.key);
          }
          return allKeys.filter((_keyOptions) => {
            var _a2, _b;
            return _keyOptions.id !== inputKeyOptions.id && ((_a2 = _keyOptions.key) === null || _a2 === void 0 ? void 0 : _a2.toLowerCase()) === ((_b = inputKeyOptions.key) === null || _b === void 0 ? void 0 : _b.toLowerCase()) && _keyOptions.modifiers === inputKeyOptions.modifiers;
          });
        }
        /**
         * Find all key conflicting.
         * @param options
         * @returns An array of conflicting keys arrays. Same conflicting keys are put together.
         */
        checkAllKeyConflicting(options = { includeEmpty: false, customKeys: [] }) {
          var _a;
          let allKeys = this.getAll();
          if ((_a = options.customKeys) === null || _a === void 0 ? void 0 : _a.length) {
            allKeys = allKeys.concat(options.customKeys);
          }
          if (!options.includeEmpty) {
            allKeys = allKeys.filter((_keyOptions) => _keyOptions.key);
          }
          const conflicting = [];
          while (allKeys.length > 0) {
            const checkKey = allKeys.pop();
            const conflictKeys = allKeys.filter((_keyOptions) => {
              var _a2, _b;
              return ((_a2 = _keyOptions.key) === null || _a2 === void 0 ? void 0 : _a2.toLowerCase()) === ((_b = checkKey.key) === null || _b === void 0 ? void 0 : _b.toLowerCase()) && _keyOptions.modifiers === checkKey.modifiers;
            });
            if (conflictKeys.length) {
              conflictKeys.push(checkKey);
              conflicting.push(conflictKeys);
              const conflictingKeyIds = conflictKeys.map((key) => key.id);
              const toRemoveIds = [];
              allKeys.forEach((key, i) => conflictingKeyIds.includes(key.id) && toRemoveIds.push(i));
              toRemoveIds.sort((a, b) => b - a).forEach((id) => allKeys.splice(id, 1));
            }
          }
          return conflicting;
        }
        /**
         * Unregister a key.
         * @remarks
         * `builtin` keys cannot be unregistered.
         * @param keyOptions
         * @returns `true` for success and `false` for failure.
         */
        async unregister(keyOptions) {
          var _a;
          switch (keyOptions.type) {
            case "element":
              (_a = (keyOptions.xulData.document || this.getGlobal("document")).querySelector(`#${keyOptions.id}`)) === null || _a === void 0 ? void 0 : _a.remove();
              return true;
            case "prefs":
              this.getGlobal("Zotero").Prefs.set(keyOptions.id, "");
              return true;
            case "builtin":
              return false;
            case "event":
              let idx = this.globalCache.eventKeys.findIndex((currentKey) => currentKey.id === keyOptions.id);
              while (idx >= 0) {
                this.globalCache.eventKeys.splice(idx, 1);
                idx = this.globalCache.eventKeys.findIndex((currentKey) => currentKey.id === keyOptions.id);
              }
              return true;
            default:
              try {
                if (keyOptions.unregister) {
                  return await keyOptions.unregister(keyOptions);
                } else {
                  return false;
                }
              } catch (e) {
                this.log(e);
                return false;
              }
          }
        }
        /**
         * Unregister all keys created by this instance.
         */
        unregisterAll() {
          this.ui.unregisterAll();
          this.globalCache.eventKeys.filter((keyOptions) => keyOptions.creatorId === this.creatorId).forEach((keyOptions) => this.unregister(keyOptions));
        }
        initializeGlobal() {
          const Zotero2 = this.getGlobal("Zotero");
          const window2 = this.getGlobal("window");
          this.globalCache = toolkitGlobal_1.default.getInstance().shortcut;
          if (!this.globalCache._ready) {
            this.globalCache._ready = true;
            window2.addEventListener("keypress", (event) => {
              let eventMods = [];
              let eventModsWithAccel = [];
              if (event.altKey) {
                eventMods.push("alt");
                eventModsWithAccel.push("alt");
              }
              if (event.shiftKey) {
                eventMods.push("shift");
                eventModsWithAccel.push("shift");
              }
              if (event.metaKey) {
                eventMods.push("meta");
                Zotero2.isMac && eventModsWithAccel.push("accel");
              }
              if (event.ctrlKey) {
                eventMods.push("control");
                !Zotero2.isMac && eventModsWithAccel.push("accel");
              }
              const eventModStr = new KeyModifier(eventMods.join(",")).getRaw();
              const eventModStrWithAccel = new KeyModifier(eventMods.join(",")).getRaw();
              this.globalCache.eventKeys.forEach((keyOptions) => {
                var _a;
                if (keyOptions.disabled) {
                  return;
                }
                const modStr = new KeyModifier(keyOptions.modifiers || "").getRaw();
                if ((modStr === eventModStr || modStr === eventModStrWithAccel) && ((_a = keyOptions.key) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === event.key.toLowerCase()) {
                  keyOptions.callback();
                }
              });
            });
          }
        }
        registerEventKey(keyOptions) {
          keyOptions.creatorId = this.creatorId;
          this.globalCache.eventKeys.push(keyOptions);
        }
        /**
         * Register Element \<commandset\>. In general, use `registerElementKey` or `registerKey`.
         * @param commandSetOptions
         */
        registerElementCommandset(commandSetOptions) {
          var _a;
          (_a = commandSetOptions.document.querySelector("window")) === null || _a === void 0 ? void 0 : _a.appendChild(this.ui.createElement(commandSetOptions.document, "commandset", {
            id: commandSetOptions.id,
            skipIfExists: true,
            children: commandSetOptions.commands.map((cmd) => ({
              tag: "command",
              id: cmd.id,
              attributes: {
                oncommand: cmd.oncommand,
                disabled: cmd.disabled,
                label: cmd.label
              }
            }))
          }));
        }
        /**
         * Register Element \<command\>. In general, use `registerElementKey` or `registerKey`.
         * @param commandOptions
         */
        registerElementCommand(commandOptions) {
          var _a;
          if (commandOptions._parentId) {
            this.registerElementCommandset({
              id: commandOptions._parentId,
              document: commandOptions.document,
              commands: []
            });
          }
          (_a = commandOptions.document.querySelector(`commandset#${commandOptions._parentId}`)) === null || _a === void 0 ? void 0 : _a.appendChild(this.ui.createElement(commandOptions.document, "command", {
            id: commandOptions.id,
            skipIfExists: true,
            attributes: {
              oncommand: commandOptions.oncommand,
              disabled: commandOptions.disabled,
              label: commandOptions.label
            }
          }));
        }
        /**
         * Register Element \<keyset\>. In general, use `registerElementKey` or `registerKey`.
         * @param keySetOptions
         */
        registerElementKeyset(keySetOptions) {
          var _a;
          (_a = keySetOptions.document.querySelector("window")) === null || _a === void 0 ? void 0 : _a.appendChild(this.ui.createElement(keySetOptions.document, "keyset", {
            id: keySetOptions.id,
            skipIfExists: true,
            children: keySetOptions.keys.map((keyOptions) => ({
              tag: "key",
              id: keyOptions.id,
              attributes: {
                oncommand: keyOptions.xulData.oncommand || "//",
                command: keyOptions.xulData.command,
                modifiers: keyOptions.modifiers,
                key: this.getXULKey(keyOptions.key),
                keycode: this.getXULKeyCode(keyOptions.key),
                disabled: keyOptions.disabled
              }
            }))
          }));
        }
        /**
         * Register a shortcut key element \<key\>.
         * @remarks
         * Provide `_parentId` to register a \<keyset\>;
         *
         * Provide `_commandOptions` to register a \<command\>;
         *
         * Provide `_parentId` in `_commandOptions` to register a \<commandset\>.
         *
         * See examples for more details.
         * @param keyOptions
         * @example
         */
        registerElementKey(keyOptions) {
          var _a;
          const doc = keyOptions.xulData.document || this.getGlobal("document");
          if (keyOptions.xulData._parentId) {
            this.registerElementKeyset({
              id: keyOptions.xulData._parentId,
              document: doc,
              keys: []
            });
          }
          (_a = doc.querySelector(`keyset#${keyOptions.xulData._parentId}`)) === null || _a === void 0 ? void 0 : _a.appendChild(this.ui.createElement(doc, "key", {
            id: keyOptions.id,
            skipIfExists: true,
            attributes: {
              oncommand: keyOptions.xulData.oncommand || "//",
              command: keyOptions.xulData.command,
              modifiers: keyOptions.modifiers,
              key: this.getXULKey(keyOptions.key),
              keycode: this.getXULKeyCode(keyOptions.key),
              disabled: keyOptions.disabled
            }
          }));
          if (keyOptions.xulData._commandOptions) {
            this.registerElementCommand(keyOptions.xulData._commandOptions);
          }
        }
        getXULKey(standardKey) {
          if (standardKey.length === 1) {
            return standardKey;
          }
          return void 0;
        }
        getXULKeyCode(standardKey) {
          const idx = Object.values(XUL_KEYCODE_MAPS).findIndex((value) => value === standardKey);
          if (idx >= 0) {
            return Object.values(XUL_KEYCODE_MAPS)[idx];
          }
          return void 0;
        }
        getStandardKey(XULKey, XULKeyCode) {
          if (XULKeyCode && Object.keys(XUL_KEYCODE_MAPS).includes(XULKeyCode)) {
            return XUL_KEYCODE_MAPS[XULKeyCode];
          } else {
            return XULKey;
          }
        }
        /**
         * Get all \<commandset\> details.
         * @param doc
         */
        getElementCommandSets(doc) {
          return Array.from((doc || this.getGlobal("document")).querySelectorAll("commandset")).map((cmdSet) => ({
            id: cmdSet.id,
            commands: Array.from(cmdSet.querySelectorAll("command")).map((cmd) => ({
              id: cmd.id,
              oncommand: cmd.getAttribute("oncommand"),
              disabled: cmd.getAttribute("disabled") === "true",
              label: cmd.getAttribute("label"),
              _parentId: cmdSet.id
            }))
          }));
        }
        /**
         * Get all \<command\> details.
         * @param doc
         */
        getElementCommands(doc) {
          return Array.prototype.concat(...this.getElementCommandSets(doc).map((cmdSet) => cmdSet.commands));
        }
        /**
         * Get all \<keyset\> details.
         * @param doc
         * @param options
         */
        getElementKeySets(doc) {
          let allCommends = this.getElementCommands(doc);
          return Array.from((doc || this.getGlobal("document")).querySelectorAll("keyset")).map((keysetElem) => ({
            id: keysetElem.id,
            document: doc,
            keys: Array.from(keysetElem.querySelectorAll("key")).map((keyElem) => {
              const oncommand = keyElem.getAttribute("oncommand") || "";
              const commandId = keyElem.getAttribute("command") || "";
              const commandOptions = allCommends.find((cmd) => cmd.id === commandId);
              const key = {
                type: "element",
                id: keyElem.id,
                key: this.getStandardKey(keyElem.getAttribute("key") || "", keyElem.getAttribute("keycode") || ""),
                modifiers: new KeyModifier(keyElem.getAttribute("modifiers") || "").getRaw(),
                disabled: keyElem.getAttribute("disabled") === "true",
                xulData: {
                  document: doc,
                  oncommand,
                  command: commandId,
                  _parentId: keysetElem.id,
                  _commandOptions: commandOptions
                },
                callback: () => {
                  const win = doc.ownerGlobal;
                  const _eval = win.eval;
                  _eval(oncommand);
                  _eval((commandOptions === null || commandOptions === void 0 ? void 0 : commandOptions.oncommand) || "");
                }
              };
              return key;
            })
          }));
        }
        /**
         * Get all \<key\> details.
         * @param doc
         * @param options
         */
        getElementKeys(doc) {
          return Array.prototype.concat(...this.getElementKeySets(doc).map((keyset) => keyset.keys)).filter((elemKey) => !ELEM_KEY_IGNORE.includes(elemKey.id));
        }
        /**
         * Get \<key\> details in main window.
         * @param options
         */
        getMainWindowElementKeys() {
          return this.getElementKeys(this.getGlobal("document"));
        }
        getEventKeys() {
          return this.globalCache.eventKeys;
        }
        /**
         * Get Zotero builtin keys defined in preferences.
         */
        getPrefsKeys() {
          const Zotero2 = this.getGlobal("Zotero");
          return PREF_KEYS.map((pref) => ({
            id: pref.id,
            modifiers: pref.modifiers,
            key: Zotero2.Prefs.get(pref.id),
            callback: pref.callback,
            type: "prefs"
          }));
        }
        /**
         * Get Zotero builtin keys not defined in preferences.
         */
        getBuiltinKeys() {
          return BUILTIN_KEYS.map((builtin) => ({
            id: builtin.id,
            modifiers: builtin.modifiers,
            key: builtin.key,
            callback: builtin.callback,
            type: "builtin"
          }));
        }
      };
      exports.ShortcutManager = ShortcutManager;
      var KeyModifier = class {
        constructor(raw) {
          raw = raw || "";
          this.accel = raw.includes("accel");
          this.shift = raw.includes("shift");
          this.control = raw.includes("control");
          this.meta = raw.includes("meta");
          this.alt = raw.includes("alt");
        }
        equals(newMod) {
          this.accel === newMod.accel;
          this.shift === newMod.shift;
          this.control === newMod.control;
          this.meta === newMod.meta;
          this.alt === newMod.alt;
        }
        getRaw() {
          const enabled = [];
          this.accel && enabled.push("accel");
          this.shift && enabled.push("shift");
          this.control && enabled.push("control");
          this.meta && enabled.push("meta");
          this.alt && enabled.push("alt");
          return enabled.join(",");
        }
      };
      var XUL_KEYCODE_MAPS;
      (function(XUL_KEYCODE_MAPS2) {
        XUL_KEYCODE_MAPS2["VK_CANCEL"] = "Unidentified";
        XUL_KEYCODE_MAPS2["VK_BACK"] = "Backspace";
        XUL_KEYCODE_MAPS2["VK_TAB"] = "Tab";
        XUL_KEYCODE_MAPS2["VK_CLEAR"] = "Clear";
        XUL_KEYCODE_MAPS2["VK_RETURN"] = "Enter";
        XUL_KEYCODE_MAPS2["VK_ENTER"] = "Enter";
        XUL_KEYCODE_MAPS2["VK_SHIFT"] = "Shift";
        XUL_KEYCODE_MAPS2["VK_CONTROL"] = "Control";
        XUL_KEYCODE_MAPS2["VK_ALT"] = "Alt";
        XUL_KEYCODE_MAPS2["VK_PAUSE"] = "Pause";
        XUL_KEYCODE_MAPS2["VK_CAPS_LOCK"] = "CapsLock";
        XUL_KEYCODE_MAPS2["VK_ESCAPE"] = "Escape";
        XUL_KEYCODE_MAPS2["VK_SPACE"] = " ";
        XUL_KEYCODE_MAPS2["VK_PAGE_UP"] = "PageUp";
        XUL_KEYCODE_MAPS2["VK_PAGE_DOWN"] = "PageDown";
        XUL_KEYCODE_MAPS2["VK_END"] = "End";
        XUL_KEYCODE_MAPS2["VK_HOME"] = "Home";
        XUL_KEYCODE_MAPS2["VK_LEFT"] = "ArrowLeft";
        XUL_KEYCODE_MAPS2["VK_UP"] = "ArrowUp";
        XUL_KEYCODE_MAPS2["VK_RIGHT"] = "ArrowRight";
        XUL_KEYCODE_MAPS2["VK_DOWN"] = "ArrowDown";
        XUL_KEYCODE_MAPS2["VK_PRINTSCREEN"] = "PrintScreen";
        XUL_KEYCODE_MAPS2["VK_INSERT"] = "Insert";
        XUL_KEYCODE_MAPS2["VK_DELETE"] = "Backspace";
        XUL_KEYCODE_MAPS2["VK_0"] = "0";
        XUL_KEYCODE_MAPS2["VK_1"] = "1";
        XUL_KEYCODE_MAPS2["VK_2"] = "2";
        XUL_KEYCODE_MAPS2["VK_3"] = "3";
        XUL_KEYCODE_MAPS2["VK_4"] = "4";
        XUL_KEYCODE_MAPS2["VK_5"] = "5";
        XUL_KEYCODE_MAPS2["VK_6"] = "6";
        XUL_KEYCODE_MAPS2["VK_7"] = "7";
        XUL_KEYCODE_MAPS2["VK_8"] = "8";
        XUL_KEYCODE_MAPS2["VK_9"] = "9";
        XUL_KEYCODE_MAPS2["VK_A"] = "A";
        XUL_KEYCODE_MAPS2["VK_B"] = "B";
        XUL_KEYCODE_MAPS2["VK_C"] = "C";
        XUL_KEYCODE_MAPS2["VK_D"] = "D";
        XUL_KEYCODE_MAPS2["VK_E"] = "E";
        XUL_KEYCODE_MAPS2["VK_F"] = "F";
        XUL_KEYCODE_MAPS2["VK_G"] = "G";
        XUL_KEYCODE_MAPS2["VK_H"] = "H";
        XUL_KEYCODE_MAPS2["VK_I"] = "I";
        XUL_KEYCODE_MAPS2["VK_J"] = "J";
        XUL_KEYCODE_MAPS2["VK_K"] = "K";
        XUL_KEYCODE_MAPS2["VK_L"] = "L";
        XUL_KEYCODE_MAPS2["VK_M"] = "M";
        XUL_KEYCODE_MAPS2["VK_N"] = "N";
        XUL_KEYCODE_MAPS2["VK_O"] = "O";
        XUL_KEYCODE_MAPS2["VK_P"] = "P";
        XUL_KEYCODE_MAPS2["VK_Q"] = "Q";
        XUL_KEYCODE_MAPS2["VK_R"] = "R";
        XUL_KEYCODE_MAPS2["VK_S"] = "S";
        XUL_KEYCODE_MAPS2["VK_T"] = "T";
        XUL_KEYCODE_MAPS2["VK_U"] = "U";
        XUL_KEYCODE_MAPS2["VK_V"] = "V";
        XUL_KEYCODE_MAPS2["VK_W"] = "W";
        XUL_KEYCODE_MAPS2["VK_X"] = "X";
        XUL_KEYCODE_MAPS2["VK_Y"] = "Y";
        XUL_KEYCODE_MAPS2["VK_Z"] = "Z";
        XUL_KEYCODE_MAPS2["VK_SEMICOLON"] = "Unidentified";
        XUL_KEYCODE_MAPS2["VK_EQUALS"] = "Unidentified";
        XUL_KEYCODE_MAPS2["VK_NUMPAD0"] = "0";
        XUL_KEYCODE_MAPS2["VK_NUMPAD1"] = "1";
        XUL_KEYCODE_MAPS2["VK_NUMPAD2"] = "2";
        XUL_KEYCODE_MAPS2["VK_NUMPAD3"] = "3";
        XUL_KEYCODE_MAPS2["VK_NUMPAD4"] = "4";
        XUL_KEYCODE_MAPS2["VK_NUMPAD5"] = "5";
        XUL_KEYCODE_MAPS2["VK_NUMPAD6"] = "6";
        XUL_KEYCODE_MAPS2["VK_NUMPAD7"] = "7";
        XUL_KEYCODE_MAPS2["VK_NUMPAD8"] = "8";
        XUL_KEYCODE_MAPS2["VK_NUMPAD9"] = "9";
        XUL_KEYCODE_MAPS2["VK_MULTIPLY"] = "Multiply";
        XUL_KEYCODE_MAPS2["VK_ADD"] = "Add";
        XUL_KEYCODE_MAPS2["VK_SEPARATOR"] = "Separator";
        XUL_KEYCODE_MAPS2["VK_SUBTRACT"] = "Subtract";
        XUL_KEYCODE_MAPS2["VK_DECIMAL"] = "Decimal";
        XUL_KEYCODE_MAPS2["VK_DIVIDE"] = "Divide";
        XUL_KEYCODE_MAPS2["VK_F1"] = "F1";
        XUL_KEYCODE_MAPS2["VK_F2"] = "F2";
        XUL_KEYCODE_MAPS2["VK_F3"] = "F3";
        XUL_KEYCODE_MAPS2["VK_F4"] = "F4";
        XUL_KEYCODE_MAPS2["VK_F5"] = "F5";
        XUL_KEYCODE_MAPS2["VK_F6"] = "F6";
        XUL_KEYCODE_MAPS2["VK_F7"] = "F7";
        XUL_KEYCODE_MAPS2["VK_F8"] = "F8";
        XUL_KEYCODE_MAPS2["VK_F9"] = "F9";
        XUL_KEYCODE_MAPS2["VK_F10"] = "F10";
        XUL_KEYCODE_MAPS2["VK_F11"] = "F11";
        XUL_KEYCODE_MAPS2["VK_F12"] = "F12";
        XUL_KEYCODE_MAPS2["VK_F13"] = "F13";
        XUL_KEYCODE_MAPS2["VK_F14"] = "F14";
        XUL_KEYCODE_MAPS2["VK_F15"] = "F15";
        XUL_KEYCODE_MAPS2["VK_F16"] = "F16";
        XUL_KEYCODE_MAPS2["VK_F17"] = "F17";
        XUL_KEYCODE_MAPS2["VK_F18"] = "F18";
        XUL_KEYCODE_MAPS2["VK_F19"] = "F19";
        XUL_KEYCODE_MAPS2["VK_F20"] = "F20";
        XUL_KEYCODE_MAPS2["VK_F21"] = "Soft1";
        XUL_KEYCODE_MAPS2["VK_F22"] = "Soft2";
        XUL_KEYCODE_MAPS2["VK_F23"] = "Soft3";
        XUL_KEYCODE_MAPS2["VK_F24"] = "Soft4";
        XUL_KEYCODE_MAPS2["VK_NUM_LOCK"] = "NumLock";
        XUL_KEYCODE_MAPS2["VK_SCROLL_LOCK"] = "ScrollLock";
        XUL_KEYCODE_MAPS2["VK_COMMA"] = ",";
        XUL_KEYCODE_MAPS2["VK_PERIOD"] = ".";
        XUL_KEYCODE_MAPS2["VK_SLASH"] = "Divide";
        XUL_KEYCODE_MAPS2["VK_BACK_QUOTE"] = "`";
        XUL_KEYCODE_MAPS2["VK_OPEN_BRACKET"] = "[";
        XUL_KEYCODE_MAPS2["VK_CLOSE_BRACKET"] = "]";
        XUL_KEYCODE_MAPS2["VK_QUOTE"] = "\\";
        XUL_KEYCODE_MAPS2["VK_HELP"] = "Help";
      })(XUL_KEYCODE_MAPS || (XUL_KEYCODE_MAPS = {}));
      function getElementKeyCallback(keyId) {
        return function() {
          var _a;
          const win = basic_1.BasicTool.getZotero().getMainWindow();
          const keyElem = win.document.querySelector(`#${keyId}`);
          if (!keyElem) {
            return function() {
            };
          }
          const _eval = win.eval;
          _eval(keyElem.getAttribute("oncommand") || "//");
          const cmdId = keyElem.getAttribute("command");
          if (!cmdId) {
            return;
          }
          _eval(((_a = win.document.querySelector(`#${cmdId}`)) === null || _a === void 0 ? void 0 : _a.getAttribute("oncommand")) || "//");
        };
      }
      function getBuiltinEventKeyCallback(eventId) {
        return function() {
          const Zotero2 = basic_1.BasicTool.getZotero();
          const ZoteroPane2 = Zotero2.getActiveZoteroPane();
          ZoteroPane2.handleKeyPress({
            metaKey: true,
            ctrlKey: true,
            shiftKey: true,
            originalTarget: { id: "" },
            preventDefault: () => {
            },
            key: Zotero2.Prefs.get(`extensions.zotero.keys.${eventId}`, true)
          });
        };
      }
      var ELEM_KEY_IGNORE = ["key_copyCitation", "key_copyBibliography"];
      var PREF_KEYS = [
        {
          id: "extensions.zotero.keys.copySelectedItemCitationsToClipboard",
          modifiers: "accel,shift",
          elemId: "key_copyCitation",
          callback: getElementKeyCallback("key_copyCitation")
        },
        {
          id: "extensions.zotero.keys.copySelectedItemsToClipboard",
          modifiers: "accel,shift",
          elemId: "key_copyBibliography",
          callback: getElementKeyCallback("key_copyBibliography")
        },
        {
          id: "extensions.zotero.keys.library",
          modifiers: "accel,shift",
          callback: getBuiltinEventKeyCallback("library")
        },
        {
          id: "extensions.zotero.keys.newItem",
          modifiers: "accel,shift",
          callback: getBuiltinEventKeyCallback("newItem")
        },
        {
          id: "extensions.zotero.keys.newNote",
          modifiers: "accel,shift",
          callback: getBuiltinEventKeyCallback("newNote")
        },
        {
          id: "extensions.zotero.keys.quicksearch",
          modifiers: "accel,shift",
          callback: getBuiltinEventKeyCallback("quicksearch")
        },
        {
          id: "extensions.zotero.keys.saveToZotero",
          modifiers: "accel,shift",
          callback: getBuiltinEventKeyCallback("saveToZotero")
        },
        {
          id: "extensions.zotero.keys.sync",
          modifiers: "accel,shift",
          callback: getBuiltinEventKeyCallback("sync")
        },
        {
          id: "extensions.zotero.keys.toggleAllRead",
          modifiers: "accel,shift",
          callback: getBuiltinEventKeyCallback("toggleAllRead")
        },
        {
          id: "extensions.zotero.keys.toggleRead",
          modifiers: "accel,shift",
          callback: getBuiltinEventKeyCallback("toggleRead")
        }
      ];
      var BUILTIN_KEYS = [
        {
          id: "showItemCollection",
          modifiers: "",
          key: "Ctrl",
          callback: () => {
            const Zotero2 = basic_1.BasicTool.getZotero();
            const ZoteroPane2 = Zotero2.getActiveZoteroPane();
            ZoteroPane2.handleKeyUp({
              originalTarget: { id: ZoteroPane2.itemsView.id },
              keyCode: Zotero2.isWin ? 17 : 18
            });
          }
        },
        {
          id: "closeSelectedTab",
          modifiers: "accel",
          key: "W",
          callback: () => {
            const ztabs = basic_1.BasicTool.getZotero().getMainWindow().Zotero_Tabs;
            if (ztabs.selectedIndex > 0) {
              ztabs.close("");
            }
          }
        },
        {
          id: "undoCloseTab",
          modifiers: "accel,shift",
          key: "T",
          callback: () => {
            const ztabs = basic_1.BasicTool.getZotero().getMainWindow().Zotero_Tabs;
            ztabs.undoClose();
          }
        },
        {
          id: "selectNextTab",
          modifiers: "control",
          key: "Tab",
          callback: () => {
            const ztabs = basic_1.BasicTool.getZotero().getMainWindow().Zotero_Tabs;
            ztabs.selectPrev();
          }
        },
        {
          id: "selectPreviousTab",
          modifiers: "control,shift",
          key: "Tab",
          callback: () => {
            const ztabs = basic_1.BasicTool.getZotero().getMainWindow().Zotero_Tabs;
            ztabs.selectNext();
          }
        },
        {
          id: "selectTab1",
          modifiers: "accel",
          key: "1",
          callback: () => {
            const ztabs = basic_1.BasicTool.getZotero().getMainWindow().Zotero_Tabs;
            ztabs.jump(0);
          }
        },
        {
          id: "selectTab2",
          modifiers: "accel",
          key: "2",
          callback: () => {
            const ztabs = basic_1.BasicTool.getZotero().getMainWindow().Zotero_Tabs;
            ztabs.jump(1);
          }
        },
        {
          id: "selectTab3",
          modifiers: "accel",
          key: "3",
          callback: () => {
            const ztabs = basic_1.BasicTool.getZotero().getMainWindow().Zotero_Tabs;
            ztabs.jump(2);
          }
        },
        {
          id: "selectTab4",
          modifiers: "accel",
          key: "4",
          callback: () => {
            const ztabs = basic_1.BasicTool.getZotero().getMainWindow().Zotero_Tabs;
            ztabs.jump(3);
          }
        },
        {
          id: "selectTab5",
          modifiers: "accel",
          key: "5",
          callback: () => {
            const ztabs = basic_1.BasicTool.getZotero().getMainWindow().Zotero_Tabs;
            ztabs.jump(4);
          }
        },
        {
          id: "selectTab6",
          modifiers: "accel",
          key: "6",
          callback: () => {
            const ztabs = basic_1.BasicTool.getZotero().getMainWindow().Zotero_Tabs;
            ztabs.jump(5);
          }
        },
        {
          id: "selectTab7",
          modifiers: "accel",
          key: "7",
          callback: () => {
            const ztabs = basic_1.BasicTool.getZotero().getMainWindow().Zotero_Tabs;
            ztabs.jump(6);
          }
        },
        {
          id: "selectTab8",
          modifiers: "accel",
          key: "8",
          callback: () => {
            const ztabs = basic_1.BasicTool.getZotero().getMainWindow().Zotero_Tabs;
            ztabs.jump(7);
          }
        },
        {
          id: "selectTabLast",
          modifiers: "accel",
          key: "9",
          callback: () => {
            const ztabs = basic_1.BasicTool.getZotero().getMainWindow().Zotero_Tabs;
            ztabs.selectLast();
          }
        }
      ];
    }
  });

  // node_modules/zotero-plugin-toolkit/dist/helpers/clipboard.js
  var require_clipboard = __commonJS({
    "node_modules/zotero-plugin-toolkit/dist/helpers/clipboard.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ClipboardHelper = void 0;
      var basic_1 = require_basic();
      var ClipboardHelper = class {
        constructor() {
          this.transferable = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
          this.clipboardService = Components.classes["@mozilla.org/widget/clipboard;1"].getService(Components.interfaces.nsIClipboard);
          this.transferable.init(null);
        }
        addText(source, type) {
          const str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
          str.data = source;
          this.transferable.addDataFlavor(type);
          this.transferable.setTransferData(type, str, source.length * 2);
          return this;
        }
        addImage(source) {
          let parts = source.split(",");
          if (!parts[0].includes("base64")) {
            return this;
          }
          const basicTool2 = new basic_1.BasicTool();
          let mime = parts[0].match(/:(.*?);/)[1];
          let bstr = basicTool2.getGlobal("window").atob(parts[1]);
          let n = bstr.length;
          let u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          let imgTools = Components.classes["@mozilla.org/image/tools;1"].getService(Components.interfaces.imgITools);
          let mimeType;
          let img;
          if (basicTool2.getGlobal("Zotero").platformMajorVersion >= 102) {
            img = imgTools.decodeImageFromArrayBuffer(u8arr.buffer, mime);
            mimeType = "application/x-moz-nativeimage";
          } else {
            mimeType = `image/png`;
            img = Components.classes["@mozilla.org/supports-interface-pointer;1"].createInstance(Components.interfaces.nsISupportsInterfacePointer);
            img.data = imgTools.decodeImageFromArrayBuffer(u8arr.buffer, mimeType);
          }
          this.transferable.addDataFlavor(mimeType);
          this.transferable.setTransferData(mimeType, img, 0);
          return this;
        }
        copy() {
          this.clipboardService.setData(this.transferable, null, Components.interfaces.nsIClipboard.kGlobalClipboard);
          return this;
        }
      };
      exports.ClipboardHelper = ClipboardHelper;
    }
  });

  // node_modules/zotero-plugin-toolkit/dist/helpers/filePicker.js
  var require_filePicker = __commonJS({
    "node_modules/zotero-plugin-toolkit/dist/helpers/filePicker.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.FilePickerHelper = void 0;
      var basic_1 = require_basic();
      var FilePickerHelper = class {
        constructor(title, mode, filters, suggestion, window2, filterMask) {
          this.title = title;
          this.mode = mode;
          this.filters = filters;
          this.suggestion = suggestion;
          this.window = window2;
          this.filterMask = filterMask;
        }
        async open() {
          const basicTool2 = new basic_1.BasicTool();
          const backend = basicTool2.getGlobal("require")("zotero/modules/filePicker").default;
          const fp = new backend();
          fp.init(this.window || basicTool2.getGlobal("window"), this.title, this.getMode(fp));
          for (const [label, ext] of this.filters || []) {
            fp.appendFilter(label, ext);
          }
          if (this.filterMask)
            fp.appendFilters(this.getFilterMask(fp));
          if (this.suggestion)
            fp.defaultString = this.suggestion;
          const userChoice = await fp.show();
          switch (userChoice) {
            case fp.returnOK:
            case fp.returnReplace:
              return fp.file;
            default:
              return false;
          }
        }
        getMode(fp) {
          switch (this.mode) {
            case "open":
              return fp.modeOpen;
            case "save":
              return fp.modeSave;
            case "folder":
              return fp.modeGetFolder;
            case "multiple":
              return fp.modeOpenMultiple;
            default:
              return 0;
          }
        }
        getFilterMask(fp) {
          switch (this.filterMask) {
            case "all":
              return fp.filterAll;
            case "html":
              return fp.filterHTML;
            case "text":
              return fp.filterText;
            case "images":
              return fp.filterImages;
            case "xml":
              return fp.filterXML;
            case "apps":
              return fp.filterApps;
            case "urls":
              return fp.filterAllowURLs;
            case "audio":
              return fp.filterAudio;
            case "video":
              return fp.filterVideo;
            default:
              return 1;
          }
        }
      };
      exports.FilePickerHelper = FilePickerHelper;
    }
  });

  // node_modules/zotero-plugin-toolkit/dist/helpers/progressWindow.js
  var require_progressWindow = __commonJS({
    "node_modules/zotero-plugin-toolkit/dist/helpers/progressWindow.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ProgressWindowHelper = void 0;
      var basic_1 = require_basic();
      var ProgressWindowHelper = class extends Zotero.ProgressWindow {
        /**
         *
         * @param header window header
         * @param options
         */
        constructor(header, options = {
          closeOnClick: true,
          closeTime: 5e3
        }) {
          super(options);
          this.lines = [];
          this.closeTime = options.closeTime || 5e3;
          this.changeHeadline(header);
          this.originalShow = this.show;
          this.show = this.showWithTimer;
          if (options.closeOtherProgressWindows) {
            basic_1.BasicTool.getZotero().ProgressWindowSet.closeAll();
          }
        }
        /**
         * Create a new line
         * @param options
         */
        createLine(options) {
          const icon = this.getIcon(options.type, options.icon);
          const line = new this.ItemProgress(icon || "", options.text || "");
          if (typeof options.progress === "number") {
            line.setProgress(options.progress);
          }
          this.lines.push(line);
          return this;
        }
        /**
         * Change the line content
         * @param options
         */
        changeLine(options) {
          var _a;
          if (((_a = this.lines) === null || _a === void 0 ? void 0 : _a.length) === 0) {
            return this;
          }
          const idx = typeof options.idx !== "undefined" && options.idx >= 0 && options.idx < this.lines.length ? options.idx : 0;
          const icon = this.getIcon(options.type, options.icon);
          options.text && this.lines[idx].setText(options.text);
          icon && this.lines[idx].setIcon(icon);
          typeof options.progress === "number" && this.lines[idx].setProgress(options.progress);
          return this;
        }
        showWithTimer(closeTime = void 0) {
          this.originalShow();
          typeof closeTime !== "undefined" && (this.closeTime = closeTime);
          if (this.closeTime && this.closeTime > 0) {
            this.startCloseTimer(this.closeTime);
          }
          return this;
        }
        /**
         * Set custom icon uri for progress window
         * @param key
         * @param uri
         */
        static setIconURI(key, uri) {
          icons[key] = uri;
        }
        getIcon(type, defaultIcon) {
          return type && type in icons ? icons[type] : defaultIcon;
        }
      };
      exports.ProgressWindowHelper = ProgressWindowHelper;
      var icons = {
        success: "chrome://zotero/skin/tick.png",
        fail: "chrome://zotero/skin/cross.png"
      };
    }
  });

  // node_modules/zotero-plugin-toolkit/dist/helpers/virtualizedTable.js
  var require_virtualizedTable = __commonJS({
    "node_modules/zotero-plugin-toolkit/dist/helpers/virtualizedTable.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.VirtualizedTableHelper = void 0;
      var basic_1 = require_basic();
      var VirtualizedTableHelper = class {
        constructor(win) {
          this.window = win;
          this.basicTool = new basic_1.BasicTool();
          const Zotero2 = this.basicTool.getGlobal("Zotero");
          const _require = win.require;
          this.React = _require("react");
          this.ReactDOM = _require("react-dom");
          this.VirtualizedTable = _require("components/virtualized-table");
          this.IntlProvider = _require("react-intl").IntlProvider;
          this.props = {
            id: `${Zotero2.Utilities.randomString()}-${(/* @__PURE__ */ new Date()).getTime()}`,
            getRowCount: () => 0
          };
          this.localeStrings = Zotero2.Intl.strings;
        }
        setProp(...args) {
          if (args.length === 1) {
            Object.assign(this.props, args[0]);
          } else if (args.length === 2) {
            this.props[args[0]] = args[1];
          }
          return this;
        }
        /**
         * Set locale strings, which replaces the table header's label if matches. Default it's `Zotero.Intl.strings`
         * @param localeStrings
         */
        setLocale(localeStrings) {
          Object.assign(this.localeStrings, localeStrings);
          return this;
        }
        /**
         * Set container element id that the table will be rendered on.
         * @param id element id
         */
        setContainerId(id) {
          this.containerId = id;
          return this;
        }
        /**
         * Render the table.
         * @param selectId Which row to select after rendering
         * @param onfulfilled callback after successfully rendered
         * @param onrejected callback after rendering with error
         */
        render(selectId, onfulfilled, onrejected) {
          const refreshSelection = () => {
            this.treeInstance.invalidate();
            if (typeof selectId !== "undefined" && selectId >= 0) {
              this.treeInstance.selection.select(selectId);
            } else {
              this.treeInstance.selection.clearSelection();
            }
          };
          if (!this.treeInstance) {
            const vtableProps = Object.assign({}, this.props, {
              ref: (ref) => this.treeInstance = ref
            });
            if (vtableProps.getRowData && !vtableProps.renderItem) {
              Object.assign(vtableProps, {
                renderItem: this.VirtualizedTable.makeRowRenderer(vtableProps.getRowData)
              });
            }
            const elem = this.React.createElement(this.IntlProvider, { locale: Zotero.locale, messages: Zotero.Intl.strings }, this.React.createElement(this.VirtualizedTable, vtableProps));
            const container = this.window.document.getElementById(this.containerId);
            new Promise((resolve) => this.ReactDOM.render(elem, container, resolve)).then(() => {
              this.basicTool.getGlobal("setTimeout")(() => {
                refreshSelection();
              });
            }).then(onfulfilled, onrejected);
          } else {
            refreshSelection();
          }
          return this;
        }
      };
      exports.VirtualizedTableHelper = VirtualizedTableHelper;
    }
  });

  // node_modules/zotero-plugin-toolkit/dist/helpers/dialog.js
  var require_dialog = __commonJS({
    "node_modules/zotero-plugin-toolkit/dist/helpers/dialog.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.DialogHelper = void 0;
      var ui_1 = require_ui();
      var DialogHelper = class {
        /**
         * Create a dialog helper with row \* column grids.
         * @param row
         * @param column
         */
        constructor(row, column) {
          if (row <= 0 || column <= 0) {
            throw Error(`row and column must be positive integers.`);
          }
          this.elementProps = {
            tag: "vbox",
            attributes: { flex: 1 },
            styles: {
              width: "100%",
              height: "100%"
            },
            children: []
          };
          for (let i = 0; i < Math.max(row, 1); i++) {
            this.elementProps.children.push({
              tag: "hbox",
              attributes: { flex: 1 },
              children: []
            });
            for (let j = 0; j < Math.max(column, 1); j++) {
              this.elementProps.children[i].children.push({
                tag: "vbox",
                attributes: { flex: 1 },
                children: []
              });
            }
          }
          this.elementProps.children.push({
            tag: "hbox",
            attributes: { flex: 0, pack: "end" },
            children: []
          });
          this.dialogData = {};
        }
        /**
         * Add a cell at (row, column). Index starts from 0.
         * @param row
         * @param column
         * @param elementProps Cell element props. See {@link ElementProps}
         * @param cellFlex If the cell is flex. Default true.
         */
        addCell(row, column, elementProps, cellFlex = true) {
          if (row >= this.elementProps.children.length || column >= this.elementProps.children[row].children.length) {
            throw Error(`Cell index (${row}, ${column}) is invalid, maximum (${this.elementProps.children.length}, ${this.elementProps.children[0].children.length})`);
          }
          this.elementProps.children[row].children[column].children = [
            elementProps
          ];
          this.elementProps.children[row].children[column].attributes.flex = cellFlex ? 1 : 0;
          return this;
        }
        /**
         * Add a control button to the bottom of the dialog.
         * @param label Button label
         * @param id Button id.
         * The corresponding id of the last button user clicks before window exit will be set to `dialogData._lastButtonId`.
         * @param options.noClose Don't close window when clicking this button.
         * @param options.callback Callback of button click event.
         */
        addButton(label, id, options = {}) {
          id = id || `${Zotero.Utilities.randomString()}-${(/* @__PURE__ */ new Date()).getTime()}`;
          this.elementProps.children[this.elementProps.children.length - 1].children.push({
            tag: "vbox",
            styles: {
              margin: "10px"
            },
            children: [
              {
                tag: "button",
                namespace: "html",
                id,
                attributes: {
                  type: "button"
                },
                listeners: [
                  {
                    type: "click",
                    listener: (e) => {
                      this.dialogData._lastButtonId = id;
                      if (options.callback) {
                        options.callback(e);
                      }
                      if (!options.noClose) {
                        this.window.close();
                      }
                    }
                  }
                ],
                children: [
                  {
                    tag: "div",
                    styles: {
                      padding: "2.5px 15px"
                    },
                    properties: {
                      innerHTML: label
                    }
                  }
                ]
              }
            ]
          });
          return this;
        }
        /**
         * Dialog data.
         * @remarks
         * This object is passed to the dialog window.
         *
         * The control button id is in `dialogData._lastButtonId`;
         *
         * The data-binding values are in `dialogData`.
         * ```ts
         * interface DialogData {
         *   [key: string | number | symbol]: any;
         *   loadLock?: _ZoteroTypes.PromiseObject; // resolve after window load (auto-generated)
         *   loadCallback?: Function; // called after window load
         *   unloadLock?: _ZoteroTypes.PromiseObject; // resolve after window unload (auto-generated)
         *   unloadCallback?: Function; // called after window unload
         *   beforeUnloadCallback?: Function; // called before window unload when elements are accessable.
         * }
         * ```
         * @param dialogData
         */
        setDialogData(dialogData) {
          this.dialogData = dialogData;
          return this;
        }
        /**
         * Open the dialog
         * @param title Window title
         * @param windowFeatures.width Ignored if fitContent is `true`.
         * @param windowFeatures.height Ignored if fitContent is `true`.
         * @param windowFeatures.left
         * @param windowFeatures.top
         * @param windowFeatures.centerscreen Open window at the center of screen.
         * @param windowFeatures.resizable If window is resizable.
         * @param windowFeatures.fitContent Resize the window to content size after elements are loaded.
         * @param windowFeatures.noDialogMode Dialog mode window only has a close button. Set `true` to make maximize and minimize button visible.
         * @param windowFeatures.alwaysRaised Is the window always at the top.
         */
        open(title, windowFeatures = {
          centerscreen: true,
          resizable: true,
          fitContent: true
        }) {
          this.window = openDialog(`${Zotero.Utilities.randomString()}-${(/* @__PURE__ */ new Date()).getTime()}`, title, this.elementProps, this.dialogData, windowFeatures);
          return this;
        }
      };
      exports.DialogHelper = DialogHelper;
      function openDialog(targetId, title, elementProps, dialogData, windowFeatures = {
        centerscreen: true,
        resizable: true,
        fitContent: true
      }) {
        var _a, _b;
        const uiTool = new ui_1.UITool();
        uiTool.basicOptions.ui.enableElementJSONLog = false;
        uiTool.basicOptions.ui.enableElementRecord = false;
        const Zotero2 = uiTool.getGlobal("Zotero");
        dialogData = dialogData || {};
        if (!dialogData.loadLock) {
          dialogData.loadLock = Zotero2.Promise.defer();
        }
        if (!dialogData.unloadLock) {
          dialogData.unloadLock = Zotero2.Promise.defer();
        }
        let featureString = `resizable=${windowFeatures.resizable ? "yes" : "no"},`;
        if (windowFeatures.width || windowFeatures.height) {
          featureString += `width=${windowFeatures.width || 100},height=${windowFeatures.height || 100},`;
        }
        if (windowFeatures.left) {
          featureString += `left=${windowFeatures.left},`;
        }
        if (windowFeatures.top) {
          featureString += `top=${windowFeatures.top},`;
        }
        if (windowFeatures.centerscreen) {
          featureString += "centerscreen,";
        }
        if (windowFeatures.noDialogMode) {
          featureString += "dialog=no,";
        }
        if (windowFeatures.alwaysRaised) {
          featureString += "alwaysRaised=yes,";
        }
        const win = uiTool.getGlobal("openDialog")("about:blank", targetId || "_blank", featureString, dialogData);
        dialogData.loadLock.promise.then(() => {
          win.document.head.appendChild(uiTool.createElement(win.document, "title", {
            properties: { innerText: title }
          }));
          win.document.head.appendChild(uiTool.createElement(win.document, "style", {
            properties: {
              innerHTML: style
            }
          }));
          replaceElement(elementProps, uiTool);
          win.document.body.appendChild(uiTool.createElement(win.document, "fragment", {
            children: [elementProps]
          }));
          Array.from(win.document.querySelectorAll("*[data-bind]")).forEach((elem) => {
            const bindKey = elem.getAttribute("data-bind");
            const bindAttr = elem.getAttribute("data-attr");
            const bindProp = elem.getAttribute("data-prop");
            if (bindKey && dialogData && dialogData[bindKey]) {
              if (bindProp) {
                elem[bindProp] = dialogData[bindKey];
              } else {
                elem.setAttribute(bindAttr || "value", dialogData[bindKey]);
              }
            }
          });
          if (windowFeatures.fitContent) {
            win.sizeToContent();
          }
          win.focus();
        }).then(() => {
          (dialogData === null || dialogData === void 0 ? void 0 : dialogData.loadCallback) && dialogData.loadCallback();
        });
        dialogData.unloadLock.promise.then(() => {
          (dialogData === null || dialogData === void 0 ? void 0 : dialogData.unloadCallback) && dialogData.unloadCallback();
        });
        win.addEventListener("DOMContentLoaded", function onWindowLoad(ev) {
          var _a2, _b2;
          (_b2 = (_a2 = win.arguments[0]) === null || _a2 === void 0 ? void 0 : _a2.loadLock) === null || _b2 === void 0 ? void 0 : _b2.resolve();
          win.removeEventListener("DOMContentLoaded", onWindowLoad, false);
        }, false);
        win.addEventListener("beforeunload", function onWindowBeforeUnload(ev) {
          Array.from(win.document.querySelectorAll("*[data-bind]")).forEach((elem) => {
            const dialogData2 = this.window.arguments[0];
            const bindKey = elem.getAttribute("data-bind");
            const bindAttr = elem.getAttribute("data-attr");
            const bindProp = elem.getAttribute("data-prop");
            if (bindKey && dialogData2) {
              if (bindProp) {
                dialogData2[bindKey] = elem[bindProp];
              } else {
                dialogData2[bindKey] = elem.getAttribute(bindAttr || "value");
              }
            }
          });
          this.window.removeEventListener("beforeunload", onWindowBeforeUnload, false);
          (dialogData === null || dialogData === void 0 ? void 0 : dialogData.beforeUnloadCallback) && dialogData.beforeUnloadCallback();
        });
        win.addEventListener("unload", function onWindowUnload(ev) {
          var _a2, _b2, _c;
          if ((_a2 = this.window.arguments[0]) === null || _a2 === void 0 ? void 0 : _a2.loadLock.promise.isPending()) {
            return;
          }
          (_c = (_b2 = this.window.arguments[0]) === null || _b2 === void 0 ? void 0 : _b2.unloadLock) === null || _c === void 0 ? void 0 : _c.resolve();
          this.window.removeEventListener("unload", onWindowUnload, false);
        });
        if (win.document.readyState === "complete") {
          (_b = (_a = win.arguments[0]) === null || _a === void 0 ? void 0 : _a.loadLock) === null || _b === void 0 ? void 0 : _b.resolve();
        }
        return win;
      }
      function replaceElement(elementProps, uiTool) {
        var _a, _b, _c, _d, _e, _f, _g;
        let checkChildren = true;
        if (elementProps.tag === "select" && uiTool.isZotero7()) {
          checkChildren = false;
          const customSelectProps = {
            tag: "div",
            classList: ["dropdown"],
            listeners: [
              {
                type: "mouseleave",
                listener: (ev) => {
                  const select = ev.target.querySelector("select");
                  select === null || select === void 0 ? void 0 : select.blur();
                }
              }
            ],
            children: [
              Object.assign({}, elementProps, {
                tag: "select",
                listeners: [
                  {
                    type: "focus",
                    listener: (ev) => {
                      var _a2;
                      const select = ev.target;
                      const dropdown = (_a2 = select.parentElement) === null || _a2 === void 0 ? void 0 : _a2.querySelector(".dropdown-content");
                      dropdown && (dropdown.style.display = "block");
                      select.setAttribute("focus", "true");
                    }
                  },
                  {
                    type: "blur",
                    listener: (ev) => {
                      var _a2;
                      const select = ev.target;
                      const dropdown = (_a2 = select.parentElement) === null || _a2 === void 0 ? void 0 : _a2.querySelector(".dropdown-content");
                      dropdown && (dropdown.style.display = "none");
                      select.removeAttribute("focus");
                    }
                  }
                ]
              }),
              {
                tag: "div",
                classList: ["dropdown-content"],
                children: (_a = elementProps.children) === null || _a === void 0 ? void 0 : _a.map((option) => {
                  var _a2, _b2, _c2;
                  return {
                    tag: "p",
                    attributes: {
                      value: (_a2 = option.properties) === null || _a2 === void 0 ? void 0 : _a2.value
                    },
                    properties: {
                      innerHTML: ((_b2 = option.properties) === null || _b2 === void 0 ? void 0 : _b2.innerHTML) || ((_c2 = option.properties) === null || _c2 === void 0 ? void 0 : _c2.innerText)
                    },
                    classList: ["dropdown-item"],
                    listeners: [
                      {
                        type: "click",
                        listener: (ev) => {
                          var _a3;
                          const select = (_a3 = ev.target.parentElement) === null || _a3 === void 0 ? void 0 : _a3.previousElementSibling;
                          select && (select.value = ev.target.getAttribute("value") || "");
                          select === null || select === void 0 ? void 0 : select.blur();
                        }
                      }
                    ]
                  };
                })
              }
            ]
          };
          for (const key in elementProps) {
            delete elementProps[key];
          }
          Object.assign(elementProps, customSelectProps);
        } else if (elementProps.tag === "a") {
          const href = ((_b = elementProps === null || elementProps === void 0 ? void 0 : elementProps.properties) === null || _b === void 0 ? void 0 : _b.href) || "";
          (_c = elementProps.properties) !== null && _c !== void 0 ? _c : elementProps.properties = {};
          elementProps.properties.href = "javascript:void(0);";
          (_d = elementProps.attributes) !== null && _d !== void 0 ? _d : elementProps.attributes = {};
          elementProps.attributes["zotero-href"] = href;
          (_e = elementProps.listeners) !== null && _e !== void 0 ? _e : elementProps.listeners = [];
          elementProps.listeners.push({
            type: "click",
            listener: (ev) => {
              var _a2;
              const href2 = (_a2 = ev.target) === null || _a2 === void 0 ? void 0 : _a2.getAttribute("zotero-href");
              href2 && uiTool.getGlobal("Zotero").launchURL(href2);
            }
          });
          (_f = elementProps.classList) !== null && _f !== void 0 ? _f : elementProps.classList = [];
          elementProps.classList.push("zotero-text-link");
        }
        if (checkChildren) {
          (_g = elementProps.children) === null || _g === void 0 ? void 0 : _g.forEach((child) => replaceElement(child, uiTool));
        }
      }
      var style = `
html,
body {
  font-size: calc(12px * 1);
}
.zotero-text-link {
  -moz-user-focus: normal;
  color: -moz-nativehyperlinktext;
  text-decoration: underline;
  border: 1px solid transparent;
  cursor: pointer;
}
.dropdown {
  position: relative;
  display: inline-block;
}
.dropdown-content {
  display: none;
  position: absolute;
  background-color: #f9f9fb;
  min-width: 160px;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.5);
  border-radius: 5px;
  padding: 5px 0 5px 0;
  z-index: 999;
}
.dropdown-item {
  margin: 0px;
  padding: 5px 10px 5px 10px;
}
.dropdown-item:hover {
  background-color: #efeff3;
}
`;
    }
  });

  // node_modules/zotero-plugin-toolkit/dist/managers/readerInstance.js
  var require_readerInstance = __commonJS({
    "node_modules/zotero-plugin-toolkit/dist/managers/readerInstance.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ReaderInstanceManager = void 0;
      var basic_1 = require_basic();
      var toolkitGlobal_1 = __importDefault(require_toolkitGlobal());
      var ReaderInstanceManager = class extends basic_1.ManagerTool {
        constructor(base) {
          super(base);
          this.cachedHookIds = [];
          this.initializeGlobal();
        }
        /**
         * Register a reader instance hook
         * @remarks
         * initialized: called when reader instance is ready
         * @param type hook type
         * @param id hook id
         * @param hook
         */
        register(type, id, hook) {
          const Zotero2 = this.getGlobal("Zotero");
          switch (type) {
            case "initialized":
              {
                this.globalCache.initializedHooks[id] = hook;
                Zotero2.Reader._readers.forEach(hook);
              }
              break;
            default:
              break;
          }
          this.cachedHookIds.push(id);
        }
        /**
         * Unregister hook by id
         * @param id
         */
        unregister(id) {
          delete this.globalCache.initializedHooks[id];
        }
        /**
         * Unregister all hooks
         */
        unregisterAll() {
          this.cachedHookIds.forEach((id) => this.unregister(id));
        }
        initializeGlobal() {
          this.globalCache = toolkitGlobal_1.default.getInstance().readerInstance;
          if (!this.globalCache._ready) {
            this.globalCache._ready = true;
            const Zotero2 = this.getGlobal("Zotero");
            const _this = this;
            Zotero2.Reader._readers = new (this.getGlobal("Proxy"))(Zotero2.Reader._readers, {
              set(target, p, newValue, receiver) {
                target[p] = newValue;
                if (!isNaN(Number(p))) {
                  Object.values(_this.globalCache.initializedHooks).forEach((hook) => {
                    try {
                      hook(newValue);
                    } catch (e) {
                      _this.log(e);
                    }
                  });
                }
                return true;
              }
            });
          }
        }
      };
      exports.ReaderInstanceManager = ReaderInstanceManager;
    }
  });

  // node_modules/zotero-plugin-toolkit/dist/managers/itemBox.js
  var require_itemBox = __commonJS({
    "node_modules/zotero-plugin-toolkit/dist/managers/itemBox.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ItemBoxManager = void 0;
      var basic_1 = require_basic();
      var fieldHook_1 = require_fieldHook();
      var toolkitGlobal_1 = __importDefault(require_toolkitGlobal());
      var ItemBoxManager = class extends basic_1.ManagerTool {
        constructor(base) {
          super(base);
          this.initializationLock = this.getGlobal("Zotero").Promise.defer();
          this.localCache = [];
          this.fieldHooks = new fieldHook_1.FieldHookManager();
          this.initializeGlobal();
        }
        /**
         * Register a custom row
         * @param field Field name. Used in `getField` and `setField`.
         * @param displayName The row header display text.
         * @param getFieldHook Called when loading row content.
         * If you registered the getField hook somewhere else (in ItemBox or FieldHooks), leave it undefined.
         * @param options
         * @param options.editable If the row is editable.
         * To edit a row, either the `options.setFieldHook` or a custom hook for `setField` created by FieldHookManager is required.
         * @param options.setFieldHook The `setField` hook.
         * @param options.index Target index. By default it's placed at the end of rows.
         * @param options.multiline If the row content is multiline.
         * @param options.collapsible If the row content is collapsible (like abstract field).
         */
        async register(field, displayName, getFieldHook, options = {}) {
          this.fieldHooks.register("isFieldOfBase", field, () => false);
          if (getFieldHook) {
            this.fieldHooks.register("getField", field, getFieldHook);
          }
          if (options.editable && options.setFieldHook) {
            this.fieldHooks.register("setField", field, options.setFieldHook);
          }
          this.globalCache.fieldOptions[field] = {
            field,
            displayName,
            editable: options.editable || false,
            index: options.index || -1,
            multiline: options.multiline || false,
            collapsible: options.collapsible || false
          };
          this.localCache.push(field);
          await this.initializationLock.promise;
          this.refresh();
        }
        /**
         * Unregister a row of specific field.
         * @param field
         * @param options Skip unregister of certain hooks.
         * This is useful when the hook is not initialized by this instance
         * @param options.skipRefresh Skip refresh after unregister.
         */
        unregister(field, options = {}) {
          delete this.globalCache.fieldOptions[field];
          if (!options.skipIsFieldOfBase) {
            this.fieldHooks.unregister("isFieldOfBase", field);
          }
          if (!options.skipGetField) {
            this.fieldHooks.unregister("getField", field);
          }
          if (!options.skipSetField) {
            this.fieldHooks.unregister("setField", field);
          }
          const idx = this.localCache.indexOf(field);
          if (idx > -1) {
            this.localCache.splice(idx, 1);
          }
          if (!options.skipRefresh) {
            this.refresh();
          }
        }
        unregisterAll() {
          [...this.localCache].forEach((field) => this.unregister(field, {
            skipGetField: true,
            skipSetField: true,
            skipIsFieldOfBase: true,
            skipRefresh: true
          }));
          this.fieldHooks.unregisterAll();
          this.refresh();
        }
        /**
         * Refresh all item boxes.
         */
        refresh() {
          try {
            Array.from(this.getGlobal("document").querySelectorAll(this.isZotero7() ? "item-box" : "zoteroitembox")).forEach((elem) => elem.refresh());
          } catch (e) {
            this.log(e);
          }
        }
        async initializeGlobal() {
          const Zotero2 = this.getGlobal("Zotero");
          await Zotero2.uiReadyPromise;
          const window2 = this.getGlobal("window");
          const globalCache = this.globalCache = toolkitGlobal_1.default.getInstance().itemBox;
          const inZotero7 = this.isZotero7();
          if (!globalCache._ready) {
            globalCache._ready = true;
            let itemBoxInstance;
            if (inZotero7) {
              itemBoxInstance = new (this.getGlobal("customElements").get("item-box"))();
            } else {
              itemBoxInstance = window2.document.querySelector("#zotero-editpane-item-box");
              const wait = 5e3;
              let t = 0;
              while (!itemBoxInstance && t < wait) {
                itemBoxInstance = window2.document.querySelector("#zotero-editpane-item-box");
                await Zotero2.Promise.delay(10);
                t += 10;
              }
              if (!itemBoxInstance) {
                globalCache._ready = false;
                this.log("ItemBox initialization failed");
                return;
              }
            }
            this.patch(itemBoxInstance.__proto__, "refresh", this.patchSign, (original) => function() {
              const originalThis = this;
              original.apply(originalThis, arguments);
              for (const extraField of Object.values(globalCache.fieldOptions)) {
                const fieldHeader = document.createElement(inZotero7 ? "th" : "label");
                fieldHeader.setAttribute("fieldname", extraField.field);
                const prefKey = `extensions.zotero.pluginToolkit.fieldCollapsed.${extraField.field}`;
                const collapsed = extraField.multiline && extraField.collapsible && Zotero2.Prefs.get(prefKey, true);
                let headerContent = extraField.displayName;
                if (collapsed) {
                  headerContent = `(...)${headerContent}`;
                }
                if (inZotero7) {
                  let label = document.createElement("label");
                  label.className = "key";
                  label.textContent = headerContent;
                  fieldHeader.appendChild(label);
                } else {
                  fieldHeader.setAttribute("value", headerContent);
                }
                const _clickable = originalThis.clickable;
                originalThis.clickable = extraField.editable;
                const fieldValue = originalThis.createValueElement(originalThis.item.getField(extraField.field), extraField.field, 1099);
                originalThis.clickable = _clickable;
                if (extraField.multiline && !Zotero2.Prefs.get(prefKey, true)) {
                  fieldValue.classList.add("multiline");
                } else if (!inZotero7) {
                  fieldValue.setAttribute("crop", "end");
                  fieldValue.setAttribute("value", fieldValue.innerHTML);
                  fieldValue.innerHTML = "";
                }
                if (extraField.collapsible) {
                  fieldHeader.addEventListener("click", function(ev) {
                    Zotero2.Prefs.set(prefKey, !(Zotero2.Prefs.get(prefKey, true) || false), true);
                    originalThis.refresh();
                  });
                }
                fieldHeader.addEventListener("click", inZotero7 ? function(ev) {
                  var _a;
                  const inputField = (_a = ev.currentTarget.nextElementSibling) === null || _a === void 0 ? void 0 : _a.querySelector("input, textarea");
                  if (inputField) {
                    inputField.blur();
                  }
                } : function(ev) {
                  var _a;
                  const inputField = (_a = ev.currentTarget.nextElementSibling) === null || _a === void 0 ? void 0 : _a.inputField;
                  if (inputField) {
                    inputField.blur();
                  }
                });
                const table = inZotero7 ? originalThis._infoTable : originalThis._dynamicFields;
                let fieldIndex = extraField.index;
                if (fieldIndex === 0) {
                  fieldIndex = 1;
                }
                if (fieldIndex && fieldIndex >= 0 && fieldIndex < table.children.length) {
                  originalThis._beforeRow = table.children[fieldIndex];
                  originalThis.addDynamicRow(fieldHeader, fieldValue, true);
                } else {
                  originalThis.addDynamicRow(fieldHeader, fieldValue);
                }
              }
            });
          }
          this.initializationLock.resolve();
        }
      };
      exports.ItemBoxManager = ItemBoxManager;
    }
  });

  // node_modules/zotero-plugin-toolkit/dist/index.js
  var require_dist = __commonJS({
    "node_modules/zotero-plugin-toolkit/dist/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ZoteroToolkit = void 0;
      var basic_1 = require_basic();
      var ui_1 = require_ui();
      var reader_1 = require_reader();
      var extraField_1 = require_extraField();
      var itemTree_1 = require_itemTree();
      var prompt_1 = require_prompt();
      var libraryTabPanel_1 = require_libraryTabPanel();
      var readerTabPanel_1 = require_readerTabPanel();
      var menu_1 = require_menu();
      var preferencePane_1 = require_preferencePane();
      var shortcut_1 = require_shortcut();
      var clipboard_1 = require_clipboard();
      var filePicker_1 = require_filePicker();
      var progressWindow_1 = require_progressWindow();
      var virtualizedTable_1 = require_virtualizedTable();
      var dialog_1 = require_dialog();
      var readerInstance_1 = require_readerInstance();
      var fieldHook_1 = require_fieldHook();
      var itemBox_1 = require_itemBox();
      var ZoteroToolkit2 = class extends basic_1.BasicTool {
        constructor() {
          super();
          this.UI = new ui_1.UITool(this);
          this.Reader = new reader_1.ReaderTool(this);
          this.ExtraField = new extraField_1.ExtraFieldTool(this);
          this.FieldHooks = new fieldHook_1.FieldHookManager(this);
          this.ItemTree = new itemTree_1.ItemTreeManager(this);
          this.ItemBox = new itemBox_1.ItemBoxManager(this);
          this.Prompt = new prompt_1.PromptManager(this);
          this.LibraryTabPanel = new libraryTabPanel_1.LibraryTabPanelManager(this);
          this.ReaderTabPanel = new readerTabPanel_1.ReaderTabPanelManager(this);
          this.ReaderInstance = new readerInstance_1.ReaderInstanceManager(this);
          this.Menu = new menu_1.MenuManager(this);
          this.PreferencePane = new preferencePane_1.PreferencePaneManager(this);
          this.Shortcut = new shortcut_1.ShortcutManager(this);
          this.Clipboard = clipboard_1.ClipboardHelper;
          this.FilePicker = filePicker_1.FilePickerHelper;
          this.ProgressWindow = progressWindow_1.ProgressWindowHelper;
          this.VirtualizedTable = virtualizedTable_1.VirtualizedTableHelper;
          this.Dialog = dialog_1.DialogHelper;
        }
        /**
         * Unregister everything created by managers.
         */
        unregisterAll() {
          (0, basic_1.unregister)(this);
        }
      };
      exports.ZoteroToolkit = ZoteroToolkit2;
      exports.default = ZoteroToolkit2;
    }
  });

  // src/index.ts
  var import_basic2 = __toESM(require_basic());

  // src/addon.ts
  var import_dist = __toESM(require_dist());

  // package.json
  var config = {
    addonName: "Green Frog",
    addonID: "greenfrog@redleafnew.me",
    addonRef: "greenfrog",
    addonInstance: "greenfrog",
    releasepage: "https://github.com/redleafnew/zotero-updateifsE/releases/latest/download/greenfrog.xpi",
    updaterdf: "https://raw.githubusercontent.com/redleafnew/zotero-updateifsE/bootstrap/update.json"
  };

  // src/modules/locale.ts
  function initLocale() {
    addon.data.locale = {
      stringBundle: Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService).createBundle(`chrome://${config.addonRef}/locale/addon.properties`)
    };
  }
  function getString(localString) {
    var _a;
    return (_a = addon.data.locale) == null ? void 0 : _a.stringBundle.GetStringFromName(localString);
  }

  // src/modules/njau.ts
  function njauCore(item) {
    var classOne = [
      "\u75C5\u6BD2\u5B66\u62A5",
      "\u6750\u6599\u7814\u7A76\u5B66\u62A5",
      "\u8349\u4E1A\u5B66\u62A5",
      "\u6D4B\u7ED8\u5B66\u62A5",
      "\u5927\u8C46\u79D1\u5B66",
      "\u5730\u7406\u5B66\u62A5",
      "\u5206\u6790\u79D1\u5B66\u5B66\u62A5",
      "\u590D\u5408\u6750\u6599\u5B66\u62A5",
      "\u7BA1\u7406\u79D1\u5B66\u5B66\u62A5",
      "\u5149\u5B66\u5B66\u62A5",
      "\u6838\u519C\u5B66\u62A5",
      "\u5316\u5B66\u901A\u62A5",
      "\u73AF\u5883\u79D1\u5B66",
      "\u673A\u68B0\u5DE5\u7A0B\u5B66\u62A5",
      "\u8BA1\u7B97\u673A\u5B66\u62A5",
      "\u8BA1\u7B97\u673A\u7814\u7A76\u4E0E\u53D1\u5C55",
      "\u89E3\u5256\u5B66\u62A5",
      "\u83CC\u7269\u5B66\u62A5",
      "\u6606\u866B\u5B66\u62A5",
      "\u6797\u4E1A\u79D1\u5B66",
      "\u9EA6\u7C7B\u4F5C\u7269\u5B66\u62A5",
      "\u68C9\u82B1\u5B66\u62A5",
      "\u6469\u64E6\u5B66\u5B66\u62A5",
      "\u5357\u4EAC\u519C\u4E1A\u5927\u5B66\u5B66\u62A5",
      "\u519C\u4E1A\u5DE5\u7A0B\u5B66\u62A5",
      "\u519C\u4E1A\u673A\u68B0\u5B66\u62A5",
      "\u6C14\u8C61\u5B66\u62A5",
      "\u8F6F\u4EF6\u5B66\u62A5",
      "\u751F\u6001\u5B66\u62A5",
      "\u751F\u7269\u591A\u6837\u6027",
      "\u751F\u7269\u5DE5\u7A0B\u5B66\u62A5",
      "\u98DF\u54C1\u79D1\u5B66",
      "\u6570\u5B66\u5B66\u62A5",
      "\u6C34\u4EA7\u5B66\u62A5",
      "\u6C34\u571F\u4FDD\u6301\u5B66\u62A5",
      "\u592A\u9633\u80FD\u5B66\u62A5",
      "\u571F\u58E4\u5B66\u62A5",
      "\u5FAE\u751F\u7269\u5B66\u62A5",
      "\u755C\u7267\u517D\u533B\u5B66\u62A5",
      "\u5CA9\u571F\u5DE5\u7A0B\u5B66\u62A5",
      "\u9065\u611F\u5B66\u62A5",
      "\u836F\u5B66\u5B66\u62A5",
      "\u8425\u517B\u5B66\u62A5",
      "\u5E94\u7528\u751F\u6001\u5B66\u62A5",
      "\u56ED\u827A\u5B66\u62A5",
      "\u632F\u52A8\u5DE5\u7A0B\u5B66\u62A5",
      "\u690D\u7269\u4FDD\u62A4\u5B66\u62A5",
      "\u690D\u7269\u75C5\u7406\u5B66\u62A5",
      "\u690D\u7269\u751F\u6001\u5B66\u62A5",
      "\u690D\u7269\u5B66\u62A5",
      "\u690D\u7269\u8425\u517B\u4E0E\u80A5\u6599\u5B66\u62A5",
      "\u4E2D\u56FD\u516C\u8DEF\u5B66\u62A5",
      "\u4E2D\u56FD\u73AF\u5883\u79D1\u5B66",
      "\u4E2D\u56FD\u6FC0\u5149",
      "\u4E2D\u56FD\u519C\u4E1A\u79D1\u5B66",
      "\u4E2D\u56FD\u751F\u7269\u5316\u5B66\u4E0E\u5206\u5B50\u751F\u7269\u5B66\u62A5",
      "\u4E2D\u56FD\u6C34\u7A3B\u79D1\u5B66",
      "\u4E2D\u56FD\u4E2D\u836F\u6742\u5FD7",
      "\u4E2D\u534E\u6D41\u884C\u75C5\u5B66\u6742\u5FD7",
      "\u4E2D\u534E\u5FAE\u751F\u7269\u5B66\u548C\u514D\u75AB\u5B66\u6742\u5FD7",
      "\u81EA\u52A8\u5316\u5B66\u62A5",
      "\u81EA\u7136\u8D44\u6E90\u5B66\u62A5",
      "\u4F5C\u7269\u5B66\u62A5"
    ];
    var classTwo = [
      "\u7206\u70B8\u4E0E\u51B2\u51FB",
      "\u6750\u6599\u5DE5\u7A0B",
      "\u6750\u6599\u79D1\u5B66\u4E0E\u5DE5\u7A0B\u5B66\u62A5",
      "\u6750\u6599\u79D1\u5B66\u4E0E\u5DE5\u827A",
      "\u957F\u6C5F\u6D41\u57DF\u8D44\u6E90\u4E0E\u73AF\u5883",
      "\u5730\u7406\u79D1\u5B66",
      "\u5730\u7406\u7814\u7A76",
      "\u5730\u7403\u5316\u5B66",
      "\u5730\u7403\u79D1\u5B66\u8FDB\u5C55",
      "\u7535\u5B50\u4E0E\u4FE1\u606F\u5B66\u62A5",
      "\u52A8\u7269\u5206\u7C7B\u5B66\u62A5",
      "\u52A8\u7269\u5B66\u7814\u7A76",
      "\u52A8\u7269\u5B66\u6742\u5FD7",
      "\u53D1\u5149\u5B66\u62A5",
      "\u5206\u6790\u6D4B\u8BD5\u5B66\u62A5",
      "\u5206\u6790\u8BD5\u9A8C\u5BA4",
      "\u5206\u5B50\u7EC6\u80DE\u751F\u7269\u5B66\u62A5",
      "\u9AD8\u5206\u5B50\u6750\u6599\u79D1\u5B66\u4E0E\u5DE5\u7A0B",
      "\u5DE5\u7A0B\u529B\u5B66",
      "\u7BA1\u7406\u5DE5\u7A0B\u5B66\u62A5",
      "\u5149\u5B50\u5B66\u62A5",
      "\u6D77\u6D0B\u4E0E\u6E56\u6CCA",
      "\u73AF\u5883\u5DE5\u7A0B\u5B66\u62A5",
      "\u73AF\u5883\u5316\u5B66",
      "\u73AF\u5883\u79D1\u5B66\u5B66\u62A5",
      "\u673A\u5668\u4EBA",
      "\u673A\u68B0\u8BBE\u8BA1",
      "\u8BA1\u7B97\u673A\u8F85\u52A9\u8BBE\u8BA1\u4E0E\u56FE\u578B\u5B66\u5B66\u62A5",
      "\u8BA1\u7B97\u673A\u96C6\u6210\u5236\u9020\u7CFB\u7EDF-CIMS",
      "\u8BA1\u7B97\u673A\u79D1\u5B66",
      "\u7CBE\u7EC6\u5316\u5DE5",
      "\u63A7\u5236\u4E0E\u51B3\u7B56",
      "\u6606\u866B\u77E5\u8BC6",
      "\u529B\u5B66\u8FDB\u5C55",
      "\u6797\u4E1A\u79D1\u5B66\u7814\u7A76",
      "\u514D\u75AB\u5B66\u6742\u5FD7",
      "\u519C\u4E1A\u73AF\u5883\u79D1\u5B66\u5B66\u62A5",
      "\u519C\u4E1A\u751F\u7269\u6280\u672F\u5B66\u62A5",
      "\u519C\u4E1A\u73B0\u4EE3\u5316\u7814\u7A76",
      "\u6C7D\u8F66\u5DE5\u7A0B",
      "\u8272\u8C31",
      "\u751F\u6001\u5B66\u6742\u5FD7",
      "\u751F\u7269\u7269\u7406\u5B66\u62A5",
      "\u98DF\u54C1\u5DE5\u4E1A\u79D1\u6280",
      "\u98DF\u54C1\u4E0E\u53D1\u9175\u5DE5\u4E1A",
      "\u98DF\u54C1\u4E0E\u751F\u7269\u6280\u672F\u5B66\u62A5",
      "\u6570\u5B66\u8FDB\u5C55",
      "\u6570\u5B66\u5E74\u520AA\u8F91",
      "\u6C34\u751F\u751F\u7269\u5B66\u62A5",
      "\u6C34\u571F\u4FDD\u6301\u901A\u62A5",
      "\u571F\u58E4",
      "\u571F\u58E4\u901A\u62A5",
      "\u5FAE\u751F\u7269\u5B66\u901A\u62A5",
      "\u7EC6\u80DE\u4E0E\u5206\u5B50\u514D\u75AB\u5B66\u6742\u5FD7",
      "\u897F\u5317\u690D\u7269\u5B66\u62A5",
      "\u5C0F\u578B\u5FAE\u578B\u8BA1\u7B97\u673A\u7CFB\u7EDF",
      "\u5CA9\u77F3\u5B66\u62A5",
      "\u9065\u611F\u6280\u672F\u4E0E\u5E94\u7528",
      "\u4EEA\u5668\u4EEA\u8868\u5B66\u62A5",
      "\u9057\u4F20",
      "\u5E94\u7528\u5316\u5B66",
      "\u5E94\u7528\u6C14\u8C61\u5B66\u62A5",
      "\u5E94\u7528\u6570\u5B66\u5B66\u62A5",
      "\u5E94\u7528\u4E0E\u73AF\u5883\u751F\u7269\u5B66\u62A5",
      "\u6742\u4EA4\u6C34\u7A3B",
      "\u632F\u52A8\u4E0E\u51B2\u51FB",
      "\u690D\u7269\u4FDD\u62A4",
      "\u690D\u7269\u751F\u7406\u5B66\u901A\u8BAF",
      "\u690D\u7269\u7814\u7A76",
      "\u690D\u7269\u9057\u4F20\u8D44\u6E90\u5B66\u62A5",
      "\u690D\u7269\u8D44\u6E90\u4E0E\u73AF\u5883\u5B66\u62A5",
      "\u4E2D\u8349\u836F",
      "\u4E2D\u56FD\u8349\u5730\u5B66\u62A5",
      "\u4E2D\u56FD\u7ED9\u6C34\u6392\u6C34",
      "\u4E2D\u56FD\u673A\u68B0\u5DE5\u7A0B",
      "\u4E2D\u56FD\u5BC4\u751F\u866B\u5B66\u4E0E\u5BC4\u751F\u866B\u75C5\u6742\u5FD7",
      "\u4E2D\u56FD\u7CAE\u6CB9\u5B66\u62A5",
      "\u4E2D\u56FD\u4EBA\u517D\u5171\u60A3\u75C5\u5B66\u62A5",
      "\u4E2D\u56FD\u751F\u7269\u9632\u6CBB",
      "\u4E2D\u56FD\u751F\u7269\u533B\u5B66\u5DE5\u7A0B\u5B66\u62A5",
      "\u4E2D\u56FD\u517D\u533B\u5B66\u62A5",
      "\u4E2D\u56FD\u6C34\u4EA7\u79D1\u5B66",
      "\u4E2D\u56FD\u56FE\u8C61\u56FE\u5F62\u5B66\u62A5",
      "\u4E2D\u56FD\u836F\u7406\u5B66\u901A\u62A5",
      "\u4E2D\u56FD\u836F\u5B66\u6742\u5FD7",
      "\u4E2D\u56FD\u6CB9\u6599\u4F5C\u7269\u5B66\u62A5",
      "\u4E2D\u56FD\u6CB9\u8102",
      "\u4E2D\u56FD\u517D\u533B\u79D1\u5B66",
      "\u4E2D\u836F\u6750",
      "\u8D44\u6E90\u79D1\u5B66",
      "\u8349\u5730\u5B66\u62A5",
      "\u8336\u53F6\u79D1\u5B66*",
      "\u519C\u836F\u5B66\u5B66\u62A5",
      "\u6C14\u5019\u53D8\u5316\u7814\u7A76\u8FDB\u5C55"
    ];
    var pubT = item.getField("publicationTitle");
    if (classOne.includes(pubT)) {
      return "\u4E00\u7C7B\u6838\u5FC3";
    } else if (classTwo.includes(pubT)) {
      return "\u4E8C\u7C7B\u6838\u5FC3";
    } else {
      return void 0;
    }
  }
  function njauJournal(item) {
    return __async(this, null, function* () {
      var pubT = item.getField("publicationTitle");
      var body = `keyword=${encodeURIComponent(pubT)}`;
      var resp = yield Zotero.HTTP.request(
        "POST",
        "http://phq.njau.edu.cn/admin_getJournal.action",
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36 Edg/114.0.1823.37"
          },
          body
        }
      );
      var AllJour = resp.responseText;
      return JSON.parse(AllJour)["classname"];
    });
  }

  // src/modules/abb.ts
  function getAbbEx(pubT) {
    var fullAbb = [
      {
        "full": "Proceedings of the National Academy of Sciences",
        "abb_no_dot": "Proc Natl Acad Sci",
        "abb_with_dot": "Proc. Natl. Acad. Sci.",
        "record": 1
      },
      {
        "full": "test",
        "abb_no_dot": "tt",
        "abb_with_dot": "test.",
        "record": 1
      }
    ];
    var record0 = {
      "record": 0
    };
    var jourAbbs = fullAbb.filter((x) => x.full === pubT);
    if (jourAbbs["0"]) {
      return jourAbbs["0"];
    } else {
      return record0;
    }
  }

  // src/modules/examples.ts
  function example(target, propertyKey, descriptor) {
    const original = descriptor.value;
    descriptor.value = function(...args) {
      try {
        ztoolkit.log(`Calling example ${target.name}.${String(propertyKey)}`);
        return original.apply(this, args);
      } catch (e) {
        ztoolkit.log(`Error in example ${target.name}.${String(propertyKey)}`, e);
        throw e;
      }
    };
    return descriptor;
  }
  var BasicExampleFactory = class {
    static registerNotifier() {
      const callback = {
        notify: (event, type, ids, extraData) => __async(this, null, function* () {
          if (!(addon == null ? void 0 : addon.data.alive)) {
            this.unregisterNotifier(notifierID);
            return;
          }
          addon.hooks.onNotify(event, type, ids, extraData);
        })
      };
      const notifierID = Zotero.Notifier.registerObserver(callback, [
        "tab",
        "item",
        "file"
      ]);
      window.addEventListener(
        "unload",
        (e) => {
          this.unregisterNotifier(notifierID);
        },
        false
      );
    }
    static exampleNotifierCallback(ids) {
      return __async(this, null, function* () {
        var items = Zotero.Items.get(ids);
        var addUpdate = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.add.update`, true);
        if (addUpdate) {
          yield KeyExampleFactory.setExtra(items);
        }
      });
    }
    static unregisterNotifier(notifierID) {
      Zotero.Notifier.unregisterObserver(notifierID);
    }
    static registerPrefs() {
      const prefOptions = {
        pluginID: config.addonID,
        src: rootURI + "chrome/content/preferences.xhtml",
        label: getString("prefs.title"),
        image: `chrome://${config.addonRef}/content/icons/favicon.png`,
        extraDTD: [`chrome://${config.addonRef}/locale/overlay.dtd`],
        defaultXUL: true
      };
      ztoolkit.PreferencePane.register(prefOptions);
    }
  };
  __decorateClass([
    example
  ], BasicExampleFactory, "registerNotifier", 1);
  __decorateClass([
    example
  ], BasicExampleFactory, "exampleNotifierCallback", 1);
  __decorateClass([
    example
  ], BasicExampleFactory, "unregisterNotifier", 1);
  __decorateClass([
    example
  ], BasicExampleFactory, "registerPrefs", 1);
  var _KeyExampleFactory = class {
    static getSelectedItems() {
      var items = Zotero.getActiveZoteroPane().getSelectedItems();
      return items;
    }
    static setExtraCol() {
      return __async(this, null, function* () {
        var collection = ZoteroPane.getSelectedCollection();
        var items = collection == null ? void 0 : collection.getChildItems();
        yield _KeyExampleFactory.setExtra(items);
      });
    }
    static setExtraItems() {
      return __async(this, null, function* () {
        var secretKey = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.secretkey`, true);
        if (secretKey) {
          var items = Zotero.getActiveZoteroPane().getSelectedItems();
          yield _KeyExampleFactory.setExtra(items);
        } else {
          var alertInfo = getString("inputSecretkey");
          HelperExampleFactory.progressWindow(alertInfo, "fail");
        }
      });
    }
    static setExtra(items) {
      return __async(this, null, function* () {
        var n = 0;
        for (let item of items) {
          if (UIExampleFactory.checkItem(item)) {
            var easyscholarData = yield _KeyExampleFactory.getIFs(item);
            var chineseIFs = yield _KeyExampleFactory.getChineseIFs(item);
            var clsciJourID = "1642199434173014016";
            var amiJourID = "1648920625629810688";
            var nssfJourID = "1648936694851489792";
            var clsciLevel = yield _KeyExampleFactory.getCustomIFs(item, clsciJourID);
            var amiLevel = yield _KeyExampleFactory.getCustomIFs(item, amiJourID);
            var nssfLevel = yield _KeyExampleFactory.getCustomIFs(item, nssfJourID);
            var emptyExtra = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.update.empty.extra`, true);
            var jcr = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.jcr.qu`, true);
            var basic = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.basic`, true);
            var updated = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.updated`, true);
            var ifs = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.sci.if`, true);
            var if5 = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.sci.if5`, true);
            var eii = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.ei`, true);
            var chjcscd = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.chjcscd`, true);
            var pkucore = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.pku.core`, true);
            var njucore = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.nju.core`, true);
            var scicore = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.sci.core`, true);
            var ssci = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.ssci`, true);
            var ajg = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.ajg`, true);
            var utd24 = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.utd24`, true);
            var ft50 = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.ft50`, true);
            var ccf = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.ccf`, true);
            var fms = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.fms`, true);
            var jci = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.jci`, true);
            var ahci = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.ahci`, true);
            var sciwarn = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.sciwarn`, true);
            var compoundIFs = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.com.if`, true);
            var comprehensiveIFs = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.agg.if`, true);
            var swufe = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.swufe`, true);
            var cufe = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.cufe`, true);
            var uibe = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.uibe`, true);
            var sdufe = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.sdufe`, true);
            var xdu = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.xdu`, true);
            var swjtu = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.swjtu`, true);
            var ruc = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.ruc`, true);
            var xmu = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.xmu`, true);
            var sjtu = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.sjtu`, true);
            var fdu = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.fdu`, true);
            var hhu = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.hhu`, true);
            var scu = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.scu`, true);
            var cqu = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.cqu`, true);
            var nju = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.nju`, true);
            var xju = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.xju`, true);
            var cug = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.cug`, true);
            var cju = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.cju`, true);
            var zju = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.zju`, true);
            var njauCoreShow = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.njau.core`, true);
            var njauJourShow = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.njau.high.quality`, true);
            var clsci = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.clsci`, true);
            var ami = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.ami`, true);
            var nssf = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.nssf`, true);
            var njauHighQuality = yield njauJournal(item);
            if (easyscholarData || chineseIFs || clsciLevel || amiLevel || nssfLevel || njauCore(item) || njauHighQuality) {
              if (emptyExtra) {
                item.setField("extra", "");
              }
              n++;
            }
            try {
              if (easyscholarData) {
                if (jcr && easyscholarData["sci"]) {
                  ztoolkit.ExtraField.setExtraField(item, "JCR\u5206\u533A", easyscholarData["sci"]);
                }
                if (updated && easyscholarData["sciUp"]) {
                  ztoolkit.ExtraField.setExtraField(item, "\u4E2D\u79D1\u9662\u5206\u533A\u5347\u7EA7\u7248", easyscholarData["sciUp"]);
                }
                if (basic && easyscholarData["sciBase"]) {
                  ztoolkit.ExtraField.setExtraField(item, "\u4E2D\u79D1\u9662\u5206\u533A\u57FA\u7840\u7248", easyscholarData["sciBase"]);
                }
                if (ifs && easyscholarData["sciif"]) {
                  ztoolkit.ExtraField.setExtraField(item, "\u5F71\u54CD\u56E0\u5B50", easyscholarData["sciif"]);
                }
                if (if5 && easyscholarData["sciif5"]) {
                  ztoolkit.ExtraField.setExtraField(item, "5\u5E74\u5F71\u54CD\u56E0\u5B50", easyscholarData["sciif5"]);
                }
                if (eii && easyscholarData["eii"]) {
                  ztoolkit.ExtraField.setExtraField(item, "EI", "\u662F");
                }
                if (chjcscd && easyscholarData["cscd"]) {
                  ztoolkit.ExtraField.setExtraField(item, "CSCD", easyscholarData["cscd"]);
                }
                if (pkucore && easyscholarData["pku"]) {
                  ztoolkit.ExtraField.setExtraField(item, "\u4E2D\u6587\u6838\u5FC3\u671F\u520A/\u5317\u5927\u6838\u5FC3", "\u662F");
                }
                if (njucore && easyscholarData["cssci"]) {
                  ztoolkit.ExtraField.setExtraField(item, "CSSCI/\u5357\u5927\u6838\u5FC3", easyscholarData["cssci"]);
                }
                if (scicore && easyscholarData["zhongguokejihexin"]) {
                  ztoolkit.ExtraField.setExtraField(item, "\u4E2D\u56FD\u79D1\u6280\u6838\u5FC3\u671F\u520A", "\u662F");
                }
                if (ssci && easyscholarData["ssci"]) {
                  ztoolkit.ExtraField.setExtraField(item, "SSCI", easyscholarData["ssci"]);
                }
                if (ajg && easyscholarData["ajg"]) {
                  ztoolkit.ExtraField.setExtraField(item, "AJG", easyscholarData["ajg"]);
                }
                if (utd24 && easyscholarData["utd24"]) {
                  ztoolkit.ExtraField.setExtraField(item, "UTD24", easyscholarData["utd24"]);
                }
                if (ft50 && easyscholarData["ft50"]) {
                  ztoolkit.ExtraField.setExtraField(item, "FT50", easyscholarData["ft50"]);
                }
                if (ccf && easyscholarData["ccf"]) {
                  ztoolkit.ExtraField.setExtraField(item, "CCF", easyscholarData["ccf"]);
                }
                if (fms && easyscholarData["fms"]) {
                  ztoolkit.ExtraField.setExtraField(item, "FMS", easyscholarData["fms"]);
                }
                if (jci && easyscholarData["jci"]) {
                  ztoolkit.ExtraField.setExtraField(item, "JCI", easyscholarData["jci"]);
                }
                if (ahci && easyscholarData["ahci"]) {
                  ztoolkit.ExtraField.setExtraField(item, "AHCI", easyscholarData["ahci"]);
                }
                if (sciwarn && easyscholarData["sciwarn"]) {
                  ztoolkit.ExtraField.setExtraField(item, "\u4E2D\u79D1\u9662\u9884\u8B66", easyscholarData["sciwarn"]);
                }
                if (swufe && easyscholarData["swufe"]) {
                  ztoolkit.ExtraField.setExtraField(item, "\u897F\u5357\u8D22\u7ECF\u5927\u5B66", easyscholarData["swufe"]);
                }
                if (cufe && easyscholarData["cufe"]) {
                  ztoolkit.ExtraField.setExtraField(item, "\u4E2D\u592E\u8D22\u7ECF\u5927\u5B66", easyscholarData["cufe"]);
                }
                if (uibe && easyscholarData["uibe"]) {
                  ztoolkit.ExtraField.setExtraField(item, "\u5BF9\u5916\u7ECF\u6D4E\u8D38\u6613\u5927\u5B66", easyscholarData["uibe"]);
                }
                if (sdufe && easyscholarData["sdufe"]) {
                  ztoolkit.ExtraField.setExtraField(item, "\u5C71\u4E1C\u8D22\u7ECF\u5927\u5B66", easyscholarData["sdufe"]);
                }
                if (xdu && easyscholarData["xdu"]) {
                  ztoolkit.ExtraField.setExtraField(item, "\u897F\u5B89\u7535\u5B50\u79D1\u6280\u5927\u5B66", easyscholarData["xdu"]);
                }
                if (swjtu && easyscholarData["swjtu"]) {
                  ztoolkit.ExtraField.setExtraField(item, "\u897F\u5357\u4EA4\u901A\u5927\u5B66", easyscholarData["swjtu"]);
                }
                if (ruc && easyscholarData["ruc"]) {
                  ztoolkit.ExtraField.setExtraField(item, "\u4E2D\u56FD\u4EBA\u6C11\u5927\u5B66", easyscholarData["ruc"]);
                }
                if (xmu && easyscholarData["xmu"]) {
                  ztoolkit.ExtraField.setExtraField(item, "\u53A6\u95E8\u5927\u5B66", easyscholarData["xmu"]);
                }
                if (sjtu && easyscholarData["sjtu"]) {
                  ztoolkit.ExtraField.setExtraField(item, "\u4E0A\u6D77\u4EA4\u901A\u5927\u5B66", easyscholarData["sjtu"]);
                }
                if (fdu && easyscholarData["fdu"]) {
                  ztoolkit.ExtraField.setExtraField(item, "\u590D\u65E6\u5927\u5B66", easyscholarData["fdu"]);
                }
                if (hhu && easyscholarData["hhu"]) {
                  ztoolkit.ExtraField.setExtraField(item, "\u6CB3\u6D77\u5927\u5B66", easyscholarData["hhu"]);
                }
                if (scu && easyscholarData["scu"]) {
                  ztoolkit.ExtraField.setExtraField(item, "\u56DB\u5DDD\u5927\u5B66", easyscholarData["scu"]);
                }
                if (cqu && easyscholarData["cqu"]) {
                  ztoolkit.ExtraField.setExtraField(item, "\u91CD\u5E86\u5927\u5B66", easyscholarData["cqu"]);
                }
                if (nju && easyscholarData["nju"]) {
                  ztoolkit.ExtraField.setExtraField(item, "\u5357\u4EAC\u5927\u5B66", easyscholarData["nju"]);
                }
                if (xju && easyscholarData["xju"]) {
                  ztoolkit.ExtraField.setExtraField(item, "\u65B0\u7586\u5927\u5B66", easyscholarData["xju"]);
                }
                if (cug && easyscholarData["cug"]) {
                  ztoolkit.ExtraField.setExtraField(item, "\u4E2D\u56FD\u5730\u8D28\u5927\u5B66", easyscholarData["cug"]);
                }
                if (cju && easyscholarData["cju"]) {
                  ztoolkit.ExtraField.setExtraField(item, "\u957F\u6C5F\u5927\u5B66", easyscholarData["cju"]);
                }
                if (zju && easyscholarData["zju"]) {
                  ztoolkit.ExtraField.setExtraField(item, "\u6D59\u6C5F\u5927\u5B66", easyscholarData["zju"]);
                }
              }
            } catch (error) {
              Zotero.debug("\u5F71\u54CD\u56E0\u5B50\u8BBE\u7F6E\u5931\u8D25\uFF01");
            }
            if (chineseIFs) {
              if (compoundIFs) {
                ztoolkit.ExtraField.setExtraField(item, "\u590D\u5408\u5F71\u54CD\u56E0\u5B50", chineseIFs[0]);
              }
              if (comprehensiveIFs) {
                ztoolkit.ExtraField.setExtraField(item, "\u7EFC\u5408\u5F71\u54CD\u56E0\u5B50", chineseIFs[1]);
              }
            }
            if (njauCoreShow && njauCore(item) != void 0) {
              ztoolkit.ExtraField.setExtraField(item, "\u5357\u519C\u6838\u5FC3", njauCore(item));
            }
            if (njauJourShow && njauHighQuality != void 0) {
              ztoolkit.ExtraField.setExtraField(item, "\u5357\u519C\u9AD8\u8D28\u91CF", njauHighQuality);
            }
            if (clsci && clsciLevel != void 0) {
              ztoolkit.ExtraField.setExtraField(item, "CLSCI", "\u662F");
            }
            if (ami && amiLevel != void 0) {
              ztoolkit.ExtraField.setExtraField(item, "AMI", amiLevel);
            }
            if (nssf && nssfLevel != void 0) {
              ztoolkit.ExtraField.setExtraField(item, "NSSF", nssfLevel);
            }
            try {
              HelperExampleFactory.upJourAbb(item);
            } catch (error) {
              Zotero.debug("\u671F\u520A\u7F29\u5199\u66F4\u65B0\u5931\u8D25\uFF01");
            }
            item.saveTx();
            yield Zotero.Promise.delay(1e3 + Math.round(Math.random() * 1e3));
          }
        }
        var whiteSpace = HelperExampleFactory.whiteSpace();
        if (n > 0) {
          HelperExampleFactory.progressWindow(`${n}${whiteSpace}${getString("upIfsSuccess")}`, "success");
        } else {
          HelperExampleFactory.progressWindow(`${getString("upIfsFail")}`, "fail");
        }
      });
    }
    // 从easyScholar获取数据 获得影响因子 新接口函数
    static getIFs(item) {
      return __async(this, null, function* () {
        var secretKey = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.secretkey`, true);
        var publicationTitle = Zotero.ItemTypes.getName(item.itemTypeID) == "journalArticle" ? encodeURIComponent(item.getField("publicationTitle")) : encodeURIComponent(item.getField("conferenceName"));
        var url = `https://easyscholar.cc/open/getPublicationRank?secretKey=${secretKey}&publicationName=${publicationTitle}`;
        try {
          var resp = yield Zotero.HTTP.request("GET", url);
          var updateJson = JSON.parse(resp.responseText);
          if (updateJson["data"]["officialRank"]["all"]) {
            return updateJson["data"]["officialRank"]["all"];
          } else {
            Zotero.debug("easyScholar\u4E2D\u65E0\u6B64\u671F\u520A");
            Zotero.debug(updateJson["msg"]);
          }
        } catch (e) {
          Zotero.debug("\u83B7\u53D6easyScholar\u4FE1\u606F\u5931\u8D25");
          Zotero.debug(updateJson["msg"]);
        }
      });
    }
    // 得到自定义期刊级别
    static getCustomIFs(item, jourID) {
      return __async(this, null, function* () {
        let secretKey = Zotero.Prefs.get("extensions.zotero.greenfrog.secretkey", true);
        var publicationTitle = Zotero.ItemTypes.getName(item.itemTypeID) == "journalArticle" ? encodeURIComponent(item.getField("publicationTitle")) : encodeURIComponent(item.getField("conferenceName"));
        var url = `https://easyscholar.cc/open/getPublicationRank?secretKey=${secretKey}&publicationName=${publicationTitle}`;
        try {
          let req = yield Zotero.HTTP.request("GET", url, { responseType: "json" });
          var allRank = req.response["data"]["customRank"]["rankInfo"].filter(function(e) {
            return e.uuid == jourID;
          });
          var allRankValues = Object.values(allRank[0]);
          try {
            var rank = req.response["data"]["customRank"]["rank"].filter((item2) => item2.slice(0, -4) == jourID)[0].slice(-1);
          } catch (e) {
            Zotero.debug("\u83B7\u53D6\u81EA\u5B9A\u4E49\u6570\u636E\u96C6\u5931\u8D25\uFF01");
          }
          var level = allRankValues[parseInt(rank) + 1];
          return level;
        } catch (e) {
          Zotero.debug("\u83B7\u53D6\u81EA\u5B9A\u4E49\u6570\u636E\u96C6\u5931\u8D25\uFF01");
        }
      });
    }
    // 设置复合影响因子及综合影响因子20220709
    // 代码源于@l0o0，感谢。
    static getChineseIFs(item) {
      return __async(this, null, function* () {
        var chineseIFs = [];
        var pubT = item.getField("publicationTitle");
        var pattern = new RegExp("[\u4E00-\u9FA5]+");
        if (pattern.test(String(pubT))) {
          try {
            var body = `searchStateJson=%7B%22StateID%22%3A%22%22%2C%22Platfrom%22%3A%22%22%2C%22QueryTime%22%3A%22%22%2C%22Account%22%3A%22knavi%22%2C%22ClientToken%22%3A%22%22%2C%22Language%22%3A%22%22%2C%22CNode%22%3A%7B%22PCode%22%3A%22JOURNAL%22%2C%22SMode%22%3A%22%22%2C%22OperateT%22%3A%22%22%7D%2C%22QNode%22%3A%7B%22SelectT%22%3A%22%22%2C%22Select_Fields%22%3A%22%22%2C%22S_DBCodes%22%3A%22%22%2C%22QGroup%22%3A%5B%7B%22Key%22%3A%22subject%22%2C%22Logic%22%3A1%2C%22Items%22%3A%5B%5D%2C%22ChildItems%22%3A%5B%7B%22Key%22%3A%22txt%22%2C%22Logic%22%3A1%2C%22Items%22%3A%5B%7B%22Key%22%3A%22txt_1%22%2C%22Title%22%3A%22%22%2C%22Logic%22%3A1%2C%22Name%22%3A%22TI%22%2C%22Operate%22%3A%22%25%22%2C%22Value%22%3A%22'${encodeURIComponent(pubT)}'%22%2C%22ExtendType%22%3A0%2C%22ExtendValue%22%3A%22%22%2C%22Value2%22%3A%22%22%7D%5D%2C%22ChildItems%22%3A%5B%5D%7D%5D%7D%5D%2C%22OrderBy%22%3A%22OTA%7CDESC%22%2C%22GroupBy%22%3A%22%22%2C%22Additon%22%3A%22%22%7D%7D&displaymode=1&pageindex=1&pagecount=21&index=&searchType=%E5%88%8A%E5%90%8D(%E6%9B%BE%E7%94%A8%E5%88%8A%E5%90%8D)&clickName=&switchdata=search&random=0.2815758347350512`;
            var resp = yield Zotero.HTTP.request(
              "POST",
              "https://navi.cnki.net/knavi/all/searchbaseinfo",
              {
                headers: {
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.114 Safari/537.36 Edg/103.0.1264.49"
                },
                body
              }
            );
            var AllJour = resp.responseText;
            if (/\)/.test(String(pubT))) {
              pubT = String(pubT).replace(/(\()(.*)(\))/, "\\$1$2\\$3");
            }
            var reg = " " + pubT + "\n(.*\n){10,40} .*\u590D\u5408\u5F71\u54CD\u56E0\u5B50\uFF1A(.*)\n(.*\n){0,6} .*\u7EFC\u5408\u5F71\u54CD\u56E0\u5B50\uFF1A(.*)";
            var patt = new RegExp(reg, "i");
            var jour = AllJour.match(patt);
            var compoundIF = jour[2];
            var comprehensiveIF = jour[4];
            if (compoundIF !== void 0) {
              chineseIFs.push(compoundIF);
            }
            if (comprehensiveIF !== void 0) {
              chineseIFs.push(comprehensiveIF);
            }
            return chineseIFs;
          } catch (e) {
            Zotero.debug("\u590D\u5408\u5F71\u54CD\u56E0\u5B50\u3001\u7EFC\u5408\u5F71\u54CD\u56E0\u5B50\u83B7\u53D6\u5931\u8D25\uFF01");
            return;
          }
        }
      });
    }
    static upMetaCol() {
      return __async(this, null, function* () {
        var collection = ZoteroPane.getSelectedCollection();
        var items = collection == null ? void 0 : collection.getChildItems();
        yield _KeyExampleFactory.upMeta(items);
      });
    }
    static upMetaItems() {
      return __async(this, null, function* () {
        var items = Zotero.getActiveZoteroPane().getSelectedItems();
        yield _KeyExampleFactory.upMeta(items);
      });
    }
    //更新元数据执行函数
    // 代码来源于Quick动作
    //https://getquicker.net/Sharedaction?code=78da8f40-e73a-46e8-da6b-08da76a0d1ac和
    // https://getquicker.net/Sharedaction?code=305c5f6e-4f15-445c-996a-08dace1ee4e7
    //感谢@ttChen老师的源代码
    static upMeta(items) {
      return __async(this, null, function* () {
        var n = 0;
        var pattern = new RegExp("[\u4E00-\u9FA5]+");
        for (let item of items) {
          if (UIExampleFactory.checkItem(item)) {
            var title = item.getField("title");
            var doi = item.getField("DOI");
            var lan = pattern.test(title) ? "zh-CN" : "en-US";
            if (lan == "zh-CN") {
              let updateField2 = function(field, newItem, oldItem) {
                if (newItem.getField(field)) {
                  oldItem.setField(field, newItem.getField(field));
                }
              }, updateINFO2 = function(newItem, oldItemID) {
                newItem.saveTx();
                let oldItem = Zotero.Items.get(oldItemID);
                oldItem.setCreators(newItem.getCreators());
                let fields = ["volume", "issue", "date", "pages", "ISSN", "url", "DOI", "type", "publisher"];
                for (let field of fields) {
                  updateField2(field, newItem, oldItem);
                }
                newItem.deleted = true;
                newItem.saveTx();
                oldItem.saveTx();
                Zotero.debug("succeeded!");
              };
              var updateField = updateField2, updateINFO = updateINFO2;
              function getCNKIDetailURLByTitle(title2) {
                return __async(this, null, function* () {
                  var queryJson = {
                    "Platform": "",
                    "DBCode": "CFLS",
                    "KuaKuCode": "CJFQ,CCND,CIPD,CDMD,BDZK,CISD,SNAD,CCJD,GXDB_SECTION,CJFN,CCVD",
                    "QNode": {
                      "QGroup": [{
                        "Key": "Subject",
                        "Title": "",
                        "Logic": 1,
                        "Items": [{ "Title": "\u7BC7\u540D", "Name": "TI", "Value": title2, "Operate": "%=", "BlurType": "" }],
                        "ChildItems": []
                      }]
                    }
                  };
                  var PostDATA = "IsSearch=true&QueryJson=" + encodeURIComponent(JSON.stringify(queryJson)) + `&PageName=defaultresult&DBCode=CFLS&KuaKuCodes=CJFQ%2CCCND%2CCIPD%2CCDMD%2CBDZK%2CCISD%2CSNAD%2CCCJD%2CGXDB_SECTION%2CCJFN%2CCCVD&CurPage=1&RecordsCntPerPage=20&CurDisplayMode=listmode&CurrSortField=RELEVANT&CurrSortFieldType=desc&IsSentenceSearch=false&Subject=`;
                  function getCookieSandbox() {
                    var cookieData = `Ecp_ClientId=3210724131801671689;
            cnkiUserKey=2bf7144a-ddf6-3d32-afb8-d4bf82473d9f;
            RsPerPage=20;
            Ecp_ClientIp=58.154.105.222;
            Ecp_Userid=5002973;
            Hm_lvt_38f33a73da35494cc56a660420d5b6be=1657977228,1658755426,1659774372,1659793220;
            UM_distinctid=183d49fcff858b-0941bfea87e982-76492e2f-384000-183d49fcff9119c;
            knsLeftGroupSelectItem=1%3B2%3B; dsorder=relevant;
            _pk_ref=%5B%22%22%2C%22%22%2C1669645320%2C%22https%3A%2F%2Feasyscholar.cc%2F%22%5D;
            _pk_id=c26caf7b-3374-4899-9370-488df5c09825.1661393760.22.1669645320.1669645320.;
            Ecp_loginuserbk=db0172; Ecp_IpLoginFail=22113066.94.113.19;
            ASP.NET_SessionId=5mzsjs1nrl1tf0b5ec450grz; SID_kns8=123152;
            CurrSortField=%e7%9b%b8%e5%85%b3%e5%ba%a6%2frelevant%2c(%e5%8f%91%e8%a1%a8%e6%97%b6%e9%97%b4%2c%27time%27);
            CurrSortFieldType=DESC; dblang=ch`;
                    var userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.56";
                    var url2 = "https://cnki.net/";
                    return new Zotero.CookieSandbox("", url2, cookieData, userAgent);
                  }
                  ;
                  var requestHeaders = {
                    Accept: "text/html, */*; q=0.01",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
                    Connection: "keep-alive",
                    "Content-Length": "992",
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    Host: "kns.cnki.net",
                    Origin: "https://kns.cnki.net",
                    Referer: `https://kns.cnki.net/kns8/defaultresult/index?kw=${encodeURIComponent(title2)}&korder=TI`,
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-ch-ua": `"Microsoft Edge"; v = "107", "Chromium"; v = "107", "Not=A?Brand"; v = "24"`,
                    "Sec-Fetch-Site": "same-origin",
                    "X-Requested-With": "XMLHttpRequest"
                  };
                  var postUrl = "https://kns.cnki.net/kns8/Brief/GetGridTableHtml";
                  function getHtml(responseText) {
                    var parser = Components.classes["@mozilla.org/xmlextras/domparser;1"].createInstance(Components.interfaces.nsIDOMParser);
                    var html2 = parser.parseFromString(responseText, "text/html");
                    return html2;
                  }
                  ;
                  var resp = yield Zotero.HTTP.request("POST", postUrl, {
                    headers: requestHeaders,
                    cookieSandbox: getCookieSandbox(),
                    body: PostDATA
                  });
                  return getHtml(resp.responseText);
                });
              }
              var selectedItem = item;
              var ItemID = selectedItem.id;
              var title = selectedItem.getField("title");
              var publicationTitle = selectedItem.getField("publicationTitle");
              var html;
              var url;
              try {
                html = yield getCNKIDetailURLByTitle(title);
                if (publicationTitle != "") {
                  url = Zotero.Utilities.xpath(html, `//td[normalize-space(string(.))="${publicationTitle}"]/preceding-sibling::td[@class="name" and normalize-space(string(.))="${title}"]/a`)[0].href;
                } else {
                  url = Zotero.Utilities.xpath(html, `//td[@class="name" and normalize-space(string(.))="${title}"]/a`)[0].href;
                }
                url = url.replace("/kns8/Detail", "https://kns.cnki.net/kcms/detail/detail.aspx");
              } catch (error) {
                var popw = new Zotero.ProgressWindow();
                popw.changeHeadline("\u672A\u627E\u5230\u6587\u732E, \u6216\u8005\u9047\u5230\u4E86\u7F51\u7EDC\u95EE\u9898\uFF01", "", "");
                popw.addDescription(`\u6587\u732E\uFF1A${title}`);
                popw.show();
                popw.startCloseTimer(5 * 1e3);
                return;
                return;
              }
              Zotero.HTTP.loadDocuments(
                url,
                function(doc) {
                  return __async(this, null, function* () {
                    let translate2 = new Zotero.Translate.Web();
                    translate2.setDocument(doc);
                    translate2.setTranslator("5c95b67b-41c5-4f55-b71a-48d5d7183063");
                    let items2 = yield translate2.translate();
                    updateINFO2(items2[0], ItemID);
                  });
                }
              );
            } else if (lan == "en-US") {
              if (doi != "") {
                let update2 = function(field) {
                  if (newItem.getField(field)) {
                    item.setField(field, newItem.getField(field));
                  }
                };
                var update = update2;
                let identifier = {
                  itemType: "journalArticle",
                  DOI: item.getField("DOI")
                };
                var translate = new Zotero.Translate.Search();
                translate.setIdentifier(identifier);
                let translators = yield translate.getTranslators();
                translate.setTranslator(translators);
                let newItems = yield translate.translate();
                let newItem = newItems[0];
                item.setCreators(newItem.getCreators());
                let fields = [
                  "volume",
                  "issue",
                  "date",
                  "pages",
                  "issue",
                  "ISSN",
                  "url"
                ];
                for (let field of fields) {
                  update2(field);
                }
                newItem.deleted = true;
                yield item.saveTx();
                newItem.saveTx();
              }
            }
            n++;
            yield Zotero.Promise.delay(1e3 + Math.round(Math.random() * 1e3));
          }
        }
        var whiteSpace = HelperExampleFactory.whiteSpace();
        HelperExampleFactory.progressWindow(`${n}${whiteSpace}${getString("upIfsSuccess")}`, "success");
      });
    }
    static registerShortcuts() {
      var ifTitleSentence = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.shortcut.title.sentence`, true);
      var keyTitleSentence = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.shortcut.input.title.sentence`, true);
      var ifPubTitleCase = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.shortcut.publication.title.case`, true);
      var keyPubTitleCase = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.shortcut.input.publication.title.case`, true);
      var ifDataDir = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.shortcut.data.dir`, true);
      var keyDataDir = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.shortcut.input.data.dir`, true);
      var ifProfileDir = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.shortcut.profile.dir`, true);
      var keyProfileDir = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.shortcut.input.profile.dir`, true);
      if (Zotero.isMac) {
        var keyControl = "meta";
      } else {
        var keyControl = "control";
      }
      if (ifTitleSentence) {
        ztoolkit.Shortcut.register("event", {
          id: `${config.addonRef}-key-title-sentence`,
          key: keyTitleSentence,
          //key: 'D',
          // modifiers: "accel",
          modifiers: keyControl,
          callback: (keyOptions) => {
            ztoolkit.log(`${ifPubTitleCase}${keyPubTitleCase}`);
            HelperExampleFactory.chanItemTitleCase();
          }
        });
      }
      if (ifPubTitleCase) {
        ztoolkit.Shortcut.register("event", {
          id: `${config.addonRef}-key-change-pub-title-case`,
          key: keyPubTitleCase,
          //key: 'D',
          // modifiers: "accel",
          modifiers: keyControl,
          callback: (keyOptions) => {
            ztoolkit.log(`${ifPubTitleCase}${keyPubTitleCase}`);
            HelperExampleFactory.chPubTitleCase();
          }
        });
      }
      if (ifDataDir) {
        ztoolkit.Shortcut.register("event", {
          id: `${config.addonRef}-key-data-dir`,
          key: keyDataDir,
          //key: 'D',
          modifiers: "alt",
          callback: (keyOptions) => {
            HelperExampleFactory.progressWindow(`${getString("dataDir")} ${Zotero.DataDirectory.dir}`, "success");
          }
        });
      }
      if (ifProfileDir) {
        ztoolkit.Shortcut.register("event", {
          id: `${config.addonRef}-key-profile-dir`,
          // key: "L",
          key: keyProfileDir,
          modifiers: "alt",
          callback: (keyOptions) => {
            HelperExampleFactory.progressWindow(`${getString("proDir")} ${Zotero.Profile.dir}`, "success");
          }
        });
      }
    }
    static exampleShortcutConflictionCallback() {
      const conflictionGroups = ztoolkit.Shortcut.checkAllKeyConflicting();
      new ztoolkit.ProgressWindow("Check Key Confliction").createLine({
        text: `${conflictionGroups.length} groups of confliction keys found. Details are in the debug output/console.`
      }).show(-1);
      ztoolkit.log(
        "Conflictions:",
        conflictionGroups,
        "All keys:",
        ztoolkit.Shortcut.getAll()
      );
    }
  };
  var KeyExampleFactory = _KeyExampleFactory;
  __decorateClass([
    example
  ], KeyExampleFactory, "getSelectedItems", 1);
  __decorateClass([
    example
  ], KeyExampleFactory, "setExtraCol", 1);
  __decorateClass([
    example
  ], KeyExampleFactory, "setExtraItems", 1);
  __decorateClass([
    example
  ], KeyExampleFactory, "setExtra", 1);
  __decorateClass([
    example
  ], KeyExampleFactory, "getIFs", 1);
  __decorateClass([
    example
  ], KeyExampleFactory, "getCustomIFs", 1);
  __decorateClass([
    example
  ], KeyExampleFactory, "getChineseIFs", 1);
  __decorateClass([
    example
  ], KeyExampleFactory, "upMetaCol", 1);
  __decorateClass([
    example
  ], KeyExampleFactory, "upMetaItems", 1);
  __decorateClass([
    example
  ], KeyExampleFactory, "upMeta", 1);
  __decorateClass([
    example
  ], KeyExampleFactory, "registerShortcuts", 1);
  __decorateClass([
    example
  ], KeyExampleFactory, "exampleShortcutConflictionCallback", 1);
  var _UIExampleFactory = class {
    // 是否显示菜单函数 类型为期刊才显示可用
    // 是否显示分类右键菜单 隐藏
    static displayColMenuitem() {
      const collection = ZoteroPane.getSelectedCollection(), menuUpIFsCol = document.getElementById(`zotero-collectionmenu-${config.addonRef}-upifs`), menuUpMeta = document.getElementById(`zotero-collectionmenu-${config.addonRef}-upmeta`);
      var showmenuUpIFsCol = !!collection;
      var showmenuUpMetaCol = !!collection;
      if (!!collection) {
        var items = collection.getChildItems();
        showmenuUpIFsCol = items.some((item) => _UIExampleFactory.checkItem(item));
        showmenuUpMetaCol = items.some((item) => _UIExampleFactory.checkItemMeta(item));
      } else {
        showmenuUpIFsCol = false;
      }
      menuUpIFsCol == null ? void 0 : menuUpIFsCol.setAttribute("disabled", String(!showmenuUpIFsCol));
      menuUpMeta == null ? void 0 : menuUpMeta.setAttribute("disabled", String(!showmenuUpMetaCol));
    }
    // 禁用菜单
    // static disableMenu() {
    //   // 禁用添加条目更新期刊信息
    //   var menuUpAdd = document.getElementById('zotero-prefpane-greenfrog-add-update');
    //   menuUpAdd?.setAttribute('disabled', 'ture');
    //   menuUpAdd?.setAttribute('hidden', 'ture');
    // }
    // 是否显示条目右键菜单
    static displayContexMenuitem() {
      const items = ZoteroPane.getSelectedItems(), menuUpIfs = document.getElementById(`zotero-itemmenu-${config.addonRef}-upifs`), menuUpMeta = document.getElementById(`zotero-itemmenu-${config.addonRef}-upmeta`), showMenuUpIfs = items.some((item) => _UIExampleFactory.checkItem(item)), showMenuUpMeta = items.some((item) => _UIExampleFactory.checkItemMeta(item));
      menuUpIfs == null ? void 0 : menuUpIfs.setAttribute("disabled", `${!showMenuUpIfs}`);
      menuUpMeta == null ? void 0 : menuUpMeta.setAttribute("disabled", `${!showMenuUpMeta}`);
    }
    // 检查条目是否符合 是否为期刊
    static checkItem(item) {
      if (item && !item.isNote()) {
        if (item.isRegularItem()) {
          if (Zotero.ItemTypes.getName(item.itemTypeID) == "journalArticle" || // 文献类型为期刊
          Zotero.ItemTypes.getName(item.itemTypeID) == "conferencePaper") {
            return true;
          }
        }
      }
    }
    // 检查条目元数据是否符合 英文必须有DOI
    static checkItemMeta(item) {
      var pattern = new RegExp("[\u4E00-\u9FA5]+");
      if (item && !item.isNote()) {
        if (item.isRegularItem()) {
          var title = item.getField("title");
          var doi = item.getField("DOI");
          var lan = pattern.test(title) ? "zh-CN" : "en-US";
          if (Zotero.ItemTypes.getName(item.itemTypeID) == "journalArticle") {
            if (lan == "zh-CN") {
              return title == "" ? false : true;
            } else if (lan == "en-US") {
              return doi == "" ? false : true;
            }
          }
        }
      }
    }
    static registerRightClickMenuItem() {
      const menuIconUpIFs = `chrome://${config.addonRef}/content/icons/favicon@0.5x.png`;
      const menuIconUpMeta = `chrome://${config.addonRef}/content/icons/upmeta.png`;
      ztoolkit.Menu.register("item", {
        tag: "menuseparator"
      });
      ztoolkit.Menu.register("collection", {
        tag: "menuseparator"
      });
      ztoolkit.Menu.register("collection", {
        tag: "menuitem",
        id: `zotero-collectionmenu-${config.addonRef}-upifs`,
        label: getString("upifs"),
        commandListener: (ev) => KeyExampleFactory.setExtraCol(),
        icon: menuIconUpIFs
      });
      ztoolkit.Menu.register("collection", {
        tag: "menuitem",
        id: `zotero-collectionmenu-${config.addonRef}-upmeta`,
        label: getString("upmeta"),
        commandListener: (ev) => KeyExampleFactory.upMetaCol(),
        icon: menuIconUpMeta
      });
      ztoolkit.Menu.register("item", {
        tag: "menuitem",
        id: `zotero-itemmenu-${config.addonRef}-upifs`,
        label: getString("upifs"),
        commandListener: (ev) => KeyExampleFactory.setExtraItems(),
        icon: menuIconUpIFs
      });
      ztoolkit.Menu.register("item", {
        tag: "menuitem",
        id: `zotero-itemmenu-${config.addonRef}-upmeta`,
        label: getString("upmeta"),
        commandListener: (ev) => KeyExampleFactory.upMetaItems(),
        icon: menuIconUpMeta
      });
    }
    //Tools菜单
    static registerWindowMenuWithSeprator() {
      ztoolkit.Menu.register("menuTools", {
        tag: "menuseparator"
      });
      ztoolkit.Menu.register("menuTools", {
        tag: "menu",
        label: getString("toolbox"),
        onpopupshowing: `Zotero.${config.addonInstance}.hooks.hideMenu()`,
        // 显示隐藏菜单
        children: [
          // Author Bold and/ or Asterisk 作者加粗加星
          {
            tag: "menuitem",
            id: "zotero-toolboxmenu-auBoldStar",
            label: getString("auBoldStar"),
            // oncommand: "alert('Hello World! Sub Menuitem.')",
            commandListener: (ev) => HelperExampleFactory.dialogAuProcess()
          },
          // Clean Author Bold 清除作者加粗
          {
            tag: "menuitem",
            id: "zotero-toolboxmenu-cleanBold",
            label: getString("cleanBold"),
            // oncommand: "alert('Hello World! Sub Menuitem.')",
            commandListener: (ev) => HelperExampleFactory.cleanBold()
          },
          // Clean Author Asterisk清除作者加星
          {
            tag: "menuitem",
            id: "zotero-toolboxmenu-cleanStar",
            label: getString("cleanStar"),
            // oncommand: "alert('Hello World! Sub Menuitem.')",
            commandListener: (ev) => HelperExampleFactory.cleanStar()
          },
          // Clean Author Bold and Asterisk 清除作者加粗加星
          {
            tag: "menuitem",
            id: "zotero-toolboxmenu-cleanBoldStar",
            label: getString("cleanBoldStar"),
            // oncommand: "alert('Hello World! Sub Menuitem.')",
            commandListener: (ev) => HelperExampleFactory.cleanBoldAndStar()
          },
          // Change Author Name to Title Case 更改作者大小写
          {
            tag: "menuitem",
            id: "zotero-toolboxmenu-chAuTitle",
            label: getString("chAuTitle"),
            // oncommand: "alert('Hello World! Sub Menuitem.')",
            commandListener: (ev) => HelperExampleFactory.changAuthorCase()
          },
          // Swap Authors First and Last Name 交换作者姓和名
          {
            tag: "menuitem",
            id: "zotero-toolboxmenu-swapAuName",
            label: getString("swapAuName"),
            // oncommand: "alert('Hello World! Sub Menuitem.')",
            commandListener: (ev) => HelperExampleFactory.swapAuthorName()
          },
          {
            tag: "menuseparator",
            id: "zotero-toolboxmenu-sep1"
          },
          // Change Title to Sentense Case 条目题目大小写
          {
            tag: "menuitem",
            id: "zotero-toolboxmenu-chTitleCase",
            label: getString("chTitleCase"),
            // oncommand: "alert('Hello World! Sub Menuitem.')",
            commandListener: (ev) => HelperExampleFactory.chanItemTitleCase()
          },
          // Change Publication Title
          {
            tag: "menuitem",
            id: "zotero-toolboxmenu-chPubTitle",
            label: getString("chPubTitle"),
            // oncommand: "alert('Hello World! Sub Menuitem.')",
            commandListener: (ev) => HelperExampleFactory.dialogChPubTitle()
          },
          // Change Publication Title Case 更改期刊大小写
          {
            tag: "menuitem",
            id: "zotero-toolboxmenu-chPubTitleCase",
            label: getString("chPubTitleCase"),
            // oncommand: "alert('Hello World! Sub Menuitem.')",
            commandListener: (ev) => HelperExampleFactory.chPubTitleCase()
          },
          // Item Title Find and Replace 条目题目查找替换
          {
            tag: "menuitem",
            id: "zotero-toolboxmenu-itemTitleFindReplace",
            label: getString("itemTitleFindReplace"),
            // oncommand: "alert(KeyExampleFactory.getSelectedItems())",
            // oncommand: `ztoolkit.getGlobal('alert')(${KeyExampleFactory.getSelectedItems()})`,
            commandListener: (ev) => HelperExampleFactory.dialogItemTitleProcess()
          },
          {
            tag: "menuseparator",
            id: "zotero-toolboxmenu-sep2"
          },
          // Show Porfile Directory
          {
            tag: "menuitem",
            id: "zotero-toolboxmenu-showProfile",
            label: getString("showProfile"),
            // oncommand: "alert('Hello World! Sub Menuitem.')",
            commandListener: (ev) => HelperExampleFactory.progressWindow(`${getString("proDir")} ${Zotero.Profile.dir}`, "success")
          },
          // Show Data Directory
          {
            tag: "menuitem",
            id: "zotero-toolboxmenu-showData",
            label: getString("showData"),
            // oncommand: "alert('Hello World! Sub Menuitem.')",
            commandListener: (ev) => HelperExampleFactory.progressWindow(`${getString("dataDir")} ${Zotero.DataDirectory.dir}`, "success")
          }
          //刷新自定义列
          // {
          //   tag: "menuitem",
          //   id: "zotero-toolboxmenu-refresh",
          //   label: '缩写',
          //   commandListener: (ev) => HelperExampleFactory.upJourAbb(),
          // },
        ]
      });
      ztoolkit.Menu.register("menuTools", {
        tag: "menuitem",
        label: getString("cleanExtra"),
        commandListener: (ev) => HelperExampleFactory.emptyExtra()
      });
    }
    static hideMenu() {
      const menuboldStar = document.getElementById("zotero-toolboxmenu-auBoldStar"), menucleanBold = document.getElementById("zotero-toolboxmenu-cleanBold"), menucleanStar = document.getElementById("zotero-toolboxmenu-cleanStar"), menucleanBoldStar = document.getElementById("zotero-toolboxmenu-cleanBoldStar"), menuchAuTitle = document.getElementById("zotero-toolboxmenu-chAuTitle"), menuswapAuName = document.getElementById("zotero-toolboxmenu-swapAuName"), menusep1 = document.getElementById("zotero-toolboxmenu-sep1"), menuchTitleCase = document.getElementById("zotero-toolboxmenu-chTitleCase"), menuchPubTitle = document.getElementById("zotero-toolboxmenu-chPubTitle"), menuchPubTitleCase = document.getElementById("zotero-toolboxmenu-chPubTitleCase"), menuitemTitleFindReplace = document.getElementById("zotero-toolboxmenu-itemTitleFindReplace"), menusep2 = document.getElementById("zotero-toolboxmenu-sep2"), menushowProfile = document.getElementById("zotero-toolboxmenu-showProfile"), menushowData = document.getElementById("zotero-toolboxmenu-showData");
      const boldStar = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.bold.star`, true), cleanBold = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.remove.bold`, true), cleanStar = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.remove.star`, true), cleanBoldStar = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.remove.bold.star`, true), chAuTitle = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.chang.author.case`, true), swapAuName = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.swap.author`, true), sep1 = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.sep1`, true), chTitleCase = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.chang.title`, true), chPubTitle = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.chang.pub.title`, true), chPubTitleCase = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.chang.pub.title.case`, true), itemTitleFindReplace = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.item.title.find.replace`, true), sep2 = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.sep2`, true), showProfile = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.show.profile.dir`, true), showData = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.show.data.dir`, true);
      menuboldStar == null ? void 0 : menuboldStar.setAttribute("hidden", String(!boldStar));
      menucleanBold == null ? void 0 : menucleanBold.setAttribute("hidden", String(!cleanBold));
      menucleanStar == null ? void 0 : menucleanStar.setAttribute("hidden", String(!cleanStar));
      menucleanBoldStar == null ? void 0 : menucleanBoldStar.setAttribute("hidden", String(!cleanBoldStar));
      menuchAuTitle == null ? void 0 : menuchAuTitle.setAttribute("hidden", String(!chAuTitle));
      menuswapAuName == null ? void 0 : menuswapAuName.setAttribute("hidden", String(!swapAuName));
      menusep1 == null ? void 0 : menusep1.setAttribute("hidden", String(!sep1));
      menuchTitleCase == null ? void 0 : menuchTitleCase.setAttribute("hidden", String(!chTitleCase));
      menuchPubTitle == null ? void 0 : menuchPubTitle.setAttribute("hidden", String(!chPubTitle));
      menuchPubTitleCase == null ? void 0 : menuchPubTitleCase.setAttribute("hidden", String(!chPubTitleCase));
      menuitemTitleFindReplace == null ? void 0 : menuitemTitleFindReplace.setAttribute("hidden", String(!itemTitleFindReplace));
      menusep2 == null ? void 0 : menusep2.setAttribute("hidden", String(!sep2));
      menushowProfile == null ? void 0 : menushowProfile.setAttribute("hidden", String(!showProfile));
      menushowData == null ? void 0 : menushowData.setAttribute("hidden", String(!showData));
    }
    // 当更新期刊禁用时，禁用期刊是否带点选项
    static disableUppJourAbbDot() {
      var cbUpJourAbbDot = addon.data.prefs.window.document.getElementById(`zotero-prefpane-${config.addonRef}-update-abbr-dot`);
      var upAbbr = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.update.abbr`, true);
      cbUpJourAbbDot == null ? void 0 : cbUpJourAbbDot.setAttribute("disabled", String(!upAbbr));
    }
    static registerExtraColumn() {
      return __async(this, null, function* () {
        var jcr = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.jcr.qu`, true);
        var basic = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.basic`, true);
        var updated = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.updated`, true);
        var ifs = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.sci.if`, true);
        var if5 = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.sci.if5`, true);
        var eii = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.ei`, true);
        var chjcscd = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.chjcscd`, true);
        var pkucore = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.pku.core`, true);
        var njucore = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.nju.core`, true);
        var scicore = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.sci.core`, true);
        var ssci = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.ssci`, true);
        var ajg = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.ajg`, true);
        var utd24 = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.utd24`, true);
        var ft50 = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.ft50`, true);
        var ccf = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.ccf`, true);
        var fms = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.fms`, true);
        var jci = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.jci`, true);
        var ahci = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.ahci`, true);
        var sciwarn = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.sciwarn`, true);
        var compoundIFs = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.com.if`, true);
        var comprehensiveIFs = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.agg.if`, true);
        var swufe = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.swufe`, true);
        var cufe = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.cufe`, true);
        var uibe = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.uibe`, true);
        var sdufe = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.sdufe`, true);
        var xdu = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.xdu`, true);
        var swjtu = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.swjtu`, true);
        var ruc = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.ruc`, true);
        var xmu = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.xmu`, true);
        var sjtu = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.sjtu`, true);
        var fdu = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.fdu`, true);
        var hhu = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.hhu`, true);
        var scu = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.scu`, true);
        var cqu = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.cqu`, true);
        var nju = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.nju`, true);
        var xju = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.xju`, true);
        var cug = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.cug`, true);
        var cju = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.cju`, true);
        var zju = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.zju`, true);
        var njauCoreShow = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.njau.core`, true);
        var njauJourShow = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.njau.high.quality`, true);
        var clsci = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.clsci`, true);
        var ami = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.ami`, true);
        var nssf = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.nssf`, true);
        var summary = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.summary`, true);
        if (jcr) {
          yield ztoolkit.ItemTree.register(
            "JCR",
            getString("JCR"),
            (field, unformatted, includeBaseMapped, item) => {
              var jcr2 = ztoolkit.ExtraField.getExtraField(item, "JCR\u5206\u533A");
              return String(jcr2 == void 0 ? "" : jcr2);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("JCR");
        }
        if (updated) {
          yield ztoolkit.ItemTree.register(
            "CASUp",
            getString("CASUp"),
            (field, unformatted, includeBaseMapped, item) => {
              var CASUp = ztoolkit.ExtraField.getExtraField(item, "\u4E2D\u79D1\u9662\u5206\u533A\u5347\u7EA7\u7248");
              return String(CASUp == void 0 ? "" : CASUp);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("CASUp");
        }
        if (basic) {
          yield ztoolkit.ItemTree.register(
            "CASBasic",
            getString("CASBasic"),
            (field, unformatted, includeBaseMapped, item) => {
              var CASBasic = ztoolkit.ExtraField.getExtraField(item, "\u4E2D\u79D1\u9662\u5206\u533A\u57FA\u7840\u7248");
              return String(CASBasic == void 0 ? "" : CASBasic);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("CASBasic");
        }
        if (ifs) {
          yield ztoolkit.ItemTree.register(
            "IF",
            getString("IF"),
            (field, unformatted, includeBaseMapped, item) => {
              var ifs2 = ztoolkit.ExtraField.getExtraField(item, "\u5F71\u54CD\u56E0\u5B50");
              return String(ifs2 == void 0 ? "" : ifs2);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("IF");
        }
        if (if5) {
          yield ztoolkit.ItemTree.register(
            "IF5",
            getString("IF5"),
            (field, unformatted, includeBaseMapped, item) => {
              var IF5 = ztoolkit.ExtraField.getExtraField(item, "5\u5E74\u5F71\u54CD\u56E0\u5B50");
              return String(IF5 == void 0 ? "" : IF5);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("IF5");
        }
        if (eii) {
          yield ztoolkit.ItemTree.register(
            "EI",
            getString("EI"),
            (field, unformatted, includeBaseMapped, item) => {
              var EI = ztoolkit.ExtraField.getExtraField(item, "EI");
              return String(EI == void 0 ? "" : EI);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("EI");
        }
        if (chjcscd) {
          yield ztoolkit.ItemTree.register(
            "CSCD",
            getString("CSCD"),
            (field, unformatted, includeBaseMapped, item) => {
              var CSCD = ztoolkit.ExtraField.getExtraField(item, "CSCD");
              return String(CSCD == void 0 ? "" : CSCD);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("CSCD");
        }
        if (pkucore) {
          yield ztoolkit.ItemTree.register(
            "PKUCore",
            getString("PKUCore"),
            (field, unformatted, includeBaseMapped, item) => {
              var PKUCore = ztoolkit.ExtraField.getExtraField(item, "\u4E2D\u6587\u6838\u5FC3\u671F\u520A/\u5317\u5927\u6838\u5FC3");
              return String(PKUCore == void 0 ? "" : PKUCore);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("PKUCore");
        }
        if (njucore) {
          yield ztoolkit.ItemTree.register(
            "CSSCI",
            getString("CSSCI"),
            (field, unformatted, includeBaseMapped, item) => {
              var NJUCore = ztoolkit.ExtraField.getExtraField(item, "CSSCI/\u5357\u5927\u6838\u5FC3");
              return String(NJUCore == void 0 ? "" : NJUCore);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("CSSCI");
        }
        if (scicore) {
          yield ztoolkit.ItemTree.register(
            "SCICore",
            getString("SCICore"),
            (field, unformatted, includeBaseMapped, item) => {
              var SCICore = ztoolkit.ExtraField.getExtraField(item, "\u4E2D\u56FD\u79D1\u6280\u6838\u5FC3\u671F\u520A");
              return String(SCICore == void 0 ? "" : SCICore);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("SCICore");
        }
        if (ssci) {
          yield ztoolkit.ItemTree.register(
            "SSCI",
            getString("SSCI"),
            (field, unformatted, includeBaseMapped, item) => {
              var SSCI = ztoolkit.ExtraField.getExtraField(item, "SSCI");
              return String(SSCI == void 0 ? "" : SSCI);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("SSCI");
        }
        if (ajg) {
          yield ztoolkit.ItemTree.register(
            "AJG",
            getString("AJG"),
            (field, unformatted, includeBaseMapped, item) => {
              var AJG = ztoolkit.ExtraField.getExtraField(item, "AJG");
              return String(AJG == void 0 ? "" : AJG);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("AJG");
        }
        if (utd24) {
          yield ztoolkit.ItemTree.register(
            "UTD24",
            getString("UTD24"),
            (field, unformatted, includeBaseMapped, item) => {
              var UTD24 = ztoolkit.ExtraField.getExtraField(item, "UTD24");
              return String(UTD24 == void 0 ? "" : UTD24);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("UTD24");
        }
        if (ft50) {
          yield ztoolkit.ItemTree.register(
            "FT50",
            getString("FT50"),
            (field, unformatted, includeBaseMapped, item) => {
              var FT50 = ztoolkit.ExtraField.getExtraField(item, "FT50");
              return String(FT50 == void 0 ? "" : FT50);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("FT50");
        }
        if (ccf) {
          yield ztoolkit.ItemTree.register(
            "CCF",
            getString("CCF"),
            (field, unformatted, includeBaseMapped, item) => {
              var CCF = ztoolkit.ExtraField.getExtraField(item, "CCF");
              return String(CCF == void 0 ? "" : CCF);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("CCF");
        }
        if (fms) {
          yield ztoolkit.ItemTree.register(
            "FMS",
            getString("FMS"),
            (field, unformatted, includeBaseMapped, item) => {
              var FMS = ztoolkit.ExtraField.getExtraField(item, "FMS");
              return String(FMS == void 0 ? "" : FMS);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("FMS");
        }
        if (jci) {
          yield ztoolkit.ItemTree.register(
            "JCI",
            getString("JCI"),
            (field, unformatted, includeBaseMapped, item) => {
              var JCI = ztoolkit.ExtraField.getExtraField(item, "JCI");
              return String(JCI == void 0 ? "" : JCI);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("JCI");
        }
        if (sciwarn) {
          yield ztoolkit.ItemTree.register(
            "sciwarn",
            getString("sciwarn"),
            (field, unformatted, includeBaseMapped, item) => {
              var sciwarn2 = ztoolkit.ExtraField.getExtraField(item, "\u4E2D\u79D1\u9662\u9884\u8B66");
              return String(sciwarn2 == void 0 ? "" : sciwarn2);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("sciwarn");
        }
        if (ahci) {
          yield ztoolkit.ItemTree.register(
            "AHCI",
            getString("AHCI"),
            (field, unformatted, includeBaseMapped, item) => {
              var AHCI = ztoolkit.ExtraField.getExtraField(item, "AHCI");
              return String(AHCI == void 0 ? "" : AHCI);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("AHCI");
        }
        if (compoundIFs) {
          yield ztoolkit.ItemTree.register(
            "compoundIF",
            getString("compoundIF"),
            (field, unformatted, includeBaseMapped, item) => {
              var compoundIF = ztoolkit.ExtraField.getExtraField(item, "\u590D\u5408\u5F71\u54CD\u56E0\u5B50");
              return String(compoundIF == void 0 ? "" : compoundIF);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("compoundIF");
        }
        if (comprehensiveIFs) {
          yield ztoolkit.ItemTree.register(
            "comprehensiveIF",
            getString("comprehensiveIF"),
            (field, unformatted, includeBaseMapped, item) => {
              var comprehensiveIF = ztoolkit.ExtraField.getExtraField(item, "\u7EFC\u5408\u5F71\u54CD\u56E0\u5B50");
              return String(comprehensiveIF == void 0 ? "" : comprehensiveIF);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("comprehensiveIF");
        }
        if (njauCoreShow) {
          yield ztoolkit.ItemTree.register(
            "njauCore",
            getString("njauCore"),
            (field, unformatted, includeBaseMapped, item) => {
              var njauCore2 = ztoolkit.ExtraField.getExtraField(item, "\u5357\u519C\u6838\u5FC3");
              return String(njauCore2 == void 0 ? "" : njauCore2);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("njauCore");
        }
        if (njauJourShow) {
          yield ztoolkit.ItemTree.register(
            "njauJour",
            getString("njauJour"),
            (field, unformatted, includeBaseMapped, item) => {
              var njauJourIF = ztoolkit.ExtraField.getExtraField(item, "\u5357\u519C\u9AD8\u8D28\u91CF");
              return String(njauJourIF == void 0 ? "" : njauJourIF);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("njauJour");
        }
        if (swufe) {
          yield ztoolkit.ItemTree.register(
            "swufe",
            getString("swufe"),
            (field, unformatted, includeBaseMapped, item) => {
              var IFswufe = ztoolkit.ExtraField.getExtraField(item, "\u897F\u5357\u8D22\u7ECF\u5927\u5B66");
              return String(IFswufe == void 0 ? "" : IFswufe);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("swufe");
        }
        if (cufe) {
          yield ztoolkit.ItemTree.register(
            "cufe",
            getString("cufe"),
            (field, unformatted, includeBaseMapped, item) => {
              var IFcufe = ztoolkit.ExtraField.getExtraField(item, "\u4E2D\u592E\u8D22\u7ECF\u5927\u5B66");
              return String(IFcufe == void 0 ? "" : IFcufe);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("cufe");
        }
        if (uibe) {
          yield ztoolkit.ItemTree.register(
            "uibe",
            getString("uibe"),
            (field, unformatted, includeBaseMapped, item) => {
              var IFuibe = ztoolkit.ExtraField.getExtraField(item, "\u5BF9\u5916\u7ECF\u6D4E\u8D38\u6613\u5927\u5B66");
              return String(IFuibe == void 0 ? "" : IFuibe);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("uibe");
        }
        if (sdufe) {
          yield ztoolkit.ItemTree.register(
            "sdufe",
            getString("sdufe"),
            (field, unformatted, includeBaseMapped, item) => {
              var IFsdufe = ztoolkit.ExtraField.getExtraField(item, "\u5C71\u4E1C\u8D22\u7ECF\u5927\u5B66");
              return String(IFsdufe == void 0 ? "" : IFsdufe);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("sdufe");
        }
        if (xdu) {
          yield ztoolkit.ItemTree.register(
            "xdu",
            getString("xdu"),
            (field, unformatted, includeBaseMapped, item) => {
              var IFxdu = ztoolkit.ExtraField.getExtraField(item, "\u897F\u5B89\u7535\u5B50\u79D1\u6280\u5927\u5B66");
              return String(IFxdu == void 0 ? "" : IFxdu);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("xdu");
        }
        if (swjtu) {
          yield ztoolkit.ItemTree.register(
            "swjtu",
            getString("swjtu"),
            (field, unformatted, includeBaseMapped, item) => {
              var IFswjtu = ztoolkit.ExtraField.getExtraField(item, "\u897F\u5357\u4EA4\u901A\u5927\u5B66");
              return String(IFswjtu == void 0 ? "" : IFswjtu);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("swjtu");
        }
        if (ruc) {
          yield ztoolkit.ItemTree.register(
            "ruc",
            getString("ruc"),
            (field, unformatted, includeBaseMapped, item) => {
              var IFruc = ztoolkit.ExtraField.getExtraField(item, "\u4E2D\u56FD\u4EBA\u6C11\u5927\u5B66");
              return String(IFruc == void 0 ? "" : IFruc);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("ruc");
        }
        if (xmu) {
          yield ztoolkit.ItemTree.register(
            "xmu",
            getString("xmu"),
            (field, unformatted, includeBaseMapped, item) => {
              var IFxmu = ztoolkit.ExtraField.getExtraField(item, "\u53A6\u95E8\u5927\u5B66");
              return String(IFxmu == void 0 ? "" : IFxmu);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("xmu");
        }
        if (sjtu) {
          yield ztoolkit.ItemTree.register(
            "sjtu",
            getString("sjtu"),
            (field, unformatted, includeBaseMapped, item) => {
              var IFsjtu = ztoolkit.ExtraField.getExtraField(item, "\u4E0A\u6D77\u4EA4\u901A\u5927\u5B66");
              return String(IFsjtu == void 0 ? "" : IFsjtu);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("sjtu");
        }
        if (fdu) {
          yield ztoolkit.ItemTree.register(
            "fdu",
            getString("fdu"),
            (field, unformatted, includeBaseMapped, item) => {
              var IFfdu = ztoolkit.ExtraField.getExtraField(item, "\u590D\u65E6\u5927\u5B66");
              return String(IFfdu == void 0 ? "" : IFfdu);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("fdu");
        }
        if (hhu) {
          yield ztoolkit.ItemTree.register(
            "hhu",
            getString("hhu"),
            (field, unformatted, includeBaseMapped, item) => {
              var IFhhu = ztoolkit.ExtraField.getExtraField(item, "\u6CB3\u6D77\u5927\u5B66");
              return String(IFhhu == void 0 ? "" : IFhhu);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("hhu");
        }
        if (scu) {
          yield ztoolkit.ItemTree.register(
            "scu",
            getString("scu"),
            (field, unformatted, includeBaseMapped, item) => {
              var IFscu = ztoolkit.ExtraField.getExtraField(item, "\u56DB\u5DDD\u5927\u5B66");
              return String(IFscu == void 0 ? "" : IFscu);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("scu");
        }
        if (cqu) {
          yield ztoolkit.ItemTree.register(
            "cqu",
            getString("cqu"),
            (field, unformatted, includeBaseMapped, item) => {
              var IFcqu = ztoolkit.ExtraField.getExtraField(item, "\u91CD\u5E86\u5927\u5B66");
              return String(IFcqu == void 0 ? "" : IFcqu);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("cqu");
        }
        if (nju) {
          yield ztoolkit.ItemTree.register(
            "nju",
            getString("nju"),
            (field, unformatted, includeBaseMapped, item) => {
              var IFnju = ztoolkit.ExtraField.getExtraField(item, "\u5357\u4EAC\u5927\u5B66");
              return String(IFnju == void 0 ? "" : IFnju);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("nju");
        }
        if (xju) {
          yield ztoolkit.ItemTree.register(
            "xju",
            getString("xju"),
            (field, unformatted, includeBaseMapped, item) => {
              var IFxju = ztoolkit.ExtraField.getExtraField(item, "\u65B0\u7586\u5927\u5B66");
              return String(IFxju == void 0 ? "" : IFxju);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("xju");
        }
        if (cug) {
          yield ztoolkit.ItemTree.register(
            "cug",
            getString("cug"),
            (field, unformatted, includeBaseMapped, item) => {
              var IFcug = ztoolkit.ExtraField.getExtraField(item, "\u4E2D\u56FD\u5730\u8D28\u5927\u5B66");
              return String(IFcug == void 0 ? "" : IFcug);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("cug");
        }
        if (cju) {
          yield ztoolkit.ItemTree.register(
            "cju",
            getString("cju"),
            (field, unformatted, includeBaseMapped, item) => {
              var IFcju = ztoolkit.ExtraField.getExtraField(item, "\u957F\u6C5F\u5927\u5B66");
              return String(IFcju == void 0 ? "" : IFcju);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("cju");
        }
        if (zju) {
          yield ztoolkit.ItemTree.register(
            "zju",
            getString("zju"),
            (field, unformatted, includeBaseMapped, item) => {
              var IFzju = ztoolkit.ExtraField.getExtraField(item, "\u6D59\u6C5F\u5927\u5B66");
              return String(IFzju == void 0 ? "" : IFzju);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("zju");
        }
        if (clsci) {
          yield ztoolkit.ItemTree.register(
            "clsci",
            getString("clsci"),
            (field, unformatted, includeBaseMapped, item) => {
              var IFclsci = ztoolkit.ExtraField.getExtraField(item, "CLSCI");
              return String(IFclsci == void 0 ? "" : IFclsci);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("clsci");
        }
        if (ami) {
          yield ztoolkit.ItemTree.register(
            "ami",
            getString("ami"),
            (field, unformatted, includeBaseMapped, item) => {
              var IFami = ztoolkit.ExtraField.getExtraField(item, "AMI");
              return String(IFami == void 0 ? "" : IFami);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("ami");
        }
        if (nssf) {
          yield ztoolkit.ItemTree.register(
            "nssf",
            getString("nssf"),
            (field, unformatted, includeBaseMapped, item) => {
              var IFnssf = ztoolkit.ExtraField.getExtraField(item, "NSSF");
              return String(IFnssf == void 0 ? "" : IFnssf);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("nssf");
        }
        if (summary) {
          yield ztoolkit.ItemTree.register(
            "summary",
            getString("summary"),
            (field, unformatted, includeBaseMapped, item) => {
              var IFSummary = ztoolkit.ExtraField.getExtraField(item, "\u603B\u7ED3");
              return String(IFSummary == void 0 ? "" : IFSummary);
            }
          );
        } else {
          yield ztoolkit.ItemTree.unregister("summary");
        }
      });
    }
    // @example
    // static async registerExtraColumnWithCustomCell() {
    //   await ztoolkit.ItemTree.register(
    //     // "test2",
    //     // "custom column",
    //     "JCR",
    //     "JCR",
    //     (
    //       field: string,
    //       unformatted: boolean,
    //       includeBaseMapped: boolean,
    //       item: Zotero.Item
    //     ) => {
    //       // return String(item.id);
    //       var jcr = ztoolkit.ExtraField.getExtraField(item, 'JCR分区')
    //       return String(jcr == undefined ? '' : jcr);
    //     },
    //     // {
    //     //   renderCellHook(index, data, column) {
    //     //     const span = document.createElementNS(
    //     //       "http://www.w3.org/1999/xhtml",
    //     //       "span"
    //     //     );
    //     //     span.style.background = "#0dd068";
    //     //     span.innerText = "⭐" + data;
    //     //     return span;
    //     //   },
    //     // }
    //   );
    // }
    /*
        @example
        static async registerCustomCellRenderer() {
          await ztoolkit.ItemTree.addRenderCellHook(
            "title",
            (index: number, data: string, column: any, original: Function) => {
              const span = original(index, data, column) as HTMLSpanElement;
              span.style.background = "rgb(30, 30, 30)";
              span.style.color = "rgb(156, 220, 240)";
              return span;
            }
          );
          // @ts-ignore
          // This is a private method. Make it public in toolkit.
          await ztoolkit.ItemTree.refresh();
        }
    
        @example
        static registerLibraryTabPanel() {
          const tabId = ztoolkit.LibraryTabPanel.register(
            getString("tabpanel.lib.tab.label"),
            (panel: XUL.Element, win: Window) => {
              const elem = ztoolkit.UI.createElement(win.document, "vbox", {
                children: [
                  {
                    tag: "h2",
                    properties: {
                      innerText: "Hello World!",
                    },
                  },
                  {
                    tag: "div",
                    properties: {
                      innerText: "This is a library tab.",
                    },
                  },
                  {
                    tag: "button",
                    namespace: "html",
                    properties: {
                      innerText: "Unregister",
                    },
                    listeners: [
                      {
                        type: "click",
                        listener: () => {
                          ztoolkit.LibraryTabPanel.unregister(tabId);
                        },
                      },
                    ],
                  },
                ],
              });
              panel.append(elem);
            },
            {
              targetIndex: 1,
            }
          );
        }
    
        @example
        static async registerReaderTabPanel() {
          const tabId = await ztoolkit.ReaderTabPanel.register(
            getString("tabpanel.reader.tab.label"),
            (
              panel: XUL.TabPanel | undefined,
              deck: XUL.Deck,
              win: Window,
              reader: _ZoteroTypes.ReaderInstance
            ) => {
              if (!panel) {
                ztoolkit.log(
                  "This reader do not have right-side bar. Adding reader tab skipped."
                );
                return;
              }
              ztoolkit.log(reader);
              const elem = ztoolkit.UI.createElement(win.document, "vbox", {
                id: `${config.addonRef}-${reader._instanceID}-extra-reader-tab-div`,
                // This is important! Don't create content for multiple times
                // ignoreIfExists: true,
                removeIfExists: true,
                children: [
                  {
                    tag: "h2",
                    properties: {
                      innerText: "Hello World!",
                    },
                  },
                  {
                    tag: "div",
                    properties: {
                      innerText: "This is a reader tab.",
                    },
                  },
                  {
                    tag: "div",
                    properties: {
                      innerText: `Reader: ${reader._title.slice(0, 20)}`,
                    },
                  },
                  {
                    tag: "div",
                    properties: {
                      innerText: `itemID: ${reader.itemID}.`,
                    },
                  },
                  {
                    tag: "button",
                    namespace: "html",
                    properties: {
                      innerText: "Unregister",
                    },
                    listeners: [
                      {
                        type: "click",
                        listener: () => {
                          ztoolkit.ReaderTabPanel.unregister(tabId);
                        },
                      },
                    ],
                  },
                ],
              });
              panel.append(elem);
            },
            {
              targetIndex: 1,
            }
          );
        }
        */
  };
  var UIExampleFactory = _UIExampleFactory;
  __decorateClass([
    example
  ], UIExampleFactory, "registerRightClickMenuItem", 1);
  __decorateClass([
    example
  ], UIExampleFactory, "registerWindowMenuWithSeprator", 1);
  __decorateClass([
    example
  ], UIExampleFactory, "hideMenu", 1);
  __decorateClass([
    example
  ], UIExampleFactory, "disableUppJourAbbDot", 1);
  __decorateClass([
    example
  ], UIExampleFactory, "registerExtraColumn", 1);
  var _HelperExampleFactory = class {
    // 生成空格，如果是中文是无空格，英文为空格
    static whiteSpace() {
      var lanUI = Zotero.Prefs.get("intl.locale.requested", true);
      var whiteSpace = " ";
      if (lanUI == "zh-CN") {
        whiteSpace = "";
      }
      ;
      return whiteSpace;
    }
    static emptyExtra() {
      return __async(this, null, function* () {
        var items = KeyExampleFactory.getSelectedItems();
        if (items.length == 0) {
          var alertInfo = getString("zeroItem");
          this.progressWindow(alertInfo, "fail");
          return;
        } else {
          var truthBeTold = window.confirm(getString("cleanExtraAlt"));
          if (truthBeTold) {
            for (let item of items) {
              if (item.isRegularItem() && !item.isCollection()) {
                try {
                  item.setField("extra", "");
                  item.save();
                } catch (error) {
                  Zotero.debug("Extra\u6E05\u7A7A\u5931\u8D25\uFF01");
                }
              }
            }
            var alertInfo = getString("cleanExtraSuc");
            _HelperExampleFactory.progressWindow(alertInfo, "success");
          }
        }
      });
    }
    // 更改期刊名称
    // static async chPubTitle(searchText: string, repText: string) {
    //   new ztoolkit.ProgressWindow(config.addonName)
    //     .createLine({
    //       text: 'find:' + searchText + 'replace:' + repText,
    //       type: "success",
    //       progress: 100,
    //     })
    //     .show();
    // }
    // 更改期刊名称
    static chPubTitle(oldTitle, newTitle) {
      return __async(this, null, function* () {
        if (oldTitle == "" || newTitle == "") {
          var alertInfo = getString("pubTitleEmpty");
          _HelperExampleFactory.progressWindow(alertInfo, "fail");
        } else {
          var items = KeyExampleFactory.getSelectedItems();
          var n = 0;
          var itemOldTitle = "";
          if (items.length == 0) {
            var alertInfo = getString("zeroItem");
            this.progressWindow(alertInfo, "fail");
            return;
          } else {
            for (let item of items) {
              itemOldTitle = item.getField("publicationTitle").trim();
              if (oldTitle == itemOldTitle) {
                item.setField("publicationTitle", newTitle);
                yield item.saveTx();
                n++;
              }
            }
            var statusInfo = n == 0 ? "fail" : "success";
            var whiteSpace = _HelperExampleFactory.whiteSpace();
            alertInfo = n + whiteSpace + getString("successPubTitle");
            _HelperExampleFactory.progressWindow(alertInfo, statusInfo);
          }
        }
      });
    }
    // 更改期刊大小写
    static chPubTitleCase() {
      return __async(this, null, function* () {
        var items = KeyExampleFactory.getSelectedItems();
        var whiteSpace = _HelperExampleFactory.whiteSpace();
        var n = 0;
        var newPubTitle = "";
        if (items.length == 0) {
          var alertInfo = getString("zeroItem");
          this.progressWindow(alertInfo, "fail");
          return;
        } else {
          for (let item of items) {
            var oldPubTitle = item.getField("publicationTitle").trim();
            newPubTitle = _HelperExampleFactory.titleCase(oldPubTitle).replace(" And ", " and ").replace(" For ", " for ").replace(" In ", " in ").replace(" Of ", " of ").replace("Plos One", "PLOS ONE").replace("Plos", "PLOS").replace("Msystems", "mSystems").replace("Lwt", "LWT").replace("LWT-food", "LWT-Food").replace("LWT - food", "LWT - Food").replace("Ieee", "IEEE").replace("Gida", "GIDA").replace("Pnas", "PNAS").replace("Iscience", "iScience");
            item.setField("publicationTitle", newPubTitle);
            yield item.saveTx();
            n++;
          }
          var statusInfo = n == 0 ? "fail" : "success";
          alertInfo = n + whiteSpace + getString("successPubTitleCase");
          this.progressWindow(alertInfo, statusInfo);
        }
      });
    }
    static chanItemTitleCase() {
      return __async(this, null, function* () {
        var items = KeyExampleFactory.getSelectedItems();
        var whiteSpace = _HelperExampleFactory.whiteSpace();
        var n = 0;
        if (items.length == 0) {
          var alertInfo = getString("zeroItem");
          this.progressWindow(alertInfo, "fail");
          return;
        } else {
          for (let item of items) {
            var title = item.getField("title");
            if (_HelperExampleFactory.detectUpCase(title)) {
              title = _HelperExampleFactory.titleCase(title);
              alertInfo = getString("allUpcase");
              _HelperExampleFactory.progressWindow(alertInfo, "infomation");
            }
            var new_title = title.replace(/\b([A-Z][a-z0-9]+|A)\b/g, function(x) {
              return x.toLowerCase();
            });
            new_title = new_title.replace(/(^|\?\s*)[a-z]/, function(x) {
              return x.toUpperCase();
            }).replace("china", "China").replace("chinese", "Chinese").replace("america", "America").replace("english", "English").replace("england", "England").replace("3d", "3D").replace("india", "India").replace("dpph", "DPPH").replace("abts", "ABTS").replace(/：|:\s*\w/, (fullMatch) => fullMatch.toUpperCase());
            n++;
            item.setField("title", new_title);
            yield item.saveTx();
          }
        }
        var statusInfo = n == 0 ? "fail" : "success";
        alertInfo = n + whiteSpace + getString("successItemTitleCase");
        this.progressWindow(alertInfo, statusInfo);
      });
    }
    // 检查句子是否为全部大写
    static detectUpCase(word) {
      var arr_is_uppercase = [];
      for (var char of word) {
        if (char.charCodeAt(0) < 97) {
          arr_is_uppercase.push(1);
        } else {
          arr_is_uppercase.push(0);
        }
      }
      var uppercase_sum = arr_is_uppercase.reduce((x, y) => x + y);
      if (uppercase_sum === word.length) {
        return true;
      } else {
        return false;
      }
    }
    // 更新期刊缩写
    static upJourAbb(item) {
      return __async(this, null, function* () {
        var upJourAbb = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.update.abbr`, true);
        var dotAbb = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.update.abbr.dot`, true);
        var enAbb = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.en.abbr`, true);
        var chAbb = Zotero.Prefs.get(`extensions.zotero.${config.addonRef}.ch.abbr`, true);
        var pattern = new RegExp("[\u4E00-\u9FA5]+");
        var title = String(item.getField("title"));
        var lan = pattern.test(title) ? "zh-CN" : "en-US";
        var pubT = item.getField("publicationTitle");
        if (upJourAbb) {
          try {
            var jourAbbs = yield _HelperExampleFactory.getJourAbb(pubT);
          } catch (e) {
            Zotero.debug("\u83B7\u53D6\u671F\u520A\u7F29\u5199\u5931\u8D25");
          }
          if (jourAbbs["record"] == 0) {
            try {
              var jourAbbs = yield _HelperExampleFactory.getJourAbb(pubT.replace("&", "and"));
            } catch (e) {
              Zotero.debug("\u83B7\u53D6\u671F\u520A\u7F29\u5199\u5931\u8D25");
            }
          }
          if (jourAbbs["record"] == 0) {
            try {
              var jourAbbs = getAbbEx(pubT);
            } catch (e) {
              Zotero.debug("\u83B7\u53D6\u81EA\u5B9A\u4E49\u671F\u520A\u7F29\u5199\u5931\u8D25");
            }
          }
          if (jourAbbs["record"] == 0) {
            try {
              var jourAbbs = yield _HelperExampleFactory.getJourAbb(pubT.replace(/the\s/i, ""));
            } catch (e) {
              Zotero.debug("\u83B7\u53D6\u671F\u520A\u7F29\u5199\u5931\u8D25");
            }
          }
          if (jourAbbs["record"] != 0) {
            try {
              var jourAbb = dotAbb ? jourAbbs["abb_with_dot"] : jourAbbs["abb_no_dot"];
              var abb = _HelperExampleFactory.titleCase(jourAbb);
              abb = abb.replace("Ieee", "IEEE").replace("Acs", "ACS").replace("Aip", "AIP").replace("Apl", "APL").replace("Avs", "AVS").replace("Bmc", "BMC").replace("Iet", "IET").replace("Rsc", "RSC").replace("U S A", "USA").replace("U. S. A.", "U.S.A.");
              item.setField("journalAbbreviation", abb);
            } catch (e) {
              return;
            }
          } else {
            if (enAbb && lan == "en-US") {
              item.setField("journalAbbreviation", pubT);
            } else if (chAbb && lan == "zh-CN") {
              item.setField("journalAbbreviation", pubT);
            }
          }
        }
        item.saveTx();
      });
    }
    // 得到期刊缩写
    static getJourAbb(pubT) {
      return __async(this, null, function* () {
        var url = "https://www.linxingzhong.top/journal";
        var postData = {
          key: "journal",
          "fullname": pubT
        };
        var headers = { "Content-Type": "application/json" };
        var resp = yield Zotero.HTTP.request("POST", url, {
          body: JSON.stringify(postData),
          headers
        });
        try {
          var record = JSON.parse(resp.responseText);
          return record;
        } catch (e) {
          return;
        }
      });
    }
    static auProcess(author, process) {
      return __async(this, null, function* () {
        var oldName = _HelperExampleFactory.newNames(author, process)[0];
        var newFirstName = _HelperExampleFactory.newNames(author, process)[1];
        var newLastName = _HelperExampleFactory.newNames(author, process)[2];
        var newFieldMode = _HelperExampleFactory.newNames(author, process)[3];
        var mergeedName = _HelperExampleFactory.newNames(author, process)[4];
        var mergeedNameNew = _HelperExampleFactory.newNames(author, process)[5];
        var rn = 0;
        var items = KeyExampleFactory.getSelectedItems();
        if (items.length == 0) {
          alertInfo = getString("zeroItem");
          _HelperExampleFactory.progressWindow(alertInfo, "fail");
        } else {
          for (let item of items) {
            let creators = item.getCreators();
            let newCreators = [];
            for (let creator of creators) {
              if (`${creator.firstName} ${creator.lastName}`.trim() == oldName) {
                creator.firstName = newFirstName;
                creator.lastName = newLastName;
                creator.fieldMode = newFieldMode;
                rn++;
              }
              if (`${_HelperExampleFactory.replaceBoldStar(creator.lastName)}`.trim() == mergeedName) {
                creator.firstName = "";
                creator.lastName = mergeedNameNew;
                creator.fieldMode = newFieldMode;
                rn++;
              }
              if (`${_HelperExampleFactory.replaceBoldStar(creator.firstName)} ${_HelperExampleFactory.replaceBoldStar(creator.lastName)}`.trim() == oldName) {
                creator.firstName = newFirstName;
                creator.lastName = newLastName;
                creator.fieldMode = newFieldMode;
                rn++;
              }
              newCreators.push(creator);
            }
            item.setCreators(newCreators);
            yield item.save();
          }
          var whiteSpace = _HelperExampleFactory.whiteSpace();
          var statusInfo = rn > 0 ? "success" : "fail";
          var alertInfo = `${rn} ${whiteSpace} ${getString("authorChanged")}`;
          _HelperExampleFactory.progressWindow(alertInfo, statusInfo);
        }
      });
    }
    // 返回新的名字用以替换
    static newNames(authorName, boldStar) {
      var newName = [];
      var splitName = "";
      var oldName = "";
      var newFirstName = "";
      var newLastName = "";
      var reg = new RegExp("[\u4E00-\u9FA5]+");
      var mergeedName = "";
      var mergeedNameNew = "";
      var alertInfo = "";
      if (authorName == "") {
        alertInfo = getString("authorEmpty");
        _HelperExampleFactory.progressWindow(alertInfo, "fail");
      } else if (!/\s/.test(authorName)) {
        alertInfo = getString("authorNoSpace");
        _HelperExampleFactory.progressWindow(alertInfo, "fail");
      } else {
        var splitName = authorName.split(/\s/);
        var firstName = splitName[1];
        var lastName = splitName[0];
        oldName = firstName + " " + lastName;
        Zotero.debug(reg.test(authorName) + ": ture \u4E3A\u4E2D\u6587");
        if (reg.test(authorName)) {
          var newFieldMode = 1;
          mergeedName = authorName.replace(/\s/, "");
        } else {
          newFieldMode = 0;
          mergeedName = oldName;
        }
        ;
        switch (boldStar) {
          case "boldStar":
            mergeedNameNew = "<b>" + mergeedName + "*</b>";
            newFirstName = "<b>" + firstName + "*</b>";
            newLastName = "<b>" + lastName + "</b>";
            if (reg.test(authorName)) {
              newFirstName = "";
              newLastName = "<b>" + lastName + firstName + "*</b>";
            }
            ;
            break;
          case "bold":
            mergeedNameNew = "<b>" + mergeedName + "</b>";
            newFirstName = "<b>" + firstName + "</b>";
            newLastName = "<b>" + lastName + "</b>";
            if (reg.test(authorName)) {
              newFirstName = "";
              newLastName = "<b>" + lastName + firstName + "</b>";
            }
            ;
            break;
          case "star":
            mergeedNameNew = mergeedName + "*";
            newFirstName = firstName + "*";
            newLastName = lastName;
            if (reg.test(authorName)) {
              newFirstName = "";
              newLastName = lastName + firstName + "*";
            }
            ;
            break;
          case "n":
            break;
        }
        newName.push(oldName, newFirstName, newLastName, newFieldMode, mergeedName, mergeedNameNew);
        return newName;
      }
    }
    //删除作者姓名中的粗体和星号标识
    static replaceBoldStar(auName) {
      return auName.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(/\*/g, "");
    }
    // 清除加粗
    static cleanBold() {
      return __async(this, null, function* () {
        var rn = 0;
        var items = KeyExampleFactory.getSelectedItems();
        if (items.length == 0) {
          alertInfo = getString("zeroItem");
          _HelperExampleFactory.progressWindow(alertInfo, "fail");
          return;
        }
        for (let item of items) {
          let creators = item.getCreators();
          let newCreators = [];
          for (let creator of creators) {
            if (/<b>/.test(creator.firstName) || /<b>/.test(creator.lastName)) {
              creator.firstName = creator.firstName.replace(/<b>/g, "").replace(/<\/b>/g, "");
              creator.lastName = creator.lastName.replace(/<b>/g, "").replace(/<\/b>/g, "");
              creator.fieldMode = creator.fieldMode;
              rn++;
            }
            newCreators.push(creator);
          }
          item.setCreators(newCreators);
          yield item.saveTx();
        }
        var whiteSpace = _HelperExampleFactory.whiteSpace();
        var statusInfo = rn > 0 ? "success" : "fail";
        var alertInfo = `${rn} ${whiteSpace} ${getString("authorChanged")}`;
        _HelperExampleFactory.progressWindow(alertInfo, statusInfo);
      });
    }
    // 清除加星
    static cleanStar() {
      return __async(this, null, function* () {
        var rn = 0;
        var items = KeyExampleFactory.getSelectedItems();
        if (items.length == 0) {
          alertInfo = getString("zeroItem");
          _HelperExampleFactory.progressWindow(alertInfo, "fail");
          return;
        }
        for (let item of items) {
          let creators = item.getCreators();
          let newCreators = [];
          for (let creator of creators) {
            if (/\*/.test(creator.firstName) || /\*/.test(creator.lastName)) {
              creator.firstName = creator.firstName.replace(/\*/g, "");
              creator.lastName = creator.lastName.replace(/\*/g, "");
              creator.fieldMode = creator.fieldMode;
              rn++;
            }
            newCreators.push(creator);
          }
          item.setCreators(newCreators);
          yield item.saveTx();
        }
        var whiteSpace = _HelperExampleFactory.whiteSpace();
        var statusInfo = rn > 0 ? "success" : "fail";
        var alertInfo = `${rn} ${whiteSpace} ${getString("authorChanged")}`;
        _HelperExampleFactory.progressWindow(alertInfo, statusInfo);
      });
    }
    // 清除加粗加星
    static cleanBoldAndStar() {
      return __async(this, null, function* () {
        var rn = 0;
        var items = KeyExampleFactory.getSelectedItems();
        if (items.length == 0) {
          alertInfo = getString("zeroItem");
          _HelperExampleFactory.progressWindow(alertInfo, "fail");
          return;
        }
        for (let item of items) {
          let creators = item.getCreators();
          let newCreators = [];
          for (let creator of creators) {
            if (/<b>/.test(creator.firstName) || /<b>/.test(creator.lastName) || /\*/.test(creator.firstName) || /\*/.test(creator.lastName)) {
              creator.firstName = creator.firstName.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(/\*/g, "");
              creator.lastName = creator.lastName.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(/\*/g, "");
              creator.fieldMode = creator.fieldMode;
              rn++;
            }
            newCreators.push(creator);
          }
          item.setCreators(newCreators);
          yield item.saveTx();
        }
        var whiteSpace = _HelperExampleFactory.whiteSpace();
        var statusInfo = rn > 0 ? "success" : "fail";
        var alertInfo = `${rn} ${whiteSpace} ${getString("authorChanged")}`;
        _HelperExampleFactory.progressWindow(alertInfo, statusInfo);
      });
    }
    // 交换作者姓和名
    static swapAuthorName() {
      return __async(this, null, function* () {
        var rn = 0;
        var items = KeyExampleFactory.getSelectedItems();
        if (items.length == 0) {
          alertInfo = getString("zeroItem");
          _HelperExampleFactory.progressWindow(alertInfo, "fail");
          return;
        } else {
          for (let item of items) {
            let creators = item.getCreators();
            let newCreators = [];
            for (let creator of creators) {
              let firstName = creator.firstName;
              let lastName = creator.lastName;
              creator.firstName = lastName;
              creator.lastName = firstName;
              creator.fieldMode = creator.fieldMode;
              newCreators.push(creator);
            }
            item.setCreators(newCreators);
            rn++;
            yield item.save();
          }
        }
        var whiteSpace = _HelperExampleFactory.whiteSpace();
        var statusInfo = rn > 0 ? "success" : "fail";
        var alertInfo = rn + whiteSpace + getString("itemAuSwapped");
        _HelperExampleFactory.progressWindow(alertInfo, statusInfo);
      });
    }
    static changAuthorCase() {
      return __async(this, null, function* () {
        var rn = 0;
        var items = KeyExampleFactory.getSelectedItems();
        if (items.length == 0) {
          alertInfo = getString("zeroItem");
          _HelperExampleFactory.progressWindow(alertInfo, "fail");
          return;
        } else {
          for (let item of items) {
            var creators = item.getCreators();
            let newCreators = [];
            for (let creator of creators) {
              creator.firstName = _HelperExampleFactory.titleCase(creator.firstName.trim());
              creator.lastName = _HelperExampleFactory.titleCase(creator.lastName.trim());
              creator.fieldMode = creator.fieldMode;
              newCreators.push(creator);
            }
            item.setCreators(newCreators);
            yield item.save();
            rn++;
          }
        }
        var whiteSpace = _HelperExampleFactory.whiteSpace();
        var statusInfo = rn > 0 ? "success" : "fail";
        var alertInfo = `${rn} ${whiteSpace} ${getString("itemAuthorChanged")}`;
        _HelperExampleFactory.progressWindow(alertInfo, statusInfo);
      });
    }
    // 将单词转为首字母大写
    static titleCase(str) {
      var newStr = str.split(" ");
      for (var i = 0; i < newStr.length; i++) {
        newStr[i] = newStr[i].slice(0, 1).toUpperCase() + newStr[i].slice(1).toLowerCase();
      }
      return newStr.join(" ");
    }
    static itemTitleFindRep(oldTitle, newTitle) {
      return __async(this, null, function* () {
        if (oldTitle == "" || newTitle == "") {
          var alertInfo = getString("titleEmpty");
          _HelperExampleFactory.progressWindow(alertInfo, "fail");
        } else if (oldTitle == newTitle) {
          alertInfo = getString("findRepSame");
          _HelperExampleFactory.progressWindow(alertInfo, "fail");
        } else {
          var n = 0;
          var itemOldTitle = "";
          var replaced_title = "";
          var items = KeyExampleFactory.getSelectedItems();
          if (items.length == 0) {
            alertInfo = getString("zeroItem");
            _HelperExampleFactory.progressWindow(alertInfo, "fail");
            return;
          } else {
            for (let item of items) {
              itemOldTitle = item.getField("title").trim();
              if (itemOldTitle.indexOf(oldTitle) != -1) {
                replaced_title = itemOldTitle.replace(oldTitle, newTitle);
                item.setField("title", replaced_title);
                yield item.saveTx();
                n++;
              }
            }
          }
          var whiteSpace = _HelperExampleFactory.whiteSpace();
          var statusInfo = n > 0 ? "success" : "fail";
          var alertInfo = `${n} ${whiteSpace} ${getString("itemTitleFindRepSuc")}`;
          _HelperExampleFactory.progressWindow(alertInfo, statusInfo);
        }
      });
    }
    // 作者处理对话框{
    static dialogAuProcess() {
      return __async(this, null, function* () {
        var padding = "1px 1px 1px 1px";
        var margin = "1px 1px 1px 30px";
        var widthSmall = "60px";
        var widthMiddle = "90px";
        var widthLarge = "125px";
        const dialog = new ztoolkit.Dialog(5, 3).addCell(
          0,
          0,
          {
            tag: "h4",
            styles: {
              height: "10px",
              margin,
              // border: border,
              padding
            },
            properties: { innerHTML: getString("authorProcess") }
          },
          false
        ).addCell(
          1,
          0,
          {
            tag: "p",
            styles: {
              width: "460px",
              padding,
              margin
              // border: border,
            },
            properties: { innerHTML: getString("authorProcessName") }
          },
          false
        ).addCell(
          2,
          0,
          {
            tag: "input",
            id: "dialog-input4",
            styles: {
              width: "300px",
              margin: "10px 1px 1px 70px"
              // border: border,
            }
          },
          false
        ).addCell(
          3,
          0,
          {
            //作者加粗对话框
            tag: "button",
            namespace: "html",
            styles: {
              padding,
              margin: "1px 1px 1px 40px"
              // border: border,
            },
            attributes: {
              type: "button"
            },
            listeners: [
              {
                type: "click",
                listener: (e) => {
                  var author = dialog.window.document.getElementById("dialog-input4").value;
                  this.auProcess(author, "bold");
                }
              }
            ],
            children: [
              {
                tag: "div",
                styles: {
                  width: widthSmall,
                  padding
                },
                properties: {
                  innerHTML: getString("boldLabel")
                }
              }
            ]
          },
          false
        ).addCell(
          3,
          1,
          {
            //作者加星对话框
            tag: "button",
            styles: {
              padding,
              margin
            },
            namespace: "html",
            attributes: {
              type: "button"
            },
            listeners: [
              {
                type: "click",
                listener: (e) => {
                  var author = dialog.window.document.getElementById("dialog-input4").value;
                  this.auProcess(author, "star");
                }
              }
            ],
            children: [
              {
                tag: "div",
                styles: {
                  width: widthMiddle,
                  padding
                },
                properties: {
                  innerHTML: getString("starLabel")
                }
              }
            ]
          },
          false
        ).addCell(
          3,
          2,
          {
            //作者加粗加星对话框
            tag: "button",
            styles: {
              padding,
              margin
              // border: border,
            },
            namespace: "html",
            attributes: {
              type: "button"
            },
            listeners: [
              {
                type: "click",
                listener: (e) => {
                  var author = dialog.window.document.getElementById("dialog-input4").value;
                  this.auProcess(author, "boldStar");
                }
              }
            ],
            children: [
              {
                tag: "div",
                styles: {
                  width: widthLarge,
                  padding
                },
                properties: {
                  innerHTML: getString("boldStarLabel")
                }
              }
            ]
          },
          false
        ).addCell(
          4,
          0,
          {
            //作者去粗
            tag: "button",
            styles: {
              padding,
              margin: "1px 1px 1px 40px"
              // border: border,
            },
            namespace: "html",
            attributes: {
              type: "button"
            },
            listeners: [
              {
                type: "click",
                listener: (e) => {
                  _HelperExampleFactory.cleanBold();
                }
              }
            ],
            children: [
              {
                tag: "div",
                styles: {
                  width: widthSmall,
                  padding
                  // margin: '20px 20px 20px 20px',
                },
                properties: {
                  innerHTML: getString("cleanBoldLabel")
                }
              }
            ]
          },
          false
        ).addCell(
          4,
          1,
          {
            //作者去星
            tag: "button",
            styles: {
              padding,
              margin
              // border: border,
            },
            namespace: "html",
            attributes: {
              type: "button"
            },
            listeners: [
              {
                type: "click",
                listener: (e) => {
                  _HelperExampleFactory.cleanStar();
                }
              }
            ],
            children: [
              {
                tag: "div",
                styles: {
                  width: widthMiddle,
                  padding
                },
                properties: {
                  innerHTML: getString("cleanStarLabel")
                }
              }
            ]
          },
          false
        ).addCell(
          4,
          2,
          {
            //作者去粗去星对话框
            tag: "button",
            styles: {
              padding,
              margin
              // border: border,
            },
            namespace: "html",
            attributes: {
              type: "button"
            },
            listeners: [
              {
                type: "click",
                listener: (e) => {
                  _HelperExampleFactory.cleanBoldAndStar();
                }
              }
            ],
            children: [
              {
                tag: "div",
                styles: {
                  width: widthLarge,
                  padding
                },
                properties: {
                  innerHTML: getString("cleanBoldStarLabel")
                }
              }
            ]
          },
          false
        ).open(
          getString("authorProcessDiaTitle"),
          {
            width: 500,
            height: 250,
            centerscreen: true
            // fitContent: true,
          }
        );
      });
    }
    // 条目题目查找替换
    static dialogItemTitleProcess() {
      return __async(this, null, function* () {
        var padding = "1px 1px 1px 1px";
        const dialog = new ztoolkit.Dialog(5, 2).addCell(
          0,
          0,
          {
            tag: "h4",
            styles: {
              height: "10px",
              margin: "1px 1px 1px 30px",
              // border: border,
              padding
            },
            properties: { innerHTML: getString("itemTitleFindReplaceLabel") }
          },
          false
        ).addCell(
          1,
          0,
          {
            tag: "p",
            styles: {
              width: "460px",
              padding,
              margin: "1px 1px 1px 30px"
              // border: border,
            },
            properties: { innerHTML: getString("titleSearchReplaceLabel") }
          },
          false
        ).addCell(
          2,
          0,
          {
            tag: "p",
            styles: {
              width: "100px",
              padding,
              margin: "5px 1px 1px 30px"
              // border: border,
            },
            properties: { innerHTML: getString("titleSearLabel") }
          },
          false
        ).addCell(
          2,
          1,
          {
            tag: "input",
            id: "item-title-search-input",
            styles: {
              width: "300px",
              margin: "10px 1px 1px 8px"
              // border: border,
            }
          },
          false
        ).addCell(
          3,
          0,
          {
            tag: "p",
            styles: {
              width: "100px",
              padding,
              margin: "5px 1px 1px 30px"
              // border: border,
            },
            properties: { innerHTML: getString("titleReplaceLabel") }
          },
          false
        ).addCell(
          3,
          1,
          {
            tag: "input",
            id: "item-title-replace-input",
            styles: {
              width: "300px",
              margin: "10px 1px 1px 8px"
              // border: border,
            }
          },
          false
        ).addCell(
          4,
          0,
          {
            tag: "button",
            styles: {
              padding,
              margin: "1px 1px 1px 200px"
              // border: border,
            },
            namespace: "html",
            attributes: {
              type: "button"
            },
            listeners: [
              {
                type: "click",
                listener: (e) => {
                  var searchText = dialog.window.document.getElementById("item-title-search-input").value;
                  var repText = dialog.window.document.getElementById("item-title-replace-input").value;
                  this.itemTitleFindRep(searchText, repText);
                }
              }
            ],
            children: [
              {
                tag: "div",
                styles: {
                  width: "100px",
                  padding
                },
                properties: {
                  innerHTML: getString("titleReplaceButton")
                }
              }
            ]
          },
          false
        ).open(
          getString("titleSearchReplaceWin"),
          {
            width: 510,
            height: 250,
            centerscreen: true
            // fitContent: true,
          }
        );
      });
    }
    // 更改期刊题目对话框
    static dialogChPubTitle() {
      return __async(this, null, function* () {
        var padding = "1px 1px 1px 1px";
        const dialog = new ztoolkit.Dialog(7, 1).addCell(
          0,
          0,
          {
            tag: "h4",
            styles: {
              height: "10px",
              margin: "1px 1px 1px 30px",
              // border: border,
              padding
            },
            properties: { innerHTML: getString("change-pub-title") }
          },
          false
        ).addCell(
          1,
          0,
          {
            tag: "p",
            styles: {
              width: "460px",
              padding,
              margin: "1px 1px 1px 30px"
              // border: border,
            },
            properties: { innerHTML: getString("change-pub-title-desc") }
          },
          false
        ).addCell(
          2,
          0,
          {
            tag: "p",
            styles: {
              width: "400px",
              padding,
              margin: "15px 1px 1px 80px"
              // border: border,
            },
            properties: { innerHTML: getString("old-pub-title") }
          },
          false
        ).addCell(
          3,
          0,
          {
            tag: "input",
            id: "change-pub-title-old",
            styles: {
              width: "300px",
              margin: "10px 1px 1px 80px"
              // border: border,
            }
          },
          false
        ).addCell(
          4,
          0,
          {
            tag: "p",
            styles: {
              width: "400px",
              padding,
              margin: "10px 1px 1px 80px"
              // border: border,
            },
            properties: { innerHTML: getString("new-pub-title") }
          },
          false
        ).addCell(
          5,
          0,
          {
            tag: "input",
            id: "change-pub-title-new",
            styles: {
              width: "300px",
              margin: "10px 1px 1px 80px"
              // border: border,
            }
          },
          false
        ).addCell(
          6,
          0,
          {
            tag: "button",
            styles: {
              padding,
              margin: "15px 1px 1px 150px"
              // border: border,
            },
            namespace: "html",
            attributes: {
              type: "button"
            },
            listeners: [
              {
                type: "click",
                listener: (e) => {
                  var searchText = dialog.window.document.getElementById("change-pub-title-old").value;
                  var repText = dialog.window.document.getElementById("change-pub-title-new").value;
                  this.chPubTitle(searchText, repText);
                }
              }
            ],
            children: [
              {
                tag: "div",
                styles: {
                  width: "150px",
                  padding
                },
                properties: {
                  innerHTML: getString("change-title-bn")
                }
              }
            ]
          },
          false
        ).open(
          getString("change-pub-title"),
          {
            width: 510,
            height: 300,
            centerscreen: true
            // fitContent: true,
          }
        );
      });
    }
    // 作者处理对话框：加粗、加星、去粗、去星
    static dialogAuBoldStar() {
      return __async(this, null, function* () {
        const dialogData = {
          inputValue: "test",
          checkboxValue: true
        };
        const dialog = new ztoolkit.Dialog(5, 2).addCell(0, 0, {
          tag: "h1",
          properties: { innerHTML: "Helper Examples" }
        }).addCell(1, 0, {
          tag: "h2",
          properties: { innerHTML: "Dialog Data Binding" }
        }).addCell(2, 0, {
          tag: "p",
          properties: {
            innerHTML: "Elements with attribute 'data-bind' are binded to the prop under 'dialogData' with the same name."
          },
          styles: {
            width: "200px"
          }
        }).addCell(3, 0, {
          tag: "label",
          namespace: "html",
          attributes: {
            for: "dialog-checkbox"
          },
          properties: { innerHTML: "bind:checkbox" }
        }).addCell(
          3,
          1,
          {
            tag: "input",
            namespace: "html",
            id: "dialog-checkbox",
            attributes: {
              "data-bind": "checkboxValue",
              "data-prop": "checked",
              type: "checkbox"
            },
            properties: { label: "Cell 1,0" }
          },
          false
        ).addCell(4, 0, {
          tag: "label",
          namespace: "html",
          attributes: {
            for: "dialog-input"
          },
          properties: { innerHTML: "bind:input" }
        }).addCell(
          4,
          1,
          {
            tag: "input",
            id: "dialog-input4"
            // attributes: {
            //   "data-bind": "inputValue",
            //   "data-prop": "value",
            //   type: "text",
            // },
          },
          false
        ).addButton("Replace", "replace", {
          noClose: true,
          callback: (e) => {
            var text = dialog.window.document.getElementById("dialog-input4").value;
            new ztoolkit.ProgressWindow(config.addonName).createLine({
              text,
              type: "success",
              progress: 100
            }).show();
          }
        }).addButton("Close", "confirm", {
          noClose: false,
          callback: (e) => {
            ztoolkit.getGlobal("alert")(
              `Close dialog with ${dialogData._lastButtonId}.
Checkbox: ${dialogData.checkboxValue}
Input: ${dialogData.inputValue}.`
            );
          }
        }).setDialogData(dialogData).open(
          "Dialog Example",
          {
            // width: 200,
            // height: 100,
            centerscreen: true,
            fitContent: true
          }
        );
      });
    }
    static progressWindow(info, status) {
      new ztoolkit.ProgressWindow(config.addonName).createLine({
        text: info,
        type: status,
        progress: 100
      }).show();
    }
    static progressWindowExample() {
      new ztoolkit.ProgressWindow(config.addonName).createLine({
        text: "ProgressWindow Example!",
        type: "success",
        progress: 100
      }).show();
    }
    /*
      @example
      static vtableExample() {
        ztoolkit.getGlobal("alert")("See src/modules/preferenceScript.ts");
      }
      */
  };
  var HelperExampleFactory = _HelperExampleFactory;
  __decorateClass([
    example
  ], HelperExampleFactory, "chanItemTitleCase", 1);
  __decorateClass([
    example
  ], HelperExampleFactory, "auProcess", 1);
  __decorateClass([
    example
  ], HelperExampleFactory, "newNames", 1);
  __decorateClass([
    example
  ], HelperExampleFactory, "replaceBoldStar", 1);
  __decorateClass([
    example
  ], HelperExampleFactory, "swapAuthorName", 1);
  __decorateClass([
    example
  ], HelperExampleFactory, "changAuthorCase", 1);
  __decorateClass([
    example
  ], HelperExampleFactory, "itemTitleFindRep", 1);
  __decorateClass([
    example
  ], HelperExampleFactory, "dialogAuProcess", 1);
  __decorateClass([
    example
  ], HelperExampleFactory, "dialogItemTitleProcess", 1);
  __decorateClass([
    example
  ], HelperExampleFactory, "dialogChPubTitle", 1);
  __decorateClass([
    example
  ], HelperExampleFactory, "dialogAuBoldStar", 1);
  __decorateClass([
    example
  ], HelperExampleFactory, "progressWindow", 1);
  __decorateClass([
    example
  ], HelperExampleFactory, "progressWindowExample", 1);

  // src/modules/preferenceScript.ts
  function registerPrefsScripts(_window) {
    if (!addon.data.prefs) {
      addon.data.prefs = {
        window: _window,
        columns: [
          {
            dataKey: "title",
            label: "prefs.table.title",
            fixedWidth: true,
            width: 100
          },
          {
            dataKey: "detail",
            label: "prefs.table.detail"
          }
        ],
        rows: [
          {
            title: "Orange",
            detail: "It's juicy"
          },
          {
            title: "Banana",
            detail: "It's sweet"
          },
          {
            title: "Apple",
            detail: "I mean the fruit APPLE"
          }
        ]
      };
    } else {
      addon.data.prefs.window = _window;
    }
    updatePrefsUI();
    bindPrefEvents();
  }
  function updatePrefsUI() {
    return __async(this, null, function* () {
      var _a, _b;
      const renderLock = ztoolkit.getGlobal("Zotero").Promise.defer();
      const tableHelper = new ztoolkit.VirtualizedTable((_a = addon.data.prefs) == null ? void 0 : _a.window).setContainerId(`${config.addonRef}-table-container`).setProp({
        id: `${config.addonRef}-prefs-table`,
        // Do not use setLocale, as it modifies the Zotero.Intl.strings
        // Set locales directly to columns
        columns: (_b = addon.data.prefs) == null ? void 0 : _b.columns.map(
          (column) => Object.assign(column, {
            label: getString(column.label) || column.label
          })
        ),
        showHeader: true,
        multiSelect: true,
        staticColumns: true,
        disableFontSizeScaling: true
      }).setProp("getRowCount", () => {
        var _a2;
        return ((_a2 = addon.data.prefs) == null ? void 0 : _a2.rows.length) || 0;
      }).setProp(
        "getRowData",
        (index) => {
          var _a2;
          return ((_a2 = addon.data.prefs) == null ? void 0 : _a2.rows[index]) || {
            title: "no data",
            detail: "no data"
          };
        }
      ).setProp("onSelectionChange", (selection) => {
        var _a2;
        new ztoolkit.ProgressWindow(config.addonName).createLine({
          text: `Selected line: ${(_a2 = addon.data.prefs) == null ? void 0 : _a2.rows.filter((v, i) => selection.isSelected(i)).map((row) => row.title).join(",")}`,
          progress: 100
        }).show();
      }).setProp("onKeyDown", (event) => {
        var _a2;
        if (event.key == "Delete" || Zotero.isMac && event.key == "Backspace") {
          addon.data.prefs.rows = ((_a2 = addon.data.prefs) == null ? void 0 : _a2.rows.filter(
            (v, i) => !tableHelper.treeInstance.selection.isSelected(i)
          )) || [];
          tableHelper.render();
          return false;
        }
        return true;
      }).setProp(
        "getRowString",
        (index) => {
          var _a2;
          return ((_a2 = addon.data.prefs) == null ? void 0 : _a2.rows[index].title) || "";
        }
      ).render(-1, () => {
        renderLock.resolve();
      });
      yield renderLock.promise;
      ztoolkit.log("Preference table rendered!");
    });
  }
  function bindPrefEvents() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L, _M, _N, _O, _P, _Q, _R, _S, _T, _U, _V, _W, _X, _Y, _Z, __, _$, _aa;
    (_a = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-update-abbr`
    )) == null ? void 0 : _a.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.disableUppJourAbbDot();
    });
    (_b = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-jcr-qu`
    )) == null ? void 0 : _b.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_c = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-basic`
    )) == null ? void 0 : _c.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_d = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-updated`
    )) == null ? void 0 : _d.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_e = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-sci-if5`
    )) == null ? void 0 : _e.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_f = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-chjcscd`
    )) == null ? void 0 : _f.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_g = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-nju-core`
    )) == null ? void 0 : _g.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_h = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-ei`
    )) == null ? void 0 : _h.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_i = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-pku-core`
    )) == null ? void 0 : _i.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_j = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-sci-core`
    )) == null ? void 0 : _j.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_k = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-ssci`
    )) == null ? void 0 : _k.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_l = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-ajg`
    )) == null ? void 0 : _l.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_m = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-utd24`
    )) == null ? void 0 : _m.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_n = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-ft50`
    )) == null ? void 0 : _n.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_o = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-ccf`
    )) == null ? void 0 : _o.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_p = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-fms`
    )) == null ? void 0 : _p.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_q = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-jci`
    )) == null ? void 0 : _q.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_r = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-sciwarn`
    )) == null ? void 0 : _r.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_s = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-ahci`
    )) == null ? void 0 : _s.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_t = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-com-if`
    )) == null ? void 0 : _t.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_u = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-agg-if`
    )) == null ? void 0 : _u.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_v = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-njau-core`
    )) == null ? void 0 : _v.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_w = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-njau-high-quality`
    )) == null ? void 0 : _w.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_x = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-swufe`
    )) == null ? void 0 : _x.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_y = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-cufe`
    )) == null ? void 0 : _y.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_z = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-uibe`
    )) == null ? void 0 : _z.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_A = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-sdufe`
    )) == null ? void 0 : _A.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_B = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-xdu`
    )) == null ? void 0 : _B.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_C = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-swjtu`
    )) == null ? void 0 : _C.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_D = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-ruc`
    )) == null ? void 0 : _D.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_E = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-xmu`
    )) == null ? void 0 : _E.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_F = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-sjtu`
    )) == null ? void 0 : _F.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_G = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-fdu`
    )) == null ? void 0 : _G.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_H = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-hhu`
    )) == null ? void 0 : _H.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_I = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-scu`
    )) == null ? void 0 : _I.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_J = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-cqu`
    )) == null ? void 0 : _J.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_K = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-nju`
    )) == null ? void 0 : _K.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_L = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-xju`
    )) == null ? void 0 : _L.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_M = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-cug`
    )) == null ? void 0 : _M.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_N = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-cju`
    )) == null ? void 0 : _N.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_O = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-zju`
    )) == null ? void 0 : _O.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_P = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-clsci`
    )) == null ? void 0 : _P.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_Q = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-ami`
    )) == null ? void 0 : _Q.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_R = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-nssf`
    )) == null ? void 0 : _R.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_S = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-sci-if`
    )) == null ? void 0 : _S.addEventListener("command", (e) => {
      ztoolkit.log(e);
      UIExampleFactory.registerExtraColumn();
    });
    (_T = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-shortcut-title-sentence`
    )) == null ? void 0 : _T.addEventListener("command", (e) => {
      ztoolkit.log(e);
      ztoolkit.Shortcut.unregisterAll();
      KeyExampleFactory.registerShortcuts();
    });
    (_U = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-shortcut-input-title-sentence`
    )) == null ? void 0 : _U.addEventListener("change", (e) => {
      ztoolkit.log(e);
      ztoolkit.Shortcut.unregisterAll();
      KeyExampleFactory.registerShortcuts();
    });
    (_V = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-shortcut-publication-title-case`
    )) == null ? void 0 : _V.addEventListener("command", (e) => {
      ztoolkit.log(e);
      ztoolkit.Shortcut.unregisterAll();
      KeyExampleFactory.registerShortcuts();
    });
    (_W = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-shortcut-input-publication-title-case`
    )) == null ? void 0 : _W.addEventListener("change", (e) => {
      ztoolkit.log(e);
      ztoolkit.Shortcut.unregisterAll();
      KeyExampleFactory.registerShortcuts();
    });
    (_X = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-shortcut-data-dir`
    )) == null ? void 0 : _X.addEventListener("command", (e) => {
      ztoolkit.log(e);
      ztoolkit.Shortcut.unregisterAll();
      KeyExampleFactory.registerShortcuts();
    });
    (_Y = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-shortcut-input-data-dir`
    )) == null ? void 0 : _Y.addEventListener("change", (e) => {
      ztoolkit.log(e);
      ztoolkit.Shortcut.unregisterAll();
      KeyExampleFactory.registerShortcuts();
    });
    (_Z = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-shortcut-profile-dir`
    )) == null ? void 0 : _Z.addEventListener("command", (e) => {
      ztoolkit.log(e);
      ztoolkit.Shortcut.unregisterAll();
      KeyExampleFactory.registerShortcuts();
    });
    (__ = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-shortcut-input-profile-dir`
    )) == null ? void 0 : __.addEventListener("change", (e) => {
      ztoolkit.log(e);
      ztoolkit.Shortcut.unregisterAll();
      KeyExampleFactory.registerShortcuts();
    });
    addon.data.prefs.window.document.getElementById(
      `zotero-prefpane-${config.addonRef}-add-update`
    ).disabled = false;
    (_$ = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-enable`
    )) == null ? void 0 : _$.addEventListener("command", (e) => {
      ztoolkit.log(e);
      addon.data.prefs.window.alert(
        `Successfully changed to ${e.target.checked}!`
      );
    });
    (_aa = addon.data.prefs.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-input`
    )) == null ? void 0 : _aa.addEventListener("change", (e) => {
      ztoolkit.log(e);
      addon.data.prefs.window.alert(
        `Successfully changed to ${e.target.value}!`
      );
    });
  }

  // src/hooks.ts
  function onStartup() {
    return __async(this, null, function* () {
      yield Promise.all([
        Zotero.initializationPromise,
        Zotero.unlockPromise,
        Zotero.uiReadyPromise
      ]);
      initLocale();
      ztoolkit.ProgressWindow.setIconURI(
        "default",
        `chrome://${config.addonRef}/content/icons/favicon.png`
      );
      const popupWin = new ztoolkit.ProgressWindow(config.addonName, {
        closeOnClick: true,
        closeTime: -1
      }).createLine({
        text: getString("startup.begin"),
        type: "default",
        progress: 0
      }).show();
      BasicExampleFactory.registerPrefs();
      BasicExampleFactory.registerNotifier();
      KeyExampleFactory.registerShortcuts();
      popupWin.changeLine({
        progress: 30,
        text: `[30%] ${getString("startup.begin")}`
      });
      UIExampleFactory.registerRightClickMenuItem();
      UIExampleFactory.registerWindowMenuWithSeprator();
      yield UIExampleFactory.registerExtraColumn();
      ZoteroPane.collectionsView.onSelect.addListener(UIExampleFactory.displayColMenuitem);
      ZoteroPane.itemsView.onSelect.addListener(UIExampleFactory.displayContexMenuitem);
      popupWin.changeLine({
        progress: 100,
        text: `[100%] ${getString("startup.finish")}`
      });
      popupWin.startCloseTimer(5e3);
    });
  }
  function hideMenu() {
    UIExampleFactory.hideMenu();
  }
  function onShutdown() {
    ztoolkit.unregisterAll();
    addon.data.alive = false;
    delete Zotero[config.addonInstance];
  }
  function onNotify(event, type, ids, extraData) {
    return __async(this, null, function* () {
      ztoolkit.log("notify", event, type, ids, extraData);
      if (event == "add" && type == "item") {
        BasicExampleFactory.exampleNotifierCallback(ids);
      }
    });
  }
  function onPrefsEvent(type, data) {
    return __async(this, null, function* () {
      switch (type) {
        case "load":
          registerPrefsScripts(data.window);
          UIExampleFactory.disableUppJourAbbDot();
          break;
        default:
          return;
      }
    });
  }
  var hooks_default = {
    onStartup,
    onShutdown,
    onNotify,
    onPrefsEvent,
    // onShortcuts,
    hideMenu
    // setExtraColumn,
    // getSelectedItems,
  };

  // src/addon.ts
  var import_basic = __toESM(require_basic());
  var import_ui = __toESM(require_ui());
  var import_preferencePane = __toESM(require_preferencePane());
  var Addon = class {
    constructor() {
      this.data = {
        alive: true,
        env: "development",
        // ztoolkit: new MyToolkit(),
        ztoolkit: new import_dist.default()
      };
      this.hooks = hooks_default;
      this.api = {};
    }
  };
  var addon_default = Addon;

  // src/index.ts
  var basicTool = new import_basic2.BasicTool();
  if (!basicTool.getGlobal("Zotero")[config.addonInstance]) {
    _globalThis.Zotero = basicTool.getGlobal("Zotero");
    _globalThis.ZoteroPane = basicTool.getGlobal("ZoteroPane");
    _globalThis.Zotero_Tabs = basicTool.getGlobal("Zotero_Tabs");
    _globalThis.window = basicTool.getGlobal("window");
    _globalThis.window.confirm = basicTool.getGlobal("confirm");
    _globalThis.document = basicTool.getGlobal("document");
    _globalThis.addon = new addon_default();
    _globalThis.ztoolkit = addon.data.ztoolkit;
    ztoolkit.basicOptions.log.prefix = `[${config.addonName}]`;
    ztoolkit.basicOptions.log.disableConsole = addon.data.env === "production";
    ztoolkit.UI.basicOptions.ui.enableElementJSONLog = addon.data.env === "development";
    Zotero[config.addonInstance] = addon;
    addon.hooks.onStartup();
  }
})();
