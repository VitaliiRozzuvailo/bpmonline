define("DataUtilities", ["ext-base", "terrasoft", "MaskHelper", "ServiceHelper", "DataUtilitiesResources"],
	function(Ext, Terrasoft, MaskHelper, ServiceHelper, resources) {

		/**
		 * Экспортирует результат запроса в csv файл.
		 * @public
		 * @param {String} caption Название результирующего файла.
		 * @param {String} entityName Название схемы объекта, для которой делается запрос.
		 * @param {Terrasoft.EntitySchemaQuery} esq Запрос, который содержит необходимые фильтры и условия.
		 */
		function generateCsvFile(caption, entityName, esq) {
			esq.skipRowCount = 0;
			esq.rowCount = -1;
			var ajaxProvider = Terrasoft.AjaxProvider;
			var data;
			if (Ext.isString(esq)) {
				data = esq;
			} else if (Ext.isFunction(esq.serialize)) {
				data = Ext.JSON.encodeString(esq.serialize());
			} else {
				data = Ext.JSON.encodeString(Terrasoft.encode(esq));
			}
			ajaxProvider.request({
				url: "../rest/ReportService/SendExportFilters",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				method: "POST",
				jsonData: data,
				callback: function(request, success, response) {
					if (success) {
						var filtersContextKey = Terrasoft.decode(response.responseText);
						var csvFile = document.createElement("a");
						csvFile.href = "../rest/ReportService/GetExportFilteredData/" +
								entityName + "/" + filtersContextKey;
						csvFile.download = caption + ".csv";
						document.body.appendChild(csvFile);
						csvFile.click();
						document.body.removeChild(csvFile);
					}
				},
				scope: this
			});
		}

		/**
		 * Экспортирует список обьектов в csv файл.
		 * @public
		 * Вызов возможен с двумя наборами входных параметров.
		 * Первый содержит три аргумента:
		 * @param {String} entityName Название схемы объекта.
		 * @param {Terrasoft.FilterGroup} filters Фильтры для выбираемых значений.
		 * @param {Terrasoft.Collection} viewedColumns Список необходимых колонок обьекта.
		 * Второй набор содержит только один аргумент:
		 * @param {Object} config Конфигурация для формирования запроса. Может содержать следующие свойства:
		 * @param {Terrasoft.EntitySchemaQuery} config.esq Готовый запрос для выгрузки в файл.
		 * @param {String} config.entityName Название схемы объекта.
		 * @param {Terrasoft.FilterGroup} config.filters Фильтры для выбираемых значений.
		 * @param {Terrasoft.Collection} config.viewedColumns Список необходимых колонок обьекта.
		 */
		function exportToCsvFile() {
			var esq = getESQ(arguments);
			var entityName = getEntityName(arguments);
			var data = esq.serialize();
			MaskHelper.ShowBodyMask();
			ServiceHelper.callService("ReportService", "SendExportFilters", function(response) {
				if (!response.responseText) {
					var filtersContextKey = response;
					var csvFile = document.createElement("a");
					csvFile.href = "../rest/ReportService/GetExportFilteredData/" +
							entityName + "/" + filtersContextKey;
					csvFile.download = entityName + ".csv";
					document.body.appendChild(csvFile);
					csvFile.click();
					document.body.removeChild(csvFile);
				} else {
					Terrasoft.utils.showInformation(resources.localizableStrings.ExportToFileErrorMsg);
				}
				MaskHelper.HideBodyMask();
			}, data, this);
		}

		/**
		 * Готовит запрос для экспорта списка обьектов в csv файл.
		 * @private
		 * @param {Object} args Объект, подобный массиву, содержащий входные параметры
		 * для вызова метода exportToCsvFile.
		 * @return {Terrasoft.EntitySchemaQuery}
		 */
		function getESQ(args) {
			var columnIndex = 0;
			var isConfigInArgs = this.Ext.isObject(args[0]);
			var config = isConfigInArgs ? args[0] : null;
			var entityName = isConfigInArgs ? config.entityName : args[0];
			var query = isConfigInArgs ? config.esq : null;
			if (!query) {
				query = this.Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: entityName
				});
				var filters = isConfigInArgs ? config.filters : args[1];
				var viewedColumns = isConfigInArgs ? config.viewedColumns : args[2];
				query.filters.addItem(filters);
				Terrasoft.each(viewedColumns.getItems(), function(item) {
					var columnName = item.path || item;
					var isAggregateColumn = item.aggregationType &&
						(item.aggregationType !== Terrasoft.AggregationType.NONE);
					var columnAlias = Terrasoft.contains(query.columns, columnName)
						? columnName + columnIndex++
						: columnName;
					if (isAggregateColumn) {
						query.addAggregationSchemaColumn(columnName, item.aggregationType, columnAlias);
					} else {
						query.addColumn(columnName, columnAlias);
					}
				}, this);
			}
			return query;
		}

		/**
		 * Возвращает имя экспортируемой схемы.
		 * @private
		 * @param {Object} args Объект, подобный массиву, содержащий входные параметры
		 * для вызова метода exportToCsvFile.
		 * @return {String} Название экспортируемой схемы.
		 */
		function getEntityName(args) {
			var entityName = "";
			if (this.Ext.isObject(args[0])) {
				var config = args[0];
				if (config.hasOwnProperty("esq")) {
					entityName = config.esq.rootSchema.name;
				} else {
					entityName = config.entityName;
				}
			} else {
				entityName = args[0];
			}
			return entityName;
		}

		return {
			generateCsvFile: generateCsvFile,
			exportToCsvFile: exportToCsvFile
		};
	});
