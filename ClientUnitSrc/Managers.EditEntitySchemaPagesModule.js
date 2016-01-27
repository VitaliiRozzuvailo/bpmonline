define("EditEntitySchemaPagesModule", ["EditEntitySchemaPagesModuleResources", "ContainerList",
		"ContainerListGenerator", "SysModuleEntityManager", "BaseNestedModule", "SysModuleEditManager"],
	function(resources) {

		//Заготовка на модуль настройки страниц схемы.




		/**
		 * @class Terrasoft.configuration.EntitySchemaPageModel
		 *
		 */
		Ext.define("Terrasoft.configuration.EntitySchemaPageModel", {
			extend: "Terrasoft.BaseViewModel",
			alternateClassName: "Terrasoft.EntitySchemaPageModel",

			sandbox: null,

			Ext: null,

			/**
			 *
			 * @type {Object}
			 */
			managerItem: null,

			/**
			 * Инициализирует модель значениями ресурсов из объекта ресурсов.
			 * @protected
			 * @virtual
			 * @param {Object} resourcesObj Объект ресурсов.
			 */
			initResourcesValues: function(resourcesObj) {
				var resourcesSuffix = "Resources";
				Terrasoft.each(resourcesObj, function(resourceGroup, resourceGroupName) {
					resourceGroupName = resourceGroupName.replace("localizable", "");
					Terrasoft.each(resourceGroup, function(resourceValue, resourceName) {
						var viewModelResourceName = [resourcesSuffix, resourceGroupName, resourceName].join(".");
						this.set(viewModelResourceName, resourceValue);
					}, this);
				}, this);
			},

			/**
			 * Инициализирует отображаемое значение для элемента.
			 * @protected
			 * @virtual
			 */
			getCaption: function() {
				var pageCaption = this.managerItem.pageCaption;
				return pageCaption || this.get("Resources.Strings.DefaultItemLabel");
			},

			init: function(callback, scope) {
				this.loadSchemaName(callback, scope);
			},

			getSchemaFilters: function() {
				var filters = this.Ext.create("Terrasoft.FilterGroup");
				filters.addItem(Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL,
					"SysWorkspace",
					Terrasoft.SysValue.CURRENT_WORKSPACE.value
				));
				filters.addItem(Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL,
					"ManagerName",
					"ClientUnitSchemaManager"
				));
				var cardSchemaUId = this.managerItem.cardSchemaUId;
				filters.addItem(Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL,
					"UId",
					cardSchemaUId
				));
				return filters;
			},

			validate: function() {
				return true;
			},

			save: function() {

			},

			loadSchemaName: function(callback, scope) {
				if (!this.managerItem || !this.managerItem.cardSchemaUId) {
					callback.call(scope);
					return;
				}
				var query = this.Ext.create("Terrasoft.EntitySchemaQuery", {
					"rootSchemaName": "VwSysSchemaInfo"
				});
				query.addColumn("UId");
				query.addColumn("Name");
				query.addColumn("Caption");
				query.filters.addItem(this.getSchemaFilters());
				query.getEntityCollection(function(response) {
					if (response.success && !response.collection.isEmpty()) {
						var item = response.collection.getByIndex(0);
						var values = item.values;
						Ext.apply(values, {
							value: values.UId,
							displayValue: values.Caption
						});
						this.set("ClientUnitSchema", values);
					}
					callback.call(scope);
				}, this);
			},

			/**
			 * Создает объект, инициализирует его свойства.
			 * @overridden
			 */
			constructor: function() {
				this.callParent(arguments);
				var managerItem = this.managerItem;
				this.initResourcesValues(resources);
				if (managerItem) {
					this.set("id", managerItem.getId());
				}

			}
		});

		/**
		 * @class Terrasoft.configuration.EditEntitySchemaPagesModuleViewModel
		 * Класс модели представления модуля графика.
		 */
		Ext.define("Terrasoft.configuration.EditEntitySchemaPagesModuleViewModel", {
			extend: "Terrasoft.BaseViewModel",
			alternateClassName: "Terrasoft.EditEntitySchemaPagesModuleViewModel",

			Ext: null,
			sandbox: null,
			Terrasoft: null,

			columns: {
				"ClientUnitSchema": {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isLookup: true,
					referenceSchema: {
						name: "VwSysSchemaInfo",
						primaryColumnName: "Name",
						primaryDisplayColumnName: "Caption"
					},
					referenceSchemaName: "VwSysSchemaInfo"
				}
			},

			/**
			 * Схема объекта для модели представления модуля.
			 * @type {Terrasoft.BaseEntitySchema}
			 */
			entitySchema: Ext.create("Terrasoft.BaseEntitySchema", {
				columns: {},
				primaryColumnName: "Id"
			}),

			constructor: function() {
				this.callParent(arguments);
				this.initResourcesValues(resources);
			},

			/**
			 * Инициализирует модель значениями ресурсов из объекта ресурсов.
			 * @protected
			 * @virtual
			 * @param {Object} resourcesObj Объект ресурсов.
			 */
			initResourcesValues: function(resourcesObj) {
				var resourcesSuffix = "Resources";
				Terrasoft.each(resourcesObj, function(resourceGroup, resourceGroupName) {
					resourceGroupName = resourceGroupName.replace("localizable", "");
					Terrasoft.each(resourceGroup, function(resourceValue, resourceName) {
						var viewModelResourceName = [resourcesSuffix, resourceGroupName, resourceName].join(".");
						this.set(viewModelResourceName, resourceValue);
					}, this);
				}, this);
			},

			loadEntityPages: function(sysEntitySchemaUId, callback, scope) {
				Terrasoft.chain(
					function(next) {
						Terrasoft.SysModuleEntityManager.findItemsByEntitySchemaUId(sysEntitySchemaUId, next, scope);
					},
					function(next, sysModuleEntityManagerItems) {
						var sysModuleEntityManagerItem = sysModuleEntityManagerItems.getByIndex(0);
						if (sysModuleEntityManagerItem) {
							sysModuleEntityManagerItem.getSysModuleEditManagerItems(next, this);
						} else {
							next();
						}
					},
					function(next, sysModuleEditManagerItems) {
						if (callback) {
							callback.call(scope || this, sysModuleEditManagerItems);
						}
					},
					this
				);
			},

			initPagesCollection: function(sysModuleEditManagerItems, callback, scope) {
				var pageCollection = this.Ext.create("Terrasoft.BaseViewModelCollection");
				this.set("PagesCollection", pageCollection);

				if (sysModuleEditManagerItems && !sysModuleEditManagerItems.isEmpty()) {
					sysModuleEditManagerItems.each(function(managerItem) {
						var newItem = this.Ext.create("Terrasoft.EntitySchemaPageModel", {
							managerItem: managerItem,
							sandbox: this.sandbox,
							Ext: this.Ext
						});
						newItem.init(Terrasoft.emptyFn, this);
						pageCollection.add(managerItem.id, newItem);
					}, this);
					callback.call(callback, scope);
				} else {
					Terrasoft.SysModuleEditManager.createItem({
						id: Terrasoft.generateGUID()
					}, function(managerItem) {
						var newItem = this.Ext.create("Terrasoft.EntitySchemaPageModel", {
							managerItem: managerItem,
							sandbox: this.sandbox,
							Ext: this.Ext
						});
						newItem.init(Terrasoft.emptyFn, this);
						pageCollection.add(managerItem.id, newItem);
						callback.call(callback, scope);
					}, this);
				}
			},

			/**
			 * Инициализирует начальные значения модели.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			init: function(callback, scope) {
				//var sysEntitySchemaUId = "C82AB6F0-0E36-4376-9AB3-C583D714B7B6";
				var sysEntitySchemaUId = "c449d832-a4cc-4b01-b9d5-8a12c42a9f89";

				Terrasoft.chain(function(next) {
						Terrasoft.SysModuleEntityManager.initialize(null, next, this);
					},
					function(next) {
						this.loadEntityPages(sysEntitySchemaUId, next, this);
					},
					function(next, sysModuleEditManagerItems) {
						this.initPagesCollection(sysModuleEditManagerItems, next, this);
					},
					function() {
						if (callback) {
							callback.call(scope || this, this);
						}
					},
					this
				);
			},
			onRender: function() {

			}

		});

		/**
		 * @class Terrasoft.configuration.EditEntitySchemaPagesModuleViewConfig
		 * Класс генерирующий конфигурацию представления модуля графика.
		 */
		Ext.define("Terrasoft.configuration.EditEntitySchemaPagesModuleViewConfig", {
			extend: "Terrasoft.BaseObject",
			alternateClassName: "Terrasoft.EditEntitySchemaPagesModuleViewConfig",

			diff: [
				{
					"operation": "insert",
					"name": "PagesCollection",
					"values": {
						"idProperty": "id",
						"collection": { "bindTo": "PagesCollection" },
						"generator": "ContainerListGenerator.generatePartial",
						"itemType": Terrasoft.ViewItemType.GRID,
						"itemConfig": [{
							"itemType": Terrasoft.ViewItemType.MODEL_ITEM,
							"name": "ClientUnitSchema",
							"labelConfig": {
								"caption": { "bindTo": "getCaption" }
							}
						}]
					}
				}
			],

			/**
			 * Генерирует конфигурацию представления графика.
			 * @returns {Object[]} Возвращает конфигурацию представления графика.
			 */
			generate: function() {
				var viewConfig = [];
				return Terrasoft.JsonApplier.applyDiff(viewConfig, this.diff);
			}

		});

		/**
		 * @class Terrasoft.configuration.ChartModule
		 * Класс модуля графика.
		 */
		Ext.define("Terrasoft.configuration.EditEntitySchemaPagesModule", {
			alternateClassName: "Terrasoft.EditEntitySchemaPagesModule",
			extend: "Terrasoft.BaseNestedModule",

			Ext: null,
			sandbox: null,
			Terrasoft: null,
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
			viewModelClassName: "Terrasoft.EditEntitySchemaPagesModuleViewModel",

			/**
			 * Имя класа генератога конфигурации представления вложенного модуля.
			 * @type {String}
			 */
			viewConfigClassName: "Terrasoft.EditEntitySchemaPagesModuleViewConfig",

			/**
			 * Имя класа генератога представления.
			 * @type {String}
			 */
			viewGeneratorClass: "Terrasoft.ViewGenerator",

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
				var viewClass = this.Ext.create(this.viewConfigClassName);
				var schema = {
					viewConfig: viewClass.generate()
				};
				var viewConfig = Ext.apply({
					schema: schema
				}, config);
				viewConfig.schemaName = "";
				viewGenerator.generate(viewConfig, callback, scope);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#initViewConfig
			 * @overridden
			 */
			initViewConfig: function(callback, scope) {
				var generatorConfig = {};
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
			}

		});

		return Terrasoft.EditEntitySchemaPagesModule;
	});