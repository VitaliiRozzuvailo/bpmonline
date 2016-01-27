define("RightSideBarModule", ["RightSideBarModuleResources", "ViewUtilities", "BaseModule"],
	function(resources, ViewUtilities) {

		/**
		 * @class Terrasoft.configuration.RightSideBarModule
		 * Класс RightSideBarModule предназначен для создания экземпляра правой боковой панели
		 */
		var rightSideBarModule = Ext.define("Terrasoft.configuration.RightSideBarModule", {
			extend: "Terrasoft.BaseModule",
			alternateClassName: "Terrasoft.RightSideBarModule",
			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 * Формирует конфигурацию представления.
			 * @protected
			 * @virtual
			 * @return {Object} Возвращает конфигурацию представления.
			 */
			getViewConfig: function() {
				var rightPanelModulesContainer = ViewUtilities.getContainerConfig("rightPanelModulesContainer",
					["right-panel-modules-container"]);
				return {
					id: "rightSideBarContainer",
					selectors: {wrapEl: "#rightSideBarContainer"},
					classes: {wrapClassName: ["right-side-bar-container"]},
					items: [rightPanelModulesContainer]
				};
			},

			/**
			 * Создает объект представления.
			 * @protected
			 * @virtual
			 * @return {Terrasoft.Container} Возвращает экземпляр контейнера представления.
			 */
			getView: function() {
				return this.Ext.create("Terrasoft.Container", this.getViewConfig());
			},

			/**
			 * Создает объект модели представления.
			 * @protected
			 * @param {Terrasoft.configuration.RightSideBarModule} scope Экземпляр класса модуля RightSideBarModule.
			 * @return {Terrasoft.BaseViewModel} Возвращает экземпляр модели представления.
			 */
			getViewModel: function(scope) {
				var viewModel = this.Ext.create("Terrasoft.BaseViewModel", {
					values: {
						/**
						 * Шаблон именования контейнеров отображения модулей.
						 * @private
						 * @type {String}
						 */
						wrapContainerNamePattern: "{0}_WrapContainer"
					},
					methods: {

						/**
						 * Инициалицизует параметры модели.
						 * @private
						 */
						init: function() {
							this.sandbox.subscribe("CommunicationPanelItemSelected",
								this.onCommunicationPanelItemSelected, this);
						},

						/**
						 * Обрабатывает событие выбора элемента меню панели.
						 * @virtual
						 * @param {Object} itemConfig Конфигурация элемента меню панели.
						 * @example
						 * Для каждого модуля создается/активируется собственный контейнер.
						 * Каждый из модулей имеет флаг keepAlive.
						 * В данном случае этот флаг указывает на то, что будет ли выгружен модуль при смене активного
						 * контейнера.
						 *
						 * Пусть загружен SampleAliveModule (keepAlive == true), потом активируем другой модуль
						 * AnotherModule (keepAlive == false). В результате у нас будет скрыт контейнер первого модуля,
						 * но сам модуль будет загружен и реагировать на события, а второй - загрузится и покажеться.
						 * Далее, активируем снова первый модуль. В результате контейнер первого модуля будет отображен,
						 * а контейнер второго - скрыт, но так как второй модуль keepAlive = false, то он будет
						 * выгружен. При последующей активации второго модуля будет производится повторная его загрузка
						 * в существующий для него контейнер.
						 */
						onCommunicationPanelItemSelected: function(itemConfig) {
							var moduleName = itemConfig.moduleName;
							var keepAlive = itemConfig.keepAlive;
							var previousItemConfig = itemConfig.previousItemConfig || {};
							var previousModuleName = previousItemConfig.moduleName;
							var wrapContainerNamePattern = this.get("wrapContainerNamePattern");
							var moduleContainer =
								Ext.getCmp(Ext.String.format(wrapContainerNamePattern, moduleName));
							var previousModuleContainer =
								Ext.getCmp(Ext.String.format(wrapContainerNamePattern, previousModuleName));
							if (!Ext.isEmpty(previousModuleName) && !Ext.isEmpty(previousModuleContainer)) {
								if (!previousItemConfig.keepAlive) {
									this.sandbox.unloadModule(this.sandbox.id + "_" + previousModuleName);
								}
								previousModuleContainer.wrapEl.addCls("hidden");
							}
							var reloadModule = !keepAlive;
							if (!Ext.isEmpty(moduleContainer)) {
								moduleContainer.wrapEl.removeCls("hidden");
							} else {
								moduleContainer = Ext.create("Terrasoft.Container", {
									id: Ext.String.format(wrapContainerNamePattern, moduleName)
								});
								var rightPanelModulesContainer = Ext.getCmp("rightPanelModulesContainer");
								rightPanelModulesContainer.add(moduleContainer);
								moduleContainer.wrapEl.addCls("communication-panel-item-container");
								if (itemConfig.loadHidden === true) {
									moduleContainer.wrapEl.addCls("hidden");
								}
								reloadModule = true;
							}
							if (reloadModule) {
								this.sandbox.loadModule(moduleName, {
									renderTo: Ext.String.format(wrapContainerNamePattern, moduleName)
								});
							}
						}
					}
				});
				viewModel.Ext = this.Ext;
				viewModel.sandbox = this.sandbox;
				viewModel.Terrasoft = this.Terrasoft;
				return viewModel;
			},

			/**
			 * Выполняет прорисовку модуля в контейнер.
			 * @private
			 * @param {Ext.Element} renderTo Указывает ссылку на {@link Ext.Element} в который будет рендериться
			 * элемент управления.
			 */
			render: function(renderTo) {
				var view = this.getView();
				var viewModel = this.getViewModel(this);
				view.bind(viewModel);
				view.render(renderTo);
				viewModel.init();
			}
		});
		return rightSideBarModule;
	});
