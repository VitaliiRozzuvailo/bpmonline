/**
 * Класс реализует отображение коллекции элементов по конфигу контейнера.
 */
Ext.define("Terrasoft.controls.ContainerList", {
	extend: "Terrasoft.Container",
	alternateClassName: "Terrasoft.ContainerList",

	/**
	 * Флаг, указывающий, асинхронно ли загружается коллекция.
	 */
	isAsync: true,

	/**
	 * Ссылка на коллекцию элементов
	 * @type {Terrasoft.Collection}
	 */
	collection: null,

	/**
	 * Имя свойства, которое является идентификатором
	 * @type {String}
	 */
	idProperty: null,

	/**
	 * CSS класс контейнера элемента
	 * @type {String}
	 */
	selectableRowCss: "selectable",

	/**
	 * Массив идентификаторов элементов, для которых уже было сгенерировано событие попадания в видимую часть
	 * @protected
	 * @type {Array}
	 */
	observableRowHistory: [],

	/**
	 * Конфигурация представления элемента по умолчанию
	 *		defaultItemConfig: {
	 *			className: "Terrasoft.Container",
	 *			id: "item",
	 *			selectors: {
	 *				wrapEl: "#item"
	 *			},
	 *			classes: {
	 *				wrapClassName: ["post-class"]
	 *			},
	 *			items:[
	 *				{
	 *					className: "Terrasoft.Label",
	 *					caption: {
	 *						bindTo: "CreatedByName"
	 *					},
	 *					classes: {
	 *						labelClass: ["createdBy-name"]
	 *					}
	 *				},
	 *				{
	 *					className: "Terrasoft.Label",
	 *					caption: {
	 *						bindTo: "CreatedOn"
	 *					},
	 *					classes: {
	 *						labelClass: ["createdBy-date", "unimportant-color"]
	 *					}
	 *				}
	 *			]
	 *		}
	 * @protected
	 * @type {Object}
	 */
	defaultItemConfig: null,

	/**
	 * Функция, возвращающая конфигурацию представления элемента, отличную от конфигурации по умолчанию
	 * @protected
	 * @type {Function}
	 */
	getCustomItemConfig: null,

	/**
	 * Порядковый номер строки реестра с конца, появление которого в видимой части браузера нужно отслеживать
	 */
	observableRowNumber: 0,

	/**
	 *
	 */
	stillRendering: false,

	/**
	 *
	 */
	delayedObservableRowId: null,

	/**
	 * CSS селектор записи элемента управления
	 */
	rowCssSelector: ".esn-notification-container.selectable",

	/**
	 * Префикс для DOM идентификатора записи
	 */
	dataItemIdPrefix: "esn-notification-item",

	/**
	 * CSS класс выбранной записи
	 */
	selectedItemCssClass: "selected",

	/**
	 * Значение идентификатора активной записи списка
	 */
	activeItem: null,

	/**
	 * Коллекция с идентификаторами моделей представлений, в качестве ключей используется идентификаторы представлений.
	 * @type {Terrasoft.Collection}
	 */
	rowIds: null,

	/**
	 * Уникальный префикс для изменения идентификаторов представлений. Если свойство не определено,
	 * используется свойство sandbox.id модели представления.
	 * @type {String}
	 */
	itemPrefix: null,

	/**
	 * Указывает на наличие записей в списке.
	 * @protected
	 * @type {Boolean}
	 */
	isEmpty: false,

	/**
	 * @inheritDoc Terrasoft.Component#init
	 * @protected
	 */
	init: function() {
		this.callParent(arguments);
		this.rowIds = Ext.create("Terrasoft.Collection");
		this.addEvents(
			/**
			 * @event
			 * Событие появления отслеживаемой строки в видимой части
			 */
			"observableRowVisible",
			/**
			 * @event
			 * Событие получения конфигурации для элемента
			 */
			"onGetItemConfig",
			/**
			 * @event
			 * Событие клика по элементу списка
			 */
			"onItemClick",
			/**
			 * @event
			 * Событие проверки наличия конфигурации для пользовательского сообщения о пустом списке.
			 */
			"getEmptyMessageConfig"
		);
	},

	/**
	 * Выполнить привязку всех элементов к модели
	 * @param {Terrasoft.data.modules.BaseViewModel} model Модель данных
	 */
	bind: function(model) {
		this.mixins.bindable.bind.call(this, model);
	},

	/**
	 * Возвращает конфигурацию привязки к модели. Реализует интерфейс миксина {@link Terrasoft.Bindable}.
	 * @protected
	 * @overridden
	 */
	getBindConfig: function() {
		var bindConfig = this.callParent(arguments);
		var gridBindConfig = {
			collection: {
				changeMethod: "onCollectionDataLoaded"
			},
			isAsync: {
				changeMethod: "setIsAsync"
			},
			activeItem: {
				changeMethod: "scrollToItem"
			},
			isEmpty: {
				changeMethod: "setIsEmpty"
			}
		};
		return Ext.apply(gridBindConfig, bindConfig);
	},

	/**
	 * @inheritDoc Terrasoft.Component#initDomEvents
	 * @protected
	 * @overridden
	 */
	initDomEvents: function() {
		this.callParent(arguments);
		this.debounceWindowScroll = this.debounceWindowScroll || Terrasoft.debounce(this.onWindowScroll, 10);
		Ext.EventManager.addListener(window, "scroll", this.debounceWindowScroll, this);
		if (Ext.isIE9 || Ext.isChrome || Ext.isSafari || Ext.isOpera) {
			Ext.EventManager.addListener(window, "mousewheel", this.debounceWindowScroll, this);
		} else if (Ext.isGecko) {
			Ext.EventManager.addListener(window, "DOMMouseScroll", this.debounceWindowScroll, this);
		} else {
			Ext.EventManager.addListener(window, "onmousewheel", this.debounceWindowScroll, this);
		}
		var wrapEl = this.getWrapEl();
		if (wrapEl) {
			wrapEl.on("click", this.onClick, this);
		}
	},

	/**
	 * Обрабатывает событие click на элементе управления
	 * @param {Object} event объект события
	 */
	onClick: function(event) {
		var wrapEl = this.getWrapEl();
		var targetEl = Ext.get(event.target);
		var listItemEl = targetEl.findParent(this.rowCssSelector, wrapEl, true);
		if (Ext.isEmpty(listItemEl)) {
			return;
		}
		event.stopEvent();
		var itemId = this.rowIds.get(listItemEl.id);
		this.onItemClick(itemId);
		this.fireEvent("onItemClick", itemId);
	},

	/**
	 * Обрабатывает click на записи элемента управления.
	 * @param {String} itemId Идентификатор записи в коллекции.
	 */
	onItemClick: function(itemId) {
		this.setItemSelected(itemId);
	},

	/**
	 * Обрабатывает смену состояния записи элемента управления.
	 * @param {String} itemId Идентификатор записи в коллекции.
	 * @param {Boolean} status Состояние записи.
	 */
	setItemSelected: function(itemId) {
		var wrapEl = this.getWrapEl();
		if (!wrapEl) {
			return;
		}
		var markerValue = this.dataItemIdPrefix + "-" + itemId;
		var itemElSelection = wrapEl.select("[data-item-marker='" + markerValue + "']");
		var itemEl = itemElSelection.first();
		if (Ext.isEmpty(itemEl)) {
			return;
		}
		var selectedItemCssClass = this.selectedItemCssClass;
		var prevSelectedItemSelection = wrapEl.select(this.rowCssSelector + "." + selectedItemCssClass);
		var prevSelectedItemEl = prevSelectedItemSelection.first();
		if (!Ext.isEmpty(prevSelectedItemEl)) {
			prevSelectedItemEl.removeCls(selectedItemCssClass);
		}
		if (!itemEl.hasCls(selectedItemCssClass)) {
			itemEl.addCls(selectedItemCssClass);
		}
	},

	/**
	 * Обработчик события скролинга окна браузера.
	 * @protected
	 */
	onWindowScroll: function() {
		if (this.observableRowNumber > 0) {
			this.checkObservableRow();
		}
	},

	/**
	 * Метод получения ссылок на все строки реестра в DOM
	 * @returns {Array|selectableRows}
	 */
	getDomRows: function() {
		var root = null;
		var wrapEl = this.getWrapEl();
		if (wrapEl && wrapEl.dom) {
			root = wrapEl.dom;
		}
		if ((!this.selectableRows || !this.selectableRows.length) && root) {
			this.selectableRows =
				Ext.dom.Query.select("[class*=\"" + this.selectableRowCss + "\"]", root);
		}
		return this.selectableRows;
	},

	/**
	 * Получает ссылку на елемент записи списка в DOM.
	 * @private
	 * @param {String} id Идентификатор записи списка.
	 * @return {Object} Возвращает елемент записи списка в DOM.
	 */
	getDomItem: function(id) {
		if (!this.rendered || !id) {
			return null;
		}
		var wrapEl = this.getWrapEl();
		var root = (wrapEl && wrapEl.dom) ? wrapEl.dom : null;
		if (root) {
			return Ext.dom.Query.select("> [class*=" + id + "]", root)[0];
		}
		return null;
	},

	/**
	 * Позиционирует активную запись в видимой области окна браузера.
	 * @private
	 * @param {String} value Идентификатор записи списка.
	 */
	scrollToItem: function(value) {
		if (this.activeItem === value) {
			return;
		}
		var activeItem = this.activeItem = value;
		if (activeItem) {
			var activeItemDom = this.getDomItem(activeItem);
			if (activeItemDom) {
				if (activeItemDom.scrollIntoViewIfNeeded) {
					activeItemDom.scrollIntoViewIfNeeded(false);
				} else {
					activeItemDom.scrollIntoView(false);
				}
			}
		}
	},

	/**
	 * Устанавливает значение свойства указывающего, асинхронно ли загружается коллекция.
	 * @private
	 * @param {Boolean} value Значение свойства.
	 */
	setIsAsync: function(value) {
		if (this.isAsync === value) {
			return;
		}
		this.isAsync = value;
	},

	/**
	 * Проверка на видимости отслеживаемого элемента в видимой части окна браузера
	 * @protected
	 */
	checkObservableRow: function() {
		var rows = this.getDomRows();
		if (!rows || !rows.length) {
			return;
		}
		var observableRowNumber = rows.length - this.observableRowNumber;
		if (observableRowNumber < 0) {
			return;
		}
		var observableRow = Ext.get(rows[observableRowNumber]);
		var observableRowId = observableRow.dom.id;
		if (this.isElementVisible(observableRow)) {
			if (Ext.Array.indexOf(this.observableRowHistory, observableRowId) >= 0) {
				return;
			}
			this.observableRowHistory.push(observableRowId);
			if (this.stillRendering) {
				this.delayedObservableRowId = observableRowId;
			} else {
				this.fireEvent("observableRowVisible", observableRowId);
			}
		}
	},

	/**
	 * Проверка видимость элемента в видимой части окна браузера
	 * @returns {boolean}
	 */
	isElementVisible: function(el) {
		if (!el) {
			return false;
		}
		var body = Ext.getBody();
		var bodyViewRegion = body.getViewRegion();
		var elViewRegion = el.getViewRegion();
		return (elViewRegion.x <= bodyViewRegion.right &&
				elViewRegion.y <= bodyViewRegion.bottom);
	},

	/**
	 * Создание представления элементов, и добавление их в контейнер
	 * @protected
	 */
	addItems: function(items, index) {
		this.observableRowHistory = [];
		this.selectableRows = null;

//		алгоритм:
//			1. запоминаем состояние рендеринга и отключаем его;
//			2. генерируем представления элементов и добавляем их в текущий контейнер;
//			3. возвращаем состояние рендеринга;
//			4. если был отрендерен - асинхронно

		var rendered = this.rendered;
		this.rendered = false;
		this.stillRendering = true;
		var rowIds = this.rowIds;
		var views = [];
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			var id = item.get(this.idProperty);
			var view = this.getItemView(item);
			view.bind(item);
			views.push(view);
			rowIds.add(view.id, id);
		}
		if (Ext.isEmpty(index)) {
			this.add(views);
		} else {
			this.insert(views, index);
		}
		this.rendered = rendered;
		var me = this;
		if (this.rendered) {
			var renderIndex = this.indexOf(views[0]);
			var renderView = function(view, index) {
				if (view.rendered) {
					return;
				}
				var renderEl = me.getRenderToEl();
				view.render(renderEl, index);
			};
			if (views.length === 1) {
				renderView(views[0], renderIndex);
			} else {
				var viewIndex = 0;
				var renderNext = function() {
					if (viewIndex < views.length) {
						var renderNextView = function() {
							renderView(views[viewIndex], renderIndex + viewIndex);
							viewIndex++;
							renderNext();
						};
						if (me.isAsync) {
							setTimeout(renderNextView, 0);
						} else {
							renderNextView();
						}
					} else {
						me.stillRendering = false;
						if (me.delayedObservableRowId) {
							var delayedObservableRowId = me.delayedObservableRowId;
							me.delayedObservableRowId = null;
							me.fireEvent("observableRowVisible", delayedObservableRowId);
						}
					}
				};
				renderNext();
			}
		}
	},

	/**
	 * Декорирование вложенных контейнеров, добаление идентификатора
	 * @protected
	 */
	decorateView: function(items, id, prefix) {
		var itemSuffix = "-" + id + "-" + prefix;
		Terrasoft.each(items, function(item) {
			if (item.id) {
				item.id += itemSuffix;
			}
			if (item.inputId) {
				item.inputId += itemSuffix + "-el";
			}
			if (!item.markerValue) {
				item.markerValue = this.dataItemIdPrefix + "-" + id;
			}
			var innerItem = item.item;
			if (innerItem && innerItem.id) {
				innerItem.id += itemSuffix;
			}
			var selectors = item.selectors;
			if (selectors && selectors.wrapEl) {
				selectors.wrapEl += itemSuffix;
			}
			var innerItemSelectors = innerItem && innerItem.selectors;
			if (innerItemSelectors && innerItemSelectors.wrapEl) {
				innerItemSelectors.wrapEl += itemSuffix;
			}
			var classes = item.classes;
			if (classes) {
				classes.wrapClassName = classes.wrapClassName || [];
				if (item.id) {
					classes.wrapClassName.push(item.id);
				}
			}
			if (item.items) {
				this.decorateView(item.items, id, prefix);
			}
		}, this);
	},

	/**
	 * Создание представления элемента
	 * @protected
	 */
	getItemView: function(item) {
		var prefix = this.itemPrefix || item.sandbox.id;
		var itemConfig = this.defaultItemConfig;
		var itemCfg = {};
		this.fireEvent("onGetItemConfig", itemCfg, item);
		if (itemCfg.config) {
			itemConfig = itemCfg.config;
			this.defaultItemConfig = itemCfg.config;
		}
		if (Ext.isFunction(this.getCustomItemConfig)) {
			itemConfig = this.getCustomItemConfig(item) || itemConfig;
		}
		var id = item.get(this.idProperty);
		itemConfig = Terrasoft.deepClone(itemConfig);
		var classes = itemConfig.classes || {};
		classes.wrapClassName = classes.wrapClassName || [];
		classes.wrapClassName.push(this.selectableRowCss);
		itemConfig.classes = classes;
		this.decorateView([itemConfig], id, prefix);
		var className = itemConfig && itemConfig.className ? itemConfig.className : "Terrasoft.Container";
		return Ext.create(className, itemConfig);
	},

	/**
	 * Формирует уникальный идентификатор элемента интерфейса.
	 * @protected
	 * @param {Object} item Элемент коллекции панелей.
	 * @returns {String} Уникальный идентификатор элемента интерфейса.
	 */
	getItemElementId: function(item) {
		var id = item.get(this.idProperty);
		var prefix = this.itemPrefix || item.sandbox.id;
		return this.defaultItemConfig.id + "-" + id + "-" + prefix;
	},

	/**
	 * Обработчик события "dataLoaded" коллекции Terrasoft.Collection
	 * @protected
	 * @param {Terrasoft.Collection} items
	 * @param {Terrasoft.Collection} newItems
	 */
	onCollectionDataLoaded: function(items, newItems) {
		this.observableRowHistory = [];
		this.selectableRows = null;
		items = newItems || items;
		if (items && items.getCount() > 0) {
			this.setIsEmpty(false);
			this.addItems(items.getItems());
		}
	},

	/**
	 * Обработчик события "add" коллекции Terrasoft.Collection
	 * @protected
	 * @param {Terrasoft.BaseViewModel} item Элемент коллекции
	 */
	onAddItem: function(item, index) {
		this.observableRowHistory = [];
		this.selectableRows = null;
		this.setIsEmpty(false);
		this.addItems([item], index);
	},

	/**
	 * Обработчик события "remove" коллекции Terrasoft.Collection
	 * @protected
	 * @param {Object} item
	 */
	onDeleteItem: function(item) {
		this.selectableRows = null;
		this.observableRowHistory = [];
		var elementId = this.getItemElementId(item);
		var itemId = item.get(this.idProperty);
		var element = this.items.getByKey(elementId);
		this.rowIds.remove(itemId);
		element.destroy();
		var items = this.items;
		var isEmpty = (items.getCount() === 0);
		this.setIsEmpty(isEmpty);
		if (this.observableRowNumber > 0) {
			this.checkObservableRow();
		}
	},

	/**
	 * Метод очистки контейнера.
	 */
	clear: function() {
		this.observableRowHistory = [];
		this.selectableRows = null;
		var items = this.items;
		this.rowIds.clear();
		items.un("add", this.onItemAdd, this);
		items.un("remove", this.onItemRemove, this);
		items.each(function(item) {
			item.removed(this);
			item.destroy();
		}, this);
		items.clear();
		items.on("add", this.onItemAdd, this);
		items.on("remove", this.onItemRemove, this);
		this.setIsEmpty(true);
	},

	/**
	 * @inheritDoc Terrasoft.Bindable#subscribeForCollectionEvents
	 * @protected
	 * @overridden
	 */
	subscribeForCollectionEvents: function(binding, property, model) {
		this.callParent(arguments);
		var collection = model.get(binding.modelItem);
		collection.on("dataLoaded", this.onCollectionDataLoaded, this);
		collection.on("add", this.onAddItem, this);
		collection.on("remove", this.onDeleteItem, this);
		collection.on("clear", this.clear, this);
	},

	/**
	 * @inheritDoc Terrasoft.Bindable#unSubscribeForCollectionEvents
	 * @protected
	 * @overridden
	 */
	unSubscribeForCollectionEvents: function(binding, property, model) {
		if (!model) {
			// TODO: 193528
			return;
		}
		var collection = model.get(binding.modelItem);
		collection.un("dataLoaded", this.onCollectionDataLoaded, this);
		collection.un("add", this.onAddItem, this);
		collection.un("remove", this.onDeleteItem, this);
		collection.un("clear", this.clear, this);
		this.callParent(arguments);
	},

	/**
	 * @inheritDoc Terrasoft.Component#onDestroy
	 */
	onDestroy: function() {
		var wrapEl = this.getWrapEl();
		if (wrapEl) {
			wrapEl.un("click", this.onClick, this);
		}
		this.callParent(arguments);
	},

	/**
	 * @inheritDoc Terrasoft.Component#onAfterRender
	 * @protected
	 */
	onAfterRender: function() {
		this.callParent(arguments);
		var emptyMessageConfig = this.getEmptyMessageConfig();
		if (!Ext.isEmpty(emptyMessageConfig)) {
			this.isEmpty = this.items.length === 0;
			this.showEmptyMessage(emptyMessageConfig);
		}
	},

	/**
	 * Возвращает конфигурацию пользовательского сообщения о пустом списке.
	 * @private
	 * @return {Object}
	 */
	getEmptyMessageConfig: function() {
		var emptyMessageConfig = {};
		this.fireEvent("getEmptyMessageConfig", emptyMessageConfig);
		if (emptyMessageConfig && emptyMessageConfig.className) {
			return Terrasoft.deepClone(emptyMessageConfig);
		}
		return null;
	},

	/**
	 * Метод изменяющий атрибут состояния списка: пустой, не пустой.
	 * @param {Boolean} value Устанавливаемое значение.
	 */
	setIsEmpty: function(value) {
		if (this.isEmpty === value) {
			return;
		}
		this.isEmpty = value;
		if (value === true) {
			this.clear();
		}
		this.showEmptyMessage();
	},

	/**
	 * Метод отображающий сообщение для пустого списка.
	 * @protected
	 * @param {Object} emptyMessageConfig Параметры для создания элемента управления с сообщением о пустом списке.
	 */
	showEmptyMessage: function(emptyMessageConfig) {
		if (!this.rendered) {
			return;
		}
		var emptyMessageControl = this.emptyMessageControl;
		var isEmptyCls = "container-list-empty";
		var wrapEl = this.getWrapEl();
		if (Ext.isEmpty(emptyMessageConfig)) {
			emptyMessageConfig = this.getEmptyMessageConfig();
		}
		if (this.isEmpty) {
			if (wrapEl) {
				wrapEl.addCls(isEmptyCls);
			}
			if (!Ext.isEmpty(emptyMessageConfig) && Ext.isEmpty(emptyMessageControl)) {
				Ext.apply(emptyMessageConfig, {
					renderTo: wrapEl
				});
				this.emptyMessageControl = Ext.create(emptyMessageConfig.className, emptyMessageConfig);
			}
		} else {
			if (wrapEl) {
				wrapEl.removeCls(isEmptyCls);
			}
			if (!Ext.isEmpty(emptyMessageControl)) {
				emptyMessageControl.destroy();
				this.emptyMessageControl = null;
			}
		}
	}
});