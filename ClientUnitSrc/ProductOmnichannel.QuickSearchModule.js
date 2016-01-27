// D9 Team
define("QuickSearchModule", ["QuickSearchModuleResources", "BaseModule"],
	function(resources) {
		/**
		 * @class Terrasoft.configuration.QuickSearchModule
		 * Класс QuickSearchModule предназначен для быстрой фильтрации в окне подбора продуктов
		 */
		Ext.define("Terrasoft.configuration.QuickSearchModule", {
			alternateClassName: "Terrasoft.QuickSearchModule",
			extend: "Terrasoft.BaseModule",

			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 * Настройки для модуля быстрого поиска
			 * @private
			 * @type {Object}
			 */
			config: null,

			/**
			 * Содержит контейнер для отрисовки
			 * @private
			 * @type {Object}
			 */
			container: null,

			/**
			 * Содержит список сообщений модуля
			 * @protected
			 * @type {Object}
			 */
			messages: {

				/**
				 * @message UpdateQuickSearchFilter
				 * Сообщает о изменении фильтра
				 * @param {Object} Информация о новом фильтре
				 */
				"UpdateQuickSearchFilter" : {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message UpdateQuickSearchFilterString
				 * Обновление строки поиска из вне
				 * @param {String} Новая строка поиска
				 * @param {Bool} применять новую строку поиска
				 */
				"UpdateQuickSearchFilterString": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message QuickSearchFilterInfo
				 * Получение конфигурации модуля
				 * @return {Object} Конфигурация для инициализации модуля
				 */
				"QuickSearchFilterInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}
			},

			/**
			 * Модель представления менеджера групп.
			 * @private
			 * @type {Object}
			 */
			viewModel: null,

			/**
			 * Регистрация сообщения модуля.
			 * @private
			 */
			registerMessages: function() {
				if (!!this.messages) {
					this.sandbox.registerMessages(this.messages);
				}
			},

			/**
			 * Генерирует конфигурацию представления модуля
			 * @returns {Object} Возвращает конфигурацию для инициализаций представления.
			 */
			getView: function()
			{
				return {
					className: "Terrasoft.Container",
					id: "quickSearchModule-container",
					selectors: {wrapEl: "#quickSearchModule-container"},
					classes: {
						wrapClassName: ["quickSearchModule-container"]
					},
					items: [
						{
							className: "Terrasoft.Container",
							id: "quickSearchModuleSearchTextEdit-container",
							selectors: {wrapEl: "#quickSearchModuleSearchTextEdit-container"},
							classes: {
								wrapClassName: ["quickSearchModuleSearchTextEdit-container"]
							},
							items: [
								{
									className: "Terrasoft.TextEdit",
									id: "QuickSearchTextEdit",
									selectors: {wrapEl: "#QuickSearchTextEdit"},
									value: {bindTo: "SearchString"},
									placeholder: {bindTo: "SearchStringPlaceHolder"},
									enterkeypressed: {bindTo: "onApplyQuickSearchFilterButtonClick"},
									hasClearIcon: false,
									markerValue: "QuickSearchTextEdit"
								}
							]
						},
						{
							className: "Terrasoft.Container",
							id: "quickSearchModuleButtons-container",
							selectors: {wrapEl: "#quickSearchModuleButtons-container"},
							classes: {
								wrapClassName: ["quickSearchModuleButtons-container"]
							},
							items: [
								{
									className: "Terrasoft.Container",
									id: "quickSearchModuleApplyFilterButton-container",
									selectors: {wrapEl: "#quickSearchModuleApplyFilterButton-container"},
									classes: {
										wrapClassName: ["quickSearchModuleApplyFilterButton-container"]
									},
									items: [
										{
											className: "Terrasoft.Button",
											imageConfig: resources.localizableImages.ApplyButtonImage,
											id: "ApplyQuickSearchFilterButton",
											selectors: {wrapEl: "#ApplyQuickSearchFilterButton"},
											tag: "ApplyQuickSearchFilterButton",
											style: Terrasoft.controls.ButtonEnums.style.BLUE,
											visible: true,
											click: {bindTo: "onApplyQuickSearchFilterButtonClick"}
										}
									]
								},
								{
									className: "Terrasoft.Container",
									id: "quickSearchModuleClearFilterButton-container",
									selectors: {wrapEl: "#quickSearchModuleClearFilterButton-container"},
									classes: {
										wrapClassName: ["quickSearchModuleClearFilterButton-container"]
									},
									items: [
										{
											className: "Terrasoft.Button",
											imageConfig: resources.localizableImages.CancelButtonImage,
											id: "ClearQuickSearchFilterButton",
											selectors: {wrapEl: "#ClearQuickSearchFilterButton"},
											tag: "ClearQuickSearchFilterButton",
											style: Terrasoft.controls.ButtonEnums.style.GREY,
											visible: true,
											click: {bindTo: "onClearQuickSearchFilterButtonClick"}
										}
									]
								}
							]
						}
					]
				};
			},

			/**
			 * Генерирует конфигурацию модели представления модуля.
			 * @returns {Object} Возвращает конфигурацию для инициализаций модели представления.
			 */
			getViewModel: function(sandbox, Terrasoft, Ext, config)
			{
				return {
					values: {

						/**
						 * Значение строки поиска
						 * @type {String}
						 */
						SearchString: "",

						/**
						 * Строка, которая отображается при пустой строке поиска
						 * @type {String}
						 */
						SearchStringPlaceHolder: "",

						/**
						 * Колонки, на основе которых формируется фильтр
						 * @type {Array}
						 */
						FilterColumns: null,

						/**
						 * Параметры инициализации
						 * @private
						 * @type {Array}
						 */
						config: config || null
					},
					methods: {

						/**
						 * Инициализация модели представления.
						 * @param config Начальная конфигурация модели представления.
						 */
						init: function(config) {
							var filterColumns = config.FilterColumns || [
								{
									Column : "Name",
									ComparisonType: Terrasoft.ComparisonType.START_WITH
								}
							];
							this.set("FilterColumns", filterColumns);
							this.set("SearchStringPlaceHolder", config.SearchStringPlaceHolder ||
								resources.localizableStrings.SearchStringPlaceHolder);
							this.set("SearchString", config.InitSearchString || "");
							if (!Ext.isEmpty(config.InitSearchString)) {
								this.createAndPublishFilterGroup();
							}

							this.subscribeForUpdateQuickSearchFilterString();
						},

						/**
						 * Осуществляется подписка на событие UpdateQuickSearchFilterString
						 */
						subscribeForUpdateQuickSearchFilterString: function(){
							sandbox.subscribe("UpdateQuickSearchFilterString", function(args) {
								args = args || {};
								this.set("SearchString", args.newSearchStringValue || "");
								if (args.autoApply) {
									this.createAndPublishFilterGroup();
								}
							}, this);
						},

						/**
						 * Обработчик нажатия на кнопку очистки строки фильтрации
						 * @protected
						 */
						onClearQuickSearchFilterButtonClick: function() {
							this.clearAndApplyFilter();
						},

						/**
						 * Обработчик нажатия на кнопку применения фильтрации
						 * @protected
						 */
						onApplyQuickSearchFilterButtonClick: function() {
							this.createAndPublishFilterGroup();
						},

						/**
						 * создает фильтр на основе введеного значения в строку поиска
						 * @returns {Terrasoft.data.filters.FilterGroup}
						 * @protected
						 * @virtual
						 */
						createFilterGroup: function() {
							var searchString = this.get("SearchString");
							var filterColumns = this.get("FilterColumns");
							var filterGroup = Terrasoft.createFilterGroup();
							if (Ext.isEmpty(searchString) ||
								!filterColumns ||
								filterColumns.length === 0) {
								return filterGroup;
							}
							Terrasoft.each(filterColumns, function(column) {
								filterGroup.addItem(
									Terrasoft.createColumnFilterWithParameter(
										column.ComparisonType, column.Column, searchString)
								);
							}, this);
							filterGroup.logicalOperation = Terrasoft.LogicalOperatorType.OR;
							return filterGroup;
						},

						/**
						 * Получает и публикует событие UpdateQuickSearchFilter с новым фильтром
						 * @protected
						 * @virtual
						 */
						createAndPublishFilterGroup: function() {
							var filterGroup = this.createFilterGroup();
							var filterItem = {
								key: "QuickSearchFilterItem",
								filters: filterGroup,
								filtersValue: this.get("SearchString")
							};
							sandbox.publish("UpdateQuickSearchFilter", filterItem);
						},

						/**
						 * Очистка строки поиска и применение пустого фильтра
						 * @protected
						 */
						clearAndApplyFilter: function() {
							this.set("SearchString", "");
							this.createAndPublishFilterGroup();
						}
					}
				};
			},

			/**
			 * Инициализатор модуля. Регистрирует сообщения и получает начальную конфигурацию.
			 * @param callback Функция обратного вызова.
			 * @param scope Контескт выполнения callback.
			 * @protected
			 * @virtual
			 */
			init: function() {
				this.registerMessages();
				this.config = this.sandbox.publish("QuickSearchFilterInfo") || {};
			},

			/**
			 * Выполняет отрисувку представления в заданый контейнер.
			 * @param renderTo Заданый контейнер для отрисовки.
			 */
			render: function(renderTo) {
				this.container = renderTo;
				this.initializeModule();
			},

			/**
			 * Выполняет инициализацию компонент модуля - представления и модели представления
			 * @protected
			 * @virtual
			 */
			initializeModule: function() {
				var viewConfig = this.getView();
				var view = Ext.create(viewConfig.className || "Terrasoft.Container", viewConfig);
				if (!this.viewModel) {
					var viewModelConfig = this.getViewModel(this.sandbox, this.Terrasoft, this.Ext, this.config);
					this.viewModel = this.Ext.create("Terrasoft.BaseViewModel", viewModelConfig);
					this.viewModel.init(this.config);
				}
				view.bind(this.viewModel);
				view.render(this.container);
			}
		});

		return Terrasoft.QuickSearchModule;
	});