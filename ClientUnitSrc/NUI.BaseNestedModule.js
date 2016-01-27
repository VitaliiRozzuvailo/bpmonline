define("BaseNestedModule", ["terrasoft", "ext-base", "BaseModule"],
	function(Terrasoft, Ext) {

		/**
		 * @class Terrasoft.configuration.BaseNestedModule
		 * Базовый класс визуального вложенного модуля.
		 */
		Ext.define("Terrasoft.configuration.BaseNestedModule", {
			extend: "Terrasoft.BaseModule",
			alternateClassName: "Terrasoft.BaseNestedModule",

			/**
			 * Признак асинхронности модуля.
			 * @type {Boolean}
			 */
			isAsync: true,

			/**
			 * Объект представления модуля.
			 * @type {Terrasoft.Component}
			 */
			view: null,

			/**
			 * Класс модели представления.
			 * @type {String}
			 */
			viewModelClass: null,

			/**
			 * Объект модели представления модуля.
			 * @type {Terrasoft.BaseModel}
			 */
			viewModel: null,

			/**
			 * Объект конфигурации представления модуля.
			 * @type {Object}
			 */
			viewConfig: null,

			/**
			 * Создает представление для вложенного модуля.
			 * @protected
			 * @virtual
			 * @return {Terrasoft.Component} Возвращает созданное представление для вложенного модуля.
			 */
			createView: function() {
				var viewConfig = Terrasoft.deepClone(this.viewConfig);
				var containerClassName = viewConfig.className || "Terrasoft.Container";
				return this.Ext.create(containerClassName, viewConfig);
			},

			/**
			 * Создает модель представления для вложенного модуля.
			 * @protected
			 * @virtual
			 * @return {Terrasoft.BaseModel} Возвращает созданную модель представления для вложенного модуля.
			 */
			createViewModel: function() {
				return this.Ext.create(this.viewModelClass, this.getViewModelConfig());
			},

			/**
			 * Генерирует параметры для сознания модели представления модуля.
			 * @protected
			 * @virtual
			 * @return {Object} Возвращает параметры для сознания модели представления модуля.
			 */
			getViewModelConfig: function() {
				return {
					Ext: this.Ext,
					sandbox: this.sandbox,
					Terrasoft: this.Terrasoft
				};
			},

			/**
			 * Инициализирует объект конфигурации представления модуля.
			 * @protected
			 * @abstract
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			initViewConfig: Terrasoft.abstractFn,

			/**
			 * Инициализирует класс модели представления модуля.
			 * @protected
			 * @abstract
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			initViewModelClass: Terrasoft.abstractFn,

			/**
			 * Инициализирует начальные значения модели.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			init: function(callback, scope) {
				this.callParent(arguments);
				callback = callback || Ext.emptyFn;
				if (this.viewModel) {
					this.viewModel.set("Restored", true);
					callback.call(scope);
					return;
				}
				this.initViewModelClass(function() {
					if (this.destroyed) {
						return;
					}
					this.initViewConfig(function() {
						if (this.destroyed) {
							return;
						}
						var viewModel = this.viewModel = this.createViewModel();
						viewModel.init(function() {
							if (!this.destroyed) {
								callback.call(scope);
							}
						}, this);
					}, this);
				}, this);
			},

			/**
			 * Выполняет отрисовку модуля.
			 * @protected
			 * @virtual
			 * @param {Object} renderTo Указывает ссылку на Ext.Element в который будет рендериться элемент управления.
			 */
			render: function(renderTo) {
				this.callParent(arguments);
				var viewModel = this.viewModel;
				var view = this.view;
				if (!view || view.destroyed) {
					view = this.view = this.createView();
					view.bind(viewModel);
					view.render(renderTo);
				} else {
					view.reRender(0, renderTo);
				}
				viewModel.renderTo = renderTo.id;
				viewModel.onRender();
			},

			/**
			 * Очищает все подписки на события и уничтожает объект.
			 * @overridden
			 * @param {Object} config Параметры уничтожения модуля
			 */
			destroy: function(config) {
				if (config.keepAlive !== true) {
					this.callParent(arguments);
				}
			}
		});
	});
