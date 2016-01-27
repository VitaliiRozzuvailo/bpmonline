define("ColumnSettings", ["ColumnSettingsResources"],
	function(resources) {
		/**
		 * @class Terrasoft.configuration.ColumnSettings
		 * Класс ColumnSettings предназначен для настройки свойств колонки реестра
		 */
		Ext.define("Terrasoft.configuration.ColumnSettings", {
			alternateClassName: "Terrasoft.ColumnSettings",
			extend: "Terrasoft.BaseSchemaModule",

			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 * Модель представления модуля настройки колонок
			 * @private
			 * @type {Object}
			 */
			viewModel: null,

			/**
			 * Флаг, который указывает проинициализирован ли провайдер
			 * @private
			 * @type {Boolean}
			 */
			isProviderInitialized: false,

			/**
			 * Флаг, который указывает проинициализирована ли уже модель
			 * @private
			 * @type {Boolean}
			 */
			isInitialized: false,

			/**
			 * Менеджер Фильтров
			 * @private
			 * @type {Object}
			 */
			filterManager: null,

			/**
			 * entitySchemaProvider
			 * @private
			 * @type {Object}
			 */
			entitySchemaProvider: null,

			/**
			 * Наименование схемы колоноки
			 * @private
			 * @type {String}
			 */
			schemaName: "",

			/**
			 * Конфигурация колонок
			 * @private
			 * @type {Object}
			 */
			columnInfo: null,

			/**
			 * Создает представление модели модуля настройки колонок.
			 * @param {Ext.Element} renderTo Заданый контейнер для отрисовки.
			 * @return {Container|*} Возвращает представление модели модуля настройки колонок.
			 */
			createView: function(renderTo) {
				var view = this.Ext.create("Terrasoft.Container", {
					renderTo: renderTo,
					id: "columnSettingsContainer",
					selectors: {
						el: "#columnSettingsContainer",
						wrapEl: "#columnSettingsContainer"
					},
					classes: {
						wrapClassName: ["column-settings-container"]
					},
					items: [
						{
							className: "Terrasoft.Container",
							id: "topSettings",
							selectors: {
								wrapEl: "#topSettings"
							},
							classes: {
								wrapClassName: ["top-settings-container"]
							},
							items: [
								{
									id: "SaveButton",
									tag: "SaveButton",
									className: "Terrasoft.Button",
									style: Terrasoft.controls.ButtonEnums.style.GREEN,
									caption: resources.localizableStrings.SaveButtonCaption,
									click: {
										bindTo: "saveButtonClick"
									}
								},
								{
									id: "CancelButton",
									className: "Terrasoft.Button",
									style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
									caption: resources.localizableStrings.CancelButtonCaption,
									classes: {
										textClass: ["cancel-button"]
									},
									click: {
										bindTo: "cancelButtonClick"
									}
								}
							]
						},
						{
							className: "Terrasoft.Container",
							id: "columnPropertiesSettingsContainer",
							selectors: {
								wrapEl: "#columnPropertiesSettingsContainer"
							},
							classes: {
								wrapClassName: ["column-properties-settings-container"]
							},
							items: [
								{
									className: "Terrasoft.Container",
									id: "leftColumnSettingsContainer",
									selectors: {
										wrapEl: "#leftColumnSettingsContainer"
									},
									classes: {
										wrapClassName: ["left-column-settings-container"]
									},
									items: [
										{
											className: "Terrasoft.Label",
											caption: resources.localizableStrings.ColumnCaption,
											classes: {
												labelClass: ["column-caption-label"]
											}
										},
										{
											className: "Terrasoft.Container",
											id: "columnCaptionContainer",
											selectors: {
												wrapEl: "#columnCaptionContainer"
											},
											items: [
												{
													id: "columnCaptionLabel",
													className: "Terrasoft.Label",
													caption: {
														bindTo: "columnCaption"
													},
													classes: {
														labelClass: ["column-caption-label-value"]
													}
												}
											]
										},
										{
											className: "Terrasoft.Label",
											caption: resources.localizableStrings.TitleCaption,
											classes: {
												labelClass: ["title-label"]
											}
										},
										{
											id: "titleEdit",
											className: "Terrasoft.TextEdit",
											value: {bindTo: "titleValue"}
										},
										{
											className: "Terrasoft.Container",
											id: "hideTitleSettings",
											selectors: {
												wrapEl: "#hideTitleSettings"
											},
											classes: {
												wrapClassName: ["hide-title-settings-container"]
											},
											visible: {bindTo: "isTiled"},
											items: [
												{
													id: "isCaptionHiddenEdit",
													className: "Terrasoft.CheckBoxEdit",
													checked: {bindTo: "isCaptionHidden"}
												},
												{
													id: "hideCaptionLabel",
													className: "Terrasoft.Label",
													caption: resources.localizableStrings.HideTitleCaption,
													inputId: "isCaptionHiddenEdit-el",
													classes: {
														labelClass: ["hide-title-label"]
													}
												}
											]
										},
										{
											className: "Terrasoft.Container",
											id: "functionSettings",
											selectors: {
												wrapEl: "#functionSettings"
											},
											classes: {
												wrapClassName: ["hide-title-settings-container"]
											},
											visible: {bindTo: "isAggregatedColumn"},
											items: [
												{
													id: "functionLabel",
													className: "Terrasoft.Label",
													caption: resources.localizableStrings.FunctionCaption,
													width: "100%"
												},
												{
													className: "Terrasoft.Container",
													id: "sumRadioSettings",
													selectors: {
														wrapEl: "#sumRadioSettings"
													},
													classes: {
														wrapClassName: ["sum-radio-settings-container"]
													},
													visible: {bindTo: "sumContainerRadioButton"},
													items: [
														{
															id: "sumRadioButton",
															className: "Terrasoft.RadioButton",
															enabled: true,
															tag: Terrasoft.AggregationType.SUM,
															checked: {bindTo: "functionButtonsGroup"}
														},
														{
															id: "sumFunctionLabel",
															className: "Terrasoft.Label",
															caption: resources.localizableStrings.SumFunctionCaption,
															width: "auto",
															classes: {
																labelClass: ["function-label"]
															},
															inputId: "sumRadioButton-el"
														}
													]
												},
												{
													className: "Terrasoft.Container",
													id: "maxRadioSettings",
													selectors: {
														wrapEl: "#maxRadioSettings"
													},
													classes: {
														wrapClassName: ["max-radio-settings-container"]
													},
													visible: {bindTo: "maxContainerRadioButton"},
													items: [
														{
															id: "maxRadioButton",
															className: "Terrasoft.RadioButton",
															enabled: true,
															tag: Terrasoft.AggregationType.MAX,
															checked: {bindTo: "functionButtonsGroup"}
														},
														{
															id: "maxFunctionLabel",
															className: "Terrasoft.Label",
															caption: resources.localizableStrings.MaxFunctionCaption,
															width: "auto",
															classes: {
																labelClass: ["function-label"]
															},
															inputId: "maxRadioButton-el"
														}
													]
												},
												{
													className: "Terrasoft.Container",
													id: "minRadioSettings",
													selectors: {
														wrapEl: "#minRadioSettings"
													},
													classes: {
														wrapClassName: ["min-radio-settings-container"]
													},
													visible: {bindTo: "minContainerRadioButton"},
													items: [
														{
															id: "minRadioButton",
															className: "Terrasoft.RadioButton",
															enabled: true,
															tag: Terrasoft.AggregationType.MIN,
															checked: {bindTo: "functionButtonsGroup"}
														},
														{
															id: "minFunctionLabel",
															className: "Terrasoft.Label",
															caption: resources.localizableStrings.MinFunctionCaption,
															width: "auto",
															classes: {
																labelClass: ["function-label"]
															},
															inputId: "minRadioButton-el"
														}
													]
												},
												{
													className: "Terrasoft.Container",
													id: "avgRadioSettings",
													selectors: {
														wrapEl: "#avgRadioSettings"
													},
													classes: {
														wrapClassName: ["avg-radio-settings-container"]
													},
													visible: {bindTo: "avgContainerRadioButton"},
													items: [
														{
															id: "avgRadioButton",
															className: "Terrasoft.RadioButton",
															enabled: true,
															tag: Terrasoft.AggregationType.AVG,
															checked: {bindTo: "functionButtonsGroup"}
														},
														{
															id: "avgFunctionLabel",
															className: "Terrasoft.Label",
															caption: resources.localizableStrings.AvgFunctionCaption,
															width: "auto",
															classes: {
																labelClass: ["function-label"]
															},
															inputId: "avgRadioButton-el"
														}
													]
												}
											]
										},
										{
											className: "Terrasoft.ControlGroup",
											caption: resources.localizableStrings.TypeCaption,
											collapsed: true,
											bottomLine: false,
											items: [
												{
													className: "Terrasoft.Label",
													caption: resources.localizableStrings.ColumnTypeCaption,
													classes: {
														labelClass: ["text-size-label"]
													}
												},
												{
													id: "columnTypeEdit",
													className: "Terrasoft.ComboBoxEdit",
													value: {bindTo: "selectedColumnType"},
													list: {bindTo: "columnTypes"},
													prepareList: {bindTo: "getColumnTypes"}
												}
											]
										}
									]
								},
								{
									className: "Terrasoft.Container",
									id: "rightColumnSettingsContainer",
									selectors: {
										wrapEl: "#rightColumnSettingsContainer"
									},
									classes: {
										wrapClassName: ["right-column-settings-container"]
									},
									visible: {bindTo: "isBackward"},
									items: [
										{
											className: "Terrasoft.ControlGroup",
											caption: resources.localizableStrings.FilterCaption,
											collapsed: false,
											bottomLine: false,
											items: [
												{
													className: "Terrasoft.FilterEdit",
													filterManager: {
														bindTo: "filterManager"
													},
													selectedItems: {
														bindTo: "selectedFilters"
													}
												}
											]
										}
									]
								}
							]
						}
					]
				});
				return view;
			},

			/**
			 * Создает экземпляр модели представления модуля настройки свойств колонки.
			 * @return {BaseViewModel|*} Экземпляр модели представления.
			 */
			createViewModel: function createViewModel() {
				var viewModel = this.Ext.create("Terrasoft.BaseViewModel", {
					values: {
						/**
						 * Конфигурация колонок
						 * @private
						 * @type {Object}
						 */
						columnInfo: null,

						/**
						 * Заголовок колонки
						 * @private
						 * @type {String}
						 */
						columnCaption: "",

						/**
						 * Значение колонки
						 * @private
						 * @type {String}
						 */
						titleValue: "",

						/**
						 * Коллекция типов колонки
						 * @private
						 * @type {Terrasoft.Collection}
						 */
						columnTypes: new Terrasoft.Collection(),

						/**
						 * Выбранный тип колонки
						 * @private
						 * @type {Object}
						 */
						selectedColumnType: null,

						/**
						 * Флаг, указывает на агрегирующая ли это колонка
						 * @private
						 * @type {Boolean}
						 */
						isAggregatedColumn: false,

						/**
						 * Тип выбранной группы функции
						 * @private
						 * @type {Object}
						 */
						functionButtonsGroup: Terrasoft.AggregationType.SUM,

						/**
						 * Флаг, который указывает скрывать ли область
						 * с кнопками настройки видимости заголовка колонки
						 * @private
						 * @type {Boolean}
						 */
						isCaptionHidden: false,

						/**
						 * Менеджер фильтров
						 * @private
						 * @type {Object}
						 */
						filterManager: null,

						/**
						 * Флаг, который указывает какого типа реестр
						 * @private
						 * @type {Boolean}
						 */
						isTiled: true,

						/**
						 * Коллекция выбранных фильтров
						 * @private
						 * @type {Object}
						 */
						selectedFilters: null,

						/**
						 * Флаг, который указывает скрывать ли элемент управления sumContainerRadioButton
						 * @private
						 * @type {Boolean}
						 */
						sumContainerRadioButton: false,

						/**
						 *Флаг, который указывает  скрывать ли элемент управления maxContainerRadioButton
						 * @private
						 * @type {Boolean}
						 */
						maxContainerRadioButton: false,

						/**
						 *Флаг, который указывает скрывать ли элемент управления minContainerRadioButton
						 * @private
						 * @type {Boolean}
						 */
						minContainerRadioButton: false,

						/**
						 * Флаг, который указывает скрывать ли элемент управления avgContainerRadioButton
						 * @private
						 * @type {Boolean}
						 */
						avgContainerRadioButton: false,

						/**
						 * Sandbox
						 * @private
						 * @type {Object}
						 */
						sandbox: null,

						/**
						 * Флаг, который указывает доступен ли тип колонки Ссылка
						 * @private
						 * @type {Boolean}
						 */
						useLinkType: true
					},
					methods: {
						/**
						 * Получает sandbox.
						 * @private
						 * @return {Object} sandbox.
						 */
						getSandbox: function() {
							return this.get("sandbox");
						},

						/**
						 * Получает коллекцию типов колонок.
						 * @private
						 */
						getColumnTypes: function() {
							var columnTypes = this.get("columnTypes");
							columnTypes.clear();
							var types = {
								"text": {
									value: Terrasoft.GridCellType.TEXT,
									displayValue: resources.localizableStrings.TextCaption
								},
								"title": {
									value: Terrasoft.GridCellType.TITLE,
									displayValue: resources.localizableStrings.CaptionCaption
								}
							};
							var referenceSchemaName = this.get("referenceSchemaName");
							var schemaConfig = Terrasoft.configuration.ModuleStructure[referenceSchemaName];
							if (this.get("useLinkType") && schemaConfig) {
								types.link = {
									value: Terrasoft.GridCellType.LINK,
									displayValue: resources.localizableStrings.LinkCaption
								};
							}
							columnTypes.loadAll(types);
						},

						/**
						 * Обрабатывает нажатие на кнопку "Сохранить".
						 * @private
						 */
						saveButtonClick: function() {
							var filterManager = this.get("filterManager");
							var columnInfo = this.get("columnInfo");
							var response = {
								aggregationType: (columnInfo.isBackward || columnInfo.aggregationFunction) ?
									this.get("functionButtonsGroup") : "",
								column: columnInfo.column,
								dataValueType: columnInfo.dataValueType,
								isBackward: columnInfo.isBackward,
								isCaptionHidden: this.get("isCaptionHidden"),
								isTiled: columnInfo.isTiled,
								metaCaptionPath: this.get("columnCaption"),
								referenceSchemaName: columnInfo.referenceSchemaName,
								row: columnInfo.row,
								columnType: this.get("selectedColumnType") ?
									this.get("selectedColumnType").value :
									Terrasoft.GridCellType.TEXT,
								serializedFilter: filterManager.serializeFilters(),
								title: this.get("titleValue"),
								width: columnInfo.width,
								hideFilter: columnInfo.hideFilter,
								leftExpressionColumnPath: columnInfo.leftExpressionColumnPath
							};
							var sandbox = this.getSandbox();
							sandbox.publish("ColumnSetuped", response, [sandbox.id]);
							sandbox.publish("BackHistoryState");
						},

						/**
						 * Обрабатывает нажатие на кнопку "Отмена".
						 * @private
						 */
						cancelButtonClick: function() {
							this.getSandbox().publish("BackHistoryState");
						},

						/**
						 * Устанавливает видимость элементов управления RadioButton.
						 * @private
						 */
						showRadioButtons: function() {
							var columnInfo = this.get("columnInfo");
							var dataValueType = columnInfo.dataValueType;
							switch (dataValueType) {
								case Terrasoft.DataValueType.DATE:
								case Terrasoft.DataValueType.DATE_TIME:
								case Terrasoft.DataValueType.TIME:
									this.set("maxContainerRadioButton", true);
									this.set("minContainerRadioButton", true);
									if (!columnInfo.aggregationType) {
										this.set("functionButtonsGroup", Terrasoft.AggregationType.MAX);
									}
									break;
								case Terrasoft.DataValueType.INTEGER:
								case Terrasoft.DataValueType.MONEY:
								case Terrasoft.DataValueType.FLOAT:
									this.set("sumContainerRadioButton", true);
									this.set("avgContainerRadioButton", true);
									this.set("maxContainerRadioButton", true);
									this.set("minContainerRadioButton", true);
									break;
								default:
									break;
							}
						}
					}
				});
				return viewModel;
			},

			/**
			 * Иницализирует начальные значения модуля настройки колонки.
			 * @param {Function} callback Функция обратного вызова.
			 */
			init: function(callback) {
				var state = this.sandbox.publish("GetHistoryState");
				var currentHash = state.hash;
				var currentState = state.state || {};
				if (currentState.moduleId === this.sandbox.id) {
					return;
				}
				this.sandbox.publish("ReplaceHistoryState", {
					stateObj: {
						moduleId: this.sandbox.id
					},
					pageTitle: null,
					hash: currentHash.historyState,
					silent: true
				});
				this.columnInfo = this.sandbox.publish("ColumnSettingsInfo", null, [this.sandbox.id]);
				if (this.columnInfo && this.columnInfo.referenceSchemaName) {
					this.schemaName = this.columnInfo.referenceSchemaName;
				}
				if (callback) {
					callback.call(this);
				}
			},

			/**
			 * Инициализирует заголовок страницы в верхней панели.
			 */
			initHeaderCaption: function() {
				var headerCaption = resources.localizableStrings.PageCaption + this.columnInfo.leftExpressionCaption;
				this.sandbox.publish("InitDataViews", {caption: headerCaption});
			},

			/**
			 * Отображает представление в контейнер renderTo.
			 * @param {Ext.Element} renderTo Ссылка на контейнер, в котором будет отображаться представление.
			 */
			render: function(renderTo) {
				if (!this.isProviderInitialized) {
					this.initializeProvider(renderTo);
					return;
				}
				var container = this.renderContainer = this.entitySchemaProvider.renderTo = renderTo;
				var view = this.createView(container);
				if (!this.isInitialized) {
					this.initHeaderCaption();
					this.viewModel = this.createViewModel();
					this.viewModel.set("sandbox", this.sandbox);
					this.viewModel.set("filterManager", this.filterManager);
					this.viewModel.set("columnCaption", this.columnInfo.metaCaptionPath ?
						this.columnInfo.metaCaptionPath :
						this.columnInfo.leftExpressionCaption);
					this.viewModel.set("titleValue", this.columnInfo.leftExpressionCaption);
					var titleType;
					switch (this.columnInfo.columnType) {
						case "title":
							titleType = {
								value: "title",
								displayValue: resources.localizableStrings.CaptionCaption
							};
							break;
						case "text":
							titleType = {
								value: "text",
								displayValue: resources.localizableStrings.TextCaption
							};
							break;
						case "link":
							titleType = {
								value: "link",
								displayValue: resources.localizableStrings.LinkCaption
							};
							break;
						case "icon":
							titleType = {
								value: "icon",
								displayValue: resources.localizableStrings.IconCaption
							};
							break;
						default:
							titleType = {
								value: "text",
								displayValue: resources.localizableStrings.TextCaption
							};
							break;
					}
					this.viewModel.set("selectedColumnType", titleType);
					this.viewModel.set("isTiled", this.columnInfo.isTiled);
					this.viewModel.set("columnInfo", this.columnInfo);
					this.viewModel.set("isAggregatedColumn", this.columnInfo.isBackward &&
						this.columnInfo.aggregationType !== Terrasoft.AggregationType.COUNT &&
						this.columnInfo.aggregationFunction !== "count");
					this.viewModel.set("isBackward", this.columnInfo.isBackward && !this.columnInfo.hideFilter);
					this.viewModel.set("isCaptionHidden", typeof this.columnInfo.isCaptionHidden !== "undefined" ?
						this.columnInfo.isCaptionHidden :
						false);
					if (this.columnInfo.aggregationType) {
						this.viewModel.set("functionButtonsGroup", this.columnInfo.aggregationType);
					} else if (this.columnInfo.isBackward && this.columnInfo.aggregationFunction === "count") {
						this.viewModel.set("functionButtonsGroup", Terrasoft.AggregationType.COUNT);
					}
					this.viewModel.set("referenceSchemaName", this.columnInfo.referenceSchemaName);
					this.viewModel.set("useLinkType", this.columnInfo.useLinkType);
					this.isInitialized = true;
					this.viewModel.showRadioButtons();
				}
				view.bind(this.viewModel);
			},

			/**
			 * Очищает все подписки на события и уничтожает объект.
			 * @overridden
			 * @param {Object} config Параметры уничтожения модуля.
			 */
			destroy: function destroy(config) {
				if (config.keepAlive) {
					return;
				}
				if (!this.entitySchemaProvider.destroyed) {
					this.entitySchemaProvider.destroy();
				}
				this.entitySchemaProvider = null;
				requirejs.undef("EntitySchemaFilterProviderModule");
			},

			/**
			 * Инициализирует EntitySchemaFilterProvider.
			 * @param {Ext.Element} renderTo Заданый контейнер для отрисовки.
			 */
			initializeProvider: function initializeProvider(renderTo) {
				var filter = Terrasoft.deserialize(this.columnInfo.serializedFilter);
				var map = {};
				map.EntitySchemaFilterProviderModule = {
					sandbox: "sandbox_" + this.sandbox.id,
					"ext-base": "ext_" + this.Ext.id
				};
				requirejs.config({
					map: map
				});
				this.Terrasoft.require(["EntitySchemaFilterProviderModule"],
					function(EntitySchemaFilterProviderModule) {
						this.entitySchemaProvider = new EntitySchemaFilterProviderModule({
							rootSchemaName: this.schemaName
						});
						this.filterManager = this.Ext.create("Terrasoft.FilterManager", {
							provider: this.entitySchemaProvider
						});
						this.filterManager.setFilters(filter || this.Ext.create("Terrasoft.FilterGroup"));
						this.isProviderInitialized = true;
						this.render(renderTo);
					}, this);
			}
		});
		return Terrasoft.ColumnSettings;
	});
