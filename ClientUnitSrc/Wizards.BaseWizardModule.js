define("BaseWizardModule", ["ext-base", "terrasoft", "BaseWizardModuleResources", "BaseViewModule"],
	function(Ext, Terrasoft, resources) {

		var localizableStrings = resources.localizableStrings;
		/**
		 * @class Terrasoft.configuration.ViewModule
		 * Базовый лкласс визуального модуля представления мастера.
		 */
		Ext.define("Terrasoft.configuration.BaseWizardModule", {
			extend: "Terrasoft.BaseViewModule",
			alternateClassName: "Terrasoft.BaseWizardModule",
			isAsync: true,

			/**
			 * Текущий шаг.
			 * @protected
			 * @virtual
			 * @type {String}
			 */
			currentStep: null,

			/**
			 * Признак сохранения мастера.
			 * @protected
			 * @virtual
			 * @type {Boolean}
			 */
			isSavingWizard: false,

			/**
			 * Возвращает конфигурационный объект шапки.
			 * @abstract
			 * @return {Object} Конфигурационный объект шапки.
			 */
			onGetConfig: Terrasoft.abstractFn,

			/**
			 * Обрабатывает нажатие на шаг в панели навигации.
			 * @abstract
			 * @param {String} step Имя шага.
			 */
			onCurrentStepChange: Terrasoft.abstractFn,

			/**
			 * Возвращает сообщения модуля.
			 * @protected
			 * @virtual
			 */
			getMessages: function() {
				return {
					"GetConfig": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.SUBSCRIBE
					},
					"CurrentStepChange": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.SUBSCRIBE
					},
					"SaveWizard": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.SUBSCRIBE
					},
					"CancelWizard": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.SUBSCRIBE
					},
					"UpdateConfig": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.PUBLISH
					}
				};
			},

			/**
			 * Расширяет конфигурацию сообщений модуля, сообщениями описанными в схеме
			 * @protected
			 */
			registerMessages: function() {
				this.sandbox.registerMessages(this.getMessages());
			},

			/**
			 * Разница схемы представления.
			 * @type {Object[]}
			 */
			diff: [{
				"operation": "insert",
				"name": "wizardContainer",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["wizard-container"],
					"id": "wizardContainer",
					"selectors": {"wrapEl": "#wizardContainer"},
					"markerValue": "Wizard",
					"items": []
				}
			}, {
				"operation": "insert",
				"name": "wizardHeader",
				"parentName": "wizardContainer",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.MODULE,
					"moduleName": "WizardHeaderModule",
					"classes": {
						"wrapClassName": ["wizard-header", "fixed"]
					}
				}
			}, {
				"operation": "insert",
				"name": "centerPanelContainer",
				"parentName": "wizardContainer",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["center-panel"],
					"id": "centerPanelContainer",
					"selectors": {"wrapEl": "#centerPanelContainer"},
					"items": []
				}
			}, {
				"operation": "move",
				"name": "centerPanel",
				"parentName": "centerPanelContainer",
				"propertyName": "items",
				"index": 0
			}],

			/**
			 * Инициализирует начальные значения модели.
			 * @protected
			 * @virtual
			 */
			init: function() {
				this.registerMessages();
				this.callParent(arguments);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseViewModule#render
			 * @overridden
			 */
			render: function(renderTo) {
				renderTo.addCls("section-designer-shown");
				this.callParent(arguments);
			},

			/**
			 * Подписывается на сообщения.
			 * @protected
			 * @virtual
			 */
			subscribeMessages: function() {
				this.callParent(arguments);
				var sandbox = this.sandbox;
				var headerId = this.getWizardHeaderId();
				sandbox.subscribe("GetConfig", this.onGetConfig, this, [headerId]);
				sandbox.subscribe("CurrentStepChange", this.onCurrentStepChange, this, [headerId]);
				sandbox.subscribe("SaveWizard", this.onSaveWizard, this, [headerId]);
				sandbox.subscribe("CancelWizard", this.onCancelWizard, this, [headerId]);
			},

			/**
			 * Обрабатывает нажатие на кнопку Сохранить.
			 * @protected
			 * @virtual
			 */
			onSaveWizard: function() {
				this.isSavingWizard = true;
				this.onCurrentStepChange();
			},

			/**
			 * Обрабатывает нажатие на кнопку Отменить.
			 * @protected
			 * @virtual
			 */
			onCancelWizard: function() {
				Terrasoft.utils.showMessage({
					caption: localizableStrings.CancelButtonClickCaption,
					handler: this.onCancellationWindowButtonClick,
					buttons: ["yes", "no"]
				});
			},

			/**
			 * Обрабатывает нажатие на кнопку Отменить, модального окна. Закрывает мастер детали.
			 * @protected
			 * @virtual
			 * @param {String} returnCode Код нажатой кнопки.
			 */
			onCancellationWindowButtonClick: function(returnCode) {
				if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
					window.close();
				}
			},

			/**
			 * Возвращает идентификатор модуля верхней панели.
			 * @protected
			 * @virtual
			 * @return {String} Идентификатор модуля верхней панели.
			 */
			getWizardHeaderId: function() {
				return "ViewModule_WizardHeaderModule";
			},

			/**
			 * Показывает окно ошибки мастера.
			 * @protected
			 * @overridden
			 * @param {String} message Сообщение об ошибке.
			 */
			showWizardError: function(message) {
				Terrasoft.utils.showMessage({
					caption: message,
					handler: function() {
						window.close();
					},
					buttons: ["ok"],
					defaultButton: 0
				});
			},

			/**
			 * Деструктор класса.
			 * @protected
			 * @virtual
			 */
			destroy: function() {
				var messages = this.getMessages();
				if (messages) {
					var messageKeys = Terrasoft.keys(messages);
					this.sandbox.unRegisterMessages(messageKeys);
				}
				this.callParent(arguments);
			}
		});

		return Terrasoft.BaseWizardModule;
	});
