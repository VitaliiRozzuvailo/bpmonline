define("GridUtilitiesV2", ["terrasoft", "GridUtilitiesV2Resources", "DataUtilities", "RightUtilities",
		"ConfigurationConstants", "ConfigurationEnums", "LookupUtilities", "LinkColumnHelper", "BusinessRulesApplierV2",
		"performancecountermanager", "BaseGridRowViewModel"],
	function(Terrasoft, resources, DataUtilities, RightUtilities, ConfigurationConstants, ConfigurationEnums,
		LookupUtilities, LinkColumnHelper, BusinessRulesApplier, performanceManager) {
		var GridUtilitiesClass = Ext.define("Terrasoft.configuration.mixins.GridUtilities", {

			alternateClassName: "Terrasoft.GridUtilities",

			/**
			 * Название колонки группы
			 * @private
			 * @type {String}
			 */
			folderColumnName: "Folder",

			/**
			 * Название колонки типа группы.
			 * @private
			 * @type {String}
			 */
			folderTypeColumnName: "FolderType",

			/**
			 * Суффикс названия таблицы развязки групп и сущностей.
			 * @private
			 * @type {String}
			 */
			folderTypeSchemaSuffix: "InFolder",

			/**
			 * Название класса запроса данных схемы.
			 * @protected
			 * @type {String}
			 */
			queryClassName: "Terrasoft.EntitySchemaQuery",

			/**
			 * Id таймера задержки перед вызовом метода afterFiltersUpdated.
			 * @protected
			 * @type {String}
			 */
			filtersUpdateTimeoutId: null,

			/**
			 * Задержка перед фильтрацией.
			 * Количество миллисекунд, которое должно пройти после того как получено сообщение с значением фильтра
			 * и вызовом метода afterFiltersUpdated.
			 * @type {Number}
			 */
			filtersUpdateDelay: 0,

			/**
			 * Сохраненное значение первичной колонки выбранной записи.
			 * @private
			 * @type {GUID}
			 */
			cachedActiveRow: null,

			/**
			 * Восстановление выделенной записи в реестре.
			 */
			onAfterReRender: function() {
				if (this.cachedActiveRow && !this.get("MultiSelect"))  {
					var gridData = this.getGridData();
					if (gridData && gridData.contains(this.cachedActiveRow)) {
						this.set("ActiveRow", this.cachedActiveRow);
					}
				}
			},

			/**
			 * Подписка на событие загрузки колонок.
			 * @protected
			 * @virtual
			 */
			init: function() {
				var gridData = this.getGridData();
				gridData.on("dataLoaded", this.onGridLoaded, this);
			},

			/**
			 * Очищает подписки на события коллекции GridData.
			 */
			destroy: function() {
				var gridData = this.getGridData();
				if (gridData) {
					gridData.un("dataLoaded", this.onGridLoaded, this);
					gridData.un("clear", this.onGridClear, this);
					gridData.un("afterrerender", this.onAfterReRender, this);
				}
				this.un("change:ActiveRow", this.onActiveRowChange, this);
				this.callParent(arguments);
			},

			/**
			 * Перезагружает данные (первую страницу) в случае изменения конфигурации колонок реестра.
			 * @protected
			 */
			onGridLoaded: function() {
				if (this.get("GridSettingsChanged")) {
					this.reloadGridColumnsConfig(false);
					this.set("GridSettingsChanged", false);
				}
			},

			/**
			 * Снимаем выделение в реестре при очистке коллекции GridData.
			 */
			onGridClear: function() {
				this.deselectRows();
			},

			/**
			 * Подписка на события реестра после выполнения метода Render.
			 */
			subscribeGridEvents: function() {
				var gridData = this.getGridData();
				gridData.on("clear", this.onGridClear, this);
				this.on("change:ActiveRow", this.onActiveRowChange, this);
				var grid = this.getCurrentGrid();
				if (grid) {
					grid.on("afterrerender", this.onAfterReRender, this);
				}
			},

			/**
			 * Событие на изменение значения ActiveRow.
			 */
			onActiveRowChange: function() {
				this.cachedActiveRow = this.get("ActiveRow") || this.cachedActiveRow;
			},

			/**
			 * Выполняет загрузку представления списка.
			 * @protected
			 */
			loadGridData: function() {
				var performanceManagerLabel = this.sandbox.id + "_loadGridData";
				performanceManager.start(performanceManagerLabel);
				this.beforeLoadGridData();
				var esq = this.getGridDataESQ();
				this.initQueryColumns(esq);
				this.initQuerySorting(esq);
				this.initQueryFilters(esq);
				this.initQueryOptions(esq);
				this.initQueryEvents(esq);
				esq.getEntityCollection(function(response) {
					this.destroyQueryEvents(esq);
					performanceManager.stop(performanceManagerLabel);
					this.onGridDataLoaded(response);
				}, this);
			},

			/**
			 * Инициализирует экземпляр модели представления по результатам запроса.
			 * @private
			 * @param {Object} config
			 * @param {Object} config.rawData Значения колонок.
			 * @param {Object} config.rowConfig Типы колонок.
			 * @param {Object} config.viewModel Модель представления.
			 */
			createViewModel: function(config) {
				var gridRowViewModelClassName = this.getGridRowViewModelClassName(config);
				var gridRowViewModelConfig = this.getGridRowViewModelConfig(config);
				var viewModel = this.Ext.create(gridRowViewModelClassName, gridRowViewModelConfig);
				if (this.getIsEditable()) {
					BusinessRulesApplier.applyDependencies(viewModel);
				}
				config.viewModel = viewModel;
			},

			/**
			 * Создает экземпляр класса Terrasoft.EntitySchemaQuery.
			 * Инициализирует его свойствами rootSchema, rowViewModelClassName.
			 * @private
			 * @return {Terrasoft.EntitySchemaQuery} Возвращает экземпляр класса Terrasoft.EntitySchemaQuery
			 */
			getGridDataESQ: function() {
				return this.Ext.create(this.queryClassName, {
					rootSchema: this.entitySchema,
					rowViewModelClassName: this.getGridRowViewModelClassName()
				});
			},

			/**
			 * Перечитывает указанную запись из базы данных, или добавляет в список.
			 * @protected
			 * @virtual
			 * @param {String} primaryColumnValue Уникальный идентификотор записи.
			 * @param {Function} [callback] Функция обратного вызова.
			 * @param {Object} [scope] Контекст вызова функции обратного вызова.
			 */
			loadGridDataRecord: function(primaryColumnValue, callback, scope) {
				var performanceManagerLabel = "loadGridDataRecord";
				if (scope && scope.hasOwnProperty("sandbox")) {
					performanceManagerLabel = scope.sandbox.id + "_" + performanceManagerLabel;
				} else if (this && this.hasOwnProperty("sandbox")) {
					performanceManagerLabel = this.sandbox.id + "_" + performanceManagerLabel;
				}
				performanceManager.start(performanceManagerLabel);
				var esq = this.getGridDataESQ();
				this.initQueryColumns(esq);
				this.initQueryEvents(esq);
				var gridData = this.getGridData();
				if (gridData.contains(primaryColumnValue)) {
					var activeRow = gridData.get(primaryColumnValue);
					esq.getEntity(primaryColumnValue, function(response) {
						this.destroyQueryEvents(esq);
						if (!response.success) {
							performanceManager.stop(performanceManagerLabel);
							return;
						}
						var entity = response.entity;
						var activeRowColumns = activeRow.columns;
						this.Terrasoft.each(entity.columns, function(column, columnName) {
							if (activeRowColumns.hasOwnProperty(columnName)) {
								activeRow.set(columnName, entity.get(columnName));
							}
						}, this);
						if (this.Ext.isFunction(callback)) {
							performanceManager.stop(performanceManagerLabel);
							callback.call(scope || this);
						}
						this.onDataChanged();
					}, this);
					performanceManager.stop(performanceManagerLabel);
				} else {
					this.beforeLoadGridDataRecord();
					esq.enablePrimaryColumnFilter(primaryColumnValue);
					esq.getEntityCollection(function(response) {
						this.destroyQueryEvents(esq);
						this.afterLoadGridDataRecord();
						if (!response.success) {
							performanceManager.stop(performanceManagerLabel);
							return;
						}
						var responseCollection = response.collection;
						this.prepareResponseCollection(responseCollection);
						this.initIsGridEmpty(responseCollection);
						this.addItemsToGridData(responseCollection, this.getAddRowsOptions());
						if (this.get("IsGridDataLoaded") !== true || this.get("IsGridLoading") === true) {
							this.set("PreloadedGridDataRecords", responseCollection.getKeys());
						}
						this.afterLoadGridDataUserFunction(primaryColumnValue);
						this.onDataChanged();
						if (this.Ext.isFunction(callback)) {
							performanceManager.stop(performanceManagerLabel);
							callback.call(scope || this);
						}
						performanceManager.stop(performanceManagerLabel);
					}, this);
					performanceManager.stop(performanceManagerLabel);
				}
			},

			/**
			 * Подготавливает модель представления перед загрузкой данных.
			 * @protected
			 * @virtual
			 */
			beforeLoadGridData: function() {
				if (this.get("IsGridDataLoaded") === true) {
					this.set("PreloadedGridDataRecords", []);
				}
				this.set("IsGridDataLoaded", false);
				this.set("IsGridLoading", true);
				this.set("IsGridEmpty", false);
			},

			/**
			 * Подготавливает модель представления после загрузки данных.
			 * @protected
			 * @virtual
			 */
			afterLoadGridData: function() {
				this.set("IsGridLoading", false);
				this.set("IsGridDataLoaded", true);
				this.onDataChanged();
			},

			/**
			 * Метод вызываеться перед перечитыванием записи из базы данных, или добавлением в список.
			 * @protected
			 * @virtual
			 */
			beforeLoadGridDataRecord: this.Terrasoft.emptyFn,

			/**
			 * Метод вызываеться после перечитывания записи из базы данных, или добавления в список.
			 * @protected
			 * @virtual
			 */
			afterLoadGridDataRecord: this.Terrasoft.emptyFn,

			/**
			 * Выполняет различные пользовательские действия после загрузки данных.
			 * @protected
			 * @virtual
			 */
			afterLoadGridDataUserFunction: this.Terrasoft.emptyFn,

			/**
			 * Выполняет действия при любых изменениях данных детали.
			 * @protected
			 * @virtual
			 */
			onDataChanged: this.Terrasoft.emptyFn,

			/**
			 * Обновляет соостояние признака CanLoadMoreData, удаляет последнюю запись выборки (необходимо для
			 * реализации постраничности).
			 * @protected
			 * @virtual
			 * @param {Terrasoft.BaseViewModelCollection} responseCollection
			 */
			initCanLoadMoreData: function(responseCollection) {
				var collectionCount = responseCollection.getCount();
				var canLoadMoreData = (collectionCount > this.getRowCount());
				this.set("CanLoadMoreData", canLoadMoreData);
				if (canLoadMoreData) {
					responseCollection.removeByIndex(collectionCount - 1);
				}
				if (collectionCount) {
					this.set("LastRecord", responseCollection.getByIndex(collectionCount - 1));
				}
			},

			/**
			 * Обновляет соостояние признака IsGridEmpty.
			 * @protected
			 * @virtual
			 */
			initIsGridEmpty: function(responseCollection) {
				var gridData = this.getGridData();
				var isGridEmpty = (responseCollection.isEmpty() && gridData.isEmpty());
				this.set("IsGridEmpty", isGridEmpty);
				if (isGridEmpty) {
					this.set("LastRecord", null);
				}
			},

			/**
			 * Событие загрузки данных, выполняется когда сервер возвращает данные.
			 * @protected
			 * @virtual
			 */
			onGridDataLoaded: function(response) {
				var dataCollection = response.collection || Ext.create("Terrasoft.Collection");
				var preloadRowKeys = this.get("PreloadedGridDataRecords") || [];
				var gridData = this.getGridData();
				var preloadGridData = gridData.filter(function(item, key) {
						return preloadRowKeys.indexOf(key) >= 0;
					});
				var isClearGridData = this.get("IsClearGridData");
				if (isClearGridData) {
					if (!gridData.isEmpty() && (response.success || preloadGridData.isEmpty())) {
						gridData.clear();
					}
					this.set("IsClearGridData", false);
				}
				var performanceManagerLabel = this.sandbox.id + "_onGridDataLoaded";
				performanceManager.start(performanceManagerLabel);
				this.afterLoadGridData();
				if (!response.success) {
					performanceManager.stop(performanceManagerLabel);
					return;
				}
				this.initCanLoadMoreData(dataCollection);
				this.prepareResponseCollection(dataCollection);
				this.initIsGridEmpty(dataCollection);
				this.addItemsToGridData(dataCollection);
				if (!preloadGridData.isEmpty()) {
					this.addItemsToGridData(preloadGridData, this.getAddRowsOptions());
				}
				this.onDataChanged();
				performanceManager.stop(performanceManagerLabel);
			},

			/**
			 * Возвращает параметры добавления записей в реестр.
			 * @protected
			 * @virtual
			 * @return {Object} Параметры добавления
			 */
			getAddRowsOptions: function() {
				return {mode: "top"};
			},

			/**
			 * Добавляет коллекцию новых элементов в коллекцию реестра.
			 * @protected
			 * @virtual
			 * @param {Object} dataCollection Коллекция новых элементов.
			 * @param {Object} options Параметры добавления.
			 */
			addItemsToGridData: function(dataCollection, options) {
				var gridData = this.getGridData();
				dataCollection = this.clearLoadedRecords(dataCollection);
				if (this.getIsCurrentGridRendered() || !options || options.mode !== "top") {
					gridData.loadAll(dataCollection, options);
				} else {
					dataCollection.eachKey(function(key, item) {
						gridData.insert(0, key, item);
					});
				}
			},

			/**
			 * Возвращает новую коллекцию записей состоящюю из отсутствующих в реестре записей передаваемой коллекции.
			 * @protected
			 * @virtual
			 * @param {Object} dataCollection Фильтруемая коллекция записей.
			 * @return {Object} Новая отфильтрованная коллекция записей.
			 */
			clearLoadedRecords: function(dataCollection) {
				var keys = this.getGridData().getKeys() || [];
				return dataCollection.filter(function(item, key) {
					return keys.indexOf(key) < 0;
				});
			},

			/**
			 * Выполняет перезагрузку представления списка.
			 * @protected
			 */
			reloadGridData: function() {
				if (!this.get("IsGridLoading")) {
					var activeRow = this.get("ActiveRow");
					this.set("ActiveRowBeforeReload", activeRow);
					this.set("IsClearGridData", true);
					this.loadGridData();
				}
			},

			/**
			 * Возвращает количество загружаемых строк для данного представления реестра.
			 * @return {Number} Количество загружаемых строк реестра для данного представления.
			 */
			getRowCount: function() {
				var profile = this.get("Profile");
				var propertyName = this.getDataGridName();
				profile = propertyName ? profile[propertyName] : profile;
				if (profile && profile.isTiled !== undefined) {
					return profile.isTiled ? this.get("RowCount") : 2 * this.get("RowCount");
				}
				return this.get("RowCount");
			},

			/**
			 * Инициализирует настройки (постраничность, иерархичность) экземпляра запроса.
			 * @protected
			 * @param {Terrasoft.EntitySchemaQuery} esq Запрос, в котором будут проинициированы необходимые настройки.
			 */
			initQueryOptions: function(esq) {
				var rowCount = this.getRowCount();
				if (rowCount) {
					esq.rowCount = rowCount + 1;
				}
				var isPageable = this.get("IsPageable");
				if (isPageable) {
					this.initPageableQueryOption(esq);
				}
				//TODO Реализовать обработку иерархичности экземпляра запроса
				//var isHierarchical = this.get("IsHierarchical");
				//if (isHierarchical) {
				//
				//}
			},

			/**
			 * Инициализирует настройки постраничности экземпляра запроса.
			 * @protected
			 * @param {Terrasoft.EntitySchemaQuery} esq Запрос, в котором будут проинициированы необходимые настройки.
			 */
			initPageableQueryOption: function(esq) {
				esq.isPageable = true;
				var gridData = this.getGridData();
				var recordsCount = gridData.getCount();
				var isClearGridData = this.get("IsClearGridData");
				if (recordsCount && !isClearGridData) {
					var lastRecord = this.get("LastRecord") || gridData.getByIndex(recordsCount - 1);
					var conditionalValues = esq.conditionalValues = this.Ext.create("Terrasoft.ColumnValues");
					var columnName, columnValue, columnType, columns = lastRecord.columns;
					esq.columns.each(function(column) {
						if (this.Terrasoft.OrderDirection.ASC === column.orderDirection ||
							this.Terrasoft.OrderDirection.DESC === column.orderDirection) {
							columnName = column.columnPath;
							columnValue = lastRecord.get(columnName);
							columnType = columns[columnName].dataValueType;
							if (columnType === Terrasoft.DataValueType.LOOKUP) {
								columnValue = lastRecord.get(columnName).displayValue;
								columnType = Terrasoft.DataValueType.TEXT;
							}
							conditionalValues.setParameterValue(columnName, columnValue, columnType);
						}
					}, this);
					var primaryColumnName = lastRecord.primaryColumnName;
					if (!conditionalValues.contains(primaryColumnName)) {
						var primaryColumnValue = lastRecord.get(primaryColumnName);
						var primaryColumnType = columns[primaryColumnName].dataValueType;
						conditionalValues.setParameterValue(primaryColumnName, primaryColumnValue, primaryColumnType);
					}
				}
			},

			/**
			 * Инициализирует колонки экземпляра запроса.
			 * @protected
			 * @param {Terrasoft.EntitySchemaQuery} esq Запрос, в котором будут проинициализированы колонки.
			 */
			initQueryColumns: function(esq) {
				this.addGridDataColumns(esq);
				this.addProfileColumns(esq);
				this.addTypeColumns(esq);
				this.addProcessEntryPointColumn(esq);
				if (this.getIsEditable()) {
					this.addAllColumns(esq);
				}
			},

			/**
			 * Проверяет является ли колонка ссылкой.
			 * @param {Object} entitySchema Объект схемы.
			 * @param {Object} column Колонка.
			 * @return {Boolean} Признак, является ли колонка ссылкой.
			 */
			getIsLinkColumn: function(entitySchema, column) {
				if (entitySchema.primaryDisplayColumnName === column.columnPath) {
					return true;
				}
				if (column.isLookup) {
					var entitySchemaColumn = entitySchema.getColumnByName(column.columnPath);
					if (entitySchemaColumn) {
						var moduleStructure = this.getModuleStructure(entitySchemaColumn.referenceSchemaName);
						if (moduleStructure) {
							return true;
						}
					}
				}
				return LinkColumnHelper.getIsLinkColumn(entitySchema.name, column.columnPath);
			},

			/**
			 * Добавляет в экземпляр запроса все колонки.
			 * @protected
			 * @param {Terrasoft.EntitySchemaQuery} esq Запрос, в который будут добавлены все колонки.
			 */
			addAllColumns: function(esq) {
				Terrasoft.each(this.columns, function(column, columnName) {
					if (column.type === Terrasoft.ViewModelColumnType.ENTITY_COLUMN) {
						if (!esq.columns.contains(columnName)) {
							esq.addColumn(columnName);
						}
					}
				}, esq);
			},

			/**
			 * Добавляет в экземпляр запроса колонки по умолчанию.
			 * @protected
			 * @param {Terrasoft.EntitySchemaQuery} esq Запрос, в который будут добавлены колонки по умолчанию.
			 */
			addGridDataColumns: function(esq) {
				var gridDataColumns = this.getGridDataColumns();
				Terrasoft.each(gridDataColumns, function(column, columnName) {
					if (!esq.columns.contains(columnName)) {
						esq.addColumn(columnName);
					}
				}, this);
			},

			/**
			 * Добавляет в экземпляр запроса колонки реестра, которые сохранены в профиле.
			 * @protected
			 * @param {Terrasoft.EntitySchemaQuery} esq Запрос, в который будут добавлены колонки из профиля.
			 */
			addProfileColumns: function(esq) {
				var profileColumns = this.getProfileColumns();
				Terrasoft.each(profileColumns, function(column, columnName) {
					if (!esq.columns.contains(columnName)) {
						if (column.aggregationType) {
							this.addProfileAggregationColumn(esq, column, columnName);
						} else {
							esq.addColumn(columnName);
						}
					}
				}, this);
			},

			/**
			 * Добавляет в экземпляр запроса агрегированную колонку реестра из профиля.
			 * @param {Terrasoft.EntitySchemaQuery} esq Запрос, в который будет добавлена колонка.
			 * @param {Object} column Колонка.
			 * @param {String} columnName Имя колонки.
			 */
			addProfileAggregationColumn: function(esq, column, columnName) {
				var aggregationColumn = esq.addColumn(this.Ext.create("Terrasoft.AggregationQueryColumn", {
					aggregationType: column.aggregationType,
					columnPath: column.path
				}), columnName);
				if (column.subFilters) {
					var filters = column.subFilters;
					var serializationInfo = filters.getDefSerializationInfo();
					serializationInfo.serializeFilterManagerInfo = true;
					aggregationColumn.expression.subFilters =
						Terrasoft.deserialize(filters.serialize(serializationInfo));
				}
			},

			/**
			 * Добавляет в экземпляр запроса колонки с типом.
			 * @protected
			 * @param {Terrasoft.EntitySchemaQuery} esq Запрос, в который будут добавлены колонки типа.
			 */
			addTypeColumns: function(esq) {
				var typeColumn = this.getTypeColumn(this.entitySchemaName);
				if (typeColumn && !esq.columns.contains(typeColumn.path)) {
					esq.addColumn(typeColumn.path);
				}
				esq.columns.each(function(column) {
					var entityColumn = this.entitySchema.getColumnByName(column.columnPath);
					if (entityColumn) {
						var typeColumn = this.getTypeColumn(entityColumn.referenceSchemaName);
						if (typeColumn && !esq.columns.contains(column.columnPath + "." + typeColumn.path)) {
							esq.addColumn(column.columnPath + "." + typeColumn.path);
						}
					}
				}, this);
			},

			/**
			 * Возвращает колонки, которые всегда выбираются запросом.
			 * @protected
			 * @virtual
			 * @return {Object} Возвращает массив объектов-конфигураций колонок.
			 */
			getGridDataColumns: function() {
				var defColumnsConfig = {};
				if (this.entitySchema) {
					var primaryColumnName = this.entitySchema.primaryColumnName;
					var primaryDisplayColumnName = this.entitySchema.primaryDisplayColumnName;
					var primaryImageColumnName = this.entitySchema.primaryImageColumnName;
					defColumnsConfig[primaryColumnName] = {
						path: primaryColumnName
					};
					if (primaryDisplayColumnName) {
						defColumnsConfig[primaryDisplayColumnName] = {
							path: primaryDisplayColumnName
						};
					}
					if (primaryImageColumnName) {
						defColumnsConfig[primaryImageColumnName] = {
							path: primaryImageColumnName
						};
					}
				}
				return defColumnsConfig;
			},

			/**
			 * Получает коллекцию колонок из профиля для простого и узкого реестра.
			 * @protected
			 * @return {Object} Объект профиля колонок.
			 */
			getProfileColumns: function() {
				var profileColumns = {};
				var profile = this.get("Profile");
				var propertyName = this.getDataGridName();
				profile = propertyName ? profile[propertyName] : profile;
				this.convertProfileColumns(profileColumns, profile);
				return profileColumns;
			},

			/**
			 * Добавляет коллекцию колонок из профиля.
			 * @protected
			 * @param {Object} profileColumns Колонки из профиля.
			 * @param {Object} profile Объект профиля.
			 */
			convertProfileColumns: function(profileColumns, profile) {
				if (profile && profile.isTiled !== undefined) {
					var isTiled = profile.isTiled;
					var gridsColumnsConfig = isTiled ? profile.tiledConfig : profile.listedConfig;
					if (gridsColumnsConfig) {
						var columnsConfig = this.Ext.decode(gridsColumnsConfig);
						this.Terrasoft.each(columnsConfig.items, function(item) {
							var metaPath = item.bindTo;
							var path = item.path;
							if (metaPath && !profileColumns[metaPath]) {
								profileColumns[metaPath] = {
									aggregationType: item.aggregationType,
									caption: item.caption,
									dataValueType: item.dataValueType,
									path: path || metaPath,
									subFilters: this.Terrasoft.deserialize(item.serializedFilter),
									type: item.type || Terrasoft.GridCellType.TEXT
								};
							}
						}, this);
					}
				}
			},

			/**
			 * Получает колонку Тип для текущей схемы.
			 * @protected
			 * @return {Object}
			 */
			getTypeColumn: function(schemaName) {
				var schemaConfig = Terrasoft.configuration.ModuleStructure[schemaName];
				var typeColumnName = schemaConfig && schemaConfig.attribute || null;
				return typeColumnName ? {path: typeColumnName} : null;
			},

			/**
			 * Инициализирует колонки сортировки.
			 * @protected
			 * @param {Terrasoft.EntitySchemaQuery} esq Запрос, в который будут инициализорованы опции сортировки.
			 */
			initQuerySorting: function(esq) {
				var profile = this.get("Profile");
				var propertyName = this.getDataGridName("normal");
				profile = propertyName ? profile[propertyName] : profile;
				if (profile && profile.isTiled !== undefined) {
					var isTiled = profile.isTiled;
					var gridsColumnsConfig = isTiled ? profile.tiledConfig : profile.listedConfig;
					if (gridsColumnsConfig) {
						var columnsConfig = this.Ext.decode(gridsColumnsConfig);
						for (var i = 0; i < columnsConfig.items.length; i++) {
							var cell = columnsConfig.items[i];
							var columnPath = cell.bindTo;
							if (cell.orderDirection && cell.orderDirection !== "") {
								var sortedColumn = esq.columns.collection.get(columnPath);
								sortedColumn.orderPosition = cell.orderPosition;
								sortedColumn.orderDirection = cell.orderDirection;
							}
						}
					}
				}
				var gridDataColumns = this.getGridDataColumns();
				this.Terrasoft.each(gridDataColumns, function(column) {
					if (!this.Ext.isEmpty(column.orderPosition)) {
						var sortedColumn = esq.columns.collection.get(column.path);
						sortedColumn.orderPosition = column.orderPosition;
						sortedColumn.orderDirection = column.orderDirection;
					}
				}, this);
			},

			/**
			 * Подписывает модель представления на события экземпляра запроса.
			 * @private
			 */
			initQueryEvents: function(esq) {
				esq.on("createviewmodel", this.createViewModel, this);
			},

			/**
			 * Отписывает модель представления от событий экземпляра запроса.
			 * @private
			 */
			destroyQueryEvents: function(esq) {
				esq.un("createviewmodel", this.createViewModel, this);
			},

			/**
			 * Модификация коллекции данных перед загрузкой в реестр.
			 * @protected
			 * @param {Object} collection Коллекция элементов реестра.
			 */
			prepareResponseCollection: function(collection) {
				collection.each(this.prepareResponseCollectionItem, this);
			},

			/**
			 * Модифицирует строку данных перед загрузкой в реестр.
			 * @protected
			 * @param {Terrasoft.BaseViewModel} item Элемент реестра.
			 */
			prepareResponseCollectionItem: function(item) {
				this.Terrasoft.each(item.columns, function(column) {
					this.addColumnLink(item, column);
					this.applyColumnDefaults(column);
				}, this);
			},

			/**
			 * Добавляет метод, возвращающий конфигурацию ссылки в ячейке реестра.
			 * @protected
			 * @param {Terrasoft.BaseViewModel} item Элемент реестра.
			 * @param {Object} column Колонка элемента реестра.
			 */
			addColumnLink: function(item, column) {
				var columnPath = column.columnPath;
				var onColumnLinkClickName = "on" + columnPath + "LinkClick";
				var profileColumns = this.getProfileColumns();
				var profileColumn = profileColumns[columnPath];
				var isProfiledLinkColumn =
					profileColumn && (profileColumn.type === Terrasoft.GridCellType.LINK);
				var isLinkColumn = this.getIsLinkColumn(this.entitySchema, column);
				if ((isProfiledLinkColumn || isLinkColumn) && !this.getIsEditable()) {
					var referenceSchemaName = column.referenceSchemaName;
					var schemaConfig = Terrasoft.configuration.ModuleStructure[referenceSchemaName];
					var scope = this;
					if (column.isLookup && schemaConfig) {
						item[onColumnLinkClickName] = function() {
							var record = this.get(columnPath);
							if (!record) {
								return "";
							}
							var recordId = record.value;
							if (!recordId) {
								return "";
							}
							return scope.createLink.call(this, referenceSchemaName, columnPath,
								record.displayValue, recordId);
						};
					} else {
						var columnIdName = item.primaryColumnName;
						var entitySchemaName = this.entitySchemaName;
						var entitySchemaConfig = Terrasoft.configuration.ModuleStructure[entitySchemaName];
						if (entitySchemaConfig) {
							item[onColumnLinkClickName] = function() {
								var recordId = this.get(columnIdName);
								if (!recordId) {
									return "";
								}
								var displayValue = this.get(columnPath);
								if (scope.Ext.isEmpty(displayValue)) {
									return "";
								}
								var link =
									LinkColumnHelper.createLink(entitySchemaName, columnPath, displayValue, recordId);
								return link || scope.createLink.call(this, entitySchemaName, columnPath,
									displayValue, recordId);
							};
						}
					}
				}
				if (Ext.isEmpty(item[onColumnLinkClickName])) {
					item[onColumnLinkClickName] = function() {
						return (item.getLinkColumnConfig ? item.getLinkColumnConfig(column) : null);
					};
				}
			},

			/**
			 * Создает URL ссылки.
			 * @private
			 * @param {String} entitySchemaName Имя схемы.
			 * @param {String} columnPath Имя колонки.
			 * @param {String} displayValue Отображаемое значение.
			 * @param {String} recordId Идентификатор записи.
			 * @return {Object} Конфигурация ссылки.
			 */
			createLink: function(entitySchemaName, columnPath, displayValue, recordId) {
				var entitySchemaConfig = Terrasoft.configuration.ModuleStructure[entitySchemaName];
				var cardSchema = entitySchemaConfig.cardSchema;
				if (entitySchemaConfig.attribute) {
					var typeId = this.get(columnPath + "." + entitySchemaConfig.attribute) ||
						this.get(entitySchemaConfig.attribute);
					Terrasoft.each(entitySchemaConfig.pages, function(item) {
						if (typeId && item.UId === typeId.value && item.cardSchema) {
							cardSchema = item.cardSchema;
						}
					}, this);
				}
				var URL = [entitySchemaConfig.cardModule, cardSchema, "edit", recordId];
				var link = Terrasoft.workspaceBaseUrl + "/NUI/ViewModule.aspx#" + URL.join("/");
				return {
					caption: displayValue,
					target: "_self",
					title: displayValue,
					url: link
				};
			},

			/**
			 * Обрабатывает нажатие на ссылку в реестре.
			 * @protected
			 * @virtual
			 */
			linkClicked: Terrasoft.emptyFn,

			/**
			 * Возвращает примененные в данной схеме фильтры. Переопределяется в наследниках.
			 * @virtual
			 * @returns {Terrasoft.FilterGroup} Примененные в данной схеме фильтры.
			 */
			getFilters: function() {
				return this.Ext.create("Terrasoft.FilterGroup");
			},

			/**
			 * Применяет свойства колонки по умолчанию.
			 * @private
			 * @param {Object} column Колонка.
			 */
			applyColumnDefaults: function(column) {
				if (Ext.isNumber(column.type)) {
					return;
				}
				column.type = Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN;
				if (!column.columnPath) {
					return;
				}
				var viewModelColumn = this.getColumnByName(column.columnPath);
				if (viewModelColumn) {
					column.type = viewModelColumn.type;
				}
			},

			/**
			 * Подписывает на событие получения коллекции примененных фильтров.
			 * @protected
			 */
			initGetFiltersMessage: function() {
				this.sandbox.subscribe("GetFiltersCollection", function() {
					return this.getFilters();
				}, this);
			},

			/**
			 * Экспортирует содержимое реестра в файл.
			 * @protected
			 */
			exportToFile: function() {
				var gridESQ = this.getGridDataESQ();
				this.addProfileColumns(gridESQ);
				this.initQueryFilters(gridESQ);
				this.initQuerySorting(gridESQ);
				var exportConfig = {
					esq: gridESQ
				};
				DataUtilities.exportToCsvFile(exportConfig);
			},

			/**
			 * Генерирует название поля сущности раздела в сущности развязки объекта с группами.
			 * @protected
			 * @virtual
			 * @return {String} Название колонки.
			 */
			getEntityColumnNameInFolderEntity: function() {
				return this.entitySchema.name;
			},

			/**
			 * Возвращает имя схемы групп для текущей сущности.
			 * @protected
			 * @virtual
			 * @return {String} Имя схемы групп.
			 */
			getFolderEntityName: function() {
				return this.entitySchema.name + this.folderColumnName;
			},

			/**
			 * Возвращает имя схемы развязки статических групп для текущей сущности.
			 * @protected
			 * @virtual
			 * @return {String} Имя схемы развязки статических групп.
			 */
			getInFolderEntityName: function() {
				var entitySchemaName = this.entitySchema.name;
				return entitySchemaName + this.folderTypeSchemaSuffix;
			},

			/**
			 * Открывает справочник статических групп.
			 * @protected
			 */
			openStaticGroupLookup: function() {
				var records = this.getSelectedItems();
				if (records && records.length) {
					var config = {
						entitySchemaName: this.getFolderEntityName(),
						enableMultiSelect: false,
						filters: Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
							this.folderTypeColumnName, ConfigurationConstants.Folder.Type.General)
					};
					LookupUtilities.Open(this.sandbox, config, this.includeEntitiesInFolder, this, null, false, false);
				}
			},

			/**
			 * Генерирует запрос на выборку вхождение записей в группы.
			 * @protected
			 * @virtual
			 * @param {String[]} folders Массив уникальных идентификаторов групп.
			 * @param {String[]} records Массив уникальных идентификаторов записей.
			 * @return {Terrasoft.EntitySchemaQuery} Запрос на выборку вхождение записей в группы.
			 */
			createRecordsInFoldersSelectQuery: function(folders, records) {
				var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: this.getInFolderEntityName()
				});
				var entityColumnNameInFolderEntity = this.getEntityColumnNameInFolderEntity();
				var folderId = select.addColumn(this.folderColumnName, "Folder");
				var recordId = select.addColumn(entityColumnNameInFolderEntity, "Entity");
				select.filters.add("recordsFilter", Terrasoft.createColumnInFilterWithParameters(
					recordId.columnPath, records));
				select.filters.add("foldersFilter", Terrasoft.createColumnInFilterWithParameters(
					folderId.columnPath, folders));
				return select;
			},

			/**
			 * Находит вхождение сущностей в группы. В функцию обратного вызова преобразовывает объект,
			 * состоящий из идентификаторов групп как ключа, и списка входящих в нее записей как значение.
			 * @protected
			 * @virtual
			 * @param {String[]} folders Массив уникальных идентификаторов групп.
			 * @param {String[]} records Массив уникальных идентификаторов записей.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Объект окружения фукнции обратного вызова.
			 */
			getExistingsRecordsInFolders: function(folders, records, callback, scope) {
				var select = this.createRecordsInFoldersSelectQuery(folders, records);
				select.getEntityCollection(function(result) {
					if (!result.success) {
						this.showInformationDialog(resources.localizableStrings.AddRecordsToStaticFolderErrorMessage);
						return;
					}
					var resultCollection = result.collection;
					var entityInFolders = {};
					resultCollection.each(function(item) {
						var folder = item.get("Folder");
						folder = (folder && folder.value) || folder;
						var entity = item.get("Entity");
						entity = (entity && entity.value) || entity;
						var folderEntities = (entityInFolders[folder] || (entityInFolders[folder] = []));
						folderEntities.push(entity);
					}, this);
					callback.call(scope, entityInFolders);
				}, this);
			},

			/**
			 * Находит сущности, которые не входят в выбранные группы. В функцию обратного вызова преобразовывает
			 * объект, состоящий из идентификаторов групп как ключа, и списка не входящих в нее записей как значение.
			 * @protected
			 * @virtual
			 * @param {String[]} folders Массив уникальных идентификаторов групп.
			 * @param {String[]} records Массив уникальных идентификаторов записей.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Объект окружения фукнции обратного вызова.
			 */
			getNotExistingsRecordsInFolders: function(folders, records, callback, scope) {
				this.getExistingsRecordsInFolders(folders, records, function(existingEntities) {
					var notExistingEntitiesInFolder = {};
					Terrasoft.each(folders, function(folderId) {
						var folderEntities = existingEntities[folderId];
						var notExistingEntities = records;
						if (!Ext.isEmpty(folderEntities)) {
							notExistingEntities = records.filter(function(record) {
								return !Ext.Array.contains(folderEntities, record);
							}, this);
						}
						if (!Ext.isEmpty(notExistingEntities)) {
							notExistingEntitiesInFolder[folderId] = notExistingEntities;
						}
					}, this);
					callback.call(scope, notExistingEntitiesInFolder);
				}, this);
			},

			/**
			 * Добавляет записи в выбранную группу.
			 * @private
			 */
			includeEntitiesInFolder: function(args) {
				var folderName;
				Terrasoft.chain(
					function(next) {
						var selectedRows = args.selectedRows.getItems();
						if (!Ext.isEmpty(selectedRows)) {
							folderName = selectedRows[0].displayValue;
							var foldersIds = selectedRows.map(function(folder) {
								return folder.value;
							}, this);
							next(foldersIds);
						}
					},
					function(next, folders) {
						var records = this.getSelectedItems();
						next(folders, records);
					},
					function(next, folders, records) {
						this.getNotExistingsRecordsInFolders(folders, records, next, this);
					},
					function(next, notExistingRecords) {
						var bq = this.Ext.create("Terrasoft.BatchQuery");
						Terrasoft.each(notExistingRecords, function(records, folder) {
							Terrasoft.each(records, function(record) {
								bq.add(this.includeEntityInFolder(record, folder));
							}, this);
						}, this);
						next(bq);
					},
					function(next, batchQuery) {
						if (Ext.isEmpty(batchQuery.queries)) {
							next();
						} else {
							var batchQueriesCount = batchQuery.queries.length;
							batchQuery.execute(function(response) {
								if (response.success) {
									var message = this.Ext.String.format(
										resources.localizableStrings.RecordsAddedToStaticFolder,
										folderName, batchQueriesCount);
									this.showInformationDialog(message);
								} else {
									this.showInformationDialog(
										resources.localizableStrings.AddRecordsToStaticFolderErrorMessage);
								}
								next();
							}, this);
						}
					},
					function() {
						this.deselectRows();
					},
					this
				);

			},

			/**
			 * Удаляет выбраные записи из текущей статической группы.
			 * @protected
			 */
			excludeFromFolder: function() {
				var records = this.getSelectedItems();
				var currentFolder = this.get("CurrentFolder");
				if (currentFolder && records && records.length &&
					currentFolder.folderType.value === ConfigurationConstants.Folder.Type.General) {
					var query = Ext.create("Terrasoft.DeleteQuery", {rootSchemaName: this.getInFolderEntityName()});
					var entityColumnNameInFolderEntity = this.getEntityColumnNameInFolderEntity();
					query.filters.addItem(Terrasoft.createColumnInFilterWithParameters(
						entityColumnNameInFolderEntity, records));
					query.filters.add(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						"Folder", currentFolder.value));
					query.execute(function(response) {
						if (response && response.success) {
							this.set("IsClearGridData", true);
							this.deselectRows();
							this.setActiveView(this.getActiveViewName());
							this.loadGridData();
						}
					}, this);
				}
			},

			/**
			 * Добавляет запись в выбранную группу.
			 * @private
			 * @param {String} record Идентификатор записи.
			 * @param {String} folder Группа.
			 * @return {Terrasoft.InsertQuery} Возвращает оператор добавления записи.
			 */
			includeEntityInFolder: function(record, folder) {
				var insert = this.Ext.create("Terrasoft.InsertQuery", {
					rootSchemaName: this.getInFolderEntityName()
				});
				insert.setParameterValue(this.folderColumnName, folder, Terrasoft.DataValueType.GUID);
				var entityColumnNameInFolderEntity = this.getEntityColumnNameInFolderEntity();
				insert.setParameterValue(entityColumnNameInFolderEntity, record, Terrasoft.DataValueType.GUID);
				return insert;
			},

			/**
			 * Проверяет наличие объекта в массиве объектов.
			 * @private
			 * @param {Object[]} array Массив объектов.
			 * @param {Object} object Объект.
			 */
			isObjectInArray: function(array, object) {
				if (!Ext.isArray(array)) {
					return false;
				}
				for (var i = 0; i < array.length; i++) {
					var element = array[i];
					var isEqual = true;
					for (var propertyName in element) {
						if (element[propertyName] !== object[propertyName]) {
							isEqual = false;
							break;
						}
					}
					if (isEqual) {
						return true;
					}
				}
				return false;
			},

			/**
			 * Инициализирует фильтры экземпляра запроса.
			 * @protected
			 * @param {Terrasoft.EntitySchemaQuery} esq Запрос, в котором будут инициированы фильтры.
			 */
			initQueryFilters: function(esq) {
				esq.filters.addItem(this.getFilters());
			},

			/**
			 * Выполняет сортировку в реестре.
			 * @protected
			 * @param {String} tag Ключ, указывающий каким образом пересортировать реестр.
			 */
			sortGrid: function(tag) {
				var columnsSettingsProfile = this.get("Profile");
				this.changeSorting.call(this, {
					tag: tag,
					columnsSettingsProfile: columnsSettingsProfile
				});
				this.set("IsClearGridData", true);
				this.deselectRows();
				this.loadGridData();
			},

			/**
			 * Выполняет сортировку реестра при нажатии на заголовок колонки в списочном режиме.
			 * @protected
			 * @param {Number} index Индекс колонки в реестре.
			 */
			sortColumn: function(index) {
				var columnsSettingsProfile = this.get("Profile");
				this.changeSorting.call(this, {
					index: index,
					columnsSettingsProfile: columnsSettingsProfile
				});
				this.set("IsClearGridData", true);
				this.deselectRows();
				this.loadGridData();
			},

			/**
			 * Инициирует удаление выбранных записей.
			 * @protected
			 * @virtual
			 */
			deleteRecords: function() {
				var activeRow = this.getActiveRow();
				if (activeRow && activeRow.isNew) {
					this.removeGridRecords([activeRow.get("Id")]);
				} else {
					var items = this.getSelectedItems();
					if (!items || !items.length) {
						return;
					}
					this.checkCanDelete(items, this.checkCanDeleteCallback, this);
				}
			},

			/**
			 * Проверяет возможность удаления выбранных записей.
			 * @param {Array} items Идентификаторы выбранных записей.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Объект окружения фукнции обратного вызова.
			 */
			checkCanDelete: function(items, callback, scope) {
				var config = {schemaName: this.entitySchema.name};
				var methodName;
				if (items.length === 1) {
					config.primaryColumnValue = items[0];
					methodName = "checkCanDelete";
				} else {
					config.primaryColumnValues = items;
					methodName = "checkMultiCanDelete";
				}
				RightUtilities[methodName](config, callback, scope);
			},

			/**
			 * Обрабатывает результат проверки возможности удаления выбранных записей.
			 * @param {Object} result Результат проверки возможности удаления выбранных записей.
			 */
			checkCanDeleteCallback: function(result) {
				if (result) {
					this.showInformationDialog(resources.localizableStrings[result]);
					return;
				}
				this.showConfirmationDialog(this.get("Resources.Strings.DeleteConfirmationMessage"),
					function(returnCode) {
						this.onDelete(returnCode);
					},
					[this.Terrasoft.MessageBoxButtons.YES.returnCode, this.Terrasoft.MessageBoxButtons.NO.returnCode],
					null);
			},

			/**
			 * Обрабатывает ответ пользователя о необходимости удаления данных.
			 * @param {String} returnCode Ответ пользователя о необходимости удаления данных.
			 */
			onDelete: function(returnCode) {
				if (returnCode !== this.Terrasoft.MessageBoxButtons.YES.returnCode) {
					return;
				}
				this.onDeleteAccept();
			},

			/**
			 * Выполняет удаление при подтверждении удаления.
			 * @protected
			 */
			onDeleteAccept: function() {
				this.showBodyMask();
				this.callService({
					serviceName: "GridUtilitiesService",
					methodName: "DeleteRecords",
					data: {
						primaryColumnValues: this.getSelectedItems(),
						rootSchema: this.entitySchema.name
					}
				}, function(responseObject) {
					var result = this.Ext.decode(responseObject.DeleteRecordsResult);
					var success = result.Success;
					var deletedItems = result.DeletedItems;
					this.removeGridRecords(deletedItems);
					this.hideBodyMask();
					if (!success) {
						this.showDeleteExceptionMessage(result);
					}
					this.onDeleted(result);
					this.onDataChanged();
				}, this);

			},

			/**
			 * Действие, которое будет выполнено после удаления.
			 * @virtual
			 */
			onDeleted: this.Terrasoft.emptyFn,

			/**
			 * Показывает сообщение об ошибке, произошедшей во время удаления.
			 * @protected
			 * @param {Object} result Ответ сервера.
			 */
			showDeleteExceptionMessage: function(result) {
				var message = "";
				if (result.IsDbOperationException) {
					message = resources.localizableStrings.DependencyWarningMessage;
				} else if (result.IsSecurityException) {
					message = resources.localizableStrings.RightLevelWarningMessage;
				} else {
					message = result.ExceptionMessage;
				}
				this.showInformationDialog(message);
			},

			/**
			 * Возвращает выбранные / активную запись в реестре.
			 * @protected
			 * @return {Array|null} Список записей.
			 */
			getSelectedItems: function() {
				var isMultiSelect = this.get("MultiSelect");
				var activeRow = this.get("ActiveRow");
				var result = null;
				if (isMultiSelect) {
					result = this.get("SelectedRows");
				} else if (activeRow) {
					result = [activeRow];
				}
				return result;
			},

			/**
			 * Проверяет выбранные / активную запись в реестре.
			 * @protected
			 * @return {Boolean} Результат проверки записи.
			 */
			isAnySelected: function() {
				var selectedRows = this.getSelectedItems();
				return !Ext.isEmpty(selectedRows);
			},

			/**
			 * Проверяет выбранную / активную запись в реестре.
			 * @protected
			 * @return {Boolean} Результат проверки.
			 */
			isSingleSelected: function() {
				var selectedRows = this.getSelectedItems();
				return !Ext.isEmpty(selectedRows) && selectedRows.length === 1;
			},

			/**
			 * Проверяет, видима ли кнопка Исключить из группы в меню кнопки действий.
			 * @protected
			 * @return {Boolean} Результат проверки.
			 */
			isExcludeFromFolderButtonVisible: function() {
				var currentFolder = this.get("CurrentFolder");
				return currentFolder ?
					(currentFolder.folderType.value === ConfigurationConstants.Folder.Type.General) :
					false;
			},

			/**
			 * Убирает из реестра удаленные записи.
			 * @protected
			 * @param {Array} records Удаленные записи.
			 */
			removeGridRecords: function(records) {
				if (records && records.length) {
					var gridData = this.getGridData();
					var activeRow = this.getActiveRow();
					var activeRowId = !this.Ext.isEmpty(activeRow) ? activeRow.get("Id") : null;
					records.forEach(function(record) {
						gridData.removeByKey(record);
						if (activeRowId === record) {
							this.setActiveRow(null);
						}
					}, this);
					this.set("IsGridEmpty", !gridData.getCount());
				}
			},

			/**
			 * Заполняет меню сортировки.
			 * @protected
			 */
			initSortActionItems: function() {
				var collection = this.Ext.create("Terrasoft.BaseViewModelCollection");
				var gridColumns = this.mixins.GridUtilities.getProfileColumns.call(this);
				this.Terrasoft.each(gridColumns, function(column, columnName) {
					collection.addItem(this.getButtonMenuItem({
						Caption: {bindTo: this.name + columnName + "_SortedColumnCaption"},
						Tag: columnName,
						Click: {bindTo: "sortGrid"}
					}));
				}, this);
				this.set("SortColumns", collection);
				this.updateSortColumnsCaptions(this.get("Profile"));
			},

			/**
			 * Переустановка заголовков колонок в профиле.
			 * @protected
			 * @param {Object} columnsSettingsProfile Профиль колонок.
			 */
			updateSortColumnsCaptions: function(columnsSettingsProfile) {
				var propertyName = this.getDataGridName();
				columnsSettingsProfile = propertyName ? columnsSettingsProfile[propertyName] : columnsSettingsProfile;
				columnsSettingsProfile = columnsSettingsProfile || {};
				var gridsColumnsConfig = columnsSettingsProfile.isTiled ?
					columnsSettingsProfile.tiledConfig :
					columnsSettingsProfile.listedConfig;
				if (gridsColumnsConfig) {
					var columnsConfig = this.Ext.decode(gridsColumnsConfig);
					for (var i = 0; i < columnsConfig.items.length; i++) {
						var cell = columnsConfig.items[i];
						var columnKey = cell.bindTo;
						var caption = cell.caption;
						caption = this.getColumnCaption(
							caption, cell.orderDirection
						);
						if (!Ext.isEmpty(cell.orderDirection)) {
							this.set("SortColumnIndex", i);
							this.set("GridSortDirection", cell.orderDirection);
						}
						this.set(this.name + columnKey + "_SortedColumnCaption", caption);
					}
				}
			},

			/**
			 * Получает заголовок колонки с направлением сортировки для заголовка элемента меню сортировки.
			 * @protected
			 * @param {String} caption Заголовок.
			 * @param {Terrasoft.OrderDirection} orderDirection Направление сортировки.
			 * @return {String} Заголовок колонки.
			 */
			getColumnCaption: function(caption, orderDirection) {
				if (!orderDirection || orderDirection === "") {
					return caption;
				}
				if (orderDirection === Terrasoft.OrderDirection.ASC) {
					caption += " (" + resources.localizableStrings.AscendingDirectionCaption + ")";
				} else {
					caption += " (" + resources.localizableStrings.DescendingDirectionCaption + ")";
				}
				return caption;
			},

			/**
			 * Сохраняет профиль колонок реестра.
			 * @protected
			 * @param {Object} viewColumnsSettingsProfile Профиль с настроенными колонками.
			 * @param {Object} notSaveToProfile Флаг сохранения профиля в базе.
			 */
			setColumnsProfile: function(viewColumnsSettingsProfile, notSaveToProfile) {
				var columnsSettingsProfile = this.get("Profile");
				if (notSaveToProfile !== true) {
					var propertyName = this.getDataGridName();
					var columnsSettingsProfileKey = columnsSettingsProfile[propertyName].key;
					Terrasoft.utils.saveUserProfile(columnsSettingsProfileKey,
						viewColumnsSettingsProfile, false);
				}
				this.set("Profile", viewColumnsSettingsProfile);
			},

			/**
			 * Выполняет изменение сортировки в профиле реестра.
			 * @protected
			 * @param {Object} config Объект, содержащий тег, индекс колонки, профиль.
			 */
			changeSorting: function(config) {
				var tag = config.tag;
				var index = config.index;
				var fullSettingsProfile = config.columnsSettingsProfile;
				var propertyName = this.getDataGridName();
				var columnsSettingsProfile = propertyName ? fullSettingsProfile[propertyName] : fullSettingsProfile;
				if (Ext.isEmpty(tag)) {
					tag = this.getSortColumnByIndex(index, columnsSettingsProfile);
				}
				var column = this.entitySchema.columns[tag];
				if (!column) {
					column = this.Ext.create("Terrasoft.EntityQueryColumn", {
						columnPath: tag
					});
					column.name = tag;
				}
				if (columnsSettingsProfile) {
					var gridsColumnsConfig = columnsSettingsProfile.isTiled ?
						columnsSettingsProfile.tiledConfig :
						columnsSettingsProfile.listedConfig;
					if (gridsColumnsConfig) {
						var columnsConfig = this.Ext.decode(gridsColumnsConfig);
						for (var i = 0; i < columnsConfig.items.length; i++) {
							var cell = columnsConfig.items[i];
							var columnKey = cell.bindTo;
							if (columnKey === column.name) {
								cell.orderDirection = this.getColumnSortDirection(
									cell.orderDirection, column.dataValueType
								);
								cell.orderPosition = 1;
								this.set("SortColumnIndex", i);
								this.set("GridSortDirection", cell.orderDirection);
							} else {
								cell.orderDirection = "";
								cell.orderPosition = "";
							}
							var caption = cell.caption;
							caption = this.getColumnCaption(
								caption, cell.orderDirection
							);
							this.set(this.name + columnKey + "_SortedColumnCaption", caption);
						}
						gridsColumnsConfig = this.Ext.encode(columnsConfig);
						if (columnsSettingsProfile.isTiled) {
							columnsSettingsProfile.tiledConfig = gridsColumnsConfig;
						} else {
							columnsSettingsProfile.listedConfig = gridsColumnsConfig;
						}
					}
				}
				this.setColumnsProfile(fullSettingsProfile);
			},

			/**
			 * Получает колонку по индексу.
			 * @protected
			 * @param {Number} index Индекс колонки.
			 * @param {Object} columnsSettingsProfile Профиль.
			 * @return {String} Имя колонки.
			 */
			getSortColumnByIndex: function(index, columnsSettingsProfile) {
				var columnsConfig = columnsSettingsProfile.listedConfig;
				var column;
				var columnName;
				if (!Ext.isEmpty(columnsConfig)) {
					var columns = this.Ext.decode(columnsConfig);
					column = columns.items[index];
					columnName = column.bindTo;
				}
				return columnName;
			},

			/**
			 * Получает направление сортировки в зависимости от типа.
			 * @protected
			 * @param {Terrasoft.core.enums.OrderDirection} orderDirection Направление сортировки.
			 * @param {Terrasoft.DataValueType} dataValueType Тип данных колонки.
			 * @return {Terrasoft.OrderDirection} Направление сортировки.
			 */
			getColumnSortDirection: function(orderDirection, dataValueType) {
				if (orderDirection && orderDirection !== "") {
					orderDirection = (orderDirection === Terrasoft.OrderDirection.ASC) ?
						Terrasoft.OrderDirection.DESC :
						Terrasoft.OrderDirection.ASC;
				} else {
					if (dataValueType === Terrasoft.DataValueType.TEXT ||
						dataValueType === Terrasoft.DataValueType.LOOKUP) {
						orderDirection = Terrasoft.OrderDirection.ASC;
					} else if (dataValueType === Terrasoft.DataValueType.INTEGER ||
						dataValueType === Terrasoft.DataValueType.FLOAT ||
						dataValueType === Terrasoft.DataValueType.MONEY ||
						dataValueType === Terrasoft.DataValueType.DATE_TIME ||
						dataValueType === Terrasoft.DataValueType.DATE ||
						dataValueType === Terrasoft.DataValueType.TIME ||
						dataValueType === Terrasoft.DataValueType.BOOLEAN) {
						orderDirection = Terrasoft.OrderDirection.DESC;
					} else {
						orderDirection = Terrasoft.OrderDirection.ASC;
					}
				}
				return orderDirection;
			},

			/**
			 * Возвращает ключ профиля.
			 * @protected
			 * @virtual
			 * @return {String} Ключ.
			 */
			getProfileKey: this.Ext.emptyFn,

			/**
			 * Возвращает имя реестра раздела, используется как ключ для получения настроек из профиля.
			 * @protected
			 * @return {String} Имя реестра раздела.
			 */
			getDataGridName: function() {
				return "DataGrid";
			},

			/**
			 * Возвращает реестр раздела.
			 * @protected
			 * @return {*|Component} Реестр раздела.
			 */
			getCurrentGrid: function() {
				return this.Ext.getCmp(this.name + "DataGridGrid");
			},

			/**
			 * Проверяет, отрисован реестр или нет.
			 * @protected
			 * @return {Boolean}
			 */
			getIsCurrentGridRendered: function() {
				var currentGrid = this.getCurrentGrid();
				return currentGrid && currentGrid.rendered;
			},

			/**
			 * Приводит представление реестра в соответствие с новой конфигурацией колонок в профиле.
			 * @protected
			 */
			reloadGridColumnsConfig: function(doReRender) {
				var performanceManagerLabel = this.sandbox.id + "_reloadGridColumnsConfig";
				performanceManager.start(performanceManagerLabel);
				var profile = this.get("Profile");
				var propertyName = this.getDataGridName();
				var gridProfile = profile[propertyName];
				if (!this.Ext.Object.isEmpty(gridProfile)) {
					var grid = this.getCurrentGrid();
					if (!grid) {
						performanceManager.stop(performanceManagerLabel);
						return;
					}
					grid.type = gridProfile.type;
					var viewGenerator = Ext.create("Terrasoft.ViewGenerator");
					viewGenerator.viewModelClass = this;
					var gridConfig;
					var bindings = this.Terrasoft.deepClone(grid.bindings);
					if (gridProfile.type === Terrasoft.GridType.LISTED) {
						gridConfig = {
							listedConfig: Ext.decode(gridProfile.listedConfig),
							type: gridProfile.type
						};
						this.actualizeListedGridConfig(viewGenerator, gridConfig);
						grid.captionsConfig = gridConfig.listedConfig.captionsConfig;
						grid.columnsConfig = gridConfig.listedConfig.columnsConfig;
						grid.listedConfig = gridConfig.listedConfig;
						grid.initBindings(gridConfig.listedConfig);
					} else {
						gridConfig = {
							tiledConfig: Ext.decode(gridProfile.tiledConfig),
							type: gridProfile.type
						};
						var isVertical = (propertyName.indexOf("VerticalProfile") > -1);
						gridConfig.isVertical = isVertical;
						grid.isEmptyRowVisible = !isVertical;
						this.actualizeTiledGridConfig(viewGenerator, gridConfig);
						grid.columnsConfig = gridConfig.tiledConfig.columnsConfig;
						grid.tiledConfig = gridConfig.tiledConfig;
						grid.initBindings(gridConfig.tiledConfig);
					}
					grid.bindings = bindings;
					if (doReRender) {
						grid.clear();
						grid.prepareCollectionData();
						if (grid.rendered) {
							grid.reRender();
						}
					}
				}
				performanceManager.stop(performanceManagerLabel);
			},

			/**
			 * Вызывает метод actualizeListedGridConfig у viewGenerator.
			 * @param {Terrasoft.ViewGenerator} viewGenerator Генератор представления.
			 * @param {Object} gridConfig Конфигурация реестра.
			 */
			actualizeListedGridConfig: function(viewGenerator, gridConfig) {
				viewGenerator.actualizeListedGridConfig(gridConfig);
			},

			/**
			 * Вызывает метод actualizeTiledGridConfig у viewGenerator.
			 * @param {Terrasoft.ViewGenerator} viewGenerator Генератор представления.
			 * @param {Object} gridConfig Конфигурация реестра.
			 */
			actualizeTiledGridConfig: function(viewGenerator, gridConfig) {
				viewGenerator.actualizeTiledGridConfig(gridConfig);
			},

			/**
			 * Выключает кнопки активной строки при открытой карточке.
			 * @protected
			 */
			switchActiveRowActions: function() {
				var grid = this.getCurrentGrid();
				if (!grid) {
					return;
				}
				var activeRowActions = grid.activeRowActions;
				if (activeRowActions) {
					var schemaActiveRowActions = this.get("ActiveRowActions");
					if (!schemaActiveRowActions) {
						this.set("ActiveRowActions", activeRowActions);
					}
				}
				if (this.get("IsCardVisible") === true) {
					grid.activeRowActions = [];
				} else {
					grid.activeRowActions = this.get("ActiveRowActions");
				}
			},

			/**
			 * Прокручивает реестр, чтобы была видна активная строка.
			 * @protected
			 */
			ensureActiveRowVisible: function() {
				var grid = this.getCurrentGrid();
				var activeRow = this.get("ActiveRow");
				if (grid && activeRow) {
					var activeRowDom = grid.getDomRow(activeRow);
					if (activeRowDom && activeRowDom.dom) {
						var el = activeRowDom.dom;
						if (el.scrollIntoViewIfNeeded) {
							el.scrollIntoViewIfNeeded(false);
						} else {
							el.scrollIntoView(false);
						}
					}
				}
			},

			/**
			 * Открывает модуль настройки колонок реестра.
			 * @protected
			 */
			openGridSettings: function() {
				this.showBodyMask();
				var gridSettingsId = this.sandbox.id + "_GridSettingsV2";
				this.sandbox.subscribe("GetGridSettingsInfo", this.getGridSettingsInfo, this, [gridSettingsId]);
				var params = this.sandbox.publish("GetHistoryState");
				this.sandbox.publish("PushHistoryState", {hash: params.hash.historyState, silent: true});
				this.sandbox.loadModule("GridSettingsV2", {
					renderTo: "centerPanel",
					keepAlive: true
				});
				this.sandbox.subscribe("GridSettingsChanged", function(args) {
					var gridData = this.getGridData();
					gridData.clear();
					if (args && args.newProfileData) {
						this.setColumnsProfile(args.newProfileData, true);
					}
					this.set("GridSettingsChanged", true);
					this.initSortActionItems();
				}, this, [gridSettingsId]);
			},

			/**
			 * Возвращает параметры открытия страницы настройки колонок.
			 * @protected
			 * @return {Object} Параметры открытия страницы настройки колонок.
			 */
			getGridSettingsInfo: function() {
				var moduleName = this.sandbox.moduleName;
				var workAreaMode = this.getHistoryStateInfo().workAreaMode;
				var isEditable = this.getIsEditable();
				var isSingleTypeMode =
					((moduleName !== "DetailModuleV2" && workAreaMode === ConfigurationEnums.WorkAreaMode.COMBINED) ||
						isEditable);
				return {
					baseGridType: isEditable ? this.Terrasoft.GridType.LISTED : this.Terrasoft.GridType.TILED,
					isSingleTypeMode: isSingleTypeMode,
					firstColumnsOnly: isEditable,
					entitySchemaName: this.entitySchema.name,
					profileKey: this.getProfileKey(),
					propertyName: this.getDataGridName()
				};
			},

			/**
			 * Возвращает название класса модели представления возвращаемого объекта по результатам запроса.
			 * @protected
			 * @return {String} Название класса модели представления.
			 */
			getGridRowViewModelClassName: function(config) {
				if (this.getIsEditable()) {
					return this.getEditableGridRowViewModelClassName(config);
				} else {
					return "Terrasoft.BaseGridRowViewModel";
				}
			},

			/**
			 * Возвращает название схемы для модели предсталения элемента редактируемго реестра.
			 * @protected
			 * @return {String} Название схемы модели представления.
			 */
			getDefaultConfigurationGridItemSchemaName: function() {
				return "BasePageV2";
			},

			/**
			 * Возвращает название класса модели представления возвращаемого объекта по результатам запроса.
			 * @protected
			 * @return {String} Название класса модели представления.
			 */
			getEditableGridRowViewModelClassName: function(config) {
				if (!config) {
					return null;
				}
				var className = "Terrasoft.BaseConfigurationGridRowViewModel";
				var entitySchemaName = this.entitySchemaName;
				var entityStructure = Terrasoft.configuration.EntityStructure[entitySchemaName];
				var rawData = config.rawData;
				var typeColumn = this.getTypeColumn(entitySchemaName);
				var schemaName = null;
				var pages = [];
				if (entityStructure) {
					pages = entityStructure.pages;
				} else {
					pages.push({cardSchema: this.getDefaultConfigurationGridItemSchemaName()});
				}
				this.Terrasoft.each(pages, function(page) {
					if (typeColumn) {
						var path = typeColumn.path;
						if (rawData.hasOwnProperty(path)) {
							var typeColumnValue = rawData[path].value;
							if (page.UId === typeColumnValue) {
								schemaName = page.cardSchema;
							}
						}
					} else {
						schemaName = page.cardSchema;
					}
				}, this);
				if (schemaName) {
					className = "Terrasoft." + schemaName + "ConfigurationGridRow" + entitySchemaName + "ViewModel";
				}
				return className;
			},

			/**
			 * Возвращает свойства класса модели представления возвращаемого объекта по результатам запроса.
			 * @protected
			 * @param {Object} config
			 * @param {Object} config.rawData Значения колонок.
			 * @param {Object} config.rowConfig Типы колонок.
			 * @return {Object} Свойства класса модели представления.
			 */
			getGridRowViewModelConfig: function(config) {
				var gridRowViewModelConfig = {
					entitySchema: this.entitySchema,
					rowConfig: config.rowConfig,
					values: config.rawData,
					isNew: false,
					isDeleted: false
				};
				if (this.getIsEditable()) {
					this.Ext.apply(gridRowViewModelConfig, {
						Ext: this.Ext,
						Terrasoft: this.Terrasoft,
						sandbox: this.sandbox
					});
					this.Ext.apply(gridRowViewModelConfig.values, {
						IsEntityInitialized: true
					});
				}
				return gridRowViewModelConfig;
			},

			/**
			 * Скрывает элементы управления активной записи.
			 * @protected
			 */
			hideActiveRowActions: function() {
				var grid = this.getCurrentGrid();
				if (!grid) {
					return;
				}
				var activeRowActions = grid.activeRowActions;
				if (activeRowActions) {
					var schemaActiveRowActions = this.get("ActiveRowActions");
					if (!schemaActiveRowActions) {
						this.set("ActiveRowActions", activeRowActions);
					}
				}
				grid.activeRowActions = [];
			},

			/**
			 * Показывает элементы управления активной записи.
			 * @protected
			 */
			showActiveRowActions: function() {
				var grid = this.getCurrentGrid();
				if (!grid) {
					return;
				}
				grid.activeRowActions = this.get("ActiveRowActions");
			},

			/**
			 * Возвращает активную строку.
			 * @protected
			 * @return {Terrasoft.BaseViewModel} Активная строка.
			 */
			findActiveRow: function() {
				var selectedItems = this.getSelectedItems();
				if (this.Ext.isEmpty(selectedItems)) {
					return null;
				}
				var primaryColumnValue = selectedItems[0];
				if (primaryColumnValue) {
					var gridData = this.getGridData();
					if (gridData.contains(primaryColumnValue)) {
						return gridData.get(primaryColumnValue);
					}
				}
			},

			/**
			 * Возвращает True, если реестр редактируемый.
			 * @protected
			 * @return {Boolean} True, если реестр редактируемый.
			 */
			getIsEditable: function() {
				return (this.get("IsEditable") === true);
			},

			/**
			 * Устанавливает значение признака, указываеющего на то, что реестр редактируемый.
			 * @param {Boolean} value Значение признака.
			 */
			setIsEditable: function(value) {
				this.set("IsEditable", value);
			},

			/**
			 * Инициализирует классы элементов коллекции реестра.
			 * @protected
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Объект окружения фукнции обратного вызова.
			 */
			initGridRowViewModel: function(callback, scope) {
				if (this.getIsEditable()) {
					this.initEditableGridRowViewModel(callback, scope);
				} else {
					callback.call(scope);
				}
			},

			/**
			 * Устанавливает активную строку.
			 * @protected
			 */
			setActiveRow: function(value) {
				this.set("ActiveRow", value);
			},

			/**
			 * Формирует конфигурацию для пользовательского сообщения о пустом реестре.
			 * @protected
			 */
			prepareEmptyGridMessageConfig: Terrasoft.emptyFn,

			/**
			 * Отменяет выделение выбранныых записей.
			 * @protected
			 */
			deselectRows: function() {
				this.set("ActiveRow", null);
				this.set("SelectedRows", []);
			},

			/**
			 * Подписывает на событие изменения фильтров для обновления рееестра.
			 */
			subscribeFiltersChanged: function() {
				var quickFilterModuleId = this.getQuickFilterModuleId();
				this.sandbox.subscribe("UpdateFilter", function(filterItem) {
					this.onFilterUpdate(filterItem.key, filterItem.filters, filterItem.filtersValue);
				}, this, [quickFilterModuleId]);
			},

			/**
			 * Подписывает на информацию о сущности с которой работает фильтр.
			 */
			subscribeGetModuleSchema: function() {
				var quickFilterModuleId = this.getQuickFilterModuleId();
				this.sandbox.subscribe("GetModuleSchema", function() {
					var filterDefaultColumnName = this.getFilterDefaultColumnName();
					var isShortFilterVisible = this.getShortFilterVisible();
					if (!Ext.isEmpty(filterDefaultColumnName) || isShortFilterVisible) {
						return {
							entitySchema: this.entitySchema,
							filterDefaultColumnName: filterDefaultColumnName,
							isShortFilterVisible: isShortFilterVisible
						};
					} else {
						return this.entitySchema;
					}
				}, this, [quickFilterModuleId]);
			},

			/**
			 * Проверяет условия игнорирования изменений фильтров.
			 * @return {Boolean} Признак, игнорировать изменения фильтров или нет.
			 */
			ignoreFilters: function() {
				return (this.get("IgnoreFilterUpdate") === true || this.get("IsGridLoading") === true);
			},

			/**
			 * Обработчик события фильтра в детали.
			 */
			onFilterUpdate: function(filterKey, filterItem, filtersValue) {
				if (this.ignoreFilters()) {
					return;
				}
				this.set("IsClearGridData", true);
				this.deselectRows();
				this.setFilter(filterKey, filterItem, filtersValue);
				this.setAfterFiltersUpdateTimeout();
			},

			/**
			 * Устанавливает задержку перед применением фильтров.
			 * @private
			 */
			setAfterFiltersUpdateTimeout: function() {
				if (this.filtersUpdateTimeoutId) {
					clearTimeout(this.filtersUpdateTimeoutId);
					this.filtersUpdateTimeoutId = null;
				}
				this.filtersUpdateTimeoutId = this.Ext.defer(this.afterFiltersUpdated, this.filtersUpdateDelay, this);
			},

			/**
			 * Функция, воторая вызывается после установки фильтров.
			 * @virtual
			 */
			afterFiltersUpdated: this.Terrasoft.emptyFn,

			/**
			 * Генерирует идентификатор модуля быстрой фильтрации.
			 * @protected
			 * @return {String} Идентификатор модуля.
			 */
			getQuickFilterModuleId: function() {
				return this.sandbox.id + "_QuickFilterModuleV2";
			},

			/**
			 * Возвращает имя колонки для фильтрации по умолчанию.
			 * @virtual
			 * @return {String} Имя колонки.
			 */
			getFilterDefaultColumnName: function() {
				var primaryDisplayColumnName = null;
				if (!Ext.isEmpty(this.entitySchema)) {
					primaryDisplayColumnName = this.entitySchema.primaryDisplayColumnName;
				}
				return primaryDisplayColumnName;
			},

			/**
			 * Возвращает признак отображения фильтра без выпадающего меню.
			 * @virtual
			 * @return {Boolean} Признак отображения фильтра без выпадающего меню.
			 */
			getShortFilterVisible: function() {
				return false;
			}
		});
		return Ext.create(GridUtilitiesClass);

	});
