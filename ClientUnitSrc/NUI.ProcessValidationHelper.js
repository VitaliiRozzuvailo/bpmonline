define("ProcessValidationHelper", ["terrasoft", "ServiceHelper"],
	function(Terrasoft, ServiceHelper) {

		/**
		 * Проверяет корректность параметров бизнес-процесса.
		 * @param {Object} data Данные проверки.
		 * @param {String} data.processUId Идентификатор бизнес-процесса.
		 * @param {Object[]} data.checkParameters Массив параметров для проверки.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Boolean} callback.isValid Признак корректности параметров.
		 * @param {Object[]} callback.invalidParameters Массив некорректных параметров.
		 * @example
		 * var data = {
		 * 		processUId = "{a5f68bdc-2144-42c4-8830-9965e224d704}"
		 * 		checkParameters = [
		 * 			{
		 * 				name: "parameter1",
		 * 				dataValueTypeName: "Text"
		 * 			},
		 * 			{
		 * 				name: "parameter2",
		 * 				dataValueTypeName: "Integer"
		 * 			}
		 * 		]
		 * 	}
		 * 	checkProcessParameters(data, function(response) {
		 * 		// If "parameter1" is not valid, then response will be contains next data:
		 * 		// response.isValid == false;
		 * 		// response.invalidParameters == [
		 * 		//	{
		 * 		//		name: "parameter1",
		 * 		//		dataValueTypeName: "Text"
		 * 		//	}
		 * 		//];
		 * //
		 * 	});
		 */
		function checkProcessParameters(data, callback) {
			ServiceHelper.callService("ProcessValidationService", "CheckParameters",
				function(response, success) {
					callback(!success ? {isValid: false} : response.CheckParametersResult);
				}, data);
		}

		return {
			checkProcessParameters: checkProcessParameters
		};
	});