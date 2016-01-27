define("SpecificationFilterModule", ["SpecificationFilterModuleResources", "BaseSchemaModuleV2"],
	function() {
		/**
		 * @class Terrasoft.configuration.SpecificationFilterModule
		 * Класс SpecificationFilterModule предназначен для создания модуля расширенной фильтрации характеристик
		 */
		Ext.define("Terrasoft.configuration.SpecificationFilterModule", {
			alternateClassName: "Terrasoft.SpecificationFilterModule",
			extend: "Terrasoft.BaseSchemaModule",

			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 * Настройки для модуля расширенной фильтрации характеристик
			 * @private
			 * @type {Object}
			 */
			config: {},

			/**
			 * Содержит контейнер для отрисовки
			 * @private
			 * @type {Object}
			 */
			container: null,

			/**
			 * Модель представления модуля расширенной фильтрации характеристик
			 * @private
			 * @type {Object}
			 */
			viewModel: null,

			/**
			 * Представление модели модуля расширенной фильтрации характеристик
			 * @private
			 * @type {Object}
			 */
			view: null,

			/**
			 * Конфигурация представления модуля расширенной фильтрации характеристик
			 * @private
			 * @type {Object}
			 */
			SpecificationFilterView: null,

			/**
			 * Конфигурация модели представления модуля расширенной фильтрации характеристик
			 * @private
			 * @type {Object}
			 */
			SpecificationFilterViewModel: null,

			/**
			 * Сообщения модуля
			 */
			messages: {
				/**
				 * @message GetExtendCatalogueFilterInfo
				 * Получает конфигурацию модуля
				 * @return {Object} Конфигурация для инициализации модуля
				 */
				"GetExtendCatalogueFilterInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message CloseExtendCatalogueFilter
				 * Сообщает о закрытия модуля расширенной фильтрации атрибутов
				 */
				"CloseExtendCatalogueFilter": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message UpdateExtendCatalogueFilter
				 * Сообщает о изменении фильтра
				 * @param {Object} Информация о новом фильтре
				 */
				"UpdateExtendCatalogueFilter": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}
			},

			/**
			 * Регистрация сообщений
			 * @protected
			 */
			registerMessages: function() {
				this.sandbox.registerMessages(this.messages);
			},

			/**
			 * Инициализирует модуль расширенной фильтрации характеристик
			 * @param {Function} callback
			 * @param {Object} scope
			 */
			init: function(callback, scope) {
				callback = callback || function() {};
				this.registerMessages();
				this.config = this.sandbox.publish("GetExtendCatalogueFilterInfo", null, [this.sandbox.id]);
				if (this.viewModel) {
					this.viewModel.set("Restored", true);
					callback.call(scope);
					return;
				}
				if (!this.config.specificationFilterViewId) {
					this.config.specificationFilterViewId = "SpecificationFilterView";
				}
				if (!this.config.specificationFilterViewModelId) {
					this.config.specificationFilterViewModelId = "SpecificationFilterViewModel";
				}
				if (!this.config.specificationFilterSchemaName) {
					this.config.specificationFilterSchemaName = "Product";
				}
				this.Terrasoft.require([this.config.specificationFilterViewId,
					this.config.specificationFilterViewModelId, this.config.specificationFilterSchemaName],
					function(filterView, filterViewModel, productSchema) {
						this.config.ProductSchema = productSchema;
						this.SpecificationFilterView = filterView;
						this.SpecificationFilterView.sandbox = this.sandbox;
						this.SpecificationFilterViewModel = filterViewModel;
						this.SpecificationFilterViewModel.sandbox = this.sandbox;
						this.SpecificationFilterViewModel.renderTo = this.container;
						if (!this.viewModel) {
							var viewModelConfig = this.SpecificationFilterViewModel.generate(this.sandbox, this.config);
							this.viewModel = this.Ext.create("Terrasoft.BaseViewModel", viewModelConfig);
							this.viewModel.SpecificationFilterView = this.SpecificationFilterView;
							this.viewModel.init(this.config, function() {
								if (!this.destroyed) {
									callback.call(scope);
								}
							}, this);
						}
					}, this);
			},

			/**
			 * Отрисовывает представление модуля расширенной фильтрации характеристик
			 * @param {Object} renderTo
			 */
			render: function(renderTo) {
				this.container = renderTo;
				var viewModel = this.viewModel;
				var view = this.view;
				if (!view || view.destroyed) {
					view = this.view = this.SpecificationFilterView.generate();
					view.bind(viewModel);
					view.render(renderTo);
				} else {
					view.reRender(0, renderTo);
				}
				viewModel.renderTo = renderTo.id;
				if (!viewModel.get("Restored")) {
					viewModel.renderFilterElements();
				}
			},

			/**
			 * Очищает все подписки на события и уничтожает объект.
			 * @overridden
			 * @param {Object} config Параметры уничтожения модуля
			 */
			destroy: function(config) {
				if (config.keepAlive !== true) {
					if (this.viewModel) {
						this.viewModel = null;
					}
					this.callParent(arguments);
				}
			}
		});
		return Terrasoft.SpecificationFilterModule;
	});
