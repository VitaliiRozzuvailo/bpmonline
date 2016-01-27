define("FilterEditModule", ["ext-base", "FilterEditModuleResources"],
	function(Ext, resources) {

		/**
		 * @class Terrasoft.configuration.FilterEditModuleViewModel
		 * Это класс, который используется для создания модели представления модуля фильров.
		 */
		Ext.define("Terrasoft.configuration.FilterEditModuleViewModel", {
			extend: "Terrasoft.BaseModel",
			alternateClassName: "Terrasoft.FilterEditModuleViewModel",

			/**
			 * Подписывается на сообщения.
			 * @protected
			 * @virtual
			 */
			subscribeForMessages: function() {
				var sandboxId = this.sandbox.id;
				this.sandbox.subscribe("SetFilterModuleConfig", this.setFilterModuleConfig, this, [sandboxId]);
				this.sandbox.subscribe("GetFilters", this.getFiltersManagerFilter, this, [sandboxId]);
				this.sandbox.subscribe("FilterActionFired", this.onFilterActionFired, this, [sandboxId]);
			},

			/**
			 * Устанавливает объект настройки модуля фильтров.
			 * @protected
			 * @virtual
			 * @param {Object} filterModuleConfig Конфигурационный объект модуля фильтра.
			 * @param {String} filterModuleConfig.rootSchemaName Имя схемы.
			 * @param {String} filterModuleConfig.filters Сериализированные данные фильтров.
			 * @param {Boolean} filterModuleConfig.actionsVisible Признак видимости кнопок управления.
			 */
			setFilterModuleConfig: function(filterModuleConfig) {
				if (!filterModuleConfig) {
					return;
				}
				var oldRootSchemaName = this.get("rootSchemaName");
				var rootSchemaName = filterModuleConfig.rootSchemaName;
				if (Ext.isDefined(rootSchemaName) && rootSchemaName !== oldRootSchemaName) {
					this.destroyFilterManager();
					this.destroyFilterProvider();
					if (rootSchemaName) {
						this.createFilterManager(rootSchemaName);
					}
					this.set("rootSchemaName", rootSchemaName);
				}
				var filters = !Ext.isEmpty(filterModuleConfig.filters) && Ext.isString(filterModuleConfig.filters)
					? Terrasoft.deserialize(filterModuleConfig.filters)
					: null;
				this.setFilters(filters);
				var actionsVisible = filterModuleConfig.actionsVisible;
				if (Ext.isDefined(actionsVisible)) {
					this.set("actionsVisible", actionsVisible);
				}
			},

			/**
			 * Устанавливает фильтры.
			 * @protected
			 * @virtual
			 * @param {Terrasoft.FilterGroup} filters Группа фильтров.
			 */
			setFilters: function(filters) {
				var filterManager = this.get("filterManager");
				if (filterManager) {
					filterManager.setFilters(filters || Ext.create("Terrasoft.FilterGroup"));
				}
			},

			/**
			 * Создает менеджер фильтров.
			 * @protected
			 * @virtual
			 * @param {String} rootSchemaName Имя схемы.
			 */
			createFilterManager: function(rootSchemaName) {
				var provider = this.Ext.create("Terrasoft.EntitySchemaFilterProvider", {
					rootSchemaName: rootSchemaName
				});
				var filterManager = Ext.create("Terrasoft.FilterManager", {
					provider: provider,
					rootSchemaName: rootSchemaName
				});
				filterManager.setFilters(Ext.create("Terrasoft.FilterGroup"));
				filterManager.on("addFilter", this.onFiltersChanged, this);
				filterManager.on("removeFilter", this.onFiltersChanged, this);
				filterManager.on("changeFilter", this.onFiltersChanged, this);
				filterManager.on("rootFiltersChanged", this.onFiltersChanged, this);
				this.set("filterManager", filterManager);
				this.set("filterProvider", provider);
			},

			/**
			 * Уничтожает менеджер фильтров.
			 * @protected
			 * @virtual
			 */
			destroyFilterManager: function() {
				var filterManager = this.get("filterManager");
				if (filterManager) {
					filterManager.un("addFilter", this.onFiltersChanged, this);
					filterManager.un("removeFilter", this.onFiltersChanged, this);
					filterManager.un("changeFilter", this.onFiltersChanged, this);
					filterManager.un("rootFiltersChanged", this.onFiltersChanged, this);
					filterManager.destroy();
					this.set("filterManager", null);
				}
			},

			/**
			 * Уничтожает провайдер фильтров.
			 * @protected
			 * @virtual
			 */
			destroyFilterProvider: function() {
				var filterProvider = this.get("filterProvider");
				if (filterProvider) {
					filterProvider.destroy();
					this.set("filterProvider", null);
				}
			},

			/**
			 * Обрабатывает нажатие кнопок управления.
			 * @protected
			 * @virtual
			 * @param {String} key.
			 */
			onFilterActionFired: function(key) {
				switch (key) {
					case "group":
						this.groupItems();
						break;
					case "ungroup":
						this.unGroupItems();
						break;
					case "up":
						this.moveUp();
						break;
					case "down":
						this.moveDown();
						break;
				}
			},

			/**
			 * Группирует элементы.
			 * @protected
			 * @virtual
			 */
			groupItems: function() {
				var filterManager = this.get("filterManager");
				filterManager.groupFilters(this.getFiltersArray());
				this.onSelectedFilterChange();
			},

			/**
			 * Разгруппирует элементы.
			 * @protected
			 * @virtual
			 */
			unGroupItems: function() {
				var filterManager = this.get("filterManager");
				filterManager.unGroupFilters(this.getSelectedFilter());
				this.onSelectedFilterChange();
			},

			/**
			 * Перемещает элемент вверх.
			 * @protected
			 * @virtual
			 */
			moveUp: function() {
				var filterManager = this.get("filterManager");
				filterManager.moveUp(this.getSelectedFilter());
				this.onSelectedFilterChange();
			},

			/**
			 * Перемещает элемент вниз.
			 * @protected
			 * @virtual
			 */
			moveDown: function() {
				var filterManager = this.get("filterManager");
				filterManager.moveDown(this.getSelectedFilter());
				this.onSelectedFilterChange();
			},

			/**
			 * Обработчик смены выбранного элемента.
			 * @protected
			 * @virtual
			 */
			onSelectedFilterChange: function() {
				var filter = this.getSelectedFilter();
				var rootFilter = this.get("filterManager").filters;
				var notRootFilter = !Ext.isEmpty(filter) && (filter !== rootFilter);
				var notFirstFilter = rootFilter.indexOf(filter) !== 0;
				var notLastFilter = rootFilter.indexOf(filter) !== (rootFilter.getCount() - 1);
				this.set("groupButtonVisible", notRootFilter);
				this.set("unGroupButtonVisible", notRootFilter &&
					(filter instanceof Terrasoft.data.filters.FilterGroup));
				this.set("moveUpButtonVisible", notRootFilter && notFirstFilter);
				this.set("moveDownButtonVisible", notRootFilter && notLastFilter);
				this.fireEnableChanged();
			},

			/**
			 * Устанавливает состояния кнопок.
			 * @protected
			 * @virtual
			 */
			fireEnableChanged: function() {
				var enableConfig = {
					groupBtnState: this.get("groupButtonVisible"),
					unGroupBtnState: this.get("unGroupButtonVisible"),
					moveUpBtnState: this.get("moveUpButtonVisible"),
					moveDownBtnState: this.get("moveDownButtonVisible")
				};
				this.sandbox.publish("FilterActionsEnabledChanged", enableConfig);
			},

			/**
			 * Формирует массив фильтров.
			 * @protected
			 * @virtual
			 * @return filtersArray Массив фильтров.
			 */
			getFiltersArray: function() {
				var selectedItems = this.get("selectedFilters");
				return Ext.Object.getValues(selectedItems);
			},

			/**
			 * Возвращает выбранный фильтр.
			 * @protected
			 * @virtual
			 * @return {Object} Выбранный фильтр.
			 */
			getSelectedFilter: function() {
				var filtersArray = this.getFiltersArray() || [];
				return (filtersArray.length > 0) ? filtersArray[0] : null;
			},

			/**
			 * Обработчик изменения фильтра.
			 * @protected
			 * @virtual
			 */
			onFiltersChanged: function() {
				var changed = this.getFiltersManagerFilter();
				this.sandbox.publish("OnFiltersChanged", changed, [this.sandbox.id]);
			},

			/**
			 * Возвращает объект фильтра.
			 * @protected
			 * @virtual
			 * @return {Object} filters.
			 */
			getFiltersManagerFilter: function() {
				var filterManager = this.get("filterManager");
				var filters = {
					filter: filterManager.filters,
					serializedFilter: filterManager.serializeFilters()
				};
				return filters;
			},

			/**
			 * Уничтожает менеджер и провайдер фильров.
			 * @protected
			 * @virtual
			 */
			destroy: function() {
				this.destroyFilterManager();
				this.destroyFilterProvider();
				this.callParent(arguments);
			}

		});

		/**
		 * @class Terrasoft.configuration.FilterEditModule
		 * Класс модуля фильтра.
		 */
		var filterEditModule = Ext.define("Terrasoft.configuration.FilterEditModule", {

			extend: "Terrasoft.BaseModule",

			alternateClassName: "Terrasoft.FilterEditModule",

			isAsync: true,

			EntitySchemaFilterProviderModule: null,

			viewModel: null,

			Ext: null,

			Terrasoft: null,

			sandbox: null,

			/**
			 * Создает модель представления.
			 * @protected
			 * @virtual
			 * @return {Object} Возвращает экземпляр модели представления модуля.
			 */
			createViewModel: function() {
				return this.Ext.create("Terrasoft.FilterEditModuleViewModel", {
					values: {
						/**
						 * Имя схемы.
						 * @private
						 * @type {String}
						 */
						rootSchemaName: null,
						/**
						 * Признак видимости кнопок управления.
						 * @private
						 * @type {Boolean}
						 */
						actionsVisible: true,
						/**
						 * Признак активности кнопки группировки.
						 * @private
						 * @type {Boolean}
						 */
						groupButtonVisible: true,
						/**
						 * Признак активности кнопки разгруппировки.
						 * @private
						 * @type {Boolean}
						 */
						unGroupButtonVisible: true,
						/**
						 * Признак активности кнопки вверх.
						 * @private
						 * @type {Boolean}
						 */
						moveUpButtonVisible: true,
						/**
						 * Признак активности кнопки вниз.
						 * @private
						 * @type {Boolean}
						 */
						moveDownButtonVisible: true,
						/**
						 * Менеджер фильтра
						 * @private
						 * @type {Object}
						 */
						filterManager: null,
						/**
						 * Выбранный фильтр.
						 * @private
						 * @type {Object}
						 */
						selectedFilters: null,
						/**
						 * Провайдер фильтра.
						 * @private
						 * @type {Object}
						 */
						filterProvider: null
					}
				});
			},

			/**
			 * Выполняет инициализацию модели представления.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст функции обратного вызова.
			 */
			init: function(callback, scope) {
				if (!this.EntitySchemaFilterProviderModule) {
					var map = {};
					map.EntitySchemaFilterProviderModule = {
						sandbox: "sandbox_" + this.sandbox.id,
						"ext-base": "ext_" + Ext.id
					};
					requirejs.config({
						map: map
					});
					this.Terrasoft.require(["EntitySchemaFilterProviderModule"], function(providerModule) {
						if (this.destroyed) {
							return;
						}
						this.EntitySchemaFilterProviderModule = providerModule;
						callback.call(scope);
					}, this);
				} else {
					callback.call(scope);
				}
			},

			/**
			 * Выполняет прорисовку модуля в контейнер.
			 * @param {Ext.Element} renderTo.
			 */
			render: function(renderTo) {
				var viewModel;
				if (!this.viewModel) {
					var filterModuleConfig = this.sandbox.publish("GetFilterModuleConfig", null, [this.sandbox.id]);
					viewModel = this.viewModel = this.createViewModel();
					viewModel.sandbox = this.sandbox;
					viewModel.Ext = this.Ext;
					viewModel.Terrasoft = this.Terrasoft;
					if (filterModuleConfig) {
						viewModel.setFilterModuleConfig(filterModuleConfig);
					}
					viewModel.subscribeForMessages();
				} else {
					viewModel = this.viewModel;
				}
				var renderToName = renderTo.id;
				var view = this.getView(renderToName);
				view.render(renderTo);
				view.bind(viewModel);
			},

			/**
			 * Создает экземпляр представления
			 * @protected
			 * @virtual
			 * @return {Terrasoft.Container} Возвращает экземпляр представления
			 */
			getView: function(parentContainerName) {
				return this.Ext.create("Terrasoft.Container", {
					id: parentContainerName + "FilterContainer",
					selectors: {
						wrapEl: "#" + parentContainerName + "FilterContainer"
					},
					items: [
						{
							className: "Terrasoft.Container",
							id: parentContainerName + "FilterContainerToolbar",
							selectors: {
								wrapEl: "#" + parentContainerName + "FilterContainerToolbar"
							},
							items: [
								{
									className: "Terrasoft.Button",
									caption: resources.localizableStrings.ActionsButtonCaption,
									style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
									visible: { bindTo: "actionsVisible" },
									menu: {
										items: [
											{
												className: "Terrasoft.MenuItem",
												caption: resources.localizableStrings.GroupMenuItemCaption,
												click: {
													bindTo: "groupItems"
												},
												enabled: {
													bindTo: "groupButtonVisible"
												}
											},
											{
												className: "Terrasoft.MenuItem",
												caption: resources.localizableStrings.UnGroupMenuItemCaption,
												click: {
													bindTo: "unGroupItems"
												},
												enabled: {
													bindTo: "unGroupButtonVisible"
												}
											},
											{
												className: "Terrasoft.MenuItem",
												caption: resources.localizableStrings.MoveUpMenuItemCaption,
												click: {
													bindTo: "moveUp"
												},
												enabled: {
													bindTo: "moveUpButtonVisible"
												}
											},
											{
												className: "Terrasoft.MenuItem",
												caption: resources.localizableStrings.MoveDownMenuItemCaption,
												click: {
													bindTo: "moveDown"
												},
												enabled: {
													bindTo: "moveDownButtonVisible"
												}
											}
										]
									}
								}
							]
						},
						{
							className: "Terrasoft.FilterEdit",
							filterManager: {
								bindTo: "filterManager"
							},
							selectedItems: {
								bindTo: "selectedFilters"
							},
							selectedFiltersChange: {
								bindTo: "onSelectedFilterChange"
							}
						}
					],
					visible: {
						bindTo: "rootSchemaName",
						bindConfig: {
							converter: function(value) {
								return Boolean(value);
							}
						}
					}
				});
			},

			/**
			 * Деструктор класса.
			 * @protected
			 * @virtual
			 */
			destroy: function(config) {
				if (config.keepAlive) {
					return;
				}
				if (this.viewModel) {
					this.viewModel.destroy();
				}
				this.EntitySchemaFilterProviderModule = null;
				requirejs.undef("EntitySchemaFilterProviderModule");
			}
		});

		return filterEditModule;
	});