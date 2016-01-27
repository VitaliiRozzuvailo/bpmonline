define('LocalizationUtilities', ['terrasoft', 'ext-base', 'LocalizationUtilitiesResources'],
	function(Terrasoft, Ext, resources) {
		function addLocalizableColumn(query, columnName, culture, alias) {
			var lczEntitySchemaName = query.rootSchema.name + 'Lcz';
			var entityColumn = query.rootSchema.columns[columnName];
			var subFilters = Terrasoft.createFilterGroup();
			subFilters.add('ColumnUIdFilter',
				Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
					'ColumnUId', entityColumn.uId));
			subFilters.add('CultureFilter',
				Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
					'SysCulture', culture ? culture.value || culture :
						Terrasoft.Resources.CultureSettings.currentCultureId));
			var queryColumn = Ext.create('Terrasoft.AggregationQueryColumn', {
				columnPath: '[' + lczEntitySchemaName + ':Record].Value',
				subFilters: subFilters
			});
			return query.addColumn(queryColumn, alias || columnName);
		}

		function saveLocalizableValue(entityName, recordId, columnName, localizationValues, callback, scope) {
			var jsonData = {
				entityName: entityName,
				recordId: recordId,
				columnName: columnName
			};
			var serviceName = 'SaveLocalizableValue';
			callService(serviceName, {
				configJSON: Ext.JSON.encode(jsonData),
				valuesJSON: Ext.JSON.encode(localizationValues)
			}, function(responseObject) {
				callback.call(scope, responseObject.SaveLocalizableValueResult);
			}, scope);
		}

		function callService(serviceName, jsonData, callback, scope) {
			var ajaxProvider = Terrasoft.AjaxProvider;
			var data = jsonData || {};
			scope = scope || this;
			var requestUrl = Terrasoft.workspaceBaseUrl + '/rest/LocalizationUtilitiesService/' + serviceName;
			var request = ajaxProvider.request({
				url: requestUrl,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				method: 'POST',
				jsonData: data,
				callback: function(request, success, response) {
					var responseObject = {};
					if (success) {
						responseObject =  Terrasoft.decode(response.responseText);
					}
					callback.call(scope , responseObject);
				},
				scope: scope
			});
			return request;
		}
		return {
			addLocalizableColumn: addLocalizableColumn,
			saveLocalizableValue: saveLocalizableValue
		};
	});