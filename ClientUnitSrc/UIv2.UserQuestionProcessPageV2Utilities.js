define("UserQuestionProcessPageV2Utilities", ["terrasoft", "UserQuestionProcessPageV2UtilitiesResources"],
	function(Terrasoft) {
		/**
		 * Возвращает сгенерированное представление элементов управления (Группа переключателей)
		 * @private
		 * @param {Object} Данные исполнения элемента БП
		 * @return {Object}
		 */
		function getRadioGroupCustomDiff(executionData) {
			var customDiff = [];
			customDiff.push({
				"operation": "insert",
				"parentName": "UserQuestionContentBlock",
				"name": "UserQuestionRadioGroup",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.RADIO_GROUP,
					"items": [],
					"value": {
						"bindTo": "radioButtonsGroup"
					},
					"layout": {"column": 0, "row": 0, "colSpan": 12}
				}
			});
			var i = 0;
			var decisionOptions = executionData.decisionOptions;
			Terrasoft.each(decisionOptions, function(decisionOption) {
				customDiff.push({
					"operation": "insert",
					"parentName": "UserQuestionRadioGroup",
					"propertyName": "items",
					"name": "RadioButton" + i,
					"values": {
						"caption": decisionOption.Caption,
						"value": decisionOption.Name,
						"markerValue": decisionOption.Caption
					}
				});
				i++;
			});
			return customDiff;
		}
		/**
		 * Возвращает сгенерированное представление элементов управления (Признак)
		 * @private
		 * @param {Object} Данные исполнения элемента БП
		 * @return {Object}
		 */
		function getCheckBoxesCustomDiff(executionData) {
			var customDiff = [];
			var i = 0;
			var decisionOptions = executionData.decisionOptions;
			Terrasoft.each(decisionOptions, function(decisionOption) {
				customDiff.push({
					"operation": "insert",
					"parentName": "UserQuestionContentBlock",
					"propertyName": "items",
					"name": "UserQuestionCheckBox" + i,
					"values": {
						"bindTo": decisionOption.Name.toString(),
						"caption": decisionOption.Caption,
						"layout": {"column": 0, "row": i, "colSpan": 12}
					}
				});
				i++;
			});
			return customDiff;
		}
		return {
			/**
			 * Возвращает объект сгенерированных значений модели
			 * @public
			 * @param {Object} Данные исполнения элемента БП
			 * @return {Object}
			 */
			getCustomValues: function(executionData) {
				var decisionOptions = executionData.decisionOptions;
				var decisionMode = executionData.decisionMode;
				var customValues = {
					QuestionText: executionData.questionText,
					isDecisionRequired: executionData.isDecisionRequired,
					radioButtonsGroup: null,
					processElementUId: executionData.procElUId,
					decisionMode: decisionMode,
					decisionOptions: decisionOptions
				};
				if (decisionMode === 0) {
					Terrasoft.each(decisionOptions, function(decisionOption) {
						if (decisionOption.DefChecked === true) {
							customValues.radioButtonsGroup = decisionOption.Name;
						}
					});
				} else {
					Terrasoft.each(decisionOptions, function(decisionOption) {
						customValues[decisionOption.Name.toString()] = decisionOption.DefChecked === true;
					});
				}
				return customValues;
			},
			/**
			 * Возвращает объект сгенерированных аттрибутов модели
			 * @public
			 * @param {Object} Данные исполнения элемента БП
			 * @return {Object}
			 */
			getCustomAttributes: function(executionData) {
				var decisionOptions = executionData.decisionOptions;
				var decisionMode = executionData.decisionMode;
				var customAttributes = {};
				if (decisionMode !== 0) {
					Terrasoft.each(decisionOptions, function(decisionOption) {
						customAttributes[decisionOption.Name.toString()] = {
							dataValueType: Terrasoft.DataValueType.BOOLEAN
						};
					});
				}
				customAttributes.QuestionText = {
					dataValueType: Terrasoft.DataValueType.TEXT
				};
				return customAttributes;
			},
			/**
			 * Возвращает сгенерированное представление элементов управления страницы
			 * @public
			 * @param {Object} Данные исполнения элемента БП
			 * @return {Object}
			 */
			getCustomDiff: function(executionData) {
				return executionData.decisionMode === 0 ?
					getRadioGroupCustomDiff(executionData) : getCheckBoxesCustomDiff(executionData);
			}
		};
	});