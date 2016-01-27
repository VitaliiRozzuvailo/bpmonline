define("SysSectionPanelSettingsModule", ["SysSectionPanelSettingsModuleResources", "MaskHelper",
		"SecurityUtilities", "BaseModule", "ContextHelpMixin"],
	function(resources, MaskHelper) {
		return Ext.define("Terrasoft.configuration.SysSectionPanelSettingsModule", {
			extend: "Terrasoft.BaseModule",
			alternateClassName: "Terrasoft.SysSectionPanelSettingsModule",
			mixins: {
				SecurityUtilitiesMixin: "Terrasoft.SecurityUtilitiesMixin",

				/**
				 * @class ContextHelpMixin Реализует возможность работы с модулем открытия справки.
				 */
				ContextHelpMixin: "Terrasoft.ContextHelpMixin"
			},

			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 * Префикс-признак настройки по умолчанию.
			 * @protected
			 * @type {String}
			 */
			defaultKeyPrefix: "Default",

			/**
			 * Признак того, что модуль инциализируется асинхронно.
			 * @private
			 * @type {Boolean}
			 */
			isAsync: true,

			/**
			 * Инициализация состояние и загружает значения системных настроек, создает модель представления модуля.
			 * @virtual
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			init: function(callback, scope) {
				this.callParent(arguments);
				this.checkAvailability(function() {
					var localizableStrings = resources.localizableStrings;
					var headerCaption = localizableStrings.HeaderCaption;
					this.sandbox.publish("ChangeHeaderCaption", {
						isMainMenu: false,
						caption: headerCaption,
						dataViews: this.Ext.create("Terrasoft.Collection")
					});
					this.sandbox.subscribe("NeedHeaderCaption", function() {
						this.sandbox.publish("InitDataViews", {
							isMainMenu: false,
							caption: headerCaption,
							dataViews: this.Ext.create("Terrasoft.Collection")
						});
					}, this);
					this.initHistoryState();
					this.initContextHelp();
					this.initSysSettings({
						callback: callback,
						scope: scope
					});
				});
			},

			/**
			 * Задает начальные значения системных настроек до изменений.
			 * @protected
			 * @param {Object} options Опции наполнения настройками {Terrasoft.BaseViewModel}.
			 * @param {Function} options.callback Функция обратного вызова после окончания наполнения системными настройками.
			 * @param {Object} options.scope Область видимости для функции обратного вызова.
			 */
			initSysSettings: function(options) {
				var callback = options.callback;
				var scope = options.scope;
				var settings = {};
				var columns = {
					SectionPanelBackgroundColor: {
						dataValueType: Terrasoft.DataValueType.TEXT,
						isRequired: true
					},
					SectionPanelFontColor: {
						dataValueType: Terrasoft.DataValueType.TEXT,
						isRequired: true
					},
					SectionPanelSelectedBackgroundColor: {
						dataValueType: Terrasoft.DataValueType.TEXT,
						isRequired: true
					},
					SectionPanelSelectedFontColor: {
						dataValueType: Terrasoft.DataValueType.TEXT,
						isRequired: true
					}
				};
				this.settingColumns = columns;
				var settingNames = Terrasoft.keys(columns);
				var getSettings = function(sysSettings) {
					Terrasoft.each(sysSettings, function(value, key) {
						settings[key] = value;
					}, this);
					this.viewModel = this.createViewModel({values: settings, columns: columns});
					this.viewModel.on("change", this.onChange, this);
					callback.call(scope);
				};
				this.Terrasoft.SysSettings.querySysSettings(settingNames, getSettings, this);
			},

			/**
			 * Создает #viewModel.
			 * @protected
			 * @param {Object} options Опции для создания {Terrasoft.BaseViewModel}.
			 * @param {Object} options.columns Колонки для {Terrasoft.BaseViewModel}.
			 * @param {Object} options.values Начальные значения/Значения по умолчанию для {Terrasoft.BaseViewModel}.
			 * @returns {Terrasoft.BaseViewModel}
			 */
			createViewModel: function(options) {
				var Terrasoft = this.Terrasoft;
				var sandbox = this.sandbox;
				var columns = options.columns;
				var self = this;
				columns.hasChanges = {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					isRequired: false
				};
				var values = options.values;
				values.hasChanges = false;
				return this.Ext.create("Terrasoft.BaseViewModel", {
					columns: columns,
					values: values,
					methods: {
						onSave: function() {
							self.saveSettingValues();
						},
						onClose: function() {
							self.discardSettingValues();
						},
						onCancel: function() {
							sandbox.publish("BackHistoryState");
						},
						onRestore: function() {
							MaskHelper.ShowBodyMask();
							var options = {
								callback: self.setValues,
								scope: self
							};
							self.getDefaultSettingValues(options);
						},

						/**
						 * Возвращает инверсное значение параметра.
						 * @protected
						 * @param {Boolean} value Значение.
						 * @return {Boolean} Возвращает инверсное значение value.
						 */
						inverseValue: function(value) {
							return !value;
						}
					}
				});
			},

			/**
			 * Сохраняет новые значения системных настроек.
			 * @protected
			 */
			saveSettingValues: function() {
				MaskHelper.ShowBodyMask();
				var localizableStrings = resources.localizableStrings;
				var viewModel = this.viewModel;
				var newSettingValues = Terrasoft.deepClone(viewModel.model.attributes);
				var saveCallback = function(result) {
					MaskHelper.HideBodyMask();
					if (!result.success) {
						this.showInformationDialog(localizableStrings.ErrorOnSave, Ext.emptyFn);
						return;
					}
					viewModel.values = Terrasoft.deepClone(viewModel.model.attributes);
					viewModel.model.set("hasChanges", false);
					var lessConstants = Terrasoft.Resources.LessConstants;
					lessConstants.SectionPanelBackgroundColor = viewModel.get("SectionPanelBackgroundColor");
					lessConstants.SectionPanelFontColor = viewModel.get("SectionPanelFontColor");
					lessConstants.SectionPanelSelectedBackgroundColor =
						viewModel.get("SectionPanelSelectedBackgroundColor");
					lessConstants.SectionPanelSelectedFontColor = viewModel.get("SectionPanelSelectedFontColor");
					if (window && window.less) {
						if (window.less.env && window.less.env === "production" && window.less.refresh) {
							window.less.refresh(true);
						} else {
							this.reloadPage();
						}
					} else {
						var message = localizableStrings.SaveSuccess;
						this.Terrasoft.utils.showInformation(message, this.reloadPage, this);
					}
				};
				var postData = {
					sysSettingsValues: newSettingValues
				};
				this.Terrasoft.SysSettings.updateSysSettingsValue(postData, saveCallback, this);
			},

			/**
			 * Перзеграужает страницу для применения изменённых настроек.
			 * @protected
			 */
			reloadPage: function() {
				window.location.reload();
			},

			/**
			 * Проверяет наличие изменений в значениях системных настроек.
			 * @protected
			 * @param {Terrasoft.BaseViewModel} viewModel Модель представления.
			 */
			onChange: function(viewModel) {
				var defaultSettingValues = Terrasoft.deepClone(viewModel.values);
				delete defaultSettingValues.hasChanges;
				var newSettingValues = Terrasoft.deepClone(viewModel.model.attributes);
				delete newSettingValues.hasChanges;
				var settingsChanged = Ext.Object.equals(defaultSettingValues, newSettingValues);
				viewModel.set("hasChanges", !(settingsChanged));
			},

			/**
			 * Сбрасывает значения настроек.
			 * @protected
			 */
			discardSettingValues: function() {
				var viewModel = this.viewModel;
				var initValues = Terrasoft.deepClone(viewModel.values);
				viewModel.set(initValues);
			},

			/**
			 * Присваивает новые значения Terrasoft.BaseViewModel.
			 * @protected
			 */
			setValues: function(newValues) {
				var viewModel = this.viewModel;
				viewModel.set(newValues);
				MaskHelper.HideBodyMask();
			},

			/**
			 * Получает значения по умолчания из системных настроек.
			 * @protected
			 * @param {Object} options
			 */
			getDefaultSettingValues: function(options) {
				var callback = options.callback;
				var scope = options.scope;
				var defaultSettings = {};
				var columns = this.settingColumns;
				var settingNames = Terrasoft.keys(columns);
				var updateSettingNames = function(item, index, list) {
					list[index] = this.defaultKeyPrefix + item;
				};
				Terrasoft.each(settingNames, updateSettingNames, this);
				var getSettings = function(sysSettings) {
					Terrasoft.each(sysSettings, function(value, key) {
						var settingKey = key.replace(this.defaultKeyPrefix, "");
						defaultSettings[settingKey] = value;
					}, this);
					callback.call(scope, defaultSettings);
				};
				this.Terrasoft.SysSettings.querySysSettings(settingNames, getSettings, scope);
			},

			/**
			 * Генерирует представление модуля
			 * @returns {Terrasoft.GridLayout} Представление модуля.
			 */
			generateView: function() {
				var localizableStrings = resources.localizableStrings;
				var view = this.Ext.create("Terrasoft.GridLayout", {
					id: "settings-section-panel",
					markerValue: "sys-color-settings",
					items: [{
						item: {
							className: "Terrasoft.Container",
							id: "settings-section-buttons-container",
							items: [{
								className: "Terrasoft.Button",
								id: "settings-section-panel-save",
								markerValue: "save-button",
								caption: localizableStrings.Save,
								style: Terrasoft.controls.ButtonEnums.style.GREEN,
								visible: {bindTo: "hasChanges"},
								click: {bindTo: "onSave"}
							}, {
								className: "Terrasoft.Button",
								id: "settings-section-panel-discard-changes",
								markerValue: "cancel-button",
								caption: localizableStrings.Cancel,
								visible: {bindTo: "hasChanges"},
								click: {bindTo: "onClose"}
							}, {
								className: "Terrasoft.Button",
								id: "settings-section-panel-cancel",
								markerValue: "close-button",
								caption: localizableStrings.Close,
								visible: {
										bindTo: "hasChanges",
										bindConfig: {converter: "inverseValue"}
									},
									click: {bindTo: "onCancel"}
								},
								{
									className: "Terrasoft.Button",
									id: "settings-section-panel-restore-default",
									markerValue: "restore-button",
									caption: localizableStrings.Restore,
									click: {bindTo: "onRestore"}
								}]
							},
							column: 0,
							row: 0,
							colSpan: 24,
							rowSpan: 1
						}, {
							item: {
								className: "Terrasoft.Label",
								id: "settings-section-panel-background-color-label",
								caption: localizableStrings.SectionPanelBackgroundColor,
								classes: {

								}
							},
							column: 0,
							row: 1,
							colSpan: 5,
							rowSpan: 1
						}, {
							item: {
								className: "Terrasoft.ColorButton",
								id: "settings-section-panel-background-color-picker",
								markerValue: "color-button",
								value: {bindTo: "SectionPanelBackgroundColor"}

							},
							column: 5,
							row: 1,
							colSpan: 19,
							rowSpan: 1
						}, {
							item: {
								className: "Terrasoft.Label",
								id: "settings-section-panel-font-color-label",
								caption: localizableStrings.SectionPanelFontColor
							},
							column: 0,
							row: 2,
							colSpan: 5,
							rowSpan: 1
						}, {
							item: {
								className: "Terrasoft.ColorButton",
								id: "settings-section-panel-font-color-picker",
								value: {bindTo: "SectionPanelFontColor"}
							},
							column: 5,
							row: 2,
							colSpan: 19,
							rowSpan: 1
						}, {
							item: {
								className: "Terrasoft.Label",
								id: "settings-section-panel-selected-section-background-color-label",
								caption: localizableStrings.SectionPanelSelectedBackgroundColor
							},
							column: 0,
							row: 3,
							colSpan: 5,
							rowSpan: 1
						}, {
							item: {
								className: "Terrasoft.ColorButton",
								id: "settings-section-panel-selected-section-background-color-picker",
								value: {bindTo: "SectionPanelSelectedBackgroundColor"}
							},
							column: 5,
							row: 3,
							colSpan: 19,
							rowSpan: 1
						}, {
							item: {
								className: "Terrasoft.Label",
								id: "settings-section-panel-selected-section-font-color-label",
								caption: localizableStrings.SectionPanelSelectedFontColor
							},
							column: 0,
							row: 4,
							colSpan: 5,
							rowSpan: 1
						}, {
							item: {
								className: "Terrasoft.ColorButton",
								id: "settings-section-panel-selected-section-font-color-picker",
								value: {bindTo: "SectionPanelSelectedFontColor"}
							},
							column: 5,
							row: 4,
							colSpan: 19,
							rowSpan: 1
						}]
					});
				return view;
			},

			/**
			 * Запускает процесс рендеринга модуля.
			 */
			render: function(renderTo) {
				var view = this.generateView();
				view.bind(this.viewModel);
				view.render(renderTo);
				MaskHelper.HideBodyMask();
			},

			/**
			 * Заменяет последний элемент в цепочке состояний, если его идентификатор модуля отличается от текущего
			 * @protected
			 * @virtual
			 */
			initHistoryState: function() {
				var sandbox = this.sandbox;
				var state = sandbox.publish("GetHistoryState");
				var currentHash = state.hash;
				var currentState = state.state || {};
				if (currentState.moduleId === sandbox.id) {
					return;
				}
				var newState = this.prepareHistorySate(currentState);
				sandbox.publish("ReplaceHistoryState", {
					stateObj: newState,
					pageTitle: null,
					hash: currentHash.historyState,
					silent: true
				});
			},

			/**
			 * Подготавливает новое состояние страницы
			 * @protected
			 * @virtual
			 * @return {Object} Возвращает новое состояние страницы
			 */
			prepareHistorySate: function(currentState) {
				var newState = this.Terrasoft.deepClone(currentState);
				newState.moduleId = this.sandbox.id;
				return newState;
			},

			/**
			 * Возвращает Название операции доступ на которую должен быть у пользователя для использования раздела или
			 * страницы
			 * @protected
			 * @virtual
			 * @return {String|null} Название операции.
			 */
			getSecurityOperationName: function() {
				return "CanManageSectionPanelColorSettings";
			},

			/**
			 * Устанавливает результат проверки возможности выполнения администрируемой операции.
			 * @protected
			 * @virtual
			 * @param {String} operationName Имя администрируемой операции.
			 * @param {Boolean} result Результат проверки возможности выполнения администрируемой операции.
			 */
			setCanExecuteOperationResult: Terrasoft.emptyFn,

			/**
			 * Очищает все подписки на события и уничтожает объект.
			 * @overridden
			 * @param {Object} config Параметры уничтожения модуля
			 */
			destroy: function(config) {
				if (config.keepAlive !== true) {
					if (this.viewModel) {
						this.viewModel.destroy();
						this.viewModel = null;
					}
					this.callParent(arguments);
				}
			}
		});
	});
