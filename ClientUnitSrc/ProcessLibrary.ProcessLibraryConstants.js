define("ProcessLibraryConstants", ["ProcessLibraryConstantsResources"], function(resources) {
	var FlowElementTypeDefValue = {
		value: "0f6596ba-4263-488b-a217-b31ab26d8920"
	};
	var FlowElementOwnerDefValue = {
		value: "a29a3ba5-4b0d-de11-9a51-005056c00008"
	};
	var FlowElementOwnerEmpty = {
		value: "d0614cbd-034b-4251-8299-c17cfc52f0b8"
	};
	var EndElementStepValue = {
		value: "caf33ce3-fad1-4581-ab17-f40239d6044b",
		displayValue: resources.localizableStrings.EndElementStepCaption
	};
	var GatewayStepValue = {
		value: "a2cee9f0-5c17-4376-94c6-97766db845d0",
		displayValue: resources.localizableStrings.GatewayStepCaption
	};
	var SequenceFlowType = {
		SequenceFlow: 0,
		ConditionalFlow: 1,
		DefaultFlow: 2
	};
	var FlowElementTypeIcons = {
		"0f6596ba-4263-488b-a217-b31ab26d8920": "TaskIcon",
		"170fa525-3d71-4c51-a0eb-b7e3e7c3010e": "CallIcon",
		"6e44433a-714b-4002-9426-a489af9e9aa6": "EmailIcon"
	};
	var VwProcessLib = {
		Type: {
			QuickModel: "b305651c-446f-4aed-9475-3d6b5dfc3fa5",
			BusinessProcess: "865f58bd-a06f-4046-bd61-3ccd96ecf498"
		},
		BusinessProcessTag: "Business Process"
	};
	return {
		/**
		 * Значение по умолчанию для колонки Тип действия
		 * @type {{value: string} Значение Id "Задачи" из справочника SysProcessUserTask}
		 */
		FlowElementTypeDefValue: FlowElementTypeDefValue,
		/**
		 * Значение по умолчанию для колонки Ответственный
		 * @type {{value: string} Значение Id "Все сотрудники компании" из справочника SysProcessUserTask}
		 */
		FlowElementOwnerDefValue: FlowElementOwnerDefValue,
		/**
		 * Значение используется, когда колонка Ответственный не заполнена
		 * @type {{value: string}}
		 */
		FlowElementOwnerEmpty: FlowElementOwnerEmpty,
		/**
		 * Справочное значение шага завершения процесса
		 */
		EndElementStepValue: EndElementStepValue,
		/**
		 * Справочное значение шага шлюза
		 */
		GatewayStepValue: GatewayStepValue,
		/**
		 * Перечислитель типов потоков
		 */
		SequenceFlowType: SequenceFlowType,
		/**
		 * Список иконок для колонки Тип действия
		 */
		FlowElementTypeIcons: FlowElementTypeIcons,
		/**
		 * Справочные значения раздела Библиотека процессов
		 */
		VwProcessLib: VwProcessLib
	};
});
