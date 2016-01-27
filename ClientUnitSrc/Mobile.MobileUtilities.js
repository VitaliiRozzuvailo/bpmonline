/* Константы */
Terrasoft.Configuration.FileTypeGUID = {
	File: "529bc2f8-0ee0-df11-971b-001d60e938c6",
	Link: "539bc2f8-0ee0-df11-971b-001d60e938c6",
	KnowledgeBaseLink: "549bc2f8-0ee0-df11-971b-001d60e938c6"
};

/* Модуль фильтрации по отвественному */
/* (пример использования см. в разделе "Активности", фильтр "Только мои активности") */
Ext.define("Ext.Terrasoft.ActivityFilterModule", {

	extend: "Ext.Terrasoft.BaseFilterModule",

	xtype: "tsactivityfiltermodule",
	
	config: {
		/* HACK Нужно только для того, чтобы показать кнопку дополн. фидьтрации в навиг. панели */
		component: {
			xtype: "label"
		}
	},

	_filterName: null,

	initialize: function() {
		this.callParent(arguments);
		this.setName("ActivityOnlyAuthorFilterModule");
		if (!this._filterName) {
			this._filterName = "MyActivities";
		}
	},

	getFilter: function() {
		if (this._filterName === "MyActivities") {
			return Ext.create("Terrasoft.Filter", {
				name: "ActivityOnlyAuthorFilter",
				property: "Participant",
				modelName: "ActivityParticipant",
				assocProperty: "Activity",
				operation: Terrasoft.FilterOperations.Any,
				valueIsMacros: true,
				value: Terrasoft.ValueMacros.CurrentUserContact
			});
		}
		return null;
	}

});

/* Обновление адреса в родительской записи. */
Terrasoft.Configuration.updateParentAddressColumns = function(config, record, parentModelName, parentColumnName) {
	var successFn = config.success;
	var failureFn = config.failure;
	var callbackScope = config.scope;
	var parent = record.get(parentColumnName);
	if (parent) {
		var parentId = parent.getId();
		var sqlText =
			"select a.Id as RecordId " +
			"from " + record.modelName + " a " +
			"where a." + parentColumnName + "Id = '" + parentId + "' " +
			"order by a.CreatedOn asc limit 1";
		Terrasoft.Sql.DBExecutor.executeSql({
			sqls: [sqlText],
			success: function(data) {
				var recordId;
				if (data.length > 0) {
					var records = data[0].rows;
					if (records.length > 0) {
						var sqlData = records.item(0);
						recordId = sqlData.RecordId;
					}
				}
				if (!recordId || recordId === record.getId()) {
					var parentModel = Ext.ModelManager.getModel(parentModelName);
					var queryConfig = Ext.create("Terrasoft.QueryConfig", {
						columns: ["Address", "AddressType", "City", "Country", "Region", "Zip",
							"GPSN", "GPSE"],
						modelName: parentModelName
					});
					parentModel.load(parentId, {
						queryConfig: queryConfig,
						success: function(parentRecord) {
							if (parentRecord) {
								parentRecord.set("Address", record.get("Address"));
								parentRecord.set("AddressType", record.get("AddressType"));
								parentRecord.set("City", record.get("City"));
								parentRecord.set("Country", record.get("Country"));
								parentRecord.set("Region", record.get("Region"));
								parentRecord.set("Zip", record.get("Zip"));
								parentRecord.set("GPSN", null);
								parentRecord.set("GPSE", null);
								parentRecord.save({
									queryConfig: queryConfig,
									success: successFn,
									failure: failureFn,
									scope: callbackScope
								}, this);
							} else {
								Ext.callback(successFn, callbackScope);
							}
						},
						failure: failureFn,
						scope: callbackScope
					});
				} else {
					Ext.callback(successFn, callbackScope);
				}
			},
			failure: failureFn,
			scope: callbackScope
		});
	} else {
		Ext.callback(successFn, callbackScope);
	}
};

Terrasoft.Configuration.getFirstRecordInFileDetail = function(config) {
	var fileDetailModelName = config.fileDetailModelName;
	var parentRecordColumnName = config.parentRecordColumnName;
	var parentRecordId = config.parentRecordId;
	var withEntityLinks = config.withEntityLinks;
	var success = config.success;
	var failure = config.failure;
	var scope = config.scope;
	var store = Ext.create("Terrasoft.store.BaseStore", {
		model: fileDetailModelName
	});
	store.setPageSize(1);
	var fileTypeCodeColumnName = "Type.Code";
	var queryConfig = Ext.create("Terrasoft.QueryConfig", {
		columns: ["Name", "Data", parentRecordColumnName, fileTypeCodeColumnName],
		modelName: fileDetailModelName
	});
	var filtersConfig;
	var parentRecordFilterConfig = {
		property: parentRecordColumnName,
		value: parentRecordId
	};
	if (withEntityLinks) {
		filtersConfig = {
			type: Terrasoft.FilterTypes.Group,
			logicalOperation: Terrasoft.FilterLogicalOperations.And,
			subfilters: [
				parentRecordFilterConfig,
				{
					type: Terrasoft.FilterTypes.Group,
					logicalOperation: Terrasoft.FilterLogicalOperations.Or,
					subfilters: [
						{
							property: fileTypeCodeColumnName,
							value: "File"
						},
						{
							property: fileTypeCodeColumnName,
							value: "EntityLink"
						}
					]
				}
			]
		};
	} else {
		filtersConfig = parentRecordFilterConfig;
	}
	store.loadPage(1, {
		queryConfig: queryConfig,
		filters: Ext.create("Terrasoft.Filter", filtersConfig),
		callback: function(records, operation, isLoadedSuccessfully) {
			if (isLoadedSuccessfully) {
				var fileRecord = records[0];
				Ext.callback(success, scope, [fileRecord]);
			} else {
				Ext.callback(failure, scope, [operation.getError()]);
			}
		},
		scope: this
	});
};

Terrasoft.Configuration.openFirstFileInFileDetail = function(config) {
	var modelName = config.modelName;
	var fileDetailModelName = config.fileDetailModelName;
	var recordId = config.recordId;
	var success = config.success;
	var failure = config.failure;
	var scope = config.scope;
	Terrasoft.Configuration.getFirstRecordInFileDetail({
		fileDetailModelName: fileDetailModelName,
		parentRecordColumnName: modelName,
		parentRecordId: recordId,
		withEntityLinks: true,
		success: function(fileRecord) {
			if (fileRecord) {
				var fileTypeCode = fileRecord.get("Type.Code");
				var fileLink = fileRecord.get("Data");
				if (fileTypeCode === "File") {
					Terrasoft.FileIntent.open({
						path: fileLink,
						success: success,
						failure: failure,
						scope: scope
					});
				} else {
					Terrasoft.Configuration.openFileByEntityLink({
						fileUrl: fileLink,
						modelName: "KnowledgeBase",
						fileDetailModelName: "KnowledgeBaseFile",
						success: success,
						failure: failure,
						scope: scope
					});
				}
			} else {
				Ext.callback(failure, scope, [{
					fileNotFound: true
				}]);
			}
		},
		failure: failure,
		scope: scope
	});
};

Terrasoft.Configuration.openFileByEntityLink = function(config) {
	var fileUrl = config.fileUrl;
	var modelName = config.modelName;
	var fileDetailModelName = config.fileDetailModelName;
	var success = config.success;
	var failure = config.failure;
	var scope = config.scope;
	fileUrl = Terrasoft.util.toRelativeUrl(fileUrl);
	/* HACK CRM-11400 Убрать после исправления в HybridFileTransferManager передачи fullFilePathURL вместо fullFilePath */
	if (Terrasoft.String.startsWith(fileUrl, "/")) {
		fileUrl = fileUrl.substring(1, fileUrl.length);
	}
	Terrasoft.File.readToEnd({
		name: fileUrl,
		success: function(text) {
			var fileInfo;
			try {
				fileInfo = JSON.parse(text);
			} catch (e) {
				var exception = Ext.create("Terrasoft.Exception", {message: e});
				Terrasoft.MessageBox.showException(exception);
				Ext.callback(failure, scope);
				return;
			}
			Terrasoft.Configuration.getFirstRecordInFileDetail({
				fileDetailModelName: fileDetailModelName,
				parentRecordColumnName: modelName,
				parentRecordId: fileInfo.recordId,
				withEntityLinks: false,
				success: function(fileRecord) {
					if (fileRecord) {
						var properFileUrl = fileRecord.get("Data");
						Terrasoft.FileIntent.open({
							path: properFileUrl,
							success: success,
							failure: failure,
							scope: scope
						});
					} else {
						Ext.callback(failure, scope, [{
							fileNotFound: true
						}]);
					}
				},
				failure: failure,
				scope: scope
			});
		},
		failure: function(exception) {
			Terrasoft.MessageBox.showException(exception);
			Ext.callback(failure, scope);
		},
		scope: this
	});
};

Terrasoft.Configuration.focusDetailItemFieldByColumnName = function(columnName, detailItem) {
	var itemsCollection = detailItem.getItems();
	var items = itemsCollection.items;
	var targetField;
	for (var i = 0, ln = items.length; i < ln; i++) {
		var item = items[i];
		if (item.getName() === columnName) {
			targetField = item;
			break;
		}
	}
	if (targetField) {
		if (targetField instanceof Ext.Terrasoft.LookupEdit) {
			var picker = targetField.getPicker();
			var filterPanel = picker.getFilterPanel();
			var searchModule = filterPanel.getModuleByName("LookupSearch");
			var searchComponent = searchModule.getComponent();
			searchComponent.addListener({
				painted: {
					single: true,
					fn: function() {
						if (Ext.os.is.iOS) {
							var me = this;
							setTimeout(function() {
								me.focus(true);
							}, 1000);
						} else {
							this.focus(true);
						}
					}
				}
			});
		}
		targetField.focus();
	}
};