/**
 * Расширения модуля шапки приложения для телефонии. Перекрывает методы базового модуля.
 */
define("MainHeaderExtensions", ["ext-base", "terrasoft", "IconHelper", "CtiBaseHelper"],
	function(Ext, Terrasoft, IconHelper, CtiBaseHelper) {

		/**
		 * Возвращает конфигурацию иконки состояния оператора для кнопки профиля.
		 * @private
		 * @return {Object} Конфигурация изображения.
		 */
		function getOperatorStatusProfileIcon() {
			var stateCode = this.get("AgentState");
			return CtiBaseHelper.getOperatorStatusIcon(stateCode, true);
		}

		/**
		 * Возвращает конфигурацию иконки меню состояния оператора.
		 * @private
		 * @param {String} stateCode Код cостояния оператора.
		 * @return {Object} Конфигурация изображения.
		 */
		function getProfileMenuStatusIcon(stateCode) {
			return CtiBaseHelper.getOperatorStatusIcon(stateCode);
		}

		/**
		 * Дополнительно инициализирует модель представления шапки приложения.
		 * @param {Terrasoft.BaseViewModel} viewModel
		 * @overridden
		 */
		function customInitViewModel(viewModel) {
			var sandbox = viewModel.getSandbox();
			var ctiModel = Terrasoft.CtiModel;
			if (ctiModel && ctiModel.get("IsConnected")) {
				this.set("AgentState", ctiModel.get("AgentState"));
			}
			sandbox.subscribe("AgentStateChanged", function(stateCode) {
				viewModel.set("AgentState", stateCode);
			}, viewModel);
			sandbox.subscribe("CtiPanelConnected", viewModel.onCtiPanelConnected, viewModel);
		}

		/**
		 * Обрабатывает соединение с cti панелью.
		 * @private
		 */
		function onCtiPanelConnected() {
			this.executeAgentStateQuery(function(result) {
				var agentStates = this.getAgentStates(result);
				this.generateAgentStateMenuItems(agentStates, this.loadProfileButtonMenu);
			});
		}

		/**
		 * Расширяет свойства модели представления шапки приложения.
		 * @param {Object} values Существующие свойства модели.
		 * @overridden
		 */
		function extendViewModelValues(values) {
			Ext.apply(values, {

				/**
				 * Текущее состояние оператора.
				 * @private
				 * @type {String}
				 */
				AgentState: ""
			});
		}

		/**
		 * Расширяет контейнер изображения фотографии пользователя.
		 * @param {Terrasoft.Container} imageContainer Контейнер изображения фотографии пользователя.
		 * @overridden
		 */
		function extendImageContainer(imageContainer) {
			var operatorStatusIconConfig = IconHelper.createIconButtonConfig({
				name: "operatorStatusIcon",
				imageClass: "operator-status-icon",
				wrapperClass: "operator-status-icon-wrapper",
				hint: {bindTo: "AgentState"}
			});
			operatorStatusIconConfig.imageConfig = {bindTo: "getOperatorStatusProfileIcon"};
			imageContainer.add(operatorStatusIconConfig);
		}

		/**
		 * Выполняет запрос к БД на выборку состояний оператора.
		 * @param {Function} callback Функция обратного вызова.
		 * @private
		 */
		function executeAgentStateQuery(callback) {
			var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: "SysMsgUserState"
			});
			esq.addColumn("Id", "Id");
			esq.addColumn("Name", "Name");
			esq.addColumn("Code", "Code");
			esq.addColumn("IsDisplayOnly", "IsDisplayOnly");
			esq.addColumn("[SysMsgUserStateReason:SysMsgUserState].Code", "StateReasonCode");
			esq.addColumn("[SysMsgUserStateReason:SysMsgUserState].Name", "StateReasonName");
			var currentSysMsgLibId = Terrasoft.SysValue.CTI.sysMsgLibId;
			esq.filters.add("filterSysMsgUserState", Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL, "[SysMsgUserStateInLib:SysMsgUserState].SysMsgLib",
				currentSysMsgLibId));
			esq.getEntityCollection(callback, this);
		}

		/**
		 * Формирует коллекцию состояний оператора из результата запроса выборки к БД.
		 * @param {Object} agentStatesQueryResult Результат запроса к БД на выборку состояний оператора.
		 * @returns {Terrasoft.Collection} Коллекция состояний оператора.
		 * @private
		 */
		function getAgentStates(agentStatesQueryResult) {
			var agentStates = new Terrasoft.Collection();
			agentStatesQueryResult.collection.each(function(item) {
				var valueCode = item.get("Code");
				var agentState = agentStates.find(valueCode);
				if (Ext.isEmpty(agentState)) {
					agentState = {
						value: item.get("Id"),
						displayValue: item.get("Name"),
						code: valueCode,
						isDisplayOnly: item.get("IsDisplayOnly"),
						reasons: null
					};
					agentStates.add(valueCode, agentState);
				}
				var stateReasonCode = item.get("StateReasonCode");
				if (Ext.isEmpty(stateReasonCode)) {
					return;
				}
				var stateReasonName = item.get("StateReasonName");
				agentState.reasons = agentState.reasons || new Terrasoft.Collection();
				agentState.reasons.add(stateReasonCode, {
					code: stateReasonCode,
					displayValue: stateReasonName
				});
			});
			return agentStates;
		}

		/**
		 * Формирует пункты меню состояний оператора в меню кнопки профиля.
		 * @param {Terrasoft.Collection} agentStates Коллекция состояний оператора.
		 * @param {Function} callback Функция обратного вызова.
		 * @private
		 */
		function generateAgentStateMenuItems(agentStates, callback) {
			var profileMenuCollection = this.get("ProfileMenuCollection");
			profileMenuCollection.clear();
			agentStates.each(function(item) {
				if (item.isDisplayOnly) {
					return true;
				}
				var hasReasons = !Ext.isEmpty(item.reasons);
				var menuItem = Ext.create("Terrasoft.BaseViewModel", {
					values: {
						Caption: item.displayValue,
						MarkerValue: item.displayValue,
						Tag: item.code,
						ImageConfig: this.getProfileMenuStatusIcon(item.code),
						Click: hasReasons ? null : {bindTo: "onOperatorStatusChange"},
						Items: hasReasons ? this.getAgentStateReasons(item.code, item.reasons) : null
					}
				});
				profileMenuCollection.addItem(menuItem);
			}, this);
			profileMenuCollection.addItem(Ext.create("Terrasoft.BaseViewModel", {
				values: {
					Type: "Terrasoft.MenuSeparator",
					Caption: ""
				}
			}));
			callback.call(this);
		}

		/**
		 * Формирует коллекцию причин изменения состояния оператора.
		 * @param {String} stateCode Код состояния оператора.
		 * @param {Terrasoft.Collection} reasons Причины изменения состояния.
		 * @return {Terrasoft.BaseViewModelCollection} Коллекция причин изменения состояния.
		 * @private
		 */
		function getAgentStateReasons(stateCode, reasons) {
			var reasonCollection = Ext.create("Terrasoft.BaseViewModelCollection");
			reasons.each(function(reason) {
				reasonCollection.addItem(Ext.create("Terrasoft.BaseViewModel", {
					values: {
						Caption: reason.displayValue,
						Tag: stateCode + "/" + reason.code,
						Click: {bindTo: "onOperatorStatusReasonChange"}
					}
				}));
			});
			return reasonCollection;
		}

		/**
		 * Устанавливает состояние оператора.
		 * @param {Object} tag Конфигурациионный объект.
		 * @private
		 */
		function onOperatorStatusChange(tag) {
			var ctiModel = Terrasoft.CtiModel;
			ctiModel.setAgentState(tag);
		}

		/**
		 * Устанавливает состояние оператора и причину изменения состояния.
		 * @param {Object} tag Конфигурациионный объект.
		 * @private
		 */
		function onOperatorStatusReasonChange(tag) {
			var tagParams = tag.split("/");
			var agentState = tagParams[0];
			var agentStateReasonCode = tagParams[1];
			var ctiModel = Terrasoft.CtiModel;
			ctiModel.setAgentState(agentState, agentStateReasonCode);
		}

		/**
		 * Расширяет методы модели представления шапки приложения.
		 * @param {Object} methods Существующие методы модели.
		 * @overridden
		 */
		function extendViewModelMethods(methods) {
			Ext.apply(methods, {
				getOperatorStatusProfileIcon: getOperatorStatusProfileIcon,
				onCtiPanelConnected: onCtiPanelConnected,
				executeAgentStateQuery: executeAgentStateQuery,
				getAgentStates: getAgentStates,
				getAgentStateReasons: getAgentStateReasons,
				generateAgentStateMenuItems: generateAgentStateMenuItems,
				getProfileMenuStatusIcon: getProfileMenuStatusIcon,
				onOperatorStatusChange: onOperatorStatusChange,
				onOperatorStatusReasonChange: onOperatorStatusReasonChange
			});
		}

		return {
			customInitViewModel: customInitViewModel,
			extendViewModelValues: extendViewModelValues,
			extendViewModelMethods: extendViewModelMethods,
			extendImageContainer: extendImageContainer
		};
	});