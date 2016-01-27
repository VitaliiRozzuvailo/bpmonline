define("EntityConnectionViewModel", ["LookupUtilities", "NetworkUtilities",
		"LookupQuickAddMixin", "EntityConnectionViewModelResources"],
		function(LookupUtilities, NetworkUtilities) {
	var EntityConnectionViewModelConstructor = Ext.define("Terrasoft.configuration.EntityConnectionViewModel", {
		alternateClassName: "Terrasoft.EntityConnectionViewModel",
		extend: "Terrasoft.BaseViewModel",
		columns: {
			Value: {
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				isLookup: true
			},
			ReferenceSchema: {
				dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT
			},
			Caption: {
				dataValueType: Terrasoft.DataValueType.TEXT
			},
			ColumnName: {
				dataValueType: Terrasoft.DataValueType.TEXT
			},
			ItemViewConfig: {
				dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT
			},
			ValuesList: {
				dataValueType: Terrasoft.DataValueType.COLLECTION
			}
		},

		mixins: {
			LookupQuickAddMixin: "Terrasoft.LookupQuickAddMixin"
		},
		/**
		 * Подписывается на события изменения поля Value.
		 * inheritdoc Terrasoft.BaseViewModel#constructor
		 * @overridden
		 */
		constructor: function() {
			this.callParent(arguments);
			this.on("change:Value", this.onValueChanged, this);
		},

		/**
		 * Обработчик события изменения поля Value. Метод синхронизирует значения с карточкой.
		 * @private
		 * @param {Object} model Модель в которой произошло изменение поля.
		 * @param {Object} value Новое значение поля.
		 */
		onValueChanged: function(model, value) {
			var sandbox = this.sandbox;
			var columnName = this.get("ColumnName");
			sandbox.publish("UpdateCardProperty", {
				key: columnName,
				value: value
			}, [sandbox.id]);
		},

		/**
		 * Возвращает настройки страницы выбора из справочника.
		 * @protected
		 * @param {Object} args Параметры.
		 * @param {String} columnName Название колонки.
		 * @return {Object} Настройки страницы выбора из справочника.
		 */
		getLookupPageConfig: function(args) {
			var referenceSchema = this.get("ReferenceSchema");
			var columnName = this.get("ColumnName");
			var columnValue = this.get("Value");
			var config = {
				entitySchemaName: referenceSchema.name,
				multiSelect: false,
				columnName: columnName,
				columnValue: columnValue,
				searchValue: args.searchValue,
				filters: this.getLookupQueryFilters(columnName)
			};
			var lookupListConfig = this.getLookupListConfig(columnName);
			this.Ext.apply(config, lookupListConfig);
			var defValues = this.getLookupValuePairs(columnName);
			if (defValues) {
				var valuePairs = config.valuePairs || [];
				config.valuePairs = this.Ext.Array.merge(valuePairs, defValues);
			}
			return config;
		},

		/**
		 * Обработчик события выбора значения в LookupPage-е. Устанавливает знаяения в модель представления.
		 * @param {Object} lookupPageResult Результат выбора в окне лукапа.
		 */
		onLookupResult: function(lookupPageResult) {
			var selectedRows = lookupPageResult.selectedRows;
			if (selectedRows.getCount() > 0) {
				var selectedValue = selectedRows.getByIndex(0);
				this.set("Value", selectedValue);
			}
		},

		/**
		 * Получает ссылку к карточке объекта.
		 * @return {Object} Объект ссылки к карточке объекта.
		 */
		getHref: function() {
			var columnValue = this.get("Value");
			var referenceSchema = this.get("ReferenceSchema");
			var entitySchemaConfig = this.Terrasoft.configuration.ModuleStructure[referenceSchema.name];
			if (columnValue && entitySchemaConfig) {
				var typeAttr = NetworkUtilities.getTypeColumn(referenceSchema.name);
				var typeUId;
				if (typeAttr && columnValue[typeAttr.path]) {
					typeUId = columnValue[typeAttr.path].value;
				}
				var url = NetworkUtilities.getEntityUrl(referenceSchema.name, columnValue.value, typeUId);
				return {
					url: "ViewModule.aspx#" + url,
					caption: columnValue.displayValue
				};
			}
			return {};
		},

		/**
		 * Обрабатывает нажатие на ссылку в элементе управления.
		 * @return {Boolean} Признак, отменять или нет DOM обработчик нажатия на ссылку.
		 */
		onLinkClick: function() {
			var columnValue = this.get("Value");
			if (!columnValue) {
				return true;
			}
			var referenceSchema = this.get("ReferenceSchema");
			var typeAttr = NetworkUtilities.getTypeColumn(referenceSchema.name);
			var typeId = null;
			if (typeAttr && columnValue[typeAttr.path]) {
				typeId = columnValue[typeAttr.path].value;
			}
			var historyState = this.sandbox.publish("GetHistoryState");
			var config = {
				sandbox: this.sandbox,
				entitySchemaName: referenceSchema.name,
				primaryColumnValue: columnValue.value,
				historyState: historyState,
				typeId: typeId
			};
			NetworkUtilities.openCardInChain(config);
			return false;
		},

		/**
		 * inheritdoc Terrasoft.BaseViewModel#getLookupQuery
		 * Для получения имени схемы-справочника, вместо описания колонки, используется соответствующее
		 * свойство текущей модели представления.
		 * @overridden
		 */
		getLookupQuery: function(filterValue, columnName) {
			var column = this.getColumnByName(columnName);
			if (!column) {
				throw new this.Terrasoft.ItemNotFoundException();
			}
			var isLookup = (this.Terrasoft.isLookupDataValueType(column.dataValueType) || column.isLookup);
			if (!isLookup) {
				throw new this.Terrasoft.UnsupportedTypeException({
					message: this.Terrasoft.Resources.BaseViewModel.columnUnsupportedTypeException
				});
			}
			var referenceSchema = this.get("ReferenceSchema");
			var referenceSchemaName = referenceSchema.name;
			var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: referenceSchemaName,
				rowCount: isLookup ? this.Terrasoft.SysSettings.lookupRowCount : -1
			});
			esq.addMacrosColumn(this.Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "value");
			var primaryDisplayColumn =
				esq.addMacrosColumn(this.Terrasoft.QueryMacrosType.PRIMARY_DISPLAY_COLUMN, "displayValue");
			primaryDisplayColumn.orderPosition = 1;
			primaryDisplayColumn.orderDirection = this.Terrasoft.OrderDirection.ASC;
			var lookupListConfig = this.getLookupListConfig(this.get("ColumnName"));
			if (lookupListConfig) {
				this.Terrasoft.each(lookupListConfig.columns, function(column) {
					if (!esq.columns.contains(column)) {
						esq.addColumn(column);
					}
				}, this);
			}
			var lookupFilter = esq.createPrimaryDisplayColumnFilterWithParameter(
				this.Terrasoft.SysSettings.lookupFilterType, filterValue, this.Terrasoft.DataValueType.TEXT);
			esq.filters.add("LookupFilter", lookupFilter);
			lookupFilter.isEnabled = !!filterValue;
			esq.filters.addItem(this.getLookupQueryFilters(this.get("ColumnName")));
			return esq;
		},

		/**
		 * Возвращает фильтры справочной колонки.
		 * @param {String} columnName Название колонки.
		 * @return {Terrasoft.FilterGroup} Фильтры справочной колонки.
		 */
		getLookupQueryFilters: function(columnName) {
			columnName = this.get("ColumnName");
			return this.sandbox.publish("GetLookupQueryFilters", columnName, [this.sandbox.id]);
		},

		/**
		 * Возвращает информацию о настройках справочной колонки.
		 * @private
		 * @param {String} columnName Название колонки.
		 * @return {Object|null} Информация о настройках справочной колонки.
		 */
		getLookupListConfig: function(columnName) {
			return this.sandbox.publish("GetLookupListConfig", columnName, [this.sandbox.id]);
		},

		/**
		 * Возвращает информацию о значениях по умолчанию, передаваемых в новую запись справочной колонки.
		 * @private
		 * @param {String} columnName Название колонки.
		 * @return {Object|null} Информация о значениях по умолчанию справочной колонки.
		 */
		getLookupValuePairs: function(columnName) {
			return this.sandbox.publish("GetLookupValuePairs", columnName, [this.sandbox.id]);
		},
		/**
		 * Подписывает модель-представления на событие изменения значения колонки объекта карточки.
		 * @protected
		 * @virtual
		 */
		trackCardChanges: function(columnUId) {
			this.sandbox.subscribe("EntityColumnChanged",
				this.onEntityColumnChanged, this, [this.sandbox.id + "_" + columnUId]);
		},

		/**
		 * Обрабатывает событие изменения значения колонки объекта карточки.
		 * @param {Object} changed
		 * @param {Text} changed.columnName Название колонки.
		 * @param {Object} changed.columnValue Значение колонки.
		 */
		onEntityColumnChanged: function(changed) {
			if (changed.columnName === this.get("ColumnName")) {
				this.set("Value", changed.columnValue);
			}
		},

		/**
		 * Добавляет в выпадающий список для lookup елемент "Создать %введенное_значение%"
		 * @overriden
		 * @param {Object} config.
		 * @param {Terrasoft.Collection} collection Найденные значения для наполения справочника.
		 * @param {String} filterValue Фильтр для primaryDisplayColumn.
		 * @param {Object} objects Словарь который будет загружен в list.
		 * @param {String} columnName Имя колонки ViewModel.
		 * @param {Boolean} isLookupEdit lookup или combobox.
		 */
		onLookupDataLoaded: function(config) {
			this.callParent(arguments);
			this.mixins.LookupQuickAddMixin.onLookupDataLoaded.call(this, config);
		},

		/**
		 * Событие изменения значения в поле. Если выбрано действие создать - пытаемся создать запись или
		 * открываем карточку.
		 * @param {Object} newValue Новое значение.
		 */
		onLookupChange: function(newValue) {
			this.mixins.LookupQuickAddMixin.onLookupChange.call(this, newValue, "Value");
		},

		/**
		 * Возвращает название схемы объекта справочного поля.
		 * @protected
		 * @return {String} Название схемы справочного поля.
		 */
		getLookupEntitySchemaName: function() {
			return this.get("ReferenceSchema").name;
		},

		/**
		 * Открывает страницу выбора из справочника или пытается добавить запись.
		 * @protected
		 * @param {Object} args Параметры.
		 */
		loadVocabulary: function(args) {
			var config = this.getLookupPageConfig(args);
			LookupUtilities.Open(this.sandbox, config, this.onLookupResult, this, null, false, false);
		}

	});
	return EntityConnectionViewModelConstructor;
});