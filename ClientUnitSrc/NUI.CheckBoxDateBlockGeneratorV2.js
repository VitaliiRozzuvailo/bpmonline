define("CheckBoxDateBlockGeneratorV2", ["css!CheckBoxDateBlockGeneratorV2"], function() {
	/**
	 * Генерирует элемент управления
	 * @param {Object} controlConfig Конфигурация элемента управления
	 * @param {String} controlConfig.name Название элемента управления
	 * @param {Object} controlConfig.checkBoxCaption Привязка к заголовоку чекбокса
	 * @param {Object} controlConfig.enabledValue Привязка к атрибуту чекбокса "Отмечен"
	 * @param {String} controlConfig.checkBoxFocus Название события фокуса на чекбоксе
	 * @param {Object} controlConfig.dateTimeValue Привязка к значению поля "Дата/Время"
	 * @param {String} controlConfig.dateFocus Название события фокуса на элементе "Дата"
	 * @param {String} controlConfig.timeFocus Название события фокуса на элементе "Время"
	 * @return {className: string, id: string, classes: {wrapClassName: string[]}, selectors: {wrapEl: string}, items* []}
	 * Возвращает элементы checkbox и datetime в одном контейнере
	 */
	function generateCheckBoxDateBlock(controlConfig) {
				var containerId = controlConfig.name + "CheckBoxDateBlock";
				var dateTimeСontainerId = controlConfig.name + "DateTimeContainer";
				var checkBoxId = controlConfig.name + "CheckBox";
				return {
					className: "Terrasoft.Container",
					id: containerId,
					classes: {wrapClassName: ["dateTimeContainerBlock", "control-width-15"]},
					selectors: {wrapEl: "#" + containerId},
					items: [{
						className: "Terrasoft.Label",
						classes: {labelClass: ["labelElement"]},
						caption: controlConfig.checkBoxCaption,
						inputId: checkBoxId + "-el"
					}, {
						className: "Terrasoft.CheckBoxEdit",
						id: checkBoxId,
						classes: {wrapClassName: ["checkBoxContainer"]},
						checked: controlConfig.enabledValue,
						focus: {bindTo: controlConfig.checkBoxFocus},
						markerValue: controlConfig.name
					}, {
						className: "Terrasoft.Container",
						id: dateTimeСontainerId,
						selectors: {wrapEl: "#" + dateTimeСontainerId},
						classes: {wrapClassName: ["dateTimeContainer"]},
						visible: controlConfig.enabledValue,
						items: [{
							className: "Terrasoft.DateEdit",
							id: controlConfig.name + "DateEdit",
							value: controlConfig.dateTimeValue,
							focus: {bindTo: controlConfig.dateFocus},
							markerValue: controlConfig.name,
							classes: {
								wrapClass: ["datetime-datecontrol"]
							}
						}, {
							className: "Terrasoft.TimeEdit",
							id: controlConfig.name + "TimeEdit",
							value: controlConfig.dateTimeValue,
							focus: {bindTo: controlConfig.timeFocus},
							markerValue: controlConfig.name,
							classes: {
								wrapClass: ["datetime-timecontrol"]
							}
						}]
					}]
				};
			}
	return {
		generateCheckBoxDateBlock: generateCheckBoxDateBlock
	};
});