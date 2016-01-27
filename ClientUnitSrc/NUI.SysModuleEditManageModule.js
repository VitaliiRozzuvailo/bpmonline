define("SysModuleEditManageModule", ["ext-base", "MaskHelper"], function(Ext, MaskHelper) {
	/**
	 * Открывает карточку добавления записи
	 * @param {Object} config Конфигурация действия
	 * @param {Terrasoft.BaseViewModel} config.item Модель представления записи меню
	 * @param {Object} config.sandbox sandbox
	 */
	function openAddCard(config) {
		MaskHelper.ShowBodyMask();
		var item = config.item;
		var idPrefix = "ViewModule_SectionModuleV2_CardModuleV2_chain";
		var tag = item.get("Tag") || Terrasoft.GUID_EMPTY;
		var typeColumnValue = item.get("TypeColumnValue") || Terrasoft.GUID_EMPTY;
		var idPostfix = Terrasoft.generateGUID();
		var id = Ext.String.format("{0}_{1}_{2}_{3}", idPrefix, tag, typeColumnValue, idPostfix);
		var typeColumn = {
			name: item.get("TypeColumnName"),
			value: typeColumnValue
		};
		var defaultValues = [typeColumn];
		var primaryDisplayColumnName = item.get("PrimaryDisplayColumnName");
		var primaryDisplayColumnValue = item.get("PrimaryDisplayColumnValue");
		if (primaryDisplayColumnName && primaryDisplayColumnValue) {
			var primaryDisplayColumn = {
				name: primaryDisplayColumnName,
				value: primaryDisplayColumnValue
			};
			defaultValues.push(primaryDisplayColumn);
		}
		openCardInChain({
			sandbox: config.sandbox,
			schemaName: item.get("EditPageName"),
			operation: "add",
			moduleId: id,
			defaultValues: defaultValues
		});
	}

	/**
	 * Открывает карточку в цепочке
	 * @param {Object} config конфигурация
	 */
	function openCardInChain(config) {
		var sandbox = config.sandbox;
		var historyState = sandbox.publish("GetHistoryState");
		sandbox.publish("PushHistoryState", {
			hash: historyState.hash.historyState,
			stateObj: {
				isSeparateMode: true,
				schemaName: config.schemaName,
				entitySchemaName: config.entitySchemaName,
				operation: config.operation,
				primaryColumnValue: config.id,
				valuePairs: config.defaultValues,
				isInChain: true
			}
		});
		sandbox.loadModule("CardModuleV2", {
			renderTo: "centerPanel",
			id: config.moduleId,
			keepAlive: true
		});
	}

	// модуль используется по умолчанию для обработки QuickAddMenuItem
	// вместо этого модуля можно указать UId другого в поле ModuleUId сущности QuickAddMenuItem
	// указанный модуль должен иметь публичный метод Run.
	return {
		Run: openAddCard
	};
});