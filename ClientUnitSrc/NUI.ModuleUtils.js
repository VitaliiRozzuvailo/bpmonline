define("ModuleUtils", ["ext-base", "terrasoft", "ModuleUtilsResources"],
	function(Ext, Terrasoft) {
		var getModuleTag = function(module) {
			var tag = "";
			switch (module) {
				case "Process":
					tag = "ProcessExecute/";
					break;
				default:
					var moduleStructure = getModuleStructureByName(module);
					if (moduleStructure.sectionModule) {
						tag = moduleStructure.sectionModule + "/";
					}
					if (moduleStructure.sectionSchema) {
						tag += moduleStructure.sectionSchema + "/";
					}
					break;
			}
			return tag;
		};

		function getEntityStructureByName(name) {
			var entityStructure = Terrasoft.configuration.EntityStructure || {};
			return entityStructure[name];
		}

		function getModuleStructureByName(name) {
			var moduleStructure = Terrasoft.configuration.ModuleStructure || {};
			return moduleStructure[name];
		}

		return {
			getModuleTag: getModuleTag,

			/**
			 * Возвращает структуру раздела.
			 * @param {String} moduleName Название объекта.
			 * @return {Object} Структура раздела.
			 */
			getModuleStructureByName: getModuleStructureByName,

			/**
			 * Возвращает информации о схеме объекта данных для сущности.
			 * @param {String} entitySchemaName Название схемы объекта.
			 * @return {Object} Информация о схеме объета данных.
			 */
			getEntityStructureByName: getEntityStructureByName
		};
	});