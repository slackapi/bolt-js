function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
import { createRef, debounce, isEqual, noop, safelyRunOnBrowser } from '@algolia/autocomplete-shared';
import { createClickedEvent } from './createClickedEvent';
import { createSearchInsightsApi } from './createSearchInsightsApi';
import { createViewedEvents } from './createViewedEvents';
import { isAlgoliaInsightsHit } from './isAlgoliaInsightsHit';
var VIEW_EVENT_DELAY = 400;
var ALGOLIA_INSIGHTS_VERSION = '2.6.0';
var ALGOLIA_INSIGHTS_SRC = "https://cdn.jsdelivr.net/npm/search-insights@".concat(ALGOLIA_INSIGHTS_VERSION, "/dist/search-insights.min.js");
var sendViewedObjectIDs = debounce(function (_ref) {
  var onItemsChange = _ref.onItemsChange,
    items = _ref.items,
    insights = _ref.insights,
    state = _ref.state;
  onItemsChange({
    insights: insights,
    insightsEvents: createViewedEvents({
      items: items
    }).map(function (event) {
      return _objectSpread({
        eventName: 'Items Viewed'
      }, event);
    }),
    state: state
  });
}, VIEW_EVENT_DELAY);
export function createAlgoliaInsightsPlugin(options) {
  var _getOptions = getOptions(options),
    providedInsightsClient = _getOptions.insightsClient,
    onItemsChange = _getOptions.onItemsChange,
    onSelectEvent = _getOptions.onSelect,
    onActiveEvent = _getOptions.onActive;
  var insightsClient = providedInsightsClient;
  if (!providedInsightsClient) {
    safelyRunOnBrowser(function (_ref2) {
      var window = _ref2.window;
      var pointer = window.AlgoliaAnalyticsObject || 'aa';
      if (typeof pointer === 'string') {
        insightsClient = window[pointer];
      }
      if (!insightsClient) {
        window.AlgoliaAnalyticsObject = pointer;
        if (!window[pointer]) {
          window[pointer] = function () {
            if (!window[pointer].queue) {
              window[pointer].queue = [];
            }
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }
            window[pointer].queue.push(args);
          };
        }
        window[pointer].version = ALGOLIA_INSIGHTS_VERSION;
        insightsClient = window[pointer];
        loadInsights(window);
      }
    });
  }
  var insights = createSearchInsightsApi(insightsClient);
  var previousItems = createRef([]);
  var debouncedOnStateChange = debounce(function (_ref3) {
    var state = _ref3.state;
    if (!state.isOpen) {
      return;
    }
    var items = state.collections.reduce(function (acc, current) {
      return [].concat(_toConsumableArray(acc), _toConsumableArray(current.items));
    }, []).filter(isAlgoliaInsightsHit);
    if (!isEqual(previousItems.current.map(function (x) {
      return x.objectID;
    }), items.map(function (x) {
      return x.objectID;
    }))) {
      previousItems.current = items;
      if (items.length > 0) {
        sendViewedObjectIDs({
          onItemsChange: onItemsChange,
          items: items,
          insights: insights,
          state: state
        });
      }
    }
  }, 0);
  return {
    name: 'aa.algoliaInsightsPlugin',
    subscribe: function subscribe(_ref4) {
      var setContext = _ref4.setContext,
        onSelect = _ref4.onSelect,
        onActive = _ref4.onActive;
      insightsClient('addAlgoliaAgent', 'insights-plugin');
      setContext({
        algoliaInsightsPlugin: {
          __algoliaSearchParameters: {
            clickAnalytics: true
          },
          insights: insights
        }
      });
      onSelect(function (_ref5) {
        var item = _ref5.item,
          state = _ref5.state,
          event = _ref5.event;
        if (!isAlgoliaInsightsHit(item)) {
          return;
        }
        onSelectEvent({
          state: state,
          event: event,
          insights: insights,
          item: item,
          insightsEvents: [_objectSpread({
            eventName: 'Item Selected'
          }, createClickedEvent({
            item: item,
            items: previousItems.current
          }))]
        });
      });
      onActive(function (_ref6) {
        var item = _ref6.item,
          state = _ref6.state,
          event = _ref6.event;
        if (!isAlgoliaInsightsHit(item)) {
          return;
        }
        onActiveEvent({
          state: state,
          event: event,
          insights: insights,
          item: item,
          insightsEvents: [_objectSpread({
            eventName: 'Item Active'
          }, createClickedEvent({
            item: item,
            items: previousItems.current
          }))]
        });
      });
    },
    onStateChange: function onStateChange(_ref7) {
      var state = _ref7.state;
      debouncedOnStateChange({
        state: state
      });
    },
    __autocomplete_pluginOptions: options
  };
}
function getOptions(options) {
  return _objectSpread({
    onItemsChange: function onItemsChange(_ref8) {
      var insights = _ref8.insights,
        insightsEvents = _ref8.insightsEvents;
      insights.viewedObjectIDs.apply(insights, _toConsumableArray(insightsEvents.map(function (event) {
        return _objectSpread(_objectSpread({}, event), {}, {
          algoliaSource: [].concat(_toConsumableArray(event.algoliaSource || []), ['autocomplete-internal'])
        });
      })));
    },
    onSelect: function onSelect(_ref9) {
      var insights = _ref9.insights,
        insightsEvents = _ref9.insightsEvents;
      insights.clickedObjectIDsAfterSearch.apply(insights, _toConsumableArray(insightsEvents.map(function (event) {
        return _objectSpread(_objectSpread({}, event), {}, {
          algoliaSource: [].concat(_toConsumableArray(event.algoliaSource || []), ['autocomplete-internal'])
        });
      })));
    },
    onActive: noop
  }, options);
}
function loadInsights(environment) {
  var errorMessage = "[Autocomplete]: Could not load search-insights.js. Please load it manually following https://alg.li/insights-autocomplete";
  try {
    var script = environment.document.createElement('script');
    script.async = true;
    script.src = ALGOLIA_INSIGHTS_SRC;
    script.onerror = function () {
      // eslint-disable-next-line no-console
      console.error(errorMessage);
    };
    document.body.appendChild(script);
  } catch (cause) {
    // eslint-disable-next-line no-console
    console.error(errorMessage);
  }
}