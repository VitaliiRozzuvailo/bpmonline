define("CustomProcessPageV2Utilities", ["ext-base", "terrasoft", "ProcessHelper", "MaskHelper"],
	function(Ext, Terrasoft, ProcessHelper, MaskHelper) {

		/**
		 * Базовый класс для модели представления автогенерируемой и преднастроенной страниц по процессу
		 * Используйте класс в своей странице как mixin, пример преднастроенной страницы PreconfiguredPageV2:
		 * 1.	GetProcessExecData (public; ptp)
		 * 2.  ProcessExecDataChanged (public; ptp)
		 */

		Ext.define("Terrasoft.configuration.mixins.CustomProcessPageV2Utilities", {
			extend: "Terrasoft.BaseObject",
			alternateClassName: "Terrasoft.CustomProcessPageV2Utilities",

			/**
			 * Данные по элементу процесса
			 * формат: {
			 *  procElUId = {Guid},
			 *  name = {string},
			 *  processId = {Guid},
			 *  isProcessExecutedBySignal = {bool},
			 *  processName = {Guid},
			 *  recommendation = {string},
			 *  nextProcElUId = {string},
			 *  urlToken = {string},
			 *  recordId = {Guid},
			 *  entitySchemaName = {String},
			 *  parameters = {Object}
			 *	}
			 **/

			processParameters: [],

			acceptProcessElement: function(code) {
				this.saveProcessParameters();
				this.completeExecution(code);
			},

			cancelProcessElement: function(code) {
				this.completeExecution(code);
			},

			saveProcessParameters: function() {
				var processData = this.get("ProcessData");
				var parameters = this.processParameters = [];
				if (Ext.isEmpty(processData)) {
					return;
				}
				Terrasoft.each(processData.parameters, function(parameterValue, name) {
					var value = Terrasoft.deepClone(this.get(name));
					if (Ext.isDate(value)) {
						value = Terrasoft.encodeDate(value);
					} else if (value) {
						value = ProcessHelper.getServerValueByDataValueType(value, value.dataValueType);
					}
					parameters.push({
						key: name,
						value: (!Ext.isEmpty(value) && !Ext.isEmpty(value.value)) ? value.value : value
					});
				}, this);
			},

			completeExecution: function(code) {
				if (!Ext.isEmpty(code)) {
					this.processParameters.push({
						key: "PressedButtonCode",
						value: code
					});
				}
				var dataSend = {
					procElUId: this.get("ProcessData").procElUId,
					parameters: this.processParameters
				};
				MaskHelper.ShowBodyMask();
				var config = {
					serviceName: "ProcessEngineService",
					methodName: "CompleteExecution",
					data: dataSend
				};
				var currentState = this.sandbox.publish("GetHistoryState");
				var newState = Terrasoft.deepClone(currentState.state || {});
				newState.executionData.showNextPrcEl = true;
				this.sandbox.publish("ReplaceHistoryState", {
					stateObj: newState,
					pageTitle: null,
					hash: currentState.hash.historyState,
					silent: true
				});
				this.callService(config, this.onCompleteExecution, this);
			},

			onCompleteExecution: function(response) {
				MaskHelper.HideBodyMask();
				if (response.CompleteExecutionResult <= 0) {
					Terrasoft.Router.back();
				}
			},

			processElementChanged: function() {
				if (Ext.isEmpty(this.get("ProcessData"))) {
					return;
				}
				ProcessHelper.processElementChanged(
					this.processData.procElUId,
					this.processData.recordId,
					this.sandbox,
					this.processElementChangedCallback,
					this);
			},

			processElementChangedCallback: function() {
				//	Todo: Вывести корректное сообщение при ошибке перехода по процессу
			}

		});
	});
