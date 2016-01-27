define("HistoryStateUtilities", ["ConfigurationEnums"], function(ConfigurationEnums) {
	/**
	 * @class Terrasoft.configuration.mixins.HistoryStateUtilities
	 * Миксин, реализующий работу с текущим состоянием истории браузера.
	 */
	Ext.define("Terrasoft.configuration.mixins.HistoryStateUtilities", {
		alternateClassName: "Terrasoft.HistoryStateUtilities",

		/**
		 * Разделитель значений в состоянии истории браузера.
		 * @protected
		 * @type {String}
		 */
		delimiter: "/",

		/**
		 * Возвращает информацию по умолчанию о текущем состоянии истории браузера.
		 * @protected
		 * @return {Object} Информация по умолчанию о текущем состоянии истории браузера.
		 */
		getDefaultHistoryStateInfo: function() {
			return {module: "", schemas: [], operation: "", primaryColumnValue: ""};
		},

		/**
		 * Возвращает информацию о текущем состоянии истории браузера.
		 * @protected
		 * @return {Object} Информация о текущем состоянии истории браузера.
		 */
		getHistoryStateInfo: function() {
			var historyState = this.sandbox.publish("GetHistoryState");
			return this.parseHistoryState(historyState.hash.historyState);
		},

		/**
		 * Обрабатывает текущее состояние истории браузера.
		 * @protected
		 * @param {String} historyState Состояние истории браузера.
		 * @return {Object} Возвращает информацию о текущем состоянии истории браузера.
		 */
		parseHistoryState: function(historyState) {
			var result = this.getDefaultHistoryStateInfo();
			this.parse(historyState, result);
			this.initWorkAreaMode(result);
			return result;
		},

		/**
		 * Дополняет переданное состояние истории браузера информацией о текущем режиме рабочей области.
		 * Если схем больше, чем одна - режим совмещенный (вертикальный реестр, карточка). Иначе, если есть операция -
		 * режим карточка. Иначе - режим реестр.
		 * @protected
		 * @param {Object} result Информация о текущем состоянии истории браузера.
		 */
		initWorkAreaMode: function(result) {
			var workAreaMode = {};
			if (result.schemas.length > 1) {
				workAreaMode = ConfigurationEnums.WorkAreaMode.COMBINED;
			} else if (result.operation) {
				workAreaMode = ConfigurationEnums.WorkAreaMode.CARD;
			} else {
				workAreaMode = ConfigurationEnums.WorkAreaMode.SECTION;
			}
			result.workAreaMode = workAreaMode;
		},

		/**
		 * Обрабатывает текущее состояние истории браузера.
		 * В зависимости от последнего элемента состояния истории браузера алгоритм имеет две ветви:
		 * 1. Если последний элемент состояния истории браузера - идентификатор записи, то обработка происходит, начиная
		 * с этого элемента (свойство результирующего объекта primaryColumnValue заполнится этим элементом). Итерируя
		 * по последующим элементам, вычисляются: module - если элемент последний, operation - если не была
		 * вычислена ранее, schemas - все остальные элементы. Например:
		 * "CardModule/ContactPage/edit/guid", "SectionModule/ContactSection/ContactPage/copy/guid".
		 * 2. Иначе первый элемент - module, последующие - schemas, последний - operation. Например:
		 * "SectionModule/ContactSection", "CardModule/ContactPage/add", "SectionModule/ContactSection/ContactPage/add".
		 * @private
		 * @param {String} historyState Состояние истории браузера.
		 * @param {Object} result Информация о текущем состоянии истории браузера.
		 * @return {Object} Возвращает информацию о текущем состоянии истории браузера.
		 */
		parse: function(historyState, result) {
			historyState = this.clean(historyState);
			var historyStateItems = historyState.split(this.delimiter);
			var historyStateItemsLength = historyStateItems.length;
			var reverse = this.Terrasoft.isGUID(historyStateItems[historyStateItemsLength - 1]);
			this.prepare(historyStateItems, reverse);
			var currentItemIndex = 0;
			var currentItem = historyStateItems[currentItemIndex];
			if (reverse) {
				result.primaryColumnValue = currentItem;
			} else {
				result.module = currentItem;
			}
			while (++currentItemIndex < historyStateItemsLength) {
				currentItem = historyStateItems[currentItemIndex];
				var isLast = (currentItemIndex === historyStateItemsLength - 1);
				var schemas = result.schemas;
				if (reverse) {
					if (isLast) {
						result.module = currentItem;
					} else if (!result.operation) {
						result.operation = currentItem;
					} else {
						schemas.unshift(currentItem);
					}
				} else {
					if (isLast && schemas.length) {
						result.operation = currentItem;
					} else {
						schemas.push(currentItem);
					}
				}
			}
			return result;
		},

		/**
		 * У заданного состояния истории браузера удаляет начальные и конечные пробелы,
		 * а также конечный символ-разделитель, если он есть.
		 * @param {String} historyState Состояние истории браузера.
		 * @return {String} Отформатированное состояние истории браузера.
		 */
		clean: function(historyState) {
			historyState = historyState.trim();
			if (historyState.substr(-1) === this.delimiter) {
				historyState = historyState.slice(0, -1);
			}
			return historyState;
		},

		/**
		 * Выполняет инвертирование порядка элементов состояния истории браузера в зависимости от значения флага
		 * {@link reverse}.
		 * @param {Array} items Элементы состояния истории браузера.
		 * @param {Boolean} reverse True, если необходимо выполнить инвертирование порядка элементов состояния истории
		 * браузера.
		 */
		prepare: function(items, reverse) {
			if (reverse) {
				items.reverse();
			}
		},

		/**
		 * Возвращает информацию о текущем разделе.
		 * @protected
		 * @return {Object} Информация о текущем разделе.
		 */
		getSectionInfo: function() {
			var historyState = this.getHistoryStateInfo();
			var sectionSchema = historyState.schemas[0];
			if (!sectionSchema) {
				var sectionModule = historyState.module;
			}
			var sectionInfo = null;
			Terrasoft.each(Terrasoft.configuration.ModuleStructure, function(moduleStructureItem) {
				if ((sectionSchema && moduleStructureItem.sectionSchema === sectionSchema) ||
						(sectionModule && moduleStructureItem.sectionModule === sectionModule)) {
					sectionInfo = moduleStructureItem;
					return false;
				}
			}, this);
			return sectionInfo;
		}

	});
	return Terrasoft.HistoryStateUtilities;
});
