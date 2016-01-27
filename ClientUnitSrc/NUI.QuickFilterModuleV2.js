define("QuickFilterModuleV2", ["LabelDateEdit", "performancecountermanager",
		"StorageUtilities", "BaseNestedModule", "ViewGeneratorV2", "QuickFilterViewV2"],
	function(LabelDateEdit, performanceManager, StorageUtilities) {

		/**
		 * @class Terrasoft.configuration.BaseFilterViewModel
		 * Базовый класс модели фильтра.
		 */
		Ext.define("Terrasoft.configuration.BaseFilterViewModel", {
			alternateClassName: "Terrasoft.BaseFilterViewModel",
			extend: "Terrasoft.BaseViewModel",

			/**
			 * Схема с которой работает фильтр.
			 * @type {Object}
			 */
			entitySchema: null,

			/**
			 * Схема груп с которыми работает фильтр.
			 * @type {Object}
			 */
			folderEntitySchema: null,

			/**
			 * Схема таблицы принадлежности записей к групам с которой работает фильтр.
			 * @type {Object}
			 */
			inFolderEntitySchema: null,

			/**
			 * @inheritdoc Terrasoft.BaseViewModel#constructor
			 * @virtual
			 * @overridden
			 */
			constructor: function() {
				this.callParent(arguments);
				this.addEvents(
					/**
					 * @event
					 * Событие изменения фильтра.
					 * @param {String} filterType Имя модели представления фильтра.
					 * @param {Boolean} suspendUpdate Флаг остановки отправки сообщения.
					 */
					"filterChanged",
					/**
					 * @event
					 * Событие получения необходимого фильтра.
					 * @param {String} filterType Имя модели представления фильтра.
					 * @param {String} filterName Название фильтра.
					 * @param {Object} outResult Объект, куда будет помещен необходимый фильтр.
					 */
					"getFilterValue",
					/**
					 * @event
					 * Событие очистки необходимого фильтра.
					 * @param {String} filterType Имя модели представления фильтра.
					 * @param {Object} config Конфигурация фильтра, который нужно установить вместо старых.
					 */
					"clearFilterValue"
				);
			},

			/**
			 * Возвращает текущие фильтры.
			 * @virtual
			 * @return {Terrasoft.BaseFilter} Текущие фильтры.
			 */
			getFilterState: function() {
				return this.get("Filters");
			}

		});

		/**
		 * @class Terrasoft.configuration.FiltersContainerViewModel
		 * Класс модели представления контейнера фильтров.
		 */
		Ext.define("Terrasoft.configuration.FiltersContainerViewModel", {
			alternateClassName: "Terrasoft.FiltersContainerViewModel",
			extend: "Terrasoft.BaseModel",

			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 * Конфигурация моделей представлений фильтров.
			 * @type {Object}
			 */
			viewModelConfig: null,

			/**
			 * Тип фильтрации.
			 * @type {Terrasoft.ComparisonType}
			 */
			stringColumnSearchComparisonType: Terrasoft.ComparisonType.START_WITH,

			/**
			 * Схема с которой работают фильтры.
			 * @type {Object}
			 */
			entitySchema: null,

			/**
			 * Название схемы с которой работают фильтры.
			 * @type {String}
			 */
			entitySchemaName: null,

			/**
			 * Схема групы с которой работают фильтры.
			 * @type {Object}
			 */
			folderEntitySchema: null,

			/**
			 * Схема таблицы принадлежности записей к групам с которой работают фильтры.
			 * @type {Object}
			 */
			inFolderEntitySchema: null,

			/**
			 * Список названий моделей для инициализации.
			 * @private
			 * @type {String[]}
			 */
			initViewModelsNames: null,

			/**
			 * Возвращает название схемы с которой работают фильтры.
			 * @protected
			 * @virtual
			 * @return {String} Название схемы с которой работают фильтры.
			 */
			getSchemaName: function() {
				return this.entitySchema.name;
			},

			/**
			 * Создает и инициализирует одну из оставшихся моделей фильтров, указанных для инициализации.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			initFilterViewModel: function(callback, scope) {
				var name = this.initViewModelsNames.shift();
				var viewModel = this.createFilterViewModel(name);
				var filtersCollection = this.getFiltersViewModels();
				filtersCollection.add(name, viewModel);
				viewModel.init(callback, scope);
			},

			/**
			 * Инициализирует начальные значения модели.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			init: function(callback, scope) {
				this.sectionFilters = this.sandbox.publish("GetSectionFiltersInfo", null, [this.sandbox.id]) ||
				this.Ext.create("Terrasoft.FilterGroup");
				var filtersCollection = this.Ext.create("Terrasoft.Collection");
				this.set("filtersViewModels", filtersCollection);
				this.initViewModelsNames = Ext.Object.getKeys(this.viewModelConfig);
				var initChain = this.initViewModelsNames.map(function() {
					return this.initFilterViewModel;
				}, this);
				initChain.push(function() {
					callback.call(scope);
				});
				Terrasoft.chain.apply(this, initChain);
			},

			/**
			 * Возвращает коллекцию текущих моделей представления фильтров.
			 * @return {Terrasoft.Collection} Коллекция моделей представлений.
			 */
			getFiltersViewModels: function() {
				return this.get("filtersViewModels");
			},

			/**
			 * Создает модель представления вильтра, подписывается на ее сообщения.
			 * @protected
			 * @virtual
			 * @param {String} filterName Название модели представления.
			 * @return {Terrasoft.BaseFilterViewModel} Модель представления фильтра.
			 */
			createFilterViewModel: function(filterName) {
				var filtersConfig = this.viewModelConfig[filterName];
				if (!filtersConfig) {
					return;
				}
				if (this.sectionFilters.contains(filterName)) {
					Ext.merge(filtersConfig, {
						values: {"Filters": this.sectionFilters.get(filterName)}
					});
				}
				var className = filtersConfig.className || "Terrasoft.BaseFilterViewModel";
				delete filtersConfig.className;
				var viewModel = this.Ext.create(className, filtersConfig);
				viewModel.on("filterChanged", this.filterChanged, this);
				viewModel.on("getFilterValue", this.onGetFilterValue, this);
				viewModel.on("clearFilterValue", this.clearFilterValue, this);
				return viewModel;
			},

			/**
			 * Отправляет сообщение об изменении фильтров.
			 * @private
			 * @param {String|*} key Тип измененых фильтров.
			 * @param {Boolean} suspendUpdate Флаг остановки отправки сообщения.
			 */
			filterChanged: function(key, suspendUpdate) {
				if (suspendUpdate) {
					return;
				}
				this.saveFilterState();
				var filterItem = {key: key};
				var filtersViewModels = this.getFiltersViewModels();
				if (filtersViewModels.contains(key)) {
					var filterViewModel = filtersViewModels.get(key);
					Ext.apply(filterItem, {
						filters: filterViewModel.getFilters(),
						filtersValue: this.getFilterValue(key)
					});
				} else {
					Ext.apply(filterItem, {
						filters: this.getFilters(),
						filtersValue: []
					});
				}
				var sandbox = this.sandbox;
				var sandboxId = sandbox.id;
				sandbox.publish("UpdateFilter", filterItem, [sandboxId]);
			},

			/**
			 * Сохраняет быстрые фильтры в клиентском хранилище.
			 * @protected
			 * @virtual
			 */
			saveFilterState: function() {
				var customFilter = this.getFilterValue("CustomFilters");
				var filterCustomProfileKey = "FilterCustom_" + this.getSchemaName();//todo unique key
				if (customFilter) {
					StorageUtilities.setItem(customFilter, filterCustomProfileKey);
				}
			},

			/**
			 * Соберает фильтры из всех моделей представления фильтров, формирует из них один фильтр.
			 * @virtual
			 * @return {Terrasoft.FilterGroup} Фильтры.
			 */
			getFilters: function() {
				var filtersCollection = this.Ext.create("Terrasoft.FilterGroup");
				filtersCollection.logicalOperation = Terrasoft.LogicalOperatorType.AND;
				var filtersViewModels = this.getFiltersViewModels();
				filtersViewModels.eachKey(function(viewModelName, filterViewModel) {
					var fixedFilterCollection = filterViewModel.getFilters();
					if (!fixedFilterCollection.isEmpty()) {
						filtersCollection.add(viewModelName, fixedFilterCollection);
					}
				}, this);
				return filtersCollection;
			},

			/**
			 * Возвращает модель представления фильтра по имени.
			 * @param {String} filterName Имя модели представления фильтра.
			 * @return {Terrasoft.BaseFilterViewModel} Модель представления фильтра.
			 */
			getFilterViewModel: function(filterName) {
				var filtersViewModels = this.getFiltersViewModels();
				return filtersViewModels.contains(filterName)
					? filtersViewModels.get(filterName)
					: null;
			},

			/**
			 * Очищает вильтр по имени с установкой переданного фильтра.
			 * @virtual
			 * @param {String} filterName Имя модели представления фильтра.
			 * @param {Terrasoft.FilterGroup} filter Новое значение фильтров.
			 */
			clearFilterValue: function(filterName, filter) {
				var filterViewModel = this.getFilterViewModel(filterName);
				if (filterViewModel) {
					filterViewModel.clear(filter);
				}
			},

			/**
			 * Возвращает значение фильтра у выбранного типа фильтра.
			 * @virtual
			 * @param {String} filterType Имя модели представления фильтра.
			 * @param {String} filterName Название фильтра.
			 * @param {Object} outResult Объект, куда будет помещен необходимый фильтр.
			 */
			onGetFilterValue: function(filterType, filterName, outResult) {
				outResult.filters = this.getFilterValue(filterType, filterName);
			},

			/**
			 * Возвращает значение фильтра у выбранного типа фильтра.
			 * @virtual
			 * @param {String} filterType Имя модели представления фильтра.
			 * @param {String} filterName Название фильтра.
			 * @return {Terrasoft.BaseFilter} Значение фильтра.
			 */
			getFilterValue: function(filterType, filterName) {
				var filterViewModel = this.getFilterViewModel(filterType);
				return filterViewModel ? filterViewModel.getFilterValue(filterName) : null;
			},

			/**
			 * @inheritDoc Terrasoft.core.BaseObject#destroy
			 * @overridden
			 */
			destroy: function() {
				var filtersCollection = this.getFiltersViewModels();
				filtersCollection.each(function(filterViewModel) {
					filterViewModel.un("filterChanged", this.filterChanged, this);
					filterViewModel.un("getFilterValue", this.onGetFilterValue, this);
					filterViewModel.un("clearFilterValue", this.clearFilterValue, this);
				}, this);
			}

		});

		/**
		 * @class Terrasoft.configuration.QuickFilterModule
		 * Класс модуля фильтров.
		 */
		var quickFilterModule = Ext.define("Terrasoft.configuration.QuickFilterModule", {
			alternateClassName: "Terrasoft.QuickFilterModule",
			extend: "Terrasoft.BaseNestedModule",

			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 * Признак отображения маски на месте модуля, пока он не будет загружен.
			 * @type {Boolean}
			 */
			showMask: true,

			/**
			 * Объект конфигурации модуля.
			 * @type {Object}
			 */
			moduleConfig: null,

			/**
			 * Имя класса модели представления для вложенного модуля.
			 * @type {String}
			 */
			viewModelClassName: "Terrasoft.FiltersContainerViewModel",

			/**
			 * Имя класа генератога представления.
			 * @type {String}
			 */
			viewGeneratorClass: "Terrasoft.ViewGenerator",

			/**
			 * Тип фильтрации в быстрых фильтрах.
			 * @Type {Terrasoft.ComparisonType}
			 */
			stringColumnSearchComparisonType: Terrasoft.ComparisonType.START_WITH,

			/**
			 * Схема с которой работают фильтры модуля.
			 * @Type {Object}
			 */
			entitySchema: null,

			/**
			 * Название схемы с которой работают фильтры модуля.
			 * @Type {String}
			 */
			entitySchemaName: null,

			/**
			 * Схема групы с которой работают фильтры модуля.
			 * @Type {Object}
			 */
			folderEntitySchema: null,

			/**
			 * Схема таблицы принадлежности записей к групам с которой работают фильтры модуля.
			 * @Type {Object}
			 */
			inFolderEntitySchema: null,

			/**
			 * Флаг отображения фильтра тегов.
			 * @Type {Boolean}
			 */
			useTagModule: true,

			/**
			 * Схема таблицы тегов с которой работают фильтры модуля.
			 * @Type {Object}
			 */
			tagEntitySchema: null,

			/**
			 * Схема таблицы принадлежности записей к тегам с которой работают фильтры модуля.
			 * @Type {Object}
			 */
			inTagEntitySchema: null,

			/**
			 * Имя колонки объекта в схеме принадлежности записей к групам.
			 * @Type {String}
			 */
			entityColumnNameInFolderEntity: null,

			/**
			 * Имя колонки фильтрации по умолчанию.
			 * @Type {String}
			 */
			filterDefaultColumnName: null,

			/**
			 * Флаг отображения фильтра без выпадающего меню.
			 * @Type {Boolean}
			 */
			isShortFilterVisible: false,

			/**
			 * Сообщения модуля.
			 * @type {Object}
			 */
			messages: {
				/**
				 * @message RerenderQuickFilterModule
				 * Перерисовка модуля
				 * @param {String|Object} Контейнер для отрисовки.
				 */
				"RerenderQuickFilterModule": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message GetFolderEntitiesNames
				 * Запрашивает имена схем групп.
				 */
				"GetFolderEntitiesNames": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message GetShortFilterFieldsVisible
				 * Запрашивает признак отображения полей ввода данных для фильтра.
				 */
				"GetShortFilterFieldsVisible": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}
			},

			/**
			 * Объект с идентификаторами контейнеров.
			 * @type {Object}
			 */
			filtersViewItemsNames: null,

			/**
			 * Конфигурация фильтров.
			 * @type {Object}
			 */
			filtersConfig: null,

			/**
			 * Инициализирует значениня системных настроек в модуле.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст.
			 */
			initSysSettingsValues: function(callback, scope) {
				this.Terrasoft.SysSettings.querySysSettings(["StringColumnSearchComparisonType"],
					function(sysSettings) {
						var value = sysSettings.StringColumnSearchComparisonType;
						if (!this.Ext.isEmpty(value)) {
							this.stringColumnSearchComparisonType = value;
						}
						callback.call(scope);
					}, this);
			},

			/**
			 * Возвращает по имени необходимый для генерации модуль. Модуль должен быть ранее загруженным.
			 * @param {String} moduleName Имя модуля.
			 * @return {Object} Модуль.
			 */
			getModule: function(moduleName) {
				var module = require(moduleName);
				if (this.Ext.isFunction(module)) {
					module = this.Ext.create(module);
				}
				return module;
			},

			/**
			 * Загружает все необходимые для генерации модули фильтров.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			initFiltersModules: function(callback, scope) {
				var modulesNames = [];
				Terrasoft.each(this.moduleConfig, function(typeConfig) {
					modulesNames.push(typeConfig.viewConfigModuleName, typeConfig.viewModelConfigModuleName);
				}, this);
				Terrasoft.require(modulesNames, callback, scope);
			},

			/**
			 * Генерирует конфигурацию представлений фильтров.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация фильтров.
			 * @returns {Object} Конфигурация представлений фильтров.
			 */
			generateViewConfig: function(config) {
				var viewConfig = {};
				Terrasoft.each(this.moduleConfig, function(typeConfig, typeName) {
					var configPropertyName = typeConfig.configPropertyName;
					var configPropertyValue = config[configPropertyName];
					if (configPropertyValue) {
						var module = this.getModule(typeConfig.viewConfigModuleName);
						viewConfig[typeName] = module.generate(configPropertyValue);
					}
				}, this);
				return viewConfig;
			},

			/**
			 * Генерирует конфигурацию моделей представлений фильтров.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация фильтров.
			 * @returns {Object} Конфигурация моделей представлений фильтров.
			 */
			generateFiltersViewModelsConfig: function(config) {
				var viewModelConfig = {};
				Terrasoft.each(this.moduleConfig, function(typeConfig, typeName) {
					var configPropertyName = typeConfig.configPropertyName;
					var configPropertyValue = config[configPropertyName];
					if (configPropertyValue) {
						var module = this.getModule(typeConfig.viewModelConfigModuleName);
						viewModelConfig[typeName] = module.generate(configPropertyValue);
					}
				}, this);
				return viewModelConfig;
			},

			/**
			 * Инициализирует конфигурацию фильтров.
			 * @protected
			 * @virtual
			 */
			initFiltersConfig: function() {
				var entitySchema = this.entitySchema;
				var folderEntitySchema = this.folderEntitySchema;
				var inFolderEntitySchema = this.inFolderEntitySchema;
				var tagEntitySchema = this.tagEntitySchema;
				var inTagEntitySchema = this.inTagEntitySchema;
				var filtersViewItemsNames = this.filtersViewItemsNames;
				var entityColumnNameInFolderEntity = this.entityColumnNameInFolderEntity;
				var sandbox = this.sandbox;
				var hasFoldersEntities = (folderEntitySchema && inFolderEntitySchema);
				var isTagFiltersVisible = this.isTagFiltersVisible();
				var config = {
					quickFilterViewContainerName: filtersViewItemsNames.quickFilterViewContainerName,
					fixedFilterConfig: sandbox.publish("GetFixedFilterConfig", null, [sandbox.id]) || {},
					folderFilterConfig: hasFoldersEntities
						? sandbox.publish("GetFolderFilterConfig", null, [sandbox.id]) || {}
						: null,
					customFilterConfig: sandbox.publish("GetExtendedFilterConfig", null, [sandbox.id]) || {},
					tagFilterConfig: isTagFiltersVisible ? {} : null
				};
				var commonConfig = {
					Ext: this.Ext,
					sandbox: this.sandbox,
					entitySchema: entitySchema,
					folderEntitySchema: folderEntitySchema,
					inFolderEntitySchema: inFolderEntitySchema,
					entityColumnNameInFolderEntity: entityColumnNameInFolderEntity
				};
				Ext.apply(commonConfig, filtersViewItemsNames);
				if (config.fixedFilterConfig) {
					Ext.apply(config.fixedFilterConfig, commonConfig);
					Ext.apply(config.fixedFilterConfig, {
						filterChangedDefined: true
					});
				}
				if (config.folderFilterConfig) {
					Ext.apply(config.folderFilterConfig, commonConfig);
				}

				if (config.customFilterConfig) {
					Ext.apply(config.customFilterConfig, commonConfig);
					var customFilterConfig = config.customFilterConfig;
					if (customFilterConfig.replaceQuickFilterViewContainerName) {
						config.quickFilterViewContainerName = customFilterConfig.quickFilterViewContainerName;
					}
					Ext.apply(config.customFilterConfig, {
						quickFilterKey: "_" + entitySchema.name,
						StringColumnSearchComparisonType: this.stringColumnSearchComparisonType,
						filterDefaultColumnName: this.filterDefaultColumnName,
						isShortFilterVisible: this.isShortFilterVisible
					});
				}
				if (config.tagFilterConfig) {
					Ext.apply(config.tagFilterConfig, commonConfig);
					Ext.apply(config.tagFilterConfig, {
						isShortFilterVisible: this.isShortFilterVisible,
						values: {
							TagEntitySchemaName: tagEntitySchema.name,
							InTagEntitySchemaName: inTagEntitySchema.name
						}
					});
				}
				this.filtersConfig = config;
			},

			/**
			 * Проверяет наличие фильтров по тегу.
			 * @return {boolean} Видимость фильтров по тегу.
			 */
			isTagFiltersVisible: function() {
				if (this.useTagModule) {
					var tagEntitySchema = this.tagEntitySchema;
					var inTagEntitySchema = this.inTagEntitySchema;
					return (tagEntitySchema && inTagEntitySchema);
				} else {
					return false;
				}
			},

			/**
			 * Инициализирует схемы объектов, необходимых для фильтрации.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст.
			 */
			initFiltersEntitySchemas: function(callback, scope) {
				var entitySchema = this.getEntitySchema();
				this.entitySchema = entitySchema;
				this.initFoldersSchemas(function() {
					this.initFiltersConfig();
					callback.call(scope);
				}, this);
			},

			/**
			 * Инициализирует схемы объектов групп, необходимых для фильтрации.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст.
			 */
			initFoldersSchemas: function(callback, scope) {
				performanceManager.start("QuickFilterModuleV2_Init_requireSchemaFolder");
				var config = this.sandbox.publish("GetFolderEntitiesNames", null, [this.sandbox.id]) || {};
				var entitySchemaName = this.getSchemaName();
				var folderSchemaName = config.folderSchemaName || (entitySchemaName + "Folder");
				var inFolderSchemaName = config.inFolderSchemaName || (entitySchemaName + "InFolder");
				this.entityColumnNameInFolderEntity = config.entityColumnNameInFolderEntity || entitySchemaName;
				this.useTagModule = config.useTagModule;
				var tagSchemaName = config.tagSchemaName || (entitySchemaName + "Tag");
				var inTagSchemaName = config.inTagSchemaName || (entitySchemaName + "InTag");
				this.sandbox.requireModuleDescriptors(
					["find!" + folderSchemaName, "find!" + inFolderSchemaName,
						"find!" + tagSchemaName, "find!" + inTagSchemaName], function() {
						this.Terrasoft.require([folderSchemaName, inFolderSchemaName, tagSchemaName, inTagSchemaName],
							function(folderEntitySchema, inFolderEntitySchema, tagEntitySchema, inTagEntitySchema) {
								performanceManager.stop("QuickFilterModuleV2_Init_requireSchemaFolder");
								this.folderEntitySchema = folderEntitySchema;
								this.inFolderEntitySchema = inFolderEntitySchema;
								this.tagEntitySchema = tagEntitySchema;
								this.inTagEntitySchema = inTagEntitySchema;
								callback.call(scope);
							}, this);
					}, this);
			},

			/**
			 * Подписывает модель на сообщения sandbox c тэгом текущего модуля.
			 * @protected
			 * @virtual
			 * @param {String} messageName Название сообщения.
			 * @param {Function} handler Обработчик сообщения.
			 */
			internalSubscribe: function(messageName, handler) {
				var sandbox = this.sandbox;
				var sandboxId = sandbox.id;
				sandbox.subscribe(messageName, handler, this, [sandboxId]);
			},

			/**
			 * Выполняет подписки на сообщения песочницы.
			 * @protected
			 * @virtual
			 */
			subscribeSandboxEvents: function() {
				this.internalSubscribe("GetQuickFilter", function() {
					return this.viewModel.getFilters();
				});
				this.internalSubscribe("UpdateExtendedFilter", function(filter) {
					this.viewModel.clearFilterValue("CustomFilters", filter);
				});
				this.internalSubscribe("SetCustomFilters", function(filters) {
					var customFilterViewModel = this.viewModel.getFilterViewModel("CustomFilters");
					customFilterViewModel.setCustomFilters(filters);
				});
				this.internalSubscribe("GetFixedFilter", function(config) {
					var filterName = (config && config.filterName) || "";
					return this.viewModel.getFilterValue("FixedFilters", filterName);
				});
				this.internalSubscribe("UpdateFolderFilter", function(filter) {
					this.viewModel.clearFilterValue("FolderFilters", filter);
				});
				this.internalSubscribe("UpdateFavoritesMenu", function() {
					var customFilterViewModel = this.viewModel.getFilterViewModel("CustomFilters");
					customFilterViewModel.initFavouriteFolders();
				});
				this.internalSubscribe("IsSeparateMode", function(isSeparateMode) {
					var fixedFilterViewModel = this.viewModel.getFilterViewModel("FixedFilters");
					var customFilterViewModel = this.viewModel.getFilterViewModel("CustomFilters");
					var tagFilterViewModel = this.viewModel.getFilterViewModel("TagFilters");
					if (!Ext.isEmpty(fixedFilterViewModel)) {
						fixedFilterViewModel.set("IsSeparateMode", isSeparateMode);
						fixedFilterViewModel.updateButtonCaption("Owner");
					}
					if (!Ext.isEmpty(customFilterViewModel)) {
						customFilterViewModel.set("IsSeparateMode", isSeparateMode);
						customFilterViewModel.updateButtonCaption();
					}
					if (!Ext.isEmpty(tagFilterViewModel)) {
						tagFilterViewModel.set("IsSeparateMode", isSeparateMode);
						tagFilterViewModel.updateButtonCaption();
					}
				});
				this.internalSubscribe("CustomFilterExtendedModeClose", function() {
					var customFilterViewModel = this.viewModel.getFilterViewModel("CustomFilters");
					if (!Ext.isEmpty(customFilterViewModel)) {
						customFilterViewModel.set("isExtendedModeHidden", true);
						customFilterViewModel.set("isFoldersHidden", true);
						customFilterViewModel.set("ActiveFolder", null);
					}
				});
				this.internalSubscribe("HideFolderTree", function() {
					var customFilterViewModel = this.viewModel.getFilterViewModel("CustomFilters");
					if (!Ext.isEmpty(customFilterViewModel)) {
						customFilterViewModel.set("isExtendedModeHidden", true);
						customFilterViewModel.set("isFoldersHidden", true);
						customFilterViewModel.set("ActiveFolder", null);
					}
				});
				this.internalSubscribe("UpdateCustomFilterMenu", function(config) {
					var customFilterViewModel = this.viewModel.getFilterViewModel("CustomFilters");
					var sandbox = this.sandbox;
					if (config) {
						if (config.folder) {
							if (config.folder.wasNew &&
								config.folderType.value === "65ca0946-0084-4874-b117-c13199af3b95") {
								//todo
								// ConfigurationConstants.Folder.Type.Search) {
								config.folder.wasNew = false;
								sandbox.publish("CustomFilterExtendedMode", config, [sandbox.id]);
							}
							customFilterViewModel.set("ActiveFolder", config);
						}
						if (config.hasOwnProperty("isExtendedModeHidden")) {
							customFilterViewModel.set("isExtendedModeHidden", config.isExtendedModeHidden);
						}
						if (config.hasOwnProperty("isFoldersHidden")) {
							customFilterViewModel.set("isFoldersHidden", config.isFoldersHidden);
						}
						if (config.clearActiveFolder) {
							customFilterViewModel.set("ActiveFolder", null);
						}
					} else {
						customFilterViewModel.set("ActiveFolder", config);
					}
				});
				this.internalSubscribe("RerenderQuickFilterModule", this.reRender);
			},

			/**
			 * Инициализирует объект с идентификаторами контейнеров.
			 * @protected
			 * @virtual
			 */
			initFiltersViewItemsNames: function() {
				var sanboxId = this.sandbox.id;
				var filtersViewItemsNames = {
					customFilterContainerName: "customFilterContainer",
					folderFilterContainerName: "folderFilterContainer",
					quickFilterViewContainerName: "quickFilterViewContainer",
					simpleFilterEditContainerName: "simpleFilterEditContainer",
					folderFilterButtonContainerName: "folderFilterButtonContainer",
					customFilterButtonContainerName: "customFilterButtonContainer"
				};
				Terrasoft.each(filtersViewItemsNames, function(parameterValue, parameterName) {
					filtersViewItemsNames[parameterName] = parameterValue + "_" + sanboxId;
				});
				this.filtersViewItemsNames = filtersViewItemsNames;
			},

			/**
			 * Расширяет конфигурацию сообщений модуля.
			 * @protected
			 * @virtual
			 */
			registerMessages: function() {
				this.sandbox.registerMessages(this.messages);
			},

			/**
			 * Выполняет необходимые для перерисовки модуля действия.
			 * @protected
			 * @param {Object} config Объект с свойствами для установки.
			 * @param {String} config.renderTo Id контейнера куда будет грузится модуль.
			 */
			reRender: function(config) {
				var customFilterViewModel = this.viewModel.getFilterViewModel("CustomFilters");
				if (customFilterViewModel) {
					var simpleFilterEditContainerName = customFilterViewModel.get("simpleFilterEditContainerName");
					var addConditionView = Ext.getCmp(simpleFilterEditContainerName);
					if (addConditionView) {
						addConditionView.destroy();
					}
				}
				if (this.view) {
					this.view.destroy();
				}
				var container = this.Ext.get(config.renderTo);
				var rendered = this.canRender(container);
				this.render(container);
				return rendered;
			},

			/**
			 * Создает экземпляр класса Terrasoft.ViewGenerator.
			 * @return {Terrasoft.ViewGenerator} Возвращает объект Terrasoft.ViewGenerator.
			 */
			createViewGenerator: function() {
				return this.Ext.create(this.viewGeneratorClass);
			},

			/**
			 * Создает конфигурацию представления вложенного модуля.
			 * @protected
			 * @virtual
			 * param {Object} config Объект конфигурации.
			 * param {Function} callback Функция обратного вызова.
			 * param {Terrasoft.BaseModel} scope Контекст выполнения функции обратного вызова.
			 * @return {Object[]} Возвращает конфигурацию представления вложенного модуля.
			 */
			buildView: function(config, callback, scope) {
				var viewGenerator = this.createViewGenerator();
				var schema = {
					viewConfig: [{
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"name": this.filtersViewItemsNames.quickFilterViewContainerName
					}]
				};
				var viewConfig = Ext.apply({schema: schema}, config);
				viewConfig.schemaName = "";
				viewGenerator.generate(viewConfig, callback, scope);
			},

			/**
			 * Возвращает название схемы с которой работают фильтры.
			 * @protected
			 * @virtual
			 * @return {String} Название схемы с которой работают фильтры.
			 */
			getSchemaName: function() {
				return this.entitySchema.name;
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#initViewConfig
			 * @overridden
			 */
			initViewConfig: function(callback, scope) {
				var generatorConfig = Terrasoft.deepClone(this.moduleConfig) || {};
				generatorConfig.viewModelClass = this.viewModelClass;
				this.buildView(generatorConfig, function(view) {
					this.viewConfig = view[0];
					callback.call(scope);
				}, this);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#initViewModelClass
			 * @overridden
			 */
			initViewModelClass: function(callback, scope) {
				this.viewModelClass = this.Ext.ClassManager.get(this.viewModelClassName);
				callback.call(scope);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#getViewModelConfig
			 * @overridden
			 */
			getViewModelConfig: function() {
				var config = this.callParent(arguments);
				Ext.apply(config, {
					entitySchema: this.entitySchema,
					folderEntitySchema: this.folderEntitySchema,
					inFolderEntitySchema: this.inFolderEntitySchema,
					viewModelConfig: this.viewModelConfig,
					stringColumnSearchComparisonType: this.stringColumnSearchComparisonType
				});
				return config;
			},

			/**
			 * Инициализирует модуль.
			 * @overridden
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			init: function(callback, scope) {
				performanceManager.stop("QuickFilterModuleV2_BeforeLoad");
				performanceManager.start("QuickFilterModuleV2_Init");
				if (this.quickFilterModuleInited) {
					this.callParent(arguments);
				} else {
					this.initConfig();
					this.registerMessages();
					this.subscribeSandboxEvents();
					this.initFiltersViewItemsNames();
					Terrasoft.chain(
						this.initSysSettingsValues,
						this.initFiltersEntitySchemas,
						this.initFiltersModules,
						function(next) {
							var config = this.filtersConfig;
							this.viewModelConfig = this.generateFiltersViewModelsConfig(config);
							this.filtersViewConfigs = this.generateViewConfig(config);
							next();
						},
						function(next) {
							this.quickFilterModuleInited = true;
							this.init(next, this);
						},
						function() {
							var sandbox = this.sandbox;
							var sandboxId = sandbox.id;
							sandbox.publish("UpdateFilter", {filters: this.viewModel.getFilters()}, [sandboxId]);
							performanceManager.stop("QuickFilterModuleV2_Init");
							callback.call(scope);
						},
						this
					);
				}
			},

			/**
			 * Проверяет возможность отрисовки модуля.
			 * @private
			 * @param {String|Object} renderTo Контейнер, в который отрисовывается модуль.
			 * @return {Boolean} Возможность отрисовки модуля  в указанный контейер.
			 */
			canRender: function(renderTo) {
				return !(this.destroyed || (this.Ext.isObject(renderTo) && !renderTo.dom) ||
				(this.view && this.view.rendered));
			},

			/**
			 * Выполняет необходимые для отрисовки модуля действия.
			 * @overridden
			 * @param {String|Object} renderTo Контейнер, в который отрисовывается модуль.
			 */
			render: function(renderTo) {
				performanceManager.start("QuickFilterModuleV2_Render");
				if (!this.canRender(renderTo)) {
					this.hideLoadingMask();
					return;
				}
				performanceManager.start("QuickFilterModuleV2_FiltersChanged");
				performanceManager.start("QuickFilterModuleV2_Render_createViewModel");
				var filtersViewConfigs = this.filtersViewConfigs;
				var viewModel = this.viewModel;
				var quickFilterViewConfig = Terrasoft.deepClone(this.viewConfig);
				var view = this.view = this.Ext.create("Terrasoft.Container", quickFilterViewConfig);
				var filtersViewModels = viewModel.getFiltersViewModels();
				filtersViewModels.eachKey(function(filterName, filterViewModel) {
					var filterViewConfig = filtersViewConfigs[filterName];
					if (filterViewConfig) {
						var filterView = this.Ext.create("Terrasoft.Container",
							Terrasoft.deepClone(filterViewConfig));
						filterViewModel.suspendUpdate = true;
						filterView.bind(filterViewModel);
						filterViewModel.suspendUpdate = false;
						view.items.add(filterView.id, filterView);
					}
				}, this);
				view.render(renderTo);
				this.hideLoadingMask();

				var customFilterViewModel = this.viewModel.getFilterViewModel("CustomFilters");
				if (customFilterViewModel) {
					customFilterViewModel.updateFiltersOnReturn();
				}
				var fixedFilterViewModel = this.viewModel.getFilterViewModel("FixedFilters");
				if (fixedFilterViewModel) {
					fixedFilterViewModel.updateFiltersOnReturn();
				}

				performanceManager.stop("QuickFilterModuleV2_Render_createViewModel");
				performanceManager.stop("QuickFilterModuleV2_Render");
				performanceManager.setTimeStamp("loadAdditionalModulesComplete");
				this.showCustomFilterEdit();
			},

			/**
			 * Выполняет отображение полей ввода быстроо фильтра в детали.
			 **/
			showQuickFilter: function() {
				var filterViewModel = this.viewModel.getFilterViewModel("CustomFilters");
				if (filterViewModel !== null) {
					filterViewModel.addSimpleFilter();
				}
			},

			/**
			 * Выполняет проверку на наличие загруженного модуля фильтрации и отображает поле
			 * редактирования фильтра.
			 */
			showCustomFilterEdit: function() {
				var isShortFilterFieldsVisible = this.getShortFilterFieldsVisible();
				if (isShortFilterFieldsVisible) {
					this.showQuickFilter();
				}
			},
			/**
			 * Инициализирует объект конфигурации модуля.
			 * @protected
			 * @virtual
			 */
			initConfig: function() {
				this.moduleConfig = {
					FixedFilters: {
						viewConfigModuleName: "FixedFilterViewV2",
						viewModelConfigModuleName: "FixedFilterViewModelV2",
						configPropertyName: "fixedFilterConfig"
					},
					CustomFilters: {
						viewConfigModuleName: "CustomFilterViewV2",
						viewModelConfigModuleName: "CustomFilterViewModelV2",
						configPropertyName: "customFilterConfig"
					},
					FolderFilters: {
						viewConfigModuleName: "FolderFilterViewV2",
						viewModelConfigModuleName: "FolderFilterViewModelV2",
						configPropertyName: "folderFilterConfig"
					},
					TagFilters: {
						viewConfigModuleName: "TagFilterViewGeneratorV2",
						viewModelConfigModuleName: "TagFilterViewModelGeneratorV2",
						configPropertyName: "tagFilterConfig"
					}
				};
			},

			/**
			 * Получает схему сущности для работы фильтра.
			 * @protected
			 */
			getEntitySchema: function() {
				var entitySchema = null;
				var sandbox = this.sandbox;
				var entitySchemaConfig = sandbox.publish("GetModuleSchema", null, [sandbox.id]);
				if (Ext.isEmpty(entitySchemaConfig)) {
					entitySchema = sandbox.publish("GetSectionEntitySchema", null);
				} else {
					if (entitySchemaConfig.hasOwnProperty("isShortFilterVisible") &&
						entitySchemaConfig.hasOwnProperty("filterDefaultColumnName")) {
						this.isShortFilterVisible = entitySchemaConfig.isShortFilterVisible;
						this.filterDefaultColumnName = entitySchemaConfig.filterDefaultColumnName;
						entitySchema = entitySchemaConfig.entitySchema;
					} else {
						entitySchema = entitySchemaConfig;
					}
				}
				return entitySchema;
			},

			/**
			 * Возвращает признак отображения полей ввода данных для фильтра.
			 * @protected
			 * @return {Boolean} Признак отображения полей ввода данных для фильтра.
			 */
			getShortFilterFieldsVisible: function() {
				var sandbox = this.sandbox;
				var isShortFilterVisible = sandbox.publish("GetShortFilterFieldsVisible", null, [sandbox.id]);
				if (Ext.isEmpty(isShortFilterVisible)) {
					isShortFilterVisible = false;
				}
				return isShortFilterVisible;
			}
		});
		return quickFilterModule;
	});
