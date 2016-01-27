define("BaseWidgetViewModelClass", ["ext-base", "terrasoft", "BaseWidgetViewModelClassResources"],
	function(Ext, Terrasoft) {

	/**
	 * Базовый класс модели представления контекста пользователя
	 * Для использования класса необходимо зарегистрировать в модуле такие сообщения:
	 *	1.	GetHistoryState (publish; ptp)
	 *	2.	ReplaceHistoryState (publish; broadcast)
	 *	3.	HistoryStateChanged (subscribe; broadcast)
	 *	4.	GetWidgetParameters (subscribe; ptp)
	 * Если используется получение параметров от модулей (useCustomParameterMethods = true)
	 *	1.	PushWidgetParameters (subscribe; ptp)
	 */
	Ext.define("Terrasoft.model.BaseWidgetViewModel", {
		extend: "Terrasoft.model.BaseViewModel",
		alternateClassName: "Terrasoft.BaseWidgetViewModel",

		sandbox: null,
		Terrasoft: null,
		Ext: null,

		/**
		 * Имя элемента контекстного окружения
		 * @protected
		 * @type {String}
		 */
		code: null,

		/**
		 * Список доступных параметров
		 * @protected
		 * @type {Array}
		 */
		availableParameters: [],

		/**
		 * Флаг, указывающий на то, что модуль может переопределять параметры
		 * @protected
		 * @type {Boolean}
		 */
		useCustomParameterMethods: true,

		/**
		 * Список параметров элемента контекстного окружения
		 * @protected
		 * @type {Array}
		 */
		parameters: null,

		/**
		 * Выполняет инициализацию
		 */
		initialize: function() {
			var sandbox = this.sandbox;
			if (!sandbox) {
				return;
			}
			var scope = this;
			var availableParameters = this.availableParameters;
			Terrasoft.each(["procElUId", "IsVisible"], function(parameterName) {
				if (availableParameters.indexOf(parameterName) < 0) {
					availableParameters.splice(0, 0, parameterName);
				}
			}, this);
			sandbox.subscribe("HistoryStateChanged", function() {
				scope.onHistoryStateChanged.call(scope);
			});
			sandbox.subscribe("GetWidgetParameters", function() {
				return Terrasoft.deepClone(scope.parameters);
			}, [this.code]);
			if (this.useCustomParameterMethods) {
				sandbox.subscribe("PushWidgetParameters", function(parametersToApply) {
					scope.applyParameters.call(scope, parametersToApply);
				}, [this.code]);
			}
			this.initParametersFromHistoryState();
		},

		/**
		 * Обработчик события изменения состояния истории
		 * @private
		 */
		onHistoryStateChanged: function() {
			var historyState = this.sandbox.publish("GetHistoryState");
			this.applyParameters(this.getParametersFromHistoryState(historyState));
		},

		/**
		 * Инициализировать параметры модели, полученные из истории состояния
		 * @private
		 */
		initParametersFromHistoryState: function() {
			var historyState = this.sandbox.publish("GetHistoryState");
			if (this.getIsProcessMode(historyState)) {
				this.parameters = this.getParametersFromHistoryState(historyState);
				this.updateParameters();
			}
		},

		/**
		 * Определяет, в каком режиме используется модель
		 * @protected
		 */
		getIsProcessMode: function(historyState) {
			var hashPath = historyState.hash.historyState;
			return !Ext.isEmpty(hashPath.match("ProcessCardModuleV2/?"));
		},

		/**
		 * Возвращает объект, свойства которого являются параметрами по умолчанию
		 * @protected
		 */
		getDefaultParameters: function() {
			return {
				IsVisible: false
			};
		},

		/**
		 * Применяет параметры, свойства которого являются параметрами по умолчанию
		 * @protected
		 */
		applyParameters: function(parametersToApply) {
			var currentParameters = this.getDefaultParameters();
			Ext.apply(currentParameters, parametersToApply || {});
			var historyState = this.sandbox.publish("GetHistoryState");
			var isProcessMode = this.getIsProcessMode(historyState);
			if (isProcessMode && !currentParameters.procElUId) {
				return;
			}
			this.parameters = currentParameters;
			this.updateParameters();
			this.setParametersToHistoryState(historyState);
			this.updateWidget();
		},

		/**
		 * Устанавливает параметры в состояние истории
		 * @private
		 */
		setParametersToHistoryState: function(historyState) {
			if (!historyState || !historyState.state) {
				return null;
			}
			var executionData = historyState.state.executionData;
			if (!executionData || !executionData.currentProcElUId) {
				return null;
			}
			var currentProcessData = executionData[executionData.currentProcElUId];
			if (!currentProcessData) {
				return null;
			}
			currentProcessData[this.code] = Terrasoft.deepClone(this.parameters);
			if (historyState.hash) {
				this.sandbox.publish("ReplaceHistoryState", {
					stateObj: historyState.state,
					hash: historyState.hash.historyState,
					silent: true
				});
			}
		},

		/**
		 * Обновляет параметры в модели
		 * @private
		 */
		updateParameters: function() {
			var parameters = this.parameters || {};
			Terrasoft.each(this.availableParameters, function(parameterName) {
				this.set(parameterName, parameters[parameterName]);
			}, this);
		},

		updateWidget: function() {
		},

		/**
		 * Получает параметры из состояния истории
		 * @private
		 */
		getParametersFromHistoryState: function(historyState) {
			if (!historyState || !historyState.state) {
				return null;
			}
			var executionData = historyState.state.executionData;
			if (!executionData || !executionData.currentProcElUId) {
				return null;
			}
			var currentProcessData = executionData[executionData.currentProcElUId];
			if (!currentProcessData) {
				return null;
			}
			var currentParameters = currentProcessData[this.code];
			if (currentParameters) {
				currentParameters.procElUId = currentProcessData.procElUId;
			}
			return currentParameters || null;
		}

	});
});
