define('ColumnHelper', ['ext-base', 'terrasoft', 'ColumnHelperResources'],
	function(Ext, Terrasoft, resources) {
	var Type = {
		STRING: {
			valueName: 'StringType',
			caption: resources.localizableStrings.StringTypeCaption,
			dataValueType: Terrasoft.DataValueType.TEXT,
			enumName: 'Strings',
			baseDataType: 'ShortText'
		},
		INTEGER: {
			caption: resources.localizableStrings.IntegerTypeCaption,
			dataValueType: Terrasoft.DataValueType.INTEGER,
			enumName: 'Numbers',
			baseDataType: 'Integer'
		},
		FLOAT: {
			valueName: 'FloatType',
			caption: resources.localizableStrings.FloatTypeCaption,
			dataValueType: Terrasoft.DataValueType.FLOAT,
			enumName: 'Numbers',
			baseDataType: 'Float2'

		},
		DATE: {
			valueName: 'DateType',
			caption: resources.localizableStrings.DateTypeCaption,
			dataValueType: Terrasoft.DataValueType.DATE,
			enumName: 'Dates',
			baseDataType: 'Date'

		},
		LOOKUP: {
			caption: resources.localizableStrings.LookupTypeCaption,
			dataValueType: Terrasoft.DataValueType.LOOKUP,
			enumName: 'Dictionaries',
			baseDataType: 'Lookup'
		},
		BOOLEAN: {
			caption: resources.localizableStrings.BooleanTypeCaption,
			dataValueType: Terrasoft.DataValueType.BOOLEAN,
			enumName: 'Others',
			baseDataType: 'Boolean'
		}
	};
	function getTypeByDataValueType(dataValueType) {
		switch (dataValueType) {
			case Terrasoft.DataValueType.TEXT:
				return Type.STRING;
			case Terrasoft.DataValueType.INTEGER:
				return Type.INTEGER;
			case Terrasoft.DataValueType.FLOAT:
			case Terrasoft.DataValueType.MONEY:
				return Type.FLOAT;
			case Terrasoft.DataValueType.DATE:
			case Terrasoft.DataValueType.DATE_TIME:
			case Terrasoft.DataValueType.TIME:
				return Type.DATE;
			case Terrasoft.DataValueType.LOOKUP:
			case Terrasoft.DataValueType.ENUM:
				return Type.LOOKUP;
			case Terrasoft.DataValueType.BOOLEAN:
				return Type.BOOLEAN;
		}
	}

	function applyChange(entitySchemaId, changedColumns, callback, scope) {
		var ajaxProvider = Terrasoft.AjaxProvider;
		var collection = [];
		Terrasoft.each(changedColumns, function(item) {
			collection.push({
				Name: item.name,
				Caption: item.caption,
				TypeGroupName: item.baseDataTypeGroup,
				TypeName:  item.baseDataType,
				IsRequired: item.isRequired,
				IsNewLookup: (item.lookupType === 'New') || false,
				IsEnum: (item.dataValueType === Terrasoft.DataValueType.ENUM),
				IsMultiline: item.isMultiline || false,
				ReferenceSchemaName: item.referenceSchemaName,
				ReferenceSchemaCaption: item.referenceSchemaCaption
			});
		}, this);

		var dataSend = {
			entitySchemaId: entitySchemaId,
			changedColumns: collection
		};
		callServiceMethod.call(scope, ajaxProvider, 'ApplyChanges', function(responce) {
			callback.call(scope, responce.ApplyChangesResult);
		}, dataSend, 20 * 60 * 1000);
	}

	function callServiceMethod(ajaxProvider, methodName, callback, dataSend, timeout) {
		var data = dataSend || {};
		var requestUrl = Terrasoft.workspaceBaseUrl + '/rest/ColumnService/' + methodName;
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
					responseObject = Terrasoft.decode(response.responseText);
				}
				callback.call(this, responseObject);
			},
			scope: this,
			timeout: timeout
		});
		return request;
	}

	return {
		Resources: resources,
		Type: Type,
		ApplyChange: applyChange,
		GetTypeByDataValueType: getTypeByDataValueType

	};
});